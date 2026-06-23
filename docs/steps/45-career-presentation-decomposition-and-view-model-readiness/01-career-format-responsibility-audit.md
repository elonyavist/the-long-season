# 01 - Career Format Responsibility Audit

## Goal

Map the current responsibilities inside
`apps/cli/src/commands/career/format.ts` before moving code.

The file is large enough that decomposition without an audit risks moving code
by line count instead of by output family. This step should identify which parts
are career overview presentation, preparation presentation, matchday
presentation, roster/development presentation, market presentation, season
rollover presentation, and shared formatting helpers.

## Expected files

- `apps/cli/src/commands/career/format.ts`
- `apps/cli/src/commands/career.ts`
- existing career helper modules under `apps/cli/src/commands/career/`
- `docs/audits/CAREER_PRESENTATION_DECOMPOSITION_AUDIT.md`
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Read:
  - `docs/ARCHITECTURE.md`
  - `docs/audits/CLI_ADAPTER_DECOMPOSITION_REPORT.md`
  - `docs/audits/CLI_PRESENTATION_BOUNDARY_REVIEW.md`
  - `docs/audits/ARCHITECTURE_READABILITY_REVIEW.md`
- Inspect `career/format.ts`, `career.ts`, and current career helper modules.
- Group current output by responsibility:
  - new-world preview;
  - summary and inspect;
  - persisted match preparation;
  - saved lineup and tactic output;
  - fixture advancement and explanation trace output;
  - squad and youth academy output;
  - development report output;
  - season rollover output;
  - market apply output;
  - shared label/money/player/fixture helpers.
- Identify one low-risk extraction for Step 02.
- Record what must remain in `format.ts` for now.
- Do not change source unless the audit finds a harmless comment typo or stale
  reference in touched files.

## What NOT to implement

- Do not move code yet.
- Do not change career CLI output.
- Do not add UI view models.
- Do not add new tests except when a harmless source edit requires it.
- Do not tune gameplay, content, market, development, or diagnostics.
- Do not add a new abstraction before the responsibility map exists.

## Required checks

- `git diff --check`

## Definition of Done

- The audit identifies current career presentation responsibilities.
- The audit recommends the exact Step 02 extraction target.
- No code behavior changes are made.
- `docs/PROJECT_STATUS.md` points to Step 02 as the next active step.
