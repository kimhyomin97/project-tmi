"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, type ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* 개발용 버튼(운영 빌드에는 없음). 떠 있는 버튼은 네 모서리 어디서든 조작 요소(footer 링크·접힌 사이드바의 펼치기 버튼·☰)를
          덮어서, 화면 흐름 맨 아래(footer 다음)에 둔다. dev에서만 페이지 끝에 약 48px 여분 스크롤이 생긴다(운영 빌드에는 없음). */}
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="relative" />
    </QueryClientProvider>
  );
}
