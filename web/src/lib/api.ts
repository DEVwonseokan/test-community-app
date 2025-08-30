// web/src/lib/api.ts

import type { PostListItem, PostDetail } from "@/types/post";
import { Me } from "@/types/user";
import { getToken } from "./auth";

/**
 * 서버/브라우저 겸용 fetch 헬퍼
 * - Java의 HttpClient로 JSON GET 하는 것과 비슷한 역할
 * - baseUrl은 .env.local에서 가져옴
 */
const BASE = process.env.NEXT_PUBLIC_API_BASE; // 예: http://localhost:8080

export async function getJson<T>(path: string): Promise<T> {
    const res = await fetch(`${BASE}${path}`, {
        // 개발 중 매 호출마다 새 데이터 보기
        cache: "no-store",
        // CORS에서 Authorization 등을 쓰게 될 때 헤더를 추가하면 됨
        headers: { "Accept": "application/json" },
    });
    if (!res.ok) {
        // Java에선 IOException/HttpResponseException 던지는 느낌
        const text = await res.text();
        throw new Error(`GET ${path} failed: ${res.status} ${text}`);
    }
    return res.json() as Promise<T>;
}

// ─────────────────────────────────────────────────────────────
// 로그인 API: POST /auth/login
// - body: { email, password }
// - 성공: { accessToken: string, ... }
// - 실패: throw Error (상위에서 UI 처리)
// ─────────────────────────────────────────────────────────────
export async function login(
    body: { email: string; password: string }
): Promise<{ accessToken: string }> {
    // 1) 백엔드 베이스 URL (환경변수)
    const base = process.env.NEXT_PUBLIC_API_BASE;

    // 2) 로그인 요청 (JSON 바디)
    const res = await fetch(`${base}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }, // JSON 전송
        body: JSON.stringify(body),
    });

    // 3) 실패 시 에러 승격 (상위에서 메시지 표시)
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`로그인 실패 (${res.status}) ${text}`);
    }

    // 4) 성공: 액세스 토큰 반환
    return (await res.json()) as { accessToken: string };
}

// ─────────────────────────────────────────────────────────────
// 글 생성 API: POST /posts
// - body: { title, content }
// - 성공: { id: number }
// - 실패: throw Error (상위에서 잡아 UI 표시)
// ─────────────────────────────────────────────────────────────
export async function createPost(body: { title: string; content: string }): Promise<{ id: number }> {
    // 1) 토큰이 없으면 비로그인 → 에러
    const token = getToken();
    if (!token) throw new Error("로그인이 필요합니다.");

    // 2) 백엔드 주소 (환경변수로 주입)
    const base = process.env.NEXT_PUBLIC_API_BASE;

    // 3) 실제 POST 요청 (인증 헤더 + JSON 바디)
    const res = await fetch(`${base}/posts`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",               // JSON 전송
            "Authorization": `Bearer ${token}`,               // 인증 토큰
        },
        body: JSON.stringify(body),                         // { title, content }
    });

    // 4) 실패 응답이면 에러로 승격(상위에서 메시지 표시)
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`글쓰기 실패 (${res.status}) ${text}`);
    }

    // 5) 성공: { id } 반환
    return res.json() as Promise<{ id: number }>;
}

/**
 * /posts 목록을 가져오는 전용 함수
 * - Java에서라면 Service + HttpClient 조합으로 응답 파싱
 * - Next.js에서는 fetch + 제네릭 타입(T)으로 타입 안정성 확보
 */
export async function fetchPosts(size = 20): Promise<PostListItem[]> {
    return getJson<PostListItem[]>(`/posts?size=${size}`);
}

/** 단건 상세 조회 */
export async function fetchPost(id: number): Promise<PostDetail> {
    return getJson<PostDetail>(`/posts/${id}`);
}

/** 게시글 삭제 */
export async function deletePost(id: number): Promise<void> {
    const token = getToken();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/posts/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`DELETE /posts/${id} 실패: ${res.status} ${text}`);
    }
}

/** 게시글 수정 */
export async function updatePost(
    id: number,
    body: { title: string; content: string }
): Promise<void> {
    const token = getToken();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/posts/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`PATCH /posts/${id} 실패: ${res.status} ${text}`);
    }

}

// ─────────────────────────────────────────────────────────────
// 내 정보 조회 (/auth/me)
// - 성공: Me
// - 실패: null (토큰 없음/만료 등)
// ─────────────────────────────────────────────────────────────
export async function fetchMe(): Promise<Me | null> {
    const token = getToken();                             // 1) 토큰 읽기
    if (!token) return null;                              // 2) 토큰 없으면 비로그인으로 간주

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },      // 3) 인증 헤더 첨부
        cache: "no-store",                                  // 4) 항상 최신 값
    });

    if (!res.ok) return null;                             // 5) 401/403 등 실패 → null
    return (await res.json()) as Me;                      // 6) 성공 → Me
}