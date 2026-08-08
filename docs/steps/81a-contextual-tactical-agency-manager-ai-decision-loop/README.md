# Phase 81A - Contextual Tactical Agency, Manager And AI Decision Loop

## Status

**Active.** Steps 01-03C are Done; Checkpoint U1 recorded `GO`. Step 03D is the
only next action. Phase 81 is Done and Phase 81A remains the only active phase.

This phase is governed by
[`PHASE_81A_CONTEXTUAL_TACTICAL_AGENCY_DESIGN_CONTRACT.md`](../../audits/PHASE_81A_CONTEXTUAL_TACTICAL_AGENCY_DESIGN_CONTRACT.md).
That contract owns the thesis, target values, measurement protocol, analytic
definitions, and rejected alternatives. Step documents own only their local
Implementation and handoff.

The phase previously numbered 81A is now Phase 81B under
[`81b-season-anchored-contracts-free-agent-economy-and-background-fixtures`](../81b-season-anchored-contracts-free-agent-economy-and-background-fixtures/README.md).
No market, contract, free-agent, background-fixture, or simulate-match work moved
into this phase.

## User-Facing Goal

Make tactical decisions capable of helping or hurting because they fit the
available players and exploit or expose something in the opponent. The manager
and AI must be able to read the same evidence, choose correctly or incorrectly,
and understand the consequence without any formation or tactic being best by
definition.

## Entry Gate

- Phase 81 is Done and its report is the immutable before-state.
- The carried goal-rate monitor is closed and is not reopened here.
- Step 14's formation counter-move result is withdrawn, not deferred:
  `0.0064/0.0117` against a `0.0295` floor.
- The three frozen `no_dominant_*` gates retain their original readers and
  `0.55` threshold.
- Phase 81B, 82A and 82B are not started.
- Phase 79 Steps 14-15 remain Reopened, paused, and unclaimed.

## Locked Product Contract

- `TeamStrength` remains player quality. Tactical choices never add a direct
  strength or result bonus.
- Correct contextual choice targets `+0.045` win share; clearly wrong choice
  targets `-0.045`; context-free/non-commitment targets expected delta `0` with
  operational tolerance `|delta| <= 0.015`.
- Phase 81A first proves `counter_move_ceiling` with an analysis oracle, then
  separately proves `realized_manager_agency` through observable information.
- AI formation remains selected from its own squad. Opponent context changes the
  tactical plan first; this temporary policy asymmetry receives an exploit gate.
- Manager and AI consume the same `OpponentRead` Interface with the same facts
  and latency. AI has no future or hidden match-state access.
- `lateralFocus = balanced | left | right` is the single owner of lateral
  commitment. Formation remains geometry; players own execution.
- Post-match choice affects only the next match: marginal recovery, plan
  rehearsal, or opponent study, with one priority excluding the other two.
- Facts are persisted once; summaries, advice, and prose are derived.
- Phase 81A takes exactly one incompatible beta reset, in Step 14 after every
  persisted consumer exists. Steps 05, 10, and 13 build canonical in-memory and
  `MatchReport` facts but do not advance storage versions independently.
- No runtime LLM, autonomous per-player agent, direct formation bonus, generic
  strategy registry, or second match engine.

## Measurement Contract

Every checkpoint declares before execution:

- exact code state and included steps;
- population, denominator, seed prefixes, selection/replay separation;
- metrics, intervals, GO/REFINE/STOP rules;
- throughput, worker count, match count, and wall-clock estimate;
- report destination.

Gates run alone. Every checkpoint command A-F uses exactly `7` workers for its
multi-work-item analytic and Monte Carlo workloads; the report records `7` and
the command rejects any other checkpoint worker count. Selection and replay
seeds never overlap. Thresholds never move after output. Real-data reachability
is required.

Strategic diversity is analytic over the complete effective signature space:

```text
N_eff = distinct complete strategic signatures at basis-point precision
R     = signatures appearing as a best response
p_max = largest uniform opponent-signature share covered by one response
```

Required: `R / N_eff >= 0.25` and
`best_response_ubiquity_multiple = p_max / (1 / N_eff) <= 4`. These thresholds
are deliberately tangent at the lower bound.

Monte Carlo `counter_move_ceiling` uses at most `32` deterministic stratified
contexts; it never owns the analytic diversity gate.

## Ordered Steps

| Step | Slice | Behaviour | Exit |
|---|---|---:|---|
| 01 | [contracts and tactical ownership](01-contracts-and-tactical-ownership.md) | no, except corrected trace | Step 02 |
| 02 | [real-career before-state](02-real-career-before-state.md) | no | Step 03 |
| 03 | [Checkpoint A](03-checkpoint-a-ownership-and-before-state.md) | no | **STOP / RETHINK recorded** |
| 03A | [squad archetypes and role reachability](03a-squad-archetypes-and-primary-role-reachability.md) | population | Step 03B |
| 03B | [Checkpoint A2 squad identity](03b-checkpoint-a2-real-career-squad-identity.md) | no | **conditional `GO`; 03C authorized** |
| 03C | [canonical modular simulation report foundation](03c-canonical-modular-simulation-report-foundation.md) | report/tooling | **U1 `GO`; 03D authorized** |
| 03D | [report module migration and single CLI entrypoint](03d-report-module-migration-and-single-cli-entrypoint.md) | report/tooling | **U2 `GO`; 04 authorized** |
| 04 | [conserved tactical contributions](04-conserved-tactical-contributions.md) | yes | Step 05 |
| 05 | [contested routes and lateral focus](05-contested-routes-and-lateral-focus.md) | yes | both-set low-block gate opens 06 |
| 06 | [Checkpoint B structural ceiling](06-checkpoint-b-structural-ceiling.md) | no | closed until Step 05 gate; GO authorizes 07 |
| 07 | [player task execution](07-player-task-execution.md) | yes | Step 08 |
| 08 | [squad identity and lateral execution](08-squad-identity-and-lateral-execution.md) | yes | Step 09 |
| 09 | [Checkpoint C player context](09-checkpoint-c-player-context.md) | no | GO authorizes 10 |
| 10 | [manager opponent read](10-manager-opponent-read.md) | information | Step 11 |
| 11 | [AI shared opponent read](11-ai-shared-opponent-read.md) | yes | Step 12 |
| 12 | [Checkpoint D realized agency](12-checkpoint-d-manager-ai-agency.md) | no | GO authorizes 13 |
| 13 | [tactical chapters and canonical explanation](13-tactical-chapters-and-canonical-explanation.md) | report/UI | Step 14 |
| 14 | [preparation and single persistence integration](14-post-match-preparation-choice.md) | next-match state/save | Step 15 |
| 15 | [Checkpoint E multi-match consequence](15-checkpoint-e-multi-match-consequence.md) | no | GO authorizes 16 |
| 16 | [integrated cohort and phase closeout](16-integrated-cohort-and-phase-closeout.md) | no | Phase 81B handoff |

No later step starts while its preceding checkpoint is unresolved.

**Checkpoint A2 recorded a conditional `GO` on 2026-08-08. Steps 03C-03D are
Done with U1/U2 `GO`; Step 04 is next.** All seven frozen gates
passed on both seed sets - `topFormationShare` `0.9286` ->
`0.2063`/`0.2222`, `3` -> `12`/`11` distinct shapes, all ten roles generable -
and the archetype-mix counterfactual moved `6`/`6` clubs at constant squad
quality. One guardrail, the low block's `ownLossPerConcededReduction`, reads
`2.8051` against `<= 2.0` out-of-sample. Checkpoint A2.1 showed that applying
the legacy chart to the same Phase 81A-generated ability vectors also fails; it
therefore excludes the chart component as the demonstrated cause without
recreating or absolving the full pre-81A population. **Step 05 owns the repair,
and Step 06-16 remain closed until the band holds on both seed sets.**

**Checkpoint A recorded `STOP / RETHINK` on 2026-08-07.** Its preregistered tie
bias was falsified: `tieDecidedShare` is `0.0000` on `378` real career
selections, and `4-2-4` wins `92.86%` by a mean structural margin of `0.7610`.
The remedy direction survives and its mechanism does not - work scoped to
**break ties** becomes work to **make the winning shape depend on the squad**.
Steps 03A and 03B are inserted rather than renumbered so every `Step NN`
reference in the design contract keeps its meaning. Checkpoint A2 has now
opened 03C-03D and conditionally authorized 04-05; the Checkpoint A before-state
remains frozen as the denominator of A2's deltas.

## Checkpoint Decisions

Each checkpoint records exactly one result:

- **GO:** all preregistered signals pass; open the next slice.
- **REFINE:** reopen only the immediate owner step, retain targets, repeat the
  same checkpoint.
- **STOP / RETHINK:** do not open downstream work; record why the model premise
  failed.

## Phase-Level Quality Rules

- One fact, formula, mapping, and persisted truth has one owner.
- Every modified Module becomes deeper: a smaller Interface hides more verified
  behaviour and improves Locality.
- No dead export, shadow Implementation, fallback, stale fixture, or duplicated
  derived field survives its step.
- Total mappings use typed exhaustiveness; order-sensitive sorts use stable final
  tie-breakers.
- Engine uses seeded RNG and no real clock.
- User-facing text is localized in `it`, `en`, `de`, `es`, and `fr`.
- Step 14 alone advances incompatible beta persistence and deletes old saves;
  no other step advances it and no migration, dual reader, or compatibility
  default survives.
- Web work meets WCAG 2.2 AA and normal/reduced-motion visual QA requirements.
- Checkpoint simulations use exactly seven workers. Focused tests and genuinely
  single-item validations do not invent parallel work, but no checkpoint cohort
  may silently fall back below seven.

## Mandatory Per-Step Loop

1. Read `AGENTS.md`, `CLAUDE.md`, `docs/PROJECT_RULES.md`,
   `docs/PROJECT_STATUS.md`, this README, and the active step.
2. Read production code; documents never override it.
3. Run `graphify explain` for known symbols and `graphify affected --depth 2`
   before changing a shared Module.
4. Modify only the active step's `Expected Files`, plus status and a permitted
   next-step lesson.
5. Run focused checks and then `pnpm check`; run every simulation gate alone.
6. Record adopted solution, verification, outcome, and next action in the active
   step before advancing.

## Phase-Level Checks

Run individually where relevant:

```bash
nvm use 24
pnpm check
pnpm --filter @game/web run build
pnpm web:visual:qa
pnpm depcruise
git diff --check
graphify update .
```

## Phase Exit

- Checkpoints A-E and final F are all GO.
- Structural oracle ceiling and exposure meet `+0.045/-0.045`; context-free
  expected delta remains zero.
- Manager and AI realize D agency from the same five observable components;
  after Step 14 the complete six-component read retains the target.
- `formation_history` changes a real decision, helps stable sufficient-history
  clusters by at least `+0.015`, and remains ignored within `0.015` otherwise.
- Player profiles and squad identity can reverse the preferred choice.
- Catalog order cannot choose a formation.
- `low_block` reduces conceded xG by at least `8%` with own-loss/defensive-gain
  ratio at most `2.0`.
- The three original dominance gates retain their exact semantics and pass.
- Post-match preparation is useful and harmful in reachable real contexts.
- Integrated replay, save/load, determinism, localization, browser, package,
  and repository gates pass.
- Phase report names residual findings and hands control to Phase 81B.
