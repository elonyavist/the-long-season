# Step 05 - Position Suitability Coordination Without Double Penalty

## Status

Done on 2026-08-03.

### Adopted Solution

Suitability is derived once, in `deriveLineupSlotScores(...)`, and carried on
`LineupSlotScore` *beside* the score rather than folded into it. Intrinsic shape
then applies it to `coordination` tasks only. `teamStrengthFromSlotScores(...)`
ignores it entirely, which is what makes the absence of a double penalty
structural rather than a promise.

The split that does the work is one typed mapping, `TACTICAL_SHAPE_TASK_KIND`:

- **coordination** - `build_up`, `central_progression`, `lateral_progression`,
  `pressing_cohesion`, `central_coverage`, `lateral_coverage`,
  `box_protection`, `rest_defence`. These are players working together:
  connecting, timing a press, holding a line, covering for each other. Playing
  a man out of position degrades exactly this.
- **presence** - `final_third_presence`, `counter_threat`. These are about
  being somewhere and being dangerous there. A winger asked to play striker is
  still a body in the box and still runs in behind.

That is the whole argument against the double penalty, stated in football
rather than in arithmetic. The role weights already score the player on his
*destination* role's attributes - a winger at centre back is already judged on
tackling and heading, not on dribbling - so charging presence again would price
one decision twice. What the weights cannot express is that he will read the
game there less well, and that is the only thing this step adds.

The shipped ladder is `natural 10000`, `adapted 9200`, `weak 7800`,
`invalid 5500`. `natural` is exactly `10000` by validation: playing a man in
his own position is the neutral reference, never a bonus. `invalid` stays well
above zero because a nonsense fit still leaves eleven players on the pitch.

The measured consequences, on the fixture calibration:

- an eleven of strikers asked to play `4-4-2` loses on **every** coordination
  capacity and is **bit-identical** on both presence capacities;
- that same eleven has **bit-identical `TeamStrength`** to a naturally
  positioned one, which is the double-penalty regression test;
- a `14`-ability adapted side out-coordinates an `8`-ability natural one -
  quality still wins arguments;
- a `13`-ability side of strikers does **not** out-defend an `11`-ability
  natural one - quality does not simply buy back a misuse of that size.

### Scope Corrections Found Against The Code

**Two test premises were wrong and were corrected against the suitability
tables, not the other way round.** The first asserted that a strong side played
entirely out of position beats a weak natural one; with `["st"]` naturals every
central slot is `invalid`, not `adapted`, and `14 x 0.55 < 8 x 1.0`. The
contract's claim is about *adapted* players, so the test now uses `["dm"]`,
which is genuinely adapted at both centre back and central midfield. A second
test was added for the case the first was quietly hiding: a big enough misuse is
not something quality simply buys back.

The second walked the four-step ladder over a whole `4-4-2`, which mixes several
fits at once and passed by luck of the mixture rather than by measuring the
ladder. No natural position produces a uniform `weak` across both centre-back
and central-midfield slots, so the test now uses a single centre-back slot with
one natural position per suitability (`cb`/`dm`/`rb`/`st`) and reads the
multiplier itself.

**`SUITABILITY_SCORE` was a second copy of the category order.** It restated
`natural > adapted > weak > invalid` as an integer table beside the union
declaration. It is now derived from a new exported
`POSITION_SUITABILITIES` array, which is also what calibration validation walks
to say "strictly decreasing" without restating which fit outranks which.

**The shape test fixture had no natural positions at all** and threw as soon as
suitability was derived. It now defaults each player to a natural for the role
he was handed - the neutral case every pre-existing assertion wants - with an
explicit override for the suitability tests.

**One duplication found and deliberately not fixed here.**
`ai-squad-selection.ts` has its own `suitabilityBonus` (`2.4 / 1.2 / -3.5`)
alongside `SUITABILITY_SELECTION_BONUS` (`35 / 25 / 5`) in
`position-suitability.ts`. Both rank players for *selection*, which is a
different concept from the *execution* multiplier this step adds, and Step 09
owns replacing AI selection behind one named Module. Recorded there rather than
widened into this step.

### Verification

```text
domain + content + engine suites            23 files, 240 tests passed
pnpm --filter @game/domain  typecheck       exit 0
pnpm --filter @game/content typecheck       exit 0
pnpm --filter @game/engine  typecheck       exit 0
pnpm depcruise                              no violations (802 modules, 3211 dependencies)
git diff --check                            clean
```

### Blocker / Lesson

None blocking. One lesson recorded in Step 09: two selection-ranking suitability
scales exist and Step 09 owns collapsing them.

### Next Action

Step 06.

## Goal

Make natural/adapted/weak/invalid position suitability affect coordinated
tactical execution without applying a second blanket penalty to player quality.

## User-Facing Reason

A talented player used outside his natural position may still perform, but his
timing, coverage, and connection with teammates should be less reliable than a
natural specialist's.

This is the last headless structural milestone. It proves which derived
capacities suitability changes and that no double penalty exists; production
match outcomes remain unchanged until Step 06 consumes those capacities.

## What To Implement

- Derive destination-slot suitability once from player natural positions and
  the typed tactical slot.
- Pass the typed suitability fact into intrinsic shape contribution.
- Apply suitability only to coordination-owned capacities frozen by the
  contract: connection, positioning, pressing cohesion, coverage, and related
  execution/error facts.
- Preserve the existing role-score calculation against destination-role
  ability weights without multiplying its complete result again.
- Keep natural/adapted/weak/invalid exhaustive and ordered by explicit policy.
- Add equal-attribute comparisons, exceptional adapted-player cases,
  goalkeeper isolation, left/right cases, and double-penalty regression tests.
- Remove any duplicated suitability scoring/mapping exposed by integrating the
  canonical domain evaluator.

## Clean-Code Requirements

- `position-suitability.ts` remains the only classification owner.
- Shape policy owns only coordination coefficients, not a second natural-role
  catalog.
- Name affected capacities explicitly; no `applyPenalty(value, boolean)`
  helper.
- Exported comments explain the existing implicit role-weight effect and why
  this modifier is narrower.

## What NOT To Implement

- No universal out-of-position multiplier.
- No role familiarity/training progression.
- No UI warning yet.
- No chance-volume or outcome change except through the intrinsic facts that
  Step 06 will consume.

## Expected Files

- `packages/domain/src/tactics/position-suitability.ts`
- `packages/domain/src/tactics/position-suitability.test.ts`
- `packages/domain/src/balance/match-tactics-calibration.ts`
- `packages/content/src/balance/match-tactics-calibration.json`
- `packages/content/src/balance/match-tactics-calibration.test.ts`
- `packages/content/src/schemas/match-tactics-calibration.schema.ts`
- `packages/content/src/schemas/match-tactics-calibration.schema.test.ts`
- `packages/engine/src/match-engine/tactical-shape.ts`
- `packages/engine/src/match-engine/tactical-shape.test.ts`
- `packages/engine/src/match-engine/tactic-team-context.test.ts`
- `packages/engine/src/match-engine/team-strength.ts` - added during the step.
  Suitability must be derived exactly once, beside the slot score and never
  inside it; this Module already owns per-slot scoring.
- `packages/engine/src/match-engine/team-strength.test.ts`
- `packages/engine/src/match-engine/tactical-matchup.test.ts` - added during the
  step. Its fixture builds a whole calibration, so the new required section
  stopped it compiling. One mechanical field, no behaviour.
- `packages/engine/src/match-engine/match-explanation-trace.test.ts` - same
  reason.
- `docs/PROJECT_STATUS.md`
- `docs/steps/81-.../09-ai-whole-xi-selection-and-shared-tactical-decisions.md`
  - the duplicated selection-ranking suitability scales.

`packages/engine/src/match-engine/tactic-team-context.ts` was listed and is not
modified: it already passes slot scores through, so suitability reached
intrinsic shape without a change there.

`docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md` was listed and is not modified:
this step is headless and adds no browser-visible surface.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/domain/src/tactics/position-suitability.test.ts \
  packages/content/src/balance/match-tactics-calibration.test.ts \
  packages/content/src/schemas/match-tactics-calibration.schema.test.ts \
  packages/engine/src/match-engine/tactical-shape.test.ts \
  packages/engine/src/match-engine/tactic-team-context.test.ts \
  packages/engine/src/match-engine/team-strength.test.ts
pnpm --filter @game/domain run typecheck
pnpm --filter @game/content run typecheck
pnpm --filter @game/engine run typecheck
pnpm depcruise
git diff --check
graphify update .
```

## Definition Of Done

- Suitability changes coordinated execution in the documented order.
- Destination-role attributes remain owned by role scoring.
- Tests prove no blanket double penalty.
- Strong adapted players can outperform weak natural players without becoming
  structurally identical.
- No duplicate suitability classifier remains.
- No gameplay-fix claim is made before Step 06 consumes the suitability-aware
  capacities.
- Step 06 is the only next action.
