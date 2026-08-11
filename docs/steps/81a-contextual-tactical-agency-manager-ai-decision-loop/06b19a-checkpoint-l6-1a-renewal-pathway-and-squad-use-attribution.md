# Step 06B19A - Checkpoint L6.1A: Renewal Pathway And Squad-Use Attribution

## Status

**Done on 2026-08-10: canary `GO`, full checkpoint `STOP / RETHINK`.**
This document began as the preregistration. Step 06B19 remains `REFINE`, no
gameplay correction is authorized, and 06B20A-D stay closed until the corrected
checkpoint has a recorded result. Post-execution corrections below preserve
the corpus and thresholds and name the instrument defect they repair.

## TESI

L6.1 proved three different things and they must not be collapsed into one
coefficient change:

1. market and intake blueprint interact materially for division replacement,
   formation retention and generated leaders;
2. `active_talk_limit_reached` is the most frequent upper-division terminal
   outcome, but a frequent terminal label is not a causal owner;
3. First-Division player use is too narrow in every arm, while the two 06B16
   mechanisms barely move it.

Therefore L6.1A changes no gameplay. It first proves whether the market cap is
an actual downstream ceiling, locates the exact squad-use loss between the
reachable roster and the pitch, and rechecks the marginal champion-points miss
with enough worlds to resolve the already-frozen `0.5`-point material floor.
Only a demonstrated owner may open one correction step.

## Frozen Before-State

The immutable input is
`docs/audits/PHASE_81A_CHECKPOINT_L6_1_RENEWAL_ABLATION.md`:

| Family | L6.1 current value or result | Frozen target / floor |
|---|---:|---:|
| local replacement capacity | `0.1011`, `not_reproduced` | `>= 0.20`; effect floor `0.03` |
| division replacement capacity | `0.4719`, `shared_interaction` | `>= 0.50`; effect floor `0.03` |
| four-formation retention | `0.8810`, `shared_interaction` | frozen register; effect floor `0.02` |
| generated-leader share, season 10 | `0.2786`, `shared_interaction` | `>= 0.50`; effect floor `0.02` |
| champion points | `72.2571`, `not_reproduced` | exact register band; effect floor `0.5` |
| appearance share | `0.6492` current | `0.48..0.58` |
| distinct users per club-season | `23.0619` current | `26..31` |
| combined unique needs | `16,280` | reconciliation `0` |
| combined `active_talk_limit_reached` | `5,538` | diagnostic only |

The division pool already contains far more compatible replacement capacity
than clubs realize locally (`0.4719` versus `0.1011`). L6.1A consequently does
**not** buy a larger factorial cohort in the hope that four sub-floor local
contrasts become convenient. The practical floor is a football-materiality
floor, not a p-value. Local replacement remains a real red gate; the new
question is whether removing the active-talk ceiling converts the already
available divisional supply into local replacement.

## Questions

1. Does an analysis-only removal of the active-talk cap materially increase
   fulfilled and subsequently fielded role needs, and does that response reach
   any frozen renewal metric?
2. For excessive appearance concentration and too few users, where is the
   first exact loss: candidate supply, dated availability, academy/call-up
   boundary, match-day selection, or in-match substitution?
3. Do the three L6.1 interactions reproduce on fresh seeds, and can an exact
   player/club/role path explain them without assigning a correlation as an
   owner?
4. On a cohort sized against the observed variance, does the champion-points
   miss persist, and does the existing paired strength oracle still identify
   `population_strength`?

## Code Ownership Verified Before Design

- `createCareerWorldProjection(...)` in `career-sections.ts` is the canonical
  career-report orchestration boundary. It already owns the L6.1 ablation
  policy and the `analysisStrengthGapScale: 1.5` opt-in.
- `simulateSeason(...)` owns the exact fixture selections, bench, accepted
  substitutions and participation. End-of-season roster reconstruction cannot
  recover who was available or sat unused on the bench.
- `selectCareerAiTeam(...)` filters dated unavailability before selection in
  interactive career paths. The report path must preserve the same football
  meaning, but L6.1A may not introduce a second selector or ranking.
- `renewalNeedEpisodesForSeason(...)` is the sole unique-need episode builder.
  It currently discards the fulfilled player identity; that exact identity is
  required for realization attribution and must be retained there, not rebuilt
  from final ownership.
- `maximumActiveTalks` belongs to the versioned market policy and is enforced
  in `advanceAiMarketLifecycle(...)`. The ceiling arm must clone the policy at
  the report composition root; it must not change the asset or add a second
  market lifecycle branch.
- `tableSeasonFact(...)` and `tableHierarchyOwner(...)` already own the paired
  `1.5` strength replay and its frozen owner rule. L6.1A reuses them unchanged.
- `evaluateRenewalAblation(...)` already owns the frozen factorial calculation.
  L6.1A gives it a real registered report caller; no test-only second
  interpretation may survive.

## One Report, One Entry Point

The checkpoint is one locked composite profile:

```text
pnpm cli simulation-report \
  --profile=phase81a-renewal-refinement-l6-1a-28x10 \
  --workers=7 \
  --format=json \
  --report-output=simulation-out/phase81a-renewal-refinement-l6-1a-28x10.json
```

The profile orchestrates its scenario matrix internally and returns one
canonical checkpoint object. There are no arm-specific commands, no ad-hoc
Node script and no hand-merged markdown. Normal report sections describe only
the ordinary current arm; analysis arms exist only under the checkpoint's
typed `scenarioManifest` and decision facts.

The profile rejects world, season, seed and worker overrides. Every scenario
runs serially with exactly `7` workers, so the checkpoint never creates five
competing seven-worker pools. Each scenario has an explicit cache key; a shard
from one policy can never satisfy another policy's resume lookup.

Resumable shards live under the already-ignored convention:

```text
saves/long-run-checkpoints/phase81a-renewal-refinement-l6-1a-canary-7x1-facts-v1/<scenario>/
saves/long-run-checkpoints/phase81a-renewal-refinement-l6-1a-28x10-facts-v1/<scenario>/
```

`current` advances to `current-v2` after the first full output proved that the
paired goal-rate guardrail was not retained in its compact facts. All other
scenario caches stay at version `1`; rerunning unrelated arms would discard
valid evidence. The canonical manifest records each scenario cache version.

The scenario key is part of checkpoint metadata and its hash, not merely a
directory label. The canonical report records these identities and the actual
worker count.

## Frozen Corpus And Scenario Matrix

### Full evidence profile

Seed prefix: `phase81a-renewal-refinement-l6-1a-v1`. Ten seasons. The first
seven seeds are shared by every causal arm.

| Scenario | Worlds | Product meaning | Analysis facts |
|---|---:|---|---|
| `current` | `28` | ordinary current market + blueprint | squad-use funnel and paired strength replay |
| `control` | `7` | pre-06B16 market + generic intake | fresh factorial arm |
| `market` | `7` | role-aware market only | fresh factorial arm and linked needs |
| `blueprint` | `7` | identity intake only | fresh factorial arm |
| `talk_ceiling` | `7` | ordinary current game except no active-talk cap | upper-bound market oracle |

`current` worlds `00001..00007` are also the factorial `combined` arm. They
are never simulated twice. Worlds `00008..00028` add power only to squad use
and standings; they are not compared against seven-world arms.

The talk ceiling is `maximumActiveTalks = Number.MAX_SAFE_INTEGER` in a named,
report-only cloned policy. It is an upper-bound oracle, not a candidate product
value. It must be visible in the scenario manifest, absent from saves and from
every product composition root, and removed with the other Phase 81A analysis
seams at closeout.

### Instrument canary

Before the full cohort, a separate locked profile runs the same instrument for
one season on seven different seeds:

```text
phase81a-renewal-refinement-l6-1a-canary-v1
phase81a-renewal-refinement-l6-1a-canary-7x1
```

The canary includes an additional ordinary `purity_shadow` with all new
observers disabled. After removing the declared analysis-only fields, current
and shadow canonical projections must be byte-identical `7/7`. The canary may
validate schema, nesting, cache identity, reachability and throughput; none of
its balance values enters the full decision.

### Why `28` current worlds

L6.1 current champion points have per-world standard deviation `1.254136`.
Using Student's t and whole seven-worker batches, the two-sided 95% planning
half-width around the mean is:

```text
n = 21: t(0.975, 20) x 1.254136 / sqrt(21) = 0.571 > 0.5
n = 28: t(0.975, 27) x 1.254136 / sqrt(28) = 0.486 <= 0.5
```

Therefore `28` is the first permitted batch whose planning half-width is no
larger than the already-frozen `0.5`-point material floor. This number is frozen
now; the run is never extended after reading output. The previous seven worlds
are used only to size this independent corpus, never pooled into its verdict.

The fresh factorial and talk-ceiling arms remain seven worlds because they are
not fine calibrations: they must demonstrate a response at or above existing
material floors and the established `5/7` per-world coherence. A sub-floor
upper-bound response is unresolved and not an actionable owner; it is never
described as zero or irrelevant.

Every paired contrast reports its sample standard deviation, standard error
and two-sided 95% half-width. A new owner requires a delta larger than both its
existing material floor and its own 95% half-width. The frozen L6.1 evaluator
is still reported unchanged for comparability, but L6.1A cannot upgrade one of
its unresolved labels from a contrast whose interval spans zero.

Planning cost is `560` world-seasons plus the paired match replay in the `280`
current world-seasons. The canary measures throughput on the final code path;
before the full run its observed rate, worker count and a conservative wall
budget are written to the command transcript. The planning expectation is
approximately three to four hours, not a promised runtime.

## Instrument 1 - Exact Squad-Use Funnel

### Pre-execution correction: appearances keep their existing owner

Reading the production observer before editing it showed that
`OwnerAttributionPlayerUseSeasonFact` is already the sole exact owner of
player-club-season appearances, including players transferred during the
season. Replacing it would increase blast radius without removing a duplicate.
It therefore stays canonical. L6.1A adds one compact club-season fact containing
only the four upstream, non-derivable union counts; the evaluator joins those
counts to the existing appearance rows. No appearance count is stored twice.

The joined analytical row is:

```text
worldSeed, competitionId, seasonNumber, clubId, fixtureCount
candidatePlayerCount
availablePlayerCount
selectorPoolPlayerCount
matchdayPlayerCount
existing OwnerAttributionPlayerUseSeasonFact[]
```

The counts are distinct-player unions across that exact club-season:

- `candidate`: every senior, academy or emergency player legally reachable at
  the fixture boundary before dated unavailability;
- `available`: candidates available for at least one fixture;
- `selectorPool`: players actually passed to the canonical selection after the
  academy call-up boundary and any emergency fallback;
- `matchday`: players selected in the XI or bench at least once;
- `appeared`: player IDs in `appearancesByPlayer` with a start or substitute
  appearance.

The fact stores neither `appearedPlayerCount`, total appearances, appearance
share nor distinct users: they derive from `appearancesByPlayer`. A transferred
player has one row in each club-season he actually represented, preserving the
A6 denominator. The observer aggregates IDs while the exact selection exists
and emits only the compact season fact; it never retains per-fixture candidate
lists in the JSON.

Every row must satisfy:

```text
appeared <= matchday <= selectorPool <= available <= candidate
fixtureCount = 34
```

Set-nesting failures, missing IDs, a selected unavailable player, or any
disagreement with canonical fixture participation is a reconciliation failure
and `STOP`, not an owner result.

### Owner ceiling without invented minutes

For each failed club-season and each upstream stage, search the integer user
count:

```text
u in 26 .. min(stageDistinctCount, 31)
counterfactualAppearanceShare = existingAppearanceCount / (34 x u)
```

This redistributes existing appearance events over already reachable players;
it adds no minutes, substitutes or matches. A stage can clear the family only
when some `u` also puts appearance share inside `0.48..0.58`.

Walk from the pitch outward:

1. `matchday` clears -> `substitution_realization`;
2. `selectorPool` clears -> `matchday_selection`;
3. `available` clears -> `call_up_or_selector_boundary`;
4. `candidate` clears -> `availability`;
5. even `candidate` cannot clear -> `squad_supply`;
6. current distinct users are already `26..31` but appearance share is red ->
   `appearance_allocation`;
7. contradictory directions or a tie -> `not_attributed`.

The world owner is the unique stage recovering the most failed club-seasons.
The cohort owner requires the same world owner in at least `20/28` worlds, the
exact `5/7` coherence fraction already used by L6.1, and the pooled
counterfactual must put **both** existing A6 gates inside their frozen bands.
No new gameplay target or tolerance is introduced.

## Instrument 2 - Linked Renewal Path

`RenewalNeedEpisodeFact` gains only facts that disappear after the lifecycle:
the exact fulfilled player ID and terminal date when a transfer completes.
Open or failed episodes omit the ID rather than inventing one. The origin map
gains the player's exact club at first observation (`entryClubId`), which is
not recoverable after transfers.

One shared reader joins, by stable IDs:

```text
role need -> target/fulfilled player -> origin -> buying club
          -> same-season or following-season appearance
          -> season-ten replacement/leader fact
```

The final-season realization window is right-censored and reported as such,
never counted as failure. A fulfillment is `realized` only when canonical
fixture participation records the acquired player for the buying club no
later than the following season. Final ownership is never used as a proxy.

The reader reports raw counts and derives:

- `fulfilledNeedShare`;
- `careerGeneratedFulfilledNeedShare`;
- `realizedCareerGeneratedFulfilledNeedShare`;
- fulfilled-player intersections with local/division replacement matches and
  season-ten leader slots;
- per-club role-coverage and formation-retention intersections.

All episode totals, origin totals, right-censored rows and realization rows
must reconcile. A player cannot fulfill two open episodes for the same
club-role on the same lifecycle event.

## Frozen Attribution Rules

### Fresh factorial stability

The first seven fresh worlds call the existing
`evaluateRenewalAblation(...)` unchanged. Floors remain `0.03`, `0.03`,
`0.02`, `0.02`, `0.5`; coherence remains `5/7` for each conditional contrast.

- agreement with L6.1 continues to the pathway test;
- a former `shared_interaction` becoming a one-axis owner, or a former
  `not_reproduced` becoming material, is cross-cohort instability and
  `REFINE`, never a licence to choose the convenient cohort;
- an interaction that does not reproduce remains visible and blocks its
  correction family. Every contrast is also shown against its own 95% noise
  half-width; noise can withhold attribution but never manufacture it.

### Active-talk causal ceiling

Compare `talk_ceiling` with the same seven `current` worlds. The cap owns one
renewal metric only when all of the following hold:

1. no ceiling-arm episode terminates at `active_talk_limit_reached`;
2. both `fulfilledNeedShare` and
   `realizedCareerGeneratedFulfilledNeedShare` improve by at least `0.03`;
3. that frozen renewal metric improves in its healthy direction by its
   existing material floor, and all three deltas also exceed their paired 95%
   noise half-widths;
4. the metric and both funnel shares have same-sign material deltas in at
   least `5/7` worlds;
5. newly realized fulfilled player IDs intersect the improved metric's exact
   player/club/role path.

Removing the terminal label without downstream improvement is
`terminal_label_only`. Improving transfers without field realization is
`acquisition_without_realization`. Opposite-sign renewal effects are
`mixed_market_response`. None authorizes a cap change.

If a fresh factorial interaction remains material and the cap ceiling does not
meet this rule, it stays `coupled_unresolved`; L6.1A does not invent a bundled
market+blueprint correction.

### Local replacement decision

The within-division matching result is the frozen supply ceiling for local
replacement: it uses the same roles and quality, changing only club
allocation. Therefore:

- talk ceiling meets the causal rule above -> owner
  `active_talk_capacity` and 06B20A may be written;
- talk ceiling stays below floor -> the cap is absolved; owner remains
  `market_distribution_unresolved`, which is `REFINE` and authorizes no tuning;
- division ceiling itself falls below the local `0.20` target -> the previous
  distribution premise is falsified and the owner returns to
  `role_quality_supply`, opening 06B20B only if the fresh factorial also names
  blueprint consistently.

No larger post-output cohort is allowed for the four L6.1 sub-floor effects.

### Champion-points decision

The `current` 28-world arm reads the exact First-Division register, never the
rounded `72..88` prose band. Its paired table uses the existing `1.5` strength
oracle and the unchanged `tableHierarchyOwner(...)` rule.

- current cohort inside the exact band -> `sampling_resolution`; no hierarchy
  correction, and the seven-world miss is retained as superseded evidence;
- current below the band, `tableHierarchyOwner === population_strength`, the
  paired champion mean enters the band, and the healthy paired direction is
  coherent in at least `20/28` worlds -> `population_strength`, opens 06B20C;
- current below, paired response material but still outside ->
  `incomplete_hierarchy_response`, `REFINE`;
- current below with another/no owner -> `not_attributed`, `REFINE`;
- current above the exact maximum is a separate red direction and can never be
  called repaired by further strength amplification.

The other registered First-Division table gates remain non-regression
guardrails. A paired champion improvement bought by a new draw, goal-rate,
last-place or PPG-spread failure does not authorize 06B20C.

## Decision And Handoff

The checkpoint returns one of:

- **`OWNER_IDENTIFIED`**: purity and all reconciliations hold; every persistent
  red family has a unique owner or the powered cohort legitimately resolves
  it. Open only the matching steps:
  - 06B20A `active_talk_capacity`;
  - 06B20B `role_quality_supply` / stable blueprint owner;
  - 06B20C `population_strength`;
  - 06B20D the single squad-use stage demonstrated above.
- **`REFINE`**: cross-cohort instability, `coupled_unresolved`, a persistent
  sub-floor/no-owner result, no coherent squad-use stage, or incomplete
  hierarchy response. No gameplay step opens.
- **`STOP / RETHINK`**: instrument contamination, non-zero reconciliation,
  scenario-cache collision, an analysis policy visible in product state, or an
  oracle changing the ordinary current projection.

06B20D is only a reserved slot. Its gameplay content cannot be written until
L6.1A names exactly one of `squad_supply`, `availability`,
`call_up_or_selector_boundary`, `matchday_selection`,
`substitution_realization` or `appearance_allocation`.

## Implementation Order And Verifiable Checkpoints

### 1. Contracts and readers

- add the composite profile and typed scenario manifest;
- retain the canonical player-use rows and add only the non-derivable upstream
  squad-use counts, as corrected under Instrument 1;
- retain fulfilled IDs and origin entry-club facts;
- give `evaluateRenewalAblation(...)` and the new L6.1A evaluator registered
  production callers;
- add scenario identity to cache metadata and filenames.

Focused tests must prove formulas, total mappings, cache separation, exact
seven-worker rejection and ordinary-policy equivalence. No gameplay code or
content asset changes.

### Checkpoint P - `7 x 1` canary

Run the canary alone. GO requires:

- current versus purity shadow `7/7` canonical byte identity;
- every scenario present with the declared seed set and exactly seven workers;
- squad-use nesting and fixture/participation reconciliation `0` failures;
- unique-need, origin, fulfillment and right-censor reconciliation `0`;
- active-talk ceiling branch reached on real data or already proven reachable
  by the immutable L6.1 corpus;
- checkpoint cache/resume rebuild byte-identical;
- a throughput and wall-budget record for the full profile.

Any purity or reconciliation failure is `STOP`; schema/performance problems are
`REFINE`. Balance values are explicitly `not_evaluated` at this checkpoint.

### 2. Full composite cohort

Only after Checkpoint P, run the locked `28 x 10` profile alone. The profile
executes current first, then control, market, blueprint and talk ceiling
serially. It writes the JSON even when the scientific decision is `REFINE`.

### First-execution correction: a scenario failure is evidence, not lost output

The first full execution completed all `28` current worlds and `6/7` control
worlds, then the fresh control `world-00005` reached the canonical
`finance_lifecycle_rejected` branch in season `9`. The product/current arm did
not fail. The initial orchestrator nevertheless aborted before writing the
report, contradicting the already-frozen requirement above.

Without changing any seed, policy, season or threshold, the composite runner
now records a typed `(scenario, worldSeed, error)` failure, continues the other
declared scenarios, and returns `STOP_RETHINK`. An incomplete arm can never
enter `evaluateRenewalAblation(...)`, be silently dropped, or be treated as a
smaller cohort. This is fail-closed persistence of an observed structural fact,
not a relaxation of the scenario matrix.

### First-output corrections: preserve semantics before the final replay

The first written full output correctly returned `STOP_RETHINK`, but inspection
found five report-contract defects. They are repaired before the final replay;
none changes gameplay, seeds, seasons, workers, floors or owner rules.

1. A failed declared scenario is now `scenarioFailureCount`, never added to
   `reconciliationFailureCount`. Both remain independently fail-closed.
2. Metric coherence under the talk-ceiling oracle counts a world only when its
   healthy delta reaches that metric's existing material floor, not merely when
   the sign is positive.
3. A deterministic world failure is stored in the same collision-proof world
   checkpoint path as a successful projection, using a discriminated hashed
   envelope. Resume replays the fact instead of rerunning nine seasons, and a
   path can never claim both success and failure.
4. Full-cohort purity is `not_evaluated`; only the declared canary shadow may
   produce a purity count. `0/0` is not evidence of purity.
5. `OwnerAttributionTableSeasonFact` retains paired goal rate. The five
   non-champion table guardrails use one rule: the paired replay may not increase
   distance from the exact historical band. This implements the preregistered
   no-regression clause for last-place points, points spread, PPG deviation,
   goals per match and draw share. Only `current` facts change shape, so its
   cache alone advances to version `2`.

The initial 77 MB artifact is diagnostic evidence of the instrument correction,
not the checkpoint of record. The final replay must read cached `control`,
`market`, `blueprint` and `talk_ceiling`, regenerate `current-v2`, persist the
known control failure, and reproduce every unaffected value.

### Checkpoint L6.1A

Record the full scenario manifest, raw arm values, factorial decision, market
path, squad-use owner table, powered standings table, reconciliation totals,
report hash, real exit code and wall time in
`docs/audits/PHASE_81A_CHECKPOINT_L6_1A_RENEWAL_REFINEMENT.md`. Only then update
the next-step handoff.

## Recorded Outcome

The corrected profile completed all `28` ordinary worlds and every causal world
except the fixed pre-06B16 control seed `world-00005`, which reaches
`finance_lifecycle_rejected` in season `9`. The canonical result is:

```text
decision = STOP_RETHINK
failedGateKeys = [scenario_completion]
scenarioFailureCount = 1
reconciliationFailureCount = 0
factorial = not_evaluated
```

Diagnostic findings remain valid but authorize no gameplay:

- squad-use owner: `matchday_selection`, `28/28` worlds; the pooled
  counterfactual moves appearance share `0.649579 -> 0.573532` and distinct
  users `23.032738 -> 26.086706`;
- standings owner: `population_strength`, `28/28` coherent worlds; champion
  mean `71.546429 -> 76.339286`, all five historical guardrails held;
- active-talk cap: absolved as a standalone owner; `5,415 -> 0` terminal labels
  accompanies a *lower* fulfilled-need share, `0.234124 -> 0.208848`, with no
  downstream metric-path intersection;
- cached rebuild: `26s`, identical SHA-256, scientific exit `1` preserved.

The complete evidence is in the audit named above. 06B20A-D, `100 x 10`, B2
and Steps 07-16 remain closed. The next action is a new preregistered design for
a counterfactual population that is not viable for all ten seasons, not a
correction coefficient.

## Expected Files When Executed

- `apps/cli/src/commands/simulation-report/career-sections.ts` and test:
  canonical composite orchestration, ordinary current projection and checkpoint
  attachment;
- `career-sections.ts` keeps the composite L6.1A decision beside the canonical
  scenario orchestration because its inputs are existing private world
  projections; a forwarding module would add a second representation without
  reducing ownership;
- `owner-attribution.ts` remains the sole owner of player-use and squad-use
  attribution; a new wrapper module would duplicate that ownership;
- `apps/cli/src/commands/simulation-report/renewal-architecture-attribution.ts`
  and test: active caller for the frozen factorial, fulfilled-player linkage
  and material market ceiling;
- `apps/cli/src/commands/simulation-report/owner-attribution.ts` and test:
  retain the canonical player-use facts, add only upstream squad-use counts and
  reuse the frozen table owner;
- `apps/cli/src/commands/simulation-report/generational-succession.ts` and test:
  exact origin entry club, recorded at first observation;
- `apps/cli/src/commands/simulation-report/career-world-facts.ts` and test:
  report-only cloned market policy and arm propagation;
- `apps/cli/src/commands/simulation-report/long-run-profile-checkpoints.ts` and
  test: scenario-keyed hashes and collision-proof resume;
- `apps/cli/src/commands/simulation-report/report-registry.ts`,
  `report-planner.test.ts` and
  `apps/cli/src/commands/simulation-report.test.ts`: two locked profiles,
  exact populations and visible discovery commands;
- `packages/engine/src/use-cases/simulate-season.ts` and test: aggregate exact
  candidate/available/selector/matchday sets only when the locked observer is
  enabled; ordinary result remains unchanged;
- `packages/engine/src/index.ts`: only if the compact changed season contract
  needs the existing public engine boundary;
- `packages/i18n/src/labels.ts`: profile labels in all five supported languages;
- this document, the phase README, the A6.1 tranche addendum and
  `docs/PROJECT_STATUS.md`;
- after execution only,
  `docs/audits/PHASE_81A_CHECKPOINT_L6_1A_RENEWAL_REFINEMENT.md` **(new)** and
  `docs/audits/README.md`.

No `report-html.ts`, market calibration asset, intake generator, match engine,
save schema or web file is in scope. If production inspection proves another
file owns a required fact, it is added here with the ownership reason before it
is edited.

## Required Commands When Executed

```bash
nvm use 24
pnpm exec vitest run apps/cli/src/commands/simulation-report/squad-use-attribution.test.ts
pnpm exec vitest run apps/cli/src/commands/simulation-report/renewal-refinement-attribution.test.ts
pnpm exec vitest run apps/cli/src/commands/simulation-report/renewal-architecture-attribution.test.ts
pnpm exec vitest run apps/cli/src/commands/simulation-report/owner-attribution.test.ts
pnpm exec vitest run packages/engine/src/use-cases/simulate-season.test.ts
pnpm cli simulation-report --profile=phase81a-renewal-refinement-l6-1a-canary-7x1 --workers=7 --format=json --report-output=simulation-out/phase81a-renewal-refinement-l6-1a-canary-7x1.json
pnpm cli simulation-report --profile=phase81a-renewal-refinement-l6-1a-28x10 --workers=7 --format=json --report-output=simulation-out/phase81a-renewal-refinement-l6-1a-28x10.json
pnpm check
git diff --check
graphify update .
```

The canary, full checkpoint and `pnpm check` each run alone. Exit codes are
captured from the real command without a pipe. `graphify update .` runs after
the final source shape, not between scenario arms.

## What NOT To Implement

No active-talk value for the product, no squad-size increase, no extra injury,
no forced rotation, no age penalty, no formation bonus, no blueprint retuning,
no hierarchy coefficient, no target move, no post-output seed extension, no
second selector, no end-state reconstruction of transfers or availability, no
arm-specific report command, no manual merge script and no unused analysis
export.

## Definition Of Done

- the canary proves instrumentation purity and reachability before balance is
  read;
- one composite report contains all declared populations and one decision;
- current uses `28` independent worlds, causal contrasts use the same first
  seven seeds and exactly seven workers;
- squad-use, unique-need, origin, fulfillment, participation, scenario and
  cache reconciliations are all zero;
- every persistent red family has a unique owner or an explicit fail-closed
  `REFINE`/`STOP`;
- every paired effect is reported beside its own 95% noise half-width;
- no gameplay or content coefficient changed;
- every new function/type/profile has an active caller and obsolete player-use
  representation is removed in the same change;
- the audit, phase README and project status agree with the canonical JSON.
