# CLI Formation Fit Inspection

## Goal

Expose a CLI inspection path that shows how one fake club's squad fits several formations.

## Why we implement it this way

Before adding market, UI, or career persistence, we need a visible proof that the new squad/formation core produces the right kind of decision pressure.

The CLI should let us inspect questions like:

- Can this club play `4-4-2`?
- Does it lack full backs?
- Does it have too many wide players for a narrow shape?
- Which formation fits the current squad best without buying players?
- Which formation creates future recruitment needs?

This is still inspection, not recommendation. The output can show fit and gaps, but it should not choose the lineup or tell the user what to buy as an action.

## What to implement

- Add a CLI inspection option or command shape consistent with existing CLI patterns, for example:
  - `pnpm cli simulate-season --seed=demo-001 --formation-fit=4-4-2`
  - or a narrow new command only if existing command shape becomes too crowded.
- Use fake content to expose at least one club with enough squad variety to demonstrate:
  - a formation that fits reasonably;
  - a formation that exposes missing full backs;
  - a formation that exposes missing central attacking roles or striker depth.
- Print:
  - selected club;
  - selected formation;
  - formation slot list;
  - covered slots;
  - weak/adapted slots;
  - missing slots;
  - extra-depth groups;
  - factual squad-fit note keys;
  - a short note that this is an inspection report, not automatic selection.
- Add focused CLI tests for:
  - output shape;
  - deterministic repeated output;
  - unsupported formation key;
  - default season output unchanged;
  - at least one formation with a visible squad gap.
- Keep output compact enough to inspect manually.
- Document all new or modified exported functions/types with TSDoc/JSDoc where useful.

## What NOT to implement

- Do not auto-pick the starting XI.
- Do not execute transfers or create market commands.
- Do not add scouting, contracts, wages, staff, youth, UI, persistence, career saves, tactical familiarity, form, morale, or training.
- Do not change match simulation, scoring rates, balance targets, or fitness rules.
- Do not start Phase 13.
- Do not leave dead code, unused helpers, duplicated formation lists, or undocumented cleanup behind.

## Allowed dependencies

- `apps/cli -> engine, content, storage, simulation-tools, shared`
- `engine -> domain, shared`
- `content -> domain, shared`

## Expected files

- `apps/cli/src/commands/simulate-season.ts`
- `apps/cli/src/commands/simulate-season.test.ts`
- `packages/content/src/generators/fake-clubs.ts` only if squad variety requires narrow fake content adjustment
- `packages/content/src/generators/fake-players.ts` only if squad variety requires narrow fake content adjustment
- `packages/content/src/generators/league-system.test.ts` only if fake content changes
- `docs/PROJECT_STATUS.md`

## Required tests/checks

- `pnpm --filter @game/cli run typecheck`
- `pnpm --filter @game/content run typecheck` if fake content changes
- Focused Vitest tests for touched CLI/content files.
- `pnpm check`
- `pnpm cli simulate-season --seed=demo-001`
- New formation-fit inspection command documented by the implementation.
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`

## Definition of Done

- CLI can inspect at least one selected formation against one fake club squad.
- Output clearly shows fit, gaps, extra-depth groups, and factual squad-fit notes.
- Default season output remains unchanged.
- The command does not auto-select players or perform market actions.
- Phase 12 can be closed or explicitly reworked before Phase 13 is documented.

## Claude Code task prompt

Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/steps/README.md`, and this step document. Add only CLI formation-fit inspection. Do not auto-pick lineups, perform transfers, or add market actions. Keep code clean, typed, and documented with TSDoc/JSDoc where useful. Run the required checks, update `docs/PROJECT_STATUS.md`, tell me exactly what I should inspect in the CLI output, and stop.
