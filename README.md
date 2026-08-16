# project-tmi (FE)

개인 BE 마이크로서비스(`project-tmi-*`)의 진입점이 되는 프론트엔드 콘솔.

- **스택**: Next.js 16 (App Router) · React 19 · TypeScript · TanStack Query v5 · Zustand · Tailwind CSS v4 · shadcn/ui · pnpm
- **개발 방식**: 100% AI 주도 개발 (하네스 규칙은 [CLAUDE.md](./CLAUDE.md) 참고)
- **예정 기능**: 토스 증권 자산 대시보드 / 영어 학습(해석 채점 + 자체 LLM 해설) / 생활 유틸

## 시작하기

```bash
cp .env.example .env.local   # API base URL 설정
pnpm install
pnpm dev
```

## 브랜치

- `main` — 현재 코드베이스 (2026.08 전면 재구축)
- `legacy_v1`, `v2`, `v3`, `hyomin` — 2021~2024 구버전(CRA + Firebase) 아카이브. 수정 금지.
