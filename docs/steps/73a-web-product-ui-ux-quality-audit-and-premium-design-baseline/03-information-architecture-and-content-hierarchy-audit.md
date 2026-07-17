# Step 03 - Information Architecture And Content Hierarchy Audit

## Status

Pending.

## Goal

Verify that every screen communicates one football-management purpose, exposes
the facts needed for the current decision, and removes technical or duplicate
noise from the manager's reading path.

## Scope

- Review each in-scope surface and state from Step 01.
- For every screen record:
  - the manager question it answers;
  - the dominant action or deliberate read-only purpose;
  - what must appear in the first useful viewport;
  - primary, supporting, contextual, and diagnostic information;
  - duplicate information and labels that expose implementation language;
  - empty/loading/error copy and recovery guidance;
  - narrow-screen reading order and landmark order.
- Audit global shell density, Dashboard hierarchy, Posta list/detail hierarchy,
  preparation context, tactical workspace adjacency, matchday scoreboard/event/
  rating hierarchy, full-time consequences, and save/recovery messaging.
- Check that structured facts are translated into football language without
  rendering stable IDs, schema terms, adapter names, or internal status prose.
- Identify information that should be removed, collapsed, moved, or deferred,
  while preserving the underlying real decision.
- Lock a screen-purpose statement and first-viewport contract for every current
  surface.

## Expected files

- `docs/audits/WEB_INFORMATION_ARCHITECTURE_AND_CONTENT_HIERARCHY_AUDIT.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/steps/73a-web-product-ui-ux-quality-audit-and-premium-design-baseline/04-premium-visual-system-and-component-language-audit.md` only if the hierarchy audit changes its assumptions.

## Required evidence

- Screen-by-screen content hierarchy table.
- First-useful-viewport screenshot evidence at desktop and narrow widths.
- Exact examples of duplicate, technical, unclear, or misplaced information.
- Proposed content disposition: keep, emphasize, demote, move, combine, remove,
  or future scope.
- Localization and structured-fact ownership for any copy finding.

## What NOT to implement

- No copy, layout, route, localization, or presenter changes.
- No replacement prose written directly into production code.
- No recommendation to remove a fact without identifying where the manager can
  still inspect it when needed.
- No decorative content added to fill empty space.

## Required checks

```bash
nvm use 24
test -f docs/audits/WEB_INFORMATION_ARCHITECTURE_AND_CONTENT_HIERARCHY_AUDIT.md
git diff --check
```

## Manual inspection

- Can the purpose of each screen be stated in one sentence?
- Are football decisions and consequences visible before technical detail?
- Does narrow reading order preserve the same hierarchy?

## Completion criteria

- Every current screen has one purpose and first-viewport contract.
- All visible information has a documented hierarchy and disposition.
- Technical IDs and duplicate content have exact evidence and ownership.
- Empty, loading, error, and completed states are included.
- `docs/PROJECT_STATUS.md` marks Step 03 Done and Step 04 active.
