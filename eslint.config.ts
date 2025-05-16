import eslint from "@eslint/js";
import ts from "typescript-eslint";
import prettier from "eslint-config-prettier/flat";

export default ts.config(
  { ignores: ["dist"] },
  { linterOptions: { reportUnusedDisableDirectives: "warn" } },
  eslint.configs.recommended,
  ts.configs.recommended,
  prettier,
);
