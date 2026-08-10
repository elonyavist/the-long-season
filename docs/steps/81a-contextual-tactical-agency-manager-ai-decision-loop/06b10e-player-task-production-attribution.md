# Step 06B10E - Player-Task Production Attribution

## Status

Done on 2026-08-09. Owner is `actor_allocation`; occasion execution remains a
guardrail, not an authorized correction.

## Goal

Separate who receives shooting/creation opportunities from what happens after
the opportunity.

## Method

Production-code inspection corrected one premise before this step changed its
decision rule: `selectChanceActors(...)` does not read any player ability. It
weights only the four broad role families. A report-side formula for
"task-relevant ability" would therefore be a parallel player model rather than
an observation of the owner. The causal fact is structural and the existing
role- and minute-matched ability/nominations correlation is its population
check. `deriveOpportunityQuality(...)` and occasion resolution still own
execution after nomination.

Overall goal rate remains a guardrail. A credible total cannot hide flat actor
allocation, and a concentrated nomination pool cannot hide flat execution.

The frozen classification is:

- when scorer/assist mean age or either `33+` top-ten share is outside its
  historical band and mean within-role ability/nominations correlation is below
  `0.20`, owner is `actor_allocation`;
- when nominations correlate at least `0.20` but top-ten goal or assist volume
  is below its historical minimum, owner is `occasion_execution`;
- otherwise `not_attributed`.

This reads the already-declared age and volume red families separately. Age is
never an input to actor selection or execution.

## Exit

Exactly one of `actor_allocation` or `occasion_execution`, otherwise
`STOP / RETHINK`. Age may stratify the result but never enter either formula.

## Expected Files

- `apps/cli/src/commands/simulation-report/owner-attribution.ts` and tests;
- `packages/engine/src/match-engine/chance-actors.ts` and tests are read as the
  causal owner but not edited in this attribution step;
- this step, phase README and project status.

## Required Checks

Shot/creator/goal/assist reconciliation, real-data reachability, focused tests,
`pnpm check`, `git diff --check`, `graphify update .`.

## Recorded Outcome

The locked real population is internally reconciled: season opportunity shots
and shots on target equal match reports, creator nominations never exceed
shots, and player goals equal table goals. First-division top-ten volume is
inside the frozen bands (`17.83` goals, `8.38` assists), while leader age is red
(`30.52` scorer mean, `29.74` assist mean; `33+` shares `0.26` and `0.19`).

Within role and at least `450` minutes, ability/nominations correlation is only
`0.0205` for shooters and `0.0261` for creators, far below `0.20`. Inspection of
the production owner explains why: `selectChanceActors(...)` weights
`attacker/midfielder/defender/gk` and chance type, but reads no player ability.
This is a causal code-path fact corroborated by the population, not a new
report-side player model.

Owner: `actor_allocation`. The future correction may let relevant quality
influence nominations, but cannot use age and cannot disturb aggregate goal
rate or RNG outside the actor stream.

Next: 06B10F locates the immediate generational funnel owner rather than
assuming that more intake is the answer.
