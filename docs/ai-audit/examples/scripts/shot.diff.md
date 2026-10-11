# scripts/shot.mjs 변경 예시 — Linux root(클라우드·CI)에서 동작 (제안 P-A6, 발견 AI-03)

## 문제 (실측, `00-baseline.md`)

1. `findChrome()`(`scripts/shot.mjs:85-97`) 후보에 Playwright 브라우저 경로가 없다 → `Chrome을 찾지 못했습니다`.
2. `CHROME_PATH`를 주어도 root로 실행하는 Chromium은 `--no-sandbox` 없이 뜨지 않는다 → `Chrome 디버깅 연결에 실패했습니다.` (exit 2). 직접 실행 시 메시지: `Running as root without --no-sandbox is not supported.`

## 변경안

```diff
+// Playwright가 설치한 Chromium: <브라우저 폴더>/chromium-<rev>/chrome-linux/chrome (Linux).
+// 브라우저 폴더는 PLAYWRIGHT_BROWSERS_PATH, 없으면 기본 위치 ~/.cache/ms-playwright. rev가 큰 것부터.
+function playwrightChromes() {
+  const roots = [process.env.PLAYWRIGHT_BROWSERS_PATH, path.join(os.homedir(), ".cache", "ms-playwright")].filter(Boolean);
+  return roots.flatMap((dir) => {
+    try {
+      return fs
+        .readdirSync(dir)
+        .filter((name) => /^chromium-\d+$/.test(name))
+        .sort((a, b) => Number(b.split("-")[1]) - Number(a.split("-")[1]))
+        .map((name) => path.join(dir, name, "chrome-linux", "chrome"));
+    } catch {
+      return []; // 폴더가 없으면 후보 없음
+    }
+  });
+}
+
 function findChrome() {
   const candidates = [
     process.env.CHROME_PATH,
     "C:/Program Files/Google/Chrome/Application/chrome.exe",
     …
     "/usr/bin/chromium-browser",
+    ...playwrightChromes(),
   ].filter(Boolean);
   return candidates.find((p) => fs.existsSync(p));
 }
```

`fs`·`os`·`path`는 이미 import돼 있다(`scripts/shot.mjs:19`, `:21`, `:22`). `/opt/pw-browsers/chromium` 같은 환경 고유 심볼릭 링크는 후보에 넣지 않는다.

```diff
   chromeProc = spawn(
     chromePath,
     [
       "--headless=new",
       "--disable-gpu",
       "--hide-scrollbars",
       "--no-first-run",
+      // root로 실행하는 Linux 컨테이너(클라우드 세션·CI)는 샌드박스 없이만 뜬다. 사용자 PC(비 root)는 그대로.
+      ...(process.platform === "linux" && process.getuid?.() === 0 ? ["--no-sandbox"] : []),
       `--remote-debugging-port=${debugPort}`,
```

## 확인한 것

- `playwrightChromes()`를 그대로 떼어 이 환경(`PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`)에서 실행: `[ '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' ]`, `existsSync` true. 표준 Playwright 설치 구조(`chromium-<rev>/chrome-linux/chrome`)를 그대로 따르므로 이 환경 전용 링크(`/opt/pw-browsers/chromium`)에 기대지 않는다. macOS·Windows의 Playwright 폴더 구조는 다르지만, 그 환경은 기존 Chrome 후보로 찾는다.
- 같은 효과를 내는 래퍼(`exec /opt/pw-browsers/chromium --no-sandbox "$@"`)를 `CHROME_PATH`로 주자 `pnpm shot / /nope`가 4장 모두 PASS(`00-baseline.md` 표). 즉 변경안의 두 줄이 이번 실패의 원인 전부다.
- 패치된 스크립트 자체는 돌려 보지 않았다(기존 파일 수정 금지). 적용 시 이 환경에서 `pnpm shot /`가 래퍼 없이 PASS하는지 확인한다.
- Windows(사용자 PC) 경로에는 영향 없음: 조건이 `linux && uid 0`일 때만 인자를 더한다.

## 리뷰 반영 기록(라운드 1)

| # | 지적 요약 | 처리 | 위치 |
|---|---|---|---|
| 14 | `/opt/pw-browsers/chromium`은 이 환경 전용 링크 | 반영: `PLAYWRIGHT_BROWSERS_PATH`(없으면 `~/.cache/ms-playwright`) 아래 `chromium-*/chrome-linux/chrome`을 `readdirSync`로 찾는 코드로 교체, 이 환경에서 실행 확인 | 변경안 첫 diff, 확인한 것 |
