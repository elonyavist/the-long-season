# Saved Tactic Demo Profiles

## Goal

Replace the single CLI tactic demo with a tiny deterministic set of saved tactic profiles that can later be selected manually during a match.

## Why we implement it this way

Manual switching only makes sense if there is more than one prepared tactic to choose from. The user should think in terms of named setups, like a classic manager game: balanced to start, attacking to chase a goal, defensive to protect a lead.

This step should still be CLI-demo-level, not a full tactic editor. Profiles can be hardcoded in the CLI inspection layer for now, as long as they are deterministic, explicit, and routed through existing setup override support.

## What to implement

- Add a small saved tactic demo profile registry for PRO01.
- Support at least these profile keys:
  - `pro01-balanced`
  - `pro01-attacking`
  - `pro01-defensive`
- Keep each profile deterministic and explicit:
  - selected club;
  - selected role changes, if any;
  - tactic values;
  - selected lineup data passed to `simulateSeason.setupOverrides`.
- Update CLI parsing/output so the available demo profile values are discoverable.
- Preserve `--setup-demo=pro01-attacking` if compatibility is easy and useful, or document a narrow replacement if renaming is clearer.
- Add focused CLI tests for supported profiles, invalid profiles, deterministic output, and default output unchanged.

## What NOT to implement

- Do not build a tactic editor or arbitrary matrix of CLI tactic knobs.
- Do not add manual in-match switching yet; that belongs to later Phase 09 steps.
- Do not add automatic switching based on score/minute/context.
- Do not add live match sessions, substitutions, fatigue, morale, cards, injuries, UI, persistence, market, economy, staff, youth, facilities, or media.
- Do not change default fake content, scoring calibration, balance targets, or team-strength formulas.
- Do not store rendered prose in domain events or reports.

## Allowed dependencies

- `apps/cli -> engine, content, storage, simulation-tools, shared`
- `engine -> domain, shared` only if a small public export is needed.

## Expected files

- `apps/cli/src/commands/simulate-season.ts`
- `apps/cli/src/commands/simulate-season.test.ts`
- `docs/PROJECT_STATUS.md`

## Required tests/checks

- `pnpm --filter @game/cli run typecheck`
- Focused Vitest tests for touched CLI files.
- `pnpm check`
- `pnpm cli simulate-season --seed=demo-001`
- `pnpm cli simulate-season --seed=demo-001 --setup-demo=pro01-balanced`
- `pnpm cli simulate-season --seed=demo-001 --setup-demo=pro01-attacking`
- `pnpm cli simulate-season --seed=demo-001 --setup-demo=pro01-defensive`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`

## Definition of Done

- CLI exposes multiple deterministic saved tactic profiles.
- Default output remains unchanged without a setup flag.
- Each profile prints enough context for a user/developer to understand what was selected.
- No in-match switch has been implemented yet.
- Strict `calibration-v1` balance report passes or any regression is documented as a blocker.

## Claude Code task prompt

Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/steps/README.md`, and this step document. Add only the saved tactic demo profiles needed for later manual switching. Do not add match segments or automatic tactical decisions. Run the required checks, update `docs/PROJECT_STATUS.md`, tell me exactly what I should inspect in the CLI output, and stop.
