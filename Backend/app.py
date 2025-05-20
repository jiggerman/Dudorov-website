import os
import uuid

from random import randint
from werkzeug.utils import secure_filename

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token
from flask_mail import Mail, Message

from dotenv import load_dotenv
from datetime import timedelta

from models import db, Painting, Admin

load_dotenv()

app = Flask(__name__)
bcrypt = Bcrypt(app)
CORS(app)
jwt = JWTManager(app)
mail = Mail(app)
email_sender = os.getenv('MAIL_USERNAME')

# Конфигурация
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB

app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=7)

app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('SQLALCHEMY_DATABASE_URI')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER')
app.config['MAIL_PORT'] = os.getenv('MAIL_PORT')
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = False
app.config['MAIL_DEBUG'] = False

print(os.getenv('MAIL_SERVER'), os.getenv('MAIL_PORT'), os.getenv('MAIL_USERNAME'), os.getenv('MAIL_PASSWORD'))
def senf_notification(code):
    print('начал')
    msg = Message('Код входа', sender=email_sender, recipients=['liggerman@mail.ru'])
    msg.body = f'Здравствуйте, для входа введите данный код: ,\n\n{code}'
    mail.send(msg)
    print('кончил')


@app.route('/api/login', methods=['POST'])
def login():
    '''try:'''
    data = request.get_json()
    email = data.get('email').lower()
    password = data.get('password')

    # Жёстко заданные credentials единственного администратора
    ADMIN_EMAIL = "liggerman@mail.ru"
    ADMIN_PASSWORD_HASH = bcrypt.generate_password_hash("paintings2025").decode('utf-8')

    if email != ADMIN_EMAIL:
        return jsonify({'message': 'Доступ запрещён', 'isAccess': False}), 403

    if not bcrypt.check_password_hash(ADMIN_PASSWORD_HASH, password):
        return jsonify({'message': 'Неверный пароль', 'isAccess': False}), 401

    code = randint(1000000, 9999999)

        # Обновляем код в базе (если всё равно используете БД)
    admin = Admin.query.filter_by(email=ADMIN_EMAIL).first()
    if admin:
        admin.code_2f = code
        db.session.commit()
    print(1)
    senf_notification(code=code)
    print(2)
    access_token = create_access_token(identity=ADMIN_EMAIL)
    return jsonify(access_token=access_token), 200

    '''except Exception as err:
        print("Ошибка:", err)
        return jsonify({'message': 'Внутренняя ошибка сервера', 'isAccess': False}), 500'''


@app.route('/api/code_2f', methods=['POST'])
def verification():
    try:
        data = request.get_json()
        code = data.get('code')

        admin = Admin.query.all()[0]

        if code != admin.code_2f:
            return jsonify({'isAccess': False}), 200

        access_token = create_access_token(identity=str(admin.id))
        return jsonify(access_token=access_token), 200
    except Exception as err:
        print("Пу пу пу", err)


# Эндпоинты API
@app.route('/api/paintings', methods=['GET'])
def get_paintings():
    paintings = Painting.query.all()
    return jsonify([painting.to_dict() for painting in paintings])


@app.route('/api/paintings', methods=['POST'])
def add_painting():
    if 'image' not in request.files:
        return jsonify({"error": "No image file"}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file:
        filename = f"{uuid.uuid4()}_{secure_filename(file.filename)}"
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))

        painting = Painting(
            image_path=filename,
            title=request.form.get('title'),
            year=request.form.get('year'),
            description=request.form.get('description'),
            popup_view=int(request.form.get('popup_view', 1)))

        db.session.add(painting)
        db.session.commit()

        return jsonify(painting.to_dict()), 201

    return jsonify({"error": "Invalid file"}), 400


@app.route('/api/paintings/<int:id>', methods=['DELETE'])
def delete_painting(id):
    painting = Painting.query.get_or_404(id)

    # Удаляем файл изображения
    try:
        os.remove(os.path.join(app.config['UPLOAD_FOLDER'], painting.image_path))
    except OSError:
        pass

    db.session.delete(painting)
    db.session.commit()
    return jsonify({'message': 'Painting deleted'})


# Для отдачи статических файлов (изображений)
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    response = send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@app.route('/api/paintings/<int:id>', methods=['PATCH', 'PUT'])
def update_painting(id):
    painting = Painting.query.get_or_404(id)

    if request.method in ['PATCH', 'PUT']:
        if request.content_type == 'application/json':
            # Handle JSON data (simple fields)
            data = request.json
            if 'title' in data:
                painting.title = data['title']
            if 'description' in data:
                painting.description = data['description']
            if 'year' in data:
                painting.year = data['year']
            if 'popup_view' in data:
                painting.popup_view = data['popup_view']
        elif 'multipart/form-data' in request.content_type:
            # Handle form data with potential file upload
            if 'title' in request.form:
                painting.title = request.form.get('title')
            if 'description' in request.form:
                painting.description = request.form.get('description')
            if 'year' in request.form:
                painting.year = request.form.get('year')
            if 'popup_view' in request.form:
                painting.popup_view = int(request.form.get('popup_view', 1))

            # Handle image update if provided
            if 'image' in request.files:
                file = request.files['image']
                if file.filename != '':
                    # Delete old image
                    try:
                        os.remove(os.path.join(app.config['UPLOAD_FOLDER'], painting.image_path))
                    except OSError:
                        pass

                    # Save new image
                    filename = f"{uuid.uuid4()}_{secure_filename(file.filename)}"
                    file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                    painting.image_path = filename

        db.session.commit()
        return jsonify(painting.to_dict())

    return jsonify({"error": "Invalid request"}), 400


if __name__ == '__main__':
    db.init_app(app)

    with app.app_context():
        db.create_all()

    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    app.run(debug=True)
