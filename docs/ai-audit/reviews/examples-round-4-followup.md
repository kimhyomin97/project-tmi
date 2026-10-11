SCORES: 근거성=4 구체성=3 일관성=3 판단가능성=4

라운드 4(`reviews/examples-round-4.md`) 지적이 커밋 `179c5e9`에서 실제로 해소됐는지 실행해서 확인했다. 새 라운드가 아니라 후속 확인이다. 스크래치는 `/tmp/r4fu-yk7z/`에 만들었고, 저장소 파일은 이 리뷰 파일 말고는 바꾸지 않았다.

실행한 것
- `node docs/ai-audit/examples/dot-claude/hooks/guard-bash.additions.mjs`: 결과는 "84건 모두 기대대로", exit 0이다. README:205-287 출력과 같고, 따옴표 케이스 5건(:7-11행)이 새로 들어갔다.
- 가드 통합을 직접 재현했다. 현재 `.claude/hooks/guard-bash.mjs`를 복사하고 머리 주석(additions :30-46)을 **글자 그대로** 따랐다. 즉 함수는 import하지 않고 복사했고(`export` 제거), `import path`를 추가했고, `:38` 줄을 바꿨고, `:86` 다음에 루프를 넣었다. `node --check`는 통과했다. 그다음 머리 주석의 "끼운 뒤 확인(필수)" 명령 3개를 그대로 실행하고, `JSON.stringify`로 만든 입력 12개도 넣었다.
- `pnpm -s exec eslint --max-warnings 0 docs/ai-audit/examples`: exit 0이다.
- `node_modules/next/dist/docs/01-app/02-guides/testing/vitest.md` "Manual Setup"(:31-40)과 config(:62-74)를 examples README (d) 2(:77), `decisions-needed.md:76`·`:78`, `05-proposals.md:268`·`:271`과 대조했다.

## 라운드 4 지적 해소 확인

| # | 심각도 | 라운드 4 지적 | 확인 방법과 결과 | 판정 |
|---|---|---|---|---|
| 1 | 중간 | 끼우는 지시에 `path` import가 빠져 `git checkout <인자 1개>`에서 ReferenceError가 나고 exit 1(fail-open)이 된다. 끼운 뒤 확인하는 단계도 없다 | additions :39-40에 `import path from "node:path";` 추가 지시와 빠뜨렸을 때의 결과가 적혔다. 지시대로 만든 패치본에서 `git checkout package.json`은 2, `git checkout main`은 0, `git status`는 0이다. ReferenceError는 나지 않는다. 다만 :41-44의 **필수 확인 명령 3개 중 2개가 깨져 있다**(새 발견 N1). fail-closed(try/catch → exit 2)는 반영하지 않았고, 이는 "권한" 수준 제안이었다. 리뷰가 요구한 허용 2건 확인도 빠지고 차단 3건만 있다 | **부분 해소**. 결함 자체는 고쳐졌지만 확인 단계를 그대로 실행할 수 없다 |
| 2 | 중간 | 따옴표로 감싼 인자(`"v3"`, `"$b"`, `"main"`)가 검사를 빠져나간다 | `destructiveReason` :305가 감싼 따옴표를 벗긴다. 패치본 hook 결과: `git branch -D "v3"` 2, `for b in v3 v2; do git branch -D "$b"; done` 2, `git switch -C "main" HEAD~3` 2, `git checkout -B 'main'` 2, `for b in feat-a; do git branch -D "$b"; done` 0. 시험에 5건이 추가됐다 | **해소** |
| 3 | 중간 | (d) 2의 D-03 문안에 vitest 설치 단계가 없다. 초안 :54 조건부도 없다 | README:77, `decisions-needed.md:78`, `05-proposals.md:271`의 설치 명령이 같다. 세 곳 모두 `pnpm add -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom vite-tsconfig-paths`이고, 가이드 :37(pnpm·TypeScript)과 글자 단위로 일치한다. `vitest.config.mts`의 `tsconfigPaths()`·`react()`·`environment: 'jsdom'`도 가이드 :66-73과 같다. 초안 :54 조건도 README:77 끝에 추가됐다. 단 문안이 "typecheck + lint + test + build"뿐이고, 같은 줄의 "(Stop hook과 같은 검사)"를 어떻게 할지는 말하지 않는다(N3) | **해소**(잔여 낮음 N3) |
| 4 | 낮음 | README:136·:362·:365의 05 상태 서술이 낡았다 | 그대로다. :136은 아직 "05 P-A9 표는 라운드 3 수정 전 바이트(초안 9,114·design 1,661) 기준"이라고 쓰지만, `05-proposals.md:162-169`는 9,204·1,691·13,366이다. :362 "(바이트는 수정 전 값)"과 :365 "05 동기화 필요 표시"도 남아 있다 | **미해소**. 반영 기록(README:379-385)에 행 자체가 없다 |
| 5 | 낮음 | 05 P-A6 B가 `/opt/pw-browsers/chromium` 추가를 권해 `shot.diff.md:40`과 반대다 | `05-proposals.md:115`가 그대로다. examples 라운드 4 기록에도 "05 동기화 필요" 표시가 없다 | **미해소** |
| 6 | 낮음 | `skills/report/SKILL.md:12`가 "완료 조건" 표 하나만 확인한다 | :12가 그대로다("SPEC의 \"완료 조건\" 표에 기록됐는지 확인한다"). 초안 :25와 README:85는 두 표를 말한다 | **미해소** |
| 7 | 낮음 | `case x in x) git reset --hard;; esac`가 통과하는데 한계에 적혀 있지 않다 | 패치본 hook에서 exit 0으로 재현된다. additions 머리 주석의 한계 목록에도 없다(`grep case\|esac` 결과 없음) | **미해소** |

## 새 발견

| # | 심각도 | 위치 | 문제 | 재현 | 수정안 |
|---|---|---|---|---|---|
| N1 | 중간 | `guard-bash.additions.mjs:42-43`(끼운 뒤 확인 명령 2·3), 같은 내용인 README:398-399 표의 근거 | 필수 확인 명령이 작은따옴표 안에 `\\"`를 쓴다. 셸은 이것을 그대로 넘기므로 JSON은 `"git branch -D \\"v3\\""`가 된다. 즉 `\\`(백슬래시 하나) 다음의 `"`에서 문자열이 끝나서 JSON 파싱 오류가 난다. 원본 가드는 파싱 오류에서 `process.exit(0)`(`guard-bash.mjs:21-22`)으로 끝난다. 그래서 **올바르게 끼운 hook에서도** 명령 2·3이 exit 0을 낸다. 주석은 "모두 2여야 한다"고 하므로, 적용자는 바른 패치를 실패로 판단하거나 원인을 엉뚱한 데서 찾게 된다. 라운드 4 승인 조건이었던 "끼운 뒤 확인"을 글자 그대로는 수행할 수 없다. 거짓 통과가 아니라 거짓 실패라 안전성 문제는 아니고, 실행 가능성 문제다 | 패치본 `/tmp/r4fu-yk7z/guard-bash.mjs`: 명령 1 → 2, 명령 2 → **0**, 명령 3 → **0**. 보낸 JSON을 출력하면 `{"tool_input":{"command":"git branch -D \\"v3\\""}}`이다. `\"`로 고쳐 보내면 각각 2·2가 나온다 | `\\"`를 `\"`로 고친다(작은따옴표 안에서는 셸 이스케이프가 없다). 또는 `node -e 'process.stdout.write(JSON.stringify({tool_input:{command:process.argv[1]},cwd:process.cwd()}))' 'git branch -D "v3"' \| node .claude/hooks/guard-bash.mjs; echo $?`처럼 JSON을 만들어 넘기는 형태로 바꾼다. 허용 2건(`git checkout main` → 0, `git status` → 0)도 함께 적는다. path import를 빠뜨렸는지는 `git checkout main`(exit 1이면 누락)에서 가장 잘 드러난다 |
| N2 | 낮음 | README:389("함수는 복사 대신 이 예시 파일에서 import") | "가드 통합 실측"은 실제 적용 방법(함수 복사)이 아니라 import로 돌렸다. 그래서 라운드 4 #1의 원인인 "복사본에 import가 빠짐"은 이 실측으로 검증되지 않는다. 이번에 복사 방식으로 재현해 보니 이름 충돌이나 문법 오류는 없었고 결과도 같았다(위 #1·#2). 결론은 맞지만 측정 방법과 주장 범위가 어긋난다 | 위 "실행한 것" 2번째 항목 | README:389에 "복사 방식은 리뷰 4라운드 후속에서 재현"이라고 적거나, 복사 방식으로 다시 측정한다 |
| N3 | 낮음 | README:77 끝(초안 :54 조건) | `verify`에 test를 넣으면 초안 :54를 "typecheck + lint + test + build"로 바꾸라고만 한다. 그런데 같은 줄의 "(Stop hook과 같은 검사)"는 거짓이 된다. Stop hook은 typecheck·lint·build만 돈다(`.claude/hooks/stop-check.mjs:3`, `:103-105`) | 파일 대조 | "typecheck + lint + test + build (Stop hook은 test 제외)"로 적는다(라운드 4 #3 수정안 문구) |
| N4 | 낮음 | README:379-385(라운드 4 반영 기록) | 라운드 4 지적 7건 중 #1-#3만 기록됐고 낮음 4건(#4-#7)은 처리 여부가 없다. 리뷰가 붙인 "일관성 4 유지 조건"(#4 반영)에 대한 응답도 없다 | 대조 | 4건을 반영하거나, 행을 만들어 "보류(사유)"라고 적는다 |
| N5 | 낮음 | `.claude/hooks/guard-bash.mjs:19-23`(원본, examples 범위 밖) | stdin JSON 파싱 실패 시 exit 0이다(fail-open). N1이 거짓 실패로 드러난 것도 이 때문이다. 실제 Claude Code 입력은 정상 JSON이라 실제 위험은 낮다 | N1 재현 | P-A5 적용 때 끼우는 루프와 함께 fail-closed(try/catch → exit 2)를 검토한다는 한 줄을 머리 주석에 둔다(라운드 4 #1의 권장 사항) |

공개 레포 관점: 이번 변경분(`git show 179c5e9 -- docs/ai-audit/examples`)에는 비밀값·내부 주소·이메일이 없다. examples 안의 `.mjs`는 lint exit 0이다.

## 판정

**보류(승인 전 수정 1건).** 라운드 4 중간 3건 가운데 #2(따옴표)와 #3(D-03 설치 목록)은 실행으로 해소를 확인했다. #3은 decisions-needed·05와도 맞고, Next 설치본 가이드와 글자 단위로 같다. #1도 결함 자체(`path` import)는 지시에 들어갔고, 복사 방식으로 끼운 hook에서 ReferenceError 없이 차단·허용이 맞게 나온다.

남은 문제는 다음과 같다.
- **구체성 3 유지**: 라운드 4 승인 조건의 핵심이던 "끼운 뒤 확인(필수)" 명령 3개 중 2개가 JSON 이스케이프 오류(N1)로 바른 패치에서도 exit 0을 낸다. 문자 두 개(`\\"` → `\"`)만 고치면 되고, 허용 2건을 더하면 4가 된다.
- **일관성 3**: 라운드 4가 "일관성 4 유지 조건"으로 지정한 #4(README:136·:362·:365가 05의 현재 값과 모순)가 고쳐지지 않았다. #5·#6도 그대로다. 반영 기록에는 이 넷의 처리 여부가 없다(N4). 각각은 낮음이지만, 이미 지적된 문서 간 모순이 기록 없이 남았다.
- 근거성 4와 판단가능성 4는 유지한다. 시험 84건, 통합 실측 6건, D-03 출처 인용이 모두 재현되고, 단계별 적용 지시도 분명하다.

승인 조건: N1을 고친다(확인 명령 이스케이프와 허용 2건). 라운드 4 #4·#6을 반영하고, #5·#7과 N3은 반영하거나 반영 기록에 "보류(사유)"로 남긴다.
