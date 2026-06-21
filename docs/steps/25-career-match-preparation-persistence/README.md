# Phase 25 - Career Match Preparation Persistence

## Goal

Persist the manager's match-preparation choices inside the career save and make fixture advancement use those choices.

The current career loop can create a save, inspect it, apply a transfer, and advance the next selected-club fixture. The remaining shortcut is important: advancement still builds an MVP default lineup/tactic at runtime. That is not the intended manager fantasy. The user must inspect the squad, choose who plays, choose the tactic, save those decisions, and then advance the fixture using the saved preparation.

## Product intent

- The user chooses the lineup; the system must not auto-pick it.
- The user chooses the tactic; the system must not change it automatically based on score, minute, or context.
- Match preparation belongs to the career save, not to ephemeral CLI demo flags.
- The selected lineup/tactic should be tied to the next selected-club fixture or to a clearly documented current preparation slot.
- The user needs a practical way to inspect generated players before choosing a lineup.
- The preparation model must remain reusable by a future UI.
- The implementation must preserve deterministic offline behavior.

## Step order

1. `01-phase-24-output-and-prep-gap-review.md`
2. `02-career-squad-player-inspection.md`
3. `03-match-preparation-state-contract.md`
4. `04-save-career-lineup-selection.md`
5. `05-save-career-tactic-selection.md`
6. `06-advance-fixture-uses-saved-preparation.md`
7. `07-phase-report-and-next-phase-decision.md`

## Phase constraints

- Do not add UI.
- Do not add substitutions, injuries, suspensions, scouting fog, staff, youth intake, training, contracts, wages, or advanced market systems.
- Do not add automatic lineup or tactic selection.
- Do not add match-day live interaction beyond already documented manual tactic switch concepts.
- Do not change match-engine scoring algorithms or calibration.
- Do not regenerate the career world after save creation.
- Do not expose exact hidden potential as player-facing scouting truth.
- Keep CLI/user-facing text localized through the existing i18n layer.
- Keep domain and engine data language-agnostic.
- Keep the persistence shape narrow and migration-friendly.

## Phase-level checks

At the end of the phase, run:

- focused tests for touched domain/engine/storage/CLI/i18n files;
- `pnpm check`;
- `pnpm cli career --save=phase25-prep-world --seed=world-a --new-world-preview`;
- `pnpm cli career --save=phase25-prep-world --squad`;
- `pnpm cli career --save=phase25-prep-world --set-lineup-demo=pro01-first-team`;
- `pnpm cli career --save=phase25-prep-world --set-tactic-demo=pro01-balanced`;
- `pnpm cli career --save=phase25-prep-world --summary`;
- `pnpm cli career --save=phase25-prep-world --advance-next-fixture`;
- `pnpm cli career --save=phase25-prep-world --inspect`;
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`;
- `git diff --check`.

## Definition of Done

- A career save can show the selected club's generated squad in a useful CLI view.
- A selected lineup can be saved to the career state.
- A selected tactic can be saved to the career state.
- Career summary/inspection shows the saved preparation.
- Advancing the next selected-club fixture uses the saved preparation.
- Reloading the save after advancement preserves both the preparation record and the played fixture result.
- The phase report explains remaining match-preparation gaps and recommends exactly one next phase.
