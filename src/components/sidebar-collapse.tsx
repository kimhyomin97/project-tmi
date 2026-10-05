"use client";

// 데스크톱 사이드바 틀과 접기 버튼. 접힘 상태를 함께 읽는 두 부품만 client이고, 메뉴 내용은 서버가 그려 children으로 받는다(L1).
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useSidebarStore } from "@/lib/sidebar-store";

/** 접힘 여부를 data-collapsed로 내려서, 안쪽은 group-data-collapsed/sidebar: 변형으로 모양만 바꾼다. */
export function SidebarFrame({ children }: { children: ReactNode }) {
  const collapsed = useSidebarStore((state) => state.collapsed);

  // 서버 HTML(펼침)과 첫 렌더를 맞춘 뒤에 저장된 접힘 상태를 불러온다(sidebar-store.ts 주석 참고).
  useEffect(() => {
    void useSidebarStore.persist.rehydrate();
  }, []);

  return (
    <aside
      data-collapsed={collapsed ? "" : undefined}
      className="group/sidebar hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:sticky md:top-0 md:flex md:h-svh md:w-60 md:shrink-0 md:flex-col md:data-collapsed:w-16"
    >
      {children}
    </aside>
  );
}

export function SidebarToggle() {
  const collapsed = useSidebarStore((state) => state.collapsed);
  const toggleCollapsed = useSidebarStore((state) => state.toggleCollapsed);
  const label = collapsed ? "사이드바 펼치기" : "사이드바 접기";
  const Icon = collapsed ? PanelLeftOpen : PanelLeftClose;

  return (
    // aria-expanded는 쓰지 않는다: ghost 버튼이 "열린 메뉴"처럼 채워 그린다. 상태는 바뀌는 라벨이 전한다.
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={label}
      title={label}
      onClick={toggleCollapsed}
      className="text-muted-foreground"
    >
      <Icon aria-hidden="true" />
    </Button>
  );
}
