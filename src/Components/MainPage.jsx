// FE1
// src/Components/MainPage.jsx
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { isOpenNow } from "./OpeningHours";

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
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease, border-color 0.12s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 18px rgba(0, 0, 0, 0.06);
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  border-radius: 12px;
  background: #ffffff; /* 완전 불투명으로 변경 */
  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 14px;
  font-weight: 600;
  color: #333;

  pointer-events: none;
`;

const Name = styled.span`
`;

const Emoji = styled.span`
  position: absolute;
  right: 20px;
  font-size: 22px;
`;

export default function MainPage() {
  const navigate = useNavigate();
  const now = new Date();

  const cafeterias = [
    { id: "Gongstaurant", name: "공식당", emoji: "🥵" },
    { id: "Cheomseong", name: "복지관", emoji: "😐" },
    { id: "Gamggoteria", name: "감꽃식당", emoji: "🥳" },
  ];

  return (
    <List>
      {cafeterias.map((cafe) => {
        const open = isOpenNow(cafe.id, now); // 지금 오픈 여부

        return (
          <Card
            key={cafe.id}
            onClick={() => navigate(`/Cafeteria/${cafe.id}`)}
            $isOpen={open}
          >
            <Name>{cafe.name}</Name>
            <Emoji>{cafe.emoji}</Emoji>

            {/* 영업시간이 아닐 때만 오버레이 표시 */}
            {!open && <Overlay>{`${cafe.name}은 지금 오픈 준비 중이에요💤`}</Overlay>}
          </Card>
        );
      })}
    </List>
  );
}