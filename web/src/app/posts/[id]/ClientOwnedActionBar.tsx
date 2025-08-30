// web/src/app/posts/[id]/ClientOwnedActionBar.tsx
"use client";
// ──────────────────────────────────────────────────────────────
// ✅ 이 파일은 "클라이언트 컴포넌트"다. (React Hook 사용 가능)
// - 로컬스토리지에서 토큰을 읽고 내 userId를 디코드한다.
// - 서버가 내려준 authorId와 비교해 "내 글"일 때만 수정/삭제 버튼을 노출한다.
// - 삭제 버튼 클릭 시 실제 API 호출(백엔드 권한검사로 최종 보호).
// ──────────────────────────────────────────────────────────────

import * as React from "react";                        // useState/useEffect
import Link from "next/link";                          // 수정 페이지 이동
import { getToken, getUserIdFromToken } from "@/lib/auth"; // 토큰 읽기/디코딩 유틸
import { deletePost } from "@/lib/api";                // 삭제 API 헬퍼

// 삭제 버튼 (분리해도 되고, 아래에 포함해도 됨)
function DeleteButton({ postId }: { postId: number }) {
    // 클릭 핸들러: 사용자 확인 → API 호출 → 이동
    async function onClick() {
        if (!confirm("정말 이 글을 삭제할까요?")) return;
        try {
            await deletePost(postId);      // DELETE /posts/{id} (Authorization 포함)
            alert("삭제되었습니다.");
            window.location.href = "/";
        } catch (e: any) {
            alert(e?.message ?? "삭제에 실패했습니다.");
        }
    }

    return (
        <button
            onClick={onClick}
            className="px-3 py-2 rounded border text-red-600 hover:bg-red-50"
        >
            삭제
        </button>
    );
}

// 소유자 전용 액션바(수정/삭제)
export default function ClientOwnedActionBar({
                                                 postId,
                                                 authorId,
                                             }: {
    postId: number;          // 현재 글 ID
    authorId: number | null; // 작성자 ID(없으면 버튼을 숨김)
}) {
    // 1) 내 userId 상태 (초기값 null)
    const [myId, setMyId] = React.useState<number | null>(null);

    // 2) 마운트 시점에 로컬스토리지 토큰을 읽고 userId를 디코드
    React.useEffect(() => {
        const token = getToken();                  // 로그인 시 저장해 둔 토큰
        if (!token) { setMyId(null); return; }     // 비로그인 → 버튼 숨김

        const uid = getUserIdFromToken(token);     // payload에서 sub/userId/id 등 추출
        setMyId(uid ?? null);                      // 숫자면 저장, 아니면 null
    }, []);

    // 3) 작성자 정보가 없거나, 아직 내 userId를 못 구하면 버튼 숨김
    if (authorId == null || myId == null) return null;

    // 4) 내가 작성한 글이 아니면 버튼 숨김
    if (myId !== authorId) return null;

    // 5) "내 글"일 때만 수정/삭제 버튼 노출
    return (
        <div className="flex gap-2">
            {/* 수정 페이지 이동 */}
            <Link href={`/posts/${postId}/edit`} className="px-3 py-2 rounded border hover:bg-gray-50">
                수정
            </Link>

            {/* 삭제 버튼 */}
            <DeleteButton postId={postId} />
        </div>
    );
}
