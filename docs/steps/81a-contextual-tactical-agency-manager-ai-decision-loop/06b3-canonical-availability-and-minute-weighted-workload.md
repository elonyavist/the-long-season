# Step 06B3 - Canonical Availability And Minute-Weighted Workload

## Status

**Done (2026-08-08).** Availability, participation and fitness now cross the
automatic competition boundary through canonical facts; the full gate is green.

## Goal

Carry injury/suspension consequences and recent participation through automatic
seasons, and replace appearance-based fitness spend with a single actual-minute
load derivation. Recovery remains age-neutral in this step.

## User-Facing Reason

Players who leave after an hour, enter for twenty minutes, miss a fixture or
start three matches in a short interval must not look identical to a rested
ninety-minute starter when the AI chooses the next team.

## What To Implement

1. Give automatic seasons one explicit availability lifecycle shared across
   competitions and season boundaries.
2. Filter unavailable players before selection through the canonical
   `playerUnavailabilityReason(...)` owner.
3. Feed every completed report into
   `applyMatchAvailabilityConsequences(...)`; return final availability and
   ordered consequences rather than reconstructing them.
4. Move the ordinary career's recent-use projection to the participation owner
   if required, then use that one projection in both career and batch paths.
5. Derive match load from exact participation minutes. A substitute pays only
   for his minutes; a starter removed early stops paying at that minute.
6. Let tactical intensity and role affect load only if an existing canonical
   fact already owns them. Do not restate match-condition formulas.
7. Preserve opening fitness and ordered recovery dates across competition
   loops; one competition must not reset another's state.

## What NOT To Implement

- No age factor, hard age bands or injury-probability change.
- No direct goal/assist penalty.
- No training injuries.
- No duplicate `7`/`28`-day counter if the participation ledger can derive it.
- No persistence/schema/beta reset.

## Structural Invariants

- zero unavailable selected starters;
- zero availability/consequence reconciliation failures;
- load is `0` at `0` minutes and strictly increases over reachable positive
  minute samples;
- a `30`-minute appearance costs less than `60`, which costs less than `90`;
- the same minutes and inputs produce the same load regardless of report detail;
- recent-use ordering has a stable player-ID tie-breaker;
- no missing workload is interpreted as zero in a locked profile.

## Expected Files

- `packages/engine/src/use-cases/simulate-season.ts` and test
- `packages/engine/src/career/career-ai-team-selection.ts`
- `packages/engine/src/career/player-participation.ts` and test
- `packages/engine/src/career/match-availability-consequences.ts` and test, only
  if the canonical owner needs a deeper batch Interface
- `packages/engine/src/player-state/fitness.ts` and test
- `packages/engine/src/career/career-condition-consequences.ts` and test
- `packages/engine/src/career/progress-fixture.ts` and test. The played-career
  commit currently supplies starters rather than the canonical participation
  rows to condition spend; leaving it untouched would preserve a second
  appearance-based fitness path beside the new batch owner.
- `packages/engine/src/index.ts`
- `apps/cli/src/commands/simulation-report/career-world-facts.ts` and test
- this step document
- `docs/PROJECT_STATUS.md`
- `06b4-soft-age-resilience-and-recovery.md`

The existing uncommitted lifecycle prototype is audited hunk by hunk. Code not
owned by this contract is removed or deferred; it is never grandfathered in.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run packages/engine/src/use-cases/simulate-season.test.ts packages/engine/src/career/player-participation.test.ts packages/engine/src/career/match-availability-consequences.test.ts packages/engine/src/player-state/fitness.test.ts --maxWorkers=7
pnpm check
git diff --check
graphify update .
```

## Definition Of Done

Availability, consequences, recent use and minute load have one canonical owner
and work in automatic seasons; actual substitutions change subsequent load;
age behaviour is untouched; no old appearance-cost caller or compatibility
wrapper remains; Step 06B4 is next.

## Adopted Solution

- `spendFitnessForMinutes(...)` is the only match-spend primitive. It consumes
  exact participation intervals; the former one-cost-per-player export and all
  callers were removed.
- played and automatic fixtures build participation once and feed those rows to
  both condition spend and the durable ledger.
- `recentPlayerUseForFixture(...)` owns the month-to-date projection for career
  and batch AI. During a competition it reads the durable ledger plus one
  ordered open-month contribution list; that list is consolidated when the
  month changes and once at season exit.
- automatic seasons carry availability, consequences and participation
  explicitly. Selection filters through `playerUnavailabilityReason(...)`.
- the report composition root carries final fitness, availability, ledger and
  the exact played fixtures into the next competition/season. Keeping the
  fixtures satisfies the domain invariant that every injury/suspension names
  the real fixture that caused it.

The first implementation consolidated the whole immutable ledger after every
fixture. A focused CLI test remained CPU-bound beyond five minutes, exposing
quadratic copying. It was stopped and replaced by open-month consolidation;
the full repository gate then completed in `406.14s`, consistent with the
pre-step `408.10s`/`414.13s` runs.

## Verification

- focused engine/type checks: `66` tests green;
- real rollover and development-cohort paths: green in `39.03s` and `58.86s`;
- full `pnpm check`: `295` files, `2254` tests, `858` modules,
  `CHECK_EXIT=0`;
- `git diff --check`: clean;
- age, recovery curve and injury probability remain unchanged for Step 06B4.
