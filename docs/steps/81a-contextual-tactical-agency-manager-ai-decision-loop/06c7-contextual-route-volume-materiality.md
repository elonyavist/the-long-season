# Step 06C7 - Contextual Route-Volume Materiality

## Status

Done: candidate `STOP / RETHINK`; `16000` is retained. The ownership migration
is bit-exact and accepted.

## Goal

Test the remaining contextual minute channel: how a difference in expected
route saturation changes opportunity frequency. Do not change generic tactic
volume, control, team strength, formation value or response selection.

The current unit conversion is the hardcoded engine constant
`ROUTE_CAPACITY_SEPARATION = 1.6`. Move it without arithmetic reordering to the
versioned tactical asset as `routeCapacitySeparationBasisPoints = 16000` and
prove exact B2 replay equivalence before evaluating candidates. This is a
positive fixed-point multiplier, not a `0..10000` share.

## Frozen Candidate Order Before Output

Evaluate `22000`, `28000`, then `34000` basis points, stopping at the first
passing candidate. These bounded `2.2 / 2.8 / 3.4` multipliers widen the current
`1.6` conversion in regular steps without fitting the observed output. Later
candidates are not run after a pass.

Every candidate uses the exact 06C5 populations, contexts, response rows,
selection/replay prefixes, `207` replay pairs and seven workers. Only the new
route-volume field may differ from the exact `16000` baseline.

## Frozen Acceptance

The baseline migration must reproduce 06C5 at exact equality. A candidate then
passes only if:

- Phase 1 passes in both sets and all `21/21` population rows hold;
- optimistic ceiling is `>= +0.045` and optimistic exposure is `<= -0.045` in
  both sets;
- context-free remains inside `|delta| <= 0.015` with intervals compatible
  with zero;
- original composition, formation and tactic dominance remain `<= 0.55`;
- low-block conceded-xG reduction remains `>= 0.08`, with exchange no worse
  than 06C4's `1.93969 / 2.17507`;
- no other gameplay value changes.

After the first complete-row pass, rerun independent B2. `GO` opens Step 07;
materiality with a red selected arm identifies `selection_power` for the next
step. If all candidates fail, keep the exact `16000` asset migration, record
`STOP / RETHINK`, and do not retain a candidate.

## Expected Files

- `packages/domain/src/balance/match-tactics-calibration.ts` and test; they own
  the positive fixed-point field and bounded validator;
- `packages/content/src/balance/match-tactics-calibration.json`, schema and
  schema/content tests; one asset owns the value;
- engine and simulation-tools match-tactics calibration fixtures; fixtures must
  remain complete typed contracts;
- `packages/engine/src/match-engine/step-match.ts` and test; remove the
  hardcoded constant and preserve exact multiplication order;
- `apps/cli/src/commands/simulation-report/tactical-agency-section.ts` and
  `tactical-agency-structural-worker.ts`; reuse the complete-row worker path;
- `apps/cli/src/commands/simulation-report/report-registry.ts` and
  `report-planner.test.ts` if the candidate profile contract changes;
- `docs/audits/PHASE_81A_CONTEXTUAL_ROUTE_VOLUME_MATERIALITY.md` **(new)**;
- `docs/audits/README.md`;
- `docs/PROJECT_STATUS.md`;
- this step document;
- `06c6-contextual-route-quality-materiality.md`;
- `README.md`;
- `07-player-task-execution.md` only after B2 `GO`.

Any discovered file is added here with its ownership before editing it.

## Required Checks

Every checkpoint profile runs alone with exactly seven workers and its real
exit code is recorded.

```bash
nvm use 24
pnpm cli simulation-report --profile=phase81a-b2-materiality --workers=7 \
  --format=json --report-output=simulation-out/phase81a-b2-volume-baseline.json
pnpm cli simulation-report \
  --profile=phase81a-b2-minute-effect-candidate --workers=7 --format=json \
  --report-output=simulation-out/phase81a-b2-volume-candidate.json
pnpm cli simulation-report --profile=phase81a-b2 --workers=7 --format=json \
  --report-output=simulation-out/phase81a-checkpoint-b2-independent-replay.json
pnpm check
git diff --check
graphify update .
```

## Definition Of Done

The hardcoded unit conversion is gone, `16000` proves exact replay equivalence,
the first passing declared candidate is retained or all are rejected, and B2
assigns the next owner without moving a target or creating a second engine.

## Result

The `16000` migration reproduces every 06C5 selected and blind value exactly.
All candidates keep Phase 1 and `21/21` populations green, but miss materiality:

| candidate | in ceiling / exposure | out ceiling / exposure |
|---:|---:|---:|
| `22000` | `+0.02561 / -0.02265` | `+0.02489 / -0.02664` |
| `28000` | `+0.02581 / -0.02507` | `+0.02824 / -0.02802` |
| `34000` | `+0.03082 / -0.02709` | `+0.03145 / -0.02823` |

`16000` remains in calibration v7; no candidate remains. Step 06C8 owns only
the missing endpoint interaction between the already-measured maximum quality
and volume arms.

The temporary candidate-only profile was removed after the sweep; the JSON
artifacts and audit retain its immutable evidence.
