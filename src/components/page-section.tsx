import { useId, type ReactNode } from "react";

// 화면 안의 구획. 제목(h2)·설명·구획 단위 버튼을 정해진 모양으로 그린다.
// 화면 제목(h1)은 PageHeader가, 구획 제목(h2)은 이 부품이 소유한다 — 화면 코드에서 h2 크기를 고르지 않는다.
export function PageSection({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const headingId = useId();
  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div className="min-w-0">
          <h2 id={headingId} className="text-lg font-semibold">
            {title}
          </h2>
          {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}
