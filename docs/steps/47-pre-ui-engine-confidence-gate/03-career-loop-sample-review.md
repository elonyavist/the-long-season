# 03 - Career Loop Sample Review

## Goal

Review whether the current career loop creates believable multi-season manager
stories before starting UI readiness.

This step should look at continuity: fixtures, table movement, squad refresh,
condition, youth pipeline, player growth, aging, and turnover.

## Expected files

- `docs/audits/PRE_UI_CAREER_LOOP_SAMPLE_REVIEW.md`
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Use the scope from Step 01.
- Run career and ten-season inspection commands on deterministic samples.
- Create `docs/audits/PRE_UI_CAREER_LOOP_SAMPLE_REVIEW.md`.
- Review at least:
  - career creation and selected-club summary;
  - next fixture readiness;
  - squad size and condition state;
  - youth population and age pressure;
  - player development over multiple seasons;
  - veteran decline;
  - turnover signals from ten-season report;
  - table credibility over time.
- Record whether the current loop would give the user meaningful decisions in a
  first dashboard.
- Classify issues as blocker, post-UI improvement, healthy variance, monitoring
  signal, false warning, or unclear.
- Do not implement UI or new career features in this step.

## What NOT to implement

- Do not add new career mechanics.
- Do not tune development, youth, market, or condition behavior by default.
- Do not change career save schema.
- Do not create dashboard contracts.
- Do not suppress warnings.

## Required checks

- `test -f docs/audits/PRE_UI_CAREER_LOOP_SAMPLE_REVIEW.md`
- `pnpm cli career --save=phase47-engine-check --seed=world-a --new-world-preview`
- `pnpm cli career --save=phase47-engine-check --summary`
- `pnpm cli career --save=phase47-engine-check --development-report`
- `pnpm cli ten-season-report --seed-prefix=phase47-career --worlds=10 --seasons=10`
- `git diff --check`

## Definition of Done

- The report explains whether the career loop is credible enough for a first UI
  dashboard.
- Any blocker is tied to a visible user problem, not only a metric.
- `docs/PROJECT_STATUS.md` records Step 03 as complete or blocked.
