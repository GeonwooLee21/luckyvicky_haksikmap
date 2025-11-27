// FE2 - 모든 식당 더미데이터 호환 + 30분 → 1시간 변환 (안전 버전)

import React from "react";

const TARGET_HOURS = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];

// "10:30" → 10
function parseHour(item) {
  if (item.time) return Number(item.time.split(":")[0]);
  if (item.hour) return Number(item.hour);
  return null;
}

// visitors, crowd, value, count 중 아무거나 값으로 사용
function extractValue(item) {
  return (
    item.visitors ??
    item.crowd ??
    item.value ??
    item.count ??
    0
  );
}

function formatHourLabel(h) {
  return `${h}`;
}

export default function CrowdChart({ data }) {
  if (!data || data.length === 0)
    return <div style={{ padding: 40, textAlign: "center" }}>데이터 없음</div>;

  // 🔥 1) 30분 단위 → 1시간 단위 평균값 생성
  const hourly = TARGET_HOURS.map((hour) => {
    const itemsOfHour = data.filter((item) => parseHour(item) === hour);

    const avg =
      itemsOfHour.length === 0
        ? 0
        : itemsOfHour.reduce((sum, item) => sum + extractValue(item), 0) /
          itemsOfHour.length;

    return { hour, value: avg };
  });

  console.log("🔥 hourly data:", hourly); // 디버깅 로그

  const maxValue = Math.max(...hourly.map((d) => d.value)) || 1;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        padding: "20px",
        background: "#f6f7fb",
        borderRadius: "14px",
        boxSizing: "border-box",
      }}
    >
      {/* 막대 그래프 */}
      <div
        style={{
          display: "flex",
          height: "70%",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: "2px",
        }}
      >
        {hourly.map((d) => {
          // 🔥 sqrt scaling (안전 처리 포함)
          const raw = d.value / maxValue; // 0 ~ 1
          const ratio = raw <= 0 ? 0 : Math.sqrt(raw); // 음수/NaN 방지
          const barHeight = `${Math.max(ratio * 100, 8)}%`; // 최소 8% 확보

          return (
            <div
              key={d.hour}
              style={{
                flex: 1,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 10,
                  height: barHeight, // 🔥 변경된 부분
                  background: "#ff66cc",
                  borderRadius: "999px",
                  transition: "height 0.3s",
                }}
              ></div>
            </div>
          );
        })}
      </div>

      {/* 시간 라벨 */}
      <div
        style={{
          marginTop: 8,
          display: "flex",
          justifyContent: "space-between",
          fontSize: 9,
          color: "#555",
        }}
      >
        {hourly.map((d, idx) => (
          <div key={d.hour} style={{ flex: 1, textAlign: "center" }}>
            {idx % 2 === 0 ? formatHourLabel(d.hour) : ""}
          </div>
        ))}
      </div>
    </div>
  );
}
