import Link from "next/link";
import type { ReactNode } from "react";
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import type { ConsoleMenuItem } from "@/lib/console-menu";

// 홈의 기능 카드. 화면이 있는 기능(href)은 카드 전체가 링크, 없는 기능은 "준비 중" 배지를 단 정적 카드다.
// 카드 모서리(rounded-xl)와 링크 포커스 윤곽을 이 파일 한 곳에서 맞춘다 — 화면 코드에서 반경·hover를 다시 쓰지 않는다.
// 아이콘은 컴포넌트(함수)라 서버에서 그린다. 이 부품은 서버 컴포넌트다(L1).
export function FeatureCard({ item }: { item: ConsoleMenuItem }) {
  const card = (
    <Card className={item.href ? "h-full transition-colors group-hover/feature:bg-accent" : "h-full"}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <item.icon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
          {item.label}
        </CardTitle>
        {item.href ? null : (
          <CardAction>
            <StatusBadge status="pending" />
          </CardAction>
        )}
        <CardDescription>{item.description}</CardDescription>
      </CardHeader>
    </Card>
  );

  if (!item.href) return card;
  return (
    <Link
      href={item.href}
      className="group/feature block rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring"
    >
      {card}
    </Link>
  );
}

/** 기능 카드 격자. 화면 폭에 따라 1·2·3열. */
export function FeatureGrid({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section aria-label={label} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {children}
    </section>
  );
}
