SCORES: 근거성=4 구체성=4 일관성=3 판단가능성=4

## 총평
라운드 2 지적 10건 중 7건은 실제로 반영됐다. guard 시험 62건과 ESLint README 명령 5종은 그대로 재현됐고, 직접 연 인용 24건도 모두 맞았다. `red-team.md`는 이제 완전한 파일이고, `diff`로 확인하면 추가 4줄·변경 1줄이다.
남은 문제는 세 가지다. ① #5(P-C5 시점)는 05와 examples가 같은 커밋에서 서로 반대 방향으로 고쳐져 여전히 어긋난다. ② #9의 `rules/design.md:11` 반영 주장은 사실이 아니다. ③ 초안(`CLAUDE.draft.md:94`)과 rule은 "지금"·(d) 단계에서 넣은 문구보다 짧다. 그래서 첫 기능 뒤 초안으로 교체하면 이미 넣은 규칙이 사라진다.
guard는 셸 예약어 뒤의 git(`for …; do git branch -D $b; done`, `if …; then git push -f; fi`)을 놓친다. 이 프로젝트는 AI가 브랜치 정리까지 하므로(`CLAUDE.md:85`) 실제로 나올 수 있는 형태다.

## 점수 근거
- **근거성 4**: 파일:줄 인용 24건과 외부 URL 2건(memory "Files in subdirectories load on demand.", hooks 공통 입력 `cwd`)이 모두 실제와 같다. 감점 요인은 두 가지다. README:280(라운드 2 #9 반영 기록)은 `rules/design.md:11`에 "`+`로 이어 붙인 조립"을 넣었다고 하지만 실제 :11에는 없다. README:102의 "절감이 실제로 남는 것은 … BE 연동만 하는 턴"은 `wc -c`로 다시 계산하면 틀렸다(아래 #3).
- **구체성 4**: ESLint 규칙, lint-file, stop-check 패치, red-team 완전본, 줄 번호가 붙은 "적용 단계" 문안은 그대로 실행할 수 있다. 다만 "지금 (a)"로 바로 넣을 guard에 예약어(`do`/`then`/`{`/`!`) 구멍이 있다. 짧은 옵션 묶음(`switch -qC main`)도 빠져 있어 보강이 필요하다.
- **일관성 3**: P-C5 시점이 05(:32, :270, 4절 표 #4 "첫 기능 뒤 정리")와 examples(README:26·:96, eslint/README:6·:129 "여유 있을 때")에서 다르다. 초안 :94와 README "지금 4" 문안도 다르다. `rules/design.md:11`과 (d) 6의 `:75` 문안이 다르고, 05 P-A4 B(`ls-tree -r HEAD`, `-z` 없음)와 stop-check.diff.md(`-z`)도 다르다.
- **판단가능성 4**: 적용 단계 3묶음, 대조표, D-04 조건부 표가 있어 결정할 단위가 분명하다. 다만 P-A9의 정량 결론이 데이터 기능 턴에서는 반대 방향이다(상시 로드 +22%). 사용자가 이 결론을 믿고 판단하면 잘못된 근거로 결정하게 된다.

## 확인한 인용
| 인용 위치 | 문서 주장 | 실제 | 일치/불일치 |
|---|---|---|---|
| guard-bash.additions.mjs:6, :25-26, :35 → `guard-bash.mjs:31`, `:38-39`, `:44-54`, `:60`, `:65` | RUNS_GIT, split 대체 위치, gitSubcommand, FORCE_FLAG, push 판정 | 31 RUNS_GIT, 38 `split(/[;&|\r\n]+/)`, 39 filter, 44-54 gitSubcommand, 60 FORCE_FLAG, 65 force 판정. 원본 비교 시험 `ok` | 일치 |
| guard-bash.additions.mjs:27 "`:86` 다음(push 검사 뒤, commit 검사 앞)" | 끼울 위치 | 85 push 루프 끝, 87 `wantsCommitOrMerge`, 88 commit/merge가 없으면 exit 0. 86에 넣으면 88보다 먼저 실행된다 | 일치 |
| guard-bash.additions.mjs:17, :19, README:231 → `.claude/settings.json:18`, `:21` | `git branch *`·`git switch *` allow | 18 `"Bash(git branch *)"`, 21 `"Bash(git switch *)"` | 일치 |
| guard-bash.additions.mjs:20-21 hooks 문서 `cwd` | PreToolUse 공통 입력에 cwd가 있다 | https://code.claude.com/docs/en/hooks 공통 입력 표 "`cwd` Current working directory when the hook is invoked", "`cd` … `cwd` reflects the current directory" | 일치 |
| README:163-227 시험 출력 62건 | 모두 기대대로 | `node …guard-bash.additions.mjs` 결과와 한 줄씩 같다. 62건 ok, exit 0 | 일치 |
| README:7 memory 문서 인용 | "Files in subdirectories load on demand." | memory 문서 64줄에 같은 문장 있음 | 일치 |
| README:21 "현재 `.claude/agents/red-team.md`와 diff → 추가 4줄·변경 1줄, :43 판정 기준, :42 발견 형식" | 완전한 파일 | `diff`로 `3a4`, `15a17`, `18a21`, `30c33`, `41a45`. 예시 :42·:43이 원문 38·39와 같다 | 일치 |
| red-team.md:17 `shot 실패:`·`경고: 포트` | shot exit 2 메시지 | `scripts/shot.mjs:313` `shot 실패:`, `:324` `경고: 포트`, :314·:325 `exitCode = 2` | 일치 |
| README:37-97("적용 단계") 현재 `CLAUDE.md` 줄 번호(:6, :7, :14, :18, :22, :36, :57, :75, :77, :87, :96, :100) | 각 줄 내용 | 열어 보니 모두 해당 문장이다. `:87` 인용 문구도 원문과 같다 | 일치 |
| README:55 `package.json:5-14`, `:12` | scripts, verify | 5 `"scripts"`, 12 `"verify"`, 14 `}` | 일치 |
| README:76 `docs/design-system.md:21` 다음, "## 의미 → 색" 앞 | 삽입 위치 | 21 "lint로 못 막는 것", 23 `## 의미 → 색` | 일치 |
| README:73, eslint/README:120-125 `eslint.config.mjs:114`, `:245`, `:249` | noRawDesignValues, 플러그인 등록, 규칙 줄 | 114 `const noRawDesignValues`, 245 tmi 플러그인 rules, 249 `"tmi/no-raw-design-values": "error"` | 일치 |
| README:240, stop-check.diff.md:9 `eslint.config.mjs:324-332` | globalIgnores에 docs 없음 | 324-332에 `.next`·`out`·`build`·`next-env`·`src/components/ui`만 있다 | 일치 |
| README:82(P-D2-A 표) `src/components/page-header.tsx:16` | `text-2xl font-bold tracking-tight` | 16줄 동일 | 일치 |
| README:92 `src/components/sidebar-collapse.tsx:35` | aria-expanded 주석 | 35줄 동일 | 일치 |
| README:241 `tsconfig.json:27-28` | `**/*.ts`, `**/*.tsx` include | 동일 | 일치 |
| eslint/README:39-45 | 10:21, 11:24 차단, exit 1 | 17줄 샘플을 잘라 다시 실행하니 같은 출력, exit 1. 현재 설정에서는 exit 0 | 일치 |
| eslint/README:75-77, :95-99, :110-112 | 변수 조립·`+` 조립 미검출, `src` 거짓 양성 0 | 셋 모두 exit 0. `+` 샘플은 현재 설정에서도 exit 0 | 일치 |
| eslint/README:51-58 no-restricted-paths | components → app 1:22, features → app 2:15 | stdin으로 다시 실행해 같은 줄·열·메시지 확인 | 일치 |
| eslint/README:66 `no-dynamic-class.mjs:21-28` | inClassContext | 파일 21-28줄이 inClassContext | 일치 |
| status-badge.md:9-10, :37, :86 `page.tsx:25`, `nav-link.tsx:54-56`, `:1`, `badge.tsx:39`, Next 문서 `:176`, `cn` 실측 | 배지 2종, `"use client"`, `cn(badgeVariants…)`, 번들 규칙, `"p-4 text-lg"` | 모두 동일. `node -e` 다시 실행해도 `"p-4 text-lg"` | 일치 |
| docs/learning/log.md:8-9 `nav-link.tsx:3`, `app-sidebar.tsx:7-8`, `sidebar-store.ts:1-3`, `mobile-nav.tsx:3` | L1·L3 근거 | 각 줄 주석이 주장과 같다 | 일치 |
| api-error-and-retry.md:8, :30, :59, :63, :119 `client.ts:34-36`, `providers.tsx:11-16`, `retryer.ts:170-177`·`:49-50`, `client.ts:40`, `:12` | throw, retry:1, 함수 분기·1000ms, res.json, RequestInit | 모두 동일(설치본 query-core 5.101.4) | 일치 |
| shot.diff.md:5, :40 `shot.mjs:85-97`, `:19`·`:21`·`:22` | findChrome, fs·os·path import | 85 `function findChrome`, 19 fs, 21 os, 22 path | 일치 |
| README:280 라운드 2 #9 "`rules/design.md:11`에도 '`+`로 이어 붙인 조립' 포함" | 반영 완료 | `rules/design.md:11`은 "조립 결과를 변수에 먼저 담으면 lint가 못 잡으므로"뿐이고 `+`가 없다 | **불일치** |
| README:102 "절감이 실제로 남는 것은 문서·설정·BE 연동만 하는 턴" | BE 연동 턴도 절감 | `wc -c`: 9,114 + be-integration 2,471 = 11,585 > 10,825(+7%). tsx와 api.ts를 함께 건드리는 데이터 기능 턴은 9,114 + 1,661 + 2,471 = 13,246(+22%) | **불일치** |

## 라운드 2 지적 반영 확인
| # | 확인 결과 |
|---|---|
| 1 | 반영. 완전한 파일이고, 판정 기준·발견 형식·공격 6항목이 그대로 있다. 이름 규칙(README:8-9)에 완전한 파일과 병합 예시를 나눠 적었다 |
| 2 | 반영. `switch -C main`, `--force-create=main`, `checkout -B main`, `branch -m main`, `branch -M x main`이 차단된다. 단 짧은 옵션 묶음 `git switch -qC main HEAD~3`·`-Cq main`은 통과한다(아래 #4) |
| 3 | 반영. "적용 단계" 3묶음에 줄 번호와 문구가 있다. 단 첫 기능 뒤 완성본(초안·rule)이 이 문구를 담지 않아 퇴행한다(아래 #2) |
| 4 | 반영. `input.cwd` 기준으로 바뀌었고, `cd … &&`는 한계로 적혀 있다. `timeout`·`xargs`도 처리한다 |
| 5 | **반영 안 됨(어긋남이 뒤집혔다).** 같은 커밋 `02748e7`에서 05는 P-C5를 "여유 있을 때"에서 "첫 기능 뒤 정리"로 바꿨다(:32, :270, 4절 #4). examples는 반대로 "여유 있을 때"로 바꿨다(아래 #1) |
| 6 | 반영(`lint-file.mjs:7-8`) |
| 7 | 반영. F11 참조가 사라졌다 |
| 8 | 반영. `ls-tree -r -z` 사용. 단 05 P-A4 B는 여전히 `ls-tree -r HEAD`라고 적혀 있다(아래 #6) |
| 9 | **일부 반영.** eslint/README 한계 절과 (d) 6 문안에는 들어갔다. `rules/design.md:11`에는 반영 기록의 주장과 달리 없다(아래 #2) |
| 10 | 반영. rule을 "본문 참조"로 줄였다. 단 새로 쓴 정량 결론이 틀렸다(아래 #3) |

## 지적 사항
| # | 심각도 | 위치 | 문제 | 구체적 수정안 |
|---|---|---|---|---|
| 1 | 중간 | `examples/README.md:26`(목록 표 "P-C5 여유 있을 때"), `:96`("P-C5·P-C6(여유 있을 때)"), `eslint/README.md:6`, `:126`, `:129` ↔ `05-proposals.md:32`, `:33`, `:270`, 4절 "첫 기능 뒤 정리" 표 #4 | 라운드 2 #5가 반대 방향으로 고쳐졌다. 05는 P-C5·P-C6을 "첫 기능 뒤 정리"(동결 종료 후)로 옮겼고, examples는 "여유 있을 때"로 맞췄다. 사용자가 두 문서를 함께 읽으면 P-C5를 언제 넣는지 알 수 없다. README:96은 "첫 기능 뒤 정리" 제목 아래에 "(여유 있을 때)"라고 적어 같은 문서 안에서도 어긋난다 | 05가 기준이다(제안서가 시점을 정한다). README:26·:96과 eslint/README:6·:126·:129를 "첫 기능 뒤 정리"로 고친다. README:276 라운드 2 #5 처리 기록도 "05 최종안(첫 기능 뒤 정리)에 맞춤"으로 정정한다 |
| 2 | 중간 | `claude-md/CLAUDE.draft.md:94` ↔ `README.md:44`(지금 4 문안). `dot-claude/rules/design.md:11` ↔ `README.md:75`((d) 6 `:75` 문안)과 `README.md:280` 반영 기록. `CLAUDE.draft.md:100` ↔ `README.md:51-54`(D-01 B 문안) | 초안과 rule은 "첫 기능 뒤 정리"에서 현재 `CLAUDE.md`를 **교체**한다(README:92). 그런데 그 전 단계에서 넣은 문구보다 짧아 이미 넣은 규칙이 사라진다. ① 지금 4는 `:87`에 "로컬 main·아카이브 브랜치를 지우거나 옮기지 않는다(가드가 차단한다)"를 넣는다. 초안 :94에는 이 구절이 없고, 이미 적용된 P-A5를 두고 "(P-A5 적용 후 가드가 차단한다)"고 적혀 있다. ② (d) 6은 `:75`에 "`+`로 이어 붙인 조립은 lint가 못 잡으므로"를 넣는다. 이 문장의 행선지인 `rules/design.md:11`에는 `+`가 없다. 반영 기록(README:280)은 넣었다고 주장한다. ③ D-01 B 문안(`:96` 다음 인증 줄, `:100` 축약)이 초안에 조건부로도 없다. D-01을 결정한 뒤 초안으로 교체하면 "인증 미정"으로 되돌아간다. D-04처럼 조건부 표가 필요하다 | 초안 :94를 지금 4 문구로 바꾼다("로컬 main·아카이브 브랜치를 지우거나 옮기지 않는다(가드가 차단한다)"). `rules/design.md:11`에 "변수에 먼저 담거나 `+`로 이어 붙인 조립"을 넣는다. README "D-04 조건부 문안" 옆에 "D-01 조건부" 행을 더한다(`CLAUDE.draft.md:100` B 문안 / A·C 문안). 대조표 :87·:75·:98-100 행 비고에 "(d)/지금 문안과 동일" 확인 열을 둔다 |
| 3 | 중간 | `examples/README.md:102`(대조표 결론 문단) | "절감이 실제로 남는 것은 문서·설정·BE 연동만 하는 턴"은 틀렸다. `wc -c`로 계산하면 BE 연동 턴은 9,114 + 2,471 = 11,585바이트로 현재(10,825)보다 7% **늘어난다**. 이 프로젝트의 주 작업인 데이터 기능 턴(tsx + `features/*/api.ts`)은 9,114 + 1,661 + 2,471 = 13,246바이트로 **22% 늘어난다**. 실제로 줄어드는 턴은 rule 경로 밖의 문서·설정 작업뿐이다. P-A9(작업량 M)의 판단 근거로 쓰는 문단이라 결론 방향이 중요하다 | 표로 바꾼다: 턴 종류(문서·설정 / 화면만 / BE만 / 데이터 기능) × 상시 로드 바이트(9,114 / 10,775 / 11,585 / 13,246) × 현재 대비(−16% / −0.5% / +7% / +22%). 결론은 "컨텍스트 크기로는 이득이 없거나 손해이고, 근거는 문장 정리·사실 정정·보고 절차 분리뿐"으로 고친다. 그러면 05 P-A9 장점 칸의 "필요한 규칙만 필요한 때 로드"도 손봐야 하는지 05 담당에 넘긴다 |
| 4 | 중간 | `dot-claude/hooks/guard-bash.additions.mjs:152-189`(`unwrap`), `:5-14` 머리 주석, `README.md:236` 한계 | 셸 예약어 뒤의 git을 펼치지 않는다. scratch에서 export 함수로 재현한 결과(파기 판정 null): `for b in v3 v2; do git branch -D $b; done`, `for b in x; do git push -f origin main; done`, `if true; then git push -f; fi`, `{ git reset --hard; }`, `! git reset --hard`. 세그먼트가 `do `·`then `·`{ `·`! `로 시작해 RUNS_GIT에 걸리지 않는다. AI가 브랜치 정리를 맡고(`CLAUDE.md:85`), 여러 브랜치를 반복문으로 지우는 형태가 흔하므로 실제로 나올 수 있다. 머리 주석은 "처리 불가 한계"로 동적 명령 이름만 적었다. 한 가지 더: `git switch -qC main HEAD~3`·`git switch -Cq main`(짧은 옵션 묶음)도 통과한다. `optValues`가 `-C`를 정확히 일치로만 찾기 때문이다. 같은 파일의 `hasShort`가 다른 플래그에서는 묶음을 처리하는 것과 맞지 않는다 | `unwrap` 루프 앞에서 예약어 토큰 `do`·`then`·`else`·`elif`·`{`·`!`·`time`(이미 있음)을 건너뛴다(`while` 루프에 `/^(do|then|else|elif|\{|!)$/` 검사 1줄). `switch`/`checkout`은 `-[a-zA-Z]*C` / `-[a-zA-Z]*B` 묶음의 다음 토큰도 대상으로 본다. 시험에 차단 4건(`for…do git branch -D v3`, `if…then git push -f`, `{ git reset --hard; }`, `switch -qC main HEAD~3`)과 허용 1건(`for b in a; do git status; done`)을 더하고 README 출력과 건수를 갱신한다 |
| 5 | 낮음 | `guard-bash.additions.mjs` 한계 목록, `README.md:236` | 로컬 main 포인터를 옮기는 다른 경로가 한계에 없다. `git fetch . +HEAD~3:main`, `git update-ref refs/heads/main HEAD~3`는 모두 null이다. AI가 쓸 가능성은 낮지만 "로컬 보호 브랜치 이동 차단"이라는 주장의 범위를 넘어서는 형태다 | 한계 줄에 두 형태를 적는다(막지 않는 이유: 쓰임이 드물고, D-09 원격 보호와 reflog로 복구 가능) |
| 6 | 낮음 | `05-proposals.md` P-A4 B 칸 "`ls-tree -r HEAD` 목록에서 … JS로 거른다" ↔ `stop-check.diff.md:32` | 라운드 2 #8 반영으로 예시는 `ls-tree -r -z HEAD`가 됐지만 05 본문은 옛 명령 그대로다 | 05 P-A4 B에 `-z`(비ASCII 경로 따옴표 회피)를 적는다(05 담당). examples 반영 기록에 "05 동기화 필요"를 표시한다 |
| 7 | 낮음 | `README.md:62-63`((d) 4 `:22` 추가 문안 "완료 조건·레드팀 표") ↔ `CLAUDE.draft.md:25`(작업 루프 5 "'완료 조건' 표") | 기록 대상 표가 (d) 문안에는 두 개, 초안에는 하나로 적혀 있다. TEMPLATE에는 두 표가 모두 있다(:31, :38) | 초안 :25를 "SPEC의 '완료 조건'·'레드팀' 표"로 맞춘다 |
| 8 | 낮음(취향) | `docs/design-system.md:19-21`과 (d) 6 | (d) 6은 `CLAUDE.md:75`만 고치고, 디자인 문서의 "lint가 막는 것/못 막는 것" 목록은 그대로 둔다. 조립 클래스(템플릿) 차단과 변수·`+` 조립 미검출이 문서 목록에 없어서, 디자인 문서를 먼저 읽으라는 규칙(:74)을 따르는 AI는 이 내용을 보지 못한다 | (d) 6에 `docs/design-system.md:19`(막는 것에 "className·cn() 안 템플릿 조립"), `:21`(못 막는 것에 "변수·`+` 조립") 추가 문안 1줄씩을 더한다 |

공개 레포 관점: 비밀값·개인정보·내부 URL은 없다(`git grep`으로 URL은 공식 문서와 루프백 주소만 확인). 워킹트리에 커밋되지 않은 `.claude/settings.json` 수정과 `.claude/hooks/check-done.sh`·`.gitattributes`(staged)가 있다. 이것들은 점검 하네스 부산물이고 05 4절 "점검 종료 시" D-10으로 이미 다루고 있으므로 이 산출물의 지적에서는 뺀다.

## 승인 조건
- **일관성 3 → 4**: #1을 반영해 P-C5·P-C6 시점을 05의 "첫 기능 뒤 정리"로 통일한다. #2를 반영해 초안 :94·`rules/design.md:11`을 "지금"·(d) 문안과 같게 하고, D-01 조건부 행을 더하고, README:280 반영 기록을 사실에 맞춘다.
- 근거성·판단가능성 4를 유지하려면 #3의 정량 결론을 턴 종류별 표로 고친다. 지금 문장은 데이터 기능 턴에서 반대 방향이다.
- 구체성 4를 유지하려면 #4를 반영한다. "지금 (a)"로 바로 넣는 guard이므로 예약어 뒤 git과 `-qC` 묶음을 처리하고 시험 케이스를 더한다.
