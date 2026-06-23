# 02 - Match Engine Sample Review

## Goal

Review a concrete sample of match explanations before exposing match outcomes in
the first UI.

The step should judge whether match results, chance profiles, scorers, assists,
keepers, saves, blocks, and variance markers feel credible from a manager's
point of view.

## Expected files

- `docs/audits/PRE_UI_MATCH_ENGINE_SAMPLE_REVIEW.md`
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Use the scope from Step 01.
- Run a focused sample of fixture explanation commands across multiple seeds.
- Include at least these match shapes when available:
  - normal favorite win;
  - close draw;
  - upset;
  - low-event match;
  - high-scoring match;
  - strong keeper match;
  - concentrated scorer/creator match.
- Create `docs/audits/PRE_UI_MATCH_ENGINE_SAMPLE_REVIEW.md`.
- For each reviewed fixture, record:
  - seed and fixture ID;
  - score;
  - team strength comparison;
  - chance summary;
  - production concentration;
  - variance markers;
  - why it feels credible, suspicious, or fun.
- Classify findings using the Step 01 categories.
- Do not tune match logic unless a specific blocker is proven and the current
  step's expected files allow the scoped source change. By default this is an
  audit-only step.

## What NOT to implement

- Do not change match algorithms by default.
- Do not change scoring probabilities.
- Do not change player attribution rules.
- Do not change explanation output wording unless the step proves the current
  wording blocks review.
- Do not remove variance just because it looks unusual.

## Required checks

- `test -f docs/audits/PRE_UI_MATCH_ENGINE_SAMPLE_REVIEW.md`
- `pnpm cli simulate-season --seed=world-a --fixture=fixture:000001 --fixture-explanation`
- `pnpm cli simulate-season --seed=world-b --fixture=fixture:000001 --fixture-explanation`
- `git diff --check`

## Definition of Done

- The report records reviewed fixtures and user-facing interpretation.
- Any suspicious result is classified by actual gameplay impact.
- `docs/PROJECT_STATUS.md` records Step 02 as complete or blocked.
