import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { consoleFeatures, consoleHome } from "@/lib/console-menu";

export default function HomePage() {
  return (
    <>
      <PageHeader title="TMI 콘솔" description={consoleHome.description} />
      <section aria-label="기능" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {consoleFeatures.map((item) => {
          const card = (
            <Card className={item.href ? "h-full hover:bg-accent" : "h-full"}>
              <CardHeader>
                <CardTitle>{item.label}</CardTitle>
                {item.href ? null : (
                  <CardAction>
                    <Badge variant="outline">준비 중</Badge>
                  </CardAction>
                )}
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
            </Card>
          );
          // 화면이 생긴 기능(href 있음)만 링크로 만든다. 없는 주소로 보내면 404가 난다.
          return item.href ? (
            <Link key={item.label} href={item.href} className="rounded-xl">
              {card}
            </Link>
          ) : (
            <div key={item.label}>{card}</div>
          );
        })}
      </section>
    </>
  );
}
