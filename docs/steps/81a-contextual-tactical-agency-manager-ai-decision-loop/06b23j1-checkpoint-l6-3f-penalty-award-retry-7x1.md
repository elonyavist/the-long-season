# Step 06B23J1 - Checkpoint L6.3F Penalty Award Retry 7 x 1

## Status

Done - **GO**. Award frequency moved into band without changing conversion or
ordinary assist semantics.

## Frozen Population

- `pnpm cli simulation-report` only;
- profile `phase81a-penalty-award-l6-3f-7x1`;
- prefix `phase81a-penalty-award-l6-3f-v1`;
- exactly `7` worlds, `1` season and `7` workers;
- complete standard career report, First Division comparison;
- `match-discipline-calibration-v1` / `3500` basis points required in the
  report calibration versions;
- no cache reuse, HTML or post-run override.

## Decision

- **GO:** attempts/match is within `0.2636783125 +/- 0.03`, conversion remains
  within `0.75 +/- 0.04`, all three outcomes are reached, event/goal
  reconciliation is zero and ordinary assist share remains in its accepted
  band;
- **REFINE:** only the attempt band misses with structure intact; reopen 06B23J
  and retain the external target;
- **STOP / RETHINK:** conversion regresses, reconciliation fails, a branch
  disappears, the config stamp is absent or assist semantics regress.

The absent direct-free-kick path is deliberately not part of this decision; it
is already an identified independent owner and cannot make the penalty retry
fail or pass.

## What NOT To Implement

- no gameplay or target change;
- no direct-free-kick work;
- no combined dead-ball score;
- no HTML.

## Expected Files

- assist/dead-ball checkpoint reader and test: penalty-only total decision;
- report registry/planner and five-language profile labels;
- career section routing through the existing observer;
- this step, Phase README, status, audit and index.

## Required Verification And Command

```bash
nvm use 24.16.0
pnpm check
pnpm cli simulation-report \
  --profile=phase81a-penalty-award-l6-3f-7x1 \
  --format=json \
  --report-output=simulation-out/phase81a-penalty-award-l6-3f-7x1.json
git diff --check
graphify update .
```

## Result

| Measure | Fresh game | Frozen band | Result |
|---|---:|---:|---:|
| penalty attempts / match | `0.2623716153` | `0.2636783125 +/- 0.03` | held |
| penalty conversion | `0.7259786477` | `0.7500 +/- 0.04` | held |
| penalty goals / match | `0.1904761905` | diagnostic | observed |
| non-set-piece assisted share | `0.7540106952` | `0.7512 +/- 0.02` | held |

Scored, saved and missed outcomes all occur; reconciliation failures are zero
and `match-discipline-calibration-v1` is present in every world. Decision:
**GO**. Report hash `b12b872187cf3ee149875a237f63e3e3`; file SHA-256
`8d6279bb5b16b4062daeee85db02f910c708dc5d0d081ee1c174cd9e441cd31d`.

## Handoff

Penalty supply is closed. The next step observes existing foul geometry before
adding the independently absent direct-free-kick path; it may not infer a zone
threshold or conversion from this penalty run.
