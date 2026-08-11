# Phase 81A Checkpoint L6.1C - Common-Support Renewal Attribution

## Verdict

Executed on 2026-08-11. The canonical full decision is:

```text
STOP_RETHINK: antagonistic
```

The three viable policy arms all completed and reconciled. Role-aware market
logic, conditional on the blueprint, reduced four-formation replication by
`0.04761904761904761`; the unhealthy movement cleared the existing `0.02`
floor in `5/7` paired worlds. No market, blueprint or joint renewal correction
is authorized.

This is not a factorial result. Both machine-readable fields remain:

```text
mainEffects = not_identifiable_under_common_support
interaction = not_identifiable_under_common_support
```

## Execution And Control Account

| Run | Evidence population | Workers | Original wall time | Exit | Report hash | SHA-256 |
| --- | --- | ---: | ---: | ---: | --- | --- |
| canary | three arms x `7 x 1` | `7` | about `8 min` | `0` | `f5a3a0afdf3161fc4200567d6892972e` | `56dd19e645e6dd42fc45acaafd74c835cb814cf0a67169abff3ba2c67115ad83` |
| full | three arms x `7 x 10` | `7` | about `58 min` | `1` | `a2a62b278156026880425185a3b278ca` | `a8c8f9e479b7aa86ec1baa7075d5495d1abe193f2a404c376c026dfcd4f892d5` |

Each profile first ran the single historical diagnostic world for ten seasons
on one worker. It reproduced:

```text
world = phase81a-renewal-refinement-l6-1a-v1-world-00005
season = 9
reason = finance_lifecycle_rejected
failedOperation = annual_payroll
outcome = counterfactual_nonviable
```

The failed off/off world is diagnostic only and never enters the evidence
population. Canary observer purity was `7/7`; every arm completed `7/7`; all
scenario and linked-path reconciliation counts were zero.

## Policy Arms

| Arm | Policy signature | Local capacity | Division capacity | Four-form retention | Career leader share | Champion points |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| current | market on, blueprint on | `0.0581395` | `0.5813953` | `0.8380952` | `0.2214286` | `72.3857143` |
| without market | market off, blueprint on | `0.0487805` | `0.5487805` | `0.8857143` | `0.2452381` | `73.2857143` |
| without blueprint | market on, blueprint off | `0.0588235` | `0.6000000` | `0.8523810` | `0.2809524` | `73.4714286` |

## Paired Conditional Contrasts

Positive healthy delta means the current product moved toward the frozen
target. Raw champion-point deltas are retained, but health is change in distance
to the historical band rather than “higher is always better.”

| Metric | Market raw / healthy | Healthy / antagonistic worlds | Blueprint raw / healthy | Healthy / antagonistic worlds | Floor |
| --- | ---: | ---: | ---: | ---: | ---: |
| local capacity | `+0.01490 / +0.01490` | `2 / 2` | `+0.00012 / +0.00012` | `2 / 3` | `0.03` |
| division capacity | `+0.04263 / +0.04263` | `4 / 2` | `-0.04381 / -0.04381` | `3 / 4` | `0.03` |
| four-form retention | `-0.04762 / -0.04762` | `1 / 5` | `-0.01429 / -0.01429` | `3 / 4` | `0.02` |
| career-generated leaders | `-0.02381 / -0.02381` | `1 / 4` | `-0.05952 / -0.05952` | `0 / 4` | `0.02` |
| champion points | `-0.90000 / -0.18346` | `0 / 2` | `-1.08571 / -0.28120` | `1 / 2` | `0.5` |

Only the market/four-formation row satisfies the preregistered antagonistic
rule: aggregate unhealthy magnitude at least the floor and at least `5/7`
paired worlds beyond it. No healthy contrast reaches `5/7`.

## Linked Player Paths

| Component | Changed need episodes | Changed fulfilled players | Realized changed players | Downstream intersections | Reconciliation |
| --- | ---: | ---: | ---: | ---: | ---: |
| market | `15,680` | `104` | `57` | `2` | `0` |
| blueprint | `12,150` | `104` | `57` | `2` | `0` |

The joins use dated need episodes, exact acquired player IDs, canonical origin
facts and player-use rows. Final roster ownership never reconstructs a path.
The observed links prove the measurement is not empty; they do not turn an
antagonistic or incoherent aggregate into an owner.

## Method Correction

The first cached evaluation exposed that a constant positive healthy direction
for champion points contradicted the existing `72..88` band. Before closeout,
the evaluator was corrected to report both raw deltas and change in distance to
that band. No target, seed, arm, floor or world fact changed. Cached worlds were
re-evaluated, and the total verdict remained `STOP_RETHINK`; its valid reason is
market harm to formation replication, not champion points already inside band.

## Reproduction

```bash
nvm use 24
pnpm cli simulation-report \
  --profile=phase81a-renewal-common-support-l6-1c-canary-7x1 \
  --workers=7 --format=json \
  --report-output=simulation-out/phase81a-renewal-common-support-l6-1c-canary-7x1.json

pnpm cli simulation-report \
  --profile=phase81a-renewal-common-support-l6-1c-7x10 \
  --workers=7 --format=json \
  --report-output=simulation-out/phase81a-renewal-common-support-l6-1c-7x10.json
```

Both profile commands ran alone. Exit codes were captured from the real
process, never from a pipe. The JSON artifacts and resumable shards are ignored
local files.

Final repository verification: `pnpm check` passed `305` test files and `2372`
tests, cruised `878` modules with zero dependency violations, and passed every
custom check plus workspace typecheck.
