import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { DesignCatalog } from "@/features/design-system/components/design-catalog";

export const metadata: Metadata = { title: "디자인 시스템" };

export default function DesignSystemPage() {
  return (
    <>
      <PageHeader
        title="디자인 시스템"
        description="공용 부품과 규격을 실제 모양으로 모은 화면입니다. 규칙 문장은 docs/design-system.md에 있습니다."
      />
      <DesignCatalog />
    </>
  );
}
