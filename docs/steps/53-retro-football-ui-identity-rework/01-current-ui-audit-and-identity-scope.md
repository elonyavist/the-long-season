# 01 - Current UI Audit And Identity Scope

## Goal

Audit the current Phase 52 web UI and lock the retro-football identity direction
before changing source code.

This step should document what is currently wrong with the interface, what the
new visual direction is, and which screens must be reworked in this phase.

## Expected files

- `docs/audits/WEB_RETRO_FOOTBALL_UI_IDENTITY_SCOPE.md`
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Review Phase 52 screenshot evidence under `/tmp/the-long-season-phase52` if
  available.
- Review current web shell, dashboard, Inbox/Posta, and match-preparation files.
- Create `docs/audits/WEB_RETRO_FOOTBALL_UI_IDENTITY_SCOPE.md`.
- Record why the current UI does not yet feel like football management.
- Record the adopted direction:
  - Championship Manager / Scudetto retro with modern detail;
  - club control room;
  - vertical tactical pitch;
  - compact squad list;
  - true Inbox/Posta decision rail;
  - restrained football graphics;
  - minimal functional icons.
- Record what must stay functionally unchanged from Phase 52.
- Record what must not be implemented in this visual phase.
- Do not change source code in this step.

## What NOT to implement

- Do not edit React components.
- Do not edit CSS.
- Do not add icons, images, or assets.
- Do not create new UI read models.
- Do not implement the visual rework before the scope is documented.

## Required checks

- `test -f docs/audits/WEB_RETRO_FOOTBALL_UI_IDENTITY_SCOPE.md`
- `rg -n "Championship|Scudetto|retro|pitch|Inbox|Posta|control room|football" docs/audits/WEB_RETRO_FOOTBALL_UI_IDENTITY_SCOPE.md`
- `git diff --check`

## Definition of Done

- The visual identity direction is documented before source changes.
- Current UI problems are concrete, not vague.
- Functional behavior to preserve is explicit.
- `docs/PROJECT_STATUS.md` identifies Step 02 as the next action.
