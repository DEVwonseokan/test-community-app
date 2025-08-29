// web/src/app/page.tsx
import { getJson } from "@/lib/api";

/**
 * Next.js App Router의 서버 컴포넌트 예시
 * - Java/Spring의 컨트롤러와 달리, 이 컴포넌트 자체가 비동기 렌더링 가능
 * - 서버에서 fetch를 호출하므로 .env의 값이 안전하게 사용됨
 */
export default async function Home() {
  // 타입 정의: { status: string }
  const health = await getJson<{ status: string }>("/health");

  return (
      <main className="min-h-screen p-8">
        <h1 className="text-2xl font-bold mb-4">Community App (Next.js)</h1>

        {/* 헬스 체크 결과 표시 */}
        <div className="rounded-xl border p-4">
          <div className="text-sm text-gray-500">Backend /health</div>
          <div className="text-lg">
            status: <span className="font-mono">{health.status}</span>
          </div>
        </div>

        <p className="mt-6 text-sm text-gray-500">
          다음 단계에서 /posts 목록을 불러와 카드 리스트로 렌더링할게요.
        </p>
      </main>
  );
}
