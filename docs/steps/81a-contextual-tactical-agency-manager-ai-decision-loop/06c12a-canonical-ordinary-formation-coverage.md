# Step 06C12A - Canonical Ordinary Formation Coverage

## Status

Planned. Step 06C12 found one real ordinary selection with a weak positional
fit and withheld downstream attribution.

## Goal

Make the free AI selector use the domain's one definition of credible formation
coverage. A player may cover an ordinary catalog slot only when suitability is
`natural` or `adapted`. Preserve the existing emergency catalog retry for the
rare squad that cannot field any credible eleven.

Player-facing reason: when the AI is free to choose its own shape, it should not
create a visible positional problem that another viable shape avoids. When no
credible shape exists, playing someone out of position remains preferable to
cancelling the fixture.

## Implementation Contract

- Import and call `isCoveringSuitability(...)` in the ordinary slot-candidate
  cache.
- Delete the selector's private `isUsableSuitability(...)`; one semantic has
  one owner.
- Do not change fit bonuses, player quality, formation catalog, identity charts
  or emergency candidate scoring.
- A caller-supplied formation remains authoritative and may still need the
  existing out-of-position fallback.
- A free selector first tries all catalog shapes with covering candidates; only
  when none can form eleven does `strongestEmergencyCatalogShape(...)` admit
  weak and invalid candidates.

## Frozen Acceptance Before Implementation

- The exact discovered club
  `phase81a-b2-downstream-replication-a-001 / club:ita-2-01` must field zero
  weak/invalid slots after the change.
- All `84/84` population rows in Step 06C12 must pass.
- The two Phase-1 matrices retain `6/9` best-response signatures, ubiquity
  `<= 4`, material cycles, zero conservation/mirror mismatch and no dominant
  response.
- Emergency-selector tests continue proving an eleven is fielded when no
  credible catalog shape exists.
- No target, tactic coefficient, squad identity or generated player changes.

After these pass, the unchanged Step 06C12 profile proceeds to its already
frozen `64`-context replay. Its owner decision, not this correction, determines
the next tactical step.

## Expected Files

- `packages/engine/src/team-selection/ai-squad-selection.ts`; consume the
  canonical domain coverage predicate and delete the duplicate;
- `packages/engine/src/team-selection/ai-squad-selection.test.ts`; pin ordinary
  weak-fit exclusion and emergency reachability separately;
- `docs/audits/PHASE_81A_CANONICAL_ORDINARY_FORMATION_COVERAGE.md` **(new)**;
- `docs/audits/README.md`;
- `docs/PROJECT_STATUS.md`;
- this step document;
- `06c12-independent-downstream-owner-replication.md`;
- `README.md`;
- the next step document only after the repeated owner is known.

Any discovered file is added here with ownership before editing it.

## Required Checks

```bash
nvm use 24
pnpm vitest run packages/engine/src/team-selection/ai-squad-selection.test.ts
pnpm cli simulation-report \
  --profile=phase81a-b2-downstream-replication --workers=7 --format=json \
  --report-output=simulation-out/phase81a-b2-downstream-replication.json
pnpm check
git diff --check
graphify update .
```

## Definition Of Done

One canonical predicate owns ordinary coverage, the real failed row is green,
emergency selection remains reachable, and the independent downstream
replication completes without population suppression.
