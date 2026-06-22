# Step 03 - Chance Generation And Conversion Audit

## Goal

Review whether team strength becomes chances, shots, saves, misses, and goals in
a football-plausible way.

This step focuses on match flow. It should answer whether the engine creates
enough separation between stronger and weaker sides without removing upsets.

## Context

Long-run averages currently pass, but averages do not prove that individual
matches feel fair. A good lower-division game can have tight matches, odd
results, and occasional blowouts, but those outcomes should still be explainable
from strength, tactics, and chance quality.

## Expected files

- `docs/audits/MATCH_ENGINE_CALCULATOR_QUALITY_REVIEW.md`
- engine or simulation-tools tests/diagnostics only if needed
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Review the current chance-generation and conversion code paths.
- Use deterministic evidence for controlled matchups:
  - equal teams;
  - clearly stronger home team;
  - clearly stronger away team;
  - strong attack vs weak defense;
  - weak attack vs strong defense.
- Inspect whether output differences appear in:
  - opportunities;
  - shots;
  - shots on target;
  - saves;
  - goals;
  - final result distribution.
- Check whether home advantage is visible but not overpowering.
- Check whether conversion and save outcomes remain plausible for low and high
  quality chances.
- Record whether the current aggregate model lacks diagnostics needed for future
  richer match-day presentation.
- Update `docs/PROJECT_STATUS.md`.

## What NOT to implement

- Do not tune scoring rates just because one sample looks odd.
- Do not remove upsets.
- Do not add a possession engine.
- Do not add weather, injuries, cards, or substitutions.
- Do not start Step 04.

## Required checks

- focused tests for touched files
- `pnpm --filter @game/engine run typecheck`
- `pnpm check`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`
- `git diff --check`

## Definition of Done

- The audit explains whether chance generation and conversion are directionally
  credible.
- Any recommended change is tied to user-facing match credibility.
- Strict balance still passes if code was touched.
- `docs/PROJECT_STATUS.md` points to Step 04 as the next active step.
