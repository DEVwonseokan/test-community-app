// web/src/app/posts/[id]/edit/page.tsx
// ──────────────────────────────────────────────────────────────
// ✅ 이 파일은 "서버 컴포넌트"입니다. (React Hook 사용 금지)
// 역할:
// 1) URL의 [id]를 읽고
// 2) 서버에서 해당 글 상세를 가져와
// 3) 초기 값(title/content)을 클라이언트 폼 컴포넌트로 넘깁니다.
// ──────────────────────────────────────────────────────────────

import { fetchPost } from "@/lib/api";               // 백엔드에서 게시글 상세 가져오기(SSR 가능)
import EditClientForm from "./EditClientForm";       // ✨ 클라이언트 전용 폼(아래 파일)

export default async function EditPage({
                                           params,
                                       }: {
    // Next.js 15+: 동적 라우트 params가 Promise로 전달됨 → await 필요
    params: Promise<{ id: string }>;
}) {
    // 1) URL 파라미터에서 id 꺼내기 (문자열)
    const { id: idStr } = await params;

    // 2) 문자열 → 숫자(정수 검사)
    const id = Number(idStr);
    if (!Number.isInteger(id)) throw new Error("Invalid id");

    // 3) 서버에서 기존 글 상세 데이터를 가져옴
    const post = await fetchPost(id);

    // 4) 클라이언트 폼에 초기값과 id를 전달하면서 렌더
    return (
        <main className="min-h-screen p-8 flex justify-center">
            <div className="w-full max-w-2xl">
                <h1 className="text-xl font-bold mb-4">글 수정</h1>
                <EditClientForm
                    id={post.id}                  // 수정 대상 글의 ID
                    defaultTitle={post.title}     // 초기 제목
                    defaultContent={post.content} // 초기 내용
                />
            </div>
        </main>
    );
}
