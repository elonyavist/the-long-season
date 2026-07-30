# Step 08 - Promotion, Relegation And Integrated Season Rollover

## Status

Done.

## Goal

Advance all three competitions through one atomic season boundary, archive
their results, apply `fictional-three-tier-v1` movement, and build every next
season calendar/window without losing club or selected-manager continuity.

## Expected Files

- `packages/domain/src/career/competition-world.ts`
- `packages/domain/src/career/competition-world.test.ts`
- `packages/domain/src/state/career-state.ts`
- `packages/domain/src/state/career-state.test.ts`
- `packages/engine/src/career/promotion-relegation.ts`
- `packages/engine/src/career/promotion-relegation.test.ts`
- `packages/engine/src/career/season-completion.ts`
- `packages/engine/src/career/season-completion.test.ts`
- `packages/engine/src/career/next-season-calendar.ts`
- `packages/engine/src/career/next-season-calendar.test.ts`
- `packages/engine/src/career/advance-career-season.ts`
- `packages/engine/src/career/advance-career-season.test.ts`
- `packages/engine/src/career/progress-fixture.ts`
- `packages/engine/src/career/progress-fixture.test.ts`
- `packages/engine/src/index.ts`
- `packages/content/src/generators/transfer-window-catalog.ts`
- `packages/content/src/generators/transfer-window-catalog.test.ts`
- `apps/cli/src/commands/career/progression.ts`
- `apps/cli/src/commands/career/season-labs.ts`
- `apps/cli/src/commands/career/season-rollover-output.ts`
- `apps/cli/src/commands/career.test.ts`
- `apps/web/src/runtime/web-career-runtime.ts`
- `apps/web/src/runtime/web-career-runtime.test.ts`
- `apps/web/src/features/market/market-transfer-windows.ts`
- `apps/web/src/features/market/market-transfer-windows.test.ts`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `packages/storage/src/json-career-storage.test.ts`
- `packages/storage/src/sqlite/sqlite-career-storage.test.ts`
- `docs/steps/79c-global-player-rating-three-division-world-and-market-economy-calibration/08-promotion-relegation-and-integrated-season-rollover.md`
- `docs/PROJECT_STATUS.md`
- the next relevant step document only if a lesson changes future work

## Implementation Checklist

- Complete and archive each competition's fixtures/table independently.
- Apply canonical deterministic tie-breakers before selecting movement rows.
- Move exactly:
  - bottom three First Division clubs to Second and top three Second clubs to
    First;
  - bottom two Second Division clubs to Third and top two Third clubs to Second.
- Do not label or move the bottom Third Division clubs.
- Apply both adjacent exchanges from the same pre-movement tables so Second
  Division cannot use already-mutated membership.
- Preserve club IDs, players, contracts, finance, histories, and selected-club
  identity.
- Update one canonical membership owner and the category/reputation facts
  explicitly owned by the rollover policy.
- Archive champion, final tier/position, promotion, and relegation facts without
  rendering localized prose in engine/domain.
- Replace the current `multiple_current_season_competitions` rejection in
  `next-season-calendar` with ordered per-competition generation.
- Generate all next-season calendars with globally unique IDs and all
  source-backed transfer windows.
- Make selected-club Continue, fixture progression, and Market window selection
  follow post-movement membership.
- Publish the full boundary atomically and idempotently; no partial membership,
  history, calendar, or window update may escape on failure.
- Round-trip promoted selected-club and relegated AI-club fixtures through JSON
  and SQLite/OPFS.
- Add fixed one- and two-season smoke tests for upward/downward movement and
  stable repeated hashes.

## What NOT To Implement

- No playoff/playout, fourth-tier feeder, cup, continental qualification,
  facilities requirement, parachute payment, board objective, or celebration.
- No value, wage, budget, willingness, or AI market tuning.
- No user override, club clone/ID change, or history reconstructed from labels.
- No multi-world cohort.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/domain/src/career/competition-world.test.ts \
  packages/domain/src/state/career-state.test.ts \
  packages/engine/src/career/promotion-relegation.test.ts \
  packages/engine/src/career/season-completion.test.ts \
  packages/engine/src/career/next-season-calendar.test.ts \
  packages/engine/src/career/advance-career-season.test.ts \
  packages/engine/src/career/progress-fixture.test.ts \
  packages/content/src/generators/transfer-window-catalog.test.ts \
  apps/cli/src/commands/career.test.ts \
  packages/storage/src/json-career-storage.test.ts \
  packages/storage/src/sqlite/sqlite-career-storage.test.ts
pnpm --filter @game/i18n run test
pnpm --filter @game/web run test
pnpm --filter @game/engine run typecheck
pnpm --filter @game/cli run typecheck
pnpm --filter @game/web run typecheck
pnpm depcruise
git diff --check
```

## Definition Of Done

- Every tier completes, archives, exchanges the exact clubs, and receives a
  complete next calendar/window.
- Third Division has a truthful closed lower boundary.
- Selected club can move without identity/state loss.
- The multi-competition next-season rejection is gone.
- JSON and SQLite/OPFS preserve the atomic result.
- No advanced pyramid rule or economic tuning was introduced.
