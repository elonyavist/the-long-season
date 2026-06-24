# 01 - Current Web Architecture Audit

## Goal

Audit the current `apps/web` structure before moving files or installing
tooling.

The audit must identify actual friction, not theoretical architecture
preferences.

## Expected files

- `docs/audits/WEB_ARCHITECTURE_FOUNDATION_AUDIT.md`
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Map current `apps/web/src` folders and file responsibilities.
- Identify which Modules are too broad, too shallow, or poorly located.
- Identify where React state currently lives and which state should move to a
  Zustand store.
- Identify which CSS files/classes are common utilities, feature styling, or
  genuinely custom retro-football surfaces.
- Record current tests and visual QA scripts that must keep passing.
- Use graphify to scope the current web dependency graph if available.
- Decide whether the phase can proceed without changing product behavior.

## What NOT to implement

- Do not move files.
- Do not install dependencies.
- Do not edit React behavior.
- Do not rewrite CSS.
- Do not create a folder structure before documenting the target map.

## Required checks

- `test -f docs/audits/WEB_ARCHITECTURE_FOUNDATION_AUDIT.md`
- `git diff --check`

## Definition of Done

- The audit names concrete architecture problems and concrete non-problems.
- The audit states why this phase should happen before Inbox/Posta Decision
  Center.
- `docs/PROJECT_STATUS.md` identifies Step 02 as the next action.
