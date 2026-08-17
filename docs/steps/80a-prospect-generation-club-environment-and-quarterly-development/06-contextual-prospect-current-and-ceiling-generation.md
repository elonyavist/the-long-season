# Step 06 - Contextual Prospect Current And Ceiling Generation

## Status

Done.

The earlier bounded rework remains valid evidence for absolute ceiling and
division-quality prevalence, but it did not give one owner responsibility for
the joint current-to-stored-ceiling gap. Step 05 is now green with exact-age
projection evidence, so this step owns the generation defect directly rather
than allowing generation and public projection to hide one another's defects.

## Prior Completion Evidence (Superseded As Closeout)

The first bounded post-change cohort found two generation defects before
closeout:

- Third Division age-15-to-20 stored-ceiling-`3.5+` share was `275 / 3,244`
  (`8.48%`) against the frozen `4%..8%` band. The `interesting` lane currently
  samples `2.5..3.5`, so it overlaps the `serious` lane and makes `3.5` routine
  instead of sporadic.
- the closing division-value distribution exposed a missing First Division
  `4.5`/`5` population plus already-too-strong Second/Third Division
  `category_star` outliers. These are current-profile generation facts, not a
  reason to restore owner/category valuation multipliers or caps.

The repair gives every senior archetype a speaking current-quality profile,
keeps world-budgeted champions outside ordinary category-star adjustments,
and makes the upper edge of the Third Division `interesting` ceiling band
explicitly uncommon. Across the same `20` canonical opening worlds, the
age-15-to-20 `3.5+` shares are now `421 / 2,144` (`19.64%`) in First Division,
`252 / 2,176` (`11.58%`) in Second Division, and `130 / 2,095` (`6.21%`) in
Third Division. These figures remain the frozen absolute-ceiling prevalence
reference and must not be redefined as evidence for the new joint-gap contract.

## Goal

Generate young players whose current level and stored ceiling jointly match
age, division, dynamic club tier, role, and prospect class. Every explicitly
classified `interesting`, `serious`, or contextual `rare` prospect aged 15 through 20 must
start with at least `1.0` star of stored upside, while `routine` players may
legitimately start on a half-star quantization plateau.

## Accepted Semantics

- A rare lower-division phenomenon is possible but exceptional.
- Transfer does not rewrite current ability or stored ceiling.
- Prospect class describes ceiling quality, not current strength. In
  particular, `serious` must no longer be translated to the `rare` current
  lane merely because it has a strong possible future.
- Serious prospects meet their division ceiling bands; routine youth do not
  inherit those floors.
- At construction time, every `interesting`, `serious`, and contextual `rare` prospect
  aged 15 through 20 satisfies
  `storedCeilingRating - currentRating >= 1.0`, measured with the canonical
  role-relative half-star rating used by generation. This is a stored-ceiling
  invariant, not a public-upper promise.
- Routine prospects are not forced to expose upside and may have equal current
  and stored-ceiling stars despite positive sub-star ability room.
- Rare-prodigy current guardrails are age/category/strong-club aware.
- Role templates and off-role caps remain mandatory.

## What To Implement

- Replace the `serious_prospect -> rare current lane` shortcut; retain the
  separately documented rare-prodigy current guardrails.
- Encode the accepted ceiling matrix for `interesting`, `serious`, and `rare`
  prospects. The contextual `rare` class is the projection of the
  `rare_prodigy` archetype; do not invent a second class name in the joint
  owner.
- Encode the accepted rare-prodigy current guardrails for ages 15-17 and
  18-20.
- Introduce one speaking joint-profile owner for contextual prospect
  construction. The owner must build profiles ceiling-first:
  1. choose the stored-ceiling target from the already-frozen
     division/tier/role/prospect-class band and its existing deterministic
     weights;
     select the half-star outcome and one within-rating quantile once, then
     materialize the exact role ability only inside the interval reachable by
     this context. Do not collapse every ceiling to the rating threshold;
  2. derive the highest current rating compatible with the required `1.0`-star
     gap for explicit 15-to-20 prospects;
  3. derive the explicit prospect's ceiling-conditioned current envelope from
     age, division, tier, role, and the selected ceiling. This envelope replaces
     the invalid `serious -> rare current lane` shortcut; it may include a
     raw young player below the ordinary strong-current lower bound when that
     is necessary to keep the authored ceiling and one-star room coherent;
  4. give the envelope both bounds: its maximum preserves the required
     one-star rating gap, while its minimum guarantees that the selected target
     remains reachable through the age/role family-growth caps. A profile may
     not be made so raw that its advertised stored ceiling is mechanically
     unreachable;
  5. intersect that envelope with the role-template constraints;
  6. construct current attributes inside that intersection, then construct the
     stored potential profile to the previously selected ceiling target.
- Return a typed configuration/allocation failure when the prospect envelope,
  role-template, and required-gap intersection is empty. The failure must name
  the age, division, club tier, role, prospect class, current band, ceiling
  target, and required gap so an incompatible policy cannot become a silent
  player mutation.
- Make every generation root consume that same joint-profile owner: opening
  senior squads, initial academies, seasonal academy intake, and annual career
  intake. No composition root may reconstruct current and ceiling independently.
- Calibrate routine/good/serious frequencies toward the accepted category
  `3.5+` bands without hard-coding exact players.
- Keep Third Division `interesting` prospects at `2.5..3.5`, but make the
  `3.5` edge explicitly less likely than the lower outcomes; the `serious`
  lane remains the reliable `3.5+` owner.
- Give senior archetypes explicit, named current-quality profiles so
  `category_starter`, `category_star`, regular, veteran, and world-budgeted
  champion semantics cannot collapse onto one generic lane. Fill the accepted
  First Division quality continuum while keeping lower-division white-fly
  players inside their frozen output ranges.
- Preserve constructive generation and deterministic pre-allocation; do not
  use unbounded rejection sampling or post-force incompatible attributes.
- Replace `assembleGeneratedPlayer(...)`'s silent
  `potentialAtLeastCurrent(...)` repair with validation after the joint owner:
  producer facts must either be coherent or fail with the typed joint-profile
  error; the factory must not rewrite the selected ceiling.
- Remove the production-dead legacy role-template table, its one-to-one
  compatibility facade, and its facade-only test after every generation root
  consumes the joint owner. The canonical construction path lives in
  `player-current-profile-policy.ts` and
  `player-prospect-joint-profile.ts`; do not keep a second module name for the
  same policy or build the joint owner on a test-only compatibility API.
- Keep absolute ceiling selection unchanged while enforcing the joint gap by
  constraining current construction. Re-run the frozen First/Second/Third
  Division `3.5+` stored-ceiling shares and exceptional-stock counts as
  regression gates; the new invariant must not enlarge either numerator.
- Add comments that future countries reuse the national policy at their own
  composition root.

## What NOT To Implement

- No national ceiling-six top-up, intake cadence/size/composition-budget change,
  valuation, AI, or long run; Step 07 owns stock and intake frequency. Routing
  existing seasonal and annual intake players through the shared joint-profile
  owner is part of this step.
- No transfer-triggered potential boost.
- No screen-specific stars or hidden development destination.
- Do not raise a sampled stored ceiling after current generation, retry until
  a larger ceiling appears, silently clamp current after construction, or
  mutate attributes after construction to manufacture the gap. Those paths
  change the accepted ceiling distribution or hide an incompatible policy.
- Do not apply the mandatory `1.0`-star gap to `routine` players and do not use
  public P50/upper as the generation invariant.
- No division input, multiplier, or maximum in intrinsic valuation. Division
  may shape generated football ability only at this content owner.

## Expected Files

- `packages/content/src/generators/player-archetypes.ts`
- `packages/content/src/generators/player-archetypes.test.ts`
- `packages/content/src/generators/player-current-ability-bands.ts`
- `packages/content/src/generators/player-current-ability-bands.test.ts`
- `packages/content/src/generators/player-current-profile-policy.ts`
- `packages/content/src/generators/player-current-profile-policy.test.ts`
- `packages/content/src/generators/player-prospect-joint-profile.ts`
- `packages/content/src/generators/player-prospect-joint-profile.test.ts`
- `packages/content/src/generators/player-role-templates.ts` (removed)
- `packages/content/src/generators/player-role-templates.test.ts` (removed)
- `packages/content/src/generators/generated-player-factory.ts`
- `packages/content/src/generators/generated-player-factory.test.ts`
- `packages/content/src/generators/player-generation-bands.ts`
- `packages/content/src/generators/player-generation-bands.test.ts`
- `packages/content/src/generators/player-potential-allocation.ts`
- `packages/content/src/generators/player-potential-allocation.test.ts`
- `packages/content/src/generators/player-potential-rarity.ts`
- `packages/content/src/generators/player-potential-rarity.test.ts`
- `packages/content/src/generators/player-rarity-budget.ts`
- `packages/content/src/generators/fake-players.ts`
- `packages/content/src/generators/fake-players.test.ts`
- `packages/content/src/generators/initial-youth-academies.ts`
- `packages/content/src/generators/initial-youth-academies.test.ts`
- `packages/content/src/generators/career-intake-players.ts`
- `packages/content/src/generators/career-intake-players.test.ts`
- `packages/content/src/generators/domestic-world.ts`
- `packages/content/src/generators/domestic-world.test.ts`
- `packages/content/src/generators/player-generation-quality.test.ts`
- `packages/content/src/index.ts`
- `docs/audits/PHASE_80A_PROSPECT_ENVIRONMENT_AND_PLAYER_ECONOMY_DESIGN_CONTRACT.md`
- `apps/cli/src/commands/simulate-season/generated-inspection-output.ts`
- `apps/cli/src/commands/simulate-season.test.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- this step document

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/content/src/generators/player-archetypes.test.ts \
  packages/content/src/generators/player-current-ability-bands.test.ts \
  packages/content/src/generators/player-current-profile-policy.test.ts \
  packages/content/src/generators/player-prospect-joint-profile.test.ts \
  packages/content/src/generators/generated-player-factory.test.ts \
  packages/content/src/generators/player-generation-bands.test.ts \
  packages/content/src/generators/player-potential-allocation.test.ts \
  packages/content/src/generators/player-potential-rarity.test.ts \
  packages/content/src/generators/fake-players.test.ts \
  packages/content/src/generators/initial-youth-academies.test.ts \
  packages/content/src/generators/career-intake-players.test.ts \
  packages/content/src/generators/domestic-world.test.ts \
  packages/content/src/generators/player-generation-quality.test.ts \
  apps/cli/src/commands/simulate-season.test.ts
pnpm --filter @game/content run typecheck
pnpm --filter @game/cli run typecheck
git diff --check
graphify update .
```

## Definition Of Done

- Every generated `interesting`, `serious`, and contextual `rare` player aged 15 through
  20 has at least `1.0` canonical star between current rating and stored
  ceiling; routine-player plateaus remain legal and covered.
- Current/ceiling joint profiles satisfy the accepted contextual matrices
  without changing the frozen absolute-ceiling distribution.
- Serious prospects no longer inherit either the routine lane or the `rare`
  strong-current lane; their ceiling-conditioned envelope owns their current.
- Opening seniors, initial academies, seasonal academy intake, and annual
  career intake all call the same ceiling-first joint-profile owner.
- Empty policy intersections fail deterministically with the typed contextual
  error; no post-hoc raise, retry, or clamp path exists.
- An exhaustive age/division/tier/role/prospect-class/target-rating test proves
  that every supported production configuration has a non-empty joint
  envelope. It must evaluate every supported half-star target in each ceiling
  band rather than sampling one lucky seed. The deliberately unsupported
  First Division `rare_prodigy` placement at survival/mid-table clubs remains
  a typed placement failure and is tested separately, not counted as a valid
  empty configuration.
- Ordinary young players remain the majority.
- Role coherence and constructive determinism pass.
- Frozen division `3.5+` shares and exceptional-stock gates remain within their
  accepted bands on unchanged seeds.
- Step 07 remains Done and its stock gates are regression-tested here; Step 08
  becomes the only next active step after this reopened step is green.

## Completion Evidence

- Node `24.19.0`.
- One ceiling-first joint owner now serves opening seniors, initial academies,
  seasonal academy intake, and annual career intake. Composition roots pass
  only semantic `policy`, `at_least_rating`, or `below_rating` constraints.
- The ceiling stream selects one frozen half-star outcome plus one internal
  quantile. The exact ability is bounded before current generation by the
  highest reachable profile admitted by the one-star gap, rare guardrail, role
  template, and family-growth caps; no retry, post-target clamp, or ceiling
  raise remains.
- The exhaustive gate evaluates both exact interval boundaries for every
  supported age `15..20`, division, tier, role, prospect class, and half-star
  target. Weak First Division rare placements fail with the documented typed
  error and complete policy context.
- The generated-player factory now validates producer facts without rewriting
  them, and generated birth dates preserve exact civil age across leap years
  and the full jitter range.
- The compatibility-only role-template facade and the legacy current-first
  contextual allocator were deleted; low-level current/potential builders are
  no longer exported from the `@game/content` package barrel.
- Required Vitest: `14` files / `185` tests passed in `77.32s` without raising
  any timeout. The focused core fell from roughly `21s` to `5.67s` by reusing
  the ceiling interval and retaining sufficient binary-search precision.
- Frozen young stored-ceiling-`3.5+` shares remain First `421 / 2,144`, Second
  `252 / 2,176`, and Third `130 / 2,095`; exceptional-stock gates remain green.
- `@game/content` and `@game/cli` typechecks, focused ESLint, and
  `git diff --check` passed. Graphify was refreshed after the final code and
  documentation updates.
- Blocker: none. Step 08 is the only next active step; Step 09 remains paused
  until the valuation owner is green.

## Historical Completion Evidence

This evidence documents the earlier absolute-quality repair. It does not close
the reopened joint-gap owner.

- Node `24.19.0`.
- Required Vitest suite: `13` files / `163` tests passed.
- `@game/content` and `@game/cli` typechecks passed.
- The canonical seed matrix contains ordinary First Division category stars at
  both `4.5` and `5` current stars while lower-division category-star role
  ability remains at or below `14.25` in Second Division and `13.25` in Third
  Division.
- `git diff --check` and Graphify update passed.
