---
paths:
  - "src/**/*.tsx"
  - "src/app/globals.css"
---

# 디자인 규칙 (tsx·globals.css를 읽거나 편집할 때 로드)

디자인 문서를 먼저 읽는다는 원칙은 CLAUDE.md 본문("구조" 절) 참조. 이 rule은 세부만 둔다. 문서에서 볼 곳: 토큰 목록, 의미→색, 역할 → 글자 클래스, 부품, 패턴, shadcn 함정.

- 색·크기는 토큰 클래스만. lint가 변수·객체 안 문자열과 `className`·`cn()` 안에서 템플릿으로 조립한 클래스(`` `text-${x}` ``)까지 막는다(P-D3 적용 후). 변수에 먼저 담거나 `+`로 이어 붙인 조립은 lint가 못 잡으므로 조립하지 말고 완성된 클래스를 객체 맵에서 고른다. 필요한 토큰이 없으면 즉석에서 만들지 말고 plan에 "토큰 추가"로 올린다(`globals.css`의 `@utility`·새 클래스도 토큰 추가다 — lint가 못 막는다).
- 대표색(primary)은 화면의 주 행동 하나와 활성 상태에만.
- 상태는 `StatusBadge`(`src/components/status-badge.tsx`, P-D1 적용 후)로 표시한다. 현재 의미는 `pending`(준비 중)만 있다. 새 의미(성공·주의·실패)가 필요하면 `STATUS`에 기호(✓·▲·✕)와 문구를 함께 넣어 추가한다. 색만으로 의미를 전하지 않는다.
- 모든 화면은 `PageHeader`로 시작하고 `page.tsx`마다 `export const metadata = { title: "…" }`.
- 글자 크기·굵기는 디자인 문서의 "역할 → 글자 클래스" 표에서 고른다(페이지 제목은 `PageHeader`가 소유, P-D2-A 적용 후).
- 시각 문제를 접근성 속성(`aria-*`) 제거로 풀지 않는다. 모양이 문제면 `className`으로 덮어쓴다.
