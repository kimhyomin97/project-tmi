#!/usr/bin/env node
/**
 * PreToolUse(Bash) hook: 권한 패턴만으로는 막히지 않는 git 조작을 차단한다.
 *
 * - 일반 `git push`는 허용하되, force / mirror / 원격 브랜치 삭제는 사용자 전용이다.
 *   권한 패턴은 `git -C . push --force` 같은 형태를 잡지 못하므로 명령 문자열 전체를 검사한다.
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

// git 서브커맨드(= git 뒤 첫 번째 비옵션 토큰)를 판별한다. 세그먼트 전체에서 단어를
// 찾으면 `git commit -m "... push --force ..."`처럼 메시지에 언급만 해도 오인한다.
const OPTS_WITH_VALUE = new Set(["-C", "-c", "--git-dir", "--work-tree", "--namespace"]);
const gitSubcommand = (seg) => {
  const toks = seg.trim().split(/\s+/);
  let i = toks.findIndex((t) => /(^|[/\\])git(\.exe)?$/.test(t));
  if (i < 0) return { sub: null, args: [] };
  i += 1;
  while (i < toks.length && toks[i].startsWith("-")) {
    i += OPTS_WITH_VALUE.has(toks[i]) ? 2 : 1;
  }
  return { sub: toks[i] ?? null, args: toks.slice(i + 1) };
};
const parsed = gitSegments.map(gitSubcommand);

// 일반 push는 허용한다. 히스토리를 덮어쓰거나 원격 브랜치를 지우는 형태만 막는다.
const DESTRUCTIVE_FLAG = /^(?:--force(?:-with-lease)?(?:=.*)?|-f|--mirror|--delete|-d)$/;
const isDestructiveArg = (a) =>
  DESTRUCTIVE_FLAG.test(a) ||
  /^:[^:]+$/.test(a) || // git push origin :branch (원격 삭제)
  /^\+[^:]/.test(a); // git push origin +main (force refspec)

const badPush = parsed.find((p) => p.sub === "push" && p.args.some(isDestructiveArg));
if (badPush) {
  process.stderr.write(
    "force push / mirror / 원격 브랜치 삭제는 사용자가 직접 실행합니다. " +
      "일반 push는 허용됩니다. 히스토리를 덮어써야 하는 이유를 설명하고 사용자에게 맡기세요.\n",
  );
  process.exit(2);
}

const wantsCommitOrMerge = parsed.some((p) => p.sub === "commit" || p.sub === "merge");
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
