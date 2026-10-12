# 디자인 시스템

값의 원본은 `src/app/globals.css`, 강제는 `eslint.config.mjs`. 이 문서는 **무엇을 언제 쓰는지**만 적는다(값을 다시 적지 않는다).

## 토큰 (클래스 이름)

| 용도 | 클래스 |
|---|---|
| 화면·카드 배경 | `bg-background` · `bg-card` (글자 `text-foreground` · `text-card-foreground`) |
| 흐린 면·보조 글자 | `bg-muted` · `text-muted-foreground` — 회색을 `text-foreground/70` 같은 투명도로 만들지 않는다(lint 미강제, 규칙으로 지킨다) |
| 주 행동·활성 상태 | `bg-primary` + `text-primary-foreground`, 포커스 `ring-ring` |
| 보조 버튼·hover 면 | `bg-secondary` · `bg-accent` |
| 상태 | `success` · `warning` · `destructive` (채운 배경 위 글자는 `-foreground`) |
| 연한 상태 배경 | `bg-success/10 text-success` (투명도 수식어는 허용) |
| 선·입력·팝업 | `border-border` · `border-input` · `bg-popover` |
| 사이드바·차트 | `sidebar-*`는 셸 전용. 차트 색은 `var(--chart-N)`(아직 회색 — 첫 차트에서 정한다) |
| 동적 폭·비율 | `style`로 만들지 말고 `pnpm shadcn add progress`(또는 meter) |

lint가 막는 것(변수·객체 안 문자열 포함): 기본 팔레트(`bg-red-500`), 임의 값(`text-[13px]`), 임의 속성(`[color:red]`), CSS 변수 축약(`bg-(--x)`), 불투명 흰색·검정(`text-white`, `/100` 포함), 원시 색 값(`#f00`, `rgb()`), JSX `style` 속성, SVG 색 리터럴, 새 `.css` import.
허용: 반투명 흰색·검정(`bg-black/50` 오버레이, `border-white/10`), 그리드 템플릿(`grid-cols-[auto_1fr]`), Base UI 위치 변수(`w-(--anchor-width)`), 간격 숫자(`w-97`), 임의 화면폭 변형(`max-[600px]:`).
lint로 못 막는 것(규칙으로 지킨다): `globals.css`에 `@utility`·새 클래스 추가(= 토큰 추가, plan 승인), props 묶음에 숨긴 `style`.

## 의미 → 색

| 의미 | 토큰 | 함께 쓰는 표시 |
|---|---|---|
| 성공·정답 | `success` | ✓ |
| 부분·주의 | `warning` | ▲ |
| 실패·오답·삭제 | `destructive` | ✕ |
| 중립·정보 | `muted` · `secondary` | — |

자산 등락 색은 첫 자산 화면에서 정한다(한국 관례는 상승=빨강·하락=파랑이라 `destructive`와 의미가 겹친다 → 별도 토큰).

## 레이아웃 규격

모든 화면은 `(console)` 셸 안에 들어간다. 영역마다 담당 부품이 하나씩 있고, 화면 코드는 영역의 폭·여백·테두리를 직접 쓰지 않는다. 실제 모양은 `/design-system` 화면에서 본다.

```
┌──────────┬──────────────────────────────────────┐
│ SNB      │ main ─ PageContainer                 │
│ AppSide- │   PageHeader      (h1, 화면당 1개)   │
│ bar      │   PageSection     (h2 + 내용) × n    │
│          │   …                                  │
│          ├──────────────────────────────────────┤
│          │ AppFooter ─ PageContainer            │
└──────────┴──────────────────────────────────────┘
md(768px) 미만: SNB → 상단 바(로고 + ☰) + 왼쪽 서랍(MobileNav). main·footer는 전체 폭.
```

| 영역 | 부품 | 규격 |
|---|---|---|
| SNB | `AppSidebar`(서버) · `NavLink`·`PendingNavItem`·`SidebarFrame`·`MobileNav`(client) | 폭 `w-60`, 접으면 `w-16`(아이콘만, 글자는 `sr-only`, 마우스를 올리면 `title`). 화면 높이에 고정(`sticky`). 메뉴 항목은 `src/lib/console-menu.ts`에서만 바꾼다 |
| 본문 | `PageContainer` | 최대 폭 `max-w-5xl`, 좌우 `px-6`(md 이상 `px-10`), 위아래 `py-8`, 자식 사이 `gap-8`. 폭·여백이 필요하면 이 부품만 쓴다. 최대 폭과 좌우 여백(`max-w-5xl`·`px-*`)은 덮어쓰지 않는다. 세로 여백·배치(방향·정렬·간격)는 `className`으로 바꿀 수 있다(예: 셸 밖 404의 `py-16`, footer의 가로 배치). 내용 폭을 좁히려면(폼 등) 안쪽 요소에 `max-w-*`를 준다 |
| 화면 머리 | `PageHeader` | 화면당 1개, 맨 위. `title`(h1)·`description`·`actions`(화면 단위 버튼) |
| 구획 | `PageSection` | 화면 안의 묶음. `title`(h2)·`description`·`actions`. 구획 안 간격 `gap-4` |
| Footer | `AppFooter` | 본문 열 맨 아래, 본문과 같은 폭. 기능이 아닌 보조 링크만(기능은 SNB에) |
| 셸 밖 화면 | `not-found.tsx` · `global-error.tsx` | 사이드바 없음. `PageContainer` + `PageHeader`로 폭·제목 모양만 맞춘다 |

### SNB 메뉴 항목 상태

| 상태 | 모양 | 비고 |
|---|---|---|
| 기본 | `text-sidebar-foreground`, hover `bg-sidebar-accent` | |
| 활성 | 왼쪽 막대 `border-sidebar-primary` + `bg-sidebar-accent` + `font-semibold`, `aria-current="page"` | 색만으로 전하지 않는다(막대·굵기·배경 3가지) |
| 준비 중 | `text-muted-foreground` + `StatusBadge status="pending"`, 링크 아님 | `href`가 없는 메뉴 |
| 접힘 | 아이콘만. 글자·배지는 `sr-only`로 남김 | 접힘 상태는 Zustand(`sidebar-store.ts`)가 새로고침 뒤에도 유지 |

### 간격 역할

| 어디 | 클래스 | 담당 |
|---|---|---|
| 화면 머리·구획 사이 | `gap-8` | `PageContainer` |
| 구획 제목과 내용 사이, 카드 격자 | `gap-4` | `PageSection`, `FeatureGrid` |
| 카드·행 안의 요소 사이 | `gap-2`~`gap-3` | 각 부품 |
| 카드 격자 열 | 1열 → `sm:` 2열 → `lg:` 3열 | `FeatureGrid` |

### 글자 역할

크기·굵기는 아래 역할에서 고른다. 화면 코드에서 새 크기(`text-xl`, `text-3xl` 등)를 만들지 않는다. 표에 없는 역할이 필요하면 plan에 올린다.

| 역할 | 클래스 | 담당 부품 |
|---|---|---|
| 화면 제목(h1) | `text-2xl font-bold tracking-tight` | `PageHeader` |
| 구획 제목(h2) | `text-lg font-semibold` | `PageSection` |
| 카드 제목 | `text-base font-medium` | `CardTitle` |
| 본문 | `text-sm` | — |
| 보조 글 | `text-sm text-muted-foreground` | — |
| 작은 글(footer·라벨) | `text-xs text-muted-foreground` | `AppFooter` |
| 숫자 | `tabular-nums`(표의 숫자 열은 `text-right`) | — |

## 공용 부품

| 부품 | 파일 | 쓰임 |
|---|---|---|
| `PageContainer` | `components/page-container.tsx` | 본문 폭·여백의 유일한 정의(위 레이아웃 규격) |
| `PageHeader` | `components/page-header.tsx` | 모든 화면의 첫 줄. 서버 컴포넌트라 이벤트가 있는 버튼은 client 부품으로 넘긴다 |
| `PageSection` | `components/page-section.tsx` | 화면 안 구획. h2 크기를 화면 코드에서 고르지 않는다 |
| `StatusBadge` | `components/status-badge.tsx` | 상태 표시는 이것만 쓴다. `pending`(준비 중)·`success`(✓ 완료)·`warning`(▲ 주의)·`error`(✕ 실패). 문구만 `label`로 바꾼다(예: `status="success" label="정답"`). 새 의미가 필요하면 `STATUS`에 기호와 함께 추가 |
| `FeatureCard` · `FeatureGrid` | `components/feature-card.tsx` | 홈의 기능 카드. `href`가 있으면 카드 전체가 링크(포커스 윤곽 포함), 없으면 준비 중 배지 |
| `LoadingState` · `EmptyState` · `ErrorState` | `components/data-state.tsx` | 데이터 영역 3상태(아래 패턴). 버튼은 `action` 자리로 넘긴다 |
| `AppFooter` | `components/app-footer.tsx` | 셸 전용 |
| `AppSidebar` · `NavLink` · `MobileNav` · `SidebarFrame` | `components/app-sidebar.tsx` 등 | 셸 전용. 메뉴는 `src/lib/console-menu.ts`만 고친다 |
| `components/ui/*` | shadcn 생성물 | 설치됨: Button, Card, Badge, Sheet. 그 외는 `pnpm shadcn add <이름>` |

공용 부품은 상태·이벤트가 없어 서버·client 어디서든 쓸 수 있다(`"use client"` 없음). client 파일에서 import하면 그 사용분은 client 번들에 들어간다.

### 새 화면 체크리스트

1. `src/app/(console)/<route>/page.tsx` — `metadata.title`, `PageHeader`로 시작, 내용은 `features/<name>/components`에서 조립
2. 구획마다 `PageSection`, 카드 묶음은 `FeatureGrid`·`Card`
3. 데이터 영역은 `LoadingState` / `EmptyState` / `ErrorState`를 모두 그린다(BE를 끈 상태 `CORE_API_URL=http://127.0.0.1:9 pnpm shot <경로>`로 실패 모양 확인)
4. 상태는 `StatusBadge`, 글자 크기는 "글자 역할" 표, 간격은 "간격 역할" 표에서 고른다
5. `pnpm shot <경로>`로 1280·400px 확인, 메뉴 `href` 채우기(`console-menu.ts`)

## 패턴

- **데이터 영역 3상태**: 로딩 `LoadingState` / 빈 상태 `EmptyState`(행동 버튼은 `outline` 하나) / 실패 `ErrorState` + "다시 시도"(`action={<Button variant="outline" onClick={() => query.refetch()}>다시 시도</Button>}`). 조건에 맞는 데이터가 없다는 404는 빈 상태로 그린다. (shadcn skeleton·empty·alert는 이 부품들로 대신한다 — 2026-10 시점 클라우드 환경에서 레지스트리 접속이 막혀 설치하지 못했다)
- **오류 문구**: 화면에 보이는 오류 문구는 `errorMessage(error)`(`src/lib/api/client.ts`)로만 만든다. `error.message`를 그대로 보여주지 않는다. 특정 화면만 다른 문구가 필요하면(예: 채점 503) 그 화면에서 덮어쓴다. 예외: 렌더 버그 안전망(`(console)/error.tsx`·`global-error.tsx`)은 디버깅용으로 원문(또는 digest)을 보여준다 — 고치지 않는다.
- **mutation**: 진행 중에는 제출 버튼을 `disabled`로 두고 문구를 "…하는 중"(예: "채점하는 중")으로 바꾼다. 실패는 폼 아래 `ErrorState` + "다시 시도"(같은 값으로 다시 `mutate`). 성공 알림은 toast(첫 사용 때 `pnpm shadcn add sonner`).
- **폼**: 제출할 때 검증하고, 그 뒤로는 입력할 때마다. 필드 오류는 해당 필드 아래 `text-sm text-destructive` + ✕(색만으로 전하지 않는다).
- **아직 정하지 않은 규격**: 입력 부품(Input·Label·Select)과 표(Table)의 모양·간격은 첫 폼·표 화면에서 정한다. 그 전에 즉석으로 만들지 말고 plan에 "규격 추가"로 올린다(부품은 `pnpm shadcn add`, 설치가 막히면 막힘으로 보고).
- **숫자**: `tabular-nums`, 표의 숫자 열은 `text-right`.
- **문구**: 합니다체. 버튼은 동사형("채점하기"). 오류는 무엇이 잘못됐고 어떻게 고치는지. 사과·모호한 말 금지.
- **날짜·숫자 표기**: `src/lib/format.ts` 하나에서만(처음 필요할 때 만든다). `Intl` ko-KR, `timeZone: "Asia/Seoul"`, 만·억 축약은 내림(9,999원이 "1만"이 되지 않게).

## shadcn 함정

- `add` 뒤에는 `git status`로 생성 파일을 확인한다. dialog·sheet는 기존 button 덮어쓰기 질문에서 **아무 파일도 만들지 않고 성공으로 끝난다** → `--overwrite`로 다시 실행(바뀌는 건 `cn` import뿐이라 허용).
- 잘못 추가한 **미커밋** 생성물은 `git clean -f -- src/components/ui/<파일>`로 지운다.
- toast(sonner)는 `sonner`·`next-themes`를 함께 가져온다(승인된 예외). `<Toaster theme="dark" />`로 다크를 고정해 쓴다.
- Empty는 테두리를 보려면 `className="border"`. 표 셀의 긴 글은 `whitespace-normal`.
