// web/src/app/posts/new/NewPostForm.tsx
"use client";
// ──────────────────────────────────────────────────────────────
// ✅ 이 파일은 "클라이언트 컴포넌트"다. (React Hook 사용 가능)
// 역할:
// 1) 마운트 즉시 로그인 여부를 확인(토큰/내 정보 호출)
// 2) 로그인 X → 로그인 페이지로 안내(리다이렉트)
// 3) 로그인 O → 상단에 닉네임 보여주고 글쓰기 폼 제공
// 4) 제출 시 POST /posts 호출, 성공하면 상세로 이동
// ──────────────────────────────────────────────────────────────

import * as React from "react";                  // useState/useEffect
import { useRouter, useSearchParams } from "next/navigation"; // 클라 라우팅/쿼리
import { createPost, fetchMe } from "@/lib/api"; // 글쓰기/내 정보 API
import { getToken } from "@/lib/auth";           // 토큰 유틸

export default function NewPostForm() {
    // 1) 라우터 훅: 성공 시 페이지 이동 등에 사용
    const router = useRouter();

    // 2) 상태: 로그인 사용자(닉네임/ID), 입력 필드, 로딩/에러 표시
    const [me, setMe] = React.useState<{ id: number; nickname: string } | null>(null); // 로그인 사용자
    const [loading, setLoading] = React.useState(true);          // 초기 로딩(가드 체크 중)
    const [title, setTitle] = React.useState("");                // 제목 입력값
    const [content, setContent] = React.useState("");            // 내용 입력값
    const [error, setError] = React.useState<string | null>(null); // 에러 메시지
    const [saving, setSaving] = React.useState(false);           // 저장 중(중복 제출 방지)

    // 3) 마운트 시 로그인 가드 + 닉네임 가져오기
    React.useEffect(() => {
        // 3-1) 로컬스토리지에 토큰이 없으면 비로그인 → 로그인 페이지로 이동
        const token = getToken();
        if (!token) {
            alert("로그인이 필요합니다.");
            // 로그인 후 다시 돌아오게 returnTo를 붙여서 보냄
            window.location.href = `/login?returnTo=${encodeURIComponent("/posts/new")}`;
            return;
        }

        // 3-2) /auth/me 호출해 닉네임/ID를 가져옴
        fetchMe()
            .then((m) => {
                if (!m) {
                    // 토큰 만료/무효 등 → 로그인 페이지 이동
                    alert("세션이 만료되었습니다. 다시 로그인해주세요.");
                    window.location.href = `/login?returnTo=${encodeURIComponent("/posts/new")}`;
                    return;
                }
                // 성공: 헤더에 표시할 닉네임/ID를 상태에 저장
                setMe({ id: m.id, nickname: m.nickname });
            })
            .catch(() => {
                // 네트워크 오류 등 → 로그인 화면으로 안내
                alert("인증 확인에 실패했습니다. 다시 로그인해주세요.");
                window.location.href = `/login?returnTo=${encodeURIComponent("/posts/new")}`;
            })
            .finally(() => setLoading(false)); // 가드 체크 종료
    }, []);

    // 4) 제출 핸들러: 글 생성 → 상세 페이지로 이동
    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();        // 폼 기본 제출 막기(페이지 리로드 방지)
        setError(null);            // 직전 에러 초기화
        setSaving(true);           // 중복 제출 방지

        try {
            // 4-1) 간단한 프론트 유효성 (서버에서도 검증하지만 UX를 위해)
            if (!title.trim()) throw new Error("제목을 입력하세요.");
            if (!content.trim()) throw new Error("내용을 입력하세요.");

            // 4-2) 실제 글 생성 API 호출
            const { id } = await createPost({ title, content });

            // 4-3) 성공: 상세 페이지로 이동
            alert("작성되었습니다.");
            router.push(`/posts/${id}`);
        } catch (err: any) {
            // 4-4) 실패: 메시지 표시
            setError(err?.message ?? "작성에 실패했습니다.");
        } finally {
            // 4-5) 완료
            setSaving(false);
        }
    }

    // 5) 로딩 중이면 로딩 표시(가드 체크 완료 전)
    if (loading) {
        return (
            <div className="border rounded-xl p-6 shadow">
                <p className="text-sm text-gray-500">인증 확인 중...</p>
            </div>
        );
    }

    // 6) (이론상) 비로그인 상태면 위에서 리다이렉트되므로 여기선 me가 존재해야 함
    if (!me) return null;

    // 7) 렌더: 작성자 닉네임 표시 + 폼
    return (
        <form onSubmit={onSubmit} className="space-y-4 border rounded-xl p-6 shadow">
            {/* 작성자 정보 (헤더에도 보이지만, 폼 상단에도 한 번 더 명시) */}
            <div className="text-sm text-gray-600">
                작성자: <strong>{me.nickname}</strong> <span className="text-gray-400">(# {me.id})</span>
            </div>

            {/* 제목 입력 */}
            <input
                className="w-full border rounded p-2"
                value={title}                               // 상태값을 입력칸에 바인딩
                onChange={(e) => setTitle(e.target.value)}  // 입력 시 상태 갱신
                placeholder="제목을 입력하세요"
                maxLength={200}                             // 서버 @Size(max=200)와 맞춤
                required                                    // HTML5 필수
            />

            {/* 내용 입력 */}
            <textarea
                className="w-full border rounded p-2 h-48"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="내용을 입력하세요"
                required
            />

            {/* 에러 메시지(있을 때만 표시) */}
            {error && <p className="text-red-600 text-sm">{error}</p>}

            {/* 버튼 영역 */}
            <div className="flex gap-2">
                <button
                    type="submit"
                    disabled={saving} // 저장 중 비활성화
                    className="px-3 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
                >
                    {saving ? "작성 중..." : "작성"}
                </button>
                <a href="/" className="px-3 py-2 rounded border hover:bg-gray-50">취소</a>
            </div>
        </form>
    );
}
