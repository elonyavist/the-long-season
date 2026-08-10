# Step 06B10D - Age-Load Attribution

## Status

Done on 2026-08-09. The exact fixture-dated contrast identifies
`renewal_quality`, not a selection bias.

## Goal

Explain excessive `33+` starts/minutes separately from leader output.

## Method

Within competition, season, role and current-quality band compare `33+` with
`24..29`. Stratify by availability, recent load and whether a credible reserve
exists. Read the exact choice made by `selectCareerAiTeam(...)`; do not infer a
selection from end-of-season minutes.

Before reading the new fixture-level output, a younger alternative is frozen as
`24..29`, the same primary role, current ability no more than `0.5` below the
veteran, absent from the chosen XI and present in the exact available candidate
pool. It is *fresher* only when its recent minutes are no higher and its fitness
is no lower than the selected veteran's. The owner bands are:

- fresher-alternative share at least `0.20` of veteran starts while the
  historical veteran-start guardrail is red: `selection_load`;
- share at most `0.10`, with generated/opening leadership also outside its
  frozen renewal bands: `renewal_quality`;
- the interval between them, or an unpopulated contrast: `not_attributed`.

The two separated bands keep sampling noise from turning one threshold into a
forced binary answer.

## Exit

- veteran wins despite an available quality-matched alternative:
  `selection_load`;
- no alternative reaches comparable mature quality: `renewal_quality`;
- neither contrast is populated: `STOP / RETHINK`.

Age remains an observation dimension. This step cannot add a direct age
penalty to selection, goals or assists.

## Expected Files

- `apps/cli/src/commands/simulation-report/owner-attribution.ts` and tests;
- `packages/engine/src/use-cases/simulate-season.ts` and tests: production-code
  inspection found that the exact fixture-dated available candidate pool is
  deliberately gone after selection. The locked analysis caller therefore
  retains only three compact counts: veteran starters, quality-matched younger
  alternatives, and alternatives that are also no more loaded or less fit;
- `packages/engine/src/index.ts` only as the existing season contract owner;
- `career-world-facts.ts`, `career-sections.ts`, `report-registry.ts` and planner
  tests: explicitly enable the fact only for the locked owner profile and bump
  its shard suffix. Ordinary simulations do not pay for or expose it;
- this step, phase README and project status.

## Required Checks

Real-data reachability for both classifications, focused tests, `pnpm check`,
`git diff --check`, `graphify update .`.

## Recorded Outcome

The locked `7 x 10` recorded `95,960` first-division veteran starts from the
exact selection inputs. Only `3.0607%` had an available `24..29` player in the
same primary role within `0.5` current ability, and only `1.5402%` had such an
alternative with no more recent minutes and no less fitness. That is well below
the preregistered `0.10` renewal boundary. In the same population generated
leaders remain `22.62%` and opening leaders `77.38%`.

The supporting season-level contrast agrees: quality-matched veterans average
only `+1.0876` starts, below the old `+2` selection signal. The real corpus did
populate the alternative path (`153/210` competition-seasons had at least one
fresh matched alternative; maximum season share `15.32%`), so zero is not being
mistaken for evidence. The engine test also exercises the positive branch on a
real selector run and proves the compact fact is absent from ordinary callers.

Owner: `renewal_quality`. No direct age penalty to selection, goals or assists
is authorized. Artifact:
`simulation-out/phase81a-l5-1-owner-attribution-7x10-age-load.json`.

Next: 06B10E attributes leader age and task production independently from this
load finding.
