# Phase 81 Step 13 - Bounded Tactical Diagnostics And Integrated Gates

Date: 2026-08-06.

Step 13 judges the engine the previous two steps built and looked at. It runs
the frozen Step 01 scenario matrix, checks that the paths later steps promised
to delete are gone, evaluates the carried `goals_per_match_avg` monitor at its
deadline, and runs the repository, build, browser and dependency gates.

It changes no calibration and no threshold. Three gates found live defects: two
were fixed in the steps that own them, **Step 02** and **Step 08**, both reopened
and closed again; the third is the `200%` text overflow
`docs/PROJECT_STATUS.md` had already parked on this step by name.

## What This Is, And What It Is Not

The tactical populations below are **clones**: eleven identical players a side,
uniform ability, so department composition and tactic are the only variables.
That is what makes them able to isolate shape, and it is also why nothing here
is a statement about league football. Step 12 read league tables under A10 and
its numbers are not evidence by construction; Step 15 owns the only cohort.

The `20 x 10` career run in the A7 section is a real career population, and it
exists for one reason: Step 13 is the monitor's deadline and the Definition of
Done asks for a distribution, which a single world cannot produce. It is not a
cohort, it is not cited as balance evidence, and it changed nothing.

## Populations Measured

| Id | Command | Scenario pairs | Noise floor | Structured hash |
| --- | --- | --- | --- | --- |
| A | `--seed-prefix=phase81-bounded --scenario-paired-seeds=400` | 400 | 0.0477 | `ffda9ee6fc0c16a1a5114ab0a6c7c2f7` |
| B | `--seed-prefix=phase81-bounded` | 1050 | 0.0295 | `ce3cb3cac4ac445c72e0712f787086b9` |
| C | defaults (`phase81-tactical-shape`) | 1050 | 0.0295 | `280d2b13326a86ed0f0ee458156949a6` |

All three run the same `66 x 66` dominance matrix at eight paired seeds per
cell, so `35376` matches stand behind every dominance figure and that part of
the population is identical between A and B.

C exists so that this step's numbers can be compared like-for-like with the ones
`docs/PROJECT_STATUS.md` records; A and B exist so that nothing here rests on a
single seed population or a single sample size. Reading them together is what
produced the main finding.

## Frozen Invariants

Every invariant passes on all three populations, with a positive denominator
everywhere. `not_evaluated` is reported nowhere.

| Invariant | A (400) | B (1050) | C (1050, default) | Observations A / B / C |
| --- | --- | --- | --- | --- |
| `bounded_structural_swing` | PASS 0.1081 | PASS 0.0377 | PASS 0.1238 | 1600 / 4200 / 4200 |
| `no_dominant_composition` | PASS 0.3438 | PASS 0.3438 | PASS 0.375 | 35376 / 35376 / 35376 |
| `no_dominant_tactic` | PASS 0.5352 | PASS 0.5356 | PASS 0.5327 | 12000 / 31500 / 31500 |
| `incoherence_costs_a_division_tier` | PASS 1.9469 | PASS 1.9278 | PASS 1.9246 | 1600 / 4200 / 4200 |
| `quality_hierarchy_survives_extreme_shape` | PASS 0.9263 | PASS 0.9169 | PASS 0.926 | 800 / 2100 / 2100 |
| `empty_department_possession_clamp` | PASS 0.18 | PASS 0.18 | PASS 0.18 | 66 / 66 / 66 |
| `distinguishable_coherent_and_incoherent_shape` | PASS 0 | PASS 0 | PASS 0 | 2400 / 6300 / 6300 |

`asymmetric_incoherence_cost` is absent, correctly: amendment A9 retired it on
2026-08-03 and `incoherence_costs_a_division_tier` carries the surviving half of
its claim. Step 13 did not look for it.

Against the values Step 06 recorded: `no_dominant_tactic` went `0.5317 ->
`0.5327..0.5356`, a move smaller than the spread between the populations here,
so nothing to explain.

`incoherence_costs_a_division_tier` went `1.8313 -> 1.9246..1.9469`, and that one
does not explain itself. Across the three populations sample size moves it by
`0.019` and seed prefix by `0.003`; the move from Step 06's figure is `0.093`,
several times either. So it is a real change in the engine, not a change of
population - most likely Steps 07 and 07A, which altered the shot chain after
Step 06 recorded that number. **It moved further above its `1 x` floor**, so it
is more margin rather than less, and this step neither tunes nor re-freezes
anything. Recorded because a gate that has quietly moved by four times its own
population noise is worth knowing about before Step 14 moves the engine again.

## F1 - The Small Effect Does Not Reproduce; The Large Ones Do

This is the finding of the step, and it is about Step 14 rather than about any
gate here.

Underlying quantities behind the table above:

| Quantity | A | B | C | Spread |
| --- | --- | --- | --- | --- |
| division-tier edge | 0.2488 | 0.2521 | 0.2521 | 0.0033 |
| `0-0-10` deficit vs reference | 0.4844 | 0.486 | 0.4852 | 0.0016 |
| contender win share, `3-1-6` vs third division | 0.9263 | 0.9169 | 0.926 | 0.0094 |
| **best structural shape gain (`3-5-2`)** | **0.0269** | **0.0095** | **0.0312** | **0.0217** |

B and C differ **only in the seed prefix**: same code, same `1050` scenario
pairs, same everything else. The three large effects agree to within `0.01`. The
best structural shape gain moves from `0.0312` to `0.0095` - it loses two thirds
of itself - and both readings sit at or under the `0.0295` noise floor for that
sample size.

Every measurement anyone has made of this quantity, in order: `0.0431` at Step
01, `0.0288` and then `0.0156` around Step 06's calibration (all at 400 pairs,
floor `0.0477`), and now `0.0269`, `0.0095`, `0.0312`. Range `0.0095..0.0431`,
a factor of `4.5`, and never convincingly outside its own noise floor.

Two consequences, neither of which Step 13 acts on:

- `docs/PROJECT_STATUS.md` lists `0.0312` in *Which Manager Decisions Actually
  Count, Measured*, beside numbers such as the `0.2521` division tier that
  reproduce to three decimals. It is not the same kind of number and the table
  reads as though it were.
- **Step 14 is chartered to raise formation from `0.0312` to `~0.047` as a
  counter-move reward, and cannot verify that on one seed population.** On a
  second population the starting point is `0.0095`. Whatever Step 14 measures
  after its change has to be measured on at least two prefixes, or the
  improvement and the seed are not separable. **Owner: Step 14.**

`no_dominant_composition` shows the same instability qualitatively: the shape
nearest to dominant is `7-1-2` on A and B (worst matchup `0.3438`, mean vs field
`0.6231`) and `5-2-3` on C (`0.375`, `0.6615`). The gate is nowhere near its
`0.55` threshold in either case, so the verdict is not in doubt; the identity of
the shape is.

## F2 - One Bound Is Passing On A Quantity Indistinguishable From Zero

`bounded_structural_swing` requires the best shape's gain to stay under `0.75 x`
the division-tier edge. On B that gain is `0.0095` against a `0.0295` floor, so
the bound is satisfied by a quantity that cannot be told from no effect at all.
The invariant is correct, one-sided and worth keeping - it is the rule that stops
a formation trick replacing the transfer market - but it is currently not
constraining anything, and a report that printed only `PASS 0.0377` would hide
that.

Its twin `incoherence_costs_a_division_tier` is the opposite: `1.92 x` against a
required `1 x`, on an effect four times its noise floor, stable across all three
populations. The pair works exactly as A9 intended. Incoherence is punished hard
and provably; coherence pays approximately nothing, which is the honest reading
of the same data and the gap Step 14 exists to close.

**Owner: Step 14.** No threshold is changed here and none should be: the bound
is not wrong, the measured world is flat.

## F3 - `no_dominant_tactic` Downside, Reported As The Step Requires

The gate is one-sided by design and bounds only the upside. What it does not
bound, on population B: `low_block` averages `0.4394` against the field, `0.0606`
below neutral and twice the noise floor. `high_risk` sits at `0.47`, `0.03` below
neutral against a `0.0295` floor - by F1's own standard that is unmeasured, and
this report will not call it a deficit. `flank_overload` is the strongest at
`0.5356`, comfortably under the `0.55` ceiling.

Both weak profiles are every relevant knob at an extreme at once, which no
manager fields. Bounding them needs a claim nobody has made yet - what a
deliberately conservative setup should be worth against an equal side - so this
is recorded and recommended, not tuned, exactly as the step requires.

**Why `low_block` is the weakest is visible in the column a win share hides.**
Opportunities created and conceded per profile, population B, `10500` matches
each:

| Profile | Created | vs neutral | Conceded | vs neutral |
| --- | --- | --- | --- | --- |
| `neutral` | 135322 | - | 134120 | - |
| `direct_play` | 144494 | +6.8% | 137952 | +2.9% |
| `high_risk` | 142876 | +5.6% | 137429 | +2.5% |
| `flank_overload` | 141266 | +4.4% | 132773 | **-1.0%** |
| `high_pressing` | 140434 | +3.8% | 134975 | +0.6% |
| `low_block` | 104714 | **-22.6%** | 131857 | **-1.7%** |

**No setting in the game meaningfully reduces what it concedes.** The most
defensive profile available gives up `1.7%` fewer chances than neutral while
creating `22.6%` fewer of its own, and `flank_overload` - an attacking setting -
concedes almost as few. Defending is currently a way to have fewer chances, not
a way to face fewer.

That is why `low_block` never beats anybody, and it is a more useful statement
than its win share, which only says it loses. It is also the reason a floor
threshold would be the wrong response: the profile is not mis-priced, the
defensive half of the model is missing, and a threshold cannot supply one.
**Step 06 owns tactic semantics; Step 13 reports and does not tune.**

## Absence Checks

Eight were required. Each was executed; none was assumed.

| # | Check | Verdict |
| --- | --- | --- |
| 1 | web four-role collapse | **FOUND - fixed in Step 02, reopened** |
| 2 | default roster-index opponent lineup | absent |
| 3 | obsolete scalar/texture route inference | absent |
| 4 | post-resolution actor attribution | absent |
| 5 | duplicate shape/matchup calculation | absent |
| 6 | direct `club.playerIds` in a lineup-composing path | **partially guarded - see F5** |
| 7 | compatibility readers | **one dead discriminant - see F6** |
| 8 | dead fixtures | absent |

### 1 - Web four-role collapse: found

Four production classifications of a player's department, keyed on `primaryRole`,
disagreeing with each other and with the domain owner `playerSquadDepartment`.
A wing-back was a defender on the match-preparation screen and a midfielder on
the squad screen; a winger was a midfielder in all four while the market and
contract code called him an attacker. Two copies matched `wide_forward`, which
is not a member of `PlayerRole`.

Full before/after table, the severity assessment, and the fix are recorded in
Step 02's `Reopened 2026-08-06` section. The change is not in this step: Step 13
reopened the owner, which is what its own review rules require.
`scripts/check-role-department-owner.ts` now gates it inside `pnpm check`, and
was observed failing on the pre-fix tree before it was observed passing.

### 2, 3, 4, 5, 8 - absent, with the reasons a naive search would miss

- **Roster-index lineup.** `matchday-adapter.ts:1166` fills an unset bench slot
  from `benchPlayerIds[index]`, which reads like the defect. It is not: the user's
  side receives its own persisted `matchPreparation.benchSlots` and the opponent
  receives `selectCareerAiTeam(...).benchPlayerIds`, the same engine selection the
  committed fixture progression uses. The index walks an already-selected bench.
- **Scalar/texture route inference.** Gone; `opportunity-route.ts:62` records what
  replaced it. The surviving `randomTexture` in `aggregate-occasion-resolver.ts:171`
  is an unrelated `+/- 0.15` jitter that shares the word.
- **Post-resolution actor attribution.** `occasion-context.ts` states and enforces
  the order, and `createShotOutcomeEvent` in `step-match.ts:634` is a pure
  projection that draws no probability and picks no player. The outcome still
  decides *which* named actor appears - a save has a keeper, a block has a
  blocker - which is causality, not attribution after the fact.
- **Duplicate shape/matchup calculation.** `deriveTacticalShapeProfile` has one
  production caller, `deriveTeamShapeAndStrength`. `ordinary-tactical-shape.ts`
  reads like a second implementation and is not: it builds a reference eleven and
  calls the same owner.
- **Dead fixtures.** Two fixture modules exist, `apps/web/src/test-fixtures/career-fixture.ts`
  and `packages/storage/src/testing/persistable-career-fixture.ts`; both have
  importers. Worth recording as a gap rather than a pass: `.dependency-cruiser.cjs`
  carries no orphan rule and nothing in `pnpm check` detects an unused export, so
  this check has no automation behind it and would not catch a fixture that died
  tomorrow.

## F5 - The A6 Absence Assertion Guards A Fixed List, And Three Paths Are Outside It

`scripts/check-squad-depth-accessor.ts` enforces A6 over nine named
lineup-composing files. It cannot see a tenth. Three production paths compose a
lineup, a bench or a fieldability answer from `club.playerIds` directly and are
not on the list:

| Site | What it does |
| --- | --- |
| `apps/web/src/features/squad/career-squad-adapter.ts:245` | `findNextFixtureEligibilityBlockers(career, club.playerIds)` - who may play the next fixture |
| `apps/cli/src/commands/simulate-season/formation-fit-output.ts:108,110` | `createSquadDepth({squadPlayerIds: club.playerIds, benchReservePlayerIds: club.playerIds.filter(...)})` |
| `apps/cli/src/commands/ten-season-report/report-data.ts:4106` | `reportLineup(club.playerIds, careerState)` for every club in the report competition |

The first is the sharpest: `match-preparation-adapter.ts:552` asks the same
question through `fieldablePlayerIds(club)` and the squad adapter does not, so
two screens reach the same answer by two routes.

**Nothing behaves differently today.** `fieldablePlayerIds` is currently
`return club.playerIds` - the accessor exists to have one definition to change
when Phase 82A introduces loans, not to filter anything yet. The cost is
therefore entirely future: one single-definition change becomes four, and the
assertion that was written to prevent exactly that reports OK.

This step's Definition of Done says *every* direct read in a lineup-composing
path is absent. **It is not met, and that is stated rather than worked around.**
**Owner: Step 02**, which owns the accessor and the assertion. The fix is to make
the check discover lineup-composing files rather than enumerate them, or to
enumerate honestly and add these three; the first is worth more, because the list
is the part that failed.

## F6 - A Compatibility Discriminant With No Reader

`summarizePlayerDevelopmentAbilities` in
`packages/engine/src/career/player-development.ts:176` returns
`measure: "role" | "legacy_raw"`, documented as identifying the compatibility
fallback for pre-role players. `legacy_raw` appears exactly twice in the
repository: the type and the assignment. **Nothing reads it.**

The branch itself is reachable by type - `Player.primaryRole` is optional - but
`createPlayer` requires a role and the beta reset rejects saves written before
role identity, so it is not reachable on data this project produces.

This is stored information nobody derives anything from, which the standing bar
forbids. It is **not Phase 81's**: the player model belongs to Phases 79/80A, and
this function's production callers are development, valuation and inspection
paths this phase does not own. Recorded with file, owner and reason as the step
requires; it threatens neither correctness nor duplication, so it does not block
phase completion.

Related and also out of scope, listed so a later reader has the inventory:
`packages/domain/src/match/match-phase.ts:28-34` still carries a
`@deprecated Remove with the staged match progression in Phase 77 Step 02` seam,
and `match-simulation-state.ts:45` still describes optionality as temporary for
the Phase 77 legacy staged adapter.

## Carried `goals_per_match_avg` Monitor (A7)

**Inside band on every world of this step's population. The monitor is
discharged and Phase 81 does not carry it a third time.**

```text
pnpm cli ten-season-report --report-kind=long-run-gate \
  --seed-prefix=phase81-a7 --worlds=20 --seasons=10

Worlds: 20   Seasons: 10   Total seasons: 200
Execution: parallel; workers=7; resumed_worlds=0; simulated_worlds=20
Goals per match avg/p95: avg=2.760 p95=2.840
```

| Population | pass | warn | fail | Band |
| --- | --- | --- | --- | --- |
| Phase 80A Step 09, inherited, `750` worlds | 36 | 634 | **80** | pass `2.3..3.0`, warn `2.0..2.3` or `3.0..3.2`, fail outside `2.0..3.2` |
| Phase 81 Step 13, `20` worlds x `10` seasons | **20** | 0 | 0 | unchanged |

`goals_per_match_avg` appears in neither `Warning check counts` nor
`Failing check counts` for this run, and both lines are per-world counts, so
every one of the twenty worlds passed. The threshold, the denominator - the mean
over a world's seasons - and the `monitor` severity class are exactly as
inherited; nothing about the check was touched.

Two things this does **not** claim:

- It is not the `750`. The inherited distribution was `634` worlds warning and
  `80` failing high; twenty clean worlds is a different and much smaller
  population, and nobody re-runs the `750` before Step 15. What Step 13 can say
  is that on twenty independent worlds the monitor did not warn once, where the
  inherited population warned about five times in six.
- **The ownership question `docs/PROJECT_STATUS.md` raised is now moot, and it
  should be closed rather than answered.** The rule said an out-of-band monitor
  reopens Step 06; the status note observed that the movement `3.08 -> 2.74`
  actually happened around Step 07 and that the rule therefore named the wrong
  owner. The monitor is in band, so no owner is reopened and the disagreement
  never has to be resolved. It stays recorded because if Step 15 finds it out of
  band at cohort scale, the question comes straight back.

### A Red Gate On This Population That Is Not Phase 81's

The same run exits `1` with `Status: FAIL` and thirteen failed worlds. Exactly
one check causes it:

```text
Player economy young_stored_ceiling_six_stock_arrival_category_placement:
  observations=261 violations=22 failed_worlds=13
  target=opening allocation and new stock arrivals; outside First Division <=1;
         every introduced First Division placement is title_contender or
         playoff_contender
```

`PHASE_80A_..._REPORT.md` closed with all `32` player-model gates passing on the
deterministic `750 x 3` cohort, so on the `phase81-a7` seeds this one does not
hold. Step 13 has no basis to say whether that is seed sensitivity or drift, and
it is not this phase's check to diagnose or fix - Phase 81 owns match scoring,
not prospect allocation.

**Recorded, unowned, and it does not block Step 13's declared gates**, which do
not include the long-run gate. It should be given an owner before Phase 81
closes, alongside Step 12's F2. Not naming an owner is deliberate: guessing one
is how a defect gets a home that will not fix it.

For completeness on the same population, since the step also owns Step 12's
table-compression finding: `table_points_spread_avg` reads `41.00` with a
per-world minimum of `36.60`, inside its `36..60` pass band. That is a different
measurement from the one Step 12 flagged - per-season total spread on the top
competition with a fixed `4-4-2`, against per-match spread on generated lower
divisions with a shape per club - so it neither confirms nor refutes it. It is
recorded because a reader will otherwise assume the two disagree.

## Gates

Each was run alone and its exit code taken from the command itself, never
through a pipe.

```text
pnpm check                              PNPM_CHECK_EXIT=0
  lint                                  clean
  depcruise                             no violations (837 modules, 3433 dependencies)
  check:localized-text                  OK
  check:squad-depth                     OK (9 lineup-composing files)
  check:role-department                 OK (125 presentation files)   <- new
  test                                  284 files, 2164 tests passed
  typecheck                             10 of 11 workspace projects
pnpm --filter @game/web run build       WEB_BUILD_EXIT=0
pnpm web:visual:qa                      VISUAL_QA_EXIT=1 first, 0 after the two
                                        fixes below: 38 passed (7.3m)
git diff --check                        clean
graphify update .                       run
```

### The Browser Gate Was Red Before This Step Ran It

`pnpm web:visual:qa` failed on its first run here, on **two** tests. Neither was
caused by this step's changes.

**F8 - desktop match preparation overflowed at 200% text.**
`docs/PROJECT_STATUS.md` had it recorded and parked on Step 13. It was measured
before it was touched, by adding the case nothing covered:

```text
desktop Preparation at 1441px and 200% text has horizontal page overflow:
  aside.tls-preparation-squad-panel   left:1681  right:2417  width:736
```

`736px` is `23rem` at a `32px` root, the second grid track sitting on its own
minimum, pushed entirely off a `1441px` viewport by a first track already at
`1681px`. The track floors are `rem` and grow with text size; the one-column
breakpoint is `max-width: 1180px` and does not, so the two floors reached
`1856px` while the breakpoint stayed silent. Every other zoom case in the suite
is narrow, which is why the one combination that fails - wide enough to keep two
columns, zoomed enough to overflow them - had no test.

Fixed by capping each floor against the board's own width,
`minmax(min(35rem, 62%), 1.42fr) minmax(min(23rem, 34%), 0.72fr)`. At ordinary
text both `min()` calls resolve to the `rem` value and the layout above `1180px`
is unchanged; the breakpoint still owns the collapse below it. The test is now in
the suite, so the case cannot go uncovered again.

**F9 - the persistence spec had been asserting a superseded schema version.**

```text
SQLite OPFS ... expect(received).toMatchObject(expected)
-   "schemaVersion": 22
+   "schemaVersion": 23
```

Phase 81 Step 08 moved the OPFS schema `22 -> 23`;
`apps/web/src/visual-qa/sqlite-opfs-storage.spec.ts` was last touched in the
Phase 80A commit and kept the literal `22`. **No per-step check block in Steps
01-12 lists `pnpm web:visual:qa`** - only the phase-level block and this step do -
so nobody skipped a declared check, and a gate that lives only in the
phase-level block runs once, at the end of a phase.

The stale literal also masked a worse one. That spec seeds a *future* schema and
requires the app to reject and preserve it; the fixture was version `23`, so
after the bump it was the shipped schema and the assertion would have been
checking that the app rejects its own database. Playwright stops at the first
failed expectation, so those lines never executed.

**Fixed in Step 08, reopened** - spec only, no persistence behaviour re-decided.
The three versions now derive from the public `SQLITE_CAREER_SCHEMA_VERSION`, so
the next bump moves them together and the future fixture stays ahead of the app.

**Recommendation, not applied here:** the phase-level check block and the
per-step blocks disagree about what runs, and only the per-step blocks are
executed. Either the browser suite belongs in the per-step blocks of the steps
that touch web and persistence, or the phase-level block should stop implying it
runs every time. This is a process defect, not a code one, and it belongs to
whoever owns the phase contract.

## What Step 13 Did Not Do

- No calibration coefficient, threshold, band or severity class was changed, and
  nothing was re-frozen - including `incoherence_costs_a_division_tier`, which has
  moved since Step 06 recorded it.
- No engine fix was made in this step. Two of the three defects the gates found
  were fixed in their owning steps, **02** and **08**, each reopened with its own
  verification. The third, the `200%` overflow, is one stylesheet declaration and
  one visual-QA case here, because `docs/PROJECT_STATUS.md` had parked it on this
  step by name; it is presentation, and no gameplay path reads it.
- No `50 x 20`. Step 15 owns it, unchanged in seed, scale, workers and command.
- `no_dominant_tactic`'s unbounded downside was reported and recommended on, not
  given a floor threshold - and the reason is in the conceded column, not in the
  profile's price.
- No owner was invented for F7 or for Step 12's F2. Both are recorded unowned.
