import { Boxes } from "lucide-react";
import { MobileNav } from "@/components/mobile-nav";
import { NavLink, PendingNavItem } from "@/components/nav-link";
import { SidebarFrame, SidebarToggle } from "@/components/sidebar-collapse";
import { consoleFeatures, consoleHome } from "@/lib/console-menu";

// 콘솔 사이드바. 서버 컴포넌트이고, 상태가 필요한 부분(활성 메뉴·접기·모바일 서랍)만 client 부품이 맡는다.
// 같은 메뉴 목록(SidebarNav)을 데스크톱 사이드바와 모바일 서랍이 함께 쓴다.
export function AppSidebar() {
  return (
    <>
      <MobileNav logo={<Logo />}>
        <SidebarNav />
      </MobileNav>
      <SidebarFrame>
        {/* 접기 버튼은 위쪽에 둔다. 왼쪽 아래는 dev 모드에서 Next 개발 표시가 덮는다. */}
        <div className="flex items-center justify-between gap-2 py-3 pr-3 pl-5 group-data-collapsed/sidebar:flex-col group-data-collapsed/sidebar:px-0">
          <Logo />
          <SidebarToggle />
        </div>
        <SidebarNav />
      </SidebarFrame>
    </>
  );
}

// 로고는 장식이라 대표색을 쓰지 않는다(대표색은 주 행동과 활성 상태에만).
function Logo() {
  return (
    <span className="flex items-center gap-2 text-sm font-bold text-foreground">
      <Boxes aria-hidden="true" className="size-5" />
      <span className="group-data-collapsed/sidebar:sr-only">TMI 콘솔</span>
    </span>
  );
}

// 아이콘은 여기(서버)에서 그려서 넘긴다. 컴포넌트 함수 자체는 client 부품의 props로 넘길 수 없다(L1).
function SidebarNav() {
  const items = [consoleHome, ...consoleFeatures];
  return (
    <nav aria-label="주 메뉴" className="flex-1 overflow-y-auto px-3 pb-3">
      <ul className="flex flex-col gap-1">
        {items.map((item) => {
          const icon = <item.icon aria-hidden="true" className="size-4 shrink-0" />;
          return (
            <li key={item.label}>
              {item.href ? (
                <NavLink href={item.href} icon={icon} label={item.label} />
              ) : (
                <PendingNavItem icon={icon} label={item.label} />
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
