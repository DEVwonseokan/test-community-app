// web/src/app/posts/[id]/page.tsx
// ──────────────────────────────────────────────────────────────
// ✅ 이 파일은 "서버 컴포넌트"다. (React Hook 사용 금지)
// - 데이터 패칭(SSR)만 담당한다.
// - 버튼(수정/삭제)처럼 브라우저 상호작용이 필요한 부분은
//   별도의 "클라이언트 컴포넌트" 파일로 분리해서 import한다.
// ──────────────────────────────────────────────────────────────

import Link from "next/link";                         // Next 내부 라우팅 링크
import { fetchPost } from "@/lib/api";                // 백엔드에서 게시글 상세 가져오는 헬퍼
import ClientOwnedActionBar from "./ClientOwnedActionBar"; // 클라 전용 액션바(수정/삭제 버튼)

import Comments from "./Comments";                 // 댓글 UI (클라이언트 컴포넌트)
import { fetchComments } from "@/lib/api";         // SSR로 초기 목록도 가져오자
import { CommentItem } from "@/types/comment";

// 서버 컴포넌트(SSR): 게시글 상세 페이지
export default async function PostDetailPage({
                                                 params,
                                             }: {
    // Next.js 15+: 동적 라우트 params가 Promise로 전달됨 → await 필요
    params: Promise<{ id: string }>;
}) {
    // 1) URL에서 글 ID 꺼내기
    const {id: idStr} = await params;

    // 2) 문자열 → 숫자(정수) 검증
    const id = Number(idStr);
    if (!Number.isInteger(id)) throw new Error("Invalid id");

    // 3) 서버에서 상세 데이터 가져오기 (SSR)
    const post = await fetchPost(id);

    // SSR로 초기 댓글 목록 20개 가져오기 (선택이지만 UX 좋아짐)
    let initialComments: CommentItem[] | undefined = [];
    try {
        initialComments = await fetchComments(id, 20);
    } catch {
        // 403/500 등 실패해도 상세 페이지는 보여주고,
        // 댓글 영역은 클라이언트에서 재시도하거나 빈 상태로 시작한다.
        initialComments = [];
    }

    // 4) 날짜를 한국어 포맷으로 보기 좋게 변환
    const createdFmt = new Intl.DateTimeFormat("ko-KR", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(post.createdAt));
    const updatedFmt = new Intl.DateTimeFormat("ko-KR", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(post.updatedAt));

    // 5) 화면 렌더링
    return (
        <main className="min-h-screen p-8 max-w-3xl mx-auto space-y-6">
            {/* 상단: 목록으로 돌아가기 */}
            <nav className="text-sm">
                <Link href="/" className="text-blue-600 hover:underline">
                    ← 목록으로
                </Link>
            </nav>

            {/* 제목/메타 + (우측) 소유자 전용 액션바 */}
            <header className="flex items-start justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold">{post.title}</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        작성자: {post.authorNickname ?? "익명"} · 작성 {createdFmt}
                        {post.updatedAt !== post.createdAt && <> · 수정 {updatedFmt}</>}
                    </p>
                </div>

                {/* ⚠ SSR에서는 서버가 브라우저 토큰을 모르므로 post.mine이 false일 수 있음.
            버튼 노출 여부는 클라이언트에서 토큰을 디코드해 "내 글"인지 판별. */}
                <ClientOwnedActionBar postId={post.id} authorId={post.authorId} />
            </header>

            {/* 본문(줄바꿈 유지) */}
            <section className="prose max-w-none whitespace-pre-wrap">
                {post.content}
            </section>

            {/* 댓글 섹션 (initial을 넘겨주면 첫 렌더가 빠르고 깜빡임 적음) */}
            <Comments postId={post.id} initial={initialComments} />
        </main>
    );
}
