// 환경변수 접근은 반드시 이 파일을 통해서만 한다.
// (배포 환경 전환, gateway 연결 시 이 파일만 수정하면 되도록)

export const env = {
  /** BE API의 base URL. 지금은 개별 서비스, gateway 연결 후 gateway 주소로 교체 */
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080",
} as const;
