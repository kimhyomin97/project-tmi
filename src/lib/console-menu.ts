// 콘솔 메뉴 정의. 사이드바와 홈 화면이 같은 목록을 쓴다.
// href가 없는 항목은 아직 화면이 없는 기능이다(링크하지 않고 "준비 중"으로 표시).

export type ConsoleMenuItem = {
  label: string;
  description: string;
  href?: string;
};

export const consoleHome: ConsoleMenuItem = {
  label: "홈",
  description: "project-tmi 백엔드 서비스를 한곳에서 쓰는 개인 콘솔입니다.",
  href: "/",
};

export const consoleFeatures: ConsoleMenuItem[] = [
  { label: "영어 학습", description: "영어 문장을 해석하면 유사도로 채점하고 해설을 보여줍니다." },
  { label: "자산 현황", description: "토스 증권 계좌의 보유 종목과 평가금액을 모아 봅니다." },
  { label: "생활 유틸", description: "자주 쓰는 작은 도구를 한곳에 모읍니다." },
];
