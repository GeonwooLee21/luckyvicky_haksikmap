// ===================================
// FE1
// src/Components/MainPage.jsx
// ===================================

import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { isOpenNow } from "./OpeningHours";
import StatusBadge from "./StatusBadge";

export default function MainPage() {
  const navigate = useNavigate();
  const now = new Date();

  // 리팩토링 완료!
  const cafeterias = [
    { key: "Gongstaurant", name: "공식당", id: 1 },
    { key: "Cheomseong", name: "복지관", id: 2 },
    { key: "Gamggoteria", name: "감꽃식당", id: 3 },
  ];

  return (
    <List>
      {cafeterias.map((cafe) => {
        const open = isOpenNow(cafe.key, now);

        return (
          <Card
            key={cafe.key}
            onClick={() => navigate(`/Cafeteria/${cafe.key}`)}
            $isOpen={open}
          >
            <Name>{cafe.name}</Name>
            <Emoji>{cafe.emoji}</Emoji>

            <StatusContainer>
              <StatusBadge restaurantId={cafe.id} />
            </StatusContainer>

            {!open && (
              <Overlay>{`${cafe.name}은 지금 오픈 준비 중이에요💤`}</Overlay>
            )}
          </Card>
        );
      })}
    </List>
  );
}


/* ---------------- styled-components ---------------- */
const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 24px;
`;

const Card = styled.button`
  width: 100%;
  padding: 16px 130px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.cardBg};

  position: relative;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};    /* 버튼 안 텍스트 색 고정 */

  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease, border-color 0.12s ease;

  /* iOS 기본 버튼 스타일 제거 (system-blue 방지) */
  -webkit-appearance: none;
  appearance: none;
  outline: none;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 18px rgba(0, 0, 0, 0.06);
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const StatusContainer = styled.div`
  position: absolute;
  right: 20px;
  bottom: 14px;
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  border-radius: 12px;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 15px;
  font-weight: 600;
  color: #333;

  pointer-events: none;
`;

const Name = styled.span`
  color: ${({ theme }) => theme.colors.text};   /* 식당 이름 색 한 번 더 명시 */
`;

const Emoji = styled.span`
  position: absolute;
  right: 20px;
  font-size: 22px;
`;
