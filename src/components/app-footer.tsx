import Link from "next/link";
import { PageContainer } from "@/components/page-container";

// 콘솔 footer. 본문 열 맨 아래(사이드바 옆)에 붙고, 폭·좌우 여백은 본문과 같은 PageContainer를 쓴다.
// 기능 메뉴가 아닌 보조 링크(개발용 화면 등)만 둔다 — 기능은 SNB(console-menu.ts)에 둔다.
export function AppFooter() {
  return (
    <footer className="border-t border-border">
      <PageContainer className="flex-row flex-wrap items-center justify-between gap-2 py-4 text-xs text-muted-foreground">
        <span>TMI 콘솔 · project-tmi 백엔드 서비스용 개인 콘솔</span>
        <nav aria-label="보조 메뉴">
          <Link href="/design-system" className="rounded-sm underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:ring-3 focus-visible:ring-ring">
            디자인 시스템
          </Link>
        </nav>
      </PageContainer>
    </footer>
  );
}
