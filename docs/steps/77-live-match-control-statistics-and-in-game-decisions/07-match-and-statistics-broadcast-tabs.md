# Step 07 - Match And Statistics Broadcast Tabs

## Status

Done.

## Goal

Rebuild the live Matchday information hierarchy around a stable football
broadcast surface and truthful comparative statistics.

## User-Visible Outcome

- `Partita` keeps the score dominant, shows one changing commentary line, a
  cumulative two-team tabellino, and compact possession/shots/xG.
- `Statistiche` shows complete home/away comparisons without horizontal scroll
  or a spreadsheet-like table.
- First-half incidents remain visible throughout the second half.
- Goals, penalties, cards, injuries, and substitutions are visually distinct
  and understandable without color alone.

## Scope

1. Make `Partita`, `Statistiche`, and `Tattica` the only live tabs and present
   them as tabs, not phase buttons or command cards.
2. Keep the score, match phase/minute, and current commentary in one stable
   full-width broadcast header.
3. Render only the current commentary fact; replace it without creating a
   growing live-feed list.
4. Build a cumulative tabellino from all incidents so second-half rendering
   retains first-half goals and decisions.
5. Present tabellino incidents in chronological home/away columns on desktop
   and stacked team groups on narrow screens.
6. Give goals the strongest hierarchy; present penalties, yellow/red cards,
   injuries, and substitutions more quietly with specific icons and text.
7. Show substitution `entra` and `esce` players explicitly.
8. Add a compact possession/shots/xG strip to `Partita`.
9. Build `Statistiche` with accessible comparative bars for possession, shots,
   shots on target, xG, corners, fouls, yellows, reds, saves, and goals.
10. Preserve stable dimensions at every playback speed and during ordinary,
    important, and decision events.
11. Keep all localization in UI/presentation adapters; no engine prose.

## Implementation Contract

- Components consume presentation-ready `@game/ui`/web adapter values and do
  not recalculate football statistics.
- The tabellino is a filtered projection of cumulative structured incidents,
  not a second event store.
- Specific icons come from the existing icon library where available and have
  visible/accessible labels.
- Empty states are compact and do not reserve large dead panels.
- Motion uses existing semantic presets; ordinary facts stay calm and goals
  receive only the bounded Phase 77 narrative treatment.
- Penalty award, penalty-outcome suspense, and goals are the only bounded
  narrative holds. Red cards and injuries requiring substitution remain real
  decision pauses; all other incidents keep the clock cadence unchanged.
- Full-time facts remain memory-only until the manager presses `Continua`;
  statistics and tab rendering must not publish career, Posta, or persistence
  updates.

## Expected Files

- `packages/ui/src/career/career-matchday-view.ts`
- `packages/ui/src/career/career-matchday-phase-view.ts`
- focused `@game/ui` tests
- `apps/web/src/features/matchday/MatchdayLivePhase.tsx`
- `apps/web/src/features/matchday/MatchdayPhaseTabs.tsx`
- `apps/web/src/features/matchday/MatchdayTabellino.tsx`
- new focused statistics/broadcast components under
  `apps/web/src/features/matchday/`
- `apps/web/src/features/matchday/career-matchday-presenter.ts`
- `apps/web/src/features/matchday/matchday-adapter.ts`
- focused component/presenter/adapter tests
- `apps/web/src/styles/components.css` and feature-local style/token files only
  where the current architecture assigns ownership
- existing shared motion Modules only if a production-used semantic preset must
  be refined
- `apps/web/src/visual-qa/current-product.spec.ts`
- `docs/audits/LIVE_MATCH_CONTROL_REPORT.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What NOT To Implement

- No tactical editing, new engine statistic, full-time consequence layout,
  infinite event list, event filter suite, commentary corpus, audio, 2D viewer,
  or wide statistics table.
- No hidden opponent facts or cosmetic metric.
- No new icon package when the installed library covers the incident.
- No animation that changes playback correctness or causes page growth.

## Required Checks

```bash
nvm use 24
pnpm --filter @game/ui run test
pnpm --filter @game/web run test
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run build
pnpm web:visual:qa
pnpm depcruise
git diff --check
graphify update .
```

## Manual Inspection

- Inspect event-light and event-rich halves at desktop and narrow widths.
- Confirm first-half incidents remain after second-half progression.
- Confirm goals, cards, injuries, and substitutions can be distinguished with
  color disabled and by screen reader labels.
- Confirm the page does not grow as commentary changes and statistics never
  create horizontal scroll at 200% text.

## Completion Criteria

- `Partita` and `Statistiche` communicate the current match at a glance.
- The tabellino is cumulative, concise, and incident-complete.
- All visible metrics equal engine facts and fit without horizontal page scroll.
- Goal emphasis is football-specific, bounded, and reduced-motion safe.
- Step 08 remains the only next implementation step.
