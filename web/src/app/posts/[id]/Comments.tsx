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
import { fetchMe, fetchComments, createComment, deleteComment, updateComment } from "@/lib/api";

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
    // 편집 모드 상태: 댓글 ID → 현재 편집 중 본문 텍스트
    // 예: { 101: "수정 중인 내용", 205: "다른 댓글 수정 내용" }
    const [editing, setEditing] = React.useState<Record<number, string>>({});

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

    // 편집 모드로 전환: editing 상태에 현재 본문을 초기값으로 넣는다.
    function startEdit(c: CommentItem) {
        setEditing((prev) => ({ ...prev, [c.id]: c.content }));
    }

    // 편집 취소: editing 상태에서 해당 ID를 제거한다.
    function cancelEdit(id: number) {
        setEditing((prev) => {
            const copy = { ...prev };
            delete copy[id];
            return copy;
        });
    }

    // 편집 중 본문 텍스트 입력 핸들러
    function onEditChange(id: number, value: string) {
        setEditing((prev) => ({ ...prev, [id]: value }));
    }

    // 저장: API로 PATCH 호출 후 목록을 다시 불러온다.
    async function saveEdit(id: number) {
        if (!me) { alert("로그인이 필요합니다."); return; }
        const text = (editing[id] ?? "").trim();
        if (!text) { alert("내용을 입력하세요."); return; }
        try {
            await updateComment(id, text);
            // 저장 성공 시 편집 모드 해제
            cancelEdit(id);
            // 목록 재조회로 서버 값 반영
            await reload(50);
        } catch (err: any) {
            alert(err?.message ?? "댓글 수정 실패");
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
                {comments.map((c) => {
                    const isMine = me && me.id === c.authorId; // 내 댓글 여부
                    const isEditing = editing[c.id] !== undefined; // 편집 모드 여부

                    return (
                        <li key={c.id} className="border rounded p-3">
                            <div className="flex items-center justify-between text-sm text-gray-500">
                <span>
                  {c.authorNickname} · {new Date(c.createdAt).toLocaleString("ko-KR")}
                </span>

                                {/* 내 댓글일 때만 수정/삭제 버튼 노출 */}
                                {isMine && !isEditing && (
                                    <div className="space-x-3">
                                        <button className="text-blue-600 hover:underline" onClick={() => startEdit(c)}>
                                            수정
                                        </button>
                                        <button className="text-red-600 hover:underline" onClick={() => onDelete(c.id)}>
                                            삭제
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* 본문 또는 편집 폼 */}
                            {!isEditing ? (
                                <p className="mt-2 whitespace-pre-wrap">{c.content}</p>
                            ) : (
                                <div className="mt-2">
                  <textarea
                      className="w-full border rounded p-2"
                      rows={3}
                      value={editing[c.id] ?? ""}
                      onChange={(e) => onEditChange(c.id, e.target.value)}
                  />
                                    <div className="mt-2 flex gap-2">
                                        <button
                                            className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                                            onClick={() => saveEdit(c.id)}
                                        >
                                            저장
                                        </button>
                                        <button
                                            className="px-3 py-1 rounded border"
                                            onClick={() => cancelEdit(c.id)}
                                        >
                                            취소
                                        </button>
                                    </div>
                                </div>
                            )}
                        </li>
                    );
                })}

                {comments.length === 0 && !loadingList && (
                    <li className="text-sm text-gray-500">첫 댓글을 남겨보세요.</li>
                )}
            </ul>
        </section>
    );
}