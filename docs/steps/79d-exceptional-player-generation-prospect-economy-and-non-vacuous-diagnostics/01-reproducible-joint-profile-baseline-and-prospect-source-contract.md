# Step 01 - Reproducible Joint-Profile Baseline And Prospect Source Contract

## Status

Done.

## Goal

Turn the post-79C screenshots, code audit, independent verification, one-off
`100`-world measurement, and existing development mechanics into reproducible
supplied-input diagnostics plus a versionable evidence contract before changing
generation, public projection, or valuation.

## Expected Files

- `docs/audits/EXCEPTIONAL_PLAYER_GENERATION_AND_PROSPECT_ECONOMY_79D_SPEC.md`
- `docs/audits/EXCEPTIONAL_PLAYER_GENERATION_AND_PROSPECT_ECONOMY_79D_BASELINE.md`
- `docs/audits/PLAYER_MARKET_CALIBRATION_PROVENANCE_LEDGER.md`
- `docs/audits/README.md`
- `packages/simulation-tools/src/player-generation-economy-audit.ts`
- `packages/simulation-tools/src/player-generation-economy-audit.test.ts`
- `packages/simulation-tools/src/player-potential-outcome-audit.ts`
- `packages/simulation-tools/src/player-potential-outcome-audit.test.ts`
- `packages/simulation-tools/src/index.ts`
- `apps/cli/src/commands/ten-season-report/report-data.ts`
- `apps/cli/src/commands/ten-season-report.test.ts`
- `apps/cli/src/commands/ten-season-report/single-world-output.ts`
- `docs/steps/79d-exceptional-player-generation-prospect-economy-and-non-vacuous-diagnostics/01-reproducible-joint-profile-baseline-and-prospect-source-contract.md`
- `docs/PROJECT_STATUS.md`
- the next relevant step document only if a lesson changes future work

## Implementation Checklist

- Reproduce the current initial-world behavior over exactly `100` deterministic
  seeds using the canonical three-division generator.
- Record command, commit, Node version, seed-prefix contract, world count,
  population inclusion, money units, star thresholds, and percentile method.
- Add a pure simulation-tools diagnostic over caller-supplied observations with
  at least:
  - player ID, age, division, squad population, current rating, potential
    rating, public value, asking price, offered/counter/agreed/completed fee,
    negotiation outcome, exceptional allocation labels, and actual archetype;
  - current-six and potential-six joint age/value distributions;
  - forced allocation counts versus effective rating counts;
  - exact cap-hit counts and eligibility;
  - values that render at the exact cap despite being non-eligible;
  - offered/asking and completed/asking ratios, exact asking/completed equality
    count/share, seller outcome counts, and completed-after-counter count;
  - observation counts for every slice.
- Reproduce the Phase 79C negotiation baseline from committed supplied facts:
  `23,718` offers, zero seller counters, `12,237` permanent completions, and
  identical asking/completed P50/P90/P99/maximum.
- Add a reproducible deterministic development-outcome matrix for public-range
  calibration:
  - cover ages `15..27`, outfield and goalkeeper roles, several canonical
    current-to-ceiling rooms, and low/typical/high participation paths;
  - compose the existing development and aging owners from CLI/test adapters;
    do not duplicate their formulas in simulation-tools;
  - sample stable derived realization streams and record observation counts,
    peak role ability, final role ability, remaining room, and outcome
    quantiles by age/role/room/participation band;
  - keep individual internal numeric potential out of browser-facing output.
- Keep the diagnostic descriptive in this step. It may report the known
  failures but must not weaken the current suite or change gameplay.
- Extend the existing dated market provenance with a reproducible aggregate
  youth/prospect evidence method sufficient to calibrate value factors:
  - retain aggregates and methodology only;
  - do not commit real-player rows or raw pages;
  - separate observed facts, derived metrics, and game-design decisions;
  - stop as Blocked if the required source sample cannot be reproduced.
- Record explicitly that Transfermarkt does not provide game star ratings and
  that mapping market evidence to game potential or probability remains a
  labeled design model. Public-range realization factors must come from the
  deterministic game-outcome matrix, not be attributed to Transfermarkt.

## What NOT To Implement

- No generation, archetype, rarity, development, public projection, valuation,
  asking-price, AI, or browser behavior change.
- No guessed realization percentage.
- No live source dependency, scraper, raw cache, or real-player content.
- No failing repository test left behind merely to demonstrate the baseline.
- No long-run cohort.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/simulation-tools/src/player-generation-economy-audit.test.ts \
  packages/simulation-tools/src/player-potential-outcome-audit.test.ts \
  apps/cli/src/commands/ten-season-report.test.ts
pnpm --filter @game/simulation-tools run typecheck
pnpm --filter @game/cli run typecheck
pnpm depcruise
git diff --check
```

## Definition Of Done

- The `100`-world baseline is reproducible from committed instructions.
- Every one of the twelve verified implementation defects has a structured
  metric or explicit source-to-code trace.
- The development-outcome matrix is reproducible, non-vacuous, role-aware, and
  sufficient to calibrate conservative/expected range factors without changing
  gameplay.
- The prospect source extension is reproducible and clearly separates observed
  monetary evidence from the game-derived realization curve.
- Same-input diagnostic output is deterministic and mutation-free.
- No gameplay behavior changed.
