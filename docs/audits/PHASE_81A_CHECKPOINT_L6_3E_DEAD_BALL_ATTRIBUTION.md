# Phase 81A - Checkpoint L6.3E Dead-Ball Attribution

## Verdict

**OWNER_IDENTIFIED:** `penalty_award_frequency` and
`direct_free_kick_path`. Penalty conversion is absolved.

## Frozen Run

- profile `phase81a-dead-ball-attribution-l6-3e-7x1`;
- prefix `phase81a-dead-ball-attribution-l6-3e-v1`;
- `7` fresh worlds, `1` season, exactly `7` workers;
- First Division: `2,142` fixtures;
- exit `0`, report `PASS`, zero reconciliation;
- report hash `db8ca76f3cfead388f847a1a68f6704d`;
- file SHA-256
  `a1914699e74294a39aa5c995af3552ab60f9760a6b9281245075ddb0977581ab`.

## Penalty Lane

| Fact | Game | External | Band | Decision |
|---|---:|---:|---:|---:|
| attempts / match | `0.2231559290` | `0.2636783125` | `+/- 0.03` | low |
| conversion | `0.7447698745` | `0.7500` | `+/- 0.04` | held |
| goals / match | `0.1661998133` | `0.1977587343` | diagnostic | low from frequency |

The reports contain `478` awards and exactly `478` outcomes: `356` scored,
`76` saved and `46` missed. All three branches are reachable. Scored outcomes
equal the separately classified penalty goals, so the owner is not an event or
reader mismatch.

Conversion differs from the external value by only `0.0052`; touching it is
forbidden. Attempt frequency differs by `0.0405`, beyond the preregistered
`0.03`, and owns the penalty shortfall.

## Direct Free Kicks

The external positive path supplies `0.074489` goals per match. The current
engine and durable event union have no direct-free-kick award or outcome, so
the checkpoint records `not_implemented` rather than a numeric zero inferred
from silence. `direct_free_kick_path` is therefore an independent structural
owner.

## Handoff

The two owners are corrected separately. First, penalty award frequency moves
through a versioned engine calibration while conversion stays byte-for-byte
unchanged. After its checkpoint, an observational foul-geometry step derives a
direct-free-kick eligibility rule from existing structured fouls; no guessed
zone threshold is authorized here.
