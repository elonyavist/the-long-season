# Step 06B26A - Checkpoint L6.6 Ready-Successor Targeting 7 x 10

## Status

Done - `REFINE: target_eligibility`; candidate rejected and removed.

## Frozen Design

- profile `phase81a-ready-successor-l6-6-7x10`;
- prefix `phase81a-succession-priority-l6-5-v1`, deliberately identical to
  L6.5 for paired comparison;
- three arms: `legacy_order`, cached L6.5 `bounded_priority`, and
  `bounded_priority_plus_ready_target_v2`;
- exactly `7` worlds, `10` seasons and `7` workers; arms run serially;
- L6.5 arms are read-only caches; only the ready-target arm may simulate.

## Preregistered Decision

Against legacy, `GO` retains every L6.5 gate and requires local replacement
`+0.05`, generated leader share `+0.03`, positive coherence `5/7`, division
capacity `>= 0.50`, formation delta `>= -0.02`, five healthy formation worlds,
transfer ratio `<= 1.05` and zero reconciliation.

Against bounded priority, the ready-target arm must additionally improve:

- prime-age succession acquisition share by at least `0.20`;
- career-generated prime-age acquisition share by at least `0.05`;
- local replacement in at least `5/7` worlds;
- generated leader share in at least `5/7` worlds.

`REFINE: downstream_selection` requires target shares and local replacement to
hold while leader realization misses. `REFINE: target_quality` means age shifts
but local replacement does not. `STOP_RETHINK` covers contamination, unknown
origin, regression outside guardrails or leader movement without a linked local
path. Only `GO` makes ready targeting and bounded order product defaults.

## Expected Files

- `career-sections.ts` and test, `succession-priority-attribution.ts` and test:
  three-arm composition, target deltas and total decision;
- report registry/planner and five-language labels: one locked profile and
  read-only L6.5 cache account;
- 06B26 engine files only to flip accepted defaults after measured `GO`;
- this step, phase README, status, audit and audit index.

The final HTML remains closed until the accepted product is rerun in an
integrated current-only 7x10.

## Outcome

All seven candidate projections were byte-identical to bounded priority.
Prime-age acquisition share remained `0.164604`, career-generated prime-age
share `0.021040`, local replacement `0.054945`, and season-ten generated leader
share `0.245238`. The profile and its analysis-only target seam were deleted in
this closeout; the audit preserves the evidence.

Next: 06B27 preregisters the soft aging correction demonstrated by L6.4.
