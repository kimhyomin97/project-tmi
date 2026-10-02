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

## 공용 부품

| 부품 | 쓰임 |
|---|---|
| `PageHeader` | 모든 화면의 첫 줄. `title`·`description`·`actions`. 서버 컴포넌트라 이벤트가 있는 버튼은 client 부품으로 넘긴다 |
| `AppSidebar` · `NavLink` | 셸 전용. 메뉴는 `src/lib/console-menu.ts`만 고친다 |
| `components/ui/*` | 설치됨: Button, Card, Badge. 그 외는 `pnpm shadcn add <이름>` |

## 패턴

- **데이터 영역 3상태**: 로딩 Skeleton / 빈 상태 Empty(행동 버튼은 `outline` 하나) / 실패 영역 안 Alert(`destructive`) + "다시 시도"(`refetch()`). 조건에 맞는 데이터가 없다는 404는 빈 상태로 그린다.
- **mutation**: 실패는 폼 아래 Alert + "다시 시도"(같은 값으로 다시 `mutate`). 성공 알림은 toast.
- **폼**: 제출할 때 검증하고, 그 뒤로는 입력할 때마다. 오류는 해당 필드 아래.
- **숫자**: `tabular-nums`, 표의 숫자 열은 `text-right`.
- **문구**: 합니다체. 버튼은 동사형("채점하기"). 오류는 무엇이 잘못됐고 어떻게 고치는지. 사과·모호한 말 금지.
- **날짜·숫자 표기**: `src/lib/format.ts` 하나에서만(처음 필요할 때 만든다). `Intl` ko-KR, `timeZone: "Asia/Seoul"`, 만·억 축약은 내림(9,999원이 "1만"이 되지 않게).

## shadcn 함정

- `add` 뒤에는 `git status`로 생성 파일을 확인한다. dialog·sheet는 기존 button 덮어쓰기 질문에서 **아무 파일도 만들지 않고 성공으로 끝난다** → `--overwrite`로 다시 실행(바뀌는 건 `cn` import뿐이라 허용).
- 잘못 추가한 **미커밋** 생성물은 `git clean -f -- src/components/ui/<파일>`로 지운다.
- toast(sonner)는 `sonner`·`next-themes`를 함께 가져온다(승인된 예외). `<Toaster theme="dark" />`로 다크를 고정해 쓴다.
- Empty는 테두리를 보려면 `className="border"`. 표 셀의 긴 글은 `whitespace-normal`.
