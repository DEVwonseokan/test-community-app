// web/src/app/page.tsx
import { getJson, fetchPosts } from "@/lib/api";
import { PostTable } from "@/components/PostTable";

/**
 * 서버 컴포넌트:
 * - 서버에서 직접 fetch가 실행되므로 .env 값을 안전하게 사용
 * - Java와 비교: 컨트롤러에서 모델을 주입하듯, 여기서는 데이터 fetch 후 JSX로 바로 렌더
 */
export default async function Home() {
    const health = await getJson<{ status: string }>("/health");
    const posts = await fetchPosts(20);

    return (
        <main className="min-h-screen p-8 space-y-8">
            <header className="flex items-end justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Community App (Next.js)</h1>
                    <p className="text-sm text-gray-500 mt-1">Backend /health: {health.status}</p>
                </div>
                <div className="space-x-2">
                    <a href="/login" className="px-3 py-2 rounded border hover:bg-gray-50">로그인</a>
                    <a href="/posts/new" className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">글쓰기</a>
                </div>
            </header>

            <section className="space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">게시판</h2>
                    {/* 추후: 글쓰기 버튼 자리 */}
                </div>
                <PostTable posts={posts} />
            </section>
        </main>
    );
}