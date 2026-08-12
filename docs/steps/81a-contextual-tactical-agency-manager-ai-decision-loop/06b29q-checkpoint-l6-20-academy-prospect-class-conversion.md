# Step 06B29Q - Checkpoint L6.20 Academy Prospect-Class Conversion

## Status

Planned.

## User-Facing Reason

Two plausible fixes have failed because the game records academy origin but
not which prospect class authored a young player's ceiling. The next report
must show whether routine, interesting, serious or rare players actually cause
the missing generation of future scorers and creators; otherwise another
balance change would still target a guess.

## What To Implement

At the canonical annual content-generation boundary, record for every generated
youth candidate:

- player ID and target club ID;
- authored contextual prospect class (`routine`, `interesting`, `serious`,
  `rare`);
- generated season number and division at generation.

After engine acceptance, the CLI observation keeps only accepted player IDs.
The fact is analysis-only and lives in the simulation report projection: it is
not persisted into `Player`, saves, engine state or a second generator. At
season ten, join it to the existing owner-attribution and leader-conversion
facts.

## Frozen Population And Decision

- current product after complete L6.19 candidate removal;
- seven fresh worlds, ten seasons, exactly seven workers;
- accepted annual-academy players generated in seasons one through six;
- season-ten leader floors local to world, competition and represented role;
- every count split by generation division and prospect class.

For each class report: generated, still active, role represented, leader,
below leader quality, stored ceiling below leader floor, sufficient ceiling not
realized, and the associated shares. Reconcile generation rows to accepted IDs
and season-ten rows to the canonical joins.

`OWNER_IDENTIFIED` requires one class to contribute at least `0.50` of the
First-Division stored-ceiling-below-leader cohort:

- `routine` -> `routine_to_interesting_transition`;
- `interesting` -> `interesting_ceiling_distribution`;
- `serious` or `rare` together -> `high_ceiling_distribution`.

If no class owns a majority, return `MIXED`. If sufficient-ceiling-not-realized
is instead the majority across all classes, identify
`post_ceiling_conversion`. Missing class reachability, fewer than seven worlds,
fewer than 21 competition observations, duplicate/missing accepted provenance,
or any join mismatch is `STOP / RETHINK`. No gameplay correction occurs here.

## Expected Files

- `packages/content/src/generators/career-intake-players.ts` and tests: expose
  source prospect class in existing diagnostics, not on engine candidates;
- `apps/cli/src/commands/simulation-report/career-world-facts.ts`;
- `apps/cli/src/commands/simulation-report/career-sections.ts`;
- `apps/cli/src/commands/simulation-report/succession-priority-attribution.ts`
  and test;
- `apps/cli/src/commands/simulation-report/report-registry.ts` and planner test;
- `packages/i18n/src/labels.ts`;
- this document, generated audit/index, Phase README and status.

No product balance, domain, engine, persistence, web, HTML, beta version or new
report entrypoint.

## Required Checks

```bash
pnpm typecheck
pnpm exec vitest run \
  packages/content/src/generators/career-intake-players.test.ts \
  apps/cli/src/commands/simulation-report/succession-priority-attribution.test.ts \
  apps/cli/src/commands/simulation-report/report-planner.test.ts \
  --maxWorkers=7
pnpm cli simulation-report \
  --profile=phase81a-academy-prospect-class-l6-20-7x10 \
  --workers=7 \
  --format=json \
  --report-output=simulation-out/phase81a-academy-prospect-class-l6-20-7x10.json
git diff --check
```
