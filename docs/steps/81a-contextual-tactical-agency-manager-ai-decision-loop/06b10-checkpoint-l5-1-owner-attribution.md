# Step 06B10 - Checkpoint L5.1: Table, Player And Identity Owner Attribution

## Status

`REFINE` on 2026-08-09. The canonical `7 x 10` completed with zero
reconciliation failures, but only `playerLoad = renewal_quality` was
attributed. Table hierarchy, leader production and club identity returned
`not_attributed`. The emitted `PASS / OWNER_IDENTIFIED` exposed a fail-open gate
bug: successful reconciliation was incorrectly sufficient for success.

## Goal

Attribute four observed deviations before correcting any of them:

1. first-division tables are too compressed;
2. players aged `30+`, especially `33+`, retain too much late-career load;
3. goals and assists are too diffuse across players;
4. annual role continuity preserves the league but erodes individual club
   tactical identity.

## Locked Population

- profile: a new locked L5.1 profile registered under the sole
  `pnpm cli simulation-report` entrypoint;
- exactly `7` worlds x `10` seasons x `3` competitions;
- first-division benchmark readers consume only the `70` first-division
  league-seasons;
- seven workers exactly;
- seed prefix must be declared before execution and must not reuse a seed
  chosen for coefficient tuning;
- canonical JSON artifact plus byte-identical English desktop HTML rendering;
- the existing L5 artifact remains the before-state and is never overwritten.

The checkpoint profile may reuse the canonical canary seed prefix only for an
explicit same-world instrumentation replay, because no gameplay value changes.
If instrumentation changes RNG, fielded lineups or results, the run is invalid
and returns `STOP / RETHINK` rather than being compared.

## Instrumentation Contract

### Table hierarchy

Record per fixture and per season:

- exact kickoff `TeamStrength` already consumed by the match context;
- home/away overall and department gaps;
- favorite side with stable tie handling;
- result, goal difference and draw;
- strength-gap bucket, favorite win share and favorite points per match;
- rank correlation between season-average kickoff strength and final points;
- opening, per-season and closing club-strength spread;
- champion points, last points, champion-last spread, PPG deviation and draw
  share.

The exact kickoff strength is a boundary fact: it may be carried beside the
fielded team in `SimulateSeasonResult` because post-season player state cannot
reconstruct it. It must not be persisted in career state or re-derived from a
later squad.

Attribution rules, declared before output:

- **`population_strength`**: kickoff strength itself lacks a stable top-bottom
  hierarchy or does not reflect the current competitive tiers;
- **`match_translation`**: strength hierarchy is material but favorite win
  share, points and final table separation do not respond to its gap;
- **`draw_resolution`**: strength-response is material outside drawn matches,
  while excess draws erase the table separation;
- **`not_attributed`**: none of those conditions identifies a unique owner.

`deriveOpportunityQuality(...)` is a candidate only under
`match_translation`; generation bands are candidates only under
`population_strength`. No direct tier-to-result term is admissible.

The executable rule is frozen as follows: a mean first-division kickoff spread
below `1.0` identifies `population_strength`; otherwise excess draws above
`0.292` identify `draw_resolution` only when favorites win at least `0.65` of
fixtures in the `>= 1.0` strength-gap bucket; otherwise rank correlation below
`0.45` or favorite points below `1.8` per match in that same bucket identify
`match_translation`. Anything else is `not_attributed`.

### Player load and renewal

Record per season, origin, age band, role and current-quality band:

- active and selected players;
- appearances, starts and minutes;
- current ability and reachable potential room;
- shooter nominations, creator nominations, shots, shots on target, goals and
  credited assists;
- leader-table rows and club share of production.

The opportunity counts derive at the match boundary from canonical match
events. The season result may retain compact per-player counts because full
match reports are intentionally discarded; a report Adapter must not simulate
or reconstruct them later.

Attribution rules:

- **`selection_load`**: older players retain more starts/minutes than
  quality-matched younger players before actor selection;
- **`renewal_quality`**: generated mature cohorts do not reach the current
  quality of retained opening seniors despite credible minutes and potential
  realization;
- **`actor_allocation`**: stronger task-fit attackers/creators receive an
  insufficient share of nominations inside the same role and minute band;
- **`occasion_execution`**: nominations concentrate credibly but goals or
  assist credit remain too flat afterwards;
- **`not_attributed`**: observed correlations cannot separate the branches.

Age is a stratification fact only. It never enters shooter/creator weights or
goal/assist formulas.

The executable load rule identifies `selection_load` only when first-division
players aged `33+` average more than `17` starts and beat quality-, role- and
season-matched players aged `24..29` by more than `2` starts. Otherwise a
season-ten generated-leader share below `0.30` beside an opening-leader share
above `0.50` identifies `renewal_quality`. Leader production is low when either
mean top-ten goals are below `14.5` or assists below `8.0`; mean within-role
ability-to-nomination rank correlation below `0.20` then identifies
`actor_allocation`, otherwise `occasion_execution`.

### Club role identity

For each club and season record:

- opening squad identity and opening primary-role vector;
- annual intake roles allocated to that club;
- current primary-role vector;
- modal formation and all selected shapes;
- distance from the opening role blueprint;
- whether shape loss follows role-vector erosion while current quality remains
  comparable.

Attribution is **`annual_intake_identity_erosion`** only when within-club role
distance predicts loss of the carried four-replicated-shape property and the
competition-wide role deck remains healthy. Otherwise it is
`not_attributed`; no persistent blueprint is implemented.

The executable rule additionally requires four-replicated-shape retention below
`0.95`, zero role-plan reconciliation failures, all ten roles in every observed
annual deck, at least one changed-shape club within `0.5` current-ability points
of its opening level, and changed-shape normalized role distance at least `0.05`
above stable-shape distance. These values were in code before the non-evidentiary
`1 x 1` wiring preflight and cannot move after any checkpoint output.

## Frozen Gates And Guardrails

L5.1 does not require the current engine to pass the new product targets. It
requires admissible attribution and preserves:

- all substitution, availability, injury and reconciliation gates;
- goals per match `2.48..3.03` and draw share `0.218..0.292` for the first
  division as non-regression observations;
- zero direct age/output or tier/result term;
- current `no_dominant_*`, tactical diversity, stable-ID, rarity, value and
  economy gates;
- byte-identical results, events and RNG relative to the same-world L5
  before-state when only instrumentation changed.

## Decision

- **GO:** every red family receives one admissible owner classification and
  instrumentation is outcome/RNG-neutral. Open only the corresponding owner
  steps.
- **REFINE:** a canonical fact is absent, duplicated, unreconciled or measured
  at the wrong lifecycle boundary. Fix only L5.1 instrumentation and rerun.
- **STOP / RETHINK:** attribution requires a second simulator, reconstructed
  match facts, hidden future state, direct age/output control or direct
  club-tier result control.

A family returning `not_attributed` remains closed even if the other families
receive `GO`.

## Expected Files

Verified against production code and `graphify affected` before editing:

- `packages/engine/src/match-engine/step-match.ts` and tests: retain the exact
  selected creator on the engine-local shot outcome. `createMatchReport(...)`
  deliberately omits this diagnostic field, so no durable event or save schema
  changes;
- `packages/engine/src/use-cases/simulate-season.ts` and tests: compact kickoff
  strength plus season-level player opportunity rows at the only boundary where
  both are exact;
- `packages/engine/src/index.ts`: re-export the new season result row type beside
  the result that owns it;
- `packages/engine/src/match-engine/simulate-match.test.ts`: the full engine-
  local golden now records the selected creator carried by the diagnostic shot
  event. The first full gate exposed this omitted consumer; score, RNG, durable
  report and every pre-existing event field remain unchanged;
- `apps/cli/src/commands/simulation-report/owner-attribution.ts` and tests
  **(new)**: read-only L5.1 observer, reconciliation and the preregistered owner
  decision. Keeping this out of `career-sections.ts` prevents another checkpoint
  from becoming report orchestration code;
- `apps/cli/src/commands/simulation-report/career-sections.ts` and tests: attach
  the observer to the existing all-competition callback and route one decision;
- `apps/cli/src/commands/simulation-report/report-registry.ts` and tests: one
  locked profile, cache suffix and seven-worker request;
- `apps/cli/src/commands/simulation-report/report-planner.test.ts`: prove the
  locked population and reject a six-worker invocation before execution;
- `packages/i18n/src/labels.ts` plus all five locale catalogs: profile title and
  description only. The audit artifact and English developer HTML remain English
  by contract;
- the generic canonical HTML renderer is unchanged: it displays the recorded
  L5.1 JSON and owns no formula or gate;
- `docs/audits/PHASE_81A_CHECKPOINT_L5_1_OWNER_ATTRIBUTION.md` **(new)**;
- `docs/audits/PHASE_81A_POST_L5_CORRECTION_TRANCHE.md` **(new)**;
- `docs/audits/README.md`;
- this step document;
- the exact next owner-step document selected by the decision;
- Steps `06B10A..06B10H` **(new correction contracts explicitly requested by
  the product owner)**;
- phase `README.md`;
- `docs/PROJECT_STATUS.md`.

## Required Checks

```bash
nvm use 24
pnpm cli simulation-report --profile=phase81a-l5-1-owner-attribution-7x10 --workers=7 --format=json --report-output=simulation-out/phase81a-l5-1-owner-attribution-7x10.json
pnpm cli simulation-report --from-report=simulation-out/phase81a-l5-1-owner-attribution-7x10.json --format=html --report-output=simulation-out/phase81a-l5-1-owner-attribution-7x10.html
pnpm check
git diff --check
graphify update .
```

The simulation and repository gate run alone. Capture the actual command exit
code without a pipe.

## Definition Of Done

- every number names its population and lifecycle boundary;
- same-world instrumentation changes no result or RNG consumption;
- opportunity counts reconcile with match and season totals;
- each family receives one declared owner or `not_attributed`;
- no gameplay coefficient, threshold or population is changed;
- only demonstrated owner steps are opened.

## Recorded Outcome

The run used exactly seven workers and wrote the `77 MB` canonical JSON
artifact with process exit `0`. That exit is rejected as checkpoint evidence:
`evaluateOwnerAttributionCheckpoint(...)` returned `OWNER_IDENTIFIED` from zero
reconciliation alone while three required owner values were
`not_attributed`.

Observed first-division facts over `70` league-seasons:

- champion points `66.9857`, spread `40.8143`, PPG deviation `0.3284`;
- `33+` starts `23.1374`, minutes `1911.28`;
- generated/opening leader shares `0.2262` / `0.7738`;
- shooter/creator quality-to-nomination correlations `0.0205` / `0.0261`;
- L5.1 identity retention `1.0000`, inconsistent in meaning with integrated
  L5's canonical `0.8905` gate.

No gameplay step opens. Amendment A5 inserts 06B10A-06B10H to freeze the
remaining lower-league baselines, repair fail-closed semantics, align the exact
metrics and attribute each family independently before retrying L5.1.
