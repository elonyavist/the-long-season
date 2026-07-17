# Step 08 - Consolidated Findings, Remediation Map, And Next-Phase Decision

## Status

Pending.

## Goal

Consolidate all Phase 73A evidence into one prioritized product-quality report,
one bounded remediation map, and exactly one next-phase recommendation.

## Scope

- Reconcile duplicate or conflicting findings from Steps 01-07.
- Produce one canonical P0/P1/P2/Monitor register with:
  - user-facing impact;
  - reproducible evidence;
  - affected surfaces and journeys;
  - architecture/presentation owner;
  - bounded remediation direction;
  - regression and manual-inspection gate;
  - dependency or sequencing constraint.
- Group systemic findings before screen-local polish so the same problem is not
  fixed repeatedly.
- Define an incremental remediation sequence in which every future step creates
  one browser-visible, user-testable improvement and removes replaced code in
  the same scope.
- Explicitly preserve real working behavior, tactical-board ownership,
  deterministic engine facts, localization, SQLite/OPFS persistence, command
  feedback, and Posta lifecycle.
- Decide exactly one next phase:
  - a bounded Phase 73B UI/UX remediation phase when P0/P1 product debt should
    be resolved before adding more systems; or
  - the already-roadmapped Phase 74 when the current product baseline is strong
    enough and remaining findings can be deferred safely.
- Update both career roadmaps and architecture documentation only where the
  audit changes the documented current understanding.

## Expected files

- `docs/audits/WEB_PRODUCT_UI_UX_QUALITY_AUDIT.md`
- `docs/roadmaps/WEB_UI_UX_PREMIUM_REMEDIATION_MAP.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/roadmaps/CAREER_PLAYABILITY_AND_ENGINE_ROADMAP.md`
- `docs/ARCHITECTURE.md` only if the audit corrects a factual ownership error.
- `docs/PROJECT_STATUS.md`

## Final report requirements

The report must contain:

- executive product verdict without hiding material weaknesses;
- current surface and journey coverage;
- highest-impact usability and visual findings;
- accessibility and responsive verdict;
- frontend maintainability verdict;
- tactical-board preservation statement;
- current strengths that remediation must not regress;
- prioritized finding register;
- explicit deferred/future-scope register;
- manual inspection checklist;
- exactly one next-phase recommendation with evidence.

## What NOT to implement

- No production, test, CSS, translation, dependency, or runtime change.
- No vague recommendation such as `polish the UI` without bounded surfaces,
  outcomes, and gates.
- No single giant rewrite phase when findings can be sequenced incrementally.
- No recommendation that creates decorative screens before real workflows.
- No silent renumbering or replacement of Phase 74.

## Required checks

```bash
nvm use 24
test -f docs/audits/WEB_PRODUCT_UI_UX_QUALITY_AUDIT.md
test -f docs/roadmaps/WEB_UI_UX_PREMIUM_REMEDIATION_MAP.md
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run test
pnpm --filter @game/web run build
pnpm depcruise
pnpm check
git diff --check
```

## Manual inspection

- Can the user inspect the evidence and understand why each P0/P1 matters?
- Does the remediation order improve journeys before decorative polish?
- Does every future implementation slice have a visible test target and a
  deletion/cleanup boundary?
- Is exactly one next phase recommended?

## Completion criteria

- All findings are deduplicated, prioritized, and evidence-backed.
- The remediation map is incremental, dependency-aware, and user-testable.
- Current strengths and non-regression boundaries are explicit.
- Future workflow absence is not mislabeled as current UI failure.
- No production source changed during Phase 73A.
- `pnpm check` passes.
- `docs/PROJECT_STATUS.md` marks Phase 73A complete and records exactly one next
  action.
