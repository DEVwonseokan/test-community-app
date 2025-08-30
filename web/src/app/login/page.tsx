// web/src/app/login/page.tsx
// ──────────────────────────────────────────────────────────────
// ✅ 이 파일은 "서버 컴포넌트"다. (React Hook 금지)
// 역할:
// 1) 레이아웃 틀 제공
// 2) 실제 폼/이벤트/리다이렉트는 클라이언트 컴포넌트에서 처리
// ──────────────────────────────────────────────────────────────

import LoginForm from "./LoginForm"; // ✨ 클라이언트 전용 폼 (아래 파일)

export default async function LoginPage() {
    // 서버에서는 로컬스토리지 접근 불가 → 폼/제출/리다이렉트는 클라에서 처리
    return (
        <main className="min-h-screen p-8 flex justify-center">
            <div className="w-full max-w-md">
                <h1 className="text-xl font-bold mb-4">로그인</h1>
                <LoginForm />
            </div>
        </main>
    );
}
