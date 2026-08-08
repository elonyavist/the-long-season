# Step 07 - Checkpointed 750x10 World-Integrity Cohort And Diagnostic View

## Status

Not started. Final Phase 81B checkpoint; requires Step 06 authorization.

## Goal

Run a complete, resumable simulation of `750` independently seeded career
worlds for `10` seasons, verify that the contextual match engine still produces
credible football inside the completed selected-division world, and make the
result inspectable through one canonical report plus a derived local view.

This is deliberately Phase 81B Step 07 rather than Phase 81A Step 17. Phase 81A
can certify tactical agency, but it does not yet have the background fixtures
that make a league table, scorer chart or assist chart complete. Step 04 of this
phase is the first owner that feeds background results into the existing table,
scorer and player-statistics aggregation.

## User-Facing Reason

A tactical model is not healthy merely because its isolated balance gates pass.
Across ten seasons it must still produce leagues worth following: believable
scores and point totals, different champions and standout players, recognisable
scorers and creators, sustainable squads, and a transfer flow that does not
empty or flood the world. The large cohort exists to catch slow drift and rare
failure modes before more market complexity is built on top.

## Evidence Boundary

This cohort observes:

- the completed Phase 81A contextual engine;
- complete fixtures, tables and player statistics for the selected club's
  division;
- season-anchored contracts, permanent transfers already present in the world,
  and Phase 81B free-agent signings;
- ten successive seasons of promotion/relegation, player aging, development,
  contracts, finance and squad maintenance already owned by the career runner.

It cannot observe loans, sale/loan postures, incoming manager offers,
competitive transfer races, or player choice between rival suitors. Those facts
do not exist until Phases 82A and 82B. The report labels them `not_evaluated` and
never treats this run as a replacement for Phase 82B Step 09's competitive
market cohort.

It also covers only the selected club's division. Other domestic divisions are
present as career structure but are not resolved fixture by fixture by this
phase; cups and foreign countries remain outside the population. Every metric
records that boundary beside its value.

## Frozen Execution Contract

Step 06 freezes this block before the first acceptance seed is simulated:

- locked profile family: `phase81b-world-integrity-*-v1`;
- seed prefix: `phase81b-world-integrity-750x10-v1`;
- exactly `750` worlds and exactly `10` seasons per world;
- exactly `750` stable one-world shards;
- exactly `7` workers, enforced by the command before any checkpoint runs;
- every fixture reaches the canonical Phase 81A/81B career team-selection and
  background-match producer; no world-integrity call can take a fixed-formation
  fallback;
- one explicit checkpoint directory and stable canonical shard ordering;
- acceptance seeds unused by Phase 81A calibration, Step 01 bands or Step 06;
- fresh run followed by a no-work resume from all checkpoints;
- ordered shard hashes and aggregate hash identical on resume;
- throughput, expected duration and maximum wall clock written into Step 06
  before execution and never changed because the result is inconvenient.

The Phase 81 `50 x 20` ran `1000` world-seasons in about `2h 54m`, so a purely
linear fixed-shape reference for `7500` world-seasons is about `21h 45m`. It is
a lower bound, not the Step 07 budget: Phase 81 Step 09 measured canonical
23-shape selection at `383ms` for `270` clubs versus `123ms` on the fixed path,
about `3.1x`, before Step 04's background-fixture work. Step 06 derives its
preliminary budget from the canonical-selector measurement and Step 04 timings;
the `7 x 10` canary then validates that estimate. If it is materially wrong,
Step 06 is reopened to revise only the operational budget before any acceptance
seed runs.
A timeout is an operational-budget finding, not a correctness verdict;
completed shards remain resumable.

The acceptance run executes alone. It never shares the host with `pnpm check`,
Playwright, a build or another simulation gate.

## Bounded Preflight, Not Evidence

Before spending the full budget:

1. focused tests exercise aggregation, reconciliation, the diagnostic view and
   rejected worker/world/season contracts without a long run;
2. a deterministic `7 x 10` prefix, one world per worker, validates throughput,
   memory, checkpoint writes and report shape;
3. the prefix is labelled `canary`, may not satisfy a balance gate, and may not
   be quoted as cohort evidence;
4. any implementation defect reopens this step before the `750 x 10`; any
   threshold or population defect reopens Step 06 before acceptance seeds run.

The canary uses the shared long-run path. It must not create a second miniature
simulator, second report model or alternate balance policy.

`validateWorldIntegrityCohortContract(...)` accepts only two total profiles:
the exact `7 x 10` canary and the exact `750 x 10` acceptance run. Both require
the same locked world-integrity profile family, contextual career producer,
Markdown formatter, HTML formatter and exactly `7` workers. The canary is not an
arbitrary smaller balance mode.

## Canonical Data Ownership

- Extend `runTenSeasonReportCommand(...)` with the frozen report kind; do not add
  a new top-level simulator command.
- Extend the resumable path around `createResumableLongRunGateReport(...)` so
  existing shard/checkpoint policy remains the sole execution owner.
- Deepen `createSingleWorldReport(...)` with an explicit typed execution policy.
  Legacy report kinds may retain their frozen `4-4-2` comparability path;
  the world-integrity profile must use the Phase 81A/81B career-fixture progression,
  including `selectCareerAiTeam(...)`, and must reject the legacy
  `formationForClub ?? "4-4-2"` path. A worker never computes a result through a
  diagnostic-only engine or a seeded `assignFormationsByClub(...)` substitute.
- The unattended selected club is an explicit `automated_manager_proxy`: the
  runner calls `selectCareerAiTeam(...)` and supplies that context through the
  ordinary selected-club seam. It receives no oracle and no hidden information.
  Background clubs reach the same selector through the normal AI seam. This
  keeps the long run playable without pretending an unattended batch is proof
  of realized human-manager agency; Phase 81A Checkpoints D-F own that proof.
- Read the actually fielded shape and decision facts from canonical fixture
  output such as `ProgressCareerFixtureAdvanced.fieldedLineups` and the
  background equivalent introduced by Step 04; never recompute them after the
  match from current squad ownership.
- Deepen `buildSeasonRecap(...)` once for the extra player identity facts. Its
  existing table, goals, assists, appearances, club and canonical role remain
  the source for every chart.
- Derive completed age at the season-end `GameDate` through the canonical
  `completedPlayerAge(...)`; do not store age or recompute it with `days / 365`.
- Read transfer movements from canonical `CareerState.transferHistory`. Capture
  the reporting row at the season boundary while the relevant player facts are
  available; do not infer old transfers from final club ownership.
- Keep stable player/club IDs in the canonical model. Localized names and labels
  are presentation joins and are never used for ordering, identity or gates.
- Every sort has a deterministic final ID tie-breaker. No result depends on
  worker completion order, map insertion order or catalog order.

## Canonical Report

Write `docs/audits/PHASE_81B_750X10_WORLD_INTEGRITY_REPORT.md`. Large raw world
facts remain in checkpoint shards outside version control; the committed report
contains bounded aggregates, reconciliation totals and preregistered examples,
not a dump of `7500` full season tables.

### 1. Execution And Population

Record seed prefix, world/season/shard counts, actual worker count, fresh versus
resumed worlds, elapsed time, peak memory when measurable, ordered shard hashes,
aggregate hash, selected-division population and every unavailable population.

### 2. Match And Goal Production

For each season number and over all `7500` seasons, report distribution summaries
for played fixtures, total goals, goals per match, home/draw/away shares, clean
sheets, scoreline frequencies and zero-, one-, two-, three- and four-plus-goal
matches. Preserve the inherited goal-rate monitor and the existing reachable
`SEASON_RECAP_BANDS`; Step 07 does not invent replacement bands after seeing
the higher-resolution output.

### 3. League Tables And Points

Report champion, final table position, played/won/drawn/lost, goals for/against,
goal difference and points for every preregistered example season. Across the
cohort report champion points, bottom points, points spread, draw rate,
promotion/relegation frequency, repeated champions and the distribution of club
finishes. Dynasties, collapses and surprise seasons are football stories, not
automatic failures; the report separates rare credible variance from structural
dominance.

### 4. Scorer And Assist Charts

For each preregistered example season print top-scorer and top-assist tables with:

- name and stable player ID;
- completed age at that season's end;
- canonical role;
- season-statistics club;
- appearances, goals and assists;
- goals or assists per appearance when the denominator is positive.

Across all seasons report top-one and top-ten production, age/role distributions,
repeat leaders and concentration. A player changing clubs is attributed to the
club on the canonical season-statistics row; the view never substitutes current
final-world ownership.

### 5. Transfers And Squad Sustainability

Report permanent transfers and free-agent signings separately, by season,
division, age and role: counts, fees where applicable, buying/selling club,
arrivals per club, contract-expiry contribution, pool peak/trough/drain and
players leaving football. Reconcile the totals to `transferHistory`, finance
ledgers and club ownership. Loan and race columns are `not_evaluated`.

### 6. Tactical Use In Real Careers

Report formation, tactic and `lateralFocus` usage by club/season, automated
selected-club proxy versus background AI clubs, stable opponent-read
availability and the real-career versions of the Phase 81A non-dominance
monitors. This is an observational distribution, not an oracle best-response
search or a new manager-agency claim. It may reveal that an AI selector
collapses to a small catalog subset, but it must not choose a different tactic
to make the chart look varied.

The report records selection-source counts and fails if even one
world-integrity fixture used the legacy fixed-shape fallback. It prints the
observed formation distribution by season and requires the existing reachable
`distinct_formations >= 5` season-recap gate on its declared population. A
constant `4-4-2` column therefore fails before any engine conclusion can be
drawn.

### 7. Structural Warnings And Outliers

Record every Phase 81B-owned failure, every inherited warning and its original
owner, and the population behind each count. Pre-existing unowned checks remain
visible and do not make the command's exit code a substitute for the decision
table. Primary examples are selected without output access. A separate
display-only appendix may show tail and warning cases through the deterministic
metric ordering frozen in Step 06; those cases enter no gate or denominator.

## Mandatory Reconciliation

The report fails closed when any of these equalities is false:

- each final table contains the complete selected division and every club has
  the expected number of played fixtures;
- table wins equal table losses, and all table arithmetic reconciles;
- sum of table goals for equals sum of table goals against and resolved fixture
  goals;
- player goals reconcile to structured credited goal events, with own goals or
  other explicitly uncredited categories reported separately rather than hidden;
- player assists never exceed assist-eligible goals, and unassisted goals are
  reported explicitly;
- transfer and free-agent chart totals equal canonical history totals and their
  finance/ownership effects;
- every chart row resolves a stable player, role, age reference date and
  season-statistics club;
- every aggregate denominator equals the declared observed population.

## Diagnostic View

Generate a self-contained local HTML view from the already-created canonical
`WorldIntegrityCohortReport`. It is an inspection surface, not a shipped career
screen and not an owner of simulation or aggregation.

The view contains:

- **Overview:** status, population, execution, warnings and season-by-season
  trends;
- **Leagues:** representative final tables, points distributions, champions,
  promotions and relegations;
- **Goals and assists:** scorer/assist tables with name, age, role and club,
  plus role/age distributions;
- **Transfers:** movement volume, fees, age/role mix and free-agent cycle;
- **Tactics:** formation, plan and lateral-focus usage without presenting
  popularity as strength;
- **World explorer:** only the deterministically preregistered worlds/seasons,
  with their stable seeds shown;
- **Integrity:** reconciliations, inherited warnings, phase-owned failures and
  explicit `not_evaluated` capabilities.

The Markdown report is canonical. The HTML formatter may filter and render the
report model but contains no formula, threshold, classification or copied data
table. Rebuilding it from identical checkpoints produces byte-identical output.
It uses localized labels through the existing i18n layer, semantic tables and
landmarks, keyboard-operable controls, visible focus, no color-only status and a
usable narrow viewport. Motion classification is `none` unless a later review
proves a transition clarifies state; reduced motion therefore changes nothing.

The generated HTML and checkpoints are local artifacts and are not committed.
Checkpoint paths reuse the already-ignored `saves/` convention and generated
reports/views reuse the already-ignored `simulation-out/` convention; no
unignored `.tmp/` path is permitted. The report records the exact reproduction
command and output path.

## Gates And Decision

Step 06 preregisters the complete decision table. At minimum, `GO` requires:

- execution, hash/resume and all mandatory reconciliation gates pass;
- fixed-formation fallback observations equal `0`, canonical career-selection
  observations equal the full declared fixture population, and the existing
  `distinct_formations >= 5` gate is evaluated rather than bypassed;
- exactly `7` actual workers, `750` one-world shards, `750` resumed worlds and
  `0` simulated worlds on the second run;
- every Phase 81B-owned density and free-agent-cycle gate remains inside its
  frozen band;
- inherited Phase 81A/season-recap gates are evaluated on their declared
  populations without a threshold change, and any higher-resolution miss is
  reported rather than hidden by reducing the sample;
- zero new Phase 81B-owned structural integrity failure;
- the view is byte-identical on rebuild and passes desktop/narrow visual,
  keyboard and localization checks.

Decision outcomes:

- **GO:** close Phase 81B and activate Phase 82A only if Step 06's market-density
  recommendation still authorizes it.
- **REFINE:** reopen only the named Phase 81B owner, rerun its bounded checkpoint,
  then invalidate and repeat the full acceptance cohort on the same frozen
  contract. Old checkpoints may not be mixed with changed code or versions.
- **STOP / RETHINK:** a systemic engine, world-integrity or market-foundation
  failure blocks Phase 82A. Do not loosen a band, suppress a warning or shrink
  the population.
- **OUTSIDE SCOPE:** a loan/race absence remains `not_evaluated`; it cannot fail
  or pass this phase and stays owned by Phase 82A/82B.

## What To Implement

- The two locked world-integrity profiles and their exact contract validation.
- Exactly two accepted command profiles, `7 x 10` canary and `750 x 10`
  acceptance, both exercising the same report and view formatters.
- Canonical per-fixture formation, tactic and lateral-focus selection from the
  real squad and permitted opponent information; remove the implicit `4-4-2`
  fallback from the world-integrity path without changing legacy-report
  comparability.
- Selection-source and formation-distribution evidence proving that every
  observed fixture used that path.
- Resumable one-world shards through the existing long-run checkpoint owner.
- One canonical typed report model and Markdown formatter.
- The minimum recap identity extension needed for exact season-end age.
- Transfer, tactical and league summaries derived from existing facts.
- The pure local diagnostic-view formatter over the canonical report model.
- Focused reachability, reconciliation, determinism, rejected-contract,
  localization and view tests.
- The fresh run, no-work resume, report, manual findings and phase handoff.

## What NOT To Implement

- No second simulator, second advancement clock, background-specific engine,
  seeded formation assignment, duplicated standings/statistics aggregator or
  browser-side recomputation.
- No fixed formation, `4-4-2` fallback or inspection-only `formationForClub`
  callback in either world-integrity profile.
- No tuning, new threshold or example selection after acceptance output exists.
- No raw `7500`-season dump committed to Git.
- No persistence of age, rendered name, report-only rows or view state into the
  career save.
- No fixtures outside the selected division, cups or foreign-country aggregate.
- No loans, postures, incoming offers, races or player-choice simulation.
- No product dashboard or new career navigation; the view remains diagnostic.
- No Phase 79 Step 14/15 implementation or claim.

## Expected Files

- `apps/cli/src/commands/simulation-report.ts`
- `apps/cli/src/commands/simulation-report.test.ts`
- `apps/cli/src/commands/simulation-report/report-registry.ts`
- `apps/cli/src/commands/simulation-report/career-world-facts.ts`
- `apps/cli/src/commands/simulation-report/locked-profile-sections.ts`
- `apps/cli/src/commands/simulation-report/world-integrity-profile.ts`
- `apps/cli/src/commands/simulation-report/world-integrity-profile.test.ts`
- `apps/cli/src/commands/simulation-report/report-html.ts`
- `apps/cli/src/commands/simulation-report/report-html.test.ts`
- `packages/simulation-tools/src/season-recap/season-recap.ts`
- `packages/simulation-tools/src/season-recap/season-recap.test.ts`
- `packages/simulation-tools/src/index.ts`
- `packages/i18n/src/catalogs/en.ts`
- `packages/i18n/src/catalogs/it.ts`
- `packages/i18n/src/catalogs/de.ts`
- `packages/i18n/src/catalogs/es.ts`
- `packages/i18n/src/catalogs/fr.ts`
- `docs/audits/PHASE_81B_750X10_WORLD_INTEGRITY_REPORT.md`
- `docs/audits/PHASE_81B_MARKET_ECONOMY_REPORT.md`
- `docs/audits/README.md`
- `docs/PROJECT_STATUS.md`
- `docs/steps/README.md`
- `docs/roadmaps/CAREER_PLAYABILITY_AND_ENGINE_ROADMAP.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- this phase README
- this step document
- `../82a-incoming-offers-market-postures-and-loans/README.md`

The expected-file list is the Graphify-informed first draft from
`buildSeasonRecap(...)` and the existing resumable report path. Before
implementation, run `graphify update .`, then `graphify affected` on every
shared symbol actually changed; Step 07 must narrow or explicitly justify this
list rather than treating it as blanket authority.

## Required Checks

Run every gate alone. The full acceptance command must report seven actual
workers before its output can count as evidence.

```bash
nvm use 24
pnpm exec vitest run \
  packages/simulation-tools/src/season-recap/season-recap.test.ts \
  apps/cli/src/commands/simulation-report.test.ts \
  apps/cli/src/commands/simulation-report/world-integrity-profile.test.ts \
  apps/cli/src/commands/simulation-report/report-html.test.ts

pnpm cli simulation-report \
  --profile=phase81b-world-integrity-canary-7x10-v1 \
  --format=json \
  --report-output=simulation-out/phase81b-world-integrity-canary-v1/report.json

pnpm cli simulation-report \
  --from-report=simulation-out/phase81b-world-integrity-canary-v1/report.json \
  --format=html \
  --report-output=simulation-out/phase81b-world-integrity-canary-v1/index.html

pnpm cli simulation-report \
  --profile=phase81b-world-integrity-750x10-v1 \
  --format=json \
  --report-output=simulation-out/phase81b-world-integrity-750x10-v1/report.json

pnpm cli simulation-report \
  --from-report=simulation-out/phase81b-world-integrity-750x10-v1/report.json \
  --format=html \
  --report-output=simulation-out/phase81b-world-integrity-750x10-v1/index.html

# Repeat the acceptance profile unchanged to prove checkpoint resume/rebuild.
pnpm cli simulation-report \
  --profile=phase81b-world-integrity-750x10-v1 \
  --format=json \
  --report-output=simulation-out/phase81b-world-integrity-750x10-v1/report.json

pnpm check
pnpm --filter @game/web run build
pnpm web:visual:qa
pnpm depcruise
git diff --check
graphify update .
```

The diagnostic HTML is also inspected directly at desktop and narrow widths;
record screenshot paths, keyboard/focus findings and the byte-identical rebuild
hash in the phase report. Its visual check may use a focused Playwright harness,
but must not turn the local artifact into an application route.

## Definition Of Done

- Step 06 froze the complete contract and examples before acceptance output.
- The `7 x 10` canary is recorded as operational evidence only.
- Canary and acceptance both use locked profiles from the same world-integrity
  family, the canonical career
  selector and both output formatters; neither records a fixed-shape fallback.
- The fresh `750 x 10` finishes with exactly `750` one-world shards and exactly
  `7` workers.
- The immediate resume reports `750` resumed worlds, `0` simulated worlds,
  identical ordered shard hashes and an identical aggregate hash.
- Complete selected-division tables, goals, assists, points, scorers, creators,
  transfers, free-agent cycle and tactical usage are reported over their exact
  populations, with name, season-end age and role on player charts.
- Selection-source counts cover every observed fixture, fallback count is `0`,
  and the formation distribution proves the run did not repeat the Phase 81
  all-`4-4-2` population.
- Every mandatory reconciliation passes and every `not_evaluated` population is
  explicit.
- The diagnostic view is derived only from the canonical report, rebuilds
  byte-identically and passes visual, keyboard, narrow-width and localization
  inspection.
- Findings distinguish healthy football variance, monitoring signals,
  threshold semantics and genuine defects; nothing is tuned merely to make the
  report greener.
- Repository, browser, accessibility, persistence, dependency, diff and
  Graphify gates pass.
- Phase 81B closes truthfully, or remains blocked with the failed owner named.
  Phase 82A starts only on `GO` plus Step 06's evidence-based recommendation.
