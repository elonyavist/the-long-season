# Career Attention And Posta Current-State Audit

Date: 2026-07-14  
Phase: `73-inbox-posta-decision-center-and-career-attention-workflow`  
Scope: evidence before source replacement

## Executive Finding

The current Posta experience is not a durable decision center. It is a compact
projection of the most recent `Continue` result. Messages are reconstructed
from fixture readiness, retained only in Zustand while the page is open, and
lost or recreated when the session is rediscovered. Read, acknowledgement, and
resolution therefore have no durable owner.

Preparation and match entry are also represented by two different attention
and message identities even though the product decision is one matchday item.
The current engine jumps directly to the next selected-club fixture rather than
evaluating canonical game dates one by one. These are contract problems, not
presentation defects, and must be corrected before the Posta screen is built.

## Current Continue Trace

| Order | Owner | Current responsibility | State effect |
|---|---|---|---|
| 1 | `AppShell` / dashboard command | Exposes `Continue` or a direct preparation/match action. | Starts the shared Phase 72 command runner. |
| 2 | `App.tsx` | Calls `webCareerRuntime.continueCareer()` and forwards the result to Zustand. | No message lifecycle mutation. |
| 3 | `web-career-runtime.ts` | Reads the working career, invokes `inspectWebCareerAttention`, replaces only `currentDate`, and requests autosave at a safe stop when policy permits. | Working-session date changes; messages remain presentation output. |
| 4 | `continue-career.ts` | Checks optional existing events, finds only the next selected-club fixture, jumps to its date, and emits either preparation-required or matchday-reached facts. | Pure result; no career mutation. |
| 5 | `career-ui-store.ts` | Stores the returned `continueResult`; automatically selects matchday only for `matchday_reached`. | Ephemeral browser state only. |
| 6 | view builders / shell | Convert result messages to rail summary and direct actions. | Derived display state only. |

The production runtime does not pass `existingAttentionEvents` to the engine.
Consequently the `existing_attention` branch exists in tests/contracts but is
not the production lifecycle owner.

## Current Contract Inventory

### Attention

Source: `packages/domain/src/career/attention.ts`.

| Field | Current values | Finding |
|---|---|---|
| category | `match_preparation_required`, `matchday_reached` | Two identities for one football decision. |
| priority | `routine`, `important`, `urgent` | Mixes visual urgency with stop semantics. |
| reason | `missing_match_preparation`, `ready_for_matchday` | Readiness is encoded as separate events. |
| blocker | `missing_saved_lineup`, `missing_saved_tactic` | Bench readiness is absent from the canonical facts. |
| identity | `attention:<fixtureId>:preparation` or `attention:<fixtureId>:matchday` | Changes when readiness changes. |
| unresolved | `actionRequired` | No acknowledgement or durable resolution rule. |

### Inbox

Source: `packages/domain/src/career/inbox.ts`.

| Field | Current values | Finding |
|---|---|---|
| category | same two match categories | Duplicates attention split. |
| priority | `routine`, `important`, `urgent` | Cannot directly answer whether Continue must stop. |
| status | `unread`, `read`, `resolved`, `expired` | One enum collapses independent read, acknowledgement, and resolution facts. |
| action | `prepare_match`, `open_matchday` | Correct bounded destinations, attached to unstable identities. |
| identity | `inbox:<fixtureId>:preparation` or `inbox:<fixtureId>:matchday` | Recreated rather than persisted. |
| source | implicit category/title key | No explicit functional sender contract. |

### Engine stop reasons

Source: `packages/engine/src/career/continue-career.ts`.

- `existing_attention`
- `match_preparation_required`
- `matchday_reached`
- `no_attention`

These values expose implementation stages instead of the product rule: stop on
the first date containing unresolved blocking or unacknowledged important
attention. Informational content is not represented.

## Proof Of The Two-Identity Problem

For the same fixture, missing preparation produces:

- `attention:<fixtureId>:preparation`
- `inbox:<fixtureId>:preparation`
- category `match_preparation_required`
- action `prepare_match`

After preparation becomes valid, inspection produces:

- `attention:<fixtureId>:matchday`
- `inbox:<fixtureId>:matchday`
- category `matchday_reached`
- action `open_matchday`

No lifecycle transition connects these records. The first item is not resolved
and transformed; it disappears from the derived output and a second identity
appears. Phase 73 must replace both with one stable fixture-scoped matchday
message whose blocker facts and primary destination are derived from current
readiness.

## Derived Versus Durable State

| Fact | Current owner | Lifetime | Target owner |
|---|---|---|---|
| Fixture date and result | `CareerState.gameState` | durable SQLite/OPFS | unchanged |
| Match preparation | `CareerState.matchPreparation` | durable SQLite/OPFS | unchanged source fact |
| Attention event | engine return value | one inspection | canonical daily evaluation plus persisted message lifecycle |
| Inbox message | engine return value converted by runtime | one command result | `CareerState` current-season inbox |
| Read state | not implemented | none | durable message lifecycle |
| Acknowledgement | not implemented | none | durable message lifecycle |
| Resolution | inferred from disappearing output | none | durable lifecycle derived from underlying resolution facts |
| Selected message | not implemented | none | web screen state, deterministic default |
| Filter | not implemented | none | web screen state |
| Latest Continue summary | Zustand `continueResult` | browser session | command feedback only, not message ownership |

SQLite/OPFS remains the only browser persistence authority. No IndexedDB,
localStorage, or second cache may be introduced.

## Current Posta Presentation

`AppShellPostaRail` is rendered in the shell's right column, despite older
documentation describing a left rail. It shows counts and at most two nested
message cards. Actions navigate directly to match preparation or matchday; the
message itself cannot be opened, selected, marked read, acknowledged, or
resolved. There is no dedicated Posta route, list/detail layout, or filter.

On narrow screens the shell collapses, but it does not provide the required
list-first then detail navigation. Matchday mode hides the rail. Current copy
and localization cover the two old categories, priorities, statuses, and
actions only. Some action keys are duplicated under different naming styles.

## Production Callers And Action Routing

| Caller | Current behavior | Phase 73 replacement |
|---|---|---|
| `web-career-runtime.continueCareer` | Returns newly derived message inputs. | Advance canonical days, persist delivered lifecycle records, return stop-date batch. |
| `inspectWebCareerAttention` | Recreates one next-fixture message. | Read/evaluate canonical current-season attention without becoming lifecycle storage. |
| `career-ui-store.receiveCareerSessionUpdate` | Stores latest result and may auto-route to matchday. | Store session plus Posta route state; no hidden route on message delivery. |
| `career-ui-store.handleInboxAction` | Switches screen directly by action ID. | Open selected message; explicit primary action routes to preparation or match center. |
| dashboard primary action | Repeats readiness routing outside Posta. | Keep clear football CTA while sharing the same canonical destination rule. |
| `AppShellPostaRail` | Executes action from preview card. | Compact left rail opens Posta and selected attention; no duplicate mini-workflow. |

## Locked Target Contract

1. Attention levels are exactly `blocking`, `important`, and
   `informational`.
2. `Continue` evaluates canonical `GameDate` values one day at a time.
3. It stops at the first date containing unresolved blocking or
   unacknowledged important attention.
4. Every message delivered on that date is returned together. Selection uses
   attention level, stable category order, creation order, then ID.
5. Informational messages are delivered but never stop advancement.
6. Matchday is one blocking message per fixture. Missing XI, bench goalkeeper,
   bench slots, or tactic are structured details. Its action is `prepare_match`
   until ready and `open_matchday` when ready.
7. Opening sets read state. Opening an important item also acknowledges it.
   Blocking items resolve only when their structured requirement resolves.
8. Message lifecycle is current-season durable state. Season rollover clears
   it; no archive is introduced.
9. Posta uses a compact left rail and a central two-column list/detail screen.
   Narrow screens show list then detail with an explicit back action.
10. Functional senders are structured keys, not fictional staff identities.
11. Calendar movement animates only after deterministic engine output, at
    roughly 100-140 ms per day, accelerates after seven days, caps near two
    seconds, and becomes immediate under reduced motion.
12. Market, contracts, finance, youth, and staff remain documentation-only
    extension obligations until their real workflows exist.

## Deletion And Replacement Map

| Target | Action | Owning step |
|---|---|---|
| Old attention priorities, two match categories, constructors, and unstable IDs | Replace without compatibility union. | Step 02 |
| Old stop reasons and direct jump-to-fixture algorithm | Replace with daily evaluation and same-date batching. | Step 03 |
| Absence of inbox fields in `CareerState`, schema, mapper, and SQLite storage | Add one current-season durable lifecycle model and migration. | Step 04 |
| Runtime-derived messages and unused production `existingAttentionEvents` seam | Replace with explicit lifecycle use cases over the working session. | Step 05 |
| Mirrored UI inbox contracts, missing Posta screen state, and implicit selection | Replace with one presentation read model and route state. | Step 06 |
| Right-column `AppShellPostaRail`, nested preview cards, direct preview actions, and obsolete CSS | Replace with left compact rail plus list/detail Posta outlet. | Step 07 |
| Separate preparation/matchday message branches and duplicated routing rules | Replace with unified matchday destination/resolution policy. | Step 08 |
| Missing result/rollover content and undocumented future categories | Add only real current workflows; record extension matrix without code. | Step 09 |
| Instant date replacement with no bounded transition | Add presentation-only calendar transition using Phase 72 command activity. | Step 10 |
| Old right-rail visual assertions, old category/action translations, obsolete selectors, and stale architecture text | Delete or update after all callers move. | Step 11 |

## Risks To Verify During Implementation

- Daily evaluation must not resimulate matches or mutate game facts before a
  command commits its result.
- Re-running Continue on the same date must be idempotent and must not create
  duplicate message IDs.
- A read blocking message must still stop Continue until its requirement is
  resolved.
- An important unread item opened once must not stop the next Continue merely
  because it remains unread in another presentation snapshot.
- Informational delivery must not become an accidental stop through sorting.
- Session dirty state may change on read/acknowledge, but it must not trigger an
  immediate database save contrary to Phase 72 policy.
- Rollover deletion must occur in the same canonical career mutation as the
  season change, not in React.

## Audit Conclusion

The phase assumptions are confirmed. Step 02 can replace the vocabulary and
identity model directly. No compatibility layer is justified: current messages
are not durable user data, and retaining the old categories would create two
competing matchday workflows.
