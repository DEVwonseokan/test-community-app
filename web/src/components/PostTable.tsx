import Link from "next/link";
import type { PostListItem } from "@/types/post";

/**
 * 게시판 테이블 형태 리스트
 * - 정렬/페이징은 추후 서버/클라이언트에서 확장 가능
 */
export function PostTable({ posts }: { posts: PostListItem[] }) {
    return (
        <div className="overflow-x-auto rounded-2xl border">
            <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                <tr className="[&>th]:px-4 [&>th]:py-3 text-left text-gray-600">
                    <th style={{ width: 80 }}>번호</th>
                    <th>제목</th>
                    <th style={{ width: 200 }}>작성일</th>
                </tr>
                </thead>
                <tbody>
                {posts.length === 0 ? (
                    <tr>
                        <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                            아직 게시글이 없어요.
                        </td>
                    </tr>
                ) : (
                    posts.map((p, idx) => {
                        const date = new Date(p.createdAt);
                        const formatted = new Intl.DateTimeFormat("ko-KR", {
                            dateStyle: "medium",
                            timeStyle: "short",
                        }).format(date);
                        // 번호: 화면상 역순 표시(최상단이 가장 최신이라는 가정)
                        const no = posts.length - idx;
                        return (
                            <tr
                                key={p.id}
                                className="border-t hover:bg-gray-50 transition"
                            >
                                <td className="px-4 py-3 text-gray-500 text-center">{no}</td>
                                <td className="px-4 py-3">
                                    <Link
                                        href={`/posts/${p.id}`}
                                        className="hover:underline text-blue-700"
                                    >
                                        {p.title}
                                    </Link>
                                </td>
                                <td className="px-4 py-3 text-gray-500">{formatted}</td>
                            </tr>
                        );
                    })
                )}
                </tbody>
            </table>
        </div>
    );
}
