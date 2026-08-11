# Step 06B23B - Corrected Creator-Lane Attribution

## Status

Done - **pre_existing**. The historical creator lane is already red under the
corrected reader, so 06B22B is accepted and a creator-only attribution opens.

## Question

L6.3B's corrected reader accepts top-ten scoring (`18.45`) but rejects top-ten
assists (`7.1614 < 8`). The creator algorithm was not edited by 06B22B, but
changing the shooter can still alter self-created chances and assist credit.
The old claim that creator concentration was green used the invalid pooled-world
reader, so it cannot answer ownership.

## Frozen Evidence Pair

- current arm: corrected L6.3B report
  `phase81a-integrated-l6-3b-7x10-reader-corrected.json`;
- historical arm: the already cached pre-06B22B L6.3 profile
  `phase81a-integrated-l6-3-7x10`, reevaluated with the corrected reader to
  `phase81a-integrated-l6-3-7x10-reader-corrected.json`;
- no simulation, new seed or current-gameplay replay is acceptable for the
  historical arm;
- player-section facts in the corrected historical replay must be byte-identical
  to the original L6.3 report. A mismatch is `STOP / RETHINK`.

This comparison is not paired across the two profile seed sets. It cannot
measure a delta caused by 06B22B. It answers the narrower ownership question:
whether the creator lane was already below its frozen band before 06B22B.

## Predeclared Outcomes

- **pre_existing:** corrected historical `topTenAssistMean < 8`. Accept the
  empirical shooter owner because its direct lane is green; open a creator
  attribution step. Do not call the current/historical difference causal.
- **step_06b22b:** corrected historical `topTenAssistMean` is within `8..10.5`
  while L6.3B is red. Reopen 06B22B and investigate self-created/assist-credit
  coupling; empirical rates themselves remain immutable.
- **not_attributed:** historical facts mismatch, reconciliation is nonzero or the
  metric is unavailable. Stop; neither owner is authorized.

The corrected historical scorer metric is diagnostic only. No historical band
or decision rule changes after replay.

## What NOT To Implement

- no gameplay, report formula, profile, cache suffix, target or seed change;
- no simulation of old seeds under the current engine;
- no subtraction presented as causal evidence;
- no acceptance using the invalid pooled-world metrics.

## Expected Files

- this step, 06B23A, the Phase README and `docs/PROJECT_STATUS.md`;
- the final L6.3B audit and `docs/audits/README.md`;
- a creator attribution step only if the outcome is `pre_existing`.

## Command

```bash
nvm use 24
pnpm cli simulation-report \
  --profile=phase81a-integrated-l6-3-7x10 \
  --format=json \
  --report-output=simulation-out/phase81a-integrated-l6-3-7x10-reader-corrected.json
```

The replay runs alone and must complete from the existing cache. Afterwards the
original/corrected historical `players` sections are hashed and compared before
any metric is read.

## Outcome

The cached historical replay completed in about eleven seconds with canonical
exit `1`, as expected for the inherited overall `REFINE`. It did not simulate a
world under current gameplay.

| Fact | Pre-06B22B corrected | L6.3B corrected |
|---|---:|---:|
| top-ten assist mean | `7.1914` | `7.1614` |
| top-ten scorer mean | `25.2114` | `18.4500` |
| player-section SHA-256 | `a703b521...f913a9` | different seed population |
| reconciliation failures | `0` | `0` |

The original and corrected historical player sections both hash to
`a703b521a40c0c9083346dcc9fbc840c05e018e9c4167849090874dc11f913a9`.
The fixed reader therefore changed only evaluation, not cached facts. Since the
historical assist mean is below the frozen floor `8`, the preregistered result
is **pre_existing**. The `0.03` difference between profiles is not called
causal because their seed populations differ.

06B22B remains accepted: its scorer lane moved into range under an external,
immutable role-frequency baseline. The next step may inspect only the existing
creator nomination and assist-credit path; it may not retune shooter
propensities or infer a coefficient from the `7.1914` distance.
