import os
from dotenv import load_dotenv
from flask_sqlalchemy import SQLAlchemy
from datetime import timedelta

load_dotenv("dev.env")

db = SQLAlchemy()

class Config:
    SQLALCHEMY_DATABASE_URI = "sqlite:///app.db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)  # Token expires in 1 hour
    JWT_ALGORITHM = "HS256"

print("SECRET_KEY:", os.getenv("SECRET_KEY"))
print("JWT_SECRET_KEY:", os.getenv("JWT_SECRET_KEY"))