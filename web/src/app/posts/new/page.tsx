// web/src/app/posts/new/page.tsx
// ──────────────────────────────────────────────────────────────
// ✅ 이 파일은 "서버 컴포넌트"다. (React Hook 금지)
// 역할:
// 1) 화면 레이아웃 틀 제공
// 2) 실제 폼과 로그인 가드는 클라이언트 컴포넌트에서 처리
// ──────────────────────────────────────────────────────────────

import NewPostForm from "./NewPostForm";     // ✨ 클라이언트 폼 (아래 파일)

export default async function NewPostPage() {
    // 서버에서는 토큰(localStorage)에 접근 불가 → 인증/닉네임 처리는 클라에서
    return (
        <main className="min-h-screen p-8 flex justify-center">
            <div className="w-full max-w-2xl">
                <h1 className="text-xl font-bold mb-4">새 글 작성</h1>
                {/* 폼 자체는 브라우저 상호작용이 필요하므로 클라 컴포넌트로 분리 */}
                <NewPostForm />
            </div>
        </main>
    );
}
