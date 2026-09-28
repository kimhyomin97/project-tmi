#!/usr/bin/env node
/**
 * Stop hook: Claude가 턴을 끝내기 전에 `pnpm check`(typecheck + lint)를 실행한다.
 * - 변경이 없거나 이미 같은 상태를 검증했으면 건너뛴다.
 * - 실패하면 exit 2 → Claude가 멈추지 않고 에러를 고친다.
 * - 같은 세션에서 3번 연속 실패하면 수정을 멈추고 막힘 리포트를 쓰게 하고,
 *   4번째에는 멈춤을 허용한다 (무한 루프 방지).
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

const git = (args) => execSync(`git ${args}`, { cwd: root, encoding: "utf8" });

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

// 현재 작업 트리 상태 지문 = HEAD + 변경 내용
let fingerprint;
try {
  const head = git("rev-parse HEAD").trim();
  const dirty = git("status --porcelain") + git("diff HEAD");
  fingerprint = createHash("sha1").update(head + dirty).digest("hex");
} catch {
  process.exit(0); // git 저장소가 아니면 검사하지 않음
}
if (fingerprint === state.fingerprint) process.exit(0);

const run = spawnSync("pnpm", ["-s", "check"], { cwd: root, encoding: "utf8", shell: true });
if (run.status === 0) {
  state.fingerprint = fingerprint;
  state.failCount = 0;
  save();
  process.exit(0);
}

state.failCount += 1;
save();
if (state.failCount >= 4) {
  state.failCount = 0;
  save();
  process.exit(0);
}

const output = `${run.stdout ?? ""}${run.stderr ?? ""}`.trim().split("\n").slice(-60).join("\n");
if (state.failCount === 3) {
  process.stderr.write(
    `pnpm check가 3번 연속 실패했습니다. 더 고치지 말고 CLAUDE.md의 '막혔을 때' 형식으로 막힘 리포트를 작성해 사용자에게 보고하세요.\n\n${output}\n`,
  );
} else {
  process.stderr.write(`pnpm check 실패 (${state.failCount}/3). 원인을 1줄로 설명한 뒤 고치세요.\n\n${output}\n`);
}
process.exit(2);
