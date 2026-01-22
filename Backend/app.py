import os
import uuid
import logging
from random import randint
from werkzeug.utils import secure_filename

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token
from flask_mail import Mail, Message

from dotenv import load_dotenv
from datetime import timedelta, datetime

from database import Database

load_dotenv()

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
bcrypt = Bcrypt(app)
CORS(app)
jwt = JWTManager(app)

# Конфигурация
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB

app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=7)

app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = False
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_DEBUG'] = False

mail = Mail(app)
email_sender = os.getenv('MAIL_USERNAME')

# Инициализация базы данных
db = Database()

ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")
ADMIN_PASSWORD_HASH = bcrypt.generate_password_hash(os.getenv("ADMIN_PASSWORD")).decode('utf-8')
db.init_admin(ADMIN_EMAIL, ADMIN_PASSWORD_HASH)


def send_notification(code):
    try:
        msg = Message('Код входа', sender=email_sender, recipients=[ADMIN_EMAIL])
        msg.body = f'Здравствуйте, для входа введите данный код: {code}'
        mail.send(msg)
        logger.info(f"Код {code} отправлен на почту")
        return True
    except Exception as err:
        logger.error(f"Ошибка отправки email: {err}")
        return False


@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email', '').lower()
        password = data.get('password')

        if email != ADMIN_EMAIL:
            return jsonify({'message': 'Доступ запрещён', 'isAccess': False}), 403

        # Проверка пароля
        if not bcrypt.check_password_hash(ADMIN_PASSWORD_HASH, password):
            return jsonify({'message': 'Неверный пароль', 'isAccess': False}), 401

        # Генерация и сохранение кода
        code = randint(1000000, 9999999)
        db.set_admin_time_code(code)

        # Отправка кода
        if not send_notification(code):
            return jsonify({'message': 'Ошибка отправки кода', 'isAccess': False}), 500

        # Создание токена
        access_token = create_access_token(identity=ADMIN_EMAIL)
        return jsonify({'access_token': access_token, 'message': 'Код отправлен на почту'}), 200

    except Exception as err:
        logger.error(f"Ошибка входа: {err}")
        return jsonify({'message': 'Внутренняя ошибка сервера', 'isAccess': False}), 500


@app.route('/api/code_2f', methods=['POST'])
def verification():
    try:
        data = request.get_json()
        code = data.get('code')

        # Преобразуем в строку для сравнения
        code_str = str(code)

        if not code_str:
            return jsonify({'message': 'Код не предоставлен', 'isAccess': False}), 400

        # Получаем сохраненный код из базы
        stored_code = db.get_admin_time_code(ADMIN_EMAIL)

        if not stored_code or code_str != str(stored_code):
            return jsonify({'message': 'Неверный код подтверждения', 'isAccess': False}), 401

        # Создаем новый токен доступа
        access_token = create_access_token(identity=ADMIN_EMAIL)
        code = randint(1000000, 9999999)
        db.set_admin_time_code(code)
        return jsonify({'access_token': access_token, 'message': 'Вход выполнен успешно'}), 200

    except Exception as err:
        logger.error(f"Ошибка верификации: {err}")
        return jsonify({'message': 'Внутренняя ошибка сервера', 'isAccess': False}), 500


@app.route('/api/paintings', methods=['GET'])
def get_paintings():
    try:
        is_on_sale = request.args.get('on_sale', 'false').lower() == 'true'

        paintings_data = db.get_paintings(is_on_sale=is_on_sale)

        # Преобразуем данные в список словарей
        paintings_list = []
        for painting_data in paintings_data:
            paintings_list.append({
                'id': painting_data[0],  # id
                'image_path': painting_data[1],  # image_path
                'title': painting_data[2],  # title
                'year': painting_data[3],  # year
                'description': painting_data[4],  # description
                'popup_view': painting_data[5],  # popup_view
                'on_sale': bool(painting_data[6]),  # on_sale
                'base_position': painting_data[7],  # base_position
                'sale_position': painting_data[8],  # sale_position
                'mood': painting_data[9],  # mood
                'season': painting_data[10]  # season
            })

        return jsonify(paintings_list), 200

    except Exception as err:
        logger.error(f"Ошибка получения картин: {err}")
        return jsonify({'error': 'Не удалось загрузить картины'}), 500


@app.route('/api/paintings', methods=['POST'])
def add_painting():
    try:
        if 'image' not in request.files:
            return jsonify({"error": "Файл изображения не найден"}), 400

        file = request.files['image']
        if file.filename == '':
            return jsonify({"error": "Файл не выбран"}), 400

        if file:
            # Сохраняем файл
            filename = f"{uuid.uuid4()}_{secure_filename(file.filename)}"
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)

            # Получаем данные из формы
            title = request.form.get('title', '').strip()
            year = request.form.get('year')
            description = request.form.get('description', '').strip()
            popup_view = request.form.get('popup_view', 1)

            # Проверяем обязательные поля
            if not title:
                os.remove(file_path)  # Удаляем сохраненный файл
                return jsonify({"error": "Название обязательно"}), 400

            if not year or not year.isdigit():
                os.remove(file_path)
                return jsonify({"error": "Год должен быть числом"}), 400

            # Добавляем картину в базу
            db.add_painting(filename, title, int(year), description, int(popup_view))

            # Получаем последнюю добавленную картину для возврата ID
            paintings_data = db.get_paintings()
            if paintings_data:
                last_painting = paintings_data[-1]
                painting_id = last_painting[0]

                return jsonify({
                    'id': painting_id,
                    'image_path': filename,
                    'title': title,
                    'year': int(year),
                    'description': description,
                    'popup_view': int(popup_view),
                    'image_url': f"/uploads/{filename}",
                    'message': 'Картина успешно добавлена'
                }), 201
            else:
                return jsonify({"error": "Не удалось получить ID добавленной картины"}), 500

        return jsonify({"error": "Некорректный файл"}), 400

    except Exception as err:
        logger.error(f"Ошибка добавления картины: {err}")
        return jsonify({"error": "Внутренняя ошибка сервера"}), 500


@app.route('/api/paintings/<int:painting_id>', methods=['DELETE'])
def delete_painting(painting_id):
    try:
        # Получаем информацию о картине для удаления файла
        painting_data = db.get_painting_by_id(painting_id)

        if not painting_data:
            return jsonify({'error': 'Картина не найдена'}), 404

        # Удаляем файл изображения
        try:
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], painting_data[1])  # image_path
            if os.path.exists(file_path):
                os.remove(file_path)
                logger.info(f"Файл {painting_data[1]} удален")
        except OSError as err:
            logger.error(f"Ошибка удаления файла: {err}")

        # Удаляем запись из базы
        success = db.delete_painting(painting_id)

        if success:
            return jsonify({'message': 'Картина успешно удалена', 'id': painting_id}), 200
        else:
            return jsonify({'error': 'Не удалось удалить картину из базы данных'}), 500

    except Exception as err:
        logger.error(f"Ошибка удаления картины: {err}")
        return jsonify({'error': 'Внутренняя ошибка сервера'}), 500


@app.route('/uploads/<filename>')
def uploaded_file(filename):
    try:
        response = send_from_directory(app.config['UPLOAD_FOLDER'], filename)
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response
    except Exception as err:
        logger.error(f"Ошибка отдачи файла {filename}: {err}")
        return jsonify({'error': 'Файл не найден'}), 404


@app.route('/api/paintings/<int:painting_id>', methods=['PATCH', 'PUT'])
def update_painting(painting_id):
    try:
        # Проверяем существование картины
        painting_data = db.get_painting_by_id(painting_id)
        if not painting_data:
            return jsonify({'error': 'Картина не найдена'}), 404

        # Обработка обновления
        if 'multipart/form-data' in request.content_type:
            # Обновление полей из формы
            if 'title' in request.form:
                title = request.form.get('title', '').strip()
                if title:
                    db.update_painting_value(painting_id, 'title', title)

            if 'description' in request.form:
                description = request.form.get('description', '').strip()
                db.update_painting_value(painting_id, 'description', description)

            if 'year' in request.form:
                year = request.form.get('year', '').strip()
                if year and year.isdigit():
                    db.update_painting_value(painting_id, 'year', int(year))

            if 'popup_view' in request.form:
                popup_view = request.form.get('popup_view', '1').strip()
                if popup_view in ('1', '2'):
                    db.update_painting_value(painting_id, 'popup_view', int(popup_view))

            if 'on_sale' in request.form:
                on_sale = request.form.get('on_sale').lower() == 'true'
                db.update_painting_value(painting_id, 'on_sale', on_sale)

            if 'mood' in request.form:
                mood = request.form.get('mood', '').strip()
                db.update_painting_value(painting_id, 'mood', mood)

            if 'season' in request.form:
                season = request.form.get('season', '').strip()
                db.update_painting_value(painting_id, 'season', season)

            # Обновление изображения
            if 'image' in request.files:
                file = request.files['image']
                if file.filename != '':
                    # Удаляем старое изображение
                    try:
                        old_file_path = os.path.join(app.config['UPLOAD_FOLDER'], painting_data[1])
                        if os.path.exists(old_file_path):
                            os.remove(old_file_path)
                            logger.info(f"Старый файл {painting_data[1]} удален")
                    except OSError as err:
                        logger.error(f"Ошибка удаления старого файла: {err}")

                    # Сохраняем новое изображение
                    filename = f"{uuid.uuid4()}_{secure_filename(file.filename)}"
                    file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                    db.update_painting_value(painting_id, 'image_path', filename)

        elif request.content_type == 'application/json':
            # Обновление из JSON
            data = request.get_json()

            # Поддерживаемые поля для обновления
            supported_fields = ['title', 'description', 'year', 'popup_view', 'on_sale', 'mood', 'season']

            for field in supported_fields:
                if field in data:
                    value = data[field]
                    if field == 'on_sale' and isinstance(value, bool):
                        db.update_painting_value(painting_id, field, int(value))
                    elif field == 'year' and isinstance(value, int):
                        db.update_painting_value(painting_id, field, value)
                    elif field == 'popup_view' and value in (1, 2):
                        db.update_painting_value(painting_id, field, value)
                    elif isinstance(value, str):
                        db.update_painting_value(painting_id, field, value.strip())

        # Получаем обновленные данные картины
        updated_painting_data = db.get_painting_by_id(painting_id)

        if updated_painting_data:
            response_data = {
                'id': updated_painting_data[0],
                'image_path': updated_painting_data[1],
                'title': updated_painting_data[2],
                'year': updated_painting_data[3],
                'description': updated_painting_data[4],
                'popup_view': updated_painting_data[5],
                'on_sale': bool(updated_painting_data[6]),
                'base_position': updated_painting_data[7],
                'sale_position': updated_painting_data[8],
                'mood': updated_painting_data[9],
                'season': updated_painting_data[10],
                'message': 'Картина успешно обновлена',
                'image_url': f"/uploads/{updated_painting_data[1]}"
            }
            return jsonify(response_data), 200
        else:
            return jsonify({'error': 'Не удалось получить обновленные данные'}), 500

    except Exception as err:
        logger.error(f"Ошибка обновления картины {painting_id}: {err}")
        return jsonify({"error": "Внутренняя ошибка сервера"}), 500


@app.route('/api/update-positions', methods=['POST'])
def update_positions():
    try:
        data = request.get_json()
        cat_type = data.get('type')  # 'base' или 'sale'
        paintings_ids = data.get('paintings_ids', [])
        new_positions = data.get('new_positions', [])

        if cat_type not in ['base', 'sale']:
            return jsonify({'error': 'Тип должен быть "base" или "sale"'}), 400

        if len(paintings_ids) != len(new_positions):
            return jsonify({'error': 'Количество ID и позиций не совпадает'}), 400

        column_name = 'base_position' if cat_type == 'base' else 'sale_position'
        db.update_painting_positions(column_name, paintings_ids, new_positions)

        return jsonify({'message': 'Позиции успешно обновлены'}), 200

    except Exception as err:
        logger.error(f"Ошибка обновления позиций: {err}")
        return jsonify({'error': 'Внутренняя ошибка сервера'}), 500


@app.route('/api/health', methods=['GET'])
def health_check():
    """Проверка работоспособности сервера"""
    try:
        # Проверяем подключение к БД
        paintings_count = len(db.get_paintings())

        return jsonify({
            'status': 'healthy',
            'database': 'connected',
            'paintings_count': paintings_count,
            'upload_folder': os.path.exists(app.config['UPLOAD_FOLDER'])
        }), 200
    except Exception as err:
        logger.error(f"Health check failed: {err}")
        return jsonify({'status': 'unhealthy', 'error': str(err)}), 500


@app.route('/api/resend-code', methods=['POST'])
def resend_code():
    try:
        data = request.get_json()
        email = data.get('email', '').lower()

        if email != ADMIN_EMAIL:
            return jsonify({'message': 'Доступ запрещён', 'isAccess': False}), 403

        # Генерация нового кода
        code = randint(1000000, 9999999)
        db.set_admin_time_code(code)

        # Отправка кода
        if not send_notification(code):
            return jsonify({'message': 'Ошибка отправки кода', 'isAccess': False}), 500

        return jsonify({'message': 'Новый код отправлен на почту'}), 200

    except Exception as err:
        logger.error(f"Ошибка повторной отправки кода: {err}")
        return jsonify({'message': 'Внутренняя ошибка сервера', 'isAccess': False}), 500


@app.route('/api/contact', methods=['POST'])
def send_contact_email():
    try:
        data = request.get_json()

        name = data.get('name', '').strip()
        email = data.get('email', '').strip()
        message = data.get('message', '').strip()

        if not name:
            return jsonify({'message': 'Пожалуйста, введите ваше имя'}), 400

        if not email or '@' not in email:
            return jsonify({'message': 'Пожалуйста, введите корректный email'}), 400

        if not message:
            return jsonify({'message': 'Пожалуйста, введите ваше сообщение'}), 400

        try:
            msg = Message(
                subject=f'Новое сообщение с сайта от {name}',
                sender=app.config['MAIL_DEFAULT_SENDER'],
                recipients=[ADMIN_EMAIL]
            )

            msg.body = f'''
            Имя: {name}
            Email: {email}
            Дата: {datetime.now().strftime("%d.%m.%Y %H:%M")}

            Сообщение:
            {message}
            '''

            # HTML версия
            msg.html = f'''
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #00392a; border-bottom: 2px solid #00392a; padding-bottom: 10px;">
                    Новое сообщение с сайта
                </h2>

                <div style="margin: 20px 0;">
                    <p><strong>Имя:</strong> {name}</p>
                    <p><strong>Email:</strong> <a href="mailto:{email}" style="color: #00392a;">{email}</a></p>
                    <p><strong>Дата:</strong> {datetime.now().strftime("%d.%m.%Y %H:%M")}</p>
                </div>

                <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
                    <h3 style="color: #00392a; margin-top: 0;">Сообщение:</h3>
                    <p style="white-space: pre-line; line-height: 1.6;">{message}</p>
                </div>

                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                    <p style="color: #666; font-size: 14px;">
                        Для ответа нажмите "Ответить" в вашем почтовом клиенте.
                    </p>
                </div>
            </div>
            '''

            mail.send(msg)
            logger.info(f"Контактное сообщение от {name} ({email}) отправлено админу")

            return jsonify({'message': 'Сообщение успешно отправлено'}), 200

        except Exception as mail_err:
            logger.error(f"Ошибка отправки email: {mail_err}")

            return jsonify({'message': 'Сообщение получено'}), 200

    except Exception as err:
        logger.error(f"Ошибка обработки контактной формы: {err}")
        return jsonify({'message': 'Внутренняя ошибка сервера'}), 500


if __name__ == '__main__':
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    required_env_vars = ['SECRET_KEY', 'JWT_SECRET_KEY', 'DB_NAME']
    missing_vars = [var for var in required_env_vars if not os.getenv(var)]

    if missing_vars:
        logger.error(f"Отсутствуют переменные окружения: {', '.join(missing_vars)}")
        exit(1)

    port = 5000
    logger.info(f"Сервер запускается на порту {port}...")
    logger.info(f"Папка для загрузок: {app.config['UPLOAD_FOLDER']}")

    app.run(host="0.0.0.0", port=port)
