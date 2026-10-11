# API 오류 문구·재시도·404 처리 예시 (제안 P-C2, 발견 CS-03·CS-04·CS-11)

첫 데이터 기능 착수 커밋에 함께 넣을 최소 변경. "미리 만들지 않는다"(`CLAUDE.md:8`)에 따라 **지금 적용하지 않고**, 첫 기능에서 실제로 쓰일 때 넣는다.

## 0. 정할 것: 404를 빈 상태로 바꾸는 위치 (CS-04)

- 디자인 규칙은 "조건에 맞는 데이터가 없다는 404는 빈 상태로 그린다"(`docs/design-system.md:44`).
- 그런데 `apiClient`는 2xx가 아니면 404도 `ApiError`로 던진다(`src/lib/api/client.ts:34-36`). 그대로 두면 `useQuery`가 `isError`로 가서 **실패 화면**이 그려진다.
- 선택지: ① `features/<name>/api.ts`에서 "없음"을 뜻하는 404만 빈 값으로 바꾼다 ② 컴포넌트에서 `error.status === 404`로 분기한다.
- 추천: **①**. 어떤 404가 "없음"인지는 엔드포인트 계약(Controller)으로 정해지므로 계약을 아는 `api.ts`가 판단한다. 컴포넌트는 `data`가 비었는지만 보면 되고, 3상태 분기가 화면마다 갈라지지 않는다. 경로 오타 같은 다른 404는 그대로 던져 실패로 보인다.

```ts
// src/features/<name>/api.ts (예시 — 실제 경로·타입은 Controller/DTO 확인 후)
import { ApiError, apiClient } from "@/lib/api/client";
import type { WordResult } from "./types";

/** 오늘 채점 결과. 아직 채점하지 않았으면 BE가 404를 준다(계약: <Controller 파일:줄>) → null(빈 상태). */
export async function getTodayResult(opts?: { signal?: AbortSignal }): Promise<WordResult | null> {
  try {
    return await apiClient.get<WordResult>("/api/v1/<경로>", opts);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null; // "없음"을 뜻하는 404만
    throw e; // 나머지는 실패 화면으로
  }
}
```

## 1. 4xx는 재시도하지 않기 — `src/lib/providers.tsx`

Before (`src/lib/providers.tsx:11-16`):

```tsx
defaultOptions: {
  queries: {
    staleTime: 30_000,
    retry: 1,
  },
},
```

After:

```tsx
import { ApiError } from "@/lib/api/client";
// …
defaultOptions: {
  queries: {
    staleTime: 30_000,
    // 4xx(없는 데이터·잘못된 요청·권한)는 다시 해도 같은 결과다. 실패 안내를 1초 늦출 뿐이다.
    // ApiError 4xx를 제외한 모든 오류(5xx·네트워크·응답 파싱)를 1회 재시도한다. (L5)
    retry: (failureCount, error) =>
      !(error instanceof ApiError && error.status < 500) && failureCount < 1,
  },
},
```

식 `!(error instanceof ApiError && error.status < 500) && failureCount < 1`은 "`ApiError`이면서 4xx인 경우만 빼고 1회"다. `ApiError`가 아닌 `TypeError`(연결 실패)·`SyntaxError`(본문 파싱 실패)도 재시도 대상에 든다.

근거: 설치본 `@tanstack/query-core@5.101.4` `src/retryer.ts:170-177`에서 `retry`가 함수면 `retry(failureCount, error)`로 판단하고, 기본 지연은 첫 재시도 1000ms(`:49-50`). 현재 `retry: 1`은 4xx에도 약 1초를 기다린 뒤 실패를 그린다(`04-research.md` 부록 A).

## 2. 사용자 문구 한 곳에서 — `src/lib/api/client.ts`

`ApiError`가 아닌 예외도 여기서 받는다(CS-11): 연결 실패의 `TypeError`, 200인데 본문이 비어 `res.json()`이 던지는 `SyntaxError`(`client.ts:40`).

```ts
/**
 * 화면에 보일 오류 문구. 디자인 문서 "문구" 규칙: 무엇이 잘못됐고 어떻게 고치는지, 합니다체, 사과 금지.
 * BE 오류 본문 형식은 core의 예외 처리 코드를 확인한 뒤 body에서 메시지를 꺼내도록 보강한다(현재 확인 불가).
 * 인증 방식이 미정(D-01)이라 401/403 문구는 로그인 안내 없이 중립으로 둔다. 인증 도입(P-C1) 때 바꾼다.
 */
export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401 || error.status === 403) return "이 요청을 처리할 권한이 없습니다.";
    if (error.status === 404) return "요청한 주소를 찾지 못했습니다. 화면을 새로고침한 뒤 다시 시도하세요.";
    if (error.status === 503) return "서버가 일시적으로 응답하지 않습니다. 잠시 뒤 다시 시도하세요.";
    if (error.status >= 500) return `서버 오류(${error.status})가 났습니다. 잠시 뒤 다시 시도하세요.`;
    return `요청을 처리하지 못했습니다(${error.status}). 입력값을 확인하세요.`;
  }
  if (error instanceof SyntaxError) return "서버 응답을 읽지 못했습니다. 잠시 뒤 다시 시도하세요.";
  return "서버에 연결하지 못했습니다. 네트워크 상태를 확인한 뒤 다시 시도하세요.";
}
```

- 404 문구는 "없음"이 아닌 404(위 0절에서 던진 것)용이다. "없음" 404는 빈 상태로 그려지므로 이 문구가 보이지 않는다.
- 채점 화면처럼 503의 원인이 알려진 곳(`CLAUDE.md:96`, word에 `/similarity` 없음)은 그 화면에서만 문구를 덮어쓴다. 공용 문구에는 "채점"을 넣지 않는다.

사용(데이터 컴포넌트의 실패 상태):

```tsx
if (query.isError) {
  return (
    <Alert variant="destructive">
      <AlertTitle>불러오지 못했습니다</AlertTitle>
      <AlertDescription>{errorMessage(query.error)}</AlertDescription>
      <Button variant="outline" onClick={() => query.refetch()}>다시 시도</Button>
    </Alert>
  );
}
if (query.data === null) return <Empty …/>; // 0절에서 "없음" 404를 null로 바꾼 경우
```

(`Alert`는 아직 설치되지 않았다 — 첫 사용 때 `pnpm shadcn add alert`.)

## 3. BE가 꺼져 있을 때 실제로 오는 응답 (실측)

rewrites 중계 구조라 브라우저가 BE에 직접 연결하지 않는다. BE가 꺼져 있어도 브라우저는 `TypeError`가 아니라 Next 서버의 응답을 받는다.

```
$ CORE_API_URL=http://127.0.0.1:9 pnpm exec next dev -p 3917   (점검 중 임시 실행, 종료·포트 비움 확인)
$ curl -s -o /dev/null -w "status=%{http_code}\n" http://127.0.0.1:3917/api/v1/english/words
status=500          본문: Internal Server Error (JSON 아님 → client.ts:35에서 body=null)
dev 로그: Failed to proxy http://127.0.0.1:9/api/v1/english/words Error: connect ECONNREFUSED 127.0.0.1:9
```

따라서 BE 꺼짐은 `서버 오류(500)` 문구로 보인다. `TypeError` 문구는 Next 서버 자체에 닿지 못할 때(브라우저 오프라인 등)만 쓰인다. 프로덕션 빌드(`next start`)에서의 상태 코드는 확인하지 않았다.

## 4. 취소 신호 (CS-11, P-C4와 연결)

`apiClient`의 옵션은 `RequestInit`을 그대로 받으므로(`client.ts:12`) `signal`을 넘길 수 있다. queryFn이 `({ signal }) => getTodayResult({ signal })`로 넘기면 화면을 떠날 때 요청이 취소된다. 타임아웃 관례는 아직 없다. D-04가 B(queryOptions 묶음)로 결정되면 묶음의 queryFn에서 같이 넘긴다.

## 5. 테스트가 생기면 (P-C3)

`errorMessage`와 `retry` 함수는 순수 함수라 Vitest로 바로 검증할 수 있다. 입력 8종(401, 404, 400, 500, 503, `TypeError`, `SyntaxError`, 그 밖의 값)의 문구와 재시도 여부를 표 형태 테스트로 둔다. 0절의 404 변환은 `apiClient.get`을 가짜로 바꿔 "404 → null, 500 → throw"를 확인한다.

## 검증 상태

이 문서의 코드는 점검 중 컴파일하지 않았다(기존 파일 수정이 필요한 변경이라). 3절의 상태 코드만 실측했다. 적용 시 `pnpm verify`와 BE를 끈 상태의 `CORE_API_URL=http://127.0.0.1:9 pnpm shot <경로>`(red-team 방식)로 확인한다.

## 리뷰 반영 기록(라운드 1)

| # | 지적 요약 | 처리 | 위치 |
|---|---|---|---|
| 13-① | 주석은 "404는 빈 상태"인데 사용 예는 404를 실패로 그림 | 반영: 404 변환 위치를 `api.ts`로 정하고 예시 코드 추가(근거: `03-code-structure.md` CS-04). retry 주석에서 404 문장 삭제 | 0절, 1절, 사용 예 |
| 13-② | 401/403 "다시 로그인" 문구가 인증 미정(D-01)과 맞지 않음 | 반영: 중립 문구 "이 요청을 처리할 권한이 없습니다." | 2절 |
| 13-③ | 503을 "채점 서버"로 일반화, BE 꺼짐 상태 코드 미확인 | 반영: 503 "서버가 일시적으로 응답하지 않습니다", 채점 화면만 덮어쓰기. BE 꺼짐 = dev에서 500 실측 | 2절, 3절 |

## 리뷰 반영 기록(라운드 2)

| # | 지적 요약 | 처리 | 위치 |
|---|---|---|---|
| 7 | 반영 기록의 "공통 사실" 번호 참조가 `docs/ai-audit` 어디에도 정의되지 않음 | 반영: 근거 문서·절(`03-code-structure.md` CS-04)로 바꿈 | 라운드 1 기록 13-① |
| — | (메인 세션 확인) retry 주석 "네트워크 오류·5xx만"이 식과 다름 | 반영: "ApiError 4xx를 제외한 모든 오류(5xx·네트워크·응답 파싱) 1회 재시도"로 고치고 식 풀이 1줄 추가 | 1절 |
