// FE2
// 그래프 생성

import React from "react";

export default function CrowdChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ padding: "40px 0", textAlign: "center", opacity: 0.7 }}>
        데이터를 불러오는 중입니다...
      </div>
    );
  }

  return (
    <div style={{ background: "white", padding: "20px", borderRadius: "10px" }}>
      <img
        src="/img/google_graph_example.png"
        alt="crowd graph"
        style={{ width: "100%", borderRadius: "8px" }}
      />
    </div>
  );
}
