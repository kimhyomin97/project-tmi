import type { ReactNode } from "react";
import { cn } from "cn";

// 본문 폭·여백의 유일한 정의. 콘솔 본문, footer, 셸 밖 화면(404·전역 오류)이 모두 이 부품을 쓴다.
// 최대 폭·좌우 여백은 덮어쓰지 않는다. 세로 여백·배치(방향·정렬·간격)만 className으로 바꾼다(cn이 앞의 같은 종류 클래스를 지운다).
// 내용 폭을 좁히려면 이 부품이 아니라 안쪽 요소에 max-w-*를 준다.
export function PageContainer({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-8 md:px-10", className)}>
      {children}
    </div>
  );
}
