# 학습 로그

> 제안 P-A1 예시. `/learn` skill이 질문마다 한 줄을 추가한다. 사람이 직접 고쳐도 된다.
> 목적: AI가 내린 결정을 사람이 스스로 다시 내릴 수 있게 됐는지의 기록. "판정"이 `다름`인 L번호는 다음 plan에서 더 자세히 설명한다.

| 날짜 | L | 질문 요약 | 내 답 요약 | 판정 | 근거(파일:줄) |
|---|---|---|---|---|---|
| (예시) 2026-10-05 | L1 | nav-link는 왜 client, app-sidebar는 왜 server로 남을 수 있나 | 주소(usePathname)가 필요한 부품만 client, 메뉴 목록은 서버가 그려 children으로 넘김 | 맞음 | `src/components/nav-link.tsx:3`, `src/components/app-sidebar.tsx:7-8` |
| (예시) 2026-10-05 | L3 | 사이드바 접힘과 모바일 서랍 열림의 상태 위치가 다른 이유 | 둘 다 useState면 될 것 같음 | 다름 | 접힘은 떨어진 두 client 부품이 공유 + 새로고침 후 유지 → Zustand persist(`src/lib/sidebar-store.ts:1-3`). 서랍은 한 부품 안에서만 씀(`src/components/mobile-nav.tsx:3`) |
