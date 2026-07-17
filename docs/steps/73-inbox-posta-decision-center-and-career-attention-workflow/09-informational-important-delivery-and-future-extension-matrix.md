# Step 09 - Informational And Important Delivery And Future Extension Matrix

## Status

Done.

## Goal

Complete the first useful non-blocking Posta content without inventing systems
that the career does not yet support.

## Scope

- Deliver the played-fixture result as one informational message derived from
  the committed structured match report.
- Include ordinary condition, form, and morale consequences in that result
  message when the committed report already exposes them; do not duplicate
  each consequence as separate mail.
- Deliver a season-rollover summary as one important message only when the
  current season-transition flow owns the supporting structured facts.
- Make the rollover message stop `Continue` once, become acknowledged when
  opened, and never block the new season after acknowledgement.
- Use stable functional sources such as `match_report` and
  `competition_office`; do not invent staff identities.
- Preserve deterministic message IDs, ordering, same-date batching, and
  current-season ownership.
- Keep exceptional player consequences informational until the engine exposes
  an explicit severity fact. Do not infer severity from rating deltas, copy,
  color, or UI thresholds.
- Create a future extension matrix covering market, player contracts,
  finances, youth academy, and staff.
- For every future area, record:
  - the real workflow prerequisite;
  - the structured facts it must eventually expose;
  - the unresolved product decision for attention level;
  - the future resolution condition;
  - the destination screen;
  - the domain, engine, storage, and UI owner;
  - an explicit `not implemented in Phase 73` marker.

## Expected files

- `packages/domain/src/career/inbox.ts`
- `packages/domain/src/career/inbox.test.ts`
- `packages/engine/src/career/career-inbox-lifecycle.ts`
- `packages/engine/src/career/career-inbox-lifecycle.test.ts`
- `packages/engine/src/career/advance-career-season.ts`
- `packages/engine/src/career/advance-career-season.test.ts`
- `packages/ui/src/career/career-inbox-view.ts`
- `packages/ui/src/career/career-inbox-view.test.ts`
- `apps/web/src/features/inbox/career-inbox-presenter.ts`
- `apps/web/src/features/inbox/career-inbox-presenter.test.ts`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `docs/audits/CAREER_INBOX_FUTURE_MESSAGE_EXTENSION_MATRIX.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_PLAYABILITY_AND_ENGINE_ROADMAP.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/steps/73-inbox-posta-decision-center-and-career-attention-workflow/10-calendar-transition-and-continue-feedback.md` only if a lesson changes future scope.

## Message policy checks

- A played fixture creates at most one result summary message.
- Result review does not stop `Continue` again.
- Ordinary player consequences do not create notification noise.
- Rollover stops once and only when a supported rollover actually occurred.
- No message references data that cannot survive save/load.
- The future matrix is documentation, not a registry consumed by production
  code.

## What NOT to implement

- No market, contract, finance, youth, or staff message category.
- No generic notification registry prepared for future callers.
- No exceptional-consequence threshold owned by UI presentation code.
- No prose-only match report, board message, rumor, or news feed.
- No previous-season archive.

## Required checks

```bash
nvm use 24
pnpm exec vitest run packages/domain/src/career/inbox.test.ts packages/engine/src/career/career-inbox-lifecycle.test.ts packages/engine/src/career/advance-career-season.test.ts packages/ui/src/career/career-inbox-view.test.ts apps/web/src/features/inbox/career-inbox-presenter.test.ts packages/i18n/src/labels.test.ts
pnpm --filter @game/domain run typecheck
pnpm --filter @game/engine run typecheck
pnpm --filter @game/ui run typecheck
pnpm --filter @game/i18n run typecheck
pnpm --filter @game/web run typecheck
pnpm depcruise
git diff --check
graphify update .
```

## Completion criteria

- Real result and supported rollover facts reach Posta with correct attention
  behavior.
- Informational messages never interrupt advancement.
- Important rollover attention stops once and acknowledges durably.
- No unsupported system produces messages or production scaffolding.
- The five future workflow areas remain visible in the extension matrix.
- `docs/PROJECT_STATUS.md` marks Step 09 Done and Step 10 active.
