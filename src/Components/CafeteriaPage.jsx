// FE1 & FE2 공통 상세페이지 레이아웃
// src/Components/CafeteriaPage.jsx
import styled from "styled-components";
import { Link, useParams, useLocation } from "react-router-dom";
import CrowdChart from "./CrowdChart";
import { isOpenNow } from "./OpeningHours";

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
            <CrowdChart data={[]} />
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
