"use client"; // Next 규약: 에러 경계는 client 컴포넌트여야 한다

// 루트 레이아웃 자체가 깨졌을 때의 마지막 안전망. 루트 레이아웃을 대신하므로
// html·body·전역 CSS·다크 클래스를 여기서 직접 넣는다(Next 문서 error.md "global-error").
import "./globals.css";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="ko" className="dark h-full antialiased">
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <title>오류 · TMI 콘솔</title>
        <main className="mx-auto flex w-full max-w-5xl flex-col items-start gap-4 px-6 py-16">
          <h1 className="text-2xl font-bold tracking-tight">콘솔을 불러오지 못했습니다</h1>
          <p className="text-sm text-muted-foreground">
            {error.digest
              ? `화면 뼈대를 그리는 중 오류가 났습니다. 서버 로그에서 오류 코드 ${error.digest}를 검색하면 원인을 볼 수 있습니다.`
              : `화면 뼈대를 그리는 중 오류가 났습니다: ${error.message}`}
          </p>
          <Button onClick={() => retry()}>다시 시도</Button>
        </main>
      </body>
    </html>
  );
}
