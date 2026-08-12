# Step 06B29Z1 — Checkpoint L6.29A Generation-Time Stationary Ceiling

## Status

Planned and active. Fresh observation only; no gameplay correction.

## User-Facing Reason

L6.29 proved that senior season facts cannot represent the full academy cohort.
This retry observes every accepted prospect at the moment the canonical intake
provider hands it to the career, before later selection, growth, transfer or
exit can remove it from the denominator.

## Frozen Population And Facts

- seven worlds, ten seasons, the unchanged L6.20 seed prefix and exactly seven
  workers, written to a new cache;
- reference: season-one `opening_senior` players aged `23..27`;
- candidates: every accepted `annual_academy_intake` generated no later than
  season six;
- generation-boundary facts: player ID, authored prospect class, generation
  season, target competition/division, canonical role, current ability and
  stored ceiling;
- comparison within target competition and canonical role;
- a cell needs at least three reference players.

The observer uses `summarizePlayerDevelopmentAbilities(...)` on the retained
player in the post-intake career state. It stores the one derived ceiling needed
by the report and does not rebuild player quality later. Candidate IDs reconcile
exactly with accepted-intake facts before any result is evaluated.

## Frozen Reader And Decision

Each candidate is `stationary_capable` when its generation-time stored ceiling
reaches the matching opening-senior current-ability median, otherwise
`below_stationary_ceiling`; sparse cells remain explicit. Counts are split by
world, target division, role, prospect class and generation season.

- duplicate/missing candidate, missing role/competition, invalid ability, any
  accepted-count mismatch, fewer than seven worlds, fewer than 21 competition
  observations or sparse share above `0.10` is `STOP / RETHINK`;
- capable share at least `0.50` in aggregate and in `5/7` worlds while L6.27
  remains non-stationary identifies `post_generation_lifecycle`;
- otherwise a class owns the deficit only with at least `0.50` aggregate share
  of below-ceiling candidates and largest-deficit coherence in `5/7` worlds;
- no majority is `MIXED`; no below-ceiling population is `NOT_REPRODUCED`.

Report the exact number of additional stationary-capable candidates needed to
reach `0.50`. This is a measurement, never an instruction to promote that many
players. L6.21/L6.22/L6.28 still forbid generic probability, global uplift and
exit-linked inheritance.

## Expected Files

- `apps/cli/src/commands/simulation-report/career-sections.ts`;
- `apps/cli/src/commands/simulation-report/succession-priority-attribution.ts`
  and test;
- `apps/cli/src/commands/simulation-report/report-registry.ts` and planner test;
- `packages/i18n/src/labels.ts`;
- this document, audit/index, phase README and status.

No engine, content, domain, persistence, web, HTML, save, coefficient or new
report entrypoint change.

## Required Checks

Focused tests, typecheck, fresh 7x10 run and byte-identical cache rebuild with
exactly seven workers, `git diff --check`, graphify update and `pnpm check`
alone.
