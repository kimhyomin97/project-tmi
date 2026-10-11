# stop-check.mjs 변경 예시 — Markdown만 바뀐 턴은 검사 생략 (제안 P-A4-B, 발견 AI-05)

## 문제

`computeFingerprint()`(`.claude/hooks/stop-check.mjs:53-74`)는 HEAD 커밋 해시와 워킹트리 전체를 지문에 넣는다. 그래서 `*.md`만 고친 턴, 문서만 담은 커밋 직후에도 지문이 바뀌어 typecheck + lint + build(약 22초, `00-baseline.md`)가 돈다. 이번 점검처럼 문서 위주 작업에서는 턴마다 이 비용이 붙는다.

## 제외 범위: `*.md`만, `docs/**` 전체는 빼지 않는다

- `docs/**/*.mjs`도 lint 대상이다. `eslint.config.mjs:324-332`의 `globalIgnores`에 `docs`가 없고, `docs/ai-audit/examples/`의 `.mjs`는 루트 `pnpm lint`에 포함된다(`examples/README.md` "프로젝트 검증과의 관계"). `docs/**`를 지문에서 빼면 이 파일들이 Stop 검사망에서 빠진다.
- 그래서 `.md`만 뺀다. git 기본 pathspec에서 `*`는 `/`도 매치하므로 `':(exclude)*.md'` 하나가 루트 `CLAUDE.md`·`AGENTS.md`·`README.md`를 포함한 모든 `.md`를 뺀다. 반면 `':(exclude)**/*.md'`는 `/`가 하나 이상 있어야 매치돼 루트 `.md` 3개가 남는다(아래 실측).
- HEAD 쪽(JS 필터)도 같은 기준 `p.endsWith(".md")`로 맞춘다. 이때 `git ls-tree`는 `-z`로 받아 `\0`으로 나눈다. `-z` 없이 받으면 한글 등 비ASCII 경로가 `"docs/03_API\353\252\205\354\204\270.md"`처럼 따옴표로 감싸져 `.md"`로 끝나므로 필터를 빠져나간다(아래 실측 2). `status`·`diff`·`ls-files` 쪽은 git pathspec이 거르므로 따옴표와 무관하다.

## 변경안

```diff
 /** 워킹트리 지문. git이 실패하면 null(= 지문 없음)을 돌려주고 검사는 그대로 진행한다. */
+// Markdown은 typecheck·lint·build 결과에 영향을 주지 않으므로 지문에서 뺀다.
+// docs/** 전체를 빼지 않는다: docs 안의 .mjs(예: docs/ai-audit/examples)도 lint 대상이다.
+// 기본 pathspec에서 *는 /도 매치한다 → ':(exclude)*.md'가 루트 CLAUDE.md까지 모든 .md를 뺀다.
+const DOC_EXCLUDES = [".", ":(exclude)*.md"];
+const isDoc = (p) => p.endsWith(".md");
+
 function computeFingerprint() {
   try {
-    const head = git("rev-parse HEAD").trim();
-    const tracked = git("status --porcelain -uall") + git("diff HEAD");
-    const untracked = git("ls-files --others --exclude-standard -z")
+    const spec = DOC_EXCLUDES.map((s) => `"${s}"`).join(" ");
+    // HEAD 해시 대신 "Markdown을 뺀 트리 목록"을 쓴다. 문서만 담은 커밋으로는 지문이 바뀌지 않는다.
+    // (git ls-tree는 :(exclude) 매직을 지원하지 않아 JS에서 거른다 — 실측)
+    // -z: 비ASCII 경로가 따옴표·8진수로 감싸져 endsWith(".md")가 빗나가는 것을 막는다(core.quotePath 기본값 — 실측).
+    const head = git("ls-tree -r -z HEAD")
+      .split("\0")
+      .filter((line) => line && !isDoc(line.split("\t")[1] ?? ""))
+      .join("\n");
+    const tracked = git(`status --porcelain -uall -- ${spec}`) + git(`diff HEAD -- ${spec}`);
+    const untracked = git(`ls-files --others --exclude-standard -z -- ${spec}`)
       .split("\0")
```

작업량: 10여 줄(미실측 — hook 파일에 넣어 돌려 보지는 않았다).

## 확인한 것 (점검 중 실측, 범위 명시)

1. pathspec 차이(이 저장소, 2026-10-11):
   ```
   $ git ls-files -- . ':(exclude)*.md' | grep -c '\.md$'
   0
   $ git ls-files -- . ':(exclude)*.md' | grep -c 'docs/ai-audit/examples/.*\.mjs$'
   5        ← 커밋된 examples .mjs는 남는다
   $ git ls-files -- . ':(exclude)**/*.md' | grep '^[^/]*\.md$'
   AGENTS.md
   CLAUDE.md
   README.md   ← **/*.md로는 루트 .md가 빠지지 않는다
   ```
2. `git ls-tree -r HEAD -- . ':(exclude)*.md'`는 `fatal: … pathspec magic not supported by this command: 'exclude'`로 실패 → HEAD 쪽은 JS에서 거른다.
   비ASCII 경로(스크래치 디렉터리의 임시 저장소, `docs/03_API명세.md`·`a.ts` 두 파일, git 2.43.0):
   ```
   $ git ls-tree -r HEAD
   100644 blob 6178079…	a.ts
   100644 blob 7898192…	"docs/03_API\353\252\205\354\204\270.md"
   JS 필터 후 남은 경로   -z 없음: ["a.ts", "\"docs/03_API\353…\270.md\""]   ← .md가 남는다
                          -z 사용: ["a.ts"]
   ```
   지금 이 저장소의 커밋된 파일에는 비ASCII 경로가 0건이지만, BE 문서명처럼 한글 파일명이 생기면 바로 걸린다.
3. 지문 계산 부분만 떼어 낸 스크립트(라운드 1 변경안의 `computeFingerprint` 본문, `-z` 추가 전)를 저장소의 로컬 클론(스크래치 디렉터리)에서 돌린 결과. 실제 hook(`stop-check.mjs`)에 넣어 Stop 이벤트로 돌린 것은 아니다.

   | 단계 | 지문(앞 12자) | 기대 |
   |---|---|---|
   | 기준 | `bff57f3bae99` | — |
   | 루트 `CLAUDE.md`만 수정 | `bff57f3bae99` | 불변 ✓ |
   | `docs/design-system.md` 수정 | `bff57f3bae99` | 불변 ✓ |
   | 새 `.md`(untracked) 추가 | `bff57f3bae99` | 불변 ✓ |
   | 위 변경을 문서만 담은 커밋으로 | `bff57f3bae99` | 불변 ✓ |
   | `docs/ai-audit/examples/eslint/verify.config.mjs` 수정 | `02ce0b2a041a` | 바뀜 ✓(lint 대상 유지) |
   | 그 수정을 되돌림 | `bff57f3bae99` | 원래 값 ✓ |
   | `src/lib/env.ts` 수정 | `c2365a0dc083` | 바뀜 ✓ |

4. 적용 시 확인: 실제 hook에서 "루트 CLAUDE.md만 수정 → 턴 종료 시 검사 생략", "docs 안 .mjs 수정 → 검사 실행", "src 수정 → 검사 실행" 세 경우.

## 리뷰 반영 기록(라운드 1)

| # | 지적 요약 | 처리 | 위치 |
|---|---|---|---|
| 1 | `**/*.md`가 루트 .md를 못 뺌, JS 필터와 기준 불일치, 실측 범위 과장 | 반영: `':(exclude)*.md'`로 변경, JS 필터 `p.endsWith(".md")`로 통일, 루트 CLAUDE.md 케이스 포함 실측 표 추가, 실측 범위 명시 | 변경안, 확인한 것 1·3 |
| 3 | `docs/**`를 빼면 examples .mjs가 검사망에서 빠짐, "lint는 src·설정만 의미" 서술 오류 | 반영: `docs/**` 제외 삭제, 해당 주석 정정, `.mjs` 수정 시 지문이 바뀌는 것 실측 | 제외 범위, 확인한 것 3 |

## 리뷰 반영 기록(라운드 2)

| # | 지적 요약 | 처리 | 위치 |
|---|---|---|---|
| 8 | `git ls-tree -r HEAD`가 비ASCII 경로를 따옴표로 감싸 `endsWith(".md")`가 빗나감 | 반영: `ls-tree -r -z HEAD` + `\0` 분리로 변경. 한글 파일명 임시 저장소에서 두 방식 비교 실측. 실측 3의 표는 `-z` 추가 전 코드 결과임을 명시(ASCII 경로만 있어 결과 동일) | 변경안, 제외 범위, 확인한 것 2·3 |
