# Phase 81A Checkpoint B2.1 - Conditioned Response Attribution

## Verdict

`OWNER_IDENTIFIED` for the tactical failure: `lateral_route_leverage`.
Formation concentration is `mixed`: `selection_fit` and `sampling_variance`
both satisfy their frozen rules, while the single-identity `squad_chart` rule
does not.

No gameplay value changed. The report recomputed the complete B2 population,
reproduced its frozen result and reconciled every stored analytic factor with
the canonical payoff before assigning an owner.

## Locked Run

- command: `pnpm cli simulation-report
  --profile=phase81a-b2-attribution --workers=7 --format=json
  --report-output=simulation-out/phase81a-checkpoint-b2-1-attribution.json`
- artifact SHA-256:
  `4fde527a9024c357a1ed5038307ed63c83b79bc2740cf78730f117f1497e829e`
- report hash: `a18e9a7824de9ed9f4ba9ed871ea9a79`
- process exit: `0`; canonical decision `NOT_EVALUATED`, because attribution
  identified an owner but did not make the failed B2 gate pass
- workers: exactly `7`
- B2 reproduction: `true`
- factor-to-payoff reconciliation mismatches: `0 / 61,236` candidates

## Tactical Attribution

| Measure | In-sample | Out-of-sample |
| --- | ---: | ---: |
| Matchups | 378 | 378 |
| Materially asymmetric matchups | 14 | 28 |
| Contexts | 3,402 | 3,402 |
| `high_pressing|balanced` share | 0.6670 | 0.7011 |
| Tactic-magnitude rule | false | false |
| Interaction rule | false | false |
| Lateral-route-leverage rule | **true** | **true** |

Holding the tactic fixed makes the result decisive:

- `high_pressing`: balanced wins `3,401 / 3,402` and `3,399 / 3,402`;
- `direct_play`: balanced wins `3,401 / 3,402` and `3,399 / 3,402`;
- `low_block`: balanced wins every context in both sets;
- in materially asymmetric matchups, balanced wins all `126 / 126` and
  `252 / 252` contexts inside every tactic row.

Holding focus fixed does not produce one tactic at the frozen `80%` floor:
`high_pressing` ranges from `66.7%` to `74.1%` in-sample and `70.2%` to `77.1%`
out-of-sample. Therefore the failure is not authorized as a global pressing
coefficient change.

The first high-press-versus-direct factor in the preregistered factor order
with a coherent sign is `control`, but this is a diagnostic ordering, not the
causal owner rule. Volume is exactly unchanged. Control, saturation, lateral
allocation and route quality all favour high press in `7 / 7` worlds in both
sets. The largest mean raw edge is lateral allocation (`0.01746 / 0.01758`).

## Formation Attribution

Both failed rows remain exactly one club above the frozen band:

- out-of-sample world `002`, Third Division: `4-4-2 = 6`, allowed `5`;
- out-of-sample world `006`, Second Division: `4-4-2 = 6`, allowed `5`.

All twelve selections are unique maxima and every best-minus-second margin is
positive (`0.04` through `1.59`). The catalog and tie order do not cause the
concentration, so `selection_fit` holds. Both rows fail only
`top_formation_share` and every sister division in the same worlds passes the
complete population gate, so `sampling_variance` also holds.

The single-identity rule fails for a useful reason: the twelve clubs split
exactly between `wide_midfield_stock` and `double_width_stock`, rather than one
identity owning at least `80%`. Across all worlds those identities select
`4-4-2` at `89.13% / 84.09%` in-sample and `95.92% / 75.51%` out-of-sample.
The correct next question is therefore whether a minimal *family* of two
identity charts owns the local tail; B2.1 does not rewrite its preregistered
single-identity rule after seeing that pair.

## Consequence

The tactical correction may change only lateral-route leverage. Tactic-profile
magnitudes and formation selection are not authorized by this result.

Formation concentration receives one short follow-up attribution that
generalizes the unchanged `80%` cover rule to the minimum identity family. The
frozen `0.30` population band remains red until a later unchanged checkpoint
passes it; `sampling_variance` is never a waiver.
