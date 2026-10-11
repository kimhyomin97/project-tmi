# 디자인 토큰·구조 위반을 잡는 lint 규칙 예시

| 파일 | 제안 | 잡는 것 |
|---|---|---|
| `no-dynamic-class.mjs` | P-D3 (DS-06), 첫 데이터 기능 착수 묶음 (d) | 조립된 클래스 이름(`` `text-${size}` ``) — 현재 lint를 통과하고 Tailwind가 생성하지 않아 조용히 깨지는 형태 |
| `no-restricted-paths.mjs` | P-C5 (CS-07), 첫 기능 뒤 정리 | 역방향 import: `components`·`lib` → `features`·`app`, `features` → `app` |
| `verify.config.mjs` | — | 현재 `eslint.config.mjs`에 위 두 규칙을 얹은 **점검용** 설정. 실제 적용 시에는 `eslint.config.mjs`에 직접 합친다 |

기존 장치(`tmi/no-raw-design-values`, `tailwindcss/no-custom-classname`, style 우회 차단)는 이미 강하다. `02-design-system.md` 3.2절 샘플 17건의 분류는 차단 10, 정상·의도적 허용 4(#8·#9·#15·#17), 문서화된 한계 2(#5 props 묶음 style, #6 투명도 회색), 미문서화 구멍 1(#4 조립 클래스, DS-06)이다. `no-dynamic-class`는 이 미문서화 구멍 1건만 막는다.

## 실측 결과 (2026-10-11, 저장소 파일 생성 없이 `--stdin`으로 검사)

### no-dynamic-class

샘플 전체(17줄, `src/components/zz-dyn.tsx`로 가정 — 이 블록을 `dyn.tsx`로 저장하면 아래 줄 번호가 그대로 재현된다):

```tsx
import { cn } from "cn";

const map = { sm: "text-sm", lg: "text-lg" };

export function Dyn({ size, active }: { size: string; active: boolean }) {
  const url = `/api/v1/items/${size}`;
  console.log(`[api:${size}]`, url);
  return (
    <div>
      <p className={`text-${size}`}>a</p>
      <p className={cn(`bg-${size}-muted`)}>b</p>
      <p className={`px-3 ${active ? "font-bold" : "font-normal"}`}>c</p>
      <p className={`${map.sm} ${map.lg}`}>d</p>
      <p className={map[size as "sm"]}>e</p>
    </div>
  );
}
```

기대: 6·7줄(URL·로그 템플릿, 클래스 맥락 아님) 검사 안 함 / 10줄 차단 / 11줄 차단(한 번만 보고) / 12·13·14줄 허용.

```
$ pnpm -s exec eslint -c docs/ai-audit/examples/eslint/verify.config.mjs --stdin --stdin-filename src/components/zz-dyn.tsx < dyn.tsx
  10:21  error  클래스 이름을 조립하지 마세요('text-${…}'). Tailwind는 조립된 이름을 생성하지 않아 스타일이 빠집니다. … tmiExtra/no-dynamic-class
  11:24  error  클래스 이름을 조립하지 마세요('bg-${…}'). Tailwind는 조립된 이름을 생성하지 않아 스타일이 빠집니다. … tmiExtra/no-dynamic-class
✖ 2 problems (2 errors, 0 warnings)
exit=1
```

기대대로 10·11줄만 차단(메시지 뒷부분은 위에서 `…`로 줄였다). URL·로그 템플릿은 거짓 양성 없음. 첫 시험에서 11줄이 두 번 보고되는 문제를 발견해 "템플릿당 1회 보고"로 고쳤다.

### no-restricted-paths

```
# src/components/zz-card.tsx 에서 import HomePage from "@/app/(console)/page"
1:22 error Unexpected path "@/app/(console)/page" imported in restricted zone. 공용 코드(components·lib)는 features·app을 import하지 않습니다. … import/no-restricted-paths

# src/lib/zz.ts 에서 같은 import → 같은 오류

# src/features/english/api.ts 에서 import X from "@/app/(console)/page"
2:15 error … feature는 app(라우트)을 import하지 않습니다. 조립은 page.tsx에서 합니다 import/no-restricted-paths

# src/features/english/components/x.tsx 에서 import { PageHeader } from "@/components/page-header"
(출력 없음, exit 0 — 허용 방향)
```

### 한계

**no-dynamic-class — 변수에 담은 조립 클래스는 못 잡는다(실측).** 규칙은 템플릿 리터럴이 `className` 속성이나 `cn()` 등의 인자 안에 **직접** 있을 때만 본다(`no-dynamic-class.mjs:21-28`: 부모를 거슬러 올라가 className 속성·클래스 함수 호출을 찾고, 그 전에 문장이나 Program에 닿으면 검사하지 않는다). 아래처럼 먼저 변수에 담으면 통과한다.

```tsx
export function DynVar({ size }: { size: string }) {
  const cls = `text-${size}`;
  return <p className={cls}>a</p>;
}
```

```
$ pnpm -s exec eslint -c docs/ai-audit/examples/eslint/verify.config.mjs --stdin --stdin-filename src/components/zz-dyn-var.tsx < dyn-var.tsx
(출력 없음) exit=0
```

**no-dynamic-class — 문자열 `+` 조립도 못 잡는다(실측).** 규칙은 템플릿 리터럴만 본다. `"text-" + size`처럼 문자열을 `+`로 이어 붙이면 `className`이나 `cn()` 안에 직접 있어도 통과한다. 현재 `eslint.config.mjs`만으로 검사해도 같다(exit 0).

```tsx
import { cn } from "cn";

export function DynPlus({ size }: { size: string }) {
  return (
    <div>
      <p className={cn("text-" + size)}>a</p>
      <p className={"bg-" + size + "-muted"}>b</p>
    </div>
  );
}
```

```
$ pnpm -s exec eslint -c docs/ai-audit/examples/eslint/verify.config.mjs --stdin --stdin-filename src/components/zz-dyn-plus.tsx < dyn-plus.tsx
(출력 없음) exit=0
$ pnpm -s exec eslint --stdin --stdin-filename src/components/zz-dyn-plus.tsx < dyn-plus.tsx      ← 현재 설정
(출력 없음) exit=0
```

막으려면 className 맥락의 `BinaryExpression(+)` 중 한쪽이 `-`로 끝나는 문자열 리터럴인 경우를 같은 방식으로 검사하면 된다. 예시 규칙에는 넣지 않았다(AI가 템플릿 리터럴보다 덜 쓰는 형태이고, 적용 시 거짓 양성을 다시 재야 한다). 디자인 규칙의 "조립하지 말고 객체 맵에서 고른다" 문장이 이 형태도 덮는다.

모든 템플릿 리터럴로 범위를 넓히면 URL·로그 템플릿에서 거짓 양성이 나온다. 그래서 범위는 그대로 두고, 직접 쓴 경우의 오류 메시지가 "객체 맵에서 고르라"는 대안을 알려 주는 것으로 보완한다. 디자인 규칙 예시(`dot-claude/rules/design.md`)에도 "변수에 담으면 lint가 못 잡는다"를 적었다.

**no-restricted-paths(실측)** — import 대상 파일이 **존재하지 않으면** 경로를 해석하지 못해 검사하지 않는다(`@/features/english/queries`가 없을 때 `components`에서 import해도 통과). 없는 파일 import는 typecheck가 잡으므로 실제 위험은 작다.

### 현재 코드에 대한 거짓 양성

```
$ pnpm -s exec eslint -c docs/ai-audit/examples/eslint/verify.config.mjs src
(출력 없음) exit=0      ← 2026-10-11 리뷰 반영 후 재실행
```

`src/components/nav-link.tsx:33`의 `` `${itemBase} border-sidebar-primary …` ``처럼 완성된 클래스를 이어 붙이는 기존 코드는 통과한다.

## 적용 방법 (요약)

```js
// eslint.config.mjs — 기존 로컬 규칙(noRawDesignValues, :114)처럼 파일 안에 객체를 둔다(설정 파일 하나 유지)
const noDynamicClass = { /* no-dynamic-class.mjs의 객체 그대로 */ };
// :245 tmi 플러그인 rules에 추가
tmi: { rules: { "no-cross-feature-import": noCrossFeatureImport, "no-raw-design-values": noRawDesignValues, "no-dynamic-class": noDynamicClass } },
// :249 다음 줄
"tmi/no-dynamic-class": "error",
// (P-C5, 첫 기능 뒤 정리) 배열 끝(globalIgnores 앞)에 unidirectionalImports 객체 추가
```

P-D3은 첫 데이터 기능 착수 묶음 (d)의 규칙 커밋에 함께 넣는다(`examples/README.md` "적용 단계" (d) 6, 같은 커밋에서 `CLAUDE.md:75` 문구도 바꾼다). P-C5는 첫 기능 뒤 정리(첫 데이터 기능 커밋 뒤, `05-proposals.md` P-C5·4절)에서 따로 `chore:` 커밋으로 넣는다.

## 리뷰 반영 기록(라운드 1)

| # | 지적 요약 | 처리 | 위치 |
|---|---|---|---|
| 12 | 변수에 담은 조립 클래스 미검출이 한계에 없음, 샘플이 발췌라 줄 번호 재현 불가 | 반영: 한계 절에 실측과 함께 추가, 샘플 전체 17줄을 싣고 다시 실행한 출력으로 갱신 | "실측 결과", "한계" |

## 리뷰 반영 기록(라운드 2)

| # | 지적 요약 | 처리 | 위치 |
|---|---|---|---|
| 9 | `cn("text-" + size)` 같은 문자열 `+` 조립도 통과하는데 한계 절에 없음 | 반영: 샘플과 실측 출력(예시 설정·현재 설정 모두 exit 0)을 한계 절에 추가. 규칙 확장은 하지 않고 이유를 적음 | "한계" |

## 리뷰 반영 기록(라운드 3)

| # | 지적 요약 | 처리 | 위치 |
|---|---|---|---|
| 1 | P-C5 시점 "여유 있을 때"가 05의 "첫 기능 뒤 정리"와 다름 | 반영: 05 기준 "첫 기능 뒤 정리"로 통일(전체 기록은 `examples/README.md` 라운드 3) | 파일 표, "적용 방법" 주석·문단 |
