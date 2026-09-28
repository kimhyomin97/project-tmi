@AGENTS.md

# project-tmi (FE)

개인 토이프로젝트 BE 마이크로서비스군(`../project-tmi-*`)의 진입점이 되는 프론트엔드 콘솔.
**코드는 AI가 100% 작성한다. 사용자는 plan 승인 → 증거 확인 → merge만 한다.** 규칙 변경이 필요하면 먼저 이 문서를 수정하는 커밋을 만든다.

## 프로젝트 목적

- 사용자는 BE 개발자 본인 1명. 공개 서비스 아님 → SEO 불필요.
- 기능은 계속 증식한다: 토스 증권 자산 대시보드, 영어 학습(문장 해석 채점 + 자체 LLM 해설), 기타 생활 유틸.
- 오라클 VM에 배포하며, BE는 Spring Boot 마이크로서비스(추후 `project-tmi-gateway` 경유).
- 목표: AI 주도 FE 개발 방식 체득 + FE 고유 판단 지점(아래 학습 포인트)의 이해.

## 작업 루프

- **작은 수정**(diff를 1문장으로 설명 가능): plan 없이 바로 구현.
- **새 feature / 여러 파일 변경**: plan mode로 계획 → 승인 후 구현. plan에는 반드시 다음을 포함한다.
  - 필수 3줄: `"use client"` 파일 목록 / Zustand store 필드 / queryKey 목록 (없으면 "없음")
  - 학습 포인트: 해당 L번호와 선택 이유 2~3줄 (없으면 "없음")
  - 의존성 추가가 있으면 사유
- 화면 2개 이상인 큰 feature는 먼저 사용자를 인터뷰해 SPEC을 쓰고, 새 세션에서 구현한다.
- 완료 보고는 주장 대신 **증거**로: 실행한 명령과 출력, 화면 확인 방법, 3줄 요약, plan 파일 목록 대비 `git diff --stat`.
- 디버깅 시 수정 전에 원인을 1줄로 먼저 설명한다.

## 학습 포인트

| # | 판단 지점 | 흔한 오판 |
|---|---|---|
| L1 | Server/Client 경계 | 페이지 전체에 `"use client"` |
| L2 | 브라우저 노출 (`NEXT_PUBLIC_`, client 번들) | 서버 전용이라 믿은 값이 브라우저로 |
| L3 | 데이터 소유 (TanStack Query / Zustand / useState) | 서버 데이터를 store에 복사 |
| L4 | queryKey · invalidation | mutation 후 stale 화면 |
| L5 | 로딩·에러 경계 (Suspense, `error.tsx`) | 실패 시 흰 화면 |

- 해당 결정을 한 커밋에는 trailer를 남긴다: `Learn: L4 — mutation 후 ["assets"] invalidate`
- L1~L3 결정은 사용자가 이유를 이해했다고 답하기 전에는 수락된 것으로 보지 않는다.

## 막혔을 때

같은 문제로 2번 실패하면(또는 Stop hook이 3회 연속 실패를 알리면) 더 고치지 말고 막힘 리포트를 쓴다:
재현 방법 / 시도한 것 / 가설 2개 / 제안(`/clear` 후 재시작, 범위 축소, 마지막 green 커밋으로 되돌리기 중 택1).

## 스택 (고정)

| 영역 | 선택 | 비고 |
|---|---|---|
| 프레임워크 | Next.js 16 (App Router) + React 19 + TypeScript | Next 문서는 `node_modules/next/dist/docs/` 참조 |
| 서버 상태 | TanStack Query v5 | BE API 데이터는 전부 여기 |
| 클라이언트 상태 | Zustand | UI 상태만, 최소한으로 |
| 스타일링 | Tailwind CSS v4 + shadcn/ui (Base UI, base-nova preset) | 런타임 CSS-in-JS 금지 |
| 아이콘 | lucide-react | |
| 패키지 매니저 | pnpm | npm/yarn 명령 사용 금지 |

새 라이브러리 추가는 기존 스택으로 불가능할 때만, plan에서 승인받고 커밋 메시지에 사유를 남긴다.

## 아키텍처 규칙

```
src/
├── app/                  # 라우팅만. page.tsx는 feature 컴포넌트를 조립만 한다
│   └── (console)/        # 사이드바 셸이 감싸는 라우트 그룹
├── features/<name>/      # 기능 단위 모듈
│   ├── api.ts            # 이 기능의 BE 호출 (apiClient 사용, 스트리밍만 fetch 허용)
│   ├── queries.ts        # TanStack Query 훅 + queryKey (["<feature>", ...])
│   ├── components/       # 이 기능 전용 컴포넌트
│   ├── store.ts          # (필요 시) Zustand 스토어
│   └── types.ts          # BE 요청/응답 타입
├── components/           # 공용 컴포넌트 (ui/ = shadcn 생성물, 직접 수정 금지)
└── lib/
    ├── api/client.ts     # 유일한 HTTP 클라이언트
    ├── env.ts            # 유일한 환경변수 접근점
    └── providers.tsx     # QueryClientProvider 등
```

ESLint가 강제하는 규칙: feature 간 import 금지, `process.env`는 `lib/env.ts`에서만, `fetch`는 `lib/api/`와 `features/*/api.ts`에서만.
그 밖의 규칙:

- BE 데이터는 반드시 `queries.ts`의 TanStack Query 훅으로. `useEffect` + `useState` 페칭 금지. 서버 데이터를 Zustand에 복사하지 않는다.
- 기본은 서버 컴포넌트. `"use client"`는 트리의 말단에만.
- 비밀값은 FE에 두지 않는다(BE에서 처리). 새 환경변수는 `.env.example`에도 추가.
- 새 UI는 먼저 `pnpm dlx shadcn@latest add <component>`. 변형은 감싸는 컴포넌트로.

## 새 feature 추가 절차

1. `src/features/<name>/`: types.ts → api.ts → queries.ts → components/
2. `src/app/(console)/<route>/page.tsx`에서 조립
3. 사이드바 내비게이션에 메뉴 추가
4. `pnpm check` 통과 (Stop hook이 자동 실행), merge 전 `pnpm build`

## 명령어

```bash
pnpm dev          # 개발 서버 (Turbopack)
pnpm check        # typecheck + lint — Stop hook이 자동 실행
pnpm build        # 프로덕션 빌드 — merge 전 반드시 통과
```

## Git

- 작업은 feature 브랜치(`feat/…`, `fix/…`, `chore/…`)에서. main 직접 커밋 금지. push와 merge는 사용자가 한다.
- 커밋 메시지: `feat:`, `fix:`, `chore:`, `refactor:` prefix의 한국어 요약. merge 시 squash하지 않는다(`Learn:` trailer 보존).
- `legacy_v1`/`v2`/`v3`/`hyomin`은 2021~2024 구버전 아카이브 — 절대 수정하지 않는다.

## BE 연동 메모

- BE 저장소: `../project-tmi-back`, `../project-tmi-core`, `../project-tmi-chat`, `../project-tmi-gateway`(미연결), `../project-tmi-word`(Python).
- gateway 연결 전에는 `NEXT_PUBLIC_API_BASE_URL`이 개별 서비스를 가리킨다. gateway 연결 시 이 값만 교체하면 되도록 API 경로를 설계한다.
