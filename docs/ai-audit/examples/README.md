# examples — 추천안 기준 개선 예시

`05-proposals.md`의 추천안을 실제 파일 형태로 쓴 것. **저장소에 적용된 것은 없다.** 적용은 plan 승인 → 규칙 변경 `chore:` 커밋 → 새 세션 순서(`CLAUDE.md:7`)이고, 언제 무엇을 넣는지는 아래 "적용 단계"(05 P-A2 동결 정의와 같은 기준)를 따른다.

## 이름 규칙 (중요)

- `.claude/` 대신 **`dot-claude/`**, `CLAUDE.md` 대신 **`claude-md/CLAUDE.draft.md`** 로 둔다. Claude Code는 하위 폴더의 `CLAUDE.md`를 그 폴더 파일을 읽을 때 자동으로 불러오므로(https://code.claude.com/docs/en/memory "Files in subdirectories load on demand."), 진짜 이름으로 두면 이 예시가 실제 지침으로 섞여 들어갈 수 있다.
- **그대로 옮기는 완전한 파일**: `dot-claude/X` → `.claude/X`(`agents/red-team.md`는 (d)까지 모두 넣은 최종형이고 줄마다 넣는 단계가 다르다 — 아래 "red-team 추가 줄의 적용 단계", `skills/*/SKILL.md`, `rules/*.md`, `hooks/lint-file.mjs`, `settings.json`), `claude-md/CLAUDE.draft.md` → `CLAUDE.md`, `docs/X` → `docs/X`(`docs/learning/log.md`는 예시 줄 삭제).
- **복사하지 않고 병합하는 부분 예시**: 이름이 `*.diff.md`·`*.additions.mjs`인 파일(`hooks/stop-check.diff.md`, `hooks/guard-bash.additions.mjs`, `scripts/shot.diff.md`)과 `eslint/`·`components/`·`code/`의 문서는 기존 파일의 지정 위치에 끼워 넣는다. 그대로 `.claude/`에 두면 기존 hook을 덮거나 쓰이지 않는 파일이 된다.

## 목록

"실측"은 아래 칸에 적은 케이스만 실제로 돌렸다는 뜻이다. 적힌 범위 밖의 동작은 확인하지 않았다. 적용 시점의 "(a)(b)(c)", "(d)"는 05 P-A2 동결 정의의 예외 기준이다.

| 파일 | 제안 | 적용 시점 | 실측 여부 |
|---|---|---|---|
| `claude-md/CLAUDE.draft.md` | P-A9(구조) + P-A7(사실 정정)·P-A1·P-A3·P-A10·P-C2·P-D1·P-D3 반영. queryKey 줄은 D-04 조건부 | **첫 기능 뒤 정리**(P-A9). 그 전에 현재 `CLAUDE.md`에 넣을 문안은 아래 "적용 단계" | 문서. `wc -l -c` 100줄(아래) |
| `dot-claude/rules/design.md` · `be-integration.md` | P-A9 — 경로별 규칙(`paths:` frontmatter). 본문과 겹치는 원칙은 "본문 참조"로 두고 세부만. DS-09 문장(`design.md:16`) 포함 | 첫 기능 뒤 정리 | 문서. `paths` 로드 동작은 적용 시 실측 필요 |
| `dot-claude/skills/learn/SKILL.md` | P-A1 — 학습 체크포인트 `/learn` | 첫 기능 뒤 정리(첫 기능 커밋 직후, 정리 묶음의 첫 항목) | 문서 |
| `dot-claude/skills/report/SKILL.md` | P-A9 — 완료 보고 절차를 skill로. 재측정 명령은 D-04 조건부 | 첫 기능 뒤 정리 | 문서 |
| `dot-claude/agents/red-team.md` | P-A8(`disallowedTools`) + `pnpm shot` exit 2 구분, 테스트 판정 조건, SPEC 기록 한 줄 | 줄마다 다름: `disallowedTools`·규칙 절 문장은 지금 (b), exit 2 줄은 지금 (c)(P-A6), 테스트 판정 줄은 (d)(D-03), SPEC 기록 줄은 (d)(P-A3). 줄 끝 `# 적용:`/`<!-- 적용: -->` 주석과 아래 표 | 문서(**완전한 파일**, (d) 뒤 최종형). 현재 `.claude/agents/red-team.md`와 `diff` → 추가 4줄·변경 1줄만, 판정 기준(:43)과 발견 형식(:42) 그대로 |
| `dot-claude/settings.json` | P-A4-C — PostToolUse 등록 | 첫 기능 뒤 정리(P-A4-B 다음) | JSON 파싱 확인 |
| `dot-claude/hooks/lint-file.mjs` | P-A4-C — 편집 직후 파일 단위 lint | 첫 기능 뒤 정리 | **실측**: 정상 파일 exit 0, src 밖 exit 0, 위반 임시 파일 exit 2 + 위반 2건 출력(임시 파일 삭제 확인) |
| `dot-claude/hooks/stop-check.diff.md` | P-A4-B — Markdown 변경은 지문에서 제외(`*.md`만, `docs/**` 전체는 아님) | 첫 기능 뒤 정리 | **실측**: pathspec 결과, 지문 함수만 떼어 로컬 클론에서 8단계, 한글 파일명 임시 저장소에서 `ls-tree -z` 비교. hook 자체는 미실행 |
| `dot-claude/hooks/guard-bash.additions.mjs` | P-A5 — 래핑 우회·파기 명령·로컬 보호 브랜치 이동 검사, `guard-bash.mjs`에 끼우는 위치 | 지금 (a) | **실측**: 아래 84건 모두 기대대로. 실제 가드의 `RUNS_GIT`·`gitSubcommand`·`FORCE_FLAG` 복사본을 거치고, 원본과 같은지 먼저 확인. 끼워 넣은 상태도 스크래치 사본으로 실측(아래 "가드 통합 실측") |
| `eslint/no-dynamic-class.mjs` · `no-restricted-paths.mjs` · `verify.config.mjs` · `README.md` | P-D3, P-C5 — 디자인 토큰 위반(조립 클래스)·역방향 import lint | P-D3 다음 기능 전 (d), P-C5 첫 기능 뒤 정리 | **실측**: 샘플 전체(README에 수록) 10·11줄 차단, 변수에 담은 조립·문자열 `+` 조립은 미검출(한계), 현재 `src` 거짓 양성 0 |
| `components/status-badge.md` | P-D1 — 컴포넌트 Before/After | 지금(제품 코드라 동결 대상 아님) | **실측**: After 코드 typecheck·lint 통과(임시 파일 후 삭제), `cn` 병합 출력. 화면은 미확인 |
| `code/api-error-and-retry.md` | P-C2 — 404 변환 위치, 4xx 재시도 제외, 오류 문구 헬퍼 | 제품 코드. 첫 데이터 기능 커밋에 포함 | BE 꺼짐 시 상태 코드(dev, 500)만 실측. 코드는 미컴파일 |
| `scripts/shot.diff.md` | P-A6 — Linux root 대응, Playwright 경로 탐색 | 지금 (c) | 탐색 함수만 이 환경에서 실행. 같은 효과의 래퍼로 `pnpm shot` 실측, 패치는 미실행 |
| `docs/spec/TEMPLATE.md` | P-A3 — 완료 조건·판정 기록 | 다음 기능 전 (d) | 문서 |
| `docs/learning/log.md` | P-A1 — 학습 로그 형식 | 첫 기능 뒤 정리(P-A1과 함께) | 문서(예시 2줄) |

## 적용 단계 — 현재 `CLAUDE.md`에 줄 단위로 넣을 문안

`CLAUDE.draft.md`는 P-A9(첫 기능 뒤 정리) 시점의 완성본이다. 그 전 두 단계에서 현재 `CLAUDE.md`(100줄)에 넣을 문구를 아래에 줄 번호와 함께 적는다. 줄 번호는 모두 현재 `CLAUDE.md` 기준이다. 같은 단계의 변경은 한 번의 규칙 커밋으로 넣고, 넣은 뒤 줄 번호가 밀리므로 **아래쪽 줄부터** 고친다.

### 지금 (a)(b)(c)

아래 1~5는 단독 `chore:` 커밋 1개로 넣고 새 세션에서 시작한다(05 4절 "지금 당장"과 같은 목록). 이 커밋에서 바뀌는 줄은 아래가 전부다. 이 밖의 줄이 `git diff`에 보이면 plan과 다른 것이다.

| 파일:줄 | 변경 | 근거 |
|---|---|---|
| `CLAUDE.md:7` 다음 | 동결 조항 문단 추가(아래 1) | D-02 채택의 직접 반영 — 동결 자체를 선언하는 문단이라 (a)(b)(c)와 별도로 허용 |
| `CLAUDE.md:20`·`:45`·`:60`·`:62`·`:66` | 사실 정정(아래 2) | P-A7, (b) |
| `CLAUDE.md:87` | 문구 변경(아래 4) | P-A5, (a) |
| `docs/design-system.md:40`, `eslint.config.mjs:175`·`:188` | 사실 정정(아래 2) | P-A7, (b) |
| `.claude/agents/red-team.md` frontmatter 1줄·`:30` | `disallowedTools` 추가, 문장 정정(아래 3) | P-A8, (b) |
| `.claude/agents/red-team.md:15` 다음 | `pnpm shot` exit 2 줄(아래 5) | P-A6과 같은 범주, (c) |
| `.claude/hooks/guard-bash.mjs` | 가드 보강(아래 4) | P-A5, (a) |
| `scripts/shot.mjs` | Linux 대응(아래 5) | P-A6, (c) |

1. **P-A2 동결 선언(D-02)** — `:7` 다음 줄에 넣는다. 2~5와 같은 chore 커밋 안의 문단 추가이고 별도 행위가 아니다. 첫 데이터 기능이 커밋되면 만료되므로 `CLAUDE.draft.md`(첫 기능 뒤 적용)에는 넣지 않았다.
   > **하네스 동결(두 단계)**: ① 지금부터 첫 데이터 기능 착수 전까지 규칙·hook·lint·agent·skill·스크립트 변경은 (a) 되돌릴 수 없는 피해 방지, (b) 사실과 다르거나 서로 모순되는 지시의 정정, (c) 작업 환경에서 검증 자체를 막는 문제만 한다. ② 첫 데이터 기능 착수 때 (d) 첫 데이터 기능에 직접 필요한 결정의 반영(D-01·D-03·D-04 결정 반영, SPEC 상시화, 조립 클래스 lint, 역할 표)을 규칙 변경 제안(첫 기능 이름과 범위 명시) → 승인 후 단독 `chore:` 커밋 1개로 넣고, 새 세션에서 첫 기능 SPEC부터 시작한다. 그 뒤 첫 데이터 기능이 커밋될 때까지는 다시 (a)(b)(c)만 한다. 그 밖의 개선 아이디어는 `docs/harness-backlog.md`에 한 줄로 적는다. 제품 코드(`src/`)는 동결 대상이 아니다.
2. **P-A7 사실 정정 (b)** — 정정 표(위치·현재·정정안)는 `05-proposals.md` P-A7에 있다. 그 표대로 `CLAUDE.md:20`·`:45`·`:60`·`:62`·`:66`, `docs/design-system.md:40`, `eslint.config.mjs:175`·`:188`만 고친다. `:45`의 AGENTS 우선순위 명시(모순 해소)도 여기에 든다. 초안에는 같은 정정이 이미 들어 있다(아래 대조표 "P-A7" 표시). DS-09(aria 규칙)는 새 규칙이라 여기서 하지 않는다(첫 기능 뒤, 아래).
3. **P-A8 (b)** — 지금 넣는 것은 frontmatter의 `disallowedTools: Edit, Write, NotebookEdit` 1줄과 규칙 절(현재 `.claude/agents/red-team.md:30`, 예시 :33) 문장 정정뿐이다. 예시 파일을 통째로 옮기지 않는다. 다른 추가 줄은 아래 표의 단계에 넣는다.

   **red-team 추가 줄의 적용 단계** (예시 파일 줄 끝 주석과 같은 내용, 05 P-A8 표와 같다. 옮길 때 `# 적용:`·`<!-- 적용: -->` 주석은 지운다)

   | 예시 `red-team.md` 줄 | 넣는 단계 | 근거 |
   |---|---|---|
   | :4 `disallowedTools`, :33 규칙 절 문장 정정 | 지금 (b), P-A8 | 지시("코드는 고치지 않고")와 권한의 모순 정정 |
   | :17 `pnpm shot` exit 2 = `판정 불가(도구 오류)` | 지금 (c), P-A6과 같은 커밋 | 도구 오류 구분은 P-A6의 검증 환경 문제와 같은 범주 |
   | :21 `test` 스크립트가 있을 때만 `pnpm test` 판정 | (d), D-03과 함께(아래 (d) 2) | 테스트 도입 결정의 반영 |
   | :45 "SPEC 기록용 한 줄" | (d), P-A3과 함께(아래 (d) 4) | SPEC 상시화의 반영 |
4. **P-A5 (a)** — `guard-bash.additions.mjs` 머리 주석의 위치대로 `.claude/hooks/guard-bash.mjs`에 끼운다. 같은 커밋에서 `:87`을 아래로 바꾼다(현재: "사용자의 워킹트리 변경을 `stash`/`reset`/`checkout .`/`restore .`로 버리지 않는다."):
   > - 사용자의 워킹트리 변경을 `stash`/`reset --hard`/`checkout .`/`restore .`/`switch -f`로 버리지 않고, 로컬 main·아카이브 브랜치를 지우거나 옮기지 않는다(가드가 차단한다).
5. **P-A6 (c)** — `scripts/shot.diff.md`대로 `scripts/shot.mjs`를 고치고, 예시 `red-team.md:17`(`pnpm shot` exit 2 줄)을 현재 `.claude/agents/red-team.md:15` 다음 줄에 넣는다. `CLAUDE.md` 변경 없음.

### 첫 데이터 기능 착수 묶음 (d)

먼저 사용자가 D-01·D-03·D-04를 결정한다. 그다음 순서: ① (d) 규칙 변경 제안 — `CLAUDE.md:7` 형식(바꿀 줄·문구·이유)으로, 첫 기능 이름과 범위만 명시 → ② 승인 후 단독 chore 커밋 → ③ 새 세션에서 첫 기능 SPEC 인터뷰(`docs/spec/<feature>.md`) → ④ `/clear` 후 SPEC을 읽고 기능 plan(`CLAUDE.md:13` 항목)·구현. 아래가 ②의 **규칙 커밋 1개**에 들어간다(05 4절 "다음 기능 개발 전" 표와 같은 목록). 이 커밋 뒤 첫 데이터 기능이 커밋될 때까지는 다시 (a)(b)(c)만 허용한다. 번호 5는 비워 둔다(P-A1을 첫 기능 뒤 정리로 옮김, 다른 문서가 (d) 6·7 번호를 인용한다).

1. **D-01(B 선택 시)** — `:100`을 "OpenAPI 기반 타입 생성."으로 줄이고, `:96` 다음 줄에 넣는다:
   > - 인증: VM 리버스 프록시 Basic 인증(D-01, <결정일>). 설정은 배포 환경에서 하고 FE 코드에는 넣지 않는다.

   A·C를 고르면 인증 구현이 별도 plan이 되므로 이 묶음에서는 `:100`만 "인증/세션: <선택안>으로 결정(<결정일>), 구현은 별도 plan"으로 바꾼다.
2. **D-03(도입 시)** — 먼저 `pnpm add -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom vite-tsconfig-paths`(6개, Next 설치본 가이드 `node_modules/next/dist/docs/01-app/02-guides/testing/vitest.md` "Manual Setup"의 TypeScript 목록) + 루트 `vitest.config.mts`(같은 가이드의 `react()`·`tsconfigPaths()` 플러그인, `environment: 'jsdom'` — `@/` 경로 import가 테스트에서 풀리려면 `vite-tsconfig-paths`가 필요)를 추가한다(plan에 의존성 추가 사유, `CLAUDE.md:13` ③). 그다음 `package.json:5-14` `scripts`에 `"test": "vitest run --passWithNoTests"`를 추가한다(첫 테스트 파일이 생기기 전에도 exit 0). 그래서 `verify`(`:12`)에 `test`를 넣는 것도 이 (d) 커밋에서 해도 된다(넣을지는 결정 내용대로). 예시 `red-team.md:21`(테스트 판정 줄)을 현재 `.claude/agents/red-team.md:18` 다음 줄에 넣는다. `CLAUDE.md:13`의 "확인 방법(`pnpm shot`·측정·테스트)"은 이미 테스트를 포함하므로 바꾸지 않는다. 완료 조건: (d) 커밋 직후 `pnpm verify` exit 0(적용 시 실측). `verify`에 `test`를 넣기로 하면 초안 `claude-md/CLAUDE.draft.md:54`의 명령 설명도 "typecheck + lint + test + build (Stop hook은 test 제외)"로 바꾼다(첫 기능 뒤 초안 적용 시).
3. **D-04(B 선택 시)** — 두 줄을 바꾼다. A면 바꾸지 않는다.
   - `:57` → `│   ├── queries.ts        # TanStack Query 훅. queryKey는 feature당 queryOptions 묶음(<feature>Queries)으로 정의, 무효화는 묶음의 접두 키로`
   - `:18` → `  git grep --untracked -n -E 'queryKey|queryOptions' -- 'src/features/*/queries.ts' || echo '(queryKey 없음)'`
4. **P-A3 SPEC 상시화** — 세 곳과 파일 1개.
   - `:14` 교체:
     > - **모든 feature는 구현 전에 SPEC을 `docs/spec/<feature>.md`에 쓴다**(템플릿 `docs/spec/TEMPLATE.md`, 화면 1개면 짧게). 화면 2개 이상이면 사용자 인터뷰 후 SPEC만 쓰고, **이어서 구현하지 말고** "`/clear` 후 그 파일을 읽고 구현하라"고 안내하며 턴을 끝낸다.
   - `:22` 다음 줄에 추가:
     > - 레드팀이 끝나면 완료 조건별 판정·증거 경로와 레드팀의 "SPEC 기록용 한 줄"을 SPEC의 "완료 조건"·"레드팀" 표에 채운 뒤 완료 보고한다.
   - `docs/spec/README.md:3` 교체: "모든 feature는 구현 전에 `docs/spec/<feature>.md`로 SPEC을 쓴다(템플릿 `TEMPLATE.md`). 화면 2개 이상이면 인터뷰 후 SPEC만 쓰고 턴을 끝낸다 (CLAUDE.md "작업 루프" 참고)."
   - `docs/spec/TEMPLATE.md` 복사(머리말 3줄의 "제안 P-A3 예시"·"적용 시 함께 고칠 파일" 문장은 지운다).
   - 예시 `red-team.md:45`("SPEC 기록용 한 줄")를 현재 `.claude/agents/red-team.md:41` 다음 줄에 넣는다.
5. (비움 — P-A1 `/learn`은 첫 기능 뒤 정리의 첫 항목으로 옮겼다. 아래 "첫 기능 뒤 정리")
6. **P-D3 조립 클래스 lint** — `eslint.config.mjs`와 `CLAUDE.md` 한 줄.
   - `eslint/no-dynamic-class.mjs`의 `noDynamicClass` 객체를 `eslint.config.mjs`의 기존 로컬 규칙(`noRawDesignValues`, `:114`) 옆에 같은 방식으로 붙여 넣는다. `:245` 플러그인 등록에 `"no-dynamic-class": noDynamicClass`를 더하고, `:249`(`"tmi/no-raw-design-values": "error"`) 다음 줄에 `"tmi/no-dynamic-class": "error",`를 넣는다. 적용 뒤 `pnpm -s lint`로 현재 `src` 거짓 양성 0을 다시 확인한다(`eslint/README.md` 실측과 같은 결과여야 한다).
   - `:75` 교체:
     > - 색·크기는 토큰 클래스만 쓴다. lint가 변수·객체 안 문자열과 `className`·`cn()` 안에서 템플릿으로 조립한 클래스(`` `text-${x}` ``)까지 막는다. 변수에 먼저 담거나 `+`로 이어 붙인 조립은 lint가 못 잡으므로 조립하지 말고 완성된 클래스를 객체 맵에서 고른다. 필요한 토큰이 없으면 즉석에서 만들지 말고 plan에 "토큰 추가"로 올린다.
   - `docs/design-system.md:19`("lint가 막는 것") 목록 끝(`새 `.css` import` 뒤)에 추가: "`className`·`cn()` 안에서 템플릿으로 조립한 클래스(`` `text-${x}` ``)."
   - `docs/design-system.md:21`("lint로 못 막는 것") 목록 끝에 추가: "조립 결과를 변수에 먼저 담거나 `+`로 이어 붙인 클래스(조립하지 말고 완성된 클래스를 객체 맵에서 고른다)."
7. **P-D2-A 역할 표** — `docs/design-system.md:21` 다음("## 의미 → 색" 앞)에 절을 넣고, `CLAUDE.md:77` 끝에 한 문장을 붙인다.
   ```markdown
   ## 역할 → 글자 클래스

   | 역할 | 클래스 |
   |---|---|
   | 페이지 제목 | `PageHeader`가 소유(`text-2xl font-bold tracking-tight`, `src/components/page-header.tsx:16`). 화면에서 직접 쓰지 않는다 |
   | 섹션 제목 | `text-lg font-semibold` |
   | 본문 | `text-sm` |
   | 보조 설명 | `text-sm text-muted-foreground` |
   | 숫자 | `tabular-nums`(표의 숫자 열은 `text-right`) |
   ```
   `:77` 끝에 추가: "글자 크기·굵기는 디자인 문서의 \"역할 → 글자 클래스\" 표에서 고른다."

### 첫 기능 뒤 정리 (첫 데이터 기능 커밋 뒤)

- **P-A1 `/learn`(D-08)** — 첫 기능 커밋 직후, 정리 묶음의 첫 항목. 첫 `/learn` 시험은 첫 데이터 기능 커밋을 대상으로 한다. `/learn`은 기능 완료 뒤 사람이 호출하는 도구라 첫 기능 구현에 필요하지 않아 (d)에 들지 않는다(05 P-A1). 파일 2개: `dot-claude/skills/learn/SKILL.md` → `.claude/skills/learn/SKILL.md`, `docs/learning/log.md` → `docs/learning/log.md`(예시 2줄 삭제). 같은 정리 묶음에서 P-A9로 `CLAUDE.draft.md`를 넣으면 초안 :10·:42에 이미 들어 있어 따로 고칠 줄이 없다. P-A1만 먼저 넣을 때 현재 `CLAUDE.md`에 넣을 문안:
  - `:6` 교체(사용자 역할에 학습 체크를 더해 `:6`의 "만 한다"와 모순되지 않게):
    > **코드는 AI가 100% 작성한다. 사용자는 plan 승인, 증거 확인, 커밋 승인, 학습 체크(`/learn`)만 한다** — 그 밖의 수동 단계를 사용자에게 넘기지 않는다.
  - `:36` 다음 줄에 추가:
    > - 기능 완료 보고 끝에 "`/learn`으로 이번 결정을 점검할 수 있습니다"를 한 줄 덧붙인다. 답을 먼저 알려주지 않는다.
- **P-A9** — `CLAUDE.draft.md`·`rules/*.md`·`skills/report/SKILL.md`로 교체한다. DS-09는 이때 `rules/design.md:16`("시각 문제를 접근성 속성(`aria-*`) 제거로 풀지 않는다")으로 들어간다. 같은 작업에서 `src/components/sidebar-collapse.tsx:35`(주석 "aria-expanded는 쓰지 않는다: ghost 버튼이 \"열린 메뉴\"처럼 채워 그린다")의 `aria-expanded` 복원 여부를 함께 판단한다. 복원하면 ghost 버튼의 `aria-expanded` 스타일은 `className`으로 덮어쓴다(`src/components/ui/` 수정 금지). 규칙과 코드가 어긋난 채 남지 않게 같은 커밋에서 처리한다.
- **P-A10(D-05)** — 첫 기능 뒤 정리 때 반영한다. 그 전의 자율 작업은 사용자가 준 지시서가 우선한다(이번 점검과 같은 방식). 넣을 곳은 `:86` 다음 줄(초안 93줄과 같은 문구):
  > 사용자가 작업 지시서에 브랜치·커밋 권한을 명시하면, 그 작업 동안은 지정 브랜치에서 커밋 전 확인 없이 작업 끝에 커밋 1개로 묶어 커밋·push한다(2026-10-11 사용자 결정: 단계마다 나누지 않는다). main에는 merge·push하지 않는다(통합은 사용자가 PR로 판단).
- **P-A4-B·C** — `stop-check.diff.md`, `lint-file.mjs`, `settings.json`.
- **P-C5·P-C6** — `eslint/no-restricted-paths.mjs`, `cn` 통일.

## CLAUDE.draft.md 줄 수와 대조표

실측(`wc -l -c`, 2026-10-11, 리뷰 라운드 3 반영 후): 현재 `CLAUDE.md` **100줄 / 10,825바이트**, `claude-md/CLAUDE.draft.md` **100줄 / 9,204바이트**. 함께 쓰는 파일: `rules/design.md` 16줄 / 1,691바이트, `rules/be-integration.md` 20줄 / 2,471바이트, `skills/report/SKILL.md` 23줄, `skills/learn/SKILL.md` 27줄.

턴 종류별 로드 크기(`wc -c`로 직접 잼. rule은 `paths`에 맞는 파일을 읽거나 편집할 때 로드된다):

| 턴 종류 | 초안 본문 + 로드되는 rule | 바이트 | 현재 `CLAUDE.md`(10,825) 대비 |
|---|---|---|---|
| 문서·설정만 | 본문 | 9,204 | 85.0%(−15.0%) |
| 화면(tsx)만 | 본문 + `rules/design.md` | 10,895 | 100.6%(+0.6%) |
| BE(api·types·queries)만 | 본문 + `rules/be-integration.md` | 11,675 | 107.9%(+7.9%) |
| 데이터 기능(둘 다) | 본문 + design + be-integration | 13,366 | 123.5%(+23.5%) |

**결론: 컨텍스트 크기 이득은 없거나 손해다(이 프로젝트의 주 작업인 데이터 기능 턴에서 증가).** 줄어드는 것은 rule 경로 밖의 문서·설정 턴뿐이다. P-A9의 근거는 ① 한 줄 한 규칙으로 풀린 문장 ② 사실 정정(P-A7, 지금 별도로 함) ③ 완료 보고 절차의 skill 분리이며, 크기 절감이 목적이라면 rule 쪽 중복을 더 줄여야 한다. 첫 기능 뒤로 미뤄도 잃는 것이 작다는 05 P-A2·P-A9의 시점 판단과 맞는다. (라운드 2 결론 "상시 로드 약 16% 감소, 절감은 문서·설정·BE 연동 턴"은 BE·데이터 기능 턴에서 틀려 라운드 3에서 위 표로 바꿨다. 05 P-A9 표도 같은 재측정값(초안 9,204·design 1,691·be 2,471)으로 맞췄다.)

줄 수는 줄지 않았다. 리뷰 라운드 1에서 대조 없이 빠졌던 규칙 6개를 되살리고, plan 단계에 필요한 BE 규칙("새 엔드포인트는 `파일:줄`, 모르면 묻는다")과 503 안내를 본문에 남겼기 때문이다. `paths:` rule은 해당 파일을 읽거나 편집할 때만 로드되므로, 아직 `api.ts`가 없는 plan 시점에는 rule이 없을 수 있다. 개편의 효과는 줄 수나 크기가 아니라 ① 보고 절차가 skill로 빠지고 디자인·BE 세부가 해당 파일 작업에서만 보이며 ② 한 줄에 여러 규칙을 묶은 줄이 풀리고 ③ 사실 오류(P-A7)가 고쳐지는 것이다. 새로 더한 것은 SPEC 상시화(P-A3), `/learn`(P-A1), D-05 예외(P-A10)다.

현재 `CLAUDE.md` 줄 → 초안(또는 rule·skill) 위치. "축약"은 뜻을 유지하고 문장을 줄인 것, "삭제"는 이유를 적었다.

| 현재 줄 | 내용 | 초안 위치 | 비고 |
|---|---|---|---|
| :1, :3, :5 | AGENTS import, 제목, 프로젝트 소개 | 1, 3, 5 | "FE를 배우는" 추가 |
| :6 | AI 100% / 사용자 역할 | 9-10 | `/learn` 추가(P-A1, 첫 기능 뒤 정리). 문안은 위 "첫 기능 뒤 정리" P-A1과 동일 |
| :7 | 규칙 변경 절차 | 15-16 | |
| :8 | 미리 만들지 않는다 | 11 | |
| :12-13 | plan 생략 조건·필수 항목 | 20-21 | |
| :14 | 화면 2개 이상 SPEC | 22 | 모든 feature SPEC(P-A3). (d) 묶음에서 현재 `CLAUDE.md`에 먼저 넣는 문안은 위 "적용 단계" (d) 4 |
| :15-19 | 완료 보고 5요소·재측정 명령 | 26 + `skills/report/SKILL.md:11-19` | 재측정 2번째 줄은 D-04 조건부 |
| :20 | 서브에이전트 hook | 28 | P-A7 정정 |
| :21 | `pnpm shot` 설명, exit 1/2, 직접 띄운 dev 서버 종료·포트 확인 | 55, 58 | 축약("네트워크 대기" 등 세부는 스크립트 동작) |
| :22 | red-team, 최대 3바퀴, 막힘 리포트 | 24, 25 | 25(기록)는 (d) 4의 `:22` 다음 줄 문안과 동일("완료 조건"·"레드팀" 표) |
| :23 | 디버깅 원인 1줄 | 23 | |
| :27-33 | L1~L5 표 | 32-38 | |
| :35 | `Learn:` trailer 예 | 40 | 예를 `["english"]` 접두 키로(D-04와 무관한 표기) |
| :36 | L1~L3 완료 보고 첫 줄 | 41 + `skills/report/SKILL.md:10` | 다음 줄 42의 `/learn` 안내는 "첫 기능 뒤 정리" P-A1 문안과 동일 |
| :40 | 막힘 리포트 | 46 | |
| :44 | 스택·pnpm만·Base UI | 50 | |
| :45 | Next 문서 읽기 범위 | 59 | P-A7 정정, `proxy` 추가 |
| :49-63 | 폴더 구조 | 63-72 | P-A7 정정(mobile-nav·sidebar-collapse·sidebar-store), status-badge(P-D1 적용 후) |
| :64 | 위반은 ESLint가 잡음 | 61(제목) | |
| :66 | useQuery만, Suspense 금지와 이유, use client 위치 | 74-75 | P-A7 정정("말단") |
| :67 | 3상태, error/loading.tsx 한계 | 76 | |
| :68 | queryKey 값 위치, Zustand | 77 | queryKey 정의 방식은 D-04 조건부 |
| :69 | env.server.ts·`server-only` 설치·비밀값은 BE·`.env.example` | 78 | |
| :70 | `shadcn add`, `cn`·`sonner`·`next-themes` 예외와 보고, shadcn 함정 | 56 | |
| :74 | 디자인 문서 먼저 읽기 | 80 | plan 단계에 필요해 본문에 둔다. `rules/design.md:9`는 "본문 참조" + 문서에서 볼 곳만 |
| :75 | 토큰 클래스만, 토큰 추가는 plan | `rules/design.md:11` | (d) 6 `:75` 문안과 동일(템플릿 조립 차단, 변수·`+` 조립 미검출) + `@utility` 주의 |
| :76 | primary 사용처, 색만으로 전하지 않기 | `rules/design.md:12-13` | StatusBadge(P-D1) |
| :77 | PageHeader, metadata | `rules/design.md:14` + 64 | |
| :81 | 새 화면·메뉴 href | 79 | 축약("사이드바와 홈 카드가 함께 바뀐다" 삭제 — 동작 설명) |
| :85 | main 직접 작업, 브랜치 정리 | 91 | 끝의 "막히는 명령은 hook이 이유를 알려준다" 삭제 — hook stderr가 직접 알려 줌 |
| :86 | 커밋 전 확인 | 92 | 다음 줄 93에 D-05 예외(P-A10) |
| :87 | 파기 명령 금지 | 94 | 지금 4 문안과 동일(`switch -f`, 로컬 main·아카이브 브랜치 보호, "가드가 차단한다") |
| :88-89 | 커밋 형식, 아카이브 | 95-96 | |
| :93 | 호출 경로 | 84 + `rules/be-integration.md:14`(세부: `CORE_API_URL` 빌드 시점 고정, LLM 주소 금지) | rule은 본문과 같은 문장을 반복하지 않는다(:12 "본문 참조") |
| :94 | 주력 BE, 코드가 기준 | 84(요약) + `rules/be-integration.md:15`(세부: controller 경로, API 명세는 참고, 서비스 구분) | |
| :95 | 새 엔드포인트 `파일:줄`, 모르면 묻기, mock 분기 | 85 + `rules/be-integration.md:16`(세부: 응답 필드, SPEC 기록, mock 분기) | mock 분기는 rule에만 |
| :96 | `/similarity` 문제, 503은 BE | 86 + `rules/be-integration.md:20`(세부: word는 `/judge`) | |
| :98-100 | 미정 | 98-100 | 인증 미정의 위험 설명 추가. D-01 결정 뒤에는 아래 "D-01 조건부 문안"대로(= (d) 1 문안) |

## D-01(인증) 조건부 문안

초안 :100은 D-01 미결정 상태의 문안이다. (d) 1에서 현재 `CLAUDE.md`에 넣은 문구가 초안 교체(첫 기능 뒤 정리) 때 사라지지 않도록, D-01 결정에 따라 초안을 아래처럼 바꾼 뒤 교체한다.

| 파일:줄 | 미결정(현재 초안) | B(VM 리버스 프록시 Basic 인증)일 때 | A·C일 때 |
|---|---|---|---|
| `claude-md/CLAUDE.draft.md:87` 다음("BE 연동" 절 끝, 현재 `CLAUDE.md:96` 다음과 같은 자리) | — | 줄 추가: "- 인증: VM 리버스 프록시 Basic 인증(D-01, <결정일>). 설정은 배포 환경에서 하고 FE 코드에는 넣지 않는다." | 추가 없음 |
| `claude-md/CLAUDE.draft.md:100` | "인증/세션 방식(**VM 공개 배포 전 필수** — …) · OpenAPI 기반 타입 생성." | "OpenAPI 기반 타입 생성." | "인증/세션: <선택안>으로 결정(<결정일>), 구현은 별도 plan · OpenAPI 기반 타입 생성." |

## D-04(queryKey 방식) 조건부 문안

D-04는 아직 결정되지 않았다(`decisions-needed.md`). 예시의 queryOptions 문안은 **D-04가 B로 결정됐을 때의 문안**이다. A(현행 리터럴)로 결정되면 바꿀 곳:

| 파일:줄 | B 문안 | A일 때 |
|---|---|---|
| `claude-md/CLAUDE.draft.md:77` | `<feature>Queries` 묶음 | 줄 안의 "(A면: …)" 문장만 남긴다 |
| `dot-claude/rules/be-integration.md:18` | 묶음 접두 키 무효화 | 19줄의 A 문안으로 교체 |
| `dot-claude/skills/report/SKILL.md:18` | `queryKey\|queryOptions` grep | 현재 `CLAUDE.md:18` 명령 |
| `docs/spec/TEMPLATE.md:27` | `<feature>Queries.*` | `["<feature>", ...]` |

## guard 보강 시험 출력 (2026-10-11)

```
$ node docs/ai-audit/examples/dot-claude/hooks/guard-bash.additions.mjs
ok    guard-bash.mjs 원본과 RUNS_GIT·gitSubcommand·FORCE_FLAG 복사본 일치
ok    bash -c "git push --force"                     sub=push block=true
ok    (git push --force)                             sub=push block=true
ok    env git push --force                           sub=push block=true
ok    sudo git push -f                               sub=push block=true
ok    $(echo git) push -f                            sub=null block=false
ok    git branch -D "v3"                             sub=branch block=true
ok    for b in v3 v2; do git branch -D "$b"; done    sub=branch block=true
ok    git switch -C "main"                           sub=switch block=true
ok    git checkout -B 'main'                         sub=checkout block=true
ok    git branch -D "feature-x"                      sub=branch block=false
ok    echo $(git reset --hard)                       sub=reset block=true
ok    x=1 $(git push -f)                             sub=push block=true
ok    echo "$(git checkout .)"                       sub=checkout block=true
ok    echo `git stash`                               sub=stash block=true
ok    sudo -E git push -f                            sub=push block=true
ok    sudo -u root git push -f                       sub=push block=true
ok    time -p git push -f                            sub=push block=true
ok    bash -lc "git push -f"                         sub=push block=true
ok    bash -c "cd /tmp; git reset --hard"            sub=reset block=true
ok    g=git; $g push -f                              sub=null block=false
ok    echo '$(git reset --hard)'                     sub=null block=false
ok    git commit -m "fix; git push -f 금지"            sub=commit block=false
ok    git status                                     sub=status block=false
ok    git -C . push -f                               sub=push block=true
ok    git push origin +main                          sub=push block=true
ok    git push origin feat-x                         sub=push block=false
ok    git reset --hard HEAD                          sub=reset block=true
ok    git checkout .                                 sub=checkout block=true
ok    git checkout -- src/app/page.tsx               sub=checkout block=true
ok    git checkout HEAD src/a.ts                     sub=checkout block=true
ok    git checkout package.json                      sub=checkout block=true
ok    git checkout -f main                           sub=checkout block=true
ok    git checkout main                              sub=checkout block=false
ok    git checkout -b feat-x main                    sub=checkout block=false
ok    git restore .                                  sub=restore block=true
ok    git restore --staged --worktree .              sub=restore block=true
ok    git restore --staged src/a.ts                  sub=restore block=false
ok    git switch --discard-changes main              sub=switch block=true
ok    git switch -f main                             sub=switch block=true
ok    git switch main                                sub=switch block=false
ok    git branch -D v3                               sub=branch block=true
ok    git branch -f main HEAD~1                      sub=branch block=true
ok    git branch -D feat-x                           sub=branch block=false
ok    git branch -d main                             sub=branch block=false
ok    git stash                                      sub=stash block=true
ok    git stash drop                                 sub=stash block=true
ok    git stash list                                 sub=stash block=false
ok    git stash pop                                  sub=stash block=false
ok    git stash apply                                sub=stash block=false
ok    git clean -fd                                  sub=clean block=true
ok    git clean -fd src/components/ui/x src/app      sub=clean block=true
ok    git clean -f -- src/components/ui/dialog.tsx   sub=clean block=false
ok    git switch -C main HEAD~3                      sub=switch block=true
ok    git switch --force-create=main HEAD~3          sub=switch block=true
ok    git checkout -B main HEAD~3                    sub=checkout block=true
ok    git branch -m main old-main                    sub=branch block=true
ok    git branch -M feat-x main                      sub=branch block=true
ok    git switch -C feat-x                           sub=switch block=false
ok    git checkout -B feat-x                         sub=checkout block=false
ok    git branch -m feat-a feat-b                    sub=branch block=false
ok    timeout 5 git push -f                          sub=push block=true
ok    timeout -s KILL 5 git push -f                  sub=push block=true
ok    echo v3 | xargs git branch -D                  sub=branch block=false
ok    xargs -n 1 git branch -D v3                    sub=branch block=true
ok    for b in x; do git branch -D v3; done          sub=branch block=true
ok    for b in v3 v2; do git branch -D $b; done      sub=branch block=true
ok    for b in feat-a feat-b; do git branch -D ${b}; done sub=branch block=false
ok    for b in a; do git status; done                sub=status block=false
ok    if true; then git push -f; fi                  sub=push block=true
ok    if git diff --quiet; then echo ok; else git reset --hard; fi sub=diff block=true
ok    { git reset --hard; }                          sub=reset block=true
ok    ! git reset --hard                             sub=reset block=true
ok    while true; do git stash; done                 sub=stash block=true
ok    git switch -qC main HEAD~3                     sub=switch block=true
ok    git switch -Cq main                            sub=switch block=false
ok    git checkout -qB main HEAD~3                   sub=checkout block=true
ok    git checkout -fB feat-x                        sub=checkout block=true
ok    git branch -qD v3                              sub=branch block=true
ok    git branch -qM feat-x main                     sub=branch block=true
ok    git fetch . +HEAD~3:main                       sub=fetch block=false
ok    git update-ref refs/heads/main HEAD~3          sub=update-ref block=false
ok    git checkout package.json                      sub=checkout block=true cwd=<저장소 루트>
ok    git checkout package.json                      sub=checkout block=false cwd=<빈 임시 디렉터리>
ok    cd src && git checkout app/page.tsx            sub=checkout block=false cwd=<저장소 루트>
84건 모두 기대대로
```

- `$(echo git) push -f`, `g=git; $g push -f`의 `block=false`는 **처리 불가 한계**를 기대값으로 고정한 것이다(명령 이름이 실행 시점에 정해짐). 이 구멍은 원격 브랜치 보호(P-A5 C, D-09)로 메운다. `echo v3 | xargs git branch -D`도 대상이 stdin에서 와서 미검출로 고정했다.
- 로컬 보호 브랜치(main·아카이브) 포인터 이동: `git branch -f/-M/-m/-C`, `git switch -C/--force-create`, `git checkout -B`의 대상이 보호 브랜치면 차단한다. `git switch -C main HEAD~3`은 allow 목록(`.claude/settings.json:21` `git switch *`)에 있어 기본 권한 모드에서 확인 없이 실행되던 조합이다. 작업 브랜치 대상(`switch -C feat-x`, `checkout -B feat-x`, `branch -m feat-a feat-b`)은 허용한다.
- 접두 명령 `timeout`(옵션 뒤 시간 값 1개를 건너뜀)과 `xargs`(값 받는 옵션 표 포함)를 펼친다.
- 셸 예약어 뒤의 git(리뷰 라운드 3 #4): 세그먼트 앞의 `do`·`then`·`else`·`elif`·`if`·`while`·`until`·`{`·`!`를 벗긴다. `for b in x; do git branch -D v3; done`은 `;` 분리 뒤 `do git branch -D v3` 세그먼트가 되어 차단된다. `for 변수 in 목록`의 `$변수`·`${변수}`는 `done`까지 목록 값마다 바꿔 넣어 검사한다(`for b in v3 v2; do git branch -D $b; done` 차단, `feat-a feat-b` 목록은 허용). 목록이 `$(…)`·글롭처럼 동적이면 바꿔 넣지 못하고 `$b` 그대로 보아 통과시킨다(xargs와 같은 한계).
- 짧은 옵션 묶음: git parse-options처럼 값 받는 글자(`switch`의 `-C`·`-c`, `checkout`의 `-B`·`-b`) 뒤의 나머지를 값으로, 끝이면 다음 인자를 값으로 읽는다. `git switch -qC main HEAD~3`·`git checkout -qB main HEAD~3`은 차단, `git switch -Cq main`은 git이 `-C q`(새 브랜치 q를 main에서 만듦)로 읽으므로 허용한다(임시 저장소에서 git으로 확인: `-Cq main` → "Switched to a new branch 'q'", main 그대로 / `-qC main HEAD~1` → main이 HEAD~1로 이동). `f`·`D`·`m`·`M`·`C`(branch)는 기존 `hasShort`가 묶음 안에서 찾는다(`-fB`, `-qD`, `-qM`).
- `block`은 기존 force push 판정(`guard-bash.mjs:60`, `:65`)과 새 `destructiveReason()` 중 하나라도 걸리면 true다.
- `git stash pop/apply`는 숨긴 변경을 되살리는 쪽이라 허용한다. `stash drop`은 숨긴 변경을 지우므로 차단한다.
- `git checkout <파일>`(`--` 없음)은 **hook 입력의 `cwd`**(`destructiveReason(…, { cwd: input.cwd })`)를 기준으로 그 경로가 있을 때 차단한다. 라운드 1 구현은 hook 프로세스의 cwd를 봤다. 시험은 두 방식으로 돌린다: 대부분은 존재 판정을 고정 목록으로 바꿔 실행 위치와 무관하게 재현하고, 마지막 3건은 실제 파일 시스템에서 `cwd`=저장소 루트(차단)와 빈 임시 디렉터리(허용)를 비교한다.
- 한계: 같은 명령 줄 앞 세그먼트의 `cd <dir> && git checkout <파일>`과 `git -C <dir> checkout <파일>`은 실행 위치 변화를 반영하지 못해 경로가 없다고 보고 통과시킨다(`cd src && git checkout app/page.tsx` 미검출로 고정). `cd`를 따라가려면 세그먼트 순서대로 cwd를 갱신해야 하는데, `cd` 실패·`pushd`·변수 경로까지 다뤄야 해서 넣지 않았다. 이 경우 `--`를 붙인 형태나 `.`는 그대로 차단된다.
- 한계(막지 않는 로컬 main 포인터 이동): `git fetch . +HEAD~3:main`, `git update-ref refs/heads/main HEAD~3`(시험에 미검출로 고정). 쓰임이 드물고, 원격 브랜치 보호(D-09)와 reflog로 복구할 수 있어 넣지 않았다.

## 프로젝트 검증과의 관계

- `examples/` 안의 `.mjs`는 루트 `pnpm lint`(대상: 저장소 전체, `eslint.config.mjs:324-332`의 `globalIgnores`에 `docs` 없음)에 포함된다. 리뷰 반영 후 `pnpm -s lint`로 exit 0을 확인했다(커밋 전). 그래서 Stop hook 지문에서 `docs/**` 전체를 빼면 안 된다(`dot-claude/hooks/stop-check.diff.md`).
- `.tsx` 예시는 파일로 두지 않고 Markdown 코드 블록으로만 둔다. `tsconfig.json:27-28`의 `**/*.tsx` include 때문에 파일로 두면 프로젝트 typecheck 대상이 되어, 나중에 부품 API가 바뀔 때 문서 예시가 빌드를 깨뜨릴 수 있다.

## 리뷰 반영 기록(라운드 1)

리뷰: `docs/ai-audit/reviews/examples-round-1.md`. 16건 모두 반영했다. 05 문서 안의 서술은 05 담당 범위라 이 폴더에서는 고치지 않았다(해당 행에 표시).

| # | 지적 요약 | 처리 | 위치 |
|---|---|---|---|
| 1 | stop-check `**/*.md`가 루트 .md를 못 뺌, JS 필터 기준 불일치 | 반영: `':(exclude)*.md'`와 `p.endsWith(".md")`로 통일, 루트 CLAUDE.md 케이스 포함 지문 실측 | `dot-claude/hooks/stop-check.diff.md` |
| 2 | status-badge L1 설명이 반대 | 반영: import한 쪽에 따라 서버/client로 동작, nav-link 사용분은 client 번들 포함. Next 문서 줄 인용 | `components/status-badge.md` plan ② |
| 3 | `docs/**` 제외 시 examples .mjs가 검사망에서 빠짐, "lint는 src·설정만" 서술 오류 | 반영(examples 쪽): `docs/**` 제외 삭제, 주석 정정, 위 "프로젝트 검증과의 관계"에 근거 줄 추가. 05 P-A4 B 단점 문구 정정은 05 담당 | stop-check.diff.md, 이 README |
| 4 | guard 주석과 구현 불일치(`$(…)` 중간, `sudo -E`, `time -p`, `bash -lc`), 시험 parse가 실제와 다름, 끼울 diff 없음 | 반영: 따옴표 인식 분할·치환 추출·접두 명령 옵션 표·묶음 `-c` 구현, 동적 명령 이름은 한계로 명시(기대값 미검출), 시험이 실제 RUNS_GIT·gitSubcommand 복사본을 거치고 원본 일치 확인, 끼울 위치(`:38-39`, `:86` 다음) 주석 | `dot-claude/hooks/guard-bash.additions.mjs` |
| 5 | 파기 명령 누락(restore --staged --worktree, checkout HEAD 경로, switch -f, clean 경로 섞임), stash pop 차단 | 반영: 모두 추가, branch -D/-f(로컬 main·아카이브) 추가, stash pop/apply 허용과 근거 | 같은 파일 `destructiveReason`, 위 시험 출력 |
| 6 | 초안의 동결 조항이 적용 시점에 만료, P-A7만 쓸 예시 없음 | 반영: 동결 조항을 초안에서 빼고 "P-A2 채택 시 지금 추가할 문단"으로 분리, P-A7 정정 표는 05 P-A7에 있다고 안내 | 이 README "지금 적용분"(라운드 2에서 "적용 단계"로 개편), `claude-md/CLAUDE.draft.md` |
| 7 | 미결정 D-04를 확정처럼 씀, README 반영 제안 목록 누락 | 반영: 4개 파일에 "D-04가 B로 결정됐을 때의 문안" 표시, A일 때 바꿀 줄 표, 목록에 P-C2·P-D1·P-D3 명시(P-C4는 D-04 조건부 문안으로 표시) | 이 README "D-04 조건부 문안", 각 파일 |
| 8 | 초안에서 사라진 규칙 6개, 60줄 목표와 실제 차이 | 반영: 6개 모두 초안 본문에 복원(78, 56, 55, 58줄), 줄 대조표 추가, `wc -l` 실측 100줄과 이유 기재(목표 수치는 쓰지 않음) | 초안, 이 README 대조표 |
| 9 | plan 단계 BE 규칙이 paths rule에만 있음, 503 안내, paths 목록 불일치 | 반영: "새 엔드포인트 `파일:줄`, 모르면 묻기"와 503 안내를 초안 본문(85-86줄)에 남김. paths는 예시 파일(5개) 기준으로 두고 05 P-A9 표 정정은 05 담당 | 초안 "BE 연동", `rules/be-integration.md:12` |
| 10 | design rule이 StatusBadge 기호를 이미 그리는 것처럼 씀 | 반영: "현재 pending만 있음, 새 의미는 `STATUS`에 기호와 문구를 함께 추가" | `dot-claude/rules/design.md:13` |
| 11 | status-badge가 DS-05를 해결한다고 함 | 반영: 제목·본문에서 DS-05 삭제(P-D2(C)로 넘김은 05 담당) | `components/status-badge.md` |
| 12 | 변수에 담은 조립 클래스 한계 누락, 샘플 발췌 | 반영: 한계 실측 추가, 샘플 전체 17줄 수록 후 재실행 출력으로 갱신 | `eslint/README.md`, `eslint/no-dynamic-class.mjs:13` |
| 13 | 404 처리 모순, 401/403 로그인 문구, 503 "채점 서버", BE 꺼짐 상태 코드 미확인 | 반영: `api.ts`에서 "없음" 404만 빈 값 변환 예시, 401/403 중립 문구, 503 "서버가 일시적으로 응답하지 않습니다", BE 꺼짐 = dev 500 실측 | `code/api-error-and-retry.md` |
| 14 | `/opt/pw-browsers/chromium`은 환경 전용 | 반영: `PLAYWRIGHT_BROWSERS_PATH` 아래 `chromium-*/chrome-linux/chrome`을 `readdirSync`로 찾는 코드, 이 환경에서 실행 확인 | `scripts/shot.diff.md` |
| 15 | red-team 주석 "도구 차단" 과장 | 반영: "Edit/Write 도구만 차단, Bash 쓰기는 여전히 문장 규칙" | `dot-claude/agents/red-team.md`(라운드 2에서 변경점 주석을 지우고 완전한 파일로 바꿈. 같은 뜻이 "규칙" 절 :33에 있음) |
| 16 | TEMPLATE 적용 시 `docs/spec/README.md:3` 수정 언급 없음 | 반영: 머리말에 함께 고칠 파일과 문구 명시 | `docs/spec/TEMPLATE.md:5` |

## 리뷰 반영 기록(라운드 2)

리뷰: `docs/ai-audit/reviews/examples-round-2.md`. 지적 10건을 모두 반영했다. 아래 "—" 행은 리뷰 지적이 아니라 05·decisions와 맞추려고 고친 것이다(근거 문서·절을 함께 적는다).

| # | 지적 요약 | 처리 | 위치 |
|---|---|---|---|
| 1 | `red-team.md` 출력 절이 판정 기준과 발견 형식을 지움, 파일 대부분이 자리표시, README:8 일괄 복사 안내, 없는 `pnpm test` | 반영: 현재 `.claude/agents/red-team.md` 전문을 바탕으로 한 **완전한 파일**로 다시 씀. 더한 것은 `disallowedTools`, `pnpm shot` exit 2 구분, 테스트 판정 조건(`test` 스크립트가 있을 때만, 없으면 `판정 불가(테스트 없음)`), 규칙 절 편집 도구 문구, SPEC 기록 한 줄뿐(`diff`로 확인). 판정 기준(:43)·"재현 / 실패 시나리오 / 권장 수정"(:42)·공격 6항목 유지. 이름 규칙에 "완전한 파일 / 병합하는 부분 예시" 구분 추가 | `dot-claude/agents/red-team.md`, 이 README "이름 규칙" |
| 2 | `switch -C main`·`checkout -B main`·`branch -m main`이 로컬 main을 옮기는데 통과 | 반영: switch `-C`/`--force-create`, checkout `-B`의 값과 branch `-m`/`--move`/`-M`/`-C` 대상이 보호 브랜치면 차단. 시험 8건 추가(차단 5, 작업 브랜치 허용 3) | `guard-bash.additions.mjs` `destructiveReason`, 위 시험 출력 |
| 3 | "지금 적용분"에 "다음 기능 전" 제안(P-A1·P-A3·P-A5)의 현재 `CLAUDE.md` 줄 단위 문안 없음 | 반영: "적용 단계"를 "지금 (a)(b)(c)" / "첫 데이터 기능 착수 묶음 (d)" / "첫 기능 뒤 정리"로 나눔. (d)는 05 4절 목록 7개(D-01·D-03·D-04·P-A3·P-A1·P-D3·P-D2-A) 각각에 현재 줄 번호와 넣을 문구를 적음. P-A5 `:87` 문구(`switch -f`, "가드가 차단")는 "지금"에 둠. P-A5는 05에서 "지금"이라 (d)가 아님 | 이 README "적용 단계" |
| 4 | `git checkout <파일>` 판정이 hook 프로세스 cwd 기준인데 README는 "실행 위치", `timeout`·`xargs` 미처리 | 반영: `destructiveReason(…, { cwd: input.cwd })`로 바꾸고 끼울 위치 주석 갱신. `cd <dir> && …`·`git -C <dir>`은 한계로 명시하고 미검출 기대값으로 고정. `timeout`(시간 값 1개 건너뜀)·`xargs` 접두 처리 추가. 실제 파일 시스템 cwd 비교 시험 3건 | `guard-bash.additions.mjs` 머리 주석·`PREFIX_OPTS_WITH_VALUE`·`unwrap`, 위 시험 출력 아래 설명 |
| 5 | README:25 P-C5 시점 "첫 기능 뒤"가 05의 "여유 있을 때"와 다름 | 라운드 2에서 "여유 있을 때"로 고쳤으나, 같은 라운드에 05 최종안이 "첫 기능 뒤 정리"로 바뀌어 다시 어긋났다. 라운드 3 #1에서 05 최종안(첫 기능 뒤 정리)에 맞춤 | 목록 표, `eslint/README.md` |
| 6 | `lint-file.mjs` 주석 "globalIgnores와 맞춤"이 사실과 다름 | 반영: "src 안의 lint 대상만 빠르게 본다(src 밖 lint 대상은 Stop hook이 검사)" | `dot-claude/hooks/lint-file.mjs:7-8` |
| 7 | `api-error-and-retry.md` 반영 기록의 정의되지 않은 "공통 사실" 번호 | 반영: 근거 문서·절(`03-code-structure.md` CS-04)로 바꿈 | `code/api-error-and-retry.md` 라운드 1 기록 |
| 8 | `git ls-tree -r HEAD`가 비ASCII 경로를 따옴표로 감싸 `.md` 필터가 빗나감 | 반영: `ls-tree -r -z HEAD` + `\0` 분리. 한글 파일명 임시 저장소에서 두 방식 비교 실측 | `dot-claude/hooks/stop-check.diff.md` |
| 9 | `cn("text-" + size)` 문자열 `+` 조립도 통과하는데 한계에 없음 | 반영: 예시 설정·현재 설정 모두 exit 0 실측과 함께 한계 절에 추가. 규칙 확장은 하지 않은 이유 기재. (d) 6의 `:75` 문구에 "`+`로 이어 붙인 조립" 포함. `rules/design.md:11`에는 라운드 2에서 넣지 못했고(당시 기록은 넣었다고 잘못 적음) 라운드 3 #2에서 넣음 | `eslint/README.md` "한계", 이 README (d) 6 |
| 10 | 본문과 rule에 같은 문장 중복, P-A9 실익이 수치 결론으로 연결 안 됨 | 반영: `rules/design.md:9`, `rules/be-integration.md:12-16`·`:20`을 "본문 참조" + 세부만 남김. 대조표 결론 문장 "상시 로드 10.8KB→9.1KB(`wc -c`), design rule은 tsx 작업 때만 로드"와 화면 작업 턴의 실제 절감(50바이트)을 적어 P-A9 판단 근거로 연결 | `dot-claude/rules/*.md`, 이 README 대조표 머리 |
| — | 동결 정의를 2단계로 확정(`05-proposals.md` P-A2 "동결 정의", `decisions-needed.md` D-02) | 반영: P-A2 문단을 ①(a)(b)(c) ②(d) 묶음 1회 커밋, 그 뒤 (a)(b)(c)로 다시 씀. 목록 표 시점을 "지금 (a)/(b)/(c)", "다음 기능 전 (d)", "첫 기능 뒤 정리", "여유 있을 때"로 통일 | 이 README "적용 단계" 지금 1, 목록 표 |
| — | DS-09는 새 규칙이라 P-A7(b)이 아니라 P-A9(`05-proposals.md` P-A7 머리·P-A9) | 반영: P-A7 항목에 "DS-09는 여기서 하지 않음", 첫 기능 뒤 P-A9 항목에 `rules/design.md:16`과 `sidebar-collapse.tsx:35` `aria-expanded` 복원 판단(ghost 스타일은 `className`으로 덮어쓰기)을 적음 | 이 README "적용 단계" |
| — | P-D2를 A(d)와 C·D-07(여유 있을 때)로 나눔(`05-proposals.md` P-D2) | 반영: (d) 7에 역할 표 문안. `rules/design.md:15` 표 이름 맞춤. `status-badge.md` 라운드 1 기록의 카드 링크 문구 정정 | 이 README (d) 7, `rules/design.md`, `components/status-badge.md` |
| — | P-A10(D-05)은 첫 기능 뒤 정리, 그 전 자율 작업은 지시서 우선(`decisions-needed.md` D-05 "시점") | 반영: "지금 적용분"에서 빼고 "첫 기능 뒤 정리"로 옮김 | 이 README "적용 단계" |
| — | P-C2 retry 주석 "네트워크 오류·5xx만"이 식과 다름 | 반영: "ApiError 4xx를 제외한 모든 오류(5xx·네트워크·응답 파싱) 1회 재시도"와 식 풀이 | `code/api-error-and-retry.md` 1절 |
| — | `cn` 병합 동작 실측 | 반영: `node`로 `cn("p-2 p-4","text-sm text-lg")` 실행 → `"p-4 text-lg"`. StatusBadge의 `className` 덮어쓰기 근거로 기재 | `components/status-badge.md` "왜 이 형태인가" |
| — | P-D3 적용 방법이 "단독 `chore:` 커밋"·별도 파일 import로 적혀 (d) 묶음·기존 설정 방식과 다름 | 반영: `eslint.config.mjs` 안에 객체로 두는 방식(`:114` 선례)과 (d) 묶음 커밋으로 고침 | `eslint/README.md` "적용 방법" |
| — | `docs/spec/TEMPLATE.md` 머리말이 `CLAUDE.md:14` 문안을 첫 기능 뒤 초안으로 넘김 | 반영: 이 README (d) 4를 가리키게 고치고 복사 시 머리말 삭제 안내 | `docs/spec/TEMPLATE.md:5` |

## 리뷰 반영 기록(라운드 3)

리뷰: `docs/ai-audit/reviews/examples-round-3.md`. 지적 8건 중 7건을 이 폴더에서 반영했고, #6은 05 담당이라 표시만 했다. "—" 행은 리뷰 지적이 아니라 05·decisions와 맞추려고 고친 것이다.

| # | 지적 요약 | 처리 | 위치 |
|---|---|---|---|
| 1 | P-C5·P-C6 시점이 examples("여유 있을 때")와 05("첫 기능 뒤 정리")에서 반대 | 반영: 05 기준 "첫 기능 뒤 정리"로 통일. 라운드 2 #5 기록도 사실대로 정정 | 목록 표, "첫 기능 뒤 정리" 절, `eslint/README.md:6`·`:126`·`:129`, 라운드 2 기록 #5 |
| 2 | 초안·rule이 "지금"·(d) 문안보다 짧아 교체 때 규칙이 사라짐, 반영 기록 오류, D-01 조건부 없음 | 반영: 초안 :94를 지금 4 문안과 같은 뜻(로컬 main·아카이브 브랜치 보호, "가드가 차단한다")으로 바꾸고 "(P-A5 적용 후 …)" 시점 문구 제거. `rules/design.md:11`에 "변수에 먼저 담거나 `+`로 이어 붙인 조립은 lint가 못 잡으므로"를 넣어 (d) 6과 일치. "D-01 조건부 문안" 표 추가(초안 :87 다음 B 줄, :100 B / A·C 문안). 라운드 2 #9 기록 정정. 대조표 :22·:75·:87·:98-100 비고에 "(d)/지금 문안과 동일" 표시 | `claude-md/CLAUDE.draft.md:94`, `dot-claude/rules/design.md:11`, "D-01 조건부 문안", 대조표, 라운드 2 기록 #9 |
| 3 | "절감은 BE 연동 턴에도 남는다"는 정량 결론이 틀림 | 반영: 턴 종류별 표(`wc -c` 직접 측정, 라운드 3 수정 후 초안 9,204·design 1,691·be 2,471)로 바꾸고 결론을 "크기 이득은 없거나 손해(데이터 기능 턴 +23.5%), 근거는 문장 정리·사실 정정·절차의 skill 분리"로 뒤집음. 05 P-A9 본문은 05 담당이 같은 결론으로 고침(05도 같은 값으로 갱신됨) | 대조표 머리 |
| 4 | guard가 셸 예약어 뒤 git과 짧은 옵션 묶음(`-qC`)을 놓침 | 반영: `unwrap`에서 `do`·`then`·`else`·`elif`·`if`·`while`·`until`·`{`·`!` 접두 제거, `for 변수 in 목록`의 `$변수` 치환 추가(`expandForLoops`). 옵션 파싱에 `bundledValue`(git parse-options 방식) 추가해 `split`·`optValues`가 묶음 안의 `-C`/`-B` 값을 읽음. `-Cq main`은 git이 `-C q`로 읽어 허용이 맞음을 임시 저장소에서 확인. 시험 17건 추가(79건 모두 기대대로), 위 출력 갱신 | `guard-bash.additions.mjs` 머리 주석·`RESERVED`·`expandForLoops`·`bundledValue`·시험, 이 README 시험 출력과 설명 |
| 5 | `git fetch . +HEAD~3:main`, `git update-ref refs/heads/main HEAD~3`가 한계에 없음 | 반영: 한계로 적고(막지 않는 이유: 드묾, D-09·reflog로 복구) 시험에 미검출로 고정 | `guard-bash.additions.mjs` 머리 주석, 이 README 시험 설명 |
| 6 | 05 P-A4 B가 `ls-tree -r HEAD`(`-z` 없음) | 05 담당 — 05 P-A4 B에 `ls-tree -r -z HEAD`로 반영됨(05 라운드 3). examples의 `stop-check.diff.md`는 이미 `-z` | — |
| 7 | (d) 4 "완료 조건·레드팀 표"와 초안 :25 "완료 조건 표" 불일치 | 반영: 초안 :25를 "SPEC의 \"완료 조건\"·\"레드팀\" 표"로 | `claude-md/CLAUDE.draft.md:25` |
| 8 | 디자인 문서의 lint 막는 것/못 막는 것 목록에 조립 클래스가 없음 | 반영: (d) 6에 `docs/design-system.md:19`(막는 것: `className`·`cn()` 안 템플릿 조립)·`:21`(못 막는 것: 변수·`+` 조립) 추가 문안 | 이 README (d) 6 |
| — | P-A8 '지금' 범위(05 P-A8 표) | 반영: 지금은 `disallowedTools` 1줄과 규칙 절 문장 정정만. exit 2 줄은 지금 (c)(P-A6), 테스트 판정 줄은 (d)(D-03), SPEC 기록 줄은 (d)(P-A3). 예시 파일은 완전한 파일로 두고 줄 끝에 `# 적용:`/`<!-- 적용: -->` 주석, README에 단계 표 | `dot-claude/agents/red-team.md`, "적용 단계" 지금 3·5, (d) 2·4, 목록 표, 이름 규칙 |
| — | '지금' 커밋에서 바뀌는 줄 열거(05 4절 '지금 당장') | 반영: `:7` 다음 동결 조항(D-02 직접 반영, 같은 chore 커밋 안의 문단 추가), `:20`·`:45`·`:60`·`:62`·`:66`, `:87`, `docs/design-system.md:40`, `eslint.config.mjs:175`·`:188` 표 | "적용 단계" 지금 머리 |
| — | P-A1(`/learn`)을 (d)에서 첫 기능 뒤 정리의 첫 항목으로(05 P-A1·4절, D-08) | 반영: (d) 5를 비우고 문안을 "첫 기능 뒤 정리" 첫 항목으로 옮김. 동결 조항 문단의 (d) 목록에서 `/learn` 삭제. 목록 표의 learn skill·학습 로그 시점 변경. 초안은 첫 기능 뒤 적용이라 그대로 | "적용 단계", 목록 표, 대조표 :6·:36 |
| — | (d) 순서(05 4절, D-02) | 반영: ① 규칙 변경 제안(첫 기능 이름·범위만) → ② 단독 chore 커밋 → ③ 새 세션 SPEC 인터뷰 → ④ `/clear` 후 plan·구현. "첫 기능 plan과 함께" 표현 삭제 | (d) 머리, 지금 1 동결 문단 |
| — | D-03 문안(05 P-C3) | 반영: `"test": "vitest run --passWithNoTests"`, verify 포함은 (d) 커밋에서 가능, 완료 조건 "(d) 커밋 직후 `pnpm verify` exit 0(적용 시 실측)" | (d) 2 |

## 리뷰 반영 기록(라운드 4)

| # | 지적 요약 | 처리 | 위치 |
|---|---|---|---|
| 1 | 가드를 끼울 때 `path` import가 빠지면 fail-open, 끼운 뒤 확인 단계 없음 | 반영. 머리 주석에 `import path` 추가 지시와 끼운 뒤 확인할 입력 3개(모두 exit 2 기대)를 명시 | `guard-bash.additions.mjs` 머리 주석 |
| 2 | 따옴표로 감싼 인자(`"v3"`, `"$b"`, `"main"`)가 검사를 빠져나감 | 반영. `destructiveReason`에서 감싼 따옴표를 벗겨 판정. 시험 5건 추가, 84건 모두 기대대로(실행 확인) | `guard-bash.additions.mjs`, 아래 시험 출력 |
| 3 | (d) 2 D-03 문안에 설치 단계 없음, 초안 :54 조건부 없음 | 반영. 설치본 Next 가이드 기준 6개 패키지 + `vitest.config.mts`, 초안 :54 변경 조건 추가 | (d) 2 |

## 가드 통합 실측 (리뷰 4라운드 후속, 2026-10-11)

현재 `.claude/hooks/guard-bash.mjs`를 스크래치 디렉터리에 복사하고, 머리 주석의 "끼워 넣는 위치"대로 ① `segments`를 `expandCommand(withoutBodies)`로 바꾸고 ② push 검사 뒤에 `destructiveReason` 루프를 넣었다(함수는 복사 대신 이 예시 파일에서 import. 실제 적용 방식인 함수 복사로 끼운 사본은 리뷰 4라운드 후속 확인(`reviews/examples-round-4-followup.md`)에서 재현돼 같은 결과). 저장소의 hook은 바꾸지 않았다.

| 입력 command | exit | 기대 |
|---|---|---|
| `git checkout README.md` (`cwd`=저장소 루트) | 2 | 차단 ✓ |
| `git branch -D "v3"` | 2 | 차단 ✓ |
| `bash -c "git push --force"` | 2 | 차단 ✓ |
| `git switch --discard-changes main` | 2 | 차단 ✓ |
| `git status` | 0 | 허용 ✓ |
| `git commit -m "docs: mention git push --force and reset --hard"` | 0 | 허용 ✓(메시지 속 언급은 오인하지 않음) |

실제 적용 때는 함수를 hook 파일에 복사하므로 `import path from "node:path";`를 함께 넣어야 한다(머리 주석).

## 리뷰 반영 기록(라운드 4 후속 확인)

| # | 지적 요약 | 처리 | 위치 |
|---|---|---|---|
| N1 | 끼운 뒤 확인 명령 2개의 JSON 이스케이프 오류(바른 패치도 exit 0), 허용 확인 없음 | 반영. `\\"` → `\"`, 허용 2건(`git checkout main`, `git status`) 추가. 이 문서 작성 세션에서 5개 명령을 패치 사본에 실행해 2·2·2·0·0 확인 | `guard-bash.additions.mjs` 머리 주석 |
| N2 | 통합 실측이 import 방식 | 반영. 함수 복사 방식은 후속 확인에서 재현됐음을 명시 | "가드 통합 실측" |
| N3 | 초안 :54 "(Stop hook과 같은 검사)"가 test 추가 시 거짓 | 반영. (d) 2 문안을 "typecheck + lint + test + build (Stop hook은 test 제외)"로 | (d) 2 |
| N4 | 라운드 4 낮음 4건 처리 여부 누락 | 반영. 아래 #4~#7 | — |
| N5 | 원본 가드 JSON 파싱 실패 시 fail-open | 반영. 머리 주석에 P-A5 적용 시 함께 검토할 항목으로 기록 | `guard-bash.additions.mjs` 머리 주석 |
| R4 #4 | README 136·362·365의 05 상태 서술이 낡음 | 반영. 05 현재 값과 일치하도록 정정 | 대조표 결론, 라운드 3 기록 |
| R4 #5 | 05 P-A6 B가 `/opt/pw-browsers/chromium` 추가를 권함 | 반영(메인 세션이 05 수정): `PLAYWRIGHT_BROWSERS_PATH` 아래 `chromium-*/chrome-linux/chrome` 탐색 | `05-proposals.md` P-A6 |
| R4 #6 | report skill이 '완료 조건' 표 하나만 확인 | 반영. "'완료 조건'·'레드팀' 표" | `skills/report/SKILL.md:12` |
| R4 #7 | `case … esac` 통과가 한계에 없음 | 반영. 한계 목록에 추가(드묾) | `guard-bash.additions.mjs` 머리 주석 |
