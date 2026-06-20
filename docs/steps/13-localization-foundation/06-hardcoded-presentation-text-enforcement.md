# Hardcoded Presentation Text Enforcement

## Goal

Add a deterministic check that prevents new hardcoded user-facing strings from entering presentation code without a localization catalog key.

## Why we implement it this way

After the current CLI output has been localized, the project needs a guardrail. Otherwise future phases will gradually reintroduce English or Italian prose directly in command output, UI components, reports, and validation messages.

This check should protect presentation surfaces without confusing stable technical data with user-facing text. Domain/engine keys, IDs, schema versions, package names, and test fixture values are not translation targets. Text rendered to a player/user is.

## What to implement

- Add a small deterministic enforcement check for presentation files, focused first on:
  - `apps/cli/src/**/*.ts`;
  - future presentation packages/apps when they exist.
- The check should flag likely user-facing hardcoded strings in output/error paths unless they are:
  - localization keys;
  - stable IDs or machine keys;
  - test fixture values;
  - package/script names;
  - explicitly documented allowlist entries.
- Wire the check into `pnpm check` or an existing enforcement script.
- Add tests or fixtures proving:
  - a direct new user-facing CLI string fails;
  - a localized message lookup passes;
  - stable technical keys and IDs are allowed.
- Document allowlist decisions clearly so they do not become a hiding place for deferred cleanup.
- Update `docs/PROJECT_STATUS.md` with the enforcement rule and any known limitations.

## What NOT to implement

- Do not scan domain/engine internals as if every technical string were user-facing.
- Do not rewrite simulation data, event contracts, IDs, or stable keys.
- Do not add runtime machine translation or network dependencies.
- Do not add UI, market, youth, scouting, economy, persistence, or career saves.
- Do not create a broad allowlist that makes the check meaningless.
- Do not leave presentation hardcoded strings as deferred cleanup unless the blocker is explicitly recorded in status.

## Allowed dependencies

- Prefer a dependency-free Node/TypeScript script or a focused test.
- Existing enforcement tooling may be reused if it keeps the rule clear.

## Expected files

- `scripts/check-localized-presentation-text.ts` or an equivalent enforcement/test file.
- `package.json` if `pnpm check` wiring changes.
- CLI/i18n test fixtures only if needed to prove enforcement.
- `docs/PROJECT_STATUS.md`

## Required tests/checks

- Focused enforcement check/test.
- `pnpm check`
- `pnpm cli simulate-season --seed=demo-001 --lang=en`
- `pnpm cli simulate-season --seed=demo-001 --lang=it`
- `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001 --lang=en`
- `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001 --lang=it`

## Definition of Done

- Presentation code has a repeatable guard against new hardcoded user-facing strings.
- The guard distinguishes user-facing prose from stable technical keys.
- The current localized CLI output still works after the check is wired into the project gate.
- Phase 13 can move to the final project-policy alignment step or be explicitly reworked before closure.

## Claude Code task prompt

Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/steps/README.md`, and this step document. Add a focused enforcement check that blocks new hardcoded user-facing strings in presentation code while allowing stable technical keys and IDs. Do not change simulation behavior or domain/engine contracts. Keep code clean, deterministic, and documented with TSDoc/JSDoc where useful. Run the required checks, update `docs/PROJECT_STATUS.md`, tell me what to inspect, and stop.
