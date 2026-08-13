# Step 12 - Checkpoint D: Own-Squad Tactical Agency

## Status

**STOP / RETHINK on 2026-08-13.** The frozen target was run three times over
both declared sets. The final structural refinement aligned selection with the
canonical route engine and still produced only `+0.4018/+0.4643` own-fit season
points against the frozen `+1.5` floor. Steps 13-16 remain closed pending a
product decision; numeric targets did not move.

## Goal

Prove own-squad tactical fit is perceptibly helpful over a season-sized schedule,
mismatch is harmful, blind choice is neutral and none of this removes plausible
football variance or long-run renewal.

## Locked Population

- seed sets: `phase81a-own-squad-agency-a` and
  `phase81a-own-squad-agency-b`;
- worlds: `7` per set, never pooled for a decision;
- club sampling: first stable club ID for each of the eight observed squad
  identities in every world; missing identity is `not_evaluated` and blocks GO;
- schedule: each sampled club's canonical `34` league fixtures from one opening
  snapshot;
- match seeds: `8` paired seeds per fixture arm, same home/away and opponent;
- workers: exactly `7`, frozen before the run;
- arms: `own_fit`, `mismatch`, `non_commit`, `blind` from the production
  evaluator; no analysis oracle may enter a product choice.

One match awards actual controlled-side points `3/1/0`. For a club and arm,
`seasonPointDelta` sums the 34 per-fixture mean point differences against
`non_commit`. Confidence intervals resample whole club schedules, never
individual matches, so 34 correlated fixtures cannot masquerade as 34 clubs.

## Frozen Gates

All numeric gates pass independently in both seed sets:

- population-weighted mean `own_fit - non_commit`: `[+1.5,+6.0]` points;
- `mismatch - non_commit`: `[-6.0,-1.5]` points;
- `blind - non_commit`: `[-0.5,+0.5]`, with 95% interval crossing zero;
- mean `own_fit - mismatch`: `>= 3.0` points;
- three tactic profiles and three focuses observed with positive counts;
- at least `4` modal complete policies across the eight identities;
- maximum modal complete-policy share `<= 0.50`;
- catalog reorder invariance exactly `1.0`;
- constant-quality role counterfactual changes complete policy in `>=4/6` clubs;
- every A2 formation/role gate and original `no_dominant_*` reader passes;
- every current Big Five upset-gradient, goal, draw and standings guardrail
  passes with its existing reader and bound;
- no policy choice reads opponent identity, formation, tactic or hidden result
  state; report instrumentation records the input provenance and requires zero
  opponent-source reads.

Checkpoint D reports the focused schedule only. It carries L6.31 renewal as
`not_evaluated`, never PASS. Step 16's integrated `7 x 10` must rerun ready
replacement and generated-leader gates under the completed tactical code.

## Expected Files

- `docs/audits/PHASE_81A_CHECKPOINT_D_OWN_SQUAD_AGENCY.md`
- `docs/audits/README.md`
- `packages/simulation-tools/src/tactical-agency/own-squad-agency-audit.ts` **(new)**
- `packages/simulation-tools/src/tactical-agency/own-squad-agency-audit.test.ts` **(new)**
- `packages/simulation-tools/src/index.ts`
- `apps/cli/src/commands/simulation-report/own-squad-agency-section.ts` **(new)**
- `apps/cli/src/commands/simulation-report/own-squad-agency-section.test.ts` **(new)**
- `apps/cli/src/commands/simulation-report/career-sections.ts`. Exposes one
  checkpoint-only composition of the existing standings and upset readers over
  a canonical `7 x 1` career lane. The focused eight-club replay cannot produce
  a league table, and inventing an approximation would not test the frozen Big
  Five gates.
- `apps/cli/src/commands/simulation-report/tactical-agency-world.ts`. Extends the
  existing constant-quality role counterfactual with complete-policy movement;
  rebuilding its private re-role oracle in the new section would create a
  second measurement owner.
- `apps/cli/src/commands/simulation-report/report-registry.ts`
- `apps/cli/src/commands/simulation-report/report-planner.test.ts`
- `packages/i18n/src/labels.ts`
- `docs/PROJECT_STATUS.md`
- the phase `README.md`
- this step document
- `13-tactical-chapters-and-canonical-explanation.md`

## Historical Verification

The executable Checkpoint D profile was removed when D2 became the only live
specialised-plan checkpoint. Its exact output remains frozen in
`PHASE_81A_CHECKPOINT_D_OWN_SQUAD_AGENCY.md` and commit `d27f8d7`; retaining a
live command after the production vocabulary changed would falsely claim to
reproduce D. Current verification belongs only to Step 12C's modular report.

## Decision

- **GO:** every gate passes twice; Step 13 opens.
- **REFINE:** only a demonstrated Step 10/11 reader, policy-score, focus or live
  wiring owner reopens. Numeric bands do not move.
- **STOP / RETHINK:** correctly implemented own-squad policy cannot create the
  bounded season-scale effect, blind assignment is beneficial, an opponent fact
  leaks in, a universal policy returns, or historical football guardrails break.

No outcome authorizes lowering the future adversarial `+0.045/-0.045` target.

## Outcome

The first complete run measured the shipped Step 11 score. It returned
`REFINE`: own fit was `-0.1674/+0.1674`, mismatch `-1.1540/-1.0000`, and the
complete-policy spread `0.9866/1.1674`. It also exposed two instrumentation
defects: imported worker entrypoints accepted each other's payload, and the
historical-upset lane omitted the existing absolute-strength reader and emitted
zero observations. Both are measurement owners, not gameplay findings.

The first score refinement separated task demand from overall readiness. It
improved focus reachability but did not solve effect ordering: own fit became
`+0.1808/+0.2589`, mismatch `-1.0580/-1.2545`, spread
`1.2388/1.5134`. That hypothesis is rejected; it may not ship as another score
table.

The final refinement removed both parallel tables and derived candidate fitness
from the production route plan, control and pre-clamp opportunity functions
against one fixed neutral `0.5` reference. It also corrected complete-policy
measurement from `tactic|focus` to `formation|tactic|focus`. This produced eight
modal complete policies with maximum share `0.125`, zero opponent reads, exact
catalog invariance and a genuine mismatch cost inside the frozen band on both
sets (`-1.5313/-1.6205`). Blind remained bounded and non-significant.

The central promise nevertheless failed decisively: correct choice was only
`+0.4018/+0.4643`, and correct-minus-wrong only `1.9330/2.0848`. The canonical
career lane also remained outside current goals, draws, dispersion and upset
bands under the policy population. More coefficient iteration would be
post-output tuning. Under the frozen Decision section, a correctly wired,
opponent-free structural selector that cannot produce the perceptible reward is
`STOP / RETHINK`, not another `REFINE` cycle.

Both refinements were removed before closeout. A final run on the accepted Step
11 tree reproduced the original two set readings exactly and exited `1` after
`861757 ms`. The committed tree therefore retains only the measurement seam and
audit evidence; it does not ship the rejected readiness table, route-derived
selector, schema bump or caller plumbing.

The product choice is now explicit: either (a) redefine this MVP as error
avoidance, which requires a new preregistered contract rather than relabelling
these results; (b) author genuinely specialised tactical plans and recalibrate
the historical league lanes; or (c) defer positive agency until honest opponent
evidence exists. Until one is selected, no Step 13-16 implementation or final
renewal claim is valid. L6.31 remains previously green evidence but is not
rerun or promoted under an unaccepted tactical engine.
