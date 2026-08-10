# Step 06B15B - Renewal And Actor Residual Correction

## Status

**Done and green on 2026-08-10.** The fresh L5.3A checkpoint is active.

## Goal

Produce enough genuine annual prospects to renew senior quality, and let task
quality influence who receives an opportunity without inflating the expected
conversion rate or concentrating player output beyond the frozen historical
bands.

## What To Implement

1. Apply the frozen seven-state serious-prospect chance curve in the one content
   owner shared by annual youth providers.
2. Keep interesting prospects and the national ceiling-six allocator unchanged.
3. Apply the frozen task-weight response and make the shooter conversion mean
   consume the exact same candidate weights as selection.
4. Prove on real generated intakes that the first-division serious count can
   reach the existing `4..8` range. Prove on real lineups that the actor edge is
   zero in expectation under the new weights, while strong and weak eligible
   actors both remain reachable.
5. If deterministic projection/economy records move, replace the beta bundle
   atomically. Old beta saves and obsolete asset readers are deleted; no
   compatibility layer remains.

## What NOT To Implement

- no age, origin, leaderboard or division-result multiplier;
- no new opportunity, goal or assist total;
- no direct quality floor for generated players;
- no duplicate actor task table or post-report correction;
- no threshold change after the retry output.

## Expected Files

- `packages/content/src/generators/youth-development-level.ts` and its focused
  test own the total chance table; `career-intake-players.test.ts` searches
  actual annual candidates for the authored first-division rarity reachability;
- `packages/engine/src/match-engine/chance-actors.ts`,
  `occasion-context.ts` and focused tests;
- actor-allocation reachability tests in the report owner;
- `apps/cli/src/commands/simulation-report/report-registry.ts` and planner
  tests advance every career cache identity affected by annual generation or
  match actors, and register the fresh L5.3A population without reusing L5.3;
- projection/economy assets, loaders, golden identities and cache versions only
  if the complete deterministic matrix moves;
- `apps/cli/src/commands/career.test.ts` and
  `apps/web/src/runtime/web-career-runtime.test.ts` move the one shared identity
  record together: opening academies use the same serious-prospect owner as
  annual academies, so the canonical world identity legitimately changes even
  though the projection matrix does not;
- this document, phase README, project status and the fresh L5.3 retry document.

Every additional file is listed with its ownership before it is edited.

## Required Checks

Focused content/engine/reachability tests, deterministic projection matrix when
applicable, `pnpm check` alone, `git diff --check`, `graphify update .`, then a
fresh L5.3 `7 x 10` with exactly seven workers.

## Verification

- the seven-state serious-prospect curve is total; seven generated
  first-division annual populations reach a mean inside the existing `4..8`
  high-potential budget, with a real individual population inside it;
- strong and weak same-role actors both remain reachable; the strong actor is
  selected at least `1.5 x` as often on the fixed real selection path;
- sampled shooter execution is centred within `0.01` on the exact selection
  pool; identical-player edges remain exactly zero and the quality cap remains
  reachable;
- the complete projection/economy matrix did not move. Canonical CLI/web world
  identity moved together to `527d2de2`, and all career cache identities
  advanced because annual intake and match actors changed;
- `pnpm check`: `303` test files / `2,333` tests / `875` modules, exit `0`;
- no age, origin, output, direct-result or duplicate report rule was added.
