from dotenv import load_dotenv
import os
from urllib.parse import quote
# 현재 파일의 디렉토리 경로를 BASE_DIR에 저장
BASE_DIR = os.path.dirname(__file__)
# .env 파일에서 환경 변수를 로드
load_dotenv(os.path.join(BASE_DIR, '.env'))



SQLALCHEMY_DATABASE_URI = 'postgresql+psycopg2://{user}:{password}@{url}/{db}'.format(
    user=os.getenv('DB_USER'),
    password=quote(os.getenv('DB_PASSWORD')),
    url=os.getenv('DB_URL'),
    db=os.getenv('DB_HOST')
)
SQLALCHEMY_TRACK_MODIFICATIONS = False

SECRET_KEY = b'^\xe4g\xfaU\x1bt[\xfeS\xd9\x1a\xfet\x8a\tI[\xadWBq\xf8\xf0f\x1e;p!\x8d]\x0f'