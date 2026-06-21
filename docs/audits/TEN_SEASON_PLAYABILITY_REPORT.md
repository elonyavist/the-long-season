# Ten-Season Playability Report

Date: 2026-06-22
Phase: `30-ten-season-simulation-report`
Scope: deterministic closed single-division long-run lab report

## Decision

The project is not ready for UI exploration yet.

The match balance is credible enough to keep, but the career world is not yet credible over ten seasons because player aging has no matching squad refresh, youth intake, retirement, or market turnover path. This creates a predictable long-run failure: after ten seasons, about three quarters of the league is age 30 or older.

Recommended next phase: **Phase 31 - Career Squad Refresh And Transfer Turnover Simulation**.

## Commands Run

- `pnpm cli ten-season-report --seed=world-a --seasons=10`
- `pnpm cli ten-season-report --seed=world-b --seasons=10`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`

## Seed `world-a`

Overall anomaly status: **FAIL**

Key observations:

- Goals per match average: `2.95`, PASS.
- Table points spread average: `51.6`, PASS.
- Unique champions: `5` across ten seasons, credible for the current closed league.
- Longest champion streak: `2`, PASS.
- Selected club average position: `3.40`.
- Top assist maximum: `17`, WARN.
- Top creator goal share maximum: `0.28`, PASS.
- Top three creator goal share maximum: `0.55`, PASS.
- Useful players after long run at the current threshold: `0`, PASS for lower-division realism.
- Age 30+ share after ten seasons: `0.74`, FAIL.
- Transfer turnover: unavailable, WARN.
- Squad turnover: unavailable, WARN.

Interpretation:

The football outputs are mostly credible: scoring, table spread, champion variety, and creator concentration are acceptable. The top-assist peak is high but still below the hard failure threshold. The blocking issue is structural career aging without replacement.

## Seed `world-b`

Overall anomaly status: **FAIL**

Key observations:

- Goals per match average: `2.98`, PASS.
- Table points spread average: `42.6`, PASS.
- Unique champions: `5` across ten seasons, credible for the current closed league.
- Longest champion streak: `1`, PASS.
- Selected club average position: `4.20`.
- Top assist maximum: `17`, WARN.
- Top creator goal share maximum: `0.27`, PASS.
- Top three creator goal share maximum: `0.53`, PASS.
- Useful players after long run at the current threshold: `0`, PASS for lower-division realism.
- Age 30+ share after ten seasons: `0.75`, FAIL.
- Transfer turnover: unavailable, WARN.
- Squad turnover: unavailable, WARN.

Interpretation:

This seed confirms the same pattern as `world-a`: match outcomes are plausible, but long-run squad lifecycle is not.

## Balance Gate

The strict 20-season calibration report passed:

- Goals per match: `2.859`, PASS.
- Home win rate: `0.413`, PASS.
- Draw rate: `0.238`, PASS.
- Away win rate: `0.349`, PASS.
- First-place points: `70.500`, PASS.
- Last-place points: `25.500`, PASS.
- Table points spread: `45.000`, PASS.
- Upset proxy rate: `0.350`, PASS.

Conclusion: do not tune match scoring before solving long-run squad refresh.

## Anomalies

1. **Age distribution failure**

   After ten seasons, the league has roughly `74-75%` players aged 30 or older. This is not credible for a playable career loop. The current development and aging model works mechanically, but there is no intake/exit/turnover system to keep squads alive.

2. **Missing turnover metrics**

   Transfer turnover and squad turnover are explicitly unavailable. This is correct reporting behavior, but it is also the next product blocker.

3. **Top assist warning**

   Both seeds produced a top-assist maximum of `17`. This is high but not a hard failure because creator share remained under the warning threshold. Keep monitoring after squad refresh because a richer lineup/market world may change assist distribution.

## What Looks Good

- Goals per match are near the intended range.
- Table spreads are plausible.
- Champions rotate across multiple clubs.
- Top scorers are believable for a 34-match season.
- Creator concentration is not currently excessive.
- Lower-division player generation does not create too many long-run useful players at the current threshold.

## What Must Improve Before UI

- Add deterministic squad refresh over years.
- Add a minimal retirement/exit model.
- Add controlled incoming players: youth, generated free agents, or market pool.
- Add transfer turnover metrics that are real, not inferred.
- Keep the user-manager principle: the system can refresh the world, but it must not auto-pick the user's lineup or tactics.

## Next Phase

Recommended next single phase:

**Phase 31 - Career Squad Refresh And Transfer Turnover Simulation**

Goal:

Simulate enough deterministic career-world turnover over ten seasons to keep squads believable before any UI work starts.

Expected focus:

- retire or remove aging players deterministically;
- add new generated players to keep squad sizes stable;
- preserve lower-division realism and rarity budgets;
- track transfer/squad turnover counts;
- rerun Phase 30 reports until age distribution no longer fails.
