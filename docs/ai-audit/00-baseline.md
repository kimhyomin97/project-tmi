# 00. 실행 가능 상태 확인 (baseline)

측정일: 2026-10-11 (UTC), 측정 커밋: `86e86bf` (main 최신) 위 작업 브랜치 `ai-audit/fe-audit`.
측정 환경: Linux 클라우드 컨테이너, root 사용자, Node v22.22.0, pnpm 11.22.0 (`package.json:43` `"packageManager": "pnpm@11.22.0"`과 일치).

## 결과 요약

| 단계 | 명령 | 결과 | 소요(real) |
|---|---|---|---|
| 의존성 설치 | `pnpm install` | 성공 | 14.2s |
| 타입체크 | `pnpm typecheck` (`next typegen && tsc --noEmit`) | 성공, 출력 없음 | 4.5s |
| lint | `pnpm lint` (`eslint --max-warnings 0`) | 성공, 경고 0 | 4.3s |
| 빌드 | `pnpm build` (`next build`, Turbopack) | 성공. 라우트 `/`, `/_not-found` 2개 모두 정적(○) | 13.6s |
| 테스트 | — | **테스트 러너·테스트 파일 없음** (`package.json` scripts에 `test` 없음, vitest/jest/playwright 의존성 없음) | — |
| 화면 촬영 | `pnpm shot / /nope` | **그대로는 실패(exit 2)**, 우회 후 4장 모두 PASS | 약 20s |
| 상호작용 촬영 | Playwright(점검용, 저장소 밖 임시 설치) | 성공 | 약 10s |

`pnpm verify`(= check + build) 전체 기준 약 22초. 이 시간은 Stop hook이 **턴마다**(코드 변경 여부와 무관하게 워킹트리 지문이 바뀌면) 지불하는 비용이다(지문 비교 `.claude/hooks/stop-check.mjs:53-84`, 실행 순서 `:102-105`).

## 빌드 출력(발췌)

```
▲ Next.js 16.3.1 (Turbopack)
✓ Compiled successfully in 6.8s
  Finished TypeScript in 3.1s ...
✓ Generating static pages using 3 workers (4/4) in 284ms
Route (app)
┌ ○ /
└ ○ /_not-found
```

## `pnpm shot` 실패와 우회

- 증상: `shot 실패: Chrome 디버깅 연결에 실패했습니다.` (exit 2)
- 원인 1: `scripts/shot.mjs:85-97` `findChrome()` 후보 목록에 Playwright 브라우저 경로(`/opt/pw-browsers/chromium`)가 없다 → `CHROME_PATH`로 지정해야 한다.
- 원인 2: root로 실행하는 Chromium은 `--no-sandbox` 없이 뜨지 않는다. 직접 실행 시 `Running as root without --no-sandbox is not supported.` 확인. `scripts/shot.mjs:190-202`의 실행 인자에 `--no-sandbox` 옵션이 없다.
- 우회(저장소 수정 없음): 스크래치 디렉터리에 `exec /opt/pw-browsers/chromium --no-sandbox "$@"` 래퍼를 만들고 `CHROME_PATH=<래퍼>`로 실행.
- 의미: `pnpm shot`은 사용자 PC(Windows/Git Bash 중심 설계, `scripts/shot.mjs:33-47`)에서는 동작하지만, **클라우드 세션·CI 같은 Linux root 환경에서는 AI가 화면 확인 루프를 돌릴 수 없다.** CLAUDE.md는 완료 보고에 `pnpm shot` 증거를 요구하므로(`CLAUDE.md:15`, `CLAUDE.md:21`) 이 환경에서는 규칙을 지킬 수 없는 상태다. → `05-proposals.md`에서 다룬다.

`pnpm shot` 결과(`.shots/report.json` 요약):

| 경로 | 폭 | HTTP | 넘침 | 콘솔 에러 | 판정 |
|---|---|---|---|---|---|
| `/` | 1280 | 200 | 없음 | 0 | PASS |
| `/` | 400 | 200 | 없음 | 0 | PASS |
| `/nope` | 1280 | 404 | 없음 | 0 | PASS |
| `/nope` | 400 | 404 | 없음 | 0 | PASS |

## 스크린샷 (`docs/ai-audit/screenshots/`)

| 파일 | 내용 | 도구 |
|---|---|---|
| `01-home@1280.png` · `01-home@400.png` | 홈(기능 카드 3개, 모두 "준비 중") | `pnpm shot` |
| `02-nope@1280.png` · `02-nope@400.png` | 404 화면 | `pnpm shot` |
| `pw-home-desktop@1280.png` | 홈 데스크톱 | Playwright |
| `pw-sidebar-collapsed@1280.png` | 사이드바 접힘 상태 | Playwright |
| `pw-mobile-drawer@400.png` | 모바일 서랍 메뉴 열림 | Playwright |
| `pw-focus-ring@1280.png` | Tab 키 첫 포커스(사이드바 접기 버튼)의 포커스 링 | Playwright |
| `pw-focus-link@1280.png` | Tab 2회 후 "홈" 링크 포커스(`:focus-visible`=true). Chromium이 `outline: auto`를 자체 포커스 링으로 그린 모습 | Playwright |
| `pw-report.json` | 상호작용·접근성 측정값 | Playwright |

Playwright 측정값(`pw-report.json`, 별도 Tab 순회 측정 포함):

- 사이드바 접기 → 새로고침 후에도 접힘 유지(`aside[data-collapsed]` 1개) — `src/lib/sidebar-store.ts:12-20`의 persist 동작 확인.
- 모바일 서랍: 열면 `role="dialog"` 1개, Esc로 닫힘. 콘솔 에러 0.
- 랜드마크: `h1` 1개("TMI 콘솔"), `nav[aria-label="주 메뉴"]` 1개, `main` 1개, `lang="ko"`, 탭 제목 "홈 · TMI 콘솔". 본문 바로가기(skip link) 없음.
- Tab 순회(데스크톱 홈): 보이는 포커스 가능 요소는 사이드바 접기 버튼과 "홈" 링크 2개뿐이다(링크된 기능 카드 없음). 그래서 3번째 Tab은 페이지를 벗어나 `body`가 된다(정상). 접기 버튼의 포커스 링은 `pw-focus-ring@1280.png`, "홈" 링크 포커스는 `pw-focus-link@1280.png`(Tab 2회 후 `:focus-visible`=true, 계산값 `outline: auto 1px`·색 `ring/50`이지만 Chromium은 `outline-style: auto`를 자체 포커스 링으로 그려 또렷이 보인다. Firefox·Safari는 미검증).
- `pw-report.json`의 `focusedAfter2Tabs`가 `BODY`인 이유: 측정 스크립트가 먼저 "사이드바 펼치기" 버튼을 클릭해 포커스가 그 버튼에서 시작했다(펼치기 → 홈 → 페이지 밖). 포커스 링이 없다는 뜻이 아니다. 링크 포커스의 근거는 `pw-focus-link@1280.png`다.

## 실행하지 못한 것

- **BE 연동 화면**: `src/features/`가 없어 데이터를 읽는 화면이 0개다. BE가 꺼진 상태의 실패 화면(3상태) 검증 대상이 없다.
- **테스트**: 테스트 자체가 없다.
- **`docs/private/`**: `.gitignore:45`로 제외되어 이 환경에 없다. CLAUDE.md·문서에서 이 경로를 참조하는 곳은 없어 영향 없음.
- **`../project-tmi-core` 등 BE 저장소**: 이 환경에 없다(`CLAUDE.md:94`가 계약 근거로 지정한 경로). BE 계약 관련 주장은 "확인 불가"로 둔다.

## 작업트리 상태(점검 시작 시점)

점검 시작 시 아래 변경이 이미 있었다(사용자 변경, 점검 대상 외로 손대지 않음).

```
A  .claude/hooks/check-done.sh     # 이 점검 작업용 Stop hook(클라우드 세션 전용)
 M .claude/settings.json           # 위 hook 등록
A  .gitattributes                  # *.sh text eol=lf
A  docs/ai-audit/TASK.md           # 이 지시서 (1단계 커밋에 포함)
```

## 리뷰 반영 기록(라운드 1)

리뷰: `reviews/01-ai-setup-round-1.md`(01 리뷰의 교차 지적).

| # | 지적 요약 | 처리 | 위치 |
|---|---|---|---|
| 10 | Stop hook 실행 순서 인용이 01과 다름(`:96-101`, 실제 `:102-105`) | 반영. `stop-check.mjs:102-105`로 수정, 지문 비교 범위(`:53-84`)를 함께 적음 | 결과 요약 아래 문단 |
| — | Tab 순회 서술과 `focusedAfter2Tabs=BODY` 해석(메인 세션 확정 사실) | 반영. 포커스 가능 요소 2개, 3번째 Tab이 `body`가 되는 이유, 측정 스크립트의 시작 위치 차이를 기술 | Playwright 측정값 |
| — | 링크 포커스 근거 스크린샷 추가 | 반영. `pw-focus-link@1280.png` 행 추가 | 스크린샷 표 |
