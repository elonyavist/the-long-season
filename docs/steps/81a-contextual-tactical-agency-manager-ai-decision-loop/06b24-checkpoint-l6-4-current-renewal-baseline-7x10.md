# Step 06B24 - Checkpoint L6.4 Current Renewal Baseline 7 x 10

## Status

**Done on 2026-08-12: `OWNER QUESTION: market_distribution`.** The fresh
population reconciles and proves that senior-quality young players exist and
play, but the same-club succession transition remains scarce.

## Question

After match actors and dead balls are complete, where does generational renewal
still fail? Do not infer the answer from the earlier L6.2/L6.1 populations:
direct goals can change leaderboards, and the current product must be measured
as one coherent world before another career rule moves.

## Frozen Population

- profile `phase81a-renewal-baseline-l6-4-7x10`;
- prefix `phase81a-renewal-baseline-l6-4-v1`;
- exactly `7` fresh worlds, `10` seasons and `7` workers;
- all three divisions, diagnostic detail, every canonical career section;
- current product only; no ablation, cache reuse, gameplay change or HTML;
- required `match-discipline-calibration-v2`.

## Readers

Record at minimum, per world and pooled:

- career-generated share of season-ten scoring/assist leaders;
- season-ten senior participation and leader production by origin;
- opening-senior survival and age-33-plus starts/minutes/leaders;
- local and division replacement capacity by role;
- unique players used, appearance share and academy call-up minutes;
- renewal need funnel and its dominant terminal reasons;
- formation retention, standings, goal/assist and all reconciliation guards.

The existing integrated L6.2 evaluator is reused: it is allowed to return
`REFINE`, but no failed family may be silently filtered. This step attributes
nothing by itself; it selects the next causal question from fresh facts.

## Decision

- **GO / close renewal:** every frozen renewal, veteran-load and squad-use gate
  holds, with zero structural failure;
- **OWNER QUESTION:** structure reconciles but one or more families remain red;
  write one causal checkpoint for the earliest failing transition;
- **STOP / RETHINK:** facts, origins, participations or calibration stamps fail
  to reconcile.

## Expected Files

- report registry/planner and five-language profile labels;
- this step, Phase README, status, audit and index;
- no engine, content, domain, storage or web file.

## Required Verification And Command

```bash
nvm use 24.16.0
pnpm check
pnpm cli simulation-report \
  --profile=phase81a-renewal-baseline-l6-4-7x10 \
  --format=json \
  --report-output=simulation-out/phase81a-renewal-baseline-l6-4-7x10.json
git diff --check
graphify update .
```

## Outcome

The canonical run completed all `7` worlds and `70` world-seasons in about
fourteen minutes. It returned exit `1` because the integrated checkpoint is
correctly `REFINE`, not because the population or observer failed.

The renewal path separates cleanly:

- all `7/7` worlds have mature academy quality at or above the opening-senior
  median;
- career-generated senior-quality players receive `0.925490` of material
  minutes, and division-level replacement capacity is `0.516484`;
- same-club replacement capacity is only `0.087912` against `0.20`;
- career-generated players own `0.259524` of season-ten leader slots, while
  opening seniors retain `0.664286`;
- `4,326/8,316` opening seniors remain active at season ten.

This is an owner question, not authorization for generic market expansion.
L6.1C already showed that broadly enabling more role-aware market activity can
damage formation retention. The next checkpoint must therefore compare a
bounded succession-priority rule inside the existing talk, finance and transfer
caps. It must preserve formation identity and total market volume while testing
whether already-viable young players reach the clubs whose incumbents are
aging.

Report hash: `57e5a17d29753eb44650c52c38c05ae5`. File SHA-256:
`d650a040253f59ea27f62234e5de6cbdfd58f872dd32a5e64380ba424499e907`.
The complete decision record is in
[`PHASE_81A_CHECKPOINT_L6_4_CURRENT_RENEWAL_BASELINE.md`](../../audits/PHASE_81A_CHECKPOINT_L6_4_CURRENT_RENEWAL_BASELINE.md).
