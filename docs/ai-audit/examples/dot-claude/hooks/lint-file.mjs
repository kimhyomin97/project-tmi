#!/usr/bin/env node
/**
 * (제안 P-A4-C) PostToolUse(Edit|Write) hook: 방금 고친 파일 하나만 ESLint로 검사한다.
 *
 * - Stop hook(턴 끝, typecheck+build 약 22초)보다 먼저, 편집 직후 1~2초 안에 규칙 위반을 알려준다.
 * - exit 2 + stderr = Claude에게 위반 내용을 보여준다(도구는 이미 실행됨, 되돌리지 않음).
 * - src 안의 lint 대상만 빠르게 본다(src 밖 lint 대상은 Stop hook이 검사). lint 대상 아닌 확장자와
 *   shadcn 생성물(src/components/ui, eslint.config.mjs globalIgnores)도 건너뛴다.
 * - 실패해도 Stop hook이 다시 검사하므로 이 hook은 "빠른 알림"이고 최종 관문이 아니다.
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();

let input = {};
try {
  input = JSON.parse(fs.readFileSync(0, "utf8") || "{}");
} catch {
  process.exit(0);
}

const filePath = input?.tool_input?.file_path;
if (typeof filePath !== "string") process.exit(0);

const rel = path.relative(root, path.resolve(root, filePath)).split(path.sep).join("/");
const isLintTarget = /^src\/.+\.(ts|tsx|js|jsx|mjs|cjs)$/.test(rel) && !rel.startsWith("src/components/ui/");
if (!isLintTarget || !fs.existsSync(path.join(root, rel))) process.exit(0);

const r = spawnSync("pnpm", ["-s", "exec", "eslint", "--max-warnings", "0", rel], {
  cwd: root,
  encoding: "utf8",
  shell: process.platform === "win32",
});
if (r.status === 0) process.exit(0);

const out = `${r.stdout ?? ""}${r.stderr ?? ""}`.trim().split("\n").slice(0, 30).join("\n");
process.stderr.write(`ESLint 위반(${rel}). 이 파일을 지금 고치세요.\n${out}\n`);
process.exit(2);
