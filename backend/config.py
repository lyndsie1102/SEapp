import os
from dotenv import load_dotenv
from flask_sqlalchemy import SQLAlchemy

load_dotenv("dev.env")

db = SQLAlchemy()

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY")
    SQLALCHEMY_DATABASE_URI = "sqlite:///app.db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")

print("SECRET_KEY:", os.getenv("SECRET_KEY"))
print("JWT_SECRET_KEY:", os.getenv("JWT_SECRET_KEY"))