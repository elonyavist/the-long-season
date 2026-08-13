# Step 14 - Post-Match Preparation And Single Persistence Integration

## Status

**Ready for contract alignment.** Step 13 is Done. Before implementation, this
step must remove its obsolete same-facts AI premise and preserve Amendment
A11: pre-match AI may optimize only from its own squad and current condition,
never from opponent information. No production file is open until that local
contract correction is complete.

## Goal

Give manager and AI one post-match decision that can improve or worsen the next
match according to condition, schedule, plan, and opponent knowledge.

## What To Implement

Add one weekly preparation priority:

- `recovery`: marginal fitness, no rehearsal or study;
- `plan_rehearsal`: bounded next-match execution of one named plan, no marginal
  recovery or deeper read;
- `opponent_study`: higher `OpponentRead` confidence, no direct outcome bonus.

Base physiological recovery remains owned by
`applyCareerWeeklyRecovery(...)`. The new Module owns only the discretionary
allocation. Effects are targeted, expiring, consumed once, and never permanent
strength.

AI chooses from the same options and facts as the manager. Persist decision,
target, and expiry only; derive summaries.

Integrate all Phase 81A durable facts together: career `lateralFocus`, raw
opponent fielded formation, raw tactical chapter boundaries/facts, and the
preparation decision. Advance SQLite, event, envelope, and supported beta
versions exactly once here; delete incompatible careers without migration,
dual readers, optional legacy fields, or defaults. A save produced after this
reset remains loadable through Checkpoints E and F.

This is the phase's single coordinated **storage schema/event-envelope**
advance. It is separate from Step 06B7F1's already-completed content bundle
`v8` invalidation. Beta saves may be discarded at either boundary; no
compatibility reader is retained.

After the reset, `formation_history` becomes the sixth `OpponentRead` component.
It is usable only with a positive sample and its own confidence; volatile or
insufficient history remains `not_observed`, never a reconstructed default.

## Expected Files

- `packages/domain/src/state/career-state.ts`
- `packages/domain/src/state/career-state.test.ts`
- `packages/domain/src/entities/tactic.entity.ts`
- `packages/domain/src/entities/match.entity.ts`
- `packages/engine/src/career/career-preparation-priority.ts`
- `packages/engine/src/career/career-preparation-priority.test.ts`
- `packages/engine/src/career/career-ai-preparation-policy.ts`
- `packages/engine/src/career/career-ai-preparation-policy.test.ts`
- `packages/engine/src/career/career-weekly-recovery.ts`
- `packages/engine/src/career/career-weekly-recovery.test.ts`
- `packages/engine/src/career/career-match-state-consequences.ts`
- `packages/engine/src/match-engine/create-match-report.ts`
- `packages/engine/src/match-engine/create-match-report.test.ts`
- `packages/engine/src/match-engine/progressive-match-session.ts`
- `packages/engine/src/match-engine/progressive-match-session.test.ts`
- `packages/storage/src/sqlite/sqlite-career-schema.ts`
- `packages/storage/src/sqlite/career-state-mapper.ts`
- `packages/storage/src/sqlite/career-state-mapper.test.ts`
- `packages/storage/src/career-storage.contract.test.ts`
- `packages/storage/src/career-storage.test.ts`
- `packages/storage/src/save-metadata.ts`
- `packages/storage/src/career-save-envelope.ts`
- `packages/storage/src/json-career-storage.test.ts`
- `packages/ui/src/career/career-matchday-view.ts`
- `packages/ui/src/career/career-matchday-view.test.ts`
- `apps/web/src/features/matchday/MatchdayFullTimePhase.tsx`
- `apps/web/src/features/matchday/MatchdayFullTimePhase.test.tsx`
- `apps/web/src/runtime/web-career-runtime.ts`
- `apps/web/src/runtime/web-career-runtime.test.ts`
- `packages/i18n/src/labels.ts`
- `docs/PROJECT_STATUS.md`
- this step document
- `15-checkpoint-e-multi-match-consequence.md`

## Required Checks

```bash
nvm use 24
pnpm exec vitest run packages/engine/src/career/career-preparation-priority.test.ts
pnpm exec vitest run packages/engine/src/career/career-ai-preparation-policy.test.ts
pnpm exec vitest run packages/engine/src/career/career-weekly-recovery.test.ts
pnpm exec vitest run packages/engine/src/match-engine/create-match-report.test.ts
pnpm exec vitest run packages/engine/src/match-engine/progressive-match-session.test.ts
pnpm exec vitest run packages/storage/src/sqlite/career-state-mapper.test.ts
pnpm exec vitest run packages/storage/src/career-storage.contract.test.ts
pnpm exec vitest run packages/storage/src/career-storage.test.ts
pnpm exec vitest run packages/storage/src/json-career-storage.test.ts
pnpm exec vitest run apps/web/src/runtime/web-career-runtime.test.ts
pnpm check
pnpm --filter @game/web run build
pnpm web:visual:qa
git diff --check
graphify update .
```

## Definition Of Done

All three options are reachable, targeted, exclusive, expiring, save-safe, and
best/worst in at least one real context; the phase has exactly one coordinated
storage schema/event-envelope advance, owned here;
the four durable concerns round-trip together; a career created at the reset
survives every later save/load path; formation history is reachable on real
reports and absent honestly when insufficient; no past match changes; manager
and AI share facts; Step 15 is next.
