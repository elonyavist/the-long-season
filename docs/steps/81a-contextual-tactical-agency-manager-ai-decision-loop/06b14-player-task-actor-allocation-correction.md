# Step 06B14 - Player-Task Actor Allocation Correction

## Status

Done - implementation, real-data reachability and full gate are green.

## User-Facing Reason

Team results may stay identical while the season still feels false if goals and
assists are assigned almost independently of the footballers' relevant skills.
Good finishers should receive a larger share of a team's shots and good
creators a larger share of its assists, while older stars remain capable of
exceptional seasons because age itself is not an output penalty.

## Entry Evidence

The locked L5.1 attribution measured:

- current-ability/output correlation `0.0205` for goals and `0.0261` for
  assists;
- age-33+ shares `0.2600` among scorer leaders and `0.1900` among assist
  leaders;
- mean leader ages `30.52` and `29.74`.

The owner is `actor_allocation`: availability, starts, minutes, recovery and
team opportunity totals already pass their gates. This step therefore changes
who receives an existing event, never whether the event or match result exists.

## Frozen Design

Use the canonical incident profile already present in `OccasionContext`:

- scorer quality derives only from finishing-task abilities such as finishing,
  composure, heading and technique, with the chance type deciding their mix;
- creator quality derives only from creation-task abilities such as passing,
  vision, crossing and technique, with the chance type deciding their mix;
- quality modifies the existing role-aware pool as a centred within-pool
  multiplier, preserving role eligibility and avoiding a global quality floor;
- one weighted draw remains one weighted draw. RNG stream and draw count are
  invariant; opportunity count is unchanged.

No field stores the derived task quality. The allocator computes it where the
event is assigned.

## What NOT To Implement

- no age, generated-origin, academy-origin, fame or leaderboard coefficient;
- no bonus that creates goals, assists, shots or match events;
- no direct change to team strength, occasion rate or conversion formula;
- no second player profile, duplicated attribute formula or extra RNG draw;
- no hard exclusion of an eligible role or player.

## Expected Files

- the canonical occasion actor-selection module under
  `packages/engine/src/match-engine/` and its focused tests;
- `match-context.ts` and `tactic-team-context.ts`, because production truth has
  shown that the compact match profile does not yet carry the finishing and
  creation attributes the attributed owner must read;
- shared incident-profile fixtures and the one explicit profile literal;
- `apps/cli/src/commands/simulation-report/actor-allocation-reachability.test.ts`
  over a genuinely generated world for branch
  reachability, because an engine fixture cannot prove the rule over real
  content;
- this step document, phase README and `docs/PROJECT_STATUS.md`;
- Step 06B15 only after the owner correction is green.

## Required Checks

Graphify explain/affected before editing the shared allocator; tests proving
real generated players reach both positive and negative centred quality edges;
same-seed determinism and unchanged RNG draw count; focused match tests;
`pnpm check`;
`git diff --check`; `graphify update .`.

## Pre-Implementation Correction

`OccasionContext` already feeds the selected shooter's centred quality edge into
resolution. Therefore actor allocation cannot both favour a better finisher and
promise bit-identical scores: keeping that promise would require naming the
player after the result or deleting his causal contribution. The code wins over
the earlier wording. This step preserves the number and identity of opportunity
decisions and the three actor RNG draws, while allowing deterministic outcomes
to change because a different named footballer takes the same chance. The final
standings checkpoint owns any aggregate table movement.

## Adopted Solution

The existing role weights remain the first allocation layer. Within that pool,
the selector now applies a centred task-quality multiplier bounded to
`0.25..1.75`; a five-point composite gap is one multiplier. Open play,
counters, crosses and dead-ball task functions read different explicit
ability mixes. No age, origin, reputation or output fact enters them.

> **Superseded (recorded by 06B18):** these bounds no longer match shipped
> code. 06B15B moved the creator response to divisor `10`, bounds
> `0.625..1.375`, and 06B15D moved the shooter response to divisor `70`,
> bounds `0.95..1.05`. Amendment A6 records all output-derived divisors as
> technical debt owned by the structural replacement step (06B22).

`MatchPlayerIncidentProfile` now carries the real technical, physical and
mental inputs used by these tasks. `assembleMatchTeamContext(...)` remains the
single producer; neutral fixtures state their neutrality once through the
shared profile helper. The selector still consumes exactly three actor-stream
draws in the same order.

## Verification So Far

- focused match-context, actor, occasion, team-builder and exit tests: `53/53`;
- engine typecheck and package tests: pass;
- real generated-world counterfactual: pass in `2.24s`. Swapping only task
  attributes between two same-role players reverses their nomination advantage,
  while the weaker player remains reachable;
- `pnpm check`: exit `0`, `303` files / `2,330` tests, `875` modules with no
  dependency violations, all custom checks and typechecks green.

## Next Action

Step 06B15 runs the frozen first-division player-use, renewal and leader target
register over seven fresh worlds and ten seasons. No Step 06B14 coefficient may
move after reading it; a failure names the next owner or remains `REFINE`.
