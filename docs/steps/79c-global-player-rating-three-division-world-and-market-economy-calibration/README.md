# Phase 79C - Global Player Rating, Three-Division World And Market Economy Calibration

## Status

Done. All fourteen ordered steps are complete.

Control has returned to Phase 79 Step 14. Phase 79C did not run, replace,
weaken, or claim its staged `750 x 50` gate and did not close the deferred
Phase 78 Step 15 obligations.

## Goal

Replace the current club-relative player language and compressed one-division
economy with one credible global football scale:

- absolute current and potential ratings from `1` to `6` in half-star steps;
- rare dark-orange sixth-star champions located at strong first-division clubs;
- a canonical fictional first/second/third-division career world;
- promotion and relegation across those canonical fictional competitions;
- source-calibrated public market values with a compressed `€150m` global cap;
- seller asking prices and final fees separate from public value;
- wages, budgets, willingness, and market AI recalibrated as one economy;
- exact current attributes formatted to one decimal and no fake scouting fog;
- bounded deterministic and browser evidence before any full long run.

The binding analysis and accepted product decisions are in:

`docs/audits/GLOBAL_PLAYER_RATING_AND_MARKET_ECONOMY_CALIBRATION_SPEC.md`

The minimal pyramid decision is in:

`docs/audits/DOMESTIC_COMPETITION_TOPOLOGY_DECISION.md`

## User-Facing Reason

A manager beginning in the third division must immediately understand the
difference between a good local starter, a second-division player, a
first-division regular, and a generational champion. The Market must make that
difference visible in quality, price, affordability, and willingness without
making every lower-division signing impossible.

## Entry Gate

- Phase 74 and Phase 75 canonical role-ability, generation, potential,
  development, and rarity foundations are complete.
- Phase 78 Steps 01-14 provide canonical contracts, senior squads, and club
  finance; its deferred Step 15 remains open.
- Phase 79 Steps 01-13 provide canonical windows, negotiations, transfer
  completion, AI market behavior, Market UI, and persistence.
- Phase 79A is Done with zero owned structural failure in its repeated
  `50 x 20`.
- Phase 79B is Done with shared Squad/Market stars, exact current attributes,
  three-tab inspectors, and browser evidence.
- Phase 79 Step 14 is Reopened. Its `750 x 50` is deliberately unrun and
  unclaimed.
- When the user explicitly starts Phase 79C, Step 01 becomes the sole active
  step and Phase 79 Step 14 is recorded as paused, not completed.

## Locked Evidence Contract

- The current Transfermarkt table is a preliminary dated aggregate snapshot,
  not executable calibration, a live dependency, or a real-player content pack.
- Observed market facts, derived metrics, and game-design choices must be
  labeled separately.
- Public source pages may change; committed calibration data changes only
  through a reviewed version bump.
- Transfermarkt is valid evidence for market values and its own market-value
  definition. It is not evidence for wages or club budgets.
- Step 01 must obtain and record a separate reproducible wage/finance source
  before Steps 12-13 change wage or budget numbers. Missing evidence blocks the
  phase rather than authorizing invented values.
- The preliminary market snapshot is not executable calibration until Step 01
  records exact pagination, inclusion, percentile, command, commit, seed, and
  Node-version provenance.

## Locked Product Decisions

### Global Rating

- One player has the same current and potential stars on every surface.
- Supported values are `1, 1.5, 2, ... 5.5, 6`.
- Accepted canonical role-ability boundaries are the table in the calibration
  specification.
- `5.5` is five gold stars plus one half dark-orange sixth star.
- `6` is five gold stars plus one full dark-orange sixth star.
- The sixth star is never danger red and is not represented by a separate
  persisted or public `elite` Boolean.
- Exact potential remains hidden.

### Division And Rarity

- The division ranges apply to first-team-ready seniors; youth and reserves may
  sit below them.
- Third-division first-team players are normally `1..3`, with sporadic `3.5`.
- Second-division first-team players are normally `2..3.5`, with sporadic `4`.
- First-division first-team players span `3..5.5`, with sporadic `6`.
- The initial complete world contains `1..2` current six-star players and
  `2..4` potential six-star players.
- Current six-star players belong to credible strong first-division clubs and
  first-team slots.
- At most one exceptional-potential player begins below the first division.
- Current quality and potential rarity remain separate budgets.
- Each annual world intake creates `0..1` potential-six player and a
  deterministic ten-season intake cohort creates `2..4`.
- Year-10 hard caps are `4` active current-six and `8` active potential-six
  players, with at most one lower-tier potential-six.

### Three-Division World

- The selected club starts in the third division.
- First-, second-, and third-division clubs are canonical fictional in-world
  clubs, not a synthetic Market pool.
- `fictional-three-tier-v1` has three ordered 18-club double-round-robin
  competitions and 34 matchdays per tier.
- First/Second exchange three clubs; Second/Third exchange two clubs.
- The Third Division lower boundary is closed and does not fake relegated or
  feeder clubs.
- Every club uses the same player, contract, finance, development, transfer,
  and persistence rules.
- Promotion/relegation changes canonical competition membership and regenerates
  coherent calendars, tables, histories, category facts, and transfer-window
  ownership.
- The simplified topology is explicit game design, not a claim that it
  reproduces the 20/20/60 Italian structure.

### Market Value, Asking Price And Fee

- Public market value is one deterministic global estimate based primarily on
  quality, potential, age, position, and calibrated market context.
- Weekly form does not modify public market value.
- Contract and seller circumstances primarily modify asking price or final fee.
- A free agent keeps a public value but has exactly zero transfer fee.
- Third-, second-, and first-division distributions are calibrated against the
  dated Italian median/P90/P99/maximum anchors in the specification.
- Values use progressive upper-tail compression above approximately `€80m`.
- `€150m` is a hard game maximum reserved for a full six-star player aged `25`
  or below; it is not a target for every six-star player.
- The economy must not be proportionally rescaled only to fit that maximum.

### Economy, AI And Presentation

- Values, asking prices, wages, transfer budgets, wage budgets, willingness,
  affordability, and AI targeting are recalibrated together.
- Wages are never inferred through a fixed market-value ratio.
- A third-division club can inspect elite first-division players but generally
  cannot afford or persuade them.
- Market current attributes remain exact for now and render with one decimal.
- No scouting UI or fake observation system is created.
- All browser rules flow through engine/domain and `@game/ui` read models; React
  does not duplicate rating, valuation, willingness, or fee formulas.
- Rating/value/asking/wage/market-behavior tuning lives in six
  schema-validated JSON content assets and is passed explicitly at app
  composition boundaries. Engine and simulation-tools have no content import
  or implicit production default.
- `GameMeta` is the single persisted owner of every topology/calibration
  version; career-world metadata, UI state, and competitions do not copy it.

## Ordered Steps

1. `01-versioned-source-baselines-and-diagnostic-contract.md`
2. `02-global-one-to-six-half-star-rating-and-attribute-presentation.md`
3. `03-division-generation-bands-and-world-rarity-budgets.md`
4. `04-multi-competition-career-state-and-persistence.md`
5. `05-multi-competition-calendar-and-fixture-traversal-foundation.md`
6. `06-canonical-three-division-content-world.md`
7. `07-cli-web-and-diagnostic-three-division-bootstrap.md`
8. `08-promotion-relegation-and-integrated-season-rollover.md`
9. `09-cross-division-market-population-and-sporting-willingness.md`
10. `10-source-calibrated-public-market-value-model.md`
11. `11-asking-price-transfer-fee-and-free-agent-semantics.md`
12. `12-source-backed-wage-and-contract-calibration.md`
13. `13-transfer-budgets-affordability-willingness-and-market-ai-calibration.md`
14. `14-short-calibration-visual-qa-cleanup-and-phase-report.md`

## Validation Ladder

- Steps 01-13 use focused tests, fixed fixtures, single-world samples,
  and deterministic distribution diagnostics.
- Step 14 alone owns the final bounded `10 worlds x 10 seasons` short run.
- No Phase 79C step runs `50 x 20`, `750 x 50`, or `10,000 x 50`.
- The Phase 79 release-scale gate remains unclaimed and must be re-evaluated
  after Phase 79C because the world size and economy will have changed.

## Mandatory Per-Step Loop

For every step:

- reread `docs/PROJECT_STATUS.md`, this README, the active step in full, and the
  binding constraints in
  `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`;
- modify only the active step's Expected Files plus
  `docs/PROJECT_STATUS.md` and an explicitly permitted next-step lesson;
- run the active step's exact checks and fix failures before advancing;
- mark the active step `Done` and record adopted solution, verification,
  blocker/lesson, and next action in `docs/PROJECT_STATUS.md`;
- keep all other Phase 79C steps `Not started` until they become active.

## Phase-Level Checks

```bash
nvm use 24
pnpm check
pnpm --filter @game/web run build
pnpm web:visual:qa
pnpm cli ten-season-report \
  --seed-prefix=phase79c-three-division-short \
  --worlds=10 \
  --seasons=10 \
  --report-output=docs/audits/GLOBAL_PLAYER_RATING_AND_MARKET_ECONOMY_79C_10X10_REPORT.md
git diff --check
graphify update .
```

The cohort command runs only in Step 14.

## What NOT To Implement

- No live Transfermarkt integration, scraper, raw page cache, real player, real
  club, badge, or trademark.
- No relative-to-club stars, redundant elite flag, exact numeric potential, or
  danger-red champion marker.
- No synthetic external Market pool or second market simulator.
- No wage or budget number inferred from Transfermarkt market values.
- No scouting staff, knowledge percentages, report expiry, observation
  missions, or hidden current attributes.
- No loans, installments, auctions, agents, bidding wars, work permits,
  registration quotas, player swaps, or sell-on-clause expansion.
- No national cup, continental competition, five-country world, or exact
  Italian third-tier playoff/playout implementation.
- No match simulation, goal, assist, table-spread, dynasty, or player-growth
  tuning outside facts directly required for multi-division integrity.
- No compatibility leftover without a tested migration need or explicit
  short-term removal step.
- No `50 x 20`, `750 x 50`, or `10,000 x 50` run.

## Definition Of Done

- The same player has the same global current and potential stars everywhere.
- Half-stars and the dark-orange sixth star render accessibly and exact current
  attributes use one decimal.
- Division generation and world rarity meet their explicit first-team and
  initial/intake/year-10 budgets without reserve-slot anomalies or inflation.
- A deterministic career begins in the third division while canonical first-
  and second-division clubs exist, evolve, trade, persist, and move between
  competitions.
- Promotion/relegation, calendars, tables, transfer windows, histories, and
  selected-club continuity remain coherent across season rollover.
- Market lists the canonical cross-division world with credible willingness and
  no fake scouting fog.
- Public value matches the versioned division distribution anchors, preserves
  a free agent's value, and uses a rare `€150m` young six-star ceiling.
- Asking price and final fee are distinct, explainable facts.
- Wages, contracts, budgets, affordability, and AI are backed by a separate
  recorded source and remain structurally solvent.
- Focused checks, browser QA, `pnpm check`, and the deterministic `10 x 10`
  short gate pass.
- The phase report records residual risks and returns to the appropriate Phase
  79 closeout step without claiming a full long run.

## Completion Evidence

- All Steps 01-14 are Done.
- The final report is
  `docs/audits/GLOBAL_PLAYER_RATING_AND_MARKET_ECONOMY_79C_REPORT.md`.
- The generated bounded report is
  `docs/audits/GLOBAL_PLAYER_RATING_AND_MARKET_ECONOMY_79C_10X10_REPORT.md`.
- `pnpm check` passes (`247` files / `1,532` tests); all workspace typechecks,
  lint, localized-text, and dependency boundaries pass.
- Web build passes and the complete current-product plus SQLite/OPFS browser
  gate passes `29/29`.
- The deterministic `10 x 10` passes with zero failed world, minimum squad
  `18`, zero contract/finance structural violation, zero year-ten rating-cap
  violation, `3,882` measured free-agent signings, and zero non-zero
  free-agent fee.
- The remaining monitor/story warnings are preserved in the reports. No
  threshold was relaxed and no seed exception was added.
- Phase 79 Step 14 is the only next active implementation path. Its staged
  `50 x 10`, `250 x 30`, and `750 x 50` sequence remains unrun against the
  Phase 79C world/economy.
