// FE1
// src/Components/MainPage.jsx
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 24px;
`;

const Card = styled.button`
  width: 100%;
  padding: 16px 100px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.cardBg};
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 16px;
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease, border-color 0.12s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 18px rgba(0, 0, 0, 0.06);
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const Name = styled.span`
  margin-right: 50px;
`;

const Emoji = styled.span`
  font-size: 22px;
`;

export default function MainPage() {
  const navigate = useNavigate();

  const cafeterias = [
    { id: "Gongstaurant", name: "공식당", emoji: "🥵" },
    { id: "Cheomseong", name: "복지관", emoji: "😐" },
    { id: "Gamggoteria", name: "감꽃식당", emoji: "🥳" },
  ];

  return (
    <List>
      {cafeterias.map((cafe) => (
        <Card
          key={cafe.id}
          onClick={() => navigate(`/Cafeteria/${cafe.id}`)}
        >
          <Name>{cafe.name}</Name>
          <Emoji>{cafe.emoji}</Emoji>
        </Card>
      ))}
    </List>
  );
}
