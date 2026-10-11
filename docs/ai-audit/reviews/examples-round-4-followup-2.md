SCORES: 근거성=4 구체성=4 일관성=4 판단가능성=4

1차 후속 확인(`reviews/examples-round-4-followup.md`)에서 지적한 N1~N5와 라운드 4 #4~#7이 커밋 `e5fdd60`에서 실제로 해소됐는지 실행해서 확인했다. 새 라운드가 아니라 후속 확인 2차다. 스크래치는 `/tmp/r4fu2-2F5r/`에 만들었고, 저장소에서는 이 파일만 새로 만들었다.

실행한 것
- 가드 통합을 머리 주석(`guard-bash.additions.mjs:35-47`)대로 함수 **복사** 방식으로 다시 만들었다. 현재 `.claude/hooks/guard-bash.mjs`의 :1-13 뒤에 `import path from "node:path";`를 넣고, additions :60-353(`export` 제거)을 복사했다. `:38`은 `const segments = expandCommand(withoutBodies);`로 바꿨고, `:86` 다음에 `destructiveReason` 루프를 넣었다. `node --check`를 통과했다. 이름 충돌이나 중복 선언은 없었다.
- 머리 주석 :44-48의 명령 5개를 `sed`로 주석 접두만 떼어 `cmds.sh`로 저장하고, 사본 디렉터리(`.claude/hooks/guard-bash.mjs`, `README.md` 있음)에서 글자 그대로 `bash cmds.sh`로 실행했다.
- 같은 사본에서 `import path` 줄만 지운 판으로 `git checkout main`을 돌렸다.
- `node docs/ai-audit/examples/dot-claude/hooks/guard-bash.additions.mjs`, `cd /home/user/repo && pnpm -s lint`
- `wc -c`/`wc -l`로 바이트와 줄 수를 다시 쟀다. `05-proposals.md` P-A6·P-A9·4절, examples README :125-136·:361-377·:386-414, `skills/report/SKILL.md:12`, `docs/spec/TEMPLATE.md`, `scripts/shot.diff.md`, `/opt/pw-browsers`의 실제 구조를 서로 대조했다.

## 해소 확인

| # | 1차 후속 지적 | 확인 방법과 결과 | 판정 |
|---|---|---|---|
| N1 | 끼운 뒤 확인 명령의 `\\"` 이스케이프 오류, 허용 확인 없음 | :45-46이 `\"`로 고쳐졌고, 허용 2건(:47-48)이 추가됐다. 복사 방식 사본에서 5개 명령을 글자 그대로 실행하니 **2·2·2·0·0**이었다. stderr에는 차례로 `git checkout <경로>는 워킹트리 변경을 버립니다…`, `로컬 'v3' 브랜치를…`, `force push / mirror는…`이 나왔다. `import path`를 뺀 판에서는 `git checkout main`이 ReferenceError로 **exit 1**이 나서, :40-41의 설명("빠뜨리면 … exit 1 → fail-open")도 맞다 | **해소** |
| N2 | 통합 실측이 import 방식 | README :389에 "함수 복사로 끼운 사본은 리뷰 4라운드 후속 확인에서 재현돼 같은 결과"가 추가됐다. 이번에도 복사 방식으로 다시 재현했다(위) | **해소** |
| N3 | 초안 :54 "(Stop hook과 같은 검사)"가 test를 넣으면 거짓이 됨 | README :77 끝이 "typecheck + lint + test + build (Stop hook은 test 제외)"로 바뀌었다 | **해소** |
| N4 | 라운드 4 낮음 4건의 처리 여부 누락 | README :402-414에 "리뷰 반영 기록(라운드 4 후속 확인)" 표가 생겼다. N1~N5와 R4 #4~#7이 모두 행으로 있다 | **해소** |
| N5 | 원본 가드 JSON 파싱 실패 시 fail-open | 머리 주석 :49에 "함께 검토: … exit 2로 바꿀지"가 추가됐다 | **해소**(기록으로 처리, 범위상 적절) |
| R4 #4 | README :136·:362·:365의 05 상태 서술이 낡음 | :136은 "05 P-A9 표도 같은 재측정값(초안 9,204·design 1,691·be 2,471)으로 맞췄다"로 바뀌었다. `05-proposals.md:162-169`와 같고, `wc -c` 실측(CLAUDE.md 10,825, 초안 9,204, design 1,691, be 2,471)과도 같다. :367은 "05도 같은 값으로 갱신됨", :370은 "05 P-A4 B에 `ls-tree -r -z HEAD`로 반영됨"(05:92에 있음)이다. README 안에서 `수정 전`·`9,114`·`1,661`·`05 동기화`를 grep하면 0건이다 | **해소** |
| R4 #5 | 05 P-A6 B가 `/opt/pw-browsers/chromium`을 권함 | `05-proposals.md:115`가 `PLAYWRIGHT_BROWSERS_PATH`(없으면 `~/.cache/ms-playwright`) 아래 `chromium-*/chrome-linux/chrome` 탐색으로 바뀌었고, 환경 고유 링크에 기대지 않는다고 적었다. 이는 `shot.diff.md:11-25`·`:40`과 같다. 실제 `/opt/pw-browsers`에는 `chromium-1194/chrome-linux/chrome`과 `chromium_headless_shell-1194`가 있는데, 정규식 `/^chromium-\d+$/`는 앞의 것만 고르고 링크 `chromium`은 제외한다 | **해소** |
| R4 #6 | report skill :12가 "완료 조건" 표 하나만 확인 | :12가 "SPEC의 \"완료 조건\"·\"레드팀\" 표"로 바뀌었다. `docs/spec/TEMPLATE.md:31`(`## 완료 조건`)·`:38`(`## 레드팀`)과 이름이 맞는다 | **해소** |
| R4 #7 | `case … esac`가 한계에 없음 | 머리 주석 :17에 추가됐다 | **해소** |
| 승인 조건 | additions 시험·lint | `guard-bash.additions.mjs`가 "84건 모두 기대대로"를 내고 exit 0이다. `pnpm -s lint`(`eslint --max-warnings 0`)도 exit 0이다 | **충족** |

## 새 발견

| # | 심각도 | 위치 | 문제 | 수정안 |
|---|---|---|---|---|
| M1 | 낮음 | `guard-bash.additions.mjs:44` 괄호 설명 | "이스케이프가 틀리면 거짓 통과가 된다"는 표현이 모호하다. 실제로는 JSON 파싱이 실패해 hook이 exit 0을 내고, 적용자는 기대값 2와 다른 0을 보게 된다. 확인 단계 입장에서는 거짓 *실패*다(1차 후속 N1이 이렇게 표현했다). hook이 명령을 "통과시킨다"는 뜻으로 읽으면 틀린 말은 아니지만, 한 문서 안에서 관점이 섞여 있다. 정확성이나 실행 가능성에는 영향이 없다 | "이스케이프가 틀리면 hook이 파싱에 실패해 0을 내므로, 바르게 끼운 hook도 실패처럼 보인다"로 적는다 |

중간 이상 새 문제는 없다. 확인한 범위에서 examples README의 05 관련 서술은 다음과 같이 맞는다. :39 "05 4절 '지금 당장'과 같은 목록"은 05:324-333의 1~5와 같다(6 P-D1은 별도 `feat:`). :125·:131-134 바이트는 05 P-A9 표와 같다. :367·:370·:412도 05의 현재 값과 일치한다.

## 판정

**승인.** 1차 후속 확인의 승인 조건(N1 이스케이프와 허용 2건, 라운드 4 #4·#6 반영, #5·#7·N3 반영 또는 보류 기록)이 모두 충족됐다. N1은 머리 주석이 시키는 방식(함수 복사)으로 끼운 사본에서 명령 5개를 글자 그대로 실행해 2·2·2·0·0을 확인했다. `path` import를 빠뜨렸을 때의 fail-open 설명도 실행으로 맞았다.

점수는 다음과 같다.
- 구체성 4: 끼운 뒤 확인 단계를 그대로 실행할 수 있게 됐다.
- 일관성 4: README·05·shot.diff·report skill·SPEC 템플릿 사이의 남은 모순이 없어졌다.
- 근거성 4, 판단가능성 4: 유지한다.

남은 것은 낮음 1건(M1, 문구)이며 승인을 막지 않는다.
