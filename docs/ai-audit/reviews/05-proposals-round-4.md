SCORES: 근거성=5 구체성=4 일관성=4 판단가능성=4

## 총평 (3줄 이내)
라운드 3 지적 8건은 05·decisions·examples 안에서 모두 반영됐다. 이 세 문서는 '지금' 커밋의 변경 줄, (d) 순서, P-A1 시점, D-03 문안을 같은 문장으로 쓴다. 인용 34개를 직접 열어 봤고 모두 일치했다.
남은 문제는 두 가지다. 첫째, 고친 내용이 05 밖으로 다 퍼지지 않았다. `README.md:19`(사용자가 가장 먼저 읽는 문서)와 `02-design-system.md:152`에는 라운드 3 이전 내용이 남아 있다. 둘째, 실행 단계 두 곳이 그대로는 동작하지 않는다. D-03 설치 목록은 Next 공식 가이드보다 패키지가 적고, D-09는 `--dry-run`으로 확인하겠다고 하는데 이 방법으로는 확인되지 않는다.
높음 등급은 없다. 아래 중간 4건은 PR 전에 고쳐야 한다.

## 점수 근거 (기준별 2~3줄)
- **근거성 5**: `CLAUDE.md`의 20여 개 줄을 확인했다. `stop-check.mjs:55`, `settings.json:18/21`, 현행·예시 `red-team.md` 줄(현행 :3/:15/:18/:30/:41, 예시 :4/:17/:21/:33/:45), `client.ts:24/34-36/40`, `providers.tsx:14`, `next.config.ts:6-7/12-14`, `package.json:12/20`, `eslint.config.mjs:114/175/188/245/249/261`, `button.tsx:3`, `globals.css:72/115/163`, `design-system.md:19/21/40/44`, `docs/spec/README.md:3`, `proxy.md:15`, `stop-check.diff.md:11`, `check-done.sh:6-8`, `TASK.md:24/158/159`도 확인했다. 커밋 수치(CLAUDE.md 변경 11줄, feat+fix 7개, Learn 4줄/3커밋)와 `wc -c` 비율(85.0/100.6/107.9/123.5%)도 재현했다. 모두 일치한다.
- **구체성 4**: '지금'과 (d)는 파일·줄·문구·순서가 정해져 있다. 다만 D-03의 `pnpm add -D` 목록은 Next 16 공식 Vitest 가이드보다 2개 적고, 필수 설정 파일(`vitest.config.mts`)도 빠졌다(#3). D-09의 확인 방법(`git push --dry-run`)으로는 브랜치 보호가 걸렸는지 알 수 없다(#4).
- **일관성 4**: 05·decisions 대조표 10행, 05 4절과 examples '적용 단계', 01 AI-05, 03 CS-07, 02 7절 DS-09 대응은 모두 서로 맞는다. 그러나 `README.md:19`는 P-A1을 (d)에 넣고 "첫 기능 plan과 한 규칙 커밋으로 넣고 바로 기능을 만든다"고 쓴다. 라운드 3 #4·#5 이전 상태다. `02-design-system.md:152`는 아직 "P-A7 정정 표에 편입 … 이 컴포넌트 자체는 고치지 않는다"이다(#1·#2). 05 자체에는 모순이 없어서 4점을 줬다. 다만 위 두 곳이 남아 있으면 사용자가 읽는 순서상 잘못된 지시를 먼저 보게 된다.
- **판단 가능성 4**: 단계마다 예외 근거 열이 있고, '지금' 커밋에서 바뀌는 `CLAUDE.md` 줄이 모두 나열돼 있다("이 밖의 줄이 보이면 plan과 다른 것"). 그래서 BE 개발자도 `git diff`만 보고 승인할 수 있다. (d)에는 같은 장치가 없지만, ① 규칙 변경 제안 단계가 이 역할을 대신한다(#6, 낮음).

## 확인한 인용 (표: 인용 위치 | 문서 주장 | 실제 | 일치/불일치)
| 인용 위치 | 문서 주장 | 실제 | 일치/불일치 |
|---|---|---|---|
| 05:44 / D-08:60 | feat+fix 7개 중 trailer 있는 커밋 3개, Learn 4줄, `a30b614`·`b325363`에 L5 없음 | feat/fix 7개, Learn 줄 86e86bf 2·a30b614 1(L1)·3309ac0 1(L2), b325363 0 | 일치 |
| 05:57 / D-02:34 | CLAUDE.md 변경 10개(2b9967c~dc74e11, 09-28~10-04), 측정 명령 11줄 | `git log --oneline 86e86bf -- CLAUDE.md` 11줄, 날짜 일치 | 일치 |
| 05:7·68·337 `CLAUDE.md:7`, `:13`, `:14` | 규칙 변경 절차, plan 필수 항목, "화면 2개 이상" | 각 행 원문 | 일치 |
| 05:87 `stop-check.mjs:55` | `git("rev-parse HEAD")` | `const head = git("rev-parse HEAD").trim();` | 일치 |
| 05:92 `stop-check.diff.md:11` | `ls-tree -z` 필요 근거 | 11행 원문(비ASCII 경로 따옴표) | 일치 |
| 05:100 `settings.json:18`, `:21` | `Bash(git branch *)`, `Bash(git switch *)` | 18·21행 | 일치 |
| 05:126-132 P-A7 표 | `CLAUDE.md:20/45/60/62/66`, `design-system.md:40`, `eslint.config.mjs:175/188`, 제목 `CLAUDE.md:42` | 각 행 원문 일치 | 일치 |
| 05:138-148 / README:59-64 | 현행 `red-team.md:3`·`:30`, 예시 `:4/:17/:21/:33/:45`의 단계 주석 | 현행 3행 "코드는 고치지 않고", 30행 "저장소를 수정하지 않는다". 예시 각 줄 끝 `적용:` 주석이 표와 같음. 파일 41/45줄 | 일치 |
| examples README:67·77·88 | 삽입 위치 현행 `red-team.md:15`·`:18`·`:41` 다음 | 15 shot 줄, 18 동작 조건 판정 불가, 41 정리 확인(마지막 줄) | 일치 |
| 05:160 `sidebar-collapse.tsx:35` | 주석 원문 | 35행 원문 그대로 | 일치 |
| 05:162-169 크기 표 | 10,825 / 9,204 / 1,691 / 2,471B, 85.0/100.6/107.9/123.5% | `wc -c` 동일, 비율 재계산 동일 | 일치 |
| 05:173 초안 줄 수 | 초안·현행 모두 100줄 | `wc -l` 100/100 | 일치 |
| 05:177·183 `CLAUDE.md:85-89` | Git 규칙 원문 | 85~89행 | 일치 |
| 05:193·196 `page.tsx:25`, `nav-link.tsx:54`, `:1` | outline / secondary / `"use client"` | 각 행 | 일치 |
| 05:206 `layout.tsx:9-10`, `not-found.tsx:11`, `global-error.tsx:19-20`, `console-menu.ts:22-34` | 컨테이너 3곳, 제목 중복, 34줄 | 각 행, 34줄 | 일치 |
| 05:220 `button.tsx:6`, `globals.css:163` | `focus-visible:border-ring`, `outline-ring/50` | 일치 | 일치 |
| 05:233 / D-06 `layout.tsx:22-23`, `globals.css:72-115` | 다크 고정, 라이트 값 | 22 주석·23 `dark`, 72 `:root {`·115 `}` | 일치 |
| 05:243 `proxy.md:15` | "Proxy executes before routes are rendered…authentication" | 15행 원문 | 일치 |
| 05:245 `(console)/error.tsx:27` | `error.message` 노출 | 27행 | 일치 |
| 05:251-253 `client.ts:24/34-36/40`, `providers.tsx:14`, `design-system.md:44` | fetch, 404도 ApiError, `res.json()`, `retry: 1`, 404→빈 상태 | 각 행 | 일치 |
| 05:271 / D-03:78 `package.json:12` | `verify` = check && build | 12행 | 일치 |
| 05:297-303 `package.json:20`, `button.tsx:3`, `eslint.config.mjs:261`, `components.json:17` | `cn` 패키지, utils 예외, 별칭 | 각 행 | 일치 |
| 05:309 `next.config.ts:6-7` | 빌드 시점 고정, localhost 기본값 | 일치 | 일치 |
| examples README:91 `eslint.config.mjs:114/245/249` | `noRawDesignValues`, 플러그인 등록, 규칙 on | 각 행 | 일치 |
| examples README:94-95 `design-system.md:19`, `:21` | "lint가 막는 것"/"못 막는 것" | 각 행 | 일치 |
| examples README:102 `page-header.tsx:16` | `text-2xl font-bold tracking-tight` | 16행 | 일치 |
| D-10:94 `check-done.sh:6-8`, `TASK.md:158` | `/tmp` 전역 카운터, 15회 후 통과 / 완료 기준 | 6~8행, 158행 | 일치 |
| D-05:83 `TASK.md:24`, `:159` | 질문 금지 / 단계 커밋·push·PR | 24·159행 | 일치 |
| 02:180 DS-09 대응 | (05 R3 #1 처리 주장) P-A9로 고침 | 180행 P-A9(첫 기능 뒤 정리) | 일치 |
| 01:186 AI-05, 03:190 CS-07 | (05 R3 #7) 첫 기능 뒤 정리로 통일 | 두 행 모두 "첫 기능 뒤 정리" | 일치 |
| D-03:78 설치 명령 | `vitest @testing-library/react @testing-library/dom jsdom` (P-C3 "3~4개") | Next 공식 `01-app/02-guides/testing/vitest.md:37` = `vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom vite-tsconfig-paths`, `:63` `vitest.config.mts` 생성 | **불일치**(#3) |

## 지적 사항 (표: # | 심각도(높음/중간/낮음) | 위치(문서 절·줄) | 문제 | 구체적 수정안)
| # | 심각도 | 위치 | 문제 | 구체적 수정안 |
|---|---|---|---|---|
| 1 | 중간 | `README.md:17-19`("가장 먼저 할 일 3개") | **라운드 3 #4·#5가 README에는 반영되지 않았다.** README:19는 "D-04·D-03·P-A3·**P-A1**·**P-C2**를 **첫 기능 plan과 한 규칙 커밋으로** 넣고 바로 기능을 만든다"고 쓴다. 05 4절·D-02:48·examples README:71과 세 군데서 어긋난다. ① P-A1은 첫 기능 뒤로 옮겨졌다. ② P-C2는 제품 코드라 규칙 커밋에 들어가지 않는다. ③ 정한 순서는 "규칙 변경 제안 → chore → 새 세션 SPEC → `/clear` 후 plan"이다. README:18에는 '지금' 묶음의 동결 조항(4절 #1)과 P-D1도 빠져 있다. README는 읽는 순서 1번이다. 그래서 사용자는 결정 문서보다 이 잘못된 순서를 먼저 본다. README 표에 "(작성 중)"이라고 적혀 있지만 PR 본문에도 들어갈 요약이다 | README:18을 "동결 조항(D-02) + P-A7·P-A8·P-A5·P-A6 = chore 1개, P-D1 = feat 1개, 사용자 D-09"로 고친다. README:19는 "D-01·D-03·D-04 결정 → (d) 규칙 변경 제안 → chore 1개(D-01·D-03·D-04 반영, P-A3, P-D3, P-D2-A) → 새 세션 SPEC → `/clear` 후 plan·구현(P-C2는 이 기능 커밋에 포함)"으로 바꾸고 P-A1은 지운다. 05 4절의 문장을 그대로 옮긴다 |
| 2 | 중간 | `02-design-system.md:152`(5.3 aria 항목) | **라운드 3 #1이 02의 7절 표에만 반영됐다.** 같은 문서 본문 152행에는 아직 "조치: `docs/design-system.md` 'shadcn 함정' 절에 1줄 추가(**P-A7 정정 표에 편입**). **이 컴포넌트 자체는 고치지 않는다**"가 남아 있다. 이 문장은 02:180(P-A9, `aria-expanded` 복원 여부를 같은 커밋에서 판단)과도, 05 P-A9(05:160)와도 반대다. 152행만 읽은 AI는 '지금'(b) 커밋에 DS-09를 넣고 컴포넌트는 그대로 둔다. 05 R3 #1의 처리 칸("메인 세션이 이미 고쳤다")도 부분적으로만 사실이다 | 02:152의 "조치" 문장을 02:180과 같게 바꾼다: "P-A9(첫 기능 뒤 정리) — `.claude/rules/design.md`에 문장 추가, `sidebar-collapse.tsx:35` `aria-expanded` 복원 여부를 같은 커밋에서 판단". 05 R3 #1 처리 칸에 "02 7절·5.3절"이라고 위치를 적는다 |
| 3 | 중간 | P-C3 05:268·271, 4절 (d) #2 05:342, D-03:76·78, examples README:77 | **D-03 설치 목록과 작업 범위가 공식 가이드보다 작다.** Next 16 설치본 가이드(`node_modules/next/dist/docs/01-app/02-guides/testing/vitest.md:37`)의 pnpm 명령은 `vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom vite-tsconfig-paths`(6개)이고, `:63`에서 `vitest.config.mts`를 만들라고 한다. D-03은 4개만 설치하고 설정 파일은 언급하지 않는다. 이 프로젝트는 `@/` 경로 별칭(`tsconfig.json` `paths`)을 쓰므로 `vite-tsconfig-paths`나 alias 설정이 없으면 첫 컴포넌트 테스트에서 import가 실패한다. `--passWithNoTests` 덕에 (d) 커밋 직후 `verify`는 green이다. 그래서 이 결함은 첫 테스트를 쓸 때(첫 기능 도중) 드러나고, 그때 설정 파일과 의존성을 추가하면 plan 범위를 넘는다. 사용자도 "devDependency 3~4개"(05:268)를 보고 승인하게 된다 | D-03 설치 명령을 공식 가이드 줄로 바꾸고 근거로 `vitest.md:37`·`:63`을 적는다. "새 파일 `vitest.config.mts`(environment `jsdom`, `react()`, `tsconfigPaths()`)"를 (d) #2와 examples README (d) 2에 추가한다. 05:268 "3~4개"는 "5~6개 + 설정 파일 1개"로 고친다. 완료 조건에 "(d) 커밋에 `@/` import를 쓰는 견본 테스트 1개를 넣고 `pnpm test` exit 0"을 넣거나, 그 확인을 첫 기능 plan의 완료 조건으로 넘긴다고 명시한다 |
| 4 | 중간 | D-09 "바로 시작할 작업" decisions:56 | **확인 방법이 작동하지 않는다.** `git push --dry-run`은 원격에 ref 갱신을 보내지 않는다. 그래서 서버 쪽 브랜치 보호(force push·삭제 거부)가 판정되는 단계까지 가지 않고, 보호가 없어도 같은 결과가 나온다. "등으로 확인"을 따라 AI가 실제 force push를 시도하면 그 자체가 지키려던 파괴 행위다. 사용자는 이 단계를 보고 설정이 검증됐다고 믿게 된다 | 읽기 전용 조회로 바꾼다. `gh api repos/<owner>/<repo>/branches/main/protection`(classic) 또는 `gh api repos/<owner>/<repo>/rules/branches/main`(rulesets)의 출력에서 `allow_force_pushes`/`allow_deletions` false, 또는 `non_fast_forward`·`deletion` 규칙이 있는지 본다. "실제 force push로 시험하지 않는다"는 문장도 넣는다. 05 P-A5 C에 완료 조건으로 같은 줄을 붙인다 |
| 5 | 낮음 | 05 리뷰 반영 기록(라운드 3) 05:418-420 | 418행의 크기 수치(문서·설정 9,204B **84.2%**, 화면 **10,775B 99.5%**, BE 11,585B 107.0%, 데이터 13,246B 122.4%)는 본문 표(05:166-169, 85.0/10,895/11,675/13,366)와 다르다. 420행에서 갱신했다고 적었지만, 418·420행 사이 빈 줄(419) 때문에 표가 끊겨 420행은 표 밖의 일반 텍스트로 렌더링된다 | 418행 수치를 "(라운드 3 후 재측정 값으로 갱신, 아래 행)"으로 표시하거나 현재 값으로 바꾼다. 419행 빈 줄을 지운다 |
| 6 | 낮음 | 4절 (d) 05:337-346 | '지금' 절(05:333)에는 "바뀌는 `CLAUDE.md` 줄은 … 전부다"라는 대조 장치가 있는데 (d)에는 없다. examples (d)는 `CLAUDE.md:14`·`:18`·`:22` 다음·`:57`·`:75`·`:77`·`:96` 다음·`:100`, `design-system.md:19`·`:21`과 새 절, `docs/spec/README.md:3`, `docs/spec/TEMPLATE.md`(새 파일)를 바꾼다. 05 표만 보면 `:22`·`:75`·`:77`·`:96`과 새 파일이 보이지 않는다 | (d) 표 아래에 05:333과 같은 형식으로 한 줄을 넣는다: "이 커밋에서 바뀌는 `CLAUDE.md` 줄: :14, :18, :22 다음, :57, :75, :77, (D-01 B 시) :96 다음·:100. 그 밖의 파일: `docs/design-system.md:19`·`:21`·역할 표 절, `docs/spec/README.md:3`, 새 `docs/spec/TEMPLATE.md`, `eslint.config.mjs`, `package.json`, `.claude/agents/red-team.md`" |
| 7 | 낮음 | P-A6 05:118, P-A8 표 05:146 | shot exit 2 줄을 (c)로 둔 근거("P-A6과 같은 범주")는 DS-09를 뺄 때 쓴 기준("새 규칙이므로 (b) 아님")과 같은 기준으로 판정되지 않았다. 판정 문구 자체는 새 규칙이고, `CLAUDE.md:21`에 exit 1/2 구분이 이미 있으므로 red-team이 이 문구 없이 '검증을 못 하는' 상황이 구체적으로 무엇인지 적혀 있지 않다 | 근거를 한 문장으로 구체화한다. 예: "shot 도구 오류를 red-team이 `실패`로 판정하면 `수정 필요` 루프가 3바퀴 돌아 막힘 리포트로 끝나므로 검증 자체가 막힌다(c)". 이 문장을 쓸 수 없으면 첫 기능 뒤 정리로 옮긴다 |
| 8 | 낮음 | `02-design-system.md:183` 각주, 05 P-A7 표 | 02 각주는 `globals.css:126` 대비 주석(7.83 → 7.79) 정정을 "P-A7 후보"라고 하는데, 05 P-A7 정정 표에는 그 행이 없다. '지금' 커밋 대조 장치(05:333 "이 밖의 줄이 보이면 plan과 다른 것")와 연결되지 않은 후보로 남는다 | 05 P-A7 표에 `globals.css:126` 행을 추가하고 '지금' 변경 파일 목록에도 넣는다. 또는 02 각주를 "첫 기능 뒤 정리(backlog)"로 바꾼다 |

(취향 지적: 없음. 공개 레포 점검: 05·decisions에 비밀값·내부 URL·개인정보 없음. `localhost:8080`·`127.0.0.1:9`는 코드에서 인용한 값이고, 브랜치명은 무해하다.)

### 라운드 3 지적 반영 확인
| R3 # | 반영 여부 | 확인 |
|---|---|---|
| 1 02 DS-09 대응 | **부분 반영** | 02:180 표는 P-A9로 고쳐졌고 05 R2 #2 위치 칸에 02 7절이 추가됐다. 02:152 본문은 미수정(#2) |
| 2 P-A8 '지금' 범위 | 반영 | 05:141-150 표 = examples README:55-64 = 예시 파일 줄 끝 주석 = D-02:37·47. shot exit 2 줄을 (c)로 둔 판단은 근거 보강 필요(#7, 낮음) |
| 3 '지금' 커밋 변경 줄 | 반영 | 05:326-333 = D-02:43-47 = examples README:39-50. 동결 조항이 같은 커밋 안의 문단이라는 점, `:87`, backlog 파일을 만들지 않는다는 점 명시 |
| 4 P-A1 (d) 기준 | 반영(05·decisions·examples) | 0절·P-A1·P-A2·4절·D-08·대조표가 모두 '첫 기능 뒤 정리 첫 항목'. README:19는 미반영(#1) |
| 5 (d) 순서 순환 | 반영(05·decisions·examples) | ①~④ 문장이 세 문서에서 같다. README:19는 미반영(#1) |
| 6 `--passWithNoTests` | 반영 | 05:271·342, D-03:78-79, examples README:77. 다만 의존성·설정 파일 누락은 새로 발견(#3) |
| 7 01·03·examples 시점 | 반영 | 01:186, 03:190, examples README 목록 표 모두 '첫 기능 뒤 정리' |
| 8 R1 #5 표시 | 반영 | 05:380 끝에 "(라운드 2에서 DS-09는 P-A9로 이동, R2 #2)" |

## 승인 조건 (4점 미만 항목을 4점으로 올리려면 무엇이 필요한가)
- 4점 미만 항목은 없다. 다만 마지막 라운드이므로 4점을 유지하려면 PR 전에 아래를 고쳐야 한다.
- **일관성 4 유지**: #1(README:18-19를 05 4절 문장과 같게)과 #2(02:152를 02:180과 같게)를 고친다. 둘 다 라운드 3에서 고친 내용이 다른 문서로 퍼지지 않은 것이다. 고치지 않으면 읽는 순서 1번 문서와 근거 문서가 05와 반대로 지시하므로 3점에 해당한다.
- **구체성 4 유지**: #3(D-03 설치 목록·`vitest.config.mts`를 공식 가이드 기준으로)과 #4(D-09 확인을 `gh api` 읽기 전용 조회로)를 고친다. 둘 다 문서대로 실행하면 잘못된 결과가 나오는 단계다.
- 낮음 #5~#8은 선택이지만 #6은 '지금' 절과 같은 대조 장치를 (d)에도 주는 것이라 판단 가능성 5점의 조건이다.
