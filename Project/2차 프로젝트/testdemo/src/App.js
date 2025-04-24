// src/App.js
import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";

// Component Imports
import Tab1 from "./components/Tab1";
import Tab2 from "./components/Tab2";
import Tab3 from "./components/Tab3";
import Modal from "./components/Model"; // Modal 컴포넌트 가져오기
import TodayPopup from "./components/today"; // TodayPopup 컴포넌트 가져오기
import Tab3Deep from "./components/Tab3-deep.jsx"; // Tab3Deep import 확인

// Style Imports (Ensure these paths are correct or handled within components/index.js)
// import './styles/Modal.css';
// import './styles/App.css'; // Example: Add App specific styles if needed

const App = () => {
  // --- State ---
  const [, setActiveTab] = useState("quiz"); // 기본 탭: AI 문제
  const [isTodayModalOpen, setIsTodayModalOpen] = useState(false); // '오늘의 위인' 팝업 표시 상태

  // --- Hooks ---
  const navigate = useNavigate(); // 페이지 이동을 위한 navigate 함수
  const location = useLocation(); // 현재 경로 정보를 얻기 위한 location 객체

  // --- Effects ---
  // 앱이 처음 로드될 때 '오늘의 위인' 팝업을 띄웁니다.
  useEffect(() => {
    navigate("/summary"); // 👈 앱 시작 시 Tab2 경로로 먼저 이동!
    // 이전 localStorage 로직은 제거됨 (항상 팝업 열기)
    setIsTodayModalOpen(true);
  }, [navigate]); // 빈 의존성 배열: 컴포넌트 마운트 시 1회만 실행

  // 👇 현재 경로가 바뀔 때마다 activeTab 상태 업데이트 (Header 스타일 동기화)
  useEffect(() => {
    const path = location.pathname;
    if (path === "/") {
      setActiveTab("quiz");
    } else if (path === "/summary") {
      setActiveTab("summary");
    } else if (path === "/wrong" || path === "/retry-quiz") {
      // retry-quiz도 wrong 탭 활성화
      setActiveTab("wrong");
    }
  }, [location.pathname]); // 경로가 변경될 때마다 실행

  // --- Event Handlers ---
  /** '오늘의 위인' 팝업 닫기 핸들러 */
  const handleCloseTodayModal = () => {
    setIsTodayModalOpen(false); // 1. 모달(팝업) 닫기
    navigate("/summary"); // 2. Tab2 경로('/summary')로 이동! 👈 추가
  };

  /** 탭 변경 핸들러 */
  const handleTabChange = (tab) => {
    // setActiveTab(tab); // <- 이 줄은 이제 useEffect에서 처리하므로 주석 처리하거나 삭제 가능

    // tab 이름에 따라 해당 경로로 이동
    switch (tab) {
      case "summary":
        navigate("/summary");
        break;
      case "quiz":
        navigate("/");
        break;
      case "wrong":
        navigate("/wrong");
        break;
      default:
        navigate("/");
    }
  };

  // --- Render ---
  return (
    <div>
      {/* '오늘의 위인' 팝업 모달 */}
      {/* Modal 컴포넌트가 isOpen 상태에 따라 내부적으로 표시/숨김 처리 */}
      <Modal isOpen={isTodayModalOpen} onClose={handleCloseTodayModal}>
        <TodayPopup />
      </Modal>

      {/* 👇 라우팅 설정: Routes와 Route 사용 */}
      <Routes>
        {/* 각 경로에 맞는 컴포넌트 렌더링 및 handleTabChange 전달 */}
        {/* activeTab prop은 이제 각 컴포넌트 내부 Header에서 직접 사용하지 않고,
            App.js의 useEffect가 location을 기반으로 activeTab 상태를 설정하고,
            그 상태를 Header가 사용하도록 구조 변경 (Header는 activeTab prop만 받음) */}
        <Route path="/" element={<Tab1 handleTabChange={handleTabChange} />} />
        <Route
          path="/summary"
          element={<Tab2 handleTabChange={handleTabChange} />}
        />
        <Route
          path="/wrong"
          element={<Tab3 handleTabChange={handleTabChange} />}
        />
        <Route
          path="/retry-quiz"
          element={<Tab3Deep handleTabChange={handleTabChange} />}
        />
        {/* 추후 다른 경로 추가 가능 */}
      </Routes>
    </div>
  );
};

export default App;
