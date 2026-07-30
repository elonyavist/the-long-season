# Step 04 - Production Annual Intake Allocation And Longitudinal Caps

## Status

Done.

## Goal

Connect the existing world-level annual exceptional allocator exactly once to
every canonical career rollover composition path and make the ten-season rarity
contract observable rather than vacuously true.

## Expected Files

- `packages/content/src/generators/player-rarity-budget.ts`
- `packages/content/src/generators/player-rarity-budget.test.ts`
- `packages/content/src/generators/career-intake-players.ts`
- `packages/content/src/generators/career-intake-players.test.ts`
- `packages/content/src/generators/initial-youth-academies.ts`
- `packages/content/src/generators/initial-youth-academies.test.ts`
- `packages/engine/src/career/advance-career-season.ts`
- `packages/engine/src/career/advance-career-season.test.ts`
- `packages/engine/src/career/youth-intake.ts`
- `packages/engine/src/career/youth-intake.test.ts`
- `apps/cli/src/commands/career/season-labs.ts`
- `apps/cli/src/commands/career.test.ts`
- `apps/cli/src/commands/ten-season-report/report-data.ts`
- `apps/cli/src/commands/ten-season-report.test.ts`
- `apps/web/src/runtime/web-career-runtime.ts`
- `apps/web/src/runtime/web-career-runtime.test.ts`
- `packages/simulation-tools/src/player-generation-economy-audit.ts`
- `packages/simulation-tools/src/player-generation-economy-audit.test.ts`
- `docs/steps/79d-exceptional-player-generation-prospect-economy-and-non-vacuous-diagnostics/04-production-annual-intake-allocation-and-longitudinal-caps.md`
- `docs/PROJECT_STATUS.md`
- the next relevant step document only if a lesson changes future work

## Implementation Checklist

- Keep engine content-agnostic: annual allocation and player generation remain
  adapter/content responsibilities supplied through the existing candidate
  provider seams.
- Build one deterministic world-level candidate catalog per annual intake after
  academy lifecycle establishes the actual open slots.
- Call `buildAnnualWorldIntakeExceptionalAllocation` once per world season, not
  once per club, academy, senior pool, or report.
- Thread the selected potential-six IDs into the actual generated candidates
  accepted by the canonical youth/senior intake path.
- Do not count a skipped/full-academy candidate as a created exceptional
  player. Allocation, generated, accepted, and active counts must remain
  distinct.
- Wire normal CLI rollover, web rollover, career labs, and ten-season
  diagnostics through one shared content-side composition helper where
  practical.
- Preserve:
  - `0..1` accepted new internal potential-ceiling-six player per world season;
  - `2..4` accepted across each deterministic ten-season cohort;
  - year-10 active maximum `4` current-six and `8`
    potential-ceiling-six;
  - at most one active lower-tier potential-ceiling-six.
- Prove a positive exceptional-intake observation count across a deterministic
  ten-season cohort.
- Remove any now-unused optional forcing route or duplicate adapter loop.

## What NOT To Implement

- No engine import from content.
- No per-club application of the world rarity budget.
- No intake candidate retained only to make a diagnostic count non-zero.
- No valuation, asking-price, UI, scouting, or unrelated youth-feature change.
- No full long run.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/content/src/generators/player-rarity-budget.test.ts \
  packages/content/src/generators/career-intake-players.test.ts \
  packages/content/src/generators/initial-youth-academies.test.ts \
  packages/engine/src/career/advance-career-season.test.ts \
  packages/engine/src/career/youth-intake.test.ts \
  packages/simulation-tools/src/player-generation-economy-audit.test.ts \
  apps/cli/src/commands/career.test.ts \
  apps/cli/src/commands/ten-season-report.test.ts \
  apps/web/src/runtime/web-career-runtime.test.ts
pnpm --filter @game/content run typecheck
pnpm --filter @game/engine run typecheck
pnpm --filter @game/simulation-tools run typecheck
pnpm --filter @game/cli run typecheck
pnpm --filter @game/web run typecheck
pnpm depcruise
git diff --check
```

## Definition Of Done

- CLI, web, labs, and diagnostics compose the same annual exceptional policy.
- One world season cannot apply the allocation more than once.
- The deterministic ten-season test observes and accepts `2..4` exceptional
  potential players with no season above one.
- Year-10 active caps are measured after lifecycle changes.
- Zero generated/accepted observations cannot be reported as a successful
  intake proof.
