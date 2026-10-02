@AGENTS.md

# project-tmi (FE)

BE 마이크로서비스군(`../project-tmi-*`, Spring Boot)의 프론트 콘솔. 사용자는 BE 개발자 1명, 공개 서비스 아님(SEO 불필요), 오라클 VM 배포.
**코드는 AI가 100% 작성한다. 사용자는 plan 승인, 증거 확인, 커밋 승인만 한다** — 그 밖의 수동 단계를 사용자에게 넘기지 않는다.
이 문서의 규칙은 AI가 임의로 바꾸지 않는다. 규칙이 작업을 막으면 멈추고 어느 줄을 어떻게 바꿀지와 이유를 제시해 승인받는다. 승인된 규칙 변경은 단독 `chore:` 커밋으로 만들고, **새 세션에서 시작하라고 안내한다**(진행 중인 세션과 그 서브에이전트에는 반영되지 않는다).
지시받은 기능만 만든다. 앞으로 생길 기능을 위한 추상화·폴더·설정을 미리 만들지 않는다.

## 작업 루프

- **plan 생략 가능**: 기존 파일 3개 이하 수정이면서 새 파일·새 의존성·`"use client"` 추가·queryKey 변경이 하나도 없을 때만. 착수 후 이 경계를 넘으면 멈추고 plan을 제시한다.
- **plan 필수 항목**: ① `"use client"` 파일 목록 / Zustand store 필드 / queryKey 목록 ② 해당 L번호와 선택 이유 2~3줄 ③ 의존성 추가 사유(커밋 메시지에도). 실제로 없을 때만 "없음".
- 화면 2개 이상 feature는 사용자 인터뷰 후 SPEC을 `docs/spec/<feature>.md`에 쓰고, **이어서 구현하지 말고** "`/clear` 후 그 파일을 읽고 구현하라"고 안내하며 턴을 끝낸다.
- **완료 보고는 증거로**: ① 직접 실행한 `pnpm verify` 출력(Stop hook은 성공 시 아무것도 출력하지 않는다) ② 화면 확인 절차(URL, 눌러볼 것) ③ 3줄 요약 ④ plan 대비 `git diff --stat` ⑤ 필수 3줄 재측정 — 아래 명령의 출력을 붙인다. plan과 다르면 이유를 먼저 쓴다.
  ```bash
  git grep --untracked -l '"use client"' -- src || echo '(use client 없음)'
  git grep --untracked -n -E 'queryKey|\[[^]]*"[^"]*"' -- 'src/features/*/queries.ts' || echo '(queryKey 없음)'
  ```
- 서브에이전트가 쓴 코드는 hook 검증을 받지 않는다. 결과를 받으면 메인 세션에서 `pnpm verify`로 확인한다.
- 디버깅 시 수정 전에 원인을 1줄로 먼저 설명한다.

## 학습 포인트 (FE 고유 판단 지점 체득이 이 프로젝트의 목표)

| # | 판단 지점 | 흔한 오판 |
|---|---|---|
| L1 | Server/Client 경계 | 페이지 전체에 `"use client"` |
| L2 | 브라우저 노출 (`NEXT_PUBLIC_`, client 번들) | 서버 전용이라 믿은 값이 브라우저로 |
| L3 | 데이터 소유 (TanStack Query / Zustand / useState) | 서버 데이터를 store에 복사 |
| L4 | queryKey · invalidation | mutation 후 stale 화면 |
| L5 | 로딩·에러 경계 | 실패 시 흰 화면 |

- 해당 결정을 한 커밋에 trailer: `Learn: L4 — mutation 후 ["assets"] invalidate`
- L1~L3이 plan에 있었으면 **완료 보고 첫 줄**에 그 결정을 1문장으로 다시 설명한다(승인은 기다리지 않는다).

## 막혔을 때

같은 증상을 2번 고치지 못하면(verify 실패는 hook이 횟수를 센다) 막힘 리포트를 **대화로** 쓴다: 재현 방법 / 시도한 것 / 가설 2개 / 제안(`/clear` 후 재시작, 범위 축소, 마지막 green 커밋으로 되돌리기 중 택1).

## 스택

Next.js 16 App Router · React 19 · TS · TanStack Query v5 · Zustand · Tailwind v4 · shadcn/ui(**Radix가 아닌 Base UI, base-nova**) · lucide-react · **pnpm만**(npm/yarn 금지). 새 라이브러리는 기존 스택으로 불가능할 때만 plan에서 승인받는다.
- Next 문서(`node_modules/next/dist/docs/`)는 새 라우트/레이아웃 생성, `params`/`searchParams`/`cookies`/`headers`, 캐싱·`revalidate`, `next.config` 변경 때만 읽고, 읽은 경로를 보고에 적는다. 단순 컴포넌트·스타일 변경에는 적용하지 않는다.

## 아키텍처

```
src/
├── app/                  # 라우팅만. page.tsx는 feature 컴포넌트 조립만
│   └── (console)/        # 사이드바 셸(layout.tsx)과 에러 안전망(error.tsx). 모든 화면은 이 안에
├── features/<name>/      # 작성 순서: types → api → queries → components
│   ├── types.ts          # BE 요청/응답 타입
│   ├── api.ts            # BE 호출. apiClient 사용, 스트리밍만 raw fetch
│   ├── queries.ts        # TanStack Query 훅 + queryKey (["<feature>", ...] 리터럴로 정의)
│   ├── components/
│   └── store.ts          # (필요 시) Zustand
├── components/           # 공용: page-header · app-sidebar · nav-link
│   └── ui/               # shadcn 생성물 — 수정 금지(Bash로도). 변형은 감싸는 컴포넌트로
└── lib/  api/client.ts(유일한 HTTP 클라이언트) · env.ts(NEXT_PUBLIC_만) · env.server.ts(필요 시) · providers.tsx · console-menu.ts(메뉴 목록)
```
위반은 ESLint가 잡는다(메시지가 대안을 알려준다).

- **데이터는 클라이언트에서** `queries.ts`의 `useQuery` 훅으로만 읽는다. `useSuspenseQuery`·`HydrationBoundary` prefetch는 쓰지 않는다(`useSuspenseQuery`는 빌드·SSR 중 Next 서버가 BE를 호출하고, 실패해도 빌드가 통과한다). `"use client"`는 데이터를 쓰는 컴포넌트 파일에만 붙이고 `page.tsx`/`layout.tsx`는 서버 컴포넌트로 유지한다. `useEffect`+`useState` 페칭 금지.
- **로딩·에러(L5)는 데이터를 쓰는 컴포넌트 안에서** `isPending`/`isError`로 분기하고, 재시도는 `refetch()`로 한다. `error.tsx`·`loading.tsx`는 `useQuery`의 로딩·실패를 잡지 못한다. `error.tsx`는 렌더 버그 안전망으로 레이아웃 수준에 하나만 두고, 재시도 버튼은 `useQueryErrorResetBoundary().reset()` 후 `retry()`를 호출한다.
- queryKey 값(필터·페이지·정렬)은 URL searchParams 또는 `useState`에 둔다. Zustand는 라우트를 넘어 유지돼야 하는 UI 상태(사이드바 열림 등)만.
- 서버 전용 환경변수는 `lib/env.server.ts`에 두고 최상단에 `import "server-only";`(패키지 설치 필요). 비밀값은 되도록 BE에서 처리한다. 새 변수는 `.env.example`에도 추가한다.
- 새 UI는 먼저 `pnpm shadcn add <component>`. shadcn이 생성물과 함께 추가하는 `cn` 패키지는 shadcn 공식 의존성이므로 그대로 받아들인다(별도 승인 불필요, 보고에는 적는다).

## 디자인 시스템

- **색은 `globals.css`의 의미 토큰만** 쓴다(background·foreground·card·muted·primary·secondary·accent·destructive·success·warning·border). 원시 팔레트(`bg-red-500`)·임의 값(`text-[13px]`)·`style` 속성은 lint가 막는다. 필요한 토큰이 없으면 즉석에서 만들지 말고 plan에 "토큰 추가"로 올린다.
- 대표색(primary)은 화면의 주 행동 버튼 하나와 활성 상태에만 쓴다. 상태색(success·warning·destructive)은 의미를 전할 때만 쓰고, **색만으로 전하지 않는다**(아이콘이나 글자를 함께: ✓ 정답, ▲ 3점).
- 모든 화면은 `PageHeader`로 시작한다. 표·금액·시간 같은 숫자는 `tabular-nums`, 숫자 열은 오른쪽 정렬.
- **데이터 영역은 3상태를 모두 그린다**: 로딩은 Skeleton, 빈 상태는 Empty(다음 행동 버튼 하나), 실패는 영역 안 Alert + "다시 시도"(`refetch`). 결과 알림은 toast, 지속되는 문제는 Alert. 필요한 shadcn 컴포넌트는 처음 쓸 때 추가한다.
- **문구**: 합니다체. 버튼은 무슨 일이 일어나는지 동사로("채점하기"). 오류는 무엇이 잘못됐고 어떻게 고치는지 쓰고, 사과·모호한 말은 쓰지 않는다.
- **날짜·숫자 표기는 `src/lib/format.ts` 하나에서만**(처음 필요할 때 만든다): `Intl` ko-KR, `timeZone: "Asia/Seoul"` 고정, 만·억 축약은 내림(9,999원이 "1만"이 되지 않게).

## 새 feature

- 화면은 `src/app/(console)/<route>/`에 만들고, 메뉴는 `src/lib/console-menu.ts`의 해당 항목에 `href`를 채운다(사이드바와 홈 카드가 함께 바뀐다).

## Git

- **`main`에서 직접 작업·커밋·push한다.** 브랜치는 사용자가 요청할 때만 만든다. 브랜치 삭제 등 정리도 AI가 한다. 막히는 명령은 hook이 이유를 알려준다.
- **커밋 전에는 반드시 사용자 확인을 받는다**: 변경 파일 목록(`git diff --stat`)과 커밋 메시지 초안을 보여주고, 승인받은 뒤 commit·push한다. 커밋을 여러 개로 나눌 때는 나눈 단위를 함께 보여준다. 확인 없이 커밋하지 않는다.
- 사용자의 워킹트리 변경을 `stash`/`reset`/`checkout .`/`restore .`로 버리지 않는다.
- 커밋: `feat:`·`fix:`·`chore:`·`refactor:` + 한국어 요약. squash·rebase로 합치지 않는다(`Learn:` trailer 보존).
- `legacy_v1`/`v2`/`v3`/`hyomin`은 main과 공통 조상이 없는 2021~2024 아카이브. 체크아웃·머지·참조 구현에 쓰지 않는다.

## BE 연동

- **호출 경로**: 브라우저는 같은 출처 `/api/v1/*`만 부르고, `next.config.ts` rewrites가 서버 전용 `CORE_API_URL`(빌드 시점 고정)로 중계한다. 브라우저에서 BE·LLM 주소를 직접 부르지 않는다.
- **주력 BE는 `../project-tmi-core`**(영어 학습, 토스 수집). 계약 근거는 `src/main/java/**/controller`와 DTO이고, `docs/public/03_API명세.md`는 코드보다 앞서 있으니 **코드가 기준**이다. `-word`(Python, 유사도)는 core가 호출하는 내부 서비스다. `-back`(레거시), `-chat`, `-gateway`(라우팅 미구성)는 현재 쓰지 않는다.
- **새 엔드포인트는** Controller/DTO를 열어 경로·메서드·응답 필드를 확인하고 plan에 `파일:줄`을 적는다. 확인할 수 없으면 **타입을 추측하지 말고 사용자에게 계약을 묻는다**(추측해도 verify는 green이다). BE가 없으면 plan에 mock 여부를 명시하고 `features/<name>/api.ts` 안에서만 분기한다.
- 알려진 BE 문제: core가 호출하는 `/similarity`가 word에 없다(word는 `/judge`). 채점이 503이면 FE가 아니라 BE 문제로 보고한다.

## 미정 (임의로 정하지 말고 물을 것)

인증/세션 방식(VM은 인터넷에 노출됨, 배포 전 필수) · OpenAPI 기반 타입 생성.
