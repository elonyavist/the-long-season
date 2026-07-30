# Phase 79D Exceptional Player And Prospect Economy Baseline

Date: 2026-07-29  
Status: Reproduced pre-change baseline for Step 01

## Reproduction Contract

- Repository base commit:
  `f2c7013d4b91fb0c9fcf185adca8384b6cdcb584`.
- Working-tree context: the uncommitted Phase 79A-79C implementation is the
  baseline under review; the base commit alone does not contain that work.
- Runtime: Node `v24.16.0`.
- Canonical composition owner:
  `createFakeDomesticWorld` in
  `packages/content/src/generators/domestic-world.ts`.
- Audit composition owner:
  `createPhase79DInitialWorldBaseline` in
  `apps/cli/src/commands/ten-season-report/report-data.ts`.
- Pure supplied-input diagnostic:
  `createPlayerGenerationEconomyAudit` in
  `packages/simulation-tools/src/player-generation-economy-audit.ts`.
- Seed prefix: `phase79d-prechange-baseline`.
- Seed form:
  `phase79d-prechange-baseline-world-${String(index).padStart(5, "0")}` for
  one-based indexes `1..100`.
- Worlds: exactly `100`.
- Included population: all `1,188` initial contracted senior players per
  world; initial academy players and free agents are excluded from this
  market-facing stock baseline.
- Total observations: `118,800`.
- Money: integer minor units, where `100` minor units are `EUR 1`.
- Stars: the career-stamped `player-rating-scale-v1` thresholds.
- Percentiles: Hyndman-Fan type 7 linear interpolation,
  `h=(n-1)p`, rounded to the nearest integer minor unit.

Focused command:

```bash
nvm use 24
pnpm exec vitest run \
  packages/simulation-tools/src/player-generation-economy-audit.test.ts \
  packages/simulation-tools/src/player-potential-outcome-audit.test.ts \
  apps/cli/src/commands/ten-season-report.test.ts
```

The CLI test named `Phase 79D reproduces the exact pre-change 100-world
exceptional-player baseline` is the committed reproduction entrypoint.

## Initial Senior Joint-Profile Findings

| Metric | Current 6-star | Potential 6-star |
| --- | ---: | ---: |
| Observations | 151 | 312 |
| Minimum age | 15 | 15 |
| Maximum age | 18 | 31 |
| Mean age | 16.29 | 17.90 |
| Public value P50 | €150.000.000 | €149.999.999,99 |
| Public value P90 | €150.000.000 | €150.000.000 |
| Public value P99 | €150.000.000 | €150.000.000 |
| Public value maximum | €150.000.000 | €150.000.000 |

Current-six archetypes:

- `rare_prodigy`: `151`;
- every current-six observation is therefore on the incompatible age-15-to-18
  prospect lane;
- `category_star`: `0`.

Potential-six archetypes:

- `rare_prodigy`: `262`;
- `category_star`: `49`;
- `veteran_drop_down`: `1`.

Allocation truth:

- allocated current-six: `151`;
- effective current-six: `151`;
- allocated potential-six: `262`;
- effective potential-six: `312`;
- unallocated effective potential-six: `50`.

Cap truth:

- exact hard-cap observations: `151`;
- eligible exact hard-cap observations: `151`;
- ineligible exact hard-cap observations: `0`;
- ineligible values that render as the same whole-euro `€150m` label: `84`.

These are descriptive failures. Step 01 changes no generator, rating,
valuation, negotiation, or UI behavior.

## Phase 79C Negotiation Baseline

The audit consumes the following committed aggregate as supplied facts from
`GLOBAL_PLAYER_RATING_AND_MARKET_ECONOMY_79C_10X10_REPORT.md`:

- offers: `23,718`;
- seller counters: `0`;
- permanent completions: `12,237`;
- asking-price distribution in minor units:
  `P50=146,668,271`, `P90=1,523,434,510`,
  `P99=3,140,116,475`, `max=11,736,102,461`;
- completed-fee distribution: exactly the same four figures.

This is evidence that the counter path was structurally unobserved, not
evidence that a zero-counter gate passed.

## Development-Outcome Matrix

`createPhase79DPotentialOutcomeBaseline` composes the existing engine owners:

- `developPlayersForSeason`;
- its production monthly participation policy;
- its stable derived realization stream;
- its production role-aware aging policy;
- `summarizePlayerDevelopmentAbilities`.

The simulation-tools audit contains no development formula. The CLI adapter
supplies:

- start ages `15..27` inclusive;
- outfield and goalkeeper templates;
- room bands `small=2`, `medium=5`, `large=10` role-ability points;
- monthly participation paths `low=60`, `typical=300`, `high=540` minutes;
- `5` stable realization streams per cell;
- outcomes through age `35`.

This produces `1,170` observations across `234` cells, with exactly `5`
observations in every cell. Each cell records type-7 P10/P50/P90 for peak role
ability, final role ability, remaining room, and realized-room share.

Representative large-room median peak realization shares:

| Start age | Role | Low | Typical | High |
| ---: | --- | ---: | ---: | ---: |
| 15 | Outfield | 3% | 19% | 20% |
| 15 | Goalkeeper | 2% | 11% | 15% |
| 18 | Outfield | 3% | 13% | 19% |
| 18 | Goalkeeper | 1% | 11% | 10% |
| 21 | Outfield | 1% | 4% | 6% |
| 21 | Goalkeeper | 2% | 5% | 10% |
| 24 | Outfield | 0% | 1% | 2% |
| 24 | Goalkeeper | 1% | 4% | 5% |
| 27 | Outfield | 0% | 0% | 0% |
| 27 | Goalkeeper | 0% | 1% | 1% |

These are game-engine outcome facts for later projection calibration. They are
not Transfermarkt probabilities and they do not claim that the lower public
estimate is guaranteed.

## Twelve-Defect Trace

| Verified defect | Step 01 trace |
| --- | --- |
| Current IDs also belong to potential allocation | allocated current/potential labels on every observation |
| Potential precedence selects the wrong archetype | current-six archetype counts |
| Current stars use the age-15-to-18 prodigy lane | current-six age distribution |
| Post-generation floors overwrite joint profiles | allocated-versus-effective counts and source trace |
| Potential premium is small relative to current quality | current/potential/value joint observations |
| Low-current elite-upside prospects can be cheap | potential-six age/current/value joint slice |
| Eligible young current sixes hit the clamp | eligible exact-cap count |
| One-cent-below values render as the cap | ineligible rendered-cap collision count |
| Natural profiles escape forced rarity budgets | unallocated effective-six counts |
| Annual allocator lacks complete composition | explicit source trace; Step 04 owns production wiring |
| Gates omit joint distribution | pure joint-profile report with positive counts |
| AI copies asking into offer | supplied Phase 79C offer/counter/fee aggregate |

## Scope Boundary

No browser-facing output contains exact numeric potential or development
abilities. The raw observations exist only inside deterministic offline tests
and audit composition. No raw Transfermarkt page, real-player row, scraper, or
runtime network dependency is committed.
