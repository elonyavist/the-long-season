# Candidate Market Phase — Transfer Windows And Registration

## Goal

Tie market actions to the season calendar and squad-registration rules.

## Why this phase exists

The market should not be an always-open shopping menu. It must eventually live inside the football calendar and affect who can play.

## Possible Scope

- Transfer windows by competition/country config.
- Pending transfer operations by date.
- Registration limits if scoped.
- Squad registration update.
- Deadline validation.
- CLI calendar/window inspection.

## What NOT to include

- Deadline-day event mode.
- Media ticker.
- Complex country-specific edge cases.
- Continental registration.
- Youth-list exceptions unless required by active scope.

## Extension Points

- Window rules should be content/config data.
- Registration state should be separate from ownership state.
- Pending operations should be deterministic and saveable.

## Phase Gate Question

Can a transfer be valid economically but rejected because the window is closed or the player cannot be registered?

## Manual Inspection Target

The user should be able to inspect:

- current window state;
- accepted in-window transfer;
- rejected out-of-window transfer;
- squad registration after the move.
