// FE2
// 첨성 페이지
// src/Pages/Cafeteria/Cheomseong.jsx

import React, { useEffect, useState, useCallback } from "react";
import StatusBadge from "../../Components/StatusBadge";
import CrowdChart from "../../Components/CrowdChart";
import VoteButtons from "../../Components/VoteButtons";
import LuckyVickyModal from "../../Components/LuckyVickyModal";
import { getCafeteriaStatus, getCafeteriaHistory, postVote } from "../../Api";

const CAFETERIA_ID = "cheomseong"; // 백엔드에서 쓸 첨성관 id 로 바꾸기

function levelToKorean(level) {
  if (level === "busy") return "혼잡";
  if (level === "normal") return "보통";
  if (level === "relaxed") return "여유";
  return "정보 없음";
}

// history 데이터에서 문장 만드는 함수
function getLastWeekSentence(history) {
  if (!history || history.length === 0) return "";

  const last = history[history.length - 1];

  const timeLabel = last.time || "해당 시간";
  const levelLabel = levelToKorean(last.level);

  return `일주일 전 ${timeLabel}에는 첨성관이 ${levelLabel}했어요.`;
}

export default function Cheomseong() {
  const [status, setStatus] = useState("normal"); // busy / normal / relaxed
  const [history, setHistory] = useState([]);     // 그래프용 데이터
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showLucky, setShowLucky] = useState(false);      // 럭키 모달 표시 여부
  const [luckyShownOnce, setLuckyShownOnce] = useState(false); // 한 번만 띄우기

  // 페이지 진입 시 현재 상태 + 지난주 데이터 불러오기
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const [statusRes, historyRes] = await Promise.all([
          getCafeteriaStatus(CAFETERIA_ID),
          getCafeteriaHistory(CAFETERIA_ID),
        ]);

        if (cancelled) return;

        setStatus(statusRes?.status || "normal");
        setHistory(historyRes?.history || historyRes || []);
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setError("데이터를 불러오는 중 오류가 발생했어요.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  // 현재 혼잡도가 "여유"일 때, 페이지에서 한 번만 럭키 모달 자동 표시
  useEffect(() => {
    if (status === "relaxed" && !luckyShownOnce) {
      setShowLucky(true);
      setLuckyShownOnce(true);
    }
  }, [status, luckyShownOnce]);

  // 투표 버튼 눌렀을 때 호출되는 함수
  const handleVote = useCallback(
    async (level) => {
      try {
        await postVote(CAFETERIA_ID, level);

        if (level === "relaxed" && !luckyShownOnce) {
          setShowLucky(true);
          setLuckyShownOnce(true);
        }
      } catch (err) {
        console.error(err);
        alert("투표에 실패했어요. 잠시 후 다시 시도해 주세요.");
      }
    },
    [luckyShownOnce]
  );

  const sentence = getLastWeekSentence(history);

  return (
    <div className="cafeteria-detail">
      <h1>첨성관</h1>

      {error && (
        <p style={{ color: "red", marginTop: "8px" }}>
          {error}
        </p>
      )}

      {/* 현재 혼잡도 뱃지 */}
      <div style={{ margin: "12px 0" }}>
        <StatusBadge status={status} />
      </div>

      {/* 지난주 동일 시간대 그래프 */}
      <section style={{ marginTop: "16px" }}>
        <h2 style={{ fontSize: "1.1rem", marginBottom: "8px" }}>
          지난주 같은 시간대 혼잡도
        </h2>
        <CrowdChart data={history} loading={isLoading} />

        {sentence && (
          <p style={{ marginTop: "8px", fontSize: "0.95rem" }}>
            {sentence}
          </p>
        )}
      </section>

      {/* 투표 영역 */}
      <section style={{ marginTop: "24px" }}>
        <h2 style={{ fontSize: "1.1rem", marginBottom: "8px" }}>
          지금 첨성관은 어떤가요?
        </h2>
        <VoteButtons onVote={handleVote} />
      </section>

      {/* 여유일 때 띄우는 럭키비키 모달 */}
      <LuckyVickyModal
        open={showLucky}
        onClose={() => setShowLucky(false)}
      />
    </div>
  );
}
