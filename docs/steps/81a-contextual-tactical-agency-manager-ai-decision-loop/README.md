# Phase 81A - Contextual Tactical Agency, Manager And AI Decision Loop

## Status

**Structural redesign authorized after Checkpoint B.** Steps 01-06 are Done;
Checkpoints A2/U1/U2 and the Step 05 low-block exit recorded `GO`, but
Checkpoint B recorded `STOP / RETHINK` on 2026-08-08. Design Contract Amendment
A1 inserted Steps 06A-06C. Step 06A is Done; Step 06B's `7 x 10` canary recorded
`REFINE` and the `100 x 10` main run was stopped. Accepted Amendment A2 splits
the remediation into Steps 06B1-06B8: match progression, substitutions,
availability, soft aging and generational renewal receive separate checkpoints.
Steps 06B1-06B7 are Done and L3 recorded `GO`. Step 06B7 corrected the proven
emergency-selection boundary, but its two narrow renewal ablations failed and
were removed; it recorded `STOP / RETHINK`. The owner's Amendment A3 authorizes
06B7A low-detail academy participation and 06B7B L4.1. L4.1 recorded `STOP /
RETHINK`; 06B7C's exit owner improved but did not repair renewal. Historical
L4.3 attributed development realization in `7/7`; 06B7F and beta-v8 then
repaired it, and the v9 rerun moves the residual owner downstream in `5/7`.
L4.4 recorded `REFINE` on
renewal and `8/10` annual-intake roles. Step 06B7G1 restored role continuity;
06B7G2A then removed match-day depth/tie failures and L4.5 recorded `GO`. L4.6
reached development parity in `7/7` but retained a leaderboard-renewal
`REFINE`; age-conditioned match load fixed the all-34-appearances anomaly.
Integrated L5 is now Done with `REFINE`: renewal/leader age and one formation-
replication gate remain red. The new JSON and desktop HTML are consultable;
the `100 x 10`, B2 and Steps 07-16 remain closed.

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
available players and exploit or expose something in the opponent. In the MVP,
the manager may use opponent evidence while the AI chooses from its own squad
and current match state. Both must make explainable decisions without any
formation or tactic being best by definition; a future opponent-aware AI must
consume the manager's same evidence rather than hidden facts.

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
- AI formation remains selected from its own squad. In the MVP its pre-match
  tactical prior also starts from its own squad and selected shape; opponent-
  aware AI is deferred. The structural oracle may still measure contextual
  tactic/focus ceiling, but never enters production.
- Every generated competition receives a deterministic balanced deck of squad
  identities. Identities name player roles, never formations; AI remains free
  to select the shape that fits those players.
- `OpponentRead` remains manager-visible structured evidence. The MVP AI does
  not consume it. If opponent-aware AI is added later, it must consume that same
  Interface with the same facts and latency and no future or hidden state.
- `lateralFocus = balanced | left | right` is the single owner of lateral
  commitment. Formation remains geometry; players own execution.
- Post-match choice affects only the next match: marginal recovery, plan
  rehearsal, or opponent study, with one priority excluding the other two.
- Facts are persisted once; summaries, advice, and prose are derived.
- Beta saves are disposable. Step 06B7F1 advanced the content-calibration
  bundle to `v8`; Step 06B7G4 re-derived the linked bundle as v9 after raising
  the reachable growth cap, without a legacy reader or migration. Step 14 still
  owns the phase's single **storage schema/event-envelope** integration after
  every persisted consumer exists; Steps 05, 10, and 13 do not advance those
  storage versions independently.
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
| 06 | [Checkpoint B structural ceiling](06-checkpoint-b-structural-ceiling.md) | no | **`STOP / RETHINK`; 07 remains closed** |
| 06A | [league squad diversity and MVP AI boundaries](06a-league-squad-diversity-and-mvp-ai-boundaries.md) | population | **Done; Step 06B** |
| 06B | [Checkpoint L1: 100 worlds x 10 seasons](06b-checkpoint-l1-league-diversity-100x10.md) | no | **canary `REFINE`; main stopped** |
| 06B1 | [canonical automated match progression and substitutions](06b1-canonical-automated-match-progression-and-substitutions.md) | yes | Step 06B2 |
| 06B2 | [Checkpoint L2: substitution and minute truth](06b2-checkpoint-l2-substitution-and-minute-truth.md) | no | GO opens 06B3 |
| 06B3 | [canonical availability and minute-weighted workload](06b3-canonical-availability-and-minute-weighted-workload.md) | yes | Step 06B4 |
| 06B4 | [soft age resilience and recovery](06b4-soft-age-resilience-and-recovery.md) | yes | Step 06B5 |
| 06B5 | [Checkpoint L3: availability, aging and injury](06b5-checkpoint-l3-availability-aging-and-injury.md) | no | GO opens 06B6 |
| 06B5A | [match-injury exposure refinement](06b5a-match-injury-exposure-refinement.md) | yes, only after L3 REFINE | repeat 06B5 |
| 06B5B | [carried substitution restoration](06b5b-carried-substitution-restoration.md) | yes, only after post-injury L3 REFINE | repeat 06B5 |
| 06B6 | [Checkpoint L4: generational-succession attribution](06b6-checkpoint-l4-generational-succession-attribution.md) | no | **owner identified; 06B7 executed** |
| 06B7 | [generational-renewal owner correction](06b7-generational-renewal-owner-correction.md) | yes | **`STOP / RETHINK`; 06B8 closed** |
| 06B7A | [canonical low-detail academy participation](06b7a-canonical-low-detail-academy-participation.md) | yes | **Done; L4.1 open** |
| 06B7B | [Checkpoint L4.1: youth-minute pathway](06b7b-checkpoint-l4-1-youth-minute-pathway.md) | no | **`STOP / RETHINK`** |
| 06B7C | [soft outfield career-exit hazard](06b7c-soft-outfield-career-exit-hazard.md) | yes | **Done; retained** |
| 06B7D | [Checkpoint L4.2: career exit and renewal](06b7d-checkpoint-l4-2-career-exit-and-renewal.md) | no | **`STOP / RETHINK`** |
| 06B7E | [Checkpoint L4.3: generated-ceiling attribution](06b7e-checkpoint-l4-3-generated-ceiling-attribution.md) | no | **v9: downstream `5/7`** |
| 06B7F | [potential-room development realization](06b7f-potential-room-development-realization.md) | yes | **Done; 06B7F1** |
| 06B7F1 | [beta v8 development/economy re-baseline](06b7f1-beta-v8-development-economy-rebaseline.md) | content | **Done; L4.4** |
| 06B7G | [Checkpoint L4.4: development and renewal](06b7g-checkpoint-l4-4-development-and-renewal.md) | no | **`REFINE`; generation owner mismatch** |
| 06B7G1 | [competition-balanced annual role continuity](06b7g1-competition-balanced-annual-role-continuity.md) | population | L4.5 |
| 06B7G2 | [Checkpoint L4.5: annual role continuity](06b7g2-checkpoint-l4-5-annual-role-continuity.md) | no | **retry `GO`** |
| 06B7G3 | [Checkpoint L4.6: development funnel retry](06b7g3-checkpoint-l4-6-development-funnel-retry.md) | no | **`REFINE`; dated load owner** |
| 06B7G4 | [potential-room realization curve](06b7g4-potential-room-realization-curve.md) | development | **Done; parity `7/7`** |
| 06B7G5 | [age-conditioned match load](06b7g5-age-conditioned-match-load.md) | condition | **Done; rotation green** |
| 06B7G2A | [academy call-up depth and live shape tie-break](06b7g2a-academy-call-up-and-live-shape-tie-break.md) | yes | **Done; L4.5 `GO`** |
| 06B8 | [Checkpoint L5: integrated 7 x 10 HTML](06b8-checkpoint-l5-integrated-7x10-html.md) | no | **`REFINE`; HTML produced** |
| 06C | [Checkpoint B2 conditioned tactical ceiling](06c-checkpoint-b2-conditioned-tactical-ceiling.md) | no | GO authorizes 07 |
| 07 | [player task execution](07-player-task-execution.md) | yes | Step 08 |
| 08 | [squad identity and lateral execution](08-squad-identity-and-lateral-execution.md) | yes | Step 09 |
| 09 | [Checkpoint C player context](09-checkpoint-c-player-context.md) | no | GO authorizes 10 |
| 10 | [manager opponent read](10-manager-opponent-read.md) | information | A1 rescope required before start |
| 11 | [MVP AI policy - historical opponent-read plan superseded](11-ai-shared-opponent-read.md) | yes | A1 rescope required after B2 |
| 12 | [Checkpoint D - historical shared-read plan superseded](12-checkpoint-d-manager-ai-agency.md) | no | A1 rescope required after B2 |
| 13 | [tactical chapters and canonical explanation](13-tactical-chapters-and-canonical-explanation.md) | report/UI | Step 14 |
| 14 | [preparation and single persistence integration](14-post-match-preparation-choice.md) | next-match state/save | Step 15 |
| 15 | [Checkpoint E multi-match consequence](15-checkpoint-e-multi-match-consequence.md) | no | GO authorizes 16 |
| 16 | [integrated cohort and phase closeout](16-integrated-cohort-and-phase-closeout.md) | no | Phase 81B handoff |

No later step starts while its preceding checkpoint is unresolved.

**Checkpoint B recorded `STOP / RETHINK` on 2026-08-08.** The `207` raw actions
formed `198` signatures, but only `2` appeared as best responses, ubiquity was
`121` against `<= 4`, no material cycle existed, and
`4-2-3-1|high_pressing|balanced` was strictly dominant. The analytic protocol
therefore did not open Monte Carlo Phase 2. Steps 07-16 remain closed.

**Amendment A1 preserves that result and changes the retry question rather than
its targets.** Step 06A guarantees balanced identity coverage within each
competition and freezes the active MVP AI seams without speculative code. L1
then verifies `100 x 10` longitudinal worlds and produces canonical JSON plus a
consultable English desktop HTML. Checkpoint B2 holds the squad-selected
formation fixed and enumerates only `tactic profile + lateralFocus`. The old
combined-space report remains the before-state; L1 and B2 `GO` are both required
before Step 07.

**Amendment A2 preserves L1's `REFINE` and separates its two player-world
owners.** The committed canary has `395/420` season-ten scorer/assist rows still
occupied by the opening population, while automatic matches bypass canonical
AI substitutions and exact minutes. Steps 06B1-06B5 repair and verify the match
lifecycle without tuning development. Step 06B6 found a real emergency-
selection boundary and a downstream renewal failure. The later academy,
career-exit, development, role-continuity and match-load slices now make senior-
level generated players reachable and fix automatic rotation. Integrated L5
still measures only `20.71%` career-generated leaders, `42.54..47.78%` late
`33+` leaders and `90.48%` four-shape replication retention. Its replacement
HTML exists, but the stopped `35` main shards are never resumed as evidence.

**Checkpoint A2 recorded a conditional `GO` on 2026-08-08. Steps 03C-05 are
Done with U1/U2 `GO`; B has now stopped the sequence.** All seven frozen gates
passed on both seed sets - `topFormationShare` `0.9286` ->
`0.2063`/`0.2222`, `3` -> `12`/`11` distinct shapes, all ten roles generable -
and the archetype-mix counterfactual moved `6`/`6` clubs at constant squad
quality. One guardrail, the low block's `ownLossPerConcededReduction`, reads
`2.8051` against `<= 2.0` out-of-sample. Checkpoint A2.1 showed that applying
the legacy chart to the same Phase 81A-generated ability vectors also fails; it
therefore excludes the chart component as the demonstrated cause without
recreating or absolving the full pre-81A population. Step 05 restored the band
on both sets: conceded-xG reduction `0.2088`/`0.2287`, exchange
`1.1659`/`1.6721`. Step 06 subsequently recorded `STOP / RETHINK`; Step 06A is
Done with one balanced identity deck per competition. Step 06B's canary then
recorded `REFINE`: the replicated-formation retention gate is red and the human
view found a separate post-season-three availability/age drift. The main
`100 x 10` is stopped; Steps 07-16 remain checkpoint-closed.

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
- Manager agency realizes the structural ceiling from observable information.
  Amendment A1 requires the exact D population and MVP AI acceptance gate to be
  preregistered after B2 and before Step 10; the historical shared-read D is not
  an exit criterion.
- The contribution of `formation_history` is re-preregistered with that revised
  D/E design before implementation; its historical AI-parity wording is
  superseded.
- Player profiles and squad identity can reverse the preferred choice.
- Catalog order cannot choose a formation.
- `low_block` reduces conceded xG by at least `8%` with own-loss/defensive-gain
  ratio at most `2.0`.
- The three original dominance gates retain their exact semantics and pass.
- Post-match preparation is useful and harmful in reachable real contexts.
- Integrated replay, save/load, determinism, localization, browser, package,
  and repository gates pass.
- Phase report names residual findings and hands control to Phase 81B.
