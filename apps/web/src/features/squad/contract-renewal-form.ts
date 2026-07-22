import {
  careerNonNegativeMoneyFromMinorUnits,
  CareerActiveContractInput,
  CareerContractBonusField,
  CareerContractTermsInput,
} from "@game/ui";

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
}>): ContractRenewalFormValues {
  return contractTermsToFormValues({
    durationYears: recommendedDurationYears(input.age),
    annualWage: input.activeContract.annualWage,
    squadStatus: input.activeContract.squadStatus,
    bonuses: input.activeContract.bonuses,
  });
}

/** Converts safe projected terms back into editable annual-money strings. */
export function contractTermsToFormValues(
  terms: CareerContractTermsInput,
): ContractRenewalFormValues {
  return {
    durationYears: String(terms.durationYears),
    annualWage: formatMoneyInput(terms.annualWage),
    squadStatus: terms.squadStatus,
    signingBonus: formatMoneyInput(terms.bonuses.signingBonus),
    appearanceBonus: formatMoneyInput(terms.bonuses.appearanceBonus),
    goalBonus: terms.bonuses.goalBonus === undefined ? "" : formatMoneyInput(terms.bonuses.goalBonus),
    cleanSheetBonus: terms.bonuses.cleanSheetBonus === undefined
      ? ""
      : formatMoneyInput(terms.bonuses.cleanSheetBonus),
  };
}

/** Validates browser text without floating-point money conversion. */
export function validateContractRenewalForm(
  values: ContractRenewalFormValues,
  supportedBonusFields: readonly CareerContractBonusField[],
): ContractRenewalValidation {
  const errors: Partial<Record<ContractRenewalFormField, "required" | "invalid" | "out_of_range">> = {};
  const durationYears = parseDuration(values.durationYears);
  if (durationYears === undefined) {
    errors.durationYears = values.durationYears.trim().length === 0 ? "required" : "out_of_range";
  }

  const annualWage = parseMoneyInput(values.annualWage);
  if (annualWage === undefined) errors.annualWage = moneyError(values.annualWage);
  const signingBonus = parseMoneyInput(values.signingBonus);
  if (signingBonus === undefined) errors.signingBonus = moneyError(values.signingBonus);
  const appearanceBonus = parseMoneyInput(values.appearanceBonus);
  if (appearanceBonus === undefined) errors.appearanceBonus = moneyError(values.appearanceBonus);

  const supportsGoalBonus = supportedBonusFields.includes("goal_bonus");
  const goalBonus = supportsGoalBonus ? parseMoneyInput(values.goalBonus) : undefined;
  if (supportsGoalBonus && goalBonus === undefined) errors.goalBonus = moneyError(values.goalBonus);

  const supportsCleanSheetBonus = supportedBonusFields.includes("clean_sheet_bonus");
  const cleanSheetBonus = supportsCleanSheetBonus ? parseMoneyInput(values.cleanSheetBonus) : undefined;
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

function parseMoneyInput(value: string): Money | undefined {
  const normalized = value.trim().replace(",", ".");
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(normalized);
  if (match === null) return undefined;
  const whole = Number(match[1]);
  const fraction = Number((match[2] ?? "").padEnd(2, "0"));
  const minorUnits = whole * 100 + fraction;
  if (!Number.isSafeInteger(minorUnits)) return undefined;
  return careerNonNegativeMoneyFromMinorUnits(minorUnits);
}

function formatMoneyInput(amount: Money): string {
  return `${Math.floor(amount / 100)}.${String(amount % 100).padStart(2, "0")}`;
}

function moneyError(value: string): "required" | "invalid" {
  return value.trim().length === 0 ? "required" : "invalid";
}

function recommendedDurationYears(age: number): number {
  if (age <= 21) return 4;
  if (age >= 32) return 2;
  return 3;
}
