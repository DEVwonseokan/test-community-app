// web/src/app/page.tsx
import { getJson, fetchPosts } from "@/lib/api";
import { PostCard } from "@/components/PostCard";

/**
 * 서버 컴포넌트:
 * - 서버에서 직접 fetch가 실행되므로 .env 값을 안전하게 사용
 * - Java와 비교: 컨트롤러에서 모델을 주입하듯, 여기서는 데이터 fetch 후 JSX로 바로 렌더
 */
export default async function Home() {
    // /health (이전 단계와 동일)
    const health = await getJson<{ status: string }>("/health");

    // /posts 목록
    // - cache: "no-store"는 api.ts의 getJson에서 설정됨 → 항상 최신
    // - size=20 기본
    const posts = await fetchPosts(20);

    return (
        <main className="min-h-screen p-8 space-y-8">
            <header>
                <h1 className="text-2xl font-bold">Community App (Next.js)</h1>
                <p className="text-sm text-gray-500 mt-1">Backend /health: {health.status}</p>
            </header>

            <section>
                <h2 className="text-xl font-semibold mb-3">게시글</h2>

                {/* 비어있을 때 처리 */}
                {posts.length === 0 ? (
                    <div className="text-gray-500">아직 게시글이 없어요.</div>
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {posts.map((p) => (
                            <PostCard key={p.id} post={p} />
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}
