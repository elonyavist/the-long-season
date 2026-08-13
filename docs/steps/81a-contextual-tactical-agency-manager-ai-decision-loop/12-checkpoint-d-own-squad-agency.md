# Step 12 - Checkpoint D: Own-Squad Tactical Agency

## Status

**Ready after Step 11.** This checkpoint was frozen by Amendment A7 before Step
10 or Step 11 implementation.

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
- `apps/cli/src/commands/simulation-report/report-registry.ts`
- `apps/cli/src/commands/simulation-report/report-planner.test.ts`
- `packages/i18n/src/labels.ts`
- `docs/PROJECT_STATUS.md`
- the phase `README.md`
- this step document
- `13-tactical-chapters-and-canonical-explanation.md`

## Required Checks

```bash
nvm use 24
pnpm cli simulation-report --profile=phase81a-d-own-squad-agency \
  --workers=7 --format=json \
  --report-output=simulation-out/phase81a-checkpoint-d-own-squad-agency.json
pnpm check
git diff --check
graphify update .
```

Run the simulation gate and `pnpm check` separately.

## Decision

- **GO:** every gate passes twice; Step 13 opens.
- **REFINE:** only a demonstrated Step 10/11 reader, policy-score, focus or live
  wiring owner reopens. Numeric bands do not move.
- **STOP / RETHINK:** correctly implemented own-squad policy cannot create the
  bounded season-scale effect, blind assignment is beneficial, an opponent fact
  leaks in, a universal policy returns, or historical football guardrails break.

No outcome authorizes lowering the future adversarial `+0.045/-0.045` target.
