SCORES: 근거성=4 구체성=3 일관성=4 판단가능성=4

## 총평
라운드 1 지적 16건 중 15건은 실제로 반영됐다. guard 시험(47건)과 ESLint README 명령은 그대로 재현되고, 직접 연 인용 20건도 모두 맞았다. #6은 일부만 반영됐다.
새로 생긴 문제가 하나 크다. `red-team.md` 예시의 "출력" 절이 종합 판정 기준을 지웠고, 파일 대부분이 "(현재와 같음)" 자리표시다. 그래서 README:8의 "`dot-claude/X` → `.claude/X`로 옮긴다"를 따르면 공격 절과 판정 기준이 사라진 에이전트가 된다.
guard 보강에도 구멍이 하나 남았다. allow 목록에 있어 확인 없이 실행되는 `git switch -C main <ref>`가 로컬 main을 옮기는데, 차단되지 않는다. `git branch -f main`은 차단하므로 기준이 맞지 않는다.

## 점수 근거
- **근거성 4**: 파일:줄 인용 20건을 열어 모두 일치를 확인했다(아래 표). 실측 표기도 실제로 돌린 범위로 좁혀졌다(README:12, :22-28). 감점 요인은 세 가지다. README:160 "실행 위치에 그 경로가 있을 때만 차단"은 구현(hook 프로세스 cwd 기준 `fs.existsSync`)과 다르다. `api-error-and-retry.md:131`의 "공통 사실 F11"은 어디에도 정의가 없다. `lint-file.mjs:7`의 "globalIgnores와 맞춤"은 사실이 아니다.
- **구체성 3**: ESLint 규칙, lint-file, stop-check 패치, guard 함수는 그대로 옮겨 쓸 수 있는 수준이다. 반면 `red-team.md`는 적용 가능한 파일이 아니다. 자리표시가 섞인 부분 문서이고, 바뀐 "출력" 절에서 기존 판정 기준이 사라졌다. guard는 allow 목록에 있는 `switch -C`의 로컬 main 이동을 놓친다.
- **일관성 4**: 05 P-A4(:84), P-A9 paths(:139), 02 DS-05(:176)가 examples와 맞게 고쳐졌다. D-04 조건부 표(README:95-100)의 줄 번호 4개도 모두 맞다. 남은 불일치는 두 가지다. README:25는 P-C5 시점을 "첫 기능 뒤"로 적었지만 05:32는 "여유 있을 때"다. 또 05가 "다음 기능 전"으로 잡은 P-A1·P-A3의 CLAUDE.md 문안이 "첫 기능 뒤" 초안에만 있다.
- **판단가능성 4**: 현재 줄 → 초안 위치 대조표(README:50-89)와 D-04 A/B 표 덕분에 사라지는 규칙과 갈리는 문안을 사용자가 직접 확인할 수 있다. 다만 P-A9의 실익은 정량으로 드러나지 않는다. 상시 로드가 10,825→9,114바이트로 약 16% 줄 뿐이고, `design.md` rule은 거의 모든 작업(`src/**/*.tsx`)에서 로드된다. 이 수치는 README:44에 있지만 결론으로 연결되어 있지 않다.

## 확인한 인용
| 인용 위치 | 문서 주장 | 실제 | 일치/불일치 |
|---|---|---|---|
| guard-bash.additions.mjs:6, :29-30 `guard-bash.mjs:31`, `:44-54`, `:60`, `:65` | RUNS_GIT·gitSubcommand·FORCE_FLAG·push 판정 | 31·44-54·60·65줄 동일. 시험이 원본 문자열을 비교한다(`ok … 복사본 일치`) | 일치 |
| guard-bash.additions.mjs:19-21 `:38-39`, `:86 다음` | split 대체 위치, push 검사 뒤·commit 검사 앞 | 38 `split(/[;&|\r\n]+/)`, 39 filter, 85 push 루프 끝, 87 `wantsCommitOrMerge` | 일치 |
| guard-bash.additions.mjs:16 `.claude/settings.json:18, :21` | `git branch *`·`git switch *` allow | HEAD·워킹트리 모두 18 `git branch *`, 21 `git switch *` | 일치 |
| README:104-154 guard 시험 출력 | 47건 모두 기대대로 | `node …guard-bash.additions.mjs` → 47건 ok, exit 0 | 일치 |
| stop-check.diff.md:5 `stop-check.mjs:53-74` | HEAD 해시 + 워킹트리 지문 | 53-74 `computeFingerprint`, 55 `rev-parse HEAD` | 일치 |
| stop-check.diff.md:46-53 pathspec 실측 | `:(exclude)*.md` → .md 0, examples .mjs 5 | 재실행 결과 0 / 5, 커밋된 .mjs 5개 | 일치 |
| README:164, stop-check.diff.md:9 `eslint.config.mjs:324-332` | globalIgnores에 docs 없음 | 324-332 globalIgnores에 `.next`·`out`·`build`·`next-env`·`src/components/ui`만 있음. `pnpm -s lint` exit 0 | 일치 |
| eslint/README:39-45 | 10:21, 11:24 차단, exit 1 | README 17줄 샘플을 그대로 잘라 재실행 → 동일 출력, exit 1 | 일치 |
| eslint/README:75-77, :86-88 | 변수 조립 미검출 / `src` 거짓 양성 0 | 둘 다 exit 0 | 일치 |
| eslint/README:52-53 no-restricted-paths | components → app import 차단 | stdin 재실행 시 `1:22 error … import/no-restricted-paths` | 일치 |
| eslint/README:66 `no-dynamic-class.mjs:21-28` | 부모를 거슬러 올라가는 inClassContext | 21-28 동일 | 일치 |
| status-badge.md:9-10 `page.tsx:25`, `nav-link.tsx:54-56`, `:1` | outline / secondary 배지, `"use client"` | 동일 | 일치 |
| status-badge.md:37 Next 문서 `05-server-and-client-components.md:176` | "Once a file is marked with "use client", all of its imports…" | 176줄 동일(원문은 굵게 표시) | 일치 |
| README:58, :65, :99 `skills/report/SKILL.md:10`, `:11-19`, `:18` | L1~L3 첫 줄 / 1~5단계 / grep 줄 | 10 "0. plan에 L1~L3", 11-19 1~5단계, 18 `queryKey\|queryOptions` | 일치 |
| README:98, :181 `be-integration.md:18`, `:12` | queryKey 항목 / 로드 시점 안내 | 18 queryKey, 12 "이 rule은 …때만 로드" | 일치 |
| README:76-79 `rules/design.md:9`, `:11`, `:12-13`, `:14` | 문서 읽기 / 토큰 / primary·상태 / PageHeader | 줄마다 동일 | 일치 |
| README:39 "초안 93줄과 같은 문구" | D-05 예외 문구 | 초안 93줄과 README:40 문구 동일 | 일치 |
| README:44 줄 수·바이트 | 100줄/10,825B, 100줄/9,114B, rules 16·20, skills 23·27 | `wc -l -c` 동일 | 일치 |
| api-error-and-retry.md:8, :61, :117 `client.ts:34-36`, `:40`, `:12` | non-2xx면 ApiError, res.json, RequestInit | 34-36 throw, 40 `res.json()`, 12 `RequestOptions = Omit<RequestInit…>` | 일치 |
| api-error-and-retry.md:57 `retryer.ts:170-177`, `:49-50` | retry 함수 판단, 첫 지연 1000ms | 설치본 5.101.4에서 함수 분기 확인, `1000 * 2 ** failureCount` | 일치 |
| red-team.md:9, :15, :18, :27 "현재 파일 :30, :9-11, :14-19, :18, :34" | 현재 red-team.md 줄 | `git show HEAD:.claude/agents/red-team.md`에서 줄마다 확인 | 일치 |
| shot.diff.md:5, :40 `shot.mjs:85-97`, `:19`, `:21`, `:22` | findChrome 후보, fs·os·path import | 85-97 findChrome, 19 fs, 21 os, 22 path | 일치 |
| README:160 "실행 위치에 그 경로가 있을 때만 차단" | 명령의 실행 위치 기준 | 구현은 hook 프로세스 cwd 기준 `fs.existsSync`(additions:216). `/tmp`에서 `git checkout package.json` → 미차단 | **불일치** |
| api-error-and-retry.md:131 "공통 사실 F11" | 참조 | `docs/ai-audit` 전체에 F11 정의 없음 | **불일치(댕글링)** |

## 라운드 1 지적 반영 확인
| # | 확인 결과 |
|---|---|
| 1 | 반영. pathspec 0/5 재현. 루트 CLAUDE.md 케이스가 실측 표에 있다(stop-check.diff.md:61) |
| 2 | 반영. L1 설명 정정, 문서 줄 인용 일치 |
| 3 | 반영. examples 주석과 05 P-A4(:84) 모두 "docs .mjs는 lint 대상"으로 통일 |
| 4 | 반영. `$(…)` 중간·`sudo -E`·`time -p`·`bash -lc`가 실제 RUNS_GIT 복사본을 거쳐 차단된다. 동적 명령 이름은 한계로 명시. 단 새 구멍이 있다(아래 #2) |
| 5 | 반영. 지적한 5종 모두 차단, stash pop/apply 허용 근거 기재 |
| 6 | **일부 반영.** 동결 조항 분리와 P-A7·P-A2·P-A10 "지금 적용분"은 생겼다. 그러나 "다음 기능 전"인 P-A1·P-A3·P-A5의 CLAUDE.md 문안은 여전히 "첫 기능 뒤" 초안에만 있다(아래 #3) |
| 7 | 반영. D-04 A/B 표의 4개 줄 번호 일치 |
| 8 | 반영. 대조표에서 지적한 6개 규칙의 행선지(초안 55·56·58·78)를 확인했다 |
| 9 | 반영. 초안 85-86에 BE 계약·503이 남고, 05:139 paths가 예시와 같다 |
| 10, 11, 12, 14, 15, 16 | 반영 확인 |
| 13 | 반영. 단 반영 기록에 정의되지 않은 "F11" 참조가 있다(아래 #7) |

## 지적 사항
| # | 심각도 | 위치 | 문제 | 구체적 수정안 |
|---|---|---|---|---|
| 1 | 높음 | `dot-claude/agents/red-team.md:29-34`(출력), `:15`·`:18`·`:23`·`:27`(자리표시), `:20`, `examples/README.md:8` | ① 바꾼 "출력" 절이 현재 파일 38-41줄의 판정 기준을 지웠다. 지워진 것은 "`수정 필요` = 높음 등급이 하나라도 있거나 완료 조건 실패가 있으면"과 발견마다 붙이던 "재현 / 실패 시나리오 / 권장 수정"이다. CLAUDE.md의 레드팀 루프(최대 3바퀴)는 이 판정에 기대므로, 기준이 없으면 에이전트가 임의로 `커밋 가능`을 낼 수 있다. ② 파일 대부분이 "(현재와 같음)" 자리표시다(`## ② 공격` 전체 포함). 그런데 README:8은 일괄로 "`dot-claude/X` → `.claude/X`로 옮긴다"고 안내한다. 그대로 옮기면 공격 체크리스트 6항목과 BE 꺼짐 판정법(현재 :17)이 사라진다. README:20의 "문서(바뀐 절만)"는 이 위험을 막지 못한다. ③ `:20` "`pnpm test <파일>`"은 실재하지 않는 스크립트다(`package.json`에 test 없음, D-03 미결정) | 예시를 완전한 파일로 바꾼다. 현재 `.claude/agents/red-team.md` 전문에 frontmatter `disallowedTools`, exit 2 구분 1줄, SPEC 기록 줄만 더하고 출력 절의 기존 기준은 그대로 둔다. 아니면 `red-team.diff.md`로 이름을 바꿔 diff 형식으로 제시한다. README:8에 "`*.diff.md`·부분 예시는 복사하지 않고 병합"이라는 예외를 적는다. `pnpm test` 줄은 "P-C3 적용 후"로 표시한다 |
| 2 | 중간 | `guard-bash.additions.mjs:187-192`(`SUB_OPTS_WITH_VALUE`), `:235-239`(branch 판정) | `KEEP_LOCAL`로 `git branch -f main HEAD~1`은 막는다. 그러나 같은 효과(로컬 main 포인터 강제 이동)를 내는 `git switch -C main HEAD~3`과 `git checkout -B main HEAD~3`은 `null`로 통과한다(scratch에서 export 함수로 재현). 특히 `switch`는 allow 목록(`settings.json:21`)에 있어 기본 권한 모드에서도 확인 없이 실행된다. AI-04가 우선 막자고 한 바로 그 조합이다. 같은 계열인 `git branch -m main x`(force 없는 main 이름 변경)도 통과한다 | switch는 `-C`/`--force-create`, checkout은 `-B`의 값이 `KEEP_LOCAL`에 있으면 차단한다. branch는 `-m`/`--move`의 대상이 `KEEP_LOCAL`이면 차단한다. 시험 케이스 3건(`switch -C main HEAD~3`, `checkout -B main HEAD~3`, `switch -C feat-x` 허용)을 더하고 README 출력과 건수(47→50)를 갱신한다 |
| 3 | 중간 | `examples/README.md:32-40` "지금 적용분", `docs/spec/TEMPLATE.md:5` | "지금 적용분"이 P-A7·P-A2·P-A10만 다룬다. 05에서 "다음 기능 전"인 P-A3은 `CLAUDE.md:14`(모든 feature SPEC)와 "기록" 단계 추가가 필요하다. TEMPLATE:5는 그 문안을 "초안 작업 루프 2"로 넘기는데, 초안은 첫 기능 **뒤**에 적용된다. P-A1(`/learn` 안내, 초안 42)과 P-A5(초안 94의 `switch -f` 추가와 "가드가 차단")도 같은 상태다. 첫 기능 전에 이 제안들을 적용하는 AI는 CLAUDE.md에 넣을 문구가 없어 다시 설계해야 한다. 이는 라운드 1 #6의 남은 부분이다 | "지금 적용분"을 "지금 / 다음 기능 전" 두 묶음으로 넓힌다. 각 제안마다 현재 `CLAUDE.md` 줄 번호와 넣을 문구를 1~2줄로 적는다. 예: P-A3 → `:14` 교체 문구와 `:22` 뒤 "SPEC 완료 조건 표에 판정 기록" / P-A1 → `:36` 뒤 `/learn` 안내 / P-A5 → `:87`에 `switch -f` 추가 |
| 4 | 낮음 | `guard-bash.additions.mjs:216` 기본 `exists`, `README.md:160` | `git checkout <파일>` 판정이 hook 프로세스의 cwd 기준이다. 메인 세션 Bash는 `cd`가 유지되므로 `cd src` 뒤 `git checkout app/page.tsx`, 또는 한 줄짜리 `cd src && git checkout app/page.tsx`는 통과한다. README의 "실행 위치에 그 경로가 있을 때만"은 사실과 다르다. 접두 명령 표에 `timeout`·`xargs`도 없다(`timeout 5 git push -f` 미검출). 다만 주석이 주장한 범위 밖이다 | hook 입력의 `input.cwd`를 기준으로 `path.resolve(cwd, p)`를 검사하고, 세그먼트 앞의 `cd <dir>`는 한계로 적는다. `timeout`(값 1개)·`xargs`를 `PREFIX_OPTS_WITH_VALUE`에 추가하거나 한계 목록에 넣는다 |
| 5 | 낮음 | `examples/README.md:25` | P-C5 적용 시점이 "첫 기능 뒤"로 적혀 있다. 05:32는 "여유 있을 때", 05:261은 "feature가 생긴 뒤"라서 표끼리 다르다 | 05:32의 "여유 있을 때"에 맞춘다(또는 05 표를 함께 고친다) |
| 6 | 낮음 | `dot-claude/hooks/lint-file.mjs:7`, `:27` | 주석은 "globalIgnores와 맞춤"이라고 하지만 `src/` 밖 lint 대상(`scripts/shot.mjs`, `eslint.config.mjs`, `docs/**/*.mjs`)도 건너뛴다(`scripts/shot.mjs` 입력 시 exit 0 확인). Stop hook이 다시 잡으므로 위험은 작지만 설명이 틀렸다 | 주석을 "src 안의 lint 대상만 빠르게 본다(src 밖은 Stop hook이 검사)"로 고친다 |
| 7 | 낮음 | `code/api-error-and-retry.md:131` | 반영 기록의 "공통 사실 F11"이 `docs/ai-audit` 어디에도 정의되어 있지 않다 | 참조를 지우거나 정의한 문서·절을 적는다 |
| 8 | 낮음 | `stop-check.diff.md:31-34` | `git ls-tree -r HEAD`는 `core.quotePath` 기본값에서 비 ASCII 경로를 `"docs/\352…md"`처럼 따옴표로 감싼다. 그러면 `endsWith(".md")`가 거짓이 되어 해당 .md가 지문에 남는다. 지금 저장소에는 그런 경로가 0건이지만 BE 문서명(`03_API명세.md`) 같은 한글 파일명이 생기면 바로 걸린다 | `git ls-tree -r -z HEAD`로 바꾸고 `\0`으로 분리한다 |
| 9 | 낮음(취향) | `eslint/README.md:64-82` 한계 | `cn("text-" + size)` 같은 문자열 `+` 조립도 통과한다(stdin 재실행 exit 0). 한계 절에 없다 | 한계 절에 한 줄 추가한다 |
| 10 | 낮음(취향) | `claude-md/CLAUDE.draft.md:80`, `:84-86` ↔ `rules/design.md:9`, `rules/be-integration.md:14-16`, `:20` | 같은 규칙(디자인 문서 먼저 읽기, 새 엔드포인트, 503)이 본문과 rule에 거의 같은 문장으로 두 번 있다. 나중에 한쪽만 고치면 서로 어긋난다. P-A9의 실익(상시 로드 약 16% 감소)도 README:46에서 수치로 결론 나지 않는다 | rule 쪽은 "본문 규칙 참조"로 줄이고 세부만 남긴다. README:46에 "상시 로드 10.8KB→9.1KB, design rule은 tsx 작업마다 로드"를 결론 문장으로 적어 P-A9(작업량 M)의 판단 근거로 쓴다 |

공개 레포 관점: 비밀값·개인정보는 없다. 등장하는 URL은 공식 문서 1건과 루프백 주소(`127.0.0.1:9`, `:3917`)뿐이다.

## 승인 조건
- **구체성 3 → 4**: #1을 반영한다. `red-team.md`를 완전한 파일(또는 diff)로 바꾸고 기존 판정 기준을 되살린다. README:8에 부분 예시 복사 금지 예외를 적는다. #2를 반영한다. `switch -C`·`checkout -B`·`branch -m`으로 로컬 main을 옮기는 경우를 차단하고, 시험 케이스와 README 출력을 갱신한다.
- 일관성·판단가능성은 4를 유지한다. 다만 #3("다음 기능 전" 제안의 현재 CLAUDE.md 줄 단위 문안)은 라운드 1 #6의 남은 부분이므로 함께 반영하길 권한다. 근거성 4 유지를 위해 #4의 README:160 서술과 #7의 F11 참조를 정정한다.
