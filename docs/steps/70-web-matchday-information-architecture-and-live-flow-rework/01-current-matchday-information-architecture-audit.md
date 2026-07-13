# 01 - Current Matchday Information Architecture Audit

## Goal

Document why the current matchday screen is confusing before changing code.

This step turns the user review into a concrete design contract: what stays,
what goes, and what each match phase must help the manager decide.

## Scope

- Audit the current pre-match, first-half/half-time, second-half, and full-time
  matchday surfaces.
- Identify duplicated, scattered, misleading, or debug-like information.
- Define the one job and one primary action for each phase.
- Record which current facts can support the requested tabellino, ratings, and
  consequences.
- Record missing facts without inventing UI placeholders.
- Update the web roadmap Phase 70 progress note.

## What NOT to implement

- No React, CSS, engine, or i18n code changes.
- No new event kinds.
- No visual redesign yet.
- No persistence.
- No attempt to hide current UI problems by changing labels only.

## Expected files

- `docs/audits/MATCHDAY_INFORMATION_ARCHITECTURE_AUDIT.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## Required checks

```bash
git diff --check
```

## Visual check for the user

No browser slice is required in this audit step.

Acceptance:

- the audit clearly explains why the current matchday feels scattered;
- the audit identifies each phase's single job;
- the audit lists exactly which information should be removed, merged, or
  demoted;
- the audit confirms that the tactical board remains only in decision phases.

Stop after this step for review before changing matchday code.

## Definition of Done

- The phase has a written information architecture target.
- The current UI critique is captured in project documentation, not only chat.
- Status and roadmap are updated.
