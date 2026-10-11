# 결정이 필요한 사항

점검 지시서 규칙("질문하지 않는다. 판단이 필요한 사항은 선택지·장단점·추천을 적고 진행한다")에 따라, 점검 중 AI가 대신 정하지 않은 것을 모았다. **중요도 순**. 각 항목의 근거는 링크된 문서에 있다.
ID(D-xx)는 다른 문서에서 참조하므로 순서와 번호가 다르다. 추천과 시점은 `05-proposals.md`의 해당 제안과 같다(대조 결과는 문서 끝 표). 시점 표기는 05 P-A2의 동결 단계를 따른다: "지금" = 동결 예외 (a)(b)(c), "다음 기능 전(d)" = 첫 데이터 기능 착수 묶음, "첫 기능 뒤 정리"·"여유 있을 때" = 첫 데이터 기능 커밋 뒤.

| 순위 | ID | 결정 | 추천 | 마감 |
|---|---|---|---|---|
| 1 | D-01 | 인증 방식 | 리버스 프록시 인증으로 시작 | 결정·규칙 반영: 다음 기능 전(d) / 구현: **VM 공개 배포 전** |
| 2 | D-02 | 하네스 동결 | 채택(2단계: 지금 a/b/c, 착수 때 d 묶음) | 지금 |
| 3 | D-09 | GitHub main 브랜치 보호 | 설정 | 지금(사용자 5분) |
| 4 | D-08 | 학습 확인 방식 | `/learn` skill | 첫 기능 뒤 정리(첫 항목, 첫 기능 커밋 직후) |
| 5 | D-04 | queryKey 방식 | feature당 `queryOptions` 묶음 | 다음 기능 전(d) |
| 6 | D-03 | 테스트 도입 | Vitest + Testing Library | 다음 기능 전(d) |
| 7 | D-05 | 자율 작업 예외 조항 | 추가(표준 문구) | 첫 기능 뒤 정리(그 전 자율 작업은 지시서 우선) |
| 8 | D-10 | 점검 작업 부산물 처분 | `check-done.sh`·hook 등록 제거, `.gitattributes` 유지 가능 | 점검 종료 시(PR 머지 전) |
| 9 | D-07 | 404를 셸 안에 넣을지 | B. `PageContainer`로 폭·여백만 통일 | 여유 있을 때 |
| 10 | D-06 | 라이트 토큰 | 삭제 | 여유 있을 때 |

---

## 1. D-01 인증 방식 — 배포 전 필수

- 왜: 인증 없이 `next.config.ts:12-14` rewrites가 `/api/v1/*` 전체를 core로 중계한다. VM을 공개하면 core API(토스 자산 데이터 예정)가 인터넷에 그대로 열린다(`03-code-structure.md` CS-01). CLAUDE.md도 "임의로 정하지 말고 물을 것"(`CLAUDE.md:98-100`)으로 둔 항목이다.
- 선택지(`05-proposals.md` P-C1):
  - A. BE 인증(Spring Security) — 정석, 작업 큼(L), FE 로그인 화면 필요
  - B. VM 리버스 프록시(nginx/Caddy) Basic 인증 또는 IP 제한 — 코드 변경 0, 1인 콘솔에 충분(S)
  - C. Next 16 `proxy.ts` Basic 인증 — FE 저장소 안에서 해결, 비밀번호 환경변수 관리 필요(S~M)
- **추천: B로 시작**, 다른 사람이 쓰게 되면 A.
- 함께 처리할 것(배포 전): `src/app/(console)/error.tsx:27`의 `error.message` 원문 노출(CS-09)을 일반 문구로 교체, `CORE_API_URL` 누락 시 배포 빌드 실패 가드(P-C7, CS-12).
- 결정하면 바로 시작할 작업: (B) 배포 문서에 프록시 설정 절차 추가 + CLAUDE.md "미정"(`CLAUDE.md:98-100`)에서 인증 항목을 "VM 프록시 Basic 인증(결정일)"으로 교체. 이 교체는 첫 데이터 기능 착수 묶음 (d)의 규칙 커밋에 넣는다(05 P-A2). (C) plan: `src/proxy.ts`, `src/lib/env.server.ts`(`server-only` 설치), `.env.example`에 변수 추가.

## 2. D-02 하네스 동결

- 왜: 스캐폴딩(`e09f7c6`, 2026-08-16) 이후 CLAUDE.md를 바꾼 커밋 10개(`2b9967c`~`dc74e11`)가 모두 2026-09-28~10-04, 7일 안에 몰려 있다. 같은 7일 동안 feat는 4개(`3309ac0`, `ca977c0`, `a30b614`, `c9e4bcb`), 그 뒤 `86e86bf`(10-05). BE를 호출하는 데이터 기능은 전체 기간 0개다(`01-ai-setup.md` AI-02, 측정: `git log --oneline 86e86bf -- CLAUDE.md`). 규칙이 실제 기능으로 시험받기 전에 계속 늘고 있다.
- 선택지(P-A2): A. 현행(계속 개선) / B. 2단계 동결 + `docs/harness-backlog.md`에 아이디어 적기 / C. 지금 대규모 슬림화
- **추천: B.** '하네스 동결'은 두 단계다.
  1. 지금: 예외 기준 (a) 되돌릴 수 없는 피해 방지(P-A5 + 사용자 D-09), (b) 사실과 다르거나 서로 모순되는 지시의 정정(P-A7 — `CLAUDE.md:45`의 AGENTS 우선순위 명시는 모순 해소라 (b)에 포함, P-A8 — red-team frontmatter `disallowedTools` 1줄과 `red-team.md:30` 문장만), (c) 작업 환경에서 검증 자체를 막는 문제(P-A6 + red-team의 `pnpm shot` exit 2 = `판정 불가(도구 오류)` 줄)만 반영하고 커밋한다. 동결을 선언하는 문단(`CLAUDE.md:7` 다음)은 D-02 채택의 직접 반영이라 (a)(b)(c)와 별도로 같은 커밋에 넣는다.
  2. 첫 데이터 기능 착수 시: (d) '첫 데이터 기능에 직접 필요한 결정의 반영' — D-01(B 선택 시 "미정" 교체), D-03(테스트 도입 시 `package.json`·`verify`), D-04(`CLAUDE.md:57`·`:18`), P-A3(SPEC 상시화, `CLAUDE.md:14` + `docs/spec/README.md:3`), P-D3(조립 클래스 lint), P-D2-A(역할 표) — 를 **한 번의 규칙 커밋**으로 묶어 넣는다. red-team 예시의 `test` 판정 줄은 D-03과, "SPEC 기록용 한 줄"은 P-A3과 함께 이 커밋에 든다. 그 뒤 첫 데이터 기능이 커밋될 때까지는 (a)(b)(c)만 허용한다.
  3. 첫 기능 뒤 정리: 첫 항목 P-A1(`/learn` skill, D-08 — 첫 기능 커밋 직후), 이어서 P-A9(DS-09 규칙 포함), P-A4-B·C, P-A10(D-05), P-C5, P-C6 등. P-D2-C·D-07, P-D4, P-D5(D-06)는 여유 있을 때.
  
  P-A4-B(Stop hook 지문 축소)와 P-A1(`/learn`, 기능 완료 뒤 사람이 호출하는 도구)은 첫 기능 구현에 필요하지 않아 (a)~(d) 어디에도 들지 않으므로 첫 기능 뒤로 미룬다. P-D1(`StatusBadge`)과 P-C2는 제품 코드라 동결 대상이 아니다.
- 바로 시작할 작업(`05-proposals.md` 4절과 같은 순서):
  1. **지금 당장 (a)(b)(c)**: P-A7·P-A8·P-A5·P-A6 + 동결 조항 + P-D1 묶음 plan 작성 → 승인 → 규칙 변경 `chore:` 커밋 1개(그 뒤 새 세션) + `feat:`/`fix:` 커밋(P-D1), 사용자는 D-09 설정. 동결 선언은 이 chore 커밋 안의 문단 추가이고 별도 행위가 아니다. 이 커밋에서 바뀌는 줄:
     - `CLAUDE.md:7` 다음 동결 조항 추가 — D-02 채택의 직접 반영(동결 자체를 선언하는 문단이라 a/b/c와 별도로 허용)
     - `CLAUDE.md:87` 문구 변경 — P-A5, (a)
     - `CLAUDE.md:20`·`:45`·`:60`·`:62`·`:66` 정정, `docs/design-system.md:40`, `eslint.config.mjs:175`·`:188` — P-A7, (b)
     - `.claude/agents/red-team.md` frontmatter `disallowedTools` 1줄·`:30` 문장(P-A8, (b))과 `pnpm shot` exit 2 줄(P-A6과 함께, (c)), `.claude/hooks/guard-bash.mjs`(P-A5), `scripts/shot.mjs`(P-A6)
  2. **다음 기능 개발 전 = 첫 데이터 기능 착수 묶음 (d)**: 사용자가 D-01·D-03·D-04 결정 → ① (d) 규칙 변경 제안 — `CLAUDE.md:7` 형식(바꿀 줄·문구·이유)으로, 첫 기능 이름과 범위만 명시 → ② 승인 후 단독 chore 커밋((d) 항목: D-01 "미정" 교체, D-03 `package.json`·`verify`·red-team test 판정 줄, D-04 `CLAUDE.md:57`·`:18`, P-A3·red-team SPEC 기록 줄, P-D3, P-D2-A) → ③ 새 세션에서 첫 기능 SPEC 인터뷰(`docs/spec/<feature>.md`) → ④ `/clear` 후 SPEC을 읽고 기능 plan(`CLAUDE.md:13` 항목)·구현(P-C2 포함). 첫 기능 커밋까지는 (a)(b)(c)만.
  3. **첫 기능 뒤 정리·여유 있을 때**: 첫 항목 P-A1(D-08 `/learn`, 첫 기능 커밋 직후), 이어서 backlog와 05 4절 마지막 표(P-A9, P-A4-B·C, P-A10, P-C5, P-C6, 이후 P-D2-C·D-07, P-D4, P-D5) 순으로.

## 3. D-09 GitHub main 브랜치 보호

- 왜: 문자열 가드는 래핑 명령으로 우회된다(실측 5종, AI-04). 되돌릴 수 없는 force push·main 삭제는 원격 설정으로 막는 것이 확실하다(`04-research.md` 1.5). 가드의 main·아카이브 삭제 차단은 원격(`push --delete`, `:ref`)에만 해당한다.
- 선택지: A. 가드만 / B. GitHub 저장소 설정에서 main 브랜치 보호(force push·삭제 금지)
- **추천: B.** 이 점검 환경에는 원격 저장소가 연결돼 있지 않아 AI가 할 수 없다. 사용자가 저장소 Settings → Branches(또는 Rules)에서 직접 설정한다. 로컬 파괴 명령(`git switch -f`/`--discard-changes`, `git branch -D`)은 원격 보호로 막히지 않으므로 가드 보강(P-A5-B)이 따로 필요하다.
- 바로 시작할 작업: 설정 후 AI가 **읽기 전용 조회**로 확인한다: `gh api repos/<owner>/<repo>/branches/main/protection`(브랜치 보호) 또는 `gh api repos/<owner>/<repo>/rules/branches/main`(Rulesets). `git push --dry-run`은 서버 규칙을 검사하지 않아 판정 수단이 아니며, 실제 force push로 시험하지 않는다. 확인 뒤 가드 보강(P-A5-B)을 함께 커밋(동결 예외 (a)).

## 4. D-08 학습 확인 방식

- 왜: 프로젝트 목표는 사람의 FE 판단 체득인데, 이를 확인하는 장치가 없다(AI-01). 학습 기록은 AI가 쓴 trailer 4줄(feat+fix 7개 중 3개 커밋)이고, 에러 경계 결정을 한 `a30b614`·`b325363`에는 `Learn: L5` trailer가 없다.
- 선택지(P-A1): A. 현행 / B. `/learn` skill(사람이 호출, 질문 먼저·답 나중, `docs/learning/log.md`에 기록) / C. plan마다 사람이 먼저 예측
- **추천: B.** 마찰이 작고 기록이 남는다. C는 원할 때 `/learn` 안에서.
- 시점: 첫 기능 커밋 직후(첫 기능 뒤 정리 묶음의 첫 항목). `/learn`은 기능 완료 뒤 사람이 호출하는 도구라 첫 기능 구현에 필요하지 않으므로 (d) 묶음에 넣지 않는다(05 P-A1·P-A2).
- 바로 시작할 작업(첫 데이터 기능 커밋 직후의 규칙 커밋): `examples/dot-claude/skills/learn/SKILL.md` → `.claude/skills/learn/SKILL.md`, `examples/docs/learning/log.md` → `docs/learning/log.md`(예시 줄 삭제), 첫 시험은 첫 데이터 기능 커밋을 대상으로 `/learn` 실행.

## 5. D-04 queryKey 방식

- 왜: 현재 규칙은 리터럴 배열(`CLAUDE.md:57`). L4(무효화 누락)를 구조로 막으려면 첫 데이터 기능 전에 정해야 한다. 바꾸면 완료 보고 재측정 grep(`CLAUDE.md:18`)도 바뀐다.
- 선택지(P-C4): A. 리터럴 유지(학습자가 키를 매번 직접 봄) / B. feature당 `queryOptions` 묶음(TkDodo·TanStack 권장, `04-research.md` 3.2). B는 `queryFn({ signal })`로 취소 신호 전달 관례도 함께 생긴다(CS-11).
- **추천: B.**
- 바로 시작할 작업: CLAUDE.md `:57`, `:18` 수정(첫 데이터 기능 착수 묶음 (d)의 규칙 커밋에 포함). `:18` 대체 명령: `git grep --untracked -n -E 'queryKey|queryOptions' -- 'src/features/*/queries.ts' || echo '(queryKey 없음)'`. 예시(`examples/claude-md/CLAUDE.draft.md`, `examples/dot-claude/rules/`, `examples/dot-claude/skills/report/SKILL.md`, `examples/docs/spec/TEMPLATE.md`)의 queryOptions 문안은 **D-04가 B로 결정됐을 때의 문안**이다. A로 결정하면 그 부분은 현행 리터럴 규칙으로 되돌린다.

## 6. D-03 테스트 도입

- 왜: 테스트 0(CS-02). 완료 조건의 "테스트" 선택지(`CLAUDE.md:13`)를 실제로 쓸 수 없고, red-team은 동작 조건을 "판정 불가"로 둔다(`.claude/agents/red-team.md:18`, AI-11).
- 선택지(P-C3): A. 현행 / B. Vitest + Testing Library(devDependency 6개 + `vitest.config.mts`, 승인 필요) / C. B + Playwright E2E
- **추천: B를 첫 데이터 기능과 함께.** 첫 대상: `errorMessage`·`retry` 함수(P-C2), 데이터 컴포넌트 3상태.
- 바로 시작할 작업: plan에 의존성 추가 사유 기재 → `pnpm add -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom vite-tsconfig-paths`(6개, Next 설치본 가이드 `node_modules/next/dist/docs/01-app/02-guides/testing/vitest.md` "Manual Setup"의 TypeScript 목록) + 루트 `vitest.config.mts`(같은 가이드의 `react()`·`tsconfigPaths()` 플러그인, `environment: 'jsdom'` — `@/` 경로 import가 테스트에서 풀리려면 `vite-tsconfig-paths`가 필요)(버전은 설치 시 확인) → `package.json` `scripts`에 `"test": "vitest run --passWithNoTests"`(첫 테스트가 생기기 전에도 exit 0) 추가, `verify`(`package.json:12`)에 포함할지 함께 결정. `--passWithNoTests` 덕분에 `verify`에 `test`를 넣는 것도 (d) 커밋에서 해도 된다. `package.json`·`verify` 변경과 red-team 예시의 `test` 판정 줄은 첫 데이터 기능 착수 묶음 (d)의 규칙 커밋에 넣는다.
- 완료 조건: (d) 커밋 직후 `pnpm verify` exit 0(적용 시 실측).

## 7. D-05 자율 작업 예외 조항

- 왜: 현재 규칙 "**`main`에서 직접 작업·커밋·push한다.** 브랜치는 사용자가 요청할 때만 만든다."(`CLAUDE.md:85`), "**커밋 전에는 반드시 사용자 확인을 받는다**"(`CLAUDE.md:86`)와 이번 점검 지시서(`TASK.md:24` 질문 금지, `:159` 단계별 커밋·작업 브랜치 push·PR)가 충돌한다(AI-13). **이번 점검은 사용자가 "지시서를 그대로 수행"하라고 명시했으므로 지시서를 따라 작업 브랜치 `ai-audit/fe-audit`에서 단계별로 커밋했다.**
- 선택지(P-A10): A. 현행(자율 작업 때마다 충돌) / B. 예외 조항 1줄 추가
- 표준 문구(`05-proposals.md` P-A10, `01-ai-setup.md` AI-13, CLAUDE 초안과 동일):
  > 사용자가 작업 지시서에 브랜치·커밋 권한을 명시하면, 그 작업 동안은 지정 브랜치에서 커밋 전 확인 없이 작업 끝에 커밋 1개로 묶어 커밋·push한다(2026-10-11 사용자 결정: 단계마다 나누지 않는다). main에는 merge·push하지 않는다(통합은 사용자가 PR로 판단).
- 면제: `:85`(main 직접), `:86`(커밋 전 확인). 유지: `:87`(사용자 변경 파기 금지), `:88`(커밋 형식·squash 금지), `:89`(아카이브 브랜치).
- **추천: B.**
- 시점: 새 규칙이라 동결 예외 (a)~(d)에 들지 않으므로 첫 기능 뒤 정리 때 반영한다. 그 전의 자율 작업은 사용자가 준 지시서가 우선한다(이번 점검과 같은 방식).
- 바로 시작할 작업(첫 기능 뒤 정리 때): `CLAUDE.md` Git 절에 위 문구 1줄을 추가하는 규칙 커밋.

## 8. D-10 점검 작업 부산물 처분

- 왜: 이번 점검 작업용으로 스테이징·수정된 파일이 있다(`01-ai-setup.md` 6.1절, AI-12): `.claude/hooks/check-done.sh`(스테이징, 클라우드 세션에서 `checklist.json` 완료 여부로 Stop을 막는 hook), `.claude/settings.json`(Stop hook에 `check-done.sh` 등록, 미스테이징 수정), `.gitattributes`(`*.sh text eol=lf`, 스테이징). `check-done.sh:6-8`의 카운터는 `/tmp/stop-hook-count` 전역 파일이라 세션 간 리셋되지 않고 15회 이후 영구 통과한다. 점검 지시서의 완료 기준은 "기존 코드·설정 변경 없음"(`TASK.md:158`)이다.
- 선택지:
  - A. 셋 다 커밋 — 다음 자율 작업에 재사용. 단 카운터 결함과 점검 전용 경로(`docs/ai-audit/checklist.json`)가 남는다
  - B. `check-done.sh`와 `settings.json`의 해당 hook 등록은 제거, `.gitattributes`는 유지(커밋)
  - C. 셋 다 제거
- **추천: B.** `check-done.sh`는 이번 점검 전용이고 카운터 결함이 있다. `.gitattributes`(`*.sh eol=lf`)는 셸 스크립트 줄바꿈을 고정할 뿐이라 유지해도 무해하다.
- 바로 시작할 작업: 점검 PR 머지 전, 사용자 확인을 받아 `check-done.sh` 스테이징 해제·삭제와 `settings.json`의 해당 블록 제거(사용자 워킹트리 변경이므로 `CLAUDE.md:87`에 따라 임의 파기하지 않고 확인 후 진행). `.gitattributes`는 단독 `chore:` 커밋.

## 9. D-07 404 화면을 셸 안에 넣을지

- 왜: 루트 `src/app/not-found.tsx`는 `(console)` 그룹 밖이라 콘솔 레이아웃이 적용되지 않는다. 그래서 404가 사이드바 없이 다른 여백으로 그려진다(DS-03, CS-08, 심각도 둘 다 낮음 — 시각 불일치).
- 선택지:
  - A. 현행
  - B. `PageContainer` 부품으로 폭·여백만 통일(사이드바 없음 유지)
  - C. 셸을 루트 레이아웃으로 올려 404도 사이드바 안에
  - D. `(console)/[...rest]/page.tsx`에서 `notFound()`를 호출하고 `(console)/not-found.tsx`를 두어 셸 안에서 404를 그림. 이 방식이 의도대로 동작하는지는 `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/not-found.md` 확인이 필요하다
- **추천: B.** C는 레이아웃 구조 변경, D는 라우트 추가라 둘 다 Next 문서 확인과 plan이 필요하다. 얻는 것(404에서 메뉴 보이기)에 비해 B가 작업이 가장 작다.
- 시점: 여유 있을 때. 시각 불일치·심각도 낮음이고 첫 기능에 필요하지 않아 (d) 묶음에 들지 않는다. P-D2 중 A(역할 표)만 (d)이고, C(`PageContainer`)는 이 결정과 함께 여유 있을 때 한다.
- 바로 시작할 작업: P-D2-C와 함께 `src/components/page-container.tsx` plan.

## 10. D-06 라이트 토큰

- 왜: 다크 고정(`src/app/layout.tsx:22-23`)인데 라이트 값(`globals.css:72-115`)이 검증 없이 남아 있다(DS-07).
- 선택지(P-D5): A. 유지 / B. 삭제 / C. 유지 + 라이트 촬영 옵션으로 검증
- **추천: B.** 필요해지면 git 기록에서 되살릴 수 있다. shadcn 생성물이 `:root` 값을 전제로 하는지는 적용 후 다음 `pnpm shadcn add` 때 확인한다(확인만을 위해 실행하지 않는다, `CLAUDE.md:8`).
- 바로 시작할 작업: plan(토큰 변경) → `:root`를 다크 값으로 통합 → `pnpm shot /` 비교.

---

## 05 제안서와 추천·시점 대조

| ID | 05 제안 | 05 추천 | 이 문서 추천 | 05 시점(0절·4절) | 이 문서 시점 | 일치 |
|---|---|---|---|---|---|---|
| D-01 | P-C1 | B(리버스 프록시)로 시작 | B로 시작 | 결정·규칙 반영: 다음 기능 전(d) / 구현: 배포 전 | 결정·규칙 반영: 다음 기능 전(d) / 구현: VM 공개 배포 전 | 일치 |
| D-02 | P-A2 | B(2단계 동결) | B | 지금 | 지금 | 일치 |
| D-03 | P-C3 | B(Vitest), 첫 데이터 기능과 함께 | B | 다음 기능 전(d) | 다음 기능 전(d) | 일치 |
| D-04 | P-C4 | B(`queryOptions`) | B | 다음 기능 전(d) | 다음 기능 전(d) | 일치 |
| D-05 | P-A10 | B(표준 문구 1줄) | B | 첫 기능 뒤 정리(그 전 자율 작업은 지시서 우선) | 첫 기능 뒤 정리(그 전 자율 작업은 지시서 우선) | 일치 |
| D-06 | P-D5 | B(삭제) | B | 여유 있을 때 | 여유 있을 때 | 일치 |
| D-07 | P-D2(C) | B(`PageContainer`로 폭·여백만) | B | 여유 있을 때(P-D2-C와 함께, P-D2-A만 d) | 여유 있을 때 | 일치 |
| D-08 | P-A1 | B(`/learn`) | B | 첫 기능 뒤 정리(첫 항목, 첫 기능 커밋 직후) | 첫 기능 뒤 정리(첫 항목, 첫 기능 커밋 직후) | 일치 |
| D-09 | P-A5 | C(가드 보강 + 원격 보호) | B(원격 보호 설정) + P-A5-B | 지금(동결 예외 a) | 지금(사용자 5분) | 일치 |
| D-10 | (0절 아래 AI-12) | 결정으로만 처리 | B | 점검 종료 시 | 점검 종료 시(PR 머지 전) | 일치 |

## 리뷰 반영 기록(라운드 1)

반영 근거: `reviews/05-proposals-round-1.md`의 이 문서 관련 지적과 메인 세션 실측 사실(커밋 수치 `01-ai-setup.md` AI-02, 자율 작업 표준 문구 `01-ai-setup.md` AI-13, 점검 부산물 `01-ai-setup.md` 6.1절 AI-12, 404 배치 `03-code-structure.md` CS-08).

| # | 지적 요약 | 처리 | 위치 |
|---|---|---|---|
| 1 | D-02 "커밋 18개 중 규칙 변경 11개" 부정확(05 리뷰 지적 3) | 반영. CLAUDE.md 변경 커밋 10개·7일·같은 기간 feat 4개·데이터 기능 0개와 측정 명령으로 교체. "지금 당장 7개"를 동결 예외 기준(a/b/c)과 5개 항목으로 바꾸고 P-A4-B를 첫 기능 뒤로 이동 | D-02 |
| 2 | D-07 선택지에 셸 안 404(D) 없음 | 반영. 선택지 D(`(console)/[...rest]` + `notFound()` + `(console)/not-found.tsx`)와 Next 문서 확인 필요 명시. 원인을 라우트 구조(그룹 밖)로 정정, 심각도 낮음 명시 | D-07 |
| 3 | D-05 문구가 05·초안과 다름(05 리뷰 지적 1) | 반영. 표준 문구로 교체, `CLAUDE.md:85`·`:86` 원문 인용, 면제·유지 규칙 나열 | D-05 |
| 4 | AI-12(`check-done.sh`)가 어느 결정에도 연결 안 됨(05 리뷰 지적 5) | 반영. D-10 신설(선택지 A~C, 추천 B), 중요도 표 8위·마감 "점검 종료 시" | D-10, 중요도 표 |
| 5 | D-09가 05에서 참조되지 않음, 사용자 작업 구분(05 리뷰 지적 6) | 반영. 중요도를 3위로 올리고(지금, 동결 예외 a), 원격 보호로 막히지 않는 로컬 파괴 명령은 P-A5-B가 필요함을 명시. 05 쪽에도 D-09 연결 | D-09 |
| 6 | (일관성) D-06의 "`pnpm shadcn add` 1회로 확인" | 반영. 확인만을 위한 실행을 권하지 않고 "다음 shadcn add 때 확인"으로 변경(`CLAUDE.md:8`, 05 P-C6과 같은 기준) | D-06 |
| 7 | (일관성) D-04 예시 문안의 조건부 표시 | 반영. 예시의 queryOptions 문안이 "D-04가 B로 결정됐을 때의 문안"임을 명시, 대체 재측정 명령 기재 | D-04 |
| 8 | (일관성) 05와 추천 대조 | 반영. 문서 끝에 대조 표 추가, 10개 모두 일치 확인 | 05 제안서와 추천 대조 |

## 리뷰 반영 기록(라운드 2)

반영 근거: `reviews/05-proposals-round-2.md`의 이 문서 관련 지적과 메인 세션이 확정한 동결 정의(`05-proposals.md` P-A2).

| # | 지적 요약 | 처리 | 위치 |
|---|---|---|---|
| 1 | D-02 '바로 시작할 작업'(동결 선언 → SPEC 인터뷰)이 05 4절과 순서가 다르고, 동결 정의가 '다음 기능 전' 하네스 변경과 모순(05 리뷰 지적 1) | 반영. 2단계 동결 정의를 05 P-A2와 같은 문장으로 기재. '바로 시작할 작업'을 05 4절 순서(지금 (a)(b)(c) → 다음 기능 전 (d) 묶음: D-01·D-03·D-04·D-08 결정 → 규칙 커밋 1개 → 새 세션 SPEC → 첫 기능 뒤 정리)로 수정. D-01·D-03·D-04·D-08의 '바로 시작할 작업'에 (d) 규칙 커밋 포함 명시 | D-02, D-01, D-03, D-04, D-08, 중요도 표 |
| 2 | DS-09가 동결 예외 (b)가 아님(05 리뷰 지적 2) | 이 문서에는 DS-09 언급이 없었음. D-02 단계 3에 "P-A9(DS-09 규칙 포함)"으로 05와 같게 기재 | D-02 |
| 3 | D-07 시점이 문서마다 다름, 대조표가 시점을 비교하지 않음(05 리뷰 지적 3) | 반영. D-07 "여유 있을 때" 유지(05도 P-D2-C·D-07을 여유 있을 때로 변경)하고 D-07에 시점·사유 추가. 대조표에 05 시점·이 문서 시점 열을 추가해 10개 모두 일치 확인. 중요도 표 마감도 05 시점 표기로 통일(D-03·D-04·D-08 → 다음 기능 전(d), D-01 결정/구현 분리) | 중요도 표, D-07, 대조표 |
| 4 | D-05가 동결 예외 어디에도 안 듦(05 리뷰 지적 4) | 반영. 마감을 "첫 기능 뒤 정리(그 전 자율 작업은 지시서 우선)"로, D-05에 시점 줄 추가 | 중요도 표, D-05 |
| 5 | (05 리뷰 지적 5~7: 05 본문 수치·설명·인용) | 이 문서에 해당 내용 없음. 05에서 반영 | — |
| 6 | (내부 참조) 라운드 1 기록이 근거를 내부 공통 사실 번호로 적음 | 반영. 내부 번호 대신 근거 문서·절(`01-ai-setup.md` AI-02·AI-13·6.1절, `03-code-structure.md` CS-08)로 교체 | 리뷰 반영 기록(라운드 1) |

## 리뷰 반영 기록(라운드 3)

반영 근거: `reviews/05-proposals-round-3.md`의 이 문서 관련 지적과 메인 세션이 확정한 공통 사실(P-A8 '지금' 범위, '지금' 커밋의 변경 줄 목록, P-A1 시점, (d) 순서, D-03 문안).

| # | 지적 요약 | 처리 | 위치 |
|---|---|---|---|
| 1 | 02 DS-09 대응이 P-A7로 남음(05 리뷰 지적 1) | 이 문서에 DS-09 대응 칸 없음. D-02 단계 3의 "P-A9(DS-09 규칙 포함)"는 이미 05·02와 같음 | — |
| 2 | P-A8 예시를 통째로 옮기면 (d) 줄이 '지금'에 섞임(05 리뷰 지적 2) | 반영. D-02 단계 1에 P-A8 범위(`disallowedTools` 1줄·`red-team.md:30` 문장)와 shot exit 2 줄(P-A6과 함께, (c))을, 단계 2에 test 판정 줄(D-03)·SPEC 기록 줄(P-A3)을 (d)로 기재. D-03에도 test 판정 줄 명시 | D-02, D-03 |
| 3 | '지금' 커밋의 `CLAUDE.md:7`·`:87` 변경이 D-02에 없고, 동결 선언이 커밋 뒤 별도 행위처럼 읽힘(05 리뷰 지적 3) | 반영. D-02 '바로 시작할 작업' 1에 바뀌는 줄 전체(`:7` 다음 동결 조항 — D-02 채택의 직접 반영, `:87` P-A5, `:20`·`:45`·`:60`·`:62`·`:66`·`docs/design-system.md:40`·`eslint.config.mjs:175`·`:188` P-A7)를 열거하고, 동결 선언은 같은 chore 커밋 안의 문단 추가라고 적음. 단계 1에도 동결 문단의 근거를 추가 | D-02 |
| 4 | (d) 기준과 P-A1이 맞지 않음(05 리뷰 지적 4) | 반영. D-08을 '첫 기능 뒤 정리(첫 항목, 첫 기능 커밋 직후)'로 옮기고 첫 시험 대상을 기존 `86e86bf`에서 첫 데이터 기능 커밋으로 변경. 중요도 표·D-02 단계 2·3·바로 시작할 작업·대조표를 함께 수정 | 중요도 표, D-02, D-08, 대조표 |
| 5 | (d) 순서가 plan/SPEC 순환(05 리뷰 지적 5) | 반영. D-02 '바로 시작할 작업' 2를 05 4절과 같은 ①~④ 문장으로 교체, "첫 기능 plan과 함께" 삭제 | D-02 |
| 6 | D-03 `vitest run`이 테스트 0개에서 verify를 깨뜨림(05 리뷰 지적 6) | 반영. `"test": "vitest run --passWithNoTests"`, verify 포함은 (d) 커밋에서 가능, 완료 조건 "(d) 커밋 직후 `pnpm verify` exit 0(적용 시 실측)" 추가 | D-03 |
| 7 | 01·03·examples 시점 표기(05 리뷰 지적 7) | 이 문서에 해당 내용 없음. D-02 단계 3의 P-C5·P-C6은 이미 '첫 기능 뒤 정리' | — |
| 8 | 05 R1 #5 표시(05 리뷰 지적 8) | 이 문서에 해당 내용 없음. 05에서 반영 | — |

## 리뷰 반영 기록(05 라운드 4)

| # | 지적 요약 | 처리 | 위치 |
|---|---|---|---|
| 3 | D-03 설치 목록이 Next 가이드와 다름(`@vitejs/plugin-react`·`vite-tsconfig-paths`·`vitest.config.mts` 누락) | 반영. 설치본 `testing/vitest.md` "Manual Setup" 기준 6개 + config로 교체 | D-03 |
| 4 | D-09 확인을 `git push --dry-run`으로 할 수 없음 | 반영. `gh api …/branches/main/protection` 또는 `…/rules/branches/main` 읽기 전용 조회, 실제 force push 시험 금지 | D-09 |
