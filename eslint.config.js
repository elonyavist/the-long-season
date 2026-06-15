/**
 * ESLint flat config for early architecture enforcement.
 *
 * The broad lint surface stays intentionally small until application code grows.
 * The critical rule today is scoped to `packages/engine`: no non-deterministic
 * runtime APIs may enter the simulation layer.
 */
import tseslint from "typescript-eslint";

export default [
  {
    ignores: ["node_modules/**", "coverage/**", "dist/**", "**/node_modules/**"],
  },
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        sourceType: "module",
      },
    },
  },
  {
    files: ["packages/engine/src/**/*.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "CallExpression[callee.object.name='Math'][callee.property.name='random']",
          message: "Engine randomness must use deriveRng from @game/shared, not Math.random().",
        },
        {
          selector: "CallExpression[callee.object.name='Date'][callee.property.name='now']",
          message: "Engine game time must use GameDate, not Date.now().",
        },
        {
          selector: "NewExpression[callee.name='Date']",
          message: "Engine game time must use GameDate, not new Date().",
        },
        {
          selector: "CallExpression[callee.object.name='crypto'][callee.property.name='randomUUID']",
          message: "Engine IDs must be stable domain IDs, not crypto.randomUUID().",
        },
        {
          selector: "CallExpression[callee.object.name='performance'][callee.property.name='now']",
          message: "Engine timing must not depend on performance.now().",
        },
      ],
    },
  },
];
