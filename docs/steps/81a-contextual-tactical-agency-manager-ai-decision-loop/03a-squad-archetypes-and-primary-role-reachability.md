# Step 03A - Squad Archetypes And Primary-Role Reachability

## Status

**Implemented; `pnpm check` blocked on two decisions that are not this step's to
make.** Authorized by Checkpoint A's `STOP / RETHINK`. The handoff note is at the
bottom of this document, and the two blockers are in it.

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
   **Corrected on reading the code - see *What The Code Said That This Document
   Did Not*. They were not the same skeleton, and they already disagreed.**
2. **Slot number still encodes depth.** `slotDepthOffset(slotNumber)` and
   `slotNumber <= FAKE_LINEUP_SIZE` decide starter versus reserve and feed the
   ability profile. An identity may change *which role* a slot holds, never
   which slots are the eleven.
3. **The rarity and exceptional allocations key on
   `playerRaritySlotKey(clubNumber, slotNumber)`**, before positions are chosen.
   Identity must not move a budgeted six-star onto a different slot.
4. `deriveRng` is keyed by `clubNumber`, not by club order in a list, so the
   identity is stable under any reordering of the world.
   **Corrected: `clubNumber` *is* the club's order in the list.**

## What The Code Said That This Document Did Not

Three claims above did not survive contact with the source. They are left in
place with their corrections beside them, because a document that quietly
rewrites its own premises is a document nobody can audit.

**The two mappings were not one skeleton written twice. They were two different
skeletons, and they disagreed.** `positionForSlot(2)` was `rb` while
`canonicalRoleForSlot(2)` was `center_back`; slots `8` and `9` generated a
`rw` and an `lw` and fielded both as `central_midfielder`. Four of every eleven
played at `weak` or `invalid` suitability in every generated club in the
project's history, and nothing reported it - the only trace is a coordination
penalty inside `TeamStrength`. That is a worse defect than the one this step was
written to fix, and it is fixed here: the canonical role is now *derived* from
the position through `naturalCanonicalRoleForPosition(...)`, so there is one
mapping and it cannot disagree with itself.

**Those four do not contradict Checkpoint A's `meanOutOfPositionSlots = 0.0000`,
because the two count different elevens.** Checkpoint A measured the eleven **the
AI selects**: `selectCareerAiTeam(...)` scores every candidate against every slot
and will not field a footballer out of position unless the squad leaves it no
choice, so `0.0000` says the selector was working and it must keep saying so. The
four sat in the **opening eleven content built** - asserted into existence by two
disagreeing tables, selected by nothing. The selector was never the defect.
Checkpoint A2 carries the same distinction beside its own gate, because without
it the two documents read as contradicting each other.

**The depth chart was not merely uniform. It was literally `4-2-4`.** The
generated positions in slot order - `gk, rb, cb, cb, lb, cm, cm, rw, lw, st, st`
- are exactly the slot order of `FORMATION_CATALOG["4-2-4"]`. Checkpoint A
measured `4-2-4` winning `0.9286` of selections by a mean structural `0.7610`,
and recorded that the three absent roles causing it was an *inference*. It still
is - Checkpoint A2 owes the counterfactual - but the population it was inferred
from turns out to have been the answer written down in advance.

**`deriveRng` keyed by `clubNumber` is keyed by club order.**
`clubNumber = clubIndex + 1` at `fake-players.ts:154`. Nothing about generation
is stable under reordering: player IDs, rarity slot keys and default reputation
are all positional. Squad identity is keyed the same way on purpose, because a
club-ID-keyed identity would survive a reordering that moves the players it
describes, which is a stability nobody can use.

**`role-weights.json` needed nothing.** The document expected a new profile for
the new position's role key. `ROLE_WEIGHT_KEY_BY_CANONICAL_ROLE`
(`team-strength.ts:124`) collapses all twelve canonical roles onto four profile
keys - `gk`, `defender`, `midfielder`, `attacker` - so `right_midfielder` and
`left_midfielder` already resolved to `midfielder`.

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

### Added During Implementation, With Their Ownership

- `packages/content/src/generators/squad-identity.ts` **(new)** and
  `squad-identity.test.ts` **(new)**. The identity table is `~200` lines of
  football and belongs beside `player-archetypes.ts` and
  `player-rarity-budget.ts`, which are the other two things generation draws a
  club's shape from. Putting it inside `fake-players.ts` would have made the
  file that *runs* generation also the file that *states* the football.
- `packages/content/src/index.ts`. One export line for the new module.
- `apps/cli/src/commands/hard-cap-reachability-report.ts` **(new)**,
  `hard-cap-reachability-report/probe-data.ts` **(new)** and
  `hard-cap-reachability-report/probe-data.test.ts` **(new)**. Owned here because
  Step 03A is what moved the population that retired the suite's only real-data
  exact-cap observation. Split command shell from probe core for one reason: the
  core is unit-testable in milliseconds and the shell takes an hour, so the
  declared band arithmetic, the nested invariant and the reconciliation are
  provable without running the corpus. The core also owns its own worker entry
  rather than adding a third payload kind to `report-data.ts`, which keeps the
  report's worker dispatch owned by the report. **No change to
  `player-generation-economy-audit.ts`** - it is fed observations and returns
  only aggregates, so the probe groups the same canonical observations rather
  than reading the audit's output. Preregistered in
  `docs/audits/PHASE_81A_HARD_CAP_REACHABILITY_PREREGISTRATION.md`.
- `apps/cli/src/commands/hard-cap-reachability-report.test.ts` **(new)**. The
  shell's own test, with the probe run and the artifact write injected. Without
  it the only way to learn that a flag is mis-parsed or an exit code inverted is
  to spend the hour first.
- `docs/audits/PHASE_81A_HARD_CAP_REACHABILITY_REPORT.md` **(new, generated)**.
  The probe writes it into the repository, so it is an artifact of this step and
  is declared before the run rather than appearing unowned afterwards. It is
  output, not source: it is never hand-edited, and re-running the probe on the
  declared corpus is the only thing that may change it.
- `apps/cli/src/commands/ten-season-report/gate-status.ts` **(new)** and
  `gate-status.test.ts` **(new)**. The long-run gate's total pass/fail rule, and
  the exit-code mapping, were written inline in two places and testable only
  through a fifteen-minute command. It cannot live in `gate-checkpoint.ts`, its
  natural owner, because that module already imports `report-data.ts` and the
  rule is needed by both - so it sits in a module they share. `report-data.ts`
  and `ten-season-report.ts` are edited to read it instead of restating it.
- `packages/content/src/generators/player-generation-quality.test.ts`. Its
  Phase 80A continuity record moved by one player; see *Verification*. The
  `acceptedShares` bands - the actual gate - were not touched and still pass.
- `docs/audits/PHASE_81A_HARD_CAP_REACHABILITY_PREREGISTRATION.md` **(new)**. The
  probe's preregistration. It is an artifact of this step because this step
  moved the population that retired the evidence it goes looking for.
- `apps/cli/src/index.ts`. The probe command has to be registered there or it is
  not runnable, which would make the preregistration unexecutable. Listed before
  the command was written rather than after.
- `apps/cli/src/commands/ten-season-report/report-data.ts`,
  `ten-season-report.ts`, `ten-season-report.test.ts`. Named in the
  `gate-status.ts` note above, which is **not** the same as being listed here -
  the first two stop restating the gate rule and read it, and the third drops
  three hard-coded `Status: FAIL` expectations for a coherence check.
  `report-data.ts` additionally gains the
  `PlayerEconomyObservationSnapshots` pair and
  `auditedPlayerEconomyObservations(...)`, and returns the pair on
  `SingleWorldLongRunReport`. Two details the code decided, not the document:
  the pair is **built in place, with no factory**, because the opening set
  exists before the first season and the closing set cannot exist until after
  the last - a factory deriving both would build a second copy of the opening
  set, the exact thing the seam prevents, and one returning its own arguments
  would be a public function with no work and no external caller; and the pair
  carries `hardCapMinorUnits`, because a consumer banding values against a cap
  it re-derived would agree today and could stop agreeing the moment the report
  changes which config it reads. It also loses the `import type { PlayerRole }
  from "@game/domain"` this step's Phase 80A template fix added: that import
  broke `cli-must-not-import-domain-directly` and would have failed `pnpm check`.
  The role type is now read off `CliPlayer["primaryRole"]`, which the CLI
  already holds legally and which is the tighter type anyway - the template
  roles are matched against that exact field.
- The department-floor move touches six more files, all of them because
  `MINIMUM_CAREER_DEPARTMENT_DEPTH` changed home and nothing may keep a copy:
  `packages/domain/src/player/player-squad-department.ts` (its new owner, beside
  the department type and map it already held), `squad-maintenance.ts` (stops
  declaring it), and `ai-market-lifecycle.ts`, `ai-contract-lifecycle.ts`,
  `transfer-negotiation.ts`, `transfer-player-negotiation.ts` (four readers
  repointed at domain). No re-export was left behind: one constant, one home.
- `packages/i18n/src/labels.ts`. Twelve `hardCapReachability.*` keys in five
  languages, plus a corrected `cli.availableCommands`. `check:localized-text`
  refuses literal prose at the CLI's IO boundary and `pnpm check` failed on the
  probe command's three; two more strings it needed already existed
  (`cli.error.unknownArgument`, `tenSeason.error.reportOutputRequired`). The
  command gained `--lang` with them; the corpus stayed fixed, which is the shape
  of this command - how a run is reported is the caller's business, what it
  measures is the preregistration's.

  **The console summary is fully localized, not only the three flagged lines.**
  An earlier pass localized the minimum the checker enforced and left the
  summary English, on the argument that it is the transcript of an English audit
  document. That was the wrong line to draw: `formatLongRunGateReportOutput(...)`
  localizes every label of the equivalent gate report, so the exception would
  have been this command's alone. The **artifact** stays English - it is a
  document in `docs/audits/`, not console output - and the three outcome tokens
  `FOUND` / `NOT_FOUND` / `RECONCILIATION_FAILED` are never translated, because
  a reader comparing a run against the preregistration has to see the same token
  the preregistration declares.

  `cli.availableCommands` listed five commands while `index.ts` dispatched
  eight; the probe would have been the fourth missing one. All four were added
  rather than only the new one: a list that is already wrong is not made right
  by appending to it.
- `apps/cli/src/commands/simulate-season.test.ts`, `career.test.ts` and
  `apps/web/src/runtime/web-career-runtime.test.ts`. The old-population golden
  re-records; see *The Nine Re-Records* for what each one is and why it moved.
  The web file is the other half of one record that is asserted in two places.
- `packages/domain/src/tactics/position-suitability.ts` already listed above now
  also owns `naturalCanonicalRoleForPosition(...)`, the single position-to-slot
  mapping that replaced content's second skeleton.

### Deliberately Not Touched

`apps/cli/src/commands/tactical-shape-report-data.ts` and
`live-match-control-report-data.ts` force `FORMATION_CATALOG["4-4-2"]` onto the
generated eleven **by index**, discarding the canonical role content states. That
was already wrong before this step - the old chart was a `4-2-4`, so those
reports fielded a `cm` at `right_midfielder` and a `rw` at `central_midfielder` -
and it is Phase 81's frozen baseline, not this step's. Recorded, unowned.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run packages/content/src/generators/fake-players.test.ts
pnpm check
git diff --check
graphify update .
```

## Definition Of Done

Archetypes are deterministic and reproducible from `(worldSeed, clubNumber)` -
the club's *ordinal* in the generated list, which is what `deriveRng` is
actually keyed on and what every other generated fact about a club already uses -
all ten
primary roles are reachable on real generated worlds, no archetype names or
implies a formation, every squad invariant is unchanged, and Checkpoint A2 is the
only next action.

**A2's targets are frozen in its own document before this step is implemented.**
Reading generation output and then choosing the thresholds it has to clear is the
failure this phase exists to avoid.

## Handoff - 2026-08-07

### Adopted Solution

One `GeneratedSquadIdentity` per club, drawn uniformly from eight identities by
`deriveRng(seed, "squad-identity", clubNumber)`, each a `22`-slot depth chart.
The identity decides *which position* each slot holds; the slot number still
decides depth and nothing else.

The eight are named for the footballers a club is rich in, never for a shape:
`wing_back_pairing`, `wide_midfield_stock`, `creator_and_wingers`,
`holding_pair_and_strike_pair`, `double_width_stock`,
`holder_heavy_low_build_up`, `winger_stock_and_strike_pair`, `creator_trio`.
The football claim each makes is about *absence* as much as abundance:
`wing_back_pairing` owns no full-back at all, `winger_stock_and_strike_pair` owns
no creator, `holding_pair_and_strike_pair` owns nobody wide of a full-back. An
abundance that varied only in degree would leave every club able to field the
same eleven, which is the monoculture the table exists to break.

Three structural decisions worth the next reader's time:

- **The canonical role is derived, not stated a second time.** The lineup now
  reads `naturalCanonicalRoleForPosition(position)`, a new domain function that
  reads `NATURAL_ROLES_BY_POSITION` and *throws* if a position is natural in
  more than one slot. Content no longer holds a position-to-role table, so it
  cannot hold a wrong one.
- **The chart is a `22`-tuple, not an array.** A chart one player short is a
  type error, and `GeneratedSquadDepthChart["length"] = FAKE_PLAYERS_PER_CLUB`
  makes widening the squad a type error too. Proven non-vacuous: deleting one
  entry gives `Source has 21 element(s) but target requires 22`.
- **`fakePlayer(...)` takes an input object.** It had nine positional parameters
  and this step needed a tenth. Private to `fake-players.ts`, no behaviour
  change.

Nothing about squad size, depth offsets, rarity slot keys, the exceptional
allocation, age distribution or division quality was touched. `slotNumber`
still keys all of them, and every chart keeps its two goalkeepers at slots `1`
and `12`.

### Verification

- `pnpm exec vitest run packages/content packages/domain`: `68` files, `516`
  tests, `74.15s`, exit `0`.
- Every identity clears `MINIMUM_CAREER_DEPARTMENT_DEPTH` (`2/6/6/3`) on its
  first day. The old chart did **not**: it generated `3` midfielders against a
  floor of `6`, so every club in the project's history was born asking career
  maintenance for a signing. Content may not import engine, so the floors are
  restated in `squad-identity.test.ts` with their owner named - a knowing copy,
  recorded below.
- All ten primary roles are reached by a real generated division, and no single
  squad holds all ten. Both are asserted, the second because "add the three
  missing roles to every club" is the failure this step was told to avoid.
- Every fielded footballer is now `natural` in his own slot, asserted across all
  `18` clubs. Before this step four of every eleven were `weak` or `invalid`.
- One generated division fields at least `4` distinct canonical-role elevens.
  This is a *variety* assertion on content's own lineup, not a claim about which
  shape the selector picks; that is Checkpoint A2's to measure, and A2's targets
  were frozen before any of this ran.
- Phase 80A's continuity record moved: first division `421 -> 422` of `2144`
  eligible youngsters. All three denominators are unchanged and the other two
  divisions are byte-identical, so the population's age and size structure did
  not move; the `acceptedShares` gate is untouched and passes at `0.1968` inside
  `[0.15, 0.25]`. The cause is that a player's role both generates his potential
  and weights the reading of it, and this step changes roles. **The individual
  carrier was not identified** - a probe showed potential is role-invariant to
  `~1.5e-9` across the nine outfield roles, and no first-division eligible player
  sits within `1e-6` of the `12.5` threshold, so the obvious band-edge
  explanation is wrong. Bounded, not explained.

### Gate: `pnpm check` Exit `1`

`288` files, `2221` tests, `738.45s`. Lint, `depcruise`, `check:localized-text`,
`check:squad-depth` and `check:role-department` all pass. `11` tests fail in `4`
files. **Nine are records of the old population and every one of them records
something this step fixed.** They are re-recorded deliberately, not pasted:

| Record | Was | Now says |
| --- | --- | --- |
| `career.test.ts:54`, `web-career-runtime.test.ts:67` | `b12d5dd0` | `620ad19b`. Both files independently reach the same new hash, which is what that assertion is for. |
| `simulate-season.test.ts:98-101` | `am ... natural=0`, `weak depth: defensive midfielder`, `natural cover missing: attacking midfielder` | the roles exist now |
| `simulate-season.test.ts:393` | `lineupStarterRows(...).length === 11` | the regex accepts only `Goalkeeper\|Centre-back\|Central midfielder\|Striker` - the four roles the broken mapping could emit - and now matches `7` of `11`. The regex is the record, not the count. |
| `simulate-season.test.ts:166` | ability histogram `0-8: 124` | current ability is role-weighted, and roles moved |
| `simulate-season.test.ts:408, 433, 632` | fixed `slot:05` roles | slot `05` is no longer the same footballer in every club |
| `ten-season-report.test.ts:124-131` | `spread=5.57 top=Virtus Turin:13.30` | same cause as the histogram |

### Blockers

Two were raised. **Both are now resolved** (below). The first remained a
measured hold during this step and was later closed by Step 06B7F1, after A2
gave `GO` and the development model itself changed.

**1. The Phase 80A matrix was measuring squad composition, and now that it is
not, the shipped policy is `29` basis points out - not `2`.**

`ten-season-report.test.ts:406` asserts that `player-rating-scale.json`'s
`potentialProjectionPolicy` equals the realization measured by
`createPhase80APotentialOutcomeCalibration()`. It shipped `3034` for the
`outfield` `0-17` band and returned `3032` after this step.

**The drift was an instrument fault, not a population fact.**
`selectPhase80AOutfieldTemplates(...)` took the *n-th player found* per macro
department, so which footballer stood in for "the second midfielder" was decided
by world order. The matrix declares four dimensions - age, role family, room,
participation - and flattens every template's abilities to a constant before
running it (`currentAbility = 7`, potential `7 + room`), so the **only** thing a
template still contributes is its role identity. Squad composition was therefore
an undeclared fifth dimension, and giving clubs different depth charts moved the
measurement without moving the thing being measured.

Fixed here: the five outfield streams are now declared by role -
`center_back`, `full_back`, `central_midfielder`, `wide_midfielder`, `striker`,
a conventional 4-4-2 outfield sample - and selection is by exact `primaryRole`
with a throw when a role is absent, never a macro-department substitution. The
`["defender", "defender", "midfielder", "midfielder", "attacker"]` contract the
test asserts is unchanged.

**It is not one band. It is the whole outfield column.** The first report of this
said "one band, `29` basis points"; that was wrong, because `assert.equal` stops
at the first mismatch and hid the rest. Pinning each band in turn and then
dumping every column gives the real picture:

| Column | Goalkeeper | Outfield |
| --- | --- | --- |
| `p50RealizationBasisPoints` | all `14` identical | `7` of `10` differ: `3034->3005`, `2200->2257`, `1196->1200`, `716->706`, `483->495`, `219->212`, `71->72`. The other three are structurally `0`. |
| `upperRealizationBasisPoints` | all `14` identical | `6` differ: `2823->2722`, `2111->2137`, `1405->1358`, `653->642`, `249->238`, `55->36`. Ages `<= 20` are contractually `10000`. |
| audit counters | - | `abovePublicUpperCount` `65->62`, `abovePublicUpperRateBasisPoints` `401->383` |

**No structural invariant moved**: `1620` observations, `324` cells, `0` missing,
`0` under-observed, `0` ordering violations, `0` stored-ceiling violations, `0`
unobserved bands, `24` evaluated bands.

**Goalkeeper being byte-identical is the load-bearing evidence.** The goalkeeper
template is selected on its own path, which this step did not change; the
outfield templates are the ones that were being drawn by world order. A
mis-specified outfield sample and a sound goalkeeper one look exactly like this.
So the outfield column is a re-derivation, not a drift, and the shipped column
was fitted while `wide_midfielder` could not be generated at all.

This is a real recalibration, exactly as your condition anticipated, and it needs
a new rating-scale version, coherent valuation curves, and explicit save
handling - owned beside Step 14's single beta reset, not slipped in here.

One thing to weigh before ruling. `wide_midfielder` **could not be generated at
all** before this phase, so the shipped `3034` was fitted to a population where a
4-4-2 outfield sample was necessarily two *central* midfielders. Part of the
`29` points is therefore "the sample now contains a footballer the game could not
previously produce", not instrument noise. If you would rather separate the two
questions, the declared set can be `defensive_midfielder` instead of
`wide_midfielder` - still explicit, still controlled, and it does not extend the
sample past what the policy was fitted on. I did not pick between these by
running both and keeping the friendlier number.

**Nothing in `player-rating-scale.json` was touched.**

### Resolution: One Current Beta Bundle, No Catalog

Step 06B7F later increased the monthly positive-growth input from `0.08` to
`0.18`, invalidating this step's temporary measured column. Step 06B7F1
re-derived all `24` bands from the changed engine and shipped the resulting
`player-rating-scale-v8` chain atomically. Step 06B7G4 later raised the
reachable growth cap and re-derived the single current chain as
`player-rating-scale-v9`. The temporary
`PHASE_81A_PENDING_OUTFIELD_PROJECTION` table was deleted and every configured
band returned to plain equality with the independent matrix.

The owner explicitly removed beta save compatibility as a constraint. Keeping
`v7` beside `v8` would therefore be dead compatibility code, so there is no
catalog, fallback, migration or legacy asset. Old stamps fail closed. Step 14
continues to own storage-schema and event-envelope integration, not the
already-completed content-calibration invalidation.

**2. RESOLVED - `ten-season-report` on a two-world sample now exits `0`, and the
test required `1`.** `ten-season-report.test.ts:152` asserted
`firstExitCode === 1`, under the comment *"Two worlds deliberately cannot prove
the cohort-level economy bands. The command must stay deterministic and fail
honestly instead of turning a small denominator into a false green gate."*

Measured, and the comment does not describe what actually drives the exit code.
The `phase31-test` prefix used to fail on `Closing division value fit` - a
third-division valuation outlier - not on any denominator. Two other two-world
prefixes still exit `1` today (`phase31-probe-a`, `phase31-probe-b`), both with
`Failing check counts: none` and both failing the same closing-value band. So
the exit code was never a property of the sample size; it was a property of
whether that seed's population happened to contain a value outlier, and this
step changed the population.

Every assertion the test's *name* is about still passes: both runs are
byte-identical to each other, the report is byte-identical, and all fifteen
non-vacuity lines are present.

Three ways out were listed, and all three were wrong:

- **Assert `0`.** Re-records a gate outcome after reading it, and leaves the
  test asserting that a small sample passes.
- **Drop the exit-code assertion, keep determinism and non-vacuity.** Honest
  about what the test can promise, but it stops guarding "fails honestly".
- **Pick a seed prefix that still exits `1`.** Choosing a seed after reading
  output to make a gate go red - the mirror image of relaxing a threshold.

**Resolved by a fourth formulation, which is what the code now does.** The
question "does a real violation fail the run?" was never a property of this seed,
so it was moved to where it can be asked directly:

- the two-world test asserts what a two-world run can promise - the two runs are
  byte-identical, the report is not vacuous, and the printed status agrees with
  the violations printed beside it;
- `gate-status.test.ts` asserts the actual contract on facts: one green run
  changed in exactly one fact, `closingPlayerMarketFitStatus: "fail"`, produces
  `status: "fail"` and exit `1`.

So the second bullet's objection - "nothing else guards it" - **is now false, and
this document said so after it had stopped being true.** `gate-status.ts` is
exactly that guardian, and it guards the rule rather than a seed's luck.

The test is renamed from *underpowered* to *small deterministic multi-world
sample*. "Underpowered" smuggled in a premise the contract does not contain:
`longRunGateStatus(...)` has no minimum world count, so a small sample cannot
prove the cohort bands and must not fail for being small either.

**Done.**

### Hard-Cap Reachability Probe: `FOUND`

Ran alone, `7` workers, `21` worlds x `10` seasons = `210` world-seasons,
`42` observed-season rows. `2026-08-07 22:14 -> 22:37`, **`23` minutes** against
a `90`-minute budget. Corpus, bands and outcome meanings were fixed beforehand in
`docs/audits/PHASE_81A_HARD_CAP_REACHABILITY_PREREGISTRATION.md` and were not
touched after reading output. Raw rows:
`docs/audits/PHASE_81A_HARD_CAP_REACHABILITY_REPORT.md`.

**All `21` worlds reconciled** with their own canonical audit on all four cap
counters. The probe is describing the population the gates read.

| Fact | Value |
|---|---|
| Eligible observations | `11`, **all at opening** |
| Eligible exact cap hits | `2` - `phase81a-hardcap-a-world-00004`, `-00007` |
| Structural violations | `0` ineligible-exact, `0` ineligible-rendered, `0` above-cap |
| Eligible values within `100`/`500` bp | `2`/`2` - the exact hits and nothing else |

**Outcome `FOUND`.** The branch is reachable on generated data, so the fixture in
`player-generation-economy-audit.test.ts:272` is no longer the only thing
standing behind it. Two tests in
`hard-cap-reachability-report/probe-data.test.ts` now assert the hit on those two
worlds. They are *opening* observations, so the proof costs one world generation
each and no simulated season - it runs in the normal suite, not in a probe.

Three findings the probe was not looking for, all worth more than the yes.

**1. No closing observation in any world is eligible at all - `21` of `21`
rows.** Eligibility is `currentRating === hardCapRequiredRating && age <=
hardCapMaximumAge` (`player-valuation.ts:184`). After ten seasons no world holds
a six-star player still inside the age limit: the allocated established six age
out, and the young stored-ceiling six do not reach current six in ten years.
So the cap branch is a *world-generation* property today, and career simulation
moves away from it rather than toward it. Recorded, not diagnosed.

**2. Nothing approaches the cap; values either sit well below it or land on it
exactly.** The eligible non-hit values are exactly `13_495_000_000` (`5`
observations) and `14_020_000_000` (`3`), against a `500` bp edge of
`14_250_000_000`. Reading the code says why: `Math.min(wholeEuroValue, eligible ?
cap : cap - 100)` clamps. A hit is a clamp, never an approach, so measurement
`4`'s "crowding just under the cap" reading was ruled out by construction rather
than by the data. Declaring it in advance was still right - that is how it came
back as an answer instead of an after-the-fact explanation.

**3. `phase31-test` produced `4` eligible openings and `0` hits.** The golden's
move from `matching=1 share_bps=5000` to `matching=0 share_bps=0` is therefore a
real population fact on that seed, not an instrument fault: the new depth charts
changed which footballer occupies the top club's six-star slot. That is the
account the re-record needed, and the snapshot may now move.

### The Nine Re-Records

Nine assertions failed on the old population. **Two of them were not records at
all**, which is the reason for measuring each one before touching it.

**Not a record - a test helper asserting the monoculture.**
`lineupStarterRows(...)` matched only
`Goalkeeper|Centre-back|Central midfielder|Striker` and counted `7` of `11`. The
command was printing all eleven rows the whole time. The helper was asserting
that a squad contains none of the other eight roles the game can generate - true
under a `4-2-4` chart shared by every club, false by design now. Fixed by
matching any role label, and the count stays `11`.

**Not a record - assertions pinning a role to a slot number.** Four assertions
across three tests read `slot:05 ... Centre-back`, `slot:08 ... Central
midfielder`, `slot:08: ... Central midfielder -> Striker`. Under the demo club's
new identity those slots hold a left back and a right winger. Re-recording them
to `Left-back` and `Right winger` would have looked like a fix and would have
restated the same false invariant - that a slot number implies a role - which is
exactly what this step removed. They now match any role label. What each test is
about is kept: the profile names those slot numbers, slot `01` is still a
`Goalkeeper` because every chart guarantees it, and the attacking setup demo
still has to produce `-> Striker`.

**Seven genuine continuity records, each measured then re-recorded:**

| Record | Old | New |
|---|---|---|
| `canonicalCareerIdentityHash` (CLI **and** web) | `b12d5dd0` | `620ad19b` |
| `rb right full back` depth | `natural=1 adapted=1 weak=8` | `natural=2 adapted=0 weak=5` |
| `am attacking midfielder` depth | `natural=0 adapted=3 weak=7` | `natural=0 adapted=4 weak=9` |
| squad fit notes | `defensive midfielder` + `attacking midfielder` missing, `center backs` extra | `attacking midfielder` missing only |
| ability histogram, `world-a` | `124 / 254 / 18 / 0` | `121 / 256 / 19 / 0` |
| initial ability spread | `5.57 top=Virtus Turin:13.30 bottom=U.S. Ravenna:7.73` | `5.64 top=Virtus Turin:13.32 bottom=U.S. Ravenna:7.68` |
| final ability spread | `5.21 top=Virtus Palermo:12.94 bottom=U.S. Ravenna:7.73` | `5.71 top=Virtus Turin:13.34 bottom=U.S. Ravenna:7.63` |

Three of these say something rather than just moving.

The **defensive-midfielder hole closed**. That club's `weak depth: defensive
midfielder` and `natural cover missing: defensive midfielder` warnings are both
gone, along with the `extra depth group: center backs` the old chart produced.
That is the step's stated purpose showing up in an unrelated command's output.
The attacking-midfielder hole is still there, and should be: one club may lack a
role; `03b` is what checks the *world* does not.

The **ability histogram moved without the mean moving**. `Current ability avg:
9.28 -> 9.21` is byte-identical, and the buckets still sum to the asserted `396`
players. Squads were redistributed, not made better - which is what "this step
redistributes roles; it does not make anyone better" promised.

The **closing hierarchy got more stable**. The old record had a *different* club
on top at the end of the season (`Virtus Palermo` after `Virtus Turin`) with a
narrowing spread; now the same club stays top and the spread widens slightly.

An assertion was added where one was removed: the fit-notes test now asserts
`weak depth: defensive midfielder` is **absent**, so the closed hole is guarded
rather than merely unmentioned.

### Lessons

- **"The same skeleton written twice" was a guess, and it was wrong.** The two
  mappings disagreed, and the disagreement had been fielding four of every
  eleven out of position since the first generated world. Reading the code
  before trusting the document is the whole reason the rule exists.
- **A frozen number that is not a gate still needs an account.** The `421`
  had no comment saying whether it was a threshold or a record. It now says so,
  and says what would justify re-recording it. A number nobody can classify is a
  number the next person either widens or is blocked by.
- **Not finding the cause is a result.** Two probes killed the plausible
  explanation for the moved record. Writing "bounded, not explained" costs less
  than a story that would have to be unlearned later.
- **A failing assertion is not automatically a record to re-record.** Two of the
  nine were tests encoding the monoculture, and one of those looked exactly like
  a regression - `7` starters printed where `11` were expected. Re-recording it
  as `7` would have shipped a test asserting that a lineup is incomplete.
  Measuring the command's real output first is what told them apart.

### Next Action

The hard-cap blocker is cleared: the proof exists, so
`hard_cap_eligibility_and_display` may be re-recorded to `matching=0
share_bps=0`. Blocker **2** (the underpowered-sample exit code) still needs your
call between the three listed ways out; blocker **1** stays owned by Step 14.

Then re-record the nine old-population goldens with their accounts, rerun
`pnpm check`, and go to Checkpoint A2 (`03b`), whose targets are already frozen.
Only its `GO` reopens Steps 04-16.
