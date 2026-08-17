# Step 16 - Integrated Cohort And Phase Closeout

## Status

**Done: Checkpoint F `GO`.** The option-B evidence lanes and every final
repository/browser gate are green. Phase 81B Step 01 is ready and not started.

## Goal

Close Phase 81A against the product that actually exists after Amendments A11
and A12. The closeout integrates canonical evidence; it does not invent a new
`phase81a-f` evaluator, relabel historical failures, or use final output to
choose another coefficient.

Phase 81C Step 07 still owns the `750 x 10` world-integrity run. Complete
background standings and the final inspection HTML do not exist until that
phase implements background fixtures.

## Correction Before Execution

The earlier version named a `phase81a-f` profile that does not exist in
`report-registry.ts` and repeated final gates superseded by A11/A12. Creating a
profile merely to concatenate existing readers would duplicate report
ownership. The corrected closeout therefore uses three independent evidence
lanes:

1. run the canonical `phase81-tactical-shape` profile for current conservation
   and the three original dominance readers;
2. rebuild the fresh, locked
   `phase81a-e-option-b-continuity-7x2` report from its seven canonical shards
   and require byte identity with Checkpoint E;
3. integrate, without rerunning or reinterpreting, the fresh paired L6.31
   `7 x 10` in-sample and out-of-sample renewal evidence and Step 14's exact
   persistence evidence.

This method is frozen before Step 16 output. The tactical-shape profile is a
single indivisible analytic job and therefore correctly uses one worker. The
career checkpoint uses exactly seven workers. No empty work is created to make
the analytic job display seven.

## Evidence Populations

| Lane | Population | What it can establish | What it cannot establish |
| --- | --- | --- | --- |
| tactical shape | canonical analytic matrix, one deterministic job | conservation and the frozen Phase 81 dominance invariants | human enjoyment or career AI behaviour |
| option-B continuity | fresh `7` worlds x `2` seasons, three divisions, `25,704` team-matches, exactly `7` workers | own-squad/opponent-blind selection, live reactions, availability, rotation, formation retention and report reconciliation | post-match gameplay preparation or subjective fun |
| renewal | paired current-engine L6.31 control/candidate, in-sample and OOS, `7 x 10` per arm | stationary youth runway, ready replacements and generated leaders | Phase 81B player model or Phase 81C contracts/background fixtures |
| persistence | focused JSON, SQLite and web-runtime round trips on current schema | exact durable tactical facts and chapters | old beta-save compatibility, which is intentionally unsupported |

The Step 16 acceptance population was not used to choose gameplay values. The
E seed prefix is fresh and its JSON was written before this closeout protocol;
the rebuild is a determinism check, not a new calibration sample.

## Final Gates

### Required Green

- exact tactical contribution conservation;
- the original `no_dominant_composition`, `no_dominant_tactic` and
  `no_dominant_formation` readers retain their Phase 81 semantics and `0.55`
  ceiling;
- the locked E profile returns `PASS`, reports effective worker count `7`, and
  rebuilds byte-identically from its canonical shards;
- no pre-match opponent reader, formation-history reader or fixed-formation
  fallback enters AI selection;
- every accepted live reason remains reachable, accepted command rejection is
  zero, and all availability/substitution/reconciliation gates remain green;
- the L6.31 paired evidence remains the current integrated baseline: no new
  red, exact immediate purity, stationary-ready delta `>= +0.08` and
  generated-leader delta `>= +0.03` in both seed sets;
- Step 14 remains the only Phase 81A storage/event-envelope beta reset, and
  current-schema JSON, real SQLite and web-runtime round trips are exact;
- repository, dependency, localization, single-report-entrypoint, web build and
  visual QA gates pass.

### Required Honest Limitations

- Checkpoint B's original structural response-diversity and ubiquity gates stay
  failed historical evidence; they are not nested failures of the accepted
  option-B product and are not reported as green;
- the historical `+0.045/-0.045` tactical season-point materiality target stays
  withdrawn. A11 accepts a smaller own-squad effect and no final report may
  rename it as the original effect;
- A12 records post-match preparation as `not_implemented_in_mvp`, not passed;
- pre-match AI is deliberately opponent-blind. A future opponent-aware feature
  requires manager-visible information latency and AI/manager parity;
- Phase 81C owns background fixtures, season-anchored contracts and the
  `750 x 10` world-integrity view.

## Expected Files

- `docs/audits/PHASE_81A_INTEGRATED_COHORT.md` **(new)**.
- `docs/audits/PHASE_81A_CONTEXTUAL_TACTICAL_AGENCY_REPORT.md` **(new)**.
- `docs/audits/README.md`.
- `docs/PROJECT_STATUS.md`.
- `docs/steps/README.md`.
- `docs/roadmaps/CAREER_PLAYABILITY_AND_ENGINE_ROADMAP.md`.
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`.
- this phase `README.md`.
- this step document.
- `../81c-season-clock-contracts-and-complete-domestic-world/README.md`.

No production or report-registry file belongs to this evidence-only step. A
failed current reader reopens its existing owner instead of being patched here.

## Required Checks

Run every gate alone:

```bash
nvm use 24.16.0
pnpm cli simulation-report --profile=phase81-tactical-shape --format=json --report-output=simulation-out/phase81a-f-tactical-shape.json
pnpm cli simulation-report --profile=phase81a-e-option-b-continuity-7x2 --workers=7 --format=json --report-output=simulation-out/phase81a-f-option-b-closeout.json
cmp simulation-out/phase81a-e-option-b-continuity-7x2.json simulation-out/phase81a-f-option-b-closeout.json
pnpm check
pnpm --filter @game/web run build
pnpm web:visual:qa
pnpm depcruise
git diff --check
graphify update .
```

## Decision

- **GO:** all required-green gates pass, every accepted limitation is explicit,
  Phase 81A closes and Phase 81B Step 01 becomes the only next action.
- **REFINE:** reopen only the current owner named by a failed reader, repeat its
  checkpoint, then repeat this closeout.
- **STOP / RETHINK:** record a systemic regression or an option-B contract
  violation; do not create a new evaluator or relax a historical threshold.

## Definition Of Done

Both reports identify every evidence population and blind spot, current
artifacts reconcile, no stale phase status or dead reporting path remains,
`PROJECT_STATUS.md` stays at or below `300` lines, and Phase 81B is marked ready
but is not started.

## Outcome

- canonical tactical-shape profile: `PASS`, report hash
  `8f9c47610a59aea2a6a641d92363a81a`; all eight invariants green and the three
  dominance readers observe `0.4062`, `0.5180`, `0.5141` against `0.55`;
- locked option-B `7 x 2`: exit `0`, effective workers `7`, report `PASS`, hash
  `3bd5cc6f8ae576eaf875fb2d494541a8`, byte-identical to Checkpoint E;
- L6.31 current-engine pairs retain ready-replacement deltas
  `+0.1106/+0.1057` and generated-leader deltas `+0.0690/+0.0500` with no new
  integrated red;
- `pnpm check`: `317/317` files and `2545/2545` tests, all custom checks and
  typechecks green;
- web production build: green, `2537` modules transformed;
- visual QA: one reduced-motion timing assertion failed in the first serial run,
  passed alone, then the complete unchanged suite passed `38/38` in `7.3m`;
- `pnpm depcruise`, `git diff --check`, local link verification and Graphify:
  green; `PROJECT_STATUS.md` is `283` lines before the final verification note.

The final reports are
`PHASE_81A_INTEGRATED_COHORT.md` and
`PHASE_81A_CONTEXTUAL_TACTICAL_AGENCY_REPORT.md`. Historical Checkpoint B and
season-point materiality failures remain visible limitations; post-match
gameplay preparation remains `not_implemented_in_mvp`.
