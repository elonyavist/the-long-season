# 07 - Next Phase Spec Recommendation

## Goal

Close the audit with a concrete recommendation for the next phase, without starting that phase.

This step should give the user a clear decision point: proceed to the recommended phase, complete a focused rework first, or change direction deliberately.

## What to implement

- Finalize `docs/audits/PROJECT_ROADMAP_AND_CODE_AUDIT.md`.
- Recommend one next phase with:
  - phase name;
  - goal;
  - why it is next;
  - prerequisites already satisfied;
  - blockers or reworks required first;
  - proposed step outline;
  - manual checks the user should run before approving it.
- If the recommended next phase is a playable career loop, keep it focused on:
  - creating/loading a career;
  - selecting a club;
  - inspecting current squad/world state;
  - making one or two durable user choices;
  - advancing through a minimal time/match loop;
  - preserving deterministic saves.
- Update `docs/PROJECT_STATUS.md` to mark Phase 21 complete or blocked.

## What NOT to implement

- Do not create the next phase step documents.
- Do not implement source code.
- Do not modify `docs/PROJECT_RULES.md`.
- Do not modify `requirements.md` unless a blocking documentation correction was explicitly found earlier in the phase.
- Do not choose multiple next phases.

## Expected files

- `docs/audits/PROJECT_ROADMAP_AND_CODE_AUDIT.md`
- `docs/PROJECT_STATUS.md`

## Required checks

- `pnpm check`
- `pnpm cli simulate-season --seed=demo-001`
- `pnpm cli simulate-season --seed=world-a --identity-review`
- `pnpm cli simulate-season --seed=world-b --identity-review`
- `pnpm cli career --save=phase21-audit-world --seed=world-a --new-world-preview`
- `pnpm cli career --save=phase21-audit-world --inspect`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`
- `git diff --check`

## Definition of Done

- The audit report is complete.
- The next recommended phase is explicit.
- The report states what the user should manually inspect.
- `docs/PROJECT_STATUS.md` marks Phase 21 complete or blocked.
- No next-phase code or docs are started.

