# Step 05 - Deterministic AI In-Game Decisions

## Status

Done.

## Goal

Give the opponent one deterministic, explainable in-game decision policy that
uses the same legal command and substitution contracts as the manager.

## User-Visible Outcome

Opponent teams react to score, minute, condition, injuries, dismissals, ratings,
and match context. Their changes appear as real structured substitutions or
tactical incidents rather than invisible strength adjustments.

## Scope

1. Replace the half-time-only AI substitution seam with one in-game policy that
   can evaluate legal decisions at deterministic minute boundaries.
2. Evaluate forced injury replacement, minor injury risk, dismissal recovery,
   low condition, poor performance, score state, and minute.
3. Choose substitutions using role coverage, suitability, current match role,
   bench availability, no re-entry, and remaining-substitution rules.
4. Allow bounded changes to formation and existing pressing/risk/width/
   directness instructions when match context justifies them.
5. Apply AI commands through the same canonical validator and session command
   path used by selected-club commands.
6. Emit structured substitution and role/tactic-change facts for presentation
   and final reports.
7. Guarantee stable tie-breaking and same-seed/same-state decisions.
8. Delete the superseded half-time-only AI path after all active callers move.

## Implementation Contract

- AI chooses only from commands legal for a human-controlled side in the same
  match state.
- AI may use opponent-public and own-team facts, never presentation state,
  rendered text, animation, or wall-clock time.
- The policy is intentionally compact and football-readable; do not introduce
  personas, tactical learning, hidden difficulty boosts, or a generic planner.
- A substitution or tactical change affects only future minutes.
- Forced decisions take priority over opportunistic changes.

## Expected Files

- `packages/engine/src/team-selection/ai-half-time-substitution.ts`
- its current tests
- new canonical AI in-game decision Module and focused tests under
  `packages/engine/src/team-selection/` or `packages/engine/src/match-engine/`
- `packages/engine/src/match-engine/` session/command files from Step 02
- `packages/engine/src/match-engine/index.ts`
- affected season/career fixture tests
- `docs/audits/LIVE_MATCH_CONTROL_REPORT.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What NOT To Implement

- No manager persona, adaptive difficulty, cheating bonus, transfer logic,
  training choice, or persistent tactical learning.
- No UI, commentary text, or AI-only command type.
- No second substitution validator or duplicate suitability formula.
- No retained half-time special case after migration.

## Required Checks

```bash
nvm use 24
pnpm --filter @game/engine run test
pnpm --filter @game/engine run typecheck
pnpm --filter @game/simulation-tools run test
pnpm depcruise
git diff --check
graphify update .
```

## Manual Inspection

- Inspect fixed-seed traces for AI forced injury, red-card response, trailing
  change, protecting-a-lead change, and no-change cases.
- Confirm the same state always produces the same command and that the command
  passes the shared validator.
- Confirm the tabellino can identify who entered, who exited, and when.

## Completion Criteria

- AI decisions are deterministic, legal, and visible as structured facts.
- The current maximum-five and no-re-entry rules apply equally to both clubs.
- The half-time-only AI implementation has no remaining active caller.
- No AI-only hidden strength mutation exists.
- Step 06 remains the only next implementation step.
