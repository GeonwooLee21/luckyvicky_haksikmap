// =================================
// FE1 & FE2 공통 상세페이지 레이아웃
// src/Components/CafeteriaPage.jsx
// =================================
import styled from "styled-components";
import { Link, useParams, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import CrowdChart from "./CrowdChart";
import { isOpenNow } from "./OpeningHours";
import LastWeekText from "./lastWeekText";
import LuckyVickyModal from "./LuckyVickyModal";
import { getRestaurantStatus } from "../Api";

// FE 라우트 name → 백엔드 restaurantId 매핑
const RESTAURANT_IDS = {
  Gongstaurant: 1,
  Cheomseong: 2,
  Gamggoteria: 3,
};

// 혼잡도 숫자 → 혼잡도 라벨
// (백엔드에서 주는 값 범위에 맞게 기준은 팀에서 조정 가능)
function congestionValueToLabel(value) {
  if (value == null) return null;

  // -1 등 집계 전 값이 오면 null 처리
  if (value < 0) return null;

  if (value >= 70) return "혼잡";
  if (value >= 40) return "보통";
  return "여유"; // 0~39
}

// 혼잡도 라벨 → 자연스러운 문장
function labelToSentence(label) {
  if (!label) return null;

  switch (label) {
    case "혼잡":
      return "혼잡해요";
    case "보통":
      return "보통이에요";
    case "여유":
      return "여유로워요";
    default:
      return `${label}이에요`; // fallback
  }
}

function CafeteriaPage() {
  const { name } = useParams();
  const location = useLocation();

  const voted = location.state?.fromVote === true;

  const info = {
    Gongstaurant: {
      title: "공식당",
      message: "20분 정도 기다리셔야 해요 ㅠㅠ",
    },
    Cheomseong: {
      title: "복지관",
      message: "지금은 평균 정도로 붐벼요!",
    },
    Gamggoteria: {
      title: "감꽃식당",
      message: "럭키비키! 바로 먹을 수 있어요 🎉",
    },
  };

  const current = info[name] || info.Gongstaurant;

  // 현재 시간 기준 오픈 여부
  const open = isOpenNow(name);

  // 백엔드 혼잡도 상태
  const [isLoading, setIsLoading] = useState(true);
  const [congestionLabel, setCongestionLabel] = useState(null);

  // 럭키비키 모달 on/off
  const [showLuckyModal, setShowLuckyModal] = useState(false);

  const restaurantId = RESTAURANT_IDS[name] ?? RESTAURANT_IDS.Gongstaurant;

  // 상세 페이지 진입 / 식당 변경 시: 상태 초기화
  useEffect(() => {
    setShowLuckyModal(false);
    setCongestionLabel(null);
    setIsLoading(true);
  }, [restaurantId]);

  // 마운트될 때 / name(restaurantId) 바뀔 때마다 혼잡도 불러오기
  useEffect(() => {
    let cancelled = false; // 언마운트 후 setState 방지용

    async function fetchStatus() {
      try {
        const res = await getRestaurantStatus(restaurantId);

        // 백엔드 응답 필드명에 맞게 수정 (currentCongestion)
        // const rawValue = Number(res.currentCongestion); // 30 이런 값
        
        const rawValue = res?.congestionValue;
        const label = congestionValueToLabel(rawValue);
        if (cancelled) return;

        setCongestionLabel(label);

        // 응답까지 받은 뒤, 여유 상태 + 오픈 중이면 모달 오픈
        // (원하면 voted도 조건에 추가 가능: open && label === "여유" && voted)
        if (open && label === "여유") {
          setShowLuckyModal(true);
        }
      } catch (err) {
        console.error("식당 혼잡도 불러오기 실패:", err);
        if (!cancelled) {
          setCongestionLabel(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchStatus();

    return () => {
      cancelled = true;
    };
  }, [restaurantId, open]);

  return (
    <Wrapper>
      {/* 식당 이름 */}
      <Card>{current.title}</Card>

      {/* 안내 멘트: 오픈 여부 + 혼잡도 로딩 상태에 따라 변경 */}
      <MainTextCard>
        {!open
          ? `${current.title}은 지금 오픈 준비 중이에요.`
          : isLoading
          ? `${current.title}은 혼잡도 집계 중이에요`
          : congestionLabel
          ? `${current.title}은 ${labelToSentence(congestionLabel)}`
          : `${current.title}은 혼잡도 집계 중이에요`}
      </MainTextCard>

      {/* 오픈 중일 때만 그래프 카드 보이기 */}
      {open ? (
        <ChartCard>
          {voted ? (
            <>
              {/* 2번 기능: 그래프 */}
              <CrowdChart data={[]} />

              {/* 3번 기능: "일주일 전 이 시간대에는 OOO했어요" */}
              <LastWeekText cafeteria={name} />
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
        // 오픈 전에는 그래프 대신 불투명 안내 박스
        <ClosedOverlayCard>
          운영 시간이 되면
          <br />
          혼잡도 그래프와 투표 기능이 열려요!
        </ClosedOverlayCard>
      )}

      <ButtonRow>
        {/* 항상 보이는 버튼 */}
        <StyledLink to="/">첫 화면으로 돌아가기</StyledLink>

        {/* 오픈 시간에만 보이는 버튼 */}
        {open && (
          <StyledButton as={Link} to={`/vote/${name}`}>
            투표하기
          </StyledButton>
        )}
      </ButtonRow>

      {/* 여유일 때만 띄우는 럭키비키 모달 */}
      <LuckyVickyModal
        open={showLuckyModal}
        onClose={() => setShowLuckyModal(false)}
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

const ChartCard = styled(Card)`
  height: 200px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.muted};

  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1.6;
`;

// 닫힘 안내용 불투명 박스
const ClosedOverlayCard = styled(ChartCard)`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 12px;
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
