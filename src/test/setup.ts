// 모든 테스트 파일 앞에 실행된다(vitest.config.mts setupFiles).
import "@testing-library/jest-dom/vitest"; // toBeInTheDocument·toBeDisabled 같은 화면 단언
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, vi } from "vitest";
import { server } from "./server";

// 가짜 응답 없이 나간 요청. 요청 자체는 MSW가 실패시키지만, 앱 코드가 그 실패를 화면 문구로 바꿔
// 삼키면 테스트가 통과해 버린다. 그래서 따로 모아 두었다가 테스트가 끝날 때 실패시킨다.
const unhandled: string[] = [];

/**
 * 모인 요청이 있으면 실패시킨다.
 * 요청 가로채기는 비동기라, 테스트가 기다리지 않은 요청(예: "로딩 중이면 스켈레톤이 보인다"처럼
 * useQuery 요청을 띄워 두고 끝나는 테스트)은 테스트가 끝난 직후에야 기록된다. 그래서 검사 전에
 * 매크로태스크 하나를 기다린다(레드팀 실측: 기다리지 않으면 다음 테스트가 대신 실패하거나,
 * 파일 마지막 테스트면 server.close()에 묻혀 거짓 통과). 이 대기는 실제 타이머가 필요해서,
 * 가짜 타이머를 되돌리지 않은 테스트면 여기서 되돌린다(안 그러면 원인 없는 10초 타임아웃).
 */
async function waitForPendingRequests() {
  if (vi.isFakeTimers()) vi.useRealTimers();
  await new Promise((resolve) => setTimeout(resolve, 0));
}

function failOnUnhandled() {
  if (unhandled.length > 0) {
    const list = unhandled.splice(0).join(", ");
    throw new Error(`가짜 응답 없이 BE를 부른 요청이 있습니다: ${list}. 테스트에서 server.use(...)로 응답을 넣으세요.`);
  }
}

beforeAll(() => {
  server.listen({
    onUnhandledFrame({ frame, defaults }) {
      // HTTP 요청이면 메서드·주소를, 그 밖(WebSocket 등)이면 프로토콜 이름을 남긴다.
      const request = frame.protocol === "http" ? (frame.data as { request: Request }).request : null;
      unhandled.push(request ? `${request.method} ${request.url}` : frame.protocol);
      defaults.error();
    },
  });
});

// 정리를 먼저 하고 검사한다. 검사가 먼저 던지면 이 테스트의 화면·가짜 응답이 다음 테스트로 새어
// 엉뚱한 테스트가 실패하거나(같은 버튼 2개) 통과한다(남은 가짜 응답)(레드팀 실측).
afterEach(async () => {
  await waitForPendingRequests();
  cleanup(); // 그린 화면을 지운다(globals를 쓰지 않아 자동 정리가 없다)
  server.resetHandlers();
  failOnUnhandled();
});

afterAll(async () => {
  await waitForPendingRequests();
  server.close();
  failOnUnhandled();
});
