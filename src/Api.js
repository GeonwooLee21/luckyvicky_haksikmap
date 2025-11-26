// ================================
// FE1&FE2 Api.js
// 백엔드 API 명세서 기준으로 작성
// ================================

// ================================
// 1) 백엔드 기본 주소 설정
// ================================
// 예: "http://localhost:8080"
//    "http://147.46.xxx.xxx:8080"
export const BASE_URL = "http://3.39.9.14:8080";


// ================================
// 2) 공통 request() 함수
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
// 3) 사용자 UID / 토큰 / 유저 생성
// ================================

// 3-1. 랜덤 UID 생성 + 저장 (프론트 클라이언트 고유 식별자)
function getOrCreateClientUid() {
  let uid = localStorage.getItem("clientUid");
  if (!uid) {
    uid = crypto.randomUUID();   // 또는 uuidv4()
    localStorage.setItem("clientUid", uid);
  }
  return uid;
}

// 3-2. 서버에서 userId, userToken 생성
async function createUserOnServer() {
  const clientUid = getOrCreateClientUid();

  // 🔧 body 제거: 서버가 아직 clientUid를 안 받는 구조일 수 있음
  const res = await request("/api/user", {
    method: "POST",
    // body: JSON.stringify({ clientUid }),
  });

  // 응답 예시:
  // { "userId": 1, "userToken": "...", "remainingVoteCount": 2 }

  localStorage.setItem("userId", String(res.userId));
  localStorage.setItem("userToken", res.userToken);
  localStorage.setItem("remainingVoteCount", String(res.remainingVoteCount));

  return res;
}

// 3-3. FE에서 “유저를 반드시 확보”하는 함수
export async function ensureUser() {
  const existingToken = localStorage.getItem("userToken");
  const existingId = localStorage.getItem("userId");

  if (existingToken && existingId) {
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
    // ✅ 프론트에서 쓸 통일된 필드명 + 숫자 캐스팅
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
      // ✅ 백엔드 예시 코드에는 없지만, 우리 명세상 필수
      "Content-Type": "application/json",
      // ✅ Content-Type 은 request() 기본값이 application/json 이라 안 써도 되지만,
      //   명시해 두고 싶으면 이렇게 써도 됨
      // "Content-Type": "application/json",
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



// ================================
// 9) 지난주 동일 시간대 텍스트용 (임시 더미)
// FE2 lastWeekText.jsx에서 사용
// ================================
export async function getLastWeekStatus(cafeteria) {
  // TODO: 백엔드 연결되면 교체
  const dummy = {
    Gongstaurant: { level: "busy" },
    Cheomseong: { level: "normal" },
    Gamggoteria: { level: "relaxed" },
  };

  return new Promise((resolve) => {
    setTimeout(() => resolve(dummy[cafeteria]), 200);
  });
}


// ================================
// 10) 사진 업로드
// POST /api/restaurant/{id}/photo
// ================================
export async function uploadPhoto(restaurantId, file) {
  const url = `${BASE_URL}/api/restaurant/${restaurantId}/photo`;

  const formData = new FormData();
  formData.append("photo", file);

  const res = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`Photo upload error: ${res.status}`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}


// ================================
// 11) 예측 대기시간 조회
// GET /api/restaurant/{id}/wait-time
// ================================
export async function getPredictedWaitTime(restaurantId) {
  return request(`/api/restaurant/${restaurantId}/wait-time`, {
    method: "GET",
  });
}
