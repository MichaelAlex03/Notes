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
  ]),
  {
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          {
            group: [
              '@/modules/*/lib/*',
              '@/modules/*/lib',
              '@/modules/*/components/*',
              '@/modules/*/components',
              '@/modules/*/server-actions/*',
              '@/modules/*/server-actions',
              '@/modules/*/types/*',
              '@/modules/*/types',
            ],
            message: 'Import from the module public contract instead: @/modules/<name>',
          }
        ]
      }]
    }
  }
]);

export default eslintConfig;
