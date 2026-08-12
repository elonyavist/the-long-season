# Phase 81A Checkpoint B2 Replay Materiality Attribution

## Decision

`OWNER_IDENTIFIED: minute_effect_materiality`.

The complete nine-response replay row reproduces every accepted 06C4 selected
and blind value exactly. Even its optimistic same-stream maximum and minimum
remain well inside the frozen `+0.045 / -0.045` targets in both seed sets. The
match engine rewards contextual responses, but the minute effect is not yet
material enough; response selection cannot be the first correction owner.

## Locked Run

```bash
pnpm cli simulation-report --profile=phase81a-b2-materiality --workers=7 \
  --format=json \
  --report-output=simulation-out/phase81a-checkpoint-b2-materiality.json
```

- real exit: `0`;
- worker count: `7`;
- whole producer: `83,639.432625 ms`;
- accepted reciprocal contexts: `32 + 32`;
- responses replayed per context: `9`;
- replay pairs per response: `207`;
- artifact SHA-256:
  `6cd1592025e910ddab83d5e8507bbf3eb04585c297d46511707bf338b9b47776`.

## Results

| set | accepted ceiling | optimistic ceiling | accepted exposure | optimistic exposure | owner |
|---|---:|---:|---:|---:|---|
| in-sample | `+0.00483` | `+0.02441` | `-0.00808` | `-0.02053` | minute effect |
| out-of-sample | `+0.00797` | `+0.02519` | `-0.00509` | `-0.02159` | minute effect |

The optimistic intervals are respectively `[0.01882, 0.03000]` and
`[-0.02640, -0.01466]` in-sample, then `[0.02003, 0.03035]` and
`[-0.02699, -0.01620]` out-of-sample. None reaches a frozen target. Selection
regret is real (`0.01958 / 0.01722` on the ceiling), but improving selection
cannot expose a `0.045` response that the complete row proves absent.

## Purity And Scope

Both Phase-1 populations remain `PASS_PHASE_1` and `21/21`. Accepted 06C4
ceiling, exposure and context-free values reconcile by exact equality in both
sets; failure would have produced `STOP_RETHINK`. Same-stream maxima and minima
are optimistic attribution bounds only. They do not replace the independent
B2 gate and do not authorize a production oracle.

Only minute-effect materiality opens for correction. Thresholds, response
selection, squad identity and formation logic remain frozen. Step 07 stays
closed until the independent B2 replay itself records `GO`.
