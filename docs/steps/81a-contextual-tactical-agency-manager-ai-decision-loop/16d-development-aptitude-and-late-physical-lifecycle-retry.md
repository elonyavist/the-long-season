# Step 16D - Development Aptitude x Late Physical Lifecycle Retry

## Status

Done - `STOP / RETHINK`. The preflight passed, but no long-run arm was both
material and inside the absolute football bands.

## Reason

L6.34 did not reach the long run. Its successor pipeline passed every focused
condition and is carried byte-for-byte. Lifecycle v2 produced a four-season
fragile `p90` role-quality loss of `1.7744` against `2.0`, while preserving the
required quality-15 age-38 veteran. Only the physical magnitude was underpowered.

The ratio from the center of the desired fragile range (`2.25`) to observed
`1.7744` is `1.268`. Applying that scale and rounding to one decimal yields the
new late bands below. This derivation is frozen before v3 executes; it is not a
search over long-run output.

## Frozen Lifecycle V3

Outfield physical multipliers only:

- under 30: `0`;
- age 30-31: `0.5`;
- age 32-33: `1.2`;
- age 34-35: `2.3`;
- age 36+: `3.3`.

Everything else from L6.34 is unchanged: physical floor `7`, monthly input
`0.045`, immutable `0.55..1.45`, determination/stamina factors, goalkeepers,
technical/mental curves, potential compression, selection and output.

Preflight requires a four-season quality-17 striker population to retain at
least one quality-15 player at 38, record median role-quality loss `1.5..2.5`,
fragile `p90` loss `2.0..3.5`, deterministic replay and strict career spread.
Failure stops before the long run.

## Frozen Long-Run Contract

Use the exact L6.34 four arms, purity rules, absolute Big Five targets,
materiality/coherence rules and OOS prefix, replacing only lifecycle v2 with
v3. Profile:
`phase81a-development-lifecycle-factorial-l6-35-7x10`. Seven worlds, ten
seasons, exactly seven workers, four fresh resumable caches. No L6.33/L6.34
profile remains callable.

Decision remains: adopt the smallest absolute-clearing arm; refine only a
material/coherent owner; otherwise `STOP / RETHINK`. No threshold changes.

## Expected Files

All Step 16C Expected Files, because the non-callable L6.34 profile/version is
replaced in place. This document, phase README, status, L6.34 audit and the
eventual L6.35 audit are also owned. Step 16E removes every analysis seam and
rejected branch after the verdict.

## Required Checks

Focused preflight, typecheck and diff check, then alone:

```sh
pnpm cli simulation-report \
  --profile=phase81a-development-lifecycle-factorial-l6-35-7x10 \
  --workers=7 --format=json \
  --report-output=simulation-out/phase81a-development-lifecycle-factorial-l6-35-7x10.json
```

Resume/rebuild byte identity, full `pnpm check`, Graphify and a fresh product
HTML occur only after Step 16E adopts and removes experimental orchestration.

## Recorded Result

The fresh four-arm `7 x 10` ran with exactly seven workers and zero immediate
purity failures or new integrated failures. None of the four arms met the
absolute contract:

| arm | generated leader share | scorer mean age / 33+ | creator mean age / 33+ |
| --- | ---: | ---: | ---: |
| control | `0.2000` | `30.9857 / 0.4571` | `30.3071 / 0.4107` |
| successor pipeline | `0.1714` | `31.2714 / 0.4750` | `30.2607 / 0.4286` |
| late lifecycle | `0.2286` | `30.6857 / 0.4321` | `29.8643 / 0.3643` |
| combined | `0.2000` | `31.0000 / 0.4429` | `30.0786 / 0.4000` |

The late lifecycle remained non-material: its largest mean-age reduction was
`0.3571`, not `1.5`. The high-tail-plus-aptitude pipeline reduced both the
generated-current-16 count and the generated-leader share. It is rejected, not
adopted.

Reading the retained canonical facts located a narrower transition failure.
Across First-Division seasons 7-10, `1,255` generated senior-player seasons
still had at least `0.5` potential room; `395` received fewer than `540` senior
minutes and `130` received exactly zero. One real serious prospect moved from
`7.5518` at generation to `11.7942` in the academy, then recorded zero senior
minutes at ages 20, 21 and 22 and no further growth while retaining `1.8494`
room. Raising potential or a non-zero-minute growth coefficient cannot repair
that path. Step 16E therefore owns canonical low-detail development-squad
minutes after academy promotion, paired with the still-unadopted lifecycle.
