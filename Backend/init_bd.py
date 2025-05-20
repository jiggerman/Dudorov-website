import os
from app import app, bcrypt, db, Painting, Admin

def init_database():
    with app.app_context():
        # Удаляем существующую БД и создаем новую
        db.drop_all()
        db.create_all()

        # Создаем папку для загрузок, если её нет
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

        # Ваши картины (без реальных изображений, только пути)
        paintings_data = [
            {"image_path": "image-188.png", "title": "Маки у пруда", "year": "2022",
             "description": "Холст, масло: Частная коллекция", "popup_view": 2},
            {"image_path": "image-120.png", "title": "Русь Православная", "year": "2017",
             "description": "Холст, масло: размер 70х50 см", "popup_view": 1},
            {"image_path": "image-141.png", "title": "Люди и время", "year": "2014",
             "description": "Холст, масло: размер 40х30 см", "popup_view": 1},
            {"image_path": "image-162.png", "title": "Играя пианиссимо", "year": "2014",
             "description": "Холст, масло: размер 50х70 см", "popup_view": 1},
            {"image_path": "image-106.png", "title": "Ты не один...", "year": "2014",
             "description": "Холст, масло: размер 40х40 см", "popup_view": 1},
            {"image_path": "image-127.png", "title": "Английская набережная. Солнце встает", "year": "2016",
             "description": "Холст, масло: размер 35х40 см", "popup_view": 1},
            {"image_path": "image-148.png", "title": "Розовые цветы", "year": "2022",
             "description": "Холст, масло: размер 75х175 см", "popup_view": 2},
            {"image_path": "image-169.png", "title": "Белые гладиолусы", "year": "2014",
             "description": "Холст, масло: размер 50х70 см", "popup_view": 2},
            {"image_path": "image-113.png", "title": "Березы. Грибная пора", "year": "2025",
             "description": "Холст, масло", "popup_view": 2},
            {"image_path": "image-134.png", "title": "Шиповник", "year": "2022",
             "description": "Холст, масло", "popup_view": 1},
            {"image_path": "image-155.png", "title": "Тишина. Ожидание зимы", "year": "2022",
             "description": "Холст, масло", "popup_view": 1},
            {"image_path": "image-176.png", "title": "Белый шиповник", "year": "2024",
             "description": "Холст, масло", "popup_view": 1}
        ]

        # Добавляем картины в БД
        for data in paintings_data:
            painting = Painting(**data)
            db.session.add(painting)

        password = 'paintings2025'
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

        # Создание админа
        admin = Admin(email='liggerman@mail.ru', password=hashed_password)
        db.session.add(admin)

        db.session.commit()
        print("База данных успешно создана и заполнена!")

if __name__ == '__main__':
    init_database()