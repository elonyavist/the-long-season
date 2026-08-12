# Step 06C8 - Route Quality And Volume Interaction

## Status

Done: `STOP / RETHINK`. The combined arm misses both-set materiality and is
removed.

## Goal

Determine whether contextual chance quality and contextual opportunity volume
are jointly sufficient even though neither endpoint is sufficient alone. This
is the final translation-layer test before reopening route construction itself.

## Frozen Factorial Before Combined Output

| arm | route quality | route volume | status |
|---|---:|---:|---|
| control | `2500` | `16000` | measured |
| quality | `6000` | `16000` | measured |
| volume | `2500` | `34000` | measured |
| combined | `6000` | `34000` | run now |

No other combination is searched. The combined arm reuses the exact 06C5
population, contexts, nine response rows, `207` replay pairs, prefixes and
seven workers.

## Frozen Decision

- If the combined optimistic ceiling is `>= +0.045` and exposure `<= -0.045`
  in both sets while Phase 1 and `21/21` populations hold, the translation
  layer is jointly sufficient. Run independent B2 and its unchanged dominance,
  context-free and low-block gates.
- Accept the combined gameplay only if original dominance remains `<= 0.55`,
  context-free is neutral, conceded-xG reduction is `>= 0.08`, and low-block
  exchange is no worse than `1.93969 / 2.17507`.
- A red selected B2 after complete-row materiality assigns only
  `selection_power`; a real B2 `GO` opens Step 07.
- If the combined complete row misses either materiality direction, restore
  `2500 / 16000` and record `STOP / RETHINK`: coefficient scaling is exhausted
  and route construction/occasion translation requires structural attribution.

## Expected Files

- `packages/content/src/balance/match-tactics-calibration.json`; only the two
  already-versioned endpoint fields change during this one-arm test;
- `apps/cli/src/commands/simulation-report/tactical-agency-section.ts` and
  `report-registry.ts`; the locked minute-effect profile must name the combined
  arm without duplicating its complete-row producer;
- `apps/cli/src/commands/simulation-report/report-planner.test.ts` only if the
  locked population contract changes;
- `docs/audits/PHASE_81A_ROUTE_QUALITY_VOLUME_INTERACTION.md` **(new)**;
- `docs/audits/README.md`;
- `docs/PROJECT_STATUS.md`;
- this step document;
- `06c7-contextual-route-volume-materiality.md`;
- `README.md`;
- `07-player-task-execution.md` only after B2 `GO`.

Any discovered file is added here with its ownership before editing it.

## Required Checks

```bash
nvm use 24
pnpm cli simulation-report \
  --profile=phase81a-b2-minute-effect-candidate --workers=7 --format=json \
  --report-output=simulation-out/phase81a-b2-translation-combined.json
pnpm cli simulation-report --profile=phase81a-b2 --workers=7 --format=json \
  --report-output=simulation-out/phase81a-checkpoint-b2-independent-replay.json
pnpm check
git diff --check
graphify update .
```

## Definition Of Done

The fourth factorial arm is reported twice, accepted only with every unchanged
guardrail or removed completely, and the next owner follows the frozen rule
rather than a post-output coefficient search.

## Result

The combined `6000 / 34000` arm keeps both Phase-1 populations green but yields
only `+0.03000/-0.03446` in-sample and `+0.03907/-0.03004` out-of-sample. It is
removed; `2500 / 16000` remain. Coefficient scaling is exhausted. Step 06C9
must attribute the structural dilution across plan, opportunity and resolution
facts before any new gameplay change.

The temporary candidate-only profile was removed with the combined arm. No
registered report profile remains unusable on final content.
