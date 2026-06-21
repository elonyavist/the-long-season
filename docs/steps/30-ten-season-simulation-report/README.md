# Phase 30 - Ten-Season Simulation Report

## Goal

Simulate roughly ten seasons and produce reports that answer whether the game is credible enough to move toward UI work later.

This phase is the gate. It does not try to make the UI. It measures the engine.

## Product intent

- Decide whether the game world remains believable after many seasons.
- Detect overpowered players, stagnant squads, broken development, bad balance, or unrealistic league outcomes.
- Use CLI/lab tooling only where it helps inspect the engine.
- Produce a human-readable report that guides the next product decision.

## Step order

1. `01-ten-season-report-spec.md`
2. `02-multi-season-runner.md`
3. `03-player-evolution-metrics.md`
4. `04-club-and-market-stability-metrics.md`
5. `05-balance-and-anomaly-scoring.md`
6. `06-final-ten-season-playability-report.md`

## Phase constraints

- Do not implement UI.
- Do not add unrelated CLI feature polish.
- Do not hide anomalies.
- Do not tune numbers without first recording the observed issue.
- Do not implement major new systems during the report unless a blocker is documented and narrowed into a step.
- Keep output deterministic by seed.

## Phase-level checks

At the end of the phase, run:

- focused tests for touched engine/simulation-tools/CLI/i18n files;
- `pnpm check`;
- ten-season report for at least two seeds;
- strict balance report;
- `git diff --check`.

## Definition of Done

- A ten-season simulation report can be generated deterministically.
- The report includes season, player, club, market, and anomaly metrics.
- The final report states whether the game is ready for UI exploration, needs engine tuning, or needs another simulation-focused phase.

