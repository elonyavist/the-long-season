# Step 11 - AI Own-Squad And Live-State Policy

## Status

**Done - 2026-08-13.** The locked `7 x 1` real-career gate recorded `GO` with
exactly `7` workers. Step 12 is open.

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
- `packages/domain/src/tactics/formations.ts`. Owns the canonical slot geometry
  consumed by both engine live-shape options and the web board; keeping a web
  copy would let the two paths disagree.
- `packages/domain/src/tactics/formations.test.ts`. Proves every shipped slot is
  covered by that total geometry mapping.
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
- `packages/engine/src/test-fixtures/match-tactics-calibration.ts`. Its valid
  calibration literal must include the new required policy section.
- `packages/engine/src/use-cases/simulate-season.ts`. Automatic fixtures derive
  and pass each selected side's own lateral focus into the minute loop.
- `packages/engine/src/use-cases/simulate-season.test.ts`. Proves a catalog AI
  consumes its own selected tactic/focus while a deliberately imposed analysis
  shape retains the caller's fixed tactic and balanced focus.
- `packages/simulation-tools/src/live-match/live-match-control-gate.ts`. Its
  explicit analysis fixture supplies the focus pair now required by the runner.
- `packages/simulation-tools/src/tactical-agency/tactical-agency-audit.ts`
- `packages/simulation-tools/src/tactical-agency/tactical-agency-audit.test.ts`.
  The canonical selection observation carries the evaluator result instead of
  rebuilding policy candidates in a report.
- `packages/simulation-tools/src/season-recap/season-recap.test.ts`. Its fielded
  team fixture must name the newly retained kickoff focus explicitly.
- `packages/simulation-tools/src/test-fixtures/match-tactics-calibration.ts`.
  Its intentionally local valid fixture must satisfy the new schema.
- `apps/cli/src/commands/career/progression.ts`. Deletes the caller-owned
  balanced tactic copy and consumes the selected AI context.
- `apps/cli/src/commands/simulation-report/actor-allocation-reachability.test.ts`.
  Removes the obsolete caller-owned tactic field from a real-data fixture.
- `apps/cli/src/commands/simulation-report/tactical-agency-world.ts`
- `apps/cli/src/commands/simulation-report/tactical-agency-world.test.ts`. The
  existing real-career population is the reachability proof for all profile and
  focus choices; it observes the production selector once per club.
- `apps/cli/src/commands/simulation-report/career-sections.ts`
- `apps/cli/src/commands/simulation-report/career-sections.test.ts`. Formation
  rows now retain the observed kickoff focus beside shape and tactic instead of
  claiming that a fact emitted by the engine was not observed.
- `apps/web/src/features/match-preparation/match-preparation-adapter.ts`
- `apps/web/src/features/match-preparation/match-preparation-adapter.test.ts`
- `apps/web/src/features/matchday/matchday-adapter.ts`
- `apps/web/src/features/matchday/matchday-adapter.test.ts`
- `apps/web/src/features/tactics-board/tactical-board-formations.ts`. Deletes
  the web-owned coordinate table in favour of the domain owner.
- `packages/ui/src/index.ts`. Re-exports canonical slot geometry to web without
  crossing the app package boundary.
- `packages/i18n/src/labels.ts`
- `docs/PROJECT_STATUS.md`
- the phase `README.md`. Advances the ordered-step handoff from Step 11 to the
  now-open Checkpoint D after the implementation gate is green.
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

## Outcome

- Match-tactics content v10 is the single owner of the three manager/AI
  profiles, twelve-capacity demand rows, and the two minimum own-fit advantages
  required before abandoning a balanced profile or focus. Those advantages are
  decision thresholds, never strength or result bonuses.
- `evaluateOwnSquadTacticalPolicies(...)` emits the complete nine-candidate
  evaluation once. Career selection owns the chosen tactic and focus; automatic
  season, selected-club fixture and web-opponent paths consume that fact without
  reading an opponent or rebuilding alternatives.
- The web-owned profile and formation-coordinate tables and the old
  shape-derived tactical distribution were deleted. Domain now owns total slot
  geometry, and engine owns one pure own-squad evaluator.
- Live formation options derive lazily from the current on-pitch eleven at each
  decision boundary. They preserve the current goalkeeper slot and disappear
  when no credible XI exists; no stale pre-match option can be submitted after
  an earlier substitution or dismissal.
- The locked report observed `12,852` team-matches: profile counts
  `6117/2695/4040` for attacking/balanced/defensive and focus counts
  `768/10651/1433` for left/balanced/right. All four comparison candidates are
  present in every canonical evaluation. Live reason counts were positive for
  dismissal (`1421`), forced injury (`1930`), low condition (`52200`), poor
  performance (`294`), lead protection (`14242`) and trailing response
  (`23954`); accepted live commands had `0` rejections.
- The same gate retained `4.2871` substitutions per team-match, median first
  substitution minute `60`, zero reconciliation/limit/invalid-minute failures,
  and the carried league-diversity `GO`.
- `pnpm check` passed `315` files / `2526` tests, the web build passed, and the
  complete visual QA passed `38/38`. No storage or beta version changed; Step 14
  remains the sole persistence owner.
