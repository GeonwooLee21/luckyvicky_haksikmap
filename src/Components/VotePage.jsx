// FE2 투표 화면 (스타일 FE1 통일 적용)
// src/Components/VotePage.jsx
import React, { useState } from "react";
import styled from "styled-components";
import { useParams, useNavigate } from "react-router-dom";

function VotePage() {
  const { name } = useParams();
  const navigate = useNavigate();

  const [level, setLevel] = useState(null);
  const [waitTime, setWaitTime] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const waitOptionsMap = {
    relaxed: ["바로 입장", "5분"],
    normal: ["10분", "15분"],
    busy: ["20분", "20분 이상"],
  };

  const waitOptions = level ? waitOptionsMap[level] : [];

  const handleSubmit = () => {
    if (!level || !waitTime) return;
    setShowModal(true);
  };

  const handleModalClose = () => {
    navigate(`/cafeteria/${name}`, { state: { fromVote: true } });
  };

  return (
    <Wrapper>

      {/* 혼잡도 선택 */}
      <SectionTitle>현재 어느 정도인가요?</SectionTitle>

      <LevelRow>

        <LevelCard
          selected={level === "busy"}
          onClick={() => setLevel("busy")}
        >
          <LevelLabel>혼잡</LevelLabel>
          <CheckSquare>{level === "busy" ? "V" : ""}</CheckSquare>
        </LevelCard>

        <LevelCard
          selected={level === "normal"}
          onClick={() => setLevel("normal")}
        >
          <LevelLabel>보통</LevelLabel>
          <CheckSquare>{level === "normal" ? "V" : ""}</CheckSquare>
        </LevelCard>

        <LevelCard
          selected={level === "relaxed"}
          onClick={() => setLevel("relaxed")}
        >
          <LevelLabel>여유</LevelLabel>
          <CheckSquare>{level === "relaxed" ? "V" : ""}</CheckSquare>
        </LevelCard>

      </LevelRow>

      {/* 대기시간 — level이 선택된 이후에만 보이게 */}
      {level && (
        <>
          <SectionTitle>대기시간은 어느 정도인가요?</SectionTitle>

          {waitOptions.map((opt) => (
            <OptionButton
              key={opt}
              selected={waitTime === opt}
              onClick={() => setWaitTime(opt)}
            >
              {opt}
              </OptionButton>
          ))}
        </>
      )}

      {/* 제출 버튼 */}
      <SubmitButton
        disabled={!level || !waitTime}
        onClick={handleSubmit}
      >
        투표하기
      </SubmitButton>

      {/* 모달 */}
      {showModal && (
        <ModalBackdrop>
          <ModalCard>
            <ModalText>투표가 완료되었습니다! 👏</ModalText>
            <ConfirmButton onClick={handleModalClose}>확인</ConfirmButton>
          </ModalCard>
        </ModalBackdrop>
      )}

    </Wrapper>
  );
}

export default VotePage;

/* ---------- styled ---------- */

const Wrapper = styled.div`
  width: 100%;
  max-width: 360px;
  margin: 24px auto;
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const SectionTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-top: 8px;
`;

const LevelRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
`;

const LevelCard = styled.button`
  flex: 1;
  padding: 12px 0;
  border-radius: 12px;
  border: 1px solid
    ${({ theme, selected }) =>
      selected ? theme.colors.primary : theme.colors.border};
  background-color: ${({ selected }) => (selected ? "#ffe8f3" : "white")};
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: 0.12s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const LevelLabel = styled.div`
  font-size: 14px;
  margin-bottom: 12px;
`;

const CheckSquare = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const OptionButton = styled.button`
  padding: 12px;
  border-radius: 12px;
  border: 1px solid
    ${({ theme, selected }) =>
      selected ? theme.colors.primary : theme.colors.border};
  background-color: ${({ selected }) =>
    selected ? "#ffe8f3" : "white"};
  font-size: 14px;
  cursor: pointer;
  transition: 0.12s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const SubmitButton = styled.button`
  padding: 14px;
  border-radius: 12px;
  border: 1px solid ${({ theme, disabled }) =>
    disabled ? theme.colors.border : theme.colors.primary};
  background-color: ${({ theme, disabled }) =>
    disabled ? theme.colors.cardBg : theme.colors.primary};
  color: ${({ disabled }) => (disabled ? "#888" : "white")};
  font-size: 16px;
  cursor: ${({ disabled }) => (disabled ? "default" : "pointer")};

  &:hover {
    ${({ disabled }) =>
      !disabled &&
      `
      filter: brightness(0.95);
    `}
  }
`;

/* ---------- Modal ---------- */

const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalCard = styled.div`
  width: 280px;
  padding: 24px 20px;
  background: white;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  text-align: center;
`;

const ModalText = styled.div`
  font-size: 18px;
  margin-bottom: 20px;
`;

const ConfirmButton = styled.button`
  width: 100%;
  padding: 12px 0;
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.primary};
  border: none;
  color: white;
  cursor: pointer;
`;
