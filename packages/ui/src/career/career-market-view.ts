import type { CurrencyCode, Money } from "@game/domain";

import type { CareerContractTermsInput } from "./career-contract-view.ts";
import {
  buildCareerMarketTargetCatalog,
  type CareerMarketTargetCatalogView,
  type CareerMarketTargetFilters,
  type CareerMarketTargetInput,
  type CareerMarketTargetSort,
} from "./career-market-target-view.ts";

/** Current competition-window state projected by the engine. */
export type CareerMarketWindowView =
  | {
      readonly status: "open";
      readonly currentDateIso: string;
      readonly closesOnIso: string;
    }
  | {
      readonly status: "closed";
      readonly currentDateIso: string;
      readonly nextOpensOnIso?: string;
    };

/** Informational exposure that never reduces committed budget. */
export interface CareerMarketPendingExposureView {
  readonly transferFees: Money;
  readonly annualWages: Money;
  readonly signingBonuses: Money;
  readonly immediateCash: Money;
  readonly openNegotiationCount: number;
}

/** Actual selected-club finance facts shown beside informational exposure. */
export interface CareerMarketFinanceView {
  readonly currency: CurrencyCode;
  readonly cashBalance: Money;
  readonly transferBudget: Money;
  readonly annualWageBudget: Money;
  readonly committedAnnualWage: Money;
  readonly annualWageHeadroom: Money;
  readonly pendingExposure: CareerMarketPendingExposureView;
}

/** Exact before/after finance supplied by a canonical offer preview. */
export type CareerMarketOfferPreviewView =
  | {
      readonly status: "ready";
      readonly previewId: string;
      readonly kind: "transfer_offer" | "player_offer" | "counter_offer" | "preliminary_agreement" | "free_agent_offer";
      readonly transferFee: Money;
      readonly contractTerms?: CareerContractTermsInput;
      readonly currentFinance: Omit<CareerMarketFinanceView, "pendingExposure">;
      readonly projectedFinance: Omit<CareerMarketFinanceView, "pendingExposure">;
      readonly existingPendingExposure: CareerMarketPendingExposureView;
    }
  | {
      readonly status: "blocked";
      readonly previewId: string;
      readonly reason: string;
    };

/** Public stage names shared by transfer and preliminary negotiations. */
export type CareerMarketNegotiationStage =
  | "club"
  | "player"
  | "preliminary_agreement";

/** Public negotiation lifecycle shown without demand or willingness internals. */
export type CareerMarketNegotiationStatus =
  | "submitted"
  | "countered"
  | "accepted"
  | "player_offer_submitted"
  | "player_countered"
  | "offer_submitted"
  | "agreed"
  | "completed"
  | "rejected"
  | "player_rejected"
  | "withdrawn"
  | "expired"
  | "player_expired"
  | "unaffordable"
  | "completion_failed"
  | "activation_cancelled"
  | "activated";

/** Safe selected-club negotiation fact for the Market workspace. */
export interface CareerMarketNegotiationInput {
  readonly negotiationId: string;
  readonly playerId: string;
  readonly playerName: string;
  readonly counterpartClubName?: string;
  readonly stage: CareerMarketNegotiationStage;
  readonly status: CareerMarketNegotiationStatus;
  readonly openedOnIso: string;
  readonly deadlineOnIso?: string;
  readonly resolvedOnIso?: string;
  readonly transferFee?: Money;
  readonly annualWage?: Money;
  readonly outcomeReason?: string;
  /** Full terms currently on the table, when this stage has annual terms. */
  readonly offeredTerms?: CareerContractTermsInput;
  /** Full counterparty counter, when the current stage is a live counter. */
  readonly counterTerms?: CareerContractTermsInput;
}

/** Negotiation summary with a stable pending/completed classification. */
export interface CareerMarketNegotiationView extends CareerMarketNegotiationInput {
  readonly lifecycle: "pending" | "completed";
}

/** Ready input for one complete framework-free Market screen. */
export interface CareerMarketReadyInput {
  readonly status: "ready";
  readonly competitionName: string;
  readonly window: CareerMarketWindowView;
  readonly finance: CareerMarketFinanceView;
  readonly targets: readonly CareerMarketTargetInput[];
  readonly filters?: CareerMarketTargetFilters;
  readonly sort?: CareerMarketTargetSort;
  readonly offerPreview?: CareerMarketOfferPreviewView;
  readonly negotiations: readonly CareerMarketNegotiationInput[];
}

/** Pending, recoverable error, or canonical ready Market source. */
export type CareerMarketViewInput =
  | { readonly status: "loading" }
  | { readonly status: "error"; readonly messageKey: string }
  | CareerMarketReadyInput;

/** Complete Market view with first-class loading and error states. */
export type CareerMarketView =
  | { readonly status: "loading"; readonly screenKey: "career.market" }
  | {
      readonly status: "error";
      readonly screenKey: "career.market";
      readonly messageKey: string;
    }
  | {
      readonly status: "ready";
      readonly screenKey: "career.market";
      readonly competitionName: string;
      readonly window: CareerMarketWindowView;
      readonly finance: CareerMarketFinanceView;
      readonly targets: CareerMarketTargetCatalogView;
      readonly offerPreview?: CareerMarketOfferPreviewView;
      readonly negotiations: readonly CareerMarketNegotiationView[];
    };

const PENDING_NEGOTIATION_STATUSES: ReadonlySet<CareerMarketNegotiationStatus> = new Set([
  "submitted",
  "countered",
  "accepted",
  "player_offer_submitted",
  "player_countered",
  "offer_submitted",
]);

/** Builds the Market overview from already-derived engine and adapter facts. */
export function buildCareerMarketView(input: CareerMarketViewInput): CareerMarketView {
  if (input.status === "loading") return { status: "loading", screenKey: "career.market" };
  if (input.status === "error") {
    return { status: "error", screenKey: "career.market", messageKey: input.messageKey };
  }

  assertFinance(input.finance);
  assertUniqueNegotiations(input.negotiations);
  return {
    status: "ready",
    screenKey: "career.market",
    competitionName: input.competitionName,
    window: copyWindow(input.window),
    finance: copyFinance(input.finance),
    targets: buildCareerMarketTargetCatalog(input.targets, input.filters, input.sort),
    ...(input.offerPreview === undefined ? {} : { offerPreview: copyPreview(input.offerPreview) }),
    negotiations: input.negotiations
      .map((negotiation): CareerMarketNegotiationView => ({
        ...negotiation,
        lifecycle: PENDING_NEGOTIATION_STATUSES.has(negotiation.status) ? "pending" : "completed",
      }))
      .sort(compareNegotiations),
  };
}

function compareNegotiations(
  left: CareerMarketNegotiationView,
  right: CareerMarketNegotiationView,
): number {
  return Number(left.lifecycle === "completed") - Number(right.lifecycle === "completed")
    || (left.deadlineOnIso ?? left.resolvedOnIso ?? left.openedOnIso)
      .localeCompare(right.deadlineOnIso ?? right.resolvedOnIso ?? right.openedOnIso)
    || left.negotiationId.localeCompare(right.negotiationId);
}

function copyWindow(window: CareerMarketWindowView): CareerMarketWindowView {
  return window.status === "open"
    ? { ...window }
    : {
        status: "closed",
        currentDateIso: window.currentDateIso,
        ...(window.nextOpensOnIso === undefined ? {} : { nextOpensOnIso: window.nextOpensOnIso }),
      };
}

function copyFinance(finance: CareerMarketFinanceView): CareerMarketFinanceView {
  return {
    ...finance,
    pendingExposure: { ...finance.pendingExposure },
  };
}

function copyPreview(preview: CareerMarketOfferPreviewView): CareerMarketOfferPreviewView {
  if (preview.status === "blocked") return { ...preview };
  return {
    ...preview,
    currentFinance: { ...preview.currentFinance },
    projectedFinance: { ...preview.projectedFinance },
    existingPendingExposure: { ...preview.existingPendingExposure },
    ...(preview.contractTerms === undefined
      ? {}
      : {
          contractTerms: {
            ...preview.contractTerms,
            bonuses: { ...preview.contractTerms.bonuses },
          },
        }),
  };
}

function assertFinance(finance: CareerMarketFinanceView): void {
  const values = [
    finance.cashBalance,
    finance.transferBudget,
    finance.annualWageBudget,
    finance.committedAnnualWage,
    finance.annualWageHeadroom,
    finance.pendingExposure.transferFees,
    finance.pendingExposure.annualWages,
    finance.pendingExposure.signingBonuses,
    finance.pendingExposure.immediateCash,
  ];
  if (values.some((value) => !Number.isSafeInteger(value) || value < 0)) {
    throw new Error("Market finance values must be non-negative integer minor units.");
  }
  if (
    !Number.isSafeInteger(finance.pendingExposure.openNegotiationCount)
    || finance.pendingExposure.openNegotiationCount < 0
  ) {
    throw new Error("Market pending negotiation count must be a non-negative integer.");
  }
}

function assertUniqueNegotiations(negotiations: readonly CareerMarketNegotiationInput[]): void {
  const seen = new Set<string>();
  for (const negotiation of negotiations) {
    if (seen.has(negotiation.negotiationId)) {
      throw new Error(`Duplicate market negotiation: ${negotiation.negotiationId}`);
    }
    seen.add(negotiation.negotiationId);
  }
}
