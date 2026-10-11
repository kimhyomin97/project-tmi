---
name: report
description: feature 구현과 레드팀 검사가 끝난 뒤 커밋 확인 전에 완료 보고를 만든다. 완료 보고, 증거 보고, 커밋 전 보고를 쓸 때 사용한다.
---

# 완료 보고 절차

현재 CLAUDE.md의 "완료 보고는 증거로"(5요소)를 절차로 옮긴 것이다. 출력은 아래 순서를 지킨다.

0. plan에 L1~L3이 있었으면 **첫 줄**에 그 결정을 1문장으로 다시 설명한다.
1. 직접 실행한 `pnpm verify` 출력(성공해도 붙인다 — Stop hook은 성공 시 아무것도 출력하지 않는다).
2. 완료 조건별 `통과/실패`와 증거: `pnpm shot <경로>` 출력 줄, `.shots/` 파일명, 레드팀 판정. 같은 내용이 SPEC의 "완료 조건"·"레드팀" 표에 기록됐는지 확인한다.
3. 3줄 요약.
4. plan 대비 `git diff --stat`. plan과 다르면 이유를 먼저 쓴다.
5. 재측정(출력 그대로). 두 번째 줄은 *D-04가 B(queryOptions 묶음)로 결정됐을 때의 문안*이다. A면 현재 `CLAUDE.md:18`의 명령을 그대로 쓴다:
   ```bash
   git grep --untracked -l '"use client"' -- src ':!src/components/ui' || echo '(use client 없음)'
   git grep --untracked -n -E 'queryKey|queryOptions' -- 'src/features/*/queries.ts' || echo '(queryKey 없음)'
   ```
6. 커밋 메시지 초안(`Learn:` trailer 포함)과 "커밋할까요?" 확인 요청.
7. 마지막 줄: "`/learn`으로 이번 결정을 점검할 수 있습니다."

<!-- 리뷰 반영 기록(라운드 1): #7 queryOptions 재측정 명령을 D-04 조건부로 표시. -->
