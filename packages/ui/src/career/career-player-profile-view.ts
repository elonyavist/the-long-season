import {
  type CurrencyCode,
  type Money,
} from "@game/domain";

import {
  buildCareerContractView,
  type BuildCareerContractViewInput,
  type CareerContractView,
} from "./career-contract-view.ts";
import {
  buildCareerPlayerDetailView,
  type CareerPlayerDetailInput,
  type CareerPlayerDetailView,
} from "./career-player-detail-view.ts";
import {
  copyCareerPlayerPotentialRange,
  copyCareerPlayerRating,
  type CareerPlayerPotentialRangeView,
  type CareerPlayerRatingView,
} from "./career-player-rating.ts";
import type {
  CareerSquadAvailabilityReason,
  CareerSquadSelection,
} from "./career-squad-view.ts";

/** Safe football and contract facts required by the player profile. */
export interface CareerPlayerProfileInput extends CareerPlayerDetailInput {
  readonly shirtNumber: number;
  readonly firstName: string;
  readonly lastName: string;
  readonly age: number;
  readonly condition: number;
  readonly form: number;
  readonly morale: number;
  readonly selection: CareerSquadSelection;
  readonly availabilityReasons: readonly CareerSquadAvailabilityReason[];
  readonly value: Money;
  readonly currency: CurrencyCode;
  readonly currentRating: CareerPlayerRatingView;
  readonly potentialRange: CareerPlayerPotentialRangeView;
  readonly contract: BuildCareerContractViewInput;
}

/** Complete public player profile with no hidden numeric potential. */
export interface CareerPlayerProfileView extends CareerPlayerDetailView {
  readonly screenKey: "career.playerProfile";
  readonly shirtNumber: number;
  readonly displayName: string;
  readonly age: number;
  readonly condition: number;
  readonly form: number;
  readonly morale: number;
  readonly selection: CareerSquadSelection;
  readonly availabilityReasons: readonly CareerSquadAvailabilityReason[];
  readonly value: Money;
  readonly currency: CurrencyCode;
  readonly currentRating: CareerPlayerRatingView;
  readonly potentialRange: CareerPlayerPotentialRangeView;
  readonly contract: CareerContractView;
}

/** Builds the complete safe profile from current football and annual contract facts. */
export function buildCareerPlayerProfileView(input: CareerPlayerProfileInput): CareerPlayerProfileView {
  assertValidProfileInput(input);
  const detail = buildCareerPlayerDetailView(input);
  return {
    ...detail,
    screenKey: "career.playerProfile",
    shirtNumber: input.shirtNumber,
    displayName: `${input.firstName} ${input.lastName}`.trim(),
    age: input.age,
    condition: input.condition,
    form: input.form,
    morale: input.morale,
    selection: input.selection,
    availabilityReasons: [...input.availabilityReasons],
    value: input.value,
    currency: input.currency,
    currentRating: copyCareerPlayerRating(input.currentRating),
    potentialRange: copyCareerPlayerPotentialRange(input.potentialRange),
    contract: buildCareerContractView(input.contract),
  };
}

function assertValidProfileInput(input: CareerPlayerProfileInput): void {
  if (!Number.isInteger(input.shirtNumber) || input.shirtNumber <= 0) {
    throw new RangeError(`Invalid shirt number for player profile: ${input.shirtNumber}`);
  }
  if (!Number.isInteger(input.age) || input.age < 15) {
    throw new RangeError(`Invalid player age for player profile: ${input.age}`);
  }
}
