# Step 06C2 - Double-Width Squad Identity Separation

## Status

Done: population `GO`. Both seed sets pass `21 / 21` local rows under the
unchanged gates. Tactical B2 remains `REFINE`, correctly isolated to lateral
route leverage.

## Goal

Make `double_width_stock` express its existing football claim — wing-backs plus
advanced wingers — instead of duplicating `wide_midfield_stock`'s four-man
midfield and strike pair.

## Frozen Change Before Output

The starting eleven becomes three centre-backs, two wing-backs, two central
midfielders, two wingers and one striker. Reserve stock preserves paired
wing-backs and wide midfielders, with enough central midfield depth to retain
the domain department floors. No formation key or selector hint is stored.

Only these position changes are authorized inside the existing 22-slot chart:

- starting `rm/lm/st` become `cb/rw/lw` in the corresponding football jobs;
- the surplus reserve striker becomes `cm` to preserve six midfielders.

## Gates

- every existing squad-identity invariant and real reachability test passes;
- all ten primary roles remain reachable across the identity catalog;
- B2 population becomes `21 / 21` in both seed sets under the unchanged local
  `0.30` share gate;
- at least six forms and all other Step 06A facts hold per competition;
- B2 tactical result may remain `REFINE`; this content step receives no credit
  for route leverage;
- no new formation replaces `4-4-2` as a local concentration failure.

## Expected Files

- `packages/content/src/generators/squad-identity.ts`
- `packages/content/src/generators/squad-identity.test.ts`
- `apps/cli/src/commands/career.test.ts` and
  `apps/web/src/runtime/web-career-runtime.test.ts`. The canonical world hash
  includes generated positions; CLI and web must move to the same measured
  value in one edit or the correction has split the two products;
- `apps/cli/src/commands/simulation-report/tactical-agency-b2-attribution.test.ts`.
  The old real-world reachability probe deliberately found the failure that
  this step removes. It becomes a current-population regression test while the
  immutable pre-correction evidence remains in the B2.1 audit;
- `docs/audits/PHASE_81A_DOUBLE_WIDTH_IDENTITY_CORRECTION.md` **(new)**
- `docs/audits/README.md`
- `docs/PROJECT_STATUS.md`
- this step document
- `06c1a-formation-identity-family-concentration-attribution.md`
- `README.md`
- `06c3-contextual-lateral-route-leverage.md`

## Required Checks

```bash
nvm use 24
pnpm exec vitest run packages/content/src/generators/squad-identity.test.ts
pnpm cli simulation-report --profile=phase81a-b2 --workers=7 --format=json \
  --report-output=simulation-out/phase81a-checkpoint-b2-after-identity.json
pnpm check
git diff --check
graphify update .
```

## Definition Of Done

The chart owns one coherent football identity, the selector remains free, every
population row passes unchanged in both seed sets, and the tactical failure is
still reported independently.

## Result

All identity invariants pass. The B2 retry removes both population failures
without creating another local concentration failure: `21 / 21` in-sample and
`21 / 21` out-of-sample. Tactical ubiquity remains `6.0529 / 6.3519`, so this
step receives no tactical credit. Artifact SHA-256:
`edb116f552fd7fe3df83b335ae40364e0e82ea5acfc95888c6d3f569c3804f8b`.
