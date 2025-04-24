// src/components/Tab3.jsx
import React, { useState } from "react";
import "../styles/Tab3_style.css"; // 스타일 파일
import Header from "./Header.jsx"; // 공통 헤더 컴포넌트
import { useNavigate } from "react-router-dom";
import { api } from "../API/api"; // 👈 api 인스턴스 import 추가 (경로 확인!)
import { fetchWrongAnswers } from "../API/wrongAnswers";

const Tab3 = ({ handleTabChange }) => {
  const [selectedPeriod, setSelectedPeriod] = useState("시대 선택");

  const [wrongList, setWrongList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSearched, setIsSearched] = useState(false);

  const itemsPerPage = 10;

  // 👇 handleDelete 함수 수정 (이 코드로 통째로 바꿔주세요!)
  const handleDelete = async (answer_id) => {
    // 파라미터를 answer_id로 변경
    // answer_id 유효성 검사 (백엔드 응답에 answer_id가 없을 경우 대비)
    if (!answer_id) {
      console.error("삭제 오류: 유효하지 않은 answer_id입니다.", answer_id);
      alert(
        "삭제할 항목의 ID가 올바르지 않습니다. 데이터를 다시 로드해보세요."
      );
      return;
    }

    const confirmDelete = window.confirm("정말 삭제할까요?");
    if (!confirmDelete) return;

    console.log(`[Tab3] 삭제 시도: answer_id=${answer_id}`); // 삭제할 ID 로그

    try {
      // 백엔드 삭제 API 호출 (DELETE 요청)
      const response = await api.delete(`/delete-wrong-answer/${answer_id}`);

      console.log("[Tab3] 삭제 API 응답:", response.data); // 백엔드 응답 로그 (성공/실패 메시지 확인)

      // 백엔드 응답 성공 여부 확인 (선택적 - 백엔드 구현에 따라 다름)
      // 예: if (response.data.status === 'success') { ... }

      // ✅ API 호출 성공 시, 로컬 상태(wrongList)에서 해당 항목 제거 (더 효율적)
      setWrongList(
        (prevList) =>
          // ❗ item 객체에 answer_id가 있다고 가정합니다. 백엔드 확인 필요!
          prevList.filter((item) => item.answer_id !== answer_id) // answer_id가 다른 항목만 남김
      );
      alert("오답 기록이 삭제되었습니다.");

      // 덜 효율적인 방법: 전체 목록 다시 불러오기 (백엔드 예시 코드 방식)
      // console.log("[Tab3] 삭제 성공, 오답 목록 다시 로드 중...");
      // handleSearchClick(); // 검색 함수를 다시 호출하여 목록 갱신
    } catch (err) {
      console.error(
        "❌ 오답 삭제 API 호출 실패:",
        err.response ? err.response.data : err.message
      );
      alert(
        `오답 기록 삭제 중 오류가 발생했습니다: ${
          err.response?.data?.detail || err.message
        }`
      ); // 백엔드 에러 메시지 표시 시도
    }
  }; // <--- handleDelete 함수 끝

  const handleSearchClick = async () => {
    if (selectedPeriod === "시대 선택") {
      alert("시대를 먼저 선택해주세요!");
      return;
    }

    console.log(`[Tab3] '${selectedPeriod}' 시대로 오답 목록 검색 시작...`); // 검색 시작 로그 추가

    try {
      // 1.
      // 오답 목록 가져오기 (이제 wrongAnswers.jsx에서 콘솔 로그가 찍힐 거예요)
      const result = await fetchWrongAnswers(1); // user_id = 1

      // 2.
      // ✅ 백엔드에서 받은 데이터(result)를 여기서도 콘솔에 찍어 최종 확인! (매우 중요!)
      // 이 로그를 보고 아래 필터링, 날짜 표시, 문제 텍스트 표시 코드가 맞는지 판단해야 해요.
      console.log("[Tab3] fetchWrongAnswers로부터 받은 최종 데이터:", result);

      // 3.
      // 데이터가 배열 형태인지 확인 (안전 장치)
      const dataToFilter = Array.isArray(result) ? result : [];
      if (!Array.isArray(result)) {
        console.warn(
          "[Tab3] 받아온 데이터가 배열이 아닙니다. 빈 목록으로 처리합니다."
        );
      }

      // 4. ✅ 선택한 시대 필터링
      console.log(`[Tab3] 필터링 조건: 선택된 시대 = ${selectedPeriod}`); // 필터링 조건 로그
      const filtered =
        selectedPeriod === "전체"
          ? dataToFilter // '전체' 선택 시 모든 데이터
          : dataToFilter.filter((item) => {
              // 👇 주석 수정! 이제 period가 저장될 것으로 예상됨
              // ❗ 백엔드에서 period를 저장하므로 필터링이 작동할 것으로 예상됩니다.
              //    다만, DB에 저장된 period 문자열과 드롭다운의 selectedPeriod 문자열이
              //    '포함(includes)' 관계로 비교되는 것이 맞는지 확인이 필요할 수 있습니다.
              //    (예: DB='고려시대 전기', 선택='고려시대' -> 포함됨(O))

              const isIncluded = item.period?.includes(selectedPeriod);

              // 디버깅 로그 (필요시 주석 해제)
              // console.log(`[Tab3] 필터링 중: item.period=${item.period}, selectedPeriod=${selectedPeriod}, 포함 여부=${isIncluded}`);

              return isIncluded;
            });

      // 필터링된 결과를 콘솔에 찍어보기
      console.log(`[Tab3] '${selectedPeriod}' 시대로 필터링된 결과:`, filtered);

      // 5. 필터링된 목록으로 상태 업데이트
      setWrongList(filtered);
      setCurrentPage(1); // 페이지는 1페이지로 초기화
      setIsSearched(true); // 검색 완료 상태로 변경 (리스트 보여주기)
    } catch (error) {
      // fetchWrongAnswers에서 에러를 throw하지 않고 빈 배열을 반환하도록 수정했으므로,
      // 이 catch 블록은 네트워크 오류 등 다른 예외적인 경우에 실행될 수 있습니다.
      console.error(
        "[Tab3] 오답 데이터를 불러오는 중 예상치 못한 오류 발생:",
        error
      );
      setWrongList([]); // 에러 발생 시 빈 목록으로 초기화
      setIsSearched(true); // 에러가 나도 검색은 시도했으므로 리스트 영역은 보여주되 내용은 없게 함
      alert("오답 목록을 불러오는 데 실패했습니다. 콘솔을 확인해주세요.");
    }

    // 아래 로그는 위에서 확인하므로 중복 제거 가능
    // console.log("선택한 시대:", selectedPeriod);
    // setCurrentPage(1); // 이 줄은 try 블록 안으로 이동했으므로 제거
  }; // <--- handleSearchClick 함수 끝

  const navigate = useNavigate();

  const handleRetryClick = () => {
    navigate("/retry-quiz"); // 예시 경로: "/retry-quiz"
  };

  const periods = [
    "시대 선택",
    "전체",
    "선사시대, 구석기",
    "선사시대, 신석기",
    "선사시대, 청동기",
    "선사시대, 철기",
    "고조선",
    "원삼국시대, 옥저, 동예",
    "원삼국시대, 동예",
    "원삼국시대, 부여",
    "원삼국시대, 고구려",
    "원삼국시대, 삼한",
    "가야",
    "삼국시대, 고구려",
    "삼국시대, 백제",
    "삼국시대, 신라",
    "남북국시대",
    "후삼국시대",
    "고려시대",
    "고려시대 전기",
    "고려시대 중기",
    "고려시대 후기",
    "조선시대 전기",
    "조선시대 후기",
    "조선시대 말기",
    "조선시대 개항기",
    "조선시대 개화기",
    "조선시대 일제강점기",
    "조선시대 해방전후",
    "현대사",
  ];

  const totalPages = Math.ceil(wrongList.length / itemsPerPage);
  const paginate = (list) =>
    list.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const visibleList = paginate(wrongList);

  const isRetryButtonDisabled =
    selectedPeriod === "시대 선택" || // 1. 시대가 선택되지 않았거나
    !isSearched || // 2. 아직 검색하지 않았거나 (👈 이 조건 추가!)
    wrongList.length === 0; // 3. (검색 후) 결과 목록이 비어있으면 비활성화

  return (
    <div className="phone-frame">
      <Header activeTab="wrong" onTabChange={handleTabChange} />

      <main className="main-content3">
        <section className="section-banner3">
          <h2 className="title3">오답 노트</h2>
          <p className="description3">틀렸던 문제만 모아서 다시 봅니다.</p>
        </section>

        {/* ✅ 드롭박스 + 버튼 */}
        <div className="dropdown-row3">
          <select
            className="dropdown3"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            {periods.map((period, idx) => (
              <option key={idx}>{period}</option>
            ))}
          </select>
          <button className="action-button3" onClick={handleSearchClick}>
            문제 찾기
          </button>
        </div>

        <div className="wrong-button-wrapper3">
          {/* 이 버튼을 누르면 handleRetryClick 함수가 실행됩니다 */}
          <button
            className="wrong-button3"
            onClick={handleRetryClick}
            // 👇 위에서 계산한 변수를 여기서 사용합니다.
            disabled={isRetryButtonDisabled}
          >
            오답 문제 풀기
          </button>
        </div>

        {/* ✅ 문제 찾기 이후에만 리스트 표시 */}
        {isSearched && (
          <div className="wrong-list-wrapper3">
            {/* visibleList는 wrongList를 페이지에 맞게 자른 것 */}
            {visibleList.map((item, idx) => (
              // 👇 key prop 수정: idx 대신 고유한 item.answer_id 사용 (answer_id가 항상 있다고 가정)
              //    만약 answer_id가 없을 경우를 대비해 || idx 를 추가할 수도 있습니다.
              <div key={item.answer_id || idx} className="wrong-item-box3">
                <span className="wrong-date3">
                  {/* 👇 디버깅 로그 추가 */}
                  {console.log(
                    `[Tab3 Debug] Rendering date for item with created_at: ${item.created_at}`
                  )}{" "}
                  {/* 1. 렌더링 시 값 확인 */}
                  {item.created_at
                    ? (() => {
                        console.log(
                          `[Tab3 Debug] item.created_at is truthy: ${item.created_at}`
                        );

                        try {
                          console.log(`[Tab3 Debug] Inside try block`);

                          const datePart = item.created_at.slice(0, 10);
                          console.log(`[Tab3 Debug] datePart: ${datePart}`);

                          const [year, month, day] = datePart.split("-");
                          console.log(
                            `[Tab3 Debug] year: ${year}, month: ${month}, day: ${day}`
                          );

                          if (
                            year &&
                            month &&
                            day &&
                            year.length === 4 &&
                            month.length === 2 &&
                            day.length === 2
                          ) {
                            const formattedDate = `${year.slice(
                              -2
                            )}${month}${day}`;
                            console.log(
                              `[Tab3 Debug] Formatting successful, returning: ${formattedDate}`
                            );

                            return formattedDate;
                          } else {
                            console.warn(
                              `[Tab3 Debug] Date format check failed! year=${year}, month=${month}, day=${day}`
                            );

                            return "날짜오류";
                          }
                        } catch (e) {
                          console.error(
                            `[Tab3 Debug] Error during date parsing!`,
                            e
                          );

                          return "파싱오류";
                        }
                      })()
                    : (() => {
                        // 👇 '날짜없음'이 반환되는 경우 로그 추가
                        console.log(
                          `[Tab3 Debug] item.created_at is falsy! Returning '날짜없음'. Value: ${item.created_at}`
                        );

                        return "날짜없음";
                      })()}
                </span>

                <span className="wrong-question3">
                  {/* ❗❗❗ 백엔드 question_text 필드명 확인 필요 ❗❗❗ */}
                  {/* 백엔드에서 문제 내용을 담은 필드 이름이 정말 'question_text' 인가요? */}
                  {/* 만약 'questionText', 'q_text' 등 다른 이름이라면 여기를 바꿔야 해요! */}
                  {/* 콘솔 로그 '[Tab3] fetchWrongAnswers로부터 받은 최종 데이터:' 에서 확인하세요! */}
                  {item.question_text || "문제 내용 없음"}{" "}
                  {/* 문제 텍스트 없으면 대체 텍스트 */}
                </span>

                <button
                  className="wrong-delete3"
                  // 👇 onClick 핸들러 수정: idx 대신 item.answer_id 전달!
                  onClick={() => handleDelete(item.answer_id)}
                >
                  ×
                </button>
              </div>
            ))}
            {/* 검색했는데 결과가 없을 때 메시지 추가 */}
            {isSearched && wrongList.length === 0 && (
              <p className="no-results3">해당 시대의 오답 문제가 없습니다.</p>
            )}
          </div>
        )}

        {/* ✅ 페이지네이션도 조건부로 렌더링 */}
        {isSearched && totalPages > 1 && (
          <div className="pagination3">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={`page-btn3 ${
                  currentPage === i + 1 ? "active3" : ""
                }`}
                onClick={() => handlePageChange(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Tab3;
