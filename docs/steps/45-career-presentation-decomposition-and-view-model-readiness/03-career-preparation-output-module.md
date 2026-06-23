# 03 - Career Preparation Output Module

## Goal

Extract career match-preparation presentation from `career/format.ts` into a
named CLI-local module.

This step should cover:

- saved lineup output;
- saved tactic output;
- persisted match-preparation lines shown by summary/inspect, if the helper is
  now shared with the overview module;
- saved lineup slot lines;
- lineup change lines;
- tactic setup formatting.

## Expected files

- `apps/cli/src/commands/career.ts`
- `apps/cli/src/commands/career/format.ts`
- `apps/cli/src/commands/career/preparation-output.ts`
- `apps/cli/src/commands/career/overview-output.ts` only if shared preparation
  rendering is imported there
- `apps/cli/src/commands/career/preparation.ts`
- focused career CLI tests
- `docs/audits/CAREER_PRESENTATION_DECOMPOSITION_AUDIT.md`
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Move preparation output and directly-owned helpers.
- If summary/inspect need match-preparation lines, expose a narrow formatter
  with a clear input contract instead of duplicating lines.
- Keep the command rule that the user explicitly chooses lineup and tactic
  profiles.
- Keep localization keys unchanged.
- Update the audit with moved helpers and any remaining shared helper pressure.

## What NOT to implement

- Do not change saved lineup or tactic persistence.
- Do not add automatic lineup or tactic selection.
- Do not change match preparation schema.
- Do not add new lineup/tactic demo profiles.
- Do not move fixture advancement output in this step.
- Do not create UI view models or a UI package.

## Required checks

- `pnpm --filter @game/cli run typecheck`
- focused career CLI tests for preparation output
- `pnpm check`
- `pnpm cli career --save=phase45-prep --seed=world-a --new-world-preview`
- `pnpm cli career --save=phase45-prep --set-lineup-demo=pro01-first-team`
- `pnpm cli career --save=phase45-prep --set-tactic-demo=pro01-balanced`
- `pnpm cli career --save=phase45-prep --summary`
- `git diff --check`

## Definition of Done

- Preparation output lives in a named module with clear ownership.
- Existing lineup/tactic save behavior and output remain stable.
- No automatic user decisions are introduced.
- `docs/PROJECT_STATUS.md` points to Step 04 as the next active step.
