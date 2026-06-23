# Pre-UI Fun Signals And Blockers

Date: 2026-06-23
Phase: `47-pre-ui-engine-confidence-gate`
Step: `05-fun-signals-and-blocker-classification`
Status: Complete

## Purpose

Consolidate Phase 47 evidence into a fun-first blocker classification.

The question is not whether the engine is perfect. The question is whether the
current game is credible and understandable enough to start UI-readiness work
without hiding serious engine problems behind screens.

## Source Reports

- `docs/audits/PRE_UI_ENGINE_CONFIDENCE_SCOPE.md`
- `docs/audits/PRE_UI_MATCH_ENGINE_SAMPLE_REVIEW.md`
- `docs/audits/PRE_UI_CAREER_LOOP_SAMPLE_REVIEW.md`
- `docs/audits/PRE_UI_PLAYER_GENERATION_SANITY_REVIEW.md`

## Positive Fun Signals

| Signal | Why It Matters For The User |
|---|---|
| Fixture explanations make scorelines understandable. | The manager can believe results even when they are frustrating. |
| Strength differences influence matches without locking outcomes. | Upsets, draws, and late drama remain possible. |
| Named scorers, creators, keepers, and defenders produce stories. | Match reports feel player-driven, not abstract. |
| Career summary has a clear next fixture and missing-preparation state. | The first dashboard can immediately answer "what do I do next?" |
| Condition and development systems create long-term decisions. | Rotation, youth growth, and veteran decline can matter. |
| Ten-season sample passes with no structural failures. | The world can be exposed without obvious squad collapse. |
| Player generation has no role-coherence warnings in sampled worlds. | Squad screens should not show obviously absurd profiles. |
| Third-division current ability stays contained. | The starting league should feel like a lower division, not hidden top flight. |
| Youth academies are compact and controlled. | The game has a pipeline without flooding the world with youth players. |
| Club and player identities vary by seed. | New careers should feel meaningfully different. |

## Blocker Classification Table

| Finding | Affected system | User-facing symptom | Severity | Classification | Recommended action | Blocks UI readiness |
|---|---|---|---|---|---|---|
| Simulated fixture samples are explainable through strength, chances, and variance markers. | Match engine | Results feel interpretable, including draws and surprises. | Low risk | Healthy variance | Preserve current behavior. | No |
| `world-c` 3-3 has a weaker home side overperforming against a stronger away side. | Match engine | A memorable upset-like match with a late equalizer. | Low risk | Story-positive variance | Preserve and monitor only if systemic. | No |
| Standalone `simulate-season` fixture explanation says condition impact is not tracked. | CLI inspection / career distinction | User may wonder why condition is unknown in season smoke output. | Low | Post-UI improvement | Phase 48 must build UI data from career state, not raw simulate-season prose. | No |
| Career save starts with no saved match preparation. | Career loop | Dashboard should show "prepare match" as the next action. | Low | Positive decision signal | Use this as a first-screen readiness/blocker fact. | No |
| Career squad starts at 22 senior players and 11 youth for selected club. | Career state/content | Squad and youth counts are stable enough for dashboard. | Low | Positive fun signal | Proceed. | No |
| Youth player nationality can render as `unknown` in youth academy CLI output. | Youth identity/presentation | A dedicated youth screen would feel incomplete if it showed unknown nationality. | Medium for future youth UI, low for first dashboard | Post-UI improvement | Track before dedicated youth UI; first dashboard can show count/status only. | No |
| Ten-season 10x10 has two warning worlds and zero failures. | Long-run diagnostics | Warnings might look scary if exposed without context. | Low | Monitoring signal | Keep report semantics internal; Phase 48 should not surface raw warning rows as player advice. | No |
| Role coverage warning count is high in long-run report. | Long-run diagnostics / roster composition | Could be misread as "squad needs" if shown directly. | Medium if surfaced as advice | Monitoring signal | Do not expose as automatic recommendation. Review later only if tied to visible bad rosters. | No |
| Top assist and creator-share warnings occur in 10x10. | Match production diagnostics | A single creator may lead production in a season. | Low | Story or monitor signal | Preserve unless larger samples prove systemic dominance. | No |
| Player generation shows no current `15+` players in sampled third-division worlds. | Content generation | Lower-division squad UI will not look overpowered. | Low risk | Positive fun signal | Proceed. | No |
| Repeated Italian first names appear in dense selected-club identity samples. | Identity generation | Squad table may feel a bit samey in some saves. | Low | Post-UI polish | Revisit if visual squad table makes repetition annoying. | No |

## What Would Block Phase 48

No actual blocker was found in the reviewed evidence.

A future blocker would need to be one of:

- fixture explanations regularly contradicting scorelines;
- lower-division player generation showing obvious top-flight profiles;
- career saves lacking enough facts for selected club, next fixture, or match
  preparation;
- long-run reports showing squad collapse, missing goalkeepers, uncontrolled
  youth population, or recurring structural failures;
- UI-facing screens needing hidden data that the current product rules forbid
  exposing.

None of those conditions appeared in this Phase 47 sample.

## Risks To Carry Into Phase 48

1. Do not build the first UI by parsing CLI output.

   Use structured contracts/view models. CLI output remains inspection text.

2. Do not expose raw long-run warnings to the manager.

   They are development diagnostics. The first UI should show actionable
   manager facts, not internal warning rows.

3. Do not show automatic squad needs.

   The user decides formation and market. The UI can show coverage/facts later,
   but must avoid telling the manager what to buy as an engine recommendation.

4. Keep youth detail out of the first dashboard unless nationality presentation
   is fixed.

   Showing youth count is safe. Showing a full youth table with `unknown`
   nationality should wait.

5. Treat repeated first names as polish.

   It is not a logic bug; revisit only if the web squad table makes it feel
   repetitive.

## Step 05 Decision

Proceed to Step 06.

Phase 47 evidence supports moving toward UI-readiness work. The game has enough
credible match, career, and generation behavior for a first dashboard slice,
with no pre-UI blocker identified.
