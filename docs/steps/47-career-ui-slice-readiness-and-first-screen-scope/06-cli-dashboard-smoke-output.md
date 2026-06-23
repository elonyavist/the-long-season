# 06 - CLI Dashboard Smoke Output

## Goal

Add a CLI smoke command that renders the career dashboard view.

The command exists to validate the future UI data contract before creating a web
app. It should use the same structured dashboard view that the UI will consume.

## Expected files

- `apps/cli/src/commands/career.ts`
- `apps/cli/src/commands/career/parse-career-args.ts`
- `apps/cli/src/commands/career/dashboard-output.ts`
- `apps/cli/src/commands/career/format.ts`
- `packages/i18n/src/labels.ts`
- `packages/ui/src/career/*`
- Focused CLI/i18n/UI tests for touched files.
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Add a narrow career CLI flag, recommended: `--dashboard`.
- Load the selected career save through the existing storage adapter in CLI.
- Build the dashboard view through the UI-facing builder.
- Render a compact, localized smoke output that mirrors the first-screen
  sections:
  - career context;
  - selected club;
  - next fixture;
  - preparation readiness;
  - squad condition summary;
  - compact table context;
  - actions and blockers.
- Use i18n labels for all user-facing text.
- Keep rendering in a dedicated `dashboard-output.ts` Module.
- Do not duplicate dashboard fact derivation in CLI rendering.
- Keep the command deterministic and read-only.

## What NOT to implement

- Do not create `apps/web`.
- Do not add React or browser code.
- Do not write saves from `--dashboard`.
- Do not change existing career summary output.
- Do not parse CLI prose to build the dashboard.
- Do not add gameplay behavior or tuning.

## Required checks

- `pnpm --filter @game/ui run typecheck`
- `pnpm --filter @game/cli run typecheck`
- `pnpm --filter @game/i18n run typecheck`
- Focused tests for touched UI, CLI, and i18n files.
- `pnpm check`
- `pnpm cli career --save=phase47-check --seed=world-a --new-world-preview`
- `pnpm cli career --save=phase47-check --dashboard`
- `git diff --check`

## Definition of Done

- `--dashboard` renders the first-screen facts from the shared view contract.
- The CLI smoke output proves the future UI contract without creating the UI.
- Existing career commands remain unchanged.
- `docs/PROJECT_STATUS.md` records Step 06 as complete or blocked.
