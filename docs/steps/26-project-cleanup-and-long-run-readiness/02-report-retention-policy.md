# Step 02 - Report Retention Policy

## Goal

Define a simple policy for keeping, archiving, or deleting audits and roadmap documents.

## Context

The user wants less chaos. The project still needs a useful memory for LLMs and junior developers, but not every old speculative document should remain in the active reading path.

## Expected files

- `docs/audits/README.md`
- `docs/archive/README.md`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Create or update an audit index that identifies active reports.
- Define archive criteria.
- Define deletion criteria.
- Record that `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, and current phase docs remain active.
- Make clear that archived files are not part of the normal active reading path.

## What NOT to implement

- Do not move files yet.
- Do not delete files yet.
- Do not change project rules.
- Do not implement code.

## Required checks

- `test -f docs/audits/DOCUMENTATION_NOISE_AUDIT.md`
- `git diff --check`

## Definition of Done

- The project has a documented active/audit/archive distinction.
- A future LLM knows which reports to read first.
- The next step can archive obsolete documents without guessing.

