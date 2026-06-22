# Match Event Concentration Audit

Date: 2026-06-22
Phase: `34-match-event-concentration-rework`
Step: `01-failing-world-creator-concentration-audit.md`

## Scope

This audit reproduces the remaining Phase 33 gate failure before changing match-event attribution behavior.

The audited seed is:

- `phase33-generation-world-00173`
- seasons: `30`

## Reproduction

Command:

```bash
pnpm cli ten-season-report --seed=phase33-generation-world-00173 --seasons=30
```

Result:

- long-run anomaly status: `FAIL`
- failing check: `top_creator_goal_share_max`
- failing value: `0.41`
- target: `pass <=0.30; warn <=0.40; fail >0.40`

The youth and squad structure are stable in the same run:

- youth roster min/avg/max: `11/11.00/11`
- clubs above youth target: `0`
- clubs below youth minimum: `0`
- clubs without natural goalkeeper: `0`

## Failing Concentration Point

The failure is isolated to season `2`:

- season seed: `phase33-generation-world-00173-season-002`
- champion: `F.C. Ascoli`
- creator-concentration club: `A.C. Brescia`
- top creator: `Matteo Morandi`
- top creator assists: `15`
- club goals: `37`
- top creator goal share: `15 / 37 = 0.405`, rendered as `0.41`
- top-three creator goal share: `0.47`
- top scorer in the same club: `Enrico Acerbi`, `12` goals
- global top scorer that season: `Matteo Martini`, `15` goals
- global top assist that season: `Matteo Morandi`, `15` assists

## Interpretation

The issue is not a full attack collapse into three creators:

- `top_three_creator_goal_share_max` stays at `0.47`, well below the `0.60` pass threshold.
- `top_assist_max` is `15` in the failing season and `16` across the whole run, which is warning-level but not a hard failure for a `30` season run.
- The failing club scores only `37` goals, so a high-assist creator can cross the single-player share threshold even without an extreme league-leading assist total.

The most likely cause is a single-player creator attribution concentration in a low-volume club season. The current report cannot yet explain whether that concentration comes from chance type, role/slot weighting, repeated assist attribution, or lineup composition.

## Step 01 Change

The `ten-season-report` production rows now include compact creator-context fields:

- top creator name;
- creator club;
- creator club goals;
- top scorer in the same club;
- top creator goal share;
- top-three creator goal share.

This is diagnostic output only. No creator selection, assist attribution, scoring probability, player generation, youth academy behavior, or long-run threshold was changed.

## Recommended Next Step

Step 02 should add a more explicit failing-world concentration snapshot that separates:

- top creator concentration;
- assist count concentration;
- scorer concentration;
- team-goal volume;
- creator role/slot if current data exposes it safely.

Step 03 should only change attribution if Step 02 proves the issue is caused by creator selection or assist attribution. The likely narrow fix is to diversify creator pools by chance type and avoid over-weighting a single creator role, not to add hard season caps or loosen thresholds.

## Step 02 Diagnostic Extension

The multi-world gate output now includes a compact `creator_snapshot` field for each worst world:

```text
creator_snapshot=season:<n>,club:<club>,creator:<player>,assists:<n>,team_goals:<n>,top1:<share>,top3:<share>,top_assist:<player>,top_scorer:<player>:<goals>
```

This separates:

- the player with the highest creator share;
- that player's club and team-goal volume;
- the global top-assist player in the same season;
- the global top-scorer player in the same season;
- top-one and top-three creator-share values.

The current season summary data does not expose creator role or lineup slot safely. That should be addressed only if Step 03 needs role-level evidence before changing attribution. The available evidence already shows the failing seed is a single-creator concentration in a low-volume club season rather than a league-wide scorer, squad, youth, or balance collapse.

## Step 03 Rework

The attribution fix was limited to creator selection weights by chance type:

- `open_play` still favors midfielders, but less heavily than before;
- `counter` favors attackers;
- `cross` gives defenders and attackers more creator share;
- `dead_ball` keeps a mixed outfield creator pool;
- goalkeepers remain excluded.

No match scoring probability, player generation, youth academy behavior, development logic, or long-run threshold changed.

Before the rework, `phase33-generation-world-00173` failed:

- `top_creator_goal_share_max`: `0.41`;
- failing season: `2`;
- creator: `Matteo Morandi`;
- creator club: `A.C. Brescia`;
- creator assists / club goals: `15 / 37`.

After the rework, the same seed passes the creator concentration check:

- `top_creator_goal_share_max`: `0.26`;
- top assist max: `13`;
- top-three creator goal share max: `0.49`;
- anomaly status: `WARN`, only from `table_points_spread_avg`;
- youth roster min/avg/max remains `11/11.00/11`.

Strict balance also remains passing:

- command: `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`;
- goals per match: `3.001`;
- status: `PASS`.
