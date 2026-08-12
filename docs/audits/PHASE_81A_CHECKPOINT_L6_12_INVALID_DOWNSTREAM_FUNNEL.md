# Phase 81A Checkpoint L6.12 - Invalid Downstream Funnel

## Verdict

`STOP / RETHINK`. No gameplay owner was established.

## Evidence

- population: seven cached L6.11 candidate worlds, ten seasons;
- artifact SHA-256:
  `411ab110719318a359d0f9ab84e6b24ad7642d90cee69cdffde03acba316f87a`;
- fulfilled episodes: `3,729` total, `2,582` in seasons `1..8`;
- distinct `(world, buyer, player)` keys: `2,488`;
- keys excluded by the invalid same-season buyer assertion: `2,457`;
- reported eligible rows: `1`.

The episode is built during advancement from season `N` to `N + 1`. The
season-`N` player row is consequently the pre-transfer closing snapshot, while
the buyer can field the player from `N + 1`. Requiring the row's club to equal
the buyer collapsed the population and made the apparent
`below_half_ability_growth` owner meaningless.

L6.12B supersedes the profile and corrects the observation boundary without
changing product code or reading any corrected terminal-stage output before
its contract is frozen.
