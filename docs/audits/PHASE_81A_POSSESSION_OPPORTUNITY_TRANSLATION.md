# Phase 81A Possession-To-Opportunity Translation

## Decision

Candidate sweep `STOP / RETHINK`. `9000`, `12000` and `15000` all miss
complete-row materiality and generally reduce the optimistic ceiling. The
product retains `possessionChanceInfluenceBasisPoints: 5600`.

The ownership migration is accepted: schema v6 / calibration v8 replaces the
hardcoded `0.72 + share * 0.56` and `0.72..1.28` triplet with one slope. At
`5600`, the derived arithmetic reproduces every accepted 06C5 replay value at
exact equality.

## Results

| candidate | in ceiling / exposure | out ceiling / exposure | decision |
|---:|---:|---:|---|
| `9000` | `+0.02219 / -0.02185` | `+0.02224 / -0.02569` | `REFINE` |
| `12000` | `+0.02051 / -0.02399` | `+0.02038 / -0.02528` | `REFINE` |
| `15000` | `+0.02246 / -0.02467` | `+0.02164 / -0.02421` | `REFINE` |

Phase 1 and `21/21` populations pass in every arm; blind remains neutral.
Candidate artifact SHA-256 values are
`ba56249da22f66bc21233f3c4884f7766f82655e3b96f351506eb2eb7af32d5d`,
`416991730bedeb0364725a680984d08e9b14f29c5b9996ead1a853c30cbedc13`
and `1d4cc2a7e18b3d0a74c5e7837465a8190faa8baca192df0e97c6a55115343034`.

## Durable Profile

`phase81a-b2-current-materiality` is retained under the single
`simulation-report` entrypoint. It evaluates current content without claiming
historical exact reconciliation. On final `5600` it returns `REFINE`, real exit
`1`, and SHA-256
`bf5e1aa4dcd33e21813faf86c359516c1778eec720ed27b32ae8976827929adf`.

## Handoff

All three final translation coefficients have now been bounded separately and
jointly. The remaining discrepancy is structural: Phase 1's analytic threat
multiplies a possession claim, absolute route saturation and expected quality,
while the minute loop uses a different possession transform and relative route
advantage. These are parallel models. They must share one derivation before any
further gameplay calibration or B2 conclusion is valid.
