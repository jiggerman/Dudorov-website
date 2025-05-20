from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Painting(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    image_path = db.Column(db.String(255), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    year = db.Column(db.String(10), nullable=False)
    description = db.Column(db.Text, nullable=False)
    popup_view = db.Column(db.Integer, default=1)

    def to_dict(self):
        return {
            "id": self.id,
            "image_url": f"/uploads/{self.image_path}",
            "title": self.title,
            "year": self.year,
            "description": self.description,
            "popup_view": self.popup_view
        }


class Admin(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), nullable=False)
    password = db.Column(db.String(100), nullable=False)
    code_2f = db.Column(db.Integer, nullable=False)
