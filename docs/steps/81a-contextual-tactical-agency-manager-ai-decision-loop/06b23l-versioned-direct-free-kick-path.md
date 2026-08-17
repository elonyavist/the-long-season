# Step 06B23L - Versioned Direct-Free-Kick Path

## Status

Done - complete named-specialist path accepted by L6.3H.

## User-Facing Reason

A dangerous foul should sometimes create a visible shot by a named specialist,
with a goalkeeper and believable miss/save/goal outcomes. It must not create an
anonymous bonus goal. Strong specialists may outperform the average and weak
ones may underperform it, preserving exceptional football stories.

## Frozen Candidate

Extend the required `MatchDisciplineConfig` version to
`match-discipline-calibration-v2` with:

- minimum non-penalty `zoneDanger`: `8000` basis points;
- direct-shot choice: `7500` basis points;
- base goal probability: `646` basis points, the rounded external `6.4608%`;
- reference free-kick ability `14`, `+30` basis points per ability step;
- reference goalkeeper reflexes `12`, `-15` basis points per ability step;
- final conversion clamped to `250..1300` basis points.

The taker is the on-field non-goalkeeper with highest `freeKicks`, stable ID as
the final tie-break. The goalkeeper is the fielded goalkeeper. RNG uses its own
stable direct-free-kick stream. A penalty always takes precedence; a dangerous
foul that is neither a penalty nor selected for a direct shot stays a foul and
ordinary restart.

The modifiers are deliberately small around the empirical base. They make
specialists matter without turning the external population average into a hard
per-player rate.

## Durable Facts

Add `deadBallKind: penalty | direct_free_kick` to new dead-ball shot contexts.
It is absent for open-play shots. Direct free kicks use the ordinary durable
goal/save/miss shot events, so score, xG, attempts, player goals and goalkeeper
saves reconcile through the canonical pipeline. They never carry an assist or
creator. The additive fact is compatible with existing reports and does not
reinterpret their score.

## Reachability

Real deterministic match seeds must reach:

- direct shot selected and not selected at the frozen geometry;
- scored, saved and missed outcomes;
- different selected takers when `freeKicks` order changes;
- higher/lower conversion probabilities in the direction of real attributes;
- no direct free kick when a penalty was awarded.

## What NOT To Implement

- no foul, card, penalty, ordinary chance, assist or table tuning;
- no exact `7850` fit from L6.3G;
- no anonymous goal or post-match reconstruction;
- no optional config/default/compatibility reader;
- no second report entrypoint.

## Expected Files

- domain match-event shot context and tests: additive dead-ball discriminator;
- engine match config, discipline, step projection, report projection and tests:
  required v2 calibration and canonical direct-shot resolution;
- content gameplay config and tests: sole shipped candidate owner;
- CLI assist/dead-ball observer, evaluator and tests: direct attempts/outcomes
  and total dead-ball reconciliation;
- report calibration projection and affected canonical fixtures enumerated by
  typecheck after the required config expands;
- this step, L6.3H checkpoint step, Phase README, status and audit index.

## Required Verification

```bash
nvm use 24.19.0
pnpm check
git diff --check
graphify update .
```

## Outcome

`match-discipline-calibration-v2` owns the complete two-stage decision. Direct
free kicks use a named best on-field taker, a named goalkeeper, real attributes,
their own deterministic streams and the canonical shot/stat/score projection.
Dangerous restarts not shot directly remain ordinary restarts; penalties always
take precedence.

Real-seed tests reach choice/non-choice, goal/save/miss, specialist selection,
attribute direction and penalty precedence. The full gate passed `308` test
files and `2,421` tests. L6.3H accepted the path without refinement.
