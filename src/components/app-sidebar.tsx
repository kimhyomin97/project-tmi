import { Badge } from "@/components/ui/badge";
import { NavLink } from "@/components/nav-link";
import { consoleFeatures, consoleHome } from "@/lib/console-menu";

// 콘솔 사이드바. 서버 컴포넌트이고, 활성 메뉴 판정만 NavLink(client)가 맡는다.
export function AppSidebar() {
  return (
    <aside className="border-b border-sidebar-border bg-sidebar text-sidebar-foreground md:w-60 md:shrink-0 md:border-r md:border-b-0">
      <div className="flex items-center gap-2 px-5 py-4 text-sm font-bold">
        <span aria-hidden="true" className="size-5 rounded-md bg-sidebar-primary" />
        TMI 콘솔
      </div>
      <nav aria-label="주 메뉴" className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:overflow-visible">
        <NavLink href={consoleHome.href ?? "/"}>{consoleHome.label}</NavLink>
        {consoleFeatures.map((item) =>
          item.href ? (
            <NavLink key={item.label} href={item.href}>
              {item.label}
            </NavLink>
          ) : (
            <span
              key={item.label}
              aria-disabled="true"
              className="flex shrink-0 items-center justify-between gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground"
            >
              {item.label}
              <Badge variant="outline">준비 중</Badge>
            </span>
          ),
        )}
      </nav>
    </aside>
  );
}
