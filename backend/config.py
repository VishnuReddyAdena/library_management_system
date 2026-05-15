import os
from datetime import timedelta
from dotenv import load_dotenv

basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(basedir, '.env'))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'flask-insecure-development-key-for-lms')
    
    # Database
    # Flask-SQLAlchemy needs "postgresql://" instead of "postgres://"
    db_url = os.environ.get('DATABASE_URL')
    if db_url and db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)
    
    SQLALCHEMY_DATABASE_URI = db_url or 'sqlite:///' + os.path.join(basedir, 'flask_app.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT Settings
    JWT_SECRET_KEY = os.environ.get('SECRET_KEY', 'jwt-secret-string')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=15)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=7)
    JWT_TOKEN_LOCATION = ['headers', 'cookies']
    JWT_ACCESS_COOKIE_PATH = '/'
    JWT_REFRESH_COOKIE_PATH = '/api/auth/refresh/'
    JWT_COOKIE_SECURE = 'RENDER' in os.environ  # True in production
    JWT_COOKIE_SAMESITE = 'Strict'
    JWT_COOKIE_CSRF_PROTECT = False # Assuming React app handles this via Authorization header anyway, but cookies for refresh
    
    # CORS
    FRONTEND_URL = os.environ.get('FRONTEND_URL', "https://library-management-system-dcya95l8g.vercel.app")
    CORS_ALLOWED_ORIGINS = [
        "http://localhost:3005",
        "http://127.0.0.1:3005",
        FRONTEND_URL
    ]
