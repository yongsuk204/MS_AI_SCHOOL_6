# === database.py ===
# SQLAlchemy와 Migrate 객체 초기화

from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()  # SQLAlchemy 객체 생성 / 데이터베이스 ORM을 위한 라이브러리
migrate = Migrate()  # Flask-Migrate 객체 생성 / 데이터베이스 마이그레이션을 관리하는 도구