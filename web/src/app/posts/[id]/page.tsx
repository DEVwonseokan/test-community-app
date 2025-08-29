// web/src/app/posts/[id]/page.tsx
import Link from "next/link";
import { fetchPost } from "@/lib/api";

/**
 * 서버 컴포넌트:
 * - 라우트 파라미터(id)를 받아 서버에서 직접 API 호출
 * - Java라면 컨트롤러에서 서비스 호출 후 모델을 템플릿에 바인딩하는 느낌
 */
export default async function PostDetailPage({
                                                 params,
                                             }: {
    params: { id: string };
}) {
    // 문자열 → 숫자 변환 (안전 차원에서 정수화)
    const id = Number(params.id);
    if (!Number.isInteger(id)) {
        // Next.js의 notFound()를 써도 되지만, 간단히 오류를 던지고 not-found로 위임
        throw new Error("Invalid id");
    }

    // 백엔드 /posts/{id} 호출 (서버에서 실행되므로 .env가 안전하게 사용됨)
    const post = await fetchPost(id);

    const created = new Date(post.createdAt);
    const updated = new Date(post.updatedAt);
    const createdFmt = new Intl.DateTimeFormat("ko-KR", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(created);
    const updatedFmt = new Intl.DateTimeFormat("ko-KR", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(updated);

    return (
        <main className="min-h-screen p-8 max-w-3xl mx-auto space-y-6">
            <nav className="text-sm">
                {/* 목록으로 돌아가기 */}
                <Link href="/" className="text-blue-600 hover:underline">
                    ← 목록으로
                </Link>
            </nav>

            <header>
                <h1 className="text-2xl font-bold">{post.title}</h1>
                <p className="text-sm text-gray-500 mt-1">
                    작성자: {post.authorNickname ?? "익명"} · 작성 {createdFmt}
                    {post.updatedAt !== post.createdAt && (
                        <> · 수정 {updatedFmt}</>
                    )}
                </p>
            </header>

            {/* 본문: 프리포맷 텍스트 스타일 */}
            <section className="prose max-w-none whitespace-pre-wrap">
                {post.content}
            </section>
        </main>
    );
}
