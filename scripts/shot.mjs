#!/usr/bin/env node
/**
 * pnpm shot [경로...] [--widths=1280,400] [--wait=ms] [--url=http://localhost:3000]
 *
 * AI가 화면을 직접 확인하기 위한 도구. 의존성 없이 Node + 설치된 Chrome만 쓴다.
 *  1) next dev를 빈 포트에 띄운다. 이미 떠 있으면 그 서버를 쓴다(--url로 직접 지정해도 된다)
 *  2) 네트워크가 잠잠해질 때까지 기다린 뒤 경로마다 폭별로 전체 화면을 PNG로 찍는다 → .shots/
 *  3) 숫자로도 잰다: HTTP 상태, 최종 URL(리다이렉트), 가로 넘침, 콘솔 에러, 페이지 예외,
 *     실패한 네트워크 요청 → .shots/report.json
 *  4) 서버와 Chrome을 종료하고 포트가 비었는지 확인한다(Windows는 자식 프로세스가 남는다)
 *
 * 종료 코드: 0 통과 / 1 검사 실패(넘침·콘솔 에러·예외·문서 5xx) / 2 도구 오류
 * - 문서 404는 실패가 아니다(없는 주소 화면을 일부러 찍는 경우).
 * - 실패한 네트워크 요청(BE 500 등)은 실패가 아니라 network 항목으로만 남긴다.
 *   BE가 꺼진 상태에서 실패 화면을 제대로 그렸는지 확인하는 용도와 충돌하지 않게 하기 위함이다.
 * - 데이터가 타이머로 늦게 그려지는 화면은 --wait=ms로 추가 대기한다.
 */
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import os from "node:os";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const outDir = path.join(root, ".shots");
const isWin = process.platform === "win32";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// --- 인자 ---------------------------------------------------------------------
const args = process.argv.slice(2);
const opt = (name) => args.find((a) => a.startsWith(`--${name}=`))?.split("=").slice(1).join("=");

// Git Bash(MSYS)는 "/nope" 같은 인자를 "<Git 설치 경로>/nope"로 바꿔 넘긴다 → 설치 경로를 정확히 떼어낸다.
// "nope"처럼 앞의 /를 빼고 넘겨도 된다.
function msysRoot() {
  if (!process.env.MSYSTEM) return null; // Git Bash가 아니면 변환되지 않는다
  const r = spawnSync("cygpath", ["-m", "/"], { encoding: "utf8" });
  if (r.status === 0 && r.stdout.trim()) return r.stdout.trim();
  // cygpath가 없으면 EXEPATH(…\Git\bin)에서 bin을 뗀다
  return process.env.EXEPATH?.replace(/[\\/]bin[\\/]?$/i, "") ?? null;
}
const mroot = msysRoot()?.replace(/\\/g, "/").replace(/\/+$/, "");
const toRoute = (a) => {
  let r = a.replace(/\\/g, "/");
  if (mroot && r.toLowerCase().startsWith(mroot.toLowerCase())) r = r.slice(mroot.length) || "/";
  return r.startsWith("/") ? r : `/${r}`;
};
const routes = args.filter((a) => !a.startsWith("--")).map(toRoute);
if (routes.length === 0) routes.push("/");
const widths = (opt("widths") ?? "1280,400").split(",").map(Number).filter(Boolean);
const extraWait = Number(opt("wait") ?? 0);
let baseUrl = opt("url");

// --- 유틸 ---------------------------------------------------------------------
const freePort = () =>
  new Promise((resolve, reject) => {
    const s = net.createServer();
    s.unref();
    s.on("error", reject);
    s.listen(0, "127.0.0.1", () => {
      const { port } = s.address();
      s.close(() => resolve(port));
    });
  });

const portInUse = (port) =>
  new Promise((resolve) => {
    const sock = net.connect({ port, host: "127.0.0.1" });
    sock.once("connect", () => (sock.destroy(), resolve(true)));
    sock.once("error", () => resolve(false));
  });

function killTree(child) {
  if (!child || child.exitCode !== null) return;
  if (isWin) spawnSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], { stdio: "ignore" });
  else {
    try {
      process.kill(-child.pid, "SIGTERM");
    } catch {
      child.kill("SIGTERM");
    }
  }
}

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    `${process.env.LOCALAPPDATA ?? ""}/Google/Chrome/Application/chrome.exe`,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ].filter(Boolean);
  return candidates.find((p) => fs.existsSync(p));
}

// 파일 이름: 순번을 붙여 겹치지 않게 한다(한글 경로·/a/b와 /a_b가 같은 이름이 되는 문제)
const fileName = (i, route, width) => {
  const s = route === "/" ? "home" : route.replace(/^\//, "").replace(/[^\w-]+/g, "_") || "page";
  return `${String(i + 1).padStart(2, "0")}-${s}@${width}.png`;
};

// 개발 도구 버튼(Next 표시, React Query Devtools)이 화면 구석을 가리지 않게 촬영 전에 숨긴다
const HIDE_DEV_TOOLS = `(() => { const s = document.createElement("style");
  s.textContent = "nextjs-portal, .tsqd-parent-container, .tsqd-open-btn-container { display: none !important; }";
  document.head.appendChild(s); })()`;

// --- CDP(크롬 디버깅 프로토콜) 최소 클라이언트 ---------------------------------
function cdp(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let id = 0;
  const pending = new Map();
  const listeners = new Set();
  ws.addEventListener("message", (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(msg.error.message));
      else resolve(msg.result);
    } else if (msg.method) listeners.forEach((fn) => fn(msg));
  });
  return {
    ready: new Promise((resolve, reject) => {
      ws.addEventListener("open", resolve, { once: true });
      ws.addEventListener("error", reject, { once: true });
    }),
    send: (method, params = {}) =>
      new Promise((resolve, reject) => {
        const my = ++id;
        pending.set(my, { resolve, reject });
        ws.send(JSON.stringify({ id: my, method, params }));
      }),
    on: (fn) => listeners.add(fn),
    off: (fn) => listeners.delete(fn),
    close: () => ws.close(),
  };
}

// --- dev 서버 -----------------------------------------------------------------
let devServer;
let devPort;

async function startDevServer() {
  devPort = await freePort();
  let log = "";
  devServer = spawn(process.execPath, [path.join(root, "node_modules/next/dist/bin/next"), "dev", "-p", String(devPort)], {
    cwd: root,
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
    detached: !isWin,
  });
  devServer.stdout.on("data", (d) => (log += d));
  devServer.stderr.on("data", (d) => (log += d));

  for (let i = 0; i < 90; i++) {
    await sleep(1000);
    const at = log.search(/already running/i);
    if (at >= 0) {
      // 같은 폴더에서 이미 dev 서버가 돌고 있으면 Next가 두 번째 실행을 거부한다 → 그 서버를 쓴다.
      // 포트는 "already running" 이후 문구에서만 찾는다(앞쪽에는 방금 띄운 서버의 배너가 있다).
      const m = log.slice(at).match(/https?:\/\/(?:localhost|127\.0\.0\.1):\d+/);
      killTree(devServer);
      devServer = undefined;
      devPort = undefined;
      if (!m) throw new Error("이미 실행 중인 dev 서버가 있습니다. --url=http://localhost:<포트>로 지정하세요.");
      console.log(`이미 실행 중인 dev 서버를 사용합니다: ${m[0]}`);
      return m[0];
    }
    try {
      if ((await fetch(`http://localhost:${devPort}/`)).status < 500) return `http://localhost:${devPort}`;
    } catch {}
  }
  throw new Error(`dev 서버가 90초 안에 응답하지 않았습니다.\n${log.slice(-800)}`);
}

// --- 본체 ---------------------------------------------------------------------
let chromeProc;
let exitCode = 0;

try {
  if (typeof WebSocket === "undefined") throw new Error("Node 22 이상이 필요합니다(전역 WebSocket).");
  const chromePath = findChrome();
  if (!chromePath) throw new Error("Chrome을 찾지 못했습니다. CHROME_PATH 환경변수로 경로를 지정하세요.");
  if (!baseUrl) baseUrl = await startDevServer();

  // 헤드리스 Chrome
  const debugPort = await freePort();
  chromeProc = spawn(
    chromePath,
    [
      "--headless=new",
      "--disable-gpu",
      "--hide-scrollbars",
      "--no-first-run",
      `--remote-debugging-port=${debugPort}`,
      `--user-data-dir=${fs.mkdtempSync(path.join(os.tmpdir(), "tmi-shot-"))}`,
      "about:blank",
    ],
    { stdio: "ignore", detached: !isWin },
  );
  let target;
  for (let i = 0; i < 40 && !target; i++) {
    await sleep(250);
    try {
      target = (await (await fetch(`http://127.0.0.1:${debugPort}/json`)).json()).find((t) => t.type === "page");
    } catch {}
  }
  if (!target) throw new Error("Chrome 디버깅 연결에 실패했습니다.");
  const page = cdp(target.webSocketDebuggerUrl);
  await page.ready;
  await Promise.all(["Page.enable", "Runtime.enable", "Log.enable", "Network.enable"].map((m) => page.send(m)));

  // 진행 중인 네트워크 요청 수(웹소켓 제외). 0인 상태가 이어지면 "잠잠하다"고 본다.
  const inflight = new Set();
  page.on((msg) => {
    const p = msg.params;
    if (msg.method === "Network.requestWillBeSent") inflight.add(p.requestId);
    if (msg.method === "Network.loadingFinished" || msg.method === "Network.loadingFailed") inflight.delete(p.requestId);
  });
  async function waitNetworkIdle(quietMs = 600, maxMs = 15000) {
    const start = Date.now();
    let quietSince = Date.now();
    while (Date.now() - start < maxMs) {
      if (inflight.size > 0) quietSince = Date.now();
      else if (Date.now() - quietSince >= quietMs) return true;
      await sleep(100);
    }
    return false;
  }

  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });
  const results = [];

  for (const [ri, route] of routes.entries()) {
    for (const width of widths) {
      const url = new URL(route, baseUrl).toString();
      const errors = [];
      const network = [];
      let status = null;
      const onEvent = (msg) => {
        const p = msg.params;
        if (msg.method === "Network.responseReceived" && p.type === "Document" && status === null) status = p.response.status;
        if (msg.method === "Runtime.exceptionThrown") errors.push(`예외: ${p.exceptionDetails?.exception?.description ?? p.exceptionDetails?.text}`);
        if (msg.method === "Runtime.consoleAPICalled" && p.type === "error")
          errors.push(`console.error: ${p.args.map((a) => a.value ?? a.description ?? "").join(" ")}`);
        if (msg.method === "Log.entryAdded" && p.entry.level === "error") {
          // 실패한 리소스 요청(BE 500, 404 이미지 등)은 화면 에러가 아니라 네트워크 기록으로 둔다
          // 문서 자체의 404는 HTTP 상태로 이미 보고하므로 제외한다
          if (p.entry.source === "network") {
            if (p.entry.url !== url) network.push(`${p.entry.text}${p.entry.url ? ` (${p.entry.url})` : ""}`);
          }
          else errors.push(`브라우저: ${p.entry.text}`);
        }
      };
      page.on(onEvent);
      inflight.clear();

      await page.send("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: width < 640 });
      const loaded = new Promise((resolve) => {
        const fn = (m) => m.method === "Page.loadEventFired" && (page.off(fn), resolve());
        page.on(fn);
      });
      await page.send("Page.navigate", { url });
      await Promise.race([loaded, sleep(30000)]);
      const idle = await waitNetworkIdle(); // 데이터 요청이 끝날 때까지
      await sleep(300 + extraWait); // 렌더 반영 + 사용자가 준 추가 대기

      await page.send("Runtime.evaluate", { expression: HIDE_DEV_TOOLS });
      const { result } = await page.send("Runtime.evaluate", {
        returnByValue: true,
        expression: `({ scrollWidth: document.documentElement.scrollWidth, innerWidth, title: document.title,
                      height: document.documentElement.scrollHeight, href: location.href })`,
      });
      const m = result.value;
      const height = Math.min(Math.max(m.height, 900), 6000);
      const shot = await page.send("Page.captureScreenshot", {
        format: "png",
        captureBeyondViewport: true,
        clip: { x: 0, y: 0, width, height, scale: 1 },
      });
      const file = fileName(ri, route, width);
      fs.writeFileSync(path.join(outDir, file), Buffer.from(shot.data, "base64"));
      page.off(onEvent);

      const finalPath = new URL(m.href).pathname + new URL(m.href).search;
      const redirected = finalPath !== new URL(url).pathname + new URL(url).search ? finalPath : null;
      const overflow = m.scrollWidth > m.innerWidth;
      const failed = overflow || errors.length > 0 || status === null || status >= 500;
      if (failed) exitCode = 1;
      results.push({
        route, width, status, redirected, title: m.title, overflow, scrollWidth: m.scrollWidth,
        networkIdle: idle, errors, network, file, pass: !failed,
      });
    }
  }
  page.close();

  fs.writeFileSync(path.join(outDir, "report.json"), JSON.stringify({ baseUrl, results }, null, 2));
  for (const r of results) {
    console.log(
      `${r.pass ? "PASS" : "FAIL"}  ${r.route.padEnd(16)} ${String(r.width).padStart(4)}px  HTTP ${r.status}` +
        `${r.redirected ? ` → ${r.redirected}` : ""}  넘침 ${r.overflow ? `있음(${r.scrollWidth}px)` : "없음"}  ` +
        `에러 ${r.errors.length}  네트워크 실패 ${r.network.length}${r.networkIdle ? "" : "  (네트워크가 15초 안에 잠잠해지지 않음)"}` +
        `  → .shots/${r.file}`,
    );
    r.errors.forEach((e) => console.log(`      에러: ${e.slice(0, 200)}`));
    r.network.forEach((e) => console.log(`      네트워크: ${e.slice(0, 200)}`));
  }
} catch (e) {
  console.error(`shot 실패: ${e.message}`);
  exitCode = 2;
} finally {
  killTree(chromeProc);
  killTree(devServer);
  if (devPort) {
    let free = false;
    for (let i = 0; i < 20 && !free; i++) {
      free = !(await portInUse(devPort));
      if (!free) await sleep(250);
    }
    console.log(free ? `dev 서버 종료 확인(포트 ${devPort} 비어 있음)` : `경고: 포트 ${devPort}가 아직 사용 중입니다`);
    if (!free && exitCode === 0) exitCode = 2;
  }
}
process.exit(exitCode);
