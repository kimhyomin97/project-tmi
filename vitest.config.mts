// 동작 테스트(Vitest + Testing Library + MSW). 구성은 Next 설치본 가이드
// node_modules/next/dist/docs/01-app/02-guides/testing/vitest.md 기준.
// 가이드의 vite-tsconfig-paths 플러그인 대신 Vite 내장 resolve.tsconfigPaths로 @/ 경로를 푼다(Vite가 권고).
// async Server Component는 Vitest가 지원하지 않는다 → 데이터 화면은 client 컴포넌트라 대상이 된다.
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true },
  test: {
    environment: "jsdom",
    // 규칙은 *.test지만 관성으로 *.spec을 써도 조용히 빠지지 않게 함께 실행한다.
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    // it.only가 남으면 나머지 테스트가 가려진 채 통과한다 → 실패로 처리한다.
    allowOnly: false,
    setupFiles: ["./src/test/setup.ts"],
  },
});
