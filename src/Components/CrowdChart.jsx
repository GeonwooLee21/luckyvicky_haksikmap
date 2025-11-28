// FE2 - 3개 식당 더미데이터 공통 사용
// 30분 단위 { time: "HH:MM", visitors: N } → 1시간 단위 막대 그래프 (디자인 강화 버전)

import React from "react";

const TARGET_HOURS = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];

// "10:30" → 10
function parseHour(item) {
  if (item.time) return Number(item.time.split(":")[0]);
  if (item.hour) return Number(item.hour);
  return null;
}

// visitors, crowd, value, count 중 하나를 y값으로 사용
function extractValue(item) {
  return (
    item.visitors ??
    item.crowd ??
    item.value ??
    item.count ??
    0
  );
}

// x축 라벨 (10, 12, 14 … 그대로 숫자만)
function formatHourLabel(h) {
  return `${h}`;
}

export default function CrowdChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: "center", opacity: 0.7 }}>
        데이터 없음
      </div>
    );
  }

  // 1) 30분 단위 → 1시간 단위 평균값 (운영 안 하는 시간도 0으로 채움)
  const hourly = TARGET_HOURS.map((hour) => {
    const itemsOfHour = data.filter((item) => parseHour(item) === hour);

    if (itemsOfHour.length === 0) {
      return { hour, value: 0 };
    }

    const avg =
      itemsOfHour.reduce((sum, item) => sum + extractValue(item), 0) /
      itemsOfHour.length;

    return { hour, value: avg };
  });

  // 최고 혼잡 시간 찾기 (하이라이트용)
  let maxValue = Math.max(...hourly.map((d) => d.value));
  if (!isFinite(maxValue) || maxValue < 0) maxValue = 0;
  const busiestHour =
    maxValue > 0
      ? hourly.reduce(
          (acc, cur) => (cur.value > acc.value ? cur : acc),
          hourly[0]
        ).hour
      : null;

  const BAR_AREA_HEIGHT = 120; // 막대 영역 높이(px)

  return (
    <div
      style={{
        width: "100%",
        padding: "12px 14px 10px",
        background: "#f6f7fb",
        borderRadius: "16px",
        boxSizing: "border-box",
      }}
    >
      {/* 상단 작은 제목 영역 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
          fontSize: 11,
          color: "#555",
        }}
      >
        <span>시간대별 혼잡도</span>
        <span
          style={{
            fontSize: 10,
            padding: "2px 6px",
            borderRadius: 999,
            background: "white",
            border: "1px solid rgba(0,0,0,0.05)",
          }}
        >
          오늘
        </span>
      </div>

      {/* 막대 + 바닥 라인 */}
      <div
        style={{
          position: "relative",
          padding: "6px 2px 0",
        }}
      >
        {/* 바닥 라인 */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 1,
            background:
              "linear-gradient(to right, rgba(0,0,0,0.04), rgba(0,0,0,0.08), rgba(0,0,0,0.04))",
          }}
        />

        {/* 막대 영역 */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            height: BAR_AREA_HEIGHT,
            gap: 4,
          }}
        >
          {hourly.map((d) => {
            const raw =
              maxValue > 0 ? d.value / maxValue : 0; // 0~1
            const safeRaw = !isFinite(raw) || raw < 0 ? 0 : raw;
            const barHeight = 10 + safeRaw * (BAR_AREA_HEIGHT - 14);

            const isPeak = busiestHour !== null && d.hour === busiestHour;

            // 🔹 혼잡도 단계별 색상
            let barColor;
            let barShadow = "0 2px 6px rgba(0,0,0,0.06)";

            if (safeRaw === 0) {
              // 0명: 거의 안 보이는 정도로만 (운영 안 하거나 완전 한산)
              barColor = "#e4e6f2";
              barShadow = "none";
            } else if (safeRaw < 0.33) {
              // 사람 적음
              barColor = "#ffc8ec";
            } else if (safeRaw < 0.66) {
              // 보통
              barColor = "#ff8ad6";
            } else {
              // 많음
              barColor = "#ff2fa3";
            }

            // 🔹 제일 붐빌 때는 같은 계열이지만 조금 더 강조
            if (isPeak && safeRaw > 0) {
              barShadow = "0 4px 12px rgba(255, 47, 163, 0.45)";
            }

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
                    width: isPeak ? 12 : 10,
                    height: barHeight,
                    background: barColor,
                    borderRadius: 999,
                    boxShadow: barShadow,
                    transition: "height 0.25s ease-out, background 0.2s",
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* x축 시간 라벨 */}
      <div
        style={{
          marginTop: 6,
          display: "flex",
          justifyContent: "space-between",
          fontSize: 9,
          color: "#777",
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
