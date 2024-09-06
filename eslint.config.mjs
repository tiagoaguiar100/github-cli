import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";


export default [
  {languageOptions: { globals: globals.browser }},
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  { files: ["**/*.{js,mjs,cjs,ts}"], 
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "max-len": ["error", { "code": 80 }],
      "indent": ["error", 2]
    }
  },
];