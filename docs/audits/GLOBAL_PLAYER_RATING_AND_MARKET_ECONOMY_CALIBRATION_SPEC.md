# Global Player Rating And Market Economy Calibration Specification

Date: 2026-07-28
Status: Accepted product contract; Phase 79C Step 01 provenance gates closed.

The executable aggregate snapshot, exact capture method, denominators,
pagination, normalization, percentiles, and pre-79C diagnostic provenance are
recorded in `PLAYER_MARKET_CALIBRATION_PROVENANCE_LEDGER.md`. Independent
wage/finance evidence and its limitations are recorded in
`WAGE_AND_CLUB_FINANCE_CALIBRATION_SOURCE_AUDIT.md`. The six versioned JSON
assets preserve observed facts, derived aggregates, and explicit game-design
targets as distinct classifications.

## Purpose

This document turns the player-rating and market-value review into a durable
implementation contract.

It separates three things that must not be conflated:

1. observed football-market evidence;
2. measured behavior of the current game;
3. explicit game-design decisions accepted for The Long Season.

The project must not ship real-player records, query Transfermarkt at runtime,
or silently change balance when a public page changes. Only dated aggregate
evidence may become a versioned calibration baseline.

## Executive Verdict

The current implementation is compressed in the wrong direction:

- third-division players are valued much too highly as a population;
- first-division players and world-class outliers are valued much too low;
- ordinary stars are relative to the selected club, so a good third-division
  player is presented with the same visual language as a global champion;
- the generated playable world contains only the current third division, so
  the Market cannot contain genuine second- or first-division players;
- contract duration and weekly form currently modify the same number presented
  as player value, even though market value, seller asking price, and final fee
  are different concepts.

The correction is therefore not a multiplier tweak. It requires one coordinated
phase covering:

- a global `1..6` half-star scale;
- division-aware current and potential generation;
- a canonical three-division fictional career world;
- a source-calibrated public market-value curve;
- a separate seller asking price and negotiated fee;
- wages, budgets, willingness, and AI affordability recalibrated together;
- focused and short-run diagnostics before any release-scale long run.

## Evidence Method And Limitations

### Sources

The preliminary market-value snapshot uses the public 2026/27 competition and
player-value pages inspected on 2026-07-28:

- [Serie C, Girone A market values](https://www.transfermarkt.it/serie-c-girone-a/marktwerte/wettbewerb/IT3A)
- [Serie C, Girone B market values](https://www.transfermarkt.it/serie-c-girone-b/marktwerte/wettbewerb/IT3B)
- [Serie C, Girone C market values](https://www.transfermarkt.it/serie-c/marktwerte/wettbewerb/IT3C)
- [Serie B market values](https://www.transfermarkt.it/serie-b/marktwerte/wettbewerb/IT2)
- [Serie A market values](https://www.transfermarkt.it/serie-a/marktwerte/wettbewerb/IT1)
- [Most valuable players worldwide](https://www.transfermarkt.it/spieler-statistik/wertvollstespieler/marktwertetop)
- [Transfermarkt market-value definition](https://www.transfermarkt.com/navigation/mwdefinition)

Transfermarkt pages change throughout a transfer window. Reopening a source may
therefore show a different roster count or aggregate. The implementation must
version a reproducible dated snapshot; it must not depend on the current live
page.

The preliminary analysis retained aggregate results but did not retain a
reproducibility ledger with the exact retrieval time, season-selector state,
pagination URLs, inclusion/exclusion policy, page counts, or percentile
interpolation method. It also did not retain the command, commit, seed prefix,
and Node version used for the current-game `100`-world comparison.

Those details must not be reconstructed from memory. Phase 79C Step 01 must:

- rerun the aggregate capture or independently reproduce it;
- record retrieval timestamp and time zone, season selector, every paginated
  source URL, row inclusion/exclusion rules, currency/unit normalization, and
  percentile method;
- record the current-game diagnostic command, repository commit, Node version,
  seed contract, world count, and category projection method;
- preserve only aggregate output and a reproducibility recipe, never raw pages
  or real-player rows;
- stop as Blocked if the preliminary figures cannot be reproduced closely
  enough to support the documented tolerances.

The preliminary figures below are retained as historical planning evidence.
Where live source rows changed during the transfer window, the reproduced
Step 01 ledger and versioned JSON are authoritative.

### Captured And Derived Italian Market Snapshot

`Players`, `Total value`, and `Maximum` are captured page/sample aggregates.
`Mean`, `Median`, `P90`, and `P99` are derived from the captured player-value
sample and must be recomputed under the Step 01 method.

| Competition sample | Captured players | Captured total value | Derived mean | Derived median | Derived P90 | Derived P99 | Captured maximum |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Third division, group A | 538 | €91.38m | €170k | €150k | €300k | €600k | €1.80m |
| Third division, group B | 593 | €119.17m | €201k | €150k | €400k | €1.215m | €3.50m |
| Third division, group C | 530 | €104.44m | €197k | €150k | €400k | €971k | €3.00m |
| Second division | 596 | €521.35m | €875k | €450k | €2.20m | €5.00m | €12.00m |
| First division | 653 | €5.65bn | €8.65m | €4.00m | €23.00m | €50.00m | €85.00m |

Derived aggregate facts from the three third-division groups:

- `60` clubs and `1,661` listed players;
- total player value approximately `€314.99m`;
- weighted player mean approximately `€189.6k`;
- average squad value approximately `€5.25m`.

The corresponding raw source-roster average squad values are approximately:

| Level | Average squad value |
| --- | ---: |
| Third division | €5.25m |
| Second division | €26.07m |
| First division | €282.50m |

Those squad totals use each source competition's complete listed rosters,
whereas the current game owns exactly `22` active seniors per club. They are
therefore context, not direct gameplay gates. Step 01 must record both
population denominators and derive a separately labeled `22`-senior normalized
comparator before Step 10 can test club-level squad-value distributions.
Per-player median/P90/P99 targets continue to use the complete included source
player sample under the recorded inclusion policy.

The means differ by approximately `4.61x` from third to second division and
`9.89x` from second to first division. The distributions overlap and have long
right tails. A rigid rule such as “every second-division player costs more than
every third-division player” would therefore be false.

At the worldwide top of the preliminary captured source, the leading public
values were above the requested game ceiling: Erling Haaland and Lamine Yamal
at `€220m`, Kylian Mbappé at `€200m`, and Michael Olise at `€170m`.

The Long Season's `€150m` maximum is consequently an explicit compression of
the extreme worldwide tail, not a claim about the real-world maximum.

### What Transfermarkt Says Market Value Means

The source definition establishes the following constraints:

- market value is not the fee actually paid;
- it is an expected medium-term value, not a price prediction;
- Transfermarkt does not use one algorithm;
- age, prospects, potential, performance, league level, reputation, demand,
  injuries, marketing, and broader market conditions contribute;
- contract and situational pressure can explain a difference between market
  value and transfer fee;
- a player whose contract expires can have a zero transfer fee while retaining
  a non-zero market value.

The game must model those distinctions with deterministic rules. It must not
pretend that its formula reproduces Transfermarkt's community process.

## Measured Current-Game Baseline

### Current Valuation Formula

The current engine uses:

```text
ability score = 0.70 × current ability + 0.30 × potential

value =
  €100,000
  × ability score
  × age multiplier
  × club-category multiplier
  × club-reputation multiplier
  × position multiplier
  × contract-security multiplier
  × weekly-form multiplier
```

The result is clamped to `€25k..€50m`.

This is nearly linear in player quality. It cannot simultaneously price a
credible third-division population and a world-class upper tail.

### Current Generated Value Distribution

Preliminarily measured over `100` deterministic generated worlds per projected
category. Step 01 must reproduce this table with the missing command/commit/seed
ledger before using it as a regression baseline:

| Category | Mean | Median | P90 | P99 | Maximum |
| --- | ---: | ---: | ---: | ---: | ---: |
| Third division | €1.76m | €1.74m | €2.37m | €2.88m | €4.08m |
| Second division projection | €3.03m | €3.01m | €4.08m | €4.90m | €6.43m |
| First division projection | €5.50m | €5.51m | €7.44m | €8.86m | €11.53m |

Compared with the observed snapshot:

- the third-division median is about `11.6x` too high;
- the second-division median is about `6.7x` too high;
- the first-division median is only modestly high, but its P90/P99/maximum tail
  is far too low;
- an idealized `20/20` young top-club player reaches only roughly `€15m` under
  ordinary inputs, so the current `€50m` cap is functionally unreachable.

### Current Public Stars

The current ordinary star formula is:

```text
stars = round_to_half(3 + player role ability - selected squad mean)
```

It is clamped to `1..5`. A separate Boolean marks ability `>=17` as elite.

Consequences:

- the same player can receive a different rating when the selected club
  changes;
- a good third-division player can receive five ordinary gold stars without
  being remotely world class;
- Market ratings describe distance from the user's squad rather than global
  football quality.

Across `100` current third-division worlds, among the top 20 Market players per
world, `99.56%` receive at least four stars and `80.19%` receive five stars,
while no player has current or potential ability `>=17`.

### Current World Topology

The production career world contains:

- `18` clubs;
- `22` senior players per club;
- one playable third-division competition;
- `374` Market targets, exactly the other `17 × 22` players.

First- and second-division generation bands exist only as projected inputs.
Those competitions and clubs are not instantiated in the playable world.

The exceptional generation lane also exists but is not assigned by a senior
producer. Rare players are preferentially allocated to reserve slots, which
can place the strongest outlier on the bench of an ordinary club rather than in
the starting group of a strong first-division club.

## Accepted Product Decisions

### 1. One Global Public Rating

- Current level and potential use one absolute, club-independent scale.
- The supported values are `1, 1.5, 2, 2.5, ... 5.5, 6`.
- The same player has the same current and potential stars in Squad, Market,
  lineup selection, and player detail.
- Potential remains shown only as stars. Its exact numeric value must not leak.
- The separate `elite` Boolean is removed; elite presentation is derived from
  a rating above five.

Accepted ability-to-star mapping:

| Canonical role ability | Public stars |
| ---: | ---: |
| `< 6.5` | 1 |
| `6.5 .. < 7.5` | 1.5 |
| `7.5 .. < 8.5` | 2 |
| `8.5 .. < 9.5` | 2.5 |
| `9.5 .. < 12.5` | 3 |
| `12.5 .. < 14.5` | 3.5 |
| `14.5 .. < 15.5` | 4 |
| `15.5 .. < 16.0` | 4.5 |
| `16.0 .. < 16.5` | 5 |
| `16.5 .. < 17.0` | 5.5 |
| `>= 17.0` | 6 |

These cutoffs are game-design decisions. They are not Transfermarkt facts.

### 2. Sixth-Star Presentation

- `5.5` renders five full gold stars plus one half-filled dark-orange sixth
  star.
- `6` renders five full gold stars plus one full dark-orange sixth star.
- The sixth star must be at least dark orange, never danger red.
- Accessible text states the complete rating; color is not the only signal.

### 3. Division Expectations

The requested ranges describe first-team-ready senior players, not every
registered player:

| Division | Normal first-team-ready range | Exceptional allowance |
| --- | --- | --- |
| Third | 1 to 3 stars | sporadic 3.5 current; a separately budgeted high-potential prospect |
| Second | 2 to 3.5 stars | sporadic 4 current |
| First | 3 to 5.5 stars | sporadic 6 current |

Youth and reserves may sit below the ordinary division range. Potential is
global, so a lower-division wonderkid may have much higher potential than
current level without already being first-division ready.

World-level rarity budgets:

- at least `1` and at most `2` current six-star players in the complete initial
  three-division world;
- `2..4` potential six-star players in that world;
- current six-star players belong to strong first-division clubs and credible
  first-team slots;
- at most one exceptional-potential player may begin below the first division;
- a rare player must not be allocated to a reserve slot merely because the
  current rarity helper prefers reserves.

These counts apply to the initial active world, not to every annual intake.
Phase 79C must separately version an annual world-level exceptional-intake
budget, prove that no single intake can flood the world, and report active
current/potential `5.5`/`6`-star stock at year `10`.

Accepted annual intake design:

- one complete world intake produces `0..1` new potential-six player;
- any deterministic ten-season intake cohort produces `2..4` such players;
- at most one active potential-six player may be below the first division at
  any time;
- the year-10 hard anti-inflation caps are `4` active current-six players and
  `8` active potential-six players;
- lower year-10 counts are reported as story/balance signals, not manufactured
  through forced growth or protected careers.

These are explicit game-design limits, not observed Transfermarkt facts.

### 4. Exact Current Attributes For Now

- Market continues to show exact current attributes without a scouting delay.
- Visible exact attributes use one digit after the decimal separator.
- Goalkeepers and outfield players retain their role-appropriate attribute
  groups.
- Exact potential remains hidden.
- A future scouting system may change knowledge presentation only through a
  separately documented phase; Phase 79C must not create fake fog or unused
  scout state.

### 5. A Canonical Three-Division Career World

- The playable country contains canonical first-, second-, and third-division
  clubs and players.
- The selected club still starts in the third division.
- Market targets come from those canonical fictional in-world clubs, not from
  a synthetic external-player pool.
- Every club uses the same ownership, contract, finance, transfer, generation,
  development, and persistence boundaries.
- Promotion and relegation move clubs between the canonical competitions and
  regenerate coherent calendars and tables.
- The accepted `fictional-three-tier-v1` topology has one `18`-club
  double-round-robin competition per tier (`34` matchdays each).
- First/second exchange three clubs automatically; second/third exchange two
  clubs automatically.
- The third-tier lower boundary is closed: its bottom clubs are not labeled
  relegated and no unsimulated feeder club is generated.
- The first-tier champion is the first-placed club. There are no playoffs,
  playouts, cups, or continental places in this phase.
- This is deliberately simplified game design that preserves the existing
  18-club prototype and a bounded three-times-larger world. It is not presented
  as the real Italian topology, which uses 20-club first/second tiers and a
  60-club, three-group third tier with postseason rules.
- The source/design comparison and exact movement contract live in
  `docs/audits/DOMESTIC_COMPETITION_TOPOLOGY_DECISION.md`.

### 6. Public Market Value

- Public market value is one global deterministic estimate.
- It is not relative to the observing club.
- Its primary inputs are global current quality, potential, age, position, and
  the calibrated football-market context.
- Weekly form does not modify public market value.
- Short contract duration, seller pressure, squad importance, and negotiation
  leverage do not materially rewrite public value.
- A free agent retains public market value.

Calibration targets are distributional:

| Level | Median target | P90 target | P99 target | Initial domestic maximum reference |
| --- | ---: | ---: | ---: | ---: |
| Third division | about €150k | €300k..€400k | €600k..€1.215m | about €3.5m |
| Second division | about €450k | about €2.2m | about €5m | about €12m |
| First division | about €4m | about €23m | about €50m | about €85m |

These are baseline anchors with tolerances to be locked by Step 01, not exact
per-player promises.

The worldwide upper tail uses progressive compression above approximately
`€80m` and a hard game cap of `€150m`. The cap is:

- reachable only by a full six-star player;
- reserved for a young player, defined as age `25` or below;
- not a target that every six-star player must reach;
- not implemented by proportionally shrinking every league value.

Players aged `26..29` may remain near the top through a progressive age curve
but should not reach the young-player ceiling easily. Later decline is
progressive rather than a cliff.

### 7. Asking Price And Final Fee

The system exposes three distinct facts:

1. public market value;
2. seller asking price;
3. final negotiated transfer fee.

Contract security, squad importance, seller replacement need, financial
pressure, player desire, buyer interest, and negotiation state influence
asking price or acceptance. They do not become hidden multipliers that change
the public value from one screen to another.

For a free agent:

- public market value may be non-zero;
- transfer fee is exactly zero;
- only supported wage, bonus, and signing costs are payable.

### 8. Economy And AI Must Move Together

Changing values alone would make the existing market unaffordable or trivial.
The phase must recalibrate together:

- initial transfer and wage budgets;
- cash headroom;
- generated contracts and wage demands;
- seller asking behavior;
- buyer affordability;
- player willingness;
- AI target quality and cross-division movement.

Transfermarkt market values are not wage evidence. Phase 79C Step 01 must
record a separate reproducible wage and club-finance source before changing
those numbers. If credible evidence is unavailable, the phase blocks rather
than inferring wages as a fixed percentage of value.

## Required Ownership

- Domain owns stable global rating and multi-competition facts, not tuning.
- Content owns schema-validated, versioned declarative calibration data,
  generation bands, rarity budgets, and fictional world composition.
- Engine owns pure public rating, valuation, asking-price, willingness,
  affordability, promotion/relegation, and transfer rules. Engine receives
  validated tuning explicitly and never imports content or keeps a second
  default.
- Storage persists canonical career facts without recomputing them from UI
  state.
- Simulation tools measure distributions and invariants without changing
  gameplay.
- `@game/ui` owns framework-free read models.
- Web renders those read models and does not duplicate formulas.

The six balance assets named by `requirements.md` are JSON content:

- `player-rating-scale.json`;
- `player-market-calibration.json`;
- `valuation-curves.json`;
- `asking-price-curves.json`;
- `market-behavior-calibration.json`;
- `wage-finance-calibration.json`.

Content validates them through one schema/loader boundary and exports typed,
immutable values. `player-market-calibration.json` remains observed aggregate
evidence; `market-behavior-calibration.json` owns reviewed game-design
coefficients for willingness, affordability, and AI targeting so they cannot
be hardcoded into engine or mixed into the source snapshot. Web and CLI
composition select the versions stamped in `GameMeta` and pass the required
values into engine entry points. `GameMeta` is the single persisted owner of
the topology/calibration version bundle; career-world metadata and UI must not
copy it. Content may use the same validated data for generation. Engine and
simulation-tools must not import content, duplicate coefficients, or keep an
implicit production default. An unsupported saved version fails explicitly
under the documented save/reset policy rather than silently adopting newer
tuning.

## Validation Strategy

Validation proceeds in increasing cost:

1. boundary and fixed-fixture unit tests;
2. deterministic same-seed distribution tests;
3. one-world three-division season and promotion/relegation smoke;
4. focused Market/finance workflows;
5. browser checks for Squad and Market;
6. a final `10 worlds × 10 seasons` short calibration run.

Phase 79C does not run or claim:

- the Phase 79 `50 × 20` diagnostic;
- the Phase 79 `750 × 50` closeout gate;
- any `10,000 × 50` release-scale run.

The larger Phase 79 gate must be reconsidered and rerun only after the new
three-division world and economy are stable. Existing pass/fail claims must not
be relabeled as evidence for the new model.

Required distribution diagnostics include:

- current and potential star histograms by division and first-team/reserve
  status;
- counts and locations of `5.5` and `6` star players;
- exceptional-intake counts plus active `5.5`/`6` stock at year `10`;
- player-value median, P90, P99, and maximum by division;
- squad-value distributions;
- public-value/asking-price/final-fee ratios;
- free-agent public value versus zero fee;
- transfer and wage budget distributions;
- wage utilization and hard overspend;
- cross-division transfer flow;
- promotion/relegation integrity and selected-club continuity.

## Explicit Non-Goals

- No runtime or build-time Transfermarkt client, scraper, or network
  dependency.
- No real player, real club, badge, trademark, or raw source dataset.
- No proportional rescaling of all values to force the `€150m` cap.
- No selected-club-relative stars or redundant elite flag.
- No scouting staff, fog percentages, observation missions, report expiry, or
  fake hidden current attributes.
- No loans, installments, auctions, agents, bidding wars, work permits, or
  registration quotas.
- No cups, continental competitions, five-country world, or real Italian
  third-tier playoff implementation in this bounded phase.
- No match-engine, scoring, table-strength, player-development, or dynasty
  tuning solely to make the economic report pass.
- No full long run during Phase 79C.

## Implementation Plan

The ordered implementation lives in:

`docs/steps/79c-global-player-rating-three-division-world-and-market-economy-calibration/`

It contains fourteen ordered atomic steps. The bounded topology rationale is
recorded in `docs/audits/DOMESTIC_COMPETITION_TOPOLOGY_DECISION.md`.

That phase is planned only. Phase 79 Step 14 remains the single active step
until the user explicitly activates Phase 79C.
