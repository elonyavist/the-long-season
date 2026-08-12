# Step 06B29Z — Checkpoint L6.29 Stationary Ceiling Target Distribution

## Status

Planned and active. Cached attribution only; no gameplay correction.

## User-Facing Reason

L6.27 proves that annual replacements lack senior-quality ceiling. L6.28 proves
that copying the ceilings of actual leavers is not the solution. Before changing
generation again, this checkpoint measures how much of each annual cohort can
ever reproduce the opening senior population at the same division and role.

## Frozen Population

- immutable L6.20 current-product cache, seven worlds and ten seasons;
- reference: season-one `opening_senior` players aged `23..27`;
- candidates: every `annual_academy_intake` generated no later than season six,
  observed first after generation and joined to its authored prospect class;
- comparison within generation division and canonical role;
- a cell requires at least three reference players, otherwise it is
  `reference_not_observed` and cannot pass;
- stored ceiling is canonical `currentAbility + potentialRoom`.

Goals, assists, appearances, leader membership, transfers and season-ten
outcomes are not read. This is a population-distribution check, not another
leader-conditioned comparator.

## Frozen Reader

For each candidate, compare its first-observed stored ceiling with the median
current ability of the matching opening-senior cell. Record `stationary_capable`
or `below_stationary_ceiling`, split by world, division, role, prospect class
and generation season. Also report the exact candidate deficit needed for the
cohort to reach `0.50` capable share.

The `0.50` reference is structural: a stationary replacement distribution has
half its mass at or above the opening population's median. It is not fitted to
leader output and does not guarantee that half the candidates become stars.

## Frozen Decision

- duplicate candidate, missing class/origin, invalid ability, sparse share above
  `0.10`, fewer than seven worlds or any count mismatch is `STOP / RETHINK`;
- capable share at least `0.50` in aggregate and in at least `5/7` worlds while
  L6.27 remains non-stationary identifies a post-generation lifecycle owner;
- otherwise, a prospect class owns the deficit only if it supplies at least
  half of all below-ceiling candidates in aggregate and is the largest deficit
  class in at least `5/7` worlds;
- no class majority is `MIXED`; no candidate population is `NOT_REPRODUCED`.

This step authorizes no coefficient. Its output must first say whether a future
stationary allocator needs a class-local correction or a cohort-wide target
distribution. Generic class-frequency, global uplift and exit-linked inheritance
remain closed by L6.21, L6.22 and L6.28.

## Expected Files

- `apps/cli/src/commands/simulation-report/succession-priority-attribution.ts`
  and test;
- `apps/cli/src/commands/simulation-report/career-sections.ts`;
- `apps/cli/src/commands/simulation-report/report-registry.ts` and planner test;
- `packages/i18n/src/labels.ts`;
- this document, audit/index, phase README and status.

No engine, content, domain, persistence, web, HTML, save, coefficient or new
report entrypoint change.

## Required Checks

Focused tests, typecheck, two byte-identical cache-only evaluations with exactly
seven workers, `git diff --check`, graphify update and `pnpm check` alone.
