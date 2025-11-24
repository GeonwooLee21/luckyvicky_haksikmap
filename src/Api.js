// FE2
// src/Api.js

const BASE_URL = "http://localhost:4000"; // 백엔드 서버 주소로 바꾸기

// 공통 fetch 함수 (에러 처리까지 한 번에)
async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;

  try {
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    });

    if (!res.ok) {
      throw new Error(`API error: ${res.status} ${res.statusText}`);
    }

    // 응답이 비어있는 경우도 있을 수 있어서 text 먼저 읽음
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  } catch (err) {
    console.error("[API ERROR]", err);
    throw err; // 나중에 컴포넌트에서 try/catch로 처리 가능
  }
}

// 사용자 토큰을 보관 & 없으면 생성하는 함수
async function ensureUserToken() {
  // 1) 이미 저장된 토큰이 있으면 그걸 바로 사용
  let token = localStorage.getItem("userToken");
  if (token) return token;

  // 2) 없으면 서버에 유저 생성 요청을 보내고 토큰을 받는다
  // (백엔드에서 POST /api/user 로 토큰을 준다고 가정)
  const res = await request("/api/user", {
    method: "POST",
  });

  token = res.token; // 응답 형식: { token: "abcd1234" }
  localStorage.setItem("userToken", token);
  return token;
}


/* 1) 현재 학식당 혼잡도 가져오기
GET /cafeterias/:id/status  를 부른다고 가정
예) 응답: { status: "busy" }  // "busy" | "normal" | "relaxed */
export async function getCafeteriaStatus(cafeteriaId) {
  return request(`/cafeterias/${cafeteriaId}/status`, {
    method: "GET",
  });
}

/* 2) 지난주 동일 요일/시간대 데이터 가져오기
GET /cafeterias/:id/history  를 부른다고 가정
예) 응답: { history: [ { time: "12:00", level: "busy" }, ... ] } */
export async function getCafeteriaHistory(cafeteriaId) {
  return request(`/cafeterias/${cafeteriaId}/history`, {
    method: "GET",
  });
}

/* 3) 혼잡도 투표 보내기 */
// 혼잡도/대기시간 투표 전송
// 백엔드 명세: POST /api/vote
// body: { userId, restaurantId, congestionLevel, waitingTime }
export async function postVote(cafeteriaKey, level, waitingMinutes) {
  const token = await ensureUserToken(); // 이미 Api.js 에 있는 함수 사용

  // 우리 FE에서 쓰는 name → 백엔드 restaurantId 매핑
  const RESTAURANT_IDS = {
    Gongstaurant: 1,
    Cheomseong: 2,
    Gamggoteria: 3,
  };
  const restaurantId = RESTAURANT_IDS[cafeteriaKey];

  // busy/normal/relaxed → HIGH/MEDIUM/LOW 매핑
  const LEVEL_MAP = {
    busy: "HIGH",
    normal: "MEDIUM",
    relaxed: "LOW",
  };

  return request(`/api/vote`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-User-Token": token, // 백엔드가 토큰으로 userId를 찾도록
    },
    body: JSON.stringify({
      restaurantId,
      congestionLevel: LEVEL_MAP[level],
      waitingTime: waitingMinutes, // 숫자 (분)
    }),
  });
}


export async function createUser() {
  return { userId: "TEST_USER" }; // 임시
}

export async function getUserVoteRemain(userId) {
  return { remaining: 2 }; // 임시
}

export async function sendVote(payload) {
  console.log("임시 투표전송", payload);
  return { ok: true };
}

/* 백엔드에서 잔여 투표 횟수 가져오기 */
export async function getRemainingVotes() {
  const token = await ensureUserToken();

  return request("/api/user/remaining-votes", {
    method: "GET",
    headers: {
      "X-User-Token": token,
    },
  });
}



/* 4) 사진 업로드
POST /cafeterias/:id/photo
FormData로 파일 전송 (이건 JSON이 아니라 multipart/form-data) */
export async function uploadPhoto(cafeteriaId, file) {
  const url = `${BASE_URL}/cafeterias/${cafeteriaId}/photo`;
  const formData = new FormData();
  formData.append("photo", file);

  const res = await fetch(url, {
    method: "POST",
    body: formData, // 이 경우엔 Content-Type 자동으로 설정됨
  });

  if (!res.ok) {
    throw new Error(`Photo upload error: ${res.status} ${res.statusText}`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

/* 예측 대기시간 조회
   GET /api/restaurant/{restaurant-id}/wait-time (가정)
   응답 예시: { waitMinutes: 20 }
*/
export async function getPredictedWaitTime(restaurantId) {
  // 실제 URL은 백엔드가 정해주는 대로 여기만 수정하면 됨
  return request(`/api/restaurant/${restaurantId}/wait-time`, {
    method: "GET",
  });
}
