# Before / After — "준비 중" 상태 표시 (제안 P-D1, 발견 DS-01)

## 문제

같은 상태("화면이 아직 없는 기능")가 두 곳에서 다른 모양으로 그려진다.

| 위치 | 코드 | 모양 |
|---|---|---|
| 홈 카드 | `src/app/(console)/page.tsx:25` `<Badge variant="outline">준비 중</Badge>` | 테두리형 |
| 사이드바 | `src/components/nav-link.tsx:54-56` `<Badge variant="secondary" …>준비 중</Badge>` | 채움형 |

스크린샷 `docs/ai-audit/screenshots/01-home@1280.png`에서 왼쪽 사이드바 배지는 회색 채움, 오른쪽 카드 배지는 테두리다. 다음 화면을 만드는 AI는 둘 중 하나를 임의로 고르거나 세 번째 모양을 만든다. 디자인 문서의 "색만으로 전하지 않는다(✓·▲·✕를 함께)" 규칙(`CLAUDE.md:76`)도 화면 코드마다 지켜야 한다.

## Before

```tsx
// src/app/(console)/page.tsx (발췌, 현재)
{item.href ? null : (
  <CardAction>
    <Badge variant="outline">준비 중</Badge>
  </CardAction>
)}
```

```tsx
// src/components/nav-link.tsx (발췌, 현재)
<Badge variant="secondary" className="group-data-collapsed/sidebar:sr-only">
  준비 중
</Badge>
```

## After

새 파일 하나와 두 호출부 수정. **새 파일 1개이므로 CLAUDE.md:12 기준 plan 필요**. plan 항목:

- ① `"use client"` 추가 없음. Zustand 필드·queryKey 없음.
- ② L1: `status-badge.tsx`에는 지시어를 붙이지 않는다. 지시어 없는 공용 부품은 **누가 import하느냐에 따라** 동작이 정해진다. 서버 파일인 `src/app/(console)/page.tsx`에서 import하면 서버 컴포넌트로 렌더된다. `"use client"` 파일인 `src/components/nav-link.tsx`(`:1`)에서 import하면 그 부품도 client 번들에 들어가 client 컴포넌트로 동작한다. StatusBadge는 훅·상태·이벤트가 없어 어느 쪽에서도 동작하므로 지시어가 필요 없다. 다만 `nav-link.tsx`에서 쓰는 분은 client 번들에 포함된다(부품이 작아 영향은 미미). 근거: `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md:176` "Once a file is marked with `"use client"`, all of its imports and the components it directly renders are included in the client bundle."
- ③ 의존성 없음.
- ④ 완료 조건: "홈 카드와 사이드바의 '준비 중'이 같은 모양이다" — `pnpm shot /`의 1280px 스크린샷으로 확인.

```tsx
// src/components/status-badge.tsx (신규)
import { Badge } from "@/components/ui/badge";

// 상태 표시는 이 부품 하나로 그린다: 같은 의미 = 같은 모양·같은 문구.
// 지금은 "준비 중"만 쓴다. 새 의미(성공·주의·실패)는 처음 필요한 화면에서 기호(✓·▲·✕)와 함께 추가한다.
const STATUS = {
  pending: { label: "준비 중", variant: "outline" },
} as const;

export type Status = keyof typeof STATUS;

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  const { label, variant } = STATUS[status];
  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  );
}
```

```tsx
// src/app/(console)/page.tsx (변경 부분)
import { StatusBadge } from "@/components/status-badge";
// …
{item.href ? null : (
  <CardAction>
    <StatusBadge status="pending" />
  </CardAction>
)}
```

```tsx
// src/components/nav-link.tsx (변경 부분)
import { StatusBadge } from "@/components/status-badge";
// …
<StatusBadge status="pending" className="group-data-collapsed/sidebar:sr-only" />
```

## 왜 이 형태인가

- **의미 → 모양 표를 부품이 소유**: `STATUS` 객체 한 곳만 보면 앱의 상태 표현을 다 알 수 있다. 화면 코드는 의미(`"pending"`)만 넘긴다.
- **미리 만들지 않는다**(`CLAUDE.md:8`): `success`·`warning`·`error`는 지금 쓰는 화면이 없어 넣지 않았다. 추가할 때 형태는 `{ label, variant, mark: "✓" }`처럼 기호를 함께 둔다.
- **토큰 규칙과 충돌 없음**: 클래스 문자열은 lint 대상이고, `variant`는 shadcn 생성물의 기존 변형을 고른다.
- **`className`은 덮어쓰기용 통로**: `Badge`는 `cn(badgeVariants({ variant }), className)`(`src/components/ui/badge.tsx:39`)으로 합친다. `cn`(npm `cn` 패키지)은 단순 연결이 아니라 Tailwind 클래스 병합이라 같은 속성이면 뒤에 온 호출부 클래스가 이긴다. 실측(2026-10-11): `node -e 'import("cn").then(m=>console.log(JSON.stringify(m.cn("p-2 p-4","text-sm text-lg"))))'` → `"p-4 text-lg"`. 그래서 `nav-link.tsx`의 `group-data-collapsed/sidebar:sr-only`처럼 위치별 보정만 넘기고 모양 자체는 `STATUS`에서 정한다.
- 변형 선택(`outline` vs `secondary`)은 디자인 판단이다. 여기서는 "활성이 아님"을 더 약하게 보이는 `outline`으로 통일했다. 사이드바 배경에서 대비가 약하다고 판단되면 `STATUS.pending.variant` 한 곳만 바꾸면 된다.

## 검증 (점검 중 실측)

After 코드를 임시 파일(`src/components/status-badge.tsx`, `src/components/zz-usage.tsx` — 두 사용 형태 포함)로 만들어 확인한 뒤 지웠다.

```
$ pnpm -s typecheck   → ✓ Types generated successfully, tsc 오류 없음
$ pnpm -s exec eslint --max-warnings 0 src/components/status-badge.tsx src/components/zz-usage.tsx   → 출력 없음(통과)
$ git status --short src   → 출력 없음(임시 파일 삭제 확인)
```

화면 확인(`pnpm shot /`)은 기존 파일을 수정해야 해서 이 점검에서는 하지 않았다. 적용할 때 완료 조건으로 확인한다.

## 리뷰 반영 기록(라운드 1)

| # | 지적 요약 | 처리 | 위치 |
|---|---|---|---|
| 2 | L1 설명이 반대("client에서 import해도 client 번들에 안 늘어남") | 반영: 지시어 없는 부품은 import한 쪽에 따라 서버/client로 동작, nav-link 사용분은 client 번들 포함으로 정정. Next 문서 줄 인용 | After의 plan ② |
| 11 | 제목이 DS-05를 해결한다고 하지만 다루지 않음 | 반영: 제목·본문에서 DS-05 삭제. 카드 링크(DS-05)의 반경·hover·focus는 P-D2-C(`PageContainer`, 여유 있을 때)와 별개로 첫 기능 화면에 `href`를 채우는 제품 코드 작업에서 다룬다(`05-proposals.md` P-D2) | 제목 |

## 리뷰 반영 기록(라운드 2)

라운드 2 리뷰(`reviews/examples-round-2.md`)에 이 파일 지적은 없다. 다른 문서와 맞추느라 고친 것만 적는다.

| # | 지적 요약 | 처리 | 위치 |
|---|---|---|---|
| — | P-D2가 A(다음 기능 전 (d))와 C·D-07(여유 있을 때)로 나뉨(`05-proposals.md` P-D2) | 반영: 라운드 1 기록 #11에서 카드 링크를 P-D2-C에 묶었던 표현을 "C와 별개로 첫 기능의 제품 코드 작업"으로 고침 | 라운드 1 기록 #11 |
| — | `className` 병합 동작이 근거 없이 전제됨 | 반영: `badge.tsx:39`와 `cn` 실측 출력 추가 | "왜 이 형태인가" |
