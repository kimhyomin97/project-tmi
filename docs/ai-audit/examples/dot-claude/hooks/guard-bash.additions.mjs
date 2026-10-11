#!/usr/bin/env node
/**
 * (제안 P-A5) guard-bash.mjs에 더할 검사 2가지의 예시 구현과 시험 케이스.
 *
 * 1) 래핑된 git 실행 찾기 — expandCommand()
 *    현재 RUNS_GIT(guard-bash.mjs:31)는 세그먼트가 git으로 "시작"할 때만 본다. 01-ai-setup.md 2.4의 실측 우회
 *    `bash -c "…"`, `(git …)`, `env git`, `sudo git`과 리뷰에서 추가로 확인한 형태를 펼친다.
 *    - 명령 치환 `$(…)`·백틱이 세그먼트 중간에 있어도 안쪽을 따로 검사한다: `echo $(git reset --hard)`, `x=1 $(git push -f)`
 *    - 접두 명령과 그 옵션: `sudo -E git`, `sudo -u root git`, `env -i git`, `time -p git`, `nice -n 5 git`, `command`, `exec`, `nohup`,
 *      `timeout 5 git`(옵션 뒤 시간 값 1개를 건너뜀), `xargs -n 1 git`(`… | xargs git push -f`)
 *    - 셸 -c(묶음 옵션 포함): `bash -c "…"`, `bash -lc "…"`, `sh -ec '…'` — 안쪽 문자열을 다시 명령으로 펼친다
 *    - 따옴표를 인식해 나눈다: `git commit -m "a; git push -f"`는 commit 하나로 본다. 작은따옴표 안의 `$(…)`는 실행되지 않으므로 무시한다.
 *    - 셸 예약어 뒤의 명령: `do `·`then `·`else `·`elif `·`if `·`while `·`until `·`{ `·`! ` 접두를 벗긴다.
 *      `for b in x; do git …; done`은 `;` 분리 뒤 `do git …` 세그먼트가 되어 여기서 펼쳐진다. `for 변수 in 목록`의 `$변수`·`${변수}`는
 *      `done`까지의 세그먼트에서 목록 값마다 한 번씩 바꿔 넣는다(`for b in v3 v2; do git branch -D $b; done` → v3·v2 각각 검사).
 *    처리 불가 한계: 명령 이름 자체가 동적인 경우(`$(echo git) push -f`, `g=git; $g push -f`, `eval "…"`)는 검출하지 못한다.
 *    `case x in x) git reset --hard;; esac`처럼 case 분기 패턴 뒤의 명령도 펼치지 않는다(드물다).
 *    시험 케이스에 "미검출" 기대값으로 명시했다. 이 한계는 원격 브랜치 보호(P-A5 C, D-09)로 메운다.
 * 2) 사용자 변경 파기 명령 차단 — destructiveReason()
 *    CLAUDE.md:87이 금지하지만 기계 장치가 없다. 특히 `git switch -f`·`git switch --discard-changes`·`git branch -D v3`는
 *    allow 목록(.claude/settings.json:18, :21)에 있어 기본 권한 모드에서도 확인 없이 실행된다(01-ai-setup.md 2.4 실측).
 *    로컬 main·아카이브 포인터를 옮기는 명령도 막는다: `git branch -f/-M/-m/-C`, `git switch -C/--force-create`, `git checkout -B`
 *    의 대상이 보호 브랜치일 때(`git switch -C main HEAD~3`은 allow 목록 `git switch *`에 걸려 확인 없이 실행된다).
 *    경로 판정(`git checkout <파일>`, `--` 없음)은 hook 입력의 `cwd`(PreToolUse 공통 입력 필드,
 *    https://code.claude.com/docs/en/hooks)를 기준으로 한다. 한계: 같은 명령 줄의 앞 세그먼트 `cd <dir> && git checkout <파일>`과
 *    `git -C <dir> checkout <파일>`은 실행 위치가 바뀐 것을 반영하지 못해 경로가 없다고 보고 통과시킨다(시험 케이스에 미검출로 명시).
 *    짧은 옵션 묶음은 git과 같게 읽는다: `-qC main`은 `-q -C main`(대상 main → 차단), `-Cq main`은 `-C q`(새 브랜치 q를 main에서 만듦 → 허용).
 *    막지 않는 다른 포인터 이동: `git fetch . +HEAD~3:main`, `git update-ref refs/heads/main HEAD~3`. 쓰임이 드물고,
 *    원격 브랜치 보호(D-09)와 reflog로 복구할 수 있어 넣지 않았다.
 *
 * 끼워 넣는 위치(guard-bash.mjs):
 *   - :38-39  `const segments = withoutBodies.split(/[;&|\r\n]+/);` →  `const segments = expandCommand(withoutBodies);`
 *             (expandCommand가 따옴표를 인식해 나누므로 기존 split을 대체한다. RUNS_GIT 필터(:39)는 그대로 둔다)
 *   - :86 다음(push 검사 뒤, commit/merge 검사 앞)에 추가:
 *       for (const p of parsed) {
 *         const reason = destructiveReason(p.sub, p.args, { cwd: input.cwd });
 *         if (reason) { process.stderr.write(`${reason}. 사용자 변경을 버리는 명령은 사용자가 직접 실행합니다.\n`); process.exit(2); }
 *       }
 *   - 이 파일의 expandCommand·unwrap·destructiveReason과 보조 함수를 guard-bash.mjs 위쪽에 복사한다(hook은 단일 파일 유지).
 *   - guard-bash.mjs 머리에 `import path from "node:path";`를 추가한다(destructiveReason이 path.resolve를 쓴다. 빠뜨리면
 *     `git checkout <인자 1개>`에서 ReferenceError → hook exit 1 → 차단되지 않고 실행되는 fail-open이 된다. 리뷰 4라운드 재현).
 *   - 끼운 뒤 확인(필수): 아래 입력을 hook에 직접 넣어 exit code를 본다. 앞의 셋은 2(차단), 뒤의 둘은 0(허용)이어야 한다.
 *     (작은따옴표 안이라 JSON 이스케이프는 \" 한 번이다. 원본 가드는 JSON 파싱 실패 시 exit 0이므로(:19-23) 이스케이프가 틀리면 바르게 끼운 hook도 0을 내 확인 단계에서 실패처럼 보인다)
 *       printf '%s' '{"tool_input":{"command":"git checkout README.md"},"cwd":"'"$PWD"'"}' | node .claude/hooks/guard-bash.mjs; echo $?   # 2
 *       printf '%s' '{"tool_input":{"command":"git branch -D \"v3\""}}' | node .claude/hooks/guard-bash.mjs; echo $?                 # 2
 *       printf '%s' '{"tool_input":{"command":"bash -c \"git push --force\""}}' | node .claude/hooks/guard-bash.mjs; echo $?         # 2
 *       printf '%s' '{"tool_input":{"command":"git checkout main"},"cwd":"'"$PWD"'"}' | node .claude/hooks/guard-bash.mjs; echo $?      # 0
 *       printf '%s' '{"tool_input":{"command":"git status"}}' | node .claude/hooks/guard-bash.mjs; echo $?                              # 0
 *   - 함께 검토: 원본 가드의 stdin JSON 파싱 실패 처리(:19-23, exit 0 = fail-open)를 exit 2로 바꿀지. 실제 Claude Code 입력은 정상 JSON이라 위험은 낮다.
 *
 * 시험: node docs/ai-audit/examples/dot-claude/hooks/guard-bash.additions.mjs
 *   → 시험은 실제 guard-bash.mjs의 RUNS_GIT(:31)·gitSubcommand(:44-54, OPTS_WITH_VALUE 포함)·force push 판정(:60, :65)을
 *     그대로 복사해 거친다. 복사본이 원본과 같은지 원본 소스 문자열로 먼저 확인한다.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

// --- 1) 래핑 펼치기 ---------------------------------------------------------------

/** 따옴표를 인식해 최상위 구분자(; & | 줄바꿈)로 나눈다. $(…) 안의 구분자에서는 나누지 않는다. */
function splitTopLevel(cmd) {
  const out = [];
  let cur = "";
  let quote = null;
  let depth = 0;
  for (let i = 0; i < cmd.length; i++) {
    const c = cmd[i];
    if (quote === "'") {
      cur += c;
      if (c === "'") quote = null;
      continue;
    }
    if (c === "\\" && i + 1 < cmd.length) {
      cur += c + cmd[++i];
      continue;
    }
    if (quote === '"') {
      cur += c;
      if (c === '"') quote = null;
      continue;
    }
    if (c === "'" || c === '"') quote = c;
    else if (c === "$" && cmd[i + 1] === "(") depth++;
    else if (c === ")" && depth > 0) depth--;
    else if (depth === 0 && /[;&|\r\n]/.test(c)) {
      out.push(cur);
      cur = "";
      continue;
    }
    cur += c;
  }
  out.push(cur);
  return out.filter((s) => s.trim());
}

/** 세그먼트에서 명령 치환($(…)·백틱)을 꺼낸다. 작은따옴표 안은 실행되지 않으므로 건너뛴다. */
function extractSubstitutions(seg) {
  const inner = [];
  let rest = "";
  let quote = null;
  for (let i = 0; i < seg.length; i++) {
    const c = seg[i];
    if (quote === "'") {
      rest += c;
      if (c === "'") quote = null;
      continue;
    }
    if (c === "\\" && i + 1 < seg.length) {
      rest += c + seg[++i];
      continue;
    }
    if (c === "$" && seg[i + 1] === "(") {
      let depth = 1;
      let j = i + 2;
      for (; j < seg.length && depth > 0; j++) {
        if (seg[j] === "(") depth++;
        else if (seg[j] === ")") depth--;
      }
      inner.push(seg.slice(i + 2, depth === 0 ? j - 1 : j));
      rest += " ";
      i = j - 1;
      continue;
    }
    if (c === "`") {
      const end = seg.indexOf("`", i + 1);
      inner.push(seg.slice(i + 1, end < 0 ? seg.length : end));
      rest += " ";
      i = end < 0 ? seg.length : end;
      continue;
    }
    if (quote === '"' && c === '"') quote = null;
    else if (!quote && (c === "'" || c === '"')) quote = c;
    rest += c;
  }
  return { rest, inner };
}

/** 따옴표를 인식한 토큰. raw는 원문 조각, value는 따옴표를 벗긴 값, start는 세그먼트 안 위치. */
function tokenize(seg) {
  const toks = [];
  const re = /(?:[^\s'"\\]+|\\.|'[^']*'|"(?:[^"\\]|\\.)*")+/g;
  for (let m; (m = re.exec(seg)); ) {
    const value = m[0].replace(/'([^']*)'|"((?:[^"\\]|\\.)*)"|\\(.)/g, (_, a, b, c) => a ?? (b !== undefined ? b.replace(/\\(.)/g, "$1") : c));
    toks.push({ raw: m[0], value, start: m.index });
  }
  return toks;
}

// 접두 명령별로 "값을 하나 더 받는 옵션". 나머지 옵션은 토큰 1개로 본다.
const PREFIX_OPTS_WITH_VALUE = {
  sudo: new Set(["-u", "-g", "-h", "-p", "-C", "-D", "-r", "-t", "-U", "-T", "--user", "--group", "--host", "--prompt", "--chdir"]),
  env: new Set(["-u", "-C", "-S", "--unset", "--chdir"]),
  time: new Set(["-f", "-o", "--format", "--output"]),
  nice: new Set(["-n", "--adjustment"]),
  command: new Set(),
  exec: new Set(["-a"]),
  nohup: new Set(),
  timeout: new Set(["-s", "-k", "--signal", "--kill-after"]),
  xargs: new Set(["-a", "-d", "-E", "-I", "-L", "-n", "-P", "-s", "--arg-file", "--delimiter", "--max-args", "--max-lines", "--max-procs", "--max-chars"]),
};
// 옵션 뒤에 오는 위치 인자 수(실행할 명령이 아님). timeout DURATION 명령…
const PREFIX_POSITIONAL = { timeout: 1 };
const SHELL = /^(?:ba|z|da|k)?sh$/;
// 뒤에 명령이 오는 셸 예약어. `{ git reset --hard; }`, `! git reset --hard`, `if …; then git push -f; fi`
const RESERVED = /^(?:do|then|else|elif|if|while|until|\{|!)$/;
const base = (t) => t.replace(/^.*[/\\]/, "");

/** 세그먼트 하나에서 래퍼를 벗겨 실제로 실행될 명령 조각들을 돌려준다. */
export function unwrap(segment) {
  const { rest, inner } = extractSubstitutions(segment);
  const out = inner.flatMap((s) => expandCommand(s));
  let s = rest.trim();
  // 서브셸 괄호: (git push -f) / ((…))
  s = s.replace(/^\(+/, "").replace(/\)+$/, "").trim();
  const toks = tokenize(s);
  let i = 0;
  for (;;) {
    while (i < toks.length && RESERVED.test(toks[i].raw)) i++; // do / then / { / ! …
    while (i < toks.length && /^[A-Za-z_][A-Za-z0-9_]*=/.test(toks[i].value)) i++; // VAR=x
    const name = toks[i] && base(toks[i].value);
    if (name && name in PREFIX_OPTS_WITH_VALUE) {
      const withValue = PREFIX_OPTS_WITH_VALUE[name];
      i++;
      while (i < toks.length && toks[i].value.startsWith("-")) {
        const opt = toks[i].value;
        i += withValue.has(opt) ? 2 : 1;
        if (opt === "--") break;
      }
      i += PREFIX_POSITIONAL[name] ?? 0;
      continue;
    }
    if (name && SHELL.test(name)) {
      // bash [옵션…] -c "명령" — -c는 -lc, -ec처럼 묶음 옵션 안에 있어도 된다.
      let j = i + 1;
      let hasC = false;
      while (j < toks.length && /^-/.test(toks[j].value)) {
        if (/^-[a-zA-Z]*c[a-zA-Z]*$/.test(toks[j].value)) hasC = true;
        j++;
        if (hasC) break;
      }
      if (hasC && toks[j]) return [...out, ...expandCommand(toks[j].value)];
    }
    break;
  }
  if (i < toks.length) out.push(s.slice(toks[i].start));
  return out;
}

/** `for 변수 in 목록; do …; done`의 `$변수`를 목록 값마다 바꿔 넣는다. 목록이 없거나 동적이면 그대로 둔다. */
function expandForLoops(segments) {
  const out = [];
  let loop = null; // { name, words }
  for (const seg of segments) {
    const m = /^\s*for\s+([A-Za-z_][A-Za-z0-9_]*)\s+in\s+(.*)$/.exec(seg);
    if (m) {
      loop = { name: m[1], words: tokenize(m[2]).map((t) => t.value) };
      continue; // for 머리 자체는 실행할 명령이 아니다
    }
    if (loop && /^\s*done\s*$/.test(seg)) {
      loop = null;
      continue;
    }
    const ref = loop && new RegExp(`\\$(?:\\{${loop.name}\\}|${loop.name}(?![A-Za-z0-9_]))`, "g");
    if (ref) ref.lastIndex = 0;
    if (ref && ref.test(seg) && loop.words.length) out.push(...loop.words.map((w) => seg.replace(ref, w)));
    else out.push(seg);
  }
  return out;
}

/** heredoc 본문을 걷어낸 명령 문자열 전체를 실행 단위 조각 목록으로 펼친다(guard-bash.mjs:38의 split 대체). */
export function expandCommand(command) {
  return expandForLoops(splitTopLevel(command)).flatMap(unwrap);
}

// --- 2) 파기 명령 판정 -------------------------------------------------------------

// 로컬에서도 지우거나 포인터를 옮기면 안 되는 브랜치(guard-bash.mjs:16 PROTECTED + main).
const KEEP_LOCAL = new Set(["main", "v3", "v2", "legacy_v1", "hyomin"]);
// 서브커맨드 옵션 중 값을 받는 것(위치 인자 계산에서 값을 빼기 위해).
const SUB_OPTS_WITH_VALUE = {
  checkout: new Set(["-b", "-B", "--orphan", "--conflict"]),
  restore: new Set(["-s", "--source"]),
  clean: new Set(["-e", "--exclude"]),
  switch: new Set(["-c", "-C", "--create", "--force-create", "--orphan"]),
};
/**
 * 짧은 옵션 묶음 안에서 값을 받는 옵션을 git처럼 읽는다(parse-options: 값 받는 글자 뒤의 나머지가 값, 끝이면 다음 인자가 값).
 * `-qC`+[main] → { opt: "-C", value: "main", next: true }, `-Cq` → { opt: "-C", value: "q", next: false }. 해당 없으면 null.
 */
function bundledValue(a, names, nextArg) {
  if (!/^-[a-zA-Z]{2,}$/.test(a)) return null;
  for (let k = 1; k < a.length; k++) {
    const opt = `-${a[k]}`;
    if (!names.has(opt)) continue;
    const restOfBundle = a.slice(k + 1);
    return restOfBundle ? { opt, value: restOfBundle, next: false } : { opt, value: nextArg, next: true };
  }
  return null;
}
function split(sub, args) {
  const flags = [];
  const positional = [];
  const withValue = SUB_OPTS_WITH_VALUE[sub] ?? new Set();
  let afterDashDash = false;
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (afterDashDash) positional.push(a);
    else if (a === "--") afterDashDash = true;
    else if (a.startsWith("-")) {
      flags.push(a);
      const b = bundledValue(a, withValue, args[i + 1]);
      if (withValue.has(a) || b?.next) i++;
    } else positional.push(a);
  }
  return { flags, positional, afterDashDash };
}
// 짧은 옵션 묶음(-fd, -Df)까지 본다.
const hasShort = (flags, ch) => flags.some((f) => /^-[a-zA-Z]+$/.test(f) && f.includes(ch));
// 값을 받는 옵션의 값들(`-C main`, `--force-create=main`, 묶음 `-qC main`·`-Cmain`).
function optValues(args, names) {
  const out = [];
  const shortNames = new Set(names.filter((n) => /^-[a-zA-Z]$/.test(n)));
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--") break;
    const b = bundledValue(a, shortNames, args[i + 1]);
    if (names.includes(a) && i + 1 < args.length) out.push(args[++i]);
    else if (b) {
      if (b.value !== undefined) out.push(b.value);
      if (b.next) i++;
    } else {
      const eq = names.find((n) => n.startsWith("--") && a.startsWith(`${n}=`));
      if (eq) out.push(a.slice(eq.length + 1));
    }
  }
  return out;
}
const keepLocalMsg = (names) => `로컬 '${names.join(", ")}' 브랜치를 지우거나 옮기지 않습니다(main·아카이브 보호)`;

/**
 * git 서브커맨드·인자를 보고 사용자 변경(워킹트리·로컬 브랜치)을 버리는 명령이면 이유를 돌려준다.
 * cwd: 명령이 실행될 디렉터리(hook 입력의 input.cwd). 없으면 hook 프로세스의 cwd.
 * exists: 경로 존재 확인(시험에서 바꿔 끼운다). `git checkout <파일>`처럼 `--` 없는 경로 복원을 가려낸다.
 */
export function destructiveReason(sub, rawArgs, { cwd = process.cwd(), exists = (p) => fs.existsSync(path.resolve(cwd, p)) } = {}) {
  // 기존 gitSubcommand는 공백으로만 나눠 따옴표가 남는다(`git branch -D "v3"` → `"v3"`). 감싼 따옴표를 벗겨 판정한다(리뷰 4라운드).
  const args = rawArgs.map((a) => a.replace(/^(['"])(.*)\1$/, "$2"));
  const { flags, positional, afterDashDash } = split(sub, args);
  const has = (...names) => flags.some((f) => names.includes(f));

  if (sub === "reset" && has("--hard", "--merge", "--keep")) return "git reset --hard는 워킹트리 변경을 버립니다";

  if (sub === "checkout") {
    if (has("-f", "--force") || hasShort(flags, "f")) return "git checkout -f는 워킹트리 변경을 버립니다";
    const forced = optValues(args, ["-B"]).filter((b) => KEEP_LOCAL.has(b));
    if (forced.length) return keepLocalMsg(forced);
    // `-- <경로>`, `.`, `<tree-ish> <경로>`(위치 인자 2개 이상), `<존재하는 파일>` 하나
    if (afterDashDash || positional.includes(".") || positional.length >= 2 || (positional.length === 1 && !has("-b", "-B", "--orphan") && exists(positional[0])))
      return "git checkout <경로>는 워킹트리 변경을 버립니다(브랜치 전환만 허용)";
  }

  if (sub === "restore" && (!has("--staged", "-S") || has("--worktree", "-W") || hasShort(flags, "W")))
    return "git restore는 워킹트리 변경을 버립니다(--staged만 허용)";

  if (sub === "switch") {
    if (has("-f", "--force", "--discard-changes") || hasShort(flags, "f")) return "git switch -f/--discard-changes는 워킹트리 변경을 버립니다";
    const forced = optValues(args, ["-C", "--force-create"]).filter((b) => KEEP_LOCAL.has(b));
    if (forced.length) return keepLocalMsg(forced);
  }

  if (sub === "branch") {
    // -m/--move(이름 변경)·-C(강제 복사, 대상 덮어씀)도 포함한다. `git branch -m main x`는 force 없이도 로컬 main을 없앤다.
    const forceful =
      has("-D", "-f", "--force", "-M", "-m", "--move", "-C") ||
      ["D", "f", "M", "m", "C"].some((ch) => hasShort(flags, ch)) ||
      (has("-d", "--delete") && has("--force"));
    const guarded = positional.filter((b) => KEEP_LOCAL.has(b));
    if (forceful && guarded.length) return keepLocalMsg(guarded);
  }

  if (sub === "stash" && !["list", "show", "pop", "apply"].includes(positional[0]))
    return "git stash는 사용자 변경을 숨기거나 지웁니다(list/show/pop/apply만 허용)";

  if (sub === "clean" && (has("-f", "--force") || hasShort(flags, "f")) && !has("-n", "--dry-run")) {
    const allUi = positional.length > 0 && positional.every((p) => p.startsWith("src/components/ui/"));
    if (!allUi) return "git clean -f는 untracked 파일을 지웁니다(모든 경로가 ui 생성물일 때만 허용)";
  }
  return null;
}

// --- 시험 ---------------------------------------------------------------------
const isMain = process.argv[1] && import.meta.url.endsWith(process.argv[1].split(/[\\/]/).pop());
if (isMain) {
  // 아래 세 조각은 guard-bash.mjs에서 그대로 복사했다. 원본과 다르면 시험 자체를 실패시킨다.
  const RUNS_GIT = /^\s*(?:[A-Za-z_][A-Za-z0-9_]*=\S*\s+)*(?:\S*[/\\])?git(?:\.exe)?\s/; // :31
  const OPTS_WITH_VALUE = new Set(["-C", "-c", "--git-dir", "--work-tree", "--namespace"]); // :44
  const gitSubcommand = (seg) => { // :45-54
    const toks = seg.trim().split(/\s+/);
    let i = toks.findIndex((t) => /(^|[/\\])git(\.exe)?$/.test(t));
    if (i < 0) return { sub: null, args: [] };
    i += 1;
    while (i < toks.length && toks[i].startsWith("-")) {
      i += OPTS_WITH_VALUE.has(toks[i]) ? 2 : 1;
    }
    return { sub: toks[i] ?? null, args: toks.slice(i + 1) };
  };
  const FORCE_FLAG = /^(?:--force(?:-with-lease)?(?:=.*)?|-f|--mirror)$/; // :60
  const forcePush = (p) => p.sub === "push" && p.args.some((a) => FORCE_FLAG.test(a) || /^\+[^:]/.test(a)); // :65

  const guardPath = new URL("../../../../../.claude/hooks/guard-bash.mjs", import.meta.url);
  if (fs.existsSync(guardPath)) {
    const src = fs.readFileSync(guardPath, "utf8");
    const snippets = [
      String.raw`const RUNS_GIT = /^\s*(?:[A-Za-z_][A-Za-z0-9_]*=\S*\s+)*(?:\S*[/\\])?git(?:\.exe)?\s/;`,
      `const OPTS_WITH_VALUE = new Set(["-C", "-c", "--git-dir", "--work-tree", "--namespace"]);`,
      String.raw`let i = toks.findIndex((t) => /(^|[/\\])git(\.exe)?$/.test(t));`,
      "i += OPTS_WITH_VALUE.has(toks[i]) ? 2 : 1;",
      String.raw`const FORCE_FLAG = /^(?:--force(?:-with-lease)?(?:=.*)?|-f|--mirror)$/;`,
    ];
    const missing = snippets.filter((s) => !src.includes(s));
    if (missing.length) {
      console.log(`FAIL  guard-bash.mjs와 복사본이 다름:\n  ${missing.join("\n  ")}`);
      process.exit(1);
    }
    console.log("ok    guard-bash.mjs 원본과 RUNS_GIT·gitSubcommand·FORCE_FLAG 복사본 일치");
  } else {
    console.log("skip  guard-bash.mjs 원본 비교(파일 없음)");
  }

  // 시험용 파일 존재 판정: 이 경로들만 "있는 파일"로 본다(실행 위치와 무관하게 재현).
  const FILES = new Set(["src/a.ts", "src/app/page.tsx", "package.json"]);
  const exists = (p) => FILES.has(p);
  // cwd 기준 판정 시험용: 4번째 칸에 { cwd }를 주면 고정 목록 대신 실제 파일 시스템을 본다.
  const ROOT = fileURLToPath(new URL("../../../../../", import.meta.url));
  const EMPTY = fs.mkdtempSync(path.join(os.tmpdir(), "guard-cwd-"));

  const cases = [
    // [명령, 기대: 처음 검출된 git 서브커맨드, 기대: 차단(force push 또는 파기 명령)]
    // 01-ai-setup.md 2.4 실측 우회 5종
    ['bash -c "git push --force"', "push", true],
    ["(git push --force)", "push", true],
    ["env git push --force", "push", true],
    ["sudo git push -f", "push", true],
    ["$(echo git) push -f", null, false], // 처리 불가 한계: 명령 이름이 동적 → 미검출
    // 리뷰 4라운드: 따옴표로 감싼 인자
    ['git branch -D "v3"', "branch", true],
    ['for b in v3 v2; do git branch -D "$b"; done', "branch", true],
    ['git switch -C "main"', "switch", true],
    ["git checkout -B 'main'", "checkout", true],
    ['git branch -D "feature-x"', "branch", false],
    // 리뷰 라운드 1 #4: 치환이 중간에 있음, 접두 명령 옵션, 묶음 -c
    ["echo $(git reset --hard)", "reset", true],
    ["x=1 $(git push -f)", "push", true],
    ['echo "$(git checkout .)"', "checkout", true],
    ["echo `git stash`", "stash", true],
    ["sudo -E git push -f", "push", true],
    ["sudo -u root git push -f", "push", true],
    ["time -p git push -f", "push", true],
    ['bash -lc "git push -f"', "push", true],
    ['bash -c "cd /tmp; git reset --hard"', "reset", true],
    ["g=git; $g push -f", null, false], // 처리 불가 한계: 변수로 만든 명령 이름 → 미검출
    // 거짓 양성 방지
    ["echo '$(git reset --hard)'", null, false], // 작은따옴표 안은 실행되지 않음
    ['git commit -m "fix; git push -f 금지"', "commit", false],
    ["git status", "status", false],
    // 기존 force push 판정이 그대로 동작
    ["git -C . push -f", "push", true],
    ["git push origin +main", "push", true],
    ["git push origin feat-x", "push", false],
    // 파기 명령(리뷰 라운드 1 #5 포함)
    ["git reset --hard HEAD", "reset", true],
    ["git checkout .", "checkout", true],
    ["git checkout -- src/app/page.tsx", "checkout", true],
    ["git checkout HEAD src/a.ts", "checkout", true],
    ["git checkout package.json", "checkout", true],
    ["git checkout -f main", "checkout", true],
    ["git checkout main", "checkout", false],
    ["git checkout -b feat-x main", "checkout", false],
    ["git restore .", "restore", true],
    ["git restore --staged --worktree .", "restore", true],
    ["git restore --staged src/a.ts", "restore", false],
    ["git switch --discard-changes main", "switch", true],
    ["git switch -f main", "switch", true],
    ["git switch main", "switch", false],
    ["git branch -D v3", "branch", true],
    ["git branch -f main HEAD~1", "branch", true],
    ["git branch -D feat-x", "branch", false],
    ["git branch -d main", "branch", false], // -d는 병합 안 된 브랜치를 git이 거부하므로 허용
    ["git stash", "stash", true],
    ["git stash drop", "stash", true],
    ["git stash list", "stash", false],
    ["git stash pop", "stash", false],
    ["git stash apply", "stash", false],
    ["git clean -fd", "clean", true],
    ["git clean -fd src/components/ui/x src/app", "clean", true],
    ["git clean -f -- src/components/ui/dialog.tsx", "clean", false],
    // 리뷰 라운드 2 #2: 로컬 보호 브랜치 포인터 이동(switch -C, checkout -B, branch -m/-M)
    ["git switch -C main HEAD~3", "switch", true],
    ["git switch --force-create=main HEAD~3", "switch", true],
    ["git checkout -B main HEAD~3", "checkout", true],
    ["git branch -m main old-main", "branch", true],
    ["git branch -M feat-x main", "branch", true],
    ["git switch -C feat-x", "switch", false],
    ["git checkout -B feat-x", "checkout", false],
    ["git branch -m feat-a feat-b", "branch", false],
    // 리뷰 라운드 2 #4: timeout·xargs 접두, input.cwd 기준 경로 판정
    ["timeout 5 git push -f", "push", true],
    ["timeout -s KILL 5 git push -f", "push", true],
    ["echo v3 | xargs git branch -D", "branch", false], // 인자가 stdin에서 옴 → 대상 미상, 미검출
    ["xargs -n 1 git branch -D v3", "branch", true],
    // 리뷰 라운드 3 #4: 셸 예약어 뒤의 git, for 변수 치환, 짧은 옵션 묶음
    ["for b in x; do git branch -D v3; done", "branch", true],
    ["for b in v3 v2; do git branch -D $b; done", "branch", true],
    ["for b in feat-a feat-b; do git branch -D ${b}; done", "branch", false],
    ["for b in a; do git status; done", "status", false],
    ["if true; then git push -f; fi", "push", true],
    ["if git diff --quiet; then echo ok; else git reset --hard; fi", "diff", true],
    ["{ git reset --hard; }", "reset", true],
    ["! git reset --hard", "reset", true],
    ["while true; do git stash; done", "stash", true],
    ["git switch -qC main HEAD~3", "switch", true],
    ["git switch -Cq main", "switch", false], // git은 `-C q`로 읽는다: 새 브랜치 q를 main에서 만듦(main은 그대로)
    ["git checkout -qB main HEAD~3", "checkout", true],
    ["git checkout -fB feat-x", "checkout", true], // -f(워킹트리 파기)
    ["git branch -qD v3", "branch", true],
    ["git branch -qM feat-x main", "branch", true],
    ["git fetch . +HEAD~3:main", "fetch", false], // 한계: 막지 않음(드묾, D-09·reflog로 복구)
    ["git update-ref refs/heads/main HEAD~3", "update-ref", false], // 한계: 막지 않음(드묾, D-09·reflog로 복구)
    ["git checkout package.json", "checkout", true, { cwd: ROOT }], // 저장소 루트에서: 파일 있음 → 차단
    ["git checkout package.json", "checkout", false, { cwd: EMPTY }], // 빈 디렉터리에서: 파일 없음 → 브랜치 전환으로 봄
    ["cd src && git checkout app/page.tsx", "checkout", false, { cwd: ROOT }], // 한계: 앞 세그먼트 cd를 반영하지 못함 → 미검출
  ];
  let failed = 0;
  for (const [cmd, wantSub, wantBlock, real] of cases) {
    const parsed = expandCommand(cmd).filter((s) => RUNS_GIT.test(s)).map(gitSubcommand);
    const gotSub = parsed[0]?.sub ?? null;
    const opts = real ? { cwd: real.cwd } : { exists };
    const gotBlock = parsed.some((p) => forcePush(p) || destructiveReason(p.sub, p.args, opts) !== null);
    const ok = gotSub === wantSub && gotBlock === wantBlock;
    if (!ok) failed++;
    const where = real ? ` cwd=${real.cwd === ROOT ? "<저장소 루트>" : "<빈 임시 디렉터리>"}` : "";
    console.log(`${ok ? "ok  " : "FAIL"}  ${cmd.padEnd(46)} sub=${gotSub} block=${gotBlock}${where}`);
  }
  fs.rmSync(EMPTY, { recursive: true, force: true });
  console.log(failed ? `${failed}건 실패` : `${cases.length}건 모두 기대대로`);
  process.exit(failed ? 1 : 0);
}
