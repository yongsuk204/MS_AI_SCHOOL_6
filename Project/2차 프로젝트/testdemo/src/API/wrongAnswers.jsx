// src/api/fetchWrongAnswers.js <- 파일 경로 확인하기
import { api } from "./api";

export const fetchWrongAnswers = async (userId = 1) => {
  try {
    // try: 이 안의 코드를 시도해봐!
    console.log(`[API] 오답 목록 요청 시작: userId=${userId}`); // 요청 시작 로그

    // 👇 백엔드 API 주소('/get-wrong-answers')와 파라미터({ user_id: userId })가 맞는지
    //    백엔드 팀에 다시 한번 확인하는 것이 좋습니다!
    const res = await api.get("/get-wrong-answers", {
      params: { user_id: userId },
    });

    // 👇 서버로부터 받은 응답 전체를 콘솔에 찍어봅니다. (매우 중요!)
    //    데이터가 res.data 안에 있는지, res.data.wrong_answers 안에 있는지 확인해야 해요.
    console.log("[API] 오답 목록 응답 받음:", res);

    // 👇 서버 응답 구조 확인 후 데이터 반환
    //    만약 콘솔에 찍힌 res.data 안에 바로 배열 [ ... ] 이 있다면,
    //    return res.data; 로 바꿔야 할 수도 있어요.
    //    만약 res.data가 { "data": [...] } 형태라면,
    //    return res.data.data; 로 바꿔야 할 수도 있어요.
    //    현재 코드는 res.data가 { "wrong_answers": [...] } 형태라고 가정하고 있어요.
    //    콘솔 로그를 보고 이 부분을 정확하게 맞춰주세요!
    if (res && res.data && Array.isArray(res.data.wrong_answers)) {
      console.log(
        "[API] 실제 반환될 오답 목록 데이터:",
        res.data.wrong_answers
      );
      return res.data.wrong_answers;
    } else {
      // 예상과 다른 구조로 응답이 왔을 경우
      console.warn(
        "[API] 예상과 다른 응답 구조입니다. 백엔드 응답을 확인해주세요:",
        res.data
      );
      // 빈 배열을 반환하여 Tab3에서 오류가 나지 않도록 함
      return [];
    }
  } catch (error) {
    // catch: 만약 try 안에서 에러가 나면, 여기를 실행해!
    console.error(
      // 콘솔에 에러 메시지 출력
      "[API] 오답 목록 가져오기 실패:",
      error.response ? error.response.data : error.message // 에러 상세 내용 보여주기
    );
    // 에러 발생 시 빈 배열을 반환하여 Tab3.jsx에서 에러 처리를 용이하게 함
    return [];
    // 또는 에러를 다시 던져서 Tab3.jsx의 catch 블록에서 처리하게 할 수도 있음
    // throw error;
  }
};
