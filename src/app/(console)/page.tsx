import type { Metadata } from "next";
import { FeatureCard, FeatureGrid } from "@/components/feature-card";
import { PageHeader } from "@/components/page-header";
import { consoleFeatures, consoleHome } from "@/lib/console-menu";

export const metadata: Metadata = { title: "홈" };

export default function HomePage() {
  return (
    <>
      <PageHeader title="TMI 콘솔" description={consoleHome.description} />
      <FeatureGrid label="기능">
        {consoleFeatures.map((item) => (
          <FeatureCard key={item.label} item={item} />
        ))}
      </FeatureGrid>
    </>
  );
}
