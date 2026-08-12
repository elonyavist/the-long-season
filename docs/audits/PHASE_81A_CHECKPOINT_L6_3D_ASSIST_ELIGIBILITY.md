# Phase 81A - Checkpoint L6.3D Assist Eligibility

## Verdict

**GO: assist semantics; residual owner `dead_ball_supply`.** The new ordinary
eligibility path reproduces the external non-dead-ball population with zero
reconciliation. The remaining all-goal gap is explained by a material shortage
of dead-ball goals and does not reopen assist eligibility.

## Frozen Run

- profile: `phase81a-assist-eligibility-l6-3d-7x1`;
- seed prefix: `phase81a-assist-eligibility-l6-3d-v1`;
- `7` fresh worlds, `1` season, exactly `7` workers;
- canonical `pnpm cli simulation-report` entrypoint;
- exit `0`, report decision `PASS`;
- report hash: `d64eeaf5511d200435dbfb58b28831a9`;
- file SHA-256:
  `2f249592099b8abb92e53018c3528259b1eaea9ea159dcd81c5ce647c23c9388`.

## Result

| Fact | Observed | External / gate | Result |
|---|---:|---:|---:|
| non-set-piece assisted share | `0.7578202173` | `0.7511574074 +/- 0.02` | held |
| all-goal assisted share | `0.7187695191` | `0.6709744120 +/- 0.02` | high |
| dead-ball goal share | `0.0515302936` | `0.1067459292` | gap `0.0552156356` |
| reconciliation failures | `0` | `0` | held |

The seven First-Division seasons contain `6,404` goals:

| Goal kind | Count |
|---|---:|
| credited assist | `4,603` |
| distinct uncredited creator | `1,301` |
| self-created | `170` |
| penalty | `330` |

All four mutually exclusive kinds are reached. Removing the `330` penalty
goals leaves `6,074` ordinary goals; `4,603 / 6,074 = 0.7578`. That is the
population 06B23F was authorized to repair, and it holds without a fitted game
output coefficient.

## Attribution

The all-goal share remains high because only `5.15%` of game goals are
dead-ball goals, against `10.67%` in the frozen StatsBomb population. The gap
`0.0552` exceeds the preregistered `0.02` material floor. The truth table
therefore assigns `dead_ball_supply` while returning GO for assist semantics.

This finding does not yet say whether the game awards too few penalties,
converts them incorrectly or lacks enough direct-free-kick goals. The next
external baseline separates those three facts before any match-discipline
coefficient or event contract changes.

## Verification

Before the run, the full solitary gate passed `307` files / `2,408` tests,
`882` modules with no dependency violations, all custom checks and typecheck.
The profile refuses world, season and worker overrides and carries the complete
canonical section set.
