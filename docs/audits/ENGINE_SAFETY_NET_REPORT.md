# Engine Safety Net Report

Date: 2026-06-25
Phase: `62-engine-safety-net-and-deterministic-regression-gates`

## Outcome

Phase 62 is complete.

The engine now has a small, explicit safety net for the behavior future phases
are most likely to change:

- full-season deterministic output;
- low-event match credibility;
- no-event minute stepping;
- current selected-club fixture progression;
- command discipline for future long-run verification.

No gameplay probabilities, player generation rules, career save schema, CLI
labels, web screens, or balance thresholds were changed.

## Tests Added

### Season Golden Sentinel

File:

- `packages/engine/src/use-cases/simulate-season.test.ts`

Test:

- `stable season seed produces a compact golden sentinel`

Protects:

- round count;
- fixture count;
- champion, runner-up, and bottom table rows;
- first and last fixture score/event/shot facts;
- top three scorer rows.

User-facing reason:

- future engine changes should not silently rewrite a season's table shape,
  scoring facts, or stable fixture evidence without an intentional gameplay
  decision.

### Match Low-Event Sentinel

File:

- `packages/engine/src/match-engine/simulate-match.test.ts`

Test:

- `zero-opportunity match stays deterministic and low-event`

Protects:

- a match can finish 0-0 with only structural events when no opportunities are
  possible;
- repeated identical input remains identical.

User-facing reason:

- low-event matches are part of football. The engine must not assume every
  match needs visible action to be valid.

### Step No-Event Minute Sentinel

File:

- `packages/engine/src/match-engine/step-match.test.ts`

Test:

- `zero-opportunity minute advances deterministically without visible events`

Protects:

- a non-kickoff minute can advance with no visible events;
- zero stats remain zero;
- processed-side order and simulation state remain deterministic.

User-facing reason:

- match presentation can later show uneventful time passing without needing fake
  events or hidden probability changes.

### Career Fixture Progression Sentinel

File:

- `packages/engine/src/career/progress-fixture.test.ts`

Test:

- `progressNextCareerFixture keeps a compact deterministic progression sentinel`

Protects:

- selected fixture ID;
- score;
- event count;
- match stats;
- fixture result applied into career state;
- current date behavior;
- selected-club condition deltas.

User-facing reason:

- Phase 63 can refactor career advancement orchestration while preserving the
  current meaning of advancing one prepared fixture.

## Documentation Added

### Audit

File:

- `docs/audits/ENGINE_SAFETY_NET_AUDIT.md`

Records:

- existing coverage;
- missing regression risks;
- risk classification;
- chosen Phase 62 gates;
- golden update protocol.

### Command Pack

File:

- `docs/audits/ENGINE_SAFETY_NET_COMMANDS.md`

Records:

- Node 24 setup;
- fast local engine gates;
- adapter smoke checks;
- balance and plausibility gates;
- heavier `ten-season-report` confidence and stress commands;
- full closeout with `pnpm check` and `graphify update .`.

## Intentionally Not Pinned

Phase 62 does not pin:

- localized CLI prose;
- full season snapshots;
- full match event lists for career fixture smoke;
- every generated player name or club name;
- every player stat row;
- private RNG stream internals;
- future season-advancement behavior that does not exist yet.

This is intentional. A good safety net should catch meaningful drift without
making future gameplay improvements painful.

## Golden Update Rule

A golden update is allowed only when a future phase intentionally changes
simulation behavior.

The update must document:

- what changed;
- why the user experience, football credibility, or manager fun improves or
  remains acceptable;
- which focused tests were rerun;
- which long-run or balance command was rerun when the change affects
  probabilities, generation, development, or turnover.

Do not update a golden just because it failed.

## Residual Risks

- There is still no canonical full-career season advancement use-case. Phase 63
  should fix this before more career systems are layered on top.
- CLI `--advance-next-fixture` correctly rejects a save without saved lineup and
  tactic. Future command packs should prepare the save first when they need a
  successful advancement smoke.
- Long-run confidence still depends on explicit `ten-season-report` commands,
  not a single cheap default check. This is acceptable because the expensive
  gates are too heavy for every local edit.
- The safety net protects current behavior; it does not prove the current
  balance is perfect.

## Web Roadmap Constraint Check

`docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md` was checked during each step.
Phase 62 is engine-scoped and did not mark any web section as complete. The web
roadmap remains the quality bar for future UI sections, while
`docs/roadmaps/CAREER_PLAYABILITY_AND_ENGINE_ROADMAP.md` remains the ordering
authority from Phase 62 onward.

## Next Phase Recommendation

Recommended next phase:

`Phase 63 - Canonical Career Advancement Use-Case`

Reason:

- the safety net now exists;
- career advancement still has orchestration risk;
- future match consequences, Inbox/Posta events, web matchday, finances, and
  season rollover all need one canonical engine Interface before the web can
  advance a save safely.
