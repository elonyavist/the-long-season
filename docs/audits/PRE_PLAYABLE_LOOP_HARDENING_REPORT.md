# Pre Playable Loop Hardening Report

Date: 2026-06-21

Phase: `22-pre-playable-loop-hardening`

Status: Complete

## Executive Summary

Score after hardening: 95 / 100

Phase 22 closed the concrete pre-loop risks identified by the Phase 21 audit without adding gameplay scope. The project is now ready to start `Phase 23 - Playable Career Loop MVP`.

The score is not `100 / 100` because the save-driven playable loop itself is still not implemented. That remaining gap is the explicit scope of Phase 23, not a blocker for starting it.

## What Changed

### Roadmap And Status Alignment

- Phase 21 remains the completed audit gate.
- Phase 22 is now explicitly the hardening phase.
- Phase 23 is now explicitly the playable career loop MVP.
- `docs/PROJECT_STATUS.md` identifies one active next step at a time.

### Career CLI Module Boundaries

- `apps/cli/src/commands/career.ts` was reduced to command orchestration.
- Private modules now own focused responsibilities:
  - `apps/cli/src/commands/career/parse-career-args.ts`;
  - `apps/cli/src/commands/career/scenarios.ts`;
  - `apps/cli/src/commands/career/format.ts`;
  - `apps/cli/src/commands/career/types.ts`.
- Existing career command behavior was preserved.

### Career Save Runtime Policy

- Career CLI output now shows the effective save directory.
- New `career.saveDirectory` label is localized across the five supported languages.
- `.gitignore` explicitly ignores `apps/cli/saves/` in addition to generic `saves/`.

### Career Determinism Golden Checks

- Same career world seed now has automated stability coverage.
- Different world seeds still have automated variation coverage.
- Accepted permanent transfers now have reload-persistence coverage across fresh storage adapter instances.

## Phase 21 Risks Revisited

### Resolved

- Active roadmap/status ambiguity around Phase 22 versus Phase 23.
- Career CLI module pressure before adding career-loop behavior.
- Implicit local save directory behavior.
- Manual-only career determinism checks for creation/inspection/transfer persistence.

### Reduced

- Future Phase 23 implementation risk: career loop work now has smaller CLI modules to build on.
- Future UI migration risk: formatting and orchestration are less entangled than before.

### Still Accepted

- The match engine remains aggregate-first. This is acceptable for Phase 23 because the next milestone is continuity and consequence, not live match-day depth.
- Career commands are still CLI-first. UI remains intentionally out of scope until the CLI proves the loop.
- Save schema is still early. Phase 23 may need a narrow schema migration if progression state requires it.

## Readiness Decision

Phase 23 can start.

Recommended active next phase:

`docs/steps/23-playable-career-loop-mvp/`

Recommended active next step:

`docs/steps/23-playable-career-loop-mvp/01-phase-22-output-review.md`

## Verification

Focused checks run during Phase 22:

- `pnpm --filter @game/cli run typecheck`
- `pnpm --filter @game/i18n run typecheck`
- `pnpm --filter @game/storage run typecheck`
- `pnpm exec vitest run apps/cli/src/commands/career.test.ts`
- `pnpm exec vitest run apps/cli/src/commands/career.test.ts packages/i18n/src/labels.test.ts`
- `pnpm exec vitest run apps/cli/src/commands/career.test.ts packages/storage/src/career-storage.test.ts`
- `pnpm cli career --save=phase22-boundary-world --seed=world-a --new-world-preview`
- `pnpm cli career --save=phase22-boundary-world --inspect`
- `pnpm cli career --save=phase22-save-policy-world --seed=world-a --new-world-preview`
- `pnpm cli career --save=phase22-save-policy-world --inspect`
- `git check-ignore -v apps/cli/saves/career/save%3Aphase22-save-policy-world.career.json`
- `pnpm check`

Final phase-level verification:

- `pnpm check`
- `pnpm cli career --save=phase22-hardening-world --seed=world-a --new-world-preview`
- `pnpm cli career --save=phase22-hardening-world --inspect`
- `pnpm cli simulate-season --seed=world-a --identity-review`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`
- `git diff --check`

Result: all final checks passed.
