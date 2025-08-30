// web/src/app/posts/[id]/Comments.tsx
"use client";
// ─────────────────────────────────────────────────────────────
// ✅ 클라이언트 컴포넌트
// - 초기 댓글 목록은 서버 컴포넌트에서 받아 오거나(SSR) 여기서 fetch 가능
// - 로그인 상태면 입력창/등록 버튼을 노출
// - 내 댓글(mine=true)이면 삭제 버튼 노출
// ─────────────────────────────────────────────────────────────

import * as React from "react";
import { CommentItem } from "@/types/comment";
import { fetchMe, fetchComments, createComment, deleteComment } from "@/lib/api";

type Props = {
    postId: number;                  // 어느 글의 댓글인지
    initial?: CommentItem[];         // SSR로 받아온 초기 목록(선택)
};

export default function Comments({ postId, initial = [] }: Props) {
    // 1) 상태: 댓글 목록, 입력값, 진행 상태, 로그인 사용자 ID
    // 댓글 목록 상태
    const [comments, setComments] = React.useState<CommentItem[]>(initial);
    // 로그인 사용자 정보 상태(null이면 비로그인)
    const [me, setMe] = React.useState<{ id: number; nickname: string } | null>(null);
    // 입력창 상태
    const [content, setContent] = React.useState("");
    // 등록/삭제 진행 플래그
    const [submitting, setSubmitting] = React.useState(false);
    const [loadingList, setLoadingList] = React.useState(false);

    // 2 마운트 시 현재 로그인 사용자(me) 확인
    React.useEffect(() => {
        // /auth/me를 호출해서 로그인 여부와 닉네임을 확정한다.
        fetchMe()
            .then((m) => {
                if (!m) { setMe(null); return; }
                setMe({ id: m.id, nickname: m.nickname });
            })
            .catch(() => setMe(null));
    }, []);

    // 서버에서 최신 댓글 목록을 다시 가져오는 함수
    async function reload(size = 50) {
        try {
            setLoadingList(true);
            const list = await fetchComments(postId, size);
            setComments(list);
        } finally {
            setLoadingList(false);
        }
    }

    // 3 제출 핸들러: 댓글 작성
    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();               // 폼 기본 제출 방지
        if (!me) {                        // 로그인 확인 (안전장치)
            alert("로그인이 필요합니다.");
            return;
        }
        const text = content.trim();
        if (!text) {                      // 빈 문자열 방지
            alert("댓글을 입력하세요.");
            return;
        }
        try {
            setSubmitting(true);            // 중복 제출 방지
            await createComment(postId, text); // 서버에 실제 생성
            setContent("");                 // 입력창 리셋
            await reload(50);               // 서버에서 다시 목록을 가져와 정확한 authorNickname/mine 반영
        } catch (err: any) {
            alert(err?.message ?? "댓글 작성 실패");
        } finally {
            setSubmitting(false);
        }
    }

    // 4) 삭제
    async function onDelete(id: number) {
        if (!me) {                        // 로그인 확인 (안전장치)
            alert("로그인이 필요합니다.");
            return;
        }
        if (!confirm("댓글을 삭제할까요?")) return;
        try {
            await deleteComment(id);        // 서버에 실제 삭제
            await reload(50);               // 최신 목록 재로딩
        } catch (err: any) {
            alert(err?.message ?? "댓글 삭제 실패");
        }
    }
    // 5) 렌더
    return (
        <section className="mt-10">
            {/* 섹션 제목 */}
            <h2 className="text-lg font-semibold mb-3">댓글</h2>

            {/* 로그인 상태에서만 입력 폼을 노출한다.
         me가 null이면 비로그인으로 판단한다.
      */}
            {me ? (
                <form onSubmit={onSubmit} className="mb-4 flex gap-2">
                    <input
                        className="flex-1 border rounded p-2"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="댓글을 입력하세요"
                    />
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                    >
                        {submitting ? "등록 중..." : "등록"}
                    </button>
                </form>
            ) : (
                // 비로그인 안내 문구
                <p className="text-sm text-gray-500 mb-4">
                    댓글을 작성하려면{" "}
                    <a href={`/login?returnTo=/posts/${postId}`} className="text-blue-600 underline">로그인</a>
                    이 필요합니다.
                </p>
            )}

            {/* 댓글 목록 */}
            <ul className="space-y-3">
                {comments.map((c) => (
                    <li key={c.id} className="border rounded p-3">
                        {/* 상단 메타 정보: 닉네임 · 시간 · 내 댓글이면 삭제 버튼 */}
                        <div className="flex items-center justify-between text-sm text-gray-500">
              <span>
                {c.authorNickname} · {new Date(c.createdAt).toLocaleString("ko-KR")}
              </span>
                            {/* mine 플래그가 서버에서 false여도, 안전을 위해 me.id === authorId일 때만 삭제 노출 */}
                            {me && me.id === c.authorId && (
                                <button
                                    onClick={() => onDelete(c.id)}
                                    className="text-red-600 hover:underline"
                                >
                                    삭제
                                </button>
                            )}
                        </div>
                        {/* 본문 */}
                        <p className="mt-2 whitespace-pre-wrap">{c.content}</p>
                    </li>
                ))}

                {/* 목록이 비었을 때 메시지 */}
                {comments.length === 0 && !loadingList && (
                    <li className="text-sm text-gray-500">첫 댓글을 남겨보세요.</li>
                )}
            </ul>
        </section>
    );
}