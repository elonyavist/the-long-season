# Step 13 - Player Trajectory Diagnostics And Inspection Reports

## Status

Done.

## Goal

Expose enough structured diagnostic evidence to understand why a player was
generated, developed, adapted, declined, or exited without exposing exact
hidden potential in the normal game UI.

## Inspectable Outcome

- CLI inspection can follow representative players month by month and season
  by season.
- Reports separate current ability, hidden reachable ceiling, minutes,
  performance modifier, growth, decline, role exposure, and exit facts.
- Aggregate reports detect age-feasibility, potential monotonicity, floor,
  rarity, participation, and population violations.

## Scope

1. Add one development/lifecycle diagnostic read model in simulation-tools.
2. Extend generated-player inspection with age/family current-to-potential gap
   distributions.
3. Extend career development output with monthly and annual trajectory facts.
4. Add representative trajectory samples for ages 16, 18, 21, 24, 26, 29,
   32, 36, and 40.
5. Report minutes bands, starts, substitute use, ratings, role exposure,
   familiarity changes, physical decline, and exits.
6. Keep exact potential behind explicit developer inspection commands only;
   normal web and career surfaces retain prospect labels/ranges.
7. Name every failed seed and player ID.
8. Delete obsolete report fields based on the removed seasonal model.

## Expected Files

- `packages/simulation-tools/src/long-run/player-evolution.ts`
- `packages/simulation-tools/src/long-run/player-evolution.test.ts`
- `packages/simulation-tools/src/long-run/youth-stability.ts`
- `packages/simulation-tools/src/long-run/youth-stability.test.ts`
- `packages/simulation-tools/src/long-run/career-long-runner.ts`
- `packages/simulation-tools/src/long-run/career-long-runner.test.ts`
- `packages/simulation-tools/src/index.ts`
- `apps/cli/src/commands/simulate-season/generated-inspection-output.ts`
- `apps/cli/src/commands/simulate-season.test.ts`
- `apps/cli/src/commands/career/development-output.ts`
- `apps/cli/src/commands/career/season-labs.ts`
- `apps/cli/src/commands/career.test.ts`
- `apps/cli/src/commands/ten-season-report/report-data.ts`
- `apps/cli/src/commands/ten-season-report.test.ts`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `docs/PROJECT_STATUS.md`

## What NOT To Implement

- No exact-potential web UI or scouting feature.
- No report-specific gameplay formula or mutation.
- No rendered explanation stored in domain/engine state.
- No unbounded per-player dump in the default report.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run packages/simulation-tools/src/long-run/player-evolution.test.ts packages/simulation-tools/src/long-run/youth-stability.test.ts packages/simulation-tools/src/long-run/career-long-runner.test.ts apps/cli/src/commands/simulate-season.test.ts apps/cli/src/commands/career.test.ts apps/cli/src/commands/ten-season-report.test.ts packages/i18n/src/labels.test.ts
pnpm --filter @game/simulation-tools run typecheck
pnpm --filter @game/cli run typecheck
pnpm --filter @game/i18n run typecheck
pnpm cli simulate-season --seed=phase75-report-a --player-generation-report
pnpm cli career --save=phase75-report-a --seed=phase75-report-a --new-world-preview
pnpm cli career --save=phase75-report-a --development-report
git diff --check
```

## Completion Criteria

- A failed trajectory can be traced to its owning policy from structured facts.
- Aggregate and representative reports cover every Phase 75 invariant.
- Normal game surfaces still do not expose exact hidden potential.
- Step 14 is the single next action.

## Adopted Solution

- Added developer-only trajectory diagnostics to the long-run player-evolution
  report: representative samples for ages `16`, `18`, `21`, `24`, `26`, `29`,
  `32`, `36`, and `40`, plus traceable checks for negative room, mature growth,
  physical floor, and potential-room compression.
- Extended the generated-player inspection report with current-to-potential
  room distributions by age band and age-26+ high-room warning counts.
- Extended the career development report with selected-club trajectory samples
  that expose growth, decline, and remaining ceiling room only in explicit CLI
  inspection output.
- Kept normal web/career surfaces unchanged and avoided any gameplay mutation
  or report-only formula.

## Verification Result

- Node 24.19.0 focused Step 13 tests PASS: `7` files / `116` tests.
- `@game/simulation-tools`, `@game/cli`, and `@game/i18n` typechecks PASS.
- `pnpm cli simulate-season --seed=phase75-report-a --player-generation-report`
  PASS with zero age-26+ high-room warnings.
- `pnpm cli career --save=phase75-report-a --seed=phase75-report-a
  --new-world-preview` PASS.
- `pnpm cli career --save=phase75-report-a --development-report` PASS and shows
  representative trajectory samples.

## Lesson Learned

The career development inspection now makes it visible that report-refresh
seasons without real fixture participation do not create monthly growth. Step
14 should run staged gates through simulations that produce real minutes when
judging long-term growth quality.
