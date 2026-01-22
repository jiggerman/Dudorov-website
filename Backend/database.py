import os
import psycopg2
import logging
from dotenv import load_dotenv
from functools import wraps
from typing import Callable, Iterator, Optional
from contextlib import contextmanager


def with_cursor(func: Callable) -> Callable:
    """
    Декоратор для выполнения в контексте курсора
    """

    @wraps(func)
    def wrapper(self, *args, **kwargs):
        with self.cursor() as cursor:
            return func(self, cursor, *args, **kwargs)

    return wrapper
load_dotenv()


class Painting:
    def __init__(self, data: list):
        self.id, self.image_path, self.title, self.year, self.description, self.popup_view, self.on_sale, \
            self.base_position, self.sale_position, self.mood, self.season, self.create_date, self.update_date = data

    def update_value(self, cursor, con, col, new_value):
        try:
            cursor.execute(f"UPDATE paintings SET {col} = %s WHERE id = %s", (new_value, self.id))
            con.commit()
            return True
        except Exception as err:
            logging.error(f"Can't update painting | {err}")
            return False


class Admin:
    def __init__(self, data: tuple):
        self.id, self.email, self.password_hash, self.time_code, self.create_date, self.update_date = data


class Database:
    def __init__(self):
        self._conn: Optional[psycopg2.extensions.connection] = None

    @property
    def conn(self) -> psycopg2.extensions.connection:
        """
        Подключение к базе данных
        :return: psycopg2.extensions.connection
        """
        try:
            if self._conn is None or self._conn.closed:
                self._conn = psycopg2.connect(
                    host=os.getenv('DB_HOST'),
                    database=os.getenv('DB_DBNAME'),
                    user=os.getenv('DB_USER'),
                    password=os.getenv('DB_PASSWORD'),
                )
                print("Connected to PostgreSQL successfully")
                logging.info("Connected to PostgreSQL successfully")

            return self._conn
        except Exception as e:
            print(f"Connection error: {e}")
            logging.error(f"Connection error: {e}")

    def __enter__(self):
        """
        Вход в контекст
        :return: объект класса
        """
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """
        Выход из контекста
        :param exc_type: тип ошибки
        """
        if self._conn and not self._conn.closed:
            if exc_type is None:
                self._conn.commit()
            else:
                self._conn.rollback()
            self._conn.close()

    @contextmanager
    def cursor(self) -> Iterator[psycopg2.extensions.cursor]:
        """
        Контекст для менеджера курсора
        :yield: курсор
        """
        with self.conn.cursor() as cursor:
            try:
                yield cursor
                self._conn.commit()
            except Exception:
                self.conn.rollback()
                raise
            finally:
                cursor.close()

    @with_cursor
    def create_tables(self, cursor):
        try:
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS admin (
                id SERIAL PRIMARY KEY,
                email VARCHAR(256),
                password_hash VARCHAR(256),
                time_code INTEGER,
                create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                update_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            """)

            cursor.execute("""
            CREATE TABLE IF NOT EXISTS paintings (
                id SERIAL PRIMARY KEY,
                image_path VARCHAR(256),
                title VARCHAR(256),
                year INTEGER,
                description TEXT,
                popup_view INTEGER DEFAULT 1 CHECK (popup_view IN (1, 2)),
                on_sale BOOLEAN DEFAULT FALSE,
                base_position INTEGER,
                sale_position INTEGER,
                mood VARCHAR(64),
                season VARCHAR(64),
                create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                update_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            """)

            # Варианты будущих фильтров по сезону
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS seasons (
                id SERIAL PRIMARY KEY,
                season_name VARCHAR(64)
            );
            """)

            # Вариант будущих фильтров по настроению
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS moods (
                id SERIAL PRIMARY KEY,
                mood_name VARCHAR(64)
            );
            """)

            self._conn.commit()
            logging.info("Successful create tables")
        except Exception as err:
            logging.error(f"Error in create tables | {err}")

    @with_cursor
    def init_admin(self, cursor, admin_email, password_hash):
        try:
            cursor.execute("SELECT * FROM admin;")
            data = cursor.fetchone()

            if data is None:
                cursor.execute("INSERT INTO admin (email, password_hash) VALUES (%s, %s)",
                                     (admin_email, password_hash))
                self._conn.commit()
                logging.info("Admin created successfully")
                return

            admin = Admin(data)
            if admin.email != admin_email:
                cursor.execute("UPDATE admin SET email = %s WHERE email = %s", (admin_email, admin.email))
                self._conn.commit()
                logging.info("Admin email updated")

            logging.info("Successful init admin")
        except Exception as err:
            logging.error(f"Error in init_admin | {err}")

    @with_cursor
    def set_admin_time_code(self, cursor, time_code):
        try:
            cursor.execute("UPDATE admin SET time_code = %s", (time_code,))
            self._conn.commit()
            logging.info("Admin time code updated")
        except Exception as err:
            logging.error(f"Can't set admin time code | {err}")

    @with_cursor
    def get_admin_time_code(self, cursor, admin_email):
        try:
            cursor.execute("SELECT time_code FROM admin WHERE email = %s", (admin_email,))
            result = cursor.fetchone()
            return result[0] if result else None
        except Exception as err:
            logging.error(f"Error getting admin time code | {err}")
            return None

    @with_cursor
    def get_paintings(self, cursor, is_on_sale=False):
        try:
            if not is_on_sale:
                cursor.execute("SELECT * FROM paintings ORDER BY base_position;")
                return cursor.fetchall()
            else:
                cursor.execute("SELECT * FROM paintings WHERE on_sale = TRUE ORDER BY sale_position;")
                return cursor.fetchall()
        except Exception as err:
            logging.error(f"Error getting paintings | {err}")
            return []

    @with_cursor
    def add_painting(self, cursor, image_path, title, year, description, popup_view):
        try:
            # Получаем количество картин
            cursor.execute("SELECT COUNT(*) FROM paintings;")
            count_result = cursor.fetchone()
            base_position = count_result[0] + 1 if count_result is not None else 1
            sale_position = count_result[0] + 1 if count_result is not None else 1
            # Получаем количество картин в продаже
            # cursor.execute("SELECT COUNT(*) FROM paintings")
            #sale_count_result = cursor.fetchone()
            #sale_position = sale_count_result[0] + 1 if sale_count_result is not None else 1

            cursor.execute("""INSERT INTO paintings
                                 (image_path, title, year, description, popup_view, base_position, sale_position)
                                 VALUES (%s, %s, %s, %s, %s, %s, %s)
                                 """, (image_path, title, year, description, popup_view, base_position, sale_position))
            self._conn.commit()

            logging.info(f"Successful add new painting {image_path}")
            return cursor.lastrowid
        except Exception as err:
            logging.error(f"Error in add new painting {image_path} | {err}")
            return None

    @with_cursor
    def update_painting_value(self, cursor, painting_id, col, new_value):
        try:
            cursor.execute(f"UPDATE paintings SET {col} = %s WHERE id = %s", (new_value, painting_id))
            self._conn.commit()
            logging.info(f"Painting {painting_id} updated: {col} = {new_value}")
            return True
        except Exception as err:
            logging.error(f"Can't update painting | {err}")
            return False

    @with_cursor
    def update_painting_positions(self, cursor, cat_type: str, paintings_ids: list[int], new_pos: list[int]):
        try:
            valid_columns = ['base_position', 'sale_position']
            if cat_type not in valid_columns:
                logging.error(f"Invalid column name: {cat_type}")
                return False

            for painting_id, pos in zip(paintings_ids, new_pos):
                self.update_painting_value(painting_id, cat_type, pos)
            return True
        except Exception as err:
            logging.error(f"Can't update positions | {err}")
            return False

    @with_cursor
    def get_painting_by_id(self, cursor, painting_id):
        try:
            cursor.execute("SELECT * FROM paintings WHERE id = %s", (painting_id,))
            return cursor.fetchone()
        except Exception as err:
            logging.error(f"Error getting painting {painting_id} | {err}")
            return None

    @with_cursor
    def delete_painting(self, cursor, painting_id):
        try:
            cursor.execute("DELETE FROM paintings WHERE id = %s", (painting_id,))
            self._conn.commit()
            logging.info(f"Painting {painting_id} deleted")
            return True
        except Exception as err:
            logging.error(f"Error deleting painting {painting_id} | {err}")
            return False

    def insert_base_paintings(self):
        paintings_data = [
            {"image_path": "image-188.png", "title": "Маки у пруда", "year": 2022,
             "description": "Холст, масло: Частная коллекция", "popup_view": 2},
            {"image_path": "image-120.png", "title": "Русь Православная", "year": 2017,
             "description": "Холст, масло: размер 70х50 см", "popup_view": 1},
            {"image_path": "image-141.png", "title": "Люди и время", "year": 2014,
             "description": "Холст, масло: размер 40х30 см", "popup_view": 1},
            {"image_path": "image-162.png", "title": "Играя пианиссимо", "year": 2014,
             "description": "Холст, масло: размер 50х70 см", "popup_view": 1},
            {"image_path": "image-106.png", "title": "Ты не один...", "year": 2014,
             "description": "Холст, масло: размер 40х40 см", "popup_view": 1},
            {"image_path": "image-127.png", "title": "Английская набережная. Солнце встает", "year": 2016,
             "description": "Холст, масло: размер 35х40 см", "popup_view": 1},
            {"image_path": "image-148.png", "title": "Розовые цветы", "year": 2022,
             "description": "Холст, масло: размер 75х175 см", "popup_view": 2},
            {"image_path": "image-169.png", "title": "Белые гладиолусы", "year": 2014,
             "description": "Холст, масло: размер 50х70 см", "popup_view": 2},
            {"image_path": "image-113.png", "title": "Березы. Грибная пора", "year": 2025,
             "description": "Холст, масло", "popup_view": 2},
            {"image_path": "image-134.png", "title": "Шиповник", "year": 2022,
             "description": "Холст, масло", "popup_view": 1},
            {"image_path": "image-155.png", "title": "Тишина. Ожидание зимы", "year": 2022,
             "description": "Холст, масло", "popup_view": 1},
            {"image_path": "image-176.png", "title": "Белый шиповник", "year": 2024,
             "description": "Холст, масло", "popup_view": 1}
        ]

        try:
            for painting in paintings_data:
                self.add_painting(painting['image_path'],
                                  painting['title'],
                                  painting['year'],
                                  painting['description'],
                                  painting['popup_view'])
        except Exception as err:
            logging.error(f"Can't insert base paintings | {err}")

