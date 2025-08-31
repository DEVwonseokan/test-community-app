// web/src/app/login/page.tsx
// ──────────────────────────────────────────────────────────────
// ✅ 이 파일은 "서버 컴포넌트"다. (React Hook 금지)
// 역할:
// 1) 레이아웃 틀 제공
// 2) 실제 폼/이벤트/리다이렉트는 클라이언트 컴포넌트에서 처리
// ──────────────────────────────────────────────────────────────

import { Suspense } from "react";
import LoginForm from "./LoginForm";

// 페이지는 서버에서 쿼리 파라미터를 받습니다.
export default function LoginPage({
                                      searchParams,
                                  }: {
    searchParams?: { returnTo?: string };
}) {
    // 쿼리에서 returnTo를 안전하게 파싱
    const returnToRaw = searchParams?.returnTo ?? "/";
    const returnTo =
        typeof returnToRaw === "string" ? decodeURIComponent(returnToRaw) : "/";

    // 클라이언트 컴포넌트를 Suspense로 감싸면 프리렌더링 문제가 사라집니다.
    return (
        <Suspense fallback={null}>
            <LoginForm returnTo={returnTo} />
        </Suspense>
    );
}
