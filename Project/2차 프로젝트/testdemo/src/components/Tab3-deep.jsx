// src/components/Tab3-deep.jsx
import React, { useState, useEffect } from "react";
import "../styles/tab3-deep.scss"; // 경로 확인
import Header from "./Header";
import { useNavigate, useLocation } from "react-router-dom"; // location 추가
import { fetchWrongAnswers } from "../API/wrongAnswers"; // API 호출 추가

// 직접 문제를 보여주는 방식으로 변경
const Tab3Deep = ({ activeTab, handleTabChange }) => {
  const [wrongProblems, setWrongProblems] = useState([]);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation(); // URL에서 정보 가져오기 위한 훅 추가

  // URL에서 기간 파라미터 가져오기
  const getSelectedPeriodFromURL = () => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get("period") || "전체";
  };

  const selectedPeriod = getSelectedPeriodFromURL();

  // 오답 데이터 가져오기
  useEffect(() => {
    const loadWrongAnswers = async () => {
      try {
        setIsLoading(true);
        console.log(
          `[Tab3Deep] 오답 데이터 불러오기 시작, 선택된 시대: ${selectedPeriod}`
        );

        const result = await fetchWrongAnswers(1); // user_id = 1 가정

        console.log("[Tab3Deep] fetchWrongAnswers로부터 받은 데이터:", result);

        if (Array.isArray(result) && result.length > 0) {
          // 선택된 시대에 따라 필터링
          const filtered =
            selectedPeriod === "전체"
              ? result
              : result.filter((item) => item.period?.includes(selectedPeriod));

          console.log(
            `[Tab3Deep] '${selectedPeriod}' 시대로 필터링된 결과:`,
            filtered
          );

          setWrongProblems(filtered);
        } else {
          console.warn(
            "[Tab3Deep] 오답 데이터가 없거나 형식이 올바르지 않습니다."
          );
          setWrongProblems([]);
        }
      } catch (error) {
        console.error("[Tab3Deep] 오답 데이터를 불러오는 중 오류 발생:", error);
        setWrongProblems([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadWrongAnswers();
  }, [selectedPeriod]);

  // 옵션 선택 핸들러
  const handleOptionSelect = (option) => {
    if (!isSubmitted) {
      setSelectedOption(option);
    }
  };

  // 정답 제출 핸들러
  const handleSubmit = () => {
    if (selectedOption !== null) {
      setIsSubmitted(true);
    }
  };

  // 다음 문제로 이동
  const handleNextProblem = () => {
    if (currentProblemIndex < wrongProblems.length - 1) {
      setCurrentProblemIndex(currentProblemIndex + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
    }
  };

  // 이전 문제로 이동
  const handlePrevProblem = () => {
    if (currentProblemIndex > 0) {
      setCurrentProblemIndex(currentProblemIndex - 1);
      setSelectedOption(null);
      setIsSubmitted(false);
    }
  };

  // 오답 노트로 돌아가기 핸들러
  const handleBackToWrongNote = () => {
    navigate("/wrong");
  };

  // 현재 문제
  const currentProblem = wrongProblems[currentProblemIndex];

  useEffect(() => {
    document.title = "한국史記꾼 - 오답 문제 풀기";
  }, []);

  useEffect(() => {
    if (wrongProblems.length > 0) {
      setSelectedOption(null);
      setIsSubmitted(false); // <- 이 줄이 매우 중요!
    }
  }, [currentProblemIndex, wrongProblems]);

  return (
    <div className="app-container">
      <div className="app-content">
        <Header activeTab="wrong" onTabChange={handleTabChange} />

        <div className="intro-section">
          <h2 className="intro-title">오답 문제 풀기</h2>
          <p className="intro-description">
            틀렸던 문제만 모아서 다시 풀어 봅니다.
            {selectedPeriod !== "전체" && ` (${selectedPeriod})`}
          </p>
        </div>

        {isLoading ? (
          <p style={{ textAlign: "center", padding: "20px" }}>
            문제를 불러오는 중...
          </p>
        ) : wrongProblems.length === 0 ? (
          <div>
            <p style={{ textAlign: "center", padding: "20px" }}>
              오답 문제가 없습니다.
            </p>
            <button className="back-button" onClick={handleBackToWrongNote}>
              오답 노트로 돌아가기
            </button>
          </div>
        ) : (
          <>
            <div className="problem-section">
              <div className="problem-content">
                <div className="content-text">
                  {currentProblem?.question_text ||
                    "문제 내용을 불러오는 중..."}
                </div>
              </div>

              <div className="answer-form">
                <div className="answer-label">정답을 선택하세요</div>
                <div className="answer-options">
                  <div className="option-circles">
                    {[1, 2, 3, 4].map((num) => (
                      <div
                        key={num}
                        className={`option-circle ${
                          selectedOption === num ? "selected" : ""
                        }`}
                        onClick={() => handleOptionSelect(num)}
                      >
                        <div className="option-number">{num}</div>
                      </div>
                    ))}
                  </div>
                  <button
                    className="submit-button"
                    onClick={handleSubmit}
                    disabled={selectedOption === null || isSubmitted}
                  >
                    정답 제출
                  </button>
                </div>
              </div>

              {isSubmitted && (
                <div className="solution-box">
                  {/* 👇 제목 변경 또는 유지 */}
                  <h4>결과 확인</h4>
                  {/* 👇 정답 번호 표시 코드 추가! */}
                  <p>
                    <strong>정답:</strong> {currentProblem?.answer}
                  </p>
                  <p>
                    <strong>해설:</strong>
                  </p>
                  {/* 해설 표시 (백엔드 수정 전까지는 대체 텍스트 보임) */}
                  <div className="explanation-content">
                    {currentProblem?.explanation || "해설 정보가 없습니다."}
                  </div>
                </div>
              )}
            </div>

            <div className="problem-navigation">
              <button
                className="nav-button"
                onClick={handlePrevProblem}
                disabled={currentProblemIndex === 0}
              >
                이전 문제
              </button>
              <span className="problem-counter">
                {currentProblemIndex + 1} / {wrongProblems.length}
              </span>
              <button
                className="nav-button"
                onClick={handleNextProblem}
                disabled={currentProblemIndex === wrongProblems.length - 1}
              >
                다음 문제
              </button>
            </div>

            <button className="back-button" onClick={handleBackToWrongNote}>
              오답 노트로 돌아가기
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Tab3Deep;
