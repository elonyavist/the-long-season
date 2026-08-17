# Player Model Consolidation Baseline

Date: 2026-07-17  
Phase: `74-player-generation-and-model-consolidation-cleanup`  
Runtime: Node `24.19.0`

## Decision Summary

The current football balance is the refactor baseline. Phase 74 consolidates
ownership and vocabulary; it does not broadly retune generated players.

- The durable `Player` shape stays unchanged. Step 10 must prove compatibility
  and must not manufacture a schema migration.
- `@game/domain` will own the canonical 25-attribute traversal, explicit raw
  average / role current ability / role potential ability semantics, role
  profiles and hard caps, and validated construction of newly created players.
- `@game/content` will retain identity, division, club tier, age, archetype,
  rarity, academy composition, bands, and deterministic assembly policy.
- `@game/engine` will retain growth, decline, lifecycle, turnover, and market
  decisions while consuming domain-owned measures.
- CLI and web adapters will project canonical facts and will lose their local
  ability formulas.
- Existing tactical suitability remains a separate public behavior. It is not
  renamed to current ability and is not folded into generation quality.

The source currently validates `AbilityValue` on `0..20`, while generated
players in the captured world use `1..14` and the phase contract calls the
generated scale `1..20`. The consolidation therefore keeps the low-level
`0..20` value object for historical compatibility, while the new-player
construction boundary will reject generated attributes below `1`.

## Producer Map

| Player source | Public path | Current ability policy | Potential policy | Identity / rarity owner | Dynamic state |
|---|---|---|---|---|---|
| Initial senior squads | `generateFakePlayers` in `fake-players.ts` | role-aware current bands and hard caps | position template, capped by role, then clamped at least to current | content archetype allocator and fictional identity | initialized beside the generated player |
| Initial academies | `generateInitialYouthAcademies` in `initial-youth-academies.ts` | youth role-aware bands and hard caps | position template, capped by role, then clamped at least to current | content youth age, identity, rarity and exact academy composition | initialized beside the generated player |
| Seasonal academy refill | `generateSeasonalYouthIntake` in `initial-youth-academies.ts` | youth role-aware bands and hard caps | position template, capped by role, then clamped at least to current | content refill slots, mostly age `15..17`, and seasonal rarity | initialized beside the generated player |
| Later-career senior intake | `generateCareerIntakePlayers` in `career-intake-players.ts` | position-template base | position-template higher base | content identity, age and roster-gap policy | initialized beside the generated player |

All four paths currently construct a structural `Player` value directly. The
first two files independently implement potential-at-least-current traversal;
the later-career path relies on higher bases instead of a named invariant.
Steps 04-06 must route all four through one validated construction and one
assembly entry point without merging their distinct policies.

## Mutator And Consumer Map

| Consumer | Current measure | Football meaning | Canonical target |
|---|---|---|---|
| `player-development.ts` | per-attribute current/potential plus a raw average for realization | role-aware seasonal growth and aging decline | canonical traversal, role profile/caps, role current and potential room where a scalar is required |
| `player-exits.ts` | raw 25-attribute average | compatibility threshold for retirement/step-down | explicit raw diagnostic average; preserve thresholds |
| `youth-lifecycle.ts` | raw current/potential averages | age-out disposition and potential lane | role current ability and role potential ability |
| `youth-promotion.ts` | raw current average and raw potential room | senior usefulness | role current ability and role potential room |
| `transfer-turnover.ts` | raw current average | squad weakest-player and downward-move guard | role current ability for the player's effective role |
| `player-valuation.ts` | raw current and potential averages | sporting value inputs | role current and role potential ability; preserve valuation output shape |
| `player-willingness.ts` | independently implemented raw current average | refusal of excessive sporting step-down | role current ability |
| ten-season reports | raw current average / raw potential room | diagnostics and long-run distributions | explicit raw diagnostics unless the label claims role quality |
| player-generation report | role-relevant peak plus rarity classification | lower-division generation inspection | role current and role potential distributions, keeping public aggregate-only output |
| career roster/development report | local role-relevant and raw potential-room formulas | user-safe development categories | canonical role measures; no exact hidden potential |
| web match-preparation adapter | raw average multiplied to `0..100` | auto-selection strength tie-break | role current ability for the requested slot; tactical suitability remains separate |

The exit thresholds are explicitly compatibility behavior rather than a claim
that raw average is football quality. Other lifecycle and market callers make
football-quality decisions and must migrate to role-weighted semantics in
Steps 08-09 with focused decision tests.

## Duplicate And Near-Duplicate Inventory

### True duplicates to delete

- The 25 ability keys exist independently in content classification,
  development, and SQLite mapping.
- Whole-ability traversal and averaging are repeated in development, exits,
  youth lifecycle, youth promotion, transfer turnover, valuation, willingness,
  CLI reports, and the web adapter.
- `potentialAtLeastCurrent` is independently implemented in senior and youth
  generation.
- The ten role bucket/classification and hard-cap tables in
  `player-role-attribute-classification.ts` and `player-development.ts` express
  the same football rules. Domain will own one table.

### Similar but intentionally distinct policy

- Senior, youth, and later-career base bands are not duplicates: division,
  club tier, age and career source give them different football meaning.
- Initial-academy and seasonal-refill composition are related but not the same
  operation. The former creates exactly 11; the latter fills missing department
  slots back to 11.
- Rarity allocation is not role classification. It remains content policy.
- Tactical-board suitability includes role compatibility/familiarity and is
  not role current ability.
- Development age curves, growth/decline rates and seeded variance are engine
  policy, not role-profile data.
- SQLite row enumeration is durable mapping, but it must consume the canonical
  key list rather than own a fourth football definition.

## Persistence Map And Migration Decision

JSON saves persist the complete `CareerState` through the versioned career
envelope. SQLite/OPFS stores player identity, optional generated-role metadata,
current and potential ability rows, and dynamic state in separate relational
tables. `world-state-mapper.ts` records whether each optional historical role
field was present, so an absent field remains distinguishable from an explicit
empty collection after a round trip.

The phase does not need to add or remove persisted fields. Generated players
will gain a validated construction route in memory while `Player` keeps its
optional role metadata for supported historical careers. Step 10 therefore
owns deterministic historical normalization/validation at load boundaries and
round-trip proof only. Career save schema `2`, career-state schema `1`, and
SQLite schema `6` must not be bumped unless a later step discovers an actual
durable-shape change.

## Deterministic Baseline

The focused baseline suite passes: 8 files and 71 tests covering domain player
contracts, all current producer classes, development, youth lifecycle,
valuation, and SQLite mapping.

### `world-a`

- players: `396`
- reported current bands: `0..8=82`, `9..11=203`, `12..14=111`, `15+=0`
- potential classes: `limited=0`, `category=252`, `interesting=140`,
  `serious=4`, `elite=0`
- white flies: `3/3`; serious prospects: `4/4`; prodigies: `0/0`
- clubs with prospects: `18/18`
- role-coherence warnings: `0`
- youth players: `198`; every club has exactly `11`
- youth departments: `GK=18`, `DEF=72`, `MID=72`, `ATT=36`
- youth ages: `15=24`, `16=50`, `17=68`, `18=46`, `19=10`, `20+=0`
- youth role warnings: `0`

### `world-b`

- players: `396`
- reported current bands: `0..8=75`, `9..11=219`, `12..14=102`, `15+=0`
- potential classes: `limited=0`, `category=247`, `interesting=145`,
  `serious=4`, `elite=0`
- white flies: `1/1`; serious prospects: `4/4`; prodigies: `0/0`
- clubs with prospects: `18/18`
- role-coherence warnings: `0`
- youth players: `198`; every club has exactly `11`
- youth departments: `GK=18`, `DEF=72`, `MID=72`, `ATT=36`
- youth ages: `15=24`, `16=52`, `17=53`, `18=54`, `19=15`, `20+=0`
- youth role warnings: `0`

### Career seed `world-a`

- selected club roster: `22`
- nationality: Argentinian `1`, German `2`, Italian `19`
- age: `<=21=9`, `22..29=11`, `>=30=2`
- prospects: `9`; high potential: `0`; rare wonderkids: `0`
- seven-season development: reviewed `22`, improved `13`, declined `10`,
  stalled prospects `0`, growth `86.50`, decline `33.72`
- biggest improver: Lukas Hartmann, age `17 -> 24`, growth `17.68`
- biggest decline: Luca Tarantino, age `30 -> 37`, decline `8.37`
- save SHA-256:
  `04191034e304659b7d8c116d8978b4de5c4460fb0715358e4f8b5f0c83c7262f`

The raw CLI commands are currently blocked before command dispatch by the
pre-existing Node strip-only incompatibility in
`career-inbox-lifecycle.ts` (`ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX` on a parameter
property). The structured baselines above were collected with Node 24's
`--experimental-transform-types`; this audit does not modify that unrelated
module or conceal the raw-command failure.

## Exact Locks Versus Distribution Locks

Exact locks for structural steps are fixed-seed IDs, names, nationality,
birth dates, club/player ordering, archetype and role identity, all 25 current
and potential values, dynamic states, academy membership, and deterministic
random-stream order. Existing same-seed equality tests plus the captured save
hash guard these facts.

Distribution locks are division current bands, potential classes, rarity
budgets, role-cap/coherence warnings, academy size/department/age shape,
prospect club coverage, growth/decline/stall behavior, exits, promotion,
turnover, and long-run squad health. These may change only in the documented
semantic-consumer steps and must be compared through the final 50x10 and
250x30 gates.

## Complexity Baseline

| File | Lines | Coherent reason for attention |
|---|---:|---|
| `player.entity.ts` | 366 | entity, roles, abilities and role identity share one file |
| `fake-players.ts` | 631 | senior identity, generation and assembly |
| `initial-youth-academies.ts` | 558 | initial academy plus seasonal refill |
| `career-intake-players.ts` | 258 | later-career intake |
| role classification | 461 | duplicated stable role rules |
| role templates | 493 | generation-specific sampling policy |
| `player-development.ts` | 916 | policy plus duplicated ability algebra and role tables |
| lifecycle/market files | 1,505 | repeated scalar calculations across distinct decisions |
| SQLite world mapper | 562 | durable row mapping plus duplicated key list |
| ten-season report data | 1,478 | many report compositions plus local ability math |
| generated inspection output | 577 | report projection plus local role-quality math |
| web preparation adapter | 431 | UI projection plus local raw-strength math |

The audited set totals `8,236` lines. File size alone is not a split trigger.
Only the canonical ability algebra, canonical role profile, validated player
construction, and shared generated-player assembly are approved coherent
extractions.

## Step Ownership And Deletion Map

1. Step 02 adds domain ability keys/traversal and explicit derived measures,
   then removes only callers it owns in that step.
2. Step 03 moves role buckets/caps to domain and deletes the content/engine
   duplicate tables after focused parity tests pass.
3. Step 04 introduces the validated new-player construction boundary without
   changing persisted `Player` shape.
4. Steps 05-06 route senior, later-career and youth producers through one
   content assembly pipeline and delete local construction/clamp copies.
5. Step 07 consumes canonical traversal/profile/caps in development and deletes
   its switch-based algebra and copied tables.
6. Steps 08-09 migrate lifecycle, market, report and web callers according to
   the semantic map above; thresholds stay explicit and tested.
7. Step 10 proves JSON and SQLite/OPFS compatibility without an empty migration.
8. Step 11 deletes any remaining replaced helper/export/test path only after
   complete focused and long-run evidence passes.

Step 02 can proceed without another ownership or migration decision.
