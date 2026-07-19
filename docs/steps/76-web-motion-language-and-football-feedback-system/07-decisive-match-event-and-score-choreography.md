# Step 07 - Decisive Match Event And Score Choreography

## Status

Done.

## Goal

Give currently emitted decisive Matchday facts a restrained broadcast hierarchy
in which goals feel important and ordinary incidents remain fast.

## User-Visible Outcome

- A goal updates the correct side of the score with clear bounded emphasis.
- The scorer/assist commentary becomes the dominant live fact for the existing
  goal hold, then settles cleanly.
- Significant currently supported incidents receive secondary emphasis.
- Saves, misses, and blocks remain readable but visually quiet.

## Scope

1. Map currently emitted Matchday event priorities to the semantic motion
   categories without inventing unsupported event kinds.
2. Add a bounded goal sequence using score emphasis, event banner treatment,
   and existing structured scorer/assist facts.
3. Keep goal hold duration in the typed playback policy; Motion controls only
   the visual sequence inside that hold.
4. Add restrained significant-event treatment only for event kinds that have a
   current production fact and test fixture.
5. Keep the compact tabellino synchronized with the revealed structured facts
   without animating the entire list.
6. Make repeated goals and rapid frame interruption deterministic.
7. Preserve final checkpoint score restoration and full-time facts.

## Implementation Contract

- Goal motion never increments or derives the score. It presents the score
  already derived from the current immutable frame.
- No celebration claims, momentum claims, crowd behavior, or emotional prose
  may be invented.
- Do not add dormant branches for penalties, cards, injuries, or other future
  incidents unless the current engine already emits and the current web
  presenter already exposes those facts at implementation time.
- Emphasis uses transform/opacity/color within stable dimensions.
- Reduced motion keeps event hierarchy through static color, typography, and
  the existing readable hold.

## Expected Files

- `apps/web/src/features/matchday/career-matchday-presenter.ts`
- its focused test only for currently structured presentation classification
- `apps/web/src/features/matchday/CareerMatchdayScreen.tsx`
- its focused test
- `apps/web/src/features/matchday/MatchdayLivePhase.tsx`
- its focused test
- `apps/web/src/features/matchday/MatchdayTabellino.tsx`
- its focused test
- `apps/web/src/shared/motion/web-motion.ts`
- `apps/web/src/styles/components.css`
- `apps/web/src/visual-qa/current-product.spec.ts`
- `docs/audits/WEB_MOTION_SYSTEM_REPORT.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What NOT To Implement

- No new match event, event probability, commentary corpus, audio, crowd,
  confetti, camera shake, or full-screen celebration.
- No score mutation in React.
- No animation based on localized prose parsing.
- No extension of holds merely to make a longer animation fit.

## Required Checks

```bash
nvm use 24
pnpm --filter @game/web run test
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run build
pnpm web:visual:qa
git diff --check
graphify update .
```

## Manual Inspection

- Inspect no-goal, one-goal, multiple-goal, ordinary-event-heavy, and interrupted
  playback cases.
- Confirm the correct score side, scorer/assist facts, tabellino synchronization,
  stable controls, narrow reflow, and reduced-motion equivalence.

## Completion Criteria

- Goals are clearly the strongest current Matchday motion moment.
- Ordinary events remain calm and rapid.
- Every visual state is backed by current structured facts and deterministic
  frame identity.
