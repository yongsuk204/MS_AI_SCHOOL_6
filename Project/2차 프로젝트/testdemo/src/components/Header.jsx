// src/components/Header.jsx
import React from "react";
import "../styles/Header.css"; // 헤더 관련 스타일 따로 만들거나 기존 스타일 활용 가능

const Header = ({ activeTab, onTabChange }) => {
  return (
    <header className="header">
      <div className="header-top">
        <h1 className="logo">한국史記꾼</h1>
        <button className="settings-icon">⚙️</button>
      </div>

      <nav className="tab-menu">
        <button
          className={`tab ${activeTab === "summary" ? "active" : ""}`}
          onClick={() => onTabChange("summary")}
        >
          AI 요약
        </button>
        <button
          className={`tab ${activeTab === "quiz" ? "active" : ""}`}
          onClick={() => onTabChange("quiz")}
        >
          AI 문제
        </button>
        <button
          className={`tab ${activeTab === "wrong" ? "active" : ""}`}
          onClick={() => onTabChange("wrong")}
        >
          오답노트
        </button>
      </nav>
    </header>
  );
};

export default Header;
