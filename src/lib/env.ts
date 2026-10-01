// 브라우저에 노출해도 되는 공개 환경변수(NEXT_PUBLIC_)만 둔다. 현재는 없다.
// BE 주소는 여기 두지 않는다 — next.config.ts의 rewrites가 서버에서 중계한다(CORE_API_URL).

export const env = {} as const;
