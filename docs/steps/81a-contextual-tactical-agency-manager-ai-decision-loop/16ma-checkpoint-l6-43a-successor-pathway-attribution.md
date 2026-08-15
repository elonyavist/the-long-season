# Step 16M-A - Checkpoint L6.43A Successor Pathway Attribution

## Status

**Done - `OWNER_IDENTIFIED: development_realization` on 2026-08-15.** Diagnostic
instrumentation and paired measurement only. No gameplay coefficient,
selection rule, academy capacity, promotion rule, minute allocation, growth
curve, market rule or leadership formula changed in this step.

## User-Facing Question

Why do selected future replacements fail to become senior football stories?
The game should create uncertain but legible succession: clubs may develop,
sell or lose a prospect, but a national successor policy must not silently
discard almost every selected player before he can compete for a place.

## Frozen Population

- the same seven L6.43 world seeds, ten seasons and exact seven-worker policy;
- fresh paired control and candidate arms in one `simulation-report` profile;
- identical world, player IDs, calendar, fixtures, AI and market;
- the normal product arm uses pre-16L successor semantics;
- the candidate policy is an explicit analysis oracle, never the product
  default, and has this step as removal owner;
- selected cohorts are the candidate arm's canonical exact-five assignments;
- a player is joined by stable `playerId`, never name or final ownership;
- facts are recorded at the boundary where each state exists; a terminal reason
  is never reconstructed from the season-ten squad alone.

The completed L6.43 artifact is evidence for the question, not a cache for this
run: new lifecycle facts require a fresh paired simulation.

## Canonical Pathway

Each selected exact-five player has one monotone pathway:

1. `accepted_assignment` - the allocator's selected player is present in the
   canonical intake `acceptedPlayerIds`, with current below five-star and stored
   ceiling exactly five-star;
2. `academy_exit_resolved` - the age-20 lifecycle boundary records promotion,
   external-move or release candidacy;
3. `senior_registered` - first canonical senior ownership observation;
4. `senior_used` - reaches at least one senior appearance;
5. `development_minutes` - reaches `900` accumulated senior minutes;
6. `current16` - reaches canonical primary-role current ability `>=16`;
7. `first_division_current16` - is current `>=16` in the First Division;
8. `season_ten_retained` - remains current `>=16` in the First Division at
    season ten;
9. `season_ten_leader` - appears in the canonical season-ten top-ten scorer or
    creator rows.

Stages describe observations, not promises. A player may be transferred and
continue progressing; club changes never reset the pathway.

## Exclusive Terminal Reasons

Assignment already implies generation and academy admission: the content
provider is called only after real open slots exist, and the runner rejects any
assigned ID missing from canonical `acceptedPlayerIds`. Storing separate booleans
for those three names would duplicate one fact. A mismatch is therefore
`STOP_INSTRUMENT`, not a product terminal reason.

Every accepted assignment not reaching `season_ten_leader` receives exactly one
terminal or latest-open state from this ordered vocabulary:

- `academy_still_developing`;
- `academy_released_at_age_out`;
- `academy_external_move_unregistered`;
- `promotion_candidate_unregistered`;
- `senior_registered_no_appearance`;
- `senior_minutes_below_900`;
- `stored_ceiling_below_16`;
- `development_below_16`;
- `left_first_division`;
- `current16_not_retained`;
- `senior_current16_not_leader`;
- `season_ten_leader`.

`academy_still_developing` and other open-window states are diagnostic, never a
failure attributed to an owner. The evaluator must reconcile assignments,
stages and terminal reasons exactly; `unknown` is forbidden.

## Required Diagnostics

For candidate selected IDs, and for the same ID in control wherever that player
exists, record per world and player:

- assignment season, club, role, age and development environment;
- accepted intake plus academy-exit status and boundary season;
- first senior club/division, appearances and cumulative minutes;
- canonical current, stored-ceiling, p50 and upper abilities at assignment and every
  observed season;
- transfer and free-agent transitions from canonical events;
- highest stage, terminal reason and season-ten leader status;
- first season in which candidate/control six-star assignment IDs diverge and
  the candidate-set, active-stock or club-cap fact that differs at that
  boundary.

The report includes stage counts, conditional survival shares and terminal
reason counts by world, division and assignment season. It must expose raw
player rows so a name can be inspected, but names remain presentation only.

## Frozen Attribution Rule

Only one owner may be named. For the selected exact-five cohort, compute losses
between adjacent stages only when the player's academy exit is resolved by
season ten. Younger players still in the academy are open-window diagnostics,
not losses. The
owner is the stage with the largest exclusive loss when:

- it is the largest loss in at least `5/7` candidate worlds;
- its pooled loss share is at least `0.20` of closed-window accepted
  assignments;
- it exceeds the second-largest pooled exclusive loss by at least `0.05` of
  closed-window accepted assignments.

Possible owners are `senior_registration`, `appearance_allocation`,
`development_minutes`, `development_realization`,
`first_division_retention` and `leader_selection`. Six-star divergence is a
separate structural failure, never folded into the owner ranking.

The implemented typed evaluator and its focused test included
`development_minutes` before the long run. Its omission from the prose list was
found after the result and is corrected here as an editorial code/document
disagreement; the omitted owner did not win and no threshold or decision rule
moved. `academy_exit` is represented by its exhaustive canonical outcomes and
is not a ranked owner because unresolved academy windows are explicitly
excluded while every resolved promotion/external/release path is assigned at
the senior-registration boundary.

## Decision

- **`OWNER_IDENTIFIED`**: all facts reconcile, the frozen attribution rule
  names exactly one owner and the six-star first-divergence cause is observed.
  Open only a new owner-specific correction step.
- **`MIXED`**: all facts reconcile but no stage meets the owner rule. Any later
  correction must use a new preregistered factorial design; no stage may be
  chosen qualitatively.
- **`STOP_INSTRUMENT`**: missing/duplicate assignment IDs, non-monotone stages,
  unknown terminal reasons, candidate/control population drift before the
  policy boundary, absent seven-worker evidence or unreconciled six-star
  divergence. Fix only this step and repeat unchanged.

No gameplay outcome can turn this diagnostic into `GO`.

## Outcome

The `7 x 1` canary passed. The fresh paired `7 x 10` then reconciled all `716`
selected exact-five assignments with zero unknown or duplicate pathway facts.
`424` assignments have a closed academy window and `292` remain open; open
windows were not counted as losses.

`development_realization` owns `173/424 = 0.4080` closed-window losses and is
largest in `6/7` worlds. `senior_registration` is second at `124/424 = 0.2925`,
so the frozen owner margin is `0.1156`, above `0.05`. Appearance allocation
owns `88`, development minutes `39`, and no player is lost at the later
first-division entry, retention or leader-selection boundaries after reaching
current `16`.

The precise finding is that the dominant cohort reaches senior registration,
at least one appearance and `900` cumulative minutes, yet never realises
canonical current primary-role ability `16`. This does not authorize a generic
growth increase: the next step must change only the canonical development-
realisation owner and keep failed prospects possible.

Six-star first divergence is observed in six worlds: five through allocation
constraints and one through active stock; one paired world never diverges.
There are zero reconciliation failures. The canonical report hash is
`41ceb57e7f472fd3bd5e314b83d7abe6`, and rebuilding it through `--from-report`
is byte-identical.

Audit:
[`PHASE_81A_CHECKPOINT_L6_43A_SUCCESSOR_PATHWAY.md`](../../audits/PHASE_81A_CHECKPOINT_L6_43A_SUCCESSOR_PATHWAY.md).

## What NOT To Implement

- no larger five/six-star stock;
- no direct current/potential clamp outside the canonical generator;
- no protected academy place, promotion, loan, minutes or transfer preference;
- no growth, aging, goal, assist or leadership coefficient;
- no new report entrypoint or second simulator;
- no final-ownership reconstruction where a lifecycle boundary exists;
- no product-default candidate policy.

## Expected Files

- `apps/cli/src/commands/simulation-report/career-world-facts.ts` and its
  existing tests - canonical selected-player lifecycle boundary facts.
- `apps/cli/src/commands/simulation-report/stationary-age-succession-attribution.ts`
  and its existing test - the sole pathway evaluator and frozen decision.
- `apps/cli/src/commands/simulation-report/career-sections.ts`,
  `report-registry.ts`, `report-planner.test.ts` and
  `packages/i18n/src/labels.ts` - one locked paired profile through
  `simulation-report`.
- Step 16L content/provider files only to make pre-16L semantics the product
  default while retaining one explicitly called analysis arm.
- generated L6.43A audit, audit index, this step, phase README, Step 16N and
  `docs/PROJECT_STATUS.md`.

Any additional file required by a real lifecycle owner must be added here with
its reason before it is edited.

## Required Checks

1. `graphify explain` and `graphify affected --depth 2` for every shared
   lifecycle boundary before editing.
2. Focused tests must prove stage monotonicity, exhaustive terminal reasons,
   transfer-safe joins, open-window treatment, owner reachability on real data
   and `STOP_INSTRUMENT` on an intentionally broken real row.
3. Run a fresh `7 x 1` canary alone, exactly seven workers.
4. Run the fresh paired `7 x 10` alone, exactly seven workers:

```bash
nvm use 24.16.0
pnpm cli simulation-report \
  --profile=phase81a-successor-pathway-l6-43a-paired-7x10 \
  --workers=7 \
  --format=json \
  --report-output=simulation-out/phase81a-successor-pathway-l6-43a-paired-7x10.json
```

5. Rebuild from completed canonical facts and require byte-identical JSON.
6. Run `graphify update .`, `git diff --check` and `pnpm check` alone.

## Definition Of Done

- the failed policy is not active in normal CLI or web careers;
- every selected player reconciles through one canonical pathway;
- the checkpoint records `OWNER_IDENTIFIED`, `MIXED` or `STOP_INSTRUMENT`
  without changing a product threshold after output;
- the six-star lane's first causal divergence is recorded;
- no dead candidate, duplicate lifecycle formula or orphan report profile
  remains;
- the next step is opened only for an owner actually demonstrated here.
