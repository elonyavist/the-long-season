# 01 - Phase 50 Output And Layout Accessibility Scope

## Goal

Review the Phase 50 Continue/InBox output and lock the Phase 51 shell direction
before changing web code.

This step should decide exactly how top navigation, left Inbox/Posta placement,
central content, and WCAG 2.2 AA expectations are represented in project docs.

## Expected files

- `docs/audits/WEB_SHELL_LAYOUT_ACCESSIBILITY_SCOPE.md`
- `requirements.md`
- `docs/PROJECT_RULES.md`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Read `docs/audits/CAREER_CONTINUE_INBOX_FOUNDATION_REPORT.md`.
- Read the current web shell files enough to understand existing layout shape.
- Create `docs/audits/WEB_SHELL_LAYOUT_ACCESSIBILITY_SCOPE.md`.
- Record the adopted shell direction:
  - top global navigation;
  - left Inbox/Posta rail;
  - central selected-screen outlet;
  - Continue as a prominent career action.
- Record which current Phase 50 behavior must be preserved.
- Record WCAG 2.2 AA as the web UI working target.
- Update `requirements.md` only where it describes UI/UX and accessibility
  expectations.
- Update `docs/PROJECT_RULES.md` with concise web accessibility rules if they
  are not already present.
- Do not change source code in this step.

## What NOT to implement

- Do not edit React components.
- Do not edit CSS.
- Do not add new UI contracts.
- Do not add an accessibility dependency unless a later step explicitly decides
  it is needed.
- Do not implement match preparation.
- Do not start the layout rework before the scope is documented.

## Required checks

- `test -f docs/audits/WEB_SHELL_LAYOUT_ACCESSIBILITY_SCOPE.md`
- `rg -n "WCAG|accessibility|accessibilità|Inbox|Posta|navigation|navigazione" requirements.md docs/PROJECT_RULES.md docs/audits/WEB_SHELL_LAYOUT_ACCESSIBILITY_SCOPE.md`
- `git diff --check`

## Definition of Done

- The web shell direction is documented before source changes.
- Accessibility is a binding project constraint, not a chat-only preference.
- Phase 50 Continue/Inbox behavior is listed as behavior to preserve.
- `docs/PROJECT_STATUS.md` identifies Step 02 as the next action.
