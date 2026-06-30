# Interactive Matchday Flow Visual QA

Date: 2026-06-30
Phase: `66-interactive-matchday-flow-and-half-time-decisions`
Step: `10-playwright-accessibility-and-fun-qa`

## Result

PASS.

The browser flow now proves a usable interactive matchday loop:

- dashboard/start career;
- match preparation;
- direct Continue-to-matchday route;
- direct dashboard "Go to match" route;
- pre-match match centre;
- half-time stop;
- half-time substitution decision;
- second-half continuation;
- full-time result and consequences;
- dashboard return.

## QA Command

```bash
nvm use 24
node --experimental-strip-types apps/web/src/visual-qa/interactive-matchday-flow.spec.ts
```

Screenshots were written to:

```text
/tmp/the-long-season-phase66
```

Captured evidence:

- `dashboard-ready-desktop.png`
- `dashboard-ready-narrow.png`
- `matchday-pre-match-desktop.png`
- `matchday-pre-match-narrow.png`
- `matchday-half-time-desktop.png`
- `matchday-half-time-narrow.png`
- `matchday-half-time-substitution-desktop.png`
- `matchday-half-time-substitution-narrow.png`
- `matchday-full-time-desktop.png`
- `matchday-full-time-narrow.png`
- `dashboard-after-match-desktop.png`
- `dashboard-after-match-narrow.png`

## Checks Performed

- Desktop viewport: `1440x960`.
- Narrow viewport: `390x844`.
- No horizontal page overflow.
- Primary Continue action is keyboard reachable from the shell navigation.
- Dashboard route to match centre is available through a clear "Go to match"
  action.
- Continue route reaches matchday directly when the engine reports
  `matchday_reached`.
- Half-time exposes rating, condition, lineup, bench, and substitution controls.
- Full-time consequences appear only after the match is complete.
- The match centre renders scoreboard, phase rail, event cards, highlight cards,
  and player rating rows instead of the old result-report layout.

## Issues Found And Fixed During QA

1. Pre-match QA originally required a live player table before any match facts
   existed. The check was corrected so player ratings are required only after
   the match has produced first-half/full-time facts.
2. The dashboard return click initially targeted a generic navigation button
   instead of the matchday screen's dashboard action. The selector now targets
   `.tls-matchday-dashboard`.
3. Narrow player stats were too compressed and clipped. The match-centre player
   table now becomes labelled card rows on narrow viewports.
4. Half-time rendered a duplicate generic "Apply changes" action that did not
   represent the useful decision. The generic action is hidden; the substitution
   panel owns the actual decision button.
5. Half-time substitution option labels were too verbose for narrow screens.
   The localized option pattern is now compact: player, role, rating, condition.

## Fun And UX Verdict

The screen no longer reads as a raw log table. It still contains a timeline, but
the hierarchy is now football-manager friendly: scoreboard first, phase state
second, half-time decision panel at the actual decision point, then timeline,
highlights, ratings, and consequences.

Half-time is a meaningful v1 decision point because the manager can see:

- current score;
- first-half events;
- player ratings;
- condition;
- bench options;
- applied substitution state.

## Residual Risks

- The top shell status still says "Ready to play" during half-time/full-time in
  the in-memory prototype. This is not a blocker for the match centre, but a
  later shell-state refinement should sync that status with active match phase.
- Narrow matchday is now readable, but still long. A future refinement can add a
  sticky compact scoreboard or tabs once more live-match decisions exist.
- First-half is simulated directly to half-time in v1. There is no live minute
  stepping UI yet; this is intentional until the event pacing and interaction
  model justify it.

## Manual Inspection Recommendation

Open the screenshots under `/tmp/the-long-season-phase66`, especially:

- `matchday-half-time-desktop.png`;
- `matchday-half-time-narrow.png`;
- `matchday-full-time-desktop.png`.

Check whether the event-card density and the half-time substitution panel feel
like a football manager centre, not a database report.
