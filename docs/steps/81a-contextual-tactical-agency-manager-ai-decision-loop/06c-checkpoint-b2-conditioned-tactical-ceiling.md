# Step 06C - Checkpoint B2: Conditioned Tactical Ceiling

## Status

Done: `REFINE`. The conditioned graph has material local cycles and no universal
response, but the ubiquity multiple is `6.0026 / 6.3095` against `<= 4` and two
out-of-sample competitions exceed the local formation-concentration gate.
Phase 2 is `not_run_by_protocol`; Step 06C1 owns attribution and Step 07 remains
closed.

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

### Frozen context construction

Before any B2 output, the context unit is fixed as follows:

- each world is generated once and every domestic competition is traversed in
  canonical competition order;
- each club selects once through `selectCareerAiTeam(...)` for its first
  scheduled fixture; that one result supplies formation, XI, player state and
  intrinsic shape to every analytic response for the club;
- every first-round fixture becomes two directed club matchups, so every club
  appears exactly once as the responding side;
- each directed matchup is crossed with the opponent's nine declared tactical
  responses, and the responding club evaluates the same nine responses. The
  response labels are therefore the fixed `3 tactic x 3 lateralFocus` set while
  the declared contexts are real squad-shape matchup x opponent response;
- the Step 06A population table reads those same one-per-club selections. A
  club is not selected again for the population gate, and pooling cannot rescue
  a failed competition.

For the conditioned cycle gate, one directed real-shape matchup owns one `9 x
9` response graph. An arc is material at `>= 5,100 bp`; at least one such local
graph must contain a three-cycle. Arcs from different matchups may not be
stitched into a synthetic cycle. A response is universally dominant only when
it is strictly above even against every other effective response in every
directed real-shape matchup.

The mirror invariant horizontally mirrors both teams' complete capacity maps
through the domain's canonical capacity-mirror mapping and swaps only
`left/right` response focus; the analytic payoff must remain byte-identical.
The reverse venue direction is a separate real context, not a horizontal
mirror. The first preflight incorrectly compared those two and reported false
mirror mismatches; this definition was corrected before the retry and no gate,
seed or gameplay value moved.

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

A complete response signature is the ordered vector of the existing
`opportunity-route-plan-bps-v1` signature over every canonical declared
context. Best-response ties use the canonical `tactic|lateralFocus` ID after
equivalent vectors collapse. With `M` declared contexts,
`best_response_ubiquity_multiple = (maximumContextCount / M) /
(1 / N_eff_response)`; it is not the raw context count unless `M == N_eff`.

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
No replay producer or dormant selection seam is added after a Phase-1 failure.

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

## Result

The locked seven-worker report returned real exit `1` and `REFINE` on both seed
sets. Each set measured `378` directed real-shape matchups and `3,402` analytic
contexts. All nine response signatures remained distinct; three became best,
so diversity passed at `0.3333`. Conservation and horizontal mirroring had zero
mismatches, no response was universal, and `134 / 133` matchups contained a
material local cycle.

The failed gate is concentration. `high_pressing|balanced` covers `2,269` and
`2,385` contexts; the ubiquity multiple is `6.0026` and `6.3095`. Lateral focus
is almost absent from the winning set. Population passes `21 / 21` in-sample
and `19 / 21` out-of-sample. The two failures are `4-4-2 = 6 / 18` in Third
Division of out-of-sample world `002` and Second Division of world `006`; every
other local population fact holds.

The canonical artifact is
`simulation-out/phase81a-checkpoint-b2-conditioned-phase1.json`, SHA-256
`f0c57cc3f82cea3cfddf63b0b66a73c2f88ab185752a4f3a50df4d4dd91d2d75`.
The audit records the corrected mirror definition and the complete evidence.
No replay code was added after Phase 1 failed.

## Expected Files

- `docs/audits/PHASE_81A_CHECKPOINT_B2_CONDITIONED_TACTICAL_CEILING.md` **(new)**
- `docs/audits/README.md`
- `packages/simulation-tools/src/tactical-agency/tactical-agency-audit.ts`
- `packages/simulation-tools/src/tactical-agency/tactical-agency-audit.test.ts`
- `packages/simulation-tools/src/index.ts`
- `apps/cli/src/commands/simulation-report/league-diversity-gate.ts` and test
  **(new)**. Step 06A's opening per-competition thresholds currently live
  inline in `career-sections.ts`; B2 must extract and reuse that one evaluator,
  never copy the table;
- `apps/cli/src/commands/simulation-report/career-sections.ts` and test. They
  retain the existing L1 semantics while delegating the opening row to the
  extracted single owner;
- `apps/cli/src/commands/simulation-report/tactical-agency-world.ts` and test.
  This composition root is the only legal place to join generated identities,
  real fixtures and production AI selections across all three competitions;
- `apps/cli/src/commands/simulation-report/tactical-agency-section.ts`
- `apps/cli/src/commands/simulation-report/tactical-agency-structural-worker.ts`
- `apps/cli/src/commands/simulation-report/report-registry.ts`
- `apps/cli/src/commands/simulation-report/report-planner.test.ts`
- `packages/i18n/src/labels.ts`
- `docs/PROJECT_STATUS.md`
- this step document
- `07-player-task-execution.md`
- `06c1-conditioned-response-and-formation-concentration-attribution.md`
- `README.md`

The Step 06 profile and audit remain available as the immutable combined-space
before-state. B2 must extend the canonical modular report without adding a
second CLI entrypoint or leaving a superseded producer, parser or formatter.

## Required Checks

Run the gate alone and capture its real exit code without a pipe:

```bash
nvm use 24
pnpm cli simulation-report --profile=phase81a-b2 --workers=7 --format=json \
  --report-output=simulation-out/phase81a-checkpoint-b2-conditioned-phase1.json
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
