import path from "node:path";
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

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
};

const PROCESS_ENV_SELECTOR = {
  selector: "MemberExpression[object.name='process'][property.name='env']",
  message: "process.env는 src/lib/env.ts(공개) 또는 src/lib/env.server.ts(서버 전용)에서만 읽습니다.",
};

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
    plugins: { tmi: { rules: { "no-cross-feature-import": noCrossFeatureImport } } },
    rules: {
      "tmi/no-cross-feature-import": "error",
      "no-restricted-syntax": ["error", PROCESS_ENV_SELECTOR],
      "no-restricted-globals": ["error", NO_PROCESS, ...NO_NETWORK_GLOBALS],
      "no-restricted-properties": ["error", ...NO_BYPASS_PROPERTIES],
      "no-restricted-imports": ["error", NO_OFF_STACK_IMPORTS],
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
