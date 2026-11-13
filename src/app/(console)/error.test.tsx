// 렌더 버그 안전망(error.tsx)이 사용자에게 무엇을 보여주고, "다시 시도"가 동작하는지.
// 클릭은 user-event로 실제 사용자처럼 재현한다. 요소는 역할·문구로 찾는다(eslint-plugin-testing-library).
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ConsoleError from "./error";

describe("콘솔 에러 화면", () => {
  // 컴포넌트가 원인 추적용으로 console.error를 남긴다. 테스트 출력이 지저분해지지 않게 가로챈다.
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("렌더 오류가 나면 오류 안내와 다시 시도 버튼이 보인다", () => {
    render(<ConsoleError error={new Error("boom")} retry={() => {}} />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "화면을 표시하지 못했습니다" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "다시 시도" })).toBeInTheDocument();
  });

  it("서버에서 난 오류면 메시지 원문 대신 오류 코드와 로그 검색 방법이 보인다", () => {
    const error = Object.assign(new Error("DB password=hunter2"), { digest: "4096731" });

    render(<ConsoleError error={error} retry={() => {}} />);

    expect(screen.getByText(/서버 로그에서 오류 코드 4096731를 검색하면/)).toBeInTheDocument();
    expect(screen.queryByText(/hunter2/)).not.toBeInTheDocument();
  });

  it("다시 시도를 누르면 재시도가 실행된다", async () => {
    const user = userEvent.setup();
    const retry = vi.fn();
    render(<ConsoleError error={new Error("boom")} retry={retry} />);

    await user.click(screen.getByRole("button", { name: "다시 시도" }));

    expect(retry).toHaveBeenCalledTimes(1);
  });

  it("원인을 찾을 수 있게 오류를 콘솔에 남긴다", () => {
    const error = new Error("boom");

    render(<ConsoleError error={error} retry={() => {}} />);

    expect(console.error).toHaveBeenCalledWith(error);
  });
});
