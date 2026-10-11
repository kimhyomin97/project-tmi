@AGENTS.md

# project-tmi (FE)

BE 마이크로서비스(`../project-tmi-*`, Spring Boot)의 개인 프론트 콘솔. 사용자는 FE를 배우는 BE 개발자 1명, 공개 서비스 아님(SEO 불필요), 오라클 VM 배포.

## 역할

- **AI**: 코드를 100% 작성한다. 사용자에게 수동 단계를 넘기지 않는다.
- **사용자**: plan 승인 · 증거 확인 · 커밋 승인 · **학습 체크(`/learn`)**. 이 프로젝트의 목표는 사용자가 아래 L1~L5 판단을 스스로 내리게 되는 것이다.
- 지시받은 기능만 만든다. 앞으로 생길 기능을 위한 추상화·폴더·설정을 미리 만들지 않는다.

## 규칙을 바꿀 때

- 이 문서와 `.claude/`는 AI가 임의로 바꾸지 않는다. 막히면 멈추고 "어느 줄을 어떻게, 왜"를 제시해 승인받는다.
- 승인된 변경은 단독 `chore:` 커밋 + "새 세션에서 시작하세요" 안내(진행 중 세션·서브에이전트에는 반영되지 않는다).

## 작업 루프

1. **plan** — 생략 가능: 기존 파일 3개 이하 수정이고 새 파일·새 의존성·`"use client"` 추가·queryKey 변경이 없을 때만. 넘으면 멈추고 plan.
   plan 항목: ① `"use client"` 파일 / Zustand 필드 / queryKey ② 해당 L번호와 이유 2~3줄 ③ 의존성 추가 사유(커밋 메시지에도) ④ 완료 조건(사용자 말로 쓴 동작 + 확인 방법). 없으면 "없음".
2. **SPEC** — 모든 feature는 `docs/spec/<feature>.md`(템플릿: `docs/spec/TEMPLATE.md`). 화면 2개 이상이면 인터뷰 후 SPEC만 쓰고 "`/clear` 후 SPEC을 읽고 구현"을 안내하며 턴을 끝낸다.
3. **구현** — 디버깅은 수정 전에 원인 1줄.
4. **검증** — `pnpm verify` + 완료 조건별 증거(`pnpm shot <경로>`). 이어서 `red-team` 에이전트(완료 조건을 넘긴다). `수정 필요`면 고치고 재검사(최대 3바퀴, 넘으면 막힘 리포트).
5. **기록** — 완료 조건 판정·증거 경로와 레드팀의 "SPEC 기록용 한 줄"을 SPEC의 "완료 조건"·"레드팀" 표에 채운다.
6. **보고 → 커밋 확인** — `/report` 절차(skill)를 따른다. 커밋 전 `git diff --stat`과 메시지 초안을 보여주고 승인받는다.

서브에이전트에도 PreToolUse 가드는 걸리지만 **Stop 검증(typecheck·lint·build)은 걸리지 않는다**. 서브에이전트 결과를 받으면 메인에서 `pnpm verify`.

## 학습 포인트

| # | 판단 지점 | 흔한 오판 |
|---|---|---|
| L1 | Server/Client 경계 | 페이지 전체에 `"use client"` |
| L2 | 브라우저 노출 (`NEXT_PUBLIC_`, client 번들) | 서버 전용이라 믿은 값이 브라우저로 |
| L3 | 데이터 소유 (TanStack Query / Zustand / useState) | 서버 데이터를 store에 복사 |
| L4 | queryKey · invalidation | mutation 후 stale 화면 |
| L5 | 로딩·에러 경계 | 실패 시 흰 화면 |

- 해당 결정을 한 커밋에 trailer: `Learn: L4 — mutation 후 ["english"] 접두 키 invalidate`
- L1~L3이 plan에 있었으면 완료 보고 첫 줄에 그 결정을 1문장으로 다시 설명한다(승인은 기다리지 않는다).
- 기능 완료 보고 끝에 "`/learn`으로 이번 결정을 점검할 수 있습니다"를 한 줄 덧붙인다. 답을 먼저 알려주지 않는다.

## 막혔을 때

같은 증상을 2번 고치지 못하면(verify 실패는 hook이 센다) 대화로 막힘 리포트: 재현 / 시도 / 가설 2개 / 제안(`/clear` 후 재시작 · 범위 축소 · 마지막 green 커밋으로 되돌리기 중 택1).

## 스택과 명령

Next.js 16 App Router · React 19 · TS · TanStack Query v5 · Zustand · Tailwind v4 · shadcn/ui(Radix가 아닌 Base UI, base-nova) · lucide-react · **pnpm만**(npm/yarn 금지). 새 라이브러리는 기존 스택으로 불가능할 때만 plan에서 승인.

| 명령 | 용도 |
|---|---|
| `pnpm verify` | typecheck + lint + build (Stop hook과 같은 검사) |
| `pnpm shot <경로...>` | 화면 촬영·측정(dev 서버 실행·재사용, 1280/400px, HTTP·넘침·콘솔 에러, 종료까지). 실패 exit 1, 도구 오류 exit 2. 결과 `.shots/`. 늦게 그려지면 `--wait=<ms>` |
| `pnpm shadcn add <이름>` | 새 UI는 먼저 이것. 따라오는 `cn`, toast의 `sonner`·`next-themes`는 승인된 예외(보고에 적는다). 이후 디자인 문서 "shadcn 함정" 확인 |

- dev 서버를 직접 띄웠다면 끝나면 종료하고 포트가 비었는지 확인한다.
- Next 문서(`node_modules/next/dist/docs/`): AGENTS.md의 "before writing any code"는 **아래 경우로 좁힌다** — 새 라우트·레이아웃, `params`/`searchParams`/`cookies`/`headers`, 캐싱·`revalidate`, `next.config`, `proxy`. 읽은 경로를 보고에 적는다. 단순 컴포넌트·스타일 변경에는 적용하지 않는다.

## 구조 (위반은 ESLint가 메시지로 대안을 알려준다)

```
src/app/(console)/<route>/page.tsx   # 서버 컴포넌트, feature 컴포넌트 조립만. metadata.title 필수
src/app/(console)/                   # 사이드바 셸(layout.tsx)·렌더 버그 안전망(error.tsx)
src/app/not-found.tsx · global-error.tsx  # 없는 주소·루트 레이아웃 오류
src/features/<name>/                 # types → api(apiClient, 스트리밍만 raw fetch) → queries → components (→ store.ts 필요 시)
src/components/                      # 공용(page-header, app-sidebar, nav-link, mobile-nav, sidebar-collapse, status-badge)
src/components/ui/                   # shadcn 생성물 — 수정 금지(Bash로도). 변형은 감싸는 컴포넌트로
src/lib/                             # api/client.ts(유일한 HTTP), env.ts(NEXT_PUBLIC_만), env.server.ts(필요 시),
                                     # providers.tsx, console-menu.ts(메뉴), sidebar-store.ts(라우트를 넘는 셸 상태)
```

- 데이터는 client 컴포넌트에서 `queries.ts`의 `useQuery`로만. `useSuspenseQuery`(빌드·SSR 중 Next 서버가 BE를 부르고 실패해도 빌드 통과)·`HydrationBoundary` prefetch·`useEffect` 페칭 금지.
- `"use client"`는 상태·이벤트·브라우저 API·데이터가 필요한 **말단** 파일에만. `page.tsx`/`layout.tsx`는 서버.
- 데이터 영역은 컴포넌트 안에서 `isPending`/`isError`로 3상태(로딩·빈 상태·실패)를 모두 그린다. `error.tsx`·`loading.tsx`는 `useQuery`의 로딩·실패를 잡지 못한다(렌더 버그 안전망일 뿐).
- queryKey — *D-04가 B로 결정됐을 때의 문안*: feature당 `queryOptions` 묶음(`<feature>Queries`)으로 `queries.ts`에 정의한다. (A면: `["<feature>", ...]` 리터럴로 정의.) 필터·페이지 값은 URL searchParams 또는 `useState`. Zustand는 라우트를 넘는 UI 상태만.
- 환경변수(L2): 서버 전용 값은 `lib/env.server.ts`에 두고 최상단 `import "server-only";`(패키지 설치 필요). 비밀값은 되도록 BE에서 처리한다. 새 변수는 `.env.example`에도 추가한다.
- 새 화면: `src/app/(console)/<route>/` 생성 → `src/lib/console-menu.ts`에 `href`(타입 검사됨).
- 화면·컴포넌트·스타일 작업 전에 `docs/design-system.md`를 읽는다. 세부 디자인 규칙은 `.claude/rules/design.md`(tsx·globals.css를 읽거나 편집할 때 자동 로드).

## BE 연동

- 브라우저는 같은 출처 `/api/v1/*`만 부른다(rewrites가 서버 전용 `CORE_API_URL`로 중계). 계약은 `../project-tmi-core`의 Controller/DTO 코드가 기준이다.
- **새 엔드포인트는 Controller/DTO를 열어 확인하고 plan에 `파일:줄`을 적는다. 확인할 수 없으면 타입을 추측하지 말고 사용자에게 묻는다.**
- 채점이 503이면 FE가 아니라 BE 문제로 보고한다(core가 부르는 `/similarity`가 word에 없다).
- 세부(호출 경로, mock 분기, 오류·404 처리, queryKey 무효화)는 `.claude/rules/be-integration.md`(`features/*/api.ts`·`types.ts`·`queries.ts`, `lib/api/**`, `next.config.ts`를 읽거나 편집할 때 자동 로드).

## Git

- 기본: `main`에서 직접 작업·커밋·push. 브랜치는 사용자 요청 시에만. 정리(브랜치 삭제 등)도 AI가 한다.
- **커밋 전 사용자 확인**(`git diff --stat` + 메시지 초안). 나눌 때는 단위도 보여준다.
- 예외(D-05): 사용자가 작업 지시서에 브랜치·커밋 권한을 명시하면, 그 작업 동안은 지정 브랜치에서 커밋 전 확인 없이 작업 끝에 커밋 1개로 묶어 커밋·push한다(2026-10-11 사용자 결정: 단계마다 나누지 않는다). main에는 merge·push하지 않는다(통합은 사용자가 PR로 판단).
- 사용자 워킹트리 변경을 `stash`/`reset --hard`/`checkout .`/`restore .`/`switch -f`로 버리지 않고, 로컬 main·아카이브 브랜치를 지우거나 옮기지 않는다(가드가 차단한다).
- 커밋: `feat:`·`fix:`·`chore:`·`refactor:` + 한국어 요약. squash·rebase 금지(`Learn:` 보존).
- `legacy_v1`/`v2`/`v3`/`hyomin`은 공통 조상 없는 아카이브. 체크아웃·머지·참조 금지.

## 미정 (임의로 정하지 말고 물을 것)

인증/세션 방식(**VM 공개 배포 전 필수** — rewrites가 `/api/v1/*`를 인증 없이 중계한다) · OpenAPI 기반 타입 생성.
