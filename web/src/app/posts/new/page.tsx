"use client"; // 브라우저 기능(로컬스토리지) 사용을 위해 필수

import { useState } from "react";

/**
 * 새 글 작성 폼
 * - 입력: 제목/내용
 * - 제출: 백엔드 /posts 에 POST (헤더에 Bearer 토큰 포함)
 * - 성공 시 홈으로 이동
 */
export default function NewPostPage() {
    // 🔹 상태값: 사용자가 입력 중인 제목/내용 + 오류 메시지
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [error, setError] = useState<string | null>(null);

    // 🔹 폼 제출 이벤트
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault(); // 페이지 리로드 방지
        setError(null);

        try {
            // 1) 로그인 때 저장해 둔 토큰 꺼내기
            const token = localStorage.getItem("token");
            if (!token) throw new Error("로그인이 필요합니다. 먼저 로그인해주세요.");

            // 2) 백엔드 주소 읽기
            const base = process.env.NEXT_PUBLIC_API_BASE;

            // 3) /posts 로 POST 요청
            const res = await fetch(`${base}/posts`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    // ✅ 인증 헤더(아주 중요!): "Bearer <토큰값>"
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ title, content }),
            });

            // 201 Created 가 정상. .ok가 false면 에러로 처리
            if (!res.ok) throw new Error(`글쓰기 실패 (status: ${res.status})`);

            // 성공 알림 + 홈으로 이동
            alert("작성 완료!");
            window.location.href = "/";
        } catch (err: any) {
            setError(err.message ?? "알 수 없는 오류");
        }
    }

    // 🔹 화면
    return (
        <main className="min-h-screen p-8 flex justify-center items-center">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-lg space-y-4 border rounded-xl p-6 shadow"
            >
                <h1 className="text-xl font-bold">새 글 작성</h1>

                {/* 제목 입력 */}
                <input
                    type="text"
                    placeholder="제목"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border rounded p-2"
                    required // 빈 제목 방지
                />

                {/* 내용 입력 (여러 줄) */}
                <textarea
                    placeholder="내용"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full border rounded p-2 h-40"
                    required
                />

                {/* 오류 메시지 표시 */}
                {error && <p className="text-red-600 text-sm">{error}</p>}

                {/* 제출 버튼 */}
                <button
                    type="submit"
                    className="w-full bg-green-600 text-white rounded p-2 hover:bg-green-700"
                >
                    작성
                </button>
            </form>
        </main>
    );
}
