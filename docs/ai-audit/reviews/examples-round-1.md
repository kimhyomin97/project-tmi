SCORES: 근거성=4 구체성=3 일관성=2 판단가능성=3

## 총평
TASK 7단계의 네 가지 요구(CLAUDE.md 초안, .claude 예시, 토큰 lint, Before/After)는 모두 있다. 파일:줄 인용은 직접 연 16건이 전부 맞았다. ESLint 예시와 guard 시험은 README 명령 그대로 재현됐다.
문제는 "실측했다"는 예시 두 개(stop-check 패치, guard 보강)에 그대로 적용하면 생기는 결함이 있다는 점이다. 또 CLAUDE.md 초안은 시점이 다른 제안들(P-A7 지금, P-A9 첫 기능 뒤, D-04 미결정)을 한 파일에 섞었고, 현재 규칙 일부를 대조표 없이 뺐다.
Before/After의 L1 설명은 사실과 다르다. 학습이 목표인 이 프로젝트에서는 가장 먼저 고쳐야 한다.

## 점수 근거
- **근거성 4**: 인용 줄 번호와 문구는 16/16 일치했다(아래 표). 감점 이유는 두 가지다. 하나는 "실측" 표기가 실제 검증 범위보다 넓게 읽힌다는 점이다. guard 시험 하네스의 `parse`는 실제 `RUNS_GIT`과 다르고, stop-check 패치는 `docs/ai-audit` 경로로만 확인했다. 다른 하나는 근거 없이 틀린 서술이 2건 있다는 점이다(아래 #1, #3).
- **구체성 3**: lint 규칙, settings.json, lint-file.mjs는 그대로 옮겨도 동작한다. 그러나 stop-check 패치는 루트 `*.md`를 빼지 못한다. guard 보강은 주석이 약속한 `$(…)`와 `sudo -E`를 처리하지 못하고, 기존 `guard-bash.mjs`의 어느 줄에 어떻게 끼우는지 diff도 없다. 결국 적용하는 AI가 다시 설계해야 한다.
- **일관성 2**: 서로 모순되는 곳이 6곳 이상이다. 초안의 "하네스 동결" 조항과 P-A9 적용 시점, `rules/design.md`와 `status-badge.md`의 기호 설명, 미결정 D-04(queryOptions)를 확정처럼 쓴 점, P-A4 표와 examples/README:32의 "docs .mjs lint 여부", status-badge가 DS-05를 해결한다고 한 점, P-A9와 be-integration의 `paths` 목록이 맞지 않는다.
- **판단가능성 3**: 예시마다 대응 제안(P-xx)과 실측 여부를 적은 표(README:12-28)는 좋다. 그러나 초안이 현재 CLAUDE.md에서 무엇을 빼고 어디로 옮겼는지 대조표가 없다. 그래서 BE 개발자는 규칙이 사라졌는지 판단할 수 없다. L1 설명 오류(#2)는 그대로 학습 오답이 된다.

## 확인한 인용
| 인용 위치 | 문서 주장 | 실제 | 일치/불일치 |
|---|---|---|---|
| README:3, eslint/README:74 `CLAUDE.md:7` | 규칙 변경은 단독 chore + 새 세션 | CLAUDE.md:7 같은 내용 | 일치 |
| README:33 `tsconfig.json:27-28` | `**/*.tsx` include | 27 `"**/*.ts"`, 28 `"**/*.tsx"` | 일치 |
| status-badge.md:9 `src/app/(console)/page.tsx:25` | `<Badge variant="outline">준비 중</Badge>` | 25줄 동일 | 일치 |
| status-badge.md:10 `nav-link.tsx:54-56` | `<Badge variant="secondary" …>준비 중` | 54-56줄 동일 | 일치 |
| status-badge.md:12 `CLAUDE.md:76` | 색만으로 전하지 않는다 | 76줄 동일 | 일치 |
| status-badge.md:34 `CLAUDE.md:12` / :79 `CLAUDE.md:8` | plan 생략 조건 / 미리 만들지 않는다 | 12줄, 8줄 동일 | 일치 |
| eslint/README:60 `nav-link.tsx:33` | `` `${itemBase} border-sidebar-primary …` `` | 33줄 동일 | 일치 |
| guard-bash.additions.mjs:6 `guard-bash.mjs:31` | RUNS_GIT은 git으로 시작할 때만 | 31줄 정규식 `^\s*(?:VAR=…)*(?:\S*[/\\])?git` | 일치 |
| guard-bash.additions.mjs:7 `CLAUDE.md:87` | 파기 명령 금지 | 87줄 동일 | 일치 |
| stop-check.diff.md:5 `stop-check.mjs:53-74` | computeFingerprint가 HEAD+워킹트리 | 53-74줄 동일 | 일치 |
| shot.diff.md:42 `scripts/shot.mjs:85-97` | findChrome 후보에 Playwright 경로 없음 | 85-97줄 동일, `path` import 있음(:22) | 일치 |
| api-error-and-retry.md:7 `providers.tsx:11-16` | `retry: 1` | 11-16줄 defaultOptions 동일 | 일치 |
| api-error-and-retry.md:34 `retryer.ts:170-177`, `:49-50` | retry 함수 판단, 첫 지연 1000ms | 169-177 retry 분기, 49-50 `1000 * 2 ** failureCount`(failureCount=0에서 계산) | 일치 |
| dot-claude/settings.json:2 | 커밋본 대비 PostToolUse만 추가, check-done.sh 제외 | `git show HEAD:.claude/settings.json`에 check-done 없음, 워킹트리에만 있음 | 일치 |
| eslint/README:27-32 실측 출력 | 1·2만 차단, 10:21/11:24 | 같은 샘플을 재구성해 재실행하니 동일 출력, exit 1 | 일치 |
| eslint/README:56-57 | `src` 거짓 양성 0 | 재실행 exit 0 | 일치 |
| README:22 guard 15건 | 모두 기대대로 | `node …additions.mjs` 15건 ok, exit 0 | 일치(단 #4 참조) |
| README:20 lint-file 실측 | 정상·src 밖 exit 0 | nav-link.tsx·README.md·ui/button.tsx·`../outside.ts` 모두 exit 0 | 일치 |

## 지적 사항
| # | 심각도 | 위치 | 문제 | 구체적 수정안 |
|---|---|---|---|---|
| 1 | 높음 | `dot-claude/hooks/stop-check.diff.md:11-13, 28-29, 35` | `":(exclude)**/*.md"`는 git 기본 pathspec에서 `/`가 하나 이상 있어야 매치된다. 그래서 루트의 `CLAUDE.md`·`AGENTS.md`·`README.md`가 빠지지 않는다(`git ls-files -- . ':(exclude)docs/**' ':(exclude)**/*.md'` 출력에 세 파일이 남음). 반면 HEAD 쪽 JS `isDoc`는 이 세 파일을 뺀다. 결과적으로 "문서만 바뀐 턴은 생략"이 가장 자주 고치는 CLAUDE.md에는 적용되지 않고, 두 계산의 기준도 서로 다르다. 35줄의 "실측"은 `docs/ai-audit` 변경으로만 확인한 것이다 | `':(exclude)*.md'`(기본 pathspec에서는 `*`가 `/`도 매치. 실행하면 .md 0건)나 `':(exclude,glob)**/*.md'`로 바꾼다. 확인 절에 "루트 CLAUDE.md만 수정 → 지문 불변" 케이스를 추가한다 |
| 2 | 높음 | `components/status-badge.md:34` plan ② | "L1: 서버 컴포넌트로 두어 client인 `nav-link.tsx`에서 import해도 client 번들에 상태가 늘지 않음"은 틀렸다. 지시어 없는 모듈을 `"use client"` 파일이 import하면 그 모듈은 client 번들에 포함되어 client 컴포넌트로 동작한다. 이 프로젝트의 학습 목표 L1을 반대로 가르치는 문장이다 | "지시어 없는 공용 부품: `page.tsx`(서버)에서는 서버 컴포넌트로, `nav-link.tsx`(client)에서는 client 번들에 포함된다. 훅·이벤트가 없어 어느 쪽이든 동작하므로 `"use client"`를 붙이지 않는다"로 고친다. 필요하면 Next 문서의 해당 경로를 근거로 단다 |
| 3 | 높음 | `05-proposals.md` P-A4 B 단점, `stop-check.diff.md:12` vs `examples/README.md:32` | P-A4는 "문서 안 코드 예시는 … 지금도 lint 대상 아님", stop-check 주석은 "현재 lint는 src·설정만 의미 있음"이라고 쓴다. 그런데 README:32와 실제 설정(`eslint.config.mjs:324-331` globalIgnores에 docs 없음, `eslint --print-config docs/…/no-dynamic-class.mjs`가 설정을 반환)으로는 `docs/**/*.mjs`도 lint 대상이다. 패치를 적용하면 examples의 .mjs 6개가 Stop 검사망에서 빠진다 | ① P-A4·주석의 서술을 정정한다. ② 제외 대상을 `*.md`(+ 필요하면 `docs/**/*.md`)로만 좁히거나, `docs/**`를 eslint globalIgnores에도 넣는 선택지를 함께 적는다 |
| 4 | 중간 | `dot-claude/hooks/guard-bash.additions.mjs:5-6, 18, 23, 43-50` | 주석은 `$(…)`와 "실측 우회 5종"을 처리한다고 하지만 실행해 보면 그렇지 않다. `"$(echo git) push -f"`는 `echo git) push -f`가 되고(01-ai-setup.md:65의 5번째 우회 그대로), `"x=1 $(git push -f)"`는 `$(git push -f`, `"echo $(git reset --hard)"`는 미검출이다. `"sudo -E git push -f"`는 `push -f`로 git 토큰 자체가 사라지고, `"time -p git push -f"`는 `-p git push -f`, `bash -lc "…"`는 미검출이다. 또 시험용 `parse`는 토큰 어디서든 git을 찾아서 실제 가드의 `RUNS_GIT`(시작 일치)보다 관대하다. 따라서 "15건 통과"가 통합 후 동작을 보장하지 않는다 | ① 주석에서 `$(…)` 주장을 빼거나, 세그먼트 안의 `$(`·백틱 위치를 기준으로 분리하도록 구현한다. ② sudo 옵션 정규식을 값이 필요한 옵션(`-u`,`-g`)만 2토큰으로 처리하도록 고친다. `bash -lc`처럼 `-c`를 포함한 묶음 옵션도 처리한다. ③ 시험이 실제 `RUNS_GIT`+`gitSubcommand`를 거치도록 바꾸고, 위 6건과 01-ai-setup 2.4 표의 5종을 케이스에 추가한다. ④ `guard-bash.mjs:38-39`에 끼우는 diff를 제시한다 |
| 5 | 중간 | `guard-bash.additions.mjs:31-36` `destructiveReason` | 파기 명령 중 빠진 것: `git restore --staged --worktree .`(--staged가 있으면 통과), `git checkout HEAD src/a.ts`(`--` 없는 경로 복원), `git switch -f`/`--discard-changes`, `git clean -fd src/components/ui/x src/app`(ui 경로가 하나만 있어도 전체 허용). 모두 실행해서 `null`이 나오는 것을 확인했다. 반대로 `git stash pop`처럼 변경을 되살리는 명령은 차단한다 | restore는 `--worktree`/`-W`가 있으면 차단한다. checkout은 브랜치 전환이 아닌 경로 인자(`--` 유무와 무관, 파일이 존재하면)를 차단한다. switch `-f`/`--discard-changes`도 추가한다. clean은 "모든 경로 인자가 ui 경로"일 때만 허용한다. stash는 `pop`/`apply`도 허용할지 판단 근거를 적는다 |
| 6 | 중간 | `claude-md/CLAUDE.draft.md:17` vs `05-proposals.md` P-A2·P-A9 | 초안에 "첫 데이터 기능이 커밋될 때까지 동결" 조항이 들어 있다. 그런데 P-A9(이 초안 자체)는 "첫 데이터 기능 뒤" 적용으로 추천된다. 초안을 적용하는 시점에는 이 조항이 이미 만료되어 있다. P-A7(지금 당장 정정)도 이 초안에만 반영되어 있어서, 지금 P-A7만 적용하려는 사람이 쓸 예시가 없다 | 초안을 둘로 나눈다. ① "지금 적용분" = 현재 CLAUDE.md + P-A7·P-A2·P-A10 줄 단위 diff ② "첫 기능 뒤 적용분" = P-A9 구조 개편 초안(동결 조항 제외). README 표 14줄도 그렇게 나눈다 |
| 7 | 중간 | `CLAUDE.draft.md:41,74`, `rules/be-integration.md:16`, `skills/report/SKILL.md:18`, `docs/spec/TEMPLATE.md:26` | D-04(queryKey 방식)는 아직 결정되지 않았다(`decisions-needed.md` 순위 4). 그런데 초안과 rules가 `queryOptions` 묶음을 확정 규칙으로 쓴다. README:14의 "반영 제안"에는 P-C4·P-C2(errorMessage)·P-D1·P-D3도 빠져 있다 | README 표에 P-C4·P-C2·P-D1·P-D3 반영을 명시하고 "D-04가 B로 결정됐을 때의 문안"이라고 표시한다. A로 결정되면 바꿀 줄(초안 41·74, rule 16, report 18)을 나열한다 |
| 8 | 중간 | `CLAUDE.draft.md` 전체 vs 현재 `CLAUDE.md:21,69,70` | 초안에서 대조 없이 사라진 규칙이 있다. `.env.example`에 새 변수 추가, `server-only` 패키지 설치 필요, "비밀값은 되도록 BE에서"(L2 관련), shadcn이 따라 설치하는 `sonner`·`next-themes` 승인 예외와 보고 의무, 직접 띄운 dev 서버 종료·포트 확인, shot의 exit 1/2 의미. rules·skills 어디에도 없다. 또 P-A9는 "약 60줄"이라고 했지만 초안은 90줄이다(현재 100줄) | 초안 끝(또는 README)에 "현재 줄 → 초안 위치/삭제 사유" 대조표를 추가한다. 위 6개는 초안이나 해당 rule로 옮긴다(env는 be-integration 또는 새 `paths: src/lib/env*.ts` rule). 60줄 목표와 실제 줄 수 차이도 설명한다 |
| 9 | 중간 | `dot-claude/rules/be-integration.md:1-8, 14` | "새 엔드포인트는 plan에 `파일:줄`" 규칙은 plan 단계에 필요하다. 그러나 `paths:` rule은 해당 파일을 읽거나 편집할 때 로드된다. 새 feature는 `features/<name>/api.ts`가 아직 없으므로 plan 작성 시점에 이 규칙이 컨텍스트에 없을 수 있다. 503 = BE 문제 안내도 화면 디버깅 중에는 로드되지 않는다. 덧붙여 P-A9 표의 paths(`api.ts, types.ts`)와 예시의 paths 5개가 다르다 | "새 엔드포인트는 Controller/DTO 확인 후 plan에 파일:줄, 모르면 묻는다" 한 줄과 503 안내는 CLAUDE.md 본문에 남긴다. 나머지만 rule로 옮긴다. P-A9 표의 paths를 예시와 맞춘다 |
| 10 | 중간 | `rules/design.md:13` vs `components/status-badge.md:41,79` | rule은 "부품이 ✓·▲·✕와 문구를 함께 그린다"고 쓰지만, After의 StatusBadge는 `pending`만 있고 기호가 없다("새 의미는 처음 필요한 화면에서 추가"). 이 rule을 읽은 AI는 이미 있다고 믿고 `status="success"`를 쓰려다 타입 오류를 낸다. 아니면 "부품이 보장"을 믿고 확인을 건너뛴다 | rule 13줄을 "상태는 `StatusBadge`로 표시한다. 새 의미를 추가할 때는 `STATUS`에 기호(✓·▲·✕)와 문구를 함께 넣는다"로 고친다 |
| 11 | 중간 | `components/status-badge.md:1` (그리고 P-D1) | 제목은 DS-05를 해결한다고 하지만, DS-05(`02-design-system.md:110`)는 카드 링크의 `rounded-xl` 수동 맞춤과 hover·focus 문제다. Before/After는 이를 전혀 다루지 않는다 | 제목과 P-D1에서 DS-05를 빼고 P-D2(C, 부품)나 별도 제안으로 옮긴다. 아니면 After에 카드 링크 처리를 추가한다 |
| 12 | 낮음 | `eslint/no-dynamic-class.mjs:20-27` · `eslint/README.md` | 변수에 먼저 담는 흔한 형태(`const cls = \`text-${size}\`; <p className={cls}>`)는 `VariableDeclaration`에서 탐색이 끝나 통과한다(재실행 exit 0). README "한계"에 이 내용이 없다. README:17-25 샘플은 발췌라 보고된 10:21/11:24 줄 번호를 그대로 재현할 수 없다 | README 한계 절에 "변수에 담은 조립 클래스는 못 잡음(맵 패턴 안내 메시지로 보완)"을 추가하고, 샘플 전체(17줄)를 코드 블록으로 싣는다 |
| 13 | 낮음 | `code/api-error-and-retry.md:26, 45-47` | ① 26줄 주석은 "404는 빈 상태로 바로 그려야 한다"고 하지만, 같은 문서의 사용 예는 404를 `isError` 분기에서 오류 문구로 그린다. ② 401/403 문구 "다시 로그인한 뒤"는 인증이 미정(D-01, 추천은 프록시 Basic 인증이라 앱에 로그인 화면이 없음)인 상태와 맞지 않는다. ③ 503을 일괄 "채점 서버"로 부르면 채점 외 엔드포인트에서 오해를 부른다. rewrites 중계 구조에서는 BE가 꺼져도 TypeError가 아니라 Next의 5xx 응답이 올 수 있는데, 이 점도 확인하지 않았다 | 404를 빈 상태로 처리할 위치(queryFn에서 null 반환 등)를 정한다. 401/403은 "권한이 없습니다"만 남긴다. 503 문구는 일반화하고 채점 화면에서만 덮어쓴다. "BE 끔" 상태에서 실제 상태 코드를 `CORE_API_URL=http://127.0.0.1:9`로 확인한 뒤 문구를 매핑한다 |
| 14 | 낮음 | `scripts/shot.diff.md:54-56` | `/opt/pw-browsers/chromium`은 이 점검 환경에만 있는 심볼릭 링크다(`→ chromium-1194/chrome-linux/chrome`). 표준 Playwright 설치에서는 `$PLAYWRIGHT_BROWSERS_PATH/chromium-<rev>/chrome-linux/chrome` 형태라서 "CI의 Playwright 브라우저" 후보가 일반 CI에서는 맞지 않는다 | 후보 탐색을 `chromium-*/chrome-linux/chrome` glob(fs.readdirSync)으로 바꾸거나, 주석을 "이 클라우드 환경 전용"으로 좁힌다 |
| 15 | 낮음 | `dot-claude/agents/red-team.md:8` · P-A8 | `disallowedTools: Edit, Write`를 "문장 규칙 → 도구 차단"이라고 설명하지만, 같은 문서 25줄이 Bash로 임시 파일을 만들라고 지시한다. 쓰기 경로는 그대로 열려 있다. P-A8 본문은 이 한계를 적었는데 예시 주석은 과장한다 | 주석을 "Edit/Write 도구만 차단, Bash 쓰기는 여전히 문장 규칙"으로 맞춘다 |
| 16 | 낮음 | `docs/spec/TEMPLATE.md:3` | P-A3 적용 시 "화면 1개도 SPEC"이 되는데, 기존 `docs/spec/README.md:3`("화면 2개 이상인 feature는…")을 바꿔야 한다는 언급이 없다 | 적용 대상 파일 목록에 `docs/spec/README.md` 수정을 추가한다 |

공개 레포 관점: 비밀값·내부 URL·개인정보는 없다. `127.0.0.1:9`는 의도적인 미사용 포트이고, `/opt/pw-browsers`는 환경 경로일 뿐 민감 정보가 아니다.

## 승인 조건
- **구체성 → 4**: #1(pathspec 수정과 루트 .md 케이스 확인), #4·#5(guard: 주석과 구현을 일치시키고, 실제 `RUNS_GIT` 경로로 시험, 누락 케이스 추가, 끼워 넣을 diff 제시)를 반영한다.
- **일관성 → 4**: #3(P-A4와 examples README의 lint 대상 서술 통일), #6(초안을 "지금 적용분 / 첫 기능 뒤 적용분"으로 분리하고 동결 조항 처리), #7(D-04 조건부 표시와 README 반영 제안 목록 보완), #10, #11을 반영한다. P-A9의 paths 목록을 예시와 맞춘다(#9).
- **판단가능성 → 4**: #2(L1 설명 정정)는 필수다. #8의 "현재 줄 → 초안 위치/삭제" 대조표를 추가해, 사용자가 사라지는 규칙을 보고 승인할 수 있게 한다.
- 근거성은 4를 유지한다. 다만 #1·#4를 고친 뒤 "실측" 표기는 실제로 돌린 케이스만 가리키도록 범위를 적는다.
