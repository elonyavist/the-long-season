# Phase 79D - Exceptional Player Generation, Prospect Economy And Non-Vacuous Diagnostics

## Status

Done by explicit product decision on 2026-07-30. All nine ordered documents are
closed. The implementation, focused diagnostics, full repository checks,
browser QA, and beta-reset path pass.

The attempted final `50 x 20` was stopped by the user after the direct runner
proved operationally unsuitable at one worker; it produced no report and is
not claimed as evidence. The user later moved that cohort to the end of Phase
80B, after the accepted UI, player-model, market, and loan reworks, where it
must use resumable checkpoints and exactly `7` workers so the machine remains
usable. Phase 79 Step 14 remains paused and unclaimed.

## Goal

Correct the player-level contradictions discovered after Phase 79C:

- no current six-star player generated through an incompatible child-prodigy
  archetype;
- no prospect whose public range reaches six-star upside valued as an ordinary
  low-level player;
- effective rarity budgets that constrain actual generated ratings;
- annual exceptional intake connected to real career composition;
- a public age- and role-aware potential range that distinguishes conservative
  expectation from uncertain upside;
- a rare `€150m` ceiling rather than an automatic target;
- no non-eligible value that rounds to the exact cap label;
- observable asking/offer/counter/completed-fee spread rather than a
  structurally unreachable counter path;
- diagnostic gates that cannot pass without relevant observations.

The binding corrective contract is:

`docs/audits/EXCEPTIONAL_PLAYER_GENERATION_AND_PROSPECT_ECONOMY_79D_SPEC.md`

## User-Facing Reason

When the manager sorts the Market by potential, the first rows must tell
credible football stories. A teenager may be an extraordinary prospect, but
the game must not present a `15`-year-old as an already complete six-star
champion or let the manager buy a publicly known future world star for a few
hundred thousand euros. Potential must read as a credible projection range, not
as certainty that every teenager reaches the stored ceiling.

## Entry Gate

- Phase 74 and Phase 75 player-model, generation, potential, and development
  foundations are complete.
- Phase 79 Steps 01-13, Phase 79A, and Phase 79B are complete.
- Phase 79C is complete and remains the canonical owner of the global scale,
  three-division topology, value/asking/fee separation, and versioned economy.
- Phase 79 Step 14 is Reopened. Its release-scale gate remains unrun and
  unclaimed.
- The post-79C implementation audit and independent review agree on all twelve
  root-cause findings recorded in the binding 79D specification.

## Locked Architecture

- Content owns deterministic player construction, archetypes, generation
  bands, rarity allocation, and the versioned balance assets.
- Domain owns stable rating/config shapes only.
- Engine owns public valuation, asking-price consumption, affordability, and
  career-season application without importing content.
- CLI and web composition select the career-stamped content versions and
  provide annual intake candidates to the engine.
- Simulation-tools consume caller-supplied structured observations and never
  import content.
- React renders `@game/ui` facts and does not calculate generation, ratings,
  values, or rarity.
- `Player.potential` remains the sole persisted internal ceiling. Engine derives
  one version-selected lower/expected/upper projection from current career
  facts; UI receives only public half-star facts.
- Preselect an exceptional slot, then construct a compatible profile. Do not
  use unbounded rejection sampling and do not force an arbitrary incompatible
  profile after generation.
- During beta, incompatible save/config/schema versions are deleted/reset
  through the canonical storage/runtime path. Do not add compatibility
  migrations, defaults, dual readers, or legacy projection fields.

## Ordered Steps

1. `01-reproducible-joint-profile-baseline-and-prospect-source-contract.md`
2. `02-archetype-compatible-exceptional-profile-construction.md`
3. `03-effective-initial-world-rarity-budgets-and-assignment-truth.md`
4. `04-production-annual-intake-allocation-and-longitudinal-caps.md`
5. `05a-headless-public-potential-projection-contract.md`
6. `05b-public-potential-range-integration-presentation-and-beta-reset.md`
7. `06-range-aware-prospect-value-negotiation-spread-and-rare-upper-cap.md`
8. `07-non-vacuous-joint-distribution-and-market-gates.md`
9. `08-50x20-browser-qa-phase-report-and-phase-79-handoff.md`

## Validation Ladder

- Step 01 adds read-only evidence and diagnostic ownership without changing
  gameplay behavior.
- Steps 02-06 use focused fixtures plus bounded multi-seed samples.
- Step 05a owns only the pure headless derivation contract.
- Step 05b atomically adopts production configuration, public read models,
  accessible six-slot presentation, and incompatible beta-save reset.
- Step 06 alone may change valuation, cap quantization, AI offer spread, and
  asking/counter/completed-fee behavior.
- Step 07 makes zero-observation semantics and joint-profile gates binding.
- Step 08 originally owned the final `50 worlds × 20 seasons` corrective run.
  The 2026-07-30 product decision closed 79D without claiming the interrupted
  run; the later accepted rework sequence moved that evidence to the end of
  Phase 80B.
- No earlier step may run `50 x 20`.
- No Phase 79D step runs or claims the release-scale `750`-world gate.

## Mandatory Per-Step Loop

For every step:

- reread `docs/PROJECT_STATUS.md`, this README, the active step in full, and the
  binding constraints in
  `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`;
- modify only the active step's Expected Files plus
  `docs/PROJECT_STATUS.md` and an explicitly permitted next-step lesson;
- run the active step's checks and fix failures before advancing;
- add useful JSDoc/TSDoc to every new or materially modified exported
  function/type so a junior developer can follow the owner and invariant;
- mark the active step `Done` and record adopted solution, verification,
  blocker/lesson, and next action in `docs/PROJECT_STATUS.md`;
- keep later 79D steps `Not started` until they become active.

## Phase-Level Checks

```bash
nvm use 24
pnpm check
pnpm --filter @game/web run build
pnpm web:visual:qa
pnpm cli ten-season-report \
  --seed-prefix=phase79d-exceptional-economy-50x20 \
  --worlds=50 \
  --seasons=20 \
  --report-output=docs/audits/EXCEPTIONAL_PLAYER_GENERATION_AND_PROSPECT_ECONOMY_79D_50X20_REPORT.md
git diff --check
graphify update .
```

Historical note: the command was started once, then stopped on explicit user
request and produced no report. A future rework closeout must use a documented
checkpoint directory, `50` stable shards, and `--workers=7`; it is new rework
evidence, not retroactive Phase 79D evidence.

## What NOT To Implement

- No scouting fog, scout staff, knowledge percentage, observation mission, or
  report expiry.
- No hidden current attributes or exact numeric potential in UI.
- No persisted potential floor/range or claim that its public lower estimate is
  guaranteed.
- No real-player/club data, live Transfermarkt integration, raw page cache, or
  runtime network dependency.
- No second rating scale, relative stars, or persisted elite Boolean.
- No unbounded rejection sampling, named-player exception, seed exception, or
  manual one-off profile.
- No collapse of public value, asking price, and final transfer fee.
- No wage model inferred from market value.
- No match, table, dynasty, goal, assist, or unrelated development tuning.
- No warning suppression or threshold relaxation to manufacture a pass.
- No beta save compatibility migration, fallback default, or dual reader;
  incompatible saves are deleted/reset.
- No `750`-world run and no Phase 80 implementation.

## Definition Of Done

- Initial current-six players use a credible current-star archetype and no
  incompatible teenage-prodigy path.
- Potential-only exceptional teenagers remain prospects with reachable,
  role-coherent profiles.
- Effective generated six-star stocks satisfy the initial and longitudinal
  budgets, not merely the forced-ID counts.
- Every production career composition path applies the annual world-level
  exceptional allocation exactly once.
- Young potential is presented as one deterministic role-aware lower-to-upper
  range; current rating remains singular, exact numeric potential remains
  hidden, and uncertain upside is not communicated by color alone.
- Elite-upside prospects have a calibrated non-trivial range-aware public-value
  floor without being priced as proven champions.
- Upper-tail compression applies to every player and `€150m` remains a rare
  hard clamp.
- Only eligible players display the exact public-value cap.
- Asking price, offered/counter/agreed/completed fee, affordability, and AI
  consume the corrected public value without duplicate formulas or a
  structurally unreachable counter path.
- Every rarity/value/cap gate declares a positive observation count or reports
  `not_evaluated`/failure.
- Focused checks, browser QA, beta-save reset evidence where applicable, and
  `pnpm check` pass.
- By explicit product decision, the interrupted `50 x 20` is deferred and
  unclaimed; Phase 79D closes without presenting partial output as evidence.
- Phase 79 Step 14 remains paused through Phases 80, 80A, 80B, and 80C. Phase 80C
  Step 09 owns one checkpointed `50 x 20` with exactly `7` workers before any
  return to the parent release-scale gate.
- The phase report explains that twenty seasons cover a representative
  age-15-to-35 arc and year-20 stocks while not proving equilibrium after year
  20.
