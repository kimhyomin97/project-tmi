import type { NextConfig } from "next";

// BE 호출 경로: 브라우저 → 같은 출처 /api/v1/* → (Next 서버가 중계) → core.
// - 같은 출처라 CORS가 생기지 않고, BE 주소가 브라우저에 노출되지 않는다.
// - CORE_API_URL은 서버 전용(NEXT_PUBLIC_ 아님). gateway 연결 시 이 값만 gateway 주소로 바꾼다.
// - 값은 빌드 시점에 고정된다. 바꾸면 다시 빌드해야 한다.
const coreApiUrl = process.env.CORE_API_URL ?? "http://localhost:8080";

const nextConfig: NextConfig = {
  async rewrites() {
    return [{ source: "/api/v1/:path*", destination: `${coreApiUrl}/api/v1/:path*` }];
  },
};

export default nextConfig;
