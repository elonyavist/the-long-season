# Step 07 - Route Quality, Causal Actors And Explanation Facts

## Status

Not started.

## Goal

Create one explicit occasion context in which route and named actors exist
before aggregate quality and outcome are resolved.

## User-Facing Reason

The manager should see events that follow from the selected players and route,
not names attached after the engine has already decided the result.

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
