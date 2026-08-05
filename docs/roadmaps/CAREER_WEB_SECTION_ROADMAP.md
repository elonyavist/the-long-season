# Career Web Section Roadmap

Date: 2026-08-03

## How This File Is Pruned

This roadmap describes the **open** work and the constraints it carries. It is
not a project history: a phase that is Done and constrains nothing further is
reduced to one line, and its detail lives in its report under `docs/audits/`
and in `git log`.

It reached `161 KB` on 2026-08-03, of which `101 KB` described finished phases.
That was cut. Keep the same rule when adding: a section earns its place by
constraining future work, not by being recent.

## Current Baseline

Phases 0 through 80A are complete. Phase 81 - Phase-Aware Tactical Shape And
Manager Decision Engine - is active; Steps 01 through 10 are Done and Step 13 is
next. Live constraints are in `docs/PROJECT_STATUS.md`.

Phase 69's single fixed web identity supersedes the earlier three-skin
experiment. Phase 80's nine steps established the global seven-worker
simulation policy, the shared achieved-versus-upside star language, the
paginated Market, the reworked Squad table, and centralized locale money
presentation.

## Open Phases

### Phase 79 - Transfer Market Windows, Negotiations And Market Workspace

Steps 01-13 are Done. The rest of the phase is closed and described by its
reports.

- **Step 14 is Reopened and paused.** Its release-scale long-run gate has never
  run and is unclaimed. Phases 79A, 79B, 79C, and 79D each returned control to
  it without running it; none of them may claim it.
- **Step 15 is not started.**
- Phase 78 Step 15 remains open under an explicit documented entry-gate
  override that let Phase 79 proceed. That override is still the only reason
  Phase 79 could start.
- No later phase claims Step 14 or Step 15. Phase 81 Step 15 and Phase 82B
  Step 09 own their own cohorts and are not substitutes.

### Phase 81 - Phase-Aware Tactical Shape And Manager Decision Engine

Active. Contract:
`docs/audits/PHASE_81_PHASE_AWARE_TACTICAL_SHAPE_AND_MANAGER_DECISION_ENGINE_DESIGN_CONTRACT.md`.

Two measured facts from Step 01 bind the web work that follows it:

- The tactical board lets a manager compose any of the `66` reachable
  department shapes, because only the goalkeeper slot is locked and no
  validator caps a department. The `23` named presets cover only `10` of them.
- The engine currently reduces all `66` to `7` distinct team strengths, so the
  board already promises a decision the engine does not honour. Step 06 is the
  first step allowed to claim that changed.

Step 02 landed the typed tactical slot seam: a lineup slot carries the
manager's canonical role rather than a four-way weight key, and
`broadRole` / `roleKeyForDomainSlot` survive only as presentation groupings for
the compact squad table, which a later UI step may revisit without touching
gameplay.

Step 07 gave the web two facts it did not have. A saved shot event now carries
the `route` it came down, at match-event schema `8`, so a match report can
distinguish a chance worked down the left from one worked down the right where
`chanceType: "cross"` covered both. The explanation trace, at schema `2`, adds
per-side `routeCounts` and `shooterCounts` beside the existing route capacity
rows - what the shape *opened* and what it actually *used*. Nothing in the UI
reads either field yet; Step 10 rendered shape consequences instead, so an
explanation surface for these two is still unclaimed.

Step 08 made that route actually reach a saved career. `match_events` had no
column for it, so every shot in a **web** career was written back without its
route while the matchday adapter read `event.shot.route` and always found
nothing; the JSON path kept it and the two backends silently disagreed. Both beta
versions advanced without a migration - OPFS schema `22 -> 23`, career envelope
`13 -> 14` - because a database written at `22` never stored the fact at all.
**Existing browser careers are deleted through the canonical reset flow.**

Step 08 also removed the last place where a club the manager had not prepared
was a special case: the web adapter and the CLI each built that context by hand,
with their own copy of the fallback eleven.

Step 09 removed the fallback eleven itself. Every club in the world - not only
the ones the manager faces - now picks its own team through one selection Module
and lines up in the catalog shape its squad is actually built for, instead of the
fixed `4-4-2` composed from roster order that every AI club used to field. The
selector chooses the best *eleven* rather than the best player for each slot in
turn, which the step measured as `5.9` points of team quality on a two-slot
counterexample, and the AI and the manager's own helper now rank footballers on
one scale rather than two that disagreed. The eleven each side fielded is carried
out of the played match, so nothing recomposes it afterwards.

**Step 14 is unblocked**: there is now more than one shape for a counter-move to
be measured against. Two things stay open for later steps - AI formation options
have no production supplier and are still ranked alphabetically, and the
opponent's eleven is not durable, so a reloaded reviewed result shows only the
footballers its events name.

Step 10 gave the board a consequence. Under the pitch, in match preparation and
in the live half-time workspace, at most three qualitative observations name what
this eleven gives up first, which flank it loads, and where it concentrates - in
five languages, with no capacity number, no percentage, no formula and no
recommended formation. A curated shape filled by the squad's own best eleven is
deliberately silent, so anything the manager reads is something he built: pushing
the whole back line forward reports an unprotected box and exposure in
transition beside the heavy presence in the opposition box it bought.

Three facts about that seam bind later web work. **The engine is the live
authority and the board is only the pre-match one** - during a match the section
follows the eleven the engine has accepted, so a refused change leaves it exactly
where it was rather than describing an edit nobody is playing. The observation
label keys are template literal types, so a new consequence without its five
translations fails the build instead of throwing the first time a manager builds
that shape; the remaining `presentationMessageKey` families still lack that and
remain unowned. And **a threshold is only coverage if something can cross it**:
a `loose_press` observation passed every check this step wrote and could never
have fired, because press cohesion barely moves with shape. A sweep over every
board a manager can build is now a gate, written per rule rather than per
capacity - the capacity moved plenty, just never in the direction the rule read.

**That defect also found the right place to look.** "Pressing cohesion" was on
this step's coverage list, and the capacity of that name cannot move the way a
warning needs. The engine already says where pressing actually costs you:
`TACTIC_KNOB_EXPOSED_ROUTE` hands the `direct` route to the opponent - push the
line up and the way to beat you is over it - and that route is resisted by box
protection and central coverage. So the manager is told **"pressing high with
little cover behind"**, and only when his own shape is thin there. A curated
eleven under the attacking profile stays silent, which a gate asserts, because
the observation is about the team he built rather than the tactic he picked. It
reads both mappings instead of restating either, so Steps 06 and 04 keep sole
ownership of what a tactic costs.

**One of the three slots is reserved for what the shape bought.** Costs rank
first, so a broken shape used to fill every slot with them - a tool that only
ever says why an idea will fail, when half its reason to exist is saying why it
might work. A back line pushed into attack now reads: own box unprotected,
exposed in transition, heavy presence in the opposition box. That is the trade
the manager made, which is the thing he can actually weigh.

**Recommended to Step 14, not built here.** At half time the manager has watched
the opponent for `45` minutes, and this panel still reads only his own shape.
Before kick-off that is right; after it, "they are loading my left" is what a real
manager thinks. The engine already knows it - Step 04's relational matchup, Step
07's `routeCounts` - and none of it reaches a screen. Changing shape to counter
something you cannot see is guessing, which is likely part of why formation still
measures `0.0312` while a tactic best-response reaches `+0.0327`.

Left for Step 13: desktop match preparation overflows horizontally at `200%`
text once the squad is filled, in `aside.tls-preparation-squad-panel`. It is
pre-existing - no test covered that viewport at that zoom - and Step 10's own
section is clear at the same setting.

Step 10 did not claim Step 07's `route`, `routeCounts` or `shooterCounts`. It
rendered shape consequences, not shot explanations, and nothing in the UI reads
those fields yet.

Step 15 alone runs this phase's checkpointed `50 x 20` with exactly seven
workers.

### Phase 81A - Season-Anchored Contracts, Free-Agent Economy And Background Fixtures

Draft. Do not start until Phase 81 is Done. Its numeric decisions - the free
agent peak band, the contract ladder, the drain requirement - were made before
measurement and must be revised against Phase 81's evidence.

Owns: contract expiry anchored to the season boundary, offered terms in months,
an AI free-agent signing policy, background fixtures inside
`advanceCareerMonths` for the selected club's division, and the simulate-match
command. It also owns the per-component tick-cost bench deferred from Phase 81
by amendment A3.

### Phase 82A - Incoming Offers, Market Postures And Loans

Draft, deferred behind Phase 81 and 81A. Previously numbered 80B. Its entry
gate requires a measured market density, not an assumption: if the measurement
lands inside the frozen bands, the loan work is re-argued rather than started.

Widens the squad-depth accessor to separate ownership from sporting
registration. Nothing else may.

### Phase 82B - Competitive Transfer Race And Player Choice

Draft, deferred behind Phase 82A. Previously numbered 80C. Owns the second
checkpointed `50 x 20`, over the completed competitive market.

## Future Web Backlog

Not scheduled, no contract yet:

- Finances Foundation
- Youth UI
- Staff Foundation
- Archive And History
- Main Dashboard Consolidation

## Completed Phases

Detail lives in the per-phase reports under `docs/audits/`. Listed here only so
the numbering is readable.

52 Web Match Preparation Slice · 53 Retro Football UI Identity · 54 Tactics And
Match Preparation Workspace · 55 Web Architecture State And Styling · 56
Canonical Formation And Role Catalog · 57 Shared Tactical Board · 58 Match
Preparation UX Rework · 59 Shared Bench Board · 60 Web Theme Palette · 61 Web
Visual Identity Rework · 62 Engine Safety Net · 63 Canonical Career Advancement
· 64 Match Consequences · 65 Matchday Flow · 66 Interactive Matchday · 67
Matchday Flow Simplification · 68 MVP UX Language Reset · 69 Web UI Full Rebuild
· 70 Matchday Information Architecture · 71 Career Persistence · 72 Session
Autosave · 73 Inbox/Posta Decision Center · 73A Web Product Quality Audit · 73B
Premium Remediation · 73C Matchday Broadcast Workspace · 74 Player Model
Consolidation · 75 Player Generation And Development Rework · 76 Web Motion
Language · 77 Live Match Control · 78 Senior Squad, Contracts And Finance
(Step 15 still open) · 79A/79B/79C/79D Market Follow-Ups · 80 Graphical And
Structural Rework · 80A Prospect Generation And Quarterly Development

## Phase Completion Standard

Each phase in this roadmap should almost complete the section it owns before the
project moves to the next section.

"Almost complete" means the section is not a thin placeholder and not just a
visual shell. It should include the main user journey, the core decisions, the
required read models, the browser UI, and enough validation to prove that the
section can survive future extension without being rewritten immediately.

At the end of every phase, run a section review before recommending the next
phase:

1. **Dependency review**
   Check package boundaries, imports, ownership, and whether any logic belongs
   in `domain`, `engine`, `ui`, `apps/web`, or another package.
2. **Code quality review**
   Check whether files are becoming too large, duplicated, unclear, unused, or
   hard to follow for a junior developer.
3. **Architecture review**
   Check whether the section is open to extension but closed to careless local
   changes, and whether the current abstractions are justified by real usage.
4. **UI/UX review**
   Check layout hierarchy, keyboard flow, accessibility, responsive behavior,
   text clarity, and whether critical decisions are visible in the first useful
   viewport.
5. **Fun review**
   Ask whether the section makes the career more engaging, gives the manager
   meaningful agency, creates tension, or improves long-term football stories.
6. **Improvement decision**
   If the section can be materially improved before moving on, prefer improving
   it inside the phase instead of carrying weak work forward. If the improvement
   is clearly future scope, document the reason and the exact future phase.

Do not close a phase just because the minimum UI renders. Close it only when the
section is strong enough that the next section can build on it without relying
on dead code, placeholder behavior, or known poor user experience.

## Non-Negotiable Rules

- Do not build a decorative screen before the underlying decision or read model
  exists.
- Do not add UI-only data that cannot later map to real career state.
- Do not parse CLI output to feed the web UI.
- Do not create automatic manager choices unless a phase explicitly requires
  AI behavior for non-user clubs.
- Do not hide core blockers at the bottom of a long dashboard.
- Do not create reusable abstractions until two real sections need them.
- Keep `@game/ui` framework-free and language-agnostic.
- Keep `apps/web` as the browser adapter.
- Keep engine rules out of React components.
- Run Playwright desktop and narrow screenshot QA for every browser-rendered
  phase.