import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { globalIgnores } from "eslint/config";

export default tseslint.config(
  // 전역 제외
  globalIgnores(["dist/**", "node_modules/**"]),

  // 1) 권장 세트들 (Flat Config는 extends 대신 배열에 나열)
  js.configs.recommended,
  ...tseslint.configs.recommended,
  reactHooks.configs["recommended-latest"],
  reactRefresh.configs.vite,

  // 2) 앱 소스(브라우저) 설정 + 중복 룰 정리
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: { ...globals.browser },
    },
    rules: {
      "no-undef": "off",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
    },
  },

  // 3) Node에서 실행되는 설정/스크립트 파일은 Node 전역으로
  {
    files: ["vite.config.*", "*.config.*", "scripts/**/*.{ts,js}"],
    languageOptions: { globals: { ...globals.node } },
  }
);
