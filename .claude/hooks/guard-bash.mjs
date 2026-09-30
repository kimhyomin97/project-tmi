#!/usr/bin/env node
/**
 * PreToolUse(Bash) hook: 권한 패턴만으로는 막히지 않는 git 조작을 차단한다.
 *
 * - 일반 `git push`와 작업 브랜치 삭제는 허용한다. force / mirror와 main·아카이브 삭제는 사용자 전용이다.
 *   권한 패턴은 `git -C . push --force` 같은 형태를 잡지 못하므로 명령 문자열 전체를 검사한다.
 * - 아카이브 브랜치에서는 commit / merge를 막는다. 작업은 main에서 직접 한다.
 *
 * exit 2 = 도구 호출 차단. stderr가 Claude에게 전달된다.
 */
import fs from "node:fs";
import { execSync } from "node:child_process";

// 2021~2024 구버전 아카이브. main은 작업 브랜치이므로 포함하지 않는다.
const PROTECTED = ["v3", "v2", "legacy_v1", "hyomin"];

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

// 일반 push와 작업 브랜치 삭제는 허용한다.
// 히스토리를 덮어쓰는 push(force / mirror)와 main·아카이브 브랜치 삭제만 막는다.
const KEEP_REMOTE = new Set(["main", "master", ...PROTECTED]);
const FORCE_FLAG = /^(?:--force(?:-with-lease)?(?:=.*)?|-f|--mirror)$/;
const DELETE_FLAG = /^(?:--delete|-d)$/;
const stripRef = (r) => r.replace(/^:/, "").replace(/^refs\/heads\//, "");

for (const p of parsed.filter((q) => q.sub === "push")) {
  if (p.args.some((a) => FORCE_FLAG.test(a) || /^\+[^:]/.test(a))) {
    process.stderr.write(
      "force push / mirror는 히스토리를 덮어쓰므로 사용자가 직접 실행합니다. " +
        "덮어써야 하는 이유를 설명하고 사용자에게 맡기세요.\n",
    );
    process.exit(2);
  }
  // 삭제 대상: `--delete <remote> <br...>` 의 브랜치들, 또는 `:br` refspec
  const positional = p.args.filter((a) => !a.startsWith("-"));
  const deleting = p.args.some((a) => DELETE_FLAG.test(a))
    ? positional.slice(1) // 첫 번째는 remote 이름
    : positional.filter((a) => /^:[^:]+$/.test(a));
  const guarded = deleting.map(stripRef).filter((b) => KEEP_REMOTE.has(b));
  if (guarded.length) {
    process.stderr.write(
      `원격 '${guarded.join(", ")}' 브랜치는 삭제하지 않습니다(main·아카이브 보호). ` +
        "작업 브랜치 삭제는 허용됩니다.\n",
    );
    process.exit(2);
  }
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
    `현재 브랜치가 '${branch}'입니다. 구버전 아카이브 브랜치에는 커밋/머지하지 않습니다.\n` +
      `main으로 돌아가 작업하세요: git switch main  (워킹트리 변경이 있으면 먼저 사용자에게 알리고, ` +
      `stash/reset/checkout . 로 사용자의 변경을 버리지 마세요.)\n`,
  );
  process.exit(2);
}

process.exit(0);
