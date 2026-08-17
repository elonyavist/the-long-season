# Implementation And Checkpoint Register

## Status And Ownership

This is the single Phase 81B register for:

- the minimum production ownership map of every implementation step;
- locked profile IDs and populations;
- gate identifiers, formulas, non-vacuity and failure owners;
- the distinction between product gates, structural gates and diagnostics.

Step 00 freezes the numeric values in
`docs/audits/PHASE_81B_NUMERIC_REGISTER.md`. Later steps may cite those values
but must not copy them here or into step files. If this register and production
code disagree when a step starts, code wins: update Graphify, correct this
register before editing production, and record the ownership reason in the
active step.

Every file below is a **minimum manifest**, not permission to edit the whole
list. The active step first runs `graphify affected` for its named symbols,
adds any newly proven file with an ownership explanation, and edits only the
files actually required. Conversely, a Graphify importer is not automatically
an owner.

## Runtime And Execution Contract

- Runtime: Node `24.16.0` after `nvm use 24`.
- Report entrypoint: `pnpm cli simulation-report` only.
- Batch concurrency: exactly `7` workers when at least seven independent worlds
  exist; never more than seven.
- Every checkpoint report runs alone and writes canonical JSON.
- A renderer consumes canonical JSON through `--from-report`; it never
  simulates, reconstructs facts or evaluates gates.
- `NOT_EVALUATED` blocks GO for every required branch.
- A zero denominator, missing reconciliation population or unreachable rule is
  `STOP_INSTRUMENT`, never a zero-valued pass.

## Code Ownership By Step

### Step 01 - Persisted trajectory and one beta reset

Primary symbols: `Player`, `createPlayer(...)`, `CareerState` and the SQLite
world mapper.

Minimum production owners:

- `packages/domain/src/entities/player.entity.ts`
- `packages/domain/src/player/player-abilities.ts`
- `packages/domain/src/player/create-player.ts`
- `packages/domain/src/player/index.ts`
- `packages/domain/src/index.ts`
- `packages/domain/src/state/career-state.ts`
- `packages/storage/src/save-metadata.ts`
- `packages/storage/src/career-save-envelope.ts`
- `packages/storage/src/sqlite/sqlite-career-schema.ts`
- `packages/storage/src/sqlite/world-state-mapper.ts`
- `packages/storage/src/sqlite/career-state-mapper.ts`
- `packages/storage/src/json-career-storage.ts`
- `apps/web/src/runtime/web-career-runtime.ts`

Their focused tests and the smallest fixture builders that construct `Player`
or persisted `CareerState` belong to the step only when compilation or
round-trip behavior proves they are affected. One schema epoch owns all
version changes; later Phase 81B steps may not reopen it.

### Step 02 - Continuous population policy

Primary symbols: `generateFakePlayersForClubs(...)`,
`generateSeasonalYouthIntakePlayers(...)`, `generateCareerIntakePlayers(...)`
and the old potential-allocation/rarity owners.

New canonical owners:

- `packages/content/src/generators/player-population-policy.ts` **(new)**
- `packages/content/src/generators/player-population-policy.test.ts` **(new)**
- one versioned policy asset under `packages/content/src/balance/` **(new)**
- one matching domain validation contract under `packages/domain/src/balance/`
  **(new)**

Composition adapters and surviving ability assembly:

- `packages/content/src/generators/fake-players.ts`
- `packages/content/src/generators/initial-youth-academies.ts`
- `packages/content/src/generators/career-intake-players.ts`
- `packages/content/src/generators/generated-player-factory.ts`
- `packages/content/src/generators/player-prospect-joint-profile.ts`
- `packages/content/src/generators/player-current-ability-bands.ts`
- `packages/content/src/generators/player-current-profile-policy.ts`
- `packages/content/src/generators/player-generation-bands.ts`
- `packages/content/src/generators/player-generation-quality.test.ts`
- `packages/content/src/generators/annual-intake-role-plan.ts` only if its
  requested-role Interface must change; it never owns talent quality.

Replacement/deletion owners:

- `packages/content/src/generators/player-potential-allocation.ts`
- `packages/content/src/generators/player-potential-rarity.ts`
- `packages/content/src/generators/player-rarity-budget.ts`
- their tests and final content exports.

No old file may remain merely as a forwarding compatibility wrapper. If it
still owns valid current-ability behavior, split that behavior into a correctly
named live Module and delete the obsolete owner in the same step.

### Step 03 - Checkpoint A reporting

Primary owners:

- `apps/cli/src/commands/simulation-report/report-registry.ts`
- `apps/cli/src/commands/simulation-report/career-world-facts.ts`
- `apps/cli/src/commands/simulation-report/career-sections.ts`
- one focused population evaluator beside those files **(new if no existing
  Module has the same semantics)**
- the corresponding focused tests.

Hidden trajectory facts are legal only in the locked diagnostic section. The
section must retain non-derivable creation provenance rather than reconstruct a
second population generator.

### Step 04 - Canonical public forecast and consumers

Canonical forecast and config owners:

- `packages/engine/src/squad/player-potential-projection.ts`
- `packages/engine/src/squad/public-player-assessment.ts`
- `packages/engine/src/squad/index.ts`
- `packages/engine/src/index.ts`
- `packages/domain/src/balance/player-economy-calibration.ts`
- `packages/content/src/balance/player-economy-calibration.ts`
- `packages/content/src/schemas/player-economy-calibration.schema.ts`

Graphify currently identifies these production consumers of the public
assessment and they must be audited, not blindly edited:

- `packages/engine/src/market/player-valuation.ts`
- `packages/engine/src/market/transfer-feasibility.ts`
- `packages/engine/src/career/ai-contract-lifecycle.ts`
- `packages/engine/src/career/ai-market-lifecycle.ts`
- `packages/engine/src/career/apply-career-free-agent-signing.ts`
- `packages/engine/src/career/apply-career-transfer.ts`
- `packages/engine/src/career/career-ai-team-selection.ts`
- `packages/engine/src/career/contract-negotiation.ts`
- `packages/engine/src/career/preliminary-agreement.ts`
- `packages/engine/src/career/selected-club-market-workflow.ts`
- `packages/engine/src/career/senior-squad-replenishment.ts`
- `packages/engine/src/career/transfer-negotiation.ts`
- `packages/engine/src/career/transfer-player-negotiation.ts`
- `packages/engine/src/career/youth-lifecycle.ts`
- `packages/engine/src/career/youth-promotion.ts`
- `packages/engine/src/use-cases/simulate-season.ts`
- `apps/cli/src/commands/career/market-demo.ts`
- `apps/cli/src/commands/career/roster-output.ts`
- `apps/cli/src/commands/simulation-report/career-world-facts.ts`
- `apps/web/src/features/market/career-market-adapter.ts`
- `apps/web/src/features/squad/career-squad-adapter.ts`
- `packages/simulation-tools/src/long-run/contract-finance-stability.ts`

Tests/fixtures for an audited consumer join the step only if their public input
or expected output changes. No consumer may import latent trajectory.

### Step 05 - Realization, aging, injury and retirement

Primary realization owners:

- `packages/engine/src/career/player-development-policy.ts`
- `packages/engine/src/career/player-development.ts`
- `packages/engine/src/career/player-aging-policy.ts`
- `packages/engine/src/career/advance-career-month.ts`
- `packages/engine/src/career/advance-career-season.ts`
- `packages/engine/src/career/player-exits.ts`
- `packages/engine/src/player-state/completed-player-age.ts`
- `packages/engine/src/index.ts`

Serious-injury and availability owners to inspect before deciding scope:

- `packages/engine/src/match-engine/match-injury.ts`
- `packages/domain/src/match/match-consequence.ts`
- `packages/domain/src/career/player-availability.ts`
- `packages/engine/src/career/match-availability-consequences.ts`
- `packages/engine/src/career/career-match-state-consequences.ts`

Versioned curve owners:

- `packages/domain/src/balance/player-state-curves.ts`
- `packages/content/src/balance/player-state-curves.ts`
- `packages/content/src/balance/player-state-curves.json`
- `packages/domain/src/career/club-development-environment.ts`
- `packages/content/src/balance/player-development-environment.json`

Focused tests matching every edited production file are part of the manifest.
Report-only formulas are forbidden; Checkpoint B calls these canonical owners.

### Steps 06, 09, 10, 12 and 13 - Checkpoint/report ownership

The reporting spine is always:

- `apps/cli/src/commands/simulation-report/report-registry.ts`
- `apps/cli/src/commands/simulation-report/career-world-facts.ts`
- `apps/cli/src/commands/simulation-report/career-sections.ts`
- `apps/cli/src/commands/simulation-report/report-html.ts` only in Step 13
- `apps/cli/src/commands/simulation-report/report-renderers.ts` only in Step 13
- `packages/simulation-tools/src/modular-report/report-contract.ts` only when
  canonical artifact/hash metadata genuinely changes.

Existing focused diagnostics to reuse or supersede rather than duplicate:

- `generational-succession.ts`
- `owner-attribution.ts`
- `renewal-architecture-attribution.ts`
- `stationary-age-succession-attribution.ts`
- `succession-priority-attribution.ts`
- `historical-simulation-targets.ts`
- `league-diversity-gate.ts`
- `long-run-profile-checkpoints.ts`

All paths above are under
`apps/cli/src/commands/simulation-report/` unless otherwise stated. New
evaluators must own a genuinely new semantic question; otherwise extend or
replace the current owner and remove superseded exports/tests in the same step.

### Step 07 - AI recruitment and free agents

Primary need/ranking/execution owners:

- `packages/engine/src/career/ai-market-lifecycle.ts`
- `packages/engine/src/career/free-agent-pool.ts`
- `packages/engine/src/career/apply-career-free-agent-signing.ts`
- `packages/engine/src/career/apply-career-transfer.ts`
- `packages/engine/src/career/career-market-catalog.ts`
- `packages/engine/src/career/senior-squad-replenishment.ts`
- `packages/engine/src/career/advance-career-month.ts`
- `packages/engine/src/career/advance-career-season.ts`

Constraints and config owners to audit:

- `packages/domain/src/balance/player-economy-calibration.ts`
- `packages/content/src/balance/market-behavior-calibration.json`
- `packages/content/src/balance/player-economy-calibration.ts`
- `packages/content/src/schemas/player-economy-calibration.schema.ts`
- `packages/engine/src/market/player-valuation.ts`
- `packages/engine/src/market/player-willingness.ts`
- `packages/engine/src/market/transfer-feasibility.ts`
- `packages/engine/src/career/contract-negotiation-demand.ts`

Intent attribution extends the canonical reporting spine. It retains one
terminal fact per need/candidate transition, never full candidate rankings or
repeated monthly evaluations as separate needs.

### Step 08 - Shipped presentation and deletion

Read-model and web owners:

- `packages/ui/src/career/career-squad-view.ts`
- `packages/ui/src/career/career-player-detail-view.ts`
- `packages/ui/src/career/career-player-profile-view.ts`
- `packages/ui/src/career/career-market-view.ts`
- `packages/ui/src/career/index.ts`
- `apps/web/src/features/squad/career-squad-adapter.ts`
- `apps/web/src/features/market/career-market-adapter.ts`
- `apps/web/src/shared/ui/PlayerPotentialRangeRating.tsx`
- `apps/web/src/features/squad/CareerPlayerProfileDialog.tsx`
- `apps/web/src/features/market/CareerMarketPlayerDialog.tsx`
- `apps/web/src/features/squad/CareerSquadScreen.tsx`
- `apps/web/src/features/market/CareerMarketScreen.tsx`
- `packages/i18n/src/labels.ts`
- `apps/web/src/visual-qa/current-product.spec.ts`

Focused tests accompany changed owners. The deletion manifest from Steps
01/02/04/05/07 is part of Step 08 scope and names every obsolete source,
export, fixture, config key, profile and localization key before deletion.

### Step 11 - Conditional owner-only correction

Step 11 has no production-file permission until Checkpoint D writes its owner
table. Before implementation it copies the failed metric IDs from this
register, names the single owning Module/config/test set for each, and runs
Graphify affected. Multiple independent owners become ordered 11A/11B steps
with a bounded repeated checkpoint after each; they are never edited as one
unattributed bundle.

## Locked Profiles And Populations

The following IDs and dimensions are reserved by Step 00 without renaming.
Step 00 registers the executable baseline. Each checkpoint step registers its
own executable profile only after the required section exists, and exact-
profile tests prove that no frozen dimension moved:

| Check | Profile | Population | Purpose |
|---|---|---|---|
| Baseline | `phase81b-player-model-baseline-7x15-v1` | 7 worlds x 15 seasons | unchanged pre-81B model and old-evidence limitations |
| A | `phase81b-generation-forecast-a-7x1` | same 7 locked world seeds, opening/creation facts plus frozen allocation-cycle search corpus | generation and allocation reachability |
| B | `phase81b-realization-b-7x2` | same 7 locked world seeds x 2 seasons | early realization/aging branches |
| C | `phase81b-market-c-7x5` | same 7 locked world seeds x 5 seasons | recruitment and early renewal |
| D | `phase81b-longitudinal-d-7x15` | same 7 locked world seeds x 15 seasons | owner attribution |
| E | `phase81b-longitudinal-e-7x15` | D population and gates unchanged | candidate repeat/reproducibility |
| F canary | `phase81b-product-f-canary-7x20` | 7 locked worlds x 20 seasons | route, payload and renderer preflight only |
| F acceptance | `phase81b-product-f-50x20` | 50 stable one-world shards x 20 seasons | broad player-model product review |

Step 00 records exact seed strings and the baseline artifact hash. Locked
profiles reject world/season/seed overrides. A-F use the same seven-seed core
so widening horizons does not silently change the population. F adds 43 frozen
worlds for breadth; it does not replace D/E attribution.

Every long-run profile also owns its checkpoint directory and cache signature
inside `report-registry.ts`. They are part of the exact-profile contract, not a
CLI dimension; `simulation-report` intentionally has no `--checkpoint-dir`
flag.

## Gate Schema

Every emitted gate row contains:

```text
metricId
populationId
numerator
denominator
value
targetRegisterKey
status: pass | fail | not_evaluated | stop_instrument
owner
limitations
```

The numeric register owns `targetRegisterKey`. A formula change requires a new
metric ID and preregistration before a run; it is never a reinterpretation of
an old value.

Global structural gates on every checkpoint:

| Metric ID | Formula/population | Non-vacuity and decision | Owner |
|---|---|---|---|
| `report_reconciliation` | canonical player/club/season/transfer counts versus report rows | exact equality; any missing source population is `STOP_INSTRUMENT` | report instrument |
| `gameplay_continuity_hash` | declared pre-diagnostic canonical sections on identical seeds/horizon | exact registered hash or paired identity as preregistered | producer/instrument |
| `diagnostic_rng_purity` | observer off versus on with same seeds | match/gameplay facts and RNG consumption identical | instrument |
| `profile_contract_identity` | actual worlds, seasons, seeds, workers, versions and includes versus locked profile | exact equality; worker count is metadata and cannot alter hash | registry/profile |
| `gate_reachability` | real rows capable of moving each rule in the direction it reads | every binding rule reachable; fixture-only reachability is insufficient | rule owner |

## Step 00 Baseline Register

The baseline is not a pass/fail claim about the new architecture. It freezes
denominators and limitations before implementation.

| Metric ID | Population/formula | Required output | Cannot establish |
|---|---|---|---|
| `baseline_ability_pyramid` | active players by division, origin, age, role and bands `10_11`, `12_13`, `14`, `15`, `16_plus` | counts/shares and per-world distribution | health of the replacement population |
| `baseline_forecast_outcome` | old public class at intake versus judgeable realized maximum/final band; censored separate | class counts, outcomes, censoring | calibration of the future probability model |
| `baseline_stock_flow` | opening active stock + unique intake/inflow - unique exit/outflow = closing active stock | exact transition reconciliation | future contract-clock cadence |
| `baseline_recruitment_funnel` | one unique club-role-season need through terminal outcome | counts by terminal reason | causality of a later market change |
| `baseline_free_agent_flow` | opening free agents + unique inflow - unique attributed signing/other exit = closing stock | exact player-ID reconciliation | Phase 81C season-boundary peaks |
| `baseline_football_health` | existing historical target readers and Phase 81A tactical readers on their original populations | frozen values and original formulas | complete domestic tables not simulated by the current runner |

Step 00 runs the baseline profile alone and writes the exact command, exit,
duration, profile contract, limitations and artifact hash into the baseline
audit.

## Checkpoint A - Generation And Allocation

| Metric ID | Population/formula | Binding rule | Non-vacuity | Failure owner |
|---|---|---|---|---|
| `population_band_share_by_division` | all newly created players, grouped by D1/D2/D3 and current/latent absolute band | numeric-register bands by origin/readiness context | every division/context has players | population policy |
| `high_tail_allocation_ratio` | latent `16_plus` opportunities by division over the Step 00 frozen production-request rotation corpus | deterministic convergence target `3:2:1` with Step 00 tolerance; never inferred from one played season | each division has positive access; total high-tail count > 0 | population allocation |
| `lower_division_high_tail_reachability` | D2/D3 creation search corpus | positive real-data occurrence in each division, never a per-season quota | searched corpus/profile fixed before output | population allocation |
| `club_quality_reorder_invariance` | same division/context/player keys with club order reversed | hidden-quality multiset and per-club entitlement identity are unchanged | at least two clubs per evaluated division | population allocation |
| `role_and_profile_coverage` | created players by canonical role, maturation and longevity profile | numeric-register structural floors | every registered required category observed | population composition/profile policy |
| `ordinary_depth_mass` | `10_11` and `12_13` latent/current bands by lower divisions and higher-tier reserve context | numeric-register share bands | denominator > 0 in every declared context | population policy |
| `special_star_lane_absence` | production call graph and real creation requests | zero desired-star/exact-ceiling inputs and zero old-lane callers | all three creation roots observed | migration/deletion owner |

Checkpoint A GO requires all rows plus global structural gates. REFINE reopens
Step 02 only. A failure of report/reorder purity is `STOP_INSTRUMENT`, not a
population-policy failure.

## Checkpoint B - Forecast And Early Realization

| Metric ID | Population/formula | Binding rule | Non-vacuity | Failure owner |
|---|---|---|---|---|
| `forecast_probability_conservation` | every public assessment | exactly five declared bands, integer basis points, sum `10_000` | all production presentation classes intended by Step 00 observed | forecast policy |
| `forecast_ordering_and_overlap` | forecast class versus latent/reachable distribution on real generated players | elite probability ordered; adjacent classes overlap per numeric register | every compared class has observations | forecast policy |
| `public_assessment_parity` | same player/date/config through AI, valuation, CLI and web adapters | byte-equivalent public payload | at least one player through every consumer path | consumer migration |
| `base_training_reachability` | eligible active player-months with zero participation | positive bounded base-training effect | real zero-minute eligible months > 0 | realization policy |
| `opportunity_acceleration_cap` | paired eligible months with participation/performance | acceleration reached and never exceeds registered cap | both zero-minute and positive-minute rows | realization policy |
| `latent_trajectory_immutability` | player latent bytes before/after two seasons | exact identity | every cohort player reconciled | realization/persistence |
| `maturation_direction` | comparable early/normal/late profiles by family | directional register holds without requiring identical final ability | every required profile/family cell observed | realization curves |
| `serious_damage_reachability` | real serious-injury consequences | both permanent-damage and no-permanent-damage branches reachable; damage limited to declared physical path | eligible serious injuries > 0 or `NOT_EVALUATED` | injury/damage policy |
| `age_37_retirement` | players reaching canonical season-end completed age 37 | retirement share exactly `1.0`; next-season active count above 37 is zero | eligible real-data search population > 0 | exit policy |

Checkpoint B REFINE names Step 04 or Step 05 and the exact metric owner. It may
not move a threshold or widen the corpus after output.

## Checkpoint C - Recruitment And Five-Season Renewal

| Metric ID | Population/formula | Binding rule | Non-vacuity | Failure owner |
|---|---|---|---|---|
| `recruitment_intent_reachability` | unique club-role-season needs | all three intents observed on real clubs | each intent count > 0 | AI need derivation |
| `recruitment_terminal_outcome` | one terminal transition per unique need/candidate channel | numeric-register funnel bands; repeated monthly evaluations excluded | each required intent/channel has a terminal population | target scoring/market constraint |
| `depth_medium_player_reachability` | completed depth acquisitions | at least one registered medium band wins contextually over prospect/star alternatives | real competing candidate set exists | intent scoring |
| `public_only_recruitment` | production read set for needs and scoring | zero latent-trajectory reads | all three intent paths exercised | AI policy migration |
| `free_agent_transition_reconciliation` | opening stock + unique inflow - attributed signings - other unique exits = closing stock | exact player-ID equality | opening or inflow stock > 0 and at least one evaluated need | free-agent facts/instrument |
| `shared_candidate_policy` | owned-market and free-agent candidates for same intent | same need and scoring owner; channel only changes mechanics | both channels reachable | AI policy architecture |
| `generated_player_early_usage` | generated-player appearances/minutes by world/division/season | numeric-register early-use bands | generated eligible players > 0 | population/selection/market owner from attribution |
| `squad_and_tactical_carry` | squad size, exact role floors and Phase 81A formation-diversity readers | original reader semantics and register bands unchanged | every division/season reconciled | squad maintenance or tactical carry owner |

Checkpoint C never treats the current free-agent season cadence as final; it
gates stock/flow reconciliation and policy reachability. Phase 81C later owns
calendar cadence.

## Checkpoints D And E - Fifteen-Season Longitudinal Truth

D attributes; E repeats the exact population/gates after an owner-only change.
Every metric is emitted per world and in aggregate so one world cannot be
hidden by a mean.

| Metric ID | Population/formula | Binding rule | Non-vacuity | Failure owner family |
|---|---|---|---|---|
| `longitudinal_ability_pyramid` | active player-seasons by division/origin/age/role/band | numeric-register share and drift bands | every world/division/five-season window populated | population/realization/market, attributed |
| `generated_usage_share` | generated appearances, minutes, goals, assists, starters and leaders / corresponding totals | numeric-register bands with one unique leader denominator | all numerators and denominators reported even when zero | realization/selection/market |
| `opening_senior_survival` | active opening seniors / opening senior cohort by season | numeric-register trajectory | opening cohort IDs reconcile | aging/retirement/market |
| `forecast_calibration_by_class` | intake forecast class versus judgeable realized maximum band | ordered probabilities/calibration bands; right-censored separate | every binding class has judgeable outcomes or blocks GO | forecast or realization |
| `career_trajectory_realization` | current path versus latent trajectory, timing, opportunity and damage | register bands by ability tier; no mutable-ceiling conversion proxy | judgeable and censored counts both explicit | realization/aging/damage |
| `high_tail_renewal` | generated active/leader `16_plus` by division and cohort | thin non-zero aggregate tail and registered division drift | aggregate opportunities and judgeable cohorts > 0 | population/realization/AI market |
| `retirement_and_veteran_health` | exits at 37, active >37, over-33 starts/minutes/goals/assists and top-performer ages | age-37 exact invariant plus historical register | eligible player-seasons > 0 | aging/retirement/selection |
| `succession_chain` | aging-incumbent need -> preparation/acquisition -> sale/retention -> replacement or reopened need | registered completion/failure taxonomy | real succession needs > 0 | AI need/scoring/market constraint |
| `useful_level_movement` | transferred player's pre/post competitive level and use | registered directional bands, split by intent | completed transfers > 0 | scoring/market constraints |
| `football_health_carry` | champion points/goals, upset monitors, squad/finance/formation readers | original formulas and numeric register | only canonical completed competitions; incomplete are `NOT_EVALUATED` | named existing owner or Phase 81C visibility |

For every red row, D writes one primary owner from `population`, `forecast`,
`realization`, `aging_damage`, `retirement`, `ai_need`, `target_scoring`,
`market_constraint` or `instrument`, plus cross-cutting facts and censoring.
Unpaired multi-change differences remain unresolved. E uses the same formulas,
seeds, thresholds and owners; only the declared candidate version may differ.

## Checkpoint F - Twenty-Season Breadth

The `7 x 20` canary is an operational preflight. It validates profile routing,
non-vacuity, shard/checkpoint behavior, report shape and JSON-to-HTML rendering;
it does not authorize target changes or gameplay conclusions.

The `50 x 20` acceptance profile re-evaluates every D/E gate whose original
population remains meaningful and reports four fixed windows: `1-5`, `6-10`,
`11-15`, `16-20`. Original ten/fifteen-season gates retain their original
denominator and are displayed beside, not replaced by, twenty-season
diagnostics.

Additional F structural rows:

| Metric ID | Population/formula | Binding rule | Non-vacuity | Owner |
|---|---|---|---|---|
| `stable_shard_reconciliation` | 50 declared one-world shards versus aggregate | exact ID/count/hash reconciliation | all 50 shards present once | checkpoint runner |
| `resume_rebuild_identity` | uninterrupted, resumed and rebuilt canonical artifacts for same profile | byte-identical canonical JSON | both execution paths completed | checkpoint/cache/report contract |
| `five_season_window_visibility` | every long-run metric emitted for four declared windows | all windows present; drift targets only when already frozen in Step 00 | every visible canonical population reported | evaluator/report assembly |
| `html_derivation_identity` | HTML rebuilt twice from the same canonical JSON | byte-identical; no renderer metric/gate | canonical JSON parses and every section renders | HTML renderer |
| `truthful_competition_visibility` | league tables/leaders shown only for canonically completed competitions | incomplete competitions visibly `NOT_EVALUATED` | visibility map covers every requested competition | producer/report presentation |
| `formation_source_integrity` | fielded formations and selector-source facts | fallback/default source count zero; original diversity reader remains green | real fielded matches > 0 | team selection/report source |

The HTML is a human review artifact, not a formula owner. No result first seen
in the canary or HTML may change a target. A new issue becomes a documented
follow-up/owner, or blocks closeout if it violates a frozen gate.

## Incremental Decision Ladder

| After | Checkpoint | What it can open | What a failure reopens |
|---|---|---|---|
| Step 00 | frozen unchanged baseline | Step 01 | instrument/register only |
| Steps 01-02 | A `7 x 1` | Step 04 | Step 02 or instrument |
| Steps 04-05 | B `7 x 2` | Step 07 | Step 04, Step 05 or instrument |
| Steps 07-08 | C `7 x 5` | D | Step 07, Step 08 or instrument |
| C GO | D `7 x 15` | Step 11 or E | no code in D; names owner |
| Step 11 | E `7 x 15` | F | only demonstrated owner/instrument |
| E GO | F canary `7 x 20`, then acceptance `50 x 20` | Step 14 | operational/report owner or frozen gameplay owner |

No later green checkpoint can launder an earlier red gate. No sample may be
shrunk after a failure. Any newly necessary gameplay correction after D becomes
a named owner step followed by the identical D/E population before F.
