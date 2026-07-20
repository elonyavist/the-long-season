# Step 01 - Live Match Domain Contract And Competition Rules

## Status

Done.

## Goal

Define the complete dependency-safe contract for live match phases, commands,
decision pauses, statistics, incidents, substitutions, and the current playable
league rules before changing engine behavior.

## User-Visible Outcome

No screen changes yet. This step prevents later Matchday work from inventing
rules in React or exposing statistics that the engine cannot truthfully supply.

## Scope

1. Audit the current match phase, staged checkpoint, event, substitution,
   tactic, and competition contracts and record the exact superseded seams.
2. Define one serializable match-session vocabulary for phase, current minute,
   running/paused state, pause reason, score, current lineups, bench state,
   substitutions used, dismissed players, and pending-decision context.
3. Define typed manager commands for pause/resume, grouped substitutions,
   formation/role/slot changes, and pressing/risk/width/directness changes.
4. Define typed command rejection reasons, including phase, availability,
   duplicate player, no re-entry, goalkeeper, dismissal, injury, and maximum
   substitutions.
5. Extend structured incident contracts only for facts used in this phase:
   penalty awarded/outcome, foul, yellow, second yellow, red, injury, and
   substitution.
6. Define one cumulative home/away statistics contract for possession, shots,
   shots on target, xG, corners, fouls, yellows, reds, saves, and goals.
7. Put the current playable league's maximum-five substitution rule and yellow
   accumulation threshold under competition ownership.
8. Keep the deliberate no-window simplification explicit and tested.
9. Define the four injury severities and the minimum durable suspension/injury
   consequence facts without implementing their engine policies yet.

## Implementation Contract

- Domain owns stable language and invariants; engine owns simulation and
  command application; content/competition data owns current regulation
  values; web owns no football rule.
- Structured events contain IDs, keys, numbers, and enums only, never rendered
  prose.
- Every new ID follows the `type:value` namespace and domain-constructor rules.
- The contract represents only real Phase 77 behavior. Do not add extra-time,
  shootout, cup, VAR, pass, offside, or concussion placeholders.
- Live memory-only recovery is a driver policy, not a persisted domain fact.
- Existing batch simulation callers must remain compilable until Step 02 moves
  them to the new session seam.

## Expected Files

- `packages/domain/src/entities/match-event.entity.ts`
- `packages/domain/src/entities/competition.entity.ts`
- `packages/domain/src/match/match-phase.ts`
- `packages/domain/src/match/substitution.ts`
- new focused contracts under `packages/domain/src/match/`
- focused domain tests
- `packages/domain/src/index.ts` only where the current direct public exports
  require the new contracts
- current competition content/schema files that own the playable league rules
- `docs/audits/LIVE_MATCH_CONTROL_REPORT.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What NOT To Implement

- No minute progression, chance calculation, ratings, injury resolution, AI,
  career mutation, storage migration, or React UI.
- No broad generic rules engine or global balance package.
- No dormant command or event variant for future competitions.
- No rendered labels in domain or engine.

## Required Checks

```bash
nvm use 24
pnpm --filter @game/domain run test
pnpm --filter @game/domain run typecheck
pnpm depcruise
git diff --check
graphify update .
```

## Manual Inspection

- Read the new unions as a junior developer and confirm the path from phase to
  command, validation, event, statistics, and competition rule is explicit.
- Confirm the current league can express exactly five substitutions, unlimited
  pauses, no re-entry, and no substitution-window limit without web constants.
- Confirm no future competition branch or presentation text entered domain.

## Completion Criteria

- One typed contract covers every Phase 77 fact and decision.
- Competition ownership and the deliberate no-window rule are unambiguous.
- Domain tests reject illegal combinations and accept the complete current
  league flow.
- The audit identifies what Step 02 replaces without deleting active callers.
- Step 02 remains the only next implementation step.
