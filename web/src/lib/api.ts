// web/src/lib/api.ts

import type { PostListItem, PostDetail } from "@/types/post";
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