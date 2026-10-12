import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiError, errorMessage } from "@/lib/api/client";
import { EmptyState, ErrorState, LoadingState } from "@/components/data-state";
import { FeatureCard, FeatureGrid } from "@/components/feature-card";
import { PageSection } from "@/components/page-section";
import { StatusBadge } from "@/components/status-badge";
import { consoleFeatures, consoleHome } from "@/lib/console-menu";

// 디자인 시스템 미리보기. 공용 부품을 실제 모양 그대로 한 화면에 모아, 새 기능을 만들 때 고를 기준이자
// 화면 확인(pnpm shot)의 대상이 된다. 규칙 문장은 docs/design-system.md에 있고 여기서는 모양만 보여준다.
// 서버 컴포넌트다 — 버튼은 모양 확인용이라 onClick이 없다.

const SWATCHES = [
  { name: "background", className: "bg-background" },
  { name: "card", className: "bg-card" },
  { name: "muted", className: "bg-muted" },
  { name: "secondary", className: "bg-secondary" },
  { name: "accent", className: "bg-accent" },
  { name: "primary", className: "bg-primary" },
  { name: "success", className: "bg-success" },
  { name: "warning", className: "bg-warning" },
  { name: "destructive", className: "bg-destructive" },
] as const;

const TYPE_ROLES = [
  { role: "화면 제목", owner: "PageHeader", className: "text-2xl font-bold tracking-tight", sample: "영어 학습" },
  { role: "구획 제목", owner: "PageSection", className: "text-lg font-semibold", sample: "오늘의 문장" },
  { role: "카드 제목", owner: "CardTitle", className: "text-base font-medium", sample: "채점 결과" },
  { role: "본문", owner: "—", className: "text-sm", sample: "문장을 해석하면 유사도로 채점합니다." },
  { role: "보조 글", owner: "—", className: "text-sm text-muted-foreground", sample: "마지막 채점 3분 전" },
  { role: "작은 글", owner: "AppFooter·배지", className: "text-xs text-muted-foreground", sample: "TMI 콘솔" },
  { role: "숫자", owner: "—", className: "text-sm tabular-nums", sample: "1,234,567원" },
] as const;

export function DesignCatalog() {
  return (
    <>
      <PageSection
        title="레이아웃 영역"
        description="모든 화면은 콘솔 셸 안에 들어갑니다. 영역마다 담당 부품이 정해져 있습니다."
      >
        <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-[auto_1fr]">
          <dt className="font-medium">SNB(사이드바)</dt>
          <dd className="text-muted-foreground">
            AppSidebar · NavLink — 768px 이상은 왼쪽에 고정되고(접으면 아이콘만), 그보다 좁으면 상단 바와 서랍으로 바뀝니다. 메뉴는 console-menu.ts에서만 고칩니다.
          </dd>
          <dt className="font-medium">본문</dt>
          <dd className="text-muted-foreground">
            PageContainer(최대 폭·좌우 여백) 안에 PageHeader, PageSection 순서로 쌓습니다. 구획 사이 간격은 컨테이너가 줍니다.
          </dd>
          <dt className="font-medium">Footer</dt>
          <dd className="text-muted-foreground">AppFooter — 본문 열 맨 아래에 본문과 같은 폭으로 붙습니다. 보조 링크만 둡니다.</dd>
        </dl>
      </PageSection>

      <PageSection title="글자 역할" description="글자 크기와 굵기는 역할로 고릅니다. 화면 코드에서 새 크기를 만들지 않습니다.">
        <div className="flex flex-col divide-y divide-border rounded-xl border border-border">
          {TYPE_ROLES.map((t) => (
            <div key={t.role} className="grid gap-1 p-4 sm:grid-cols-[10rem_1fr] sm:items-baseline sm:gap-4">
              <div className="text-xs text-muted-foreground">
                {t.role} · {t.owner}
              </div>
              <div className={t.className}>{t.sample}</div>
            </div>
          ))}
        </div>
      </PageSection>

      <PageSection title="색 토큰" description="의미 토큰만 씁니다. 상태색은 의미를 전할 때만 쓰고, 항상 기호를 함께 둡니다.">
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-9">
          {SWATCHES.map((s) => (
            <div key={s.name} className="flex flex-col gap-1">
              <div className={`h-10 rounded-md border border-border ${s.className}`} />
              <span className="text-xs text-muted-foreground">{s.name}</span>
            </div>
          ))}
        </div>
      </PageSection>

      <PageSection title="상태 배지" description="StatusBadge — 같은 의미는 같은 모양으로 그립니다. 문구만 label로 바꿀 수 있습니다.">
        <div className="flex flex-wrap gap-2">
          <StatusBadge status="pending" />
          <StatusBadge status="success" />
          <StatusBadge status="warning" />
          <StatusBadge status="error" />
          <StatusBadge status="success" label="정답" />
          <StatusBadge status="warning" label="부분 정답" />
          <StatusBadge status="error" label="오답" />
        </div>
      </PageSection>

      <PageSection title="버튼" description="주 행동(default)은 화면에 하나만 둡니다. 나머지는 outline·ghost를 쓰고, 문구는 동사형으로 씁니다.">
        <div className="flex flex-wrap items-center gap-2">
          <Button>채점하기</Button>
          <Button variant="outline">다시 시도</Button>
          <Button variant="secondary">보조 행동</Button>
          <Button variant="ghost">취소</Button>
          <Button variant="destructive">삭제하기</Button>
          <Button variant="link">자세히 보기</Button>
        </div>
      </PageSection>

      <PageSection title="기능 카드" description="FeatureCard — 화면이 있는 기능은 카드 전체가 링크이고, 없는 기능은 준비 중 배지를 답니다.">
        <FeatureGrid label="기능 카드 예시">
          <FeatureCard item={consoleHome} />
          {consoleFeatures.slice(0, 2).map((item) => (
            <FeatureCard key={item.label} item={item} />
          ))}
        </FeatureGrid>
      </PageSection>

      <PageSection
        title="데이터 3상태"
        description="데이터를 쓰는 영역은 로딩·빈 상태·실패를 모두 그립니다. 조건에 맞는 데이터가 없다는 404는 빈 상태로 그립니다."
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="flex flex-col gap-2">
            <span className="text-xs text-muted-foreground">로딩 — LoadingState</span>
            {/* 견본이라 화면낭독기에 "불러오는 중"을 알리지 않도록 숨긴다 */}
            <div aria-hidden="true">
              <LoadingState />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs text-muted-foreground">빈 상태 — EmptyState</span>
            <EmptyState
              icon={<Inbox aria-hidden="true" />}
              title="아직 채점한 문장이 없습니다"
              description="오늘의 문장을 해석하고 채점하면 여기에 쌓입니다."
              action={<Button variant="outline">문장 받기</Button>}
            />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs text-muted-foreground">실패 — ErrorState + errorMessage(500)</span>
            <ErrorState
              description={errorMessage(new ApiError(500, null))}
              action={<Button variant="outline">다시 시도</Button>}
            />
          </div>
        </div>
      </PageSection>
    </>
  );
}
