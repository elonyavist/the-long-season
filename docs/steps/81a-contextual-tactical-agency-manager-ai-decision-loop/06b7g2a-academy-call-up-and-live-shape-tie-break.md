# Step 06B7G2A - Academy Call-Up Depth And Live Shape Tie-Break

## Status

Done. The fresh L4.5 retry recorded `GO`.

## Goal

Give automatic clubs credible match-day depth without filling youth-owned
senior places with generated incumbents, and ensure equal structural formation
fits are resolved by available footballers rather than catalog order.

## Product Decision

- Keep the generated senior base at `22` and the promotion ceiling at `25`.
- Automatic selection may add at most the three strongest available academy
  players from that club to its pool.
- Call-ups remain academy members until canonical promotion; no contract,
  ownership or persistence fact is invented.
- Real senior minutes already enter the canonical ledger. Existing academy
  participation subtracts them from low-detail load, preventing two schedules.
- Structural squad fit stays primary. Only an exact tie reads the live XI score
  already owned by selection: condition, recent use and public current quality.

## What To Implement

1. Extend `selectCareerAiTeam(...)` with a deterministic call-up derivation:
   availability first, public current level, public P50, stable player ID;
   maximum three.
2. Use the existing selected lineup/bench IDs joined to academy membership as
   ephemeral evidence; do not store a duplicated call-up field, second roster
   or copy of academy membership.
3. Deepen `strongestShapeFromCatalog(...)` with a lazy secondary assignment
   only when structural scores tie. Compare total live XI quality, then raise
   the weakest starter lexicographically; exact football equality uses the
   stable formation key, never catalog traversal. Ordinary choices pay no
   second walk.
4. Expose weak, forced-invalid and avoidable-invalid facts from the exact
   selector reasons in the existing formation projection. A weak credible fit
   is diagnostic; catalog AI invalid fits are forced because its ordinary
   candidate lists exclude them, including the emergency-goalkeeper seam.
5. Repeat L4.5 on a fresh facts-cache suffix.

## What NOT To Implement

- no `25` or `26` generated senior incumbents;
- no extra free-agent maintenance target;
- no formation preference, familiarity table or opponent read;
- no second selector or report-only candidate pool;
- no change to development, injuries, recovery, retirement or persistence.

## Expected Files

- `packages/engine/src/career/career-ai-team-selection.ts` and
  `progress-fixture.test.ts`, whose existing integration fixture owns the
  canonical career-AI selection proof;
- `packages/engine/src/team-selection/ai-squad-selection.ts` and test;
- `packages/engine/src/use-cases/simulate-season.ts` and test; the checkpoint
  production path owns fixture-by-fixture background selection and must consume
  the same call-up derivation as live career selection;
- `apps/cli/src/commands/simulation-report/career-world-facts.ts`; supplies
  academy membership to that engine policy without ranking candidates in CLI;
- `apps/cli/src/commands/simulation-report/career-sections.ts` and test;
- generational-succession checkpoint module and test, only for the corrected
  forced/avoidable reader;
- report registry/profile only for a fresh facts-cache suffix;
- this document, L4.5, phase README and `docs/PROJECT_STATUS.md`.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run packages/engine/src/career/career-ai-team-selection.test.ts packages/engine/src/team-selection/ai-squad-selection.test.ts apps/cli/src/commands/simulation-report/career-sections.test.ts apps/cli/src/commands/simulation-report/generational-succession.test.ts
pnpm typecheck
git diff --check
```

Then repeat L4.5 alone with exactly seven workers and a fresh cache.

## Definition Of Done

Real generated data reaches a selected academy call-up; the 22 senior IDs stay
unchanged; a structural tie is resolved by live XI quality; unavoidable and
avoidable invalid selections take different gate branches; no dead field or
second roster remains.

## Recorded Result

The retry hash is `d9113b1687950a60870e724ad98a433c`. It observed
`3,234` selected academy call-ups, zero catalog-order-sensitive selections,
zero fallback, zero avoidable invalid slots and zero reconciliation failures.
Forced invalid (`33`) and weak legal (`116`) slots remained reachable. The
generated senior base stayed `22`; the solution uses the existing academy
membership and does not create an extra roster.
