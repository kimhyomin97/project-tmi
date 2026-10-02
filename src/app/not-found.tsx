import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";

// 없는 주소. Next 기본 404는 앱의 다크 테마를 읽지 못해 흰 화면이 되므로 직접 그린다.
export const metadata: Metadata = { title: "페이지 없음" };

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-16">
      <PageHeader
        title="페이지를 찾을 수 없습니다"
        description="주소가 바뀌었거나 아직 만들지 않은 화면입니다. 홈에서 메뉴를 다시 골라 주세요."
      />
      <div>
        <Link href="/" className={buttonVariants()}>
          홈으로 가기
        </Link>
      </div>
    </main>
  );
}
