import tsParser from "@typescript-eslint/parser";

export default [
  {
    ignores: ["node_modules/**", "dist/**"],
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2023,
        sourceType: "module",
      },
    },
    rules: {},
  },
];
