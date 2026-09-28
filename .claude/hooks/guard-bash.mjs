#!/usr/bin/env node
/**
 * PreToolUse(Bash) hook: 권한 패턴만으로는 막히지 않는 git 조작을 차단한다.
 *
 * - `git push`는 사용자 전용이다. deny 패턴 `Bash(git push *)`는 `git -C . push`,
 *   `git -c k=v push` 같은 형태를 잡지 못하므로 명령 문자열 전체를 검사한다.
 * - 보호 브랜치(main, 아카이브들)에서는 commit / merge를 막는다. 작업은 feature 브랜치에서.
 *
 * exit 2 = 도구 호출 차단. stderr가 Claude에게 전달된다.
 */
import fs from "node:fs";
import { execSync } from "node:child_process";

const PROTECTED = ["main", "master", "v3", "v2", "legacy_v1", "hyomin"];

let input = {};
try {
  input = JSON.parse(fs.readFileSync(0, "utf8") || "{}");
} catch {
  process.exit(0);
}

const command = input?.tool_input?.command;
if (typeof command !== "string" || !command.trim()) process.exit(0);

// 세그먼트 단위로 검사한다(`a && git push` 같은 복합 명령 대응).
// 세그먼트가 실제로 git을 "실행"할 때만 본다. 문자열 안에 git 명령이 인용된 경우
// (문서 작성, echo, heredoc 등)까지 막으면 거짓 양성이 많아진다.
const RUNS_GIT = /^\s*(?:[A-Za-z_][A-Za-z0-9_]*=\S*\s+)*(?:\S*[/\\])?git(?:\.exe)?\s/;
const segments = command.split(/[;&|]+/);
const gitSegments = segments.filter((s) => RUNS_GIT.test(s));
if (gitSegments.length === 0) process.exit(0);

const hasVerb = (seg, verb) => new RegExp(`\\b${verb}\\b`).test(seg.replace(/--\S*/g, ""));

if (gitSegments.some((s) => hasVerb(s, "push"))) {
  process.stderr.write(
    "git push는 사용자가 직접 실행합니다(CLAUDE.md: push와 merge는 사용자가 한다). " +
      "커밋까지만 하고, 변경 내용을 증거와 함께 보고하세요.\n",
  );
  process.exit(2);
}

const wantsCommitOrMerge = gitSegments.some((s) => hasVerb(s, "commit") || hasVerb(s, "merge"));
if (!wantsCommitOrMerge) process.exit(0);

let branch = "";
try {
  branch = execSync("git rev-parse --abbrev-ref HEAD", {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }).trim();
} catch {
  process.exit(0); // git 상태를 못 읽으면 판단하지 않는다.
}

if (PROTECTED.includes(branch)) {
  process.stderr.write(
    `현재 브랜치가 '${branch}'입니다. 보호 브랜치에는 직접 커밋/머지하지 않습니다.\n` +
      `먼저 작업 브랜치로 옮기세요: git switch -c feat/<이름>  (워킹트리 변경은 그대로 따라갑니다. ` +
      `stash/reset/checkout . 로 사용자의 변경을 버리지 마세요.)\n`,
  );
  process.exit(2);
}

process.exit(0);
