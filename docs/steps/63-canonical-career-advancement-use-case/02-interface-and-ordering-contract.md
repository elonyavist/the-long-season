# 02 - Interface And Ordering Contract

## Goal

Define the canonical season advancement contract before implementation.

The contract must make the future engine Module closed to accidental adapter changes and open to future systems such as economy, staff, contracts, and richer UI explanations.

## Expected files

- `docs/audits/CAREER_ADVANCEMENT_INTERFACE_CONTRACT.md`
- `docs/PROJECT_STATUS.md`

## What to implement

1. Define the public Interface for the use-case.
2. Decide the exact input and output shape, including:
   - current career state;
   - world seed or deterministic seed context;
   - selected club id;
   - season id/date context;
   - already completed fixture facts or fixture simulation inputs, if currently required;
   - options needed by existing CLI/report flows.
3. Define result statuses, at minimum:
   - `advanced`;
   - `invalid` or `blocked`, when advancement would require a user decision.
4. Define the canonical order of internal operations.
5. Define structured facts returned by the Module. Facts must be useful for CLI, reports, and future UI.
6. Define what callers are allowed to own:
   - save loading and writing;
   - command parsing;
   - formatting;
   - batch loop orchestration;
   - web view-model presentation.
7. Define what callers are not allowed to own:
   - season advancement order;
   - development/aging orchestration;
   - youth lifecycle orchestration;
   - squad refresh orchestration;
   - transfer turnover orchestration.

## What NOT to implement

- Do not implement the Module yet.
- Do not change source code.
- Do not create new gameplay rules.
- Do not add narrative text generation.
- Do not hide selected-club decisions behind automation.

## Required checks

```bash
nvm use 24
test -f docs/audits/CAREER_ADVANCEMENT_INTERFACE_CONTRACT.md
git diff --check
```

## Completion notes

Update `docs/PROJECT_STATUS.md` with:

- active step path;
- contract status;
- chosen Interface name;
- chosen advancement order;
- unresolved questions, if any.
