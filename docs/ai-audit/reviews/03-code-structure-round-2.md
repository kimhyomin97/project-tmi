SCORES: 근거성=4 구체성=4 일관성=4 판단가능성=4

## 총평
라운드 1 지적 11건은 모두 반영됐다. 인용 20여 개를 직접 열어 봤고 줄 번호와 문구가 전부 맞았다. 05 P-C2, examples, D-07, DS-03과도 ID·심각도·추천이 맞는다.
남은 약점은 404 선택지 D다. 설치된 문서로 금방 확인할 수 있는데도 "미검증"으로 남겼다. 그리고 D를 고르면 `typedRoutes`의 href 오타 방어가 사실상 꺼진다는 결과를 적지 않았다. 추천(B)은 바뀌지 않으므로 승인을 막는 문제는 아니다.

## 점수 근거
- **근거성 4**: 확인한 인용은 모두 일치했다(아래 표). 2절 D는 "`not-found.md`(및 `route-groups.md`)로 확인 필요(미검증)"로 끝난다. 그런데 `route-groups.md`에는 not-found 관련 내용이 없다(grep 결과 0건). 판단에 필요한 근거(`not-found.md:133`, `rewrites.md:48`, `typegen.js:165`)는 설치본에 있는데 쓰지 않았다. 그래서 5점은 아니다.
- **구체성 4**: 9절 표에 "대응(P-xx/D-xx)"와 "결정할 것 / 미룰 수 있나"가 생겼다. 그래서 CS마다 할 일과 시점이 보인다. CS-04에는 추천 위치까지 적혀 있다. 다만 D 선택지는 무엇을 확인하면 결론이 나는지가 비어 있다.
- **일관성 4**: CS-08과 DS-03이 모두 낮음으로 통일됐다(`02-design-system.md:174`, `decisions-needed.md:89`). D-07 선택지 A~D와 추천 B는 2절과 같다. CS-04·CS-11 정의는 P-C2(`05-proposals.md:220-222`)와 `examples/code/api-error-and-retry.md:5-30`과 맞는다. CS-12 ↔ P-C7, CS-09 ↔ P-C1 연결도 05 표(28·34행)와 맞다.
- **판단가능성 4**: FE 경험이 적은 독자도 9절 표 한 장으로 "배포 전 필수(CS-01·CS-12) / 다음 기능 전(CS-02·03·04·11) / 여유 있을 때"를 가를 수 있다. D-07에서 D를 고르면 무엇을 잃는지가 없어서, 독자가 D를 "더 완전한 방법"으로 오해할 여지는 있다.

## 확인한 인용
| 인용 위치 | 문서 주장 | 실제 | 일치/불일치 |
|---|---|---|---|
| 76행 `eslint.config.mjs:164-186`, `:310-314` | 네트워크 전역 금지, 허용 경로 3개 | 164행 `const NO_NETWORK_GLOBALS`부터 186행 `NO_BYPASS_PROPERTIES` 끝까지. 310-314행에 `src/lib/api/**/*.{ts,tsx}`·`src/features/*/api.ts`·`src/features/*/api/**/*.{ts,tsx}` | 일치(라운드 1 #7 반영 확인) |
| 89행 `proxy.md:11` | "The `middleware` file convention is deprecated and has been renamed to `proxy`" | 11행 원문 그대로 | 일치(#8 반영 확인) |
| 59행 `retryer.ts:49-50` | 첫 재시도 1초 | `query-core@5.101.4` 49-50행 `Math.min(1000 * 2 ** failureCount, 30000)` | 일치 |
| 54행 `sidebar-store.ts:12-20`, `sidebar-collapse.tsx:14-16`, `pw-report.json` | persist+skipHydration, 첫 렌더 뒤 rehydrate, 새로고침 후 유지 | 18행 `skipHydration: true`, 14-16행 `useEffect(() => { void useSidebarStore.persist.rehydrate(); }, [])`, `"collapsedAfterReload": 1`, 해당 png 존재 | 일치(#11 반영 확인) |
| 58행·CS-04 `client.ts:34-36`, `design-system.md:44` | 404도 `ApiError`로 throw, "404는 빈 상태" | 34-36행 `if (!res.ok) {… throw new ApiError(...)}`, 44행 "조건에 맞는 데이터가 없다는 404는 빈 상태로 그린다" | 일치 |
| 82행·CS-11 `client.ts:24`, `:40` | `fetch` TypeError, `res.json()` SyntaxError | 24행 `const res = await fetch(path, {`, 40행 `return res.json() as Promise<T>;` | 일치 |
| 83행·CS-12 `next.config.ts:6-7`, `.env.example:4` | 빌드 시점 고정, 기본값 localhost:8080, "실측: 실행 시 값을 바꿔도 반영 안 됨" | 6행 주석, 7행 `?? "http://localhost:8080"`, `.env.example` 4행 문구 일치 | 일치 |
| 88행 `next.config.ts:13`, `console-menu.ts:29-31` | rewrites 원문, "토스 증권 계좌의 보유 종목과 평가금액" | 13행 원문 그대로, 30행 description | 일치 |
| 96행 `error.tsx:33-36`, `error.md:117-121`, `:331` | reset 후 retry, `retry` 설명, "v16.3.0 `retry` prop became stable" | 일치 | 일치 |
| 100·101행 `error.tsx:27`, `:16` | `error.message` 노출, "(실측)" 주석 | 27행 `` `화면을 그리는 중 오류가 났습니다: ${error.message}` ``, 16행 주석 원문 일치. 도입 커밋 `a30b614` 본문에도 실측 조건이 없어 "확인 불가"는 타당 | 일치(#9 반영 확인) |
| CS-05 `package.json:20`, `node_modules/cn/package.json`, `utils.ts:4`, `eslint.config.mjs:261`, `components.json:17` | `cn` 패키지, "Drop-in replacement for clsx + tailwind-merge", utils 예외 | 20행 `"cn": "^0.4.0"`, description 문구 포함, 261행 `ignores: ["src/lib/utils.ts"]`, 17행 `"utils": "@/lib/utils"` | 일치 |
| CLAUDE.md `:8`, `:66-68`, `:95`, `:96`, `:100` | 각 규칙 문구 | 줄과 문구 모두 일치 | 일치 |
| 36행 `pnpm build` 출력 | `○ /`, `○ /_not-found` | `00-baseline.md:28-29` | 일치 |
| 1절 트리 | client 6개 표시 | error·global-error가 `(client, Next 규약)`으로 추가됨 | 일치(#10 반영 확인) |
| 8절 Mermaid | 실측 import | `git grep '^import' -- src ':!src/components/ui'` 결과와 화살표 전부 일치(CL→AS만, GE→UI만 등) | 일치 |
| 2절 47행 `route-groups.md` | D 방식 확인 근거 | 해당 파일에 not-found·`notFound` 언급 0건 | 불일치(근거로 부적절, 지적 #3) |

## 지적 사항
| # | 심각도 | 위치(문서 절·줄) | 문제 | 구체적 수정안 |
|---|---|---|---|---|
| 1 | 중간 | 2절 47행(D), 9절 CS-08(187행), `decisions-needed.md` D-07 D항 | 선택지 D(`(console)/[...rest]/page.tsx` + `notFound()`)에 숨은 대가가 있는데 적지 않았다. `typedRoutes`는 catch-all을 `` `/${CatchAllSlug<T>}` ``로 만든다(`node_modules/next/dist/server/lib/router-utils/typegen.js:165`, `:271-275`). 이 타입은 빈 문자열이 아닌 모든 경로와 맞으므로, 최상위 catch-all이 생기면 모든 href가 typecheck를 통과한다. `next.config.ts:10`이 밝힌 목적("메뉴 href 오타가 흰 404 화면으로 이어지는 것을 막음")이 사라진다. 독자는 D를 "작업은 조금 크지만 가장 완전한 방법"으로 읽을 수 있다 | D항에 "대가: `typedRoutes`의 오타 방어가 무력화된다(`typegen.js:165`). 오타는 typecheck 대신 셸 안 404로만 드러난다"를 한 줄 추가한다. D-07과 2절 문구를 같이 고친다. 그러면 추천 B의 이유가 "작업량"만이 아니게 된다 |
| 2 | 중간 | 2절 47행 "이번 점검에서 미검증", D-07 D항 | 라운드 1 #1은 "Next 문서를 읽었으면 그 경로를 적고, 아니면 근거로 배제하라"고 요구했다. 그런데 D는 다시 "확인 필요"로만 남았다. 판단 근거는 설치본에 모두 있다. 루트 `not-found`만 매칭되지 않은 URL을 받는다는 사실(`not-found.md:133` "the root `app/not-found.js` … handle any unmatched URLs"). 그래서 `(console)/not-found.tsx`만 두면 안 되고 catch-all이 반드시 필요하다는 점. 배열형 rewrites는 동적 라우트보다 먼저 적용되므로 catch-all이 `/api/v1/*` 중계를 가로채지 않는다는 점(`01-app/03-api-reference/05-config/01-next-config-js/rewrites.md:48` "applied after checking the filesystem … and before dynamic routes") | "미검증"을 위 두 인용으로 바꾼다. "D는 동작한다. catch-all이 필수이고 rewrites와 충돌하지 않는다. 대가는 #1"로 결론을 낸다. 확인하지 못한 부분(예: 실제 빌드에서 생기는 `/_not-found` 처리)이 남으면 그것만 미검증으로 남긴다 |
| 3 | 낮음 | 2절 47행 | 확인 근거로 든 `route-groups.md`에는 not-found 관련 내용이 없다 | 삭제하거나 #2의 `rewrites.md:48`로 바꾼다 |
| 4 | 낮음 | 리뷰 반영 기록 199행 | "05 P-C2·examples 대조는 담당 파일 밖이라 … P-C2 연결만 적음"이라고 했다. 하지만 이번 라운드에서 대조해 보니 P-C2(`05-proposals.md:220-229`)와 `examples/code/api-error-and-retry.md:5-30`은 바뀐 CS-04와 이미 맞는다. 기록이 실제보다 덜 처리된 것처럼 읽힌다 | "대조 완료 — P-C2 안 B ①, examples 0절과 일치"로 고친다 |
| 5 | 낮음 | 4절 83행, CS-12(191행) | "배포 때 누락을 알 수 없음"은 과장이다. 기본값 `localhost:8080`으로 빌드되면 첫 API 호출부터 연결 실패(502/500)로 바로 드러난다. 실제 위험은 "알 수 없음"이 아니라 "빌드 전에 막지 못하고, 고치려면 다시 빌드해야 함"이다 | "빌드는 성공하고, 배포 뒤 첫 호출에서야 연결 실패로 드러나며, 다시 빌드해야 고쳐진다"로 고친다. 심각도 낮음은 유지 |
| 6 | 낮음(취향) | CS-04 추천(183행) "4xx는 재시도 제외" | 408(Request Timeout)·429(Too Many Requests)는 4xx지만 재시도가 맞는 경우다. P-C2 식(`e.status < 500`)도 같다 | "4xx(408·429 제외)" 정도로 단서를 달거나, 첫 기능에서 core가 이 코드를 쓰는지 확인 후 정한다고 적는다 |

공개 레포 점검: 비밀값·개인정보는 없다. `localhost:8080`은 `.env.example`에 이미 있는 로컬 기본값이라 내부 URL 노출로 보지 않는다.

## 승인 조건
- 모든 항목이 4점이므로 현재 상태로 승인할 수 있다.
- 5점으로 올리려면: #1·#2를 반영해 선택지 D를 "동작함 + 대가(typedRoutes 무력화)"로 확정하고, 같은 문구를 `decisions-needed.md` D-07에 맞춘다(근거성·판단가능성). #3~#5는 문구 정정만 하면 된다.
