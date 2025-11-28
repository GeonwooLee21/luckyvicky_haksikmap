// ================================
// FE1 & FE2 Api.js
// 백엔드 API 명세서 기준으로 작성
// ================================

// ================================
// 0) 백엔드 기본 주소 설정
// 예: "http://localhost:8080"
//    "http://147.46.xxx.xxx:8080"
// ================================
export const BASE_URL = "http://3.39.9.14:8080";


// ================================
// 1) 공통 request() 함수
// ================================
async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;

  try {
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      },
      ...options,
    });

    if (!res.ok) {
      throw new Error(`API error: ${res.status} ${res.statusText}`);
    }

    // 응답이 JSON일 수도 있고 비어있을 수도 있으므로
    const text = await res.text();
    return text ? JSON.parse(text) : null;

  } catch (err) {
    console.error(`[API ERROR] ${path}`, err);
    throw err;
  }
}


// ================================
// 2) 날짜 변경 시 localStorage 리셋
// ================================
function resetLocalStorageIfNewDay() {
  // 오늘 날짜를 "YYYY-MM-DD" 형태의 문자열로 생성 (로컬 시간 기준)
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, "0");
  const d = String(today.getDate()).padStart(2, "0");
  const todayStr = `${y}-${m}-${d}`;

  const savedDate = localStorage.getItem("lastVisitDate");

  if (savedDate !== todayStr) {
    // 유저가 사용하는 키들만 삭제(local storage 비우기)
    localStorage.removeItem("clientUid");
    localStorage.removeItem("userId");
    localStorage.removeItem("userToken");
    localStorage.removeItem("remainingVoteCount");

    // 혹시 테스트용으로 쓰던 키도 있으면 같이 제거 (선택)
    // localStorage.removeItem("lv_user_id");

    // 오늘 날짜 저장
    localStorage.setItem("lastVisitDate", todayStr);
  }
}


// ================================
// 3) 사용자 UID / 토큰 / 유저 생성
// ================================

// 3-0. Safari 등에서도 동작하는 안전한 UID 생성 헬퍼
function generateClientUid() {
  // 예: "uid-llk2p5s-8f9as1k2" 이런 식의 랜덤 문자열
  return (
    "uid-" +
    Date.now().toString(36) +
    "-" +
    Math.random().toString(36).slice(2, 11)
  );
}

// 3-1. 랜덤 UID 생성 및 localStorage에 저장 (프론트 클라이언트 고유 식별자)
function getOrCreateClientUid() {
  let uid = null;

  // 1) localStorage에서 먼저 시도
  try {
    uid = localStorage.getItem("clientUid");
  } catch (e) {
    console.warn("[getOrCreateClientUid] localStorage에서 읽기 실패:", e);
  }

  // 2) 없으면 새로 생성
  if (!uid) {
    const hasRandomUUID =
      typeof crypto !== "undefined" &&
      crypto &&
      typeof crypto.randomUUID === "function";

    if (hasRandomUUID) {
      // 크롬/최신 브라우저
      uid = crypto.randomUUID();
    } else {
      // Safari, iOS, 구형 브라우저용 fallback
      uid = generateClientUid();
    }

    // 3) 생성한 UID를 localStorage에 저장 (실패해도 앱은 계속 동작하게)
    try {
      localStorage.setItem("clientUid", uid);
    } catch (e) {
      console.warn("[getOrCreateClientUid] localStorage에 저장 실패:", e);
    }
  }

  return uid;
}

// 3-2. 서버에 userId, userToken 생성 요청
async function createUserOnServer() {
  const clientUid = getOrCreateClientUid();

  // 서버에 새로운 유저를 만들어 달라는 POST 요청
  const res = await request("/api/user", {
    method: "POST",
    // body: JSON.stringify({ clientUid }),
  });

  // 서버에서 받은 userId, userToken, remainingVotecount를 local storage에 저장
  // 응답 예시:
  // { "userId": 1, "userToken": "...", "remainingVoteCount": 2 }
  localStorage.setItem("userId", String(res.userId));
  localStorage.setItem("userToken", res.userToken);
  localStorage.setItem("remainingVoteCount", String(res.remainingVoteCount));

  // 새 유저 정보 반환
  return res;
}

// 3-3. FE에서 “유저를 반드시 확보”하는 함수
export async function ensureUser() {
  // 자정이 지나면 local storage 초기화
  resetLocalStorageIfNewDay();

  // 이미 저장된 유저 정보가 있는지 확인
  const existingToken = localStorage.getItem("userToken");
  const existingId = localStorage.getItem("userId");

  // 저장된 userToken과 userId가 있을 때
  if (existingToken && existingId) {
    // 저장된 유저 정보 반환
    return {
      userId: Number(existingId),
      userToken: existingToken,
      remainingVoteCount: Number(
        localStorage.getItem("remainingVoteCount") ?? 0
      ),
    };
  }

  // 없으면 새 유저 생성
  return await createUserOnServer();
}


// ================================
// 4) 전체 식당 혼잡도 조회
// GET /api/restaurant
// ================================
export async function getAllRestaurantStatus() {
  return request("/api/restaurant", { method: "GET" });
}


// ===============================================================
// 5) 식당 한 곳 혼잡도 조회
// GET /api/restaurant/{restaurant-id}
// 응답 예: { "id": 3, "name": "감꽃식당", "currentCongestion": 30 }
// ===============================================================
export async function getRestaurantStatus(restaurantId) {
  const data = await request(`/api/restaurant/${restaurantId}`, {
    method: "GET",
  });

  if (!data) return null;

  return {
    ...data,
    // 프론트에서 쓸 통일된 필드명 + 숫자 캐스팅
    congestionValue: Number(
      data.congestionValue ?? data.currentCongestion ?? 0
    ),
  };
}


// ================================
// 6) 지난주 동일 요일/시간대 히스토리 조회
// GET /api/restaurant/{id}/history
// ================================
export async function getCafeteriaHistory(restaurantId) {
  return request(`/api/restaurant/${restaurantId}/history`, {
    method: "GET",
  });
}


// ================================
// 7) 혼잡도 + 대기시간 투표
// POST /api/vote  (JSON Body)
// ================================
export async function postVote(cafeteriaKey, level, waitingMinutes) {
  const user = await ensureUser();
  const token = user.userToken;
  const userId = user.userId;

  const RESTAURANT_IDS = {
    Gongstaurant: 1,
    Cheomseong: 2,
    Gamggoteria: 3,
  };

  const LEVEL_MAP = {
    busy: "HIGH",
    normal: "MEDIUM",
    relaxed: "LOW",
  };

  const restaurantId = RESTAURANT_IDS[cafeteriaKey];

  return request("/api/vote", {
    method: "POST",
    headers: {
      "user-token": token,
      // Content-Type 은 request() 기본값이 application/json 이라 안 써도 되지만,
      // 명시해 두고 싶으면 이렇게 써도 됨
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId,
      restaurantId,
      congestionLevel: LEVEL_MAP[level],
      waitingTime: waitingMinutes,
    }),
  });
}


// ================================
// 8) 잔여 투표 횟수 조회
// GET /api/user/vote
// ================================
export async function getRemainingVotes() {
  const user = await ensureUser();

  const res = await request("/api/user/vote", {
    method: "GET",
    headers: {
      // 명세서에 맞게 헤더 이름 수정
      "user-token": user.userToken,
    },
  });

  // 응답 예시: { "remainingVoteCount": 1 } 라고 가정
  if (res && typeof res.remainingVoteCount === "number") {
    localStorage.setItem("remainingVoteCount", String(res.remainingVoteCount));
  }

  // 그대로 넘겨서 VotePage에서 res.remainingVoteCount 사용 가능하게
  return res;
}


// ================================================
// 9) 대기시간 조회
// GET /api/restaurant/{restaurant-id}/wait-time
// 응답 예:
// {
//   "restaurantId": 1,
//   "time": "2025-11-28 12:30",
//   "waitTimeMin": 12, // 없으면 -1 (집계중) 또는 null
//   "status": "SUCCESS"
// }
// ================================================
export async function getWaitTime(restaurantId) {
  const user = await ensureUser();

  return request(`/api/restaurant/${restaurantId}/wait-time`, {
    method: "GET",
    headers: {
      "user-token": user.userToken,
    },
  });
}
