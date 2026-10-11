// 점검용 검증 설정: 현재 eslint.config.mjs에 예시 규칙 2개를 얹어 실제로 동작하는지 확인한다.
// 실행: pnpm exec eslint -c docs/ai-audit/examples/eslint/verify.config.mjs --stdin --stdin-filename <src 경로> < 샘플
import base from "../../../../eslint.config.mjs";
import { noDynamicClass } from "./no-dynamic-class.mjs";
import { unidirectionalImports } from "./no-restricted-paths.mjs";

const verifyConfig = [
  ...base,
  {
    files: ["src/**/*.{ts,tsx,js,jsx,mjs,cjs}"],
    plugins: { tmiExtra: { rules: { "no-dynamic-class": noDynamicClass } } },
    rules: { "tmiExtra/no-dynamic-class": "error" },
  },
  unidirectionalImports,
];

export default verifyConfig;
