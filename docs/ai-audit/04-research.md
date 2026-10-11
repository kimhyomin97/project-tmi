# 04. 리서치 — 공식 권장안과 이 프로젝트 적용 적합성

조사일: 2026-10-11. 인용은 25단어 이하 원문 발췌.

**출처 신뢰도 표기**
- **[로컬]**: 이 저장소 `node_modules/` 안의 설치본 문서를 `grep`으로 직접 확인(Next 16.3.1, eslint-plugin-tailwindcss 4.4.0).
- **[웹·원문]**: 페이지 원문 전체를 받아 확인.
- **[웹]**: 웹 가져오기 도구가 요약 과정을 거쳐 돌려준 원문 문장. 문장 자체는 원문이라고 반환됐지만 전체 맥락은 확인하지 못했다.
- 이 환경에서 `nextjs.org`, `tanstack.com`, `tkdodo.eu`, `designtokens.org`는 접속 실패(DNS 실패, 프록시 403). Next는 설치본 문서로, TanStack·TkDodo·Bulletproof React는 GitHub raw 원본으로 대체했다.

## 1. Claude Code 공식 권장 설정

### 1.1 CLAUDE.md (메모리) — https://code.claude.com/docs/en/memory [웹·원문]

| 권장 | 원문 발췌 | 이 프로젝트 |
|---|---|---|
| 크기 | "target under 200 lines per CLAUDE.md file. Longer files consume more context and reduce adherence." | 100줄 — 범위 안. 다만 한 줄 다중 규칙이 많아 실제 밀도는 높다(`01-ai-setup.md` AI-10) |
| import는 비용을 줄이지 않음 | "imported files also load at launch." | `@AGENTS.md` import도 매번 로드 |
| 강제력 없음 | "Claude treats them as context, not enforced configuration. To block an action ... use a PreToolUse hook" | 이미 lint·hook으로 강제하는 설계와 일치 |
| 경로별 규칙 | "Rules can be scoped to specific files using YAML frontmatter with the `paths` field." | 디자인·BE 연동 규칙을 `.claude/rules/*.md` + `paths:`로 분리 가능 |
| 모순 | "if two instructions contradict each other, Claude may pick one arbitrarily." | `AGENTS.md:5` vs `CLAUDE.md:45` 충돌(AI-08)이 이 경우 |
| 하위 폴더 CLAUDE.md | "Files in subdirectories load on demand." | 현재 없음. `src/features/` 전용 지침을 둘 수 있음 |

적합성: **높음.** 줄 수보다 "작업과 무관한 규칙이 항상 로드되는 것"과 "충돌"이 개선 대상이다.

### 1.2 Hooks — https://code.claude.com/docs/en/hooks [웹], https://code.claude.com/docs/en/best-practices [웹·원문]

- exit 2 의미: PreToolUse "Blocks the tool call", PostToolUse "Shows stderr to Claude; the tool already ran", Stop "Prevents Claude from stopping, continues the conversation". [웹]
- 무한 루프: "The `stop_hook_active` field is `true` when Claude Code is already continuing as a result of a stop hook." 또한 "Claude Code applies an 8-consecutive-continuation cap". [웹]
- 편집 단위 lint: "This example runs a linting script only when Claude writes or edits a file" (matcher `Edit|Write`). [웹]
- 서브에이전트: "Hooks from settings files, managed policy settings, and plugins also run inside subagents." [웹]
- 강제성: "Unlike CLAUDE.md instructions which are advisory, hooks are deterministic and guarantee the action happens." [웹·원문]

이 프로젝트 실측과 대조:
- **PreToolUse 가드는 서브에이전트 안에서도 동작한다(실측).** 서브에이전트에게 `git push --force no-such-remote-xyz …`를 실행시키자 `guard-bash.mjs`의 "force push / mirror는 히스토리를 덮어쓰므로…" 메시지로 차단됐다. 반면 Stop hook(`stop-check.mjs`)은 메인 턴 종료에 걸리고 서브에이전트 종료(SubagentStop)에는 등록돼 있지 않다. 따라서 `CLAUDE.md:20` "서브에이전트가 쓴 코드는 hook 검증을 받지 않는다"는 **검증(typecheck·lint·build) hook에 한해서만 맞고**, 가드 hook에는 맞지 않는다.
- `stop-check.mjs`는 `stop_hook_active`를 읽지 않고 자체 실패 카운터(`:122`, `:131`)로 루프를 끊는다. 기능상 문제는 없지만 공식 필드를 쓰면 상태 파일 없이도 같은 효과를 낼 수 있다.

적합성: **높음.** PostToolUse(편집 직후 해당 파일만 lint)와 Stop(build) 분리가 비용 대비 효과가 크다.

### 1.3 Skills — https://code.claude.com/docs/en/skills [웹]

- "a skill's body loads only when it's used, so long reference material costs almost nothing until you need it."
- 만들 때: "when a section of CLAUDE.md has grown into a procedure rather than a fact."
- "Custom commands have been merged into skills." / 수동 실행 전용은 `disable-model-invocation`.

적합성: **중간~높음.** CLAUDE.md의 "작업 루프"·"완료 보고"(`CLAUDE.md:10-23`)는 사실이 아니라 절차다. `/plan-feature`, `/report` 같은 skill로 옮기면 평소 컨텍스트가 줄고, 절차를 사람이 직접 호출해 학습 흐름에 끼워 넣을 수 있다.

### 1.4 Subagents — https://code.claude.com/docs/en/sub-agents [웹]

- tools 생략 시: "Inherits every tool available to subagents if omitted."
- 제한: "use the `tools` field as an allowlist or the `disallowedTools` field as a denylist."
- 리뷰어 과잉 지적 경고(best practices [웹·원문]): "A reviewer prompted to find gaps will usually report some, even when the work is sound"

적합성: **높음.** `red-team.md`에 `disallowedTools: Edit, Write`를 넣는 것은 비용이 거의 없다. 과잉 지적 경고는 red-team의 "취향 지적은 최대 3개"(`red-team.md:35`)와 같은 방향이다.

### 1.5 권한 — https://code.claude.com/docs/en/permissions [웹·원문]

- "a deny or ask rule covers the invocation Claude usually produces and isn't a security boundary around the program."
- "Bash permission patterns that try to constrain command arguments are fragile."
- 대안: "use sandboxing. To inspect the full command text with your own logic before it runs, use a PreToolUse hook"

적합성: **높음.** `guard-bash.mjs` 우회 실측(`01-ai-setup.md` 2.4절)은 문서가 예고한 한계와 같다. 되돌릴 수 없는 일(force push, main 삭제)은 원격 저장소의 브랜치 보호처럼 **명령 문자열과 무관한 계층**에서 막는 것이 정석이다.

### 1.6 Best practices — https://code.claude.com/docs/en/best-practices [웹·원문]

- "Give Claude a check it can run: tests, a build, a screenshot to compare."
- "If you could describe the diff in one sentence, skip the plan."
- "For each line, ask: 'Would removing this cause Claude to make mistakes?' If not, cut it."
- "If you emphasize many lines, none of them stands out."
- "Once the spec is complete, start a fresh session to execute it."

적합성: **높음.** 이 프로젝트의 증거 기반 완료 보고, SPEC 후 `/clear`(`CLAUDE.md:14`), 2회 실패 시 리셋(`CLAUDE.md:40`), 적대적 리뷰는 이 문서와 거의 같다. 다른 점은 ① "tests"가 없다 ② 굵게 강조한 구절이 많다(CLAUDE.md의 `**…**` 25곳, `grep -o` 실측) ③ lint·hook이 이미 강제하는 내용도 문장으로 반복한다.

## 2. 장시간 에이전트 하네스 패턴

**Effective harnesses for long-running agents** — https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents [웹]

| 패턴 | 원문 발췌 | 이 프로젝트 현황 |
|---|---|---|
| 기능 목록 JSON | "edit this file only by changing the status of a passes field" | 없음(plan은 대화에만) |
| 진행 파일 | "a claude-progress.txt file that keeps a log of what agents have done" | 없음 |
| 실행 스크립트 | "Write an `init.sh` script that can run the development server" | `pnpm dev`·`pnpm shot`이 대신함 |
| 한 번에 하나 | "work on only one feature at a time" | 규칙상 유사(SPEC 1개씩) |
| E2E 검증 | "do all testing as a human user would" | `pnpm shot`(정적) — 상호작용 없음 |
| 실패 양상 | "mark a feature as complete without proper testing" | red-team이 이를 겨냥하지만 동작 조건은 "판정 불가"로 빠짐 |

**Effective context engineering** — https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents [웹]
- "finding the smallest possible set of high-signal tokens" / 메모: "the agent regularly writes notes persisted to memory outside of the context window."

**Building effective agents** — https://www.anthropic.com/engineering/building-effective-agents [웹]
- "finding the simplest solution possible, and only increasing complexity when needed." / evaluator-optimizer 패턴.

적합성: **중간.** 세션이 짧고 사람이 매번 승인하므로 feature JSON·progress 파일을 그대로 들일 필요는 없다. 다만 **SPEC 파일 안에 완료 조건 체크리스트와 결과(레드팀 판정 포함)를 남기는 것**은 이 패턴의 핵심(대화 밖에 남기기)을 가장 싸게 가져오는 방법이다. "simplest solution … only increasing complexity when needed"는 `01-ai-setup.md` AI-02(하네스 과투자)를 판단할 기준이 된다.

## 3. FE 스택 권장 구조

### 3.1 Next.js 16 (설치본 문서) [로컬]

| 주제 | 원문 발췌 · 파일 | 이 프로젝트 |
|---|---|---|
| 구조 | "Next.js is **unopinionated** about how you organize and colocate your project files." (`01-app/01-getting-started/02-project-structure.md:190`) | `src/app` 라우팅 + `src/features` 분리는 문서가 제시하는 "Split project files by feature or route" 전략 |
| Client 경계 | "add `'use client'` to specific interactive components instead of marking large parts of your UI as Client Components." (`05-server-and-client-components.md`) | 준수(client 6개 모두 말단) |
| Provider 위치 | "render providers as deep as possible in the tree" (`05-server-and-client-components.md:417`) | `Providers`가 `body` 바로 안(`src/app/layout.tsx:26`). 앱 전체가 Query를 쓰므로 타당 |
| 환경변수 | "all `NEXT_PUBLIC_` variables will be frozen with the value evaluated at build time" (`02-guides/environment-variables.md:166`) | 공개 변수 0개. `CORE_API_URL`(rewrites)의 빌드 시점 고정은 문서 문장이 아니라 커밋 `3309ac0` 본문의 실측("A로 빌드·B로 실행 → A로 감")이 근거 |
| 에러 | "errors in event handlers or async code aren't handled by error boundaries" (`01-getting-started/10-error-handling.md`) | L5 규칙(`CLAUDE.md:67`)과 일치 |
| 테스트 | "we recommend using **End-to-End Testing** over **Unit Testing** for `async` components." (`02-guides/testing/index.md:20`) | 데이터는 client `useQuery`만 쓰므로 async 서버 컴포넌트 제약은 거의 무관 → 단위 테스트 가능 |

### 3.2 TanStack Query v5 (GitHub raw)

- 쿼리 키: "If your query function depends on a variable, include it in your query key" — https://raw.githubusercontent.com/TanStack/query/main/docs/framework/react/guides/query-keys.md
- 무효화: "you can match multiple queries by their prefix" — https://raw.githubusercontent.com/TanStack/query/main/docs/framework/react/guides/query-invalidation.md
- `queryOptions`: "One of the best ways to share `queryKey` and `queryFn` between multiple places, yet keep them co-located." — https://raw.githubusercontent.com/TanStack/query/main/docs/framework/react/guides/query-options.md
- 테스트: 테스트마다 새 QueryClient, "The easiest way to turn retries off is via the QueryClientProvider." — https://raw.githubusercontent.com/TanStack/query/main/docs/framework/react/guides/testing.md
- TkDodo "Effective React Query Keys": "I recommend one Query Key factory per feature." / "Structure your Query Keys from most generic to most specific." — https://raw.githubusercontent.com/TkDodo/blog/main/content/posts/effective-react-query-keys/index.mdx
- 재시도 기본값(TanStack 문서 웹 페이지는 접속 실패, `03-code-structure.md` CS-04에서 참조): https://tanstack.com/query/v5/docs/framework/react/guides/query-retries — **이 환경에서 확인 불가.** 설치본 `node_modules/@tanstack/query-core` 소스로 확인한 값은 아래 3.3.

적합성: **높음.** 현재 규칙 "queryKey는 `["<feature>", ...]` 리터럴"(`CLAUDE.md:57`)은 feature당 `queryOptions` 묶음(키 + queryFn)으로 바꾸면 L4(무효화 누락)를 구조로 줄일 수 있다. 단, 완료 보고의 재측정 grep(`CLAUDE.md:18`)이 리터럴 형태를 전제로 하므로 함께 바꿔야 한다.

### 3.3 설치본 소스 확인 (재시도 기본값) [로컬]

`03-code-structure.md` CS-04의 근거(첫 재시도 1초)를 설치본에서 직접 확인했다 — 아래 "부록 A" 참조.

### 3.4 Bulletproof React — https://raw.githubusercontent.com/alan2207/bulletproof-react/master/docs/project-structure.md

- "It might not be a good idea to import across the features. Instead, compose different features at the application level."
- 단방향: "shared -> features -> app". 강제는 ESLint `import/no-restricted-paths`의 `zones`.

적합성: **높음.** feature 간 금지는 이미 로컬 규칙으로 있다(`eslint.config.mjs:27-67`). 역방향(`components`/`lib` → `features`/`app`)만 추가하면 된다. `eslint-config-next`가 `eslint-plugin-import`를 포함하는지에 따라 새 의존성 없이 가능할 수 있다(→ `examples/eslint/` 참조).

## 4. 디자인 시스템 운영 사례

| 출처 | 원문 발췌 | 이 프로젝트 |
|---|---|---|
| shadcn/ui 테마 — https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/content/docs/(root)/theming.mdx | "We use and recommend CSS variables for theming." | 그대로 따름(`globals.css`) |
| Tailwind v4 `@theme` — https://raw.githubusercontent.com/tailwindlabs/tailwindcss.com/main/src/docs/theme.mdx | "Theme variables are special CSS variables defined using the `@theme` directive" | `--color-*: initial`로 팔레트 제거(`globals.css:18`) — 공식 문서의 리셋 방법과 같음 |
| eslint-plugin-tailwindcss 4.4.0 README [로컬] | "Made for Tailwind CSS v4", "9 rules available" (`node_modules/eslint-plugin-tailwindcss/README.md:13-14`) | v4 대응 확인. 점검 샘플에서 `foo-bar`를 정상 차단 |
| eslint-plugin-better-tailwindcss — https://raw.githubusercontent.com/schoero/eslint-plugin-better-tailwindcss/main/README.md | `no-restricted-classes`: "Disallow restricted classes." | 대안. 지금 바꿀 이유는 약함 |
| W3C Design Tokens CG | 제목만 확인: "Design Tokens Format Module 2025.10" 첫 안정판(https://www.w3.org/community/reports/design-tokens/CG-FINAL-format-20251028/) | 1인 프로젝트에는 과함 |

적합성 정리: 토큰·강제 장치는 이미 업계 관행 이상이다. 부족한 것은 **역할 토큰(타이포·컨테이너)과 상태 표현 부품(배지·Empty·Alert 래퍼)** 이며, 이는 외부 사례보다 이 프로젝트 내부 일관성 문제다(`02-design-system.md`).

## 5. 접근 방식별 적합성 종합

| 접근 | 출처 | 적합성 | 이유 |
|---|---|---|---|
| CLAUDE.md 슬림화 + `.claude/rules/` 경로별 분리 | 1.1 | 높음 | 무관 규칙 로드 감소, 충돌 해소 기회 |
| 절차를 skill로(`/plan-feature`, `/report`, `/learn`) | 1.3 | 중간~높음 | 사람이 호출하는 지점 = 학습 체크포인트로 쓸 수 있음 |
| PostToolUse lint + Stop build 분리 | 1.2 | 높음 | 문서만 바뀐 턴의 22초 비용 제거, 즉시 피드백 |
| red-team `disallowedTools` | 1.4 | 높음 | 비용 0 |
| 원격 브랜치 보호(서버 측) | 1.5 | 높음 | 문자열 가드의 구조적 한계 보완. 단 이 환경엔 원격이 없어 사용자 GitHub 설정 필요 |
| feature JSON + progress 파일 | 2 | 낮음~중간 | 짧은 세션·사람 승인 구조에는 과함. SPEC 안 체크리스트로 축소 적용 |
| Vitest(로직·3상태) + Playwright(E2E) | 3.1, 3.2 | 중간~높음 | 새 의존성(승인 필요). `pnpm shot`의 Linux 문제도 Playwright로 해소 |
| `queryOptions` 기반 키 묶음 | 3.2 | 높음 | L4 구조적 방지. 첫 데이터 기능 전에 정해야 함 |
| 단방향 import 규칙 | 3.4 | 중간 | 지금은 위반 0. feature 2개부터 가치 |
| DTCG 토큰 형식 | 4 | 낮음 | 과함 |

## 부록 A. 재시도 기본값 설치본 확인

아래는 설치된 `@tanstack/query-core` 소스에서 확인한 내용이다(점검 시점에 직접 `grep`).

`node_modules/.pnpm/@tanstack+query-core@5.101.4/node_modules/@tanstack/query-core/src/retryer.ts`:

```ts
// :49-50
function defaultRetryDelay(failureCount: number) {
  return Math.min(1000 * 2 ** failureCount, 30000)
// :170-173
const retry = config.retry ?? (environmentManager.isServer() ? 0 : 3)
const retryDelay = config.retryDelay ?? defaultRetryDelay
const delay = typeof retryDelay === 'function' ? retryDelay(failureCount, error) : retryDelay
```

첫 실패 시 `failureCount`는 0이므로(증가는 `:185` `failureCount++`에서 지연 계산 뒤) 첫 재시도 지연은 1000ms다. 프로젝트 설정 `retry: 1`(`src/lib/providers.tsx:14`)은 상태 코드와 무관하게 1회 재시도하므로, 404·400 응답도 약 1초 뒤에야 `isError`가 된다.

## 부록 B. `import/no-restricted-paths` 사용 가능 여부 [로컬]

`eslint-config-next`가 `eslint-plugin-import`를 의존성으로 갖고(`node_modules/eslint-config-next/package.json:18` `"eslint-plugin-import": "^2.32.0"`) 설정 안에서 `import` 플러그인을 등록한다(`node_modules/eslint-config-next/dist/index.js`에 `import: _eslintpluginimport`). 따라서 새 의존성 없이 `import/no-restricted-paths` 규칙을 켤 수 있다. 실제 동작은 `examples/eslint/`에서 확인했다.
