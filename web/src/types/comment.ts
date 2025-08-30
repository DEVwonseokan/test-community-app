// ─────────────────────────────────────────────────────────────
// 댓글 타입 정의
// ─────────────────────────────────────────────────────────────
export type CommentItem = {
    id: number;              // 댓글 ID
    content: string;         // 내용
    authorId: number;        // 작성자 ID
    authorNickname: string;  // 작성자 닉네임
    createdAt: string;       // 생성 시각(ISO 문자열)
    mine: boolean;           // 내 댓글인지(서버 계산 값, SSR에선 false일 수도)
};
