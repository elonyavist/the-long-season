# Step 01 - Current Regression Surface Audit

## Goal

Audit the current simulation and career regression surface before adding tests.

The output should tell a junior developer which behavior is already protected,
which behavior is only smoke-tested, and which behavior is currently vulnerable
to silent drift.

## Expected files

- `docs/audits/ENGINE_SAFETY_NET_AUDIT.md`
- `docs/PROJECT_STATUS.md`

## What to implement

- Review current test coverage around:
  - `simulateSeason`;
  - `simulateMatch`;
  - `stepMatch`;
  - `progressNextCareerFixture`;
  - league table derivation;
  - player stats derivation;
  - long-run/balance report gates.
- Identify the specific user-facing behavior each missing test would protect.
- Classify gaps as:
  - deterministic repeat risk;
  - football plausibility risk;
  - career-loop drift risk;
  - reporting-only risk.
- Decide the minimum golden evidence for this phase.
- Document which behavior must not be pinned because it would create brittle
  tests without user value.

## What NOT to implement

- Do not add or edit source tests in this step.
- Do not tune engine behavior.
- Do not add new commands.
- Do not change thresholds.
- Do not write a broad architecture review; keep this focused on regression
  gates.

## Required checks

```sh
nvm use 24
test -f docs/audits/ENGINE_SAFETY_NET_AUDIT.md
git diff --check
```

## Definition of Done

- The audit lists existing relevant tests and commands.
- The audit names the exact tests that Phase 62 should add.
- The audit states the user-facing reason for every proposed regression gate.
- `docs/PROJECT_STATUS.md` marks this step complete or blocked.

