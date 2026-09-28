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

const noCrossFeatureImport = {
  meta: {
    type: "problem",
    messages: {
      cross:
        "feature '{{from}}'에서 feature '{{to}}'를 직접 import할 수 없습니다. 공유 코드는 src/lib 또는 src/components로 옮기세요.",
    },
  },
  create(context) {
    const filename = context.filename;
    const from = featureOf(filename);
    if (!from) return {};
    const srcRoot = filename.split(path.sep).join("/").replace(/\/src\/.*$/, "/src");
    const check = (node) => {
      const spec = node.source?.value;
      if (typeof spec !== "string") return;
      let target = null;
      if (spec.startsWith("@/")) target = path.join(srcRoot, spec.slice(2));
      else if (spec.startsWith(".")) target = path.resolve(path.dirname(filename), spec);
      if (!target) return;
      const to = featureOf(target);
      if (to && to !== from) {
        context.report({ node: node.source, messageId: "cross", data: { from, to } });
      }
    };
    return { ImportDeclaration: check, ExportNamedDeclaration: check, ExportAllDeclaration: check, ImportExpression: check };
  },
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: { tmi: { rules: { "no-cross-feature-import": noCrossFeatureImport } } },
    rules: {
      "tmi/no-cross-feature-import": "error",
      // 환경변수는 src/lib/env.ts 를 통해서만 접근
      "no-restricted-syntax": [
        "error",
        {
          selector: "MemberExpression[object.name='process'][property.name='env']",
          message: "process.env는 src/lib/env.ts에서만 읽습니다. env 객체를 import해서 쓰세요.",
        },
      ],
      // BE 호출은 lib/api/client.ts(또는 feature api.ts의 스트리밍)를 통해서만
      "no-restricted-globals": [
        "error",
        {
          name: "fetch",
          message: "fetch를 직접 호출하지 않습니다. features/<name>/api.ts → lib/api/client.ts를 경유하세요.",
        },
      ],
    },
  },
  {
    files: ["src/lib/env.ts"],
    rules: { "no-restricted-syntax": "off" },
  },
  {
    files: ["src/lib/api/**/*.ts", "src/features/*/api.ts"],
    rules: { "no-restricted-globals": "off" },
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
