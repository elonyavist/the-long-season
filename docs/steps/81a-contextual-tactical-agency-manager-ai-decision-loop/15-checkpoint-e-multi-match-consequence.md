# Step 15 - Checkpoint E: Option-B Multi-Match Continuity

## Status

**Done: `GO`.** The targets below were frozen before the fresh population was
executed. Amendment A12 supersedes the former four-policy preparation
experiment; none of its thresholds is renamed as a pass. Step 16 is open.

## Goal

Prove that the accepted own-squad MVP stays coherent across repeated fixtures:
the AI selects from its own current footballers, reacts to live facts, rotates
through real load and unavailability, and writes enough raw truth for identical
post-match explanation after reload.

This checkpoint does not claim a post-match gameplay choice. Its absence is an
explicit MVP limitation.

## Frozen Population

Register one fresh locked profile:

- profile: `phase81a-e-option-b-continuity-7x2`;
- seed prefix: `phase81a-e-option-b-continuity-v1`;
- `7` generated career worlds, `2` complete seasons, all three divisions;
- exactly `7` workers, diagnostic detail, `formations` section;
- current canonical career producer, catalog AI and progressive automatic
  session for both sides;
- cache identity `facts-v1`, never an older L3 artifact.

The profile intentionally reuses the existing
`availability_aging_l3` evaluator. Its population and questions are exactly the
multi-fixture state changes option B depends on; copying that evaluator into an
E-specific reader would create two definitions of the same lifecycle truth.

## Frozen Gates

### Multi-match product behavior

- the reused L3 checkpoint returns `GO` under its unchanged bands:
  `20..50` time-loss injuries per `1000` player-match hours, mean substitutions
  `3.5..4.9`, median first substitution minute `50..70`;
- unavailable selected players, missing lifecycle diagnostics, consequence
  mismatch, minute/lineup/event reconciliation, competition-limit violations,
  missing selection source/stable ID and catalog fallback are all exactly `0`;
- carried formation/role diversity and recovery bounds remain green;
- every product live reason is observed positively in the pooled population:
  `forced_injury_replacement`, `dismissal_reorganization`, `low_condition`,
  `poor_performance`, `trailing_response`, `protecting_lead`,
  `no_legal_substitute`, and `no_material_change`;
- `command_rejected` remains exactly `0`. A rejected command is a structural
  mismatch, not a required football story.

### Information and persistence invariants

- changing only the opponent identity leaves the complete pre-match AI
  selection unchanged: formation, XI, bench, tactic and focus;
- production selection has no formation-history or `OpponentRead` input;
- committed match reports retain exact kickoff formation/focus, ordered
  accepted tactical commands and resolver-owned shot xG;
- JSON, real SQLite and web runtime reload preserve those facts exactly;
- `createMatchTacticalChaptersFromReport(...)` produces the same chapters from
  the reloaded report; no persisted chapter aggregate exists;
- match score, event order and RNG consumption remain unchanged by explanation
  and persistence;
- Step 14 remains the phase's only storage schema/event-envelope reset.

The first block is measured by the locked report. The second block is proven by
the focused current production tests and graph inspection already owning those
boundaries. Tests are evidence in this checkpoint, not a second report or a
hand-built simulation population.

## Expected Files

- `apps/cli/src/commands/simulation-report/report-registry.ts`; add the locked
  fresh profile by reusing the one canonical L3 evaluator.
- `apps/cli/src/commands/simulation-report/report-planner.test.ts`; pin profile,
  population, seeds, included section and seven-worker contract.
- `packages/engine/src/career/progress-fixture.test.ts`; strengthen the existing
  real-squad opponent-identity counterfactual to compare the complete selection.
- `docs/audits/PHASE_81A_CHECKPOINT_E_OPTION_B_CONTINUITY.md` **(new)**.
- `docs/audits/README.md`.
- `docs/PROJECT_STATUS.md`.
- this phase `README.md`.
- this step document.
- `16-integrated-cohort-and-phase-closeout.md` if E changes its entry gate.

No gameplay, domain, storage schema, web product, threshold, recovery,
development or `OpponentRead` implementation is in scope.

## Required Checks

Run the checkpoint alone, then the focused and repository gates alone:

```bash
nvm use 24.16.0
pnpm cli simulation-report --profile=phase81a-e-option-b-continuity-7x2 --workers=7 --format=json --report-output=simulation-out/phase81a-e-option-b-continuity-7x2.json
pnpm exec vitest run packages/engine/src/career/progress-fixture.test.ts packages/engine/src/match-engine/create-match-report.test.ts packages/engine/src/match-engine/match-explanation-trace.test.ts packages/storage/src/sqlite/world-state-mapper.test.ts packages/storage/src/json-career-storage.test.ts apps/web/src/runtime/web-career-runtime.test.ts --maxWorkers=7
pnpm check
git diff --check
graphify update .
```

## Decision

- **GO:** every frozen behavior and persistence gate holds; open Step 16.
- **REFINE:** a lifecycle/live failure reopens its existing owner; a
  persistence/chapter failure reopens Step 14. Repeat E after the local fix.
- **STOP / RETHINK:** option B requires opponent information, a second
  simulator, duplicated lifecycle truth or another storage reset to remain
  coherent. Do not open Step 16.

## Definition Of Done

The report records the exact population, workers, wall clock, calibration
versions, reason counts and decision. Focused storage tests cover the current
schema, no obsolete preparation gate is hidden, and no code exists solely to
make the checkpoint pass.

## Outcome

The isolated report exited `0` over `25,704` team-matches. Time-loss incidence
was `21.9529/1000h`, mean substitutions `4.4007`, and the first substitution
median `60`; every carried lifecycle, diversity and reconciliation gate held.
All eight product live reasons were positive while `command_rejected` stayed
zero. The maximum modal formation share was `0.2222` across `42` green
competition-seasons, with no catalog fallback, unavailable selection, missing
source or missing ID.

The opponent-identity counterfactual now compares the complete AI selection and
passes. Focused persistence/reload suites pass `89/89`. The complete evidence,
population limitation and report hash are recorded in
`PHASE_81A_CHECKPOINT_E_OPTION_B_CONTINUITY.md`.

## Verification

- locked report: exit `0`, decision `PASS`, seven fresh `facts-v1` shards;
- profile/opponent-invariance tests: `79/79`;
- focused persistence/reload tests: `89/89`;
- `pnpm check`: exit `0`, `317` files / `2545` tests, `902` modules with no
  dependency violations, typecheck and all custom checks green;
- `git diff --check`: green; `PROJECT_STATUS.md`: `299` lines;
- Graphify: `24,830` nodes / `47,426` edges.

Step 16 is the next action.
