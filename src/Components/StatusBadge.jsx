// ================================
// FE1
// src/Components/StatusBadge.jsx
// ================================

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { getAllRestaurantStatus } from "../Api";

// 혼잡도 숫자 → 혼잡도 구간
function congestionToLevel(value) {
  if (value === undefined || value === null) return null;
  if (value < 0) return "none";      // 집계 안 됨 (-1 같은 경우)
  if (value >= 70) return "busy";    // 70 이상: 혼잡
  if (value >= 40) return "normal";  // 40~69: 보통
  return "relaxed";                  // 0~39: 여유
}

// 영어 키 → 한글 라벨
const LABEL_MAP = {
  busy: "혼잡🥵",
  normal: "보통😐",
  relaxed: "여유🥳",
  none: "집계 전",
};

function StatusBadge({ restaurantId }) {
  const [level, setLevel] = useState(null);      // busy / normal / relaxed / none
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!restaurantId) return;

    let cancelled = false;

    async function fetchStatus() {
      try {
        setLoading(true);
        setError(false);

        const list = await getAllRestaurantStatus();

        // list에서 내 식당 찾아오기
        const found = list.find((item) => item.id === restaurantId);

        if (!cancelled) {
          const level = congestionToLevel(found?.currentCongestion);
          setLevel(level);
        }
      } catch (e) {
        console.error("StatusBadge error:", e);
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchStatus();

    return () => {
      cancelled = true;
    };
  }, [restaurantId]);

  // 로딩/에러 표시
  if (loading) return <Badge level={null}>불러오는 중...</Badge>;
  if (error) return <Badge level={null}>연결 오류</Badge>;
  if (!level) return <Badge level={null}>정보 없음</Badge>;

  const label = LABEL_MAP[level] || "정보 없음";

  return <Badge level={level}>{label}</Badge>;
}

export default StatusBadge;

/* ---------------- styled-components ---------------- */
const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 600;

  background-color: ${({ level }) => {
    if (level === "busy") return "rgba(255, 99, 132, 0.12)";
    if (level === "normal") return "rgba(255, 206, 86, 0.14)";
    if (level === "relaxed") return "rgba(75, 192, 192, 0.16)";
    return "rgba(0, 0, 0, 0.04)";
  }};

  color: ${({ level }) => {
    if (level === "busy") return "#e03131";
    if (level === "normal") return "#f08c00";
    if (level === "relaxed") return "#2b8a3e";
    return "#666";
  }};
`;