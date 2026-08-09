# Step 06C - Checkpoint B2: Conditioned Tactical Ceiling

## Status

Not started. Requires Step 06B/L5 `GO`; integrated L5 recorded `REFINE` on
2026-08-09. This is an observational locked checkpoint: it writes no gameplay
code and moves no target. Step 07 remains closed until this checkpoint records
`GO`.

## Why B2 Exists

Checkpoint B correctly measured the declared `207`-action space and rejected
it: an oracle free to choose formation, tactic and lateral focus found one
dominant `4-2-3-1|high_pressing|balanced` row and only two effective best
responses. The result remains immutable evidence.

That action space contradicted the MVP policy boundary already present in the
design thesis. A career AI does not receive all formations as opponent-specific
counter-moves: `selectCareerAiTeam(...)` first chooses its shape from its own
squad. B2 asks the narrower and product-correct question without weakening any
numeric target:

> Given the formation a real squad selects, can tactical plan and lateral focus
> create a material contextual benefit and a material mistake without a
> universal response?

## Frozen Population Before Step 06A Output

- Use the same seven Checkpoint A2 in-sample world seeds and the same seven
  out-of-sample world seeds; evaluate and decide each set separately.
- Within every world, include every generated domestic competition and every
  club selected through the canonical career AI path.
- The club's formation and XI are selected once from its own squad facts and
  remain fixed while tactical responses are enumerated.
- Opponent context may change only the analytic/replay response
  `tactic profile + lateralFocus`; it cannot choose a new formation.
- Tactic profiles remain exactly `high_pressing`, `direct_play` and `low_block`.
  Lateral focus remains exactly `balanced`, `left` and `right`.
- Formation-distribution and identity gates are evaluated per competition using
  the frozen Step 06A table. No pooling can turn a failed competition into a
  pass.
- Analytic and Monte Carlo workloads use exactly seven workers. Selection and
  replay streams remain disjoint and their prefixes are written before output.

## Phase 1 - Conditioned Analytic Gate

For every fixed own-squad formation and declared opponent context, enumerate
the nine legal tactical responses. Equivalence continues to use the existing
complete `opportunity-route-plan-bps-v1` evidence at basis-point precision; no
second signature or outcome-aware grouping is allowed.

Let:

```text
N_eff_response = distinct complete tactical-response signatures
R_response     = response signatures that are best in at least one context
p_max          = largest declared context share covered by one response
```

GO requires, separately in both seed sets:

- every Step 06A per-competition population gate passes;
- route-budget conservation has zero mismatches;
- `R_response / N_eff_response >= 0.25`;
- `best_response_ubiquity_multiple = p_max / (1 / N_eff_response) <= 4`;
- at least one material three-cycle exists in the conditioned tactical-response
  graph at the frozen `100 bp` arc;
- no tactical response is strictly above even in every effective context;
- left/right mirroring remains exact where the players and context are mirrored;
- all original `no_dominant_*` readers retain their populations, semantics and
  `0.55` threshold.

The diversity and ubiquity thresholds remain deliberately tangent. Report both
when either fails. With nine distinct response signatures the lower diversity
bound requires at least three best responses; it does not become permission for
one response to cover almost every real context.

If Phase 1 fails, Phase 2 is `not_run_by_protocol`. A transitively dominant
conditioned response is `STOP / RETHINK`; material reversals that miss coverage
or stability are `REFINE`, with ownership attributed to Step 05 or Step 06A.

## Phase 2 - Independent Replay

Only after Phase 1 passes, select at most `32` deterministic farthest-first
contexts from the complete conditioned population. The analytic oracle selects
best, exposed and context-free responses on one stream; an independent stream
replays the frozen choices. Formation, XI, player state and match seeds are
paired within each comparison.

Targets remain unchanged:

- `counter_move_ceiling >= +0.045`;
- `counter_move_exposure <= -0.045`;
- context-free `|delta| <= 0.015` with interval compatible with zero;
- `low_block` conceded-xG reduction `>= 0.08` and
  `ownLossPerConcededReduction <= 2.0`;
- the three original dominance gates remain `<= 0.55` through their original
  readers.

This is still an oracle ceiling, not an AI feature. The MVP AI does not consume
opponent facts in this step, and no oracle choice may enter production.

## Decision

- **GO:** both seed sets pass per-competition variety, conditioned analytic
  structure and independent replay. Step 07 opens.
- **REFINE:** the premise exists but its immediate owner fails. Reopen only
  Step 05 for route/tactic behaviour or Step 06A for per-league population;
  targets and seed sets do not move.
- **STOP / RETHINK:** even after formation is correctly conditioned on the
  squad, the tactical-response matrix remains transitive, a universal response
  survives, or replay cannot reproduce the selected ceiling.

## Expected Files

- `docs/audits/PHASE_81A_CHECKPOINT_B2_CONDITIONED_TACTICAL_CEILING.md` **(new)**
- `docs/audits/README.md`
- `packages/simulation-tools/src/tactical-agency/tactical-agency-audit.ts`
- `packages/simulation-tools/src/tactical-agency/tactical-agency-audit.test.ts`
- `packages/simulation-tools/src/index.ts`
- `apps/cli/src/commands/simulation-report/tactical-agency-section.ts`
- `apps/cli/src/commands/simulation-report/tactical-agency-structural-worker.ts`
- `apps/cli/src/commands/simulation-report/report-registry.ts`
- `apps/cli/src/commands/simulation-report/report-registry.test.ts`
- `apps/cli/src/commands/simulation-report/report-planner.test.ts`
- `packages/i18n/src/labels.ts`
- `docs/PROJECT_STATUS.md`
- this step document
- `07-player-task-execution.md`
- `README.md`

The Step 06 profile and audit remain available as the immutable combined-space
before-state. B2 must extend the canonical modular report without adding a
second CLI entrypoint or leaving a superseded producer, parser or formatter.

## Required Checks

Run the gate alone and capture its real exit code without a pipe:

```bash
nvm use 24
pnpm cli simulation-report --profile=phase81a-b2 --workers=7
pnpm check
git diff --check
graphify update .
```

## Definition Of Done

The report states the real per-competition population, fixed formation source,
complete conditioned response space, equivalence rule, seeds, actual seven
workers, analytic and replay decisions, and what the population cannot see. No
formation is selected as an opponent counter-move, no oracle enters production,
the old Step 06 evidence remains intact, and only a real `GO` opens Step 07.
