import type { ReactNode } from "react";
import { AppSidebar } from "@/components/app-sidebar";

// 콘솔 셸: 사이드바 + 본문. 모든 기능 화면이 이 레이아웃 안에 들어온다.
export default function ConsoleLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col md:flex-row">
      <AppSidebar />
      <main className="min-w-0 flex-1 px-6 py-8 md:px-10">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">{children}</div>
      </main>
    </div>
  );
}
