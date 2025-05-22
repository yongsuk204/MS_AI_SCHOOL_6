// src/components/Tab2.jsx
// React 및 필요한 훅(useState, useEffect, useCallback) 임포트
import React, { useState, useEffect, useCallback } from "react";
// HTTP 요청을 위한 axios 라이브러리 임포트
import axios from "axios";
// Tab2 컴포넌트 스타일 시트 임포트
import "../styles/Tab2_style.css";
// 헤더 컴포넌트 임포트
import Header from "./Header.jsx";
// 헤더 컴포넌트 스타일 시트 임포트
import "../styles/Header.css";
// react-icons에서 휴지통 아이콘 임포트 (선택 사항, 필요 시 주석 해제)
// import { FaTrashAlt } from 'react-icons/fa';

// --- 설정 상수 객체 ---
const CONFIG = {
  // 🚨🚨🚨 중요: API 키와 엔드포인트는 클라이언트 코드에 직접 노출하면 안 됩니다! 🚨🚨🚨
  // 실제 애플리케이션에서는 백엔드를 통해 API를 호출하거나,
  // 최소한 환경 변수(.env 파일)를 사용하여 관리해야 합니다.
  // 예시: process.env.REACT_APP_VISION_API_KEY
  API_KEYS: {
    // Azure OpenAI Vision API 키 (보안상 환경 변수 사용 권장)
    VISION: "",
    // Azure OpenAI RAG API 키 (보안상 환경 변수 사용 권장)
    RAG: "",
    // Azure Speech Service API 키 (보안상 환경 변수 사용 권장)
    SPEECH: "",
  },
  API_ENDPOINTS: {
    // Azure OpenAI Vision API 엔드포인트
    VISION: "",
    // Azure OpenAI RAG API 엔드포인트
    RAG: "",
    // Azure Speech Service TTS API 엔드포인트 (리전 포함)
    SPEECH_TTS: `https://eastus2.tts.speech.microsoft.com/cognitiveservices/v1`,
  },
  // 백엔드 서버 주소 (FastAPI) - 마지막 '/' 제거 권장
  BACKEND_URL:
    "https://korean-history-api-g7auebfdhhd6fpb5.koreacentral-01.azurewebsites.net",
  // Azure Speech Service 리전
  SPEECH_REGION: "eastus2",
  // 옵션 설정 값들
  OPTIONS: {
    // 재생 속도 옵션 (SSML prosody rate 값)
    SPEED: {
      "1배속": "0%",
      "1.5배속": "50%",
      "2배속": "100%",
    },
    // 음성 종류 옵션 (Azure Speech voice name)
    VOICE: {
      "👩‍🦰 여자1": "ko-KR-SunHiNeural",
      "👩 여자2": "ko-KR-SoonBokNeural",
      "👨 남자1": "ko-KR-InJoonNeural",
      "👨‍🦱 남자2": "ko-KR-HyunsuMultilingualNeural",
    },
    // 요약 길이 옵션 (목표 글자 수, 토큰 수)
    SUMMARY_LENGTH: {
      "1분 요약": { targetChars: 300, targetTokens: 500 },
      "3분 요약": { targetChars: 800, targetTokens: 1000 },
      "5분 요약": { targetChars: 2100, targetTokens: 2500 },
    },
  },
  // 기본 선택 옵션 값
  DEFAULT_OPTIONS: {
    SPEED: "1배속",
    VOICE: "👨‍🦱 남자2",
    LENGTH: "1분 요약",
  },
};

// --- API 호출 함수들 (별도 파일로 분리 고려: src/api/azure.js 등) ---

/** 👁️ GPT Vision OCR 호출 함수 */
async function getVisionOcr(base64Image) {
  // API 키 유효성 검사 (환경 변수 사용 권장)
  if (
    !CONFIG.API_KEYS.VISION ||
    CONFIG.API_KEYS.VISION === "YOUR_VISION_API_KEY"
  ) {
    throw new Error("Vision API 키가 설정되지 않았습니다.");
  }
  // 요청 헤더 설정 (Content-Type, API 키)
  const headers = {
    "Content-Type": "application/json",
    "api-key": CONFIG.API_KEYS.VISION,
  };
  // OpenAI API에 보낼 메시지 형식 구성
  const messages = [
    {
      role: "system", // 시스템 역할 설정 (AI의 역할 정의)
      content:
        "너는 한국사 필기 내용을 분석하고 설명하는 AI야. 이미지의 텍스트를 추출하고, 관련 역사적 배경, 인물, 사건 등을 보충하여 한국사능력검정시험 수험생에게 도움이 되도록 설명해줘.",
    },
    {
      role: "user", // 사용자 요청 역할
      content: [
        {
          type: "image_url", // 이미지 데이터 포함 명시
          image_url: { url: `data:image/jpeg;base64,${base64Image}` }, // Base64 인코딩된 이미지 데이터 전달
        },
        {
          type: "text", // 텍스트 요청 내용
          text: "이미지의 텍스트를 바탕으로 전체 맥락을 풍부하게 설명해주세요.",
        },
      ],
    },
  ];
  // API 요청 본문(payload) 구성 (메시지, 온도, 토큰 제한 등)
  const payload = { messages, temperature: 0.2, top_p: 0.95, max_tokens: 4096 };

  try {
    // axios를 사용하여 Vision API에 POST 요청 전송
    const response = await axios.post(CONFIG.API_ENDPOINTS.VISION, payload, {
      headers,
    });
    // 응답 데이터에서 실제 텍스트 결과 추출
    if (response.data.choices?.[0]?.message?.content) {
      return response.data.choices[0].message.content; // 성공 시 텍스트 반환
    } else {
      // 응답 형식이 예상과 다를 경우 에러 로깅 및 예외 발생
      console.error("Vision API 응답 상세:", response.data);
      throw new Error("Vision API 응답 형식이 올바르지 않습니다.");
    }
  } catch (error) {
    // API 호출 중 에러 발생 시 로깅 및 예외 발생
    console.error(
      "Vision API 호출 실패:",
      error.response?.data || error.message
    );
    throw new Error("이미지 분석 중 오류가 발생했습니다.");
  }
}

/** 💡 RAG 기반 GPT 요약 호출 함수 */
async function getRagAnswer(inputText, summaryOptions) {
  // API 키 유효성 검사 (환경 변수 사용 권장)
  if (!CONFIG.API_KEYS.RAG || CONFIG.API_KEYS.RAG === "YOUR_RAG_API_KEY") {
    throw new Error("RAG API 키가 설정되지 않았습니다.");
  }
  // 요청 헤더 설정
  const headers = {
    "Content-Type": "application/json",
    "api-key": CONFIG.API_KEYS.RAG,
  };
  // OpenAI API 메시지 형식 구성 (요약 지시 포함)
  const messages = [
    {
      role: "system",
      content: `당신은 한국사 전문가입니다. 주어진 지문을 ${summaryOptions.targetChars}자 내외로 요약하고, 역사적 배경과 키워드를 설명하세요. 줄글 형식으로 서술하십시오.`,
    },
    {
      role: "user",
      content: `다음 지문을 요약해주세요:\n"""\n${inputText}\n"""`, // 입력 텍스트 전달
    },
  ];
  // API 요청 본문 구성 (메시지, 온도, 토큰 제한 등)
  const payload = {
    messages,
    temperature: 0.2,
    top_p: 0.9,
    max_tokens: summaryOptions.targetTokens,
    frequency_penalty: 0.25,
  };

  try {
    // axios를 사용하여 RAG API에 POST 요청 전송
    const response = await axios.post(CONFIG.API_ENDPOINTS.RAG, payload, {
      headers,
    });
    // 응답 데이터에서 실제 요약 결과 추출
    if (response.data.choices?.[0]?.message?.content) {
      return response.data.choices[0].message.content; // 성공 시 텍스트 반환
    } else {
      // 응답 형식이 예상과 다를 경우 에러 로깅 및 예외 발생
      console.error("RAG API 응답 상세:", response.data);
      throw new Error("RAG API 응답 형식이 올바르지 않습니다.");
    }
  } catch (error) {
    // API 호출 중 에러 발생 시 로깅 및 예외 발생
    console.error("RAG API 호출 실패:", error.response?.data || error.message);
    throw new Error("텍스트 요약 중 오류가 발생했습니다.");
  }
}

/** 🧹 TTS용 특수문자 정리 */
function cleanSpecialCharacters(text) {
  if (!text) return "";
  // eslint-disable-next-line no-control-regex
  let cleaned = text.replace(/[^\u0000-\uFFFF]/g, ""); // BMP 외 문자 제거

  // SSML에서 문제를 일으킬 수 있는 특정 특수문자 제거
  cleaned = cleaned.replace(/[*#\\/]/g, "");

  // 여러 개의 공백이나 개행 문자를 하나의 공백으로 바꾸고 앞뒤 공백 제거
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  // 정리된 텍스트 반환
  return cleaned;
}

/** 🗣️ Azure Speech Service TTS 호출 */
async function speakTextRest(text, speed, voiceName) {
  // 🚨 보안: API 키 노출 위험! 백엔드 프록시 사용 권장
  if (
    !CONFIG.API_KEYS.SPEECH ||
    CONFIG.API_KEYS.SPEECH === "YOUR_SPEECH_API_KEY"
  ) {
    throw new Error("Speech API 키가 설정되지 않았습니다.");
  }
  const cleanedText = cleanSpecialCharacters(text);
  if (!cleanedText) {
    throw new Error("음성으로 변환할 텍스트가 없습니다.");
  }
  const ssml = `
    <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="ko-KR">
      <voice name="${voiceName}">
        <prosody rate="${speed}">${cleanedText}</prosody>
      </voice>
    </speak>
  `;

  try {
    const response = await axios.post(CONFIG.API_ENDPOINTS.SPEECH_TTS, ssml, {
      headers: {
        "Ocp-Apim-Subscription-Key": CONFIG.API_KEYS.SPEECH,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": "audio-16khz-128kbitrate-mono-mp3",
        "User-Agent": "k-history-app", // 앱 식별자
      },
      responseType: "arraybuffer", // 오디오 데이터를 ArrayBuffer로 받음
    });
    return response.data; // ArrayBuffer 반환
  } catch (error) {
    console.error(
      "Speech Synthesis Error:",
      error.response?.data
        ? new TextDecoder().decode(error.response.data)
        : error.message // 에러 응답 디코딩 시도
    );
    throw new Error("음성 생성 중 오류가 발생했습니다.");
  }
}

/**
 * 생성된 오디오 데이터를 백엔드에 업로드하고 실제 URL을 받아오는 함수
 * @param {ArrayBuffer} audioData - TTS로부터 받은 오디오 데이터
 * @param {string} originalFileName - 오디오 파일명 생성에 사용할 원본 파일 이름 (예: 이미지 파일명)
 * @returns {Promise<string>} - 백엔드에서 생성된 실제 오디오 URL
 */
async function uploadAudioAndGetUrl(audioData, originalFileName) {
  const UPLOAD_AUDIO_URL = `${CONFIG.BACKEND_URL}/upload-tts-audio`;

  const formData = new FormData();
  const audioBlob = new Blob([audioData], { type: "audio/mpeg" });
  // 백엔드에서 타임스탬프를 붙이므로, 여기서는 구별 가능한 이름 전달
  const suggestedFileName = originalFileName
    ? `tts_${originalFileName}.mp3`
    : "tts_output.mp3";
  formData.append("file", audioBlob, suggestedFileName);

  try {
    console.log("🔊 오디오 업로드 시도:", suggestedFileName);
    const response = await axios.post(UPLOAD_AUDIO_URL, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (
      response.data &&
      response.data.status === "success" &&
      response.data.audio_url
    ) {
      console.log("✅ 오디오 업로드 성공, URL:", response.data.audio_url);
      return response.data.audio_url; // 백엔드가 반환한 실제 URL
    } else {
      console.error("오디오 업로드 응답 상세:", response.data);
      throw new Error("오디오 업로드 응답 형식이 올바르지 않습니다.");
    }
  } catch (error) {
    console.error(
      "❗ 오디오 업로드 실패:",
      error.response ? error.response.data : error.message
    );
    throw new Error("오디오 파일을 서버에 업로드하는 중 오류가 발생했습니다.");
  }
}

// --- React 컴포넌트 ---
function Tab2({ handleTabChange }) {
  // --- 상태 관리 ---
  const [imageFile, setImageFile] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [selectedSpeed, setSelectedSpeed] = useState(
    CONFIG.DEFAULT_OPTIONS.SPEED
  );
  const [selectedLength, setSelectedLength] = useState(
    CONFIG.DEFAULT_OPTIONS.LENGTH
  );
  const [selectedVoice, setSelectedVoice] = useState(
    CONFIG.DEFAULT_OPTIONS.VOICE
  );
  const [visionOutput, setVisionOutput] = useState("");
  const [ragOutput, setRagOutput] = useState("");
  const [audioUrl, setAudioUrl] = useState(null); // 현재 재생 중인 오디오 URL (Blob 또는 실제 URL)
  const [isLoading, setIsLoading] = useState(false); // '요약 시작' 버튼 로딩 상태
  const [error, setError] = useState(null);
  const [analysisResults, setAnalysisResults] = useState([]); // 학습 기록 목록 상태
  const [historyLoading, setHistoryLoading] = useState(false); // 학습 기록 로딩 상태
  const userId = 1; // user_id는 항상 1로 고정
  // --- 누락된 상태 변수 추가 ---
  const [customTitle, setCustomTitle] = useState(""); // 사용자 입력 제목 상태 추가
  // --------------------------

  // 학습 기록 불러오는 함수
  const fetchAnalysisResults = useCallback(async () => {
    if (!userId) return;

    setHistoryLoading(true); // 학습 기록 로딩 시작
    try {
      const response = await axios.get(
        `${CONFIG.BACKEND_URL}/get-note-analysis`,
        {
          params: { user_id: userId, limit: 10 }, // 예시: 최근 10개
        }
      );
      if (response.data && Array.isArray(response.data.analysis_results)) {
        setAnalysisResults(response.data.analysis_results);
      } else {
        console.warn(
          "학습 기록 API 응답 형식이 예상과 다릅니다:",
          response.data
        );
        setAnalysisResults([]);
      }
    } catch (err) {
      console.error("학습 기록 불러오기 실패:", err);
      setError("학습 기록을 불러오는 중 오류가 발생했습니다."); // 에러 상태 설정
      setAnalysisResults([]);
    } finally {
      setHistoryLoading(false); // 학습 기록 로딩 완료
    }
  }, [userId]); // userId가 변경될 때만 함수 재생성

  // 컴포넌트 마운트 시 및 저장/삭제 후 학습 기록 불러오기
  useEffect(() => {
    fetchAnalysisResults();
  }, [fetchAnalysisResults]); // fetchAnalysisResults 함수가 변경될 때 (즉, userId 변경 시) 실행

  // 삭제 처리 함수
  const handleDelete = useCallback(
    async (materialIdToDelete) => {
      if (
        !window.confirm(
          "정말로 이 학습 기록을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        )
      ) {
        return;
      }

      console.log(`삭제 시도: material_id=${materialIdToDelete}`);
      try {
        const response = await axios.delete(
          `${CONFIG.BACKEND_URL}/delete-note-analysis/${materialIdToDelete}`
        );

        console.log("삭제 API 응답:", response.data);

        if (response.data && response.data.status === "success") {
          // 상태 업데이트: 삭제된 항목을 제외하고 새 배열 생성
          setAnalysisResults((prevResults) =>
            prevResults.filter(
              (result) => result.material_id !== materialIdToDelete
            )
          );
          alert("학습 기록이 성공적으로 삭제되었습니다.");
          // 만약 삭제된 오디오가 현재 재생 중이었다면 오디오 플레이어 초기화
          if (
            audioUrl &&
            analysisResults.find((r) => r.material_id === materialIdToDelete)
              ?.tts_audio_url === audioUrl
          ) {
            setAudioUrl(null);
          }
        } else {
          const errorMessage =
            response.data?.detail || "삭제 중 알 수 없는 오류가 발생했습니다.";
          console.error("학습 기록 삭제 실패 (API 오류):", errorMessage);
          alert(`삭제 실패: ${errorMessage}`);
        }
      } catch (err) {
        console.error("학습 기록 삭제 실패 (네트워크/요청 오류):", err);
        alert(
          "삭제 요청 중 오류가 발생했습니다. 네트워크 연결을 확인하거나 잠시 후 다시 시도해주세요."
        );
      }
    },
    [audioUrl, analysisResults] // audioUrl, analysisResults 상태를 참조하므로 의존성 배열에 추가
  );

  // --- 이벤트 핸들러 ---

  /** 이미지 파일 선택 시 */
  const handleImageChange = useCallback(
    (event) => {
      const file = event.target.files?.[0];

      // 이전 리소스 정리
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
      if (audioUrl && audioUrl.startsWith("blob:")) {
        URL.revokeObjectURL(audioUrl);
      }
      setImagePreviewUrl(null);
      setAudioUrl(null); // 오디오 URL 초기화
      setImageBase64(null);
      setImageFile(null);
      setError(null);
      setVisionOutput("");
      setRagOutput("");
      setCustomTitle(""); // 이미지 변경 시 제목 초기화

      if (file) {
        setImageFile(file);
        const newPreviewUrl = URL.createObjectURL(file);
        setImagePreviewUrl(newPreviewUrl);

        // 파일 이름에서 확장자 제거하여 기본 제목으로 설정 (선택 사항)
        const defaultTitle = file.name.replace(/\.[^/.]+$/, "");
        setCustomTitle(defaultTitle);

        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result?.split(",")[1];
          if (base64String) {
            setImageBase64(base64String);
          } else {
            setError("이미지를 Base64로 인코딩하는 데 실패했습니다.");
            setImageFile(null);
            URL.revokeObjectURL(newPreviewUrl);
            setImagePreviewUrl(null);
            setCustomTitle("");
          }
        };
        reader.onerror = (err) => {
          console.error("FileReader 오류:", err);
          setError("이미지 파일을 읽는 중 오류가 발생했습니다.");
          setImageFile(null);
          URL.revokeObjectURL(newPreviewUrl);
          setImagePreviewUrl(null);
          setCustomTitle("");
        };
        reader.readAsDataURL(file);
      }
    },
    [imagePreviewUrl, audioUrl]
  );

  /**
   * 분석 결과를 백엔드에 저장하는 함수 (FormData 사용 버전)
   * @param {object} analysisData - 저장할 분석 데이터 (ocr_text, summary 등 포함)
   */
  const saveAnalysisResult = useCallback(
    async (analysisData) => {
      console.log(
        "saveAnalysisResult 함수 시작 (FormData), 전달받은 데이터:",
        analysisData
      );

      const SAVE_API_URL = `${CONFIG.BACKEND_URL}/save-note-analysis-complete`;

      // imageFile 상태가 유효한지 확인 (원본 파일명 fallback을 위해 필요)
      if (!imageFile || !imageFile.name) {
        console.error("❗ 저장 시 imageFile 또는 imageFile.name이 없습니다.");
        setError("이미지 파일 정보가 없어 저장할 수 없습니다.");
        return;
      }

      // 사용자 입력 제목이 비어있지 않으면 사용, 비어있으면 원본 파일명 사용
      const fileNameToSave = customTitle.trim()
        ? customTitle.trim()
        : imageFile.name;

      const formData = new FormData();

      formData.append("user_id", userId);
      // --- file_name을 사용자 입력 제목으로 변경 ---
      formData.append("file_name", fileNameToSave);
      // ------------------------------------------
      formData.append("image_path", ""); // 백엔드가 필수로 요구하므로 빈 값 추가
      formData.append("ocr_text", analysisData?.ocr_text ?? "");
      formData.append("summary", analysisData?.summary ?? "");
      formData.append("tts_audio_url", analysisData?.tts_audio_url ?? "");
      formData.append(
        "voice_style",
        analysisData?.voice_style ?? CONFIG.DEFAULT_OPTIONS.VOICE
      );
      formData.append(
        "speed",
        analysisData?.speed ?? CONFIG.DEFAULT_OPTIONS.SPEED
      );
      formData.append("duration", analysisData?.duration ?? 0);
      formData.append(
        "length_option",
        analysisData?.length_option ?? CONFIG.DEFAULT_OPTIONS.LENGTH
      );
      // --- 사용자 지정 제목 추가 (DB에 별도 title 컬럼이 있다면 유지) ---
      // 백엔드에서 'title' 필드를 받는다고 가정
      formData.append(
        "title",
        customTitle || imageFile.name.replace(/\.[^/.]+$/, "")
      ); // 제목 없으면 파일명 사용
      // -------------------------------------------------------------

      console.log("💾 분석 결과 저장 시도 (FormData 키):");
      for (let key of formData.keys()) {
        console.log(`  - ${key}: ${formData.get(key)}`); // 값도 함께 로깅 (디버깅용)
      }

      // 필수 값 확인 (file_name은 이제 customTitle 기반이므로 확인)
      if (
        !formData.get("user_id") ||
        !formData.get("file_name") ||
        !formData.get("ocr_text")
      ) {
        console.error("❗ 저장 전 FormData 유효성 검사 실패 (필수 값 누락)");
        setError(
          "저장할 데이터가 완전하지 않습니다. (user_id, file_name, ocr_text 확인 필요)"
        );
        return;
      }

      try {
        const response = await axios.post(SAVE_API_URL, formData);
        console.log("✅ 분석 결과 저장 성공:", response.data);
        fetchAnalysisResults(); // 저장 성공 후 목록 새로고침
        setCustomTitle(""); // 저장 후 제목 입력 필드 초기화
      } catch (error) {
        console.error(
          "❗ 분석 결과 저장 실패:",
          error.response ? error.response.data : error.message
        );
        throw new Error("분석 결과를 저장하는 중 오류가 발생했습니다.");
      }
    },
    // 의존성 배열에 customTitle 유지
    [fetchAnalysisResults, userId, imageFile, customTitle]
  );

  /** '요약 시작' 버튼 클릭 시 */
  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      if (!imageBase64 || !imageFile) {
        setError("먼저 이미지 파일을 업로드해주세요.");
        return;
      }
      // 제목이 비어있는지 확인 (선택 사항: 필수로 만들고 싶다면)
      // if (!customTitle.trim()) {
      //   setError("요약 노트의 제목을 입력해주세요.");
      //   return;
      // }

      setIsLoading(true);
      setError(null);
      setVisionOutput("이미지 분석 중...");
      setRagOutput("");
      if (audioUrl && audioUrl.startsWith("blob:")) {
        URL.revokeObjectURL(audioUrl);
      }
      setAudioUrl(null);

      let generatedAudioData = null;
      let visionResultText = "";
      let ragResultText = "";
      let realAudioUrl = "";

      try {
        // 1. Vision OCR
        visionResultText = await getVisionOcr(imageBase64);
        setVisionOutput(visionResultText);
        setRagOutput("텍스트 요약 및 음성 생성 중...");

        // 2. RAG 요약
        const summaryOptions = CONFIG.OPTIONS.SUMMARY_LENGTH[selectedLength];
        ragResultText = await getRagAnswer(visionResultText, summaryOptions);
        setRagOutput(ragResultText);

        // 3. TTS
        const speedValue = CONFIG.OPTIONS.SPEED[selectedSpeed];
        const voiceValue = CONFIG.OPTIONS.VOICE[selectedVoice];
        const audioData = await speakTextRest(
          ragResultText,
          speedValue,
          voiceValue
        );
        generatedAudioData = audioData;

        // 4. 오디오 업로드 및 URL 받기
        realAudioUrl = await uploadAudioAndGetUrl(audioData, imageFile.name);

        // 5. 오디오 길이 계산 (간단 추정)
        const estimatedDuration = generatedAudioData
          ? Math.ceil(generatedAudioData.byteLength / (16000 * 2))
          : 0;

        // 6. 저장을 위한 데이터 준비 (user_id, file_name, title은 saveAnalysisResult에서 처리)
        const analysisDataToSave = {
          ocr_text: visionResultText,
          summary: ragResultText,
          tts_audio_url: realAudioUrl,
          voice_style: selectedVoice,
          speed: selectedSpeed,
          duration: estimatedDuration,
          length_option: selectedLength,
          // title: customTitle // saveAnalysisResult에서 처리하므로 여기서 제외 가능
        };

        console.log(
          "💾 저장 전 데이터 확인 (analysisDataToSave):",
          analysisDataToSave
        );

        // 7. 분석 결과 저장 함수 호출
        await saveAnalysisResult(analysisDataToSave);

        // 8. UI 재생용 Blob URL 설정
        if (generatedAudioData) {
          const audioBlob = new Blob([generatedAudioData], {
            type: "audio/mpeg",
          });
          const blobUrlForPlayback = URL.createObjectURL(audioBlob);
          setAudioUrl(blobUrlForPlayback);
        }
      } catch (err) {
        console.error("요약/음성 생성 또는 저장 파이프라인 오류:", err);
        setError(err.message || "처리 중 오류가 발생했습니다.");
        if (visionOutput === "이미지 분석 중...") setVisionOutput("");
        if (ragOutput.includes("생성 중...")) setRagOutput("");
        setAudioUrl(null);
      } finally {
        setIsLoading(false);
      }
    },
    [
      // Dependencies for handleSubmit
      imageBase64,
      imageFile,
      selectedLength,
      selectedSpeed,
      selectedVoice,
      audioUrl,
      visionOutput,
      ragOutput,
      // customTitle, // Removed to fix ESLint warning (dependency covered by saveAnalysisResult)
      saveAnalysisResult, // This already depends on customTitle
    ]
  );

  // --- 효과 훅 ---
  useEffect(() => {
    return () => {
      if (audioUrl && audioUrl.startsWith("blob:")) {
        URL.revokeObjectURL(audioUrl);
      }
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [audioUrl, imagePreviewUrl]);

  // --- JSX 렌더링 ---
  return (
    <div className="phone-frame">
      <Header activeTab="summary" onTabChange={handleTabChange} />
      <main className="main-content tab2-container">
        {/* --- 상단 배너 --- */}
        <section className="section-banner">
          <h2 className="title">요약 노트</h2>
          <p className="description">이미지를 AI요약하고 음성출력합니다. </p>
        </section>{" "}
        {/* --- 폼 --- */}
        <form onSubmit={handleSubmit} className="tab2-form">
          <div className="tab2-content-wrapper">
            {/* --- 입력 영역 --- */}
            <div className="input-column">
              <h4 className="column-title">이미지 업로드</h4>

              {/* 이미지 업로드 컨트롤 */}
              <div className="upload-section">
                <label htmlFor="imageUpload" className="upload-box">
                  <svg
                    className="upload-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    width="36"
                    height="36"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 16V4m0 0L8 8m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
                    />
                  </svg>
                  <div className="upload-text">
                    이미지 파일을 업로드하세요
                    <br />
                    <span className="upload-hint">(.jpg, .png 등)</span>
                  </div>
                </label>
                <input
                  type="file"
                  id="imageUpload"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={isLoading}
                  style={{ display: "none" }}
                />
                {imagePreviewUrl && (
                  <div className="image-preview-container">
                    <p>미리보기:</p>
                    <img
                      src={imagePreviewUrl}
                      alt="선택된 이미지 미리보기"
                      className="image-preview"
                    />
                  </div>
                )}
              </div>

              {/* 요약 스타일 선택 */}
              <div className="style-section">
                {/* --- 제목 입력 필드 추가 --- */}
                <div className="title-input-section">
                  <label htmlFor="customTitleInput" className="section-label">
                    요약 노트 제목 (선택)
                  </label>
                  <input
                    type="text"
                    id="customTitleInput"
                    className="title-input" // 스타일링을 위한 클래스
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="제목을 입력하세요 (없으면 파일명 사용)"
                    disabled={isLoading || !imageFile} // 이미지 없을 때 비활성화
                    maxLength={100} // 최대 길이 제한 (선택 사항)
                  />
                </div>
                {/* -------------------------- */}

                <label className="section-label">
                  요약 스타일을 선택해주세요
                </label>
                <div className="style-select-row">
                  {/* 음성 선택 */}
                  <select
                    className="select-box"
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                    disabled={isLoading}
                  >
                    {Object.keys(CONFIG.OPTIONS.VOICE).map((voiceKey) => (
                      <option key={voiceKey} value={voiceKey}>
                        {voiceKey}
                      </option>
                    ))}
                  </select>
                  {/* 속도 선택 */}
                  <select
                    className="select-box"
                    value={selectedSpeed}
                    onChange={(e) => setSelectedSpeed(e.target.value)}
                    disabled={isLoading}
                  >
                    {Object.keys(CONFIG.OPTIONS.SPEED).map((speedKey) => (
                      <option key={speedKey} value={speedKey}>
                        {speedKey}
                      </option>
                    ))}
                  </select>
                  {/* 길이 선택 */}
                  <select
                    className="select-box"
                    value={selectedLength}
                    onChange={(e) => setSelectedLength(e.target.value)}
                    disabled={isLoading}
                  >
                    {Object.keys(CONFIG.OPTIONS.SUMMARY_LENGTH).map(
                      (lengthKey) => (
                        <option key={lengthKey} value={lengthKey}>
                          {lengthKey}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* 제출 버튼 */}
                <button
                  type="submit"
                  className={`summation-button ${
                    imageFile ? "image-loaded" : ""
                  }`}
                  disabled={isLoading || !imageFile}
                >
                  {isLoading ? "처리 중..." : "요약 시작"}
                </button>
              </div>

              {/* 오류 메시지 */}
              {error && <p className="error-message">오류: {error}</p>}
            </div>

            {/* --- 출력 영역 --- */}
            <div className="output-column">
              <h4 className="column-title2">AI요약</h4>
              {/* RAG 결과 */}
              <div>
                <label htmlFor="ragOutput"> </label>
                <textarea
                  id="ragOutput"
                  value={ragOutput}
                  readOnly
                  rows={12}
                  placeholder="요약 결과가 여기에 표시됩니다..."
                />
              </div>
            </div>
          </div>
        </form>
        {/* --- 최근 학습 기록 --- */}
        <section className="history-section">
          <h4 className="column-title3">최근 학습 기록</h4>
          <div className="history-audio-list">
            {historyLoading ? (
              <p>최근 학습 기록을 불러오는 중...</p>
            ) : analysisResults && analysisResults.length > 0 ? (
              analysisResults.map((item) => (
                <div className="audio-card" key={item.material_id}>
                  <div className="summary-snippet">
                    {/* --- 표시 방식 변경 --- */}
                    {/* 백엔드에서 title 필드를 반환한다고 가정 */}
                    {item.title || // 1. 사용자 지정 제목
                      item.file_name || // 2. 파일 이름 (사용자 입력값 또는 원본 파일명)
                      item.summary?.slice(0, 40) || // 3. 요약 미리보기
                      "제목 없음"}{" "}
                    {/* 4. 기본값 */}
                    <br />
                    <small>
                      {item.uploaded_at
                        ? new Date(item.uploaded_at).toLocaleString()
                        : ""}
                    </small>
                  </div>
                  <div className="audio-card-buttons">
                    {" "}
                    {/* 버튼 그룹 */}
                    <button
                      className="play-button"
                      onClick={() => {
                        // Blob URL 해제 로직 추가
                        if (audioUrl && audioUrl.startsWith("blob:")) {
                          URL.revokeObjectURL(audioUrl);
                        }
                        setAudioUrl(item.tts_audio_url); // 실제 저장된 URL 설정
                      }}
                      disabled={isLoading || !item.tts_audio_url} // 처리 중 또는 오디오 URL 없을 시 비활성화
                      title="재생"
                    >
                      ▶
                    </button>
                    {/* 삭제 버튼 추가 */}
                    <button
                      className="delete-button" // CSS 스타일링을 위한 클래스 추가
                      onClick={() => handleDelete(item.material_id)} // handleDelete 호출
                      disabled={isLoading} // 처리 중 비활성화
                      title="삭제"
                    >
                      {/* 👇 버튼 내용을 '×' 문자로 변경 */}×
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="empty-history">최근 학습 기록이 없습니다.</p>
            )}
          </div>
        </section>
        {/* --- 하단 고정 오디오 플레이어 --- */}
        <div className="sticky-audio-player bottom-player">
          {audioUrl ? (
            <audio
              controls
              autoPlay
              src={audioUrl}
              key={audioUrl} /* key 추가로 src 변경 시 재렌더링 유도 */
            >
              현재 브라우저는 audio 요소를 지원하지 않습니다.
            </audio>
          ) : (
            <p className="audio-placeholder">
              {isLoading ? "생성 중..." : "요약된 음성을 재생합니다"}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

export default Tab2;
