# Step 06B29L - Checkpoint L6.15B Mature Leader Conversion

## Status

Done - `OWNER_IDENTIFIED: leader_quality_supply` on 2026-08-12.

## Why L6.15 Cannot Authorize Gameplay

L6.15 correctly classified the broad season-ten generated population, but that
population includes players generated during seasons seven through ten. A new
teenager or emergency senior has not had the same opportunity to become a
leader as a player who entered early in the career. Treating every recent
arrival as failed leader quality biases the owner toward supply.

This does not erase L6.15. It narrows what the report can claim and repeats the
same frozen classifier on a mature cohort before any product correction.

## Frozen Population Correction

- same read-only L6.4 cache, seven worlds, ten seasons, three divisions and
  seven-worker metadata;
- same canonical leader readers, role-local quality floors, 900-minute boundary
  and four stages as L6.15;
- career-generated players enter only when `generatedSeasonNumber <= 6`;
- season six is not a fitted cutoff: the generational observer already uses it
  as the canonical mature annual-intake boundary at season ten;
- both annual academy and annual senior intake use the same cutoff so origin
  does not choose its own maturation opportunity;
- recent generated players are counted as excluded, not classified as failed.

## Frozen Decision

L6.15B retains every structural rule from L6.15, except the cohort floor becomes
`>= 50` represented-role mature players. All four stages must remain reachable
on real cached data. A failure stage owns the transition only at share `>= 0.50`
of mature non-leaders; otherwise the result is `MIXED`.

Only the L6.15B owner may open the next attribution step. The broad L6.15 owner
is diagnostic and cannot authorize a gameplay correction.

## Expected Files

- `apps/cli/src/commands/simulation-report/succession-priority-attribution.ts`
  and test;
- `apps/cli/src/commands/simulation-report/career-sections.ts`;
- `apps/cli/src/commands/simulation-report/report-registry.ts` and planner test;
- `packages/i18n/src/labels.ts`;
- L6.15 audit/step correction, this document, its generated audit, indexes,
  Phase README and `docs/PROJECT_STATUS.md`.

No gameplay, engine, content, persistence, web, HTML or save file.

## Required Checks

```bash
pnpm typecheck
pnpm exec vitest run \
  apps/cli/src/commands/simulation-report/succession-priority-attribution.test.ts \
  apps/cli/src/commands/simulation-report/report-planner.test.ts \
  --maxWorkers=7
pnpm cli simulation-report \
  --profile=phase81a-mature-leader-conversion-l6-15b-cached \
  --workers=7 \
  --format=json \
  --report-output=simulation-out/phase81a-mature-leader-conversion-l6-15b-cached.json
git diff --check
```

## Outcome

The report exited zero and wrote SHA-256
`2d6e758edf0d8efd5e73428374e6f3e1fd0655936e2ecd8a38ec4c303581cefa`.
It excludes thirty recent generated senior rows and retains a mature
represented-role cohort of `1,522`:

- season-ten leader: `77`;
- below role-local leader quality: `1,116`;
- quality-ready below 900 minutes: `73`;
- quality and minutes ready but not leader: `256`.

All four stages are reachable and all structural facts reconcile. The mature
non-leader quality share is `0.772318`, confirming
`leader_quality_supply`. The next checkpoint may split those exact `1,116`
rows by stored ceiling feasibility; no other owner opens.
