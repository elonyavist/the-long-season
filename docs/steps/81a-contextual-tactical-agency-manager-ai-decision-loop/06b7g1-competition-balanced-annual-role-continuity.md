# Step 06B7G1 - Competition-Balanced Annual Role Continuity

## Status

**Done.** Targets in Step 06B7G2 were frozen before implementation.
`MAX_SINGLE_MONTH_GROWTH` remains `0.18`.

## User-Facing Reason

A ten-season career must not slowly lose legitimate ways to build a team. The
opening world can generate all ten player roles, but annual academy and senior
intake can currently generate only eight. After several seasons this silently
pushes clubs away from wing-backs and wide midfielders and makes tactical
variety decay even when the selector itself is working correctly.

## Goal

Make opening academies, seasonal academy refills, and annual senior-candidate
intake capable of sustaining all ten official player roles without assigning a
formation to a club or making every club hold the same role mix.

## Locked Design

- `PLAYER_ROLES` remains the only complete role order.
- Domain exposes the existing role-to-department and role-to-natural-position
  facts; content does not copy either mapping.
- Initial academy rosters retain exactly `1` goalkeeper, `4` defenders, `4`
  midfielders and `2` attackers per club.
- Inside each department, role tokens are distributed by one deterministic,
  competition-scoped balanced deck. Counts for two roles in the same eligible
  deck differ by at most one.
- Roles with right/left positions alternate deterministic sides within the
  competition; when a role occurs at least twice, right/left counts differ by
  at most one.
- Seasonal academy refill first preserves the club's department vacancy, then
  uses the competition deck to select the role. It never restores a hidden
  fixed formation skeleton.
- Annual senior candidate pools retain one goalkeeper candidate per club. The
  remaining positions come from the competition deck and are assigned
  deterministically toward real club role shortages. A shortage influences who
  receives a role token; it does not change the competition's role quota.
- No generated role receives a strength, potential, market, selection or
  formation bonus. The canonical AI remains free to select the shape that fits
  the available footballers.
- Promotion/relegation uses current `Competition.clubIds`; club identity is not
  persisted or inferred from a formation.

## What To Implement

1. Expose the domain facts already owned by `POSITION_BY_ROLE` and
   `DEPARTMENT_BY_ROLE` through small total functions.
2. Add one content-owned annual role planner that:
   - accepts ordered competition clubs and their candidate slots;
   - balances official roles inside the slot's required department;
   - uses current club role counts only as a deterministic allocation priority;
   - resolves side through a stable derived RNG stream and balanced alternation;
   - throws on an incomplete assignment rather than defaulting to `cm`.
3. Route initial academy generation, academy refill and senior intake through
   that planner.
4. Delete the exact-position academy skeleton and the random senior-intake
   position picker when their final callers move. No compatibility path remains.
5. Add real-generation reachability tests over complete competitions, not
   fixtures hand-built to satisfy one role.

## What NOT To Implement

- no formation assignment or formation-specific quota;
- no change to ability, potential, rarity, development, retirement, transfer,
  selection or match coefficients;
- no persistence field or beta migration;
- no checkpoint threshold change after output;
- no report entrypoint outside `pnpm cli simulation-report`.

## Expected Files

- `packages/domain/src/player/create-player.ts` and its test; expose the one
  existing role-to-natural-position owner.
- `packages/domain/src/player/player-squad-department.ts` and its test; expose
  the one existing role-to-department owner.
- `packages/content/src/generators/annual-intake-role-plan.ts` **(new)** and its
  test; owns the competition deck, shortage allocation and side balance.
- `packages/content/src/generators/player-role-identity.ts` and its test;
  expose position-to-department through the domain's existing owner so the CLI
  diagnostic does not grow another stale position switch.
- `packages/content/src/generators/initial-youth-academies.ts` and its test;
  consume the planner for opening academies and stop owning an exact role
  skeleton.
- `packages/content/src/generators/domestic-world.ts`; supplies the real
  competition key for each opening-academy club to both preliminary and final
  generation passes.
- `packages/content/src/generators/career-intake-players.ts` and its test;
  compose competition-scoped academy-refill and senior-candidate plans.
- `apps/cli/src/commands/simulate-season/generated-inspection-output.ts`;
  supplies its generated league's canonical competition key to the academy
  diagnostic instead of inventing a content fallback.
- `apps/cli/src/commands/simulate-season.test.ts`; the generated academy
  department record changes only if the canonical diagnostic recognizes the
  newly reachable wide-midfield positions.
- `apps/cli/src/commands/career.test.ts` and
  `apps/web/src/runtime/web-career-runtime.test.ts`; the same generated-world
  identity hash moves in both adapters and remains one paired proof.
- `apps/cli/src/commands/simulation-report/career-world-facts.test.ts`; the
  real annual exceptional-allocation record is investigated and re-recorded
  only after its changed role population is accounted for.
- this step document, Step 06B7G2, phase `README.md`, and
  `docs/PROJECT_STATUS.md`.

## Required Checks

```bash
source "$HOME/.nvm/nvm.sh"
nvm use 24
pnpm exec vitest run \
  packages/domain/src/player/create-player.test.ts \
  packages/domain/src/player/player-squad-department.test.ts \
  packages/content/src/generators/annual-intake-role-plan.test.ts \
  packages/content/src/generators/initial-youth-academies.test.ts \
  packages/content/src/generators/career-intake-players.test.ts
pnpm typecheck
pnpm depcruise
git diff --check
graphify update .
```

## Definition Of Done

All three generation roots use one competition-balanced role owner; all ten
roles and both sides are reachable on real generated competition data; academy
department structure and every unrelated generation invariant remain green;
the superseded position pickers no longer exist. Only then does Step 06B7G2
measure the changed population.

## Recorded Result

- one competition planner now owns opening academy, academy refill and annual
  senior-candidate roles; the old exact-position skeleton, independent random
  intake picker and their RNG streams were deleted;
- real `18`-club generation reaches `10/10` roles, preserves each academy's
  `1/4/4/2` departments and keeps every two-sided role within one player;
- club shortages allocate a frozen competition quota but cannot change it or
  read a formation;
- CLI and web replay the same new-career identity hash `77327405`;
- the changed Phase 80A stock record was measured before adoption: the seed now
  has `3 + 2` departures rather than `4 + 2`, while every one of the `5`
  required replacements is allocated, generated and accepted, stock remains
  exactly `4` per snapshot and inflation/missing counts remain `0`;
- focused verification: `10` files / `190` tests; complete `pnpm check`:
  `300` files / `2293` tests, `869` modules, all custom checks and typechecks
  green; `git diff --check` clean.

Next: Step 06B7G2 runs the preregistered `7 x 2 x 7` checkpoint alone.
