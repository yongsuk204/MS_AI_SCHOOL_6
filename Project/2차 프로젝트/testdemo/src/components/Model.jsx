// src/components/Modal.jsx
import React from "react";
import "../styles/Model.css"; // Modal 스타일을 위한 CSS 파일 (아래에서 만들어요)

const Modal = ({ isOpen, onClose, children }) => {
  // isOpen 상태가 false면 아무것도 렌더링하지 않음
  if (!isOpen) {
    return null;
  }

  // 모달 내용 클릭 시 이벤트 전파 방지 (배경 클릭으로 닫히는 것 방지)
  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    // 모달 배경 (클릭하면 닫힘)
    <div className="modal-overlay" onClick={onClose}>
      {/* 모달 내용 영역 */}
      <div className="modal-content" onClick={handleContentClick}>
        {/* 닫기 버튼 */}
        <button className="modal-close-button" onClick={onClose}>
          &times; {/* 'X' 모양 아이콘 */}
        </button>
        {/* 실제 팝업 내용이 들어갈 부분 */}
        {children}
      </div>
    </div>
  );
};

export default Modal;
