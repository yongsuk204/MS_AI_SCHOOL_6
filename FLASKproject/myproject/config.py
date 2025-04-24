import os

BASE_DIR = os.path.dirname(__file__)    # 현재 파일의 디렉토리 경로를 BASE_DIR에 저장

SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(BASE_DIR, 'myprojectapp.db')  # SQLite DB
SQLALCHEMY_TRACK_MODIFICATIONS = False  # SQLAlchemy의 변경 추적 기능 비활성화 / 실시간 추적을 원할 경우 True로 설정
SQLALCHEMY_ECHO = True  # SQLAlchemy의 쿼리 로깅 기능 활성화 / 디버깅을 원할 경우 True로 설정
SECRET_KEY = ''  # Flask 애플리케이션의 비밀 키 설정 / 실제 서비스에서는 안전한 비밀 키로 변경해야 함