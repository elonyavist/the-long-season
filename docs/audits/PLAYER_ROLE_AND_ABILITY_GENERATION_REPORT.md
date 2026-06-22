# Player Role And Ability Generation Report

Date: 2026-06-22
Phase: `33-player-role-and-ability-generation-rework`
Status: Blocked by one non-generation long-run gate failure

## Summary

Phase 33 fixed the core player-generation issues that triggered the phase:

- generated players now have explicit role identity, archetype, natural/adapted/weak roles, and role familiarity;
- senior current ability is sampled by division, age lane, role bucket, rarity lane, and club tier;
- defenders, attackers, and goalkeepers now respect role hard caps during generation and development;
- youth academies now refill to exactly 11 active players per club;
- youth structure is exactly 1 goalkeeper, 4 defenders, 4 midfielders, and 2 attackers;
- selected-club youth decisions are no longer hidden auto-promotions in the long-run report path.

The final 250-world x 30-season gate still fails because of one `top_creator_goal_share_max` failure. That is classified as a match-event creator distribution issue, not as a player-generation or academy-structure collapse.

## Generation Report Samples

### `world-a`

- Senior players: 396
- Current ability distribution: 0-8 = 82, 9-11 = 203, 12-14 = 111, 15+ = 0
- Potential distribution: limited = 0, category = 252, interesting = 140, serious = 4, elite = 0
- Rarity usage: white-fly = 3/3, serious prospects = 4/4, rare prodigies = 0/0
- Clubs with prospects: 18/18
- Senior role-coherence warnings: none
- Youth players: 198
- Clubs at exactly 11 youth: 18/18
- Youth roster min/max: 11/11
- Youth departments: GK = 18, DEF = 72, MID = 72, ATT = 36
- Youth ages: 15 = 24, 16 = 50, 17 = 68, 18 = 46, 19 = 10, 20+ = 0
- Youth role-coherence warnings: none

### `world-b`

- Senior players: 396
- Current ability distribution: 0-8 = 75, 9-11 = 219, 12-14 = 102, 15+ = 0
- Potential distribution: limited = 0, category = 247, interesting = 145, serious = 4, elite = 0
- Rarity usage: white-fly = 1/1, serious prospects = 4/4, rare prodigies = 0/0
- Clubs with prospects: 18/18
- Senior role-coherence warnings: none
- Youth players: 198
- Clubs at exactly 11 youth: 18/18
- Youth roster min/max: 11/11
- Youth departments: GK = 18, DEF = 72, MID = 72, ATT = 36
- Youth ages: 15 = 24, 16 = 52, 17 = 53, 18 = 54, 19 = 15, 20+ = 0
- Youth role-coherence warnings: none

## Development Report Sample

Command:

```bash
pnpm cli career --save=phase33-world-a --development-report
```

Observed output:

- Players reviewed: 22
- Players improved: 13
- Players declined: 10
- Stalled prospects: 0
- Total growth: 87.90
- Total decline: 38.99
- Biggest improver: Enrico Ruggieri, age 17 -> 23, growth 18.53
- Biggest decline: Niklas Keller, age 30 -> 36, decline 10.01

This confirms development is still active after role caps, while veteran decline remains active.

## Long-Run Gates

### 50 worlds x 10 seasons

- Status: PASS
- Failed worlds: 0
- Warning worlds: 50
- Youth roster max observed: 11
- Clubs above youth target: 0
- Clubs below youth minimum: 0
- Failing check counts: none

### 250 worlds x 30 seasons

- Status: FAIL
- Failed worlds: 1
- Warning worlds: 249
- Failing check counts: `top_creator_goal_share_max=1`
- Failing seed: `phase33-generation-world-00173`
- Youth roster max observed: 11
- Clubs above youth target: 0
- Clubs below youth minimum: 0
- Clubs without natural goalkeeper: 0
- Minimum squad size observed: 19
- Clubs below minimum squad size: 0

The academy structure problem from Phase 32 is resolved: no youth underpopulation and no youth overpopulation remain in the 250x30 gate.

## Match Balance Regression

Strict calibration check:

```bash
pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict
```

Observed result: PASS

- Goals per match: 3.001
- Home win rate: 0.416
- Draw rate: 0.237
- Away win rate: 0.348
- First-place points: 66.750
- Last-place points: 28.100
- Table points spread: 38.650
- Upset proxy rate: 0.399

## Decision

Phase 33 should not move directly into broader career/UI work yet. The player role and academy generation work is credible, but the phase gate is blocked by one remaining event-distribution failure.

The next work should be a narrow match-event concentration rework focused on:

- `top_creator_goal_share_max`;
- `top_three_creator_goal_share_max`;
- top assist concentration;
- preserving match balance and deterministic output.

Do not widen thresholds to pass the gate. The next step should explain why one creator can dominate too much and fix the event attribution/distribution model directly.
