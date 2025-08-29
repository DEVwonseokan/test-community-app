import Link from "next/link";
import type { PostListItem } from "@/types/post";

/**
 * 프레젠테이션 컴포넌트
 * - 제목을 클릭하면 /posts/[id] 로 이동
 * - Java MVC의 a href와 동일하지만, Next.js의 <Link>는 클라이언트 라우팅을 제공
 */
export function PostCard({ post }: { post: PostListItem }) {
    const date = new Date(post.createdAt);
    const formatted = new Intl.DateTimeFormat("ko-KR", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);

    return (
        <article className="rounded-2xl border p-4 shadow-sm hover:shadow transition">
            <h3 className="text-lg font-semibold">
                {/* 상세 페이지로 이동 */}
                <Link href={`/posts/${post.id}`} className="hover:underline">
                    {post.title}
                </Link>
            </h3>
            <p className="text-sm text-gray-500 mt-1">{formatted}</p>
        </article>
    );
}