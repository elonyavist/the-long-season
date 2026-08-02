# Step 09 - AI Whole-XI Selection And Shared Tactical Decisions

## Status

Not started.

## Goal

Make AI lineup, formation, and live decisions consume the same role fit,
intrinsic shape, and relational matchup truth used for the manager.

## User-Facing Reason

Manager choices are only interesting when opponents select coherent teams,
notice match problems, and react without hidden advantages or a second set of
rules.

## What To Implement

- Audit the current feasibility-preserving greedy slot-order XI selection
  against deterministic whole-XI assignment cases. The Phase 80A guard only
  prevents a valid roster from reaching a dead end; it deliberately does not
  optimize the combined score of the selected XI.
- If the greedy result can be globally worse, replace it behind one named
  selection Module with a deterministic maximum-weight assignment and stable
  tie-breaks.
- Score candidate-slot fit from canonical role quality, suitability, fitness,
  availability, current prospect/usage policy, and the same tactical
  contribution facts; do not use stored hidden potential.
- Make every simulated opponent use a canonical formation and typed lineup
  rather than the current roster-index/default-role fallback.
- Hold that selection for every club in the world, not only the clubs the user
  faces (A2). The step's value is a coherent world, and the background-world
  work that follows this phase selects an XI for roughly 270 clubs per matchday
  through this same Module. Narrowing the scope to the user's opponents would
  leave a fallback path that the later work would then have to remove across
  every remaining club.
- Reach squad depth only through Step 02's named accessor (A6). This step is the
  largest consumer of squad composition in the phase, so it is where a direct
  `club.playerIds` read is most tempting and most expensive to undo: Phase 82A
  must later distinguish the players a club owns from the players it may field,
  and one accessor makes that one edit.
- Make AI formation and live commands evaluate the same intrinsic/relational
  facts plus existing manager style, match state, substitutions, and command
  constraints.
- Preserve bounded reaction frequency and the same minute `N + 1` command
  path.
- Remove the default opponent lineup fallback, duplicate AI balance scores,
  and greedy/feasibility-only helpers if superseded by the canonical global
  assignment.
- Add global-assignment counterexamples, identical-input determinism, squad
  shortage, goalkeeper, suitability, formation, stronger-team, and live
  reaction tests.
- Rerun the frozen Step 01 quality-versus-structure matrix after the canonical
  AI XI is selected. If a correct AI assignment changes realized quality enough
  to break a frozen band, do not weaken AI selection or the band: pause Step
  09, reopen Step 06, retune only its versioned policy coefficients, rerun Step
  06, and then return here.

## Clean-Code Requirements

- Do not expose a generic optimizer Interface. The Module is named for
  football XI assignment.
- AI consumes the shared evaluator and may add only explicitly owned style/
  match-state policy.
- One selected XI result owns reasons; do not recompute explanatory reasons in
  web or diagnostics.
- Delete obsolete fallback lineup builders and test fixtures.

## What NOT To Implement

- No machine learning, search tree, plugin strategy, or scouting advantage.
- No automatic manager recommendation or UI.
- No new AI tactic control.
- No transfer/squad-building rework.
- No background-fixture resolution. This step makes every club selectable; the
  work that follows decides when those clubs actually play.
- No selection path that reads `club.playerIds` directly, and no per-club
  special case that bypasses the canonical Module for non-opponents.

## Expected Files

- `packages/engine/src/team-selection/ai-squad-selection.ts`
- `packages/engine/src/team-selection/ai-squad-selection.test.ts`
- `packages/engine/src/team-selection/ai-in-game-decisions.ts`
- `packages/engine/src/team-selection/ai-in-game-decisions.test.ts`
- `packages/engine/src/match-engine/tactical-shape.ts`
- `packages/engine/src/match-engine/tactical-matchup.ts`
- `packages/engine/src/match-engine/progressive-match-session.ts`
- `packages/engine/src/match-engine/progressive-match-session.test.ts`
- `packages/engine/src/team-selection/index.ts`
- `apps/web/src/features/matchday/matchday-adapter.ts`
- `apps/web/src/features/matchday/matchday-adapter.test.ts`
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
  packages/engine/src/team-selection/ai-squad-selection.test.ts \
  packages/engine/src/team-selection/ai-in-game-decisions.test.ts \
  packages/engine/src/match-engine/progressive-match-session.test.ts \
  apps/web/src/features/matchday/matchday-adapter.test.ts \
  packages/simulation-tools/src/tactical-shape/tactical-shape-audit.test.ts
pnpm --filter @game/engine run typecheck
pnpm --filter @game/web run typecheck
pnpm --filter @game/simulation-tools run typecheck
pnpm depcruise
git diff --check
graphify update .
```

## Definition Of Done

- AI XI selection is globally coherent on counterexamples and deterministic.
- Every club in the world reaches the engine with a canonical typed formation,
  proven on a club the user neither faces nor competes with.
- Squad depth is read through the named accessor everywhere, and the Step 01
  inventory of direct `club.playerIds` lineup readers is empty.
- AI and manager consume the same shape/matchup truth.
- Live AI changes use the canonical command path and minute boundary.
- The complete frozen quality-versus-structure matrix still passes with the
  canonical AI-selected XIs and positive paired-seed observations.
- No default roster-index lineup or duplicate tactical score remains.
- Step 10 is the only next action.
