# Step 06C10 - Canonical Threat Derivation

## Status

Done. The parallel formula is removed without changing gameplay; canonical
Phase 1 passes twice and complete-row materiality remains `REFINE`.

## Goal

Make Phase 1 rank responses using the same pure opportunity-rate and
possession-to-chance derivations the minute loop consumes. Change no gameplay,
calibration value, seed, response or target.

Today `analyticThreatComponents(...)` multiplies `volume * possession claim *
absolute saturation * expected quality`. The engine instead uses `volume *
chance-creation multiplier * (1 + relative saturation advantage * separation)`
and applies route quality to the resolved opportunity. Both cannot be the
canonical meaning of the same plan.

## Implementation Contract

- Carry `routeCapacitySeparation` in `OpportunityRoutePlan`, beside every other
  semantic already derived from the versioned asset.
- Extract one pure `opportunityRateMultiplier(plan, opponentPlan,
  chanceCreationMultiplier)` from the existing minute formula without changing
  arithmetic order.
- Export the existing possession-to-chance calculation as a pure total helper;
  the minute loop and analysis both call it.
- Phase 1 derives its neutral-state possession claim from the two plan control
  multipliers, then reads those two shared helpers. Expected route quality may
  remain a separate reported component but cannot be multiplied into chance
  frequency and then applied again by the resolver.
- Delete the superseded parallel formulas and stale component names in the same
  change. One derivation, two callers.

## Frozen Decision Before Output

Run `phase81a-b2-current-materiality` with exactly seven workers.

- `PASS_PHASE_1` in both sets, `21/21` populations and conserved/mirrored facts
  are required before any replay row is interpreted.
- Phase-1 diversity retains `R/N_eff >= 0.25` and ubiquity multiple `<= 4`.
- Complete-row `+0.045 / -0.045`, neutral blind, original dominance and
  low-block gates remain unchanged.
- If canonical alignment makes Phase 1 fail, record `STOP / RETHINK`: the
  previously passing analytic counter-move model was not a model of the game.
- If Phase 1 passes and materiality remains red, the next owner is structural
  match resolution, not another translation coefficient.
- If complete-row materiality passes, independent B2 decides `GO` versus
  `selection_power`.

Historical 06C4/06C5 exact reconciliation is not expected after deliberately
correcting the oracle. Their artifacts remain immutable; the current profile is
the only valid reader for current content.

## Expected Files

- `packages/engine/src/match-engine/opportunity-route.ts` and test;
- `packages/engine/src/match-engine/match-control.ts` and test;
- `packages/engine/src/match-engine/step-match.ts` and test;
- `packages/engine/src/match-engine/index.ts` if the shared pure helpers cross
  the package boundary;
- `packages/simulation-tools/src/tactical-agency/tactical-agency-audit.ts` and
  test; remove its parallel threat math and consume the engine derivation;
- `packages/simulation-tools/src/tactical-agency/tactical-agency-attribution.ts`
  and test; its reconciliation and component vocabulary must consume
  `route_pressure`, not preserve the superseded absolute-saturation formula;
- `packages/simulation-tools/src/index.ts` only if public diagnostic types
  change;
- `apps/cli/src/commands/simulation-report/tactical-agency-section.ts` only if
  a stale exact-reconciliation assumption reaches the current profile;
- `docs/audits/PHASE_81A_CANONICAL_THREAT_DERIVATION.md` **(new)**;
- `docs/audits/README.md`;
- `docs/PROJECT_STATUS.md`;
- this step document;
- `06c9-possession-opportunity-translation.md`;
- `README.md`;
- `06c11-chance-to-result-materiality-attribution.md` **(new)**; the canonical
  run proved that downstream attribution, not another coefficient, is next;
- `07-player-task-execution.md` only after B2 `GO`.

Any discovered file is added here with its ownership before editing it.

## Required Checks

```bash
nvm use 24
pnpm cli simulation-report --profile=phase81a-b2-current-materiality --workers=7 \
  --format=json --report-output=simulation-out/phase81a-b2-canonical-threat.json
pnpm check
git diff --check
graphify update .
```

## Definition Of Done

One pure derivation owns chance-rate translation, the parallel analytic model is
gone, current Phase 1 and materiality receive a fail-closed decision twice, and
no gameplay value changes.

## Result

Both seed sets retain all `9/9` effective response signatures, `6/9`
best-response signatures, `148/147` material cycles, zero conservation or
mirror mismatch and no dominant response. Ubiquity is `3.8228/3.6111`, below
the frozen `4` limit.

Complete-row effects remain only `+0.02441/-0.02053` in-sample and
`+0.02519/-0.02159` out-of-sample; blind deltas remain neutral. The real
profile exit is `1`, decision `REFINE`. This closes coefficient calibration
and analytic alignment. Step 06C11 must attribute chance/xG separation versus
final-result dilution before any gameplay correction.
