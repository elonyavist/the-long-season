# Project Status

This file is the project handoff snapshot for LLMs and junior developers. Update it after every step attempt, completed step, rework decision, and adopted solution change.

## Current State

- Phase: documentation and planning for Phase 0/1.
- Active implementation step: `docs/steps/00-foundation/01-domain-core-types.md`.
- Code status: monorepo skeleton exists; no gameplay implementation code exists yet.
- Runtime: Node `v24.16.0` from `.nvmrc`.
- First command milestone: `pnpm cli doctor`.
- First gameplay milestone: `pnpm cli simulate-season --seed=demo-001`.
- Source of truth: `requirements.md`.

## Current Active Step

- Step: `docs/steps/00-foundation/01-domain-core-types.md`
- Status: Not started
- Last verification: `pnpm install`, `pnpm test`, `pnpm -r run typecheck`, `pnpm cli`, `pnpm check`, and TypeScript path alias inspection passed for the monorepo skeleton.
- Next action: Implement dependency-free domain core types only.

## How To Read The Project

1. Read `requirements.md` for product and architecture intent.
2. Read `docs/PROJECT_RULES.md` for non-negotiable rules.
3. Read this file for current state and adopted solutions.
4. Read `docs/steps/README.md` for the iterative workflow.
5. Read only the active step file before implementing.

## Step Ledger

| Step | Status | Outcome | Adopted solution | Verification |
|---|---|---|---|---|
| `docs/steps/00-foundation/00-monorepo-skeleton.md` | Done | Minimal pnpm workspace and empty package entrypoints were created. | Root pnpm workspace with `apps/cli`, `packages/domain`, `packages/shared`, `packages/engine`, `packages/content`, and `packages/storage`; placeholder scripts stay non-gameplay until enforcement. | `pnpm install`; `pnpm test`; `pnpm -r run typecheck`; `pnpm cli`; `pnpm check`; `tsc --showConfig` alias check |
| `docs/steps/00-foundation/01-domain-core-types.md` | Not started | None yet | Planned dependency-free domain contracts | Pending |
| `docs/steps/00-foundation/02-shared-rng-and-date.md` | Not started | None yet | Planned deterministic RNG and pure date utilities | Pending |
| `docs/steps/00-foundation/03-storage-json.md` | Not started | None yet | Planned JSON storage behind `GameStorage` | Pending |
| `docs/steps/00-foundation/04-enforcement.md` | Not started | None yet | Planned dependency-cruiser, ESLint, Vitest, `pnpm check`, `pnpm cli doctor` | Pending |
| `docs/steps/01-match-engine/01-team-strength.md` | Not started | None yet | Planned role-weight-based team strength | Pending |
| `docs/steps/01-match-engine/02-match-context.md` | Not started | None yet | Planned serializable match input contract | Pending |
| `docs/steps/01-match-engine/03-step-match.md` | Not started | None yet | Planned one-minute deterministic match step | Pending |
| `docs/steps/01-match-engine/04-simulate-match.md` | Not started | None yet | Planned batch driver over `stepMatch` | Pending |
| `docs/steps/01-match-engine/05-match-report.md` | Not started | None yet | Planned structured language-agnostic match report | Pending |
| `docs/steps/02-season-simulation/01-calendar-generation.md` | Not started | None yet | Planned deterministic double round-robin calendar | Pending |
| `docs/steps/02-season-simulation/02-fixtures-and-results.md` | Not started | None yet | Planned fixture result application as source of truth | Pending |
| `docs/steps/02-season-simulation/03-league-table.md` | Not started | None yet | Planned derived deterministic league table | Pending |
| `docs/steps/02-season-simulation/04-simulate-season-cli.md` | Not started | None yet | Planned first gameplay milestone CLI command | Pending |
| `docs/steps/02-season-simulation/05-season-balance-report.md` | Not started | None yet | Planned aggregate deterministic calibration report | Pending |

Status values:

- `Planned`: identified as future work but not yet the active step.
- `Not started`: documented but no implementation work done.
- `In progress`: currently being implemented.
- `Done`: implementation merged locally and Definition of Done satisfied.
- `Rework`: implemented but needs correction before the next step.
- `Skipped`: intentionally not done, with reason recorded in Outcome.

## Adopted Solutions

- Documentation is split into executable implementation steps under `docs/steps/`.
- Work proceeds one active step at a time.
- The process is incremental and iterative: implement, test, learn, update next step, advance.
- The mandatory execution loop is: read status, choose active step, implement, test, fix or adjust next step, update status briefly, advance.
- Future scope is kept in `docs/steps/99-future/README.md` as a queue, not a ban list.
- `docs/PROJECT_RULES.md` is stable across phases; moving forward should add step docs, not rewrite rules.
- The first implementation target remains a CLI-first deterministic monorepo, not UI or persistence.
- The Step Ledger tracks individual step files, not only broad phase groups.
- Every step prompt tells the implementer to read and update `docs/PROJECT_STATUS.md`.
- `pnpm` is exposed through Corepack under Node `v24.16.0`; this shell required `source ~/.nvm/nvm.sh && nvm use` before running pnpm commands.

## Open Decisions And Follow-Up

- The monorepo skeleton uses placeholder `lint`, `depcruise`, and `test` scripts until the enforcement step replaces them with real tooling.
- `pnpm-lock.yaml` was created by the required `pnpm install` verification even though it was not listed in the step `Expected files`; keep it as the workspace lockfile.
- `pnpm install` resolved TypeScript `^5.8.3` to `5.9.3`; keep this acceptable unless a later step needs a pinned compiler version.
- After `04-enforcement`, record the exact lint and dependency-cruiser rules adopted.
- After the first match simulation steps, record the first statistical behavior that tests expose.

### 2026-06-14 — `docs/steps/00-foundation/00-monorepo-skeleton.md`

- Status: Done
- Outcome: Created the minimal pnpm workspace and package skeleton without gameplay code.
- Adopted solution: Root workspace scripts are placeholders for this step; real lint, dependency cruising, and doctor command remain in `04-enforcement`.
- Verification: `pnpm install`; `pnpm test`; `pnpm -r run typecheck`; `pnpm cli`; `pnpm check`; `pnpm exec tsc --showConfig -p apps/cli/tsconfig.json`.
- Follow-up: Start `docs/steps/00-foundation/01-domain-core-types.md`; `pnpm-lock.yaml` is an accepted install artifact from this step.

## Update Protocol

For every step attempt, follow this loop:

1. Read this file.
2. Choose the active step.
3. Implement only that step.
4. Run the required checks.
5. If something is wrong, fix the current step or update the next relevant step document.
6. Update this file in a short entry.
7. Advance only when the step Definition of Done is satisfied.

When updating this file:

1. Update `Current Active Step`.
2. Change the row in the Step Ledger to `Done`, `Rework`, `Skipped`, or the next appropriate status.
3. Summarize the outcome in one sentence.
4. Record the adopted solution, not every rejected option.
5. Add the verification command or test result.
6. Add any lesson that changes future work to `Open Decisions And Follow-Up`.
7. If the next step changed, update that step document before implementation starts.

## Handoff Note Template

Use this format at the end of a step:

```md
### YYYY-MM-DD — Step path

- Status: Done | Rework | Skipped
- Outcome:
- Adopted solution:
- Verification:
- Follow-up:
```
