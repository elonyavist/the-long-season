# Step 06C4 - Independent Counter-Move Replay

## Status

Done: `REFINE`. Phase 1 and original dominance reproduce, but the independent
match effect is about one tenth of the frozen magnitude. Step 06C5 owns
selection-versus-materiality attribution; Step 07 remains closed.

## Goal

Test whether the analytic best and exposed contextual responses produce the
frozen positive and negative match effects on independent replay seeds, while
a context-free policy remains neutral.

## Frozen Protocol

Reuse the B2 protocol without changing any target:

- select at most `32` deterministic farthest-first directed contexts from the
  complete passing population as reciprocal matchup pairs. Start with one pair
  in each of the nine opponent tactic/focus strata, assign unsampled pairs only
  inside their stratum, and give both directions the same integer population
  weight. This preserves the context-free population's home/away balance;
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

The selection prefixes are
`phase81a-b2-selection-v1-0` / `phase81a-b2-selection-v1-1`; replay prefixes
are `phase81a-b2-replay-v1-0` / `phase81a-b2-replay-v1-1`; low-block prefixes
are `phase81a-b2-low-block-v1-0` / `phase81a-b2-low-block-v1-1`. They are
disjoint and frozen before checkpoint output.

The same-path preflight ran seven selected contexts through seven real workers:
`9,702` matches in `3,319.120167 ms`, real exit `0`. The complete two-set replay
contains `88,704` matches. Linear replay evidence is about `30.35 s`; the
declared gate budget is `10 minutes` to include world construction, complete
Phase 1, low-block readers, original dominance readers and orchestration. This
budget is frozen from throughput only; no preflight sporting result was read.

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
the selected ceiling or if the oracle leaks into production. Operationally,
if both the ceiling and exposure `95%` intervals include zero in either seed
set, the selected signal was not reproduced and the decision is `STOP /
RETHINK`; a directional non-zero effect that misses magnitude remains
`REFINE`.

## Instrument Correction Before Accepted Output

The first complete execution is not checkpoint evidence. It exposed two report
defects: elapsed time covered only Phase 1, and farthest-first sampled directed
rows independently, so the context-free population was not reciprocal even
though the complete population is. Its artifact SHA-256 was
`70b2b54fabf83993d0ef67ea89639742a6ab9f9a33cae5188003fe54ccda76a0`.

No gameplay value, seed count or target moved. The accepted retry pairs each
selected matchup direction, weights both directions equally inside each of the
nine pre-existing response strata, and measures the whole producer wall clock.
The exact interval interpretation of `STOP / RETHINK` above is also frozen
before that retry; it operationalizes the already-written “cannot reproduce”
rule rather than adding a new numeric target.

## Expected Files

- `packages/engine/src/match-engine/step-match.ts` and test. The canonical
  minute planner must consume one complete home/away lateral-focus input;
  ordinary callers continue to supply the explicit balanced pair until Step 14
  owns durable career preparation;
- `packages/engine/src/match-engine/progressive-match-session.ts` and test,
  `match-simulation-runner.ts`, `simulate-match.ts` and test. These files carry
  the same immutable focus pair through the existing minute runner; no replay-
  only match engine or optional guessed team field is allowed;
- `packages/engine/src/match-engine/simulate-match-with-manual-tactics.ts`.
  The existing specialized batch wrapper forwards the same typed focus pair;
  a wrapper that silently dropped it would make two canonical batch paths;
- `packages/engine/src/match-engine/match-explanation-trace.ts` and test. A
  traced replay must explain the focus it actually played rather than silently
  rebuilding `balanced`;
- `packages/engine/src/match-engine/index.ts`. The public complete focus-pair
  type crosses the package boundary once;
- `packages/simulation-tools/src/tactical-agency/tactical-agency-audit.ts` and
  test. The existing B2 result gains the frozen context selection and paired
  replay facts; no second analytic payoff or signature is allowed;
- `packages/simulation-tools/src/index.ts` if new public result types cross the
  package boundary;
- `apps/cli/src/commands/simulation-report/tactical-agency-section.ts` and test;
- `apps/cli/src/commands/simulation-report/tactical-agency-structural-worker.ts`
  and test. Replay extends the existing tagged seven-worker boundary rather
  than creating another worker entrypoint;
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

## Result

The corrected reciprocal retry completed `88,704` Monte Carlo matches through
seven replay workers. The whole producer took `677,885.253875 ms`; the
preflight-derived ten-minute budget was therefore too low by about `78 s`.
That is a throughput finding, not a correctness failure.

| set | ceiling | exposed | context-free | low-block exchange | decision |
|---|---:|---:|---:|---:|---|
| in-sample | `+0.00483` | `-0.00808` | `+0.00021` | `1.93969` | `REFINE` |
| out-of-sample | `+0.00797` | `-0.00509` | `-0.00379` | `2.17507` | `REFINE` |

Both context-free intervals contain zero. In-sample ceiling also includes zero,
while its exposure is directional; both out-of-sample effects are directional.
The predeclared STOP rule therefore does not apply: some replay signal exists,
but neither set approaches `+0.045 / -0.045`. The out-of-sample low-block cost
also misses `<= 2` while reduction remains healthy at `0.19076`.

Every structural guardrail remains intact: both Phase-1 sets pass with
`21/21` population rows, and the original composition, formation and tactic
dominance readers report `0.4062`, `0.5180` and `0.5141`, all below `0.55`.

The accepted artifact is
`simulation-out/phase81a-checkpoint-b2-independent-replay.json`, SHA-256
`abfd925d559eb83277f73f04a90db787340f226a939f516a3ec6bcb4df1be4e9`.
Selection tied at the top in `31/64` sampled contexts under the frozen eight
seed pairs. That is an attribution question, not permission to increase the
sample after seeing the result; Step 06C5 must measure whether the full replay
population contains a `±0.045` upper/lower bound before any correction.
