// ==================================
// FE 2
// src/Components/LuckyVickyModal.jsx
// ==================================
import React from "react";
import "./LuckyVickyModal.css";

export default function LuckyVickyModal({ open, onClose, level, message }) {
  if (!open) return null;

  // 혼잡도 level에 따른 멘트 분기
  // level: "busy" | "normal" | "relaxed" (없으면 기본 멘트)
  const getDescByLevel = (level) => {
    switch (level) {
      case "busy":
        return (
          <>
            지금은 꽤 붐비는 시간이에요.
            <br />
            그래도 학식 먹는 당신, 이미 럭키비키 ✨
          </>
        );
      case "normal":
        return (
          <>
            지금은 적당히 붐비는 시간이에요.
            <br />
            조금만 기다리면 맛있게 드실 수 있어요!
          </>
        );
      case "relaxed":
        return (
          <>
            지금은 여유로운 시간이에요!
            <br />
            편하게 식사하러 가볼까요?
          </>
        );
      default:
        return (
          <>
            지금도 학식 먹기 나쁘지 않은 시간이네요.
            <br />
            오늘도 럭키비키 하세요 😊
          </>
        );
    }
  };

  return (
    <div className="lucky-overlay" onClick={onClose}>
      <div
        className="lucky-modal"
        onClick={(e) => e.stopPropagation()} // 안쪽 클릭해도 닫히지 않게
      >
        {/* 양쪽 폭죽/이모지 */}
        <div className="lucky-confetti left">
          <span>🎉</span>
          <span>✨</span>
          <span>🎊</span>
          <span>🍀</span>
        </div>
        <div className="lucky-confetti right">
          <span>🎉</span>
          <span>✨</span>
          <span>🎊</span>
          <span>🍀</span>
        </div>

        {/* 가운데 텍스트 */}
        <div className="lucky-content">
          {!message && (
            <>
            <p className="lucky-subtitle">오늘의 럭키 타임</p>
            <h2 className="lucky-title">럭키비키시네요 🎉</h2>
            </>
          )
          }

          <p className="lucky-desc">
            {message ? message : getDescByLevel(level)}
          </p>

          <button className="lucky-button" onClick={onClose}>
            좋아요!
          </button>
        </div>
      </div>
    </div>
  );
}