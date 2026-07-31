import {
  careerNonNegativeMoneyFromMinorUnits,
  CareerActiveContractInput,
  CareerContractBonusField,
  CareerContractTermsInput,
} from "@game/ui";

import type { WebPreferences } from "../../app/preferences";
import {
  formatMoneyInputFromMinorUnits,
  parseMoneyInputToMinorUnits,
} from "../../shared/format-money";

type ContractOfferTerms = CareerContractTermsInput;
type Money = CareerContractTermsInput["annualWage"];
type AgreedSquadStatus = CareerContractTermsInput["squadStatus"];

/** Text values owned by the renewal form while the authoritative career stays in the runtime. */
export interface ContractRenewalFormValues {
  readonly durationYears: string;
  readonly annualWage: string;
  readonly squadStatus: AgreedSquadStatus;
  readonly signingBonus: string;
  readonly appearanceBonus: string;
  readonly goalBonus: string;
  readonly cleanSheetBonus: string;
}

/** Stable field identifiers used for accessible validation messages. */
export type ContractRenewalFormField = Exclude<keyof ContractRenewalFormValues, "squadStatus">;

/** A valid command payload or focused field errors that preserve the user's draft. */
export type ContractRenewalValidation =
  | Readonly<{ status: "valid"; terms: ContractOfferTerms }>
  | Readonly<{
      status: "invalid";
      errors: Readonly<Partial<Record<ContractRenewalFormField, "required" | "invalid" | "out_of_range">>>;
    }>;

/** Creates an editable renewal draft from the current annual agreement. */
export function createContractRenewalFormValues(input: Readonly<{
  age: number;
  activeContract: CareerActiveContractInput;
  language: WebPreferences["language"];
}>): ContractRenewalFormValues {
  return contractTermsToFormValues({
    durationYears: recommendedDurationYears(input.age),
    annualWage: input.activeContract.annualWage,
    squadStatus: input.activeContract.squadStatus,
    bonuses: input.activeContract.bonuses,
  }, input.language);
}

/**
 * Converts safe projected terms back into editable annual-money strings.
 *
 * Amounts are written in the manager's own language, so the same text the form
 * shows is the text `validateContractRenewalForm` accepts back.
 */
export function contractTermsToFormValues(
  terms: CareerContractTermsInput,
  language: WebPreferences["language"],
): ContractRenewalFormValues {
  const money = (amount: Money): string => formatMoneyInputFromMinorUnits(amount, language);
  return {
    durationYears: String(terms.durationYears),
    annualWage: money(terms.annualWage),
    squadStatus: terms.squadStatus,
    signingBonus: money(terms.bonuses.signingBonus),
    appearanceBonus: money(terms.bonuses.appearanceBonus),
    goalBonus: terms.bonuses.goalBonus === undefined ? "" : money(terms.bonuses.goalBonus),
    cleanSheetBonus: terms.bonuses.cleanSheetBonus === undefined
      ? ""
      : money(terms.bonuses.cleanSheetBonus),
  };
}

/**
 * Normalizes one editable money field on blur, or returns it unchanged.
 *
 * An unreadable draft is never rewritten, so the manager keeps the exact text
 * that failed validation next to its message.
 */
export function normalizeContractMoneyInput(
  value: string,
  language: WebPreferences["language"],
): string {
  const parsed = parseMoneyInputToMinorUnits(value, language);
  return parsed.status === "valid"
    ? formatMoneyInputFromMinorUnits(parsed.minorUnits, language)
    : value;
}

/** Validates browser text without floating-point money conversion. */
export function validateContractRenewalForm(
  values: ContractRenewalFormValues,
  supportedBonusFields: readonly CareerContractBonusField[],
  language: WebPreferences["language"],
): ContractRenewalValidation {
  const errors: Partial<Record<ContractRenewalFormField, "required" | "invalid" | "out_of_range">> = {};
  const durationYears = parseDuration(values.durationYears);
  if (durationYears === undefined) {
    errors.durationYears = values.durationYears.trim().length === 0 ? "required" : "out_of_range";
  }

  const annualWage = parseMoney(values.annualWage, language);
  if (annualWage === undefined) errors.annualWage = moneyError(values.annualWage);
  const signingBonus = parseMoney(values.signingBonus, language);
  if (signingBonus === undefined) errors.signingBonus = moneyError(values.signingBonus);
  const appearanceBonus = parseMoney(values.appearanceBonus, language);
  if (appearanceBonus === undefined) errors.appearanceBonus = moneyError(values.appearanceBonus);

  const supportsGoalBonus = supportedBonusFields.includes("goal_bonus");
  const goalBonus = supportsGoalBonus ? parseMoney(values.goalBonus, language) : undefined;
  if (supportsGoalBonus && goalBonus === undefined) errors.goalBonus = moneyError(values.goalBonus);

  const supportsCleanSheetBonus = supportedBonusFields.includes("clean_sheet_bonus");
  const cleanSheetBonus = supportsCleanSheetBonus
    ? parseMoney(values.cleanSheetBonus, language)
    : undefined;
  if (supportsCleanSheetBonus && cleanSheetBonus === undefined) {
    errors.cleanSheetBonus = moneyError(values.cleanSheetBonus);
  }

  if (
    Object.keys(errors).length > 0
    || durationYears === undefined
    || annualWage === undefined
    || signingBonus === undefined
    || appearanceBonus === undefined
  ) {
    return { status: "invalid", errors };
  }

  return {
    status: "valid",
    terms: {
      durationYears,
      annualWage,
      squadStatus: values.squadStatus,
      bonuses: {
        signingBonus,
        appearanceBonus,
        ...(goalBonus === undefined ? {} : { goalBonus }),
        ...(cleanSheetBonus === undefined ? {} : { cleanSheetBonus }),
      },
    },
  };
}

/** Compares complete supported offer terms by integer minor units. */
export function contractTermsEqual(
  left: ContractOfferTerms,
  right: CareerContractTermsInput,
): boolean {
  return left.durationYears === right.durationYears
    && left.annualWage === right.annualWage
    && left.squadStatus === right.squadStatus
    && left.bonuses.signingBonus === right.bonuses.signingBonus
    && left.bonuses.appearanceBonus === right.bonuses.appearanceBonus
    && left.bonuses.goalBonus === right.bonuses.goalBonus
    && left.bonuses.cleanSheetBonus === right.bonuses.cleanSheetBonus;
}

function parseDuration(value: string): number | undefined {
  if (!/^\d+$/.test(value.trim())) return undefined;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed >= 1 && parsed <= 5 ? parsed : undefined;
}

/** Reads one contract amount through the single shared locale-safe parser. */
function parseMoney(value: string, language: WebPreferences["language"]): Money | undefined {
  const parsed = parseMoneyInputToMinorUnits(value, language);
  return parsed.status === "valid"
    ? careerNonNegativeMoneyFromMinorUnits(parsed.minorUnits)
    : undefined;
}

function moneyError(value: string): "required" | "invalid" {
  return value.trim().length === 0 ? "required" : "invalid";
}

/** Age-based starting contract length reused by every fresh (non-renewal) offer draft. */
export function recommendedDurationYears(age: number): number {
  if (age <= 21) return 4;
  if (age >= 32) return 2;
  return 3;
}
