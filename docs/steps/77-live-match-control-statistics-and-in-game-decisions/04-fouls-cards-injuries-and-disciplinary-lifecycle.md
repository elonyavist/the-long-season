# Step 04 - Fouls, Cards, Injuries And Disciplinary Lifecycle

## Status

Done.

## Goal

Add a minimal but complete deterministic incident lifecycle from live match
causality through selection availability, career consequences, and Posta.

## User-Visible Outcome

Matches can now produce credible fouls, yellow/red cards, and injuries. The
manager receives real decision pauses during the match and sees unavailable or
suspended players reflected in later selection and Posta.

## Scope

1. Generate foul risk from tackling, composure, determination, fatigue,
   pressing/risk, action danger, and pitch zone.
2. Resolve foul severity into no card, yellow, second yellow, or direct red
   using deterministic context and competition rules.
3. Remove dismissed players immediately and keep the side at ten; update
   numerical-advantage effects for later minutes.
4. Generate injury incidents from current physical state, fragility, workload,
   and incident context.
5. Resolve `knock`, `minor`, `moderate`, and `serious` severity with typed
   continue/substitute/forced-exit decisions.
6. Apply temporary current-match penalties and deterministic aggravation risk
   when a player continues after a knock or minor injury.
7. Derive deterministic injury duration and return date after full time.
8. Persist red/double-yellow suspensions and yellow accumulation under current
   competition rules.
9. Prevent injured-unavailable and suspended players from being selected for
   later fixtures.
10. Create structured Posta items for important diagnosis and suspension facts
    through the existing Inbox lifecycle.
11. Extend save/storage schema only for facts that remain durable after the
    match, using the project's current migration/reset policy with no dual
    reader or compatibility leftovers.

## Implementation Contract

- Engine emits structured incidents and consequences; presentation owns prose
  and icons.
- No new aggression, discipline, injury-proneness duplicate, or medical-rating
  attribute is introduced.
- Decision pauses are match-session facts. They never depend on animation or
  browser timing.
- Career mutation occurs once at completed-fixture commit and remains
  idempotent across reload.
- Yellow accumulation thresholds and suspension lengths belong to the current
  competition contract.
- A red card never creates a legal replacement. A forced injury only creates a
  replacement opportunity when an eligible substitute and substitution remain.

## Expected Files

- `packages/domain/src/entities/match-event.entity.ts`
- `packages/domain/src/entities/competition.entity.ts`
- `packages/domain/src/state/career-state.ts`
- focused domain match/career tests
- new or existing injury/suspension contracts under `packages/domain/src/`
- `packages/engine/src/match-engine/step-match.ts`
- new focused foul/card/injury policy Modules under
  `packages/engine/src/match-engine/`
- focused engine tests
- `packages/engine/src/career/progress-fixture.ts`
- `packages/engine/src/career/career-inbox-lifecycle.ts`
- current career consequence/selection Modules and focused tests
- `packages/storage/src/sqlite/sqlite-career-schema.ts`
- `packages/storage/src/sqlite/sqlite-career-migrations.ts`
- `packages/storage/src/sqlite/career-state-mapper.ts`
- focused JSON/SQLite/OPFS storage tests only where durable state changes
- `docs/audits/LIVE_MATCH_CONTROL_REPORT.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What NOT To Implement

- No medical centre, physio/staff system, treatment choice, registration rule,
  appeal, ban appeal, contract effect, VAR, or concussion substitute.
- No random UI-only injury/card event.
- No web presentation, icon work, or AI reaction yet.
- No broad save rewrite or live match persistence.

## Required Checks

```bash
nvm use 24
pnpm --filter @game/domain run test
pnpm --filter @game/engine run test
pnpm --filter @game/storage run test
pnpm --filter @game/domain run typecheck
pnpm --filter @game/engine run typecheck
pnpm --filter @game/storage run typecheck
pnpm depcruise
git diff --check
graphify update .
```

## Manual Inspection

- Inspect fixed-seed examples for a knock, minor decision, forced injury,
  yellow, second yellow, and direct red.
- Confirm continuing a minor injury changes only later performance/risk.
- Commit a fixture and confirm return date, suspension, selection exclusion, and
  Posta facts survive a storage round trip exactly once.

## Completion Criteria

- Fouls, cards, injuries, and their match/career consequences are causal,
  deterministic, and fully typed.
- Selection and Posta consume the same durable availability facts.
- Storage round trips all new durable state without dead compatibility paths.
- No unsupported medical or competition system was introduced.
- Step 05 remains the only next implementation step.
