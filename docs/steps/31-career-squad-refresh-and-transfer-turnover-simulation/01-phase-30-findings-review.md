# Step 01 - Phase 30 Findings Review

## Goal

Turn Phase 30 findings into concrete Phase 31 success criteria before changing code.

## Context

Phase 30 and the 50-world batch showed that match balance is mostly credible, while career structure fails because players age without enough exits, intake, or turnover.

## Expected files

- `docs/audits/CAREER_SQUAD_REFRESH_SPEC.md`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Read `docs/audits/TEN_SEASON_PLAYABILITY_REPORT.md`.
- Record the 50-world batch observation: `50/50` worlds failed because age 30+ share stayed around `0.715..0.793`.
- Define target long-run squad health metrics.
- Define non-goals: no UI, no advanced market, no automatic user lineup/tactic decisions.
- Define the final validation ladder: `50` worlds x `10` seasons, `250` worlds x `30` seasons, and `10,000` worlds x `50` seasons.
- Define which metrics must become available by the end of Phase 31.

## What NOT to implement

- Do not write code.
- Do not tune match balance.
- Do not create transfer simulation rules yet.

## Required checks

- `test -f docs/audits/TEN_SEASON_PLAYABILITY_REPORT.md`
- `git diff --check`

## Definition of Done

- The Phase 31 spec exists.
- The phase success criteria are measurable.
- The next implementation step can start without re-litigating Phase 30.
