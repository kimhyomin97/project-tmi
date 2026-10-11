SCORES: 근거성=4 구체성=3 일관성=4 판단가능성=4

## 총평
라운드 3 지적 8건은 이 폴더 안에서 모두 반영됐다. guard 시험 79건은 README 출력과 한 줄씩 같고(exit 0), ESLint README 명령 9종도 그대로 재현된다. 직접 연 인용 30건도 모두 맞다.
하지만 "지금 (a)"로 바로 넣는 guard의 끼우는 방법을 글자 그대로 따르면 `path` import가 빠진다. 그러면 `git checkout <인자 1개>`에서 hook이 ReferenceError로 exit 1이 되고, 이 경우 명령이 막히지 않고 실행된다(fail-open). 따옴표로 감싼 브랜치 이름(`"$b"`)도 그대로 통과한다.
(d) 2의 D-03 문안에는 vitest 설치 단계가 없어 `decisions-needed.md` D-03과 어긋난다. 05를 언급하는 기록 문장 몇 개는 05가 이미 고쳐진 뒤라 사실과 다르다.

## 점수 근거
- **근거성 4**: 파일:줄 인용 30건을 열어 봤고 모두 맞다. guard 시험 79건과 eslint 실측 9건, `-Cq`/`-qC` git 동작(임시 저장소)도 재현된다. 감점 요인은 README:136의 "05 P-A9 표는 라운드 3 수정 전 바이트(9,114·1,661) 기준"이다. 실제 05:162-169는 이미 9,204·1,691·13,366으로 바뀌어 있다. README:362·:365의 05 상태 서술도 같은 이유로 낡았다.
- **구체성 3**: 줄 번호가 붙은 적용 문안, 조건부 표(D-01·D-04), red-team 단계 표는 바로 실행할 수 있다. 하지만 가장 먼저 적용하는 guard는 머리 주석(:30-38)대로 끼우면 `path is not defined`로 실패한다(아래 #1, 패치본을 직접 만들어 확인). (d) 2는 설치 없이 `test` 스크립트만 더하라고 해서 그대로 따르면 `pnpm test`가 깨진다(#3).
- **일관성 4**: P-C5·P-C6 시점, 초안 :94·:25, `rules/design.md:11`, 바이트 표가 05·(d) 문안과 맞는다. 남은 어긋남은 다섯 가지다. ① D-03 설치 단계: decisions-needed에는 있고 examples에는 없다. ② README의 05 상태 서술 3곳이 낡았다. ③ 05 P-A6 B가 shot.diff.md와 반대로 `/opt/pw-browsers/chromium` 추가를 권한다. ④ report skill에는 SPEC 표가 하나만 적혀 있다. ⑤ 05의 라운드 3 기록 :418은 바이트 9,204와 비율 84.2%를 함께 적었는데, 이 비율은 수정 전 값이다(05 담당).
- **판단가능성 4**: 지금 / (d) / 첫 기능 뒤 세 단계와 결정(D-01·D-03·D-04)마다 바뀌는 줄이 분명하다. 턴 종류별 바이트 표로 P-A9 판단 근거도 바로잡혔다. 다만 "guard는 실측 79건 통과"라는 인상과 달리, 끼운 상태는 검증되지 않았다(README:25에 "미실행"이라고 적혀 있다). 그런데 적용 절차에 끼운 뒤 확인하는 단계가 없어 사용자가 위험을 판단하기 어렵다.

## 확인한 인용
| 인용 위치 | 문서 주장 | 실제 | 일치/불일치 |
|---|---|---|---|
| README:205-287 시험 출력 79건 | 모두 기대대로 | `node …guard-bash.additions.mjs` 출력과 첫 줄(`$ node …`)을 빼면 완전히 같다. exit 0 | 일치 |
| guard-bash.additions.mjs:31-38 → `guard-bash.mjs:38-39`, `:86` | split 줄, RUNS_GIT 필터, push 루프 뒤 commit 검사 앞 | 38 `split(/[;&|\r\n]+/)`, 39 filter, 85 push 루프 끝, 87 `wantsCommitOrMerge` | 일치 |
| guard-bash.additions.mjs:41, :345-358 → `guard-bash.mjs:31`, `:44-54`, `:60`, `:65` | 복사본과 원본 일치 | 31 RUNS_GIT, 44 OPTS_WITH_VALUE, 45-54 gitSubcommand, 60 FORCE_FLAG, 65 force 판정 | 일치 |
| README:291 `.claude/settings.json:21` | `git switch *` allow | 21 `"Bash(git switch *)"` | 일치 |
| README:294 `-Cq main` → 새 브랜치 q, `-qC main HEAD~1` → main 이동 | git parse-options 동작 | 임시 저장소에서 "Switched to a new branch 'q'", main 커밋 수 2 → 1 | 일치 |
| README:129-134 바이트 표 | 9,204 / 10,895 / 11,675 / 13,366, 대비 85.0·100.6·107.9·123.5% | `wc -c`: 초안 9,204, design 1,691, be 2,471, CLAUDE.md 10,825. 합과 비율 모두 맞음 | 일치 |
| README:136 "05 P-A9 표는 라운드 3 수정 전 바이트(초안 9,114·design 1,661) 기준" | 05가 옛 값 | `05-proposals.md:162-169`는 9,204·1,691·13,366(새 값) | **불일치** |
| README:365 #6 "05 담당(05 동기화 필요 표시)" | 05 P-A4 B에 `-z` 없음 | `05-proposals.md:92`에 이미 `git ls-tree -r -z HEAD` | **불일치**(낡은 서술) |
| README:43-46, :52-54 `CLAUDE.md:7`, `:20`, `:45`, `:60`, `:62`, `:66`, `:87` | 각 줄 내용 | 모두 해당 문장. `:87` 현재 문구도 README:65 인용과 같다 | 일치 |
| README:77 `.claude/agents/red-team.md:18` 다음, README:88 `:41` 다음, README:67 `:15` 다음 | 삽입 위치 | `diff` 결과 `15a17`, `18a21`, `41a45`, `3a4`, `30c33` | 일치 |
| README:79-80, :198-201 D-04 표(`CLAUDE.draft.md:77`, `be-integration.md:18`/`19`, `report/SKILL.md:18`, `TEMPLATE.md:27`) | 바꿀 줄 | 각 파일 해당 줄이 queryOptions 문안 / A 문안 / grep 명령 / queryKey 표기 | 일치 |
| README:189-190 D-01 표 `CLAUDE.draft.md:87`, `:100` | BE 연동 절 끝, 미정 줄 | 87 rule 안내(절 끝), 100 "인증/세션 방식(**VM 공개 배포 전 필수**…" | 일치 |
| README:175 / `CLAUDE.draft.md:94` | 지금 4 문안과 같음 | README:66 문구와 "사용자의"만 빼고 같다 | 일치 |
| `rules/design.md:11` | `+` 조립 미검출 포함 | "변수에 먼저 담거나 `+`로 이어 붙인 조립은 lint가 못 잡으므로" | 일치 |
| README:94-95 `docs/design-system.md:19`, `:21` | 막는 것 / 못 막는 것 목록 | 19 "lint가 막는 것…새 `.css` import.", 21 "lint로 못 막는 것…" | 일치 |
| README:91 `eslint.config.mjs:114`, `:245`, `:249` | 규칙 객체, 플러그인 등록, 규칙 줄 | 114 `const noRawDesignValues`, 245 tmi rules, 249 `"tmi/no-raw-design-values": "error"` | 일치 |
| README:46 `eslint.config.mjs:175`, `:188` | P-A7 정정 대상 | 175 "URL은 env.apiBaseUrl 기준", 188 "'스택 (고정)'" | 일치 |
| README:303 `eslint.config.mjs:324-332` | globalIgnores에 docs 없음 | 동일. `pnpm -s lint` exit 0 | 일치 |
| eslint/README:39-45 | 10:21, 11:24 차단, exit 1 | 샘플 17줄을 잘라 다시 실행하니 출력·exit가 같다 | 일치 |
| eslint/README:75-77, :95-99 | 변수·`+` 조립 미검출(예시·현재 설정) | 세 명령 모두 출력 없음, exit 0 | 일치 |
| eslint/README:51-61 | components·lib 1:22, features 2:15 차단, 허용 방향 exit 0 | 네 경우 모두 같은 줄·열·메시지 | 일치 |
| eslint/README:110-112 | `src` 거짓 양성 0 | exit 0 | 일치 |
| eslint/README:66 `no-dynamic-class.mjs:21-28` | inClassContext | 21-28이 inClassContext | 일치 |
| status-badge.md:9-10, :37, :86 (`page.tsx:25`, `nav-link.tsx:54-56`, `:1`, `badge.tsx:39`, Next 문서 `:176`) | 배지 2종, use client, cn 병합, 번들 규칙 | 모두 동일 | 일치 |
| status-badge.md:12 `CLAUDE.md:76`, :34 `CLAUDE.md:12` | 색만으로 전하지 않기, plan 생략 조건 | 동일 | 일치 |
| api-error-and-retry.md:7, :8, :30, :63, :119 (`design-system.md:44`, `client.ts:34-36`, `providers.tsx:11-16`, `client.ts:40`, `:12`) | 404 빈 상태, throw, retry:1, res.json, RequestInit | 모두 동일 | 일치 |
| shot.diff.md:5, :40 (`shot.mjs:85-97`, `:19`·`:21`·`:22`) | findChrome, import | 85 `function findChrome`, 97 `}`, 19 fs, 21 os, 22 path | 일치 |
| stop-check.diff.md:5 `stop-check.mjs:53-74` | computeFingerprint | 53 `function computeFingerprint`, 74 `}` 부근 | 일치 |
| log.md:8-9 (`nav-link.tsx:3`, `app-sidebar.tsx:7-8`, `sidebar-store.ts:1-3`, `mobile-nav.tsx:3`) | L1·L3 근거 | 각 주석이 주장과 같다 | 일치 |
| README:117 `sidebar-collapse.tsx:35`, :102 `page-header.tsx:16`, :304 `tsconfig.json:27-28` | aria 주석, 제목 클래스, include | 동일 | 일치 |

## 라운드 3 지적 반영 확인
| # | 확인 결과 |
|---|---|
| 1 | 반영. README:26·:121, eslint/README:6·:126·:129가 모두 "첫 기능 뒤 정리"이고, 05:32·:358과 같다 |
| 2 | 반영. 초안 :94 = 지금 4 문안, `rules/design.md:11`에 `+` 포함, "D-01 조건부 문안" 표 신설(README:183-190), 라운드 2 #9 기록 정정 |
| 3 | 반영. 턴 종류별 표의 바이트·비율을 `wc -c`로 다시 계산해 모두 맞음. 결론 방향도 바로잡힘. 단 같은 문단 끝의 05 상태 서술이 낡았다(아래 #4) |
| 4 | 반영. 예약어·for 치환·짧은 옵션 묶음 시험 17건이 통과하고, `-Cq main` 허용이 git 동작과 같음을 확인했다. 단 따옴표로 감싼 `"$b"` 형태는 새 구멍이다(아래 #2) |
| 5 | 반영. 한계와 시험(:282-283)에 고정 |
| 6 | 05 쪽에서 반영됨(05:92에 `-z`). examples 기록 :365는 아직 "동기화 필요"라고 적혀 있다(아래 #4) |
| 7 | 반영(초안 :25). 단 `skills/report/SKILL.md:12`는 여전히 "완료 조건" 표 하나다(아래 #6) |
| 8 | 반영(README:94-95) |

## 지적 사항
| # | 심각도 | 위치 | 문제 | 구체적 수정안 |
|---|---|---|---|---|
| 1 | 중간 | `guard-bash.additions.mjs:30-38`(끼워 넣는 위치), README:65(지금 4), README:25("가드에 끼워 넣은 상태는 미실행") | 끼우는 지시가 "expandCommand·unwrap·destructiveReason과 보조 함수를 복사"뿐이고 `path` import가 빠졌다. 현재 `guard-bash.mjs:12-13`은 `fs`·`execSync`만 import하는데, `destructiveReason`의 기본 `exists`(:297)가 `path.resolve`를 쓴다. 지시대로 패치본을 만들어 stdin JSON으로 돌린 결과는 다음과 같다. `git checkout package.json` → `ReferenceError: path is not defined`, **exit 1**. Claude Code에서 exit 2가 아닌 실패는 막지 않는 오류라 명령이 그대로 실행된다(fail-open). `git checkout main`(일반 브랜치 전환)도 매번 같은 오류를 낸다. `branch -D v3`·`reset --hard`·`switch -C main`은 exit 2로 정상 차단됐다. 시험 스크립트는 자기 파일의 import를 쓰므로 이 결함을 잡지 못한다 | :38에 "`guard-bash.mjs` 상단 import에 `import path from "node:path";` 추가"를 적는다. 판정 루프를 `try { … } catch (e) { stderr에 "가드 내부 오류: …" 출력 후 exit 2 }`로 감싸 fail-closed로 만드는 것도 권한다. README 지금 4에 "끼운 뒤 확인" 단계를 더한다: 실제 hook에 `{"cwd":"<루트>","tool_input":{"command":"git checkout package.json"}}`를 넣어 exit 2, `git checkout main`을 넣어 exit 0이 나오는지 본다. 차단 3건과 허용 2건을 적용 완료 조건으로 둔다 |
| 2 | 중간 | `guard-bash.additions.mjs:200-225`(`expandForLoops`), :33-37(끼우는 루프), README:293 | 따옴표로 감싼 인자는 검사를 빠져나간다. `gitSubcommand`(원본 :46)는 공백으로만 나누고 따옴표를 벗기지 않아 `"v3"`가 `KEEP_LOCAL`에 맞지 않는다. 재현(파기 판정 false, 패치본 hook도 exit 0): `git branch -D "v3"`, `git branch -D 'v3'`, `for b in v3 v2; do git branch -D "$b"; done`, `git switch -C "main" HEAD~3`, `git checkout -B "main"`. 셸 변수는 따옴표로 감싸는 것이 관례(ShellCheck SC2086)여서, README:293이 막는다고 적은 for 반복문 브랜치 정리의 가장 흔한 실제 형태가 통과한다. git은 따옴표를 벗겨 실제로 브랜치를 지운다(임시 저장소에서 `git branch -D "q"` 성공 확인) | 끼우는 루프에서 `destructiveReason(p.sub, p.args.map(unq), …)`처럼 값을 벗긴다. `unq`는 `/^(['"])(.*)\1$/` → `$2`, 또는 이 파일 `tokenize`의 `value`를 쓴다. 시험에 차단 4건(`branch -D "v3"`, for + `"$b"`, `switch -C "main" HEAD~3`, `checkout -B 'main'`)과 허용 1건(for `"feat-a"`)을 더하고 README 출력과 건수를 갱신한다 |
| 3 | 중간 | README:77((d) 2 D-03) ↔ `decisions-needed.md` D-03 "바로 시작할 작업", `CLAUDE.draft.md:54` | (d) 2는 `scripts`에 `"test": "vitest run --passWithNoTests"`만 더하라고 한다. "첫 테스트 파일이 생기기 전에도 exit 0"이라고 쓰고 `verify` 포함도 허용한다. 그러나 vitest 설치(`pnpm add -D vitest …`, 의존성 사유를 plan ③에 기재)가 빠졌다. 이 문안만 따르면 `pnpm test`는 `vitest: not found`로 실패하고, `verify`에 넣으면 (d)의 완료 조건 "`pnpm verify` exit 0"을 지킬 수 없다. decisions-needed D-03에는 설치 명령이 있어 두 문서가 어긋난다. 또 D-03으로 `verify`에 test가 들어가면 초안 :54 "`pnpm verify` = typecheck + lint + build (Stop hook과 같은 검사)"가 사실과 달라진다. 초안 교체 때 이 차이를 처리할 조건부 행이 없다(라운드 3 #2와 같은 종류) | (d) 2 첫 줄에 "plan ③에 의존성 사유 → `pnpm add -D vitest @testing-library/react @testing-library/dom jsdom`(decisions-needed D-03과 같음)"을 넣는다. README "D-01 조건부 문안" 옆에 "D-03 조건부" 행을 더한다: `CLAUDE.draft.md:54`, 미도입 시 현재 문구 / `verify`에 test를 넣으면 "typecheck + lint + build + test(Stop hook은 test 제외)" |
| 4 | 낮음 | README:136 마지막 괄호, README:362(#3 처리 "바이트는 수정 전 값"), README:365(#6 "05 동기화 필요") | 05가 같은 커밋(`908b995`)에서 이미 고쳐졌다. 05:162-169는 새 바이트(9,204·1,691·13,366)를 쓰고, 05:92에는 `-z`가 있다. examples의 세 문장은 05가 옛 상태라고 적고 있어 두 문서를 대조하는 사용자를 헷갈리게 한다 | README:136의 "05 P-A9 표는 … 수정 전 바이트 … 기준" 문장을 지우고 "05 P-A9 표와 같은 값"으로 바꾼다. :362와 :365에는 "05 반영 완료(05:162-169, 05:92)"를 덧붙인다 |
| 5 | 낮음 | `05-proposals.md:114`(P-A6 B "`/opt/pw-browsers/chromium` 등 추가") ↔ `scripts/shot.diff.md:40`("환경 고유 심볼릭 링크는 후보에 넣지 않는다") | 제안서와 예시가 반대 방향이다. 예시가 맞다(라운드 1 #14). 05 담당이지만 examples가 구현 기준이므로 표시가 필요하다 | 05 P-A6 B를 "`PLAYWRIGHT_BROWSERS_PATH`(없으면 `~/.cache/ms-playwright`) 아래 `chromium-*/chrome-linux/chrome` 탐색"으로 고친다(05 담당). examples 라운드 4 기록에 "05 동기화 필요"를 적는다 |
| 6 | 낮음 | `dot-claude/skills/report/SKILL.md:12` ↔ `CLAUDE.draft.md:25`, README:85 | 보고 절차는 SPEC의 "완료 조건" 표만 확인하라고 한다. 초안과 (d) 4는 "완료 조건"·"레드팀" 두 표를 채우라고 한다. 레드팀 표 누락을 보고 단계에서 걸러내지 못한다 | :12를 "SPEC의 \"완료 조건\"·\"레드팀\" 표에 기록됐는지 확인한다"로 고친다 |
| 7 | 낮음 | `guard-bash.additions.mjs:156`(RESERVED), 머리 주석 한계 | `case x in x) git reset --hard;; esac`는 `x) git …` 세그먼트가 되어 RUNS_GIT에 걸리지 않아 통과한다(재현 확인). AI가 쓸 일은 드물다 | 한계 목록에 한 줄을 적거나, unwrap 앞에서 `^\S+\)\s+`(case 패턴)를 벗긴다 |

공개 레포 관점: examples 안의 URL은 `code.claude.com` 문서와 루프백 주소뿐이다. 비밀값·이메일·내부 주소는 없다(`git grep`으로 확인). 워킹트리의 미커밋 `.claude/settings.json` 수정과 staged 상태인 `check-done.sh`·`.gitattributes`는 05 4절 D-10에서 다루므로 지적에서 뺀다.

## 승인 조건
- **구체성 3 → 4**: #1을 반영한다. `path` import를 끼우는 지시에 넣고, 끼운 hook에 stdin JSON을 넣어 차단 3건·허용 2건을 확인하는 "적용 완료 조건"을 지금 4에 더한다(가능하면 판정 오류를 fail-closed로). #2를 반영해 따옴표를 벗기고 시험 케이스를 더한다. #3을 반영해 (d) 2에 vitest 설치 단계를 넣는다.
- 일관성 4를 유지하려면 #3의 D-03 조건부 행(초안 :54)과 #4의 낡은 05 서술 3곳을 고친다.
