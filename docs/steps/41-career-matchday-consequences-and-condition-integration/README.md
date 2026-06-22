# Phase 41 - Career Matchday Consequences And Condition Integration

## Goal

Make career fixture advancement produce visible, deterministic player-condition
consequences so the matchday loop feels like a real management game before UI
work starts.

Phase 40 proved the career loop is close to playable, but also found the main
fun blocker: after a played career fixture, condition/fatigue is not yet a
meaningful consequence in the career flow.

## Product intent

The user should feel that:

- choosing the same eleven repeatedly has a visible cost;
- rotation becomes a real manager decision, not a cosmetic feature;
- post-match output answers "what changed?" without giving advice;
- the next fixture matters because the squad state changed;
- fixture explanation can mention condition impact when condition is tracked.

## Context

Existing systems already include:

- player dynamic state and fitness rules;
- optional season fitness lifecycle in `simulateSeason`;
- career save/load;
- saved lineup and tactic preparation;
- career fixture advancement;
- optional career fixture explanation.

Phase 41 should connect these pieces in the career loop. It should not add
injuries, morale logic, automatic rotation, UI, or training.

## Step order

1. `01-phase-40-output-review.md`
2. `02-career-condition-consequence-contract.md`
3. `03-career-advance-condition-application.md`
4. `04-cli-post-match-condition-output.md`
5. `05-multi-fixture-condition-smoke.md`
6. `06-phase-report-and-next-decision.md`

## Phase constraints

- Do not build UI in this phase.
- Do not add injuries, morale changes, form changes, training, staff, or medical
  systems.
- Do not auto-rotate players.
- Do not auto-select lineups or tactics.
- Do not add tactical advice.
- Do not change match scoring probabilities or table balance.
- Do not change player generation.
- Do not write rendered prose to saves.
- Preserve deterministic output by save and seed.
- Keep engine/domain data language-agnostic.
- CLI-visible text must use localization keys.
- Any condition change must be explained by a user-facing gameplay reason.

## Phase-level checks

At the end of the phase, run:

- focused tests for touched career/engine/CLI/i18n files;
- `pnpm check`;
- `pnpm cli career --save=phase41-check --seed=world-a --new-world-preview`;
- `pnpm cli career --save=phase41-check --set-lineup-demo=pro01-first-team`;
- `pnpm cli career --save=phase41-check --set-tactic-demo=pro01-balanced`;
- `pnpm cli career --save=phase41-check --summary`;
- `pnpm cli career --save=phase41-check --advance-next-fixture`;
- `pnpm cli career --save=phase41-check --advance-next-fixture --fixture-explanation`;
- `pnpm cli career --save=phase41-check --squad`;
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`;
- `git diff --check`.

## Definition of Done

- Career fixture advancement updates selected-club player condition
  deterministically.
- Selected starters pay a visible post-match condition cost.
- Non-selected players do not pay match cost in that fixture.
- Career summary/squad output lets the manager understand the next lineup
  decision without automatic advice.
- Optional fixture explanation reports tracked condition impact for career
  fixtures when condition is available.
- Default commands remain readable.
- Phase report states whether the loop is ready for a first UI prototype or
  whether one more core blocker remains.
- `docs/PROJECT_STATUS.md` records Phase 41 as complete or blocked.
