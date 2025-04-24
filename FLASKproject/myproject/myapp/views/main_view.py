# === views/main_view.py ===
# 메인 페이지 라우팅 (홈 -> 질문 목록 리다이렉트)

from flask import Blueprint, render_template, url_for
from myapp.models import Question, Answer, User  # 모델들 import
from werkzeug.utils import redirect  # 리다이렉트 함수 import

# 🔹 블루프린트 등록
bp = Blueprint('main', __name__, url_prefix='/')  # 'main' 이름으로 / 경로에서 작동

# 🔸 기본 라우트 설정
@bp.route('/')
def index():
    """
    홈페이지 메인 뷰
    - 질문 테이블에서 최신순으로 질문 목록 조회
    - 템플릿(question_list.html)에 전달
    """
    return redirect(url_for('question.qlist'))  # 질문 목록 페이지로 