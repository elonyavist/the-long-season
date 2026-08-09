# Step 06B7C - Soft Outfield Career-Exit Hazard

## Status

Done and retained. L4.2 reached the branch `403` times with carried invariants
green; it improved renewal but did not by itself pass the frozen targets.

## Goal

Let ordinary outfield careers leave the modeled three-tier professional world
gradually in the mid-thirties, while preserving rare long careers and the
later goalkeeper curve. This creates real roster opportunity; it never changes
goals, assists, selection scores or a player's origin.

## Attribution Before Implementation

L4.1 proved that academy participation is real and complete but renewal still
fails:

- `997,917` academy appearances and `89,812,530` minutes, with zero missing or
  invalid rows;
- all `21` competition-worlds promote at least one academy player;
- generated season-ten leaders improve only from `6/420` to `12/420`;
- `6,030/8,316` opening senior players remain active after ten seasons;
- `3,327` of them are `33+` and occupy `305/420` season-ten leader rows;
- annual players aged `21..24` average `7.99` current ability, while retained
  opening seniors average `11.27` at `30..32` and `11.83` at `33+`.

The previous “retirement/exit” ablation changed only ability decline and froze
exit probability. It therefore did not test the exit owner. The current engine
allows every strong outfielder to remain until a hard retirement at `37`.
Research on `3,467` retired professional footballers reports mean retirement at
`32.70 +/- 4.27`, while career level and games played extend longevity. That
supports a soft age hazard with a quality exception, not a lower hard cap:

- [Rebelo et al., The Last Whistle](https://pmc.ncbi.nlm.nih.gov/articles/PMC12360933/)
- [normal career longevity in professional footballers](https://pmc.ncbi.nlm.nih.gov/articles/PMC12392379/)

## Frozen Behaviour

Existing low-ability release/step-down branches and the age-`37` hard retirement
remain unchanged and take precedence. For other outfield players, apply one
deterministic end-of-season retirement roll:

| Completed age | Base probability |
|---:|---:|
| `33` | `1,000` bps |
| `34` | `2,500` bps |
| `35` | `5,000` bps |
| `36` | `8,000` bps |

Players whose role-current ability is at least `13.0` receive a `5,000` bps
longevity multiplier on those probabilities. The same per-player derived RNG
stream already owned by `player-exits.ts` decides the outcome. Goalkeepers keep
their existing later policy byte-for-byte.

The rule never reads origin, leaderboard position, goals, assists, reputation
or future state. Department and minimum-squad safety remain unchanged.

## Reachability And Guardrails

- a real generated career must observe at least one outfield retirement at age
  `33` or `34`; a constructed fixture is not sufficient;
- at least one active `33+` player and one `33+` scorer/assist leader must remain
  reachable in the L4.2 cohort;
- goalkeeper exits, low-ability exits, department safety and hard-age exits keep
  their existing tests;
- current/potential ordering, rarity, academy participation, squad health and
  finance reconciliation remain green;
- no direct outcome or origin-specific branch is introduced.

## Expected Files

- `packages/engine/src/career/player-exits.ts` and test; the existing lifecycle
  owner gains one typed basis-point age table and its real branch semantics
- `apps/cli/src/commands/simulation-report/generational-succession.ts` and test;
  expose age-curve retirement reachability from canonical exit records
- `apps/cli/src/commands/simulation-report/career-sections.ts` and test only if
  the existing checkpoint projection needs the new reachability fact
- `apps/cli/src/commands/simulation-report/report-registry.ts` and
  `report-planner.test.ts`; the L4.2 cache cannot reuse L4.1 shards
- this document, `06b7d-checkpoint-l4-2-career-exit-and-renewal.md`, phase
  README and `docs/PROJECT_STATUS.md`

## Required Checks

```bash
nvm use 24
pnpm exec vitest run packages/engine/src/career/player-exits.test.ts apps/cli/src/commands/simulation-report/generational-succession.test.ts
pnpm check
git diff --check
graphify update .
```

## Definition Of Done

The soft hazard is deterministic, real-data reachable and leaves all carried
invariants green. Only Checkpoint L4.2 opens.
