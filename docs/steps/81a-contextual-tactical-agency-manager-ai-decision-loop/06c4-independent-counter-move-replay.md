# Step 06C4 - Independent Counter-Move Replay

## Status

Active. Step 06C3 passed the complete conditioned analytic gate in both seed
sets. This step owns the required B2 Phase-2 replay; Step 07 remains closed.

## Goal

Test whether the analytic best and exposed contextual responses produce the
frozen positive and negative match effects on independent replay seeds, while
a context-free policy remains neutral.

## Frozen Protocol

Reuse the B2 protocol without changing any target:

- select at most `32` deterministic farthest-first contexts from the complete
  passing conditioned population, covering tactic profiles and lateral focus;
- record the context IDs and weights before replay output;
- select best, exposed and context-free policies through the analysis oracle on
  the declared selection stream;
- replay those frozen choices through the canonical match engine on the
  disjoint replay stream;
- keep formation, XI, player state and match seeds paired inside every
  comparison;
- cycle the context-free arm uniformly through all effective responses;
- shard independent replay work over exactly seven workers and restore
  canonical order before aggregation;
- keep the oracle inside analysis code. It must never enter manager or AI
  production paths.

The first implementation must run a small same-path preflight only to freeze
worker and wall-clock budgets. It may not change contexts, seeds, samples or
targets after output.

## Frozen Gates

Both seed sets must independently satisfy:

- `counter_move_ceiling >= +0.045`;
- `counter_move_exposure <= -0.045`;
- context-free `|delta| <= 0.015`, with its interval compatible with zero;
- low-block conceded-xG reduction `>= 0.08`;
- low-block `ownLossPerConcededReduction <= 2.0`;
- all three original `no_dominant_*` readers remain `<= 0.55` through their
  original populations and reader semantics;
- the complete analytic Phase-1 result and `21 / 21` population rows reproduce
  exactly before replay evidence is accepted.

`GO` opens Step 07. `REFINE` reopens only the measured Step 05 owner without
moving targets. `STOP / RETHINK` applies if independent replay cannot reproduce
the selected ceiling or if the oracle leaks into production.

## Expected Files

- `packages/simulation-tools/src/tactical-agency/tactical-agency-audit.ts` and
  test. The existing B2 result gains the frozen context selection and paired
  replay facts; no second analytic payoff or signature is allowed;
- `packages/simulation-tools/src/index.ts` if new public result types cross the
  package boundary;
- `apps/cli/src/commands/simulation-report/tactical-agency-section.ts` and test;
- `apps/cli/src/commands/simulation-report/tactical-agency-structural-worker.ts`
  and test if replay work extends the existing seven-worker boundary;
- `apps/cli/src/commands/simulation-report/report-registry.ts` and planner test
  only if the canonical B2 profile needs an explicit Phase-2 capability;
- `packages/i18n/src/labels.ts` only for newly rendered user-facing labels;
- `docs/audits/PHASE_81A_CHECKPOINT_B2_INDEPENDENT_REPLAY.md` **(new)**;
- `docs/audits/README.md`;
- `docs/PROJECT_STATUS.md`;
- this step document;
- `06c3-contextual-lateral-route-leverage.md`;
- `README.md`;
- `07-player-task-execution.md` only after a real `GO` changes its entry gate.

Any discovered file is added here with its ownership before editing.

## Required Checks

```bash
nvm use 24
pnpm cli simulation-report --profile=phase81a-b2 --workers=7 --format=json \
  --report-output=simulation-out/phase81a-checkpoint-b2-independent-replay.json
pnpm check
git diff --check
graphify update .
```

## Definition Of Done

The passing Phase-1 population reproduces, replay consumes independent seeds
through seven real workers, all three policy arms are paired and reported with
their uncertainty, every frozen replay and dominance gate is decided, and the
result explicitly opens or keeps closed Step 07.
