// FE2
// src/Api.js

const BASE_URL = "http://localhost:4000"; // 백엔드 서버 주소로 바꾸기

// 공통 fetch 함수 (에러 처리까지 한 번에)
async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;

  try {
    const res = await fetch(url, {
      headers: {
        // 파일 업로드(FormData)일 땐 headers를 따로 넘길 거라서,
        // 여기 기본값만 넣어두고 override 가능하게 함
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

/* 3) 혼잡도 투표 보내기
POST /cafeterias/:id/vote
body: { level: "busy" | "normal" | "relaxed" } */
export async function postVote(cafeteriaId, level) {
  return request(`/cafeterias/${cafeteriaId}/vote`, {
    method: "POST",
    body: JSON.stringify({ level }),
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

// src/Api.js
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