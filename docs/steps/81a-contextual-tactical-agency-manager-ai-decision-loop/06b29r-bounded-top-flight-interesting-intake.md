# Step 06B29R - Bounded Top-Flight Interesting Intake

## Status

Planned.

## User-Facing Reason

Top-flight academies need enough credible future professionals to replace the
players who begin the career, while still producing ordinary youngsters and
rare standout stories. L6.20 proves routine intake—not too few serious or rare
prospects—owns the missing leader supply.

## Frozen Candidate

For annual youth intake only, add `0.12` to the existing interesting-prospect
probability when the receiving club is in First Division. The existing
environment-specific value remains the base, so academy quality still matters.
The additional probability is taken entirely from `normal_youth`:

- total generated and accepted youth volume is unchanged;
- serious and rare probabilities are unchanged;
- First-Division routine share remains reachable (approximately `46..61%`
  before exceptional allocation, depending on academy environment);
- Second and Third Division, opening academies, annual senior candidates,
  current ability and every ceiling band remain byte-identical.

## Frozen Population And Decision

Paired current/candidate, same seven fresh seeds, ten seasons, exactly seven
workers. Current is the L6.20 cache; candidate is fresh. `GO` requires:

- First-Division routine share of stored-ceiling failures improves by `>=0.10`;
- mature below-leader-quality share improves by `>=0.04` in `>=5/7` worlds;
- stored-ceiling-below-leader share improves by `>=0.06` in `>=5/7` worlds;
- career-generated leader share improves by `>=0.03`, reaches `>=0.28`, and
  improves in `>=5/7` worlds;
- First-Division interesting leaders increase by at least `8` across the cohort;
- routine, interesting, serious and rare remain reachable;
- Second/Third class distributions change by exactly zero;
- generated/accepted counts, roles, six-star stock, current-quality bands,
  formations, champion points, transfers and all previously green integrated
  gates hold; zero reconciliation failures.

`REFINE` removes the candidate. A new integrated failure or structural mismatch
is `STOP / RETHINK`. No threshold moves after output.

## Expected Files

- `packages/content/src/generators/youth-development-level.ts` and test;
- `packages/content/src/generators/initial-youth-academies.ts` and test;
- `apps/cli/src/commands/simulation-report/succession-priority-attribution.ts`
  and test;
- `apps/cli/src/commands/simulation-report/career-sections.ts`;
- `apps/cli/src/commands/simulation-report/report-registry.ts` and planner test;
- `packages/i18n/src/labels.ts`;
- this document, audit/index, Phase README and status.

No engine, domain, persistence, web, market, growth, minutes, career-exit or
second report code.

## Required Checks

```bash
pnpm typecheck
pnpm exec vitest run \
  packages/content/src/generators/youth-development-level.test.ts \
  packages/content/src/generators/initial-youth-academies.test.ts \
  apps/cli/src/commands/simulation-report/succession-priority-attribution.test.ts \
  apps/cli/src/commands/simulation-report/report-planner.test.ts \
  --maxWorkers=7
pnpm cli simulation-report \
  --profile=phase81a-top-flight-interesting-intake-l6-21-7x10 \
  --workers=7 \
  --format=json \
  --report-output=simulation-out/phase81a-top-flight-interesting-intake-l6-21-7x10.json
git diff --check
```
