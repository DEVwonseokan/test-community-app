// web/src/app/login/LoginForm.tsx
"use client";
// ──────────────────────────────────────────────────────────────
// ✅ 이 파일은 "클라이언트 컴포넌트"다. (React Hook 사용 가능)
// 역할:
// 1) 이메일/비밀번호 입력 폼을 제공
// 2) 제출 시 POST /auth/login 호출 → accessToken을 localStorage에 저장
// 3) URL 쿼리의 returnTo가 있으면 그 경로로 이동, 없으면 홈('/')으로 이동
// ──────────────────────────────────────────────────────────────

import * as React from "react";                          // useState
import { useRouter, useSearchParams } from "next/navigation"; // 클라 라우팅/쿼리
import { login } from "@/lib/api";                        // 로그인 API 호출
import { getUserIdFromToken } from "@/lib/auth";          // 토큰 디코드(선택: 디버그용)

export default function LoginForm() {
    // 1) 라우팅/쿼리 훅
    const router = useRouter();                 // 페이지 이동에 사용
    const search = useSearchParams();           // ?returnTo=/xxx 읽기

    // 2) 입력/상태
    const [email, setEmail] = React.useState("");          // 이메일 입력값
    const [password, setPassword] = React.useState("");    // 비밀번호 입력값
    const [error, setError] = React.useState<string | null>(null); // 에러 메시지
    const [loading, setLoading] = React.useState(false);   // 제출 중 여부

    // 3) 제출 핸들러
    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();          // 기본 제출(리로드) 방지
        setError(null);              // 직전 에러 초기화
        setLoading(true);            // 버튼 비활성화

        try {
            // 3-1) 간단한 프론트 유효성
            if (!email.trim()) throw new Error("이메일을 입력하세요.");
            if (!password) throw new Error("비밀번호를 입력하세요.");

            // 3-2) 로그인 API 호출
            const { accessToken } = await login({ email, password });

            // 3-3) 토큰을 localStorage에 저장 (헤더/보호 페이지가 사용)
            localStorage.setItem("token", accessToken);

            // (선택) 디버그: 내 userId가 무엇인지 확인하고 싶다면 아래 주석 해제
            // console.log("userId:", getUserIdFromToken(accessToken));

            // 3-4) returnTo가 있으면 그쪽으로, 없으면 홈('/')으로 이동
            const returnTo = search.get("returnTo") || "/";
            router.replace(returnTo);
        } catch (err: any) {
            // 3-5) 실패 메시지
            setError(err?.message ?? "로그인에 실패했습니다.");
        } finally {
            // 3-6) 완료
            setLoading(false);
        }
    }

    // 4) 폼 렌더링
    return (
        <form onSubmit={onSubmit} className="space-y-4 border rounded-xl p-6 shadow">
            {/* 이메일 입력 */}
            <div className="space-y-1">
                <label className="text-sm text-gray-600">이메일</label>
                <input
                    type="email"
                    className="w-full border rounded p-2"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                />
            </div>

            {/* 비밀번호 입력 */}
            <div className="space-y-1">
                <label className="text-sm text-gray-600">비밀번호</label>
                <input
                    type="password"
                    className="w-full border rounded p-2"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                />
            </div>

            {/* 에러 메시지 (있을 때만) */}
            {error && <p className="text-red-600 text-sm">{error}</p>}

            {/* 버튼 영역 */}
            <div className="flex gap-2">
                <button
                    type="submit"
                    disabled={loading} // 제출 중 비활성화
                    className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                >
                    {loading ? "로그인 중..." : "로그인"}
                </button>

                {/* 홈으로 돌아가기 (선택) */}
                <a href="/" className="px-3 py-2 rounded border hover:bg-gray-50">취소</a>
            </div>

            {/* (선택) 개발 편의: 데모 계정 안내 문구 */}
            <p className="text-xs text-gray-500">
                데모 계정: <code>test@example.com</code> / <code>pass1234</code>
            </p>
        </form>
    );
}
