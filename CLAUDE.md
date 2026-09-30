@AGENTS.md

# project-tmi (FE)

개인 토이프로젝트 BE 마이크로서비스군(`../project-tmi-*`)의 진입점이 되는 프론트엔드 콘솔.
**코드는 AI가 100% 작성한다. 사용자는 plan 승인 → 증거 확인 → merge만 한다.**
이 문서의 규칙은 AI가 임의로 바꾸지 않는다. 규칙이 작업을 막으면 구현을 멈추고, 어느 줄을 어떻게 바꿀지와 이유를 제시해 승인을 받는다. 승인된 규칙 변경은 코드 변경과 섞지 않고 단독 `chore:` 커밋으로 만든다.

## 프로젝트 목적

- 사용자는 BE 개발자 본인 1명. 공개 서비스 아님 → SEO 불필요.
- 오라클 VM에 배포하며, BE는 Spring Boot 마이크로서비스(추후 `project-tmi-gateway` 경유).
- 목표: AI 주도 FE 개발 방식 체득 + FE 고유 판단 지점(아래 학습 포인트)의 이해.
- 지시받은 기능만 만든다. 앞으로 생길 기능을 위한 선제 추상화·폴더·설정을 미리 만들지 않는다.

## 작업 루프

- **plan 없이 바로 구현해도 되는 것**: 기존 파일 3개 이하를 고치면서 새 파일·새 의존성·`"use client"` 추가·queryKey 변경이 **하나도 없는** 변경. 하나라도 해당하면 plan mode로 간다. 착수한 뒤 이 경계를 넘게 되면 멈추고 plan을 제시한다.
- **plan에 반드시 포함할 것**
  - 필수 3줄: `"use client"` 파일 목록 / Zustand store 필드 / queryKey 목록 (실제로 없을 때만 "없음")
  - 학습 포인트: 해당 L번호와 선택 이유 2~3줄 (실제로 없을 때만 "없음")
  - 의존성 추가가 있으면 사유
- 화면 2개 이상인 큰 feature는 먼저 사용자를 인터뷰해 SPEC을 `docs/spec/<feature>.md`(커밋 대상)에 쓴다. **SPEC을 쓴 뒤 이어서 구현하지 말고**, "`/clear` 후 그 파일을 읽고 구현을 시작하라"고 안내하며 턴을 끝낸다.
- **완료 보고는 주장 대신 증거로**: ① 실행한 명령과 출력 ② 화면 확인 절차(URL과 눌러볼 것) ③ 3줄 요약 ④ plan 파일 목록 대비 `git diff --stat` ⑤ **plan의 필수 3줄 재측정 결과**. ⑤는 명령 출력으로 증명한다: `git grep -l '"use client"' src` / `git grep -n 'queryKey' src/features`. plan과 다르면 다른 이유를 먼저 쓴다.
- 디버깅 시 수정 전에 원인을 1줄로 먼저 설명한다.

## 학습 포인트

| # | 판단 지점 | 흔한 오판 |
|---|---|---|
| L1 | Server/Client 경계 | 페이지 전체에 `"use client"` |
| L2 | 브라우저 노출 (`NEXT_PUBLIC_`, client 번들) | 서버 전용이라 믿은 값이 브라우저로 |
| L3 | 데이터 소유 (TanStack Query / Zustand / useState) | 서버 데이터를 store에 복사 |
| L4 | queryKey · invalidation | mutation 후 stale 화면 |
| L5 | 로딩·에러 경계 (Suspense, `error.tsx`) | 실패 시 흰 화면 |

- 해당 결정을 한 커밋에는 trailer를 남긴다: `Learn: L4 — mutation 후 ["assets"] invalidate`
- L1~L3이 plan에 포함됐으면 **완료 보고 첫 줄에 그 결정을 1문장으로 다시 설명한다.** 이해 여부 확인은 사용자의 역할이며, AI는 승인을 기다리지 않고 진행한다.

## 막혔을 때

- `pnpm verify` 실패는 Stop hook이 관리한다(2회까지는 원인을 1줄로 설명하고 고친다, 3회 연속이면 hook이 막힘 리포트를 지시한다).
- verify 외의 문제로 같은 증상을 2번 고치지 못하면 스스로 막힘 리포트를 쓴다: 재현 방법 / 시도한 것 / 가설 2개 / 제안(`/clear` 후 재시작, 범위 축소, 마지막 green 커밋으로 되돌리기 중 택1).
- 막힘 리포트는 **파일로 만들지 말고 대화로** 보고한다.

## 스택 (고정)

| 영역 | 선택 | 비고 |
|---|---|---|
| 프레임워크 | Next.js 16 (App Router) + React 19 + TypeScript | 아래 "Next 문서" 항목 참고 |
| 서버 상태 | TanStack Query v5 | BE API 데이터는 전부 여기 |
| 클라이언트 상태 | Zustand | 라우트를 넘어 유지돼야 하는 UI 상태만 |
| 스타일링 | Tailwind CSS v4 + shadcn/ui (Base UI, base-nova preset) | 런타임 CSS-in-JS 금지 |
| 아이콘 | lucide-react | |
| 패키지 매니저 | pnpm | npm/yarn 명령 사용 금지 |

- 새 라이브러리 추가는 기존 스택으로 불가능할 때만, plan에서 승인받고 커밋 메시지에 사유를 남긴다.
- **Next 문서**: `@AGENTS.md`의 "코드 작성 전 Next 문서 확인"은 다음에만 적용한다 — 새 라우트/레이아웃 파일 생성, `params`/`searchParams`/`cookies`/`headers` 사용, 캐싱·`revalidate` 설정, `next.config` 변경. 이때 `node_modules/next/dist/docs/index.md`에서 해당 가이드를 찾아 읽고 읽은 경로를 보고에 적는다. 단순 컴포넌트·스타일 변경에는 적용하지 않는다.

## 아키텍처 규칙

```
src/
├── app/                  # 라우팅만. page.tsx는 feature 컴포넌트를 조립만 한다
├── features/<name>/      # 기능 단위 모듈
│   ├── api.ts            # 이 기능의 BE 호출 (apiClient 사용, 스트리밍만 raw fetch)
│   ├── queries.ts        # TanStack Query 훅 + queryKey (["<feature>", ...])
│   ├── components/       # 이 기능 전용 컴포넌트
│   ├── store.ts          # (필요 시) Zustand 스토어
│   └── types.ts          # BE 요청/응답 타입
├── components/           # 공용 컴포넌트 (ui/ = shadcn 생성물, 직접 수정 금지)
└── lib/
    ├── api/client.ts     # 유일한 HTTP 클라이언트
    ├── env.ts            # 공개 환경변수 (NEXT_PUBLIC_ 만)
    ├── env.server.ts     # 서버 전용 환경변수 (필요해질 때 생성)
    ├── providers.tsx     # QueryClientProvider 등
    └── utils.ts          # cn() 등 공용 유틸 (shadcn 별칭 대상)
```

ESLint가 강제한다(우회 불가 — 인라인 `eslint-disable`은 무효 처리됨): feature 간 import 금지 · `process`/`process.env` 접근은 `lib/env*.ts`에서만 · `fetch`/`EventSource`/`XMLHttpRequest`는 `lib/api/`와 `features/*/api.ts`(또는 `api/` 하위)에서만 · `axios`·CSS-in-JS 등 스택 이탈 import 금지.

- **데이터는 클라이언트에서 가져온다.** BE 데이터는 반드시 `queries.ts`의 TanStack Query 훅으로 읽는다. 서버 컴포넌트 prefetch(`HydrationBoundary`)는 **현재 도입하지 않는다.** 따라서 데이터를 쓰는 컴포넌트는 client가 되며, `"use client"`는 **그 컴포넌트 파일에만** 붙이고 `page.tsx`/`layout.tsx`는 서버 컴포넌트로 유지한다. `useEffect`+`useState` 페칭 금지. 서버 데이터를 Zustand에 복사하지 않는다.
- queryKey에 들어가는 값(필터·페이지·정렬)은 URL searchParams 또는 `useState`에 둔다. Zustand는 라우트를 넘어 유지돼야 하는 UI 상태(사이드바 열림 등)에만 쓴다.
- **서버 전용 값은 `env.ts`에 두지 않는다.** `NEXT_PUBLIC_` 없는 값을 `env.ts`에 두면 서버 렌더된 HTML로 평문 유출되고 브라우저에서는 `undefined`가 된다(ESLint가 막는다). 서버 전용 값은 `lib/env.server.ts`에 두고 최상단에 `import "server-only";`를 넣는다(이때 `server-only` 패키지 설치가 필요하다). 비밀값 자체는 되도록 FE에 두지 말고 BE에서 처리한다. 새 환경변수는 `.env.example`에도 추가한다.
- 새 UI는 먼저 `pnpm shadcn add <component>`. 변형은 감싸는 컴포넌트로 만든다.

## 새 feature 추가 절차

1. `src/features/<name>/`: types.ts → api.ts → queries.ts → components/
2. `src/app/<route>/page.tsx`에서 조립
3. 같은 라우트 폴더에 `error.tsx`(재시도 버튼 포함)와 `loading.tsx`를 만든다. 상위 라우트에 이미 있어 생략한다면 그 사실을 plan에 적는다.
4. 사이드바 내비게이션에 메뉴 추가. **사이드바 셸(`src/app/(console)/layout.tsx`)이 아직 없으면 직접 만들지 말고 plan에 별도 항목으로 올려 승인받는다**(첫 feature에서 반드시 발생한다).
5. `pnpm verify` 통과 — Stop hook이 자동 실행하며, 완료 보고 전에 AI가 직접 확인해 출력을 증거로 붙인다.

## 명령어

```bash
pnpm dev          # 개발 서버 (Turbopack)
pnpm check        # typecheck + lint
pnpm verify       # check + build — Stop hook이 자동 실행. 완료 보고 전 반드시 통과
```

## Git

- 기준 브랜치는 `main`이며 PR base도 항상 `main`이다. 작업은 `feat/…`·`fix/…`·`chore/…` 브랜치에서 한다(보호 브랜치 커밋은 hook이 차단).
- 현재 브랜치가 보호 브랜치면 먼저 `git switch -c feat/<이름>`으로 옮긴다. **워킹트리 변경은 그대로 들고 옮긴다** — `stash`/`reset`/`checkout .`로 사용자의 변경을 버리지 않는다.
- 작업 브랜치의 push는 AI가 한다. force push·mirror·원격 브랜치 삭제는 hook이 차단한다(사용자 전용). merge는 사용자가 한다.
- 커밋 메시지: `feat:`·`fix:`·`chore:`·`refactor:` prefix의 한국어 요약. merge 시 squash하지 않는다(`Learn:` trailer 보존).
- `legacy_v1`/`v2`/`v3`/`hyomin`은 `main`과 **공통 조상이 없는** 2021~2024 아카이브다. 체크아웃·머지·PR base·참조 구현 어디에도 쓰지 않는다.

## BE 연동

- BE 저장소: `../project-tmi-back`, `../project-tmi-core`, `../project-tmi-chat`, `../project-tmi-gateway`(미연결), `../project-tmi-word`(Python).
- **새 엔드포인트를 쓰기 전에** `../project-tmi-*`의 Controller/DTO를 열어 경로·메서드·응답 필드를 확인하고 plan에 `파일:줄` 근거를 적는다. 소스에서 확인할 수 없으면 **추측해서 타입을 만들지 말고 사용자에게 계약을 묻는다**(타입을 추측해도 verify는 green이라 사용자가 검증할 수 없다).
- BE가 아직 없으면 plan에 mock 여부를 명시하고 `features/<name>/api.ts` **안에서만** 분기한다. 컴포넌트에 mock 데이터를 넣지 않는다.
- gateway 연결 전에는 `NEXT_PUBLIC_API_BASE_URL`이 개별 서비스를 가리킨다. gateway 연결 시 이 값만 교체하면 되도록 API 경로를 설계한다.

## 아직 정해지지 않은 것 (임의로 정하지 말고 물어볼 것)

인증/세션 방식(오라클 VM은 인터넷에 노출된다) · 브라우저 직접 호출 vs Next rewrites · OpenAPI 기반 타입 생성 · 사이드바 셸 도입 시점.
배경은 `docs/private/ai/01-ai-usage-design.md`(로컬 전용, 커밋되지 않음). 검증 자동화의 실제 동작은 `.claude/hooks/stop-check.mjs`, 차단되는 도구·명령은 `.claude/settings.json`과 `.claude/hooks/guard-bash.mjs`를 읽고 판단한다.
