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
import { fetchMe } from "@/lib/api";      // ✨ /auth/me 호출
import { getToken } from "@/lib/auth";    // 토큰 존재 여부만 간단히 확인

export default function Header() {
    // 1) 로그인 사용자 상태 (없으면 null)
    const [me, setMe] = React.useState<{ id: number; nickname: string } | null>(null);

    // 2) 마운트 시 내 정보 불러오기
    React.useEffect(() => {
        // (안전장치) 토큰 없으면 바로 비로그인 처리
        const t = getToken();
        if (!t) { setMe(null); return; }

        // /auth/me 호출 → 성공 시 닉네임/ID 상태 저장
        fetchMe().then((data) => {
            if (!data) { setMe(null); return; }
            setMe({ id: data.id, nickname: data.nickname });
        }).catch(() => setMe(null));
    }, []);

    // 3) 로그아웃 핸들러
    function logout() {
        localStorage.removeItem("token");        // 토큰 삭제
        alert("로그아웃 되었습니다.");
        window.location.href = "/";              // 홈으로 이동
    }

    // 4) 렌더
    return (
        <header className="flex items-center justify-between p-4 border-b">
            {/* 좌측 로고 */}
            <Link href="/" className="text-xl font-bold">Community App</Link>

            {/* 우측 영역 */}
            <div className="space-x-2">
                {me ? (
                    // ✅ 로그인 상태
                    <>
                        {/* 닉네임 표시 */}
                        <span className="text-sm text-gray-600">
              {me.nickname} (<span className="text-gray-400">#{me.id}</span>)
            </span>

                        {/* 글쓰기 버튼 (로그인 상태에서만 보임) */}
                        <Link
                            href="/posts/new"
                            className="px-3 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                        >
                            글쓰기
                        </Link>

                        {/* 로그아웃 버튼 */}
                        <button
                            onClick={logout}
                            className="px-3 py-2 rounded border hover:bg-gray-50"
                        >
                            로그아웃
                        </button>
                    </>
                ) : (
                    // ❌ 비로그인 상태
                    <>
                        <Link
                            href="/login"
                            className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                        >
                            로그인
                        </Link>
                    </>
                )}
            </div>
        </header>
    );
}