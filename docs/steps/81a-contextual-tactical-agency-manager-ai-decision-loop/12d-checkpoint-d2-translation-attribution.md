# Step 12D - Checkpoint D2 Translation Attribution

## Status

**Done — `plan_execution_not_established`.** Correct fit improves net xG twice;
mismatch does not reliably make it worse. Step 12E owns the explicit plan-
execution contract. No gameplay value moved here.

## Goal

Locate the first causal stage at which specialised own-squad fit stops
separating from non-commitment and mismatch, using the same D2 footballers,
fixtures and paired seeds.

## Frozen Population And Facts

- exactly the D2-C and D2-D seven-world sets, decided independently;
- eight identity schedules, 34 fixtures, eight paired seeds, four arms;
- exactly seven workers;
- no historical replay: D2 already measured it and the owner question is match
  translation, so rerunning 70 world-seasons would add cost without a fact;
- per arm and controlled club schedule: opportunities for/against, xG
  for/against, goals for/against and points;
- paired deltas from `non_commit`: net xG, goal difference and points, with the
  same whole-schedule 4096-resample 95% interval;
- opportunities for/against and xG per opportunity remain diagnostics that
  distinguish volume from quality. They are not an independent directional
  gate: a credible patient plan may create fewer, better chances.

Every fact is read from `simulateMatch(...)` output already produced by the
canonical minute loop. No alternate resolver, route oracle, opponent-aware
selector or reconstructed xG is permitted.

## Frozen Attribution Rule

For `own_fit`, the expected sign is positive; for `mismatch`, negative. A stage
is established only when its mean has the expected sign and its whole-schedule
95% interval excludes zero in **both** D2 sets.

Stages are evaluated in causal order:

1. net xG, the canonical aggregate of opportunity volume and quality;
2. goal difference;
3. season points against the original D2 magnitude bands.

The first stage not established owns the current break:

- xG fails: `plan_execution_not_established`; opportunity counts and xG per
  opportunity diagnose volume, quality or a mixed mechanism without inventing
  a second gate;
- xG passes and goals fail: `xg_to_goal_resolution`;
- goals pass and points still miss their frozen D2 bands:
  `goal_to_points_resolution`;
- C and D name different first stages: `mixed_not_attributed`;
- C and D establish every direction but disagree on the volume/quality
  diagnostic: the stage owner still stands and the sub-mechanism stays mixed.

This classification opens only the named owner for a separately documented
correction. It does not itself authorize coefficients. Profile reachability and
historical failures remain reported beside it but do not choose a translation
owner.

## Expected Files

- `packages/simulation-tools/src/tactical-agency/own-squad-agency-audit.ts`
- `packages/simulation-tools/src/tactical-agency/own-squad-agency-audit.test.ts`
- `packages/simulation-tools/src/index.ts`. The CLI consumes the attribution
  through the package's existing public audit seam; a deep import would violate
  package ownership.
- `apps/cli/src/commands/simulation-report/own-squad-agency-section.ts`
- `apps/cli/src/commands/simulation-report/own-squad-agency-section.test.ts`
- `apps/cli/src/commands/simulation-report/report-registry.ts`
- `apps/cli/src/commands/simulation-report/report-planner.test.ts`
- `packages/i18n/src/labels.ts`
- `docs/audits/PHASE_81A_CHECKPOINT_D2_TRANSLATION_ATTRIBUTION.md` **(new)**
- `docs/audits/README.md`
- `docs/PROJECT_STATUS.md`
- the phase `README.md`
- this step document
- the newly authorized owner step, only after the verdict

## Required Checks

```bash
nvm use 24
pnpm cli simulation-report \
  --profile=phase81a-d2-translation-attribution \
  --workers=7 --format=json \
  --report-output=simulation-out/phase81a-checkpoint-d2-attribution.json
pnpm check
git diff --check
graphify update .
```

The attribution gate and `pnpm check` run separately.

## Definition Of Done

Both sets expose canonical intermediate facts, reconciliation and one frozen
classification; no gameplay value moves and only an identically named owner may
open.

## Outcome — 2026-08-13

The locked profile ran alone on seven workers for `40,742 ms`, exited `0` and
wrote hash `be8076c039630484336a9e82b489ecc6`. Own fit changes net xG by
`+0.6033/+0.5255`, with both 95% intervals above zero. Mismatch changes it by
`+0.1478/-0.2001`, with both intervals crossing zero. Both sets therefore name
`plan_execution_not_established` before the goal and point stages.

The code owner is concrete: versioned profile demand is consumed only by the
selector. The match receives anonymous knobs and focus, so it cannot derive
whether the selected eleven can execute the named plan. Step 12E may carry the
explicit plan identity and derive execution fit from the same shape and content;
it may not carry a derived score, infer identity from knobs, add strength, read
the opponent or alter a frozen target.
