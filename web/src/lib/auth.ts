/**
 * 브라우저 로컬스토리지에 저장된 JWT(accessToken)를 읽는다.
 * - 없으면 null
 */
export function getToken(): string | null {
    if (typeof window === "undefined") return null; // 서버 렌더일 때는 없음
    return localStorage.getItem("token");
}

/**
 * Base64URL 디코딩 (JWT payload 디코딩용)
 * - 보안: 이건 "신뢰"가 아니라 단순 표시/편의용.
 *   실제 권한은 백엔드에서 검증되므로 프론트에서 디코딩해도 안전성 문제 없음.
 */
function base64UrlDecode(input: string): string {
    const b64 = input.replace(/-/g, "+").replace(/_/g, "/");
    // 패딩 보정
    const pad = b64.length % 4;
    const padded = b64 + (pad ? "=".repeat(4 - pad) : "");
    return decodeURIComponent(
        atob(padded)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
    );
}

/**
 * 토큰에서 userId(subject, "sub")를 뽑는다.
 * - 없으면 null
 */
export function getUserIdFromToken(token: string | null): number | null {
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length < 2) return null;

    try {
        const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        const padLen = (4 - (b64.length % 4)) % 4;
        const json = atob(b64 + "=".repeat(padLen));  // base64 디코딩
        const p = JSON.parse(json) as Record<string, any>;

        const cand = p.sub ?? p.userId ?? p.uid ?? p.id;  // 여러 키 시도
        const n = typeof cand === "string" ? Number(cand) : cand;
        return Number.isFinite(n) ? n : null;  // 유효한 userId인지 검사
    } catch {
        return null;
    }
}
