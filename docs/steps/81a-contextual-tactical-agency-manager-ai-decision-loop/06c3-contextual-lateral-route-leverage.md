# Step 06C3 - Contextual Lateral-Route Leverage

## Status

Done. The preregistered ladder stopped at its first passing value, `6000 bp`.
Both seed sets pass every B2 Phase-1 gate and all `21 / 21` population rows.
Phase 2 is now required; Step 06C4 owns it and Step 07 remains closed.

## Goal

Make left/right focus a real contextual commitment: valuable when a real shape
matchup offers that flank, costly when the manager chooses the wrong flank, and
never universally better than balanced.

## Frozen Candidate Rule Before Output

The current engine reuses width's `3200 bp` route-affinity magnitude for the
separate lateral-focus instruction. The evidence shows that value is too weak:
balanced wins every materially asymmetric context inside every tactic.

Add one unsigned, versioned `lateralFocusAffinityBasisPoints` magnitude to the
existing tactical-semantics asset. Football direction stays in the existing
typed `LATERAL_FOCUS_ROUTE` and `LATERAL_FOCUS_EXPOSED_ROUTE` maps. No signed
asset field and no second payoff formula are allowed.

Evaluate the ordered candidate ladder `4000, 6000, 8000, 10000`. Each candidate
is a complete asset value and uses the same 14 worlds, exact seven workers and
unchanged B2 profile. Adopt the first candidate for which both seed sets pass
all B2 Phase-1 gates and all `21 / 21` population rows. Stop evaluating after
the first pass. If none passes, remove the field and record `STOP / RETHINK`.

This is a preregistered discrete design ladder, not continuous fitting. B2's
unchanged ubiquity, diversity, local-cycle, conservation, mirror and dominance
gates prevent a universal left/right response. Phase 2 still cannot run until
Phase 1 passes.

## Expected Files

- `packages/domain/src/balance/match-tactics-calibration.ts` and test
- `packages/content/src/schemas/match-tactics-calibration.schema.ts`
- `packages/content/src/balance/match-tactics-calibration.json` and test
- `packages/engine/src/test-fixtures/match-tactics-calibration.ts`
- `packages/simulation-tools/src/test-fixtures/match-tactics-calibration.ts`.
  Both test-fixture owners must state the new required field; no default may
  make an incomplete calibration look valid;
- `packages/engine/src/match-engine/opportunity-route.ts` and test
- any deterministic golden whose only change is the versioned calibration;
  each is added here with its measured account before editing
- `docs/audits/PHASE_81A_CONTEXTUAL_LATERAL_ROUTE_LEVERAGE.md` **(new)**
- `docs/audits/README.md`
- `docs/PROJECT_STATUS.md`
- this step document
- `06c2-double-width-squad-identity-separation.md`
- `README.md`

## Required Checks

```bash
nvm use 24
pnpm exec vitest run packages/engine/src/match-engine/opportunity-route.test.ts
pnpm cli simulation-report --profile=phase81a-b2 --workers=7 --format=json \
  --report-output=simulation-out/phase81a-checkpoint-b2-after-lateral.json
pnpm check
git diff --check
graphify update .
```

## Definition Of Done

One candidate passes unchanged B2 in both sets, population stays `21 / 21`
twice, the asset and validator own one magnitude, wrong-side cost and mirror
symmetry remain real, Phase 2 becomes required, and no candidate-only seam or
superseded value remains.

## Result

The `4000 bp` candidate was evaluated first and rejected. It increased the
number of selected responses to `5 / 6`, but ubiquity remained
`5.7989 / 6.1032`, above the unchanged `4` ceiling. The `6000 bp` candidate was
therefore evaluated next and passed; `8000` and `10000` were not read.

At `6000 bp`, all nine tactical-response signatures remain distinct and six
appear as a best response in each seed set. Ubiquity is `3.6587 / 3.7037`,
material local cycles are `145 / 144`, conservation and mirror mismatches are
zero, no response is universal, and population remains `21 / 21` twice. The
report correctly returns `PASS_PHASE_1`, not final B2 `GO`: independent replay
is still required.

Canonical artifact:
`simulation-out/phase81a-b2-lateral-candidate-6000.json`, SHA-256
`61521f2014b31918bb547d8b59b2ccceec5e6d16c086ad888aeabe52951d805a`.
The rejected `4000 bp` artifact has SHA-256
`e1384f7ee08587e8a40bd4773bba921a8d5aae4ecdc3c1f0a417024c12c6b23c`.
