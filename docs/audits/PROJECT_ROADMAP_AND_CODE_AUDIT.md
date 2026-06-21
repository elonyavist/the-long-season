# Project Roadmap And Code Audit

Date: 2026-06-21

Phase: `21-project-audit-and-roadmap-reconciliation`

Status: Complete

## Executive Summary

Phase 21 score: 88 / 100

Phase 22 hardening score: 95 / 100

The project is coherent enough to proceed to a first playable career-loop phase. No blocker was found in package boundaries, deterministic checks, save consistency, localization enforcement, or current balance.

The main risk is product cohesion, not broken code: the project has many strong inspection and demo flows, but it does not yet have one career command surface where a user loads a save, reviews the current situation, makes a small set of durable decisions, advances time or a fixture, and reloads the changed state.

Recommended next phase after hardening: `Phase 23 - Playable Career Loop MVP`.

This preserves the completed Phase 21 audit history. Phase 22 closed the pre-loop maintainability and handoff risks; Phase 23 can now focus on the save-driven playable loop.

See also: `docs/audits/PRE_PLAYABLE_LOOP_HARDENING_REPORT.md`.

Do not proceed directly to youth, loans, contracts, scouting, AI market behavior, UI, or advanced economy yet. Those systems will be more valuable after the user can experience a narrow save-driven loop.

## Source-Of-Truth Hierarchy

Binding:

1. `requirements.md`
2. `docs/PROJECT_RULES.md`
3. `docs/PROJECT_STATUS.md`
4. active `docs/steps/<phase>/<step>.md`

Operational:

- `docs/steps/README.md`
- current phase README under `docs/steps/`
- current audit report under `docs/audits/`

Advisory or historical:

- `docs/ROADMAP_PHASES_07_20.md`
- `docs/market-roadmap/`
- completed phase docs under `docs/steps/`
- completed audit reports under `docs/audits/`

The market roadmap is still useful, but its phase numbers are candidate market-roadmap numbers, not binding `docs/steps/` phase numbers.

## 1. Documentation State Audit

Status: Pass with historical drift noted.

Checks run:

- `find docs -maxdepth 3 -type f | sort`
- `rg -n "recommended next phase|next phase|Phase 21|Phase 22|playable|roadmap|market|youth|audit" docs requirements.md`
- `git diff --check`

Findings:

- `docs/audits/NEW_CAREER_WORLD_GENERATION_REPORT.md` recommends `Phase 21 - Playable Career Loop MVP`, but Phase 21 has now been intentionally inserted as an audit gate. This is not a contradiction in implementation state; it is historical drift.
- `docs/audits/PLAYABLE_LOOP_READINESS_REPORT.md` was correct at Phase 18, but later Phase 19-20 work improved identities and world generation before the playable loop.
- `docs/ROADMAP_PHASES_07_20.md` is an orientation document and should not be treated as active step scope.
- `docs/market-roadmap/` remains advisory. Its phase names are market-specific candidate phases, not the current project phase numbering.
- `docs/PROJECT_STATUS.md` is the correct current handoff source and now points to Phase 21 audit completion.

Assessment:

Documentation discipline is good. The project has a lot of history, so future agents must distinguish completed recommendations from the active step sequence.

## 2. Code Boundary And Dead Code Audit

Status: Pass with maintainability watch.

Checks run:

- `pnpm depcruise`: pass, no dependency violations across 145 modules and 492 dependencies.
- `pnpm lint`: pass.
- `pnpm --filter @game/domain run typecheck`: pass.
- `pnpm --filter @game/engine run typecheck`: pass.
- `pnpm --filter @game/content run typecheck`: pass.
- `pnpm --filter @game/cli run typecheck`: pass.
- `pnpm check:localized-text`: pass.
- `rg -n "TODO|FIXME|compat|legacy|unused|deprecated|hardcoded|auto-select|automatic|best XI|squad need|Market-need|need hints" packages apps docs requirements.md`
- `rg -n "Object\\.values\\(|Object\\.keys\\(|Object\\.entries\\(|Math\\.random|Date\\.now|new Date\\(|crypto\\.randomUUID|performance\\.now" packages/engine/src packages/domain/src packages/shared/src`

Findings:

- No package-boundary violation found.
- No forbidden runtime API found in `engine`.
- No source TODO/FIXME or active dead-code marker found.
- `Object.keys()` appears only in a domain test, not in order-sensitive engine simulation.
- CLI command Modules remain large:
  - `apps/cli/src/commands/simulate-season.ts`: 2011 lines.
  - `apps/cli/src/commands/career.ts`: 1012 lines.
- Save files are written under `apps/cli/saves/career/`, which is ignored by `.gitignore` through `saves/`. This is acceptable for local CLI checks, but the first playable loop should make the save directory behavior explicit to the user.

Assessment:

The architecture seams are still clean. The main maintainability pressure is CLI composition size. This does not block the next phase, but Phase 22 should add private career-loop Modules rather than growing `career.ts` into another broad command file.

## 3. Determinism And Save Consistency Audit

Status: Pass.

Checks run:

- `pnpm --filter @game/shared run typecheck`: pass.
- `pnpm --filter @game/storage run typecheck`: pass.
- `pnpm --filter @game/cli run typecheck`: pass.
- `pnpm cli simulate-season --seed=world-a --identity-review`: pass.
- `pnpm cli simulate-season --seed=world-b --identity-review`: pass.
- `pnpm cli career --save=phase21-determinism-a --seed=world-a --new-world-preview`: pass.
- `pnpm cli career --save=phase21-determinism-a --inspect`: pass.
- `pnpm cli career --save=phase21-determinism-b --seed=world-b --new-world-preview`: pass.
- `pnpm cli career --save=phase21-determinism-b --inspect`: pass.
- `git diff --check`: pass.

Observed behavior:

- `world-a` and `world-b` generate visibly different identity mixes.
- Career `--new-world-preview` writes world seed and generator version.
- Career `--inspect` reloads persisted metadata:
  - `World seed: world-a` for `phase21-determinism-a`;
  - `World seed: world-b` for `phase21-determinism-b`.
- `CareerWorldMetadata.worldSeed` and `GameState.meta.seed` are separate concepts.

Assessment:

Seed behavior is coherent enough for a playable career-loop phase. The next phase should preserve the distinction:

- `CareerWorldMetadata.worldSeed` identifies the generated world stored in the save.
- `GameState.meta.seed` drives deterministic runtime simulation.
- Career inspection must load stored state, not regenerate the world.

## 4. Product Loop Readiness Audit

Status: Ready for a narrow playable loop, not a complete playable game.

Checks run:

- `pnpm cli simulate-season --seed=demo-001`: pass.
- `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006`: pass.
- `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --lineup-demo=pro01-rotated`: pass.
- `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --setup-demo=pro01-balanced --manual-tactic-switch=46:pro01-attacking`: pass.
- `pnpm cli simulate-season --seed=demo-001 --formation-fit=4-2-3-1`: pass.
- `pnpm cli simulate-season --seed=demo-001 --condition-demo=pro01-season`: pass.
- `pnpm cli simulate-season --seed=demo-001 --market-demo=pro01-affordable-permanent --lang=it`: pass.
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`: pass.

Playable now:

- deterministic season simulation;
- fixture detail with player events and stats;
- generated identities and world-seed variation;
- factual formation-fit inspection;
- manual lineup override inspection;
- manual tactic switch inspection;
- condition lifecycle inspection;
- permanent-transfer market inspection;
- durable career creation and career inspect;
- durable permanent-transfer apply path from previous phases.

Still inspection-only or fragmented:

- `simulate-season` rebuilds a temporary world from command inputs.
- Formation fit, lineup, tactics, condition, and fixture views are not yet routed through one loaded career save.
- There is no command that advances the loaded career to the next fixture or next round and persists the result.
- There is no cohesive career summary that combines next fixture, selected club, roster, budget, condition, formation fit, and recent transfer history.
- Market demos are still profile-based, not a general player selection/search surface.

Assessment:

The next phase should connect existing Modules into a minimal loop. It should not add new deep systems yet.

## 5. Roadmap Dependency Reconciliation

Status: Proceed to playable career loop before deeper systems.

Checks run:

- `find docs/market-roadmap -type f | sort`
- `rg -n "dependency|depends|blocked|playable|market|youth|scouting|contract|wage|staff|UI|career loop|season transition" docs requirements.md`

Dependency conclusions:

- Market MVP and transfer persistence already exist.
- Identity generation and new career world generation already exist.
- The next missing shared Module is not another market slice. It is save-driven career progression.
- Loans need career state, ownership distinction, calendar/season transition, and return processing.
- Contracts and wages need economy state and wage commitments.
- Scouting needs a visible-player-profile Interface and must separate true data from manager-visible data.
- Youth intake needs player development, season progression, ownership, and visible-profile rules.
- UI should wait until the CLI can prove the loop shape.

Recommended order:

1. `Phase 22 - Pre Playable Loop Hardening`.
2. `Phase 23 - Playable Career Loop MVP`.
3. Calendar and season progression foundation, if Phase 23 exposes that advancing time is too shallow.
4. Scouting or youth foundation, depending on whether player discovery or academy ritual is the next product priority.
5. Market depth only after the loop can carry consequences over time.

## 6. Risk And Priority Report

### Blocker

None.

### High

1. No unified save-driven career loop yet.
   - Files/areas: `apps/cli/src/commands/career.ts`, `apps/cli/src/commands/simulate-season.ts`, `packages/engine/src/use-cases/simulate-season.ts`, `packages/domain/src/state/career-state.ts`.
   - Impact: the user can inspect many things, but still has to mentally connect separate commands.
   - Blocks next phase? No. It defines the next phase.
   - Recommended handling: Phase 22 should first harden career CLI boundaries, save policy, and deterministic career tests; Phase 23 should then add the career loop command surface that loads a save, shows the current state, advances at least one fixture/round, persists the result, and reloads it.

2. CLI career surface can become too broad if Phase 22 is added directly into `career.ts`.
   - Files/areas: `apps/cli/src/commands/career.ts`, existing `simulate-season` command split pattern.
   - Impact: reduced locality and harder future UI migration.
   - Blocks next phase? No.
   - Recommended handling: Phase 22 should add private career command Modules for parsing, summary formatting, save loading, and action formatting before Phase 23 adds progression orchestration.

### Medium

1. Balance remains credible, but current `demo-001` champion has 61 points in one single-seed season.
   - Impact: not a batch blocker because strict `calibration-v1` passes, but single seasons can still look flat.
   - Recommended handling: keep monitoring after career progression exists; do not retune in Phase 22 unless a regression appears.

2. Career save schema version is still early.
   - Impact: acceptable now, but Phase 22 will add progression state and may require a clear migration story.
   - Recommended handling: keep schema changes narrow and tested through storage.

3. Market and formation inspection are still demo/profile driven.
   - Impact: acceptable for pre-loop validation; too limited for long-term fun.
   - Recommended handling: after Phase 23, decide whether the next product pressure is general market search, scouting visibility, or youth intake.

### Low

1. Historical docs contain outdated next-phase recommendations.
   - Impact: can confuse future agents.
   - Recommended handling: keep treating old roadmap/audit recommendations as historical unless `docs/PROJECT_STATUS.md` says they are active.

2. Local CLI save files accumulate in an ignored folder.
   - Impact: acceptable local runtime artifact.
   - Recommended handling: Phase 22 should document or expose the save directory clearly before more save-writing commands exist.

### Accepted Risk

- The match engine is still aggregate-first. This is acceptable for a playable loop MVP because the next phase is about continuity and consequence, not live match-day depth.
- Youth, scouting, contracts, staff, facilities, UI, and advanced economy remain out of scope until the loop exists.

Readiness score: 88 / 100.

## 7. Next Phase Spec Recommendation

Recommended next sequence:

1. `Phase 22 - Pre Playable Loop Hardening`;
2. `Phase 23 - Playable Career Loop MVP`.

Goal:

Reach a safer pre-loop readiness score first, then create the first cohesive save-driven career loop from existing systems.

Why it is next:

- The project can now create a distinct generated career world.
- Career state can be persisted and inspected.
- Permanent transfers can be applied durably.
- The user can already inspect squad shape, player identities, fixture detail, condition, lineups, tactics, and market output.
- What is missing is continuity: one career command flow that loads the same save, advances the world, writes the result, and lets the user continue.
- What should be closed first is small but important: career CLI module pressure, explicit save runtime behavior, automated career determinism coverage, and unambiguous phase numbering.

Prerequisites already satisfied:

- deterministic `GameState`;
- JSON career storage;
- `CareerState`;
- `CareerWorldMetadata`;
- generated player identities;
- seed-varying generated squads;
- permanent-transfer persistence;
- fixture and season simulation;
- localized CLI labels;
- balance gate.

Proposed Phase 22 step outline:

1. Roadmap/status alignment.
2. Career CLI module boundary hardening.
3. Career save runtime policy.
4. Career determinism golden checks.
5. Phase 23 readiness review.

Proposed Phase 23 step outline:

1. Phase 22 output review.
2. Career summary command from a loaded save.
3. Career next-fixture or next-round progression contract.
4. Persisted fixture/round progression application.
5. Career command for inspect/advance/reload verification.
6. Manual decision continuity check: transfer or lineup/tactic choice survives the loop.
7. Playability report and next-phase decision.

Constraints for Phase 22:

- Do not implement the playable loop.
- Do not add UI.
- Do not add youth, scouting, contracts, wages, loans, AI market behavior, staff, facilities, media, or advanced economy.
- Do not add automatic lineup, tactic, or market decisions.
- Do not regenerate the career world after save creation.
- Keep commands deterministic and localized.
- Keep career-loop code modular; do not turn `career.ts` into a second broad `simulate-season.ts`.

Constraints for Phase 23:

- Do not add UI.
- Do not add youth, scouting, contracts, wages, loans, AI market behavior, staff, facilities, media, or advanced economy.
- Do not add automatic lineup, tactic, or market decisions.
- Do not regenerate the career world after save creation.
- Keep commands deterministic and localized.
- Keep career-loop code modular; do not turn `career.ts` into a second broad `simulate-season.ts`.

Manual checks before approving Phase 23 implementation:

```sh
pnpm cli career --save=phase21-audit-world --inspect
pnpm cli simulate-season --seed=demo-001
pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006
pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict
```

## Final Verification

Final phase checks:

- `pnpm check`: pass.
  - lint: pass.
  - dependency cruiser: pass, 145 modules and 492 dependencies.
  - localized presentation text: pass.
  - tests: 49 files, 358 tests passed.
  - workspace typecheck: pass.
- `pnpm cli simulate-season --seed=demo-001`: pass.
- `pnpm cli simulate-season --seed=world-a --identity-review`: pass.
- `pnpm cli simulate-season --seed=world-b --identity-review`: pass.
- `pnpm cli career --save=phase21-audit-world --seed=world-a --new-world-preview`: pass.
- `pnpm cli career --save=phase21-audit-world --inspect`: pass.
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`: pass.
- `git diff --check`: pass.
