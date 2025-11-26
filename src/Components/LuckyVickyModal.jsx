//FE 2
//src/Components/LuckyVickyModal.jsx

import React from "react";
import "./LuckyVickyModal.css";

export default function LuckyVickyModal({ open, onClose }) {
  if (!open) return null;

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
        </div>
        <div className="lucky-confetti right">
          <span>🎉</span>
          <span>✨</span>
          <span>🎊</span>
        </div>

        {/* 가운데 텍스트 */}
        <div className="lucky-content">
          <p className="lucky-subtitle">오늘의 럭키 타임</p>
          <h2 className="lucky-title">럭키비키시네요 🎉</h2>
          <p className="lucky-desc">
            지금은 여유로운 시간이에요.
            <br />
            편하게 식사하러 가볼까요?
          </p>

          <button className="lucky-button" onClick={onClose}>
            좋아요!
          </button>
        </div>
      </div>
    </div>
  );
}

