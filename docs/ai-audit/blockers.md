# 막힌 것

점검 지시서 규칙("빌드·실행 환경 문제로 30분 이상 막히면 정리하고 분석 가능한 범위까지 진행")에 따라 기록한다.

## 1. 작업 브랜치 push와 PR 생성 불가 — 미해결

- 요구: `TASK.md` 완료 기준 "마지막에 작업 브랜치를 push하고 PR을 생성한다".
- 증상(실측, 2026-10-11):
  - `git remote -v` 출력 없음. 이 클라우드 환경의 저장소 클론에 원격이 설정돼 있지 않다.
  - `git push -u origin ai-audit/fe-audit` → `fatal: 'origin' does not appear to be a git repository … Please make sure you have the correct access rights and the repository exists.`
  - `gh auth status` → `Failed to log in to github.com using token (GH_TOKEN)`, `The token in GH_TOKEN is invalid.`
- 시도: 원격 URL을 추측해 추가하지 않았다(저장소 주소가 문서·설정 어디에도 없고, 추측한 주소로 push하면 엉뚱한 곳에 공개될 위험).
- 현재 상태: 모든 산출물은 로컬 브랜치 `ai-audit/fe-audit`에 커밋 1개로 있다(사용자 결정으로 단계별 커밋 20개를 합침. 합치기 전 기록은 백업 브랜치 `ai-audit/fe-audit-steps`).
- 사용자가 할 일(둘 중 하나):
  1. 원격이 연결된 환경에서 `git push -u origin ai-audit/fe-audit` 후 PR 생성. PR 본문 초안은 `docs/ai-audit/PR_BODY.md`.
  2. 이 세션에 원격 URL과 유효한 GitHub 토큰을 제공하면 AI가 push·PR을 수행.

## 2. `pnpm shot`이 root 환경에서 실패 — 우회함(30분 미만)

- 상세는 `00-baseline.md` "`pnpm shot` 실패와 우회". `--no-sandbox` 래퍼를 스크래치 디렉터리에 두고 `CHROME_PATH`로 지정해 촬영했다. 저장소는 수정하지 않았다. 개선안은 `05-proposals.md` P-A6.

## 3. 일부 외부 문서 접속 불가 — 대체 출처 사용

- `nextjs.org`, `tanstack.com`, `tkdodo.eu`, `designtokens.org`는 이 환경에서 DNS 실패·프록시 403. Next는 설치본 문서(`node_modules/next/dist/docs/`), TanStack·TkDodo·Bulletproof React는 GitHub raw 원본으로 대체했다(`04-research.md` 머리말).
