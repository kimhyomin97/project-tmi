"use client";

// 현재 주소와 비교해 활성 메뉴를 강조한다. 주소는 브라우저에서만 알 수 있어 이 파일만 client다(L1).
// 사이드바가 접히면(group-data-collapsed/sidebar) 글자는 sr-only로 남겨 화면낭독기가 읽게 하고, 마우스를 올리면 title로 보여준다.
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { useSidebarStore } from "@/lib/sidebar-store";

/** /english 와 /english-review 가 서로를 활성으로 만들지 않게 경로 단위로 비교한다. */
function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

const itemBase =
  "flex items-center gap-2 whitespace-nowrap rounded-md border-l-2 px-3 py-2 text-sm group-data-collapsed/sidebar:justify-center group-data-collapsed/sidebar:px-0";

export function NavLink({ href, icon, label }: { href: Route; icon: ReactNode; label: string }) {
  const active = isActive(usePathname(), href);
  const collapsed = useSidebarStore((state) => state.collapsed);

  // 활성 상태를 색만으로 전하지 않는다: 굵기 + 왼쪽 막대 + 배경을 함께 바꾼다.
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      title={collapsed ? label : undefined}
      className={
        active
          ? `${itemBase} border-sidebar-primary bg-sidebar-accent font-semibold text-sidebar-accent-foreground`
          : `${itemBase} border-transparent text-sidebar-foreground hover:bg-sidebar-accent`
      }
    >
      {icon}
      <span className="group-data-collapsed/sidebar:sr-only">{label}</span>
    </Link>
  );
}

/** 화면이 없는 기능. 링크하지 않고 "준비 중" 글자로 상태를 전한다. */
export function PendingNavItem({ icon, label }: { icon: ReactNode; label: string }) {
  const collapsed = useSidebarStore((state) => state.collapsed);

  return (
    <span
      title={collapsed ? `${label} (준비 중)` : undefined}
      className={`${itemBase} border-transparent text-muted-foreground`}
    >
      {icon}
      <span className="flex-1 group-data-collapsed/sidebar:sr-only">{label}</span>
      <Badge variant="secondary" className="group-data-collapsed/sidebar:sr-only">
        준비 중
      </Badge>
    </span>
  );
}
