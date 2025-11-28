// ======================================================
// FE2: 투표 화면 + 완료 모달 + 잔여투표횟수 표시 (FE1 레이아웃 적용)
// src/Components/VotePage.jsx
// ======================================================
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useParams, useNavigate } from "react-router-dom";
import { getRemainingVotes, postVote } from "../Api";

// 혼잡도 → 한글 라벨
const LEVEL_LABELS = {
  busy: "혼잡",
  normal: "보통",
  relaxed: "여유",
};

// 대기시간 옵션 (혼잡도와 상관없이 공통)
const WAIT_OPTIONS = [
  "바로 입장",
  "5분",
  "10분",
  "15분",
  "20분",
  "20분 이상",
];

function VotePage() {
  const { name } = useParams(); // Gongstaurant / Cheomseong / Gamggoteria
  const navigate = useNavigate();

  const [remaining, setRemaining] = useState(null); // 남은 투표횟수
  const [loadingRemain, setLoadingRemain] = useState(true);

  const [selectedLevel, setSelectedLevel] = useState(null); // busy / normal / relaxed
  const [selectedWait, setSelectedWait] = useState(null);   // "5분" 같은 문자열
  const [showModal, setShowModal] = useState(false);

  // 🔹 오늘 한 번이라도 투표한 적이 있는지 여부
  const [hasVotedToday, setHasVotedToday] = useState(false);

  // ----- 1) 처음 진입 시 잔여 투표횟수 가져오기 -----
  useEffect(() => {
    async function loadRemain() {
      try {
        // 백엔드 응답: { "remainingVoteCount": 2 } (Api.js 기준)
        const data = await getRemainingVotes();

        if (data && typeof data.remainingVoteCount === "number") {
          setRemaining(data.remainingVoteCount);
        } else {
          // 응답 형식이 예상과 다를 때
          setRemaining(null);
        }
      } catch (err) {
        console.error("잔여 투표횟수 조회 실패:", err);
        setRemaining(null);
      } finally {
        setLoadingRemain(false);
      }
    }

    loadRemain();
  }, []);

  // 🔹 페이지 진입 시, localStorage 를 보고 "오늘 이미 투표했는지" 확인
  useEffect(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    const todayStr = `${y}-${m}-${d}`;
    const votedDate = localStorage.getItem("voted_date");

    if (votedDate === todayStr) {
      setHasVotedToday(true);
    }
  }, []);

  // 오늘 제공된 투표 횟수를 다 사용했는지 여부
  // remaining이 null이면 아직 정보 없음 → false 처리
  const noChanceLeft = remaining !== null && remaining <= 0;

  // ---------- 2) 혼잡도 / 대기시간 선택 ----------
  const handleLevelClick = (level) => {
    if (noChanceLeft) return;
    setSelectedLevel(level);
    setSelectedWait(null); // 혼잡도 다시 고르면 대기시간 초기화
  };

  const handleWaitClick = (wait) => {
    if (noChanceLeft) return;
    setSelectedWait(wait);
  };

  // ------------- 3) 투표하기 클릭 --------------
  const handleSubmit = async () => {
    if (!selectedLevel || !selectedWait) return;

    if (noChanceLeft) {
      alert("오늘 투표 가능 횟수를 모두 사용하셨어요!");
      return;
    }

    try {
      // 라우트 파라미터 그대로 Api.js로 넘김
      // (Api.postVote에서 Gongstaurant/Cheomseong/Gamggoteria → restaurantId 매핑)
      const cafeteriaKey = name;

      // "10분", "15분", "바로 입장" 같은 텍스트 → 숫자(분)로 변환
      let waitingMinutes = 0;
      if (selectedWait === "바로 입장") {
        waitingMinutes = 0;
      } else {
        // "20분 이상"도 일단 20으로 보냄 (parseInt가 앞의 숫자만 가져옴)
        waitingMinutes = parseInt(selectedWait, 10);
      }

      // Api.js 의 postVote(식당키, 혼잡도, 대기시간분)
      await postVote(cafeteriaKey, selectedLevel, waitingMinutes);

      // 투표 후 최신 잔여횟수 다시 조회
      const data = await getRemainingVotes();
      if (data && typeof data.remainingVoteCount === "number") {
        setRemaining(data.remainingVoteCount);
      }

      // 🔹 오늘 아무 식당이든 한 번 투표했음을 기록 (YYYY-MM-DD 형식)
      const today = new Date();
      const y = today.getFullYear();
      const m = String(today.getMonth() + 1).padStart(2, "0");
      const d = String(today.getDate()).padStart(2, "0");
      const todayStr = `${y}-${m}-${d}`;
      localStorage.setItem("voted_date", todayStr);

      // 🔹 현재 페이지에서도 즉시 "오늘 투표함" 상태로 전환
      setHasVotedToday(true);

      setShowModal(true); // 투표 완료 모달 열기
    } catch (err) {
      console.error("투표 전송 실패:", err);
      alert("투표에 실패했어요. 잠시 후 다시 시도해 주세요.");
    }
  };

  // ---------- 4) 모달에서 확인 눌렀을 때 ----------
  const handleModalClose = () => {
    setShowModal(false);
    navigate(`/cafeteria/${name}`, {
      state: { fromVote: true },
    });
  };

  return (
    <VoteWrapper>
      {/* 상단 잔여투표횟수 표시 */}
      <TopRow>
        <RemainBox>
          잔여투표횟수&nbsp;
          {loadingRemain || remaining === null ? "..." : `${remaining}/2`}
        </RemainBox>
      </TopRow>

      {/* 혼잡도 선택 */}
      <SectionTitle>현재 어느 정도인가요?</SectionTitle>

      <LevelRow>
        {["busy", "normal", "relaxed"].map((level) => (
          <LevelButton
            key={level}
            type="button"
            onClick={() => handleLevelClick(level)}
            disabled={noChanceLeft}
          >
            <LevelCard $selected={selectedLevel === level}>
              <LevelLabel>{LEVEL_LABELS[level]}</LevelLabel>
              <CheckSquare>
                {selectedLevel === level ? "V" : ""}
              </CheckSquare>
            </LevelCard>
          </LevelButton>
        ))}
      </LevelRow>

      {/* 대기시간 선택: 혼잡도 선택 후에만 표시 */}
      {selectedLevel && (
        <>
          <SectionTitle>대기시간은 어느 정도인가요?</SectionTitle>
          {WAIT_OPTIONS.map((opt) => (
            <OptionButton
              key={opt}
              type="button"
              onClick={() => handleWaitClick(opt)}
              $selected={selectedWait === opt}
              disabled={noChanceLeft}
            >
              {opt}
            </OptionButton>
          ))}
        </>
      )}

      {/* 투표하기 버튼: 둘 다 선택된 경우에만 표시 */}
      {selectedLevel && selectedWait && (
        <SubmitButton
          type="button"
          onClick={handleSubmit}
          disabled={noChanceLeft}
        >
          {noChanceLeft
            ? "오늘 투표 횟수를 모두 소진하셨어요 😅"
            : "투표하기"}
        </SubmitButton>
      )}

      {/* 🔹 오늘 한 번이라도 투표한 적이 있으면 '뒤로 가기' 버튼 노출 */}
      {hasVotedToday && (
        <BackButton type="button" onClick={() => navigate(`/cafeteria/${name}`)}>
          뒤로 가기
        </BackButton>
      )}

      {/* 투표 완료 모달 */}
      {showModal && (
        <ModalBackdrop>
          <ModalCard>
            <ModalText>투표가 완료되었어요! 👏</ModalText>
            <ConfirmButton onClick={handleModalClose}>확인</ConfirmButton>
          </ModalCard>
        </ModalBackdrop>
      )}
    </VoteWrapper>
  );
}

export default VotePage;

/* ------------ styled-components ------------- */
const VoteWrapper = styled.div`
  width: 100%;
  max-width: 360px;
  margin: 24px auto;
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const TopRow = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const RemainBox = styled.div`
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.cardBg};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.muted};
`;

const SectionTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-top: 4px;
`;

const LevelRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
`;

const LevelButton = styled.button`
  flex: 1;
  border: none;
  padding: 0;
  background: transparent;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
`;

const LevelCard = styled.div`
  padding: 10px 0 12px;
  border-radius: 12px;
  border: 1px solid
    ${({ theme, $selected }) =>
      $selected ? theme.colors.primary : theme.colors.border};
  background-color: ${({ theme, $selected }) =>
    $selected ? "#ffe8f3" : theme.colors.cardBg};
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: 0.12s ease;
`;

const LevelLabel = styled.div`
  font-size: 14px;
  margin-bottom: 8px;
`;

const CheckSquare = styled.div`
  width: 46px;
  height: 46px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
`;

const OptionButton = styled.button`
  padding: 12px;
  border-radius: 12px;
  border: 1px solid
    ${({ theme, $selected }) =>
      $selected ? theme.colors.primary : theme.colors.border};
  background-color: ${({ theme, $selected }) =>
    $selected ? "#ffe8f3" : theme.colors.cardBg};
  font-size: 14px;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
  transition: 0.12s ease;

  &:hover {
    ${({ disabled, theme }) =>
      !disabled && `border-color: ${theme.colors.primary};`}
  }

  & + & {
    margin-top: 0px;
  }
`;

const SubmitButton = styled.button`
  padding: 14px;
  border-radius: 12px;
  border: 1px solid ${({ theme, disabled }) =>
    disabled ? theme.colors.border : theme.colors.primary};
  background-color: ${({ theme, disabled }) =>
    disabled ? theme.colors.cardBg : theme.colors.primary};
  color: ${({ disabled }) => (disabled ? "#888" : "#ffffff")};
  font-size: 16px;
  font-weight: 600;
  cursor: ${({ disabled }) => (disabled ? "default" : "pointer")};
  margin-top: 4px;

  &:hover {
    ${({ disabled }) =>
      !disabled &&
      `
      filter: brightness(0.96);
    `}
  }
`;

// 🔹 새로 추가된 '뒤로 가기' 버튼 스타일
const BackButton = styled.button`
  padding: 12px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.cardBg};
  color: ${({ theme }) => theme.colors.muted};
  font-size: 14px;
  cursor: pointer;
  margin-top: 4px;

  &:hover {
    filter: brightness(0.97);
  }
`;

/* -------------- Modal -------------- */
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
  font-size: 14px;
  cursor: pointer;
`;
