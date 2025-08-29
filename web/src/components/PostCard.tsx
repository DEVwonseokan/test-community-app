import type { PostListItem } from "@/types/post";

/**
 * 순수 프레젠테이션 컴포넌트
 * - 자바/스프링 MVC의 템플릿(Thymeleaf)과 달리, 리액트는 컴포넌트로 뷰를 구성
 * - props에 타입(PostListItem)을 명시하여 컴파일 타임에 안전성 확보
 */
export function PostCard({ post }: { post: PostListItem }) {
    // createdAt(ISO)을 사람이 보기 좋은 형식으로 변환
    const date = new Date(post.createdAt);
    const formatted = new Intl.DateTimeFormat("ko-KR", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);

    return (
        <article className="rounded-2xl border p-4 shadow-sm hover:shadow transition">
            <h3 className="text-lg font-semibold">{post.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{formatted}</p>
            {/* 추후 상세 페이지로 이동 링크를 추가할 예정: /posts/[id] */}
        </article>
    );
}