# Player Role And Ability Current Audit

Date: 2026-06-22
Phase: `33-player-role-and-ability-generation-rework`
Step: `01-generation-audit-and-model-spec`
Status: Current-state audit before implementation

## Summary

The project already has a meaningful Phase 24 player-generation quality rework. It is not the original broad-base generator anymore.

However, Phase 33 is still justified because the current model is only partially explicit:

- generation is still primarily driven by `PlayerPosition`, not a durable role identity model;
- the role template set does not cover all official Phase 33 roles;
- archetypes describe age/potential/depth, but not style inside a role;
- hard caps exist in templates, but there is no reusable `coreForRole / secondaryForRole / allowedButLow / cappedOutOfRole` classification;
- potential is generated through the same role templates but development does not enforce role caps;
- youth academies still use Phase 32 `8` initial players plus `2..4` annual intake up to cap `12`, not exact refill to `11`;
- AI youth promotion decisions are based on current/potential averages, not explicit `high` or `elite` classifications;
- long-run reports found youth underpopulation and creator concentration anomalies.

## Source Areas Reviewed

- `requirements.md`
- `docs/PROJECT_RULES.md`
- `docs/PROJECT_STATUS.md`
- `docs/audits/PLAYER_GENERATION_QUALITY_AUDIT.md`
- `docs/audits/PLAYER_GENERATION_QUALITY_REWORK_REPORT.md`
- `docs/audits/YOUTH_ACADEMY_AND_SQUAD_PIPELINE_REPORT.md`
- `docs/audits/YOUTH_ACADEMY_LONG_RUN_REPORT.md`
- `packages/domain/src/entities/player.entity.ts`
- `packages/content/src/generators/fake-players.ts`
- `packages/content/src/generators/player-role-templates.ts`
- `packages/content/src/generators/player-generation-bands.ts`
- `packages/content/src/generators/player-archetypes.ts`
- `packages/content/src/generators/player-rarity-budget.ts`
- `packages/content/src/generators/initial-youth-academies.ts`
- `packages/engine/src/career/player-development.ts`
- `packages/engine/src/career/youth-intake.ts`
- `packages/engine/src/career/youth-lifecycle.ts`
- `packages/engine/src/career/youth-promotion.ts`
- `packages/simulation-tools/src/long-run/*`

## Current Domain Shape

`Player` currently stores:

- `id`
- `firstName`
- `lastName`
- `birthDate`
- `naturalPositions`
- `abilities`
- `potential`

It does not store:

- `primaryRole`
- `archetype`
- `naturalRoles`
- `adaptedRoles`
- `weakRoles`
- `roleFamiliarity`

Current `PlayerPosition` values are:

- `gk`
- `rb`
- `cb`
- `lb`
- `rwb`
- `lwb`
- `dm`
- `cm`
- `am`
- `rw`
- `lw`
- `st`

Audit conclusion: positions are a good pitch-location layer, but Phase 33 needs a football identity layer. Step 02 should decide whether to add this directly to `Player` or use a validated metadata layer first.

## Current Role Template Model

`packages/content/src/generators/player-role-templates.ts` currently defines these template keys:

- `goalkeeper`
- `full_back`
- `center_back`
- `wing_back`
- `central_midfielder`
- `wide_midfielder`
- `striker`

Missing compared with the Phase 33 official role list:

- `defensive_midfielder`
- `attacking_midfielder`
- `winger`

Current mapping:

- `dm`, `cm`, and `am` all map to `central_midfielder`;
- `rw` and `lw` map to `wide_midfielder`;
- there is no distinction between wide midfielder and winger.

Good current behavior:

- defenders have finishing caps;
- attackers have tackling caps;
- outfield players have low goalkeeper caps;
- goalkeepers have a distinct template path.

Remaining gap:

- templates are not expressed as reusable classifications;
- reports/development cannot ask whether an ability is core, secondary, allowed-low, or capped;
- hard-cap data is embedded inside template offsets, not a shared role contract.

## Current Division And Club-Tier Bands

`player-generation-bands.ts` defines:

- divisions: `first_division`, `second_division`, `third_division`;
- club tiers: `title_contender`, `playoff_contender`, `mid_table`, `survival`;
- current-ability anchors;
- potential-ceiling anchors.

Current third-division anchors:

- title contender current: `9.7..11`
- playoff current: `8.2..9.7`
- mid-table current: `6.7..8.2`
- survival current: `5.2..6.7`

Audit conclusion: this is already directionally aligned with lower-division realism. Step 04 should convert these broad anchors into role-classified bands so core/secondary/out-of-role values are separately constrained.

## Current Archetype And Potential Model

`player-archetypes.ts` defines:

- `senior_regular`
- `category_starter`
- `category_star`
- `veteran_drop_down`
- `normal_youth`
- `good_prospect`
- `serious_prospect`
- `rare_prodigy`

Current broad potential classes:

- `limited`
- `category`
- `interesting`
- `serious`
- `elite`

Good current behavior:

- current ability and potential are no longer identical;
- prospects generally start lower and receive potential uplift;
- `rare_prodigy` has large potential uplift and lower current offset;
- Phase 24 reports showed only a few `15+` current players in sample worlds.

Remaining gap:

- user-facing design now prefers `ordinary / interesting / high / elite`;
- archetype is not role style;
- serious/elite budget exists but should be aligned with division/season rarity language;
- youth promotion logic does not read potential classes.

## Current Senior Generation Path

`fake-players.ts`:

- chooses a club tier by generated club order;
- chooses an archetype by slot and league rarity assignment;
- generates current base from division/tier band, slot depth, variance, and archetype offset;
- chooses a `PlayerPosition` from squad slot;
- builds `abilities` from role template;
- builds `potential` from the same role template with a higher base;
- stores only `naturalPositions` on `Player`.

Audit conclusion: senior generation is deterministic and better than the original audit, but it still needs an explicit role identity/archetype layer and classification-based caps.

## Current Youth Generation Path

`initial-youth-academies.ts`:

- initial academy size is `8`;
- annual youth intake is `2..4`;
- annual intake is capped later by engine to max active academy size `12`;
- initial youth age range includes `15..19`;
- seasonal youth age range is `15..17`;
- positions are generated by slot/rng;
- youth use the same broad division bands and role templates as senior generation;
- `rare_prodigy` is limited by a single boolean in initial generation;
- seasonal intake has serious/good/normal probabilities, but no exact `11` refill target.

Audit conclusion: the current youth generator explains the Phase 32 underpopulation warning. The model caps overpopulation but does not guarantee post-lifecycle academy structure. Step 07 must replace intake behavior with exact refill to `11`.

## Current Youth Lifecycle And Promotion

`youth-lifecycle.ts`:

- develops active youth players through `developPlayersForSeason`;
- removes players aged `20+` from active academy rosters;
- marks some as `promotion_candidate`;
- releases/removes others.

`youth-promotion.ts`:

- selected club is protected by default;
- AI promotion can be allowed by lab/report commands;
- promotion is blocked when senior roster is full;
- usefulness is based on ability averages and average potential room.

Good current behavior:

- selected club is not silently auto-managed by default;
- senior and youth rosters remain separate;
- aged-out youth are explicitly processed.

Remaining gap:

- AI should promote only high/elite useful players;
- "interesting" should not be promoted automatically just because average potential room is high;
- user club over-19 decisions should be reported rather than auto-applied;
- refill must run after lifecycle/promotion/sale/release.

## Current Development Path

`player-development.ts`:

- uses broad position groups:
  - `goalkeeper`
  - `defender`
  - `midfielder`
  - `attacker`
- uses broad relevant/secondary ability sets;
- grows toward per-ability potential;
- decline is age/group based.

Good current behavior:

- growth is deterministic;
- growth is bounded by potential;
- goalkeepers have separate age/decline behavior;
- broad groups avoid totally uniform growth.

Remaining gap:

- development does not use full Phase 33 roles or archetypes;
- development does not know `coreForRole / secondaryForRole / allowedButLow / cappedOutOfRole`;
- if existing or future potential is above a role-incoherent cap, development can still move toward it;
- `dm`, `cm`, and `am` are all broad midfielders;
- `rw/lw/st` are all broad attackers.

## Current Long-Run Evidence

Phase 32 `250` worlds x `30` seasons:

- status: FAIL;
- failed worlds: `8`;
- warning worlds: `242`;
- failing check: `top_creator_goal_share_max`;
- youth overpopulation: controlled;
- youth max observed: `12`;
- clubs above youth target: `0`;
- clubs below youth minimum observations: `2523`;
- role coverage warnings total: `96356`.

Interpretation:

- the academy cap is working;
- exact refill is missing;
- current generation/development may contribute to role coverage warnings;
- creator concentration must be tracked after role/generation changes before tuning the match engine.

## Code Areas To Change In Later Steps

### Step 02

- `packages/domain/src/entities/player.entity.ts`
- content generation metadata/tests
- formation/position suitability integration if needed

### Step 03

- `packages/content/src/generators/player-role-templates.ts`
- new or refined role classification helpers/tests

### Step 04

- `packages/content/src/generators/player-generation-bands.ts`
- generation tests that assert role-classified bands

### Step 05

- `packages/content/src/generators/player-archetypes.ts`
- `packages/content/src/generators/player-rarity-budget.ts`
- simulation-tools report support if rarity summaries move there

### Step 06

- `packages/content/src/generators/fake-players.ts`
- content generation quality tests
- CLI/i18n only if report output changes

### Step 07

- `packages/content/src/generators/initial-youth-academies.ts`
- `packages/engine/src/career/youth-intake.ts`
- `packages/engine/src/career/youth-lifecycle.ts`
- `packages/engine/src/career/youth-promotion.ts`
- long-run youth metrics and CLI report rendering

### Step 08

- `packages/engine/src/career/player-development.ts`
- content-owned classification exports if engine receives them as caller-provided data or mirrored safe constants
- simulation-tools long-run cap metrics

### Step 09

- `packages/simulation-tools/src/long-run/*`
- `apps/cli/src/commands/*`
- `packages/i18n/src/*`

## Risks

1. Adding role identity directly to `Player` affects storage/domain tests and save compatibility. If this is too large, Step 02 should use an optional field or compatibility-safe constructor default.
2. Engine cannot import content. If development needs role classifications, they must be passed in or mirrored through domain-safe contracts without violating dependency rules.
3. Youth exact refill touches several Phase 32 systems and should replace old intake behavior cleanly instead of leaving parallel paths.
4. Creator concentration may remain after generation rework. If so, Phase 33 final report should classify it as a match-event distribution issue with failing seeds.
5. Reports must not expose exact hidden potential as normal user-facing truth.

## Immediate Next Step

Execute `docs/steps/33-player-role-and-ability-generation-rework/02-role-identity-and-familiarity-contracts.md`.

