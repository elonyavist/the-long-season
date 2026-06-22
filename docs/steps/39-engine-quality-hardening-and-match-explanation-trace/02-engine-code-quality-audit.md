# Step 02 - Engine Code Quality Audit

## Goal

Audit the current engine code for local cleanup opportunities before touching
behavior.

The output should be a prioritized cleanup list, not a broad rewrite plan.

## Context

The project rules forbid knowingly leaving dead code, obsolete helpers,
duplicated logic, or clearly improvable local code behind. This step identifies
real cleanup candidates inside the match/season/career engine surface while
keeping gameplay unchanged.

## Expected files

- `docs/audits/ENGINE_QUALITY_HARDENING_AND_TRACE_REPORT.md`
- `docs/PROJECT_STATUS.md`
- the next relevant step document, only if the audit changes Step 03 scope

## Implementation checklist

- Inspect the current engine match surface:
  - `packages/engine/src/match-engine/`
  - `packages/engine/src/use-cases/simulate-season*`
  - related season/player-stat helpers used by match output.
- Identify:
  - duplicated helper logic;
  - unused exports or unused private helpers;
  - functions that are too broad for their current responsibility;
  - magic numbers that are tuning config rather than local implementation;
  - deterministic-order risks;
  - missing focused tests around fragile behavior.
- Classify each finding:
  - fix now in Step 03;
  - leave as acceptable;
  - future phase only.
- Keep the list narrow. A cleanup candidate should have a concrete file, reason,
  and regression check.
- Do not change code behavior.
- Update `docs/PROJECT_STATUS.md`.

## What NOT to implement

- Do not refactor during the audit.
- Do not introduce new abstractions.
- Do not create a broad architecture roadmap.
- Do not change long-run thresholds.
- Do not start Step 03.

## Required checks

- `rg -n "TODO|FIXME|deprecated|compat|legacy|unused|Math.random|Object.values|Object.keys|Object.entries" packages/engine packages/simulation-tools apps/cli`
- `rg -n "deriveTeamStrength|buildTacticTeamContext|stepMatch|simulateMatch|simulateMatchWithManualTactics|simulateSeason|computePlayerMatchStats" packages/engine`
- `pnpm check`
- `git diff --check`

## Definition of Done

- The audit report contains a prioritized cleanup list.
- Step 03 scope is explicit and narrow.
- No gameplay behavior is changed.
- `docs/PROJECT_STATUS.md` points to Step 03 as the next active step.
