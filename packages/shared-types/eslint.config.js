export default [
  {
    ignores: ["node_modules/**", "dist/**"],
  },
  {
    files: ["**/*.ts"],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2023,
        sourceType: "module",
      },
    },
    rules: {},
  },
];
