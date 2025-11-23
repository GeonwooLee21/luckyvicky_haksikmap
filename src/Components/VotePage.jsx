// FE2
// 투표 페이지

import React, { useState } from "react";

// 혼잡도 → 한글 라벨
const LEVEL_LABELS = {
  busy: "혼잡",
  normal: "보통",
  relaxed: "여유",
};

// 혼잡도 → 대기시간 옵션 2개
const WAIT_OPTIONS = {
  relaxed: ["바로 입장", "5분"],
  normal: ["10분", "15분"],
  busy: ["20분", "20분 이상"],
};

export default function VoteButtons({ onSubmit }) {
  const [selectedLevel, setSelectedLevel] = useState(null);     // busy / normal / relaxed
  const [selectedWait, setSelectedWait] = useState(null);       // "바로 입장" 같은 문자열

  const handleLevelClick = (level) => {
    setSelectedLevel(level);
    setSelectedWait(null); // 혼잡도 다시 고르면 대기시간 초기화
  };

  const handleWaitClick = (wait) => {
    setSelectedWait(wait);
  };

  const handleSubmit = () => {
    if (!selectedLevel || !selectedWait) return;

    // 부모에서 onSubmit을 넘겨줬다면 호출
    if (typeof onSubmit === "function") {
      onSubmit(selectedLevel, selectedWait);
    } else {
      console.log("선택 결과:", selectedLevel, selectedWait);
    }
  };

  return (
    <div className="vote-container">
      {/* 1단계: 혼잡도 선택 */}
      <div className="vote-level-row">
        {["busy", "normal", "relaxed"].map((level) => (
          <button
            key={level}
            type="button"
            className={`vote-level-button ${
              selectedLevel === level ? "selected" : ""
            }`}
            onClick={() => handleLevelClick(level)}
          >
            {/* 위쪽 라벨 (혼잡 / 보통 / 여유) */}
            <div className="vote-level-label">{LEVEL_LABELS[level]}</div>

            {/* 아래 사각형 영역 (선택되면 V + 회색 배경) */}
            <div
              className="vote-level-box"
              style={{
                marginTop: "8px",
                width: "90px",
                height: "90px",
                border: "2px solid #00263b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor:
                  selectedLevel === level ? "#d9d9d9" : "transparent",
                fontSize: "1.5rem",
              }}
            >
              {selectedLevel === level ? "V" : ""}
            </div>
          </button>
        ))}
      </div>

      {/* 2단계: 대기시간 선택 (혼잡도 선택 후에만 보이기) */}
      {selectedLevel && (
        <>
          <div
            className="wait-title"
            style={{
              marginTop: "16px",
              padding: "8px 0",
              border: "2px solid #00263b",
              textAlign: "center",
              fontWeight: "600",
            }}
          >
            대기시간선택
          </div>

          <div className="wait-options" style={{ marginTop: "8px" }}>
            {WAIT_OPTIONS[selectedLevel].map((opt) => (
              <button
                key={opt}
                type="button"
                className={`wait-option-button ${
                  selectedWait === opt ? "selected" : ""
                }`}
                onClick={() => handleWaitClick(opt)}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "10px 0",
                  marginTop: "8px",
                  border: "2px solid #00263b",
                  backgroundColor:
                    selectedWait === opt ? "#d9d9d9" : "transparent",
                  fontSize: "1rem",
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        </>
      )}

      {/* 3단계: 투표하기 버튼 (혼잡도 + 대기시간 둘 다 선택된 경우에만 생성) */}
      {selectedLevel && selectedWait && (
        <button
          type="button"
          className="vote-submit-button"
          onClick={handleSubmit}
          style={{
            marginTop: "16px",
            width: "100%",
            padding: "10px 0",
            border: "2px solid #00263b",
            backgroundColor: "white",
            color: "red",
            fontWeight: "700",
            fontSize: "1.1rem",
          }}
        >
          투표하기
        </button>
      )}
    </div>
  );
}
