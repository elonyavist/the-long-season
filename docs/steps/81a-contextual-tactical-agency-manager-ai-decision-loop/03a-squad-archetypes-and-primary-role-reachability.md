# Step 03A - Squad Archetypes And Primary-Role Reachability

## Status

Not started. Authorized by Checkpoint A's `STOP / RETHINK`.

Inserted after Step 03 rather than renumbered in, so the fourteen documents from
Step 04 onward and the design contract's many `Step NN` references keep their
meaning. Steps 04-16 stay closed until Checkpoint A2 records a `GO`.

## Goal

Replace the one squad skeleton every generated club is built from with
deterministic football identities, so the shape a club lines up in becomes a
consequence of the footballers it has.

## User-Facing Reason

Every opponent a player meets is built from the same twenty-two-slot depth
chart, so almost every opponent reaches the same answer. Variety in the football
he faces has to come from variety in the squads he faces.

## Why This Moved Ahead Of Step 08

Checkpoint A falsified the mechanism Step 08 was written for. Step 08 assumed
catalog order was breaking ties; `tieDecidedShare` is `0.0000` and there are no
ties. The squad-generation half of Step 08 is therefore the *first* thing the
phase needs rather than the seventh, because every later checkpoint would
otherwise take its before-state on a population already known to be broken.

Step 08 keeps its other half - lateral execution - which genuinely depends on
Step 05's `lateralFocus` and Step 07's per-task execution and cannot move.

## Measured Before Implementing: The Three Missing Roles Are Two Problems

Read before writing anything. The three absent roles do not share a cause.

**`defensive_midfielder` and `attacking_midfielder` are already reachable.**
`primaryRoleForPosition(...)` maps `dm -> defensive_midfielder` and
`am -> attacking_midfielder` today. Nothing ever generates those positions:
`positionForSlot(...)` never returns `dm` or `am`. This half is pure content.

**`wide_midfielder` is structurally unreachable.** `PlayerPosition` is
`gk | rb | cb | lb | rwb | lwb | dm | cm | am | rw | lw | st` - there is **no
`rm`/`lm`** - and no branch of `primaryRoleForPosition(...)` returns
`wide_midfielder`. No archetype can produce it: the pitch position does not
exist. Reaching ten of ten therefore needs the domain position pair `rm`/`lm`
mapped to `wide_midfielder`, exactly as `rb`/`lb` map to `full_back` and
`rwb`/`lwb` to `wing_back`.

**Checkpoint A2's `10 of 10` target is not lowered to `9 of 10`.** Relaxing a
frozen target on discovering it is inconvenient is the move Checkpoint A refused;
it is not available here either.

### Measured blast radius of the position pair

`26` files mention the sibling literal `"rwb"`, but almost all are fixtures
assigning a position to a test player. Only these are **typed on
`PlayerPosition`** and can fail to compile:

- `packages/domain/src/player/create-player.ts`
- `packages/domain/src/tactics/position-suitability.ts`
- `packages/content/src/generators/player-role-identity.ts`

Six further non-test files switch exhaustively and must be checked:

- `packages/domain/src/player/player-squad-department.ts`
- `packages/engine/src/career/player-development.ts`
- `packages/engine/src/career/player-exits.ts`
- `apps/cli/src/commands/fake-season-input.ts`
- `apps/cli/src/commands/ten-season-report/report-data.ts`
- `packages/content/src/generators/player-role-identity.ts`

`role-weights.json` needs a profile for the new position's role key. Each file
above is added to `Expected Files` with its ownership note as it is reached, not
in advance.

## What To Implement

Replace the single ossature in
[`positionForSlot(...)`](../../../packages/content/src/generators/fake-players.ts)
with deterministic, budgeted squad identities chosen by derived RNG.

Candidate archetypes, to be validated against real generation rather than
adopted as written:

- a holding midfielder and low build-up;
- a playmaking `attacking_midfielder`;
- `wide_midfielder` outfield lines;
- wing-backs and a back three;
- two strikers;
- higher central density.

### Three rules that decide whether this succeeds

1. **An archetype describes players and roles, never a formation.** No
   `preferredFormation` field, no shape key, no hint reachable from generation
   to selection. `strongestCatalogShape(...)` must remain the only thing that
   decides a shape, and it must decide it from footballers.
2. **Do not simply add the three missing roles to every club.** That trades a
   `4-2-4` monoculture for a `4-2-3-1` one and would satisfy no honest gate.
   Abundance must vary *between* archetypes.
3. **All ten primary roles must be reachable in the population. No single squad
   need contain all ten.** A club with no `attacking_midfielder` is football;
   a world with none is the defect.

Squad size, coverage minimums, quality by division, age distribution, rarity
budgets and the exceptional-player allocation are invariants, not free
parameters. This step redistributes roles; it does not make anyone better.

## The Seam, Located

The per-club loop in `generateFakePlayersForClubs(...)`
(`fake-players.ts:160`) already holds everything an identity needs and hands
none of it to the position choice:

```text
for each club (clubNumber, clubContext) x slot (slotNumber 1..22)
  positionForSlot(slotNumber)          <- pure function of the slot, identical for every club
  canonicalRoleForSlot(slotNumber)     <- the same skeleton, second copy
  fakePlayer(id, slotNumber, ..., seed, clubContext)
```

The change is to derive one squad identity per club from
`deriveRng(seed, "squad-identity", clubNumber)` and thread it into both mappings,
so the depth chart becomes a property of the club rather than of the slot number.

Four things must survive the change:

1. **`canonicalRoleForSlot(...)` and `positionForSlot(...)` are the same skeleton
   written twice.** They must move together or a club's opening lineup will
   disagree with its own players. Deriving one from the other is the fix; two
   archetype tables is the defect.
2. **Slot number still encodes depth.** `slotDepthOffset(slotNumber)` and
   `slotNumber <= FAKE_LINEUP_SIZE` decide starter versus reserve and feed the
   ability profile. An identity may change *which role* a slot holds, never
   which slots are the eleven.
3. **The rarity and exceptional allocations key on
   `playerRaritySlotKey(clubNumber, slotNumber)`**, before positions are chosen.
   Identity must not move a budgeted six-star onto a different slot.
4. `deriveRng` is keyed by `clubNumber`, not by club order in a list, so the
   identity is stable under any reordering of the world.

## What NOT To Implement

No conservation, no route change, no `lateralFocus`, no per-task execution, no
change to `strongestCatalogShape(...)` or any selector, no formation catalog
edit, no tactic behaviour, no persistence change.

## Expected Files

- `packages/content/src/generators/fake-players.ts`
- `packages/content/src/generators/fake-players.test.ts`
- `packages/content/src/generators/player-role-identity.ts`
- `packages/content/src/generators/player-role-identity.test.ts`
- `packages/domain/src/entities/player.entity.ts`
- `packages/domain/src/tactics/position-suitability.ts`
- `packages/domain/src/tactics/position-suitability.test.ts`
- `packages/domain/src/player/create-player.ts`
- `docs/PROJECT_STATUS.md`
- this step document
- `03b-checkpoint-a2-real-career-squad-identity.md`

Generation-adjacent files discovered during implementation are added here with
an ownership note before being edited, never silently.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run packages/content/src/generators/fake-players.test.ts
pnpm check
git diff --check
graphify update .
```

## Definition Of Done

Archetypes are deterministic and reproducible from `(worldSeed, clubId)`, all ten
primary roles are reachable on real generated worlds, no archetype names or
implies a formation, every squad invariant is unchanged, and Checkpoint A2 is the
only next action.

**A2's targets are frozen in its own document before this step is implemented.**
Reading generation output and then choosing the thresholds it has to clear is the
failure this phase exists to avoid.
