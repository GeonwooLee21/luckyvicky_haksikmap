// FE1
// src/utils/openingHours.js

export const CAFETERIA_HOURS = {
  // 요일: 0=일, 1=월, ... 6=토
  // 공식당 운영 시간
  Gongstaurant: [
    { days: [1, 2, 3, 4, 5], open: "10:00", close: "15:00" },
    { days: [1, 2, 3, 4, 5], open: "16:00", close: "21:00" },
  ],

  // 복지관 운영 시간
  Cheomseong: [
    { days: [1, 2, 3, 4, 5], open: "11:15", close: "13:30" },
  ],

  // 감꽃식당 운영 시간
  Gamggoteria: [
    { days: [1, 2, 3, 4, 5], open: "11:30", close: "13:30" },
  ],
};

function timeToMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

// 현재 로컬 시간을 기준으로 [name]식당이 영업 중인지 판별
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
