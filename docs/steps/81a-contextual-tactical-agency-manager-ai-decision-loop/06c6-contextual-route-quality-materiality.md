# Step 06C6 - Contextual Route-Quality Materiality

## Status

Done: `STOP / RETHINK`. All three declared candidates fail; `2500` is restored.
Response selection, squad identity and the frozen B2 targets remain unchanged.

## Goal

Raise the match value of actually winning or losing the route contest until the
complete replay row contains a material contextual response. Do not add direct
team strength, tactic bonuses or formation bonuses.

`routeQualityBiasBasisPoints` is the narrow owner: it is already the versioned
unit conversion from route saturation to the quality of the chance that route
creates. Raising generic opportunity volume or tactic control would reward a
named tactic in every context and risks rebuilding the universal response that
Phase 1 removed. This step changes only the contextual route-quality magnitude.

## Frozen Candidate Order Before Output

Current value: `2500`. Evaluate `4000`, `5000`, then `6000` basis points. These
are a coarse bounded bracket around the weakest observed optimistic ratio
`0.045 / 0.02053 = 2.19`; the list deliberately does not adopt the fitted
`5479` value. Stop at the first candidate that satisfies every acceptance rule.
Later candidates are not run once one passes.

Each candidate uses the exact 06C5 populations, `64` reciprocal contexts, nine
responses, `207` replay pairs, selection/replay prefixes and exactly seven
workers. A distinct locked `phase81a-b2-minute-effect-candidate` profile may
read only one of the three declared configured values. The accepted 06C5
profile and exact baseline reconciliation remain unchanged.

## Frozen Acceptance

A candidate is accepted only when:

- Phase 1 passes in both sets and all `21/21` population rows hold;
- optimistic ceiling is `>= +0.045` and optimistic exposure is `<= -0.045` in
  both sets;
- context-free remains inside `|delta| <= 0.015` with intervals compatible
  with zero;
- the original composition, formation and tactic dominance readers remain
  `<= 0.55`;
- low-block conceded-xG reduction remains `>= 0.08`, and its exchange rate does
  not worsen from 06C4's `1.93969 / 2.17507`. The original `<= 2.0` target is
  not erased; the out-of-sample miss stays open until B2 itself passes;
- no calibration field other than `routeQualityBiasBasisPoints` changes.

After the first passing candidate, rerun the independent B2 profile. `GO` opens
Step 07. If optimistic materiality passes but selected B2 remains red, the next
step may own only `selection_power`. A candidate that misses materiality or a
guardrail is removed before the next candidate. If none passes, restore `2500`
and record `STOP / RETHINK`.

## Expected Files

- `packages/content/src/balance/match-tactics-calibration.json` and its schema
  test; the accepted versioned content value has one owner;
- `packages/simulation-tools/src/tactical-agency/tactical-agency-audit.ts` and
  test only if the candidate profile needs a reusable guardrail summary;
- `apps/cli/src/commands/simulation-report/tactical-agency-section.ts` and
  `tactical-agency-structural-worker.ts`; the candidate must reuse the existing
  seven-worker full-row implementation;
- `apps/cli/src/commands/simulation-report/report-registry.ts` and
  `report-planner.test.ts` for the locked candidate profile;
- `packages/i18n/src/labels.ts` for that visible profile;
- `docs/audits/PHASE_81A_CONTEXTUAL_ROUTE_QUALITY_MATERIALITY.md` **(new)**;
- `docs/audits/README.md`;
- `docs/PROJECT_STATUS.md`;
- this step document;
- `06c5-replay-materiality-attribution.md`;
- `README.md`;
- `07-player-task-execution.md` only after a real B2 `GO`.

Any discovered file is added here with its ownership before editing it.

## Required Checks

Every checkpoint profile runs alone and records the real exit code.

```bash
nvm use 24
pnpm cli simulation-report \
  --profile=phase81a-b2-minute-effect-candidate --workers=7 --format=json \
  --report-output=simulation-out/phase81a-b2-minute-effect-candidate.json
pnpm cli simulation-report --profile=phase81a-b2 --workers=7 --format=json \
  --report-output=simulation-out/phase81a-checkpoint-b2-independent-replay.json
pnpm check
git diff --check
graphify update .
```

## Definition Of Done

The first passing declared candidate is adopted or all three are rejected and
`2500` is restored; complete response materiality and every guardrail are
reported twice, no selector is changed, and the independent B2 replay assigns
the next owner without moving a target.

## Result

| candidate | in ceiling / exposure | out ceiling / exposure | decision |
|---:|---:|---:|---|
| `4000` | `+0.02314 / -0.02300` | `+0.02688 / -0.02267` | `REFINE` |
| `5000` | `+0.02331 / -0.02644` | `+0.02674 / -0.02375` | `REFINE` |
| `6000` | `+0.02427 / -0.02765` | `+0.02943 / -0.02547` | `REFINE` |

Phase 1 and `21/21` population rows pass throughout, but no candidate reaches
either complete two-set target. The route-quality hypothesis is falsified and
the product value is restored to `2500`. Step 06C7 may inspect only the other
contextual minute channel: route advantage translated into opportunity volume.

The candidate-only profile used for these runs was removed at closeout. Its
artifacts retain the evidence; leaving a command that rejects the final
calibration would be dead tooling. Step 06C9 instead owns one durable
current-calibration materiality profile.
