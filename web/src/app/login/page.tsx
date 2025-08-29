"use client";
/**
 * ⬆️ 이 파일은 브라우저에서 동작하는 "클라이언트 컴포넌트"임을 선언.
 * - Next.js는 기본이 서버 컴포넌트라서, 브라우저 전용 기능(로컬스토리지 접근 등)을 쓰려면 필수.
 */

import { useState } from "react";

/**
 * 로그인 폼 컴포넌트
 * - 화면에 입력박스 2개(이메일/비번) + 버튼 1개
 * - 제출 시 백엔드 /auth/login POST 호출 → accessToken을 받아 브라우저 저장
 * - 자바로 비유하면: 이벤트 리스너 달린 간단한 폼 + HTTP 요청
 */
export default function LoginPage() {
    // 🔹 입력칸과 오류메시지를 위한 상태값(state)
    // - React의 useState: 화면에 보여줄 값과, 그 값을 바꾸는 함수 세트를 제공
    const [email, setEmail] = useState("");       // 입력한 이메일
    const [password, setPassword] = useState(""); // 입력한 비밀번호
    const [error, setError] = useState<string | null>(null); // 오류 메시지

    // 🔹 폼 제출 이벤트 핸들러 (비동기 함수)
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault(); // 브라우저가 폼 제출로 페이지 이동하지 않게 기본동작 취소
        setError(null);     // 직전 오류 메시지 초기화

        try {
            // 백엔드 주소는 .env.local에 넣어둔 값 사용 (브라우저 노출 허용 접두어: NEXT_PUBLIC_)
            const base = process.env.NEXT_PUBLIC_API_BASE;

            // HTTP POST 요청: Content-Type은 JSON
            const res = await fetch(`${base}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                // JS 객체 → JSON 문자열로 변환
                body: JSON.stringify({ email, password }),
            });

            // res.ok: HTTP 200~299 범위면 true
            if (!res.ok) {
                throw new Error("로그인 실패(이메일/비밀번호를 다시 확인)");
            }

            // 응답 JSON 파싱: { accessToken: "..." }
            const data = await res.json();

            // ✅ 토큰을 브라우저 로컬스토리지에 저장 (아주 기초적인 방법)
            //  - 추후 보안 고려가 필요하면 "HTTP Only 쿠키" 방식으로 바꿀 수 있음
            localStorage.setItem("token", data.accessToken);

            alert("로그인 성공!");
            // ✅ 홈으로 이동 (SPA 라우팅 간단버전)
            window.location.href = "/";
        } catch (err: any) {
            // 오류가 발생하면 화면에 메시지 표시
            setError(err.message ?? "알 수 없는 오류");
        }
    }

    // 🔹 JSX = 화면 구성(HTML 같은 문법)
    return (
        <main className="min-h-screen p-8 flex justify-center items-center">
            <form
                onSubmit={handleSubmit}                   // 제출 이벤트 연결
                className="w-full max-w-sm space-y-4 border rounded-xl p-6 shadow"
            >
                <h1 className="text-xl font-bold">로그인</h1>

                {/* 입력박스 2개: value는 상태값, onChange로 상태 갱신 */}
                <input
                    type="email"
                    placeholder="이메일"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border rounded p-2"
                    required                                     // HTML5 필수 입력
                />
                <input
                    type="password"
                    placeholder="비밀번호"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border rounded p-2"
                    required
                />

                {/* 오류 메시지 영역 (있을 때만 렌더링) */}
                {error && <p className="text-red-600 text-sm">{error}</p>}

                {/* 제출 버튼 */}
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white rounded p-2 hover:bg-blue-700"
                >
                    로그인
                </button>
            </form>
        </main>
    );
}
