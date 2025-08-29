// web/src/types/post.ts

/**
 * 백엔드 PostListItem DTO와 1:1 매칭
 * - id: Long  → JS에서는 number
 * - title: String
 * - createdAt: ISO 문자열
 */
export type PostListItem = {
    id: number;
    title: string;
    createdAt: string;
};