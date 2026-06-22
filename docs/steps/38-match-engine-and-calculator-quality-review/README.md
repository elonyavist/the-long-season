# Phase 38 - Match Engine And Calculator Quality Review

## Goal

Review the match engine and calculator as a football system, not only as a set
of passing metrics.

The current long-run gates pass and the game world is structurally stable. This
phase should answer a narrower question before more feature work starts: when a
match, season, or long-run report produces a result, can we explain it with
football reasons that would feel fair and fun to the user?

## Product intent

The user should feel that:

- stronger teams are stronger for readable reasons;
- better players matter in their relevant roles;
- tactical choices affect match shape without overpowering player quality;
- fatigue, lineup changes, and role suitability matter enough to be felt;
- standout players and surprise seasons can happen, but are explainable;
- batch reports identify real game-quality risks, not just mathematical noise.

This phase is primarily an audit and diagnostics phase. Behavior changes are
allowed only if a step explicitly proves a narrow bug or misleading calculation
inside its scope.

## Context

Phase 37 concluded:

- the 250x30 long-run gate passes;
- remaining warning signals are story or monitoring signals, not blockers;
- no structural squad/youth/player-population collapse is currently observed;
- diagnostics are now easier to read.

That means the next useful work is not to make reports greener. It is to inspect
whether the engine calculator produces believable causal explanations.

## Step order

1. `01-calculator-surface-map.md`
2. `02-team-strength-sensitivity-audit.md`
3. `03-chance-generation-and-conversion-audit.md`
4. `04-causal-actor-selection-audit.md`
5. `05-tactic-lineup-and-condition-effect-audit.md`
6. `06-performance-and-determinism-benchmark.md`
7. `07-phase-report-and-next-decision.md`

## Phase constraints

- Do not tune match rates just to change averages.
- Do not change long-run thresholds just to reduce warnings.
- Do not hide surprising outcomes that are still football-plausible.
- Do not start UI, market, staff, scouting, injuries, or training work.
- Do not make automatic tactical decisions for the user.
- Do not add dead diagnostics that are not used by a report, test, or documented
  audit output.
- Keep engine code language-agnostic and storage-free.
- Keep user-facing CLI/report text localized.
- Preserve deterministic output by seed.
- Prefer focused reports and tests over broad rewrites.

## Phase-level checks

At the end of the phase, run:

- focused tests for touched engine/simulation-tools/CLI/i18n files;
- `pnpm check`;
- `pnpm cli ten-season-report --seed-prefix=phase35-table-spread --worlds=50 --seasons=10`;
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`;
- `git diff --check`.

## Definition of Done

- The current calculator surface is mapped.
- Team-strength sensitivity is reviewed with deterministic evidence.
- Chance generation and conversion are reviewed with deterministic evidence.
- Causal actor selection is reviewed with deterministic evidence.
- Tactic, lineup, and condition effects are reviewed with deterministic
  evidence.
- Performance and determinism are benchmarked enough to decide whether
  optimization is currently needed.
- Any proposed fix is justified by user-facing football credibility, not by
  math alone.
- `docs/audits/MATCH_ENGINE_CALCULATOR_QUALITY_REVIEW.md` records findings,
  evidence, and next recommendations.
- `docs/PROJECT_STATUS.md` identifies exactly one next active step or explicitly
  leaves the next phase unselected.
