# Step 06B29P - First-Division Academy Ceiling Tail

## Status

Planned.

## User-Facing Reason

Top-flight academies currently produce too few future players capable of
becoming leading scorers or creators after the opening senior generation ages
out. L6.18 also proves that lower divisions do not share that shortage, so the
game must create a small top-flight high-ceiling tail without making every
young player stronger or flattening division identity.

## Frozen Candidate

Change only the First-Division `interesting` prospect ceiling distribution:

- keep the minimum at `4.0` stars;
- extend the maximum from `4.5` to `5.0` stars;
- select the new `5.0` maximum with exactly `1,500` basis points probability;
- distribute the remaining probability across `4.0` and `4.5` through the
  canonical weighted-maximum selector.

No other division/class band, prospect frequency, current-ability band, age,
role plan, growth, minutes, market rule, senior generation or rare-prodigy
budget changes. This is a tail, not a league-wide uplift: `85%` of interesting
top-flight prospects remain in the shipped `4.0..4.5` range.

## Frozen Population And Decision

Run paired same-seed current and candidate arms over seven worlds and ten
seasons, serially, with exactly seven workers. The current arm reads the fresh
L6.17 current-policy cache; the candidate arm is fresh. The evaluator derives
L6.15B, L6.16 and L6.18 through their canonical readers.

`GO` requires all of:

- First-Division over-two ceiling-shortfall share improves by at least `0.05`;
- First-Division at-or-above share improves by at least `0.03`;
- mature below-leader-quality share improves by at least `0.03` in at least
  `5/7` worlds;
- stored-ceiling-below-leader share improves by at least `0.05` in at least
  `5/7` worlds;
- season-ten career-generated leader share improves by at least `0.02`, reaches
  at least `0.28`, and improves in at least `5/7` worlds;
- Second- and Third-Division over-two and at-or-above shares each regress by no
  more than `0.02`;
- generated count, role coverage, current-quality bands, six-star stock,
  formation retention, champion points, transfer volume and every previously
  green integrated gate hold;
- zero reconciliation failures.

`REFINE` rejects and completely removes the candidate. `STOP / RETHINK` applies
to structural/reconciliation failure or a new integrated failure. Thresholds
do not move after output.

## Expected Files

- `packages/content/src/generators/player-potential-rarity.ts` and focused tests;
- `apps/cli/src/commands/simulation-report/succession-priority-attribution.ts`
  and test;
- `apps/cli/src/commands/simulation-report/career-sections.ts`;
- `apps/cli/src/commands/simulation-report/report-registry.ts` and planner test;
- `packages/i18n/src/labels.ts`;
- this document, generated audit/index, Phase README and
  `docs/PROJECT_STATUS.md`.

No domain, engine, persistence, web, HTML, save migration or second report
entrypoint.

## Required Checks

```bash
pnpm typecheck
pnpm exec vitest run \
  packages/content/src/generators/player-potential-rarity.test.ts \
  packages/content/src/generators/player-prospect-joint-profile.test.ts \
  apps/cli/src/commands/simulation-report/succession-priority-attribution.test.ts \
  apps/cli/src/commands/simulation-report/report-planner.test.ts \
  --maxWorkers=7
pnpm cli simulation-report \
  --profile=phase81a-first-division-ceiling-tail-l6-19-7x10 \
  --workers=7 \
  --format=json \
  --report-output=simulation-out/phase81a-first-division-ceiling-tail-l6-19-7x10.json
git diff --check
```

The simulation runs alone. Candidate-only analysis seams carry an explicit
closeout owner and are removed in this step after the audit is written.
