# 01. AI 개발 환경 점검

대상 커밋: `86e86bf`(main 최신). 근거 표기: `파일:줄`. 실행 근거는 `00-baseline.md`와 이 문서의 "실측" 표시.
발견 ID(`AI-xx`)는 `05-proposals.md`·`decisions-needed.md`에서 참조한다. 발견마다 대응 제안(`P-xx`)·결정(`D-xx`)을 6절 표에 적었다.

## 요약

- 하네스(규칙·가드·검증 hook·레드팀)는 **개인 프로젝트로는 매우 정교하다.** 특히 디자인 토큰 lint와 Stop hook은 실측 기반으로 다듬어져 있고, 실제로 AI의 흔한 실수를 막는다.
- 반면 **프로젝트 목표(사람의 FE 판단 체득)를 확인하는 장치는 거의 없다.** 사람의 역할이 "승인·증거 확인"으로만 정의되어 있고(`CLAUDE.md:6`), 학습 흔적은 커밋 trailer 4줄이 전부다.
- 스캐폴딩(`e09f7c6`, 2026-08-16) 이후 CLAUDE.md를 바꾼 커밋은 10개(`2b9967c`~`dc74e11`)이고 모두 2026-09-28~10-04, 7일 안에 몰려 있다. 같은 7일 동안 `feat:`는 4개였고, **BE 데이터를 쓰는 기능은 전체 기간 0개**(`src/features/` 없음)다. 그래서 L4와 L5 중 `useQuery` 3상태(데이터 로딩·실패), BE 계약 규칙은 한 번도 실제로 시험되지 않았다. L5 중 에러 경계 결정은 `a30b614`·`b325363`에서 있었으나 `Learn: L5` trailer가 없다.
- 검증 기록(plan, 레드팀 결과, 완료 보고)은 형식이 정해져 있지 않다. 커밋 본문에 일부 남은 사례(`b325363`의 "레드팀 결과 반영", "검증: pnpm verify 통과 …")가 있지만 강제되지 않아 `86e86bf`처럼 빠진다. 그래서 규칙이 지켜졌는지 사후에 확인하기 어렵다.

## 1. 인벤토리

| 요소 | 위치 | 상태 | 하는 일 |
|---|---|---|---|
| 프로젝트 지침 | `CLAUDE.md` (100줄) | 커밋됨 | 작업 루프·학습 포인트·스택·아키텍처·디자인·Git·BE 연동 규칙. 첫 줄 `@AGENTS.md` import |
| Next 관리 블록 | `AGENTS.md` (9줄) | 커밋됨 | "Next 16은 다르니 `node_modules/next/dist/docs/`를 읽어라". `next dev`가 자동으로 다시 쓴다(`node_modules/next/dist/server/lib/generate-agent-files.js:91-118`) |
| 하위·개인 CLAUDE.md | 없음 (`CLAUDE.local.md`는 `.gitignore:50`에 예약만) | — | — |
| 사용자 전역 설정 | `~/.claude/CLAUDE.md`·`settings.json` | 이 환경에 없음 | 사용자 PC의 전역 설정은 **확인 불가** |
| 권한·hook 설정 | `.claude/settings.json` | 커밋됨(+미커밋 수정: `check-done.sh` 등록) | allow 20개, deny 7개(`.env*` 읽기, `src/components/ui/**` 편집), hook 2종 |
| Bash 가드 | `.claude/hooks/guard-bash.mjs` | 커밋됨 | PreToolUse. force push·**원격** main/아카이브 삭제·아카이브 브랜치 commit 차단. 로컬 `branch -D`·`switch --discard-changes`는 검사하지 않음(2.4절) |
| 검증 hook | `.claude/hooks/stop-check.mjs` | 커밋됨 | Stop. 워킹트리 지문이 바뀌면 typecheck·lint(병렬 아님, 둘 다)·build, 실패 횟수 카운트 |
| 점검 작업용 hook | `.claude/hooks/check-done.sh` | **스테이징됨(미커밋)** (`git status`: `A`) | 클라우드 세션 전용. `docs/ai-audit/checklist.json` 미완료면 종료 차단. 점검 작업 부산물(6.1절) |
| 줄바꿈 설정 | `.gitattributes` | **스테이징됨(미커밋)** (`git status`: `A`) | `*.sh text eol=lf` 한 줄. `check-done.sh`와 함께 추가됨. 점검 작업 부산물(6.1절) |
| 서브에이전트 | `.claude/agents/red-team.md` (41줄) | 커밋됨 | 완료 조건 판정 + 공격 검사. 코드 수정 금지(문장으로만) |
| skills / commands | 없음 | — | — |
| MCP | `.mcp.json` 없음 | — | — |
| 디자인 문서 | `docs/design-system.md` (56줄) | 커밋됨 | 토큰 사용처, 의미→색, 부품, 패턴, shadcn 함정 |
| SPEC 보관소 | `docs/spec/README.md` (3줄) | 커밋됨 | 화면 2개 이상 feature의 SPEC 위치. **SPEC 0개** |
| 화면 확인 도구 | `scripts/shot.mjs` (328줄) | 커밋됨 | dev 서버+headless Chrome(CDP) 촬영·측정 |
| 아키텍처·디자인 lint | `eslint.config.mjs` (335줄) | 커밋됨 | 로컬 규칙 2개(`tmi/no-cross-feature-import`, `tmi/no-raw-design-values`) + 제한 목록 |
| 하네스 문서(feature list, progress, plan) | 없음 | — | plan·진행 상황은 대화에만 존재 |

## 2. 요소별 실제 동작

### 2.1 CLAUDE.md

- 구성: 작업 루프(`CLAUDE.md:10-23`), 학습 포인트(`:25-36`), 막혔을 때(`:38-40`), 스택(`:42-45`), 아키텍처(`:47-70`), 디자인(`:72-77`), 새 feature(`:79-81`), Git(`:83-89`), BE 연동(`:91-96`), 미정(`:98-100`).
- 장점: 규칙마다 이유와 실측 근거가 붙어 있다. 예: `useSuspenseQuery` 금지 이유(`:66`), 서브에이전트 코드는 hook 밖이라는 사실(`:20`), BE 계약을 추측하지 말라는 경고(`:95`, "추측해도 verify는 green이다").
- 문제: 한 줄에 여러 규칙이 압축되어 있다(예: `:15`는 완료 보고 5요소 + 명령 2개). 매 턴 전체가 컨텍스트에 실리므로, 지금 하는 작업과 무관한 규칙(예: BE 연동 규칙은 셸 작업 중에도 실림)이 항상 비용을 낸다. → `04-research.md`의 skills·rules 분리 근거 참조.

### 2.2 AGENTS.md (Next가 관리)

- `next dev` 실행 시 마커 사이 블록을 다시 쓴다. 실측: 이번 점검에서 `pnpm dev`를 띄운 뒤에도 `git status`상 변경 없음(이미 최신 블록).
- 내용 "Read the relevant guide ... before writing any code"(`AGENTS.md:5`)는 CLAUDE.md의 "Next 문서는 새 라우트… 때만 읽는다 … 단순 컴포넌트·스타일 변경에는 적용하지 않는다"(`CLAUDE.md:45`)와 **정면으로 충돌한다**. 두 문서가 함께 로드되며(`CLAUDE.md:1`), 우선순위는 문서 어디에도 적혀 있지 않다. → AI-08

### 2.3 settings.json 권한

- allow: `pnpm check/lint/typecheck/build/verify/install/dev/shot`, `pnpm shadcn add *`, `git status/grep/diff/log/branch/add/commit/switch/push *`, `git clean -f -- src/components/ui/*`.
- deny: `.env` 계열 읽기 5종, `src/components/ui/**` Edit/Write.
- 관찰: deny는 Edit/Write 도구만 막고 Bash로 쓰는 것(`sed -i`, `>` 리다이렉트)은 막지 못한다. CLAUDE.md가 "수정 금지(Bash로도)"(`CLAUDE.md:61`)라고 문장으로 보완한다. 커밋 시점에 `src/components/ui/` diff를 검사하는 장치는 없다.

### 2.4 guard-bash.mjs (PreToolUse)

- 명령 문자열을 `; & | 줄바꿈`으로 나누고(`guard-bash.mjs:38`), **세그먼트가 `git`으로 시작할 때만** 검사한다(`:31`). heredoc 본문은 먼저 제거해 커밋 메시지 오인을 막는다(`:33-36`).
- 실측(가드에 JSON 입력을 직접 넣어 exit code 확인):

| 명령 | 가드 결과 | allow 목록 | 기본 권한 모드에서 | 비고 |
|---|---|---|---|---|
| `git switch --discard-changes main` · `git switch -f main` | **통과(0)** | 있음(`Bash(git switch *)`, `settings.json:21`) | **확인 없이 실행** | 워킹트리 변경 파기. CLAUDE.md:87 취지 위반 |
| `git branch -D v3` · `git branch -f main HEAD~1` | **통과(0)** | 있음(`Bash(git branch *)`, `settings.json:18`) | **확인 없이 실행** | 로컬 아카이브 삭제·main 포인터 이동. 가드의 삭제 차단은 `push`만 본다(`guard-bash.mjs:64-85`) |
| `git push --force` · `git -C . push -f` · `x=1 git push -f` · `git push origin +main` · `git push --force-with-lease` | 차단(2) | `git push *` 있음(`settings.json:23`) | 가드가 차단 | 의도대로 |
| `git push origin --delete main` · `git push origin :main` | 차단(2) | 있음 | 가드가 차단 | 의도대로(원격만) |
| `git reset --hard HEAD` · `git checkout .` · `git stash` | **통과(0)** | 없음 | 사용자에게 확인 요청 | 자동 승인 모드에서만 무방비 |
| `bash -c "git push --force"` | **통과(0)** | 없음 | 확인 요청 | 세그먼트가 `bash`로 시작 |
| `(git push --force)` | **통과(0)** | 없음 | 확인 요청 | 괄호 때문에 `RUNS_GIT` 불일치 |
| `env git push --force` · `sudo git push -f` | **통과(0)** | 없음 | 확인 요청 | 접두 명령 |
| `$(echo git) push -f` | **통과(0)** | 없음 | 확인 요청 | 명령 치환 |

- 해석: 가드는 "AI가 악의 없이 쓰는 흔한 형태"의 원격 사고를 막는 용도로 적절하다. 위험 순위는 **allow 목록에 있고 가드도 검사하지 않는 조합**이 가장 높다. `git switch --discard-changes`·`git switch -f`·`git switch -C main <ref>`(로컬 main 강제 이동, 2라운드 리뷰 실측 exit 0)·`git branch -D <아카이브>`는 기본 권한 모드에서도 사용자 확인 없이 실행된다. `reset --hard`·`checkout .`·`stash`는 allow 목록에 없어 기본 모드에서는 사용자에게 묻고, 자동 승인 모드에서만 막을 장치가 없다. 래핑된 force push(`bash -c` 등)도 같은 조건이다. → AI-04
- 클라우드 세션 관찰: 이 환경은 `git remote`가 비어 있다(실측 `git remote -v` 출력 없음). push 관련 가드는 이 환경에서 의미가 없다.

### 2.5 stop-check.mjs (Stop)

- 워킹트리 지문(HEAD + `status --porcelain -uall` + `diff HEAD` + untracked 파일 내용 해시, `stop-check.mjs:53-74`)이 마지막 통과 때와 같으면 건너뛴다(`:76-84`).
- 다르면 typecheck와 lint를 **둘 다** 돌리고, 둘 다 통과하면 build(`:102-105`). 실패 3회째에 막힘 리포트 지시(`:131`), 4회째부터는 멈춤 허용(`:122`).
- 장점: 실측으로 다듬은 흔적이 분명하다(untracked 포함, fail-closed, 카운터 리셋 조건 — 파일 머리 주석 `:5-17`).
- 비용: 지문은 **문서 변경에도 바뀐다**(`docs/`도 워킹트리). 문서만 고친 턴에도 약 22초(`00-baseline.md` 측정)의 typecheck+lint+build가 돈다. 편집 직후 빠르게 알려주는 PostToolUse 단계는 없다. → AI-05
- 사각지대: 서브에이전트 종료(SubagentStop)에는 hook이 없다. CLAUDE.md는 이를 "메인에서 verify"라는 규칙으로 메운다(`CLAUDE.md:20`).
- 정정 필요: `CLAUDE.md:20` "서브에이전트가 쓴 코드는 hook 검증을 받지 않는다"는 **검증 hook(Stop)에만** 맞다. 실측으로 서브에이전트에게 `git push --force no-such-remote-xyz HEAD:refs/heads/zz-test`를 실행시키자 `guard-bash.mjs`가 차단했다(PreToolUse는 서브에이전트에도 적용). 공식 문서도 "Hooks from settings files ... also run inside subagents"라고 적는다(`04-research.md` 1.2). 규칙 문구가 부정확하면 AI가 서브에이전트의 가드 범위를 잘못 판단한다. → AI-14

### 2.6 red-team 에이전트

- 시작 시 CLAUDE.md·디자인 문서를 디스크에서 다시 읽게 하고(`red-team.md:9`), 완료 조건을 실행으로 판정하며(화면은 `pnpm shot`, `:14`), `[확실]/[추정]` 구분(`:34`), `git status` 전후 비교(시작 기록 `:11`, 끝 확인 `:30`)를 요구한다. 평가자 설계로는 좋은 편이다.
- 한계 1: frontmatter에 `tools` 제한이 없어(`red-team.md:1-4`) Edit/Write를 포함한 모든 도구를 쓸 수 있다. "저장소를 수정하지 않는다"(`:30`)는 문장 규칙이다.
- 한계 2: 화면 판정 수단이 `pnpm shot`인데 Linux root 환경에서 그대로는 동작하지 않는다(`00-baseline.md`). 클릭·입력 같은 동작 조건은 스스로 "판정 불가"로 두게 되어 있다(`red-team.md:18`). 테스트가 없으므로 **동작 조건은 사실상 사람 눈 확인으로 넘어간다.**
- 한계 3: 결과 기록 형식이 없다. 도입 전 `b325363`은 본문에 레드팀 결과와 검증 수치를 남겼지만, 레드팀 도입(`dc74e11`) 이후 유일한 feature 커밋 `86e86bf`의 본문에는 레드팀 언급이 없어 실제로 실행됐는지 **확인 불가**. → AI-06, AI-09

### 2.7 eslint 로컬 규칙 (AI 가드로서)

- `noInlineConfig: true`(`eslint.config.mjs:241`)로 `// eslint-disable` 우회를 막는다. AI 전담 프로젝트에 특히 효과적인 장치다.
- 디자인 규칙 실측은 `02-design-system.md` 3절. 메시지가 대안을 알려주는 형식이라 AI가 스스로 고치기 쉽다.
- 낡은 문구: EventSource 메시지가 존재하지 않는 `env.apiBaseUrl`을 안내한다(`eslint.config.mjs:175`; 실제 `src/lib/env.ts:4`는 `export const env = {} as const;`). 주석의 "CLAUDE.md '스택 (고정)'"(`:188`)도 현재 제목(`CLAUDE.md:42` "## 스택")과 다르다. AI가 이 메시지를 따르면 없는 값을 찾게 된다. → AI-07

### 2.8 scripts/shot.mjs

- 측정 항목(HTTP·리다이렉트·넘침·콘솔 에러·네트워크 실패)이 판정에 바로 쓸 수 있게 설계됐고, BE 실패 요청을 FAIL로 치지 않는 판단(`shot.mjs:13-15`)도 3상태 확인과 맞다.
- Chrome 후보 경로에 Linux Playwright 경로가 없고(`:85-97`) `--no-sandbox` 옵션이 없어(`:190-202`) 클라우드/CI에서는 실패한다(실측). → AI-03
- 클릭·입력·키보드 같은 상호작용은 지원하지 않는다(경로 목록만 받음, `:48`). 이번 점검의 서랍·접힘·포커스 확인은 별도 Playwright 스크립트로 했다.

## 3. 중복·충돌·누락

| 구분 | 내용 | 근거 |
|---|---|---|
| 충돌 | Next 문서 읽기 범위: "모든 코드 작성 전" vs "특정 경우만" | `AGENTS.md:5` vs `CLAUDE.md:45` |
| 충돌 | `"use client"`는 "데이터를 쓰는 컴포넌트 파일에만" vs 실제 client 파일 6개 중 데이터를 쓰는 파일 0개(모두 상호작용·주소·에러 경계) | `CLAUDE.md:66` vs `src/components/nav-link.tsx:1`, `mobile-nav.tsx:1`, `sidebar-collapse.tsx:1` |
| 충돌 | Zustand store 위치: 트리는 `features/<name>/store.ts`만 제시 vs 실제 `src/lib/sidebar-store.ts` | `CLAUDE.md:59`, `CLAUDE.md:62` vs `src/lib/sidebar-store.ts` |
| 충돌(운영) | "main에서 직접, 브랜치는 요청 시에만", "커밋 전 반드시 사용자 확인" vs 이번 점검 지시서의 "질문하지 않는다", "단계마다 커밋", "작업 브랜치 push·PR" | `CLAUDE.md:85-86` vs `docs/ai-audit/TASK.md:24`, `:159`. 이번 작업은 사용자가 지시서를 그대로 수행하라고 명시해 지시서를 따랐다 → AI-13(6.1절), D-05 |
| 중복 | 3상태 규칙이 CLAUDE.md(`:67`)와 디자인 문서(`docs/design-system.md:44`) 양쪽 | 내용은 일치. 한쪽만 고치면 어긋날 위험 |
| 중복 | `cn` 함수 2개: shadcn 생성물은 `cn` 패키지(`src/components/ui/button.tsx:3`), `src/lib/utils.ts:4`는 clsx+tailwind-merge. `@/lib/utils`를 import하는 파일 0개(실측 `git grep`) | `03-code-structure.md` CS-05 |
| 누락 | 문서 목록 갱신: CLAUDE.md 트리의 공용 컴포넌트(`:60` "page-header · app-sidebar · nav-link")에 `mobile-nav`·`sidebar-collapse` 없음, lib 목록(`:62`)에 `sidebar-store.ts`·`utils.ts` 없음, 디자인 문서 "설치됨: Button, Card, Badge"(`docs/design-system.md:40`)에 Sheet 없음 | AI-07 |
| 누락 | 학습 확인 장치(사람이 이해했는지) | AI-01 |
| 누락 | 저장되는 plan·진행·레드팀 기록 | AI-06 |
| 누락 | 행동(클릭·입력) 검증 수단: 테스트 0, `pnpm shot`은 정적 촬영만 | AI-11 |
| 누락 | 사용자 변경 파기·로컬 브랜치 삭제 명령 차단(allow 목록 포함분은 확인 없이 실행) | AI-04 |

## 4. 규칙 준수 샘플링 (지시 vs 실제)

| 규칙 | 근거 | 결과 |
|---|---|---|
| `page.tsx`/`layout.tsx`는 서버 컴포넌트 | `CLAUDE.md:66` | ✓ 준수. `src/app/(console)/page.tsx`, `layout.tsx`, `src/app/layout.tsx` 모두 `"use client"` 없음 |
| 모든 화면은 `PageHeader`로 시작, `metadata.title` | `CLAUDE.md:77` | ✓ 홈(`src/app/(console)/page.tsx:8,13`), 404(`src/app/not-found.tsx:7,12`), 에러(`error.tsx:31`) |
| 필수 측정 명령 | `CLAUDE.md:16-18` | ✓ 실행 가능. 단 `src/features/`가 없어 `warning: could not open directory 'src/features/'`가 출력된 뒤 `(queryKey 없음)` (실측) |
| 색만으로 의미 전달 금지 | `CLAUDE.md:76` | ✓ 활성 메뉴는 굵기+왼쪽 막대+배경(`src/components/nav-link.tsx:25-35`), "준비 중"은 글자 배지 |
| 대표색은 주 행동·활성에만 | `CLAUDE.md:76` | ✓ 로고 중립색(`app-sidebar.tsx:27-30`), 활성 막대만 `border-sidebar-primary` |
| 결정 커밋에 `Learn:` trailer | `CLAUDE.md:35` | △ `feat:`+`fix:` 7개 중 trailer 있음 3개(`86e86bf` L1·L3, `a30b614` L1, `3309ac0` L2). **누락 2건(L5)**: `a30b614`는 `(console)/error.tsx`(`useQueryErrorResetBoundary`, `src/app/(console)/error.tsx:4`, `:17`)를 만들었으나 trailer는 L1뿐, `b325363`(`fix:`)은 `global-error.tsx`·`not-found.tsx`를 추가했으나 trailer 없음. 나머지(`ca977c0` 색·폰트, `c9e4bcb` 도구, `e09f7c6` 스캐폴딩)는 L1~L5 결정이 없다고 볼 수 있음. 재현: `git log --format='%h %s%n%b' 86e86bf \| grep -E '^[0-9a-f]{7} (feat\|fix)\|^Learn:'` |
| 의존성 추가 사유를 커밋 메시지에 | `CLAUDE.md:13` | ✓ `a30b614`(eslint-plugin-tailwindcss), `ca977c0`(pretendard) 본문에 사유 |
| 완료 보고 첫 줄에 L1~L3 재설명 | `CLAUDE.md:36` | **확인 불가** — 대화 기록이 저장소에 없음 |
| 레드팀 통과 후 커밋 | `CLAUDE.md:22` | **확인 불가** — `86e86bf` 본문에 레드팀 언급 없음. 기록 형식이 강제되지 않음(`b325363`처럼 본문에 남긴 사례는 있음) |
| `src/components/ui/` 수정 금지 | `CLAUDE.md:61` | △ `86e86bf`에서 `button.tsx` 3줄 변경. 커밋 본문에 "shadcn sheet 추가 시 --overwrite로 button.tsx의 cn import가 바뀜(승인된 예외)"로 설명됨. 규칙상 허용된 경로(`docs/design-system.md:53`) |
| 지시받은 기능만, 미리 만들지 않기 | `CLAUDE.md:8` | △ `ApiError`/`apiClient`(`src/lib/api/client.ts`)는 호출처 0개 상태로 존재. 스캐폴딩 단계 산출물이라 정도는 약함. `src/lib/utils.ts`는 사용처 0 |

## 5. "AI 100% 전담 + 학습 포인트만 사람이 짚기" 운영 방식 평가

### 5.1 사람의 검토 지점

| 지점 | 정의 | 실제로 보장되는가 |
|---|---|---|
| plan 승인 | `CLAUDE.md:12-13` | 규칙상 있음. plan이 저장되지 않아 무엇을 승인했는지 나중에 대조할 수 없다 |
| 증거 확인 | `CLAUDE.md:15` | 증거 형식은 명확. 단 증거 생성 도구(`pnpm shot`)가 환경에 따라 실패 |
| 커밋 승인 | `CLAUDE.md:86` | 규칙상 있음. 기계 장치 없음(`git commit`은 allow 목록, `settings.json`) |
| 규칙 변경 승인 | `CLAUDE.md:7` | 지켜지고 있음(CLAUDE.md를 바꾼 커밋 10개 모두 단독 `chore:`. 재현: `git log --oneline 86e86bf -- CLAUDE.md`, 스캐폴딩 `e09f7c6` 제외) |
| **빠진 곳** | ① "왜 이렇게 했는지"를 사람이 설명할 수 있는지 확인하는 지점 ② 배포 전 보안 검토(인증 미정, `CLAUDE.md:100`) ③ 하네스 자체의 비용·효과 점검 시점 | — |

### 5.2 학습 포인트가 남고 있는가

- 남는 곳: 커밋 trailer 4줄(`git log --format=%b | grep '^Learn:'` 실측, L1×2, L2×1, L3×1)과 코드 주석의 `(L1)`·`(L3)` 표기(`src/components/mobile-nav.tsx:3-4`, `src/lib/sidebar-store.ts:1`, `src/lib/console-menu.ts:4`).
- 이 기록은 **AI가 쓴 결정 요약**이다. 사람이 그 판단을 스스로 내릴 수 있게 됐는지는 어디에도 남지 않는다. CLAUDE.md:36의 "완료 보고 첫 줄에 다시 설명"도 AI가 사람에게 설명하는 방향이다.
- L4(queryKey·invalidation)는 데이터 기능이 없어 **한 번도 등장하지 않았다.** L5 중 에러 경계 결정(`a30b614`의 `(console)/error.tsx`, `b325363`의 `global-error.tsx`·`not-found.tsx`)은 이미 있었으나 두 커밋 모두 `Learn: L5` trailer가 없어 학습 기록으로 남지 않았다. L5의 중심인 `useQuery` 3상태(데이터 로딩·실패)는 미시험이다.
- 판단: 지금 구조는 "AI가 좋은 결정을 하고 기록한다"는 목표는 달성하지만 "사람이 FE 판단을 체득한다"는 목표에는 장치가 없다. → AI-01

### 5.3 AI가 잘못된 방향으로 갔을 때 감지 장치

| 잘못된 방향 | 감지 장치 | 평가 |
|---|---|---|
| 타입·lint·빌드 깨짐 | Stop hook | 강함(자동, fail-closed) |
| 디자인 토큰 이탈 | eslint 로컬 규칙 | 강함, 동적 클래스 구멍 1(`02-design-system.md` 3절 실측 17건: 차단 10, 정상·의도적 허용 4(#8, #9, #15, #17), 문서화된 한계 2(#5 props 묶음 style, #6 투명도 회색), 미문서화 구멍 1(#4 조립 클래스, DS-06)) |
| Server/Client 경계 오류(L1) | build | 일부. 불필요한 `"use client"`는 잡지 못함(빌드는 통과) — 완료 보고의 grep 측정으로만 보임 |
| 화면이 실제로 안 되는 경우 | `pnpm shot`, red-team | 중간. 정적 화면만, Linux에서는 실패 |
| 클릭·입력 동작 오류 | 없음 | **약함.** 테스트 0 |
| BE 계약 추측 | 규칙(`CLAUDE.md:95`) | 약함. 스스로도 "추측해도 verify는 green"이라고 적음 |
| 범위 이탈·과잉 설계 | 규칙(`CLAUDE.md:8`, `:12`) | 약함. 하네스 쪽 범위 확장은 오히려 반복됨(CLAUDE.md 변경 커밋 10개가 7일에 몰림) |
| 같은 실패 반복 | Stop hook 카운터 → 막힘 리포트 | 강함 |

### 5.4 하네스 투자와 산출 비율

- `git log` 실측: 커밋 18개(점검 커밋 제외) = `chore:` 11(그중 `d50c466`은 `.env.example` 커밋, 나머지 10개가 CLAUDE.md 변경), `feat:` 6, `fix:` 1. 기간 2026-08-16(`e09f7c6`) ~ 2026-10-05(`86e86bf`).
- CLAUDE.md 변경: 스캐폴딩 `e09f7c6` 이후 10개(`2b9967c`~`dc74e11`), 모두 2026-09-28~10-04. 같은 7일 동안 `feat:` 4개(`3309ac0`, `ca977c0`, `a30b614`, `c9e4bcb`), 그 뒤 `86e86bf`(10-05). 재현: `git log --oneline 86e86bf -- CLAUDE.md`, `git log --format='%h %ad %s' --date=short 86e86bf`.
- 제품 코드: 화면 1개(홈, 메뉴 카드) + 셸. 데이터 기능(BE 호출 화면) 전체 기간 0개, BE 호출 0회(`useQuery` 사용처 0, `git grep` 실측).
- 해석: 하네스는 "다음 기능을 안전하게 만들 준비"에 집중되어 왔다. 각 개선은 타당하지만, 실제 기능으로 규칙을 시험하기 전에 규칙이 계속 늘어나는 구조다. 첫 데이터 기능에서 3상태·queryKey·BE 계약 규칙이 처음 시험받게 되며, 그때 규칙이 또 바뀔 가능성이 높다(추정). → AI-02

## 6. 발견 목록

심각도: 높음 = 프로젝트 목표 달성이나 안전에 직접 영향 / 중간 = 효율·신뢰도 저하 / 낮음 = 정리 수준. 표는 심각도 순(같은 심각도 안에서는 점검자가 본 영향 크기 순. 처리 순서는 `05-proposals.md` 4절 로드맵이 기준이다). 대응 ID는 `05-proposals.md`·`decisions-needed.md` 기준.

| ID | 심각도 | 발견 | 근거 | 대응(P-xx/D-xx) — 한 줄 수정 방향 |
|---|---|---|---|---|
| AI-01 | 높음 | 학습 목표(사람의 체득)를 확인하는 장치가 없다. 사람 역할은 승인·증거 확인뿐이고 학습 기록은 AI가 쓴 trailer 4줄. trailer가 있어야 할 결정에서 빠진 사례도 있다(`a30b614`·`b325363`의 L5) | `CLAUDE.md:6`, `:35-36`, 4절 trailer 행, 5.2절 | P-A1, D-08 — 결정 커밋 뒤 사람이 판단을 직접 설명하는 체크포인트 추가 |
| AI-02 | 높음 | 스캐폴딩 이후 CLAUDE.md 변경 10회가 7일(2026-09-28~10-04)에 몰렸고 데이터 기능은 전체 기간 0개. L4, L5 중 `useQuery` 3상태, BE 계약 규칙이 미검증 | 5.4절, `git log --oneline 86e86bf -- CLAUDE.md`, `src/features/` 없음 | P-A2, D-02 — 첫 데이터 기능까지 하네스 동결(예외 기준은 P-A2) |
| AI-04 | 높음 | allow 목록에 있고 가드도 통과하는 파괴 명령(`git switch --discard-changes`/`-f`/`-C main`, `git branch -D <아카이브>`/`-f main`)은 **기본 권한 모드에서도 확인 없이 실행**된다. `reset --hard`·`checkout .`·`stash`와 래핑된 force push(`bash -c`, `(…)`, `env`, `sudo`)는 자동 승인 모드에서만 무방비. 가드의 삭제 차단은 원격만 | 2.4절 실측표, `settings.json:18`, `:21`, `guard-bash.mjs:64-85`, `CLAUDE.md:87` | P-A5, D-09 — 가드에 `switch -f/--discard-changes/-C <보호 브랜치>`, `checkout -B <보호 브랜치>`, `branch -D/-f/-m`(보호 브랜치)를 우선 추가하고 원격 main 보호 설정 |
| AI-03 | 중간 | `pnpm shot`이 Linux root(클라우드·CI)에서 실패 → 그 환경에서는 완료 보고 규칙을 지킬 수 없음 | `scripts/shot.mjs:85-97`, `:190-202`, `00-baseline.md` | P-A6 — Chrome 후보에 Playwright 경로, root일 때 `--no-sandbox` |
| AI-06 | 중간 | plan·레드팀 결과·완료 보고의 기록 형식이 강제되지 않는다. 커밋 본문에 남긴 사례(`b325363`)는 있으나 `86e86bf`처럼 빠져 규칙 준수를 사후 확인하기 어렵다 | 4절 "확인 불가" 2건, `git show -s b325363` | P-A3 — 기록 위치를 정한다(커밋 본문 `검증:` 섹션 의무화를 SPEC 기록과 비교할 대안으로 포함) |
| AI-09 | 중간 | red-team의 도구 제한 없음, 결과 기록 형식 없음, 동작 조건은 판정 불가로 빠짐 | `red-team.md:1-4`, `:18`, `:30` | P-A8(도구 제한), P-A3(기록), P-C3(동작 검증) |
| AI-11 | 중간 | 행동 검증 수단 없음(테스트 0, 촬영 도구는 정적). 완료 조건의 "테스트" 선택지가 실제로 쓸 수 없음 | `CLAUDE.md:13`, `package.json:5-14` | P-C3, D-03 — 첫 데이터 기능과 함께 테스트 도입 |
| AI-05 | 중간 | Stop hook이 문서만 바뀐 턴에도 전체 build(약 22초). 편집 단위 빠른 피드백(PostToolUse) 없음 | `stop-check.mjs:53-74`, `:102-105` | P-A4 — B(지문에서 `':(exclude)*.md'`만 제외, `docs/**` 전체는 빼지 않음)·C(PostToolUse) 모두 첫 기능 뒤 정리 |
| AI-07 | 낮음 | 문서 드리프트: CLAUDE.md 트리, 디자인 문서 부품 목록, eslint 메시지(`env.apiBaseUrl`, '스택 (고정)') | 3절 표, `eslint.config.mjs:175`, `:188` | P-A7 — 사실 오류 일괄 정정 |
| AI-08 | 낮음 | AGENTS.md와 CLAUDE.md의 Next 문서 읽기 지시 충돌, 우선순위 미기재 | `AGENTS.md:5`, `CLAUDE.md:45` | P-A7(우선순위 한 줄), P-A9 |
| AI-14 | 낮음 | `CLAUDE.md:20`의 "서브에이전트 코드는 hook 검증을 받지 않는다"가 가드 hook까지 포함하는 것처럼 읽힘(실측: 가드는 서브에이전트에도 적용, Stop만 미적용) | 2.5절 | P-A7 — "Stop hook 검증을 받지 않는다"로 정정 |
| AI-10 | 낮음 | CLAUDE.md가 모든 규칙을 한 파일에 압축(100줄, 한 줄 다중 규칙). 작업과 무관한 규칙도 항상 로드. 근거는 매 턴 로드 비용뿐이고 공식 기준(200줄 미만) 안이다(`04-research.md:17`) | `CLAUDE.md:15`, 2.1절 | P-A9 — 동결 해제 뒤 rules 분리 검토 |

### 6.1 점검 작업 부산물

이 점검 작업이 만든 파일과 이 작업 방식에서 드러난 충돌이다. 프로젝트 하네스 자체의 결함과 구분한다.

| ID | 심각도 | 발견 | 근거 | 대응(P-xx/D-xx) — 한 줄 수정 방향 |
|---|---|---|---|---|
| AI-13 | 중간 | CLAUDE.md의 Git 규칙과 자율 작업(이번 점검 같은 장시간 작업)이 충돌하고 예외 규정이 없다. 현재 규칙: "**`main`에서 직접 작업·커밋·push한다.** 브랜치는 사용자가 요청할 때만 만든다."(`CLAUDE.md:85`), "**커밋 전에는 반드시 사용자 확인을 받는다**"(`CLAUDE.md:86`) | `CLAUDE.md:85-86`, `TASK.md:24`, `:159` | P-A10, D-05 — 예외 문구: "사용자가 작업 지시서에 브랜치·커밋 권한을 명시하면, 그 작업 동안은 지정 브랜치에서 커밋 전 확인 없이 작업 끝에 커밋 1개로 묶어 커밋·push한다(2026-10-11 사용자 결정: 단계마다 나누지 않는다). main에는 merge·push하지 않는다(통합은 사용자가 PR로 판단)." |
| AI-12 | 낮음 | 스테이징된 `check-done.sh`의 카운터가 `/tmp/stop-hook-count` 전역 파일이라 세션 간 리셋되지 않음. 15회 이후 영구 통과. `.gitattributes`(`*.sh text eol=lf`)도 같이 스테이징됨 | `.claude/hooks/check-done.sh:6-8`, `.gitattributes` | D-10 — 점검 종료 후 처분 결정. 추천: `check-done.sh`와 `settings.json`의 해당 hook 등록은 제거, `.gitattributes`는 유지해도 무해 |

## 리뷰 반영 기록(라운드 1)

리뷰: `reviews/01-ai-setup-round-1.md`.

| # | 지적 요약 | 처리 | 위치 |
|---|---|---|---|
| 1 | "L5는 한 번도 등장하지 않았다"는 사실이 아님(`a30b614`·`b325363`) | 반영. "에러 경계 결정은 있었으나 trailer 누락, `useQuery` 3상태는 미시험"으로 수정. trailer 샘플링 분모를 `feat:`+`fix:` 7개로 넓히고 L5 누락 2건 기록. AI-01 근거에 추가 | 요약, 4절 trailer 행, 5.2절, AI-01, AI-02 |
| 2 | 확인 없이 실행되는 파괴 명령(`switch --discard-changes`, `branch -D`) 누락, 위험 순위 역전, 인벤토리 "삭제 차단"은 원격만 | 반영. 실측표에 allow 목록·기본 모드 열과 4개 명령 행 추가(가드 exit 0 재실측), 해석과 AI-04를 "자동 승인 + 가드 미검사" 조합 우선으로 재작성, 인벤토리 가드 행 수정. 심각도는 중간 유지(같은 심각도 안 최우선 배치). 05 P-A5 목록 반영은 담당 외라 대응 열에 방향만 적음 | 1절 인벤토리, 2.4절, AI-04 |
| 3 | 커밋 수치 혼용(규칙 변경 chore 10개, `d50c466`은 .env.example) | 반영. CLAUDE.md 변경 10개(`2b9967c`~`dc74e11`, 7일)로 통일하고 측정 명령을 본문에 적음. "7주간 규칙 11번" 표현 삭제. decisions-needed D-02는 담당 외 파일이라 이 문서에서는 수정하지 않음 | 요약, 5.1절, 5.3절, 5.4절, AI-02 |
| 4 | "검증 증거는 저장소에 남지 않는다"는 지나친 단정(`b325363`) | 반영. "일부 남은 사례는 있으나 형식이 강제되지 않아 빠진다"로 수정. AI-06 대응에 커밋 본문 `검증:` 섹션 의무화를 P-A3 비교 대안으로 명시 | 요약, 2.6절 한계 3, 4절, AI-06 |
| 5 | red-team 줄 번호 오류 | 반영. "판정 불가" `:18`, `[확실]/[추정]` `:34`, `git status` `:11`·`:30`, `pnpm shot` `:14` | 2.6절, AI-09 |
| 6 | lint 통과 건 해석이 02와 모순 | 반영. 17건을 차단 10 / 정상·의도적 허용 4 / 문서화된 한계 2 / 미문서화 구멍 1(#4, DS-06)로 02와 맞추고 평가를 "강함, 동적 클래스 구멍 1"로 변경 | 5.3절 |
| 7 | 발견 표에 수정 방향 없음, ID 순 정렬, AI-12 처분 없음 | 반영. 심각도 순 정렬, "대응(P-xx/D-xx) — 한 줄 수정 방향" 열 추가, AI-12는 D-10으로 처분 연결. 별도 "우선순위" 열은 05 로드맵과 중복이라 두지 않고 정렬 순서로 대신함 | 6절, 6.1절 |
| 8 | 점검 부산물이 프로젝트 발견과 섞임, `check-done.sh` 상태 오기, `.gitattributes` 누락 | 반영. 6.1절 "점검 작업 부산물"로 AI-12·AI-13 분리, 상태를 "스테이징됨(미커밋)"으로, `.gitattributes` 행 추가 | 1절 인벤토리, 6.1절 |
| 9 | 05 P-A10 예외 문구가 CLAUDE.md:85와 반대 | 01 쪽 반영. AI-13에 `CLAUDE.md:85`·`:86` 원문 인용과 표준 예외 문구 기재. 05 수정은 담당 외 파일이라 이 문서에서는 하지 않음 | 6.1절 AI-13 |
| 10 | Stop hook 실행 순서 줄 번호가 00과 다름(실제 `:102-105`) | 반영. 01·00 모두 `stop-check.mjs:102-105`로 통일 | 2.5절, AI-05, `00-baseline.md` |
| 11 | AI-10 심각도 과함(근거가 로드 비용뿐) | 반영. 낮음으로 내리고 `04-research.md:17` 근거 추가 | 6절 AI-10 |

## 리뷰 반영 기록(라운드 2)

| # | 지적 요약 | 처리 | 위치 |
|---|---|---|---|
| 1 | `git switch -C main <ref>` 누락 | 반영. 2.4 해석과 AI-04에 추가, 05 P-A5·예시 가드에도 반영(examples 라운드 2 수정) | 2.4절, AI-04 |
| 2 | AI-04가 '높음' 정의(안전에 직접 영향)에 맞는데 중간 | 반영. 높음으로 올림(사용자 워킹트리 변경이 확인 없이 사라질 수 있음) | 6절 AI-04 |
| 3 | 같은 심각도 안 정렬이 05 로드맵과 다름 | 정렬은 유지하고 기준 문구를 '영향 크기 순, 처리 순서는 05 4절 로드맵 기준'으로 정정 | 6절 머리말 |

## 리뷰 반영 기록(05 라운드 3 교차 지적)

| # | 지적 요약 | 처리 | 위치 |
|---|---|---|---|
| 05-R3 #7 | AI-05 대응 시점이 05와 다르게 읽힘 | 반영. B·C 모두 '첫 기능 뒤 정리' | 6절 AI-05 |
