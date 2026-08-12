# Step 06B29O - Checkpoint L6.18 Cached Ceiling Distance

## Status

Done - `MIXED`; no gameplay candidate authorized.

## User-Facing Reason

L6.17 proves that producing more players inside the existing serious-prospect
bands does not create generational renewal. Before raising any ceiling, the game
needs to know whether young players miss leader quality narrowly or by several
ability points, and whether the gap is confined to roles or divisions.

## Frozen Population

- the fresh current-policy seven-world, ten-season cache written by L6.17;
- exactly the L6.15B mature annual-academy cohort (`generatedSeasonNumber <= 6`);
- season-ten players only;
- world-, competition- and role-local leader floors from the canonical top-ten
  scorer and assist facts;
- stored ceiling derived once as `currentAbility + potentialRoom`.

No simulation, gameplay change, archetype reconstruction or new player field.

## Frozen Buckets And Decision

For every mature represented-role player, `shortfall = leaderFloor - storedCeiling`:

- `at_or_above`: `shortfall <= 0`;
- `within_0_5`: `0 < shortfall <= 0.5`;
- `within_1_0`: `0.5 < shortfall <= 1`;
- `within_2_0`: `1 < shortfall <= 2`;
- `over_2_0`: `shortfall > 2`.

The report emits counts and shortfall summaries for every observed
competition-role group. `STOP_RETHINK` applies on any reconciliation failure,
fewer than seven worlds, fewer than 21 competition observations, an empty
cohort or an unreachable bucket.

Otherwise:

- `over_2_0 >= 0.50` identifies `ceiling_band_level`;
- combined positive shortfall below two points `>= 0.50` identifies
  `ceiling_band_tail`;
- no majority records `MIXED`.

Only the identified ceiling-distribution owner may open the next candidate.
Volume, current ability, six-star stock, development, minutes, market and annual
senior generation remain closed.

## Expected Files

- `apps/cli/src/commands/simulation-report/succession-priority-attribution.ts`
  and test: reuse the canonical leader conversion join and own distance buckets;
- `apps/cli/src/commands/simulation-report/career-sections.ts`;
- `apps/cli/src/commands/simulation-report/report-registry.ts` and planner test;
- `packages/i18n/src/labels.ts`;
- this document, generated audit/index, Phase README and
  `docs/PROJECT_STATUS.md`.

No content, domain, engine, persistence, web, HTML or save file.

## Required Checks

```bash
pnpm typecheck
pnpm exec vitest run \
  apps/cli/src/commands/simulation-report/succession-priority-attribution.test.ts \
  apps/cli/src/commands/simulation-report/report-planner.test.ts \
  --maxWorkers=7
pnpm cli simulation-report \
  --profile=phase81a-ceiling-distance-l6-18-cached \
  --workers=7 \
  --format=json \
  --report-output=simulation-out/phase81a-ceiling-distance-l6-18-cached.json
git diff --check
```

## Outcome

The cached report completed with expected exit `1`, zero reconciliation
failures, all five buckets reachable and SHA-256
`227246c3268cc750c2289c5f73f97387e9ba10315bfd66a232683a4daaaefa92`.

| Bucket | Count | Share |
|---|---:|---:|
| at or above local leader floor | 492 | 0.3233 |
| positive shortfall up to 0.5 | 105 | 0.0690 |
| positive shortfall 0.5..1.0 | 106 | 0.0696 |
| positive shortfall 1.0..2.0 | 269 | 0.1767 |
| positive shortfall over 2.0 | 550 | 0.3614 |

Neither frozen majority rule passed, so changing all prospect bands would mix
healthy and unhealthy populations. The required group output reveals the
reason without changing the verdict: First Division has an over-two share of
`0.5278`, Second Division `0.2979`, and Third Division `0.1989`; Third Division
already has `0.5276` at or above its local leader floor. The next product
candidate may therefore touch only the First-Division interesting-prospect
ceiling tail and must preserve lower divisions, current strength and rarity.
