// src/components/FooterAudioPlayer.jsx
import React from "react";
import PropTypes from "prop-types"; // prop-types import 추가
// import '../styles/Tab2_style.css'; // CSS import 경로는 실제 파일 위치에 맞게 조정해야 합니다.

// --- Icons ---
const PlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em">
    <path d="M8 5v14l11-7z" />
  </svg>
);
const PauseIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </svg>
);
const PrevIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em">
    <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
  </svg>
);
const NextIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em">
    <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
  </svg>
);
const DownloadIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em">
    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
  </svg>
);
// --- End Icons ---

// --- FooterAudioPlayer Component ---
// interface 및 React.FC 제거
const FooterAudioPlayer = ({
  title = "재생 중인 오디오 없음",
  currentTime = 0,
  duration = 0,
  audioSrc,
  isPlaying = false,
  playbackSpeed = 1,
  onPlayPause,
  onPrev,
  onNext,
  onSpeedChange,
  onDownload,
}) => {
  // --- 시간 포맷 함수 (타입 지정 제거) ---
  const formatTime = (timeInSeconds) => {
    if (
      isNaN(timeInSeconds) ||
      timeInSeconds < 0 ||
      timeInSeconds === Infinity
    ) {
      return "00:00";
    }
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  // --- 이벤트 핸들러 (타입 지정 제거) ---
  const handlePlayPause = () => {
    if (onPlayPause) onPlayPause();
  };
  const handlePrev = () => {
    if (onPrev) onPrev();
  };
  const handleNext = () => {
    if (onNext) onNext();
  };
  const handleSpeedChange = (event) => {
    // event 타입 제거
    const speed = parseFloat(event.target.value);
    if (onSpeedChange) onSpeedChange(speed);
  };
  const handleDownload = () => {
    if (onDownload) {
      onDownload(audioSrc);
    }
  };

  // --- Render ---
  return (
    <div className="footer-audio-player">
      {/* 왼쪽: 트랙 정보 */}
      <div className="track-info">
        <div className="track-title" title={title}>
          {title}
        </div>
        <div className="track-time">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>

      {/* 중앙: 컨트롤 버튼 */}
      <div className="controls">
        <button
          className="control-button prev"
          onClick={handlePrev}
          aria-label="이전 트랙"
          disabled={!onPrev}
        >
          <PrevIcon />
        </button>
        <button
          className="control-button play-pause"
          onClick={handlePlayPause}
          aria-label={isPlaying ? "일시정지" : "재생"}
          disabled={!onPlayPause}
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>
        <button
          className="control-button next"
          onClick={handleNext}
          aria-label="다음 트랙"
          disabled={!onNext}
        >
          <NextIcon />
        </button>
      </div>

      {/* 오른쪽: 액션 버튼 */}
      <div className="actions">
        <select
          className="playback-speed"
          value={playbackSpeed}
          onChange={handleSpeedChange}
          aria-label="재생 속도"
          disabled={!onSpeedChange}
        >
          <option value="0.5">0.5x</option>
          <option value="1">1x</option>
          <option value="1.5">1.5x</option>
          <option value="2">2x</option>
        </select>
        <button
          className="download-button"
          onClick={handleDownload}
          aria-label="MP3 저장"
          disabled={!audioSrc || !onDownload}
        >
          <DownloadIcon />
        </button>
      </div>
    </div>
  );
};

// --- PropTypes 정의 추가 ---
FooterAudioPlayer.propTypes = {
  title: PropTypes.string,
  currentTime: PropTypes.number,
  duration: PropTypes.number,
  audioSrc: PropTypes.string,
  isPlaying: PropTypes.bool,
  playbackSpeed: PropTypes.number,
  onPlayPause: PropTypes.func,
  onPrev: PropTypes.func,
  onNext: PropTypes.func,
  onSpeedChange: PropTypes.func,
  onDownload: PropTypes.func,
};

export default FooterAudioPlayer;
