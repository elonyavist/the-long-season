# Phase 81A - Contextual Tactical Agency Final Report

## Thesis Verdict

**Accepted in the smaller option-B form.** The engine is materially healthier
and more football-like than at the start of the phase, but it does not implement
the original opponent-reading game.

The decisive improvement is contextual squad identity. The AI no longer meets
every club as the same `4-4-2` or selects one monoculture from identical depth
charts. Generated clubs have different role structures, all ten primary roles
are reachable, and the AI selects the formation, XI and tactic that best fit its
own available players and current condition. Formation itself adds no direct
strength bonus.

During the match, both automatic teams can react to the facts that are genuinely
available then: score, time, fatigue, injury and dismissal. After the match, the
game retains canonical tactical facts and derives the same explanation before
and after reload.

## What Changed For The Player

- Club identity now creates genuine formation variety. The initial `4-2-4`
  share fell from `0.9286` to `0.2063/0.2222`; distinct selected shapes rose
  from `3` to `12/11` in the two A2 populations.
- `defensive_midfielder`, `attacking_midfielder` and `wide_midfielder`, formerly
  absent, are now generated; all ten primary roles have positive counts.
- Different role charts change the preferred shape with the same footballers'
  quality held constant (`6/6` club counterfactuals moved).
- Tactics conserve their contribution budget and alter routes rather than
  creating strength from nowhere. No formation or tactic owns a universal
  advantage: current maximum row means are `0.5180` and `0.5141`.
- AI selection is intentionally understandable for this MVP: before kickoff it
  uses its own squad and state only; after kickoff it reacts to match state.
- Automatic matches now rotate players and make substitutions. On the fresh
  final population the mean is `4.4007` substitutions per team-match and the
  median first change is minute `60`.
- The ten-season career population has a proven generational-renewal gain:
  ready-replacement share improves by `+0.1106/+0.1057` and generated-leader
  share by `+0.0690/+0.0500` across in-sample/OOS pairs.
- Tactical facts survive JSON, real SQLite and web reload exactly. The UI does
  not reconstruct a second version of the match.

## What The Phase Did Not Prove

The original rock-paper-scissors thesis did not survive measurement. The
complete structural action space produced too few best responses and excessive
ubiquity; later attempts did not establish the original season-point magnitude.
Those findings were not tuned away. Amendment A11 chose the smaller option-B
MVP instead of adding a direct formation multiplier or a parallel execution
model.

The phase therefore does **not** claim:

- that the AI reads the next opponent before kickoff;
- that the manager receives a `+0.045` win-share reward for an opponent read;
- that a post-match preparation button affects the following fixture;
- that every career-world system is finished.

Post-match chapters are explanation only. A future opponent-aware system must
show the manager the same delayed evidence available to the AI. A future
recovery/development allocation must first prove that it adds a new decision
rather than duplicating fatigue recovery or player development.

## Why The Accepted Product Is Still Fun

The manager now faces a legible football problem: use the squad actually owned,
deal with condition and availability, and change the match when live events make
the original plan inappropriate. Variety comes from clubs and players rather
than a privileged menu option.

The outcome is not deterministic. In the final tactical hierarchy test a
first-division contender retains `0.9721` win share against a much weaker side
over `2100` matches, yet the weaker side still wins `21` times. The engine can
produce favourites, upsets and explainable tactical costs at the same time.

## Acceptance Evidence

- Checkpoint A2: formation share `0.2063/0.2222`, `12/11` shapes, all roles,
  catalog-order invariance `1.0000`, zero out-of-position selections.
- Step 05: low-block xG gate restored on both declared populations.
- Checkpoint E: fresh `7 x 2`, `25,704` team-matches, report `PASS`, exact
  seven-worker execution and byte-identical rebuild.
- L6.31: paired `7 x 10` in-sample/OOS renewal `GO` with no new integrated red.
- Step 14: one beta reset and exact current-schema persistence.
- Checkpoint F: current tactical-shape report `PASS`; repository, web and visual
  gates recorded in the integrated cohort report.

## Final Decision And Handoff

Phase 81A is **Done** when the final repository/browser gates recorded by Step
16 are green. Phase 81B Step 01 is then the only next action; it must measure and
freeze its own contract/free-agent bands before implementation. Phase 81B's
Step 07 owns the complete `750 x 10` world-integrity cohort and desktop HTML.

No Phase 81B implementation is part of this report.
