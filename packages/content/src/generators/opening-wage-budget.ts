/**
 * Source-backed opening wage-budget projections shared by squad and finance
 * generation. Keeping this arithmetic in one content module prevents generated
 * contracts and finance accounts from drifting before a career starts.
 */
import {
  nonNegativeMoney,
  type Club,
  type ClubId,
  type Money,
  type PlayerWagePolicyConfig,
} from "@game/domain";

/** Context required to place one club inside its current division range. */
export interface OpeningWageBudgetInput {
  readonly club: Club;
  readonly clubs: Readonly<Record<ClubId, Club>>;
  readonly clubIds: readonly ClubId[];
  readonly wagePolicy: PlayerWagePolicyConfig;
}

/** Derives the reviewed annual wage ceiling for one generated club. */
export function deriveOpeningAnnualWageBudget(input: OpeningWageBudgetInput): Money {
  const config = input.wagePolicy.wageFinanceCalibration;
  const target = divisionTarget(input);
  const position = divisionPosition(input);
  const amount = position <= 0.5
    ? interpolate(
        target.annualSeniorWageBudgetMinimumMinorUnits,
        target.annualSeniorWageBudgetMedianMinorUnits,
        position * 2,
      )
    : interpolate(
        target.annualSeniorWageBudgetMedianMinorUnits,
        target.annualSeniorWageBudgetMaximumMinorUnits,
        (position - 0.5) * 2,
      );
  return nonNegativeMoney(roundMoney(amount, config.openingBudgetRoundingMinorUnits));
}

/**
 * Derives the opening committed-wage target inside the audited 70%..95% band.
 *
 * Reputation only chooses a deterministic point inside the documented range;
 * it does not introduce another hidden finance coefficient.
 */
export function deriveOpeningCommittedWageTarget(input: OpeningWageBudgetInput): Money {
  const target = divisionTarget(input);
  const position = divisionPosition(input);
  const utilization = interpolate(
    target.targetCommittedWageMinimumBasisPoints,
    target.targetCommittedWageMaximumBasisPoints,
    position,
  );
  const budget = deriveOpeningAnnualWageBudget(input);
  return nonNegativeMoney(roundMoney(
    (budget * utilization) / 10_000,
    input.wagePolicy.wageFinanceCalibration.annualWagePolicy.roundingMinorUnits,
  ));
}

function divisionTarget(input: OpeningWageBudgetInput) {
  const target = input.wagePolicy.wageFinanceCalibration.gameDesignTargets
    .find((candidate) => candidate.division === input.club.category);
  if (target === undefined) {
    throw new Error(`Wage-budget target missing for ${input.club.category}`);
  }
  return target;
}

function divisionPosition(input: OpeningWageBudgetInput): number {
  const divisionClubs = input.clubIds
    .map((clubId) => input.clubs[clubId])
    .filter((candidate): candidate is Club => candidate?.category === input.club.category);
  const minimumReputation = Math.min(...divisionClubs.map((candidate) => candidate.reputation));
  const maximumReputation = Math.max(...divisionClubs.map((candidate) => candidate.reputation));
  if (maximumReputation <= minimumReputation) return 0.5;
  return Math.max(
    0,
    Math.min(
      1,
      (input.club.reputation - minimumReputation) / (maximumReputation - minimumReputation),
    ),
  );
}

function interpolate(minimum: number, maximum: number, position: number): number {
  return minimum + (maximum - minimum) * Math.max(0, Math.min(1, position));
}

function roundMoney(value: number, precision: number): number {
  return Math.max(0, Math.round(value / precision) * precision);
}
