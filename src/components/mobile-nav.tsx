"use client";

// 모바일(md 미만) 상단 바와 메뉴 서랍. 열림 상태는 이 컴포넌트만 쓰므로 useState로 둔다(L3).
// 메뉴 내용은 서버가 그려 children으로 받는다(L1).
import { Menu, X } from "lucide-react";
import { useState, type MouseEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export function MobileNav({ logo, children }: { logo: ReactNode; children: ReactNode }) {
  const [open, setOpen] = useState(false);

  // 메뉴 링크를 누르면 닫는다. 지금 화면의 링크를 다시 눌러도 닫히도록 주소 변화가 아니라 클릭으로 판단한다.
  function closeOnLinkClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target instanceof Element && event.target.closest("a")) setOpen(false);
  }

  return (
    <div className="flex items-center justify-between border-b border-sidebar-border bg-sidebar px-4 py-2 text-sidebar-foreground md:hidden">
      {logo}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger render={<Button variant="ghost" size="icon" aria-label="메뉴 열기" />}>
          <Menu aria-hidden="true" />
        </SheetTrigger>
        <SheetContent side="left" showCloseButton={false} className="gap-0">
          <SheetHeader className="flex-row items-center justify-between">
            <SheetTitle>{logo}</SheetTitle>
            <SheetClose render={<Button variant="ghost" size="icon-sm" aria-label="메뉴 닫기" />}>
              <X aria-hidden="true" />
            </SheetClose>
          </SheetHeader>
          <div onClick={closeOnLinkClick}>{children}</div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
