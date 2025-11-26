// FE1 & FE2 공통 상세페이지 레이아웃
// src/Components/CafeteriaPage.jsx
import styled from "styled-components";
import { Link, useParams, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";         // ✅ 추가
import CrowdChart from "./CrowdChart";
import { isOpenNow } from "./OpeningHours";
import LastWeekText from "./lastWeekText";
import LuckyVickyModal from "./LuckyVickyModal";    // ✅ 추가
import { getRestaurantStatus } from "../Api";       // ✅ 추가

// ✅ FE 라우트 name → 백엔드 restaurantId 매핑
const RESTAURANT_IDS = {
  Gongstaurant: 1,
  Cheomseong: 2,
  Gamggoteria: 3,
};

// ✅ 혼잡도 숫자 → 한글 라벨
// (백엔드에서 주는 값 범위에 맞게 기준은 팀에서 조정 가능)
function congestionValueToLabel(value) {
  if (value == null) return null;

  if (value < 0) return null;      // 집계 전 같은 경우
  if (value >= 70) return "혼잡";
  if (value >= 40) return "보통";
  return "여유";                   // 0~39
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

  // ✅ 현재 시간 기준 오픈 여부
  const open = isOpenNow(name);

  // ✅ 백엔드 혼잡도 상태
  const [isLoading, setIsLoading] = useState(false);
  const [congestionLabel, setCongestionLabel] = useState(null);

  // ✅ 럭키비키 모달 on/off
  const [showLuckyModal, setShowLuckyModal] = useState(false);

  const restaurantId = RESTAURANT_IDS[name] ?? RESTAURANT_IDS.Gongstaurant;

  // ✅ 마운트될 때 / name 바뀔 때마다 혼잡도 불러오기
  useEffect(() => {
    async function fetchStatus() {
      setIsLoading(true);
      try {
        const res = await getRestaurantStatus(restaurantId);

        // ⚠️ 여기서 필드명은 백엔드 응답에 맞게 수정!
        // 예: res.congestion, res.crowding, res.score 등
        const rawValue = res.congestion; // <- 이 부분만 실제에 맞게 바꾸면 됨

        const label = congestionValueToLabel(rawValue);
        setCongestionLabel(label);
      } catch (err) {
        console.error("식당 혼잡도 불러오기 실패:", err);
        setCongestionLabel(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStatus();
  }, [restaurantId]);

  // ✅ 혼잡도가 '여유'일 때만 럭키비키 모달 자동 오픈
  useEffect(() => {
    // 오픈중이면서, 로딩이 끝났고, 혼잡도 라벨이 '여유'일 때
    if (open && !isLoading && congestionLabel === "여유") {
      setShowLuckyModal(true);
    }
  }, [open, isLoading, congestionLabel]);

  return (
    <Wrapper>
      {/* 식당 이름 */}
      <Card>{current.title}</Card>

      {/* 안내 멘트: 오픈 여부에 따라 변경 */}
      <Card>
        {open
          ? current.message
          : `${current.title}은 지금 오픈 준비 중이에요.`}
      </Card>

      {/* 오픈 중일 때만 그래프 카드 보이기 */}
      {open ? (
        <ChartCard>
          {voted ? (
            <>
              {/* 2번 기능: 그래프 */}
              <CrowdChart data={[]} />

              {/* ⭐ 3번 기능: 일주일 전 이 시간대에는 OOO했어요 */}
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

      {/* ✅ 여유일 때만 띄우는 럭키비키 모달 */}
      <LuckyVickyModal
        open={showLuckyModal}                  // 모달 열림 여부
        onClose={() => setShowLuckyModal(false)} // 닫기 콜백
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
