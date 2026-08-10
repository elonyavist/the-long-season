# Step 06B13 - Renewal Development-Opportunity Correction

## Status

Done - owner correction implemented and green.

## User-Facing Reason

A prospect who plays a normal youth schedule should have a credible chance to
become senior quality before his development window closes. Today full monthly
development requires five complete matches (`450` minutes), while the canonical
academy programme provides three (`270`). The game therefore generates enough
young players and gives them minutes, but treats a full youth month as only
three-quarters of an opportunity.

## Entry Evidence

The locked L5.1 funnel identifies `development_realization`:

- career-generated/opening population `0.7985`;
- mature academy/candidate `0.6688` and candidate/promotion `0.6228`;
- senior-quality material minutes/senior quality `0.7693`;
- generated senior-quality share only `0.1090` against `>= 0.25`.

Quantity, promotion and material use are healthy. The monthly growth ceiling is
already `0.27` and L4 reached development parity in `5/7`; raising it again is
not authorized.

## Frozen Correction

Keep the same five opportunity outputs and move their football milestones:

| Monthly minutes | Multiplier |
|---:|---:|
| `0` | `0` |
| `1..89` | `0.15` |
| `90..179` | `0.45` |
| `180..269` | `0.75` |
| `>= 270` | `1.00` |

This represents one cameo band, one complete match, two matches and a full
three-match month. The policy reads minutes only: no academy origin, generated
origin, age bonus or leaderboard fact enters it. Age curve, performance,
environment, variance, relevance, true potential and hard caps remain intact.

Because the curve changes deterministic projection outcomes, replace the
current beta projection/economy chain atomically if the complete matrix moves.
Beta saves may be rejected; no legacy reader, migration or fallback remains.

## What NOT To Implement

- no increase to `MAX_SINGLE_MONTH_GROWTH`;
- no generated/academy-only bonus, direct quality floor or promotion rule;
- no age/output/leaderboard correction;
- no extra synthetic fixtures or duplicate participation store;
- no stale projection bundle and no beta compatibility residue.

## Expected Files

- `packages/engine/src/career/player-development-policy.ts` and tests;
- `packages/engine/src/career/player-development.ts` tests for real trajectory,
  zero minutes, potential ceiling and reload determinism;
- `packages/simulation-tools/src/player-development-cohort-audit.ts` and tests,
  because opportunity-band labels consume the shared multiplier;
- linked content projection/economy assets, loaders and schema tests only if
  the complete deterministic matrix moves;
- canonical matrix/identity/report records reached by that version change,
  with CLI and web identities always updated together;
- `apps/cli/src/commands/simulation-report/career-world-facts.test.ts` proves a
  real canonical career reaches exactly `270` minutes and the new full band;
- this step, phase README, audit README and project status;
- 06B14 only after this step is green.

## Required Checks

Real-data reachability of the new `270 -> 1` branch, deterministic development
matrix equality, focused development/economy tests, `pnpm check`,
`git diff --check`, and `graphify update .`.

## Adopted Solution

`monthlyOpportunityMultiplier(...)` now maps a full canonical academy month to
full opportunity without changing the `0.27` monthly growth ceiling:
`0 -> 0`, `1..89 -> 0.15`, `90..179 -> 0.45`, `180..269 -> 0.75`, and
`>= 270 -> 1`. The branch is reached by real career participation rows at
exactly `270` minutes; it is not proved with a purpose-built fixture.

The changed deterministic matrix required one atomic beta bundle:

- `player-rating-scale-v10` with `player-potential-projection-v7`;
- `valuation-curves-v8`;
- `asking-price-curves-v7`;
- `market-behavior-calibration-v8`.

The old version chain has no reader or compatibility fallback. Every resumable
career-report cache suffix advanced because an old shard describes a different
development policy. CLI and web now share identity hash `cf92db55`.

## Verification

- complete `1,620`-observation / `324`-cell projection matrix: pass, zero
  missing, under-observed, ordering or stored-ceiling violations;
- canonical career reachability test: `16/16` pass in `394.04s`, including a
  real `270 -> 1` observation;
- focused content, schema, development and audit tests: pass;
- `pnpm check`: exit `0`, `302` files / `2,327` tests, `874` modules with no
  dependency violations, all four custom checks and all typechecks green.

## Next Action

Step 06B14 may correct only the attributed `actor_allocation` owner. It must
redistribute a team's already-created opportunities among plausible shooters
and creators; it may not alter results, add an age/origin rule, or repair
renewal by awarding leaderboard output directly.
