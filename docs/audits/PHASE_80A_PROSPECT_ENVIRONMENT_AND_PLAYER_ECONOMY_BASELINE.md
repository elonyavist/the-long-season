# Phase 80A Prospect, Environment And Player-Economy Baseline

- Date: 2026-07-31
- Runtime: Node `v24.19.0`
- Repository HEAD: `fca60a2b8cd63f7999483c3aa84abcb4176e282a`
- Pre-change behaviour-owner diff SHA-256:
  `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`
  (the empty digest; only Step 01 diagnostics/documentation were being added)
- Status: accepted pre-change evidence and calibration contract for Phase 80A;
  amended before reopened Steps 05, 06, 08, and 09 implementation on
  2026-08-01

## Evidence Boundary

This audit freezes the current player-supply, club-context, development,
public-projection, intrinsic-value, and AI-information paths before Phase 80A
changes behaviour. It distinguishes:

1. historical observations whose original seeds were not retained;
2. the new replayable pre-change sample;
3. source-derived market aggregates;
4. product thresholds fixed before any Phase 80A tuning.

The Step 01 diagnostic additions do not change generation, development,
projection, valuation, AI, persistence, or UI behaviour. No `50 x 20` ran.

## Reopened Evidence Boundary

The first canonical Step 09 `20 x 2` run and follow-up product screenshots are
post-change defect-discovery evidence. They do not replace the reproducible
pre-change sample above and they do not authorize rewriting its hashes.

The reopened evidence establishes four separate facts:

1. the three-band React renderer presents the assessment it receives and is
   not the owner of the missing young-player room;
2. generation has no joint-profile invariant guaranteeing meaningful stored
   room for an explicitly authored young prospect;
3. the public upper keeps one factor for ages `21..24`, producing a sharp
   `20 -> 21` boundary followed by a flat older band;
4. the v4 valuation uncertainty multiplier can make a better public upper
   reduce intrinsic value at equal current and P50.

The calibration audit also exposed a date-alignment defect before the reopened
factors were frozen: a matrix player starts on 1 August while the first loop
used January-to-December rows from that year, so seven rows were evaluated at
`startAge - 1`. Reopened Step 05 must align the twelve monthly rows to the
starting civil month and rerun the deterministic matrix before recording any
exact-age P50/P90 factor.

The matrix also previously cloned the first non-goalkeeper for every outfield
stream. That template is a full-back, while the development policy retains a
midfielder-only positive branch at age `26`. Reopened Step 05 therefore freezes
the existing five-stream cost as two defenders, two midfielders, and one
attacker. This representative 4-4-2 mix is declared before the new quantiles
are recorded and prevents generated array order from selecting the policy.

The individual screenshots are examples, not calibration samples. Real-market
sources can calibrate public money, but they do not expose hidden star ceilings
or realization probability. The stored-room rule below is therefore an
explicit game-design invariant, and the exact-age P50/P90 factors remain owned
by the deterministic outcome matrix.

## Historical Finding Is Not A Replay Contract

The design discussion found `11 / 1,710` age-17 players with at least one full
public star of upside in a deterministic 20-world inspection. That finding was
useful enough to identify the defect, but its seed list, output hashes, exact
age helper, command, and repository state were not retained. It is therefore
historical planning evidence, not a reproducible baseline and not an
acceptance denominator.

Phase 80A does not reconstruct those missing facts from memory. The canonical
baseline below uses a new seed namespace, explicit age semantics, structured
denominators, and per-world hashes. Its `11 / 1,723` result confirms the same
defect without pretending that `1,710` and `1,723` are interchangeable.

## Canonical 20-World Pre-Change Baseline

### Seed and population contract

- Capture owner at Step 01: `createPhase80APreChangeBaseline`. The temporary
  executable was deleted when Step 05 intentionally changed projection
  behaviour; retaining a function that silently recomputed a “pre-change”
  baseline with current code would be false evidence and dead compatibility
  code. Replay requires the recorded repository identity plus seeds below.
- Seed prefix: `phase80a-prechange-baseline`.
- World seeds: `phase80a-prechange-baseline-world-00001` through
  `phase80a-prechange-baseline-world-00020`, inclusive and one-based.
- Population: every active senior player in the canonical initial
  three-division world; academy and free-agent populations are excluded from
  this particular pre-change sample and must be named separately by later
  diagnostics.
- World count: `20`.
- Senior observations: `23,760` (`20 x 54 x 22`).
- Aggregation order: seed order, then canonical `gameState.playerIds` order.
- Public projection: the production `derivePlayerPotentialProjection(...)`
  policy and rating scale selected by the generated world's stamped versions.
- Value: the production pre-change `derivePlayerValuation(...)`, including its
  current owner/free-agent `marketContext`.

### Aggregate results

| Metric | Observation count | Result |
|---|---:|---:|
| All active seniors | 23,760 | positive |
| Current six-star | 23,760 | 28 |
| Stored-ceiling six-star | 23,760 | 57 |
| Public-upper six-star | 23,760 | 28 |
| Exact `EUR 150m` public values | 23,760 | 3 |
| Eligible exact-cap values | 23,760 | 3 |
| Ineligible exact-cap values | 23,760 | 0 |
| Age-17 public-upside observations | 1,723 | 11 at `+1.0` public star or more (`64` basis points) |

Stored ceiling and public upper are deliberately separate columns. A stored
six is a generator/development hard-cap fact; a public upper of six is a
manager-visible projection fact. Neither count may be substituted for the
other.

### Age-17 joint profile

Hyndman-Fan type-7 percentiles are evaluated over the `1,723` canonical
age-17 observations.

| Fact | Minimum | P50 | P90 | Maximum |
|---|---:|---:|---:|---:|
| Current rating | 1 | 1 | 2 | 2.5 |
| Public expected (`P50`) rating | 1 | 1.5 | 2 | 3 |
| Public upper rating | 1 | 1.5 | 2 | 3 |
| Stored-ceiling rating | 1 | 2.5 | 3 | 6 |

Only `0.64%` of these players expose at least one full public star between
current and public upper. The half-star rounding also makes public `P50` and
upper population percentiles coincide even though their numeric ability facts
can differ. That is the measured presentation gap Phase 80A owns.

### Young stored-ceiling `3.5+` shares

These rows count active senior players aged `15..20` using the same canonical
age definition. They describe the old generator and are evidence, not the new
target.

| Current category | Eligible population | Stored ceiling `>=3.5` | Share |
|---|---:|---:|---:|
| First division | 2,428 | 538 | 22.16% (`2,216` bp) |
| Second division | 2,441 | 194 | 7.95% (`795` bp) |
| Third division | 2,394 | 8 | 0.33% (`33` bp) |

The first and second divisions sit at or near the accepted future bands, while
the third-division population is materially below its frozen `4%..8%` band.
That comparison does not authorize tuning in Step 01.

### Replay hashes

Each hash is produced by `hashPhase79CComposition(...)` from the canonical
version, competition, club, player, identity, ability, potential, and
exceptional-allocation facts for one world, not from presentation text.

| Seed suffix | Observation hash |
|---:|---|
| `00001` | `0019edd5fb4880c2` |
| `00002` | `86538921be7de88b` |
| `00003` | `c27386c90b824289` |
| `00004` | `d049893776c82998` |
| `00005` | `54afb962ec829f34` |
| `00006` | `90cff85c5c2e0189` |
| `00007` | `141d09b84166fc70` |
| `00008` | `a5f120d8a85b9597` |
| `00009` | `7253b513423d7946` |
| `00010` | `44604bb684876379` |
| `00011` | `df3dc93cdd601f8b` |
| `00012` | `e103ceba050ac341` |
| `00013` | `015b2c06174396a5` |
| `00014` | `04c623bcd913570a` |
| `00015` | `955d99366f231fc5` |
| `00016` | `a2bf06cc02bfa633` |
| `00017` | `35058bdc0d382e27` |
| `00018` | `fddfbc9d40a86c17` |
| `00019` | `997238e6a808a44d` |
| `00020` | `b414e4c369c1b6e3` |

The SHA-256 of the newline-delimited `seed=hash` list, including its final
newline, is
`95308aa875429a7f8c01302b7fcd08fcac416fda1e5477e440390becfc02e195`.

### Exact reproduction command

```bash
source "$HOME/.nvm/nvm.sh"
nvm use 24
pnpm exec vitest run \
  apps/cli/src/commands/ten-season-report.test.ts \
  -t "Phase 80A freezes a replayable 20-world pre-change player-model baseline"
```

The test asserts the structured result, seed list, denominators, and hashes.
The existing focused same-seed composition test separately proves replay
identity. A changed hash is a changed baseline and must be explained; it must
not be updated merely to restore green output.

## Canonical Age Semantics

The production potential projection calculates completed age as:

```text
floor((currentDate - birthDate) / 365.2425)
```

Several legacy diagnostics and output helpers still divide by `365`, including
paths in `report-data.ts`, `generated-inspection-output.ts`, and CLI overview
formatting. Near a birthday, those helpers can place the same player in a
different age bucket from the projection owner. This is a diagnostic defect,
not football variance.

Phase 80A joint-profile denominators use the projection's `365.2425` result.
Later diagnostic owners must consume one shared age helper or the projection's
age rather than mixing divisors. Historical `11 / 1,710` evidence cannot be
retrofitted to this definition because its helper and seeds were not retained.

## Current Ownership Inventory

### Club category, reputation, and tier

| Fact | Current owner | Current behaviour | Phase 80A owner |
|---|---|---|---|
| Club category | `Club.category`; changed during season rollover in `advance-career-season.ts` | Durable and used by competition, generation, finance, willingness, asking, and valuation context | Step 02 keeps it durable |
| Club reputation | `Club.reputation` | Durable current scalar; there is no history ledger and no annual bounded movement policy | Step 02 adds the `<=2` movement rule |
| Initial generation tier | `clubTierForGeneratedClubNumber(...)` in `player-generation-bands.ts` | Derived from authored/generated club order `4/4/6/4`; not a durable season fact | Step 02 replaces runtime use with a season-frozen competitive tier |
| Intake tier proxy | private `clubTierForReputation(...)` in `career-intake-players.ts` | Reconstructs a tier from reputation thresholds, independently of the initial ordering | Steps 02 and 06 remove this competing proxy |
| Development environment | no canonical owner | Existing youth-development facts are not the accepted seven-state senior environment | Step 03 derives it from frozen category/tier and versioned policy |

The domain `Club` currently has only `category`, `reputation`, and owned
`playerIds`; it has no season-frozen competitive tier. The initial-world helper
looks like a tier owner but is only a generator-order mapping. Promotion can
change category without producing the accepted roster/result-ranked tier.

### Player generation and exceptional allocation

| Concern | Current owner and algorithm |
|---|---|
| Current ability | `player-generation-bands.ts` plus `player-current-ability-bands.ts`; division/tier ranges feed role-aware current profiles |
| Potential | `player-potential-allocation.ts`; samples one age/role/potential-class growth budget, adds division and tier offsets, distributes it over role-weighted attributes, and applies role/family caps |
| Senior rarity | `player-rarity-budget.ts`; allocates league-level white-fly, serious-prospect, and rare-prodigy slots |
| Initial exceptional stock | `buildInitialWorldExceptionalAllocation(...)`; reconciles natural and constructed current/potential sixes against the Phase 79C-era world limits |
| Initial academies | `initial-youth-academies.ts` plus the youth rarity allocation in `player-rarity-budget.ts` |
| Annual intake | `createAnnualWorldIntakeCandidateProviders(...)` / `generateCareerIntakePlayers(...)` in `career-intake-players.ts`, called through the existing academy/squad-maintenance lifecycle |
| Annual exceptional intake | `buildAnnualWorldIntakeExceptionalAllocation(...)`; schedules `2..4` potential-six offsets per ten-season cohort and at most one in an exceptional season, without checking active national stock |

Current potential is not sampled as one star number: it is a role-aware
attribute ceiling. However, the final young distributions emerge from several
independent division, tier, archetype, budget, family-cap, and exceptional
paths. Phase 80A must replace their conflicting output assumptions at their
content composition owners; it must not add a second youth-intake pipeline.

## Current Development Inventory

### Participation and cadence

- `progress-fixture.ts` records committed-fixture contributions through
  `player-participation.ts`.
- `PlayerParticipationLedger` persists monthly rows containing minutes,
  appearances, starts, rating totals/samples, and played-role minutes.
- `advance-career-month.ts` currently finds each eligible open month and calls
  `developPlayersForSeason(...)` one month at a time.
- `developPlayersForSeason(...)` processes rows in stored order, applies
  positive development and aging at each row, adapts roles, then closes the
  consumed month keys.
- The development command calculates one age from the command's current date
  and reuses it for every supplied row; it does not yet derive age at each
  monthly checkpoint.
- `youth-lifecycle.ts` and the bounded diagnostic matrix also call the same
  development owner.

Thus monthly evidence already exists and is consumed monthly. Phase 80A Step
04 changes orchestration to batches of up to three completed rows plus a
season-end residual flush; it does not replace the ledger or collapse monthly
facts into one quarterly average.

### Current positive-growth algorithm

For each open monthly row and role-relevant ability with room:

```text
delta = min(
  remaining room,
  0.08
    * monthlyDevelopmentPolicy(age, minutes, rating)
    * role relevance
    * min(1, room / 5)
    * playerRealizationModifier
    * deterministic monthly variance [0.65, 1.35)
)
```

`playerRealizationModifier(...)` is derived from only world seed and player ID,
then kept stable for that player. Its ranges depend on initial role-potential
room:

| Role-potential room | Stable multiplier range |
|---:|---:|
| `>=7` | `0.45..<1.15` |
| `>=5` | `0.35..<1.10` |
| `>=3` | `0.25..<0.90` |
| `>=1.5` | `0.15..<0.65` |
| `<1.5` | `0.05..<0.30` |

This is the hidden permanent predisposition Phase 80A removes. The monthly
growth stream already uses stable `(world, season, month, player)` keys; Step
04 keeps that deterministic variance and adds environment as a bounded current
fact instead of substituting another permanent player trait.

## Current Public Projection Inventory

`derivePlayerPotentialProjection(...)` is the numeric engine owner. It derives
role-weighted current/stored-ceiling ability and lower/expected/upper facts.
`derivePublicPlayerAssessments(...)` adapts those facts for UI, but still has a
deprecated ceiling-only overload. Valuation independently calls the numeric
projection instead of consuming one canonical assessment.

Current version: `player-potential-projection-v2`.

| Family | Age | Lower factor | Expected factor | Upper factor |
|---|---:|---:|---:|---:|
| Goalkeeper | 0–17 | 0% | 10.68% | 24.96% |
| Goalkeeper | 18–20 | 0% | 9.51% | 24.66% |
| Goalkeeper | 21–22 | 0% | 7.61% | 19.12% |
| Goalkeeper | 23–24 | 0% | 3.67% | 10.38% |
| Goalkeeper | 25–27 | 0% | 1.16% | 4.49% |
| Goalkeeper | 28+ | 0% | 0% | 0% |
| Outfield | 0–17 | 0% | 16.67% | 30.76% |
| Outfield | 18–20 | 0% | 8.78% | 23.46% |
| Outfield | 21–22 | 0% | 3.85% | 10.95% |
| Outfield | 23–24 | 0% | 1.42% | 4.37% |
| Outfield | 25+ | 0% | 0% | 0.22% |

The accepted Phase 80A age contract replaces these factors. In particular,
players aged `15..20` expose full still-reachable upper room, while P50 remains
an evidence-calibrated median rather than the stored ceiling.

## Current Valuation And AI Inventory

### Public-value formula

`derivePlayerValuation(...)` currently:

1. derives current/lower/expected/upper from the projection owner;
2. interpolates current and upper quality through the global rating anchors;
3. converts the expected ability into an expected money outcome;
4. discounts by visible half-star width;
5. takes the larger of current-quality and discounted expected value;
6. applies age, position, and `marketContext` multipliers;
7. applies upper-tail compression, whole-euro floor, the context maximum, and
   the global cap eligibility rule.

Current global rating anchors, before multipliers and compression:

| Rating | Anchor |
|---:|---:|
| 1 | EUR 25k |
| 1.5 | EUR 50k |
| 2 | EUR 75k |
| 2.5 | EUR 100k |
| 3 | EUR 150k |
| 3.5 | EUR 2m |
| 4 | EUR 15m |
| 4.5 | EUR 35m |
| 5 | EUR 60m |
| 5.5 | EUR 100m |
| 6 | EUR 150m |

The interpolation exponent is `2.0`. Age multipliers are `1.05` at `15..18`,
`1.20` at `19..21`, `1.25` at `22..25`, `1.10` at `26..29`, `0.85` at
`30..32`, `0.60` at `33..35`, and `0.35` at `36..45`. Broad-position
multipliers are goalkeeper `0.85`, defender `0.95`, midfielder `1.00`, and
forward `1.10`. Uncertainty removes `500` basis points per half-star down to a
`6,000` basis-point floor. The upper tail compresses value above `EUR 80m` at
`25%` of the excess and caps at `EUR 150m`; exact cap eligibility requires a
current six-star player aged `25` or younger.

### `marketContext` behaviour and production call sites

| Context | Multiplier | Context maximum |
|---|---:|---:|
| First division | 1.85 | EUR 150m |
| Second division | 1.00 | EUR 18m |
| Third division | 0.90 | EUR 5m |
| Free agent | 1.00 | EUR 150m |

Production ownership/call sites that must be removed or migrated in Step 08:

| Site | Current responsibility |
|---|---|
| `valuation-curves.json` | persists context multipliers and maximums |
| `player-economy-calibration.schema.ts` | validates the context object |
| domain `player-economy-calibration.ts` | exposes context in `ValuationCurvesConfig` |
| engine `player-valuation.ts` | accepts the context, multiplies, and clamps |
| engine `transfer-negotiation.ts` | values a contracted target in the seller's category |
| engine `transfer-feasibility.ts` | revalues contracted/free-agent targets for affordability |
| engine `apply-career-free-agent-signing.ts` | values an unattached player through the free-agent branch |
| web Market adapter | derives context from ownership for list/detail/sort values |
| web Squad adapter | supplies the selected club category for squad values |
| simulation contract/finance stability | supplies category/free-agent context to diagnostics |
| CLI report data | supplies category/free-agent context to baseline and long-run observations |

The test-fixture valuation config mirrors the production shape but is not a
second policy owner. Step 08 removes the parameter, config fields, branches,
neutral aliases, and fixture leftovers rather than setting every multiplier to
`1.0`.

### Stored-ceiling reads in live market behaviour

The current `derivePlayerMarketAbility(...)` exposes exact current and
role-potential ability. Direct live consumers include:

- `player-willingness.ts`, including the elite-prospect downgrade rule;
- `contract-negotiation-demand.ts`, including potential room, wage rating, and
  reachable-potential demand facts;
- `ai-market-lifecycle.ts`, including target eligibility and weighted target
  scores.

That gives AI/willingness code facts the manager never receives. Step 08 must
route live targeting and willingness through the same canonical public
current/P50/upper assessment. Exact potential remains legal only in generation,
development hard caps, projection derivation, and explicitly named
diagnostics.

## Market Evidence And New Calibration Epoch

The dated source and method remain those already reproduced in
`PLAYER_MARKET_CALIBRATION_PROVENANCE_LEDGER.md`:

- Transfermarkt.it 2026/27 IT1, IT2, IT3A, IT3B, and IT3C rosters captured on
  `2026-07-28T20:54:35+02:00`;
- numeric values only; missing values excluded from percentile populations;
- EUR normalization; Hyndman-Fan type-7 percentiles;
- aggregate data only, with no retained identity, raw page, or runtime client.

Those sources describe public market value, not game stars, potential, wages,
or realization probability. The source definition also separates public value
from actual fee and allows a zero fee with non-zero value at contract expiry.

### Superseded Phase 79 thresholds

- The Phase 79C `gameDesignTargets` were evaluated by a valuation that applied
  category multipliers and category maximums. They are historical evidence but
  are superseded as acceptance gates when `marketContext` is deleted.
- The Phase 79D `302 stored-ceiling-six / 100 worlds` observation belongs to
  its old exceptional-allocation epoch. The new national stock target changes
  the generator deliberately; `302` is not an 80A pass/fail count.
- The Phase 79D `5%..15%` rate above the old public P90 remains historical
  projection evidence, not an automatic tolerance for the new P50/upper model.
  Phase 80A must report its new outcome calibration without weakening stored
  ceiling integrity.

Numerically similar source anchors can be reused below, but doing so creates a
new diagnostic contract: division labels group the generated population only;
they are never an input or branch in intrinsic public value.

### Frozen Phase 80A division population bands

These bands reuse the already versioned source medians/P90/P99 values and the
predeclared `25% / 30% / 35%` tolerance widths. Their Phase 80A identity and
causal interpretation are new and fixed before Step 08.

| Population group | Median band | P90 band | P99 band | Sample maximum band |
|---|---:|---:|---:|---:|
| First division | EUR 3m..5m | EUR 16.1m..29.9m | EUR 32.5m..67.5m | EUR 85m..150m |
| Second division | EUR 337.5k..562.5k | EUR 1.54m..2.86m | EUR 3.25m..6.75m | EUR 6m..18m |
| Third division | EUR 112.5k..187.5k | EUR 262.5k..487.5k | EUR 780k..1.62m | EUR 1.5m..5m |

All four denominators must be positive for every category. A category passes
because its generated quality population maps through one global curve into
the band, never because Step 08 applies a category coefficient or cap.

### Frozen Phase 80A global curve contract

The accepted global curve keeps these source-linked and product-frozen
invariants:

- current, public P50, and public upper are valued through one monotonic global
  quality model;
- current quality is fully priced, `current -> P50` is a discounted
  non-guaranteed tranche, and `P50 -> upper` is a smaller positive option-value
  tranche;
- with every other input equal, increasing P50 or upper never reduces public
  value; positive upper width contributes positive bounded value;
- no global width-based haircut remains in intrinsic value. AI risk appetite
  is separate and must not double-discount the same uncertainty;
- full public upper and stored ceiling are not priced as guaranteed outcomes,
  and stored ceiling is never a live valuation input;
- age and bounded role scarcity remain global inputs;
- progressive compression starts around `EUR 80m`;
- the only public-value cap is `EUR 150m`, requires current rating `6` and age
  `<=25`, and is applied after deterministic whole-euro quantization;
- every non-eligible value remains at least one displayed euro below the cap;
- owner, category, transfer, promotion/relegation, contract expiry, observer,
  and employment state are absent from the intrinsic curve;
- a free agent retains the same non-zero intrinsic value and has transfer fee
  exactly zero.

The current anchor, age, position, and compression tables above are the
pre-change numerical starting point. Step 08 may calibrate a new
version's **global** coefficients against the frozen output bands, but may not
change the curve inputs, add a division branch, alter seeds/denominators, or
weaken a band after seeing output. Every changed coefficient requires the
failing pre-change diagnostic to be recorded first.

## Frozen Phase 80A Acceptance Matrix

The following thresholds are fixed before behaviour changes:

| Concern | Required result |
|---|---|
| Genuine young-prospect stored room | For every generated age-`15..20` `interesting`, `serious`, or `rare_prodigy` lane, stored ceiling is at least `1.0` star above current at construction; positive observations in every applicable origin/lane; routine players are excluded and may plateau |
| Young stored ceiling `>=3.5` | Age `15..20`, positive denominator in every current category: Third `4%..8%`, Second `8%..15%`, First `15%..25%` |
| Established national champions | `2..3` current six-star players, all aged over `20`, in credible first-team slots at strong First Division clubs |
| Young national exceptional stock | `4..5` active age-`15..20` stored-ceiling-six players across seniors, academies, free agents, and loans; at most one outside First Division; at most one per club |
| Annual exceptional intake | top up only missing active stock; never generate four/five automatically, delete a player, or exceed the active stock contract |
| Public ordering | `current <= P50 <= upper <= stored ceiling`, zero violations and positive observations |
| P50 calibration | For each positive-denominator role-family/age band, the configured expected realization factor is the rounded type-7 median of the frozen deterministic realization-share sample; it is never copied from the stored ceiling |
| Older upper calibration | After the product-mandated full upper through age `20`, every completed age derives its role-family upper factor from the frozen deterministic P90 realization-share sample, then applies the age-narrowing invariants below; flat implementation bands spanning multiple ages are forbidden |
| Public upper by age | Full still-reachable upper through age `20`; outfield narrows `21..27` and equals current at `28+`; goalkeepers narrow `21..31` and equal current at `32+` |
| Non-widening | For each role family separately and equal current/stored room, `width(age+1) <= width(age)`; zero violations and positive observations in every configured band |
| Quarterly equivalence | For an ordered three-row batch and a residual one/two-row flush, final player, changes, role adaptation, aging, and closed-row state exactly equal sequential monthly processing |
| Growth causality | Positive denominators by age/minutes/performance/environment; no growth from youth, ceiling, transfer, environment, or loan alone; lower-division regular with materially better evidence beats big-club reserve |
| Exact cap | positive eligible denominator; ineligible exact-cap and display-collision counts `0`; exact-cap hits strictly fewer than eligible players so the cap is not the routine eligible outcome |
| Context invariance | Identical intrinsic value for the same player facts across owner category, promotion/relegation, transfer, expiry, and free-agent state; zero mismatches |
| Free-agent fee | unchanged positive intrinsic public value and transfer fee exactly `0`; zero violations |
| Public-value upside monotonicity | At equal current/P50/intrinsic facts, increasing upper never reduces value; at equal current/upper/intrinsic facts, increasing P50 never reduces value; every positive upper tranche contributes positive bounded option value; zero violations with positive paired observations |
| AI information parity | positive live decision observations; zero direct stored-ceiling reads in target ranking, offer selection, and willingness; paired equal-public-assessment fixtures produce identical decisions |
| Division value output | every positive-denominator median/P90/P99/maximum lies inside the frozen Phase 80A bands above |

Story variance can be reported separately. A required zero-row population is
`not_evaluated` or failure, never `PASS`.

## Frozen Three-Season Cohort Contract

The first run used to discover the reopened defects remains preserved as
historical Step 09 evidence. Final acceptance uses a separate compact audit:

| Input | Frozen value |
|---|---|
| Diagnostic contract | `player-development-cohort-750x3-v1` |
| Seed prefix | `phase80a-player-development-750x3-v1` |
| Worlds | `750` |
| Season rollovers | `3` |
| Shards | `750` (one world per shard) |
| Worker ceiling | exactly `7` |
| Checkpoints | opening plus closing after exactly three rollovers |
| Age cross-sections | `15..17`, `18..20`, `21..23` at each checkpoint |
| Trajectory classification | opening age; later intake excluded and counted as closing new entrants |
| Repeat proof | second identical run resumes `750`, simulates `0`, and reproduces the aggregate hash |

The checkpoint payload is a compact summary of exact ability deltas,
integer-half-star histograms, population counts, participation, performance,
and environment evidence. Raw player rows and historical development facts are
forbidden. Every opening identity either matches at closing or appears in the
attrition count. The report distinguishes:

- stored ceiling minus current: generation opportunity;
- public upper minus current and stored minus upper: projection narrowing;
- positive exact ability hidden inside the same half-star bucket:
  presentation quantization;
- opening-to-closing exact ability and star deltas: realized development.

Zero ceiling breaches, ordered public projections, complete pairing, and
positive structural denominators are immediate gates. `visibleEarlyPlateau`
and low mechanical realization are reported with exact numerators and
denominators, but their first `750 x 3` rates are descriptive because no
source-backed balance band existed before the run.

## Step Ownership Handoff

- Step 02 owns durable season-frozen competitive tier and bounded reputation.
- Step 03 owns the derived seven-state development environment.
- Step 04 owns quarterly orchestration and removal of the permanent
  realization modifier.
- Step 05 owns one canonical current/P50/upper public-assessment interface.
- Steps 06 and 07 own contextual prospect supply, national stock, and intake.
- Step 08 owns the new global intrinsic-value version and AI information
  parity.
- Step 09 owns non-vacuous integrated diagnostics, beta reset, bounded browser
  proof, and phase closeout.

No unresolved product decision remains for Step 02, and no later step may use
this baseline to justify a context-dependent public-value branch.
