# Step 16C - Development Aptitude x Late Physical Lifecycle Factorial

## Status

Done - preflight `STOP / RETHINK`; the long run was never opened. The successor
pipeline passed its real eight-year reachability and mean-preservation test.
The lifecycle preserved a quality-15 age-38 veteran, but its fragile-population
`p90` role-quality loss was `1.7744`, below the declared `2.0`. Step 16D carries
the unchanged pipeline and analytically rescales only the failed late physical
curve before a new profile can run.

## Why L6.33 Stopped

L6.33 falsified two exact treatments, not the observed owners. Its high-tail
ceiling moved matched First-Division prospects from `13.76` to `16.18`, but
their current quality moved only `12.35 -> 12.45`; zero reached `16`. Its aging
candidate differed materially from current only before 34 and changed
age-34-plus current quality by `-0.065`. Neither treatment was capable of
moving the rung it claimed to own.

This step removes both callable L6.33 branches. It tests a complete successor
pipeline - credible ceiling plus stable individual development aptitude - and
a genuinely distinct late physical curve. It still never reads age in lineup,
goal, assist or opportunity allocation.

## Frozen Four Arms

Fresh out-of-sample `7 x 10`, exactly seven workers and the same ordered prefix
as L6.33:

| Arm | Successor pipeline | Late physical lifecycle |
| --- | --- | --- |
| `control` | current shipped L6.31 | current shipped |
| `pipeline` | candidate | current shipped |
| `lifecycle` | current shipped | candidate v2 |
| `combined` | candidate | candidate v2 |

Every arm starts from the same generated IDs, roles, ages, current abilities,
contracts and unrelated facts. Pipeline may change only potential at generation
and later positive growth. Lifecycle may change only dated decline. Opening
state is hashed independently of potential; same-input generator and monthly
development tests prove the two authorized differences. Four independent
resumable caches are mandatory.

## Frozen Successor Pipeline

Retain the failed L6.33 `1,000`-basis-point high ceiling only as one half of the
pipeline, never as an independently adoptable branch. Its target table remains
unchanged. Add one immutable development aptitude derived from world seed and
player ID, independent of intake order and potential draw:

| Stable share | Aptitude range |
| ---: | ---: |
| 5% | 1.55..1.90 |
| 15% | 1.15..1.55 |
| 60% | 0.75..1.15 |
| 20% | 0.45..0.75 |

Multiply aptitude by a determination factor `0.90..1.10`, then multiply only
positive monthly development. Minutes, performance, club environment, age
curve, true potential, hard caps and the `0.27` monthly input remain final
bounds. The weighted aptitude mean is `0.97875` before determination: this is a
spread, not a generic youth bonus. It applies to every player still inside a
positive growth window, so a late developer remains possible and a high
ceiling is not a guarantee.

Reachability before the long run requires real monthly rows to show at least
one factor below `0.55`, one above `1.70`, deterministic replay, and a wider
eight-year current-quality outcome distribution than control without changing
the cohort mean by more than `0.25`.

Preflight correction before the long run: the first focused lifecycle test
also asserted that the durable-population `p10` loss was `<=0.9`. That number
does not appear anywhere in this frozen contract and is not required to prove
either heterogeneity or veteran reachability. It was removed rather than used
to tune the curve. The declared age-38 quality-15 branch and a fragile loss
above two points remain asserted.

The remaining fragile-loss assertion then measured `1.7744` and failed. That
is a real preregistered failure, so this step did not weaken it or execute the
locked profile. L6.35 derives a new physical scale from the missing role-loss
distance; it is a new candidate and checkpoint, not an L6.34 rerun.

## Frozen Lifecycle V2

Keep goalkeeper aging, physical floor `7`, maximum monthly input `0.045`,
potential compression and all technical/mental start ages unchanged. For
outfield physical attributes use:

- under 30: `0`;
- age 30-31: `0.45`;
- age 32-33: `1.00`;
- age 34-35: `1.80`;
- age 36+: `2.60`.

Use one immutable factor `0.55..1.45`, determination `1.15..0.85` and stamina
`1.10..0.90`, multiplicatively. This creates durable and fragile careers; it
does not exempt a famous player or punish an age label downstream. A focused
four-season real-aging trajectory must show distinct durable and fragile
outcomes and retain at least one age-38 outfielder above role quality `15` from
an age-34 quality-17 population. If the last branch is unreachable, the long
run stays closed.

## Frozen Measures

Use the L6.33 quality -> opportunity-rate -> raw-opportunity -> output ladder
over First Division seasons 7-10, top ten per lane/world/season, stable ID tie
break. Preserve every integrated L6.2 failure key relative to fresh control.

Absolute adoption requires:

- scorer output mean age `25.5..28.5` and creator `25.0..28.5`;
- scorer and creator output age-33-plus share each `<=0.12`;
- matching quality mean ages no higher than the output upper bounds and
  matching quality age-33-plus shares `<=0.12`;
- season-ten career-generated leader share `>=0.50`;
- an age-33-plus output leader in at least `3/7` worlds;
- no new integrated, tactical, role, formation, economy, ability-range,
  current-above-potential, cache, purity or reconciliation failure.

Pipeline materiality requires both successor gaps to fall `>=0.50`, generated
current-16 count to rise `>=50%`, leader share to rise `>=0.15`, and all three
directions in at least `5/7` worlds in both lifecycle backgrounds. Lifecycle
materiality requires both quality mean ages to fall `>=1.5`, both quality
age-33-plus shares to fall `>=0.15`, and both directions in at least `5/7`
worlds in both pipeline backgrounds while veteran reachability holds.

Decision is total and preregistered: adopt the smallest absolute-clearing arm;
`REFINE_SHARED`, `REFINE_PIPELINE` or `REFINE_LIFECYCLE` only when its exact
materiality/coherence rule holds; otherwise `STOP / RETHINK`. Opposite signs,
purity failure or lost veteran reachability are always `STOP / RETHINK`. No
number moves after output.

## Expected Files

- The L6.33 Expected Files, because its two candidates and locked profile are
  removed or replaced rather than retained as historical production branches.
- `packages/engine/src/career/player-development.ts` and test: one stable
  development aptitude at the existing positive-growth owner.
- `packages/engine/src/career/player-aging-policy.ts` and test: lifecycle v2 and
  real trajectory reachability.
- `apps/cli/src/commands/simulation-report/career-sections.ts`,
  `succession-priority-attribution.ts`, `report-registry.ts` and tests: L6.34
  four-arm orchestration and decision, with no L6.33 callable profile.
- `packages/i18n/src/labels.ts`; this step, Step 16B, phase README, status,
  L6.33/L6.34 audits and audit index; `vitest.config.ts` only for the already
  recorded nested-worker suite correction inherited from Step 16A.

All analysis switches and four-arm orchestration are removed by Step 16D. The
smallest accepted arm becomes the one default implementation; every rejected
branch, label, profile, cache mapping and helper is deleted in that same step.

## Required Checks

Focused reachability, purity, deterministic replay, typecheck and diff check,
then alone:

```sh
pnpm cli simulation-report \
  --profile=phase81a-development-lifecycle-factorial-l6-34-7x10 \
  --workers=7 --format=json \
  --report-output=simulation-out/phase81a-development-lifecycle-factorial-l6-34-7x10.json
```

Resume and rebuild must be byte-identical. Full `pnpm check` and Graphify run
after the final product tree, not beside the long-run gate.
