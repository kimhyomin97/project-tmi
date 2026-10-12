import type { ReactNode } from "react";

// 데이터 영역의 3상태(로딩·빈 상태·실패) 모양. 데이터를 쓰는 client 컴포넌트가 isPending/isError로 분기해 고른다(L5).
//   if (query.isPending) return <LoadingState />;
//   if (query.isError) return <ErrorState description={errorMessage(query.error)} action={<Button variant="outline" onClick={() => query.refetch()}>다시 시도</Button>} />;
//   (errorMessage는 @/lib/api/client — 오류를 화면 문구로 바꾸는 유일한 곳. error.message를 그대로 보여주지 않는다)
//   if (query.data.length === 0) return <EmptyState title="…" />;
// 버튼은 action 자리로 받는다. 이 파일은 상태·이벤트가 없어 서버·client 어디서든 쓸 수 있다.
// (shadcn의 skeleton·empty·alert는 이 환경에서 레지스트리 접속이 막혀 설치하지 못해 토큰 클래스로 직접 그렸다.)

/** 로딩: 내용 자리를 회색 막대로 채운다. 화면낭독기에는 label을 읽힌다. */
export function LoadingState({ rows = 3, label = "불러오는 중입니다" }: { rows?: number; label?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-3 rounded-xl border border-border p-4">
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          aria-hidden="true"
          className={i === 0 ? "h-4 w-1/3 animate-pulse rounded-md bg-muted" : "h-4 w-full animate-pulse rounded-md bg-muted"}
        />
      ))}
    </div>
  );
}

/** 빈 상태: 무엇이 없는지 + (있다면) 다음 행동 하나. 행동 버튼은 outline 하나만. */
export function EmptyState({
  title,
  description,
  icon,
  action,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-6 py-10 text-center">
      {icon ? <div className="text-muted-foreground [&_svg]:size-6">{icon}</div> : null}
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium">{title}</p>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

/** 실패: 영역 안에서 무엇이 잘못됐는지와 고치는 방법 + "다시 시도". 색만으로 전하지 않도록 ✕와 제목을 함께 둔다. */
export function ErrorState({
  title = "불러오지 못했습니다",
  description,
  action,
}: {
  title?: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4"
    >
      <div className="flex flex-col gap-1">
        <p className="flex items-center gap-2 text-sm font-medium text-destructive">
          <span aria-hidden="true">✕</span>
          {title}
        </p>
        <p className="text-sm text-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}
