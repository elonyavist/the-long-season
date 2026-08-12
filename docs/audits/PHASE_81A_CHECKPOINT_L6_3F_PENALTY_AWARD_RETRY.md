# Phase 81A - Checkpoint L6.3F Penalty Award Retry

## Verdict

**GO.** The versioned award frequency repairs penalty supply while conversion
and non-set-piece assist semantics remain inside their frozen external bands.

## Frozen Run

- profile `phase81a-penalty-award-l6-3f-7x1`;
- prefix `phase81a-penalty-award-l6-3f-v1`;
- `7` fresh worlds, `1` season, exactly `7` workers;
- `match-discipline-calibration-v1`, `3500` basis points;
- exit `0`, report `PASS`, zero reconciliation;
- report hash `b12b872187cf3ee149875a237f63e3e3`;
- file SHA-256
  `8d6279bb5b16b4062daeee85db02f910c708dc5d0d081ee1c174cd9e441cd31d`.

## Decision Table

| Measure | Fresh game | External | Band | Decision |
|---|---:|---:|---:|---:|
| penalty attempts / match | `0.2623716153` | `0.2636783125` | `+/- 0.03` | held |
| penalty conversion | `0.7259786477` | `0.7500` | `+/- 0.04` | held |
| penalty goals / match | `0.1904761905` | `0.1977587343` | diagnostic | observed |
| ordinary assisted share | `0.7540106952` | `0.7512` | `+/- 0.02` | held |

All scored, saved and missed branches are reached. The checkpoint accepts only
the award-frequency owner: it gives no credit to conversion and says nothing
about direct free kicks, whose path is still absent.

## Handoff

Observe dangerous non-penalty foul geometry on a fresh population and freeze a
selection rule before implementing direct free kicks. No post-output threshold
or combined dead-ball fudge is authorized.
