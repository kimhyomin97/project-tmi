SCORES: 근거성=4 구체성=3 일관성=3 판단가능성=3

## 총평
인용 25개 이상을 열어 봤고 줄 번호·문구가 모두 맞았다. 근거의 질은 승인할 수 있는 수준이다.
그러나 CS 목록에 "무엇을 하라"와 "어느 제안(P-xx)으로 해결하나"가 없어서 이 문서만 읽고는 결정할 수 없다. 또 2절의 404 판단은 `decisions-needed.md` D-07 추천과 정면으로 어긋난다. CS-08과 DS-03은 같은 문제인데 심각도가 다르다.
CS-04는 "1초 지연"만 다루고, 더 큰 문제인 "404를 빈 상태로 그릴 수단이 없다"를 놓쳤다.

## 점수 근거
- **근거성 4**: 파일:줄 인용은 모두 실제와 일치했다(아래 표). 설치본 소스(`retryer.ts:49-50`)와 Next 문서(`error.md:331`)까지 확인한 점이 강하다. 감점 요인은 두 가지다. 2절의 "잃는 것이 없다(추정)"는 설치된 Next 문서(`not-found.md`)를 확인하지 않은 채 나온 결론이다. 4절의 "허용은 `lib/api/**`·`features/*/api.ts`만"은 `eslint.config.mjs:313`의 `features/*/api/**`를 빠뜨렸다.
- **구체성 3**: 9절 표에 "언제 터지나"는 있지만 "수정안"·"관련 제안" 열이 없다. CS-03·CS-04·CS-07·CS-09·CS-10은 무엇을 바꾸라는지 이 문서 안에 없어서 `05-proposals.md`를 뒤져야 한다. 4절의 "타임아웃·취소"와 "빈 본문 200"은 관찰만 있고 ID도 조치도 없다.
- **일관성 3**: 404 셸 판단(2절)이 D-07 추천(B, "C는 영향 범위가 크다")과 반대다. CS-08(낮음)과 DS-03(중간)은 같은 404 배치 문제인데 심각도가 다르다. 5절은 "Next middleware/proxy"라고 쓰는데 P-C1·D-01은 Next 16 용어인 `proxy.ts`(middleware를 대체)를 쓴다.
- **판단가능성 3**: FE 경험이 적은 독자는 "그래서 지금 뭘 정하면 되나"를 표에서 바로 얻을 수 없다. CS-04를 "빈 상태가 1초 늦다"로만 설명해 우선순위를 낮게 판단하게 만든다. 실제로는 디자인 규칙(404 → 빈 상태)을 구현할 경로 자체가 정해져 있지 않다.

## 확인한 인용
| 인용 위치 | 문서 주장 | 실제 | 일치/불일치 |
|---|---|---|---|
| 3행 대상 커밋 `86e86bf` | 점검 기준 커밋 | 존재함. `86e86bf..HEAD` 사이에 `src`·설정 변경 없음 | 일치 |
| 7행 client 파일 6개 | 6개 | `git grep -l '"use client"'`: error, global-error, mobile-nav, nav-link, sidebar-collapse, providers = 6 | 일치(단 1절 트리에는 4개만 client로 표시됨) |
| `CLAUDE.md:49-63`, `:52`, `:66-68`, `:95`, `:96`, `:100`, `:8` | 트리·규칙 문구 | 줄과 문구 모두 일치 | 일치 |
| `next.config.ts:11`, `:12-14`, `:13`, `:7-14` | typedRoutes, rewrites 원문 | 일치(13행 원문 그대로) | 일치 |
| `src/lib/console-menu.ts:12`, `:29-31` | `href?: Route`, "토스 증권 계좌…" | 12행 `href?: Route;`, 30행 해당 문구 | 일치 |
| `src/lib/providers.tsx:8-18`, `:13-14` | `staleTime: 30_000`, `retry: 1` | 일치 | 일치 |
| `@tanstack/query-core@5.101.4 src/retryer.ts:49-50` | 첫 재시도 1초 | `Math.min(1000 * 2 ** failureCount, 30000)`. 171-175행에서 증가(187행) 전 `failureCount=0`으로 호출하므로 1000ms | 일치 |
| `src/lib/api/client.ts:1-10`, `:18-19`, `:21-41`, `:34-40` | ApiError, 주석, 발췌 | 일치(발췌는 24-32행을 한 줄로 축약) | 일치 |
| `eslint.config.mjs:27-67`, `:164-186`, `:261`, `:308-322` | 교차 feature 규칙, 네트워크 금지, utils 예외, 허용 경계 | 일치 | 일치(허용 범위 서술은 불완전, 지적 #6) |
| `src/app/(console)/error.tsx:27`, `:33-36` | `error.message` 노출, reset 후 retry | 일치 | 일치 |
| `node_modules/next/.../error.md:117-121`, `:331` | `retry` 설명, "v16.3.0 `retry` prop became stable" | 일치(Next 16.3.1 설치) | 일치 |
| `src/app/global-error.tsx:16-17`, `not-found.tsx:9-23`, `:11`, `(console)/layout.tsx:5-13`, `src/app/layout.tsx:14`, `(console)/page.tsx:8` | 각 구조 | 일치 | 일치 |
| `.env.example:4` | "실측: 실행 시 값을 바꿔도 반영 안 됨" | 일치 | 일치 |
| `src/lib/utils.ts:4`, `button.tsx:3`, `components.json:17` | `cn` 이중화 | 일치(`cn@0.4.0`은 shadcn의 clsx+tailwind-merge 대체 패키지) | 일치 |
| `docs/design-system.md:44`, `:49` | 404 → 빈 상태, `format.ts` 만·억 내림 | 일치 | 일치 |
| `package.json:5-14`, `.github/` 없음 | 테스트 스크립트 없음 | 일치 | 일치 |
| 8절 Mermaid 의존 그래프 | 실측 import | `git grep '^import'` 결과와 화살표가 모두 일치 | 일치 |
| 3절 "실측: 새로고침 후 접힘 유지" | 실측 | `screenshots/pw-report.json`의 `"collapsedAfterReload": 1`. 다만 문서에 이 출처가 없음 | 일치(출처 미기재) |

## 지적 사항
| # | 심각도 | 위치(문서 절·줄) | 문제 | 구체적 수정안 |
|---|---|---|---|---|
| 1 | 높음 | 2절 39행 | "셸을 루트로 올려도 잃는 것이 없다(추정)"는 D-07 추천 B("C는 레이아웃 구조 변경이라 영향 범위가 크다", `decisions-needed.md:76`)와 반대 결론이다. "루트 404는 셸을 가질 수 없다 → 셸을 루트로 올려야 한다"는 이분법도 근거가 없다. 셸은 그대로 두고 `(console)` 안에 catch-all 라우트(`[...rest]/page.tsx`에서 `notFound()`)와 `(console)/not-found.tsx`를 두는 방법이 있다. 설치된 `not-found.md:55-58`도 확인하지 않았다 | 39행을 사실만 남기도록 고친다("루트 `not-found.tsx`는 `(console)/layout.tsx` 밖에서 렌더된다"). 선택지(A 현행 / B `PageContainer` / C 셸을 루트로 / D `(console)` catch-all + `(console)/not-found.tsx`)는 D-07로 넘긴다. D를 D-07에 추가할지는 05·decisions와 함께 맞춘다. "추정"으로 판단하지 말고 Next 문서를 읽었으면 그 경로를 적는다 |
| 2 | 높음 | 9절 표(167-178행) 전체 | 표에 수정안도, 해결 제안(P-xx)과 결정(D-xx)으로 이어지는 연결도 없다. 이 문서만 읽어서는 결정할 수 없다. 반대 방향 연결(05 → CS)은 있으므로 정방향만 빠져 있다 | "조치 / 제안" 열을 추가한다. 예: CS-01 → D-01·P-C1 "배포 전 리버스 프록시 Basic 인증", CS-02 → P-C3·D-03, CS-03·CS-04 → P-C2, CS-05·CS-10 → P-C6, CS-06 → P-A7, CS-07 → P-C5, CS-08 → P-D2·D-07, CS-09 → (제안 없음, 신설하거나 "인증 도입 시 함께"로 명시) |
| 3 | 중간 | 3절 50행, CS-04(172행) | 문제를 "4xx 재시도 → 빈 상태가 1초 늦다"로만 잡았다. 더 근본적인 문제는 `client.ts:34-36`이 404를 `ApiError`로 던지므로 `useQuery`가 `isError`로 가서 **실패 화면**이 된다는 점이다. 디자인 규칙(`design-system.md:44` 404 → 빈 상태)을 지키려면 화면마다 `error.status === 404` 분기가 필요한데 그 관례가 없다. 재시도만 고쳐도 404는 여전히 실패로 그려진다 | CS-04 설명을 "404를 빈 상태로 바꾸는 위치가 정해지지 않았다(api.ts에서 404 → 빈 값으로 바꿀지, 컴포넌트에서 status로 분기할지). 부수적으로 4xx 재시도로 1초 지연"으로 고친다. P-C2와 `examples/code/api-error-and-retry.md`에 이 처리 방식이 들어 있는지 대조해 맞춘다 |
| 4 | 중간 | 9절 CS-08(176행) vs `02-design-system.md:163` DS-03 | 같은 현상(404가 셸 밖에서 다른 여백으로 그려짐)이 CS-08은 낮음, DS-03은 중간이다. P-D2와 D-07은 둘을 한 묶음으로 다룬다 | 심각도를 하나로 통일한다(시각 불일치뿐이라 둘 다 "낮음"이 타당하다. 중간으로 올린다면 이유를 적는다). 아니면 CS-08을 "DS-03과 같은 건"으로만 남긴다(CS-06을 AI-07과 같은 건으로 처리한 방식처럼) |
| 5 | 중간 | 4절 72-74행 | "타임아웃·취소 관례 없음"과 "200 + 빈 본문이면 `res.json()` 예외"를 발견해 놓고 ID·심각도가 없다. 빈 본문에서 나는 예외는 `ApiError`가 아니라 `SyntaxError`다. 그래서 CS-03이 말하는 오류 정규화 경로에서도 빠지고, 화면에는 "Unexpected end of JSON input" 같은 문구가 그대로 나올 수 있다 | CS-11(낮음~중간): "`ApiError`가 아닌 예외(네트워크 `TypeError`, 빈 본문 `SyntaxError`)가 정규화 밖에 있음"을 추가하고 P-C2의 `errorMessage(e)`가 이 경우도 처리하도록 연결한다. 타임아웃·`signal` 전달 관례는 P-C2 또는 P-C4(`queryOptions`의 `queryFn: ({signal}) => …`)에 넣는다 |
| 6 | 중간 | 9절 누락, `next.config.ts:7` | `CORE_API_URL`이 없으면 조용히 `http://localhost:8080`으로 빌드된다. 빌드 시점에 고정되므로(74행) VM에서 변수를 빠뜨리고 빌드하면 경고 없이 엉뚱한 곳으로 중계하고, 실행 중에는 바로잡을 수 없다. 74행이 "다시 빌드해야 함"까지만 쓰고 이 함정은 빠뜨렸다 | CS 항목(낮음)으로 추가한다: "프로덕션 빌드에서 `CORE_API_URL`이 없으면 빌드를 실패시키는 가드"(예: `NODE_ENV==="production" && !process.env.CORE_API_URL`이면 throw)를 제안 후보로 적고, 배포 절차 문서와 연결한다 |
| 7 | 낮음 | 4절 67행 | 허용 경계를 "`lib/api/**`·`features/*/api.ts`만"이라고 썼지만 실제로는 `src/features/*/api/**/*.{ts,tsx}`도 허용한다(`eslint.config.mjs:313`) | 세 경로를 모두 적는다 |
| 8 | 낮음 | 5절 80행 | "Next middleware/proxy"는 Next 16에서 `middleware`가 `proxy`로 바뀐 사실(P-C1이 `proxy.md`를 근거로 씀)과 용어가 다르다. 이 저장소는 "이 Next는 네가 아는 Next가 아니다"(`AGENTS.md`)를 전제로 하므로 옛 용어는 AI를 오도할 수 있다 | "Next 16 `proxy.ts`(구 middleware)"로 쓰고 `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`를 인용한다 |
| 9 | 낮음 | 6절 92행 | "`useQueryErrorResetBoundary`는 효과가 없다"는 판단이 코드 주석 "retry()만으로는 … 다시 던져지므로 먼저 초기화한다(실측)"(`error.tsx:16`)과 충돌하는데, 그 주석을 다루지 않았다. 둘 중 하나는 틀렸다 | 주석이 말하는 "실측" 조건(`throwOnError` 실험 등)을 확인할 수 없다고 쓰거나, 규칙상 도달할 수 없는 경로라 주석이 오해를 부른다는 결론을 낸다. 판단이 서면 AI-07(문서 드리프트)에 넣을지 결정한다 |
| 10 | 낮음(취향) | 1절 트리 19-24행 | 요약은 "client 6개"라는데 트리에는 4개만 `(client)`로 표시돼 있다(`error.tsx`·`global-error.tsx` 누락). `clsx`·`tailwind-merge` 의존성이 `utils.ts` 하나만을 위해 남아 있다는 점도 CS-05에서 빠졌다 | 트리에 두 파일을 `(client, Next 규약)`으로 표시한다. CS-05 수정안에 "삭제 시 `clsx`·`tailwind-merge` 의존성도 제거 후보"를 덧붙인다 |
| 11 | 낮음(취향) | 3절 46행 | "실측: 새로고침 후 접힘 유지"에 출처가 없다 | `screenshots/pw-report.json`의 `collapsedAfterReload`와 `pw-sidebar-collapsed@1280.png`를 인용한다 |

공개 레포 점검: 비밀값·내부 URL·개인정보는 없다(`localhost:8080`도 본문에 나오지 않는다).

## 승인 조건
- **구체성 → 4**: 9절 표에 "조치 / 제안(P-xx·D-xx)" 열을 추가한다(#2). 4절의 ID 없는 관찰(#5)과 `CORE_API_URL` 조용한 기본값(#6)을 CS 항목으로 올리고 수정안을 붙인다.
- **일관성 → 4**: 2절 404 판단을 D-07과 맞추고, 빠진 선택지(catch-all)를 반영하거나 Next 문서를 근거로 배제한다(#1). CS-08과 DS-03의 심각도를 통일한다(#4). proxy 용어를 05와 맞춘다(#8). 수정 뒤 05 P-C2·`examples/code/api-error-and-retry.md`가 바뀐 CS-04 정의(#3)와 맞는지 대조한다.
- **판단가능성 → 4**: CS-04를 "404를 빈 상태로 그릴 위치가 미정"이라는 본질로 다시 쓰고(#3), 각 CS에 "결정할 것 / 미뤄도 되는가"를 한 줄씩 붙인다. FE 경험이 적은 독자도 표 하나로 결정할 수 있게 하는 것이 목표다.
- 근거성은 4를 유지한다. 2절 결론을 고칠 때 Next 문서(`not-found.md`·`route-groups.md`) 경로를 인용한다.
