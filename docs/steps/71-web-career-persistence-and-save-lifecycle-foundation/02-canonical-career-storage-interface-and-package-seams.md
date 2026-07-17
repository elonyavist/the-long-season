# 02 - Canonical Career Storage Interface And Package Seams

## Goal

Make the existing career persistence interface safe for both Node and browser
adapters before adding SQLite.

## Scope

- Keep `CareerStorage` as the canonical manager-career interface unless Step 01
  documents a binding reason to change it.
- Add deterministic career-save listing to the interface.
- Use the audited method name
  `listCareers(): Promise<readonly SaveMetadata[]>`, ordered by `saveId`.
- Separate browser-safe interfaces/envelopes/migrations from Node filesystem
  implementation files.
- Keep `career-storage.interface.ts` free of Node imports;
  `career-save-envelope.ts` owns persisted envelope migration and
  `json-career-storage.ts` is the only career-storage module allowed to import
  Node filesystem/path built-ins.
- Preserve the public CLI imports while removing internal files made obsolete
  by the split.
- Keep `JsonCareerStorage` behavior and tests green.
- Clarify the distinct current use of raw `GameStorage`; do not create another
  overlapping save interface.
- Add contract tests reusable by both JSON and SQLite adapters where practical.
- Delete the former combined `career-storage.ts` module after active imports
  move; do not retain it as a compatibility re-export.

## What NOT to implement

- No SQLite dependency or SQL schema yet.
- No browser API or React changes.
- No generic repository base class.
- No compatibility file without an active import or documented immediate
  migration need.
- No change to football state or engine behavior.

## Expected files

- `packages/storage/src/career-storage.interface.ts`
- `packages/storage/src/career-save-envelope.ts`
- `packages/storage/src/json-career-storage.ts`
- `packages/storage/src/career-storage.ts`
- `packages/storage/src/career-storage.test.ts`
- `packages/storage/src/json-career-storage.test.ts`
- `packages/storage/src/index.ts`
- `packages/storage/package.json`
- `apps/cli/src/commands/career.ts`
- `apps/cli/src/commands/career.test.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/steps/71-web-career-persistence-and-save-lifecycle-foundation/03-durable-active-match-checkpoint-contract.md`

## Required checks

```bash
nvm use 24
pnpm exec vitest run packages/storage/src apps/cli/src/commands/career.test.ts
pnpm --filter @game/storage run typecheck
pnpm --filter @game/cli run typecheck
pnpm depcruise
git diff --check
```

## Definition of Done

- Browser-safe code can import `CareerStorage` without pulling Node filesystem
  modules into the bundle.
- Career saves can be listed through the canonical interface.
- JSON CLI round trips remain unchanged.
- Removed internal structure leaves no duplicate interface or orphan wrapper.
