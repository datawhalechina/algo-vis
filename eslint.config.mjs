import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";

export default [
  // 忽略目录 / 文件
  {
    ignores: ["dist", ".eslintrc.cjs", ".history"],
  },

  // 基础 JS 规则（等价于 eslint:recommended）
  js.configs.recommended,

  // TypeScript + React 相关规则
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
      },
      globals: {
        ...globals.browser,
        ...globals.es2020,
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      // 关闭 TS 文件中的基础 no-unused-vars，改用 TS 版本
      "no-unused-vars": "off",
      // TS 项目里交给 TypeScript 自己做未定义检查，这里关闭 no-undef
      "no-undef": "off",

      // React Hooks 推荐规则（等价于 plugin:react-hooks/recommended）
      ...reactHooks.configs.recommended.rules,

      // 原 .eslintrc.cjs 中的自定义规则
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
    },
  },

  // 对纯类型定义文件放宽约束：允许未使用的变量/枚举等
  {
    files: ["src/types/**/*.{ts,tsx}"],
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "no-undef": "off",
    },
  },
];
