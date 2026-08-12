# Phase 81A - Checkpoint L6.3G Direct-Free-Kick Geometry

## Verdict

**REFINE.** Existing foul geometry is stable and sufficient, but a binary zone
threshold cannot represent whether the attacking team shoots directly.

## Frozen Run

- profile `phase81a-direct-free-kick-geometry-l6-3g-14x1`;
- prefix `phase81a-direct-free-kick-geometry-l6-3g-v1`;
- `14` fresh worlds, `1` season, exactly `7` workers;
- worlds `1..7` calibration, `8..14` untouched validation;
- exit `1`, report `FAIL`, zero reconciliation;
- report hash `9dbef27623de2cc75c448aebe224545a`;
- file SHA-256
  `398ffa49c480e2f56bd43340030411ef95cbedf8f113e50acaad9ecc1764eb58`.

## Adjacent Candidates

| Minimum zone | Calibration attempts/match | Validation attempts/match |
|---:|---:|---:|
| `8000` | `1.4691876751` | `1.4645191410` |
| `8250` | `0.8688141923` | `0.8366013072` |
| external | `1.1529334212` | `1.1529334212` |

The arms differ by at most `0.0323`, while the gap between adjacent thresholds
is about `0.60`. More worlds cannot create the missing behaviour. Penalties
remain healthy at `0.2558356676` attempts/match and `0.7399635036` conversion.

## Product Finding

The engine needs two facts: a dangerous non-penalty foul and the attacking
choice to shoot directly. Starting from `8000`, a rounded `7500` basis-point
shot choice projects `1.1019` and `1.0984` attempts/match, both inside the
frozen `+/- 0.10` band. The next step may implement that two-stage decision;
it may not fit `7850` from the calibration output or move foul geometry.
