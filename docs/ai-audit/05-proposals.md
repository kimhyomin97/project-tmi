# 05. 개선 제안서

근거 문서: `01-ai-setup.md`(AI-xx), `02-design-system.md`(DS-xx), `03-code-structure.md`(CS-xx), `04-research.md`.
결정 항목: `decisions-needed.md`(D-01~D-10). 예시 파일: `docs/ai-audit/examples/` (각 제안의 "예시" 칸).
작업량은 AI 작업 기준 추정(estimated): **S** = 1시간 이내, **M** = 반나절, **L** = 하루 이상. 사람의 결정·확인 시간은 따로 적는다.

규칙: 이 문서는 제안만 한다. 저장소의 기존 파일은 바꾸지 않았다. CLAUDE.md 규칙상(`CLAUDE.md:7`) 규칙 변경은 단독 `chore:` 커밋 + 새 세션 시작이 필요하다.

## 0. 한눈에 보기

| 영역 | 제안 | 추천안 | 해결하는 발견 | 관련 결정 | 작업량 | 시점 |
|---|---|---|---|---|---|---|
| AI 환경 | P-A1 학습 체크포인트 | B. `/learn` skill + 학습 로그 | AI-01 | D-08 | S | 첫 기능 뒤 정리(첫 항목, 첫 기능 커밋 직후) |
| AI 환경 | P-A2 하네스 투자 정지선 | B. 2단계 동결(지금 a/b/c, 첫 데이터 기능 착수 때 d 묶음 1회) + 후보 목록 | AI-02, AI-10 | D-02 | S | 지금 |
| AI 환경 | P-A3 검증 기록 남기기 | B. SPEC 파일에 완료 조건·판정 기록 | AI-06, AI-09 | — | S | 다음 기능 전(d) |
| AI 환경 | P-A4 Stop hook 비용 | B. 지문에서 `*.md`만 제외 → 이후 C | AI-05 | — | S(B) / M(C) | 첫 기능 뒤 |
| AI 환경 | P-A5 가드 보강 | C. 가드 보강 + GitHub 브랜치 보호 | AI-04 | D-09 | S + 사용자 5분 | 지금 |
| AI 환경 | P-A6 `pnpm shot` Linux | B. root면 `--no-sandbox`, 경로 후보 추가 | AI-03 | — | S | 지금 |
| AI 환경 | P-A7 문서 사실 오류·모순 정리 | A. 한 번에 정정 | AI-07, AI-08, AI-14, DS-10(앞부분), CS-06 | — | S | 지금 |
| AI 환경 | P-A8 red-team 도구 제한 | A. `disallowedTools`(지금은 frontmatter 1줄 + `:30` 문장만) | AI-09 | — | S | 지금 |
| AI 환경 | P-A9 CLAUDE.md 구조 | B. 핵심만 남기고 rules·skills로 분리(DS-09 규칙 포함) | AI-10, AI-08, DS-09 | D-02(첫 기능 뒤), D-04(문안) | M | 첫 기능 뒤 정리 |
| AI 환경 | P-A10 자율 작업 모드 | B. 예외 조항 1줄(표준 문구) | AI-13 | D-05 | S | 첫 기능 뒤 정리(그 전 자율 작업은 지시서 우선) |
| 디자인 | P-D1 상태 표시 일관성 | B. `StatusBadge` 래퍼 1개 | DS-01, DS-10(뒷부분) | — | S | 지금(제품 코드) |
| 디자인 | P-D2 역할(타이포·컨테이너) | A+C. 문서 표 + `PageContainer` | DS-02, DS-03, DS-04, DS-05, CS-08 | D-07(추천 B) | S | A: 다음 기능 전(d) / C·D-07: 여유 있을 때 |
| 디자인 | P-D3 동적 클래스 lint | B. 로컬 규칙 추가 | DS-06 | — | S | 다음 기능 전(d) |
| 디자인 | P-D4 포커스 표시 | A. 현행 유지 + 다른 브라우저 확인 | DS-08 | — | S | 여유 있을 때 |
| 디자인 | P-D5 라이트 토큰 | 결정 필요(D-06), 추천 B 삭제 | DS-07 | D-06 | S | 여유 있을 때 |
| 코드 | P-C1 인증 | 결정 필요(D-01). 추천: 리버스 프록시 인증으로 시작 | CS-01, CS-09 | D-01 | S~L | 결정·규칙 반영: 다음 기능 전(d) / 구현: **배포 전 필수** |
| 코드 | P-C2 API 오류·재시도 | B. 404 변환 위치 결정 + 4xx 재시도 제외 + 오류 문구 헬퍼 | CS-03, CS-04, CS-11 | — | S | 첫 데이터 기능 커밋에 포함(제품 코드) |
| 코드 | P-C3 테스트 | B. Vitest(로직·3상태) | CS-02, AI-11 | D-03 | M | 다음 기능 전(d) |
| 코드 | P-C4 queryKey 방식 | B. feature당 `queryOptions` 묶음 | L4 대비, CS-11(signal) | D-04 | S | 다음 기능 전(d) |
| 코드 | P-C5 단방향 import | B. `import/no-restricted-paths` | CS-07 | — | S | 첫 기능 뒤 정리 |
| 코드 | P-C6 미사용 코드 | `cn` 패키지로 통일, `utils.ts` 삭제 후보 | CS-05, CS-10 | — | S | 첫 기능 뒤 정리 |
| 코드 | P-C7 `CORE_API_URL` 누락 가드 | B. 배포 빌드에서 미설정 시 실패 | CS-12 | — | S | 배포 전 |

시점 표기: "지금" = 동결 예외 (a)(b)(c) 또는 제품 코드, "다음 기능 전(d)" = 첫 데이터 기능 착수 묶음(P-A2), "첫 기능 뒤 정리"·"여유 있을 때" = 첫 데이터 기능 커밋 뒤. 상세는 4절.

제안 없이 결정으로만 처리하는 발견: **AI-12**(점검 작업 부산물 `check-done.sh`, `01-ai-setup.md` 6.1절) → D-10. AI-13도 같은 소절에 있으나 P-A10으로 다룬다.

## 1. AI 개발 환경

### P-A1. 학습 체크포인트 (AI-01) — D-08

문제: 사람의 역할이 승인·증거 확인뿐이라(`CLAUDE.md:6`) FE 판단을 체득했는지 남는 곳이 없다. 학습 기록은 AI가 쓴 `Learn:` trailer 4줄이다(feat+fix 7개 중 trailer가 있는 커밋 3개). 에러 경계 결정은 `a30b614`(`(console)/error.tsx`)와 `b325363`(`global-error.tsx`·`not-found.tsx`)에서 이미 있었으나 두 커밋 모두 `Learn: L5` trailer가 없다. `useQuery` 3상태(데이터 로딩·실패)는 아직 시험받지 않았다.

| 안 | 내용 | 장점 | 단점 | 작업량 |
|---|---|---|---|---|
| A. 현행 | AI가 trailer·완료 보고에 결정을 설명 | 마찰 없음 | 사람의 이해를 확인하지 않음. trailer 누락도 감지 못함 | 0 |
| **B. `/learn` skill** | 기능 완료 후 사람이 `/learn`을 호출하면, AI가 이번 변경의 L 결정마다 "이 컴포넌트는 server/client 중 무엇이어야 하나, 왜?" 같은 질문 2~3개를 **답을 먼저 보여주지 않고** 묻는다. 사람이 답하면 비교·보충하고 `docs/learning/log.md`에 질문·사람 답·정답 근거(파일:줄)를 1줄씩 남긴다 | 학습이 저장소에 남음. 커밋 승인 흐름을 막지 않음(선택 호출). skill이라 평소 컨텍스트 비용 0(`04-research.md` 1.3) | 사람이 호출해야 함 | S |
| C. plan에 사람 예측 칸 | plan 승인 전에 사람이 L 결정을 먼저 한 줄로 적고 AI가 비교 | 판단 연습이 가장 직접적 | 모든 plan에 마찰. 사용자 부담 증가 | S |

추천: **B.** C는 사람이 원할 때 `/learn` 안에서 "예측 모드"로 쓰면 된다. 시점: **첫 기능 커밋 직후(첫 기능 뒤 정리 묶음의 첫 항목)**. `/learn`은 기능 완료 뒤 사람이 호출하는 도구라 첫 기능 구현에 필요하지 않으므로 (d)의 기준('첫 데이터 기능에 직접 필요한 결정의 반영')에 들지 않는다. 첫 기능 커밋 직후에 넣어도 첫 기능의 L 결정을 첫 `/learn` 대상으로 그대로 쓸 수 있다.
예시: `examples/dot-claude/skills/learn/SKILL.md`, `examples/docs/learning/log.md`.

### P-A2. 하네스 투자 정지선 (AI-02, AI-10) — D-02

문제: 스캐폴딩(`e09f7c6`, 2026-08-16) 이후 CLAUDE.md를 바꾼 커밋 10개(`2b9967c`~`dc74e11`)가 모두 2026-09-28~10-04, **7일 안에** 몰려 있다. 같은 7일 동안 feat는 4개(`3309ac0`, `ca977c0`, `a30b614`, `c9e4bcb`, 셸·디자인·shot), 그 뒤 `86e86bf`(10-05). BE를 호출하는 데이터 기능은 전체 기간 0개다. 3상태·queryKey·BE 계약 규칙은 실제 기능으로 시험받은 적이 없다. 측정: `git log --oneline 86e86bf -- CLAUDE.md`(스캐폴딩 포함 11줄).

| 안 | 내용 | 장점 | 단점 | 작업량 |
|---|---|---|---|---|
| A. 현행 | 문제를 발견할 때마다 규칙 개선 | 안전장치가 계속 좋아짐 | 규칙이 실사용보다 앞서 감. CLAUDE.md 밀도 증가 | — |
| **B. 2단계 동결 + 후보 목록** | 아래 "동결 정의"대로 CLAUDE.md·hook·lint·agent·skill 변경을 제한한다. 떠오른 개선은 `docs/harness-backlog.md`에 한 줄씩 적고 첫 기능 뒤 한 번에 정리. 제품 코드(P-D1, P-C2 등)는 동결 대상이 아니다 | 규칙을 실제 기능으로 검증한 뒤 바꿀 수 있음. "simplest solution … only increasing complexity when needed"(`04-research.md` 2). 예외 기준과 착수 묶음 목록이 정해져 있어 무엇을 언제 할지 판단 가능 | 그 사이 발견한 하네스 구멍((a)~(d)에 안 드는 것)을 잠시 안고 감 | S |
| C. 지금 대규모 슬림화 | P-A9를 먼저 수행 | 규칙 문장 정리를 먼저 끝냄 | 실사용 근거 없이 또 한 번 규칙을 바꿈. 상시 로드 크기 이득도 없음(P-A9 실측) | M |

동결 정의('하네스 동결'은 두 단계다):

1. **지금**: 예외 기준 (a) 되돌릴 수 없는 피해 방지(P-A5 + 사용자 D-09), (b) 사실과 다르거나 서로 모순되는 지시의 정정(P-A7 — `CLAUDE.md:45`의 AGENTS 우선순위 명시는 모순 해소라 (b)에 포함, P-A8), (c) 작업 환경에서 검증 자체를 막는 문제(P-A6)만 반영하고 커밋한다.
2. **첫 데이터 기능 착수 시**: (d) '첫 데이터 기능에 직접 필요한 결정의 반영' — D-01(B 선택 시 `CLAUDE.md` "미정" 교체), D-03(테스트 도입 시 `package.json`·`verify`), D-04(`CLAUDE.md:57`·`:18`), P-A3(SPEC 상시화, `CLAUDE.md:14` + `docs/spec/README.md:3`), P-D3(조립 클래스 lint), P-D2-A(역할 표, `docs/design-system.md`) — 를 **한 번의 규칙 커밋**으로 묶어 넣는다. 순서: ① (d) 규칙 변경 제안 — `CLAUDE.md:7` 형식(바꿀 줄·문구·이유)으로, 첫 기능 이름과 범위만 명시 → ② 승인 후 단독 chore 커밋 → ③ 새 세션에서 첫 기능 SPEC 인터뷰(`docs/spec/<feature>.md`) → ④ `/clear` 후 SPEC을 읽고 기능 plan(`CLAUDE.md:13` 항목)·구현. 그 뒤 첫 데이터 기능이 커밋될 때까지는 (a)(b)(c)만 허용한다.
3. **첫 기능 뒤 정리**: 첫 항목으로 P-A1(`/learn` skill, 첫 기능 커밋 직후 — 첫 기능이 첫 `/learn` 대상), 이어서 P-A9(DS-09 규칙 포함), P-A4-B·C, P-A10, P-C5, P-C6 등 backlog를 한 번에 정리한다.

추천: **B.** 이 기준에 따라 P-A4-B(Stop hook 지문 축소)는 문서 작업 턴의 비용 문제일 뿐 작업을 막지 않고 첫 기능에 필요하지도 않으므로((a)~(d) 밖) 첫 기능 뒤로 옮겼다. P-A1(`/learn`)도 같은 잣대로 첫 기능 구현에 필요하지 않아 (d)에서 빼고 첫 기능 뒤 정리의 첫 항목으로 옮겼다. P-A9(구조 개편)도 첫 기능 뒤에 하는 것이 근거가 생긴다. 4절 로드맵의 '다음 기능 개발 전'은 위 (d) 목록과 같다.

### P-A3. 검증 기록 남기기 (AI-06, AI-09)

문제: plan·완료 조건·레드팀 판정의 기록 형식이 강제되지 않는다. 커밋 본문에 일부 남은 사례가 있다(`b325363` 제목 "레드팀 결과 반영", 본문 "검증: pnpm verify 통과 …"). 그러나 형식이 없어 `86e86bf`처럼 빠지고, 그 경우 규칙 준수를 사후에 확인할 수 없다(`01-ai-setup.md` 4절 "확인 불가" 2건 — 대화 기록이 저장소에 없음).

| 안 | 내용 | 장점 | 단점 | 작업량 |
|---|---|---|---|---|
| A. 현행 | 커밋 본문에 자유 형식 요약 | 추가 파일 없음 | 빠져도 알 수 없음(`86e86bf`) | 0 |
| **B. SPEC 파일에 기록** | 모든 feature(화면 1개짜리 포함)에 `docs/spec/<feature>.md`를 두고 "완료 조건" 표에 판정·증거 경로·레드팀 결과 1줄을 메인 세션이 채운다. 커밋 본문에 SPEC 경로 | 장시간 하네스의 "대화 밖에 남기기"를 가장 싸게 적용(`04-research.md` 2). 다음 세션이 이어받기 쉬움 | 작은 기능에도 파일 1개 | S |
| C. 커밋 본문 `검증:` 섹션 의무화 | `b325363`의 형식을 규칙으로 고정(완료 조건별 판정·red-team 판정 1줄) | 새 파일 없음, 이미 한 번 쓴 형식 | 커밋 전에는 볼 곳이 없고, 수정 라운드 기록이 커밋마다 흩어짐 | S |

추천: **B.** feature JSON + progress 파일(Anthropic 하네스 글 구조)은 사람 승인 중심의 짧은 세션에는 과해서 제외했다. 적용 시 바뀌는 규칙: `CLAUDE.md:14`("화면 2개 이상 feature는 … SPEC을")와 `docs/spec/README.md:3`("화면 2개 이상인 feature는 구현 전에")의 "화면 2개 이상" 조건. 같은 (d) 커밋에 `examples/dot-claude/agents/red-team.md`의 "SPEC 기록용 한 줄"(출력 형식 5번)도 넣는다(P-A8 참고). 시점: 첫 데이터 기능 착수 묶음 (d)(P-A2). 예시: `examples/docs/spec/TEMPLATE.md`.

### P-A4. Stop hook 비용과 피드백 속도 (AI-05)

현재 `computeFingerprint()`는 HEAD 해시(`.claude/hooks/stop-check.mjs:55` `git("rev-parse HEAD")`)와 워킹트리 전체를 지문에 넣는다. 그래서 문서만 담은 커밋 직후에도 지문이 바뀐다.

| 안 | 내용 | 장점 | 단점 | 작업량 |
|---|---|---|---|---|
| A. 현행 | 워킹트리 지문이 바뀌면 typecheck+lint+build(약 22초) | 단순, 빠짐없음 | 문서만 바뀐 턴에도 22초. 피드백이 턴 끝에만 옴 | 0 |
| **B. 지문에서 `*.md`만 제외** | `status`·`diff`·`ls-files`에 `':(exclude)*.md'`를 붙이고, HEAD 해시 대신 `git ls-tree -r -z HEAD` 목록을 `\0`으로 나눠 `p.endsWith('.md')`인 줄을 JS로 거른다(`ls-tree`는 exclude 매직 미지원. `-z` 없이 받으면 비ASCII 경로가 따옴표로 감싸져 `.md"`로 끝나 필터를 빠져나간다 — `examples/dot-claude/hooks/stop-check.diff.md:11`). git 기본 pathspec에서 `*`는 `/`도 매치하므로 루트 `CLAUDE.md`를 포함한 모든 `.md`가 빠진다(실측: `git ls-files -- . ':(exclude)*.md'` 결과에 `.md` 0개). `docs/**` 전체는 빼지 않는다 — `docs/ai-audit/examples/**/*.mjs`는 현재 `pnpm lint` 대상이라(`eslint.config.mjs` globalIgnores에 `docs` 없음) 빼면 그 수정이 검사에서 빠진다 | 문서만 고친 턴의 비용 0 | **10여 줄 변경, 미실측**(hook에 넣어 돌려 보지 않음). `.md` 안의 코드 블록은 원래 검사 대상이 아니므로 잃는 검사는 없다 | S |
| C. B + PostToolUse lint | `Edit|Write` 직후 해당 파일만 `eslint` → 실패 시 exit 2로 즉시 알림. Stop은 typecheck+build | 편집 직후 교정. 공식 예시와 같은 형태(`04-research.md` 1.2) | hook 1개 추가, 편집마다 1~2초 | M |

B 적용 시 완료 조건: ① `.md`만 수정한 턴 → Stop 검사 생략 ② `src/` 파일 수정 → 검사 실행 ③ `docs/ai-audit/examples/*.mjs` 수정 → 검사 실행.
추천: **B → C, 둘 다 첫 기능 뒤 정리**(P-A2 예외 기준 (a)(b)(c)에 해당하지 않고, 첫 기능에 직접 필요하지 않아 (d) 묶음에도 들지 않음). 예시: `examples/dot-claude/hooks/stop-check.diff.md`, `examples/dot-claude/hooks/lint-file.mjs`, `examples/dot-claude/settings.json`.

### P-A5. 가드 보강 (AI-04) — D-09

실측(`01-ai-setup.md` 2.4절): allow 목록(`.claude/settings.json:18` `Bash(git branch *)`, `:21` `Bash(git switch *)`)에 있고 가드도 통과하는(exit 0) 파괴 명령이 있다 — `git switch --discard-changes main`, `git switch -f main`, `git branch -D v3`. 이것들은 **기본 권한 모드에서도 확인 없이** 실행된다. 반면 `git reset --hard`·`checkout .`·`stash`는 allow 목록에 없어 기본 모드에서는 사용자에게 묻고, 자동 승인 모드에서만 무방비다. 가드의 main·아카이브 "삭제 차단"은 원격(`push --delete`, `:ref`)에만 해당하고 로컬 `branch -D`는 막지 않는다. 가장 위험한 조합은 "자동 승인 + 가드 미검사"다.

| 안 | 내용 | 장점 | 단점 | 작업량 |
|---|---|---|---|---|
| A. 현행 | force push·원격 main 삭제·아카이브 커밋만 차단 | 거짓 양성 적음 | 위 파괴 명령 무방비, 래핑 우회 | 0 |
| B. 가드 보강 | ① (우선) `switch -f`/`--discard-changes`, `branch -D`/`-f`(main·아카이브 대상) 차단 ② `reset --hard`, `checkout -- .`/`checkout .`, `restore .`, `stash`(push 계열), `clean -fd`(ui 경로 외) 차단 ③ `bash -c`/`sh -c`/`env`/`sudo`/괄호/`$(…)` 안의 `git`도 검사 | `CLAUDE.md:87`을 기계로 보장 | 문자열 파싱의 한계는 남음(`04-research.md` 1.5) | S |
| **C. B + 원격 브랜치 보호** | GitHub에서 main의 force push·삭제 금지(사용자가 저장소 설정에서 1회, D-09) | 명령 문자열과 무관하게 되돌릴 수 없는 원격 피해를 막음 | 사용자 설정 필요(AI가 대신할 수 없음 — 이 환경엔 원격 없음) | S + 사용자 5분 |

추천: **C.** 동결 예외 (a). 예시: `examples/dot-claude/hooks/guard-bash.additions.mjs`(추가 검사 함수와 시험 케이스).

### P-A6. `pnpm shot`을 Linux/클라우드에서 동작시키기 (AI-03)

| 안 | 내용 | 장점 | 단점 | 작업량 |
|---|---|---|---|---|
| A. 문서화 | `CHROME_PATH`와 `--no-sandbox` 래퍼 사용법을 CLAUDE.md에 | 코드 변경 없음 | 매 세션 AI가 래퍼를 만들어야 함 | S |
| **B. 스크립트 보강** | `findChrome()` 후보에 `PLAYWRIGHT_BROWSERS_PATH`(없으면 `~/.cache/ms-playwright`) 아래 `chromium-*/chrome-linux/chrome`을 `readdirSync`로 찾아 추가(환경 고유 링크 `/opt/pw-browsers/chromium`에 기대지 않음, `examples/scripts/shot.diff.md`), Linux에서 `process.getuid?.() === 0`이면 `--no-sandbox` 추가 | 클라우드 세션에서 규칙(`CLAUDE.md:15`, `:21`)을 그대로 지킬 수 있음 | root 전용 분기 | S |
| C. Playwright로 교체 | 상호작용(클릭·입력)까지 검증 | 동작 조건 판정 가능(AI-11 일부 해소) | 새 의존성 승인 필요 | M |

추천: **B**(동결 예외 (c) — 그 환경에서는 완료 보고 규칙 자체를 지킬 수 없음). 같은 '지금' 커밋에 `examples/dot-claude/agents/red-team.md`의 "`pnpm shot` exit 2 = `판정 불가(도구 오류)`" 줄도 넣는다 — 도구 오류를 화면 실패와 구분하는 것은 P-A6의 검증 환경 문제와 같은 범주다. 동작 검증이 필요해지면 P-C3과 함께 C 검토. 예시: `examples/scripts/shot.diff.md`.

### P-A7. 문서 사실 오류·모순 일괄 정정 (AI-07, AI-08, AI-14, DS-10 앞부분, CS-06)

한 번의 `chore:` 커밋으로 정정할 목록(모두 근거 확인됨, 동결 예외 (b) — 사실과 다르거나 서로 모순되는 지시의 정정). DS-09(aria 속성 규칙)는 새 규칙이므로 이 표에서 빼고 P-A9에서 다룬다.

| 위치 | 현재 | 정정안 |
|---|---|---|
| `CLAUDE.md:20` | "서브에이전트가 쓴 코드는 hook 검증을 받지 않는다" | "서브에이전트에도 PreToolUse 가드는 걸리지만 Stop 검증은 걸리지 않는다. 결과를 받으면 메인에서 `pnpm verify`"(실측: `04-research.md:35`, `01-ai-setup.md` AI-14) |
| `CLAUDE.md:45` | Next 문서 읽기 범위 | 앞에 "AGENTS.md의 'before writing any code'는 아래 경우로 좁힌다"를 명시(AGENTS.md "Read the relevant guide … before writing any code"와 `:45` "때만 읽고"가 서로 모순되므로 우선순위를 적는 것은 (b)) |
| `CLAUDE.md:60`, `:62` | 공용 컴포넌트·lib 목록 | `mobile-nav`·`sidebar-collapse`, `sidebar-store.ts`(셸 전역 UI 상태) 추가. `src/lib/utils.ts`는 P-C6에서 삭제 후보이므로 목록에 넣지 않는다(유지로 결정되면 추가) |
| `CLAUDE.md:66` | "`"use client"`는 데이터를 쓰는 컴포넌트 파일에만" | "상태·이벤트·브라우저 API·데이터가 필요한 **말단** 파일에만" |
| `docs/design-system.md:40` | "설치됨: Button, Card, Badge" | Sheet 추가 |
| `eslint.config.mjs:175` | "URL은 env.apiBaseUrl 기준" | "같은 출처 `/api/v1/*` 경로로" |
| `eslint.config.mjs:188` | "CLAUDE.md '스택 (고정)'" | "CLAUDE.md '스택'"(실제 제목 `CLAUDE.md:42`) |

추천: **A(즉시 일괄 정정).** 작업량 S. 예시 CLAUDE.md 초안(`examples/claude-md/CLAUDE.draft.md`)에 반영돼 있다.

### P-A8. red-team 도구 제한 (AI-09)

`red-team.md` frontmatter에 `disallowedTools: Edit, Write, NotebookEdit` 추가(`04-research.md:54`는 `Edit, Write`만 예로 들었고, 노트북 편집 도구도 같은 이유로 포함). Bash는 `pnpm shot`·`pnpm verify`에 필요하므로 유지(Bash로 쓰는 수정은 여전히 문장 규칙 — `red-team.md:30`). 공식 근거: tools 생략 시 "Inherits every tool"(`04-research.md` 1.4).
추천: 적용(동결 예외 (b) — "코드는 고치지 않고"(`red-team.md:3`)라는 지시와 실제 권한이 다름). 작업량 S.

**지금(b) 넣는 범위는 frontmatter의 `disallowedTools: Edit, Write, NotebookEdit` 1줄과 규칙 절(`red-team.md:30`) 문장 정정뿐이다.** 예시 `examples/dot-claude/agents/red-team.md`는 완전한 파일이지만 그 밖의 추가 줄은 단계가 다르다:

| 예시의 추가 줄 | 넣는 단계 | 근거 |
|---|---|---|
| `disallowedTools` 1줄, `:30` 문장 정정 | 지금 (b) | 지시와 권한의 모순 정정 |
| `pnpm shot` exit 2 → `판정 불가(도구 오류)` | 지금 (c), P-A6과 같은 커밋 | 도구 오류 구분은 P-A6의 검증 환경 문제와 같은 범주 |
| `test` 스크립트가 있을 때만 `pnpm test` 판정 | (d), D-03과 함께 | 테스트 도입 결정의 반영 |
| "SPEC 기록용 한 줄" | (d), P-A3과 함께 | SPEC 상시화의 반영 |

그래서 '지금' 커밋에서는 예시 파일을 통째로 옮기지 않고 위 표의 '지금' 줄만 넣는다(단계 표시는 `examples/README.md`와 예시 파일 주석).

### P-A9. CLAUDE.md 구조 개편 (AI-10, AI-08)

| 안 | 내용 | 장점 | 단점 | 작업량 |
|---|---|---|---|---|
| A. 현행 100줄 단일 파일 | — | 한곳에 다 있음 | 한 줄 다중 규칙, 완료 보고 절차까지 본문에 있음 | 0 |
| **B. 핵심 + rules + skills** | CLAUDE.md는 "목표·역할·절대 규칙·명령·어디를 읽을지"만 남긴다. 디자인 규칙은 `.claude/rules/design.md`(`paths: src/**/*.tsx`, `src/app/globals.css`), BE 연동은 `.claude/rules/be-integration.md`(`paths: src/features/*/api.ts`, `src/features/*/types.ts`, `src/features/*/queries.ts`, `src/lib/api/**`, `next.config.ts`), 완료 보고 절차는 `/report` skill. `paths` 규칙은 해당 파일을 읽거나 편집할 때 로드되므로, plan 단계에 필요한 "새 엔드포인트는 Controller/DTO `파일:줄`을 plan에 적고, 모르면 묻는다" 한 줄은 CLAUDE.md 본문에 남긴다 | 경로별 세부 규칙과 보고 절차를 그 작업에서만 로드(`04-research.md` 1.1, 1.3). lint가 강제하는 내용의 반복 제거. 단 컨텍스트 크기 이득은 없음(아래 실측) | `.claude/rules`의 `paths` 동작을 이 프로젝트에서 한 번 실측해야 함 | M |
| C. 하위 CLAUDE.md | `src/features/CLAUDE.md` 등 폴더별 | 폴더에 붙어 있음 | 새 폴더(`features/`)가 생기기 전엔 둘 곳이 없음 | S |

DS-09(시각 문제를 aria 속성 제거로 푼 선례): 새 규칙이므로 동결 예외 (b)가 아니다. 이 개편 때 `rules/design.md`에 "시각 문제를 `aria-*` 제거로 풀지 않는다" 문장을 넣고, 같은 작업에서 `src/components/sidebar-collapse.tsx:35`(주석 "aria-expanded는 쓰지 않는다: ghost 버튼이 \"열린 메뉴\"처럼 채워 그린다")의 `aria-expanded` 복원 여부를 함께 판단한다. 복원한다면 ghost 버튼의 `aria-expanded` 스타일은 `className`으로 덮어써 시각 문제를 해결한다(생성물 `src/components/ui/` 수정 금지). 규칙과 기존 코드가 어긋난 채 남지 않도록 둘을 같은 커밋에서 처리한다.

턴 종류별 로드 크기(`wc -c` 실측: 현재 `CLAUDE.md` 10,825B, 초안 `examples/claude-md/CLAUDE.draft.md` 9,204B, `rules/design.md` 1,691B, `rules/be-integration.md` 2,471B. rule은 `paths`에 맞는 파일을 읽거나 편집할 때 로드):

| 턴 종류 | 초안 본문 + 로드되는 rule | 바이트 | 현재 대비 |
|---|---|---|---|
| 문서·설정만 | 본문 | 9,204 | 85.0%(−15.0%) |
| 화면(tsx)만 | 본문 + design | 10,895 | 100.6%(+0.6%) |
| BE(api·types·queries)만 | 본문 + be-integration | 11,675 | 107.9%(+7.9%) |
| 데이터 기능(둘 다) | 본문 + design + be-integration | 13,366 | 123.5%(+23.5%) |

결론: **컨텍스트 크기 이득은 없거나 손해다**(이 프로젝트의 주 작업인 데이터 기능 턴에서 약 24% 증가). P-A9의 근거는 문장 정리(한 줄 한 규칙)·사실 정정·완료 보고 절차의 skill 분리이며, 크기 절감이 목적이라면 rule 쪽 중복을 더 줄여야 한다.

추천: **B, 단 P-A2(D-02)에 따라 첫 기능 뒤 정리.** 초안 줄 수: `examples/claude-md/CLAUDE.draft.md`는 `wc -l` 기준 100줄(현행 `CLAUDE.md`도 100줄, 대조는 `examples/README.md` 대조표). 초안·rules·report skill의 queryKey 문안(`queryOptions` 묶음)은 **D-04가 B로 결정됐을 때의 문안**이다. 예시: `examples/claude-md/CLAUDE.draft.md`, `examples/dot-claude/rules/*.md`, `examples/dot-claude/skills/report/SKILL.md`.

### P-A10. 자율 작업 모드 예외 (AI-13) — D-05

이번 점검처럼 사용자가 지시서로 "질문하지 말고 단계마다 커밋"을 명시한 작업과 현재 Git 규칙이 충돌한다. 현재 규칙: "**`main`에서 직접 작업·커밋·push한다.** 브랜치는 사용자가 요청할 때만 만든다."(`CLAUDE.md:85`), "**커밋 전에는 반드시 사용자 확인을 받는다**"(`CLAUDE.md:86`).

예외 조항 표준 문구(`01-ai-setup.md` AI-13, `decisions-needed.md` D-05, CLAUDE 초안과 동일):

> 사용자가 작업 지시서에 브랜치·커밋 권한을 명시하면, 그 작업 동안은 지정 브랜치에서 커밋 전 확인 없이 작업 끝에 커밋 1개로 묶어 커밋·push한다(2026-10-11 사용자 결정: 단계마다 나누지 않는다). main에는 merge·push하지 않는다(통합은 사용자가 PR로 판단).

면제되는 규칙: `:85`(main 직접 작업)와 `:86`(커밋 전 확인). 유지되는 규칙: `:87`(사용자 변경 파기 금지), `:88`(커밋 형식·squash 금지), `:89`(아카이브 브랜치 미사용).
추천: **B(1줄 추가).** 작업량 S. 결정은 D-05. 동결과의 관계: 새 규칙이라 (a)~(d)에 들지 않으므로 첫 기능 뒤 정리 때 반영한다. 그 전의 자율 작업은 사용자가 준 지시서가 우선한다(이번 점검과 같은 방식).

## 2. 디자인 시스템

### P-D1. 상태 표시 일관성 (DS-01, DS-10 뒷부분)

| 안 | 내용 | 장점 | 단점 | 작업량 |
|---|---|---|---|---|
| A. 문서 규칙만 | "준비 중은 outline 배지" 한 줄 | 코드 변경 최소 | AI가 다음 화면에서 또 고름 | S |
| **B. `StatusBadge` 래퍼** | `src/components/status-badge.tsx` 하나에 의미(`pending`·`success`·`warning`·`error`) → Badge 변형·기호(✓·▲·✕)·문구를 고정. 홈 카드(`src/app/(console)/page.tsx:25`)와 사이드바(`src/components/nav-link.tsx:54`)가 같은 부품 사용 | 같은 의미 = 같은 모양을 코드로 보장. "색만으로 전하지 않는다"(`CLAUDE.md:76`)도 부품이 보장 | 래퍼 1개 추가 | S |
| C. 패턴 부품 일괄(StatusBadge·EmptyState·ErrorState·PageContainer) | 첫 기능 전에 모두 | 첫 기능이 빨라짐 | "미리 만들지 않는다"(`CLAUDE.md:8`) 위반, 실사용 전 설계 | M |

L1 메모: `StatusBadge`는 훅·상태가 없어 지시어 없이 둔다. 서버 파일(`page.tsx`)에서 import하면 서버 컴포넌트로 렌더되고, `"use client"` 파일(`nav-link.tsx:1`)이 import하면 그 사용분은 client 번들에 들어가 client 컴포넌트로 동작한다(작아서 영향 미미).

추천: **B**(지금은 `pending`만 필요하면 `pending`만 — 나머지 의미는 첫 사용 때 추가). 제품 코드라 동결 대상이 아니다. Empty·Error 래퍼는 첫 데이터 기능에서 만들고, **그때 `docs/design-system.md` "패턴"의 3상태 항목(`:44`)에 예시 코드를 추가한다**(DS-10 뒷부분). 예시: `examples/components/status-badge.md`(Before/After).

### P-D2. 역할 정의 — 타이포·컨테이너 (DS-02, DS-03, DS-04, DS-05, CS-08) — D-07

| 안 | 내용 | 장점 | 단점 | 작업량 |
|---|---|---|---|---|
| **A. 문서 표** | `docs/design-system.md`에 "역할 → 클래스" 표: 페이지 제목 `text-2xl font-bold tracking-tight`(PageHeader가 소유), 섹션 제목 `text-lg font-semibold`, 본문 `text-sm`, 보조 `text-sm text-muted-foreground`, 숫자 `tabular-nums` | AI가 고를 여지 축소 | 강제력 없음 | S |
| B. `@utility` 역할 클래스 | `globals.css`에 `text-page-title` 등 | lint로 강제 가능 | 토큰 추가(plan 승인), shadcn 생성물과 이중 체계 | M |
| **C. 부품** | `PageContainer`(폭·여백 1곳: 현재 `(console)/layout.tsx:9`·`:10`, `not-found.tsx:11`, `global-error.tsx:19`에 나뉨), `global-error`도 `PageHeader` 사용(`global-error.tsx:20` 중복 해소). 카드 링크(DS-05)는 C와 별개로 첫 기능 화면에 `href`를 채울 때 그 제품 코드 작업에서 반경·hover·focus를 처리(현재 `consoleFeatures`에 href가 없어 실행되지 않는 분기, `src/lib/console-menu.ts:22-34`) | 컨테이너 3중 정의 해소, 404 폭·여백 통일 | 부품 1개 추가 | S |

404 배치: 루트 `src/app/not-found.tsx`는 `(console)` 그룹 밖이라 콘솔 레이아웃이 적용되지 않는다. 그래서 C만으로는 폭·여백은 맞춰도 사이드바 차이는 남는다. 심각도는 DS-03·CS-08 모두 낮음(시각 불일치). 배치 선택지는 D-07(A 현행 / B `PageContainer`로 폭·여백만 통일 / C 셸을 루트 레이아웃으로 이동 / D `(console)/[...rest]/page.tsx`에서 `notFound()` + `(console)/not-found.tsx`로 셸 안 404 — D는 `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/not-found.md` 확인 필요).

추천: **A + C. D-07은 B**(셸 이동 없이 `PageContainer`로 폭·여백만 통일, 사이드바 없음 유지). 시점은 나눈다: **A(역할 표)는 첫 데이터 기능 착수 묶음 (d)** — 첫 데이터 화면에서 AI가 제목·본문 크기를 고르는 문제라 그 전에 필요하다. **C(`PageContainer`)와 D-07은 여유 있을 때** — 시각 불일치·심각도 낮음이고 첫 기능에 필요하지 않다. 카드 링크(DS-05)의 반경·hover·focus는 첫 기능에서 `href`를 채우는 제품 코드 작업에 포함한다.

### P-D3. 동적 클래스 lint (DS-06)

로컬 규칙 `tmi/no-dynamic-class`: `className`(및 `cn()`·`cva()` 인자) 안의 템플릿 리터럴에 `${…}`가 **클래스 조각에 붙어** 있으면(`` `text-${x}` ``) 오류. 조건부 전체 클래스(`` `${a ? "x" : "y"}` ``, 공백으로 분리된 경우)는 허용. 메시지: "클래스 이름을 조립하지 마세요. Tailwind는 조립된 이름을 생성하지 않습니다. 완성된 클래스를 객체 맵으로 고르세요."
근거: lint 샘플 17건 중 미문서화 구멍은 #4(조립 클래스) 1건뿐이다(차단 10, 정상·의도적 허용 4, 문서화된 한계 2 — `02-design-system.md` 3.2절).
추천: 적용, 시점은 첫 데이터 기능 착수 묶음 (d)(P-A2) — 첫 데이터 화면에서 상태별 클래스를 조립할 여지가 처음 생긴다. 작업량 S. 예시: `examples/eslint/no-dynamic-class.mjs` + 실측 결과(`examples/eslint/README.md`).

### P-D4. 포커스 표시 (DS-08)

실측: 버튼은 `focus-visible:border-ring`(불투명, 배경 대비 약 7.79:1)과 `ring-3 ring-ring/50`(2.69:1)이 함께 있어 포커스 표시가 충분하다(`src/components/ui/button.tsx:6`). 링크는 전역 `outline-ring/50`(`src/app/globals.css:163`)이라 계산값이 `outline: auto 1px`, 색 `ring/50`(2.69:1)이지만, Chromium은 `outline-style: auto`를 자체 포커스 링으로 그려 실제로 또렷이 보인다(`docs/ai-audit/screenshots/pw-focus-link@1280.png`, Tab 2회 후 "홈" 링크 `:focus-visible` = true). Firefox·Safari는 미검증.
참고(`pw-report.json`의 `focusedAfter2Tabs` = `BODY`): 스크립트가 먼저 "사이드바 펼치기" 버튼을 클릭해 포커스가 그 버튼에서 시작했기 때문이다(펼치기 → 홈 → 페이지 밖). 홈 화면의 보이는 포커스 가능 요소는 2개(사이드바 접기 버튼, 홈 링크)뿐이라 그 다음 Tab이 body로 가는 것은 정상이다.

| 안 | 내용 | 장점 | 단점 | 작업량 |
|---|---|---|---|---|
| **A. 현행 유지 + 다른 브라우저 확인** | Firefox·Safari에서 링크 Tab 포커스를 한 번 촬영해 확인. 문제가 보이면 B 또는 C로 | 변경 없음. Chromium 실측 통과 | 확인 전까지 다른 브라우저 상태는 모름 | S |
| B. 다크 `--ring`만 밝게 | `.dark`의 `--ring`·`--sidebar-ring`을 `oklch(0.82 0.143 254.62)`로. 계산상 50% 합성 시 배경 대비 3.38~3.40:1(0.78 → 3.11:1, 0.86 → 3.69:1) | 생성물 수정 없이 `ring/50` 색 자체를 3:1 이상으로 | 토큰 변경(plan 승인 대상). Chromium에서는 이미 보이므로 효과가 작음 | S |
| C. 링크 윤곽 명시 | 링크에 `focus-visible:outline-2`와 불투명 `outline-ring` | 브라우저 자체 링에 의존하지 않음 | 링크 부품마다 클래스 추가 | S |

추천: **A, 시점은 "여유 있을 때".** 다른 브라우저에서 링크 포커스가 흐리게 보이면 C(링크만 명시)를 먼저 검토한다.

### P-D5. 라이트 토큰 (DS-07) — D-06

선택지: A. 유지(전환 대비) / B. 삭제하고 다크만 / C. 유지하되 `pnpm shot`에 라이트 촬영 옵션을 추가해 검증. 사용자 선호(다크 고정, `src/app/layout.tsx:22-23`)에 달린 결정이라 `decisions-needed.md` D-06. 추천은 **B**(검증되지 않는 값은 부채, 필요하면 git 기록에서 되살림).

## 3. 코드 구조

### P-C1. 인증 (CS-01, CS-09) — 배포 전 필수, D-01

| 안 | 내용 | 장점 | 단점 | 작업량 |
|---|---|---|---|---|
| A. BE 인증(Spring Security 세션/JWT) | core가 인증, FE는 로그인 화면 + 쿠키 | 정석, 다른 클라이언트에도 적용 | BE 작업 큼, FE도 로그인·만료 처리 | L(BE+FE) |
| **B. VM 리버스 프록시 인증** | Next 앞단(nginx/Caddy)에서 Basic 인증 또는 IP 제한. FE·BE 코드 변경 없음 | 1인 사용 콘솔에 충분, 즉시 적용 | 프록시 운영 필요, 세분화된 권한 없음 | S(설정) |
| C. Next `proxy.ts` Basic 인증 | Next 16의 `proxy` 파일(`middleware` 대체, `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md:15` "Proxy executes before routes are rendered. It's particularly useful for implementing custom server-side logic like authentication") | FE 저장소 안에서 해결 | 비밀번호를 서버 환경변수로 관리(`env.server.ts` 필요), 직접 구현의 보안 책임 | S~M |

함께 처리: `src/app/(console)/error.tsx:27`이 digest가 없을 때 `error.message` 원문을 화면에 보인다(CS-09). 지금은 개인 사용이라 디버깅에 유리해 유지하고, 인증 도입·공개 배포 때 일반 문구로 바꾼다.
추천: **B로 시작, 외부 사용자가 생기면 A.** CLAUDE.md가 "임의로 정하지 말고 물을 것"(`:98-100`)으로 둔 항목이므로 D-01.

### P-C2. API 오류·재시도 (CS-03, CS-04, CS-11)

문제:
- CS-04(중간): **404를 빈 상태로 바꾸는 위치가 정해지지 않았다.** `src/lib/api/client.ts:34-36`은 404도 `ApiError`로 던지므로 `useQuery`는 `isError`(실패 화면)로 간다. 디자인 규칙은 "조건에 맞는 데이터가 없다는 404는 빈 상태로 그린다"(`docs/design-system.md:44`). 이를 지키려면 `api.ts`에서 404 → 빈 값으로 바꿀지, 컴포넌트에서 `status`로 분기할지 정해야 한다. 부수적으로 `retry: 1`(`src/lib/providers.tsx:14`)이 4xx도 재시도해 약 1초 늦어진다.
- CS-03: `ApiError`를 사용자 문구로 바꾸는 곳이 없다.
- CS-11(낮음): `ApiError`가 아닌 예외 — 네트워크 실패 `TypeError`(`client.ts:24` `fetch`), 200인데 본문이 비어 `res.json()`(`client.ts:40`)이 던지는 `SyntaxError` — 는 정규화 밖이다. 타임아웃·`signal` 전달 관례도 없다.

| 안 | 내용 | 장점 | 단점 | 작업량 |
|---|---|---|---|---|
| A. 현행 | `retry: 1` 전 오류, `ApiError(status, body)` | — | 404가 실패 화면으로 가고(규칙 위반) 1초 늦음, 화면마다 오류 문구 제각각 | 0 |
| **B. 최소 정책** | ① **404 변환 위치**: `features/<name>/api.ts`에서 "없음"을 의미하는 404만 빈 값(빈 배열·`null`)으로 바꾸고 나머지는 그대로 throw ② `retry: (n, e) => !(e instanceof ApiError && e.status < 500) && n < 1`(ApiError 4xx를 제외한 모든 오류(5xx·네트워크·파싱) 1회 재시도. 파싱 오류까지 빼려면 `e instanceof TypeError ||` 조건으로 좁힌다) ③ `client.ts`에 `errorMessage(e)` — `ApiError`는 상태별 한국어 문구, `TypeError`는 "서버에 연결하지 못했습니다", 그 밖(`SyntaxError` 등)은 일반 문구(디자인 문서의 "무엇이 잘못됐고 어떻게 고치는지" 반영) ④ `signal`: P-C4의 `queryOptions`에서 `queryFn: ({ signal }) => api.x(…, { signal })`로 전달(타임아웃 정책은 첫 기능에서 필요할 때) | 작고, 첫 기능부터 일관. 404 처리 위치가 한 곳 | BE 오류 본문 형식은 core 코드 확인 후 반영(현재 확인 불가) | S |
| C. B + 런타임 스키마 검증(zod 등) | 응답 형태 불일치를 즉시 실패로 | BE 계약 추측 위험(`CLAUDE.md:95`) 해소 | 새 의존성, 타입 이중 정의 | M |

추천: **B를 첫 데이터 기능 착수 때 함께.** C는 OpenAPI 타입 생성 결정(`CLAUDE.md:100`)과 묶어서 판단. 예시: `examples/code/api-error-and-retry.md`.

### P-C3. 테스트 (CS-02, AI-11) — D-03

| 안 | 내용 | 장점 | 단점 | 작업량 |
|---|---|---|---|---|
| A. 현행 | typecheck·lint·build·shot | 의존성 0 | 로직·동작 검증 불가 | 0 |
| **B. Vitest + Testing Library** | `src/lib/**`(format, api client, `errorMessage`·`retry`)와 데이터 컴포넌트 3상태를 단위 테스트. client 컴포넌트 위주라 async 서버 컴포넌트 제약 무관(`04-research.md` 3.1) | 완료 조건의 "테스트" 선택지가 실제로 생김. AI가 스스로 돌릴 수 있는 확인 수단 | devDependency 6개 + `vitest.config.mts`(승인 필요) | M |
| C. B + Playwright E2E | 클릭·입력 흐름, `pnpm shot` 대체 | red-team "판정 불가"(`red-team.md:18`) 해소 | 의존성·실행 시간 증가 | L |

추천: **B, 첫 데이터 기능과 함께.** 의존성 승인이 필요하므로 D-03. 도입하면 `package.json`(devDependency 6개 — `pnpm add -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom vite-tsconfig-paths`(6개, Next 설치본 가이드 `node_modules/next/dist/docs/01-app/02-guides/testing/vitest.md` "Manual Setup"의 TypeScript 목록) + 루트 `vitest.config.mts`(같은 가이드의 `react()`·`tsconfigPaths()` 플러그인, `environment: 'jsdom'` — `@/` 경로 import가 테스트에서 풀리려면 `vite-tsconfig-paths`가 필요), `"test": "vitest run --passWithNoTests"` 스크립트, `verify` 포함 여부) 변경과 red-team 예시의 `test` 판정 줄(P-A8 표)이 첫 데이터 기능 착수 묶음 (d)에 들어간다. `--passWithNoTests`는 첫 테스트 파일이 생기기 전에도 exit 0을 내므로, `verify`(`package.json:12`)에 `test`를 넣는 것을 (d) 커밋에서 해도 된다. 완료 조건: (d) 커밋 직후 `pnpm verify` exit 0(적용 시 실측).

### P-C4. queryKey 방식 (L4 대비, CS-11 signal) — D-04

현재 규칙: `["<feature>", ...]` 리터럴(`CLAUDE.md:57`), 재측정 grep도 리터럴 전제(`CLAUDE.md:18`).

| 안 | 내용 | 장점 | 단점 | 작업량 |
|---|---|---|---|---|
| A. 리터럴 유지 | 화면마다 키를 직접 씀 | 학습자가 키 구조를 매번 봄 | 키·queryFn 불일치, invalidate 누락 위험 | 0 |
| **B. feature당 `queryOptions` 묶음** | `englishQueries.all / list(params) / detail(id)`를 `queries.ts` 한곳에서 정의(TkDodo "one Query Key factory per feature", TanStack `queryOptions`, `04-research.md` 3.2). `queryFn({ signal })`로 취소 신호 전달(P-C2 ④) | invalidate가 `englishQueries.all.queryKey` 접두로 일관(L4) | `CLAUDE.md:57`, `:18` 수정(규칙 변경 커밋) | S |

B 채택 시 `CLAUDE.md:18`을 대체할 재측정 명령:

```bash
git grep --untracked -n -E 'queryKey|queryOptions' -- 'src/features/*/queries.ts' || echo '(queryKey 없음)'
```

추천: **B.** 학습 관점에서도 "키 계층(일반 → 구체)"이 한 파일에 보여 L4 설명이 쉬워진다. 결정은 D-04, 반영(`CLAUDE.md:57`·`:18`)은 첫 데이터 기능 착수 묶음 (d).

### P-C5. 단방향 import (CS-07)

`import/no-restricted-paths`로 `components`·`lib` → `features`·`app` 금지, `features` → `app` 금지. 새 의존성 없음(`04-research.md` 부록 B). 추천: feature가 생긴 뒤(첫 기능 뒤 정리) 적용. 예시: `examples/eslint/no-restricted-paths.mjs`(실측 포함).

### P-C6. 미사용 코드와 `cn` 정리 (CS-05, CS-10)

사실:
- shadcn 생성물은 npm `cn` 패키지(`package.json:20` `"cn": "^0.4.0"`, `src/components/ui/button.tsx:3`)를 쓴다. 이 패키지는 `node_modules/cn/package.json`의 description이 "Fast, small, compiled class-name merging for Tailwind CSS. Drop-in replacement for clsx + tailwind-merge."인 **병합 함수**다. 실측: `node -e "import('cn').then(m=>console.log(JSON.stringify(m.cn('p-2 p-4','text-sm text-lg'))))"` → `"p-4 text-lg"`(충돌 클래스는 뒤 값만 남음).
- `src/lib/utils.ts`(clsx + tailwind-merge `cn`)는 사용처 0이고 lint 예외(`eslint.config.mjs:261`)까지 달고 있다. `clsx`·`tailwind-merge`는 이 파일에서만 쓰인다.

제안:
1. 새 직접 작성 래퍼(`StatusBadge`·`PageContainer` 등)도 생성물처럼 **`cn` 패키지**를 쓴다(병합 함수를 하나로).
2. `src/lib/utils.ts`는 삭제 후보, `clsx`·`tailwind-merge`는 삭제 시 의존성 제거 후보.
3. `components.json:17`의 `"utils": "@/lib/utils"` 별칭 영향은 **적용 시 다음 `shadcn add` 때 확인**한다. 확인만을 위해 `shadcn add`를 실행하지 않는다(지시받지 않은 컴포넌트가 생김, `CLAUDE.md:8`).

`apiClient`·빈 `env`(CS-10)는 첫 기능에서 실제 사용 형태가 정해질 때까지 유지. 추천: 첫 기능 뒤 정리. 작업량 S.

### P-C7. `CORE_API_URL` 누락 가드 (CS-12)

문제: `next.config.ts:7` `process.env.CORE_API_URL ?? "http://localhost:8080"`이라 값이 없으면 조용히 localhost로 빌드된다. 값은 빌드 시점에 고정되므로(`next.config.ts:6`) 배포 때 누락을 알 수 없다.

| 안 | 내용 | 장점 | 단점 | 작업량 |
|---|---|---|---|---|
| A. 현행 | 기본값 localhost | 로컬 설정 0 | 배포 빌드 누락이 실행 후에야 드러남(모든 API 실패) | 0 |
| **B. 배포 빌드 가드** | 프로덕션 빌드에서 `CORE_API_URL`이 없으면 오류 메시지와 함께 빌드 실패 | 누락을 빌드 시점에 발견 | 로컬 `pnpm verify`·Stop hook의 build도 프로덕션 빌드이므로, 로컬은 기본값을 허용할 구분 방법(배포 스크립트 전용 변수 등)을 함께 정해야 함. `next.config` 변경이라 Next 문서 확인 대상(`CLAUDE.md:45`) | S |

추천: **B, 시점은 배포 전**(P-C1과 함께).

## 4. 우선순위 로드맵

동결 단계와 예외 기준은 P-A2 "동결 정의"와 같다. (a) 되돌릴 수 없는 피해 방지 (b) 사실과 다르거나 서로 모순되는 지시의 정정 (c) 작업 환경에서 검증 자체를 막는 문제 (d) 첫 데이터 기능에 직접 필요한 결정의 반영.

### 지금 당장 — 동결 예외 (a)(b)(c) + 제품 코드 (각 S)

| # | 항목 | 담당 | 예외 근거 |
|---|---|---|---|
| 1 | **P-A2** 동결 조항(D-02)을 `CLAUDE.md:7` 다음에 문단으로 추가 — 2~5와 같은 chore 커밋 안의 문단 추가이고 별도 행위가 아니다. 커밋 뒤 첫 데이터 기능 착수 전까지 하네스 변경은 (a)(b)(c)만 | 사용자 결정(D-02) / AI | D-02 채택의 직접 반영 — 동결 자체를 선언하는 문단이라 (a)(b)(c)와 별도로 허용 |
| 2 | **P-A7** 문서 사실 오류·모순 일괄 정정: `CLAUDE.md:20`·`:45`(AGENTS 우선순위 명시)·`:60`·`:62`·`:66`, `docs/design-system.md:40`, `eslint.config.mjs:175`·`:188` | AI | (b) |
| 3 | **P-A8** red-team frontmatter `disallowedTools: Edit, Write, NotebookEdit` 1줄 + `red-team.md:30` 문장 정정(예시의 다른 추가 줄은 P-A8 표의 단계대로) | AI | (b) |
| 4 | **P-A5** 가드 보강 + `CLAUDE.md:87` 문구 변경(가드 범위에 맞춤) / **D-09** GitHub main 브랜치 보호 설정(5분) | AI / 사용자 | (a) |
| 5 | **P-A6** `pnpm shot` Linux 대응 + red-team "`pnpm shot` exit 2 = `판정 불가(도구 오류)`" 줄 | AI | (c) |
| 6 | **P-D1** `StatusBadge`로 "준비 중" 통일 | AI | 제품 코드(동결 대상 아님) |

1~5의 하네스 변경은 단독 `chore:` 커밋 1개(그 뒤 새 세션, `CLAUDE.md:7`), 6은 `feat:`/`fix:` 커밋이다. 이 chore 커밋에서 바뀌는 `CLAUDE.md` 줄은 `:7` 다음 문단 추가, `:20`·`:45`·`:60`·`:62`·`:66`, `:87`이 전부다. 이 밖의 줄이 `git diff`에 보이면 plan과 다른 것이다. `docs/harness-backlog.md`는 이 커밋에서 만들지 않고 첫 아이디어가 생길 때 만든다(`CLAUDE.md:8`).

### 다음 기능 개발 전 — 첫 데이터 기능 착수 묶음 (d)

먼저 사용자가 D-01·D-03·D-04를 결정한다. 그다음 순서: ① (d) 규칙 변경 제안 — `CLAUDE.md:7` 형식(바꿀 줄·문구·이유)으로, 첫 기능 이름과 범위만 명시 → ② 승인 후 단독 chore 커밋 → ③ 새 세션에서 첫 기능 SPEC 인터뷰(`docs/spec/<feature>.md`) → ④ `/clear` 후 SPEC을 읽고 기능 plan(`CLAUDE.md:13` 항목)·구현. 아래 표가 ②의 **규칙 커밋 1개**에 들어간다. 이 커밋 뒤 첫 데이터 기능이 커밋될 때까지는 다시 (a)(b)(c)만 허용한다. 이 표에 없는 하네스 변경은 첫 기능 전에 하지 않는다.

| # | 항목 | 담당 | 예외 근거 |
|---|---|---|---|
| 1 | **D-01** 인증 방향 결정 → B 선택 시 `CLAUDE.md` "미정"(`:98-100`)에서 인증 항목 교체(구현은 배포 전) — P-C1 | 사용자 결정 / AI | (d) |
| 2 | **D-03** 테스트 도입 결정 → 도입 시 devDependency·`"test": "vitest run --passWithNoTests"`·`verify` 포함 여부, red-team `test` 판정 줄. 완료 조건: (d) 커밋 직후 `pnpm verify` exit 0(적용 시 실측) — P-C3 | 사용자 결정 / AI | (d) |
| 3 | **D-04** queryKey 방식 결정 → `CLAUDE.md:57`·`:18` 수정 — P-C4 | 사용자 결정 / AI | (d) |
| 4 | **P-A3** SPEC 상시화(`CLAUDE.md:14` + `docs/spec/README.md:3`, 완료 조건·판정 기록 칸) + red-team "SPEC 기록용 한 줄" | AI | (d) |
| 5 | **P-D3** 조립 클래스 lint(`tmi/no-dynamic-class`) | AI | (d) |
| 6 | **P-D2-A** 역할 → 클래스 표(`docs/design-system.md`) | AI | (d) |

같은 시기의 제품 코드(동결 대상 아님): **P-C2** 404 변환 위치 + 4xx 재시도 제외 + 오류 문구 헬퍼, 카드 링크 `href`(DS-05) — 첫 데이터 기능 커밋에 포함.

### 첫 기능 뒤 정리·여유 있을 때 (첫 데이터 기능 커밋 뒤)

| # | 항목 | 담당 | 예외 근거 |
|---|---|---|---|
| 1 | **P-A1** `/learn` skill + `docs/learning/log.md`(D-08) — 첫 기능 커밋 직후, 첫 기능을 첫 `/learn` 대상으로 | 사용자 결정 / AI | 동결 종료 후(첫 기능 뒤 정리의 첫 항목) |
| 2 | **P-A9** CLAUDE.md 구조 개편(첫 기능에서 실제로 쓰인 규칙 기준), DS-09 규칙 + `sidebar-collapse.tsx:35` `aria-expanded` 복원 판단 | AI | 동결 종료 후(첫 기능 뒤 정리) |
| 3 | **P-A4-B** Stop hook 지문에서 `*.md` 제외 → **P-A4-C** PostToolUse lint | AI | 동결 종료 후(첫 기능 뒤 정리) |
| 4 | **P-A10** 자율 작업 예외 조항(D-05). 그 전 자율 작업은 지시서 우선 | 사용자 결정 / AI | 동결 종료 후(첫 기능 뒤 정리) |
| 5 | **P-C5** 단방향 import, **P-C6** `cn` 통일·미사용 코드 정리 | AI | 동결 종료 후(첫 기능 뒤 정리) |
| 6 | **P-D2-C** `PageContainer` + **D-07** 404 배치(추천 B) | 사용자 결정 / AI | 여유 있을 때(심각도 낮음) |
| 7 | **P-D4** 다른 브라우저 포커스 확인, **P-D5** 라이트 토큰 결정 반영(D-06) | 사용자 / AI | 여유 있을 때 |
| 8 | P-C3-C Playwright E2E(필요가 확인되면) | 사용자 결정 / AI | 여유 있을 때 |

### 배포 전

1. **P-C1** 인증 구현(D-01), CS-09 오류 문구 교체 포함
2. **P-C7** `CORE_API_URL` 누락 가드

### 점검 종료 시

1. **D-10** 점검 작업 부산물(`check-done.sh`·`settings.json` 수정·`.gitattributes`) 처분

## 리뷰 반영 기록(라운드 1)

| # | 지적 요약 | 처리 | 위치 |
|---|---|---|---|
| 1 | P-A10 문구가 현재 규칙(`CLAUDE.md:85`)과 반대, 커밋 전 확인 면제 여부 누락, 초안과 불일치 | 반영. "여전히 금지" 삭제, 표준 문구로 교체(01 AI-13·D-05·초안과 동일 문구), `:85`·`:86` 원문 인용, 면제·유지 규칙 나열. 리뷰 예시 문구("main에는 직접 커밋하지 않는다") 대신 메인 세션이 확정한 표준 문구를 씀 | P-A10 |
| 2 | P-A4-B "한 줄 수준"·"문서 코드 예시는 lint 대상 아님"이 사실과 다름 | 반영. "10여 줄 변경, 미실측"으로 정정, HEAD 해시(`stop-check.mjs:55`) 설명 추가. 제외 범위를 `':(exclude)*.md'`로 좁히고 `docs/**` 전체는 빼지 않음(examples `.mjs`가 lint 대상). 완료 조건 3개 추가. 리뷰가 대안으로 든 "globalIgnores에 `docs/**` 추가"는 examples `.mjs` 검사를 잃으므로 선택지로 넣지 않음 | P-A4 |
| 3 | "7주간 규칙 커밋 11개" 부정확 | 반영. "스캐폴딩 이후 CLAUDE.md 변경 커밋 10개, 7일(09-28~10-04), 같은 기간 feat 4개, 데이터 기능 0개"와 측정 명령으로 교체. D-02 문장도 수정 | P-A2, `decisions-needed.md` D-02 |
| 4 | 동결 추천과 '지금 당장' 하네스 변경 5건이 긴장, 예외 기준 없음 | 반영. P-A2에 예외 기준 (a)(b)(c) 명시, '지금 당장'을 예외 근거 열이 있는 표로 변경. P-A4-B는 기준 밖이라 첫 기능 뒤로 이동. P-D1은 제품 코드로 표기. P-A6은 리뷰 예시("클라우드 세션에서만 필요")와 달리 (c)로 유지 — 그 환경에서는 완료 보고 규칙 자체를 지킬 수 없음 | P-A2, P-A4, 4절 '지금 당장' |
| 5 | DS-09·CS-09·AI-12·DS-10 후반이 어느 제안에도 연결 안 됨 | 반영. DS-09 → P-A7 정정 표("shadcn 함정" 절 1줄, 리뷰 제안인 P-D4·`aria-expanded` 복원 대신 문서 규칙으로), CS-09 → P-C1(공개 배포 때 처리), AI-12 → D-10, DS-10 후반 → P-D1(첫 데이터 기능에서 예시 코드). 추가로 DS-05 → P-D2(C), CS-11 → P-C2, CS-12 → 새 P-C7 (라운드 2에서 DS-09는 P-A9로 이동, R2 #2) | 0절 표, P-A7, P-C1, P-D1, P-D2, P-C2, P-C7 |
| 6 | D-02·D-08·D-09 미참조, '지금 당장 3'에 사용자 작업 섞임 | 반영. 0절 표에 "관련 결정" 열 추가(D-01~D-10 모두 연결), 제안 제목에 D-ID 표기. '지금 당장 3'을 "AI: 가드 보강 / 사용자: D-09(5분)"로 분리 | 0절 표, 4절 |
| 7 | P-C6이 `cn` 패키지 성격을 확인하지 않음, 래퍼가 쓸 `cn` 미정, 확인용 `shadcn add` 실행 권고 | 반영. `node_modules/cn/package.json` description으로 병합 함수임을 확인, 새 래퍼도 `cn` 패키지 사용 권장, `utils.ts`·`clsx`·`tailwind-merge`를 삭제 후보로. 확인용 `shadcn add`는 권하지 않고 "적용 시 다음 shadcn add 때 확인"으로 변경. 리뷰가 권한 "`cn` 선택을 결정 항목으로" 및 "임시 디렉터리 dry-run"은 미반영 — 근거가 확인돼 추천이 하나로 정해지고, 임시 실행도 지시받지 않은 작업이므로 | P-C6 |
| 8 | P-A9 "약 60줄"이 초안(90줄)과 다름, `paths`가 예시와 다름 | 반영. 초안 갱신 후 `wc -l` 100줄(현행과 같음), 목표 수치 삭제. `paths`를 `examples/dot-claude/rules/be-integration.md`·`design.md` 기준으로 통일. paths 규칙의 로드 시점 때문에 plan 단계용 BE 계약 한 줄은 본문에 남긴다고 명시. queryOptions 문안은 D-04=B 조건부로 표시 | P-A9 |
| 9 | P-C4 표에 작업량 칸 없음, 새 grep 미제시 | 반영. 작업량 열(S) 추가, 대체 재측정 명령 본문에 기재 | P-C4 |
| 10 | P-D5 요약표 추천 누락, P-D2에 D-07 추천 미기재 | 반영. 요약표 "결정 필요(D-06), 추천 B 삭제", P-D2에 "D-07은 B" 명시와 선택지 A~D 요약 | 0절 표, P-D2, P-D5 |
| — | (공통 사실 반영) 포커스 대비 | P-D4를 실측(버튼 `border-ring` 7.79:1, Chromium 링크 자체 링 통과) 기준으로 재작성, 추천 B → A(현행 유지 + 다른 브라우저 확인), 시점 "여유 있을 때"로 이동 | P-D4, 0절 표, 4절 |
| — | (공통 사실 반영) `layout.tsx:22` 표기 | `:22-23`으로 통일(주석 22행, `dark` 클래스 23행) | P-D5 |

## 리뷰 반영 기록(라운드 2)

반영 근거: `reviews/05-proposals-round-2.md` "지적 사항" 7건과 메인 세션이 확정한 동결 정의.

| # | 지적 요약 | 처리 | 위치 |
|---|---|---|---|
| 1 | 동결 정의(커밋 시까지 a/b/c만)와 '다음 기능 전' 하네스 변경 6건이 모순, D-02 순서도 다름 | 반영. 리뷰 선택지 (나)에 가깝게 동결을 2단계로 정의: 지금 (a)(b)(c), 첫 데이터 기능 착수 시 (d) 묶음(D-01·D-03·D-04·P-A3·P-A1·P-D3·P-D2-A)을 첫 기능 plan과 함께 규칙 커밋 1개로, 그 뒤 첫 기능 커밋까지 다시 (a)(b)(c)만. 리뷰 (나)는 P-A1·P-D3을 첫 기능 뒤로 옮기자고 했으나 메인 세션 확정 정의에 따라 (d)에 포함. 4절을 '지금 당장 (a)(b)(c)' / '다음 기능 개발 전 = (d)' / '첫 기능 뒤 정리·여유 있을 때'로 재구성하고 항목마다 예외 근거 열. "위 1~4가 마지막 하네스 변경" 문구 삭제. D-02 '바로 시작할 작업'을 같은 순서로 수정 | P-A2, 4절, 0절 표, `decisions-needed.md` D-02 |
| 2 | DS-09는 새 규칙이라 (b)가 아니고 위반 코드가 남음, `CLAUDE.md:45`도 새 규칙 | DS-09 반영: P-A7 정정 표에서 행 제거, 0절 매핑을 P-A9로, P-A9에 `rules/design.md` 문장과 `sidebar-collapse.tsx:35` `aria-expanded` 복원 여부(ghost 버튼 스타일은 `className`으로 덮어쓰기)를 같은 커밋에서 판단한다고 기재. `CLAUDE.md:45`는 미반영 — AGENTS.md "before writing any code"와 `:45`가 서로 모순되므로 우선순위 명시는 (b)의 "모순되는 지시의 정정"에 해당한다고 기준 문장과 정정 표에 명시 | P-A7, P-A9, 0절 표, 4절, `02-design-system.md` 7절 |
| 3 | D-07 시점이 문서마다 다름, 대조표에 시점 없음 | 반영. P-D2를 나눠 A(역할 표)는 (d), C(`PageContainer`)·D-07은 여유 있을 때로 통일(리뷰 추천 "다음 기능 전으로 맞춤" 대신 대안인 "404 부분을 여유 있을 때로"를 택함 — 심각도 낮음, 첫 기능에 불필요). decisions 대조표에 '시점' 열 추가, 10개 모두 시점 대조 | P-D2, 0절 표, 4절, `decisions-needed.md` 표·D-07·대조표 |
| 4 | P-A10/D-05가 동결 예외 어디에도 안 듦 | 반영. "첫 기능 뒤 정리 때 반영, 그 전 자율 작업은 지시서 우선(이번 점검과 같은 방식)" 명시 | P-A10, 0절 표, 4절, `decisions-needed.md` D-05 |
| 5 | 라운드 1 반영 기록 #8의 "90줄"이 본문(100줄)과 다름 | 반영. "초안 갱신 후 `wc -l` 100줄(현행과 같음), 목표 수치 삭제"로 수정 | 리뷰 반영 기록(라운드 1) #8 |
| 6 | P-C2 B ② 재시도 설명이 식과 다름 | 반영. "ApiError 4xx를 제외한 모든 오류(5xx·네트워크·파싱) 1회 재시도", 파싱 오류를 빼는 조건 병기 | P-C2 |
| 7 | `console-menu.ts` 범위 22-34, `cn` 병합 실행 근거 없음 | 반영하지 않음 — 파일이 34줄(`wc -l`, `cat -n` 34행이 `];`)이라 `:22-34`가 맞다. 리뷰의 22-35는 오류. `node`로 `cn('p-2 p-4','text-sm text-lg')`를 실행해 나온 `"p-4 text-lg"`와 명령을 P-C6에 기재 | P-D2, P-C6 |

## 리뷰 반영 기록(라운드 3)

반영 근거: `reviews/05-proposals-round-3.md` "지적 사항" 8건과 메인 세션이 실측·확정한 공통 사실(P-A8 '지금' 범위, '지금' 커밋의 변경 줄 목록, P-A1 시점, (d) 순서, D-03 문안, P-C5·P-C6 시점, P-A4 HEAD 처리, 상시 로드 비교).

| # | 지적 요약 | 처리 | 위치 |
|---|---|---|---|
| 1 | 02 DS-09 대응이 아직 P-A7, R2 #2가 05·examples에만 반영 | 02는 담당 외라 이 문서에서 고치지 않음 — 메인 세션이 `02-design-system.md` 7절 DS-09 대응을 P-A9(첫 기능 뒤 정리)로 이미 고쳤다. 이 문서에서는 R2 #2 위치 칸에 `02-design-system.md` 7절 추가 | 리뷰 반영 기록(라운드 2) #2 |
| 2 | P-A8 예시를 '지금 (b)'에 그대로 옮기면 (d)·새 규칙이 함께 들어감 | 반영(리뷰 (가)에 가깝게). '지금'은 `disallowedTools` 1줄 + `red-team.md:30` 문장 정정뿐으로 한정하고, 예시의 추가 줄을 표로 분류: test 판정 줄 → (d) D-03, SPEC 기록 줄 → (d) P-A3, shot exit 2 줄 → (c) P-A6과 같은 '지금' 커밋. 리뷰는 shot exit 2 줄을 backlog로 제안했으나 도구 오류 구분은 P-A6의 검증 환경 문제와 같은 범주라 (c)로 둠 | 0절 표, P-A8, P-A6, P-A3, P-C3, 4절 '지금 당장' #3·#5, (d) #2·#4 |
| 3 | '지금' 커밋의 `CLAUDE.md:7`(동결 조항)·`:87` 변경이 05 4절에 없음 | 반영. '지금 당장' #1을 동결 조항 추가(근거: D-02 채택의 직접 반영, a/b/c와 별도로 허용, 같은 chore 커밋 안의 문단 추가)로 바꾸고, #2(P-A7)에 `CLAUDE.md:20`·`:45`·`:60`·`:62`·`:66`, `docs/design-system.md:40`, `eslint.config.mjs:175`·`:188`, #4(P-A5)에 `:87` 문구 변경을 명시. 표 아래에 이 커밋에서 바뀌는 `CLAUDE.md` 줄 전체와 `docs/harness-backlog.md`는 이 커밋에서 만들지 않음(`CLAUDE.md:8`)을 적음 | 4절 '지금 당장', `decisions-needed.md` D-02 |
| 4 | (d) 기준과 P-A1(`/learn`)이 맞지 않음 | 반영(리뷰 (가)). P-A1을 '첫 기능 커밋 직후(첫 기능 뒤 정리 묶음의 첫 항목)'로 이동. (d) 기준 문장은 그대로 두고, P-A4-B와 같은 잣대(첫 기능 구현에 필요한가)로 뺐다고 P-A2에 명시 | 0절 표, P-A1, P-A2, 4절 (d)·정리 표, `decisions-needed.md` D-08·중요도 표·대조표 |
| 5 | (d) 순서 "첫 기능 plan과 함께 규칙 커밋 → SPEC 인터뷰"가 순환 | 반영. "첫 기능 plan과 함께"를 삭제하고 ① (d) 규칙 변경 제안(`CLAUDE.md:7` 형식, 첫 기능 이름·범위만) → ② 단독 chore 커밋 → ③ 새 세션 SPEC 인터뷰 → ④ `/clear` 후 기능 plan(`CLAUDE.md:13`)·구현으로 같은 문장을 씀 | P-A2, 4절 (d), `decisions-needed.md` D-02 |
| 6 | D-03 문안 `vitest run`이 테스트 0개에서 verify를 깨뜨림 | 반영. `"test": "vitest run --passWithNoTests"`로 바꾸고 verify 포함은 (d) 커밋에서 해도 된다고 적음. 완료 조건 "(d) 커밋 직후 `pnpm verify` exit 0(적용 시 실측)" 추가 | P-C3, 4절 (d) #2, `decisions-needed.md` D-03 |
| 7 | 01 AI-05, 03 CS-07, examples README의 시점 표기 불일치 | 01·03·examples는 담당 외라 이 문서에서 고치지 않음. 05의 기준은 P-A4 B·C, P-C5·P-C6 모두 '첫 기능 뒤 정리'로 이미 같다(0절 표, 4절). 01 AI-05는 메인 세션이 같은 기준으로 고쳤다 | — |
| 8 | R1 #5에 뒤집힌 표시 없음 | 반영. 끝에 "(라운드 2에서 DS-09는 P-A9로 이동, R2 #2)" 추가 | 리뷰 반영 기록(라운드 1) #5 |
| — | (공통 사실) P-A4 B의 HEAD 처리 | 반영. `git ls-tree -r -z HEAD` + `\0` 분리로 고치고 근거 `examples/dot-claude/hooks/stop-check.diff.md:11` | P-A4 |
| — | (공통 사실) 상시 로드 비교의 결론 | 반영. P-A9에 턴 종류별 표(`wc -c` 직접 측정: 문서·설정 9,204B 84.2% / 화면 10,775B 99.5% / BE 11,585B 107.0% / 데이터 기능 13,246B 122.4%, 현재 10,825B 기준)와 "컨텍스트 크기 이득은 없거나 손해" 결론. A·B 장단점과 P-A2 C의 "컨텍스트 즉시 감소"도 이에 맞게 수정 | P-A9, P-A2 |

| — | (메인 세션) examples 라운드 3 수정으로 초안·design rule 크기가 바뀜 | 반영. P-A9 표를 `wc -c` 재측정값(초안 9,204B, design 1,691B, be-integration 2,471B)으로 갱신. 결론 방향은 같음 | P-A9 |

## 리뷰 반영 기록(라운드 4)

| # | 지적 요약 | 처리 | 위치 |
|---|---|---|---|
| 1 | README:18-19가 라운드 3 이전 순서 | 반영(메인 세션이 README 수정) | `README.md` |
| 2 | 02:152 본문 DS-09 조치가 P-A9와 반대 | 반영(메인 세션이 02 수정) | `02-design-system.md` 5.3 |
| 3 | D-03 설치 목록·config 누락 | 반영. 설치본 Next 가이드 기준 6개 + `vitest.config.mts` | P-C3, `decisions-needed.md` D-03 |
| 4 | D-09 확인 방법 | 반영. 읽기 전용 `gh api` 조회 | `decisions-needed.md` D-09 |
| — | (examples 라운드 4 후속) P-A6 B 후보 경로가 예시와 다름 | 반영. 예시와 같은 탐색 방식으로 | P-A6 |
