// BE 응답에 따라 apiClient가 무엇을 돌려주고, 사용자에게 어떤 문구가 보이는지.
// 가짜 BE는 MSW가 네트워크 단계에서 대신한다 → 실제 apiClient의 fetch 경로까지 함께 검증된다.
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { server } from "@/test/server";
import { ApiError, apiClient, errorMessage } from "./client";

const URL = "/api/v1/sample";

/** 요청을 보내 실패시키고, 그 실패를 화면 문구로 바꾼 결과 */
async function messageFor(response: () => Response) {
  server.use(http.get(URL, response));
  const error = await apiClient.get(URL).catch((e: unknown) => e);
  return errorMessage(error);
}

describe("apiClient", () => {
  it("BE가 JSON을 주면 그 값을 돌려준다", async () => {
    server.use(http.get(URL, () => HttpResponse.json({ id: 1, text: "hello" })));

    await expect(apiClient.get(URL)).resolves.toEqual({ id: 1, text: "hello" });
  });

  it("본문을 보내면 JSON으로 보내고 Content-Type을 붙인다", async () => {
    let received: { contentType: string | null; body: unknown } | undefined;
    server.use(
      http.post(URL, async ({ request }) => {
        received = { contentType: request.headers.get("content-type"), body: await request.json() };
        return HttpResponse.json({ ok: true });
      }),
    );

    await apiClient.post(URL, { answer: "안녕" });

    expect(received).toEqual({ contentType: "application/json", body: { answer: "안녕" } });
  });

  it("GET에는 Content-Type을 붙이지 않는다", async () => {
    let contentType: string | null = "not-called";
    server.use(
      http.get(URL, ({ request }) => {
        contentType = request.headers.get("content-type");
        return HttpResponse.json({});
      }),
    );

    await apiClient.get(URL);

    expect(contentType).toBeNull();
  });

  it("BE가 204를 주면 undefined를 돌려준다", async () => {
    server.use(http.delete(URL, () => new HttpResponse(null, { status: 204 })));

    await expect(apiClient.delete(URL)).resolves.toBeUndefined();
  });

  it("BE가 실패 상태를 주면 상태 코드와 본문을 담은 ApiError를 던진다", async () => {
    server.use(http.get(URL, () => HttpResponse.json({ code: "SENTENCE_NOT_FOUND" }, { status: 404 })));

    const error = await apiClient.get(URL).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 404, body: { code: "SENTENCE_NOT_FOUND" } });
  });
});

describe("errorMessage — BE 실패가 사용자에게 보이는 문구", () => {
  it.each([
    [401, "이 요청을 처리할 권한이 없습니다."],
    [403, "이 요청을 처리할 권한이 없습니다."],
    [404, "요청한 주소를 찾지 못했습니다. 화면을 새로고침한 뒤 다시 시도하세요."],
    [429, "요청이 너무 많습니다. 잠시 뒤 다시 시도하세요."],
    [503, "서버가 일시적으로 응답하지 않습니다. 잠시 뒤 다시 시도하세요."],
    [500, "서버 오류(500)가 났습니다. 잠시 뒤 다시 시도하세요."],
    [400, "요청을 처리하지 못했습니다(400). 입력값을 확인하세요."],
  ])("BE가 %i를 주면 \"%s\"가 보인다", async (status, expected) => {
    await expect(messageFor(() => HttpResponse.json(null, { status }))).resolves.toBe(expected);
  });

  it("BE에 연결하지 못하면 네트워크를 확인하라는 문구가 보인다", async () => {
    await expect(messageFor(() => HttpResponse.error())).resolves.toBe(
      "서버에 연결하지 못했습니다. 네트워크 상태를 확인한 뒤 다시 시도하세요.",
    );
  });

  it("BE 응답이 JSON이 아니면 응답을 읽지 못했다는 문구가 보인다", async () => {
    await expect(messageFor(() => HttpResponse.text("<html>gateway</html>"))).resolves.toBe(
      "서버 응답을 읽지 못했습니다. 잠시 뒤 다시 시도하세요.",
    );
  });

  it("BE와 무관한 화면 코드 오류는 개발자 도구를 보라는 문구가 보인다", () => {
    expect(errorMessage(new TypeError("Cannot read properties of undefined"))).toBe(
      "화면을 처리하는 중 오류가 났습니다. 브라우저 개발자 도구 콘솔에서 원인을 확인하세요.",
    );
  });
});
