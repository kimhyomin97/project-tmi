#!/usr/bin/env node
/**
 * Stop hook: Claude가 턴을 끝내기 전에 typecheck → lint → build를 실행한다.
 *
 * 설계 메모 (하네스 감사에서 고친 것들):
 * - 지문에 untracked 파일의 "내용"까지 포함한다. `git status --porcelain`은 새 디렉터리를
 *   `?? src/` 한 줄로 접고 `git diff HEAD`는 untracked를 아예 포함하지 않으므로,
 *   그대로 두면 src/features/ 아래 새 feature 코드 전체가 검사망을 빠져나간다.
 *   해시는 Node 내장 crypto로 계산한다 (Windows PATH에 xargs/sha1sum이 없어서
 *   외부 바이너리에 의존하면 hook이 조용히 통째로 꺼진다).
 * - typecheck와 lint를 각각 독립 실행한다. `&&`로 이으면 타입 에러가 있을 때
 *   ESLint 아키텍처 규칙이 한 번도 평가되지 않는다.
 * - build까지 돌린다. Server/Client 경계 위반(L1)은 typecheck/lint가 잡지 못하고
 *   `next build`에서만 드러난다.
 * - 지문이 같아 건너뛸 때 failCount를 리셋한다. 리셋하지 않으면 "마지막 green으로
 *   되돌리기" 직후 새 문제의 첫 실패에 "3번 연속 실패" 메시지가 나온다.
 * - git 실패 시 검사를 건너뛰지 않는다 (fail-closed).
 */
import { execSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const stateDir = path.join(root, ".claude", ".state");
const stateFile = path.join(stateDir, "stop-check.json");

let input = {};
try {
  input = JSON.parse(fs.readFileSync(0, "utf8") || "{}");
} catch {}

const git = (args) =>
  execSync(`git ${args}`, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"], // git의 CRLF 경고 등 stderr 노이즈 차단
  });

let state = { sessionId: null, fingerprint: null, failCount: 0 };
try {
  state = { ...state, ...JSON.parse(fs.readFileSync(stateFile, "utf8")) };
} catch {}
if (input.session_id && state.sessionId !== input.session_id) {
  state = { sessionId: input.session_id, fingerprint: state.fingerprint, failCount: 0 };
}
const save = () => {
  fs.mkdirSync(stateDir, { recursive: true });
  fs.writeFileSync(stateFile, JSON.stringify(state));
};

/** 워킹트리 지문. git이 실패하면 null(= 지문 없음)을 돌려주고 검사는 그대로 진행한다. */
function computeFingerprint() {
  try {
    const head = git("rev-parse HEAD").trim();
    const tracked = git("status --porcelain -uall") + git("diff HEAD");
    const untracked = git("ls-files --others --exclude-standard -z")
      .split("\0")
      .filter(Boolean)
      .sort()
      .map((file) => {
        try {
          const buf = fs.readFileSync(path.join(root, file));
          return `${file}:${createHash("sha1").update(buf).digest("hex")}`;
        } catch {
          return `${file}:<unreadable>`;
        }
      })
      .join("\n");
    return createHash("sha1").update(head + tracked + untracked).digest("hex");
  } catch {
    return null;
  }
}

const fingerprint = computeFingerprint();
if (fingerprint !== null && fingerprint === state.fingerprint) {
  // 이미 검증을 통과한 상태 그대로다 = 연속 실패 사슬이 끊겼다.
  if (state.failCount !== 0) {
    state.failCount = 0;
    save();
  }
  process.exit(0);
}

const step = (name, args) => {
  const r = spawnSync("pnpm", ["-s", ...args], { cwd: root, encoding: "utf8", shell: true });
  return { name, ok: r.status === 0, out: `${r.stdout ?? ""}\n${r.stderr ?? ""}` };
};

/** 실패 출력에서 잡음(pnpm 헤더 등)을 걷어내고 에러 줄을 우선 보여준다. */
const summarize = (out) => {
  const lines = out
    .split("\n")
    .map((l) => l.trimEnd())
    .filter((l) => l && !/^\$ /.test(l) && !/^Progress: resolved/.test(l));
  if (lines.length <= 40) return lines.join("\n");
  const errors = lines.filter((l) => /error|Error|✖|✗|failed/i.test(l));
  return (errors.length ? errors : lines).slice(0, 40).join("\n");
};

// typecheck와 lint는 서로 가리지 않도록 항상 둘 다 실행한다.
const results = [step("typecheck", ["typecheck"]), step("lint", ["lint"])];
// 둘 다 통과했을 때만 build를 돌린다 (L1 위반은 여기서만 잡힌다).
if (results.every((r) => r.ok)) results.push(step("build", ["build"]));

const failed = results.filter((r) => !r.ok);

if (failed.length === 0) {
  state.fingerprint = fingerprint;
  state.failCount = 0;
  save();
  process.exit(0);
}

state.failCount += 1;
save();

const detail = failed.map((r) => `--- ${r.name} 실패 ---\n${summarize(r.out)}`).join("\n\n");
const names = failed.map((r) => r.name).join(", ");

if (state.failCount >= 4) {
  // 무한 루프 방지: 멈춤은 허용하되 카운터는 유지한다(리셋하면 4회마다 같은 루프가 반복된다).
  process.stderr.write(
    `${names} 실패가 ${state.failCount}회째입니다. 멈춤을 허용하지만 문제는 남아 있습니다. ` +
      `CLAUDE.md의 '막혔을 때' 형식으로 막힘 리포트를 사용자에게 보고하세요.\n\n${detail}\n`,
  );
  process.exit(0);
}

if (state.failCount >= 3) {
  process.stderr.write(
    `${names}가 3번 연속 실패했습니다. 더 고치지 말고 CLAUDE.md의 '막혔을 때' 형식으로 ` +
      `막힘 리포트를 작성해 사용자에게 보고하세요(파일로 만들지 말고 대화로).\n\n${detail}\n`,
  );
} else {
  process.stderr.write(
    `${names} 실패 (${state.failCount}/3). 원인을 1줄로 설명한 뒤 고치세요.\n\n${detail}\n`,
  );
}
process.exit(2);
