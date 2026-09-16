import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // 브라우저 테스트가 만들어 내는 것들(보고서·실패 기록·확인용 DB). 우리가 쓴 코드가 아니다
    "playwright-report/**",
    "test-results/**",
    ".e2e/**",
  ]),
  {
    rules: {
      // 서버 액션은 쓰지 않는 인자(FormData)를 받아야 할 때가 있다.
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
]);

export default eslintConfig;
