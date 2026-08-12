# Phase 81A Checkpoint L6.12B - Succession Downstream Funnel

## Verdict

`OWNER_IDENTIFIED: below_half_ability_growth`.

## Population

Seven cached L6.11 candidate worlds, ten seasons each. The cohort contains one
row per earliest fulfilled `(world, buyer, acquired player)` episode in seasons
`1..8`, restricted to career-generated players aged `21..29` at acquisition.
The season-`N` row supplies pre-transfer age and ability; buyer use and closing
ownership are read from seasons `N + 1` and `N + 2`.

## Result

- 2,582 fulfilled episodes and 2,488 distinct buyer/player keys;
- 88 eligible career-generated prime-age acquisitions;
- zero reconciliation or population-signature failures;
- 61/88 (`69.32%`) retained below +0.5 ability growth;
- the other real stages: leader `1`, no appearance `11`, below 450 minutes `3`,
  not retained `9`, developed not leader `3`;
- artifact SHA-256:
  `ff908259eab1ff6578b3d9a186540b24bb39e4e775181c59f7aba54815042fd1`.

All six terminal stages are reachable on real data. The result does not yet
attribute product ownership between stored potential, buyer load and the
development engine; L6.13 performs that cached split before any correction.
