// src/API/오답API.jsx
import { api } from "./api";

// ✅ 최신 material_id 가져오는 함수 (새로 추가!)
export const getLatestMaterialId = async (userId = 1) => {
  try {
    console.log(`[API] 최신 material_id 요청 시작: userId=${userId}`);
    const res = await api.get("/get-latest-material-id", {
      params: { user_id: userId },
    });
    console.log("[API] 최신 material_id 응답 받음:", res.data);

    if (res.data && res.data.material_id) {
      return res.data.material_id;
    } else {
      console.error(
        "최신 material_id 가져오기 실패:",
        res.data.error || "알 수 없는 오류"
      );
      // 에러 메시지를 반환하거나 null을 반환할 수 있습니다.
      // 여기서는 에러 메시지를 반환하여 Tab1에서 처리하도록 합니다.
      return {
        error: res.data.error || "사용자의 학습 자료 ID를 찾을 수 없습니다.",
      };
    }
  } catch (error) {
    console.error(
      "[API] 최신 material_id 가져오기 API 호출 실패:",
      error.response ? error.response.data : error.message
    );
    // 네트워크 오류 등의 경우 에러 객체 반환
    return { error: error.message || "서버 통신 중 오류가 발생했습니다." };
  }
};

// ✅ 문제 저장 함수 (material_id와 period를 파라미터로 받도록 수정!)
export const saveQuestionToDB = async (
  material_id, // 👈 추가
  question_text,
  choices,
  answer,
  explanation,
  period // 👈 추가
) => {
  const form = new URLSearchParams();
  // 👇 여기! 백엔드 답변 오면 수정할 부분!
  form.append("material_id", material_id); // 👈 파라미터로 받은 ID 사용
  form.append("question_text", question_text);
  form.append("choice1", choices[0] || "");
  form.append("choice2", choices[1] || "");
  form.append("choice3", choices[2] || "");
  form.append("choice4", choices[3] || "");
  form.append("answer", answer); // ❗ 임시 정답
  form.append("explanation", explanation); // ❗ 임시 해설
  form.append("period", period); // 👈 파라미터로 받은 시대 정보 추가

  console.log("🔍 전송되는 form 데이터:", form.toString()); // 보내는 데이터 확인(콘솔 로그)

  try {
    // ❗ try...catch 추가
    const res = await api.post("/save-question", form);
    console.log("✅ 문제 저장 API 응답:", res.data); // 성공 응답 로그
    // 백엔드 응답에서 question_id가 있는지 확인 후 반환
    if (
      res.data &&
      res.data.status === "question saved" &&
      res.data.question_id
    ) {
      return res.data.question_id; // 성공 시 question_id 반환
    } else {
      console.error("문제 저장 API 응답 오류:", res.data);
      return null; // 실패 시 null 반환
    }
  } catch (error) {
    // ❗ 에러 발생 시 로그 남기고 null 반환
    console.error(
      "❌ 문제 저장 API 호출 실패:",
      error.response ? error.response.data : error.message
    );
    return null; // 실패 시 null 반환
  }
};

// ✅ 오답 저장 함수 (정답 아닐 때만 호출됨)
export const saveWrongAnswer = async (question_id, user_choice) => {
  try {
    // try 추가
    const form = new URLSearchParams();
    form.append("user_id", 1); // 현재는 고정
    form.append("question_id", question_id);
    form.append("user_choice", user_choice);

    console.log("오답 저장 API 요청 데이터:", form.toString()); // 요청 데이터 확인

    const res = await api.post("/save_wrong_answer", form);
    console.log("오답 저장 API 응답:", res.data); // 응답 확인
    return res.data;
  } catch (error) {
    // catch 추가
    console.error(
      "오답 저장 API 호출 실패:",
      error.response ? error.response.data : error.message
    ); // 에러 상세 로깅
    // 필요하다면 여기서 사용자에게 에러 알림을 띄울 수도 있습니다.
    throw error; // 에러를 다시 던져서 호출한 쪽에서도 알 수 있게 함
  }
};
