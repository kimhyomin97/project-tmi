---
paths:
  - "src/features/*/api.ts"
  - "src/features/*/types.ts"
  - "src/features/*/queries.ts"
  - "src/lib/api/**"
  - "next.config.ts"
---

# BE 연동 규칙 (api·types·queries·client·next.config 편집 시 로드)

plan 단계 원칙(같은 출처 `/api/v1/*`만 호출, 계약은 core 코드 기준, 새 엔드포인트는 `파일:줄`·모르면 묻기, 채점 503은 BE 문제)은 CLAUDE.md 본문 "BE 연동" 참조. 이 rule은 위 파일을 읽거나 편집할 때만 로드되며 세부만 둔다.

- **호출 경로 세부**: `next.config.ts` rewrites가 서버 전용 `CORE_API_URL`(빌드 시점 고정)로 중계한다. 브라우저에서 BE·LLM 주소를 직접 부르지 않는다.
- **계약 근거 세부**: `../project-tmi-core`의 `src/main/java/**/controller`와 DTO. `docs/public/03_API명세.md`는 코드보다 앞서 있으니 참고만 한다. `-word`는 core가 부르는 내부 서비스, `-back`·`-chat`·`-gateway`는 쓰지 않는다.
- **새 엔드포인트 세부**: 경로·메서드·응답 필드까지 확인하고 plan과 SPEC에 `파일:줄`을 적는다(추측해도 verify는 green이라 기계가 못 잡는다). BE가 없으면 plan에 mock 여부를 적고 `features/<name>/api.ts` 안에서만 분기한다.
- **오류**(P-C2 적용 후): `apiClient`는 2xx가 아니면 `ApiError`를 던진다(404 포함). "없음"을 뜻하는 404는 `features/<name>/api.ts`에서 빈 값(`null`·`[]`)으로 바꿔 빈 상태로 그리고, 나머지는 그대로 던진다. 화면 문구는 `errorMessage(e)`로 만든다. 4xx는 재시도하지 않는다(`providers.tsx`의 `retry` 정책). 예시: `docs/ai-audit/examples/code/api-error-and-retry.md`.
- **queryKey** — *D-04가 B(queryOptions 묶음)로 결정됐을 때의 문안*: feature당 `<feature>Queries` 묶음(`queryOptions`)에서만 만든다. mutation 성공 시 `queryClient.invalidateQueries({ queryKey: <feature>Queries.all.queryKey })`처럼 묶음의 접두 키로 무효화하고 `Learn: L4` trailer를 단다. queryFn은 `({ signal }) => api.x(…, { signal })`로 취소 신호를 넘긴다.
  - D-04가 A(현행 `["<feature>", ...]` 리터럴)면 이 항목을 현재 `CLAUDE.md:57` 문구("queryKey (["<feature>", ...] 리터럴로 정의)")와 mutation 후 해당 접두 키 invalidate로 바꾼다.
- **503 세부**: core가 부르는 `/similarity`가 word에 없고 word에는 `/judge`가 있다. 보고에는 이 경로 불일치를 적는다.
