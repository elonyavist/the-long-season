# Step 07 - Route Quality, Causal Actors And Explanation Facts

## Status

Not started.

## Goal

Create one explicit occasion context in which route and named actors exist
before aggregate quality and outcome are resolved.

## User-Facing Reason

The manager should see events that follow from the selected players and route,
not names attached after the engine has already decided the result.

## Inherited From Step 06 - The Shot Chain Is Already Reordered

Step 06 rebuilt `aggregate-occasion-resolver.ts`, which this step then makes
consume the occasion context. Build on the chain that is there rather than the
one the original plan assumed, and do not collapse it back.

Each actor is asked exactly one question, in pitch order:

1. **Blocked?** defence against attack.
2. **On target?** the striker and the position he is shooting from. **The
   keeper has no input here.** Whether a shot hits the target belongs to
   whoever struck it.
3. **Goal or save?** only now the keeper, deciding which side of the line a
   shot already on target ends up.

The version before it asked the keeper both how good the chance was - he carried
`0.40` of the defending score - and how often shots were on target, since every
save counts as on target. A world-class keeper therefore *raised* his opponent's
shots on target while leaving goals unchanged, because two keepers nine points
apart landed in one conversion band. A poor striker out-shot a great one and
scored just as often. Measured after the fix, keeper quality moves goals into
saves without touching the shot count:

| striker 19, only the keeper changes | on target | goals | saves |
|---|---|---|---|
| keeper `19` | `44.4%` | `14.6%` | `29.7%` |
| keeper `14` | `44.4%` | `18.0%` | `26.4%` |
| keeper `10` | `44.4%` | `20.3%` | `24.1%` |

Two constraints this step must preserve when the context arrives:

- **A goal is a shot on target and a block never is.** `isShotOnTarget` is not
  free to drift from the outcome.
- **A keeper always saves some share of what reaches him.**
  `MAX_GOAL_SHARE_OF_ON_TARGET` exists because a goal is one kind of shot on
  target, so without a ceiling a large enough mismatch makes every shot on
  target a goal and the keeper stops existing. It binds in `0.6%` of matchups;
  median keeper save share is `61%`.

`aggregate-occasion-resolver.test.ts` states all of this and must keep passing
once actors are named. Named actors replace *who* is credited, never *whether*
the chain asks each question once.

## What To Implement

- Add one typed `OccasionContext` containing route, attacking/defending side,
  creator, shooter, primary defender, goalkeeper, and bounded route facts.
- Select actors before resolution through dedicated deterministic RNG streams.
- Make relevant actor attributes contribute boundedly to route quality and
  aggregate resolution without simulating autonomous agents.
- Make the resolver consume the occasion context and keep exactly one outcome
  owner.
- Project route plus causal actors into sparse structured match events and the
  explanation trace.
- Replace/remove post-resolution actor attribution and any duplicated chance
  type/actor selection path.
- Bump the match-event contract only if the new structured route fact is
  persisted; Step 08 owns the one final save/schema reset.
- Add tests for causal ordering, actor eligibility, goalkeeper identity,
  role/route relevance, no duplicate actor, event coherence, and deterministic
  replay.

## Clean-Code Requirements

- `OccasionContext` is a football concept, not a bag of optional fields.
- Do not preserve the old actor path behind a fallback.
- Keep actor selection, quality derivation, resolution, and event projection
  as distinct named responsibilities behind one occasion seam.
- Remove obsolete fixtures and catch-all route mappings.

## What NOT To Implement

- No full pass sequence, generic duel engine, event bus, or player-agent loop.
- No rendered commentary or prose in engine/domain.
- No UI work.
- No storage migration or compatibility path.

## Expected Files

- `packages/domain/src/entities/match-event.entity.ts`
- `packages/domain/src/entities/match.entity.ts`
- `packages/domain/src/entities/match-event.entity.test.ts`
- `packages/engine/src/match-engine/occasion-context.ts`
- `packages/engine/src/match-engine/occasion-context.test.ts`
- `packages/engine/src/match-engine/chance-actors.ts`
- `packages/engine/src/match-engine/chance-actors.test.ts`
- `packages/engine/src/match-engine/occasion-resolver.ts`
- `packages/engine/src/match-engine/aggregate-occasion-resolver.ts`
- `packages/engine/src/match-engine/step-match.ts`
- `packages/engine/src/match-engine/step-match.test.ts`
- `packages/engine/src/match-engine/create-match-report.ts`
- `packages/engine/src/match-engine/create-match-report.test.ts`
- `packages/engine/src/match-engine/match-explanation-trace.ts`
- `packages/engine/src/match-engine/match-explanation-trace.test.ts`
- `packages/engine/src/match-engine/index.ts`
- `packages/simulation-tools/src/tactical-shape/tactical-shape-audit.ts`
- `packages/simulation-tools/src/tactical-shape/tactical-shape-audit.test.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- this step document
- the next relevant step document only if a lesson changes future work

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/domain/src/entities/match-event.entity.test.ts \
  packages/engine/src/match-engine/occasion-context.test.ts \
  packages/engine/src/match-engine/chance-actors.test.ts \
  packages/engine/src/match-engine/step-match.test.ts \
  packages/engine/src/match-engine/create-match-report.test.ts \
  packages/engine/src/match-engine/match-explanation-trace.test.ts \
  packages/simulation-tools/src/tactical-shape/tactical-shape-audit.test.ts
pnpm --filter @game/domain run typecheck
pnpm --filter @game/engine run typecheck
pnpm --filter @game/simulation-tools run typecheck
pnpm depcruise
git diff --check
graphify update .
```

## Definition Of Done

- Route and actors exist before quality/outcome resolution.
- Actor attributes affect only relevant bounded facts.
- Structured events and explanation trace agree with the occasion context.
- Post-resolution attribution and superseded chance inference are absent.
- No autonomous-agent or pass-chain abstraction exists.
- Step 08 is the only next action.
