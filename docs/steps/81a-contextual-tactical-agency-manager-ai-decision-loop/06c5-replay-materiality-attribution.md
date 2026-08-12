# Step 06C5 - Replay Materiality Attribution

## Status

Active. B2 Phase 1 passes twice; Phase 2 records a real but sub-material signal.
This step changes no gameplay and cannot open Step 07 by itself.

## Goal

Separate two mutually exclusive immediate owners of the B2 replay shortfall:

1. the frozen eight-pair selection stream cannot identify the response that the
   match engine already rewards;
2. no response in the match engine reaches the frozen `+0.045 / -0.045`
   magnitude, even with optimistic same-stream ordering.

## Frozen Measurement Before Output

Reuse the exact `64` accepted reciprocal selected contexts, their integer
weights, the nine responses, `207` replay pairs and seven workers from 06C4.
For every context, replay all nine responses against its frozen opponent
response on the existing Phase-2 replay stream. Do not select new contexts,
add seeds or alter 06C4 evidence.

For each context derive from that complete replay response row:

- the maximum response win share;
- the minimum response win share;
- the existing uniform context-free win share;
- the response chosen by the frozen eight-pair selection stream;
- selection regret: replay maximum minus the selected response's replay share;
- exposure regret: selected exposed share minus replay minimum.

Aggregate with the exact 06C4 context weights. Same-stream maximum/minimum are
optimistically biased, which is useful here: they are an upper/lower bound, not
new checkpoint evidence.

## Frozen Decision

- `minute_effect_materiality`: optimistic ceiling `< +0.045` and optimistic
  exposure `> -0.045` in both seed sets;
- `asymmetric_materiality`: exactly one of the two optimistic bounds reaches
  its frozen target coherently in both sets;
- `selection_power`: both optimistic bounds reach target in both sets while
  the accepted selected arms remain red;
- `mixed`: set-level owners disagree;
- `STOP / RETHINK`: weights, contexts, seeds, blind arm or accepted 06C4 facts
  do not reconcile exactly.

No threshold is added for “how much regret explains.” The existing `±0.045`
targets alone decide whether the signal exists anywhere in the response row.

## Expected Files

- `packages/simulation-tools/src/tactical-agency/tactical-agency-audit.ts` and
  test;
- `packages/simulation-tools/src/index.ts` if new result types cross the public
  boundary;
- `apps/cli/src/commands/simulation-report/tactical-agency-section.ts` and test;
- `apps/cli/src/commands/simulation-report/tactical-agency-structural-worker.ts`;
- `apps/cli/src/commands/simulation-report/report-registry.ts` and planner test
  if a distinct canonical profile is required;
- `packages/i18n/src/labels.ts` only for a new visible profile;
- `docs/audits/PHASE_81A_CHECKPOINT_B2_REPLAY_MATERIALITY_ATTRIBUTION.md` **(new)**;
- `docs/audits/README.md`;
- `docs/PROJECT_STATUS.md`;
- this step document;
- `06c4-independent-counter-move-replay.md`;
- `README.md`.

Any discovered file is added here with its ownership before editing.

## Required Checks

```bash
nvm use 24
pnpm cli simulation-report --profile=phase81a-b2-materiality --workers=7 \
  --format=json \
  --report-output=simulation-out/phase81a-checkpoint-b2-materiality.json
pnpm check
git diff --check
graphify update .
```

## Definition Of Done

The complete replay row reconciles every 06C4 selected and blind reading, both
seed sets receive one frozen owner, no accepted gate is reinterpreted, and only
the demonstrated owner receives a later correction step.
