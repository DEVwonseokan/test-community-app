// web/src/lib/api.ts

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