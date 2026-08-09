# Step 06B1 - Canonical Automated Match Progression And Substitutions

## Status

**Done (2026-08-08).** Automatic 90-minute AI fixtures now use one engine-owned
progressive runner with explicit controlled sides. The former second loop in
the live-match gate calls that runner too; played Matchday still automates only
the opponent.

Uncommitted prototype changes created before this rescope are not evidence.
Before adding code, inspect every existing hunk: retain it only if this step
owns it, otherwise leave it for its named later step. No unused export, partial
lifecycle or report field may survive the step.

## Goal

Make automatic career/report fixtures use the canonical progressive match
session and the existing in-game AI policy for both teams, producing accepted
substitutions and exact participation minutes from played facts.

## User-Facing Reason

A simulated season cannot tell a credible player story when every selected
starter is treated as a ninety-minute player. The same injury, dismissal,
condition, score and performance decisions available in a played match must
exist when the world advances automatically.

## Locked Product Decisions

- Automatic/background simulations automate both sides.
- A played match automates only the opponent. The manager's side remains manual
  unless a future explicit delegation feature is implemented.
- Reuse `applyProgressiveAiInGameDecisions(...)`; do not create a batch-only
  substitution policy.
- Competition substitution limits remain canonical. There is no hard minimum.

## What To Implement

1. Deepen one engine-owned progressive match runner so a caller can declare the
   AI-controlled sides explicitly.
2. Replace the automatic season's direct `simulateMatch(...)` path with that
   canonical runner.
3. Feed both automatic sides through the existing AI decision boundaries and
   accepted team-change command path.
4. Return the final match context, accepted substitutions, events and final
   minute from the same result; do not reconstruct any of them.
5. Build participation contributions from the accepted substitutions and final
   contexts already owned by the progressive session.
6. Preserve the existing played-match boundary proving the manager's side does
   not receive automatic commands.

## What NOT To Implement

- No fitness, recovery, age, injury-probability, development or retirement
  coefficient changes.
- No new report command, simulator or second minute loop.
- No opponent-aware pre-match tactical AI.
- No persistence/schema/beta reset.

## Expected Files

Accepted Amendment A2 was a documentation-only planning interposition before
implementation. It owns these already-written contract files in addition to the
runtime files below:

- `docs/audits/PHASE_81A_AVAILABILITY_AGING_AND_GENERATIONAL_RENEWAL_PREREQUISITE.md` **(new)**
- `docs/audits/PHASE_81A_CHECKPOINT_L1_LEAGUE_DIVERSITY_100X10.md`
- `docs/audits/PHASE_81A_CONTEXTUAL_TACTICAL_AGENCY_DESIGN_CONTRACT.md`
- `docs/audits/README.md`
- phase `README.md`
- `06b-checkpoint-l1-league-diversity-100x10.md`
- this step and Steps `06b2` through `06b8`, all created before gameplay work
  so their targets cannot be selected after seeing implementation output
- the superseded
  `06b1-canonical-season-availability-and-workload.md`, removed rather than
  retained beside the accepted split
- `docs/PROJECT_STATUS.md`

Runtime implementation scope:

- `packages/engine/src/match-engine/progressive-match-session.ts` and test, only
  if the canonical runner belongs beside the session state it advances.
- `packages/engine/src/team-selection/ai-in-game-decisions.ts` and test, only to
  expose a total both-side orchestration without changing the decision policy.
- `packages/engine/src/use-cases/simulate-season.ts`
- `packages/engine/src/use-cases/simulate-season.test.ts`
- `packages/engine/src/career/player-participation.ts`
- `packages/engine/src/career/player-participation.test.ts`
- `packages/engine/src/index.ts`
- `packages/simulation-tools/src/live-match/live-match-control-gate.ts`. It
  currently owns a second two-side minute loop; it must call the new canonical
  runner in this step or the project would retain two automated progression
  implementations.
- `apps/cli/src/commands/fake-season-input.ts` and
  `apps/cli/src/commands/simulation-report/career-world-facts.ts`. The engine
  cannot discover competition substitution rules, so its two application
  composition roots must pass the existing content-owned rules explicitly.
- `packages/simulation-tools/src/calibration-report.test.ts`,
  `packages/simulation-tools/src/long-run/long-runner.test.ts`, and
  `packages/simulation-tools/src/long-run/career-long-runner.test.ts`. Their
  synthetic `SimulateSeasonInput` builders must declare the same required
  competition rule contract; no production behavior is added there.
- `packages/simulation-tools/src/season-recap/season-recap.test.ts`. Its
  synthetic fixture-participation record must declare the newly required exact
  progression fact; the full typecheck found this missing caller after every
  runtime test had passed.

Graphify's affected set is a review list, not automatic scope. Any additional
file is added here with its ownership reason before editing.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run packages/engine/src/team-selection/ai-in-game-decisions.test.ts packages/engine/src/use-cases/simulate-season.test.ts packages/engine/src/career/player-participation.test.ts --maxWorkers=7
pnpm check
git diff --check
graphify update .
```

## Definition Of Done

Automatic fixtures and played fixtures share one progressive engine path;
automatic matches can change both teams while a played manager side remains
manual; exact minutes reconcile with accepted substitutions; the superseded
direct automatic path and any WIP residue are removed; no balance coefficient
moved; Step 06B2 is the only next action.

## Verification

- focused: `56` tests green with exactly `7` workers;
- full gate: `295` files, `2248` tests, `858` modules, `CHECK_EXIT=0`;
- the first full run found one test-only `exactOptionalPropertyTypes` error;
  the property is now omitted rather than assigned `undefined`, and the full
  gate was rerun from the beginning;
- automatic two-club evidence reconciles every appearance interval exactly;
  its total is `22 x 90 = 1980` only when no dismissal or injury leaves a side
  short, while both sides still emit accepted substitution facts;
- short analytical matches retain the same progressive minute owner but do not
  invent live-command phases outside the domain's regulation-minute contract.
