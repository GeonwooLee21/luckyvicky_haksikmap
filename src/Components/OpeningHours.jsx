// ================================
// FE1
// src/utils/openingHours.js
// ================================

// 1) 식당별 운영 시간 설정
//    - days: 0=일, 1=월, ... 6=토
//    - open / close: "HH:MM" 문자열
//    - label: (선택) "중식", "석식" 등 타임 이름
export const CAFETERIA_HOURS = {
  // 공식당 운영 시간
  Gongstaurant: [
    { days: [1, 2, 3, 4, 5], open: "10:00", close: "15:00", label: "중식" },
    { days: [1, 2, 3, 4, 5], open: "16:00", close: "23:00", label: "석식" },
  ],

  // 복지관 운영 시간
  Cheomseong: [
    { days: [1, 2, 3, 4, 5], open: "11:15", close: "13:30", label: "중식" },
  ],

  // 감꽃식당 운영 시간
  Gamggoteria: [
    { days: [1, 2, 3, 4, 5], open: "11:30", close: "21:30", label: "영업" },
  ],
};

// "HH:MM" → 분(0~1440) 단위로 변환
function timeToMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

// 분 차이 → "X시간 Y분" 형태 문자열
function formatDiffMinutes(diffMinutes) {
  const total = Math.max(0, Math.round(diffMinutes));
  const h = Math.floor(total / 60);
  const m = total % 60;

  if (h > 0 && m > 0) return `${h}시간 ${m}분`;
  if (h > 0) return `${h}시간`;
  return `${m}분`;
}

// ================================
// 2) 현재 로컬 시간을 기준으로 [name] 식당이 영업 중인지 판별
// ================================
export function isOpenNow(name, now = new Date()) {
  const slots = CAFETERIA_HOURS[name];
  if (!slots) return true; // 설정이 없으면 일단 항상 오픈으로 취급

  const day = now.getDay(); // 0~6
  const minutes = now.getHours() * 60 + now.getMinutes();

  return slots.some((slot) => {
    if (!slot.days.includes(day)) return false;
    const openMin = timeToMinutes(slot.open);
    const closeMin = timeToMinutes(slot.close);
    return minutes >= openMin && minutes < closeMin;
  });
}

// ================================
// 3) 다음 운영 정보 계산
//    - 지금 영업 중이면 null
//    - 오늘 안에 남은 타임이 있으면 type: "today"
//    - 오늘 다 끝났고 다음 날 이후라면 type: "tomorrow" 또는 "later"
// ================================
export function getNextOpeningInfo(name, now = new Date()) {
  const slots = CAFETERIA_HOURS[name];
  if (!slots) return null;

  const day = now.getDay(); // 0~6
  const minutesNow = now.getHours() * 60 + now.getMinutes();

  // --- 3-1. 오늘 아직 시작 안 한 타임 중에서 가장 빠른 것 찾기 ---
  const todaysUpcoming = slots
    .filter((slot) => slot.days.includes(day))
    .map((slot) => ({
      ...slot,
      openMin: timeToMinutes(slot.open),
      closeMin: timeToMinutes(slot.close),
    }))
    .filter((slot) => slot.openMin > minutesNow);

  if (todaysUpcoming.length > 0) {
    // openMin이 가장 작은 타임 선택
    const next = todaysUpcoming.reduce((a, b) =>
      a.openMin < b.openMin ? a : b
    );
    const diffMinutes = next.openMin - minutesNow;

    return {
      type: "today",
      label: next.label || null,                             // "중식" 등
      open: next.open,
      close: next.close,
      diffMinutes,
      diffText: formatDiffMinutes(diffMinutes),             // "1시간 20분" 등
    };
  }

  // --- 3-2. 오늘은 더 이상 운영 없음 → 앞으로 7일 이내의 첫 타임 찾기 ---
  // (무한 루프 방지 + 일주일 내에 없으면 운영 안하는 걸로 간주하고 null)
  let best = null;

  for (let offset = 1; offset <= 7; offset++) {
    const nextDay = (day + offset) % 7;

    const candidates = slots
      .filter((slot) => slot.days.includes(nextDay))
      .map((slot) => ({
        ...slot,
        openMin: timeToMinutes(slot.open),
        closeMin: timeToMinutes(slot.close),
      }));

    if (candidates.length === 0) continue;

    const first = candidates.reduce((a, b) =>
      a.openMin < b.openMin ? a : b
    );

    const diffMinutes = offset * 24 * 60 + (first.openMin - minutesNow);

    best = {
      offset,
      slot: first,
      diffMinutes,
    };
    break; // 가장 가까운 날 찾았으니 종료
  }

  if (!best) return null;

  const { offset, slot, diffMinutes } = best;

  return {
    type: offset === 1 ? "tomorrow" : "later",
    label: slot.label || null,
    open: slot.open,
    close: slot.close,
    diffMinutes,
    diffText: formatDiffMinutes(diffMinutes),
  };
}
