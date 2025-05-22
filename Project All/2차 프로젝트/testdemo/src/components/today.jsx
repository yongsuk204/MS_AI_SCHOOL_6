// src/components/today.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/today.css";

// --- 설정 ---
// URL은 중앙 관리하거나 환경 변수로 관리하는 것이 좋습니다.
const API_CONFIG = {
  RANDOM_HERO_URL:
    process.env.REACT_APP_RANDOM_HERO_URL ||
    "https://6b012-wa-ceatbza3a6h6grbq.eastus-01.azurewebsites.net/random-hero",
};

// --- 컴포넌트: TodayPopup ---
const TodayPopup = () => {
  // --- 상태 ---
  const [heroInfo, setHeroInfo] = useState(""); // 위인 정보 문자열 저장
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태 추적
  const [error, setError] = useState(null); // 오류 메시지 저장

  // --- 마운트 시 데이터 가져오기 위한 Effect ---
  useEffect(() => {
    // 이 요청을 위한 취소 토큰 소스 생성
    const cancelTokenSource = axios.CancelToken.source();

    // 데이터 가져오기 함수
    const fetchRandomHero = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get(API_CONFIG.RANDOM_HERO_URL, {
          headers: {
            accept: "application/json",
          },
          // 요청에 취소 토큰 전달
          cancelToken: cancelTokenSource.token,
        });

        if (response.data?.result) {
          setHeroInfo(response.data.result);
        } else {
          console.error("예상치 못한 API 응답 형식:", response.data);
          setError("위인 정보를 가져오는 데 실패했습니다 (형식 오류).");
        }
      } catch (err) {
        if (axios.isCancel(err)) {
          // 요청이 취소됨, 보통 사용자에게 보여줄 오류는 아님
          console.log("요청 취소됨:", err.message);
        } else {
          // 다른 오류 처리 (네트워크, 서버 등)
          console.error("위인 정보 가져오기 오류:", err);
          let errorMessage = "위인 정보를 불러오는 중 오류가 발생했습니다.";
          if (
            err.code === "ERR_NETWORK" ||
            err.message.includes("Network Error")
          ) {
            errorMessage = "네트워크 오류로 위인 정보를 불러올 수 없습니다.";
          } else if (err.response) {
            // 가능한 경우 서버 상태 포함
            errorMessage += ` (서버 응답: ${err.response.status})`;
          }
          setError(errorMessage);
        }
      } finally {
        // 컴포넌트가 언마운트되지 않은 경우에만 로딩 상태를 false로 설정
        // (catch 블록에서 취소를 올바르게 처리하면 이 확인은 중복될 수 있음)
        // 취소되지 않았는지 확인 (간단한 확인 방법, 더 정확한 방법 필요 시 수정)
        if (!cancelTokenSource.token.reason) {
          setIsLoading(false);
        }
      }
    };

    // fetch 함수 호출
    fetchRandomHero();
    // --- 정리 함수 ---
    // 컴포넌트가 언마운트되거나 effect가 다시 실행되기 전에 실행됨 (의존성 변경 시)
    return () => {
      console.log("정리 작업: API 요청 취소 중.");
      // 컴포넌트가 완료되기 전에 언마운트되면 요청 취소
      cancelTokenSource.cancel("컴포넌트 언마운트됨, 요청 취소.");
    };
  }, []); // 빈 의존성 배열은 이 effect가 마운트 시 한 번만 실행됨을 의미

  // --- 렌더링 로직 ---
  const renderContent = () => {
    if (isLoading) {
      return <p>오늘의 위인 정보를 불러오는 중...</p>;
    }
    if (error) {
      return <p className="error-message">오류: {error}</p>; // 오류 스타일 적용 고려
    }
    if (heroInfo) {
      // 1. heroInfo를 줄바꿈 기준으로 나눕니다.
      const lines = heroInfo.split("\n").filter((line) => line.trim() !== ""); // 빈 줄 제거

      if (lines.length === 0) {
        return <p>오늘의 위인 정보가 없습니다.</p>;
      }

      // 2. 첫 줄에서 이름과 연도를 추출 시도 (정규식 사용)
      const nameYearRegex = /\[(.*?)\]\((.*?)\)/;
      const firstLineMatch = lines[0].match(nameYearRegex);

      let heroName = "";
      let heroYears = "";
      let descriptionLines = [];

      if (firstLineMatch && firstLineMatch.length === 3) {
        // 정규식 매칭 성공: 이름과 연도 추출
        heroName = firstLineMatch[1];
        heroYears = firstLineMatch[2];
        // 설명 부분은 두 번째 줄부터
        descriptionLines = lines.slice(1);
      } else {
        // 정규식 매칭 실패: 첫 줄을 이름으로 간주하고 나머지를 설명으로
        heroName = lines[0];
        descriptionLines = lines.slice(1);
        console.warn("위인 정보 형식이 예상과 다릅니다. 첫 줄:", lines[0]); // 형식 다를 경우 로그
      }

      // 3. 설명 부분을 하나의 문자열로 합치거나, 각 줄을 <p>로 렌더링
      // 여기서는 하나의 <p> 안에 <br/>로 연결합니다.
      const description = descriptionLines.map((line, index) => (
        <React.Fragment key={index}>
          {line}
          {index < descriptionLines.length - 1 && <br />}{" "}
          {/* 마지막 줄 제외하고 <br/> 추가 */}
        </React.Fragment>
      ));

      // 4. 구조화된 JSX 반환
      return (
        <div className="hero-info-details">
          <h4 className="hero-name">
            {heroName}
            {heroYears && (
              <span className="hero-years"> ({heroYears})</span>
            )}{" "}
            {/* 연도가 있을 경우에만 표시 */}
          </h4>
          {descriptionLines.length > 0 && (
            <p className="hero-description">{description}</p>
          )}
        </div>
      );
    }
    // 위인 정보가 로드되지 않은 경우 기본 메시지
    return <p>오늘의 위인 정보가 없습니다.</p>;
  };

  // --- JSX 출력 ---
  return (
    <div className={"today-popup-content"}>
      <div className={"title-section"}>
        <div className={"title-text"}>오늘의 위인</div>
      </div>
      {/* renderContent 함수가 반환하는 JSX를 직접 렌더링 */}
      <div className={"content-section"}>{renderContent()}</div>
    </div>
  );
};

export default TodayPopup;
