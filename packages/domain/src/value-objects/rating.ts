import { brand, type Brand } from "../types/brand.ts";

/**
 * True ability value on the 0-20 football attribute scale.
 *
 * UI may later show floored integers and fog-of-war ranges, but the domain keeps
 * the precise true value.
 */
export type AbilityValue = Brand<number, "AbilityValue">;

/**
 * Dynamic state value on a 0-100 scale.
 *
 * Used for volatile concepts such as fitness, form, and morale.
 */
export type StateValue = Brand<number, "StateValue">;

/**
 * Builds a validated ability value.
 *
 * Fractional values are allowed because hidden development progress needs more
 * precision than the visible integer UI.
 */
export function abilityValue(value: number): AbilityValue {
  if (!Number.isFinite(value)) {
    throw new Error(`AbilityValue must be finite: ${value}`);
  }

  if (value < 0 || value > 20) {
    throw new Error(`AbilityValue must be between 0 and 20: ${value}`);
  }

  return brand<number, "AbilityValue">(value);
}

/**
 * Builds a validated dynamic state value.
 *
 * @example
 * const fullFitness = stateValue(100);
 * const neutralMorale = stateValue(50);
 */
export function stateValue(value: number): StateValue {
  if (!Number.isFinite(value)) {
    throw new Error(`StateValue must be finite: ${value}`);
  }

  if (value < 0 || value > 100) {
    throw new Error(`StateValue must be between 0 and 100: ${value}`);
  }

  return brand<number, "StateValue">(value);
}
