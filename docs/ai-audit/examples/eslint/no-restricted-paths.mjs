/**
 * (제안 P-C5) 단방향 의존: components·lib → features·app 금지, features → app 금지.
 * Bulletproof React의 "shared -> features -> app" 흐름을 eslint-plugin-import의 no-restricted-paths로 강제한다.
 * eslint-config-next가 import 플러그인을 이미 등록하므로 새 의존성이 없다(점검 04-research.md 부록 B).
 *
 * 적용: eslint.config.mjs의 defineConfig([...]) 배열에 아래 객체를 추가한다.
 * feature 간 금지는 기존 tmi/no-cross-feature-import가 계속 맡는다(동적 import까지 잡으므로 유지).
 */
export const unidirectionalImports = {
  files: ["src/**/*.{ts,tsx,js,jsx,mjs,cjs}"],
  rules: {
    "import/no-restricted-paths": [
      "error",
      {
        zones: [
          {
            target: ["./src/components", "./src/lib"],
            from: ["./src/features", "./src/app"],
            message: "공용 코드(components·lib)는 features·app을 import하지 않습니다. 필요한 값은 props로 받으세요.",
          },
          {
            target: "./src/features",
            from: "./src/app",
            message: "feature는 app(라우트)을 import하지 않습니다. 조립은 page.tsx에서 합니다.",
          },
        ],
      },
    ],
  },
};
