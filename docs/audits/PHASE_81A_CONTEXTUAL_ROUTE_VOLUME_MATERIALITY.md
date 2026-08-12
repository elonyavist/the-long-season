# Phase 81A Contextual Route-Volume Materiality

## Decision

`STOP / RETHINK` for the candidate sweep. `22000`, `28000` and `34000` all
miss complete-row materiality; the product retains `16000`.

The ownership migration itself is accepted. The former hardcoded `1.6` now
lives once as `routeCapacitySeparationBasisPoints: 16000` in schema v5,
calibration v7. It reproduced every 06C5 selected and blind replay value at
exact equality before any candidate ran.

## Results

| candidate | in ceiling / exposure | out ceiling / exposure | Phase 1 | decision |
|---:|---:|---:|---|---|
| `22000` | `+0.02561 / -0.02265` | `+0.02489 / -0.02664` | pass twice | `REFINE` |
| `28000` | `+0.02581 / -0.02507` | `+0.02824 / -0.02802` | pass twice | `REFINE` |
| `34000` | `+0.03082 / -0.02709` | `+0.03145 / -0.02823` | pass twice | `REFINE` |

All populations remain `21/21` and blind values remain neutral. Artifacts:

- baseline SHA-256
  `564d01d91f5633681569dab2e90434a98bcb09c535fec0ea5a37b95030ab4989`;
- `22000`: `4c09bc0b867fe01a5315628eafb3e825c71f5f5ac7b891687d1215d9831ff4ad`;
- `28000`: `91eff23dc1669366edac44948b30c3bc839f42883754fc9fd99caf8276411fc9`;
- `34000`: `129c9967b7075d19b403c8904654fdceb5ff3de838b956e4a51193102f5c2e69`.

## Handoff

Route-quality and route-volume candidates were evaluated separately. That does
not identify their interaction. The missing fourth arm of the endpoint `2 x 2`
factorial—quality `6000` plus volume `34000`—must be measured before declaring
the minute model itself insufficient. No new coefficient may be chosen from
these outputs.
