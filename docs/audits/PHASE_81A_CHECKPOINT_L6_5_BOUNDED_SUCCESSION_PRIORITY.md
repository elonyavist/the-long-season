# Phase 81A - Checkpoint L6.5 Bounded Succession Priority

## Verdict

**REFINE: `market_distribution`.** Moving exact-role succession ahead of
non-urgent needs is reachable and safe, but does not produce club-local or
leaderboard renewal. It is not the product default.

## Frozen Run

- profile `phase81a-succession-priority-l6-5-7x10`;
- prefix `phase81a-succession-priority-l6-5-v1`;
- paired `legacy_order` and `bounded_succession_order` arms;
- `7` identical world seeds, `10` seasons, exactly `7` workers per serial arm;
- both arms complete, zero reconciliation and complete population signatures;
- exit `1`, report hash `09aa4fb6ee066111fd6053a51acc7d02`;
- SHA-256
  `463b4c4c2342b3d1116eea4527f897303016c697a790352ddcc3565fcb370247`.

## Decision

| Fact | Legacy | Candidate | Reading |
|---|---:|---:|---|
| local replacement | `0.069767` | `0.054945` | worsened; only `2/7` worlds improve |
| division replacement | `0.476744` | `0.560440` | materially improved |
| generated leader share | `0.240476` | `0.245238` | immaterial; only `3/7` improve |
| four-formation retention | `0.885714` | `0.871429` | guardrail held |
| transfer acquisitions | `5,050` | `5,263` | ratio `1.042178`, guardrail held |

The candidate increases the availability of role-compatible alternatives in
the division without turning them into the successor at the relevant club.
Generic market volume, broader priority, stronger generation and faster growth
remain unauthorized. A cached linked-player attribution must now determine
whether fulfilled succession deals select older/opening-senior targets or
whether suitable generated players arrive but fail downstream.
