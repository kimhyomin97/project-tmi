// 콘솔 메뉴 정의. 사이드바와 홈 화면이 같은 목록을 쓴다.
// href가 없는 항목은 아직 화면이 없는 기능이다(링크하지 않고 "준비 중"으로 표시).
// href는 Route 타입이라, 실제로 없는 화면 주소를 넣으면 typecheck가 실패한다(next.config.ts typedRoutes).
// icon은 컴포넌트(함수)라 client 부품에 props로 넘길 수 없다. 서버 쪽에서 <item.icon />으로 그려서 넘긴다(L1).
import { House, Languages, Wallet, Wrench, type LucideIcon } from "lucide-react";
import type { Route } from "next";

export type ConsoleMenuItem = {
  label: string;
  description: string;
  icon: LucideIcon;
  href?: Route;
};

export const consoleHome: ConsoleMenuItem = {
  label: "홈",
  description: "project-tmi 백엔드 서비스를 한곳에서 쓰는 개인 콘솔입니다.",
  icon: House,
  href: "/",
};

export const consoleFeatures: ConsoleMenuItem[] = [
  {
    label: "영어 학습",
    description: "영어 문장을 해석하면 유사도로 채점하고 해설을 보여줍니다.",
    icon: Languages,
  },
  {
    label: "자산 현황",
    description: "토스 증권 계좌의 보유 종목과 평가금액을 모아 봅니다.",
    icon: Wallet,
  },
  { label: "생활 유틸", description: "자주 쓰는 작은 도구를 한곳에 모읍니다.", icon: Wrench },
];
