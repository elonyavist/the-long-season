# Step 16J - Role-Aware Late-Career Aging And Paired Checkpoint L6.41

## Status

**Done - `STOP_RETHINK` on 2026-08-15.** Product review authorized execution,
the paired experiment rejected the candidate, and every candidate or control
production seam was removed. The shipped L6.40 product is unchanged.

## Thesis

The game should reduce the structural advantage of the opening veteran stock by
changing the football abilities that age, not by penalising an older player's
selection, goals, assists or match result directly.

L6.40 shows the concrete defect. For opening seniors, the median one-season
role-current change at ages `30..32` is exactly `0` for all ten roles; at `33+`
it is only about `0..-0.08`. Season ten therefore still contains `91` opening
current-16 seniors against `15` career-generated current-16 players, and opening
seniors own at least half of that elite rung in `7/7` worlds.

The same checkpoint also rules out the tempting wrong fix: the AI already gives
`431/432` viable incumbent transitions at least one complete season of warning.
Step 16J must not add another anticipation rule, force a purchase, increase
growth or alter opening age composition.

The intended football model is shared by every club and competition:

- pace, agility and stamina begin to erode earlier in wide and attacking roles;
- central defenders and central midfield roles retain a later, less explosive
  curve, while goalkeepers retain their separate late curve;
- strength and heading do not automatically follow the same onset as pace;
- technical and mental abilities keep their existing later evolution and can
  therefore compensate naturally in the role rating;
- individual variation derives from the existing physical-resilience facts,
  never from a new hidden longevity trait;
- an exceptional veteran remains possible, but exceptional veterans no longer
  constitute a systematic share of the scorer and creator leaders.

## Operational Document

### Entry Gate

- Step 16I/L6.40 is `Done` with `OWNERS_IDENTIFIED`;
- its accepted current-product artifact and byte-identical cache rebuild remain
  the frozen before-state;
- `OPENING_STOCK_RETENTION` and `SUCCESSOR_FLOW` are separate owners;
- this step owns only the first owner and merely remeasures the second;
- the user approved this contract before implementation on 2026-08-15.

### Product Contract

#### One shared role-aware policy

`applyPlayerAgingPolicy(...)` remains the sole current-ability aging path. Its
existing `developmentRole` input becomes a real reader instead of being used
only for potential compression.

A total typed mapping assigns every `PlayerRole` to one football aging lane:

| lane | roles | physical intent |
|---|---|---|
| goalkeeper | goalkeeper | preserve the current later goalkeeper curve |
| central durable | center back, defensive midfielder, central midfielder | later explosive decline; strength and reading of play remain valuable |
| attacking explosive | attacking midfielder, striker | explosive decline begins before the current age-32 wall |
| wide explosive | full back, wing back, wide midfielder, winger | earliest decline in pace, agility and stamina |

The mapping is football vocabulary in typed code. Versioned content owns the
numeric onsets and magnitudes. The validator requires every lane and ability
family; a missing entry is a build/configuration failure, never a fallback.

Physical abilities are split canonically into:

- `explosive`: pace, agility, stamina;
- `power`: strength, heading.

This classification has one exported owner shared by aging and diagnostics.
The report may not recreate it from string prefixes.

#### Existing resilience, not a second trait

The candidate reuses the weighted stamina/agility/strength resilience meaning
already owned by `PlayerStateCurvesConfig`. The pure derivation is extracted
once from the recovery code and consumed by both recovery and aging. Aging may
shape the magnitude continuously between configured low- and high-resilience
bounds; it may not create a categorical `durable` flag or consume another RNG
stream.

The existing seeded monthly aging variance remains the only stochastic aging
input. Production-code inspection before output found that the legacy path
draws only after its age/family gate, whereas the candidate deliberately makes
some earlier cells reachable. An identical local draw count is therefore
arithmetically impossible. The control preserves the exact legacy local stream;
the candidate derives one stable value by player, month and ability from an
isolated keyed stream. Neither arm consumes or shifts the world simulation RNG,
and paired fixture, transfer, contract and participation hashes remain the
purity gate. This correction was recorded before either long-run arm.

#### No artificial compensation

Step 16J does not add technical/mental growth, experience points, selection
bonuses or output bonuses. Compensation means only that a player's existing
technical and mental abilities remain in his role-current score while selected
physical abilities decline. A technically exceptional older player can remain
excellent because of football facts he already owns.

#### Version and beta reset

The late-career magnitudes join the existing versioned player-state curves
asset so recovery resilience and aging cannot drift into two policies. The
domain schema and content version advance once. Production inspection before
implementation found that this asset version is reported but is **not** part of
the persisted `GameMeta` calibration bundle. The change therefore alters no
persisted truth and receives no artificial schema bump or save reset. If that
code fact changes during the step, beta policy requires one reset and no
migration, dual reader, compatibility default or legacy asset.

### Paired Experiment

The implementation first adds a temporary, explicitly analysis-only control
seam. It runs the pre-16J aging policy and the role-aware candidate from the
same seven frozen L6.40 world seeds for ten seasons with exactly seven workers.
Both arms use identical generation, fixtures, transfers, contracts, lineups and
RNG keys. Only the aging policy differs.

This pre-output correction is necessary: a fresh seed prefix cannot reproduce
an aggregate measured on different worlds. The role-aware coefficients and all
gates were frozen before reusing the L6.40 population, so those worlds may prove
instrument continuity and paired attribution but are never described as a new
out-of-sample validation. The control must reproduce the frozen L6.40 aggregate
facts. A mismatch is
`STOP_INSTRUMENT`; candidate output is not interpreted. The temporary control
and selector are deleted in the same step after the decision. If the candidate
is rejected, the candidate configuration and every caller are deleted instead.
No dormant variant may survive either outcome.

Locked profile family:

- control: `phase81a-role-aware-aging-l6-41-control-7x10`;
- candidate: `phase81a-role-aware-aging-l6-41-candidate-7x10`;
- seed prefix: `phase81a-stationary-age-succession-l6-40-oos-v1`;
- seven worlds, ten seasons, seven workers;
- First Division is the decision population; lower divisions are structural
  guardrails.

The first control execution stopped before interpretation because the L6.41
profile had not enabled the existing standings and market facts required by the
inherited integrated gate. All seven `v1` world checkpoints therefore contain
valid simulations but an incomplete observation envelope and are not evidence.
The corrected profile uses cache suffix `v2`, enables exactly the same
historical readers as L6.2, and reruns rather than filling missing facts after
the event.

`pnpm cli simulation-report` remains the only report entrypoint. No HTML is
produced before a candidate is adopted.

### Frozen Measurements

For both arms, per world and pooled:

1. the full existing First-Division historical player, match, table, formation,
   injury, availability and reconciliation gates;
2. one- and two-season ability-family and role-current deltas by exact role,
   age band (`25..29`, `30..32`, `33+`) and resilience tercile;
3. current-15/current-16 stock by opening/career origin at seasons `1`, `4`, `7`
   and `10`;
4. scorer/creator ages, age-33-plus shares, starts and minutes;
5. generated season-ten leader share and current-16 count;
6. every real age-33-plus top-ten leader, so exceptional longevity is proven by
   real generated data rather than a constructed fixture;
7. RNG, career, fixture, transfer, contract and participation hashes.

The ability-family summaries introduced here are canonical structured facts
owned beside the ability classification. They are not reconstructed in the CLI
and are not persisted beside their source abilities.

### Frozen Gates

All comparisons are paired by world. Numeric output is never tuned and then
used to rewrite these gates.

#### Policy-execution gates

- pooled median one-season role-current delta at ages `30..32` is negative for
  both explosive lanes and no greater than `-0.02`;
- the wide-explosive decline is at least as large as the central-durable decline
  in at least `5/7` paired worlds;
- goalkeeper median role-current delta remains `0` through age `34`;
- within each reached exact-role/age cell, the high-resilience tercile declines
  no more than the low-resilience tercile; the direction holds in at least
  `5/7` worlds and both terciles must be reached on generated data;
- technical and mental decline onsets do not move earlier than the shipped
  policy.

The `-0.02` floor is two steps on the role-current report's `0.01`
quantisation: it proves a real direction without prescribing a career-rating
collapse.

#### User-facing correction gates

- season-ten opening-senior current-16 stock falls by at least `20%` from the
  paired control and improves in at least `5/7` worlds;
- scorer top-ten mean age is `25.5..28.5` and creator top-ten mean age is
  `25.0..28.5`;
- scorer and creator age-33-plus shares are each `<= 0.12`;
- at least one real age-33-plus player remains in a scorer or creator top ten
  across the cohort;
- pooled age-33-plus starts remain `12..17` and minutes `1100..1500` per
  selected player. Aging is not allowed to replace the already-adopted
  fitness/rotation model.

The `20%` stock movement is a material paired attribution floor, not a real-
world population target: it requires the demonstrated owner to move enough to
explain the defect instead of passing on rounding noise.

#### Successor-flow and world guardrails

- generated current-16 count may fall by at most `2` from the paired control;
- generated season-ten leader share may fall by at most `0.02` from control;
- the existing generated-leader `>= 0.50` target remains red if it is red; this
  step receives no credit for hiding it through a smaller denominator;
- no current ability exceeds potential, origin is never `unknown`, and all
  stock/flow joins reconcile;
- goal, assist, points, formation, availability, injury and transfer guardrails
  do not regress;
- observer-off/observer-on and cache rebuilds are byte-identical.

The successor-flow guardrails do not require aging to create successors. After
the aging decision, L6.40 is re-evaluated on the adopted product. If successor
flow remains thin, the next observation-only step must partition generation
ceiling, development conversion, retention and senior opportunity at the
current-16 rung before changing any of them.

### Reachability

Before either `7 x 10` arm runs, a deterministic search over real generated
players must reach, in the direction read by the rule:

- every aging lane and both physical ability families;
- low and high resilience within the same exact role and age band;
- a negative explosive role-current delta at age `30..32`;
- a goalkeeper aged `33+` with no premature decline.

An age-33-plus top-ten leader under the candidate is a match-output fact and
cannot exist before the candidate season is simulated. It is therefore checked
from the completed candidate arm before any `GO` interpretation, together with
both sides of every candidate/control decision branch. Calling that output a
pre-run prerequisite would require a second simulator or would silently run the
experiment while claiming not to have run it. This scope correction was made
before either long-run arm.

A fixture assembled to satisfy one branch is insufficient. If a declared
population cannot reach a rule, the rule is `not_evaluated` and the step cannot
return `GO`.

### Decision

- `GO`: every execution, user-facing, successor-flow, world, purity and
  reachability gate holds. Adopt the candidate, advance the one policy version,
  perform the one beta reset if required, and remove the control seam.
- `REFINE`: execution has the intended role/resilience direction and world
  guardrails hold, but a material or historical target misses. Only the
  role-aware aging owner reopens; targets and population remain frozen.
- `STOP_RETHINK`: the candidate improves leader ages only by destroying
  exceptional veterans, minutes, generated successor flow or general football
  output, or it cannot separate the role lanes on real data. Remove the
  candidate and the analysis seam.
- `STOP_INSTRUMENT`: the control fails reproduction, an arm changes RNG or a
  reconciliation fails, or the generated population cannot reach every typed
  aging lane/family. A reached candidate whose direction fails is
  `STOP_RETHINK`, not an instrumentation failure. No gameplay conclusion is
  drawn from a genuine instrument failure.

### Outcome

The corrected `v2` control reproduced L6.40 exactly, rebuilt byte-identically
from cache and recorded `instrumentContinuityHeld=true`. The candidate also
rebuilt byte-identically, so its result is interpreted rather than dismissed as
instrument drift.

The candidate returned `STOP_RETHINK`:

| measurement | control | candidate | frozen reading |
|---|---:|---:|---|
| attacking-explosive median delta | n/a | `-0.007736` | fails `<= -0.02` |
| wide-explosive median delta | n/a | `-0.041376` | holds |
| resilience direction | n/a | `0/7` worlds | fails |
| opening-senior current-16 stock | `91` | `98` | worsens |
| generated current-16 stock | `15` | `10` | fails guardrail |
| generated leader share | `0.207143` | `0.214286` | holds alone |
| scorer / creator mean age | n/a | `30.30 / 30.13` | both fail |
| scorer / creator age-33-plus share | n/a | `0.27 / 0.32` | both fail |
| age-33-plus starts / minutes | n/a | `22.84 / 1846.86` | both fail |

The candidate also introduced `upsets:first_versus_last`, a historical red not
present in control. It preserved `32` exceptional age-33-plus leaders, so it did
not fail merely by making longevity impossible. It failed its intended
attacking/resilience directions and damaged both elite-stock balance and a
world guardrail. Frozen rules therefore forbid a coefficient retry.

The candidate asset, schema additions, engine selector, diagnostic fields,
profile family, labels and focused candidate tests were removed. The final tree
contains only the already-required L6.40 observation work and this permanent
decision record. Full evidence is in
`docs/audits/PHASE_81A_CHECKPOINT_L6_41_ROLE_AWARE_AGING.md`.

### Experimental Scope And Final Census

The following list records the authorized experimental radius. Candidate
production changes in it are intentionally absent from the final diff because
`STOP_RETHINK` requires removal, not a dormant feature flag. The final tree is
reconciled again with `graphify affected` and `git status` after cleanup.

- `packages/domain/src/balance/player-state-curves.ts` and test. Extend the
  existing versioned resilience/state contract with total aging magnitudes.
- `packages/domain/src/player/player-abilities.ts` and test. Own the one typed
  physical-family classification used by engine and report diagnostics.
- `packages/domain/src/index.ts`. Export those canonical contracts.
- `packages/content/src/balance/player-state-curves.json`, selector and tests.
  Ship one validated version; no old asset remains.
- `packages/engine/src/player-state/fitness.ts` and test. Extract the existing
  physical-resilience derivation without changing recovery output.
- `packages/engine/src/career/player-aging-policy.ts` and test. Implement the
  sole role/family-aware aging policy and temporary paired control.
- `packages/engine/src/career/player-development.ts`,
  `advance-career-month.ts`, `advance-career-season.ts`, `progress-fixture.ts`
  and their focused tests. These are the complete engine call chain from the
  Adapter-selected player-state policy to the sole aging owner; none selects
  content or supplies a default.
- `packages/engine/src/test-fixtures/player-state-curves-config.ts`. Keep the
  shared real schema fixture total after the schema advance; it is not a second
  gameplay policy.
- `packages/engine/src/index.ts`. Export only production contracts still used
  after the temporary seam is removed.
- `apps/cli/src/commands/career/season-labs.ts` and its existing command tests,
  plus `apps/web/src/runtime/web-career-runtime.ts` and its focused tests. They
  are the non-report callers of `advanceCareerOneSeason(...)`; each already
  owns content selection and now passes the same policy to monthly development.
- `apps/cli/src/commands/simulation-report/career-world-facts.ts`,
  `career-sections.ts`, `owner-attribution.ts`,
  `stationary-age-succession-attribution.ts` and focused tests. The owner
  observer is the existing canonical player-season fact owner and records the
  opt-in ability-family snapshot; the other files own paired orchestration and
  the canonical L6.41 evaluator. This census correction was recorded before
  editing the observer.
- `apps/cli/src/commands/simulation-report/report-registry.ts` and
  `report-planner.test.ts`. Register only the temporary locked paired profiles;
  remove the rejected or control profile before closeout.
- `packages/i18n/src/labels.ts`. Add and remove profile labels with the profiles.
- storage/runtime version files and tests **only if** the existing persisted
  player-state stamp proves incompatible; beta reset, never migration.
- `docs/audits/PHASE_81A_CHECKPOINT_L6_41_ROLE_AWARE_AGING.md` **(new)**, audit
  index, this step, phase README and status.

### Explicitly Not Implemented

- opening age-composition deck or club philosophy;
- successor generation, potential, development, retention or opportunity
  changes;
- new AI succession timing, purchase preference or forced promotion;
- retirement or contract changes;
- direct age reads in lineup, goals, assists or match results;
- new hidden longevity/resilience state;
- formation, tactics, injury or recovery retuning;
- HTML or another report command.

### Required Checks

1. `graphify explain` and `graphify affected` for every shared owner, then an
   Expected-Files/tree reconciliation.
2. Focused policy, total-mapping, resilience-equivalence, RNG-count,
   real-reachability, observer-purity and beta-reset tests.
3. The paired `7 x 10` control/candidate run alone through
   `pnpm cli simulation-report`, exactly seven workers.
4. Byte-identical rebuilds from both completed caches.
5. Delete the losing policy, temporary control/seam/profile/labels and stale
   fixtures before interpreting the final tree.
6. `git diff --check`, `graphify update .` and full `pnpm check` alone.

### Verification

- focused L6.40/L6.41-owner cleanup suite: `5` files and `102` tests passed;
- Graphify was rebuilt after candidate removal; `explain` and `affected`
  resolve the remaining L6.40 evaluator only to its canonical report caller and
  focused tests;
- repository search finds no L6.41 profile, policy mode, ability-family aging
  summary, resilience helper or candidate selector outside this decision
  history;
- final `pnpm check` ran alone on Node `24.19.0` and exited `0`: `318` test
  files, `2547` tests, `904` modules with zero dependency violations, all four
  custom checks and every package typecheck passed;
- `docs/PROJECT_STATUS.md` remains below its `300`-line budget;
- no commit was created by this step without explicit authorization.
