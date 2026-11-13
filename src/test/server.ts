// 테스트용 가짜 BE. 처리기는 비워 두고, 테스트마다 필요한 응답만 넣는다:
//   server.use(http.get("/api/v1/sentences/random", () => HttpResponse.json({ ... })));
// 넣은 응답은 테스트가 끝나면 setup.ts가 지운다. 응답을 넣지 않은 요청은 테스트 실패로 처리된다.
import { setupServer } from "msw/node";

export const server = setupServer();
