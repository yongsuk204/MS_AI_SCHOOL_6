// src/components/Tab1.jsx
import React, { useState } from "react";
import "../styles/Tab1_style.css"; // Tab1 전용 스타일
import Header from "./Header.jsx"; // 헤더 컴포넌트
import "../styles/Header.css"; // 헤더css만 따로 불러오기
import axios from "axios";
import { api } from "../API/api";

const Tab1 = ({ handleTabChange }) => {
  const [selectedPeriod, setSelectedPeriod] = useState("시대 선택");
  const [questionText, setQuestionText] = useState("");
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [selectedCustomQuestion, setSelectedCustomQuestion] = useState(""); // 초기값을 빈 문자열로 변경
  const [questionId, setQuestionId] = useState(null); // 생성된 문제의 DB ID
  const [correctAnswer, setCorrectAnswer] = useState(null); // 생성된 문제의 실제 정답 번호
  const [originalQuestionText, setOriginalQuestionText] = useState(""); // 해설 추가 전 원본 문제 저장용

  const handleAnswerClick = (index) => {
    setSelectedAnswer(index);
  };

  const handleGenerateClick = async () => {
    // 비활성화 상태에서는 클릭되지 않지만, 방어 로직 유지
    if (selectedPeriod === "시대 선택") {
      alert("시대를 먼저 선택해주세요!");
      return;
    }

    setQuestionText("문제를 생성 중입니다...");
    setSelectedAnswer(null);
    setQuestionId(null); // 이전 문제 ID 초기화
    setCorrectAnswer(null); // 이전 정답 초기화
    setOriginalQuestionText(""); // 원본 텍스트 초기화

    // 1. AI로부터 문제, 정답, 해설 받아오기
    const {
      questionText: generatedText,
      correctAnswer: answer,
      explanation: generatedExplanation,
    } = await generateQuestionFromPeriod(selectedPeriod); // 👈 explanation 추가

    if (generatedText && answer !== null) {
      // 2. DB에 문제 저장 시도
      const savedQuestionId = await saveQuestionToDB({
        questionText: generatedText,
        correctAnswer: answer,
        period: selectedPeriod,
        explanation: generatedExplanation, // 👈 explanation 전달
      });

      if (savedQuestionId) {
        // 3. DB 저장 성공 시 상태 업데이트
        setQuestionText(generatedText); // 화면에 문제 표시
        setOriginalQuestionText(generatedText); // 원본 저장
        setCorrectAnswer(answer); // 정답 저장
        setQuestionId(savedQuestionId); // DB ID 저장
      } else {
        // DB 저장 실패 시
        setQuestionText("문제를 DB에 저장하는 중 오류가 발생했습니다.");
      }
    } else {
      // AI 문제 생성 실패 또는 정답 추출 실패 시
      setQuestionText(generatedText || "AI로부터 문제를 받아오지 못했습니다.");
    }
  };

  // API 호출 함수 추가 (백엔드 /save_wrong_answer 호출용)
  const saveWrongAnswer = async (userId, qId, userAnswer) => {
    try {
      const formData = new FormData();
      formData.append("user_id", 1); // ❗ 사용자 ID 필요 (예: 1)
      formData.append("question_id", qId);
      formData.append("user_choice", userAnswer);

      // ❗ api 인스턴스 사용
      const response = await api.post("/save_wrong_answer", formData); // 엔드포인트 확인! _ 사용됨

      console.log("[/save_wrong_answer] 응답:", response.data);
      if (response.data.status === "wrong answer saved") {
        console.log("오답 정보가 성공적으로 저장되었습니다.");
        // 사용자에게 알림 (선택적)
        // alert('틀린 문제가 오답노트에 기록되었습니다.');
      } else {
        console.error(
          "오답 정보 저장 실패:",
          response.data.detail || "알 수 없는 오류"
        );
      }
    } catch (error) {
      console.error(
        "오답 저장 API 호출 오류:",
        error.response ? error.response.data : error.message
      );
    }
  };

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer) {
      alert("정답 번호를 선택해주세요!");
      return;
    }

    // --- 1. 초기 유효성 검사 ---
    if (!questionId || correctAnswer === null) {
      alert(
        "문제가 올바르게 로드되지 않았거나 정답 정보가 없습니다. 다시 시도해주세요."
      );
      return;
    }

    if (
      !originalQuestionText || // 원본 텍스트 기준으로 확인
      questionText.includes("생성 중") ||
      questionText.includes("불러오는 중")
    ) {
      alert("문제가 완전히 생성된 후 제출해주세요!");
      return;
    }

    // --- 2. 정답 확인 및 오답 저장 ---
    const isCorrect = selectedAnswer === correctAnswer;
    console.log(
      `사용자 선택: ${selectedAnswer}, 정답: ${correctAnswer}, 결과: ${
        isCorrect ? "정답" : "오답"
      }`
    );

    // 오답인 경우 DB에 저장
    if (!isCorrect) {
      // ❗ user_id를 적절히 전달해야 함 (예: 1)
      await saveWrongAnswer(1, questionId, selectedAnswer);
    }

    // --- 3. 해설 처리 (생성, DB 저장, UI 업데이트) ---
    let explanation = ""; // explanation 변수를 try 블록 밖에서 선언 (finally에서도 사용)

    try {
      // 3-1. UI에 로딩 메시지 표시
      setQuestionText((prev) => prev + "\n\n🔍 해설을 불러오는 중입니다...");

      // 3-2. AI로부터 해설 받아오기
      explanation = await submitAnswerForExplanation(
        originalQuestionText,
        selectedAnswer
      );

      // 3-3. ❗❗❗ DB에 해설 저장 로직 추가 ❗❗❗
      //    explanation이 성공적으로 받아와졌고, 오류 메시지가 아닌 경우에만 실행
      if (
        questionId &&
        explanation &&
        !explanation.includes("오류가 발생했습니다")
      ) {
        console.log(`[Tab1] 해설 DB 저장 시도: questionId=${questionId}`);

        // 백엔드가 'application/x-www-form-urlencoded' 형식을 기대한다고 가정
        const params = new URLSearchParams();
        params.append("question_id", questionId);
        params.append("explanation", explanation);

        // api 인스턴스 사용 및 헤더 명시 (백엔드 형식에 따라 수정 필요)
        const updateResponse = await api.post(
          "/update-question-explanation",
          params,
          {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
          }
        );
        console.log(
          "[/update-question-explanation] 응답:",
          updateResponse.data
        );

        // 백엔드 응답 상태 확인 (선택적)
        if (updateResponse.data?.status !== "explanation updated") {
          console.warn(
            "[Tab1] DB 해설 업데이트 응답 상태가 정상이 아닙니다:",
            updateResponse.data
          );
        }
      } else {
        console.warn(
          "[Tab1] questionId 또는 유효한 explanation이 없어 DB 저장을 건너<0xEB><0><0x8A>니다."
        );
      }
      // --- DB 저장 로직 끝 ---
    } catch (error) {
      // 3-4. 해설 생성 또는 DB 저장 중 발생한 오류 처리
      console.error("[Tab1] 해설 처리 중 오류:", error);
      explanation = "해설을 처리하는 중 오류가 발생했습니다."; // 사용자에게 보여줄 오류 메시지 설정
    } finally {
      // 3-5. 최종 UI 업데이트 (성공/실패 관계없이 항상 실행)
      setQuestionText((prev) => {
        const baseText = prev.replace("\n\n🔍 해설을 불러오는 중입니다...", "");
        // 성공 시 실제 해설, 오류 시 오류 메시지가 explanation 변수에 담겨 있음
        return baseText + `\n\n💡 ${explanation}`;
      });
    }
  };

  const handleNextQuestionClick = async () => {
    const isCustomSelected =
      selectedCustomQuestion && !selectedCustomQuestion.includes("선택");
    const isPeriodSelected = selectedPeriod !== "시대 선택";

    // 둘 다 선택되지 않았으면 비활성화 상태이므로, 클릭 시 경고만 표시 (선택적)
    if (!isPeriodSelected && !isCustomSelected) {
      alert("시대를 선택하거나 예상 질문을 선택 후 다음 문제를 눌러주세요.");
      return;
    }

    // 상태 초기화
    setQuestionText("다음 문제를 불러오는 중입니다...");
    setSelectedAnswer(null);
    setQuestionId(null);
    setCorrectAnswer(null);
    setOriginalQuestionText("");

    let generatedText = null;
    let answer = null;
    let currentPeriod = selectedPeriod; // DB 저장 시 사용할 시대 정보

    try {
      let explanationToSave = ""; // 해설 저장용 변수 추가

      if (isCustomSelected) {
        // 👇 explanation 받기
        const {
          questionText: customText,
          correctAnswer: customAnswer,
          explanation: customExplanation,
        } = await generateQuestionFromCustomPrompt(selectedCustomQuestion);
        generatedText = customText;
        answer = customAnswer;
        explanationToSave = customExplanation; // 👈 해설 저장
        currentPeriod = "예상질문";
      } else {
        // 👇 explanation 받기
        const {
          questionText: periodText,
          correctAnswer: periodAnswer,
          explanation: periodExplanation,
        } = await generateQuestionFromPeriod(selectedPeriod);
        generatedText = periodText;
        answer = periodAnswer;
        explanationToSave = periodExplanation; // 👈 해설 저장
        currentPeriod = selectedPeriod;
      }

      if (generatedText && answer !== null) {
        const savedQuestionId = await saveQuestionToDB({
          questionText: generatedText,
          correctAnswer: answer,
          period: currentPeriod,
          explanation: explanationToSave, // 👈 explanation 전달!
        });

        if (savedQuestionId) {
          // DB 저장 성공 시 상태 업데이트
          setQuestionText(generatedText);
          setOriginalQuestionText(generatedText);
          setCorrectAnswer(answer);
          setQuestionId(savedQuestionId);
          console.log(
            `다음 문제 DB 저장 성공! Question ID: ${savedQuestionId}, Correct Answer: ${answer}`
          );
        } else {
          setQuestionText("다음 문제를 DB에 저장하는 중 오류가 발생했습니다.");
          setCorrectAnswer(null);
          setQuestionId(null);
        }
      } else {
        setQuestionText(
          generatedText || "다음 문제를 AI로부터 받아오지 못했습니다."
        );
        setCorrectAnswer(null);
        setQuestionId(null);
      }
    } catch (error) {
      // 위에서 이미 catch하므로 여기서는 추가 에러 처리 (예: UI 메시지)
      console.error("다음 문제 처리 중 오류:", error);
      setQuestionText("다음 문제를 처리하는 중 오류가 발생했습니다.");
      setCorrectAnswer(null);
      setQuestionId(null);
    }
  };

  const handleCustomQuestionClick = async () => {
    // 비활성화 상태에서는 클릭되지 않지만, 방어 로직 유지
    if (!selectedCustomQuestion || selectedCustomQuestion.includes("선택")) {
      alert("예상 질문을 먼저 선택해주세요!");
      return;
    }

    // 상태 초기화 (handleGenerateClick과 동일하게)
    setQuestionText("예상 문제를 생성 중입니다...");
    setSelectedAnswer(null);
    setQuestionId(null);
    setCorrectAnswer(null);
    setOriginalQuestionText("");

    try {
      // 1. AI로부터 문제, 정답, 해설 받아오기
      const {
        questionText: generatedText,
        correctAnswer: answer,
        explanation: generatedExplanation,
      } = await generateQuestionFromCustomPrompt(selectedCustomQuestion); // 👈 explanation 추가

      if (generatedText && answer !== null) {
        // 2. DB에 문제 저장 시도
        const currentPeriod = "예상질문";
        const savedQuestionId = await saveQuestionToDB({
          questionText: generatedText,
          correctAnswer: answer,
          period: currentPeriod,
          explanation: generatedExplanation, // 👈 explanation 전달!
        });

        if (savedQuestionId) {
          // 3. DB 저장 성공 시 상태 업데이트
          setQuestionText(generatedText);
          setOriginalQuestionText(generatedText);
          setCorrectAnswer(answer);
          setQuestionId(savedQuestionId);
          console.log(
            `예상 문제 DB 저장 성공! Question ID: ${savedQuestionId}, Correct Answer: ${answer}`
          );
        } else {
          // DB 저장 실패 시
          setQuestionText("예상 문제를 DB에 저장하는 중 오류가 발생했습니다.");
          setCorrectAnswer(null); // 실패 시 관련 상태 초기화
          setQuestionId(null);
        }
      } else {
        // AI 문제 생성 실패 또는 정답 추출 실패 시
        setQuestionText(
          generatedText || "예상 문제를 AI로부터 받아오지 못했습니다."
        );
        setCorrectAnswer(null); // 실패 시 관련 상태 초기화
        setQuestionId(null);
      }
    } catch (error) {
      console.error("예상 문제 처리 중 오류:", error);
      setQuestionText("예상 문제를 처리하는 중 오류가 발생했습니다.");
      setCorrectAnswer(null); // 실패 시 관련 상태 초기화
      setQuestionId(null);
    }
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

  const questions = [
    "구석기랑 신석기 차이를 문제로 만들어 주세요.",
    "청동기 시대에 생긴 변화에 관한 문제를 만들어 주세요.",
    "구석기와 신석기의 도구와 생활 양식을 비교하는 문제를 만들어 주세요.",
    "고조선 건국과 관련된 문제 만들어 주세요.",
    "위만 조선이 등장하면서 생긴 변화에 대한 문제 만들어 주세요.",
    "고조선의 8조법과 당시 사회 구조를 설명하는 문제를 만들어 주세요.",
    "삼국 통일과 관련된 문제를 만들어 주세요.",
    "고구려, 백제, 신라의 성장 과정을 비교하는 문제를 만들어 주세요.",
    "삼국 시대 전투 관련 문제를 만들어 주세요.",
    "발해와 신라 비교 문제를 만들어 주세요.",
    "발해와 통일 신라의 차이점에 대한 문제를 만들어 주세요.",
    "발해의 건국 배경과 주요 정책을 설명하는 문제를 만들어 주세요.",
    "고려 건국에 대한 문제를 만들어 주세요.",
    "무신 정권 시기 상황을 문제로 만들어 주세요.",
    "고려와 거란의 전쟁 관련 문제를 만들어 주세요.",
    "조선 초기 제도 정비 관련 문제 만들어 주세요.",
    "조선 후기 실학자 문제 만들어 주세요.",
    "조선의 유교 정치 이념이 반영된 제도 문제로 만들어 주세요.",
    "갑오개혁과 을미개혁 비교하는 문제 만들어 주세요.",
    "대한제국 성립 배경과 광무개혁 내용을 묻는 문제를 만들어 주세요.",
    "대한제국이 일본에 의해 강제로 병합된 과정을 설명하는 문제를 만들어 주세요.",
    "일제강점기 독립운동 관련 문제 만들어 주세요.",
    "3.1 운동 관련된 문제 만들어 주세요.",
    "일제 강점기 동안 한국인이 벌인 독립운동의 주요 사건을 묻는 문제를 만들어 주세요.",
    "6.25 전쟁 관련 문제 만들어 주세요.",
    "대한민국 정부 수립 관련 문제 만들어 주세요.",
    "민주화 운동 중심으로 문제 만들어 주세요.",
  ];

  // 다음 문제 버튼 활성화 조건 계산
  const isNextButtonEnabled =
    selectedPeriod !== "시대 선택" ||
    (selectedCustomQuestion && !selectedCustomQuestion.includes("선택"));

  return (
    <div className="phone-frame">
      <Header activeTab="quiz" onTabChange={handleTabChange} />

      <main className="main-content">
        <section className="section-banner1">
          <h2 className="title1">문제 생성</h2>
          <p className="description1">
            AI가 학습된 내용으로 문제를 생성합니다.
          </p>
        </section>

        <section className="section-body1">
          <div className="dropdown-row1">
            <select
              className="dropdown1"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              {periods.map((period, idx) => (
                <option key={idx}>{period}</option>
              ))}
            </select>
            {/* --- "문제 풀기" 버튼 disabled 속성 추가 --- */}
            <button
              className="action-button1"
              onClick={handleGenerateClick}
              disabled={selectedPeriod === "시대 선택"} // 시대 선택 안 했으면 비활성화
            >
              문제 풀기
            </button>
            {/* -------------------------------------- */}
          </div>

          <div className="chat-box1">
            <strong>AI 문제 풀이</strong>
            <div className="chat-output1">
              {questionText || "여기에 AI가 생성한 문제 내용이 표시됩니다."}
            </div>
          </div>

          <div className="answer-section1">
            <p className="answer-title1">정답을 선택하세요</p>
            <div className="answer-button-row1">
              {[1, 2, 3, 4].map((num) => (
                <button
                  key={num}
                  className={`answer-button1 ${
                    selectedAnswer === num ? "selected" : ""
                  }`}
                  onClick={() => handleAnswerClick(num)}
                  disabled={
                    !questionText ||
                    questionText.includes("생성 중") ||
                    questionText.includes("불러오는 중")
                  }
                >
                  {num}
                </button>
              ))}
              <button
                className="submit-button2" // 클래스 이름 확인 (submit-button2가 아님)
                onClick={handleSubmitAnswer}
                disabled={
                  selectedAnswer === null ||
                  !questionText ||
                  questionText.includes("생성 중") ||
                  questionText.includes("불러오는 중")
                }
              >
                정답 제출
              </button>
            </div>
          </div>

          {/* --- "다음 문제" 버튼 disabled 속성 추가 --- */}
          <button
            className="next-button1"
            onClick={handleNextQuestionClick}
            disabled={!isNextButtonEnabled} // 계산된 조건 사용
          >
            다음 문제
          </button>
          {/* -------------------------------------- */}

          <div className="dropdown-wrapper1">
            <div className="dropdown-row1">
              <select
                className="dropdown1"
                value={selectedCustomQuestion}
                onChange={(e) => setSelectedCustomQuestion(e.target.value)}
              >
                {/* --- 기본 옵션 값 변경 --- */}
                <option value="">시대별 예상 질문 선택</option>
                {/* ----------------------- */}
                {questions.map((q, idx) => (
                  <option key={idx}>{q}</option>
                ))}
              </select>
              {/* --- "예상문제" 버튼 disabled 속성 추가 --- */}
              <button
                className="expect-button1"
                onClick={handleCustomQuestionClick}
                disabled={
                  !selectedCustomQuestion ||
                  selectedCustomQuestion.includes("선택")
                } // 예상 질문 선택 안 했으면 비활성화
              >
                예상문제
              </button>
              {/* -------------------------------------- */}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

// ... (API 호출 함수들은 동일) ...
// Azure API로 문제 요청 보내는 함수
const generateQuestionFromPeriod = async (selectedPeriod) => {
  try {
    const response = await axios.post(
      "https://6b013-azure-ai-service.openai.azure.com/openai/deployments/gpt-4o/chat/completions?api-version=2024-05-01-preview",
      {
        messages: [
          {
            role: "system",
            content: "너는 한국사 문제 출제 AI야.",
          },
          {
            role: "user",
            // 👇 프롬프트 수정: 해설 요청 및 마커('해설:') 요구 추가
            content: `시대: ${selectedPeriod}에 대한 4지선다형 문제를 만들어줘. 문제와 보기, 그리고 정답에 대한 자세한 해설을 생성해줘. 해설은 '해설:' 이라는 단어로 시작해야 해. 마지막 줄에는 '정답: [번호]' 형식으로 정답 번호만 알려줘.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 800, // 필요시 토큰 늘리기 (해설 길이 고려)
      },
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": "",
        },
      }
    );

    const rawResponse = response.data.choices[0].message.content;
    console.log("AI 원본 응답:", rawResponse);

    // --- 👇 파싱 로직 수정 시작 👇 ---
    let questionText = "";
    let explanationText = ""; // 해설 저장 변수
    let extractedAnswer = null;

    const lines = rawResponse.trim().split("\n");
    // 마지막 줄이 비어있을 경우 제거 (안전 장치)
    if (lines[lines.length - 1].trim() === "") {
      lines.pop();
    }
    let answerLine = "";
    if (lines.length > 0) {
      answerLine = lines.pop(); // 마지막 줄 (정답)

      // 정답 번호 추출
      const answerMatch = answerLine.match(/정답:\s*\[?(\d+)\]?/);
      if (answerMatch && answerMatch[1]) {
        extractedAnswer = parseInt(answerMatch[1], 10);
        console.log("성공적으로 추출된 정답 번호:", extractedAnswer);
      } else {
        // ❗ 정답 패턴 못 찾으면 오류 로그 남기기
        console.error(
          "AI 응답에서 '정답: [숫자]' 패턴을 찾지 못했습니다:",
          answerLine
        );
        // 정답 추출 실패 시, 마지막 줄을 다시 포함시켜 문제/해설 분석 시도 (answerLine이 비어있지 않을 때만)
        if (answerLine) {
          lines.push(answerLine);
        }
      }
    }

    // 문제와 해설 분리 (마커 '해설:' 기준)
    const mainContent = lines.join("\n");
    const explanationMarker = "\n해설:"; // 줄바꿈 후 '해설:'
    const explanationIndex = mainContent.indexOf(explanationMarker);

    if (explanationIndex !== -1) {
      const fullQuestion = mainContent.substring(0, explanationIndex).trim(); // ✅ 먼저 선언

      const splitIndex = fullQuestion.search(/1[).]\s/); // ✅ 그다음 사용

      if (splitIndex !== -1) questionText = fullQuestion;
      explanationText = mainContent
        .substring(explanationIndex + explanationMarker.length)
        .trim();
      console.log("추출된 해설:", explanationText);
    } else {
      questionText = mainContent.trim(); // 해설 마커 없으면 전체를 문제로 간주
      explanationText = ""; // 해설 없음
      console.warn("AI 응답에서 '해설:' 마커를 찾지 못했습니다.");
    }
    // --- 👆 파싱 로직 수정 끝 👆 ---

    // 👇 반환 객체에 explanation 추가
    return {
      questionText: questionText,
      correctAnswer: extractedAnswer,
      explanation: explanationText,
    };
  } catch (error) {
    console.error("문제 요청 실패:", error);
    // 👇 반환 객체에 explanation: null 추가
    return {
      questionText: "문제를 불러오는 중 오류가 발생했습니다.",
      correctAnswer: null,
      explanation: null, // 오류 시 해설도 null
    };
  }
}; // 👈 generateQuestionFromPeriod 함수 정의 끝

// 👇👇👇 이 함수 정의 코드를 추가하세요! 👇👇👇
// API 호출 함수 추가 (백엔드 /save-question 호출용)
const saveQuestionToDB = async (questionData) => {
  try {
    const formData = new FormData();
    formData.append("material_id", 1); // 임시 ID
    formData.append("question_text", questionData.questionText);

    // 선택지 파싱 (기존 로직 유지 또는 개선)
    const choices =
      questionData.questionText.match(/^\s*\d+[).]\s*(.*)$/gm) || [];
    formData.append(
      "choice1",
      choices[0]?.replace(/^\d[).]\s*/, "").trim() || ""
    );
    formData.append(
      "choice2",
      choices[1]?.replace(/^\d[).]\s*/, "").trim() || ""
    );
    formData.append(
      "choice3",
      choices[2]?.replace(/^\d[).]\s*/, "").trim() || ""
    );
    formData.append(
      "choice4",
      choices[3]?.replace(/^\d[).]\s*/, "").trim() || ""
    );

    formData.append("answer", questionData.correctAnswer);
    // 👇 전달받은 explanation 사용! (없으면 빈 문자열)
    formData.append("explanation", questionData.explanation || "");
    formData.append("period", questionData.period);

    // ❗ api 인스턴스 사용 확인
    const response = await api.post("/save-question", formData);

    console.log("[/save-question] 응답:", response.data);
    if (
      response.data.status === "question saved" &&
      response.data.question_id
    ) {
      return response.data.question_id;
    } else {
      console.error(
        "DB에 문제 저장 실패:",
        response.data.detail || "알 수 없는 오류"
      );
      return null;
    }
  } catch (error) {
    console.error(
      "DB 문제 저장 API 호출 오류:",
      error.response ? error.response.data : error.message
    );
    return null;
  }
};
// --- saveQuestionToDB 함수 정의 끝 ---

// 사용자의 정답을 바탕으로 해설을 요청하는 함수
const submitAnswerForExplanation = async (questionText, selectedAnswer) => {
  try {
    const response = await axios.post(
      "https://6b013-azure-ai-service.openai.azure.com/openai/deployments/gpt-4o/chat/completions?api-version=2024-05-01-preview",
      {
        messages: [
          {
            role: "system",
            content:
              "너는 한국사 문제에 대해 정답을 확인하고 해설을 제공하는 AI야.",
          },
          {
            role: "user",
            content: `문제: ${questionText}\n내가 선택한 번호: ${selectedAnswer}\n정답과 해설을 알려줘.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": "",
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("해설 요청 실패:", error);
    return "해설 요청 중 오류가 발생했습니다.";
  }
};

const generateQuestionFromCustomPrompt = async (customPrompt) => {
  try {
    const response = await axios.post(
      "https://6b013-azure-ai-service.openai.azure.com/openai/deployments/gpt-4o/chat/completions?api-version=2024-05-01-preview",
      {
        messages: [
          {
            role: "system",
            content:
              "너는 한국사 문제에 대해 정답을 확인하고 해설을 제공하는 AI야.",
          },
          {
            role: "user",
            content: `${customPrompt}에 대한 4지선다형 문제를 만들어줘. 문제와 보기, 그리고 정답에 대한 자세한 해설을 생성해줘. 해설은 '해설:' 이라는 단어로 시작해야 해. 마지막 줄에는 '정답: [번호]' 형식으로 정답 번호만 알려줘.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 800,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": "", // 키는 기존과 동일하게 넣기
        },
      }
    );

    const rawResponse = response.data.choices[0].message.content;
    console.log("AI 원본 응답 (Custom):", rawResponse);

    // 👇 AI 응답 파싱 로직 추가 (generateQuestionFromPeriod와 동일)
    // --- 파싱 로직 (generateQuestionFromPeriod와 동일하게 유지) ---
    let questionText = "";
    let explanationText = "";
    let extractedAnswer = null;

    const lines = rawResponse.trim().split("\n");
    // 마지막 줄이 비어있을 경우 제거 (안전 장치)
    if (lines.length > 0 && lines[lines.length - 1].trim() === "") {
      lines.pop();
    }
    // 마지막 줄이 있는지 확인 후 처리
    let answerLine = "";
    if (lines.length > 0) {
      answerLine = lines.pop(); // 마지막 줄 (정답)
    }

    const answerMatch = answerLine.match(/정답:\s*\[?(\d+)\]?/);
    if (answerMatch && answerMatch[1]) {
      extractedAnswer = parseInt(answerMatch[1], 10);
      console.log("성공적으로 추출된 정답 번호 (Custom):", extractedAnswer);
    } else {
      // ❗ 정답 패턴 못 찾으면 오류 로그 남기기
      console.error(
        "AI 응답에서 '정답: [숫자]' 패턴을 찾지 못했습니다 (Custom):",
        answerLine
      );
      // 정답 추출 실패 시, 마지막 줄을 다시 포함시켜 문제/해설 분석 시도 (answerLine이 비어있지 않을 때만)
      if (answerLine) {
        lines.push(answerLine);
      }
    }

    const mainContent = lines.join("\n");
    const explanationMarker = "\n해설:";
    const explanationIndex = mainContent.indexOf(explanationMarker);

    if (explanationIndex !== -1) {
      const fullQuestion = mainContent.substring(0, explanationIndex).trim();

      questionText = fullQuestion;
      explanationText = mainContent
        .substring(explanationIndex + explanationMarker.length)
        .trim();
    }
    // --- 파싱 로직 끝 ---

    // 👇 explanation 반환 추가!
    return {
      questionText,
      correctAnswer: extractedAnswer,
      explanation: explanationText,
    };
  } catch (error) {
    console.error("예상 문제 요청 실패:", error);
    // 👇 explanation 반환 추가!
    return {
      questionText: "예상 문제를 불러오는 중 오류가 발생했습니다.",
      correctAnswer: null,
      explanation: null, // 오류 시 해설도 null
    };
  }
};

export default Tab1;
