# Phase 81A Checkpoint L6.1B - Independent Squad Use And Hierarchy

## Decision

Executed on 2026-08-11. The shared fresh current-product population returned
two independent checkpoint decisions:

- `L6.1B-S = REFINE: not_attributed`;
- `L6.1B-H = GO: owner_identified: population_strength`.

The report process exited `1` because its shell fails closed when either lane
is not `GO`. That exit is an execution summary, not a merged balance verdict.
Only L6.1B-H opens its owner-specific 06B20C step. L6.1B-S keeps 06B20D closed.

## Population

| Run | Population | Workers | Wall time | Exit | SHA-256 |
| --- | --- | ---: | ---: | ---: | --- |
| canary | `7` worlds x `1` season | `7` | `73 s` | `0` | `6b5e1bef5c0c1e21ac740aad71c9b3d554c6144d5ed2113dd96e42ef08aaa991` |
| full | `28` worlds x `10` seasons | `7` | `4,705 s` | `1` | `e7e7e31ca05491b167e8d3795d030c9a6bf10c70c155256fb1a16dfbf4f135b1` |

Both runs used their locked profiles and fresh declared prefixes. The canary's
seven ordinary projections were bit-identical to their observer-disabled
shadows after declared analysis fields were removed. Its two balance decisions
were `not_evaluated`; none of its values enter the full checkpoint.

## L6.1B-S - Squad Use

| Measurement | Current product | Pooled structural limit | Historical band |
| --- | ---: | ---: | ---: |
| appearance share | `0.6488947619996218` | `0.5751526658567618` | `0.48..0.58` |
| distinct users per club-season | `23.02559523809524` | `25.977777777777778` | `26..31` |

- per-world owner: `matchday_selection` in `28/28`;
- reconciliation failures: `0`;
- failed key: `structural_stage_owner`;
- decision: `REFINE: not_attributed`.

The counterfactual structural limit puts appearance share inside its band but
misses the distinct-user lower bound by `0.022222222222222143`. The evaluator
does not round that value or replace the frozen target after output. This is a
near-boundary structural diagnostic, not proof that a specific selection rule
would create the missing real appearances. No squad-use correction is opened.

## L6.1B-H - League Hierarchy

| Measurement | Current | Paired strength replay |
| --- | ---: | ---: |
| First-Division champion points mean | `71.47142857142858` | `76.74285714285715` |
| coherent owner worlds | - | `28/28` |

Both the pooled owner and table owner are `population_strength`. All five
historical no-new-distance guardrails held:

| Guardrail | Current | Paired |
| --- | ---: | ---: |
| last-club points | `23.396428571428572` | `19.935714285714287` |
| points spread | `48.075` | `56.80714285714286` |
| points-per-game standard deviation | `0.3970104228902705` | `0.47985472711825705` |
| goals per match | `2.8168067226890776` | `2.880135387488329` |
| draw share | `0.2735877684407092` | `0.25329131652661063` |

Reconciliation failures were `0`. The decision is
`GO: owner_identified: population_strength`. It authorizes only the conditional
06B20C design; it does not authorize solving a multiplier from the observed
points delta.

## Reproduction

```bash
nvm use 24
pnpm cli simulation-report \
  --profile=phase81a-independent-owners-l6-1b-canary-7x1 \
  --workers=7 --format=json \
  --report-output=simulation-out/phase81a-independent-owners-l6-1b-canary-7x1.json

pnpm cli simulation-report \
  --profile=phase81a-independent-owners-l6-1b-28x10 \
  --workers=7 --format=json \
  --report-output=simulation-out/phase81a-independent-owners-l6-1b-28x10.json
```

Each command ran alone. Exit codes were captured from the real command, without
a pipe. The full JSON remains an ignored local artifact under `simulation-out/`.
