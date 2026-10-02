import path from "node:path";
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import tailwindcss from "eslint-plugin-tailwindcss";

/**
 * 로컬 규칙: feature 간 직접 import 금지 (CLAUDE.md 아키텍처 규칙).
 * src/features/<a>/** 에서 src/features/<b>/** 를 import 하면 에러.
 * 공유가 필요하면 src/lib 또는 src/components 로 승격한다.
 */
const featureOf = (absPath) => {
  const m = absPath.split(path.sep).join("/").match(/\/src\/features\/([^/]+)/);
  return m ? m[1] : null;
};

/** import 소스 문자열. 백틱 한 조각짜리 템플릿 리터럴도 읽는다(동적 import 우회 차단). */
const specifierOf = (source) => {
  if (!source) return null;
  if (typeof source.value === "string") return source.value;
  if (source.type === "TemplateLiteral" && source.quasis.length === 1) {
    return source.quasis[0].value.cooked;
  }
  return null;
};

const noCrossFeatureImport = {
  meta: {
    type: "problem",
    messages: {
      cross:
        "feature '{{from}}'에서 feature '{{to}}'를 직접 import할 수 없습니다. 공유 코드는 src/lib 또는 src/components로 옮기세요.",
      dynamic:
        "feature 안에서 계산된 경로로 import할 수 없습니다(feature 경계 검사를 우회합니다). 경로를 문자열 리터럴로 쓰세요.",
    },
  },
  create(context) {
    const filename = context.filename;
    const from = featureOf(filename);
    if (!from) return {};
    const srcRoot = filename.split(path.sep).join("/").replace(/\/src\/.*$/, "/src");
    const check = (node) => {
      const spec = specifierOf(node.source);
      if (spec === null) {
        // 정적으로 알 수 없는 경로는 경계 검사가 불가능하므로 금지한다.
        if (node.type === "ImportExpression" && node.source) {
          context.report({ node: node.source, messageId: "dynamic" });
        }
        return;
      }
      let target = null;
      if (spec.startsWith("@/")) target = path.join(srcRoot, spec.slice(2));
      else if (spec.startsWith(".")) target = path.resolve(path.dirname(filename), spec);
      if (!target) return;
      const to = featureOf(target);
      if (to && to !== from) {
        context.report({ node: node.source, messageId: "cross", data: { from, to } });
      }
    };
    return {
      ImportDeclaration: check,
      ExportNamedDeclaration: check,
      ExportAllDeclaration: check,
      ImportExpression: check,
    };
  },
};

/**
 * 로컬 규칙: 디자인 토큰 밖의 값 금지 (CLAUDE.md "디자인 시스템").
 * eslint-plugin-tailwindcss는 className에 직접 쓴 문자열만 검사해서, 클래스를 변수·객체·함수 반환값에
 * 담으면 통과한다(레드팀 실측: AI가 가장 흔히 쓰는 상태→클래스 맵이 이 형태). 그래서 소스의 모든
 * 문자열 리터럴을 공백으로 나눠 조각마다 검사한다.
 */
const PALETTE =
  "red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone|mauve|olive|mist|taupe";
const PALETTE_RE = new RegExp(`^-?[a-z][a-z-]*-(${PALETTE})-(50|[1-9]00|950)(\\/.*)?$`);
const ARBITRARY_RES = [
  /^-?[a-z][a-z0-9-]*-\[.+\]$/, // text-[13px], bg-[#f00]
  /^-?[a-z][a-z0-9-]*\/\[.+\]$/, // bg-primary/[.37]
  /^\[[a-z-]+:.+\]$/, // [color:red], [--x:red]
  /^-?[a-z][a-z0-9-]*-\((--|[a-z-]+:--).+\)$/, // bg-(--x), text-(length:--x)
];
// 허용하는 임의 값:
// - 그리드 템플릿: "라벨 열은 내용 폭, 값 열은 나머지" 같은 레이아웃은 다른 표현 수단이 없다(색·크기 위험 없음).
// - Base UI 위치 변수: 팝업 폭·높이를 기준 요소에 맞추는 관용구(w-(--anchor-width) 등).
const ALLOWED_ARBITRARY_RE =
  /^grid-(cols|rows)-\[.+\]$|^[a-z-]+-\(--(anchor-width|anchor-height|available-width|available-height|transform-origin)\)$/;
// 다크 고정 화면에서 불투명 흰색·검정은 토큰을 벗어난다. 반투명(bg-black/50)만 허용하고 /100은 불투명으로 본다.
// 색 유틸 접두로 한정해 영어 문장의 "black-and-white" 같은 단어를 잡지 않는다.
const OPAQUE_BW_RE =
  /^-?(bg|text|border(-[xytrblse])?|outline|ring|inset-ring|ring-offset|shadow|inset-shadow|drop-shadow|text-shadow|accent|caret|fill|stroke|divide|placeholder|decoration|from|via|to)-(white|black)(\/100)?$/;
// 한국어 문구("주문 #123")는 색 값 검사를 건너뛴다. 클래스 문자열에는 한글이 들어가지 않는다.
const HANGUL_RE = /[가-힣]/;
// #hex는 토큰 시작에서만 잡는다("/english#feed" 같은 URL 조각 제외).
const RAW_COLOR_RE =
  /(?:^|[\s:(,=[])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![\w-])|\b(?:rgba?|hsla?|oklch|oklab|lab|lch|hwb|color-mix)\(/;
// 클래스가 아닌 문자열이 오는 자리(링크·식별자·모듈 경로)는 검사하지 않는다.
const NON_CLASS_ATTRS = new Set(["href", "id", "key", "src", "alt", "htmlFor", "name", "type", "role", "target", "rel"]);

/** 변형 접두(hover:, data-[x]:)를 벗긴 마지막 조각 */
const baseOf = (tok) => {
  let depth = 0;
  let last = 0;
  for (let i = 0; i < tok.length; i++) {
    const c = tok[i];
    if (c === "[" || c === "(") depth++;
    else if (c === "]" || c === ")") depth--;
    else if (c === ":" && depth === 0) last = i + 1;
  }
  return tok.slice(last).replace(/^!|!$/g, "");
};

const noRawDesignValues = {
  meta: {
    type: "problem",
    messages: {
      arb: "'{{tok}}': 임의 값·임의 속성·CSS 변수 축약은 쓰지 않습니다(변수·객체·cva 안도 마찬가지). 토큰 클래스를 쓰고, 없으면 plan에 \"토큰 추가\"로 올리세요.",
      pal: "'{{tok}}': 기본 색 팔레트는 지워져 있어 아무 색도 나오지 않습니다. 의미 토큰(text-success, bg-muted 등)을 쓰세요.",
      bw: "'{{tok}}': 불투명 흰색·검정 대신 의미 토큰을 씁니다(text-foreground, bg-background, text-primary-foreground 등). 오버레이는 bg-black/50처럼 반투명만 허용.",
      raw: "원시 색 값('{{tok}}')을 코드에 쓰지 않습니다. 의미 토큰 클래스(text-destructive, fill-current 등)를 쓰세요.",
    },
  },
  create(context) {
    const skip = (node) => {
      const p = node.parent;
      if (!p) return false;
      if (p.type === "ImportDeclaration" || p.type === "ExportAllDeclaration" || p.type === "ExportNamedDeclaration") return true;
      if (p.type === "ImportExpression") return true;
      if (p.type === "JSXAttribute" && NON_CLASS_ATTRS.has(p.name.name)) return true;
      // 로그 접두("[api:error]")는 클래스가 아니다
      if (p.type === "CallExpression" && p.callee.type === "MemberExpression" && p.callee.object.name === "console") return true;
      return false;
    };
    const checkText = (node, text) => {
      for (const tok of text.split(/\s+/).filter(Boolean)) {
        const b = baseOf(tok);
        if (ALLOWED_ARBITRARY_RE.test(b)) continue;
        if (ARBITRARY_RES.some((re) => re.test(b))) return context.report({ node, messageId: "arb", data: { tok } });
        if (PALETTE_RE.test(b)) return context.report({ node, messageId: "pal", data: { tok } });
        if (OPAQUE_BW_RE.test(b)) return context.report({ node, messageId: "bw", data: { tok } });
      }
      const m = HANGUL_RE.test(text) ? null : text.match(RAW_COLOR_RE);
      if (m) context.report({ node, messageId: "raw", data: { tok: m[0] } });
    };
    return {
      Literal(node) {
        if (typeof node.value === "string" && !skip(node)) checkText(node, node.value);
      },
      TemplateElement(node) {
        checkText(node, node.value.cooked ?? "");
      },
    };
  },
};

// --- 공통 제한 목록 -----------------------------------------------------------

const NO_PROCESS = {
  name: "process",
  message: "환경변수는 @/lib/env의 env 객체로만 읽습니다 (서버 전용 값은 @/lib/env.server).",
};

const NO_NETWORK_GLOBALS = [
  {
    name: "fetch",
    message: "fetch를 직접 호출하지 않습니다. features/<name>/api.ts → lib/api/client.ts를 경유하세요.",
  },
  {
    name: "XMLHttpRequest",
    message: "BE 호출은 features/<name>/api.ts에서만 엽니다.",
  },
  {
    name: "EventSource",
    message: "SSE도 features/<name>/api.ts에서만 엽니다(URL은 env.apiBaseUrl 기준).",
  },
];

// 전역 객체를 거쳐 우회하는 형태(globalThis.fetch 등)를 함께 막는다.
const NO_BYPASS_PROPERTIES = [
  { object: "globalThis", property: "fetch", message: "fetch는 features/<name>/api.ts에서만." },
  { object: "window", property: "fetch", message: "fetch는 features/<name>/api.ts에서만." },
  { object: "globalThis", property: "process", message: "환경변수는 @/lib/env로만." },
  { object: "window", property: "process", message: "환경변수는 @/lib/env로만." },
  { object: "navigator", property: "sendBeacon", message: "BE 호출은 features/<name>/api.ts에서만." },
];

// 스택 이탈 방지 (CLAUDE.md '스택 (고정)').
const NO_OFF_STACK_IMPORTS = {
  paths: [
    { name: "axios", message: "HTTP 클라이언트는 lib/api/client.ts 하나입니다." },
    { name: "ky", message: "HTTP 클라이언트는 lib/api/client.ts 하나입니다." },
    { name: "styled-components", message: "런타임 CSS-in-JS 금지. Tailwind + shadcn/ui를 쓰세요." },
    { name: "@emotion/react", message: "런타임 CSS-in-JS 금지. Tailwind + shadcn/ui를 쓰세요." },
    { name: "@emotion/styled", message: "런타임 CSS-in-JS 금지. Tailwind + shadcn/ui를 쓰세요." },
    { name: "node:process", message: "환경변수는 @/lib/env로만." },
    { name: "process", message: "환경변수는 @/lib/env로만." },
  ],
  // CSS는 globals.css 하나만(토큰의 원본). .module.css나 새 .css로 토큰을 우회하지 않는다.
  patterns: [
    {
      group: ["**/*.css", "!**/app/globals.css", "!./globals.css"],
      message: "CSS 파일은 src/app/globals.css 하나만 씁니다(.module.css·새 .css 금지). 스타일은 토큰 클래스로.",
    },
  ],
};

const PROCESS_ENV_SELECTOR = {
  selector: "MemberExpression[object.name='process'][property.name='env']",
  message: "process.env는 src/lib/env.ts(공개) 또는 src/lib/env.server.ts(서버 전용)에서만 읽습니다.",
};

// 디자인 시스템: 인라인 style·style 태그·SVG 색으로 토큰을 우회하지 못하게 한다.
// 주의: 일반 객체의 style 키는 막지 않는다(Intl.NumberFormat의 { style: "currency" } 등 정당한 용도).
const STYLE_MSG = "style 대신 Tailwind 토큰 클래스를 씁니다. 필요한 값이 없으면 plan에 \"토큰 추가\"로 올리세요.";
const NO_STYLE_BYPASS = [
  { selector: "JSXAttribute[name.name=/^(style|\\w+Style)$/]", message: STYLE_MSG },
  { selector: "JSXSpreadAttribute Property[key.name='style']", message: STYLE_MSG },
  { selector: "CallExpression[callee.name='createElement'] Property[key.name='style']", message: STYLE_MSG },
  { selector: "CallExpression[callee.property.name='createElement'] Property[key.name='style']", message: STYLE_MSG },
  { selector: "AssignmentExpression[left.object.property.name='style']", message: "DOM style을 직접 바꾸지 않습니다. 토큰 클래스를 토글하세요." },
  { selector: "JSXOpeningElement[name.name='style']", message: "<style> 태그를 쓰지 않습니다. 스타일은 토큰 클래스로." },
  { selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']", message: "dangerouslySetInnerHTML을 쓰지 않습니다." },
  {
    selector:
      "JSXAttribute[name.name=/^(fill|stroke|stopColor|floodColor|lightingColor|color)$/][value.type='Literal'][value.value!=/^(currentColor|none|inherit|transparent|url\\(.+\\)|var\\(--[\\w-]+\\))$/]",
    message: "SVG·아이콘 색은 currentColor로 두고 text-<토큰> 클래스로 지정합니다(차트는 var(--chart-N)).",
  },
];

// 소스 전체에 적용할 확장자. .js/.jsx가 빠져 있으면 그 파일만 규칙을 통째로 우회한다.
const SRC_FILES = ["src/**/*.{ts,tsx,js,jsx,mjs,cjs}"];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: SRC_FILES,
    // 규칙을 주석 한 줄로 끄지 못하게 한다(가드가 있으나 마나 해지는 것을 막음).
    linterOptions: {
      noInlineConfig: true,
      reportUnusedDisableDirectives: "error",
    },
    plugins: {
      tmi: { rules: { "no-cross-feature-import": noCrossFeatureImport, "no-raw-design-values": noRawDesignValues } },
    },
    rules: {
      "tmi/no-cross-feature-import": "error",
      "tmi/no-raw-design-values": "error",
      "no-restricted-syntax": ["error", PROCESS_ENV_SELECTOR, ...NO_STYLE_BYPASS],
      "no-restricted-globals": ["error", NO_PROCESS, ...NO_NETWORK_GLOBALS],
      "no-restricted-properties": ["error", ...NO_BYPASS_PROPERTIES],
      "no-restricted-imports": ["error", NO_OFF_STACK_IMPORTS],
    },
  },
  {
    // 디자인 시스템 강제: globals.css에 정의된 토큰으로 만든 클래스만 허용한다.
    // (src/components/ui/**는 shadcn 생성물이라 아래 globalIgnores로 제외됨 — 생성물 자체가 임의 값을 쓴다)
    files: SRC_FILES,
    // cn() 헬퍼는 클래스를 합칠 뿐 클래스가 없다. clsx(inputs)의 변수명을 클래스로 오인하는 거짓 양성이 있어 제외.
    ignores: ["src/lib/utils.ts"],
    plugins: { tailwindcss },
    settings: {
      tailwindcss: {
        cssConfigPath: "./src/app/globals.css",
        // 클래스를 받는 prop 이름 변형까지 검사한다
        attributes: ["class", "className", "classNames", "inputClassName", "contentClassName"],
      },
    },
    rules: {
      // 임의 값은 tmi/no-raw-design-values가 모든 문자열에서 검사한다(그리드 템플릿 예외 포함).
      // 이 규칙은 예외를 설정할 수 없어 끈다.
      "tailwindcss/no-arbitrary-value": "off",
      // 존재하지 않는 클래스 금지(지운 원시 팔레트 bg-red-500 등도 여기서 걸린다)
      "tailwindcss/no-custom-classname": ["error", { whitelist: ["dark"] }],
      "tailwindcss/no-contradicting-classname": "error",
    },
  },
  {
    // 공개 환경변수 접근점. NEXT_PUBLIC_ 접두사가 없는 값을 여기 두면 서버에서 렌더된
    // HTML로 평문 유출되고 브라우저 런타임에서는 undefined가 된다 → 서버 전용은 env.server.ts로.
    files: ["src/lib/env.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "MemberExpression[object.object.name='process'][object.property.name='env'][property.name!=/^NEXT_PUBLIC_/]",
          message:
            "env.ts에는 NEXT_PUBLIC_ 값만 둡니다. 서버 전용 값은 src/lib/env.server.ts에 두고 클라이언트에서 import하지 마세요.",
        },
        {
          selector: "MemberExpression[object.object.name='process'][object.property.name='env'][computed=true]",
          message: "process.env는 점 표기법으로만 읽습니다(빌드 시 치환되지 않습니다).",
        },
      ],
      "no-restricted-globals": ["error", ...NO_NETWORK_GLOBALS],
    },
  },
  {
    // 서버 전용 환경변수. 이 파일을 만들 때는 최상단에 `import "server-only";`를 넣는다.
    files: ["src/lib/env.server.ts"],
    rules: {
      "no-restricted-syntax": "off",
      "no-restricted-globals": ["error", ...NO_NETWORK_GLOBALS],
    },
  },
  {
    // BE 호출 경계. 디렉터리 형태(api/streaming.ts)와 .tsx도 허용한다.
    files: [
      "src/lib/api/**/*.{ts,tsx}",
      "src/features/*/api.ts",
      "src/features/*/api/**/*.{ts,tsx}",
    ],
    rules: {
      "no-restricted-globals": ["error", NO_PROCESS],
      "no-restricted-properties": [
        "error",
        ...NO_BYPASS_PROPERTIES.filter((p) => p.property !== "fetch"),
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // shadcn 생성물은 직접 수정하지 않으므로 lint 대상에서 제외
    "src/components/ui/**",
  ]),
]);

export default eslintConfig;
