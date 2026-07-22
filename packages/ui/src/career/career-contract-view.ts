import {
  money,
  nonNegativeMoney,
  type AgreedSquadStatus,
  type CurrencyCode,
  type Money,
  type PlayerContractHistoryEvent,
  type PlayerContractType,
} from "@game/domain";

/** Bonus fields supported by the real contract command for this player. */
export type CareerContractBonusField = "signing_bonus" | "appearance_bonus" | "goal_bonus" | "clean_sheet_bonus";

/** Public contract terms. Every wage amount is annual, never monthly. */
export interface CareerContractTermsInput {
  readonly durationYears: number;
  readonly annualWage: Money;
  readonly squadStatus: AgreedSquadStatus;
  readonly bonuses: {
    readonly signingBonus: Money;
    readonly appearanceBonus: Money;
    readonly goalBonus?: Money;
    readonly cleanSheetBonus?: Money;
  };
}

/** Builds a presentation-safe money value from integer minor units. */
export function careerMoneyFromMinorUnits(minorUnits: number): Money {
  return money(minorUnits);
}

/** Builds a non-negative presentation money value for wages, fees, and bonuses. */
export function careerNonNegativeMoneyFromMinorUnits(minorUnits: number): Money {
  return nonNegativeMoney(minorUnits);
}

/** Current active agreement shown in the player profile. */
export interface CareerActiveContractInput {
  readonly contractId: string;
  readonly type: PlayerContractType;
  readonly startsOnIso: string;
  readonly endsOnIso: string;
  readonly annualWage: Money;
  readonly squadStatus: AgreedSquadStatus;
  readonly bonuses: CareerContractTermsInput["bonuses"];
  readonly remainingDays: number;
  /** The domain-aware adapter supplies the renewal-window decision. */
  readonly hasExpiryAlert: boolean;
}

/** One immutable public contract-history fact. */
export interface CareerContractHistoryInput {
  readonly historyId: string;
  readonly sequenceNumber: number;
  readonly occurredOnIso: string;
  readonly event: PlayerContractHistoryEvent;
  readonly contractId: string;
}

/** Finance facts needed to judge one contract command, with annual semantics. */
export interface CareerContractFinanceInput {
  readonly currency: CurrencyCode;
  readonly cashBalance: Money;
  readonly availableTransferBudget: Money;
  readonly annualWageBudget: Money;
  readonly committedAnnualWage: Money;
  readonly remainingAnnualWageBudget: Money;
}

/** Safe negotiation shape that deliberately excludes demand and evaluation internals. */
export type CareerContractNegotiationInput =
  | {
      readonly negotiationId: string;
      readonly status: "draft";
      readonly createdOnIso: string;
      readonly draftTerms: CareerContractTermsInput;
    }
  | {
      readonly negotiationId: string;
      readonly status: "awaiting_response";
      readonly submittedOnIso: string;
      readonly responseDueOnIso: string;
      readonly submittedTerms: CareerContractTermsInput;
    }
  | {
      readonly negotiationId: string;
      readonly status: "countered";
      readonly submittedOnIso: string;
      readonly counterIssuedOnIso: string;
      readonly counterExpiresOnIso: string;
      readonly submittedTerms: CareerContractTermsInput;
      readonly counterTerms: CareerContractTermsInput;
    }
  | {
      readonly negotiationId: string;
      readonly status: "accepted";
      readonly acceptedOnIso: string;
      readonly acceptedTerms: CareerContractTermsInput;
      readonly acceptedSource: "submitted_offer" | "counter_offer";
    }
  | {
      readonly negotiationId: string;
      readonly status: "rejected";
      readonly rejectedOnIso: string;
      readonly rejectedBy: "player" | "club";
    }
  | {
      readonly negotiationId: string;
      readonly status: "withdrawn";
      readonly withdrawnOnIso: string;
    }
  | {
      readonly negotiationId: string;
      readonly status: "expired";
      readonly expiredOnIso: string;
      readonly reason: "counter_offer_expired" | "current_contract_expired";
    }
  | {
      readonly negotiationId: string;
      readonly status: "release_at_expiry";
      readonly decidedOnIso: string;
    };

/** Stable contract command IDs rendered by the profile workflow. */
export type CareerContractActionId =
  | "start_renewal"
  | "edit_draft"
  | "submit_offer"
  | "withdraw_negotiation"
  | "accept_counter"
  | "reject_counter"
  | "revise_offer";

/** Explicit command descriptor without browser or React callbacks. */
export interface CareerContractActionView {
  readonly actionId: CareerContractActionId;
  readonly labelKey: string;
}

/** Editable field contract used by future renewal forms. */
export interface CareerContractDraftFieldView {
  readonly field:
    | "duration_years"
    | "annual_wage"
    | "squad_status"
    | CareerContractBonusField;
  readonly labelKey: string;
  readonly valueType: "integer_years" | "annual_money" | "money" | "squad_status";
  readonly minimum?: number;
  readonly maximum?: number;
  readonly options?: readonly AgreedSquadStatus[];
}

/** Complete contract sub-view consumed by the full-screen player profile. */
export interface CareerContractView {
  readonly activeContract: CareerActiveContractInput;
  readonly history: readonly CareerContractHistoryInput[];
  readonly negotiation?: CareerContractNegotiationInput;
  readonly finance: CareerContractFinanceInput;
  readonly draftFields: readonly CareerContractDraftFieldView[];
  readonly actions: readonly CareerContractActionView[];
}

/** Input for the contract sub-view. */
export interface BuildCareerContractViewInput {
  readonly activeContract: CareerActiveContractInput;
  readonly history: readonly CareerContractHistoryInput[];
  readonly negotiation?: CareerContractNegotiationInput;
  readonly finance: CareerContractFinanceInput;
  readonly supportedBonusFields: readonly CareerContractBonusField[];
}

const SQUAD_STATUS_OPTIONS: readonly AgreedSquadStatus[] = [
  "key_player",
  "regular_starter",
  "squad_player",
  "fringe_player",
  "prospect",
];

/** Builds safe annual contract facts and commands without hidden demand data. */
export function buildCareerContractView(input: BuildCareerContractViewInput): CareerContractView {
  assertUniqueHistory(input.history);
  return {
    activeContract: copyActiveContract(input.activeContract),
    history: [...input.history]
      .sort((left, right) => right.sequenceNumber - left.sequenceNumber)
      .map((entry) => ({ ...entry })),
    ...(input.negotiation === undefined ? {} : { negotiation: copyNegotiation(input.negotiation) }),
    finance: { ...input.finance },
    draftFields: buildDraftFields(input.supportedBonusFields),
    actions: actionsForNegotiation(input.negotiation),
  };
}

function buildDraftFields(
  supportedBonusFields: readonly CareerContractBonusField[],
): readonly CareerContractDraftFieldView[] {
  const fields: CareerContractDraftFieldView[] = [
    {
      field: "duration_years",
      labelKey: "career.contract.field.durationYears",
      valueType: "integer_years",
      minimum: 1,
      maximum: 5,
    },
    {
      field: "annual_wage",
      labelKey: "career.contract.field.annualWage",
      valueType: "annual_money",
      minimum: 0,
    },
    {
      field: "squad_status",
      labelKey: "career.contract.field.squadStatus",
      valueType: "squad_status",
      options: SQUAD_STATUS_OPTIONS,
    },
  ];
  const seen = new Set<CareerContractBonusField>();
  for (const field of supportedBonusFields) {
    if (seen.has(field)) continue;
    seen.add(field);
    fields.push({
      field,
      labelKey: `career.contract.field.${camelCaseBonus(field)}`,
      valueType: "money",
      minimum: 0,
    });
  }
  return fields;
}

function actionsForNegotiation(
  negotiation: CareerContractNegotiationInput | undefined,
): readonly CareerContractActionView[] {
  if (negotiation === undefined) {
    return [{ actionId: "start_renewal", labelKey: "career.contract.action.startRenewal" }];
  }
  switch (negotiation.status) {
    case "draft": return [
      { actionId: "edit_draft", labelKey: "career.contract.action.editDraft" },
      { actionId: "submit_offer", labelKey: "career.contract.action.submitOffer" },
      { actionId: "withdraw_negotiation", labelKey: "career.contract.action.withdraw" },
    ];
    case "awaiting_response": return [
      { actionId: "withdraw_negotiation", labelKey: "career.contract.action.withdraw" },
    ];
    case "countered": return [
      { actionId: "accept_counter", labelKey: "career.contract.action.acceptCounter" },
      { actionId: "reject_counter", labelKey: "career.contract.action.rejectCounter" },
      { actionId: "revise_offer", labelKey: "career.contract.action.reviseOffer" },
    ];
    case "rejected":
    case "withdrawn":
    case "expired": return [
      { actionId: "start_renewal", labelKey: "career.contract.action.startRenewal" },
    ];
    case "accepted":
    case "release_at_expiry": return [];
  }
}

function copyActiveContract(contract: CareerActiveContractInput): CareerActiveContractInput {
  return { ...contract, bonuses: { ...contract.bonuses } };
}

function copyNegotiation(negotiation: CareerContractNegotiationInput): CareerContractNegotiationInput {
  switch (negotiation.status) {
    case "draft": return { ...negotiation, draftTerms: copyTerms(negotiation.draftTerms) };
    case "awaiting_response": return { ...negotiation, submittedTerms: copyTerms(negotiation.submittedTerms) };
    case "countered": return {
      ...negotiation,
      submittedTerms: copyTerms(negotiation.submittedTerms),
      counterTerms: copyTerms(negotiation.counterTerms),
    };
    case "accepted": return { ...negotiation, acceptedTerms: copyTerms(negotiation.acceptedTerms) };
    case "rejected":
    case "withdrawn":
    case "expired":
    case "release_at_expiry": return { ...negotiation };
  }
}

function copyTerms(terms: CareerContractTermsInput): CareerContractTermsInput {
  return { ...terms, bonuses: { ...terms.bonuses } };
}

function camelCaseBonus(field: CareerContractBonusField): string {
  return field.replace(/_([a-z])/g, (_match, letter: string) => letter.toUpperCase());
}

function assertUniqueHistory(history: readonly CareerContractHistoryInput[]): void {
  const ids = new Set<string>();
  const sequences = new Set<number>();
  for (const entry of history) {
    if (ids.has(entry.historyId) || sequences.has(entry.sequenceNumber)) {
      throw new Error(`Duplicate contract history fact: ${entry.historyId}`);
    }
    ids.add(entry.historyId);
    sequences.add(entry.sequenceNumber);
  }
}
