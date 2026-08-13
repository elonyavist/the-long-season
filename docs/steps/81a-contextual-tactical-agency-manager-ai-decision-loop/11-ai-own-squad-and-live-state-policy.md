# Step 11 - AI Own-Squad And Live-State Policy

## Status

Ready after Step 10.

## Goal

Let every AI club choose a pre-match tactic and lateral focus that fit its own
selected players and current state, then use the existing bounded live policy
for injuries, condition, performance, score and dismissals. No opponent oracle,
formation bonus or second match loop.

## What To Implement

- Move the three shipped manager tactic profiles (`balanced`, `attacking`,
  `defensive`) out of the web adapter into the versioned match-tactics content
  asset. Content owns profile values and own-capacity demand weights once; web,
  career AI and reports all read that owner. Remove the old web table in the same
  change.
- Add a pure `evaluateOwnSquadTacticalPolicies(...)` in engine. Its candidates
  are the selected shape's tactic profiles crossed with all three
  `LATERAL_FOCUSES`. It reads only the already-derived twelve capacities and
  current team state. A content row of non-negative demand weights must conserve
  exactly `10,000` basis points per profile; focus scoring derives from the
  canonical left/right capacities and owns no second route mapping.
- "Current state" means only effects active in the canonical derived capacities
  (currently fitness). Do not let the AI read raw form or morale while those
  facts are neutral in match strength: that would optimize a signal the match
  does not consume. The evaluator contract remains ready for them when a
  separately calibrated content curve activates them.
- Score fit, not predicted result. The evaluator returns all candidate facts,
  the strict maximum, strict minimum, non-commitment and stable blind candidate.
  Stable complete-policy ID is the final tie-break. Catalog order must not decide
  a unique result; ties are explicit telemetry.
- Extend `CareerAiTeamSelection` with one selected tactical-policy fact consumed
  by both background fixtures and web opponents. The shape and XI continue to
  come from `buildAiSquadMatchTeamContext(...)`; the policy evaluator runs only
  after that canonical choice and cannot rescore player strength.
- Do not add an opponent argument to the evaluator. Tests prove replacing the
  opponent with any formation/tactic leaves the policy byte-identical.
- Reuse `selectAiInGameDecision(...)`, `applyProgressiveAiInGameDecisions(...)`
  and the canonical live-command path. Do not duplicate score, injury,
  substitution or dismissal logic.
- Supply deterministic canonical formation options for
  `chase_match`, `protect_lead` and `recover_after_dismissal` from the same
  available on-pitch players. Choose only positionally credible shapes; absence
  of a credible option means tactic/substitution-only response, never a forced
  malformed formation.
- Automatic matches and web opponents must consume the same pre-match policy and
  live options. Manager-controlled sides remain manual.
- Keep `lateralFocus` in-memory until Step 14. Thread it explicitly through the
  match runner; no implicit balanced fallback is allowed after a policy selected
  left or right.
- Every policy profile/focus, all four checkpoint arms and every live reason key
  must be reached by real generated data. A fixture constructed solely to hit a
  branch does not satisfy reachability.

## Expected Files

- `packages/domain/src/balance/match-tactics-calibration.ts`
- `packages/domain/src/balance/match-tactics-calibration.test.ts`
- `packages/content/src/balance/match-tactics-calibration.json`
- `packages/content/src/balance/match-tactics-calibration.ts`
- `packages/content/src/balance/match-tactics-calibration.test.ts`
- `packages/content/src/schemas/match-tactics-calibration.schema.ts`
- `packages/content/src/schemas/match-tactics-calibration.schema.test.ts`
- `packages/engine/src/team-selection/own-squad-tactical-policy.ts` **(new)**
- `packages/engine/src/team-selection/own-squad-tactical-policy.test.ts` **(new)**
- `packages/engine/src/team-selection/shape-tactical-distribution.ts`
- `packages/engine/src/team-selection/shape-tactical-distribution.test.ts`
- `packages/engine/src/team-selection/ai-in-game-decisions.ts`
- `packages/engine/src/team-selection/ai-in-game-decisions.test.ts`
- `packages/engine/src/career/career-ai-team-selection.ts`
- `packages/engine/src/career/career-ai-team-selection.test.ts`
- `packages/engine/src/career/progress-fixture.ts`
- `packages/engine/src/career/progress-fixture.test.ts`
- `packages/engine/src/match-engine/progressive-match-session.ts`
- `packages/engine/src/match-engine/progressive-match-session.test.ts`
- `packages/engine/src/team-selection/index.ts`
- `packages/engine/src/index.ts`
- `apps/web/src/features/match-preparation/match-preparation-adapter.ts`
- `apps/web/src/features/match-preparation/match-preparation-adapter.test.ts`
- `apps/web/src/features/matchday/matchday-adapter.ts`
- `apps/web/src/features/matchday/matchday-adapter.test.ts`
- `packages/i18n/src/labels.ts`
- `docs/PROJECT_STATUS.md`
- this step document
- `12-checkpoint-d-own-squad-agency.md`

Discovered files enter this list with ownership before modification. Storage and
career schema files are explicitly outside scope.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/engine/src/team-selection/own-squad-tactical-policy.test.ts \
  packages/engine/src/team-selection/ai-in-game-decisions.test.ts \
  packages/engine/src/career/career-ai-team-selection.test.ts \
  packages/engine/src/career/progress-fixture.test.ts \
  apps/web/src/features/matchday/matchday-adapter.test.ts
pnpm check
pnpm --filter @game/web run build
pnpm web:visual:qa
git diff --check
graphify update .
```

## Definition Of Done

One versioned profile owner feeds manager, AI and reports; policy depends only
on own players/state, all branches are reachable, background and web use the
same pre-match and live seams, focus reaches the minute loop, no strength/result
bonus or persistence change exists, and Checkpoint D is next.
