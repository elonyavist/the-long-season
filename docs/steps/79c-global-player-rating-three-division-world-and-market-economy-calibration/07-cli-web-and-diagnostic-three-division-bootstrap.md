# Step 07 - CLI, Web And Diagnostic Three-Division Bootstrap

## Status

Done.

## Goal

Switch new CLI/web careers and career-scale diagnostics to the canonical
three-division world, generate all three initial calendars, and start the
selected club in Third Division without changing season movement or the Market
read model yet.

## Expected Files

- `apps/cli/src/commands/career.ts`
- `apps/cli/src/commands/career.test.ts`
- `apps/cli/src/commands/career/scenarios.ts`
- `apps/cli/src/commands/career/types.ts`
- `apps/cli/src/commands/career/progression.ts`
- `apps/cli/src/commands/career/dashboard-output.ts`
- `apps/cli/src/commands/career/overview-output.ts`
- `apps/cli/src/commands/career/market-output.ts`
- `apps/cli/src/commands/career/season-labs.ts`
- `apps/cli/src/commands/ten-season-report.ts`
- `apps/cli/src/commands/ten-season-report.test.ts`
- `apps/cli/src/commands/ten-season-report/report-data.ts`
- `apps/cli/src/commands/ten-season-report/single-world-output.ts`
- `apps/web/src/runtime/web-career-runtime.ts`
- `apps/web/src/runtime/web-career-runtime.test.ts`
- `apps/web/src/features/matchday/matchday-adapter.ts`
- `apps/web/src/features/matchday/matchday-adapter.test.ts`
- `apps/web/src/features/inbox/career-inbox-presenter.ts`
- `apps/web/src/features/inbox/career-inbox-presenter.test.ts`
- `apps/web/src/features/market/market-transfer-windows.ts`
- `apps/web/src/features/market/market-transfer-windows.test.ts`
- `docs/steps/79c-global-player-rating-three-division-world-and-market-economy-calibration/07-cli-web-and-diagnostic-three-division-bootstrap.md`
- `docs/PROJECT_STATUS.md`
- the next relevant step document only if a lesson changes future work

## Implementation Checklist

- Compose `createFakeDomesticWorld` with Step 05 engine calendar generation in
  CLI and web; neither package may duplicate content or calendar rules.
- Generate one globally non-colliding fixture set per ordered competition.
- Persist the complete competition registry, memberships, fixtures, transfer
  windows, and the single Step 04 version bundle on `GameMeta` in every new
  career.
- Resolve/validate the versions stamped in `GameMeta` during load/bootstrap.
  Reject an unsupported version explicitly instead of silently choosing
  current data or copying the bundle into career-world/UI metadata.
- Select the managed club through an explicit deterministic Third Division
  policy, not the first world club/object key.
- Derive the selected club's current competition and match rules from canonical
  membership.
- Replace career-only `FakeLeagueSystem` type aliases with domain/career-world
  facts.
- Migrate CLI career overview, dashboard, Market output, progression, labs, and
  tests that assume one competition.
- Migrate web runtime and matchday config lookup without recreating a world in
  feature adapters.
- Make transfer-window resolution select the managed club's actual competition;
  do not choose the first current-season fixture.
- Make ten-season report setup use the real three-division career world. The
  final `10 x 10` is still forbidden until Step 14.
- Preserve the focused single-competition `simulate-season` fixture and its
  active CLI diagnostics; it is not a production career bootstrap.
- Prove same-seed CLI and web world hashes agree on canonical identity/order.

## What NOT To Implement

- No promotion/relegation or next-season membership change.
- No cross-division Market population/filter, valuation, asking price, wage,
  budget, willingness, or AI tuning.
- No parallel one-league career builder, derived membership persisted as a
  second truth, or feature-level world regeneration.
- No changes to focused single-competition simulation commands unless required
  to consume the shared gameplay config without duplication.
- No multi-world cohort.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  apps/cli/src/commands/career.test.ts \
  apps/cli/src/commands/ten-season-report.test.ts
pnpm --filter @game/web run test
pnpm --filter @game/cli run typecheck
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run build
pnpm depcruise
git diff --check
```

## Definition Of Done

- New CLI and web careers contain three ordered 18-club competitions and three
  complete non-colliding calendars.
- The selected club starts in Third Division and every current-competition
  query derives from membership.
- The exact content/topology version bundle survives creation and load through
  its single `GameMeta` owner.
- Career diagnostics start from the same world; no final cohort ran.
- The old single-league facade has no production career caller.
