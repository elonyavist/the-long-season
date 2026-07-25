# Step 03 - Window Eligibility And Out-Of-Window Policy

## Status

Done.

## Goal

Create one engine-owned answer for which market actions are legal on the
current game date and why.

## User-Visible Outcome

The manager can browse Market all year, but illegal actions are unavailable
with a useful reason and next date instead of failing late or disappearing.

## Scope

1. Define structured eligibility for permanent club-to-club offers, transfer
   completion, ordinary external free-agent registration, renewals, and
   preliminary agreements.
2. Allow permanent offers and completions only inside the active competition
   window.
3. Allow current-player renewals throughout the year.
4. Allow preliminary agreements throughout the year only when the target has
   six contract months or less remaining.
5. Keep Market inspection and player-detail access available while closed.
6. Expire an unresolved transfer stage at window close; never carry it into a
   closed period or silently reopen it later.
7. Return stable reason codes plus active close or next-open date.
8. Route every selected-club and AI market entry point through this policy.

## Implementation Contract

- One pure eligibility query owns the rule; UI, AI, CLI, and storage do not
  duplicate date comparisons.
- Renewal and preliminary-agreement eligibility remain distinct from transfer
  registration eligibility.
- A disabled browser command is presentation only; the engine must reject the
  same invalid command independently.

## Expected Files

- focused market-eligibility Module/tests under `packages/engine/`
- current transfer, free-agent, and contract command callers identified by
  Step 01
- package export files only where required
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What NOT To Implement

- No UI, offer lifecycle, AI targeting, or persistence change beyond the
  eligibility contract required by this step.
- No emergency exception, manual override, or transfer-window setting.
- No loan or registration-quota rule.

## Required Checks

```bash
nvm use 24
pnpm --filter @game/engine run test
pnpm --filter @game/engine run typecheck
pnpm check
git diff --check
graphify update .
```

## Manual Inspection

- Inspect one date inside each window, one boundary date, and one closed date.
- Verify permanent transfer, renewal, and preliminary-agreement actions produce
  different truthful results on the same closed date.

## Completion Criteria

- Every current market entry point uses one eligibility owner.
- Illegal actions fail with stable facts and useful dates.
- No window comparison remains in browser or AI presentation code.
- Step 04 is the only next implementation step.
