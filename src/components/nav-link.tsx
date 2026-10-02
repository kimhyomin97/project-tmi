"use client";

// 현재 주소와 비교해 활성 메뉴를 강조한다. 주소는 브라우저에서만 알 수 있어 이 파일만 client다(L1).
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function NavLink({ href, children }: { href: string; children: ReactNode }) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={
        active
          ? "flex items-center rounded-md bg-sidebar-accent px-3 py-2 text-sm font-medium text-sidebar-primary"
          : "flex items-center rounded-md px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent"
      }
    >
      {children}
    </Link>
  );
}
