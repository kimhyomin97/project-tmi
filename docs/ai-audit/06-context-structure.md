# 06. AI 문서·컨텍스트 구조 설계

조사일 2026-10-15. 상태: **제안**. 앞으로 모든 기능 작업의 틀이 되는 구조라 1차 출처 위주로 넓게 조사했고, 별도 검토 에이전트의 반박 검토를 3회 거쳤다(9~11절).

- 범위(인용한 것 기준): Claude Code 공식 문서 [A1]~[A8], Anthropic 엔지니어링·플랫폼 문서 [B1]~[B8], OpenAI [O1]~[O5], 다른 도구 [T1]~[T7], 실증 연구 [E1]~[E10](논문 8편, 업체 평가 1건, 기술 보고서 1건).
- 표기: 2차 출처는 [2차], 초록만 읽은 논문은 [초록], 원문에 없고 추론한 것은 (추론).
- 이 문서는 감사 제안 `05-proposals.md`의 P-A3(SPEC 상시화)·P-A9(CLAUDE.md 구조 개편)와 결정 D-02(하네스 동결)를 **대체하지 않고 보강한다**(4절).

---

## 0. 결론 요약

1. **방향은 이미 맞다. 보강할 것은 "진행 기록"과 "버릴 파일 위치"다.**
   - 조사한 도구는 모두 ① 항상 로드되는 짧은 지시 ② 경로 한정 규칙 ③ 필요할 때 부르는 절차를 갖고 있다(2.2).
   - Kiro·spec-kit·Conductor와 OpenAI harness engineering은 여기에 ④ 기능 단위 스펙·계획 파일을 더한다. Codex 기본 기능·Copilot·Cursor에는 ④가 없다.
   - 이 레포는 ①②③의 자리와 개편 계획(P-A9)이 있고, ④는 SPEC(P-A3)이 맡기로 돼 있다.
   - 빠진 것은 두 가지다.
     - 세션을 넘어 이어지는 **진행·결정 기록**: OpenAI ExecPlan의 Progress·Decision Log·Surprises·Outcomes.
     - **버릴 파일의 위치 규칙**.
2. **진행 기록은 새 폴더가 아니라 SPEC 템플릿에 절 4개를 더한다.**
   - P-A3의 SPEC(`docs/spec/<feature>.md`)이 이미 plan 요약·완료 조건 판정·레드팀 기록을 담는다.
   - `docs/plans/`를 따로 두면 같은 정보가 두 곳에 생긴다(9절 H6).
3. **임시 파일은 Anthropic 설계 그대로 세션 scratchpad(레포 밖)를 쓴다.** 레포 안 디렉토리는 만들지 않는 것을 추천한다(2.5).
   - Anthropic이 임시 디렉토리에 쓰는 공식 이름은 둘이고, 둘 다 **레포 밖**이다.
     - "scratchpad": 세션 임시 디렉토리[A3]. 문서는 "남기려면 프로젝트로 옮기라"고 한다.
     - "scratch directory": 백그라운드 세션의 `tmp`[A7][A9]
   - scratchpad는 claude.ai 로그인 등 조건이 맞을 때만 생긴다. 없는 환경에서는 시스템 임시 폴더를 쓰고, 레포에는 두지 않는다.
   - 레포 안을 원하면 `.scratch/`를 쓴다(대안 B). 세션 scratchpad와 이름이 겹치지 않아서다.
4. **항상 읽히는 문서를 늘리지 않고, 검증과 강제를 늘린다.**
   - 지시 파일의 정답률 효과는 작거나 측정되지 않았다[E1][E4].
   - 관련 없는 규칙은 준수율을 떨어뜨린다[E5].
   - 그래서 "지우면 실수하는가"로 줄을 고르고, 기계로 막을 수 있는 것은 lint·hook으로 옮긴다[A2][O1].
5. **적용은 D-02 동결 단계에 맞추되, 채택된 묶음 내용이 바뀌므로 승인이 필요하다.**
   - (d) 첫 데이터 기능 착수 묶음: SPEC 템플릿 확장과 "진행 중 SPEC 먼저 읽기" 1줄. P-A3과 같은 커밋이다.
   - 첫 기능 뒤 정리: CLAUDE.md 개편. P-A9에 "문서 지도"·"임시 파일" 줄을 더한다.
   - 지금 당장 바꿀 하네스 파일은 없다. 대안 B를 고르면 동결 예외가 하나 더 필요하다.

---

## 1. 공통 원칙 8개

| # | 원칙 | 근거(요지) |
|---|---|---|
| P1 | 컨텍스트는 유한한 주의 예산 | "컨텍스트 창이 차면 성능이 떨어진다. 가장 중요한 관리 자원"[A2]. 입력이 길어지면 18개 모델이 고르지 않게 성능 저하[E7]. 동시 지시 수가 늘면 정확도가 떨어지고(최고 모델도 500개에서 68%), 앞쪽 지시 편향은 150~200개 부근에서 최대[E6](키워드 포함 과제라 일반화에 한계) |
| P2 | 항상 로드되는 파일은 짧게, 추론 가능한 것은 빼기 | "줄마다 '지우면 실수하는가?'를 묻고 아니면 지운다"[A2]. CLAUDE.md는 200줄 이하 권장[A1]. `/doctor`는 "디렉토리 구조·의존성 목록·아키텍처 개요"를 자르고 "함정·이유·기본값과 다른 규약"은 남긴다[A1]. 쓸모 있는 지시도 무조건 더하면 "임의로 나빠질 수 있다"[E5][초록] |
| P3 | 점진적 공개 | 작은 입구에서 다음에 볼 곳을 알려준다. OpenAI는 큰 AGENTS.md가 실패해 약 100줄짜리 목차로 바꿨다[O1]. Skills는 이름·설명 → 본문(<5k토큰) → 참조 파일 순으로 로드, 참조는 한 단계 깊이까지[B3] |
| P4 | 범위별 로드 | `paths:` 규칙은 해당 파일을 읽거나 편집할 때 로드[A1]. Copilot `applyTo`, Cursor `globs`, Kiro `fileMatch`도 같은 개념[T2][T3][T4] |
| P5 | 레포가 기준 기록 | "실행 중 볼 수 없는 지식은 없는 것과 같다"[O1]. 클라우드 세션은 새 VM·새 clone이라 커밋된 것만 이어진다[A4]. auto memory는 기기 로컬[A1] |
| P6 | 상태는 파일 + git으로 넘긴다 | 세션 시작 시 진행 기록·git log·기능 목록을 읽고, 끝날 때 커밋과 진행 기록 갱신[B1]. "상태 데이터는 JSON, 진행 메모는 비정형 텍스트, 상태 추적은 git"[B2]. ExecPlan은 살아 있는 문서로 Progress·Decision Log 등을 계속 갱신[O3] |
| P7 | 강제는 코드로 | hook은 결정적, CLAUDE.md는 권고("강제 설정이 아니라 맥락")[A1][A2]. CLAUDE.md 보안 규칙 중 실제 강제 수단과 대응되는 것은 4~16%[E8][초록]. "문서가 부족하면 규칙을 코드로 올린다"[O1] |
| P8 | 임시 파일은 레포 밖, 남길 것만 옮긴다 | 세션 scratchpad는 "프로젝트에 속하지 않는 중간 결과·보조 스크립트·초안"용, "남기려면 프로젝트로 옮기라"[A3]. 새 파일을 줄이고 싶을 때 쓰는 선택 지시로 "작업 끝에 임시 파일을 지우라"를 제시[B2]. "임시 스크립트·간단한 확인은 남길 필요 없고 영구 테스트로 바꾸지 않는다"[B4] |

## 2. 세부 조사 결과

### 2.1 Claude Code 로드 규칙

| 대상 | 로드 시점 | 압축(/compact) 후 | 직접 만든 서브에이전트(red-team) |
|---|---|---|---|
| 루트 CLAUDE.md, `@import` 파일 | 세션 시작 | 디스크에서 다시 주입 | 로드됨 |
| `.claude/rules/*.md`(paths 없음) | 세션 시작 | 다시 주입 | 로드됨 |
| `.claude/rules/*.md`(paths 있음) | 맞는 파일을 Read/Write/Edit(또는 `cat`·`head`)할 때 | **사라짐**(다시 그 파일을 만질 때까지) | 맞는 파일을 만질 때(추론) |
| skill 본문 | 호출 시 | 5k토큰/개까지 복원 | `skills:` 필드에 적으면 시작 시 |
| plan 모드 계획 파일 | — | 다시 주입(저장 위치와 무관) | — |
| auto memory | 시작 시(200줄/25KB) | 다시 주입 | 안 됨 |

출처: [A1][A5][A6]. 예외가 두 가지 있다.
- `.claude/worktrees/` 안에서 도는 서브에이전트는 그 worktree의 CLAUDE.md·rules를 로드하지 않는다[A6].
- 압축 뒤 꼭 다시 넣어야 할 내용은 `compact` matcher를 쓴 SessionStart hook으로 주입할 수도 있다[A5].

설계에서 따를 점은 다음과 같다.
- **압축 뒤에도, plan 단계에서도 필요한 규칙은 CLAUDE.md에 둔다.** 문서 원문 그대로: "규칙이 압축 뒤에도 남아야 하면 `paths:`를 빼거나 루트 CLAUDE.md로 옮기라"[A5]. plan 단계에서는 아직 관련 파일을 열지 않았을 수 있어, 경로 한정 규칙이 없다(9절 M5).
- `@import`는 비용이 같다. 시작 시 함께 로드된다[A1]. 지도에는 import가 아니라 **경로를 글로 적어** 필요할 때 읽게 한다.
- `.claude/` 아래는 **보호 경로**다. 쓰기마다 확인을 받거나 분류기를 거치고, allow 규칙으로도 사전 허용되지 않는다[A7]. 임시 폴더를 여기 두면 안 된다.

### 2.2 도구별 같은 개념, 다른 경로

| 개념 | Claude Code | Codex | Gemini CLI·Conductor | Copilot | Cursor | Kiro | spec-kit |
|---|---|---|---|---|---|---|---|
| 항상 로드 | `CLAUDE.md`(<200줄) | `AGENTS.md`(32KiB 상한) | `GEMINI.md`, `conductor/product.md` 등 | `.github/copilot-instructions.md` | `.mdc` `alwaysApply` | `.kiro/steering/{product,tech,structure}.md` | `.specify/memory/constitution.md` |
| 경로 한정 | `.claude/rules/` `paths:` | 하위 `AGENTS.md` | 하위 `GEMINI.md` | `.github/instructions/*.instructions.md` `applyTo` | `.mdc` `globs` | `inclusion: fileMatch` | — |
| 절차 | `.claude/skills/` | `.agents/skills/` | `/conductor:*` | `.github/prompts/`, `.github/skills/` | 수동 `.mdc` | `inclusion: manual` | `/speckit-*` |
| 스펙 | (SPEC.md 예시[A2]) | — | `conductor/tracks/<id>/spec.md` | — | — | `.kiro/specs/<f>/requirements.md` | `specs/NNN-f/spec.md` |
| 계획·진행 | plan 모드, `plansDirectory` | `docs/exec-plans/{active,completed}`[O1], ExecPlan[O3] | `conductor/tracks/<id>/plan.md` | — | — | `.kiro/specs/<f>/{design,tasks}.md` | `specs/NNN-f/{plan,tasks}.md` |
| 결정 | — | — | — | — | — | `design.md` | `research.md` |
| 임시 | 세션 scratchpad·`$CLAUDE_JOB_DIR/tmp`(레포 밖) | — | `~/.gemini/tmp/`(레포 밖) | — | — | — | — |

출처: [A1][A3][A9][O1][O2][O3][T1]~[T5].
- **스펙과 계획을 기능 폴더 하나에 함께 두는 방식이 많다**: Conductor `tracks/<id>/`, Kiro `specs/<f>/`, spec-kit `specs/NNN-f/`. 이 레포처럼 1인 개발이면 파일 하나로 합쳐도 같은 효과다(추론).
- 결정 기록은 어떤 AI 도구도 정하지 않았다. 사람 쪽 관례인 MADR(`docs/decisions/NNNN-제목.md`)이 사실상 표준이다[T6].

### 2.3 OpenAI harness engineering의 배치 (원문 페이지 코드 블록에서 복원)

```
AGENTS.md            ARCHITECTURE.md
docs/
├── design-docs/      index.md, core-beliefs.md, ...
├── exec-plans/       active/, completed/, tech-debt-tracker.md
├── generated/        db-schema.md
├── product-specs/    index.md, new-user-onboarding.md, ...
├── references/       *-llms.txt
└── DESIGN.md  FRONTEND.md  PLANS.md  PRODUCT_SENSE.md  QUALITY_SCORE.md  RELIABILITY.md  SECURITY.md
```
원문이 역할을 설명한 것은 다음뿐이다. 나머지는 내용이 공개되지 않았다[O1].
- AGENTS.md(약 100줄 목차)
- docs(기준 기록)
- 설계 문서(색인·검증 상태·핵심 원칙)
- ARCHITECTURE.md(도메인·계층 지도)
- 품질 문서(등급)
- "진행 중·완료 계획과 기술 부채를 버전 관리하며 한곳에"

다른 사례: Codex 레포는 2026-09-30에 320줄짜리 루트 AGENTS.md를 지웠다. 이유는 커밋에 적혀 있지 않다[O5].

ExecPlan[O3]은 계획을 **살아 있는 문서**로 쓰는 형식이다.
- 계속 갱신하는 절: `Progress`(체크박스와 시각), `Surprises & Discoveries`, `Decision Log`, `Outcomes & Retrospective`
- 기준: "처음 보는 사람이 이 문서만 읽고 끝까지 구현할 수 있을 것"

### 2.4 실증 연구

| 연구 | 결과 | 시사점 |
|---|---|---|
| ETH Zurich 외, arXiv 2602.11988 v3[E1] | 지시 파일은 성공률을 대체로 올리지 못하고 비용을 20% 넘게 올린다. LLM 생성 −0.5~−2%(유의하지 않음). 개발자 작성 +2.4%(p=21%)이고 "Claude Code를 뺀 모든 에이전트"에서 개선. 개요는 첫 관련 파일 도달을 줄이지 못함. "README에 없는 규약·비기능 요구만 넣으라" | 코드·README로 알 수 있는 것은 빼고 고유 규약만 남긴다 |
| SMU·Heidelberg·Bamberg, arXiv 2601.20404[E2] | Codex에서 AGENTS.md가 실행 시간 중앙값 −28.6%, 출력 토큰 −16.6%(정답률 미측정) | 효과는 주로 효율 |
| Vercel 평가[E3][업체 자료] | 압축한 8KB 문서 색인을 AGENTS.md에 넣으면 100%, skill은 53~79%. skill이 56% 경우 호출되지 않음 | 항상 필요한 정보를 skill·경로 한정 rule에만 두면 안 읽힐 수 있다 |
| arXiv 2607.27250[E4][초록] | Claude Code·Codex에서 컨텍스트 전략이 정답률을 측정 가능하게 바꾸지 못함(10~15%p 이내). 실패 원인은 저장소 지식 부족이 아니라 구현 능력 | 정답률은 검증 루프(verify·shot·red-team)가 지킨다 |
| arXiv 2610.11007[E5][초록] | 관련 없는 규칙이 준수율을 낮춘다. 최적 크기에 상한이 있다 | 경로 한정 분리의 근거. 단 [E3]과 균형 |
| arXiv 2606.15828[E9][초록] | 지시 파일 결함: Lint Leakage(lint가 할 일을 문서에) 62%, Context Bloat 42% | lint가 이미 막는 규칙은 문서에서 줄인다 |
| arXiv 2606.20512[E10][초록] — **반대 근거** | 다듬은 안내 33.0% vs 고정 안내 28.3% vs 없음 25.5%(SWE-bench Verified, Qwen3.5-35B). 이득은 "맞는 파일에 도달하는 범위" | 어디를 볼지 알려주는 지도는 도움이 될 수 있다 → "문서 지도" 절의 근거 |

연구 대부분이 2026년 프리프린트다. 효과 크기는 작고 결론도 엇갈린다. 정리하면 다음과 같다.
- 항상 읽히는 문서: 짧은 지도와 고유 규약만 둔다.
- 정답률: 문서가 아니라 검증 루프로 지킨다.

### 2.5 임시 디렉토리 이름 — "scratch 말고 다른 게 있나"

**한 줄 답**: Anthropic이 권장하는 **레포 안** 임시 디렉토리 이름은 없다.
- Anthropic이 임시 디렉토리에 쓰는 공식 이름은 둘뿐이다.
  - **scratchpad**: 디스크 폴더 이름 `scratchpad/`
  - **scratch directory**: 디스크 폴더 이름 `tmp/`
- 둘 다 레포 밖에 생긴다.
- Claude Code가 레포 안에 만드는 임시 폴더는 서브에이전트용 `.claude/worktrees/` 하나다. 문서는 이 폴더를 gitignore하라고 한다.
- 임시 폴더 전체의 위치는 `CLAUDE_CODE_TMPDIR`로 옮길 수 있다[A9].

조사한 다른 회사·도구 문서도 레포 안 이름을 권장하지 않았다[O1]~[O5][T1]~[T5]. Anthropic이 쓰는 이름 전체는 아래와 같다.

| 이름 | 출처 | 위치·성격 | 커밋 |
|---|---|---|---|
| **scratchpad**(디렉토리) | Claude Code "Session scratchpad directory"[A3] | `/tmp/claude-<uid>/<project>/<session>/scratchpad/`(레포 밖). "프로젝트에 속하지 않는 중간 결과·보조 스크립트·초안"용, 확인 없이 읽고 쓴다. 세션 기록과 함께 삭제. "남기려면 프로젝트로 옮기라" | 안 함 |
| **scratch directory** | Claude Code 보호 경로 예외 목록[A7], 환경변수 `CLAUDE_JOB_DIR`[A9] | 백그라운드 세션용 `~/.claude/jobs/<id>/tmp`. "background session's own scratch directory", "Write scratch files to `$CLAUDE_JOB_DIR/tmp`" | 안 함 |
| working scratchpad(파일) | 2025 Claude Code 모범 사례 글[B5][2차] | "Markdown 파일(또는 GitHub issue)을 체크리스트이자 작업 메모장으로". 파일 이름 없음 | — |
| `NOTES.md` | 컨텍스트 엔지니어링 글[B6] | 에이전트가 진행을 기록하는 노트(예시) | — |
| `claude-progress.txt`, `feature_list.json`, `init.sh` | 장기 실행 하네스 글[B1] | 세션 간 상태 인계 | **커밋함** |
| `progress.txt`, `tests.json` | 프롬프트 모범 사례[B2] | 같음 | 커밋 전제 |
| `SPEC.md`, `PLAN.md` | Claude Code 모범 사례[A2] | 스펙·계획 | 남김 |
| `/memories` | Memory tool[B7] | API 가상 경로 | 레포 관례 아님 |

`NOTES.md`·progress 파일은 **버리는 파일이 아니라 커밋해 넘기는 기록**이다. 이 구조에서는 SPEC의 진행 절이 그 역할을 맡는다(3.3).

**선택지**

| 안 | 내용 | 장점 | 단점 |
|---|---|---|---|
| **A. 공식 그대로(추천)** | 임시 파일은 세션 scratchpad(레포 밖)에. scratchpad가 없는 환경이면 시스템 임시 폴더(`$TMPDIR` 또는 `/tmp`)에. 어느 경우든 레포 안에는 두지 않는다. 남길 것은 `docs/`로 옮겨 쓴다 | Anthropic 설계 그대로. scratchpad 쓰기는 확인 창이 없다. scratchpad가 있는 환경에서는 Claude Code가 이미 이렇게 동작해 **지금 바꿀 파일이 없다**(동결과 충돌 없음). 클라우드 앱에서는 scratchpad 파일을 열 수 있다(이 세션의 환경 안내, 공개 문서 미확인) | scratchpad는 ① claude.ai 계정 로그인(API 키 아님) ② Anthropic API 사용(Bedrock 등 아님) ③ `enableArtifact`가 false가 아님, 세 조건이 모두 맞을 때만 생긴다[A3]. 로컬에서는 `/tmp` 아래라 찾기 불편하고 재부팅·세션 정리 때 사라진다. 레포 상대 경로 import가 필요한 실험은 불가(드묾) |
| B. 레포 안 `.scratch/` | gitignore된 레포 폴더. 기본은 세션 scratchpad, **레포 경로가 필요할 때만** `.scratch/` | 로컬에서 사용자가 쉽게 본다. `src/`를 import하는 실험 가능 | 동결 예외 필요. `.gitignore`·`tsconfig.json` exclude·ESLint `globalIgnores` 세 곳을 함께 고쳐야 verify가 깨지지 않는다(`tsconfig.json`이 `**/*.ts` 포함, 9절 H3). 레포 쓰기는 확인 창이 뜬다. 지울 때는 glob 말고 `rm -rf .scratch`처럼 이름으로 지운다(auto 모드 차단 규칙[A7]). 클라우드에서는 VM에만 있어 이점이 없다 |
| (B의 이름 후보) | `.scratchpad/` | 공식 용어와 같다 | 세션 scratchpad와 이름이 같아 "scratchpad에 저장했다"가 어느 쪽인지 모호하다[A3] |

**추천은 A다.** 질문하신 "Anthropic 추천대로"에 가장 가까운 것은 이름이 아니라 위치다. Anthropic은 임시 파일을 레포 밖 "scratchpad"에 두고, 남길 것만 프로젝트로 옮기게 설계했다. 레포 안 폴더가 꼭 필요하면 B를 쓰되, 이름은 공식 용어 "scratch"를 따르면서 세션 scratchpad와 구분되는 `.scratch/`를 쓴다.

위치 규칙이 정해진 기존 폴더 두 곳은 다음과 같다.
- `docs/private/`(gitignore에 등록됨): **사람이 보관하는 개인 문서** 자리다. AI 임시 파일과 섞지 않고, AI는 여기를 지우지 않는다.
- `.shots/`(gitignore): `pnpm shot` 결과 전용 출력 폴더다. 그대로 둔다. SPEC의 증거 칸에는 파일명과 함께 **무엇이 보였는지 한 줄 설명**을 적는다. 파일 자체는 커밋되지 않기 때문이다.

---

## 3. 설계

### 3.1 다섯 계층과 판단 순서

| 계층 | 위치 | 로드 | 담는 것 |
|---|---|---|---|
| L0 지도 | `CLAUDE.md`(+`AGENTS.md` import) | 매 세션, 압축 뒤에도 | 항상 지킬 원칙·금지·명령, plan 단계에 필요한 규칙, 다른 문서로 가는 경로 |
| L1 범위 규칙 | `.claude/rules/*.md`(`paths:`) | 해당 파일을 만질 때 | 그 파일을 편집할 때만 필요한 세부(plan 단계에 필요 없는 것) |
| L2 절차 | `.claude/skills/<name>/SKILL.md` | 호출 시 | 여러 단계 절차(완료 보고, `/learn`) |
| L3 지식 | `docs/` | 경로를 보고 필요할 때 | SPEC(요구·계획·진행·판정), 디자인 규격, 결정, 감사 기록 |
| L4 강제 | ESLint, hooks, `pnpm verify`, `pnpm shot`, red-team | 자동 | 어기면 안 되는 것 |
| 임시 | 세션 scratchpad (B를 고르면 `.scratch/`) | — | 버릴 파일 |

**새 규칙·정보가 생겼을 때 판단 순서**:
1. 기계로 검사할 수 있으면 → L4
2. plan 단계·압축 뒤에도 필요하면 → L0
3. 특정 파일 편집 때만 필요하면 → L1
4. 여러 단계 절차이면 → L2
5. 특정 기능·결정에 대한 사실이면 → L3
6. 이번 작업에만 쓰이면 → 임시

### 3.2 목표 구조

```
CLAUDE.md                     # L0 지도 (P-A9 개편 + "문서 지도"·"임시 파일" 줄)
AGENTS.md                     # Next.js 자동 생성. CLAUDE.md가 import (유지)
CLAUDE.local.md               # 개인 지시 (gitignore에만 등록, 파일은 필요할 때 사용자가 만든다)
.claude/
├── settings.json · hooks/ · agents/red-team.md      # 기존
├── rules/design.md · be-integration.md              # P-A9 (첫 기능 뒤)
└── skills/report/ · learn/                          # P-A9 · P-A1 (첫 기능 뒤)
docs/
├── design-system.md          # 기존 UI 규격
├── spec/
│   ├── README.md             # 기존 (P-A3에서 문구 수정)
│   ├── TEMPLATE.md           # P-A3 + 이 문서의 진행 절 4개
│   └── <feature>.md          # 기능별: 요구·계획·진행·판정·결정
├── decisions/NNNN-<제목>.md  # 감사 목록(D-xx) 밖의 새 결정이 처음 생길 때
├── harness-backlog.md        # D-02가 정한 하네스 아이디어 목록 (첫 아이디어 때)
├── learning/log.md           # P-A1 /learn 기록 (첫 기능 뒤, 05 계획대로)
├── ai-audit/                 # 감사 기록. decisions-needed.md는 D-xx가 모두 결정될 때까지 현행 목록
└── private/                  # 사람의 개인 문서 (gitignore에 등록됨)
.shots/                       # pnpm shot 결과 (gitignore, 기존)
```

OpenAI 배치와 대응시키면 다음과 같다.
- `exec-plans/active` → 진행 중 SPEC(진행 절)
- `exec-plans/completed` → Outcomes가 채워진 SPEC
- `tech-debt-tracker.md` → `harness-backlog.md` + `05-proposals.md`의 남은 제안
- `product-specs/` → `spec/`
- `DESIGN.md`·`FRONTEND.md` → `design-system.md`

active/completed 폴더를 나누는 대신 SPEC 머리의 상태 줄로 구분한다. 1인·소수 기능 규모에서는 폴더 이동이 비용만 늘린다(추론).

### 3.3 SPEC 템플릿 확장 (P-A3 보강, 핵심 변경)

`docs/ai-audit/examples/docs/spec/TEMPLATE.md`(P-A3 초안)에 아래를 더한다. ExecPlan[O3]과 장기 하네스[B1]의 진행 기록을 이 레포 규모로 줄인 것이다.

```markdown
상태: <진행 중 | 완료(YYYY-MM-DD)> · 시작: YYYY-MM-DD      ← 제목 바로 아래 1줄

## 진행 (Progress)          - [x] YYYY-MM-DD HH:MM 무엇을 끝냈나 / - [ ] 다음 할 일
## 결정 기록 (Decision Log)  - 무엇을 정했나 · 이유 · 날짜 (사용자 결정이면 "사용자")
## 예상 밖 발견 (Surprises)  - 예상과 달랐던 것 · 증거(명령 출력, 파일:줄)
## 결과 (Outcomes)          (완료 시) 만든 것, 남은 것과 옮긴 곳(backlog·제안)
```

- **언제 갱신하나**: 작업 중 멈추는 지점마다(plan 승인 뒤, 큰 단계 뒤, 막혔을 때, 커밋 확인 전).
- **다음 세션의 시작**:
  - 진행 중인 SPEC을 찾는다: `git grep -l --untracked '^상태: 진행 중' -- docs/spec ':!docs/spec/TEMPLATE.md'`
    - `--untracked`는 아직 커밋하지 않은 SPEC까지 찾기 위해 붙인다.
    - 템플릿 파일은 검색에서 뺀다.
  - 찾은 파일과 `git log -10`, `git status`를 먼저 읽는다.
  - 완료 조건 판정 표와 진행 절만으로 이어갈 수 있게 쓴다[B1][O3].
- **진행 항목과 커밋의 관계**:
  - 커밋된 SPEC의 `[x]`는 같은 커밋에 들어간 코드와 일치한다. 중간 커밋에도 코드를 함께 넣기 때문이다(아래).
  - 새 세션은 `git status`로 커밋하지 않은 변경을 먼저 본다. 클라우드 VM이 회수되면 커밋하지 않은 SPEC과 코드가 함께 사라지므로, 남아 있는 SPEC과 코드는 서로 어긋나지 않는다.
- **커밋**:
  - 기본은 지금처럼 작업이 끝난 뒤 커밋 1개에 SPEC을 함께 넣는다.
  - 컨테이너가 바뀌어도 이어가야 하는 작업이면 중간 커밋을 확인받아 넣는다. 근거는 CLAUDE.md Git 절의 "커밋은 작업 단위로 묶는다" 조항 중 "나눠야 하면 이유와 나눌 단위를 확인 요청에 적는다"다.
  - 중간 커밋에는 SPEC만이 아니라 **`pnpm verify`를 통과하는 그 시점의 코드까지** 넣는다. 규칙을 새로 만들 필요는 없다.
  - 로컬처럼 같은 작업 트리에서 이어가면 커밋 없이도 파일이 남는다.
- **JSON 상태 파일**: 완료 조건이 많을 때만 SPEC 옆에 `<feature>.checks.json`을 둘 수 있다. 근거는 "JSON은 모델이 덜 함부로 고친다"[B1]. 기본은 SPEC의 판정 표다.

### 3.4 위치별 규칙

| 위치 | 담는 것 | 담지 않는 것 | 수명 |
|---|---|---|---|
| `docs/spec/<feature>.md` | 요구·화면·BE 계약·plan 요약·완료 조건 판정·레드팀·진행·결정·발견·결과 | 대화 전문, 버릴 메모 | 영구(완료 후 상태 줄만 바꾼다) |
| `docs/decisions/NNNN-*.md` | 감사 목록(D-xx) 밖에서 새로 생긴, 기능을 넘어서는 결정. 문제·선택지·결정과 이유·결과·다시 볼 조건·상태(제안/채택/대체) | 기능 안의 결정(SPEC 결정 기록에), 감사 D-xx(`decisions-needed.md`에 계속 기록) | 영구. 바뀌면 새 번호로 쓰고 이전 것은 "대체됨" |
| `docs/harness-backlog.md` | 동결 중 떠오른 하네스 아이디어 한 줄씩 + 출처 | 진행 중 작업 | 첫 기능 뒤 정리 때 처리 |
| 세션 scratchpad | 조사 원문, 실험 스크립트, 중간 산출물 | 커밋할 것, 커밋 파일이 참조할 것 | 세션과 함께 사라짐. 남길 것은 위 문서로 옮겨 쓴다 |
| `docs/private/` | 사람의 개인 문서 | AI 작업 파일 | 사용자 관리. AI는 지우지 않는다 |

결정 기록 양식은 MADR[T6]을 줄인 것으로, 아래와 같다.
- 감사에서 나온 D-01~D-10은 지금처럼 `ai-audit/decisions-needed.md`에서 결정·기록한다. 두 곳에 같은 결정을 쓰지 않기 위해서다.
- `docs/decisions/`는 그 목록에 없는 새 결정이 처음 생길 때 0001부터 쓴다.
```markdown
# NNNN. <제목>
상태: 제안 | 채택(YYYY-MM-DD) | 대체됨(→ NNNN)
## 문제   ## 선택지   ## 결정과 이유   ## 결과(좋은 점·나쁜 점)   ## 다시 볼 조건
```

### 3.5 세션 흐름

```
시작  CLAUDE.md(자동) → "진행 중" SPEC이 있으면 읽기 → git log -10
작업  조사·실험은 scratchpad → 결정·발견·진행은 바로 SPEC에 기록
끝    pnpm verify·shot·red-team → SPEC 판정·Outcomes 작성
      → 기능을 넘는 결정은 decisions/, 미룬 하네스 아이디어는 harness-backlog.md (모두 커밋 전에)
      → 사용자 확인 → 커밋 1개 → scratchpad에서 남길 것이 없는지 확인
```
기존 작업 루프(plan → 구현 → 검증 → 확인 → 커밋)는 바꾸지 않는다. 늘어나는 것은 두 가지뿐이다.
- 시작할 때 진행 중 SPEC을 읽는다.
- 멈출 때마다 SPEC을 갱신한다.

### 3.6 CLAUDE.md 개편 지침 (P-A9에 더할 것)

P-A9의 실측 결론은 그대로 따른다(`05-proposals.md` P-A9): **컨텍스트 크기 이득은 없거나 손해**(데이터 기능 턴 +24%). P-A9의 목적은 크기가 아니라 정리다. 이번 조사로 더할 지침은 아래와 같다.

- **줄 수 목표를 두지 않는다.** 줄마다 "지우면 실수하는가"로 판단한다[A2]. 공식 상한(200줄)과 OpenAI 사례(약 100줄)는 참고값이다.
- **CLAUDE.md에 남길 것**(plan 단계·압축 뒤에도 필요한 것, 9절 M5·M6):
  - 아키텍처 절의 규약: `app/`은 라우팅만, 작성 순서, `components/ui` 수정 금지, `client.ts`가 유일한 HTTP 클라이언트, `env.ts` 범위 등. 트리 모양이 아니라 이 규약들이 핵심이라 줄이지 않는다.
  - "모든 화면은 PageHeader + metadata"
  - "필요한 토큰이 없으면 plan에 '토큰 추가'"
  - "새 엔드포인트는 `파일:줄`을 plan에, 모르면 묻기"
- **rule로 옮길 것**: 편집할 때만 필요하고 lint가 이미 막는 세부. 예: 토큰 클래스 세부, 조립 클래스 금지 설명, BE 파일별 작성 요령[E9].
- **skill로 옮길 것**: 완료 보고 절차와 명령 블록. 단 "완료 보고는 `report` skill로" 1줄은 CLAUDE.md에 남긴다. skill이 호출되지 않을 위험이 있어서다[E3].
- **새 절 "문서 지도"**(5~6줄): `docs/spec/`(요구·진행), `docs/design-system.md`, `docs/decisions/`, `docs/harness-backlog.md`, `docs/ai-audit/`(감사 기록, 현행 D-xx 목록 `decisions-needed.md` 포함)를 한 줄씩. 어디를 볼지 알려주는 지도가 도움이 된다는 근거[O1][E10].
- **새 줄 "임시 파일"**(1~2줄): "임시 파일은 세션 scratchpad에, 없으면 시스템 임시 폴더에 둔다. 레포 안에는 만들지 않는다. 남길 것은 `docs/`로 옮겨 쓴다. `docs/private/`는 건드리지 않는다."
  - scratchpad가 있는 환경에서는 시스템 지시와 겹친다.
  - 그래도 남기는 이유: scratchpad가 없는 환경(API 키·Bedrock 등)과 "레포에 두지 않는다·남길 것은 옮긴다"는 시스템 지시에 없어, "지우면 실수하는가" 기준을 통과한다.
- **rule이 실제로 로드되는지 확인**: 개편 뒤 첫 화면 작업에서 `/context`(또는 `/memory`)로 확인하고 결과를 SPEC 발견 절에 적는다.
- 초안(`examples/dot-claude/`)은 D-04(queryKey 방식) 결정과 이미 들어간 공용 부품(`StatusBadge` 등, `8db7987`)에 맞춰 고친 뒤 옮긴다(9절 L8).

---

## 4. 기존 감사 계획과의 관계

| 감사 항목 | 이 문서의 처리 |
|---|---|
| D-02 하네스 동결(채택) | 적용 시점을 동결 단계에 맞춘다(6절). 지금 바꿀 하네스 파일 없음(추천안 A 기준) |
| D-02 "지금" chore 묶음(P-A5·6·7·8 + 동결 조항, 대기 중) | 이 문서의 항목을 끼워 넣지 않는다. 단 별개 문제를 하나 발견했다(아래) |
| P-A3 SPEC 상시화((d) 묶음) | **보강**: 템플릿에 상태 줄 + 진행 절 4개, `CLAUDE.md`에 "진행 중 SPEC 먼저 읽기" 1줄. **채택된 (d) 목록의 내용이 바뀌므로 사용자 승인이 필요하다.** 승인되면 `05-proposals.md` P-A3·`decisions-needed.md` D-02에 "06 보강"을 표시한다 |
| P-A9 CLAUDE.md 구조 개편(첫 기능 뒤) | **보강**: 3.6 지침(남길 줄 목록, 문서 지도, 임시 파일 줄, 로드 확인 방법). 시점·실측 결론은 그대로. 이 묶음은 아직 날짜가 정해지지 않아 승인 시점에 함께 확인한다 |
| `docs/harness-backlog.md`(D-02 B안) | 그대로 쓴다. 첫 아이디어가 생길 때 만든다 |
| `decisions-needed.md` | D-xx가 모두 결정될 때까지 현행 목록으로 계속 쓴다. `docs/decisions/`는 그 밖의 새 결정용 |

**별개 발견 — P-A5 대상 줄이 밀림**: 05·`decisions-needed.md`·`examples/README.md`는 P-A5에서 `CLAUDE.md:87`을 고친다고 적었다. 그런데 그 뒤 커밋 `b5d5dab`에서 "커밋은 작업 단위로 묶는다" 조항이 한 줄 추가되면서 대상 문구는 지금 88줄에 있다. 적힌 줄 번호대로 적용하면 87줄의 커밋 단위 조항을 덮어쓴다.
- `:87`을 stash 줄로 가리키는 곳(대표): `05-proposals.md`의 105·329·333줄, `decisions-needed.md`의 45·100줄, `examples/README.md`의 45·65·175줄.
- 전체 목록은 `grep -n ':87' docs/ai-audit/*.md docs/ai-audit/examples/README.md`로 확인한다.
- Git 절의 `:87`·`:88`·`:89`를 함께 가리키는 곳(지금은 `:88`·`:89`·`:90`): `05-proposals.md` 183줄, `decisions-needed.md` 87줄.

"지금" 묶음을 실행할 때는 줄 번호가 아니라 문구로 대상을 찾아야 한다.

---

## 5. 채택하지 않은 것과 이유

| 항목 | 출처 | 이유 |
|---|---|---|
| `docs/plans/{active,completed}/` 별도 폴더 | OpenAI[O1] | P-A3 SPEC과 정보가 겹친다. SPEC 한 파일에 진행 절을 둔다 |
| 레포 안 임시 폴더(기본안) | — | Anthropic 설계는 레포 밖 scratchpad다. 레포 안은 tsconfig·ESLint·권한 비용이 생긴다(대안 B로만) |
| `ARCHITECTURE.md` | OpenAI[O1], matklad[T7] | CLAUDE.md 아키텍처 절과 ESLint 경계 규칙이 같은 일을 한다. 개요는 효과가 없었다[E1]. 도메인이 늘면 다시 본다 |
| `QUALITY_SCORE.md`, `core-beliefs.md`, 문서 정리 에이전트 | OpenAI[O1] | 팀·PR 수백 개 규모의 장치이고 양식도 공개되지 않았다 |
| `references/*-llms.txt`, `generated/` | OpenAI[O1] | Next 문서는 `node_modules/next/dist/docs/`, BE 계약은 core 코드가 기준이다. 사본은 낡는다 |
| `docs/README.md` 색인 | — | CLAUDE.md "문서 지도"가 같은 역할. 문서가 크게 늘면 다시 본다 |
| AGENTS.md를 기준 파일로 전환 | agents.md[O4] | Claude Code는 CLAUDE.md가 있으면 AGENTS.md를 직접 읽지 않는다[A1]. 지금처럼 CLAUDE.md가 import한다. 다른 도구를 쓰게 되면 다시 본다 |
| auto memory, `.claude/agent-memory/` | [A1][A6] | 클라우드에서 이어지지 않는다. 검토 없는 기억 파일은 오염 위험이 있다[B8]. 남길 지식은 검토되는 `docs/`에 쓴다 |
| `plansDirectory` 설정 | [A8] | plan 파일은 위치와 무관하게 압축 뒤 다시 주입된다[A5]. 이 프로젝트는 대화 plan + SPEC을 쓴다 |
| spec-kit·Kiro 전체 흐름(constitution, tasks.md 분리) | [T4][T5] | 파일 3~6개 분리는 1인 작업에 과하다 |
| verify에 "임시 폴더 참조 금지" 검사 | — | 추천안 A에서는 대상이 없다. B에서도 gitignore로 충분하다 |

## 6. 적용 시점

| 시점(D-02 단계) | 내용 | 커밋 |
|---|---|---|
| 지금 | 하네스 파일 변경 없음(추천안 A). 이 설계 문서만 커밋. B를 고르면 `.gitignore`·`tsconfig.json`·`eslint.config.mjs`·CLAUDE.md 1줄 → 동결 예외 승인 필요 | `chore:` 1개(문서만. CLAUDE.md Git 절의 허용 접두사는 feat·fix·chore·refactor) |
| (d) 첫 데이터 기능 착수 묶음 | P-A3 + 3.3 템플릿 확장 + "진행 중 SPEC 먼저 읽기" 1줄 | (d) 규칙 커밋에 포함 |
| 첫 기능 뒤 정리 | P-A9 + 3.6 지침. 첫 하네스 아이디어가 생기면 `harness-backlog.md` | P-A9 커밋에 포함 |
| 감사 목록 밖 새 결정이 처음 생길 때 | `docs/decisions/0001-<제목>.md` | 그 결정이 담긴 커밋에 포함 |

## 7. 결정이 필요한 것

1. **임시 파일 위치**: A. 공식 그대로 세션 scratchpad, 없으면 시스템 임시 폴더(추천, 지금 변경 없음) / B. 레포 안 `.scratch/`(동결 예외 + 설정 3곳 수정).
2. **채택된 동결 계획에 이 설계를 더할지**: (d) 묶음에 SPEC 진행 절·"진행 중 SPEC 먼저 읽기" 1줄, P-A9에 3.6 지침을 더한다(추천). 승인되면 05·`decisions-needed.md`의 해당 항목에 "06 보강"을 표시한다.

## 8. 한계

- 실증 연구는 대부분 2026년 프리프린트·초록이고, 효과 크기가 작으며 서로 엇갈린다.
- 2025 Claude Code 모범 사례 원문은 현재 공식 문서로 리다이렉트된다. 해당 문구는 제3자 사본으로 확인했다[B5].
- 직접 만든 서브에이전트가 경로 한정 규칙을 로드하는 시점은 문서 구조에서 추론했다(2.1). P-A9 적용 뒤 실측한다.
- "클라우드 앱에서 scratchpad 파일을 열 수 있다"는 이 세션의 환경 안내에 근거한다. 공개 문서에서는 확인하지 못했다.
- 사용자가 로컬 CLI·데스크톱·클라우드 중 어디서 주로 작업하는지에 따라 임시 파일 안 A의 불편함이 달라진다. 이 문서는 클라우드 세션을 기본으로 가정했다.
- 반대 근거 논문 하나(arXiv 2609.31587, 압축 문서가 소스가 있을 때 도움이 안 됨)는 결론 방향이 같아 표에서 뺐다.
- 검토 보고서 원문은 세션 scratchpad에 두었고 커밋하지 않는다. 지적과 반영 내용은 9절에 요약했다.

## 9. 검토 반영 기록 (라운드 1)

반박 검토 결과(높음 6, 중간 9, 낮음 9)와 반영 내용이다. 원문 보고서는 세션 scratchpad에 두었고 커밋하지 않는다.

| # | 지적 | 반영 |
|---|---|---|
| H1 | 구조 개편(2단계)은 D-02가 첫 기능 뒤로 미룬 P-A9이고, 크기 이득이 없다는 실측(05)을 무시 | 6절을 D-02 단계에 맞춤. 3.6에 실측 결론 인용, 줄 수 목표 삭제 |
| H2 | 1단계가 대기 중인 D-02 "지금" 커밋과 겹치고 동결 예외 근거가 없음. `backlog.md`가 `harness-backlog.md`와 충돌 | "지금" 추가 변경 없음. `harness-backlog.md`로 통일, 첫 아이디어 때 생성 |
| H3 | 레포 안 임시 폴더의 TS 파일이 typecheck·lint를 깨뜨림 | 추천을 A(레포 밖)로 변경. B 단점에 설정 3곳 수정 명시 |
| H4 | verify `git grep` 검사가 자기 자신과 매치되고, 종료 코드·`--untracked`도 틀림 | 검사 자체를 채택하지 않음(5절) |
| H5 | 여러 세션 계획이 "작업당 커밋 1개·확인 후 커밋" 규칙과 충돌 | 3.3: 커밋 단위 조항의 분할 규정으로 중간 커밋을 확인받는 방식 명시(10절 N2에서 변경) |
| H6 | P-A3 SPEC과 `plans/`가 중복 | `plans/` 폐기, SPEC 템플릿에 진행 절 추가 |
| M1 | "scratchpad가 유일한 공식 이름"은 틀림(`$CLAUDE_JOB_DIR/tmp` = scratch directory). `.scratchpad/`는 세션 scratchpad와 모호 | 2.5 표에 추가, B 이름을 `.scratch/`로 |
| M2 | plan 파일은 위치와 무관하게 압축 뒤 다시 주입 | 2.1 표·5절 정정 |
| M3 | 클라우드에서는 레포 안 폴더의 "사용자가 볼 수 있다" 이점 없음 | 2.5 B 단점에 반영 |
| M4 | 레포 안 폴더는 시스템 지시(세션 scratchpad 사용)와 경쟁하고, 확인 창과 glob 삭제 차단이 생김 | A 추천. B는 "레포 경로가 필요할 때만", 이름으로 삭제 |
| M5 | 경로 한정 규칙은 plan 단계·압축 뒤에 없음 | 2.1·3.1·3.6에 plan 단계 규칙은 CLAUDE.md 유지 명시 |
| M6 | 아키텍처 트리는 대부분 규약이라 줄이면 규칙이 사라짐 | 3.6에 남길 규약 목록 |
| M7 | 세션 흐름에서 결정·backlog를 커밋 뒤에 씀 | 3.5에서 커밋 전으로 |
| M8 | 1단계만으로 CLAUDE.md가 길어짐 | "지금" 변경 없음으로 해소 |
| M9 | `docs/README.md`·`decisions/0001`은 과함 | README 폐기(5절), decisions는 늦게 시작(10절 N6에서 변경) |
| L1 | IFScale 해석 오류 | 1절 P1 정정 |
| L2 | 머리말 출처 수 불일치 | "인용한 것 기준"으로 정정 |
| L3 | 반대 근거 누락 | [E10] 추가 |
| L4 | [E4] 범위 누락 | 10~15%p 추가 |
| L5 | [O5] 과대 해석 | "이유는 커밋에 없음"으로 완화 |
| L6 | 출처 표기 오류, 추론 미표시 | auto memory→[A1], 서브에이전트 rule 로드 (추론) |
| L7 | worktree 예외·compact hook 누락 | 2.1에 추가 |
| L8 | 초안이 낡음, D-04 의존 | 3.6 마지막 항목 |
| L9 | gitignore 폴더는 Grep에서도 빠짐 | B를 기본안에서 제외해 해소 |

## 10. 검토 반영 기록 (라운드 2)

| # | 지적 | 반영 |
|---|---|---|
| N1 | scratchpad가 생기는 조건(claude.ai 로그인, Anthropic API, `enableArtifact`)과 없을 때의 대안이 빠짐. "변경 0"이 3.6과 모순 | 2.5 표·0절에 조건과 대안(시스템 임시 폴더, 레포 금지) 추가. "지금 바꿀 파일 없음"으로 정정. 3.6에 임시 파일 줄을 남기는 이유 |
| N2 | SPEC만 담은 중간 커밋은 커밋되지 않은 코드를 완료로 기록 | 진행 항목에 커밋 해시 표기, 해시 없는 항목은 다시 확인. 중간 커밋에는 verify를 통과하는 코드까지 포함 |
| N3 | "모든 도구가 ①~④" 과장 | 0절: ①~③은 공통, ④는 일부 도구만 |
| N4 | `docs:` 접두사는 CLAUDE.md 허용 목록에 없음 | `chore:`로 |
| N5 | (d) 목록 변경도 사용자 승인 필요 | 0절·4절·7절에 명시 |
| N6 | `decisions/` 시작점·`decisions-needed.md` 보관 표기 모순 | D-xx는 기존 목록에 계속 기록, `decisions/`는 그 밖의 새 결정용 |
| N7 | `.shots/` 누락, SPEC 증거 칸이 커밋되지 않는 파일을 참조 | 2.5·3.2에 추가, 증거 칸에 한 줄 설명을 함께 적기 |
| N8 | `CLAUDE.md:87` 인용은 줄이 밀릴 수 있음. 05의 P-A5 대상 줄이 이미 밀림 | 조항 이름으로 인용. P-A5 줄 밀림은 4절 "별개 발견"으로 |
| N9 | 클라우드 앱에서 scratchpad를 열 수 있다는 주장에 출처 없음 | "이 세션 환경 안내, 공개 문서 미확인"으로 표기 |
| 낮음 | "scratch directory" 출처, "남기려면 옮기라"의 적용 범위, P8 선택 지시 표현, 트리 누락(`.shots/`·`learning/`), 진행 중 SPEC 찾는 명령, 검토 보고서 미커밋, 질문 (b)에 대한 직접 답 | 모두 반영. 2.5 맨 앞에 한 줄 답 |

## 11. 검토 반영 기록 (라운드 3, 마지막)

| # | 지적 | 반영 |
|---|---|---|
| 1 | 커밋 해시 규칙은 지킬 수 없음. SPEC은 자신이 들어갈 커밋의 해시를 미리 적을 수 없다 | 해시 규칙 삭제. 중간 커밋에도 코드를 넣으므로 커밋된 `[x]`는 코드와 일치. 새 세션은 `git status` 먼저 |
| 2 | 진행 중 SPEC 찾기 명령이 템플릿과 매치되고, 커밋 전 파일을 못 찾음 | 템플릿 상태 줄을 `<…>` 자리 표시로 바꾸고, 명령에 `--untracked`와 템플릿 제외를 추가. "맨 위"를 "제목 바로 아래"로 |
| 3 | 3.6 문서 지도의 `ai-audit/`(보관) 표기가 다른 절과 모순 | "현행 D-xx 목록 포함"으로 |
| 4 | 클라우드 앱에서 scratchpad를 열 수 있다는 주장 | **유지**. 검토 에이전트는 메인 세션의 환경 안내를 볼 수 없다. 이 세션의 안내에 "앱은 작업 디렉토리와 scratchpad의 파일을 열 수 있다"는 문장이 있다. 공개 문서 미확인 표시는 남김 |
| 5 | P-A5 줄 밀림 발견이 불완전 | 영향받는 위치와 확인 명령 추가 |
| 6 | 9절 H5·M9가 10절에서 바뀜 | 표시 추가 |

---

## 출처

**Claude Code 공식 문서**
- [A1] https://code.claude.com/docs/en/memory
- [A2] https://code.claude.com/docs/en/best-practices
- [A3] https://code.claude.com/docs/en/claude-directory (Session scratchpad directory)
- [A4] https://code.claude.com/docs/en/claude-code-on-the-web , https://code.claude.com/docs/en/cloud-environments
- [A5] https://code.claude.com/docs/en/context-window (What survives compaction), https://code.claude.com/docs/en/large-codebases
- [A6] https://code.claude.com/docs/en/sub-agents , https://code.claude.com/docs/en/features-overview , https://code.claude.com/docs/en/skills
- [A7] https://code.claude.com/docs/en/permission-modes (Protected paths, auto 모드 차단 목록)
- [A8] https://code.claude.com/docs/en/settings-reference (plansDirectory)
- [A9] https://code.claude.com/docs/en/env-vars (`CLAUDE_JOB_DIR`)

**Anthropic 엔지니어링·플랫폼**
- [B1] https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents , https://github.com/anthropics/claude-quickstarts/blob/main/autonomous-coding/prompts/coding_prompt.md
- [B2] https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices
- [B3] https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills , https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices
- [B4] https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5
- [B5] https://www.anthropic.com/engineering/claude-code-best-practices (현재 리다이렉트) — 원문 사본 https://gist.github.com/jussker/e825980ed46af2b99318e19ef01083be [2차]
- [B6] https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
- [B7] https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool
- [B8] https://www.anthropic.com/engineering/how-we-contain-claude
- 기타 참고: https://www.anthropic.com/engineering/multi-agent-research-system , https://www.anthropic.com/engineering/building-c-compiler , https://www.anthropic.com/engineering/harness-design-long-running-apps

**OpenAI**
- [O1] https://openai.com/index/harness-engineering/
- [O2] https://developers.openai.com/codex/guides/agents-md , https://developers.openai.com/codex/learn/best-practices , https://developers.openai.com/codex/skills
- [O3] https://cookbook.openai.com/articles/codex_exec_plans
- [O4] https://agents.md/
- [O5] https://github.com/openai/codex (2026-09-30 루트 AGENTS.md 삭제 커밋)

**다른 도구**
- [T1] https://raw.githubusercontent.com/google-gemini/gemini-cli/main/docs/cli/gemini-md.md , https://raw.githubusercontent.com/gemini-cli-extensions/conductor/main/README.md
- [T2] https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions
- [T3] https://cursor.com/docs/context/rules
- [T4] https://kiro.dev/docs/steering/ , https://kiro.dev/docs/specs/
- [T5] https://raw.githubusercontent.com/github/spec-kit/main/spec-driven.md
- [T6] https://adr.github.io/madr/
- [T7] https://matklad.github.io/2021/02/06/ARCHITECTURE.md.html

**실증 연구**
- [E1] https://arxiv.org/abs/2602.11988
- [E2] https://arxiv.org/abs/2601.20404
- [E3] https://vercel.com/blog/agents-md-outperforms-skills-in-our-agent-evals
- [E4] https://arxiv.org/abs/2607.27250
- [E5] https://arxiv.org/abs/2610.11007
- [E6] https://arxiv.org/abs/2507.11538
- [E7] https://research.trychroma.com/context-rot
- [E8] https://arxiv.org/abs/2608.23550
- [E9] https://arxiv.org/abs/2606.15828
- [E10] https://arxiv.org/abs/2606.20512
