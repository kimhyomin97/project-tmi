"use client"; // Next 규약: 에러 경계는 client 컴포넌트여야 한다

// 렌더 버그 안전망(L5). BE 호출 실패는 여기까지 오지 않고 각 컴포넌트 안에서 isError로 보여준다.
import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";

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

  // 대부분 코드 버그라 다시 해도 같은 결과가 나온다. 원인을 찾을 단서를 준다.
  // 서버 오류는 메시지 원문 대신 digest만 오므로(원문이 화면에 새지 않음) 로그 검색 방법을 알려준다.
  const description = error.digest
    ? `화면을 그리는 중 오류가 났습니다. 서버 로그에서 오류 코드 ${error.digest}를 검색하면 원인을 볼 수 있습니다.`
    : `화면을 그리는 중 오류가 났습니다: ${error.message}`;

  return (
    <div role="alert" className="flex flex-col items-start gap-4">
      <PageHeader title="화면을 표시하지 못했습니다" description={description} />
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
