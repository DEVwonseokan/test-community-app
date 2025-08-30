// web/src/components/Header.tsx
"use client";
// ──────────────────────────────────────────────────────────────
// ✅ 클라이언트 컴포넌트
// - 로컬스토리지의 JWT 토큰을 확인해서 로그인 상태를 표시한다.
// - 로그인 안 했으면 "로그인" 버튼을, 로그인 했으면 "내 닉네임 / 로그아웃" 표시.
// - 로그아웃 버튼을 누르면 localStorage에서 토큰을 지우고 홈으로 이동.
// ──────────────────────────────────────────────────────────────

import * as React from "react";              // useState, useEffect 사용
import Link from "next/link";                // 페이지 이동용
import { getToken, getUserIdFromToken } from "@/lib/auth"; // 토큰 헬퍼

export default function Header() {
    // 1) 내 userId 상태
    const [myId, setMyId] = React.useState<number | null>(null);

    // 2) 로그인 상태 여부를 useEffect에서 체크
    React.useEffect(() => {
        const token = getToken();
        if (!token) { setMyId(null); return; }
        const uid = getUserIdFromToken(token);   // JWT payload에서 userId 추출
        setMyId(uid);
    }, []);

    // 3) 로그아웃 핸들러
    function logout() {
        localStorage.removeItem("token");        // 토큰 삭제
        alert("로그아웃 되었습니다.");
        window.location.href = "/";              // 홈으로 이동
    }

    // 4) 렌더링
    return (
        <header className="flex items-center justify-between p-4 border-b">
            {/* 좌측 로고/타이틀 */}
            <Link href="/" className="text-xl font-bold">Community App</Link>

            {/* 우측 로그인 상태 */}
            <div className="space-x-2">
                {myId == null ? (
                    // 로그인 안 한 상태
                    <Link
                        href="/login"
                        className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                    >
                        로그인
                    </Link>
                ) : (
                    // 로그인 상태
                    <>
                        {/* 닉네임 대신 userId만 표시 (추후 닉네임 API로 교체 가능) */}
                        <span className="text-sm text-gray-600">User #{myId}</span>
                        <button
                            onClick={logout}
                            className="px-3 py-2 rounded border hover:bg-gray-50"
                        >
                            로그아웃
                        </button>
                    </>
                )}
            </div>
        </header>
    );
}
