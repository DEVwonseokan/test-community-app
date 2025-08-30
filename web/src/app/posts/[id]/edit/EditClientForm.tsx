// web/src/app/posts/[id]/edit/EditClientForm.tsx
"use client";
// ──────────────────────────────────────────────────────────────
// ✅ 이 파일은 "클라이언트 컴포넌트"입니다. (React Hook 사용 가능)
// 역할:
// - 입력 폼 상태를 관리하고(onChange)
// - 제출 시 PATCH /posts/{id} API를 호출해 수정합니다.
// - 성공/실패 피드백 및 라우팅도 담당합니다.
// ──────────────────────────────────────────────────────────────

import * as React from "react";                        // useState, useEffect 등
import { updatePost } from "@/lib/api";                // 백엔드 수정 API 호출 헬퍼
import { getToken } from "@/lib/auth";                 // 로컬스토리지 토큰 가져오기

// 폼 컴포넌트의 Props 정의
type Props = {
    id: number;           // 수정할 글 ID
    defaultTitle: string; // 초기 제목
    defaultContent: string; // 초기 내용
};

export default function EditClientForm({
                                           id,
                                           defaultTitle,
                                           defaultContent,
                                       }: Props) {
    // 1) 입력 필드 상태 정의
    const [title, setTitle] = React.useState(defaultTitle);      // 제목 상태
    const [content, setContent] = React.useState(defaultContent); // 내용 상태

    // 2) UI용 보조 상태
    const [error, setError] = React.useState<string | null>(null); // 에러 메시지
    const [saving, setSaving] = React.useState(false);             // 저장 중 여부(버튼 비활성화)

    // 3) 제출 핸들러 (PATCH /posts/{id})
    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();      // 폼 기본 제출(페이지 리로드) 방지
        setError(null);          // 이전 에러 제거
        setSaving(true);         // 저장 중 표시

        try {
            // 3-1) 로그인 체크: 토큰이 없으면 수정 불가
            const token = getToken();
            if (!token) throw new Error("로그인이 필요합니다.");

            // 3-2) 실제 수정 API 호출 (백엔드가 권한 검사)
            await updatePost(id, { title, content });

            // 3-3) 성공 메시지 후 상세 페이지로 이동
            alert("수정되었습니다.");
            window.location.href = `/posts/${id}`;
        } catch (err: any) {
            // 3-4) 실패 시 메시지 표시
            setError(err?.message ?? "수정에 실패했습니다.");
        } finally {
            // 3-5) 항상 저장중 종료
            setSaving(false);
        }
    }

    // 4) 렌더링: 간단한 폼 UI
    return (
        <form onSubmit={onSubmit} className="space-y-4 border rounded-xl p-6 shadow">
            {/* 제목 입력 */}
            <input
                className="w-full border rounded p-2"
                value={title}                       // 상태값 표시
                onChange={(e) => setTitle(e.target.value)} // 입력 시 상태 갱신
                placeholder="제목을 입력하세요"
                required                            // HTML5 필수
            />

            {/* 내용 입력 */}
            <textarea
                className="w-full border rounded p-2 h-48"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="내용을 입력하세요"
                required
            />

            {/* 에러 메시지 (있을 때만) */}
            {error && <p className="text-red-600 text-sm">{error}</p>}

            {/* 버튼 영역 */}
            <div className="flex gap-2">
                <button
                    type="submit"
                    disabled={saving} // 저장 중이면 비활성화
                    className="px-3 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
                >
                    {saving ? "저장 중..." : "저장"}
                </button>

                {/* 취소: 상세 페이지로 돌아가기 */}
                <a href={`/posts/${id}`} className="px-3 py-2 rounded border hover:bg-gray-50">
                    취소
                </a>
            </div>
        </form>
    );
}
