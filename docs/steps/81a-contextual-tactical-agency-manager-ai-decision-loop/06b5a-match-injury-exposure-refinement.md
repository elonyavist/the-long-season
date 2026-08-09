# Step 06B5A - Match Injury Exposure Refinement

## Status

**Done (2026-08-08).** The repeated population reached `21.6347/1000h` and the
emergency selector completed every fixture without selecting an unavailable
player. This step changed no L3 target.

## Finding And Attribution

The first L3 run measured `2559` time-loss match injuries over
`422488.7167` player match-hours: `6.0570/1000h` against the preregistered
`20..50` band. All `7/7` worlds reached injuries and recent use; availability,
consequence reconciliation, age buckets and both recovery matrices held.

The primary source confirms that `36/1000h` is match-injury incidence in
professional men and that minor `1..3`-day time-loss injuries are the most
common category. The existing engine policy, not recovery or player age, owns
the shortfall.

The same run measured substitutions at `3.5310` in season one and `3.3820` in
season two (`3.4565` pooled, target `3.5..4.9`). Injury-driven forced changes
use the same canonical AI substitution path, so this step changes no routine
substitution threshold. L3 decides on the repeated population whether the
injury-owner correction also restores the carried band.

## Frozen Correction

- Multiply every existing injury-occurrence probability term by exactly `4`.
  The factor is declared before the first retry: it projects the
  observed `6.0570` above the `20` floor with margin while leaving room below
  `50`.
- Remove the two old clamps rather than versioning them. Code inspection before
  implementation showed both branches were unreachable: the old lower clamp
  `0.0004` sat below the positive base `0.00065`, while the old theoretical
  maximum `0.02715` sat below the upper clamp `0.028`. After exact scaling, the
  formula's natural range is `0.0026..0.1086`, already inside `0..1`.
- Keep candidate selection, physical resilience, workload, contact,
  aggravation and severity thresholds unchanged.
- Keep injury durations and training injuries unchanged.
- Give the one active policy a version and stamp it in report calibration
  metadata. Do not retain the old coefficient set as a runtime alternative.

## Expected Files

- `packages/engine/src/match-engine/match-injury.ts` and test; one versioned
  policy owns the existing formula's magnitudes and remains its only caller
- `packages/engine/src/match-engine/index.ts` exposes the one active policy;
  the root barrel needs no new declaration because it already re-exports the
  match-engine barrel
- `packages/engine/src/team-selection/ai-squad-selection.ts` and test. The
  repeated real world proved a 15-player emergency roster with two goalkeepers
  but no natural forward. The selector already fields players out of position
  for an imposed shape; its catalog path must choose the least-bad emergency
  shape under the same score and report the invalid-slot count instead of
  aborting the fixture.
- `apps/cli/src/commands/simulation-report/career-sections.ts` and test; the
  canonical report manifest records the policy version
- `apps/cli/src/commands/simulation-report/report-registry.ts`; L3 checkpoint
  cache identity advances because gameplay facts changed
- Checkpoint L3 document and audit
- phase `README.md` and `docs/PROJECT_STATUS.md`

## Required Checks

```bash
nvm use 24
pnpm exec vitest run packages/engine/src/match-engine/match-injury.test.ts apps/cli/src/commands/simulation-report/career-sections.test.ts --maxWorkers=7
pnpm cli simulation-report --profile=phase81a-availability-aging-l3-7x2 --workers=7 --format=json --report-output=simulation-out/phase81a-availability-aging-l3-7x2.json
pnpm check
git diff --check
graphify update .
```

Every gate runs alone. Only repeated L3 `GO` opens Step 06B6.

## First Refinement Attempt

The initially preregistered `4 x` policy was rejected before it could produce
an L3 artifact: one late-season club had only `15` available players and no
complete usable XI. That is a real availability failure, not a report timeout.
Before executing it, the second attempt is fixed at `3.5 x` (natural range
`0.002275..0.095025`); parts per million preserve the exact
half-step without rounding individual terms. If it still cannot complete the
same population, coefficient search stops and the availability/roster owner is
reopened instead of reducing the factor until a convenient seed passes.

The `3.5 x` retry failed on the same fixture and club as the `4 x` attempt.
Inspection recorded `15` available footballers with two natural goalkeepers but
no forward: `cb, cb, cb, cb, cm, cm, dm, dm, gk, gk, lb, lm, rb, rb, rm`.
The owner is therefore the asymmetric emergency behaviour in the canonical
selector, not a third injury coefficient. An imposed formation already admits
the least-cost invalid fits; the free catalog path now does so only after every
ordinary catalog shape fails, using the same structural score and catalog
ordering. It never recalls an unavailable player and never introduces a fixed
fallback formation. Invalid fits remain observable in canonical selection
reasons, while `catalogChoice.fillableShapeCount === 0` identifies the emergency
catalog pass without storing a second derived count.
