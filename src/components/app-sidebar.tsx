import { Badge } from "@/components/ui/badge";
import { NavLink } from "@/components/nav-link";
import { consoleFeatures, consoleHome } from "@/lib/console-menu";

// 콘솔 사이드바. 서버 컴포넌트이고, 활성 메뉴 판정만 NavLink(client)가 맡는다.
export function AppSidebar() {
  return (
    <aside className="border-b border-sidebar-border bg-sidebar text-sidebar-foreground md:w-60 md:shrink-0 md:border-r md:border-b-0">
      <div className="flex items-center gap-2 px-5 py-4 text-sm font-bold">
        {/* 로고는 장식이라 대표색을 쓰지 않는다(대표색은 주 행동과 활성 상태에만). */}
        <span aria-hidden="true" className="size-5 rounded-md bg-foreground" />
        TMI 콘솔
      </div>
      <nav aria-label="주 메뉴" className="overflow-x-auto px-3 pb-3 md:overflow-visible">
        <ul className="flex gap-1 md:flex-col">
          <li className="shrink-0">
            <NavLink href={consoleHome.href ?? "/"}>{consoleHome.label}</NavLink>
          </li>
          {consoleFeatures.map((item) => (
            <li key={item.label} className="shrink-0">
              {item.href ? (
                <NavLink href={item.href}>{item.label}</NavLink>
              ) : (
                // 화면이 없는 기능은 링크하지 않는다. "준비 중" 글자가 상태를 전한다.
                <span className="flex items-center justify-between gap-2 whitespace-nowrap px-3 py-2 text-sm text-muted-foreground">
                  {item.label}
                  <Badge variant="secondary">준비 중</Badge>
                </span>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
