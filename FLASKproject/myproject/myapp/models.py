# === models.py ===
# 데이터베이스 테이블 정의 (User, Question, Answer 모델)

from myapp.database import db
from datetime import datetime

class User(db.Model):  # 사용자 테이블
    id = db.Column(db.Integer, primary_key=True)  # 기본키 / 사용자 ID
    username = db.Column(db.String(80), unique=True, nullable=False)  # 사용자 이름
    email = db.Column(db.String(120), unique=True, nullable=False)  # 사용자 이메일
    password = db.Column(db.String(200), nullable=False)  # 사용자 비밀번호

class Question(db.Model):   # 질문 테이블
    id = db.Column(db.Integer, primary_key=True)  # 기본키 / 질문 ID
    subject = db.Column(db.String(200), nullable=False) # 질문 제목
    content = db.Column(db.Text(), nullable=False)  # 질문 내용
    create_date = db.Column(db.DateTime, nullable=False, default=datetime.now)  # 질문 작성일
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), nullable=False) # 질문 작성자
    user = db.relationship('User', backref='question_set')  # 질문 작성자와의 관계 설정
    modify_date = db.Column(db.DateTime, nullable=True, default=datetime.now, index=True)  # 질문 수정일


class Answer(db.Model):  # 답변 테이블
    id = db.Column(db.Integer, primary_key=True)  # 기본키 / 답변 ID
    content = db.Column(db.Text(), nullable=False)  # 답변 내용
    create_date = db.Column(db.DateTime, nullable=False, default=datetime.now)  # 답변 작성일
    modify_date = db.Column(db.DateTime, nullable=True, default=datetime.now, index=True)  # 답변 수정일
    question_id = db.Column(db.Integer, db.ForeignKey('question.id', ondelete='CASCADE'), nullable=False)  # 답변이 달린 질문
    question = db.relationship('Question', backref='answer_set')  # 답변이 달린 질문과의 관계 설정
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), nullable=False)  # 답변 작성자
    user = db.relationship('User', backref='answer_set')  # 답변 작성자와의 관계 설정
    vote = db.Column(db.Integer, nullable=False, default=0)  # 답변 추천 수