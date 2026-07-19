# Step 03 - Single Live Commentary Line And Decisive Event Moment

## Status

Done.

## Goal

Replace the growing live event log with one stable commentary line and give
goals a restrained, unmistakable broadcast moment.

## User-Visible Outcome

- One commentary line sits directly beneath the score.
- Each new structured event replaces the previous line in the same bounded
  area.
- The page height no longer grows as the half progresses.
- Goals use a stronger visual state, scorer context, and the Step 02 goal hold.
- Saves, misses, and blocks remain readable but visually quieter.
- Reduced motion shows the same facts without pulse/slide/fade effects.

## Scope

1. Derive one current commentary presentation from the visible playback frame.
2. Replace the accumulated `liveFeed` event-card rendering in the live phase.
3. Add a stable-height commentary region that can wrap safely at 200% text.
4. Add one bounded goal visual state using current goal/scorer/assist facts.
5. Use one polite live region and prevent duplicate announcements from score,
   commentary, and hidden event markup.
6. Keep event wording deterministic and localized from structured facts.

## Implementation Contract

- Commentary is presentation wording over current facts, not a new engine
  event or generated narrative stream.
- No sentence may claim pressure, intent, emotion, quality, or causation that
  the structured event does not contain.
- The previous commentary may fade visually, but it must be removed from the
  active accessibility tree when replaced.
- Goal treatment is premium and restrained: no confetti, flashing screen,
  camera shake, or audio dependency.
- Empty/opening/closing states use intentional copy and never show `none`,
  `unknown`, raw IDs, or a blank collapsing strip.

## Expected Files

- `apps/web/src/features/matchday/CareerMatchdayScreen.tsx`
- `apps/web/src/features/matchday/CareerMatchdayScreen.test.ts`
- `apps/web/src/features/matchday/MatchdayLivePhase.tsx`
- `apps/web/src/features/matchday/MatchdayLivePhase.test.tsx`
- `apps/web/src/features/matchday/career-matchday-presenter.ts`
- `apps/web/src/features/matchday/career-matchday-presenter.test.ts`
- `apps/web/src/features/matchday/matchday-playback.ts`
- `apps/web/src/features/matchday/matchday-playback.test.ts`
- `apps/web/src/styles/components.css`
- `apps/web/src/visual-qa/current-product.spec.ts`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What NOT To Implement

- No accumulated event list, marquee, chat log, or scroll-follow behavior.
- No runtime/build-time LLM, random prose variants, audio, or synthetic crowd
  reaction.
- No penalty/card/injury treatment without a real current event producer.
- No tabellino or half-time/full-time tab changes; later steps own them.

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

- Capture opening, miss, save, block, goal, half closing, narrow, 200% text,
  and reduced-motion commentary states.
- Record page height before and after a complete half; confirm live events do
  not create vertical growth.
- Verify a goal is immediately recognizable and remains long enough to read.
- Verify the line changes cleanly without overlap, layout shift, or stale
  accessible text.
- Verify pause keeps the current line and resume advances exactly once.

## Cleanup Boundary

Delete the accumulated live-feed JSX, replaced card helpers, selectors, labels,
fixtures, and assertions once the single-line path has equivalent fact and
accessibility coverage. Keep reusable event formatting only if Step 04 or later
has a current caller.

## Completion Criteria

- Live Matchday has exactly one current commentary line.
- The page does not grow as events advance.
- Goal and routine-event hierarchy is clear at desktop and narrow widths.
- One live region announces each visible event once.
- No dead live-feed list path remains.
- The user can inspect the complete live commentary slice before Step 04.
