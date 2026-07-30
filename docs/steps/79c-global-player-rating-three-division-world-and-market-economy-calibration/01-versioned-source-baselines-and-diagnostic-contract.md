# Step 01 - Versioned Source Baselines And Diagnostic Contract

## Status

Done.

## Goal

Close the provenance and product-decision gates, convert the accepted evidence
into schema-validated versioned JSON content, and build a read-only diagnostic
contract without changing gameplay.

## Locked Design Inputs

- `fictional-three-tier-v1`: one 18-club competition per tier; `3` automatic
  movements between First/Second, `2` between Second/Third, and a closed
  third-tier lower boundary.
- Annual exceptional intake: `0..1` potential-six player per world intake and
  `2..4` across a deterministic ten-season cohort.
- Year-10 anti-inflation caps: at most `4` active current-six and `8` active
  potential-six players, with at most one active lower-tier potential-six.

These are explicit game-design decisions, not claims about the real Italian
format. Their rationale is recorded in the topology decision and calibration
specification.

## Expected Files

- `docs/audits/GLOBAL_PLAYER_RATING_AND_MARKET_ECONOMY_CALIBRATION_SPEC.md`
- `docs/audits/PLAYER_MARKET_CALIBRATION_PROVENANCE_LEDGER.md`
- `docs/audits/WAGE_AND_CLUB_FINANCE_CALIBRATION_SOURCE_AUDIT.md`
- `docs/audits/DOMESTIC_COMPETITION_TOPOLOGY_DECISION.md`
- `docs/audits/TRANSFER_WINDOW_SOURCE_AUDIT.md`
- `packages/domain/src/value-objects/player-star-rating.ts`
- `packages/domain/src/value-objects/player-star-rating.test.ts`
- `packages/domain/src/balance/player-economy-calibration.ts`
- `packages/domain/src/balance/player-economy-calibration.test.ts`
- `packages/domain/src/balance/index.ts`
- `packages/domain/src/index.ts`
- `packages/content/src/balance/player-rating-scale.json`
- `packages/content/src/balance/player-market-calibration.json`
- `packages/content/src/balance/valuation-curves.json`
- `packages/content/src/balance/asking-price-curves.json`
- `packages/content/src/balance/market-behavior-calibration.json`
- `packages/content/src/balance/wage-finance-calibration.json`
- `packages/content/src/balance/player-economy-calibration.ts`
- `packages/content/src/balance/player-economy-calibration.test.ts`
- `packages/content/src/schemas/player-economy-calibration.schema.ts`
- `packages/content/src/schemas/player-economy-calibration.schema.test.ts`
- `packages/content/src/index.ts`
- `packages/content/package.json`
- `packages/content/tsconfig.json`
- `pnpm-lock.yaml`
- `packages/simulation-tools/src/player-market-calibration-report.ts`
- `packages/simulation-tools/src/player-market-calibration-report.test.ts`
- `packages/simulation-tools/src/index.ts`
- `docs/steps/79c-global-player-rating-three-division-world-and-market-economy-calibration/01-versioned-source-baselines-and-diagnostic-contract.md`
- `docs/PROJECT_STATUS.md`
- the next relevant step document only if evidence changes its scope

## Implementation Checklist

- Reproduce the dated player-market snapshot before treating its values as
  executable targets.
- Record retrieval timestamp/time zone, season selector, every paginated URL,
  page count, row inclusion/exclusion rules, currency/unit normalization, and
  percentile/interpolation method.
- Record the source player count and club/roster-size denominator separately.
  Keep raw source squad totals labeled as such and derive a separately labeled
  comparator normalized to the canonical `22` active seniors per game club.
- Reproduce the current-game comparison and record repository commit, Node
  version, command, seed prefix, world count, and category projection method.
- Label every stored field as:
  - observed source fact;
  - derived aggregate;
  - explicit game-design target.
- Preserve aggregate data and a reproducibility recipe only. Do not commit raw
  pages or real-player rows.
- Research and cite a reproducible non-Transfermarkt wage/payroll/club-finance
  source by division. Transfermarkt player values are not wage evidence.
- If the market snapshot or wage/finance source cannot be reproduced, block the
  step rather than entering placeholder values.
- Encode the accepted minimal fictional topology and its relation to the real
  source structure.
- Update the transfer-window audit with one cited row for every competition
  that the confirmed topology makes playable.
- Put the closed `1..6` half-step value, calibration-version bundle, and stable
  readonly config shapes in domain. Do not put coefficients or source numbers
  there.
- Store all six binding balance assets as JSON named by `requirements.md`.
- Add one Valibot or Zod schema/loader boundary in content. If a validation
  dependency is needed, install it with pnpm under Node 24 and record the
  package/lock changes.
- Configure `packages/content/tsconfig.json` to typecheck imported JSON
  (`resolveJsonModule` plus the balance JSON include) and prove the same loader
  works under Node 24 through the Vitest/Vite transform. App wiring remains
  outside this step.
- Reject unknown keys, duplicate thresholds, non-monotonic bands, invalid
  money, invalid percentile order, inconsistent versions, and incomplete
  division coverage.
- Encode separate versions for rating scale, player-market snapshot, valuation
  curves, asking-price curves, market-behavior calibration, and wage/finance
  calibration.
- Include distinct initial-world and annual-intake rarity contracts; do not
  apply the initial `2..4` potential-six count to every intake.
- Lock distribution tolerances that accommodate seeded fictional variance but
  still fail the measured current model.
- Treat valuation/asking/wage/market-behavior coefficients as reviewed design
  data. Keep the market-behavior asset explicitly separate from observed
  player-value evidence; export typed immutable values but do not wire them
  into production behavior.
- Add a pure diagnostic that accepts supplied populations/configs and reports
  versions, sample metadata, percentiles, rarity, and source labels without
  importing content into engine or simulation-tools.

## What NOT To Implement

- No rating calculation, generation change, world bootstrap, calendar,
  valuation, asking-price, wage, budget, AI, UI, or persistence behavior.
- No live client, scraper, HTML parser, raw source cache, scheduled refresh, or
  real-player dataset.
- No executable TypeScript constants as a substitute for the six required JSON
  assets.
- No engine or simulation-tools import from content.
- No hidden club-count, movement, intake, wage, or tolerance assumption.
- No target loosening because the current implementation fails it.
- No simulation cohort beyond focused diagnostic fixtures.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/domain/src/value-objects/player-star-rating.test.ts \
  packages/domain/src/balance/player-economy-calibration.test.ts \
  packages/content/src/schemas/player-economy-calibration.schema.test.ts \
  packages/content/src/balance/player-economy-calibration.test.ts \
  packages/simulation-tools/src/player-market-calibration-report.test.ts
pnpm --filter @game/domain run typecheck
pnpm --filter @game/content run typecheck
pnpm --filter @game/simulation-tools run typecheck
pnpm --filter @game/web run build
pnpm depcruise
git diff --check
```

## Definition Of Done

- Market and wage/finance baselines are reproducible, source-traceable, and
  independently versioned, or the step is honestly Blocked.
- Captured, derived, and game-design fields cannot be confused.
- The accepted fictional topology and annual rarity policy are explicit.
- All six JSON assets validate and typecheck through one typed content
  boundary under Node 24, the Vitest/Vite transform, and the web production
  build.
- Stable domain config/version contracts contain no tuning values.
- Diagnostics report the required versions and distributions without changing
  gameplay.
- No production behavior changed.
