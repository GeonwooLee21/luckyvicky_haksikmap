// FE2
// 예상 대기시간 멘트 출력 ("n분 정도 기다리셔야 해요")

import React from "react";

export default function PredictedWaitText({ waitMinutes }) {
  if (waitMinutes == null) return null; // 아직 데이터 없으면 표시 안함

  return (
    <p style={{ fontSize: "1.2rem", marginTop: "12px" }}>
      {waitMinutes}분 정도 기다리셔야 해요😅
    </p>
  );
}
