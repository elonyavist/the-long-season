# 05 - Career Roster And Development Output Module

## Goal

Extract roster, youth academy, and development-report presentation from
`career/format.ts`.

These outputs are player-centric and will likely become early UI screens later,
so they should become easier to find and easier to split into future view-model
builders when UI work actually starts.

This step should cover:

- senior squad inspection output;
- youth academy inspection output;
- player row formatting for senior and youth tables;
- development report output;
- development example formatting;
- player age, nationality, primary position, potential/development category, and
  ability-band display helpers that are directly owned by these outputs.

## Expected files

- `apps/cli/src/commands/career.ts`
- `apps/cli/src/commands/career/format.ts`
- `apps/cli/src/commands/career/roster-output.ts`
- `apps/cli/src/commands/career/development-output.ts` if one module would become
  too broad
- `apps/cli/src/commands/career/season-labs.ts`
- focused career CLI tests
- `docs/audits/CAREER_PRESENTATION_DECOMPOSITION_AUDIT.md`
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Move squad/youth/development output by responsibility.
- Keep hidden potential and scouting rules unchanged; do not expose new hidden
  numbers.
- Keep all user-facing labels localized.
- Avoid sharing broad player-format helpers outside the module unless another
  extracted output already needs them.
- Update the audit with moved helpers and any view-model-readiness notes.

## What NOT to implement

- Do not change generated player attributes, potential, youth academy rules, or
  development curves.
- Do not expose hidden potential as a raw number.
- Do not add new roster filters, sorting, columns, or CLI flags.
- Do not change player names, nationality generation, or flag mapping.
- Do not create UI view models or a UI package.

## Required checks

- `pnpm --filter @game/cli run typecheck`
- focused career CLI tests for squad, youth academy, and development report
- `pnpm check`
- `pnpm cli career --save=phase45-roster --seed=world-a --new-world-preview`
- `pnpm cli career --save=phase45-roster --squad`
- `pnpm cli career --save=phase45-roster --youth-academy`
- `pnpm cli career --save=phase45-roster --development-report`
- `git diff --check`

## Definition of Done

- Roster/youth/development output lives in named modules with clear ownership.
- Player-facing reports still respect hidden-information rules.
- No generation or development behavior changes are made.
- `docs/PROJECT_STATUS.md` points to Step 06 as the next active step.
