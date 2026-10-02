"use client";

// 현재 주소와 비교해 활성 메뉴를 강조한다. 주소는 브라우저에서만 알 수 있어 이 파일만 client다(L1).
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** /english 와 /english-review 가 서로를 활성으로 만들지 않게 경로 단위로 비교한다. */
function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavLink({ href, children }: { href: Route; children: ReactNode }) {
  const active = isActive(usePathname(), href);

  // 활성 상태를 색만으로 전하지 않는다: 굵기 + 왼쪽 막대 + 배경을 함께 바꾼다.
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={
        active
          ? "flex items-center whitespace-nowrap rounded-md border-l-2 border-sidebar-primary bg-sidebar-accent px-3 py-2 text-sm font-semibold text-sidebar-accent-foreground"
          : "flex items-center whitespace-nowrap rounded-md border-l-2 border-transparent px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent"
      }
    >
      {children}
    </Link>
  );
}
