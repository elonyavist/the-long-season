# Step 02 - Season-Anchored Expiry And Month-Precision Terms

## Status

Not started.

## Entry Gate

- Step 01 is Done, with the expiry distribution measured and the bands frozen.
- The inventory of expiry, term, and season-boundary owners is complete.

## Goal

Anchor every contract expiry to the season boundary and express the offered term
in months, so a winter signing can run to the end of the current season.

## User-Facing Reason

Contracts should end when football contracts end. Today they end on the
anniversary of the signature, so expiries never gather into a summer window and
the manager never faces the "final six months" decision at a moment when he
could act on it.

## What To Implement

- Give the codebase one season-boundary owner: a named function that answers
  "which date does the season containing this date end on". The existing readers
  - `next-season-calendar.ts` and the market-window close used in
  `ai-market-lifecycle.ts` - become consumers of it or are shown to already be
  it. Two definitions may not survive this step.
- Replace `contractEndDate(startsOn, durationYears)` with a computation that
  takes the offered term in months and returns the season boundary at or after
  that term. The returned `endsOn` is always a season boundary.
- Express the offered term as months in the domain type, the negotiation terms,
  the persisted columns, and the mapper. The floor is "to the end of the current
  season", which may be fewer than twelve months; the ceiling is `60` months.
  Update the three `duration_years` `CHECK` constraints accordingly.
- Convert `derivePreferredContractDurationYears` and its versioned
  `contractTermsPolicy.preferredDuration` block to months, and retune the
  preferred terms toward the frozen `18-30` month band. The retune is a content
  change against the Step 01 bands; it is not licence to move a band.
- Remove the `rng.nextInt(0, 121)` expiry scatter from senior-squad world
  generation. It exists to spread expiry dates, and the anchor now owns that
  concern. Generated contracts land on season boundaries with a distribution of
  remaining seasons, not of remaining days.
- Seed the free-agent pool at world generation, inside the band frozen in
  Step 01. A new career currently opens with an empty pool, because generation
  assigns every player to a club and a free agent is by definition unowned; the
  pool only fills at the first expiry. A world that targets `18-20%` but starts
  at `0%` opens in a state it will never return to, and the manager's first
  season is played in a market that does not resemble any later one. Generate
  the opening pool directly, with an age and quality distribution consistent
  with players who reached the end of a contract rather than a uniform sample of
  the population.
- Add a test asserting the opening free-agent share is inside the frozen band,
  so the steady-state gap cannot silently return.
- Update every presentation of contract length to months, including the web
  renewal form default and the market player dialog, so no surface still offers
  whole years.
- Advance the supported beta save and schema versions and delete incompatible
  saves through the canonical reset flow.
- Add tests for: a winter signing whose term ends at the current season's end; a
  term at the `60` month ceiling; a term whose month count falls between two
  boundaries and rounds to one of them by the stated rule; the absence of any
  expiry off a season boundary in a generated world; and round-trip persistence
  of a month-precision term.

## Clean-Code Requirements

- One season-boundary function, one offered-term unit. No parallel year-based
  path survives this step, not even behind a converter kept "for tests".
- Migrate every caller inside this step. Do not add an optional `durationMonths`
  beside `durationYears`.
- The rounding rule between a requested month count and the resulting boundary
  is stated once in code with JSDoc, and tested at both edges.
- Beta reset deletes compatibility code instead of adding migration branches.
- Remove fixtures and helpers that only existed to build whole-year terms.

## What NOT To Implement

- No change to `PlayerContract`'s stored shape: it already holds `startsOn` and
  `endsOn` as `GameDate` and stays day-precise.
- No AI signing-policy change. Step 03 owns it, and this step must not
  compensate for a warehouse it is about to make larger.
- No loan behaviour. Phase 82A owns loans and will consume this same anchor.
- No transfer-window, market-cadence, or fixture change.
- No band adjusted to match what this step produces.

## Expected Files

- `packages/domain/src/career/senior-squad.ts`
- `packages/domain/src/career/senior-squad.test.ts`
- `packages/domain/src/career/contract-negotiation.ts`
- `packages/domain/src/career/contract-negotiation.test.ts`
- `packages/domain/src/balance/player-economy-calibration.ts`
- `packages/domain/src/balance/player-economy-calibration.test.ts`
- `packages/content/src/balance/wage-finance-calibration.json`
- `packages/content/src/schemas/player-economy-calibration.schema.ts`
- `packages/content/src/generators/senior-squad-world.ts`
- `packages/content/src/generators/senior-squad-world.test.ts`
- `packages/engine/src/career/senior-squad-transfer.ts`
- `packages/engine/src/career/senior-squad-transfer.test.ts`
- `packages/engine/src/career/contract-negotiation-demand.ts`
- `packages/engine/src/career/contract-negotiation-demand.test.ts`
- `packages/engine/src/career/next-season-calendar.ts`
- `packages/engine/src/career/next-season-calendar.test.ts`
- `packages/engine/src/career/ai-contract-lifecycle.ts`
- `packages/engine/src/career/ai-contract-lifecycle.test.ts`
- `packages/storage/src/sqlite/sqlite-career-schema.ts`
- `packages/storage/src/sqlite/career-state-mapper.ts`
- `packages/storage/src/sqlite/career-state-mapper.test.ts`
- `packages/storage/src/career-storage.contract.test.ts`
- `apps/web/src/features/squad/contract-renewal-form.ts`
- `apps/web/src/features/squad/contract-renewal-form.test.ts`
- `apps/web/src/features/market/CareerMarketPlayerDialog.tsx`
- `packages/i18n/src/labels.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- this step document

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/domain/src/career/senior-squad.test.ts \
  packages/domain/src/career/contract-negotiation.test.ts \
  packages/domain/src/balance/player-economy-calibration.test.ts \
  packages/content/src/generators/senior-squad-world.test.ts \
  packages/engine/src/career/senior-squad-transfer.test.ts \
  packages/engine/src/career/contract-negotiation-demand.test.ts \
  packages/engine/src/career/next-season-calendar.test.ts \
  packages/engine/src/career/ai-contract-lifecycle.test.ts \
  packages/storage/src/sqlite/career-state-mapper.test.ts \
  packages/storage/src/career-storage.contract.test.ts \
  apps/web/src/features/squad/contract-renewal-form.test.ts
pnpm check
pnpm --filter @game/web run build
pnpm depcruise
git diff --check
graphify update .
```

## Definition Of Done

- One named season-boundary owner exists and every consumer reads it.
- Every contract expiry in a generated world and every contract signed in play
  lands on a season boundary; an absence check proves no expiry falls elsewhere.
- The offered term is months everywhere, with a season-end floor and a `60`
  month ceiling, and the three `CHECK` constraints match.
- A winter signing can be offered a sub-twelve-month term.
- The generation scatter is removed and no caller replaced it with its own.
- A newly generated world opens with a free-agent share inside the frozen band,
  proven by a test, so the manager's first season is played in the same market
  the world will keep.
- No whole-year term path, converter, or fixture remains.
- Incompatible beta saves are deleted and fresh careers work.
- Step 03 is the only next action, and this step makes no claim about market
  density on its own.
