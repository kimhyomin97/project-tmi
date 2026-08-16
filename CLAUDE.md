# project-tmi (FE)

개인 토이프로젝트 BE 마이크로서비스군(`../project-tmi-*`)의 진입점이 되는 프론트엔드 콘솔.
**이 프로젝트는 100% AI 주도로 개발한다.** 아래 규칙은 모든 AI 세션이 동일한 규율로 작업하기 위한 것이며, 임의로 벗어나지 않는다. 규칙 변경이 필요하면 먼저 이 문서를 수정하는 커밋을 만든다.

## 프로젝트 목적

- 사용자는 BE 개발자 본인 1명. 공개 서비스 아님 → SEO 불필요.
- 기능은 계속 증식한다: 토스 증권 자산 대시보드, 영어 학습(문장 해석 채점 + 자체 LLM 해설), 기타 생활 유틸.
- 오라클 VM에 배포하며, BE는 Spring Boot 마이크로서비스(추후 `project-tmi-gateway` 경유).
- 학습 목표: 현업(Next.js) 스택 경험. 기능 전달보다 올바른 구조가 우선.

## 스택 (고정)

| 영역 | 선택 | 비고 |
|---|---|---|
| 프레임워크 | Next.js 16 (App Router) + React 19 + TypeScript | |
| 서버 상태 | TanStack Query v5 | BE API 데이터는 전부 여기 |
| 클라이언트 상태 | Zustand | UI 상태만, 최소한으로 |
| 스타일링 | Tailwind CSS v4 + shadcn/ui (Base UI, base-nova preset) | 런타임 CSS-in-JS 금지 |
| 아이콘 | lucide-react | |
| 패키지 매니저 | pnpm | npm/yarn 명령 사용 금지 |

새 라이브러리 추가는 기존 스택으로 불가능할 때만, 커밋 메시지에 사유를 남기고 도입한다.

## 아키텍처 규칙

### 디렉토리 구조 (feature 단위)

```
src/
├── app/                  # 라우팅만. 페이지 로직은 features로 위임
│   └── (console)/        # 사이드바 셸이 감싸는 라우트 그룹
├── features/<name>/      # 기능 단위 모듈 (예: assets, english)
│   ├── api.ts            # 이 기능의 BE 호출 (apiClient 사용)
│   ├── queries.ts        # TanStack Query 훅 (queryKey 정의 포함)
│   ├── components/       # 이 기능 전용 컴포넌트
│   ├── store.ts          # (필요 시) Zustand 스토어
│   └── types.ts          # BE 응답/요청 타입
├── components/           # 공용 컴포넌트 (ui/ = shadcn 생성물)
└── lib/                  # 공용 유틸
    ├── api/client.ts     # 유일한 HTTP 클라이언트
    ├── env.ts            # 유일한 환경변수 접근점
    └── providers.tsx     # QueryClientProvider 등
```

- feature 간 직접 import 금지. 공유가 필요해지면 `lib/` 또는 `components/`로 승격.
- `app/`의 page.tsx는 feature 컴포넌트를 조립만 한다. 비즈니스 로직을 두지 않는다.

### 데이터 페칭

- **컴포넌트에서 fetch/axios 직접 호출 금지.** 반드시 `features/<name>/api.ts` → `lib/api/client.ts` 경유.
- BE 데이터는 반드시 TanStack Query 훅(`queries.ts`)으로 감싼다. `useEffect` + `useState` 페칭 금지.
- queryKey는 `["<feature>", ...]` 형태로 feature명을 prefix로 한다.
- LLM 응답 등 스트리밍은 fetch 스트리밍/SSE로 구현하되, 역시 feature의 api.ts에 둔다.

### 서버/클라이언트 컴포넌트

- 기본은 서버 컴포넌트. 상호작용(훅, 이벤트)이 필요한 지점에만 `"use client"`를 붙인다.
- `"use client"`는 가능한 한 트리의 말단(leaf)에 둔다. 페이지 전체에 붙이지 않는다.
- 비밀값(API 키 등)은 FE에 두지 않는다. 필요하면 BE(Spring)에서 처리한다. `NEXT_PUBLIC_` 접두사가 없는 환경변수는 브라우저에 노출되지 않음을 항상 확인한다.

### 상태 관리

- 서버에서 온 데이터 = TanStack Query. 클라이언트 UI 상태(사이드바 열림, 선택 탭 등) = Zustand 또는 로컬 useState.
- 서버 데이터를 Zustand에 복사해 넣지 않는다.

### 환경변수

- 접근은 `src/lib/env.ts`를 통해서만. `process.env`를 다른 파일에서 직접 읽지 않는다.
- 새 변수 추가 시 `.env.example`에도 반드시 추가한다.

### UI

- 새 UI 요소가 필요하면 먼저 `pnpm dlx shadcn@latest add <component>`로 shadcn 컴포넌트를 추가해 사용한다. 직접 만드는 것은 shadcn에 없을 때만.
- `src/components/ui/`(shadcn 생성물)는 직접 수정하지 않는다. 변형이 필요하면 감싸는 컴포넌트를 만든다.

## 새 feature 추가 절차 (표준 작업 단위)

1. `src/features/<name>/` 생성: types.ts → api.ts → queries.ts → components/
2. `src/app/(console)/<route>/page.tsx` 생성, feature 컴포넌트 조립
3. 사이드바 내비게이션에 메뉴 추가
4. `pnpm lint && pnpm build` 통과 확인 후 커밋

## 명령어

```bash
pnpm dev          # 개발 서버 (Turbopack)
pnpm build        # 프로덕션 빌드 — 커밋 전 반드시 통과
pnpm lint         # ESLint
```

## Git

- 브랜치: `main`이 기본. `legacy_v1`/`v2`/`v3`는 2021~2024 구버전 아카이브 — 절대 수정하지 않는다.
- 커밋 메시지: `feat:`, `fix:`, `chore:`, `refactor:` prefix의 한국어 요약.

## BE 연동 메모

- BE 저장소: `../project-tmi-back`, `../project-tmi-core`, `../project-tmi-chat`, `../project-tmi-gateway`(미연결), `../project-tmi-word`(Python).
- gateway 연결 전에는 `NEXT_PUBLIC_API_BASE_URL`이 개별 서비스를 가리킨다. gateway 연결 시 이 값만 교체하면 되도록 API 경로를 설계한다.
