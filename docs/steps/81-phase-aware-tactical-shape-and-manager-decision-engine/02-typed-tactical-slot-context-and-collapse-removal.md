# Step 02 - Typed Tactical Slot Context And Collapse Removal

## Status

Done on 2026-08-03.

### Adopted Solution

`SelectedLineupSlot` now carries `CanonicalPlayerRole` instead of a role-weight
key, and `LineupSlot` carries the canonical role plus its derived line, position
family, and channel. `createLineupSlot(...)` is the single constructor, so no
caller can ship a slot whose facts disagree with its role.
`ROLE_WEIGHT_KEY_BY_CANONICAL_ROLE` in `team-strength.ts` is the one place that
decides which ability weights a role uses, declared with `satisfies` so a new
canonical role fails the build.

`fieldablePlayerIds` / `fieldablePlayerIdsFor` in
`packages/engine/src/squad/squad-depth.ts` own squad depth, and
`scripts/check-squad-depth-accessor.ts` is the absence assertion over the seven
lineup-composing files. It is wired into `pnpm check`.

### Collapses Removed

Six, not the one the step originally named. Each mapped a role onto a narrower
vocabulary, and each had drifted differently:

- `matchday-adapter.ts` - `engineRoleKeyForPersistedRole`;
- `live-match-control-report-data.ts` - `engineRoleKey`;
- `tactical-shape-report-data.ts` - `engineRoleKey`, added by Step 01;
- `ai-squad-selection.ts` - `roleWeightKeyByDepartment`, plus a two-step fallback
  chain that probed for a profile and silently degraded when it missed;
- `player-participation.ts` - `canonicalRoleForRoleKey`, the *inverse* collapse:
  it tried to reconstruct a canonical role from the weight key, with a `default`
  branch that answered `central_midfielder` for anything it did not recognise;
- three separate copies of `formatLineupRole` in the CLI, now one owner reading
  the existing `career.player.role.*` labels.

The `player-participation.ts` one was silently wrong before this step: a
recorded participation could attribute minutes to a role the player never
played, because the weight key had already thrown the information away.

### Stored Versus Derived

A standing project rule applies here and changed the design after the first
pass: **information is never duplicated; at most it is shared.**

The first version of this step carried `roleKey`, `line`, and `positionFamily`
on every `LineupSlot`. All three follow from `canonicalRole`, so all three were
copies, and copies are what produced the six collapses in the first place. They
are gone. A slot now stores exactly two facts that cannot be derived:

- `canonicalRole` - the manager's actual choice;
- `side` - the formation's explicit channel, which distinguishes `cb-left` from
  `cb-right` and is real input rather than a copy of anything.

`canonicalRoleTacticalFacts(...)` and `roleWeightKeyForCanonicalRole(...)` are
the shared derivations. Three further duplications were found and removed the
same way:

- `CANONICAL_ROLE_TACTICAL_FACTS` restated every role's department, which
  `CANONICAL_PLAYER_ROLE_DEPARTMENT` already held, and restated the position
  family as the role itself twelve times. The table now declares only line and
  channel - the two facts genuinely independent of the department - and derives
  the rest. The test that existed to prove the two department tables agreed was
  the tell: a test whose job is to catch drift between two sources of truth
  means there should be one.
- The precomputed facts record was exported and used by nobody. Removed.
- Seven type re-exports were added to `packages/engine/src/squad/index.ts` and
  consumed by nobody. Only `CanonicalPlayerRole` survives, because web and CLI
  use it.

Two fallbacks went with them. `chance-actors.ts` looked up role weights with
`?? DEFAULT_OUTFIELD_ROLE_WEIGHT`, and three modules re-derived "is this a
goalkeeper" from a lowercased string with `["gk", "por", "goalkeeper"]`. The
mapping is total now, so the weight tables are total and the goalkeeper check is
`slot.canonicalRole === "goalkeeper"`.

### Two Collapses Deliberately Kept

`broadRole(...)` in `match-preparation-adapter.ts` and `roleKeyForDomainSlot(...)`
in `packages/ui` still map onto four broad values, and that is on purpose. They
are presentation, not gameplay: they group players for a compact squad table and
they run over `PlayerRole`, a different union from `CanonicalPlayerRole`. No
match calculation reads either.

Removing them would mean deciding what a squad table shows, which is a UI
question this step does not own. They are named here so a later reader does not
mistake them for a missed migration. The Definition of Done is about the
*gameplay* mapping, and web now owns none.

### Verification

```text
pnpm typecheck                        exit 0, all packages
domain + engine + simulation-tools + storage    131 files, 958 tests passed
web + ui + i18n + content                       117 files, 657 tests passed
apps/cli                                          6 files, 144 tests passed, exit 0
pnpm lint                             clean
pnpm depcruise                        no violations (791 modules, 3168 dependencies)
pnpm check:localized-text             OK
pnpm check:squad-depth                OK (7 lineup-composing files)
git diff --check                      clean
```

The CLI suite failed six tests on the first full run and one on the second. All
seven were assertions matching the old four-way role labels (`goalkeeper`,
`attacker`) against output that now renders canonical ones (`Goalkeeper`,
`Striker`, `Central midfielder`). No production behaviour was involved.

### Blocker / Lesson

Two scope corrections were found against the code and are recorded above the
original text: the collapse lived in the domain lineup rather than only in the
web Adapter, and persistence was in scope because `match_preparation_lineup`
stores the role. The persisted column keeps its name and type; its values change
meaning, so `persistedCanonicalRole(...)` rejects a pre-change beta save rather
than reinterpreting it. That means the beta reset lands here, not at Step 08.

One genuine mistake was made and corrected: the four `lineup.role.*` labels were
deleted as dead once the CLI stopped using them, but the web still uses them for
its broad squad-table vocabulary. They were restored. Broad presentation labels
are a separate concept from engine role weights and legitimately survive.

### Next Action

Step 03.

## Scope Corrections Found By Step 01

Two facts were established while closing Step 01 and change this step's scope.
They are recorded here so the step is planned against the code rather than
against the plan.

**The collapse is in the domain lineup, not only in the web Adapter.**
`SelectedLineupSlot.roleKey` is already the *engine role-weight key*
(`gk` / `defender` / `midfielder` / `attacker`), so the canonical role is
discarded before the lineup ever crosses into domain. Removing
`engineRoleKeyForPersistedRole` from `matchday-adapter.ts` therefore does not
finish the job: `SelectedLineupSlot` must carry `CanonicalPlayerRole`, and the
engine must derive the weight key from it. The same four-way mapping is
duplicated three more times and all four go together:

- `apps/web/src/features/matchday/matchday-adapter.ts` - `engineRoleKeyForPersistedRole`;
- `apps/cli/src/commands/live-match-control-report-data.ts` - `engineRoleKey`;
- `apps/cli/src/commands/tactical-shape-report-data.ts` - `engineRoleKey`;
- `apps/web/src/features/match-preparation/match-preparation-adapter.ts` - `broadRole`,
  which collapses over a different role vocabulary again.

**Persistence is in scope, and so is a beta reset.** `SelectedLineup` is durable:
`packages/storage/src/sqlite/career-state-mapper.ts` writes and reads
`match_preparation_lineup.role_key`. The column is `TEXT NOT NULL`, so the
schema itself needs no change - but its *values* change meaning from `attacker`
to `striker`, and an existing beta save would then fail canonical-role
validation. Add that mapper to Expected Files, and note that the beta reset this
implies lands here rather than at Step 08, which currently claims it.

The domain already provides half of what the typed seam needs:
`CANONICAL_PLAYER_ROLES`, `CANONICAL_PLAYER_ROLE_DEPARTMENT`, `FormationLine`,
`FormationPositionFamily`, and `FormationSide` all exist. What is missing is a
total `CanonicalPlayerRole -> { line, positionFamily, implied side }` mapping in
`formations.ts` and a total `CanonicalPlayerRole -> role-weight key` mapping in
`team-strength.ts`, each with a `never` guard.

## Goal

Carry canonical formation and positional facts into the match context through
typed domain unions, and remove the web-owned four-role tactical collapse.

## User-Facing Reason

The match cannot react credibly to the manager's formation if line, channel,
position family, and canonical role are discarded before simulation.

## What To Implement

- Deepen the lineup-slot/team-context seam so each selected slot carries typed
  `FormationLine`, `FormationPositionFamily`, optional `FormationSide`,
  `CanonicalPlayerRole`, and its destination-role weight key.
- Keep `slotId` as identity only. Remove every parser or convention that tries
  to recover tactical meaning from it.
- Move canonical-role-to-role-weight resolution out of the web Adapter into
  one engine-owned total mapping with deterministic failure for unsupported
  profiles.
- Remove `engineRoleKeyForPersistedRole` and every equivalent four-way web
  mapping once callers use the typed builder.
- Update manager, batch, manual-tactic, test-fixture, and current AI context
  builders to provide the same typed facts.
- Name the background driver among the seam's consumers (A1): building a context
  for a club the user has not selected is a first-class case of this builder,
  not a later special case. No behaviour for it lands here; the contract records
  that a non-selected club is an ordinary caller, so Step 08's single
  constructor is not designed around the selected club alone.
- Introduce one named squad-depth accessor and route every lineup-composing path
  through it (A6). No production path in this phase reads `club.playerIds`
  directly to decide who can be fielded. The accessor returns the club's
  fieldable players and is the single definition Phase 82A later widens to
  separate ownership from sporting registration. Step 01's inventory lists the
  readers this step must convert; leaving one is a Step 02 failure, not a Phase
  82A discovery.
- Add total mappings and `never` guards for every formation line, position
  family, side, and canonical role consumer.
- Preserve existing `TeamStrength` numbers for ordinary lineups in this step;
  no shape behaviour lands yet.

## Clean-Code Requirements

- Do not add optional tactical fields to preserve callers. Migrate every
  current caller in this step.
- Do not expose five separate primitive parameters where one named tactical
  slot fact owns the invariant.
- Remove obsolete adapters, fallback role maps, fixtures, and tests made
  redundant by the typed seam.
- Exported contracts explain identity versus tactical semantics and exhaustive
  failure modes.

## What NOT To Implement

- No intrinsic capacities, matchup, suitability modifier, route, or tactic
  behaviour.
- No open-string line/channel/role values.
- No new formation catalog or UI controls.
- No beta compatibility fallback.
- No loan, registration, or ownership semantics inside the squad-depth accessor.
  It returns the club's fieldable players under today's rules; Phase 82A owns
  the distinction, and pre-building it here would ship an unused abstraction.
- No background-world simulator. A1 names a consumer; it does not add one.

## Expected Files

- `packages/domain/src/tactics/formations.ts`
- `packages/domain/src/tactics/formations.test.ts`
- `packages/domain/src/tactics/index.ts`
- `packages/engine/src/match-engine/team-strength.ts`
- `packages/engine/src/match-engine/team-strength.test.ts`
- `packages/engine/src/match-engine/match-context.ts`
- `packages/engine/src/match-engine/match-context.test.ts`
- `packages/engine/src/match-engine/tactic-team-context.ts`
- `packages/engine/src/match-engine/tactic-team-context.test.ts`
- `packages/engine/src/match-engine/manual-tactic-change.ts`
- `packages/engine/src/match-engine/manual-tactic-change.test.ts`
- `packages/engine/src/match-engine/simulate-match-with-manual-tactics.ts`
- `packages/engine/src/match-engine/simulate-match-with-manual-tactics.test.ts`
- `packages/engine/src/match-engine/index.ts`
- `packages/engine/src/team-selection/ai-squad-selection.ts`
- `packages/engine/src/team-selection/ai-squad-selection.test.ts`
- `apps/web/src/features/match-preparation/match-preparation-adapter.ts`
- `apps/web/src/features/match-preparation/match-preparation-adapter.test.ts`
- `apps/web/src/features/matchday/matchday-adapter.ts`
- `apps/web/src/features/matchday/matchday-adapter.test.ts`
- `apps/cli/src/commands/live-match-control-report-data.ts`
- `apps/cli/src/commands/tactical-shape-report-data.ts`
- `packages/domain/src/entities/tactic.entity.ts`
- `packages/domain/src/entities/tactic.entity.test.ts`
- `packages/domain/src/state/career-state.test.ts`
- `packages/storage/src/sqlite/career-state-mapper.ts`
- `packages/engine/src/squad/squad-depth.ts`
- `packages/engine/src/squad/squad-depth.test.ts`
- `packages/engine/src/squad/index.ts`
- `packages/engine/src/career/player-participation.ts`
- `packages/engine/src/match-engine/match-explanation-trace.ts`
- `packages/content/src/generators/fake-players.ts`
- `packages/i18n/src/labels.ts`
- `packages/simulation-tools/src/tactical-shape/tactical-shape-audit.ts`
- `apps/cli/src/commands/career/format.ts`
- `apps/cli/src/commands/career/preparation.ts`
- `apps/cli/src/commands/career/preparation-output.ts`
- `apps/cli/src/commands/career/matchday-output.ts`
- `apps/cli/src/commands/career/progression.ts`
- `apps/cli/src/commands/fake-season-input.ts`
- `apps/cli/src/commands/ten-season-report/report-data.ts`
- `apps/cli/src/commands/simulate-season/demo-builders.ts`
- `apps/cli/src/commands/simulate-season/demo-output.ts`
- `apps/cli/src/commands/simulate-season/fixture-detail-output.ts`
- `scripts/check-squad-depth-accessor.ts`
- `package.json`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- this step document
- the next relevant step document only if a lesson changes future work

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/domain/src/tactics/formations.test.ts \
  packages/engine/src/match-engine/team-strength.test.ts \
  packages/engine/src/match-engine/match-context.test.ts \
  packages/engine/src/match-engine/tactic-team-context.test.ts \
  packages/engine/src/match-engine/manual-tactic-change.test.ts \
  packages/engine/src/match-engine/simulate-match-with-manual-tactics.test.ts \
  packages/engine/src/team-selection/ai-squad-selection.test.ts \
  apps/web/src/features/match-preparation/match-preparation-adapter.test.ts \
  apps/web/src/features/matchday/matchday-adapter.test.ts
pnpm --filter @game/domain run typecheck
pnpm --filter @game/engine run typecheck
pnpm --filter @game/web run typecheck
pnpm depcruise
git diff --check
graphify update .
```

## Definition Of Done

- Every match lineup slot has typed canonical tactical semantics.
- Web owns no canonical-role-to-four-role gameplay mapping.
- Existing ordinary team-strength and match determinism remain unchanged.
- Adding a domain union member breaks exhaustive owners at typecheck.
- One named accessor owns squad depth, and an absence assertion proves no
  lineup-composing path reads `club.playerIds` directly.
- The context seam documents the non-selected club as an ordinary caller.
- No obsolete role-collapse helper or compatibility caller remains.
- Step 03 is the only next action.
