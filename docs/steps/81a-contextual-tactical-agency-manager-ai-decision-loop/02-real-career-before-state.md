# Step 02 - Real-Career Before-State

## Status

**Done 2026-08-07.** Step 03, Checkpoint A, is the only next action.

The before-state is
[`PHASE_81A_STEP_02_REAL_CAREER_BEFORE_STATE.md`](../../audits/PHASE_81A_STEP_02_REAL_CAREER_BEFORE_STATE.md),
produced by `pnpm cli tactical-agency-report --checkpoint --workers=7 --worlds=7
--rounds=3 --paired-seeds=24`.

## Goal

Build the deterministic instrument that measures formation, tactic, role, tie,
runtime, and low-block behaviour on the real career path.

## User-Facing Reason

The phase must improve what a player actually meets, not a synthetic population
that forces every club into `4-4-2`.

## What To Implement

Create a deep `TacticalAgencyAudit` Module traversing:

```text
generated world -> available squad -> selectCareerAiTeam -> fixture -> report
```

Record formation frequency, first/second structural score, exact ties, catalog
reorder sensitivity, ten primary-role frequencies, coverage warnings, tactic
frequency, replay throughput, and wall clock.

The CLI accepts an explicit worker count. In checkpoint mode it requires
`--workers=7`, partitions deterministic work by stable key across those seven
workers, and records the effective count in every report.

Measure `low_block` versus neutral at equal quality with paired seeds in the same
unit: own xG, conceded xG, their deltas, and ratio. Preserve the historical
occasion-volume values only as a separate diagnostic.

Do not change generation, selection, or match behaviour.

## Carried From Step 01

- **Record the calibration version beside every number.** Step 01 moved the four
  `controlWeight(...)` coefficients into `match-tactics-calibration`, so this is
  the first phase in which a tactic magnitude can move without an engine change.
  A before-state that names its population but not the asset version it was
  measured under cannot be compared to anything later. The stamp is unchanged at
  `match-tactics-calibration-v1`, and it stayed unchanged because the migration
  was exactly value-preserving - not because nothing moved.
- **The explanation trace is not the instrument.** It now reads the real minute
  plan, but it still describes exactly one context per match and therefore
  cannot see a mid-match tactic change. Read the career path, not the trace.
- **`OpportunityRoutePlan` is the one owner of the minute's tactical
  derivation.** It carries `capacityByRoute`, `weightByRoute`,
  `volumeMultiplier` and `bottleneckByRoute`. Anything this audit needs about
  what a side intended comes from that plan; rebuilding a matchup beside it is
  the defect Step 01 removed.

## Expected Files

- `packages/simulation-tools/src/tactical-agency/tactical-agency-audit.ts`
- `packages/simulation-tools/src/tactical-agency/tactical-agency-audit.test.ts`
- `packages/simulation-tools/src/index.ts`
- `packages/engine/src/team-selection/ai-squad-selection.ts`
- `packages/engine/src/team-selection/index.ts`
- `packages/engine/src/career/career-ai-team-selection.ts`
- `apps/cli/src/commands/tactical-agency-report.ts`
- `apps/cli/src/commands/tactical-agency-report.test.ts`
- `apps/cli/src/index.ts`
- `docs/PROJECT_STATUS.md`
- this step document
- `03-checkpoint-a-ownership-and-before-state.md`

### Ownership Of The Three Engine Files Added To This List

The step must record "first/second structural score, exact ties, catalog reorder
sensitivity". None of those is recoverable from what the selector returned: it
handed back one `Formation` and discarded the ranking it chose from. The audit
had exactly two ways to get them.

The rejected one is to walk `FORMATIONS` again inside the audit. That is a second
copy of the selector's comparison, free to disagree with the shape clubs
actually line up in, and the audit would then be measuring its own copy - the
parallel-model defect Step 01 has just finished removing from the trace.

The adopted one is to report the walk `strongestCatalogShape(...)` already does.
`AiSquadSelectionResult.catalogChoice` carries `fillableShapeCount`,
`bestStructuralScore`, `secondStructuralScore` and `tiedAtBestCount`, and
`CareerAiTeamSelection` forwards it. **It costs nothing**: the walk happened
either way. It is absent - not fabricated - when a caller imposes a formation,
because a club that was told what to play expressed no preference. Behaviour is
unchanged: the same catalog order, the same strictly-greater comparison, the
same winner.

**It is four numbers and not the twenty-three-row ranking, and that matters.**
The first attempt returned the rows. Every club on every career fixture goes
through here, so the rows are built and retained millions of times across a long
run; the full suite stopped finishing. Nobody needed the rows - the four numbers
are the whole of what they were wanted for - so the walk now accumulates them in
place and allocates one small object instead of twenty-four.

Reorder sensitivity follows from it without permuting anything. Reordering
`FORMATIONS` can change the winner for exactly the selections where two or more
shapes tie at the top, and for no others, so `tiedAtBestCount > 1` **is** the
sensitivity. Permuting the catalog and re-running would measure the same thing
at many times the cost.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run packages/simulation-tools/src/tactical-agency/tactical-agency-audit.test.ts
pnpm exec vitest run apps/cli/src/commands/tactical-agency-report.test.ts
pnpm check
git diff --check
graphify update .
```

## Lessons Already Landed

- **`Infinity` is not a reportable number.** The low-block reading divides own
  xG lost by conceded xG saved, and a block that saved nothing has no exchange
  rate. `Infinity` was the obvious value and it is wrong: `JSON.stringify`
  turns it into `null`, so a report written to a file loses the exact finding it
  was written to record. The field is `number | "no_reduction"`. Any later
  checkpoint that reports a ratio owes the same care.
- **"No choice" and "obvious choice" are two findings.** A club that can fill
  one catalog shape and a club that can fill twelve but clearly prefers one are
  not the same observation, and one share covering both would hide the first.
  They are `noChoiceShare` and `tieDecidedShare`.
- **All ten primary roles are reported, absent ones included.** The finding this
  audit exists to record is which roles the generator never produces, and a row
  missing from a table reads as a row that was never measured.
- **A footballer with no declared `primaryRole` is counted, not folded in.** A
  missing role is a fact about generation.
- **A diagnostic on a per-fixture path is charged per fixture.** Returning the
  shape ranking rather than four numbers out of it was correct in design and
  wrong in cost, and it showed up as a test suite that stopped finishing rather
  than as a wrong answer. Anything added to `selectCareerAiTeam(...)` pays that
  toll; measure the suite before and after.

## Definition Of Done

The audit is deterministic, reaches real generated worlds, records all
denominators and seed manifests, measures xG before-state and cost, accepts
exactly seven checkpoint workers, rejects any other checkpoint count, and
changes no gameplay. Step 03 is the only next action.

---

## What The Before-State Says

`7` worlds, `378` real career selections in the third division, `297.81`
selections per second on exactly `7` workers, all under
`match-tactics-calibration-v1`.

### The monoculture is real and the contract named the wrong cause

| Quantity | Measured |
|---|---:|
| `topFormationShare` | `0.9286` (`4-2-4`) |
| `distinctFormationCount` | `3` of `23` |
| `tieDecidedShare` | **`0.0000`** |
| `noChoiceShare` | `0.0000` |
| `meanBestMinusSecond` | `0.7610` |
| `meanOutOfPositionSlots` | `0.0000` |

The design contract expected `4-4-2` held by catalog order among seven tied
shapes. On the real career path **no selection is decided by a tie at all**, and
the shape that wins is `4-2-4`, by a mean structural margin of `0.7610` over the
runner-up. Catalog order is not the cause and reordering `FORMATIONS` would
change nothing.

That does not weaken the phase's premise, it relocates it. The contract's uniform
`22`-man analysis was right that the squad structure decides the shape; it was
wrong that the decision is close. It is not close - the population makes one
shape *strictly better* for `92.86%` of clubs, which is the same defect arriving
through a different door and a harder one, because there is no tie to break.

**Step 03 must judge this before Step 08 is designed.** Step 08 was scoped to
break ties by giving squads football identity. There are no ties to break.

### Three of the ten primary roles are never generated

`2772` senior footballers, `0` undeclared. `defensive_midfielder`,
`attacking_midfielder` and `wide_midfielder` are each exactly `0.0000`;
`center_back` is `0.2727` and `striker` `0.2273`. That is the contract's
`6 cb`/`5 st` depth chart, confirmed on real worlds rather than inferred from
the generator.

**That the missing roles *cause* the monoculture is an inference, not a
measurement.** This report observes both facts at once and isolates neither. The
reading is plausible - `4-2-4` is the shape that fits two centre forwards and no
midfield creator - but nothing here varies the role mix and watches the shape
move. Step 08 and Checkpoint C owe that proof, through squad archetypes or
controlled counterfactuals. Until then the two findings are reported side by
side, not chained.

### The low block is far better in xG than the occasion counts implied

| Reading | Value |
|---|---:|
| `concededExpectedGoalsReduction` | `0.2248` |
| `ownLossPerConcededReduction` | `1.4940` |
| own opportunities, neutral -> block | `13.35` -> `7.52` |

Phase 81 measured `-22.6%` own occasions for `-1.7%` conceded, a ratio near
`13.3`, and concluded the block mostly stops attacking. **In expected goals it
clears both Step 05 gates already**: conceded xG falls `22.5%` against the `>= 8%`
target, and the exchange rate is `1.4940` against the `<= 2.0` ceiling.

The two readings are not in conflict; they answer different questions. Volume
fell further here (`-43.7%`) than Phase 81 ever measured, and xG still improved -
which is only possible if the block concedes *worse* chances, not merely fewer.
The occasion ratio could not see that, and it is the reason the gate is written
in xG. **The historical `13.3` may not be quoted as the low block's cost again.**

One caveat belongs beside these numbers: the two arms use two real clubs of
unequal quality, so the absolute levels are not comparable to each other. Only
the paired deltas are evidence - same clubs, same seeds, same venue rotation,
one instruction changed.

## Verification

```text
pnpm exec vitest run tactical-agency-audit.test.ts          1 file,  9 tests, exit 0
pnpm exec vitest run tactical-agency-report.test.ts         1 file,  9 tests, exit 0
pnpm cli tactical-agency-report --checkpoint --workers=7    exit 0, 7 workers recorded
```

Non-vacuity: the checkpoint worker rule is proven by refusing `1`, `4`, `8` and
`14` and measuring nothing in each case, not by accepting `7`.

## Next Action

Step 03, Checkpoint A. It owns the paired before/after replay for Step 01 and the
judgement on the finding above.
