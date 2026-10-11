# 02. 디자인 시스템 점검

대상 커밋: `86e86bf`. 발견 ID는 `DS-xx`. 스크린샷은 `docs/ai-audit/screenshots/`.

## 요약

- 토큰 구조는 shadcn 기본(CSS 변수 → `@theme inline`)에 의미 토큰(success·warning)을 더한 형태이고, **Tailwind 기본 색 팔레트를 지워** 의미 토큰 밖의 색을 쓸 수 없게 만들었다(`src/app/globals.css:17-21`).
- 직접 작성한 코드(17개 파일)의 하드코딩 위반은 **0건**이다(임의 값 0, 원시 색 0, `style` 0). lint가 이를 보장한다.
- 남은 문제는 "토큰 위반"이 아니라 **토큰이 정하지 않은 영역**이다: 같은 의미("준비 중")가 화면마다 다른 모양, 타이포·간격 역할 미정의, 동적 조립 클래스가 lint를 통과함, 페이지 컨테이너가 3곳에 따로 정의(시각 차이는 작음).
- 포커스 표시는 버튼은 불투명 테두리로 충분하고, 링크는 Chromium에서 또렷이 보인다(실측). Firefox·Safari는 미검증이다(DS-08, 낮음).
- 다크 고정인데 라이트 토큰이 검증 없이 유지되고 있다.

## 1. 토큰 정의 위치와 구조

| 층 | 위치 | 내용 |
|---|---|---|
| 원시 값 | `src/app/globals.css:72-115`(`:root`, 라이트) · `:117-159`(`.dark`) | oklch 값. 주석에 대비 근거(예: `:81` "대표색: 파랑 #2563eb (흰 배경 대비 5.17:1…)") |
| 팔레트 제거 | `globals.css:17-21` | `--color-*: initial;` 후 `white`·`black`만 재정의 |
| Tailwind 연결 | `globals.css:23-70` (`@theme inline`) | `--color-<토큰>: var(--<토큰>)`, radius 7단계(`:63-69`, `--radius` 기준 배수), 폰트 3종 |
| 전역 기본값 | `globals.css:161-179` | 모든 요소 `border-border outline-ring/50`, 한국어 줄바꿈(`keep-all` + `break-word`), 제목 `text-wrap: balance` |
| 사용 규칙 | `docs/design-system.md` | 클래스 이름 표, 의미→색, 부품, 패턴 |
| 강제 | `eslint.config.mjs:69-155`(`tmi/no-raw-design-values`), `:213-229`(style 우회), `:256-278`(`tailwindcss/no-custom-classname`) | 아래 3절 |

토큰 범주별 상태:

| 범주 | 정의 | 평가 |
|---|---|---|
| 색 | 의미 토큰 23종(전경·배경 짝 포함) + sidebar 8종 + chart 5종 | 충분. chart는 아직 회색(`globals.css:146-150`, 디자인 문서 `:16` "첫 차트에서 정한다") |
| 반경 | `--radius` 하나에서 파생 7단계 | 충분 |
| 타이포 | 폰트 패밀리만(`--font-sans/mono/heading`). 크기·굵기는 Tailwind 기본 스케일 | **역할 정의 없음**(DS-04) |
| 간격 | Tailwind 기본 스케일(`--spacing`) | 역할 정의 없음. 컨테이너 패딩이 파일마다 다름(DS-03) |
| 그림자 | 별도 정의 없음(Tailwind 기본). 직접 작성 코드에서 사용 0 | 현재 문제 없음 |
| 모션 | 없음(shadcn 생성물의 `transition-*`만) | 현재 문제 없음 |

## 2. 토큰 사용률 (하드코딩 검색)

**직접 작성 코드의 위반 0건은 측정이 아니라 lint 통과로 보장된다.** `tmi/no-raw-design-values`(`eslint.config.mjs:114-155`)가 `src`의 모든 문자열 리터럴을 조각마다 검사하고, 생성물만 제외한다(`:331`). `pnpm verify`가 green이면 직접 작성 코드에 임의 값·팔레트 색·원시 색 리터럴이 없다. 아래 수치는 그 결과를 교차 확인하고 생성물의 규모를 보이기 위한 것이다.

**임의 값의 정의**: 공백으로 나눈 조각마다 `eslint.config.mjs`의 `baseOf()`(`:102-112`)로 변형 접두(`hover:`, `data-[…]:`, `[&_svg]:` 등)를 벗긴 뒤, `ARBITRARY_RES`(`:78-83`)의 네 정규식 중 하나에 맞는 조각. 이 중 `ALLOWED_ARBITRARY_RE`(`:87-88`, 그리드 템플릿·Base UI 위치 변수)에 맞는 조각은 lint가 허용한다. 재현 스크립트는 부록 A.

| 구분 | 파일 | 임의 값(정의대로) | 그중 허용 목록 | lint 기준 위반 | 원시 색 리터럴 | `style=` |
|---|---|---|---|---|---|---|
| 직접 작성 | 17 | **0** | 0 | **0** | **0** | **0** |
| shadcn 생성물(`src/components/ui/`) | 4 | 25 | 2 | 23 | 0 | 0 |

초판의 클래스 조각 총량(165·258)은 저장소 밖 휴리스틱 스크립트로 센 근사치라 재현할 수 없어 표에서 뺐다. 초판의 "생성물 임의 값 23건"은 허용 목록 2건(`card.tsx`의 `grid-cols-[1fr_auto]`, `grid-rows-[auto_auto]`)을 뺀 수와 같다.

- 직접 작성 코드 위반율 0%. 투명도로 회색을 만드는 패턴(`text-foreground/70`, 디자인 문서 `:10`이 "lint 미강제, 규칙으로 지킨다"고 한 것)도 0건(`grep -E '[a-z-]+/[0-9]+'` 결과 없음).
- shadcn 생성물의 임의 값 25건(lint 기준 23건)은 lint 제외 대상(`eslint.config.mjs:331`)이고 수정 금지 영역이다. 예: `button.tsx:14` `hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)]`, `button.tsx:25` `text-[0.8rem]`. 생성물을 감싸 쓰는 한 문제 없음.
- 직접 작성 코드에 쓰인 값의 분포(실측 `grep`):
  - 글자 크기: `text-sm` 4, `text-2xl` 2 / 굵기: `font-bold` 3, `font-semibold` 1
  - 간격: `gap-2` 5, `gap-4` 4, `px-6` 3, `py-16` 2, `py-8` 1, `px-10` 1 …(19종)
  - 최대 폭: `max-w-5xl` 3 (3곳 모두 페이지 컨테이너)

## 3. AI가 디자인 시스템을 지키게 하는 장치

### 3.1 장치 목록

| 장치 | 위치 | 강도 |
|---|---|---|
| 팔레트 제거 | `globals.css:17-21` | 강함 — 써도 색이 안 나옴 |
| 모든 문자열 검사 lint | `eslint.config.mjs:114-155` | 강함 — 변수·객체·cva 안 문자열까지 |
| 없는 클래스 금지 | `eslint.config.mjs:275` | 강함 |
| `style`·`<style>`·SVG 색 리터럴 금지 | `eslint.config.mjs:216-229` | 강함 |
| 인라인 lint 비활성화 금지 | `eslint.config.mjs:241` | 강함 — 우회 차단 |
| 스캔 범위 `src`로 한정 | `globals.css:3` (`source("../")`) | 문서의 금지 예시가 CSS로 생성되는 구멍 차단 |
| 사용 문서 | `docs/design-system.md` | 규칙 — CLAUDE.md가 작업 전 읽기를 지시(`CLAUDE.md:74`) |
| 예시 코드 | 없음 | 문서에 "좋은 예" 코드 조각 없음(3상태 패턴도 말로만) |

### 3.2 lint 실측 (점검용 샘플 17줄을 `eslint --stdin --stdin-filename src/components/zz-sample.tsx`로 검사, 파일 생성 없음)

| # | 샘플 | 결과 | 비고 |
|---|---|---|---|
| 1 | `className="text-[13px]"` | 차단 | |
| 2 | `bg-[#123456]` | 차단 | |
| 3 | 객체 안 `"text-red-500"` | 차단 | 변수·객체도 검사 |
| 4 | `` className={`text-${size}`} `` | **통과** | 동적 조립 클래스. Tailwind가 생성하지 않아 **조용히 스타일이 빠진다** (DS-06) |
| 5 | `const s = { style: {...} }; <p {...s}>` | **통과** | 디자인 문서 `:21`에 "props 묶음에 숨긴 style"로 문서화된 한계 |
| 6 | `text-foreground/70` | **통과** | 문서화된 한계(`docs/design-system.md:10`) |
| 7 | `p-[7px]` | 차단 | |
| 8 | `w-97 h-13` | 통과 | 의도적 허용(`docs/design-system.md:20`) |
| 9 | `shadow-2xl rounded-3xl` | 통과 | 기본 스케일 — 문제 아님 |
| 10 | `text-white` | 차단 | |
| 11 | `cn("font-[600]")` | 차단 | |
| 12 | `z-[999]` | 차단 | |
| 13 | `tracking-tighter leading-none text-7xl` | 통과 | 타이포 역할 미정의라 어떤 크기든 허용(DS-04) |
| 14 | `<svg fill="#f00">` | 차단(2개 규칙) | |
| 15 | `bg-chart-1` | 통과 | 정상 토큰 |
| 16 | `foo-bar` | 차단 | `tailwindcss/no-custom-classname` |
| 17 | `max-[600px]:hidden` | 통과 | 의도적 허용 |

분류(다른 문서는 이 분류를 따른다): **차단 10건, 정상·의도적 허용 4건(#8, #9, #15, #17), 문서화된 한계 2건(#5 props 묶음 style, #6 투명도 회색), 미문서화 구멍 1건(#4 조립 클래스, DS-06).** 커밋 `b325363` 본문의 "R1 우회 케이스 75개 중 66개 차단(남은 9개는 의도적 허용)"과 같은 경향이다.

## 4. 공통 컴포넌트 목록과 사용 현황

| 컴포넌트 | 위치 | 사용처(실측 `git grep -w`) | 비고 |
|---|---|---|---|
| `PageHeader` | `src/components/page-header.tsx` | 홈, 404, `(console)/error.tsx` | `global-error.tsx`는 같은 모양을 **직접 다시 씀**(`global-error.tsx:20-25`, `h1 className="text-2xl font-bold tracking-tight"`) |
| `AppSidebar` | `src/components/app-sidebar.tsx` | `(console)/layout.tsx` | 서버 컴포넌트. 메뉴를 데스크톱·모바일에 한 번씩 렌더 |
| `NavLink`·`PendingNavItem` | `src/components/nav-link.tsx` | `app-sidebar.tsx` | client |
| `MobileNav` | `src/components/mobile-nav.tsx` | `app-sidebar.tsx` | client, Sheet 사용 |
| `SidebarFrame`·`SidebarToggle` | `src/components/sidebar-collapse.tsx` | `app-sidebar.tsx` | client, Zustand |
| `Button`·`buttonVariants` | `src/components/ui/button.tsx` | error, global-error, mobile-nav, sidebar-collapse, not-found(`buttonVariants`) | |
| `Card` 계열 | `ui/card.tsx` | 홈 | |
| `Badge` | `ui/badge.tsx` | 홈, nav-link | **같은 의미에 다른 변형**(아래) |
| `Sheet` 계열 | `ui/sheet.tsx` | mobile-nav | 디자인 문서 "설치됨" 목록에 없음(`docs/design-system.md:40`) |

### 같은 역할의 중복·불일치

| ID | 내용 | 근거 |
|---|---|---|
| DS-01 | "준비 중" 표시가 홈 카드는 `Badge variant="outline"`, 사이드바는 `Badge variant="secondary"`. 같은 상태가 테두리형/채움형 두 모양으로 보인다 | `src/app/(console)/page.tsx:25`, `src/components/nav-link.tsx:54`, 스크린샷 `01-home@1280.png`(왼쪽 사이드바는 채움, 카드는 테두리) |
| DS-02 | 페이지 제목 마크업 중복: `PageHeader`와 `global-error.tsx`가 같은 클래스 조합을 각각 가짐 | `page-header.tsx:16`, `global-error.tsx:20` |
| DS-03 | 페이지 컨테이너가 3곳에 따로 있고 세로 여백이 다름. 콘솔은 두 요소에 나뉜다: `layout.tsx:9`의 `main`(`px-6 py-8 md:px-10`) + `:10`의 안쪽 `div`(`mx-auto w-full max-w-5xl`). 404·전역 오류는 한 요소(`mx-auto w-full max-w-5xl … px-6 py-16`). 404가 사이드바 없이 다른 위치에 그려지는 것은 컨테이너 문제가 아니라 **라우트 구조** 때문이다: 루트 `src/app/not-found.tsx`는 `(console)` 그룹 밖이라 콘솔 레이아웃이 적용되지 않는다. 그래서 공용 컨테이너 부품만으로는 폭·여백은 맞출 수 있어도 사이드바 차이는 남는다(배치 선택지는 D-07) | `(console)/layout.tsx:9`, `:10`, `not-found.tsx:11`, `global-error.tsx:19`, 스크린샷 `02-nope@1280.png` vs `01-home@1280.png` |
| DS-05 | 링크 카드의 모서리를 Card와 맞추려고 `Link`에 `rounded-xl`을 손으로 맞춤(Card 반경이 바뀌면 포커스 윤곽이 어긋남). 카드 링크용 hover·focus 스타일이 화면 코드에 흩어질 구조. **단 현재는 실행되지 않는 분기다**: `page.tsx:17`, `:34`는 `item.href`가 있을 때만 그려지는데 `consoleFeatures`에는 href가 하나도 없다(`src/lib/console-menu.ts:22-34`, href는 홈 `:19`뿐). 첫 기능 화면에 href를 채우는 순간 드러난다 | `src/app/(console)/page.tsx:17`, `:34`, `ui/card.tsx:14`(`rounded-xl`) |

## 5. 다크모드·반응형·접근성

### 5.1 다크모드

- `<html class="dark">` 고정(`src/app/layout.tsx:22-23`, 주석 "다크 모드 고정(사용자 선호)"). `global-error.tsx:16`도 `dark`를 직접 넣는다.
- 라이트 값(`globals.css:72-115`)은 "나중에 전환을 붙일 수 있다"는 이유로 유지되지만 **어떤 화면에서도 렌더되지 않아 검증되지 않는다.** 대비 수치는 주석에만 있다. 다크 값을 바꿀 때 라이트를 함께 고칠지 기준이 없다. → DS-07
- `.dark { color-scheme: dark; }`(`globals.css:119`)로 스크롤바·기본 폼 UI도 다크. 좋음.

### 5.2 반응형

- 사이드바는 `md`(768px) 기준으로 데스크톱 사이드바 ↔ 모바일 상단 바 + 서랍(`sidebar-collapse.tsx:21` `hidden … md:flex`, `mobile-nav.tsx:19` `md:hidden`).
- 실측: 400px에서 홈·404 가로 넘침 없음(`pnpm shot`), 서랍 열기·Esc 닫기 동작(`pw-report.json`), 사이드바 접힘 새로고침 후 유지.
- 홈 카드 그리드 `sm:grid-cols-2 lg:grid-cols-3`(`page.tsx:14`). 스크린샷상 정상.

### 5.3 접근성

대비 계산(점검용 oklch→sRGB 변환 스크립트, 다크 토큰 기준. 계산식은 WCAG 상대 휘도 정의 https://www.w3.org/TR/WCAG22/#dfn-relative-luminance):

| 조합 | 대비 | 기준 |
|---|---|---|
| foreground / background | 18.96:1 | 본문 4.5:1 통과 |
| muted-foreground / background · card · muted | 7.63 · 6.91 · 5.83:1 | 통과 |
| primary / background, primary-foreground / primary | 7.79[^1] · 7.79:1 | 통과 |
| destructive · success · warning / card | 6.19 · 10.27 · 10.74:1 | 통과 |
| destructive 글자 / destructive 20% 배경(버튼·배지 destructive 변형) | 4.63:1 | 통과(여유 적음) |
| 포커스 테두리 `ring`(불투명, `--ring` = primary 값) / background | 7.79:1 | 비텍스트 3:1 통과(버튼의 `focus-visible:border-ring`) |
| 포커스 링 `ring/50` / background·sidebar | 2.69:1 | 색 자체는 3:1 미만. 버튼은 위 불투명 테두리가 함께 있어 포커스 표시 전체로는 충분, 링크는 아래 설명 (DS-08) |
| card / background (카드 면 구분) | 1.10:1 | 장식 경계라 기준 대상 아님. 카드 테두리 `ring-foreground/10`에 의존 |

- 포커스 — 버튼과 링크를 나눠 본다. WCAG 2.2의 비텍스트 대비(1.4.11)는 UI 상태 표시에 3:1을 요구한다(https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html).
  - **버튼**: `ui/button.tsx:6`에 `focus-visible:border-ring`(불투명, 배경 대비 약 7.79:1)과 `focus-visible:ring-3 focus-visible:ring-ring/50`(2.69:1)이 함께 있다. 불투명 1px 테두리가 3:1을 넘으므로 포커스 표시는 충분하다고 판단한다. 스크린샷 `pw-focus-ring@1280.png`에서도 접기 버튼의 링이 또렷하다.
  - **링크**: 전역 `outline-ring/50`(`globals.css:163`)에 브라우저 기본 `outline: auto 1px`(실측 `getComputedStyle`). 계산상 `ring/50` 색 자체는 2.69:1이지만, Chromium은 `outline-style: auto`를 자체 포커스 링으로 그려 실제로는 또렷이 보인다. 스크린샷 `pw-focus-link@1280.png`(Tab 2회 후 "홈" 링크, `:focus-visible` = true)에서 확인했다. 측정 스크립트는 부록 B, 출력은 `screenshots/pw-focus-link.json`. **Chromium 실측 통과, Firefox·Safari 미검증.**
- 키보드: 본문 바로가기 링크 없음(실측). 모바일·데스크톱 메뉴가 같은 DOM에 둘 다 있지만 각각 `md:hidden`/`hidden md:flex`라 Tab 순서에 중복은 없다. 홈 화면의 보이는 포커스 가능 요소는 2개(사이드바 접기 버튼, "홈" 링크)뿐이라 3번째 Tab은 페이지를 벗어나 body가 된다(정상). `pw-report.json`의 `focusedAfter2Tabs.tag = "BODY"`는 측정 스크립트가 먼저 "사이드바 펼치기" 버튼을 클릭해 포커스가 그 버튼에서 시작했기 때문이다(펼치기 → 홈 → 페이지 밖). 링크 포커스의 근거는 `pw-focus-link@1280.png`와 부록 B 출력(`focusables: ["사이드바 접기","홈"]`)이다. 3번째 Tab이 Next dev 표시(`nextjs-portal`)로 가는지는 측정하지 않았다(측정 중 그 요소는 숨김 처리).
- 색만으로 전하지 않기(`CLAUDE.md:76`): 활성 메뉴는 굵기 + 왼쪽 막대 + 배경을 함께 바꾸고(`nav-link.tsx:25-35`, 25행 주석이 이 규칙을 명시), "준비 중"은 글자 배지로 전한다(`nav-link.tsx:54`, `page.tsx:25`). 준수.
- aria: 메뉴 `nav aria-label="주 메뉴"`(`app-sidebar.tsx:41`), 활성 `aria-current="page"`(`nav-link.tsx:29`), 아이콘 `aria-hidden`, 아이콘 버튼 `aria-label`. 좋음.
- 사이드바 접기 버튼은 `aria-expanded`를 일부러 빼고 라벨 변경으로 상태를 전한다(`sidebar-collapse.tsx:35` 주석 "ghost 버튼이 '열린 메뉴'처럼 채워 그린다"). 라벨 변경 방식도 허용되는 패턴이지만, **시각 문제를 접근성 속성 제거로 푼 사례**라 다음 컴포넌트에서 반복될 수 있다(DS-09, 낮음). 조치: 새 규칙이므로 '지금'(동결 예외 b)에 넣지 않고, P-A9(첫 기능 뒤 정리)에서 `.claude/rules/design.md`에 "시각 문제를 aria 속성 제거로 풀지 않는다"를 넣으면서 이 컴포넌트의 `aria-expanded` 복원 여부를 같은 커밋에서 판단한다(7절 DS-09와 같음).
- 모바일 서랍 오버레이 `bg-black/10`(`ui/sheet.tsx:31`)은 다크 배경에서 거의 보이지 않고 blur에 의존한다(스크린샷 `pw-mobile-drawer@400.png`). 생성물이라 수정 금지 — 필요하면 `className`으로 덮어쓴다.

## 6. 화면 간 시각적 일관성 (스크린샷 기준)

| 비교 | 관찰 |
|---|---|
| 홈 1280 vs 400 | 제목·카드 구조 동일, 넘침 없음. 400px에서 상단 바 + ☰로 전환 |
| 홈 vs 404 (`02-nope@1280.png`) | 404는 사이드바가 없고 본문 시작 x좌표가 다르다(콘솔은 사이드바 240px + `px-10`, 404는 중앙 정렬 `max-w-5xl` + `px-6`). 세로 여백도 `py-8` vs `py-16`. 시각 불일치이며 기능 문제는 없다(DS-03, 낮음) |
| 사이드바 vs 홈 카드 | "준비 중" 배지 모양 불일치(DS-01) |
| 사이드바 펼침 vs 접힘 | 아이콘 정렬·활성 막대 유지. 접힘 상태에서 로고와 접기 버튼이 세로로 쌓임 — 정상 |

화면이 홈·404 둘뿐이라 일관성 평가 표본이 작다. 첫 데이터 화면(표·폼·3상태)이 생기면 다시 평가해야 한다.

## 7. 발견 목록

"대응"은 `05-proposals.md`의 제안 ID다. 시점은 05의 로드맵을 따른다.

| ID | 심각도 | 발견 | 근거 | 대응(P-xx/D-xx) |
|---|---|---|---|---|
| DS-01 | 중간 | "준비 중" 상태가 두 가지 모양 | `page.tsx:25`, `nav-link.tsx:54` | P-D1(`StatusBadge` 래퍼로 통일) |
| DS-02 | 낮음 | 페이지 제목 마크업 중복(`global-error.tsx`) | `global-error.tsx:20` | P-D2 |
| DS-03 | 낮음 | 페이지 컨테이너 3중 정의(콘솔은 `main`·안쪽 `div`에 나뉨), 404가 `(console)` 그룹 밖이라 셸 없이 다른 배치. 둘 다 시각 불일치 | `(console)/layout.tsx:9`, `:10`, `not-found.tsx:11`, `global-error.tsx:19` | 컨테이너: P-D2(`PageContainer`). 404 배치: D-07(추천 B — `PageContainer`로 폭·여백만 통일, 사이드바 없음 유지) |
| DS-04 | 중간 | 타이포·간격 "역할"(페이지 제목, 섹션 제목, 본문, 보조) 미정의 → AI가 화면마다 크기를 고름 | `docs/design-system.md`에 타이포 항목 없음, lint 샘플 #13 | P-D2(역할 표) |
| DS-05 | 낮음 | 카드 링크의 반경·hover를 화면 코드에서 손으로 맞춤. **현재 실행되지 않는 분기**(`consoleFeatures`에 href 없음) | `page.tsx:17`, `:34`, `console-menu.ts:22-34` | P-D2(C, 부품). 시점: 첫 기능 화면에 href를 채울 때 카드 링크 처리. P-D1(배지)과는 무관 |
| DS-06 | 중간 | 동적 조립 클래스(`` `text-${x}` ``)가 lint를 통과하고 Tailwind가 생성하지 않아 조용히 깨짐(미문서화 구멍) | lint 샘플 #4 | P-D3 |
| DS-07 | 낮음 | 다크 고정인데 라이트 토큰이 검증 없이 유지 | `layout.tsx:22-23`, `globals.css:72-115` | P-D5(D-06) |
| DS-08 | 낮음 | 링크 포커스: 계산상 `ring/50` 색 자체는 2.69:1이나 Chromium은 `outline: auto`를 자체 링으로 그려 또렷함(실측 통과). Firefox·Safari 미검증. 버튼은 불투명 `border-ring`(7.79:1)으로 충분 | `globals.css:163`, `ui/button.tsx:6`, `pw-focus-link@1280.png`, `pw-focus-ring@1280.png` | P-D4 — 추천 A(현행 유지) + 다른 브라우저 확인, 시점 "여유 있을 때" |
| DS-09 | 낮음 | 접근성 속성(`aria-expanded`)을 시각 문제 때문에 제거한 선례 | `sidebar-collapse.tsx:35` | P-A9(첫 기능 뒤 정리) — `.claude/rules/design.md`에 "시각 문제를 aria 속성 제거로 풀지 않는다" 추가 + `sidebar-collapse.tsx:35`의 `aria-expanded` 복원 여부를 같은 커밋에서 판단. 새 규칙이라 '지금'(동결 예외 b)에 넣지 않는다 |
| DS-10 | 낮음 | 디자인 문서의 부품 목록이 실제와 다름(Sheet 누락), 3상태 패턴에 예시 코드 없음 | `docs/design-system.md:40`, `:44` | 앞부분: P-A7(목록 정정). 뒷부분: P-D1 — 첫 데이터 기능에서 Empty·Error 래퍼를 만들 때 디자인 문서에 예시 코드 추가 |

[^1]: `globals.css:126` 주석은 "#60a5fa (배경 대비 7.83:1)"이다. 같은 hex로 다시 계산하면 배경을 `#09090b`로 놓을 때 7.83, 현재 다크 배경 `oklch(0.145 0 0)`(`globals.css:120`, sRGB 약 `#0a0a0a`)로 놓을 때 7.79가 나온다. 이 문서는 실제 토큰 값 기준인 7.79를 쓴다. 주석 정정은 P-A7 후보.

## 부록 A. 생성물 임의 값 재현 스크립트

정규식과 `baseOf()`는 `eslint.config.mjs:78-88`, `:102-112`에서 그대로 복사했다. 문자열 리터럴 추출은 정규식 근사(이스케이프·중첩 템플릿 미고려)지만, 판정은 lint와 같은 로직이다. 저장소 루트에서 `node count.mjs src/components/ui`(생성물) 또는 `node count.mjs src`(전체; 직접 작성 코드분이 0이라 같은 값)로 실행한다. 스크립트 파일은 저장소에 두지 않고 임시 디렉터리에서 실행했다.

```js
// count.mjs — eslint.config.mjs:78-88, :102-112 에서 복사
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
const ARBITRARY_RES = [
  /^-?[a-z][a-z0-9-]*-\[.+\]$/,
  /^-?[a-z][a-z0-9-]*\/\[.+\]$/,
  /^\[[a-z-]+:.+\]$/,
  /^-?[a-z][a-z0-9-]*-\((--|[a-z-]+:--).+\)$/,
];
const ALLOWED_ARBITRARY_RE =
  /^grid-(cols|rows)-\[.+\]$|^[a-z-]+-\(--(anchor-width|anchor-height|available-width|available-height|transform-origin)\)$/;
const baseOf = (tok) => {
  let depth = 0, last = 0;
  for (let i = 0; i < tok.length; i++) {
    const c = tok[i];
    if (c === "[" || c === "(") depth++;
    else if (c === "]" || c === ")") depth--;
    else if (c === ":" && depth === 0) last = i + 1;
  }
  return tok.slice(last).replace(/^!|!$/g, "");
};
const [dir] = process.argv.slice(2);
const files = execSync(`git ls-files -- '${dir}/*.ts' '${dir}/*.tsx'`, { encoding: "utf8" }).split("\n").filter(Boolean);
let total = 0, allowed = 0;
for (const f of files) {
  const src = readFileSync(f, "utf8");
  for (const m of src.matchAll(/"([^"\n]*)"|'([^'\n]*)'|`([^`]*)`/g)) {
    const text = m[1] ?? m[2] ?? m[3];
    for (const tok of text.split(/\s+/).filter(Boolean)) {
      const b = baseOf(tok);
      if (!ARBITRARY_RES.some((re) => re.test(b))) continue;
      if (ALLOWED_ARBITRARY_RE.test(b)) { allowed++; continue; }
      total++;
      console.log(`${f}\t${tok}`);
    }
  }
}
console.log(`files=${files.length} arbitrary(lint 기준)=${total} allowed=${allowed}`);
```

실행 결과(86e86bf 기준): `src/components/ui` → `files=4 arbitrary(lint 기준)=23 allowed=2`(정의대로 25). `src` → `files=21 arbitrary(lint 기준)=23 allowed=2`. 파일별: `button.tsx` 6, `card.tsx` 8(+허용 2), `sheet.tsx` 8, `badge.tsx` 1.

## 부록 B. 링크 포커스 측정 스크립트 (2라운드 리뷰 반영)

점검 중 `pnpm dev -p 3100`을 띄우고 저장소 밖에 설치한 `playwright-core@1.56.1`로 실행했다(실행 후 dev 서버 종료·포트 비움 확인). 출력은 `docs/ai-audit/screenshots/pw-focus-link.json`에 그대로 저장했다.

```js
import { chromium } from "playwright-core";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", args: ["--no-sandbox"] });
const p = await (await b.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
for (let i=0;i<60;i++){ try{ await p.goto("http://localhost:3100/", { waitUntil: "networkidle" }); break;}catch{ await new Promise(r=>setTimeout(r,1000)); } }
await p.addStyleTag({ content: "nextjs-portal, .tsqd-parent-container, .tsqd-open-btn-container { display: none !important; }" });
await p.keyboard.press("Tab"); await p.keyboard.press("Tab"); await p.waitForTimeout(500);
const info = await p.evaluate(() => { const e = document.activeElement; const cs = getComputedStyle(e);
  return { tag: e.tagName, text: e.textContent.trim(), focusVisible: e.matches(":focus-visible"), outlineStyle: cs.outlineStyle, outlineWidth: cs.outlineWidth, outlineColor: cs.outlineColor, outlineOffset: cs.outlineOffset,
    focusables: [...document.querySelectorAll("a,button")].filter(x=>x.offsetParent!==null).map(x=>x.getAttribute("aria-label")||x.textContent.trim()) }; });
console.log(JSON.stringify(info));
await p.screenshot({ path: "/home/user/repo/docs/ai-audit/screenshots/pw-focus-link@1280.png", clip: { x: 0, y: 0, width: 420, height: 200 } });
await b.close();
```

출력:

```json
{"tag":"A","text":"홈","focusVisible":true,"outlineStyle":"auto","outlineWidth":"1px","outlineColor":"oklab(0.713993 -0.0379347 -0.137857 / 0.5)","outlineOffset":"1px","focusables":["사이드바 접기","홈"]}
```

## 리뷰 반영 기록(라운드 1)

| # | 지적 요약 | 처리 | 위치 |
|---|---|---|---|
| 1 | 버튼의 불투명 `focus-visible:border-ring` 누락으로 DS-08 과장 | 반영. 버튼(불투명 테두리 7.79:1, 통과)과 링크를 나눠 기술. 링크는 Chromium 실측 통과·Firefox·Safari 미검증으로 정리, DS-08을 "낮음"으로 낮추고 P-D4 추천을 A(현행 유지)+다른 브라우저 확인, "여유 있을 때"로 기재. 05의 P-D4 문구 정정은 05 담당 몫 | 요약, 5.3 대비 표·포커스 항목, 7절 DS-08 |
| 2 | 링크 포커스·Tab 순회 근거가 `pw-report.json`과 불일치 | 반영. 새 스크린샷 `pw-focus-link@1280.png`(Tab 2회 후 "홈" 링크 `:focus-visible`)를 근거로 명시. BODY 기록은 스크립트가 "사이드바 펼치기" 클릭 뒤 측정해 시작점이 달랐기 때문임을 기술. 00-baseline 정정은 해당 문서 담당 몫 | 5.3 키보드 항목 |
| 3 | 발견마다 대응 없음, DS-09·DS-10 후반 미매핑 | 반영. 7절에 "대응(P-xx/D-xx)" 열 추가. DS-09 → P-A7("shadcn 함정" 절 1줄), DS-10 후반 → P-D1(첫 데이터 기능의 Empty·Error 래퍼 때 예시 코드) | 5.3 aria 항목, 7절 |
| 4 | DS-05가 실행되지 않는 분기임이 빠짐, P-D1 매핑 오류 | 반영. `console-menu.ts:22-34` 근거로 "현재 실행되지 않는 분기" 명시, 대응을 P-D2(C, 부품)·시점 "첫 기능 화면에 href를 채울 때"로 변경. 05 매핑 수정은 05 담당 몫 | 4절 DS-05, 7절 DS-05 |
| 5 | lint 분류가 01과 다름 | 반영. "차단 10, 정상·의도적 허용 4, 문서화된 한계 2, 미문서화 구멍 1(#4, DS-06)"을 기준 문장으로 명시. 01 반영은 01 담당 몫 | 3.2 끝 |
| 6 | 2절 수치 재현 불가, 임의 값 정의 없음 | 반영. 직접 작성 0건이 lint 통과로 보장됨을 앞에 두고, 정의(`baseOf()` 뒤 `ARBITRARY_RES`)를 적고 다시 셈: 생성물 25건(허용 목록 2건 제외 시 lint 기준 23건). 재현 불가한 총량(165·258)은 삭제. 스크립트를 부록 A에 수록 | 2절, 부록 A |
| 7 | DS-03 컨테이너 문구가 콘솔에선 두 요소에 나뉨, 404가 셸 밖인 이유 누락 | 반영. `layout.tsx:9`(px·py)·`:10`(폭) 분리, 루트 `not-found.tsx`가 `(console)` 그룹 밖이라는 라우트 구조 이유와 D-07 연결 추가. 심각도는 공통 사실에 따라 "낮음"(시각 불일치) | 4절 DS-03, 6절, 7절 DS-03 |
| 8 | 7.79와 주석 7.83 차이 | 반영. 각주로 설명(주석 값은 배경 `#09090b` 기준 계산과 일치, 현재 배경 기준은 7.79). 주석 정정은 P-A7 후보 | 5.3 대비 표 각주 [^1] |
| 9 | "색만으로 전하지 않기" 준수 점검 누락 | 반영. `CLAUDE.md:76` 기준 1줄 추가(`nav-link.tsx:25-35`, 배지 글자) — 준수 | 5.3 |

## 리뷰 반영 기록(라운드 2)

| # | 지적 요약 | 처리 | 위치 |
|---|---|---|---|
| 1 | 링크 포커스 실측값과 BODY 해석을 재현할 수 없음 | 반영. 측정 스크립트를 부록 B에 싣고 출력 JSON을 `screenshots/pw-focus-link.json`으로 저장. Next dev 표시 영향은 '측정하지 않음'으로 명시 | 5.3절, 부록 B |

## 리뷰 반영 기록(05 라운드 3 교차 지적)

| # | 지적 요약 | 처리 | 위치 |
|---|---|---|---|
| 05-R3 #1 | DS-09 대응이 05(P-A9)와 다름 | 반영. 대응을 P-A9(첫 기능 뒤 정리)로 변경 | 7절 DS-09 |
| 05-R4 #2 | 5.3 본문 DS-09 조치가 7절·05와 반대 | 반영. 본문도 P-A9(첫 기능 뒤 정리)로 | 5.3절 |
