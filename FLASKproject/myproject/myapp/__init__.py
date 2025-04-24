# flask가 돌아가게 하기위한 기본 프레임워크
# === __init__.py ===
# Flask 애플리케이션 생성 및 블루프린트 등록

from flask import Flask
from myapp.database import db, migrate  # 데이터베이스와 마이그레이션 객체를 가져옴

import config # 설정 파일을 가져옴

def create_app():
    """
    Flask 애플리케이션을 생성하는 함수
    :return: Flask 애플리케이션 객체
    """
    # Flask 애플리케이션 객체 생성
    # __name__은 현재 모듈의 이름을 나타내며, Flask는 이 정보를 사용하여 리소스 경로를 설정함
    app = Flask(__name__)
    # app.config.from_object(config)  # config.py에서 설정을 가져옴
    app.config.from_envvar('APP_CONFIG_FILE', silent=True)  # 환경변수에서 설정 파일 경로를 가져옴

    # ORMapper를 사용하여 데이터베이스와 상호작용하기 위한 설정
    # SQLAlchemy 객체를 Flask 애플리케이션에 연결
    db.init_app(app)  # Flask 애플리케이션에 SQLAlchemy 객체 초기화
    migrate.init_app(app, db)  # Flask 애플리케이션에 Flask-Migrate 객체 초기화

    from myapp import models  # 모델을 가져옴 / 데이터베이스 테이블과 매핑되는 클래스들

    # 블루프린트로 모듈화하여 관리 / 각 뷰 모듈에서 정의한 블루프린트를 가져옴
    from .views import main_view, auth_view, question_view, answer_view

    # 블루프린트 등록
    # 블루프린트는 Flask 애플리케이션의 특정 기능을 모듈화하여 관리하는 방법
    # 각 블루프린트는 특정 URL 경로와 관련된 뷰 함수들을 그룹화하여 관리함
    # 블루프린트를 사용하면 애플리케이션을 더 구조화된 방식으로 개발할 수 있음
    app.register_blueprint(main_view.bp)
    app.register_blueprint(auth_view.bp)
    app.register_blueprint(question_view.bp)
    app.register_blueprint(answer_view.bp)
    # app.register_blueprint(sql_view.bp)


    from logging.handlers import RotatingFileHandler # 로깅을 위한 핸들러
    import logging # 로깅을 위한 모듈
    import os  # 운영체제 관련 기능을 제공하는 모듈
    # 로깅 설정
    if not os.path.exists('LOG_PATH'):  # 로그 파일 경로가 존재하지 않으면
        os.makedirs('LOG_PATH')  # 로그 파일 경로 생성
    # 로깅 핸들러 설정
    file_handler = RotatingFileHandler(
        os.path.join('LOG_PATH', 'myapp.log'),  # 로그 파일 경로
        maxBytes=10 * 1024 * 1024,  # 최대 파일 크기 10MB
        backupCount=10,  # 백업 파일 개수
        encoding='utf-8'  # 인코딩 설정
    )
    file_handler.setLevel(logging.DEBUG)  # 로깅 레벨 설정
    file_handler.setFormatter(logging.Formatter(
        '%(asctime)s - %(levelname)s - %(message)s'  # 로그 메시지 포맷 설정
    ))
    app.logger.addHandler(file_handler)  # 애플리케이션 로거에 핸들러 추가
    app.logger.setLevel(logging.DEBUG)  # 애플리케이션 로거 레벨 설정
    app.logger.info('Flask application started')  # 애플리케이션 시작 로그 기록

    return app  # 생성된 Flask 애플리케이션 객체 반환

