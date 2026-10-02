"use client"; // Next 규약: 에러 경계는 client 컴포넌트여야 한다

// 렌더 버그 안전망(L5). BE 호출 실패는 여기까지 오지 않고 각 컴포넌트 안에서 isError로 보여준다.
import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ConsoleError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  // retry()만으로는 TanStack Query 캐시의 에러가 다시 던져지므로 먼저 초기화한다(실측).
  const { reset: resetQueries } = useQueryErrorResetBoundary();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div role="alert" className="flex flex-col items-start gap-3 rounded-lg border border-border bg-card p-6">
      <h2 className="text-lg font-bold">화면을 표시하지 못했습니다</h2>
      <p className="text-sm text-muted-foreground">
        일시적인 문제일 수 있습니다. 다시 시도해도 같으면 새로고침해 주세요.
        {error.digest ? ` (오류 코드: ${error.digest})` : null}
      </p>
      <Button
        onClick={() => {
          resetQueries();
          retry();
        }}
      >
        다시 시도
      </Button>
    </div>
  );
}
