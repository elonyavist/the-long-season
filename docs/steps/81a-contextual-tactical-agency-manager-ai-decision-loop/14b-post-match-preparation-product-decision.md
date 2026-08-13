# Step 14B — Post-Match Preparation Product Decision

## Status

**Active; product decision required, no implementation authorized.** Step 14
finished the persistence reset. This step is now the phase blocker because the
previous three-option design conflicts with accepted Amendment A11.

## Conflict Found In Production Design

- `plan_rehearsal` can affect a match only by adding another execution,
  selection or strength bonus. A11 explicitly forbids a third plan-execution
  candidate, direct formation bonus and hidden strength multiplier.
- `opponent_study` can be a manager information choice, but an AI policy that
  consumes it before kickoff violates option B's opponent-blind AI.
- an option that is merely stored and displayed but never changes information,
  fitness, selection or development is dead product code and is forbidden.

## Decision Needed

Choose a future product boundary before code:

1. manager-only delayed opponent study plus recovery, accepting asymmetric
   post-match agency in the MVP;
2. own-squad training allocation (for example recovery versus development),
   which requires a separate attribution against the existing monthly
   development owner before implementation;
3. defer post-match preparation entirely and close Phase 81A on pre-match
   own-squad selection, live reactions and durable explanation.

No option is recommended by editing thresholds or by reviving the rejected
tactical execution candidate. Whichever product is chosen receives its own
frozen reachability and non-dominance checkpoint before implementation.

## Expected Files

- this document;
- `15-checkpoint-e-multi-match-consequence.md` after the product decision;
- the Phase 81A design contract/amendment that records the decision.

No production file is in scope until the decision is explicit.
