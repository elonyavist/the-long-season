# Step 06B23K - Checkpoint L6.3G Direct-Free-Kick Geometry 14 x 1

## Status

Done - **REFINE.** Geometry is stable across both arms but one binary threshold
cannot reproduce the external attempt rate.

## Product Reason

Direct free kicks should exist as rare, legible scoring opportunities created by
dangerous fouls, not as extra goals injected to repair a report. Before adding
them, measure whether the engine's existing foul locations can supply the real
attempt rate without changing foul production, cards or penalties.

## Frozen Population

- `pnpm cli simulation-report` only;
- profile `phase81a-direct-free-kick-geometry-l6-3g-14x1`;
- prefix `phase81a-direct-free-kick-geometry-l6-3g-v1`;
- exactly `14` fresh worlds, `1` season and `7` workers;
- worlds `1..7` are calibration; worlds `8..14` are untouched validation;
- complete standard career report, First Division comparison;
- no cache reuse, HTML or gameplay change.

## Frozen Geometry

For every durable foul, associate an awarded penalty only by the same minute and
committing player. A direct-free-kick candidate is a foul not associated with a
penalty whose `zoneDanger` is at least one of these basis-point thresholds:

`5000, 5250, 5500, 5750, 6000, 6250, 6500, 6750, 7000, 7250, 7500, 7750, 8000, 8250`.

Counts are nested and must be monotonically non-increasing. The calibration
arm selects the candidate with minimum absolute distance from the external
StatsBomb rate `1.1529334212` attempts per match. An exact distance tie chooses
the higher threshold, conservatively producing fewer attempts. The rule is
executed once; output cannot add candidates or change the tie-break.

## Decision

- **GO:** the selected candidate lies within `+/- 0.10` attempts/match on both
  calibration and untouched validation, all nesting/reconciliation holds, and
  the accepted penalty attempt/conversion bands still hold;
- **REFINE:** calibration fits but validation misses, or no grid candidate fits
  while geometry and penalties remain structurally sound;
- **STOP / RETHINK:** facts cannot be associated, nested counts break, a split
  is missing, or penalties regress.

The tolerance is deliberately wider than the external sampling error. This is
an eligibility rule for a future attempt path, not permission to fit an exact
cohort decimal.

## What NOT To Implement

- no direct-free-kick event, taker, shot or goal;
- no foul, zone, card, penalty, assist or score change;
- no candidate chosen from output by hand;
- no new report entrypoint.

## Expected Files

- `apps/cli/src/commands/simulation-report/assist-supply-attribution.ts` and
  test: durable foul/penalty association, fixed candidate rows, two-arm
  selection and decision;
- historical target register and test: expose the already-audited
  `1749 / 1517` attempt rate beside its goal rate;
- `apps/cli/src/commands/simulation-report/career-sections.ts`: enable the
  existing observer and evaluate the new checkpoint;
- report registry/planner and five-language profile labels;
- this step, Phase README, status, audit and index.

## Required Verification And Command

```bash
nvm use 24.19.0
pnpm check
pnpm cli simulation-report \
  --profile=phase81a-direct-free-kick-geometry-l6-3g-14x1 \
  --format=json \
  --report-output=simulation-out/phase81a-direct-free-kick-geometry-l6-3g-14x1.json
git diff --check
graphify update .
```

## Result

The closest candidate is `8250`, with `0.8688141923` attempts/match in
calibration and `0.8366013072` in untouched validation. The adjacent `8000`
candidate yields `1.4691876751` and `1.4645191410`; the external value
`1.1529334212` lies between them. Penalty attempts (`0.2558356676`) and
conversion (`0.7399635036`) remain healthy, with zero reconciliation.

Decision: **REFINE**. The two arms agree, so widening the same sample or
choosing an unregistered decimal threshold would not solve the missing product
concept. A dangerous free kick and a direct shot are different decisions.

Report hash `9dbef27623de2cc75c448aebe224545a`; file SHA-256
`398ffa49c480e2f56bd43340030411ef95cbedf8f113e50acaad9ecc1764eb58`.

## Handoff

Use the stable `8000` geometry and add a versioned `7500` basis-point direct-shot
choice. This rounded three-in-four football decision projects both arms inside
the external `+/- 0.10` band without fitting the exact observed ratio. The
remaining eligible fouls stay ordinary restarts; they are not deleted or
silently converted into attempts.
