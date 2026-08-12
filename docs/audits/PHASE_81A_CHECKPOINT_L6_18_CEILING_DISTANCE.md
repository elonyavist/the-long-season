# Phase 81A - Checkpoint L6.18 Ceiling Distance

## Verdict

`MIXED` - global ceiling correction rejected; First-Division tail isolated.

## Population

- fresh current-policy cache written by L6.17;
- seven worlds, ten seasons and 21 competition observations;
- season-ten annual-academy players generated no later than season six;
- leader floors local to world, competition and represented role;
- stored ceiling equals canonical current ability plus potential room.

This read-only checkpoint did not simulate, reconstruct an archetype or change
gameplay.

## Result

The `1,522` represented mature players split into `492` already at or above
their local leader floor, `480` below it by at most two ability points and `550`
below it by more than two. Shares were `0.3233`, `0.3154`, and `0.3614`.
Neither preregistered majority existed, so the global owner is `MIXED`.

The mandatory competition split is decisive for scope:

| Competition | Players | At/above | <=2 below | >2 below |
|---|---:|---:|---:|---:|
| First Division | 576 | 0.2413 | 0.2309 | 0.5278 |
| Second Division | 584 | 0.2774 | 0.4247 | 0.2979 |
| Third Division | 362 | 0.5276 | 0.2735 | 0.1989 |

A shared uplift would make an already healthy Third-Division cohort stronger
and would erase division identity. The only justified experiment is a bounded
First-Division tail: allow a minority of existing interesting prospects to
reach the next ceiling rating without raising their minimum, changing their
volume, or touching Second and Third Division.

## Reproduction

```bash
pnpm cli simulation-report \
  --profile=phase81a-ceiling-distance-l6-18-cached \
  --workers=7 \
  --format=json \
  --report-output=simulation-out/phase81a-ceiling-distance-l6-18-cached.json
```

The expected profile exit is `1` because `MIXED` is not an accepted product
owner. Artifact SHA-256:
`227246c3268cc750c2289c5f73f97387e9ba10315bfd66a232683a4daaaefa92`.
