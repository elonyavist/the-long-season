# Step 02 - Career Squad Player Inspection

## Goal

Add a save-driven CLI view that lets the user inspect the selected club's generated squad before choosing a lineup.

## Context

The user asked how to see generated players. `--identity-review` shows identities for generated content, and `--player-generation-report` shows aggregate quality, but neither is enough for career match preparation. The manager needs a career-save view of the selected club roster with practical football information.

## Expected files

- `apps/cli/src/commands/career.ts`
- `apps/cli/src/commands/career/*.ts`
- `apps/cli/src/commands/career.test.ts`
- `packages/i18n/src/*.ts`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Add a career CLI inspection mode, proposed flag: `--squad`.
- Load an existing career save.
- Print selected club, squad size, and ordered players.
- For each player, print:
  - display name;
  - age or birth-date-derived age at current career date;
  - natural position;
  - compact role-relevant current ability summary;
  - current fitness/form/morale if available.
- Keep exact hidden potential out of the output.
- Localize all headings and labels.
- Keep the command inspection-only; do not mutate the save.

## What NOT to implement

- Do not add UI.
- Do not add scouting fog.
- Do not expose exact hidden potential.
- Do not add lineup selection in this step.
- Do not add sorting modes unless the basic ordered roster is insufficient.
- Do not change player generation.

## Required checks

- `pnpm --filter @game/cli run typecheck`
- `pnpm --filter @game/i18n run typecheck`
- focused career CLI/i18n tests
- `pnpm cli career --save=phase25-squad-world --seed=world-a --new-world-preview`
- `pnpm cli career --save=phase25-squad-world --squad`
- `pnpm check`

## Definition of Done

- The user can inspect generated players from a career save.
- The output is localized and deterministic.
- The command does not write the save.
- The output provides enough information to choose a first lineup manually.
