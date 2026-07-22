# Step 10 - Durable Match Plan And Fixture Eligibility Separation

## Status

Done.

## Goal

Separate the manager's durable selected plan from current-fixture eligibility
so injury and suspension remain visible without being silently edited.

## User-Visible Outcome

The last XI, bench, formation, roles, and tactic return for the next match.
Unavailable selected players stay in place with a clear warning until the
manager replaces them.

## Scope

1. Define the durable-plan invariant separately from kickoff eligibility.
2. Allow an owned injured or suspended player to remain in XI or bench state.
3. Reject save-to-match/start-match when selected players are ineligible for
   that fixture.
4. Preserve exact plan state after full time and through reload.
5. Remove a player from the plan only when ownership ends or the manager acts.
6. Re-enable eligibility automatically when injury/ban facts clear, without
   mutating the plan.
7. Return structured blockers identifying player and reason.
8. Delete the current hidden unavailable-player reconciliation behavior after
   every caller moves.

## Implementation Contract

- Plan validity answers ownership, duplicate, slot, XI, bench, formation, and
  tactic questions.
- Fixture eligibility answers injury, suspension, dismissal residue, and other
  current competition restrictions.
- UI never owns eligibility rules.
- No manager selection is changed by Continue, recovery, or page navigation.

## Expected Files

- `packages/domain/src/state/career-state.ts`
- focused career-state tests
- `packages/domain/src/career/player-availability.ts`
- focused availability tests
- current engine preparation/readiness/match-entry Modules/tests
- current full-time commit Modules/tests
- `apps/web/src/features/match-preparation/match-preparation-adapter.ts`
- focused web preparation/career-loop tests
- current tactical-board state adapters/tests only where plan ownership moves
- `docs/audits/SENIOR_SQUAD_CONTRACTS_AND_FINANCE_REPORT.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What NOT To Implement

- No automatic replacement, auto-selection, injury removal, suspension
  removal, or plan reset.
- No Squad table or player profile yet.
- No competition rule duplicated in web code.

## Required Checks

```bash
nvm use 24
pnpm --filter @game/domain run test
pnpm --filter @game/engine run test
pnpm --filter @game/web run test
pnpm --filter @game/web run typecheck
pnpm depcruise
pnpm check
git diff --check
graphify update .
```

## Manual Inspection

- Finish a match, advance to the next fixture, and confirm the same plan is
  present.
- Injure and suspend selected players, confirm they remain selected, and prove
  kickoff blocks until an explicit manager change.

## Completion Criteria

- Durable plan and fixture eligibility have separate tested owners.
- No hidden selected-player reconciliation remains.
- Match entry cannot accept an ineligible XI.
- Step 11 remains the only next implementation step.

## Adopted Solution

- Durable preparation validates ownership, XI/bench uniqueness, formation,
  roles, tactic, and slot coherence without treating temporary availability as
  manager intent.
- One domain availability query returns stable structured blockers with the
  exact player and `injured` or `suspended` reason for the next fixture.
- Preparation and direct Matchday entry consume that engine-owned query. They
  preserve the selected player, block confirmation or kickoff, and expose the
  reason without duplicating competition rules in React.
- Explicit `Auto` and `Fill gaps` actions skip unavailable candidates, but no
  navigation, recovery, Continue, reload, or full-time transition edits the
  current plan.

## Verification Result

- Node 24 domain, engine, and web suites pass; the web suite passes `60` files
  and `265` tests.
- Focused durable-plan, eligibility, preparation, direct-kickoff, and runtime
  coverage passes `92` tests.
- Full `pnpm check` passes `199` files and `1,185` tests.
- Dependency-cruiser passes with `602` modules and `2,221` dependencies.
- Web typecheck, `git diff --check`, and `graphify update .` pass.

## Lesson Learned

Plan validity and fixture eligibility answer different questions. Combining
them caused temporary football facts to overwrite the manager's durable
decision. Keeping the plan immutable until an explicit manager action also
makes recovery automatic: when the injury or ban clears, the blocker simply
disappears without another state transition.
