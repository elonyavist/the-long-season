# Player Lifecycle Rework Baseline

Date: 2026-07-18
Phase: `75-player-generation-potential-and-development-lifecycle-rework`
Step: `01-accepted-lifecycle-contract-and-reproducible-baseline`
Runtime: Node `24.19.0`

## Purpose

This audit freezes the pre-rework behavior before Phase 75 changes player
current ability, reachable potential, development cadence, participation,
aging, or persistence. It records the existing owners, the known anomalies, and
the measurable invariants each later step must satisfy.

No production source, schema, coefficient, threshold, RNG stream, or CLI output
was changed by this step.

## Product Contract Accepted For Phase 75

- Current profile is generated first from role, division, club tier, age, and
  attribute family.
- Potential is the realistic ceiling still reachable from that current profile
  and age, not an unrelated future roll.
- For every ability: `current <= potential <= 20`.
- Persisted potential may stay stable or compress; it must never increase.
- Exact potential remains hidden; public language has only `ordinary`,
  `interesting`, `high`, and `elite`.
- Active generated players keep a current physical floor of `7` across pace,
  strength, stamina, agility, and heading.
- Ages `25..27` retain only small remaining room, with near-zero physical jumps.
- Ages `28..31` are maintenance/refinement years.
- Outfield physical decline starts at age `32`; goalkeepers use a later curve.
- Development happens at monthly checkpoints, primarily from real minutes, with
  performance applying only a bounded modifier.
- AI clubs must produce credible starts, bench use, substitutions, and played
  roles so development is fed by real participation.
- Related-role familiarity may improve through sustained minutes; primary role
  and archetype do not silently change.
- Pre-Phase-75 beta careers are intentionally unsupported once the new baseline
  is introduced in Step 06.
- Coefficients stay with their owning module; no global balance package is
  introduced.

## Baseline Commands

```bash
nvm use 24
pnpm check
pnpm cli simulate-season --seed=phase75-baseline-a --player-generation-report
pnpm cli simulate-season --seed=phase75-baseline-b --player-generation-report
pnpm cli career --save=phase75-baseline-a --seed=phase75-baseline-a --new-world-preview
pnpm cli career --save=phase75-baseline-a --development-report
pnpm cli ten-season-report --seed-prefix=phase75-baseline --worlds=50 --seasons=10 --report-output=/tmp/phase75-baseline-50x10.md
shasum -a 256 /tmp/phase75-baseline-50x10.md
```

`pnpm check` passed: lint, dependency-cruiser, localized presentation text,
1,029 tests across 171 files, and package typechecks.

The first parallel attempt to run `--development-report` raced before the
career save had been written and failed with `career save not found`. Re-running
the same required command after the save existed passed. This is an operator
ordering artifact of the baseline collection, not a product blocker.

## Fixed-Seed Generation Baseline

### `phase75-baseline-a`

- Players: `396`
- Current ability distribution: `0-8=127`, `9-11=242`, `12-14=27`, `15+=0`
- Potential distribution: `limited=0`, `category=242`, `interesting=151`,
  `serious=2`, `elite=1`
- Rarity budget: white-fly `4/4`, serious prospects `2/2`, rare prodigies `1/1`
- Prospect coverage: `18/18` clubs
- Role-coherence warnings: `none`
- Youth academy baseline: `198` players, every club exactly `11`, departments
  `GK=18 DEF=72 MID=72 ATT=36`, ages `15=21 16=54 17=44 18=55 19=24 20+=0`
- Youth role-coherence warnings: `none`

### `phase75-baseline-b`

- Players: `396`
- Current ability distribution: `0-8=124`, `9-11=252`, `12-14=20`, `15+=0`
- Potential distribution: `limited=3`, `category=261`, `interesting=130`,
  `serious=2`, `elite=0`
- Rarity budget: white-fly `3/3`, serious prospects `2/2`, rare prodigies `0/0`
- Prospect coverage: `18/18` clubs
- Role-coherence warnings: `none`
- Youth academy baseline: `198` players, every club exactly `11`, departments
  `GK=18 DEF=72 MID=72 ATT=36`, ages `15=18 16=44 17=56 18=54 19=26 20+=0`
- Youth role-coherence warnings: `none`

## Career Development Baseline

Command:

```bash
pnpm cli career --save=phase75-baseline-a --seed=phase75-baseline-a --new-world-preview
pnpm cli career --save=phase75-baseline-a --development-report
```

Observed selected club: `Ravenna Calcio`.

- Generated squad size: `22`
- Age summary: `21 or under=9`, `22-29=13`, `30 or older=0`
- Prospect summary: `Prospects=9`, `High-potential=0`, `Rare wonderkids=0`
- Development report simulates `7` seasons in inspection mode.
- Players reviewed: `22`
- Players improved: `16`
- Players declined: `8`
- Stalled prospects: `0`
- Total growth: `119.03`
- Total decline: `27.88`
- Biggest improver: Matteo Benedetti, age `17->24`, growth `24.53`
- Biggest decline: Matteo Naldi, age `28->35`, decline `6.00`

## Long-Run Baseline

Command:

```bash
pnpm cli ten-season-report --seed-prefix=phase75-baseline --worlds=50 --seasons=10 --report-output=/tmp/phase75-baseline-50x10.md
```

Report hash:

```text
7f979b773a3d0d96eb6035f3096c5a2353100f57b9b99387b1a149b8bad30c1b  /tmp/phase75-baseline-50x10.md
```

Summary:

- Worlds: `50`
- Seasons per world: `10`
- Total seasons: `500`
- Status: `PASS`
- Failed worlds: `0`
- Warning worlds: `10`
- Goals per match: avg `2.820`, p95 `2.900`
- Table spread: avg `39.42`, minimum world average `34.40`
- Draw rate: avg `0.240`, maximum world average `0.260`
- Champion streak max: `4`
- Top assist p95: `16`
- Production warning max: `assists=19 top1=0.30 top3=0.50`
- Age `30+` share p95: `0.14`
- Minimum squad size observed: `19`
- Clubs below minimum squad size: `0`
- Clubs without natural goalkeeper: `0`
- Role coverage warnings: total `5828`, p95 `136`
- Youth roster max observed: `11`
- Active players: senior `396..448`, youth `198..198`, total `594..646`
- Clubs above youth target: `0`
- Clubs below youth minimum: `0`
- Warning checks: `table_points_spread_avg=4`, `top_assist_max=4`,
  `champion_streak=3`
- Failing checks: `none`

Interpretation: the existing long-run structure does not collapse at 50x10,
but it does not prove the player lifecycle is credible. The current warning
signals remain mostly match/table-story signals. Phase 75 must add lifecycle
specific gates instead of relaxing these existing thresholds.

## Current Ownership Map

### Domain

- `packages/domain/src/entities/player.entity.ts`
  owns the persisted player shape, 25 ability groups, role identity, role
  familiarity field, and `current/potential` storage.
- `packages/domain/src/player/*`
  owns the canonical 25-attribute algebra, role profiles, role hard caps,
  role-current and role-potential measures, and `potentialAtLeastCurrent`.
- `packages/domain/src/state/career-state.ts`
  owns `CAREER_STATE_SCHEMA_VERSION = 1`, match preparation, youth academy,
  current-season Inbox, and active match checkpoint fields.
- `packages/domain/src/career/active-match-checkpoint.ts`
  owns durable in-progress match facts: selected lineup, selected bench,
  applied substitutions, half-time tactical plan, score, events, and phase.

Domain has no durable player participation ledger yet.

### Content

- `packages/content/src/generators/player-current-ability-bands.ts`
  owns division, club-tier, role-bucket, age-group current bands.
- `packages/content/src/generators/player-role-templates.ts`
  owns role-aware current attribute sampling and role-specific hard-cap
  application at generation time.
- `packages/content/src/generators/generated-player-factory.ts`
  is the shared construction seam that enforces generated scale, role caps, and
  `potential >= current`.
- `packages/content/src/generators/fake-players.ts`
  owns senior starter/reserve production and initial 4-4-2 lineups.
- `packages/content/src/generators/initial-youth-academies.ts`
  owns the fixed 11-player youth plan, initial youth ages, seasonal youth ages,
  and youth candidate construction.
- `packages/content/src/generators/player-rarity-budget.ts`
  owns league-wide senior and youth rarity budgets.

Content does not yet allocate potential from one age-aware remaining-growth
budget. Senior and youth producers still build potential from an independent
`potentialBase` scalar.

### Engine

- `packages/engine/src/career/player-development.ts`
  owns the current once-per-season growth/decline pass.
- `packages/engine/src/career/youth-lifecycle.ts`
  reuses the same seasonal development pass for active academy players and
  decides age-out as promotion candidate, external move, or release.
- `packages/engine/src/career/advance-career-season.ts`
  orchestrates season archive, senior development, exits, youth lifecycle,
  youth intake, promotion, squad maintenance, transfer turnover, calendar
  merge, player-state rollover, and season Inbox delivery.
- `packages/engine/src/career/player-season-rollover.ts`
  resets fitness/form and normalizes morale at new season start.
- `packages/engine/src/career/transfer-turnover.ts`
  applies small deterministic inter-club movement for squad renewal.
- `packages/engine/src/match-engine/player-match-rating.ts`
  derives deterministic live/final ratings from structured match events.
- `packages/engine/src/match-engine/half-time-substitutions.ts`
  validates selected-club half-time substitution decisions.

Engine has structured match facts and ratings, but no monthly development
checkpoint and no durable participation ledger feeding development.

### Storage

- `packages/storage/src/career-save-envelope.ts`
  owns persisted save envelope migration. The envelope is current v2, while
  `CareerState` remains schema version 1.
- JSON and SQLite/OPFS storage currently preserve the existing career state and
  normalize historical role identity when fully absent.

Step 06 must intentionally establish the new Phase 75 beta baseline and remove
old beta compatibility instead of layering more silent migrations.

### CLI And Simulation Tools

- CLI owns `--player-generation-report`, `--development-report`, and
  `ten-season-report`.
- Simulation-tools own long-run diagnostics and warning/fail classification.

Reports must remain inspection adapters. They may reveal lifecycle facts after
the engine produces them, but must not become gameplay truth.

## Current Lifecycle Problems To Fix

### Potential Is Not Age-Reachable

Senior generation in `fake-players.ts` computes:

```text
potentialBase = max(base, potentialAnchor, base + archetype.potentialUplift)
```

Youth generation in `initial-youth-academies.ts` uses the same pattern with
initial-youth streams. That means potential is not derived from current ability
plus an age/family/role reachable-growth budget. It can therefore describe a
ceiling that is no longer believable for a 25-27-year-old.

This is the same class of issue as the user-reported examples:

- age 26 stamina `4.5 -> 12.5`
- pace `10 -> 18` for a 26/27-year-old
- crossing `4.3 -> 9` for an already adult player
- free-kick/crossing ceilings that make weak adult specialists look like they
  still have a large hidden growth path

Even when a specific fixed seed does not print exactly those values, the
current algorithm allows the class of anomaly because the potential scalar is
independent from age-current-family reachability.

### Current Physical Floor Is Not Centralized

The current-profile bands can produce low physical current values, especially
for non-core or capped-out-of-role buckets. The shared factory clamps generated
values to `>=1`, not the accepted active-player physical floor of `7`.

Step 02 must enforce the floor in generation policy without making old players
artificially elite or raising role-irrelevant technical abilities.

### Development Is Seasonal, Not Monthly

The current development pass is once per season. The largest observed selected
club growth in the baseline is `24.53` total attribute points over seven
inspection seasons. The accepted product direction is slower monthly movement
that is visible over time and primarily explained by minutes.

### Minutes And Performance Do Not Drive Growth

The current `playerRealizationModifier` uses potential room and deterministic
RNG. It does not consume starts, substitute minutes, player ratings, structured
contributions, or played-role exposure.

Matchday already generates ratings and structured events, but the career state
does not persist a player-season/month participation ledger that development
can consume.

### Decline Curve Conflicts With Accepted Product Direction

Current outfield decline starts by broad group:

- defenders: age `31`
- midfielders: age `32`
- attackers: age `30`

Accepted Phase 75 direction is outfield physical decline starting from age
`32`, with a later goalkeeper curve and a current physical floor of `7` for
active players. Step 11 must align decline, potential compression, and exits
without creating immortal veterans.

### AI Participation Is Still Too Thin For Development

AI season simulation can build generic lineups and transfer turnover can move
players, but there is no durable per-player evidence that AI clubs produced
credible minutes, benches, or substitutions over the season. Development cannot
be fair until this exists.

### Save Baseline Is Still Pre-Lifecycle

`CareerState` schema version is still `1`; the save envelope is v2. Phase 75
will add durable lifecycle facts and intentionally discard old beta saves. This
must be a clean baseline change, not a compatibility bridge.

## Required Invariants By Step

### Step 02 - Current Profile And Physical Floor

Owner: `@game/content` for generation policy, `@game/domain` for stable role
facts.

Acceptance rules:

- all senior, career-intake, initial-youth, and seasonal-youth producers use
  one current-profile policy;
- current physical abilities for generated active players are `>=7`;
- canonical role hard caps still apply;
- third-division current distributions remain below first-division leaders;
- rare young physical traits such as age-18 pace `14` are possible without
  making the whole profile senior-ready.

### Step 03 - Reachable Potential

Owner: `@game/content`.

Acceptance rules:

- potential is allocated from current plus one bounded remaining-growth budget;
- age/family caps prevent large physical jumps at ages `25..27`;
- ages `28..31` mainly preserve or lightly refine mental/role-relevant traits;
- `current <= potential <= 20` for every ability;
- no independent potential scalar remains in senior or youth producers.

### Step 04 - Youth Development Level And Rarity

Owner: `@game/content`.

Acceptance rules:

- every club has deterministic youth-development level `1..5`;
- division remains the primary cap, reputation/development level secondary;
- third-division academies can create more interesting prospects, not routine
  first-division-ready players;
- elite/high rarity budgets stay strict and reportable.

### Step 05 - Participation Ledger

Owner: `@game/domain`.

Acceptance rules:

- career state has one durable player participation ledger shape;
- ledger records starts, substitute minutes, total minutes, ratings,
  structured contributions, and played roles by period/month/season;
- constructor rejects impossible minutes, duplicate rows, and unknown players;
- no development formula consumes it until Step 09.

### Step 06 - Beta Save Reset And Persistence

Owner: `@game/storage`.

Acceptance rules:

- JSON and SQLite/OPFS share one new beta baseline;
- old pre-Phase-75 saves fail with typed recovery and no silent inference;
- lifecycle facts persist losslessly;
- no legacy compatibility reader remains for discarded beta saves.

### Step 07 - AI Pre-Match Selection And Rotation

Owner: `@game/engine`.

Acceptance rules:

- AI selects XI and bench from real squad facts;
- quality, role coverage, fitness, prospects, and stable order are considered;
- rotation gives credible minutes without perfect hidden optimization;
- reports expose squad-use distribution.

### Step 08 - AI Half-Time Substitutions And Minute Accrual

Owner: `@game/engine`.

Acceptance rules:

- AI substitutions are deterministic and bounded;
- selected-club substitution facts remain authoritative;
- starts, minutes, and role exposure are accrued from actual staged match
  contexts, not inferred after the season.

### Step 09 - Monthly Development

Owner: `@game/engine`.

Acceptance rules:

- development checkpoints are monthly;
- minutes are the primary opportunity signal;
- ratings/contributions modify monthly growth by at most about `+/-15%`;
- no daily churn and no single seasonal growth jump remain;
- deterministic hashes prove same seed/same commands produce same trajectories.

### Step 10 - Related Role Familiarity

Owner: `@game/domain` for state contract, `@game/engine` for progression.

Acceptance rules:

- sustained played-role exposure can improve related-role familiarity;
- no automatic primary-role or archetype rewrite;
- adapted/weak/natural changes are bounded, explainable, and persisted.

### Step 11 - Aging, Decline, Potential Compression, Exits

Owner: `@game/engine`.

Acceptance rules:

- outfield physical decline starts from age `32`;
- goalkeeper decline uses a later curve;
- unreachable potential compresses and never increases;
- active physical floor does not block exits, retirement, or loss of role
  effectiveness;
- old squads renew without structural collapse.

### Step 12 - Calendar Orchestration And Idempotency

Owner: `@game/engine`.

Acceptance rules:

- monthly development, matches, season rollover, academy lifecycle, transfers,
  exits, and inbox events run in one deterministic order;
- repeated commands are idempotent at the career boundary;
- no player can receive duplicate monthly growth from the same period.

### Step 13 - Diagnostics

Owner: CLI and `@game/simulation-tools`.

Acceptance rules:

- reports show lifecycle facts by age, role, attribute family, division, club
  tier, minutes band, rating band, and prospect label;
- exact hidden potential is never shown in user-facing language;
- diagnostics can reproduce representative players at ages `16`, `18`, `21`,
  `24`, `26`, `29`, `32`, `36`, and `40`.

### Step 14 - Staged Calibration Gates

Owner: `@game/simulation-tools`.

Acceptance rules:

- `50 x 10` and `250 x 30` gates include lifecycle-specific invariants;
- no threshold is relaxed only to turn a report green;
- warning semantics remain about fun/credibility, not mathematical neatness.

### Step 15 - Operational Gate

Owner: `@game/simulation-tools` and CLI.

Acceptance rules:

- `10000 x 50` operational gate completes or is sharded without changing
  simulation results;
- final evidence includes deterministic hashes, player trajectories,
  participation distributions, aging/decline, academy rarity, exits, and
  replacement;
- dead code and compatibility leftovers introduced during the phase are removed.

## Step 02 Starting Point

Step 02 should not touch potential yet. It should replace current-profile
generation and physical-floor policy first, route all producers through that
single content-owned path, and leave potential allocation to Step 03.

