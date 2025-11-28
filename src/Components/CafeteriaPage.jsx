// =================================
// FE1 & FE2 공통 상세페이지 레이아웃
// src/Components/CafeteriaPage.jsx
// =================================

import styled from "styled-components";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import CrowdChart from "./CrowdChart";
import { isOpenNow, getNextOpeningInfo } from "./OpeningHours";
import LuckyVickyModal from "./LuckyVickyModal";
import { getRestaurantStatus, getRemainingVotes } from "../Api";
import { GONGSTAURANT_DUMMY } from "../Dummy/Gongstaurant_Dummy";
import { GAMGGOTERIA_DUMMY } from "../Dummy/Gamggoteria_Dummy";
import { CHEOMSEONG_DUMMY } from "../Dummy/Cheomseong_Dummy";
import WaitTimeText from "./WaitTimeText";

// FE 라우트 name → 백엔드 restaurantId 매핑
const RESTAURANT_IDS = {
  Gongstaurant: 1,
  Cheomseong: 2,
  Gamggoteria: 3,
};

// 혼잡도 숫자 → 혼잡도 라벨
function congestionValueToLabel(value) {
  if (value == null) return null;
  if (value < 0) return null;
  if (value >= 70) return "혼잡";
  if (value >= 40) return "보통";
  return "여유"; // 0~39
}

// 혼잡도 라벨 → 모달용 level 키
function labelToLevel(label) {
  switch (label) {
    case "혼잡":
      return "busy";
    case "보통":
      return "normal";
    case "여유":
      return "relaxed";
    default:
      return null;
  }
}

// 혼잡도 라벨 → 자연스러운 문장
function labelToSentence(label) {
  if (!label) return null;
  switch (label) {
    case "혼잡":
      return "혼잡해요 🥵";
    case "보통":
      return "보통이에요 🙂";
    case "여유":
      return "여유로워요 🥳";
    default:
      return `${label}이에요`;
  }
}

function CafeteriaPage() {
  const { name } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const fromVote = location.state?.fromVote === true;

  const [isNoVoteModalOpen, setIsNoVoteModalOpen] = useState(false);

  const info = {
    Gongstaurant: { title: "공식당" },
    Cheomseong: { title: "복지관" },
    Gamggoteria: { title: "감꽃식당" },
  };

  const current = info[name] || info.Gongstaurant;

  // 식당별 더미 그래프 데이터 매핑
  const chartDataMap = {
    Gongstaurant: GONGSTAURANT_DUMMY,
    Gamggoteria: GAMGGOTERIA_DUMMY,
    Cheomseong: CHEOMSEONG_DUMMY,
  };
  const chartData = chartDataMap[name] || GONGSTAURANT_DUMMY;

  // 현재 시간 기준 오픈 여부
  const open = isOpenNow(name);
  // 비운영 시간일 때만 사용: 다음 운영 정보
  const nextOpeningInfo = !open ? getNextOpeningInfo(name) : null;

  // 오늘 아무 식당에서나 투표한 적 있는지
  const [hasTodayVote, setHasTodayVote] = useState(false);

  // 백엔드 혼잡도 상태
  const [isLoading, setIsLoading] = useState(true);
  const [congestionLabel, setCongestionLabel] = useState(null);

  // 럭키비키 모달 on/off
  const [showLuckyModal, setShowLuckyModal] = useState(false);

  const restaurantId = RESTAURANT_IDS[name] ?? RESTAURANT_IDS.Gongstaurant;

  // 오늘 이미 아무 식당에서나 투표했는지 확인
  useEffect(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    const todayStr = `${y}-${m}-${d}`;

    const stored = localStorage.getItem("voted_date");

    if (location.state?.fromVote === true) {
      localStorage.setItem("voted_date", todayStr);
      setHasTodayVote(true);
    } else {
      setHasTodayVote(stored === todayStr);
    }
  }, [location.state]);

  // 상세 페이지 진입 / 식당 변경 시: 상태 초기화
  useEffect(() => {
    setShowLuckyModal(false);
    setCongestionLabel(null);
    setIsLoading(true);
  }, [restaurantId]);

  // 마운트될 때 / name(restaurantId) 바뀔 때마다 혼잡도 불러오기
  useEffect(() => {
    let cancelled = false;

    async function fetchStatus() {
      try {
        const res = await getRestaurantStatus(restaurantId);
        const rawValue = res?.congestionValue;
        const label = congestionValueToLabel(rawValue);
        if (cancelled) return;

        setCongestionLabel(label);

        if (open && label && !fromVote) {
          setShowLuckyModal(true);
        }
      } catch (err) {
        console.error("식당 혼잡도 불러오기 실패:", err);
        if (!cancelled) setCongestionLabel(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchStatus();
    return () => {
      cancelled = true;
    };
  }, [restaurantId, open]);

  // 투표하기 버튼 눌렀을 때: 잔여 투표 수 확인 후 이동/모달
  const handleClickVote = async () => {
    try {
      const res = await getRemainingVotes(name);
      console.log("잔여 투표 응답:", res);

      const remaining = res.remainingVoteCount;
      console.log("파싱한 remaining 값:", remaining);

      if (remaining <= 0) {
        setIsNoVoteModalOpen(true);
      } else {
        navigate(`/vote/${name}`);
      }
    } catch (err) {
      console.error("잔여 투표 수 확인 실패:", err);
      navigate(`/vote/${name}`);
    }
  };

  return (
    <Wrapper>
      {/* 식당 이름 */}
      <Card>{current.title}</Card>

      {/* 상태 + (비운영 시) 운영시간 안내까지 한 카드에 병합 */}
      <MainTextCard>
        {open ? (
          // 🔓 운영 중
          isLoading ? (
            `${current.title}은 혼잡도 집계 중이에요`
          ) : congestionLabel ? (
            `${current.title}은 ${labelToSentence(congestionLabel)}`
          ) : (
            `${current.title}은 혼잡도 집계 중이에요`
          )
        ) : nextOpeningInfo ? (
          // 🔒 비운영 + 다음 운영 정보 있음
          <>
            {nextOpeningInfo.type === "today"
              ? `${current.title}은 지금 오픈 준비 중이에요.`
              : "오늘 운영은 모두 종료됐어요."}
            <SubText>
              {nextOpeningInfo.type === "today" && (
                <>
                  {`다음 ${nextOpeningInfo.label ?? "운영"}까지 ${
                    nextOpeningInfo.diffText
                  } 남았어요.`}
                  <br />
                </>
              )}
              {`다음 ${nextOpeningInfo.label ?? "운영"} 시간: ${
                nextOpeningInfo.open
              } ~ ${nextOpeningInfo.close}`}
            </SubText>
          </>
        ) : (
          // 🔒 비운영 + 시간 정보 없음 (fallback)
          `${current.title}은 지금 오픈 준비 중이에요.`
        )}
      </MainTextCard>

      {/* 오픈 중일 때만 그래프 카드 보이기 */}
      {open ? (
        <ChartCard>
          {hasTodayVote ? (
            <>
              <WaitTimeText restaurantId={restaurantId} />
              <CrowdChart data={chartData} />
            </>
          ) : (
            <>
              투표해주시면
              <br />
              시간대별 혼잡도 그래프를
              <br />
              확인하실 수 있어요!
            </>
          )}
        </ChartCard>
      ) : (
        <ClosedOverlayCard>
          운영 시간이 되면
          <br />
          혼잡도 그래프와 투표 기능이 열려요!
        </ClosedOverlayCard>
      )}

      <ButtonRow>
        <StyledLink to="/">첫 화면으로 돌아가기</StyledLink>

        {open && (
          <StyledButton type="button" onClick={handleClickVote}>
            투표하기
          </StyledButton>
        )}
      </ButtonRow>

      <LuckyVickyModal
        open={showLuckyModal}
        onClose={() => setShowLuckyModal(false)}
        level={labelToLevel(congestionLabel)}
      />

      <LuckyVickyModal
        open={isNoVoteModalOpen}
        onClose={() => setIsNoVoteModalOpen(false)}
        message="오늘의 투표 횟수를 모두 소진했어요😅"
      />
    </Wrapper>
  );
}

export default CafeteriaPage;

/* ---------------- styled-components ---------------- */
const Wrapper = styled.div`
  width: 100%;
  max-width: 350px;
  margin: 0 auto;
  margin-top: 24px;

  /* 아래쪽에 여유 + iOS safe-area까지 고려 */
  padding-bottom: calc(env(safe-area-inset-bottom) + 24px);

  display: flex;
  flex-direction: column;
  gap: 20px;
  text-align: center;
`;

const Card = styled.div`
  padding: 16px 20px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.cardBg};
  font-size: 15px;
  font-weight: 600;
`;

// 메인 텍스트 카드 (멘트용)
const MainTextCard = styled(Card)`
  font-weight: 500;
`;

// MainTextCard 안에서 쓰는 서브 문구 (운영시간 안내)
const SubText = styled.span`
  display: block;
  margin-top: 6px;
  font-size: 13px;
  font-weight: 400;
  color: ${({ theme }) => theme.colors.muted};
  line-height: 1.6;
`;

const ChartCard = styled(Card)`
  height: 280px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.muted};

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  line-height: 1.6;
`;

const ClosedOverlayCard = styled(ChartCard)`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 12px;

  /* 버튼 아래 부분 공간 확보 */
  margin-bottom: calc(env(safe-area-inset-bottom) + 15px);
`;

const StyledLink = styled(Link)`
  flex: 1;
  padding: 12px 0;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: white;
  text-decoration: none;
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;
  text-align: center;
  cursor: pointer;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.05);
  }
`;

const StyledButton = styled.button`
  flex: 1;
  padding: 12px 0;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: white;
  font-size: 14px;
  cursor: pointer;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.05);
  }
`;
