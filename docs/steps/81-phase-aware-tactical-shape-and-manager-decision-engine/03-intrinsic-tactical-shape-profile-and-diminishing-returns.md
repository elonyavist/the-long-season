# Step 03 - Intrinsic Tactical Shape Profile And Diminishing Returns

## Status

Done on 2026-08-03.

### Adopted Solution

One versioned asset, `match-tactics-calibration`, now carries the football
coefficients; `packages/engine/src/match-engine/tactical-shape.ts` carries the
arithmetic and none of the numbers. `buildTacticTeamContext` derives a
`TacticalShapeProfile` for a side when a caller supplies that calibration.

The model is three football ideas and nothing else:

1. **Every outfield player contributes to every task**, weighted by his
   canonical role and by how good he is. A striker helps build-up a little; a
   centre back is a little presence in the box. That is what stops an extreme
   shape from producing a structurally empty capacity, and the domain validator
   enforces it rather than trusting the author.
2. **Lateral work lands on the flank the player occupies.** A left-sided player
   covers the left, a central player splits himself, and the split is derived
   from one authored number mirrored around the centre line.
3. **Extra occupants of the same task are worth less each time.** Contributors
   are ranked best-first and each rank has a strictly smaller, strictly positive
   multiplier.

Raw totals become bounded capacities through `r / (r + reference)`. That is
strictly increasing, lands in `[0, 1)` by construction, has no clamp that can be
hit silently, and uses no transcendental function in the hot path.

Measured on the shipped calibration, an equal-quality reference `4-4-2` sits at
`0.52` on every one of the twelve capacities - mid-range, with room in both
directions - and the extremes separate the way football says they should:

| capacity | 4-4-2 | 4-3-3 | 3-1-6 | 8-0-2 | 0-0-10 |
| --- | --- | --- | --- | --- | --- |
| build_up | `0.525` | `0.529` | `0.516` | `0.542` | `0.236` |
| central_progression | `0.525` | `0.544` | `0.453` | `0.340` | `0.435` |
| left/right progression | `0.522` | `0.535` | `0.439` | `0.380` | `0.445` |
| final_third_presence | `0.523` | `0.520` | `0.608` | `0.493` | `0.641` |
| pressing_cohesion | `0.528` | `0.524` | `0.502` | `0.470` | `0.503` |
| central_coverage | `0.522` | `0.539` | `0.525` | `0.521` | `0.149` |
| left/right coverage | `0.520` | `0.481` | `0.292` | `0.423` | `0.237` |
| box_protection | `0.524` | `0.525` | `0.535` | `0.593` | `0.062` |
| counter_threat | `0.523` | `0.532` | `0.570` | `0.477` | `0.594` |
| rest_defence | `0.527` | `0.527` | `0.526` | `0.578` | `0.095` |

`3-1-6` buys final-third presence and counter threat and pays for it in flank
coverage, which nearly halves, and in central progression. `0-0-10` keeps the
threat and loses the ability to defend a box at all. No formation name appears
anywhere in the code that produced those numbers.

The same lineups produce **byte-identical `TeamStrength`**, which is the Step 01
defect stated as a passing test: the department collapse cannot tell these
shapes apart and the shape profile can.

### Scope Corrections Found Against The Code

Three, recorded because the step document was written before the code was read.

**The mathematical constraints were declared here, not inherited.** The step
claimed Step 01 froze "admissible mathematical constraints" for this asset. It
did not: Step 01 froze the *product outcome* bands - what structure may be worth
against squad quality - and `TACTICAL_SHAPE_THRESHOLDS` contains only those. The
four constraints were therefore declared at Step 03, before any coefficient was
written, and live in
`validateMatchTacticsCalibration(...)` with the reason recorded beside them:
non-negative weights, strictly decreasing and strictly positive marginal
contribution, bounded capacities, and left/right mirror symmetry. They remain
subordinate to the Step 01 outcome bands, which Step 06 tunes against.

**No tactic input belongs in the intrinsic profile.** The step asked for
"current tactics where intrinsically relevant". Checked against the design
contract the answer is *none of the five*. Contract section 6 gives every knob
an owner in Step 06, and each of those owners reads this profile - pressing
changes advanced recovery pressure *only when shape is coherent*, so it
multiplies `pressing_cohesion` there. Folding pressing in here would make Step 06
square it, which is the double-count the contract forbids for suitability and
forbids here for the same reason. The profile answers what a shape can do;
Step 06 answers what the manager does with it. Recorded in Step 06's document so
it is a decision rather than an omission.

**`team-strength.ts` was refactored inside this step's own scope.** Department
strength and intrinsic shape are two readings of one number - how good the
player in a slot is. Deriving it twice would be two places it could drift, so
`deriveLineupSlotScores(...)` now owns per-slot scoring and both
`teamStrengthFromSlotScores(...)` and `deriveTacticalShapeProfile(...)` read it.
Accumulation still follows lineup order, so `deriveTeamStrength` is unchanged to
the bit; a test asserts the two entry points agree. `team-strength.ts` and its
test were added to Expected Files for that reason.

### Why The Profile Is Optional On The Context

`MatchTeamContext.shape` and `BuildTacticTeamContextInput.matchTacticsCalibration`
are both optional, and that is not a fallback: there is no default calibration
and no invented profile, so a context either was given the numbers or was not.

Making them required would migrate eleven production context constructors across
engine, simulation-tools, web, and CLI. That migration belongs to the step that
actually consumes the profile, and doing it here would turn a headless
structural milestone into a repository-wide change with nothing reading the
result. The obligation and the exact file list are recorded in Step 06.

### Verification

```text
domain  + content + engine focused suites   7 files, 77 tests passed
team-strength.test.ts                       18 tests passed (slot-score seam)
pnpm --filter @game/domain  typecheck       exit 0
pnpm --filter @game/content typecheck       exit 0
pnpm --filter @game/engine  typecheck       exit 0
pnpm depcruise                              no violations (800 modules, 3200 dependencies)
git diff --check                            clean
```

One typecheck failure was found and fixed during the run: a test read
`context.shape?.capacities[capacity]` inside its own initializer and TypeScript
could not infer it (`TS7022`). No production code was involved.

### Blocker / Lesson

None blocking. One lesson that changes future work, already written into
Step 06: because the intrinsic profile carries no tactic effect, every tactic
knob multiplies its capacity exactly once, in Step 06. A later step that adds a
tactic term to this module would silently double-count it.

### Next Action

Step 04.

## Goal

Derive one deterministic intrinsic tactical-shape profile for a selected side,
with explicit phase/channel capacities and diminishing marginal contribution.

## User-Facing Reason

Adding a sixth attacker or an eighth defender should change what the team can
do, but it must not count like six independent full bonuses in the same space.

This is a headless structural milestone. A green Step 03 proves that the engine
can describe the shapes differently; it does not prove that match gameplay or
results changed.

## What To Implement

- Add one versioned, schema-validated match-tactics calibration asset for
  intrinsic contribution weights, diminishing-return bands, and capacity
  clamps. Step 01 froze the product outcome bands, not the admissible
  mathematical constraints, so this step declares those constraints before
  writing any coefficient and records that they were declared here.
- Add domain-owned calibration types consumed explicitly by content and engine.
- Implement one pure intrinsic tactical-shape Module from typed lineup facts,
  role contribution, and player quality/state inputs. No tactic input enters
  the intrinsic profile: every knob has a Step 06 owner that reads this
  profile, so folding one in here would double-count it.
- Derive the locked in-possession, out-of-possession, and transition
  capacities without reading the opponent.
- Apply deterministic diminishing returns in stable slot order with explicit
  final tie-breaks where ordering matters.
- Preserve player quality: a better player contributes more within the same
  task, while the shape profile remains distinct from `TeamStrength`.
- Validate finite bounded values, policy version, complete union handling, and
  no empty/unknown capacity.
- Add invariants for monotonic positive contribution, decreasing marginal
  contribution, left/right mirror symmetry, goalkeeper isolation, and
  `3-1-6` versus `4-4-2` profile difference.

## Clean-Code Requirements

- One Module owns contribution and diminishing-return math.
- Content stores data only; it does not import engine or duplicate formulas.
- Avoid generic matrix/registry abstractions. Use named football capacities and
  total mappings.
- Delete any superseded local role-count helper or copied clamp discovered in
  the owned files.

## What NOT To Implement

- No opponent comparison, final opportunity multiplier, result, UI, or AI
  choice.
- No formation-specific condition.
- No public 15-zone Interface.
- No implicit default policy.

## Expected Files

- `packages/domain/src/balance/match-tactics-calibration.ts`
- `packages/domain/src/balance/match-tactics-calibration.test.ts`
- `packages/domain/src/balance/index.ts`
- `packages/content/src/balance/match-tactics-calibration.json`
- `packages/content/src/balance/match-tactics-calibration.ts`
- `packages/content/src/balance/match-tactics-calibration.test.ts`
- `packages/content/src/schemas/match-tactics-calibration.schema.ts`
- `packages/content/src/schemas/match-tactics-calibration.schema.test.ts`
- `packages/content/src/index.ts`
- `packages/engine/src/match-engine/tactical-shape.ts`
- `packages/engine/src/match-engine/tactical-shape.test.ts`
- `packages/engine/src/match-engine/match-context.ts`
- `packages/engine/src/match-engine/match-context.test.ts`
- `packages/engine/src/match-engine/tactic-team-context.ts`
- `packages/engine/src/match-engine/tactic-team-context.test.ts`
- `packages/engine/src/match-engine/team-strength.ts` - added during the step.
  Per-slot scoring is the fact department strength and intrinsic shape share,
  and this Module already owns it; deriving it a second time inside
  `tactical-shape.ts` would be the duplication the project rules forbid.
- `packages/engine/src/match-engine/team-strength.test.ts` - same ownership.
- `packages/engine/src/match-engine/index.ts`
- `docs/PROJECT_STATUS.md`
- `docs/steps/81-.../06-phase-aware-control-opportunity-routes-and-tactic-semantics.md`
  - two obligations inherited from this step.

`docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md` was listed and is not modified:
this step is headless and adds no browser-visible surface.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/domain/src/balance/match-tactics-calibration.test.ts \
  packages/content/src/balance/match-tactics-calibration.test.ts \
  packages/content/src/schemas/match-tactics-calibration.schema.test.ts \
  packages/engine/src/match-engine/tactical-shape.test.ts \
  packages/engine/src/match-engine/match-context.test.ts \
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

- One explicit policy produces finite bounded intrinsic capacities.
- Initial coefficients respect every declared mathematical constraint and stay
  subordinate to Step 01's immutable product outcome bands.
- `3-1-6` and `4-4-2` produce different shape profiles at equal quality.
- Additional contributors help with strictly diminishing marginal value.
- Left/right mirrors are symmetric and no formation name is read.
- `TeamStrength` and shape remain separate concepts.
- No gameplay-fix claim is made: production opportunity and result behaviour
  is intentionally unchanged until Step 06.
- Step 04 is the only next action.
