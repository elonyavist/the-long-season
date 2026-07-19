# Step 04 - Persistent Compact Tabellino And Event Hierarchy

## Status

Active.

## Goal

Place one compact match record directly below the scoreboard and commentary so
the manager can understand decisive incidents without opening or scanning a
separate report.

## User-Visible Outcome

- The tabellino sits immediately below the score/commentary hierarchy.
- Goals are larger and use the primary football accent.
- Real substitutions and other currently supported non-goal incidents are
  smaller and quieter, with text/icon support rather than color alone.
- Desktop presents home and away incident lanes coherently.
- Narrow view presents one chronological compact list without horizontal
  scrolling.
- The tabellino remains bounded and does not make live playback behave like a
  log page.

## Scope

1. Define one presenter view for current tabellino incidents, club ownership,
   minute, player context, and visual priority.
2. Reuse that view in live, half-time, and full-time score context.
3. Place the component under the live commentary line.
4. Omit the component in pre-match when no real incident exists instead of
   showing an empty decorative panel.
5. Give goals and non-goal facts distinct but consistent hierarchy.
6. Add bounded overflow behavior inside the component only when event volume
   requires it; never create horizontal page overflow.

## Structured-Fact Boundary

- Render only event kinds already present in current structured phase facts.
- Render real applied substitutions only when their current data is available.
- Do not add inert `penalty`, `card`, or `injury` branches merely because the UI
  may need them in the future.
- When those systems eventually exist, their producer, schema, lifecycle,
  presenter, localization, and UI will be implemented together in their own
  documented scope.

## Expected Files

- `apps/web/src/features/matchday/CareerMatchdayScreen.tsx`
- `apps/web/src/features/matchday/CareerMatchdayScreen.test.ts`
- `apps/web/src/features/matchday/MatchdayLivePhase.tsx`
- `apps/web/src/features/matchday/MatchdayLivePhase.test.tsx`
- `apps/web/src/features/matchday/MatchdayHalfTimePhase.tsx`
- `apps/web/src/features/matchday/MatchdayHalfTimePhase.test.tsx`
- `apps/web/src/features/matchday/MatchdayFullTimePhase.tsx`
- `apps/web/src/features/matchday/MatchdayFullTimePhase.test.tsx`
- `apps/web/src/features/matchday/MatchdayTabellino.tsx`
- `apps/web/src/features/matchday/MatchdayTabellino.test.tsx`
- `apps/web/src/features/matchday/career-matchday-presenter.ts`
- `apps/web/src/features/matchday/career-matchday-presenter.test.ts`
- `apps/web/src/styles/components.css`
- `apps/web/src/visual-qa/current-product.spec.ts`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What NOT To Implement

- No new engine event or application fact.
- No fake icons or placeholder rows for future incidents.
- No second live feed or duplicate full-time story list.
- No generic timeline package or horizontally scrolling carousel.

## Required Checks

```bash
nvm use 24
pnpm --filter @game/i18n run test
pnpm --filter @game/web run test
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run build
pnpm web:visual:qa
git diff --check
graphify update .
```

## Manual Inspection

- Capture no-event, one-goal, multiple-goal, substitution, event-rich,
  desktop, wide, narrow, and 200% text states.
- Verify score -> commentary -> tabellino reads as one unit.
- Verify home/away ownership and chronology are unmistakable.
- Verify goals dominate without making secondary incidents disappear.
- Verify bounded internal overflow is keyboard/touch reachable if activated.

## Cleanup Boundary

Remove replaced live/full-time incident lists, duplicated event grouping,
selectors, labels, and tests after the shared compact tabellino covers all
current consumers. Keep no hidden old timeline for fallback.

## Completion Criteria

- One component and one presenter contract own the compact tabellino.
- It uses only current real structured facts.
- Live page height remains stable and narrow layouts have no horizontal scroll.
- Goal hierarchy is clear and secondary facts remain discoverable.
- The user can inspect the complete scoreboard/commentary/tabellino stack
  before Step 05.
