export class ApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
    message?: string,
  ) {
    super(message ?? `API request failed with status ${status}`);
    this.name = "ApiError";
  }
}

type RequestOptions = Omit<RequestInit, "body"> & { body?: unknown };

/**
 * 모든 BE API 호출은 이 클라이언트를 통해서만 한다.
 * 컴포넌트에서 fetch를 직접 호출하지 않는다.
 *
 * path는 같은 출처 경로(`/api/v1/...`)다. next.config.ts의 rewrites가 BE로 중계하므로
 * 브라우저(클라이언트 컴포넌트)에서만 호출한다.
 */
async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options;

  const res = await fetch(path, {
    ...rest,
    headers: {
      // body가 있을 때만 붙인다. GET에 application/json을 붙이면 불필요한 CORS preflight가 생긴다.
      ...(body !== undefined && { "Content-Type": "application/json" }),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    throw new ApiError(res.status, errorBody);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "POST", body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PUT", body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "DELETE" }),
};

/**
 * 오류를 화면 문구로 바꾸는 유일한 곳(ErrorState의 description). error.message를 화면에 그대로 쓰지 않는다.
 * 문구 규칙(docs/design-system.md): 무엇이 잘못됐고 어떻게 고치는지, 합니다체, 사과 금지.
 * BE가 꺼져 있으면 rewrites 중계가 500을 돌려준다(dev 실측) → "서버 오류(500)" 문구가 나온다.
 * 인증 방식이 아직 없어 401·403은 로그인 안내 없이 중립 문구다. 특정 화면만 다른 문구가 필요하면 그 화면에서 덮어쓴다.
 */
export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401 || error.status === 403) return "이 요청을 처리할 권한이 없습니다.";
    if (error.status === 404) return "요청한 주소를 찾지 못했습니다. 화면을 새로고침한 뒤 다시 시도하세요.";
    if (error.status === 429) return "요청이 너무 많습니다. 잠시 뒤 다시 시도하세요.";
    if (error.status === 503) return "서버가 일시적으로 응답하지 않습니다. 잠시 뒤 다시 시도하세요.";
    if (error.status >= 500) return `서버 오류(${error.status})가 났습니다. 잠시 뒤 다시 시도하세요.`;
    return `요청을 처리하지 못했습니다(${error.status}). 입력값을 확인하세요.`;
  }
  if (error instanceof SyntaxError) return "서버 응답을 읽지 못했습니다. 잠시 뒤 다시 시도하세요.";
  // fetch가 연결에 실패하면 TypeError("Failed to fetch" 등)를 던진다. 그 밖의 오류는 화면 코드 버그로 본다.
  if (error instanceof TypeError && /fetch|network|load failed/i.test(error.message)) {
    return "서버에 연결하지 못했습니다. 네트워크 상태를 확인한 뒤 다시 시도하세요.";
  }
  return "화면을 처리하는 중 오류가 났습니다. 브라우저 개발자 도구 콘솔에서 원인을 확인하세요.";
}
