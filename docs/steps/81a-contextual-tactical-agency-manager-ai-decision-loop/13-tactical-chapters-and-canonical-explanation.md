# Step 13 - Tactical Chapters And Canonical Explanation

## Status

**Done.** Canonical full-time chapters now explain the kickoff state and every
accepted manager/AI change without claiming a causal point gain, guaranteed
superiority or an opponent-aware AI decision. Step 14 is next, subject to
Amendment A11's option-B boundary before its implementation starts.

## Goal

Explain what happened before and after each tactical decision using the same
facts consumed by the match, not a parallel explanation model.

## What To Implement

The production code settles a correction before implementation: flat
`AppliedLiveMatchCommandFact` values are returned by command validation, but the
progressive state currently retains only substitutions. A tactical delta also
cannot reconstruct a historical `MatchTeamContext` after later substitutions.
Do not pretend those facts already form a canonical timeline.

Retain accepted non-substitution command facts once in progressive state with
their manager/AI owner. Substitutions remain owned by their existing match
events and `appliedSubstitutions`; do not copy them into the new ledger. Derive
chapter boundaries from the union of those two existing fact families. A
command accepted at minute N starts the next chapter at N+1 and never rewrites
minute N.

Segment the match into kickoff, manager-change and AI-change chapters. Each
chapter owns a closed minute interval and derives shots, goals, summed xG,
average chance quality, attempted routes and scoring routes from the canonical
shot events already consumed by ratings and reports. The current engine emits
no per-minute possession/control fact, so this step does not invent one or
reverse-engineer control from the final aggregate. A later control chapter
requires its own raw minute fact, not a formula in presentation.

Derive chapter intervals, aggregates and localized explanation for the current
session from accepted tactical command facts, substitution events and canonical
shot facts. Do not copy chapter totals beside the facts that derive them.
Reconcile chapter goals and shots exactly with match totals. Replay event xG in
original order bit-exactly against telemetry; the sum of per-chapter xG may
differ only within `1e-12`, because regrouping floating-point additions by
chapter is not associative. Step 14 adds
the raw tactical-command facts to `MatchReport` and owns the one durable
persistence integration and reset.

Amendment A11 is binding: chapters describe observable football and accepted
decisions only. They never claim that a plan caused a point gain, was optimal,
or answered hidden opponent information.

Do not change storage schemas, envelope versions, or beta compatibility here.
Prove the same pre-phase career accepted by Step 10 still loads.

## Expected Files

- `packages/domain/src/match/match-consequence.ts`
- `packages/engine/src/match-engine/progressive-match-session.ts`
- `packages/engine/src/match-engine/progressive-match-session.test.ts`
- `packages/engine/src/match-engine/match-explanation-trace.ts`
- `packages/engine/src/match-engine/match-explanation-trace.test.ts`
- `packages/engine/src/match-engine/step-match.ts`. The chapter must read the
  resolver's canonical `expectedGoals`, not mislabel pre-shot `quality` as xG;
  penalty xG remains one exported engine constant rather than a second number.
- `packages/engine/src/match-engine/step-match.test.ts`
- `packages/engine/src/match-engine/simulate-match.test.ts`. The full-match
  golden owns the serialized sparse-event contract; its two unchanged shots
  now record the resolver-owned xG while score, RNG, actors and all previous
  fields stay pinned.
- `packages/engine/src/match-engine/index.ts`
- `packages/engine/src/match-engine/match-simulation-runner.ts`. A match without
  live commands still produces the single kickoff chapter from the same owner.
- `packages/engine/src/career/progress-fixture.ts`. The progressive web commit
  must attach the already-built trace; it may not resimulate the match.
- `packages/engine/src/career/progress-fixture.test.ts`
- `packages/engine/src/team-selection/ai-in-game-decisions.ts`. AI is the only
  owner that can label an accepted tactical fact as `ai`; inference from team
  side would confuse opponent AI with the manager's own future automation.
- `packages/engine/src/team-selection/ai-in-game-decisions.test.ts`
- `packages/ui/src/career/career-matchday-phase-view.ts`
- `packages/ui/src/career/career-matchday-phase-view.test.ts`
- `packages/ui/src/career/tactical-consequence-view.ts`
- `packages/ui/src/career/tactical-consequence-view.test.ts`
- `apps/web/src/features/matchday/career-matchday-presenter.ts`
- `apps/web/src/features/matchday/career-matchday-presenter.test.ts`
- `apps/web/src/features/matchday/MatchdayFullTimePhase.tsx`
- `apps/web/src/features/matchday/MatchdayFullTimePhase.test.tsx`
- `apps/web/src/features/matchday/matchday-adapter.ts`
- `apps/web/src/features/matchday/matchday-adapter.test.ts`
- `packages/i18n/src/labels.ts`
- `docs/PROJECT_STATUS.md`
- this phase `README.md`
- this step document
- `14-post-match-preparation-choice.md`

## Outcome

The progressive session retains accepted non-substitution tactical facts once,
with their explicit manager/AI owner. Substitutions remain canonical events.
The explanation trace combines those sources into closed chapters whose first
minute is the minute after a command took effect. A match without a command has
one kickoff chapter.

Chapter shots, goals and routes are read from the same sparse match events used
by ratings and reporting. The resolver now attaches canonical `expectedGoals`
to every ordinary and direct-free-kick shot event; penalties retain the single
engine-owned `PENALTY_EXPECTED_GOALS`. With telemetry present, a missing event
xG is an error rather than a presentation fallback. Goals and shots reconcile
exactly; event-order xG is bit-identical and chapter-regrouped xG stays within
`1e-12`.

The current-session full-time view renders localized, selected-club-oriented
chapters. Durable reports and save schemas remain unchanged: a reload therefore
does not fabricate historical chapters. Step 14 owns the single persistence
integration.

## Verification

- Focused engine/UI/web suite: `108/108` tests pass.
- Localized presentation check: `OK` in all five supported languages.
- Web production build: exit `0`.
- Isolated visual/accessibility QA: `38/38` pass in `7.2m`.
- The first visual-QA launch lost its terminal handle and overlapped a retry;
  both contaminated runs were terminated and excluded. The recorded result is
  the subsequent single isolated run.
- `pnpm check`, `git diff --check` and Graphify are the final closeout gates.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run packages/engine/src/match-engine/match-explanation-trace.test.ts
pnpm check
pnpm --filter @game/web run build
pnpm web:visual:qa
git diff --check
graphify update .
```

## Definition Of Done

Chapters reconcile goals/shots exactly and xG under the frozen event-order plus
`1e-12` regrouping rule, derive from canonical facts, contain
no rendered prose or causal point claims, remain temporally local, distinguish
manager from AI without inference, pass visual/accessibility QA, leave durable
persistence unchanged for Step 14, keep the pre-phase career loadable, and Step
14 is next. **Satisfied.**
