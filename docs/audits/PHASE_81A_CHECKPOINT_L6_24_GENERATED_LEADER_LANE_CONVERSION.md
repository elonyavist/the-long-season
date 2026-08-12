# Phase 81A Checkpoint L6.24 — Generated Leader-Lane Conversion

## Verdict

`MIXED`. The current product's quality-ready generated cohort does not have one
pooled terminal owner, but scorer and creator lanes have materially different
failure shapes.

## Evidence

- read-only L6.20 current-product cache;
- seven worlds, ten seasons, 21 competitions, 420 canonical lane slots;
- zero reconciliation or unclassifiable rows;
- scorer, creator and all five stages reachable on real cached data;
- byte-identical replay SHA-256
  `5a0e0253416063799a95e49beda99eb87f4ac39e1d6d7b3a8d08f182c301b0ac`.

| Terminal stage | Pooled | Scorer | Creator |
| --- | ---: | ---: | ---: |
| quality depth | `115` | `47` | `68` |
| selection volume | `74` | `8` | `66` |
| actor access | `35` | `5` | `30` |
| occasion conversion | `64` | `4` | `60` |
| rank cutoff | `4` | `1` | `3` |
| observations | `292` | `65` | `227` |
| generated leaders | `85` | `33` | `52` |

Quality depth is largest in five worlds but owns only `0.3938`, below the
frozen pooled majority. It is decisive for scorer observations (`0.7231`),
whereas creator observations are split almost evenly among quality, minutes and
conversion.

## Consequence

No population, lineup, actor or execution rule opens from the pooled result.
L6.25 preserves the exact same floors and reads independent overlapping deficit
flags per lane. That prevents terminal ordering from hiding a shared creator
owner and prevents a scorer-quality finding from authorizing an unrelated
creator correction.
