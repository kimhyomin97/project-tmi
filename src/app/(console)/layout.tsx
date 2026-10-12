import type { ReactNode } from "react";
import { AppFooter } from "@/components/app-footer";
import { AppSidebar } from "@/components/app-sidebar";
import { PageContainer } from "@/components/page-container";

// 콘솔 셸: 사이드바(SNB) + 본문 열(main + footer). 모든 기능 화면이 이 레이아웃 안에 들어온다.
// 영역 규격은 docs/design-system.md "레이아웃 규격".
export default function ConsoleLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col md:flex-row">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1">
          <PageContainer>{children}</PageContainer>
        </main>
        <AppFooter />
      </div>
    </div>
  );
}
