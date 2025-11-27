// src/Components/WaitTimeText.jsx
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { getWaitTime } from "../Api";

const Wrapper = styled.div`
  width: 100%;
  text-align: center;
  font-size: 16px;
  margin-bottom: 12px;
`;

function buildMessage(data) {
  if (!data) return "대기시간 정보를 불러오지 못했어요 😢";

  // 백엔드 응답: { restaurantId: 1, waitTimeMin: 0 } 형태
  const waitTime = data.waitTimeMin;

  // ① 집계 중 (-1)
  if (waitTime === -1) {
    return "대기시간 정보 집계중이에요… ⏳";
  }

  // ② 숫자 대기시간이 제대로 온 경우
  if (typeof waitTime === "number") {
    if (waitTime <= 0) {
      return "지금 바로 입장할 수 있을 것 같아요! 🎉";
    }
    return `지금 들어가면 약 ${waitTime}분 정도 걸릴 것 같아요. ⏳`;
  }

  // ③ 그 외 애매한 경우
  return "대기시간 정보를 불러오지 못했어요 😢";
}

function WaitTimeText({ restaurantId }) {
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!restaurantId) return;

    let cancelled = false;
    setLoading(true);

    getWaitTime(restaurantId)
      .then((data) => {
        if (cancelled) return;
        setMsg(buildMessage(data));
      })
      .catch((err) => {
        console.error("wait-time 불러오기 실패:", err);
        if (cancelled) return;
        setMsg("대기시간 정보를 불러오지 못했어요 😢");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [restaurantId]);

  if (loading) {
    return <Wrapper>대기시간 정보를 불러오는 중이에요…</Wrapper>;
  }

  if (!msg) return null;

  return <Wrapper>{msg}</Wrapper>;
}

export default WaitTimeText;
