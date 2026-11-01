import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Code ported from the Foodvisor (Next 15) and TalentBaby admins loads data with the
    // "set loading, then fetch" effect pattern, which predates React's set-state-in-effect rule.
    // It is a warning there until those screens are refactored; new code must pass the rule.
    files: [
      "components/*Manager.tsx",
      "components/ResourceManager.tsx",
      "hooks/**",
      "app/(admin)/babygrow/**"
    ],
    rules: { "react-hooks/set-state-in-effect": "warn" }
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
