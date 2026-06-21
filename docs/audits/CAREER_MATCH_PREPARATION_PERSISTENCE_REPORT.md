# Career Match Preparation Persistence Report

Date: 2026-06-21
Phase: `25-career-match-preparation-persistence`
Status: Complete

## Summary

Phase 25 closes the biggest remaining shortcut in the playable career loop: the selected club no longer advances with an implicit runtime lineup and tactic.

The career save can now persist the manager's match preparation, reload it, use it for the next selected-club fixture, persist the played result, and retarget the same preparation to the following selected-club fixture.

Current career preparation score: `95 / 100` for this project maturity.

## Persisted Match Preparation

`CareerState.matchPreparation` now stores:

- selected club ID;
- optional target fixture ID;
- selected lineup;
- selected tactic;
- update date.

The domain validation confirms that:

- the preparation belongs to the selected club;
- the optional target fixture exists and includes the selected club;
- the lineup belongs to the selected club;
- every selected lineup player exists and is owned by the selected club;
- lineup ambiguity and tactic values are validated through the existing domain contracts.

The field is optional, so older saves without preparation remain loadable. Progression blocks selected-club advancement until preparation exists.

## CLI Flow Verified

The full save-driven manager flow was verified with:

```bash
pnpm cli career --save=phase25-prep-world --seed=world-a --new-world-preview
pnpm cli career --save=phase25-prep-world --squad
pnpm cli career --save=phase25-prep-world --set-lineup-demo=pro01-first-team
pnpm cli career --save=phase25-prep-world --set-tactic-demo=pro01-balanced
pnpm cli career --save=phase25-prep-world --summary
pnpm cli career --save=phase25-prep-world --advance-next-fixture
pnpm cli career --save=phase25-prep-world --inspect
```

Observed flow:

- new career world created from `world-a`;
- `--squad` showed the selected club roster without mutating the save;
- `--set-lineup-demo=pro01-first-team` saved an explicit selected-club lineup;
- `--set-tactic-demo=pro01-balanced` saved an explicit selected-club tactic;
- `--summary` reloaded and displayed both saved decisions;
- `--advance-next-fixture` used the saved preparation and advanced `fixture:000003`;
- `--inspect` reloaded the save, showed `Selected club played fixtures: 1`, and retargeted preparation to `fixture:000011`.

Observed result:

- advanced fixture: `fixture:000003`;
- result: `PRO10 3-0 PRO01`;
- next selected-club fixture: `fixture:000011 2026-08-08 round 2: PRO01 vs PRO18`.

## Shortcut Removal

The selected-club default preparation shortcut is now blocked.

Career fixture advancement returns an invalid-state result instead of auto-selecting for the selected club when any required preparation slice is missing:

- missing match preparation;
- missing saved lineup;
- missing saved tactic.

Opponent clubs still use deterministic MVP defaults. That is acceptable for the current single-user career loop because the user controls only the selected club.

## Balance Evidence

The strict balance gate still passes after the persistence work:

```bash
pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict
```

Observed result:

- status: `PASS`;
- goals per match: `2.859`;
- home win rate: `0.413`;
- draw rate: `0.238`;
- away win rate: `0.349`;
- first-place points: `70.500`;
- last-place points: `25.500`;
- table points spread: `45.000`;
- upset proxy rate: `0.350`.

## Verification

Passed:

- `pnpm --filter @game/cli run typecheck`;
- `pnpm --filter @game/domain run typecheck`;
- `pnpm --filter @game/engine run typecheck`;
- `pnpm --filter @game/storage run typecheck`;
- `pnpm --filter @game/i18n run typecheck`;
- focused career, domain, storage, engine, and i18n tests during the phase;
- full CLI preparation smoke listed above;
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`;
- `pnpm check`;
- `git diff --check`.

## Remaining Limitations

The loop is credible, but not complete:

- lineup and tactic selection are still demo-profile based, not free-form manager input;
- there is no bench selection or substitution persistence;
- career advancement does not yet support mid-match manager decisions;
- opponent clubs still use deterministic MVP defaults;
- no injury, suspension, or availability rules block an invalid human lineup yet;
- there is no UI for preparation, only CLI inspection and demo commands.

These are not blockers for Phase 25 completion. They are the correct next gameplay layers.

## Score

Current career preparation loop score: `95 / 100`.

Why not `100`:

- the selected club finally persists and consumes lineup/tactic decisions;
- the selected-club default shortcut is blocked;
- reload and retargeting are proven;
- however, the user still cannot freely choose any 11 players from the CLI/UI, cannot persist bench/substitutions, and cannot make career match-day changes yet.

## Next Phase Decision

Recommended next phase: `Phase 26 - Career Match-Day Interaction MVP`.

Reason:

- Phase 25 proves pre-match preparation is durable;
- Phase 9 already proved manual tactic switches in isolated fixture inspection;
- the next product step should connect match-day interaction to career saves: prepared lineup, prepared tactic, optional manual switch/substitution decisions, fixture advancement, then durable post-match consequences;
- youth academy and deeper market systems should wait until the save-driven match-day loop can consume the squad decisions they will create.

Do not start Phase 26 until its README and incremental step documents are written.
