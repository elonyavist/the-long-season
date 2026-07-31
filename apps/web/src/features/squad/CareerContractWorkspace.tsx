import type { MessageKey, Translator } from "@game/i18n";
import type {
  CareerContractBonusField,
  CareerContractTermsInput,
  CareerContractView,
} from "@game/ui";
import {
  Check,
  Clock3,
  FilePenLine,
  History,
  Send,
  WalletCards,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import type { WebPreferences } from "../../app/preferences";
import { formatMoneyFromMinorUnits } from "../../shared/format-money";
import { ContractTermsForm } from "../shared/ContractTermsForm";
import type {
  WebSelectedClubContractCommand,
  WebSelectedClubContractCommandResult,
} from "../../runtime/web-career-runtime";
import type { CareerContractFinancePreview } from "./career-squad-adapter";
import {
  contractTermsEqual,
  contractTermsToFormValues,
  createContractRenewalFormValues,
  validateContractRenewalForm,
  type ContractRenewalFormField,
  type ContractRenewalFormValues,
} from "./contract-renewal-form";

/** Props for the contract facts and explicit renewal workflow in a player profile. */
export interface CareerContractWorkspaceProps {
  readonly playerId: string;
  readonly playerAge: number;
  readonly contract: CareerContractView;
  readonly language: WebPreferences["language"];
  readonly pending: boolean;
  readonly text: Translator;
  readonly previewOffer: (playerId: string, terms: CareerContractTermsInput) => CareerContractFinancePreview;
  readonly onCommand: (
    command: WebSelectedClubContractCommand,
  ) => Promise<WebSelectedClubContractCommandResult | undefined>;
}

type WorkspaceFeedback = Readonly<{
  kind: "success" | "error";
  key: MessageKey;
}>;

type RejectedFinancePreview = Extract<CareerContractFinancePreview, { status: "rejected" }>;

/** Renders active annual terms, finances, history, and one durable renewal workflow. */
export function CareerContractWorkspace({
  playerId: rawPlayerId,
  playerAge,
  contract,
  language,
  pending,
  text,
  previewOffer,
  onCommand,
}: CareerContractWorkspaceProps): React.JSX.Element {
  const currentEditableTerms = editableTerms(contract);
  const formSeed = useMemo(
    () => currentEditableTerms === undefined
      ? createContractRenewalFormValues({
          age: playerAge,
          activeContract: contract.activeContract,
          language,
        })
      : contractTermsToFormValues(currentEditableTerms, language),
    [contract.activeContract, currentEditableTerms, language, playerAge],
  );
  const [editing, setEditing] = useState(contract.negotiation?.status === "draft");
  const [values, setValues] = useState<ContractRenewalFormValues>(formSeed);
  const [fieldErrors, setFieldErrors] = useState<Readonly<Partial<Record<ContractRenewalFormField, string>>>>({});
  const [feedback, setFeedback] = useState<WorkspaceFeedback>();
  const bonusFields: readonly CareerContractBonusField[] = contract.draftFields.flatMap((field) => (
    field.field === "signing_bonus"
    || field.field === "appearance_bonus"
    || field.field === "goal_bonus"
    || field.field === "clean_sheet_bonus"
      ? [field.field]
      : []
  ));
  const validation = useMemo(
    () => validateContractRenewalForm(values, bonusFields, language),
    [bonusFields, language, values],
  );
  const financePreview = validation.status === "valid"
    ? previewOffer(rawPlayerId, validation.terms)
    : undefined;

  // P79-CF-04: reseed only on a real negotiation transition or player change,
  // never on an unrelated career-state identity refresh (autosave publish,
  // another command elsewhere) that rebuilds `contract` with fresh object
  // identity but the same negotiation fact.
  const negotiationIdentityToken = `${rawPlayerId}:${contract.negotiation?.negotiationId ?? "none"}:${contract.negotiation?.status ?? "none"}`;
  const lastSyncedTokenRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (lastSyncedTokenRef.current === negotiationIdentityToken) return;
    lastSyncedTokenRef.current = negotiationIdentityToken;
    setValues(formSeed);
    setFieldErrors({});
    setFeedback(undefined);
    setEditing(contract.negotiation?.status === "draft");
  }, [negotiationIdentityToken, formSeed]);

  const submitEditableOffer = async (): Promise<void> => {
    const validated = validateContractRenewalForm(values, bonusFields, language);
    if (validated.status === "invalid") {
      setFieldErrors(Object.fromEntries(
        Object.entries(validated.errors).map(([field, reason]) => [
          field,
          text(validationMessageKey(reason)),
        ]),
      ));
      setFeedback({ kind: "error", key: "career.contract.feedback.validation" });
      return;
    }
    setFieldErrors({});
    setFeedback(undefined);

    const negotiation = contract.negotiation;
    const command: WebSelectedClubContractCommand = negotiation?.status === "countered"
      ? {
          type: "revise_offer",
          negotiationId: negotiation.negotiationId,
          terms: validated.terms,
        }
      : negotiation?.status === "draft"
        ? contractTermsEqual(validated.terms, negotiation.draftTerms)
          ? {
              type: "submit_offer",
              negotiationId: negotiation.negotiationId,
            }
          : {
              type: "revise_offer",
              negotiationId: negotiation.negotiationId,
              terms: validated.terms,
            }
        : {
            type: "offer_renewal",
            playerId: rawPlayerId,
            terms: validated.terms,
          };
    const result = await onCommand(command);
    if (result === undefined) {
      setFeedback({ kind: "error", key: "career.contract.feedback.storageFailure" });
      return;
    }
    if (result.status === "rejected") {
      setFeedback({ kind: "error", key: commandRejectionMessageKey(result.reason) });
      return;
    }
    setFeedback({ kind: "success", key: commandSuccessMessageKey(command.type) });
    setEditing(false);
  };

  const runNegotiationCommand = async (
    type: "submit_offer" | "accept_counter" | "reject_counter" | "withdraw_offer",
    negotiationId: string,
  ): Promise<void> => {
    setFeedback(undefined);
    const result = await onCommand({ type, negotiationId });
    if (result === undefined) {
      setFeedback({ kind: "error", key: "career.contract.feedback.storageFailure" });
      return;
    }
    if (result.status === "rejected") {
      setFeedback({ kind: "error", key: commandRejectionMessageKey(result.reason) });
      return;
    }
    setFeedback({ kind: "success", key: commandSuccessMessageKey(type) });
  };

  return (
    <section className="tls-contract-workspace" aria-labelledby="career-contract-title">
      <div className="tls-player-profile-section-heading">
        <h3 id="career-contract-title">{text("career.contract.title")}</h3>
        {contract.activeContract.hasExpiryAlert ? (
          <span className="tls-contract-expiry-alert">
            <Clock3 aria-hidden="true" size={17} />
            {text("career.contract.expiring")}
          </span>
        ) : null}
      </div>

      <div className="tls-contract-columns">
        <section className="tls-contract-band" aria-labelledby="active-contract-title">
          <h4 id="active-contract-title">{text("career.contract.activeTerms")}</h4>
          <TermsGrid
            terms={{
              annualWage: contract.activeContract.annualWage,
              squadStatus: contract.activeContract.squadStatus,
              bonuses: contract.activeContract.bonuses,
            }}
            currency={contract.finance.currency}
            language={language}
            text={text}
          />
          <dl className="tls-contract-meta">
            <ContractFact label={text("career.contract.type")} value={text(`career.contract.type.${contract.activeContract.type}` as MessageKey)} />
            <ContractFact label={text("career.contract.startDate")} value={formatDate(contract.activeContract.startsOnIso, language)} />
            <ContractFact label={text("career.contract.endDate")} value={formatDate(contract.activeContract.endsOnIso, language)} />
            <ContractFact label={text("career.contract.remaining")} value={text("career.contract.remainingDays", { days: contract.activeContract.remainingDays })} />
          </dl>
        </section>

        <section className="tls-contract-band" aria-labelledby="contract-finance-title">
          <h4 id="contract-finance-title">
            <WalletCards aria-hidden="true" size={19} />
            {text("career.contract.finance")}
          </h4>
          <FinanceFacts
            finance={contract.finance}
            preview={financePreview}
            language={language}
            text={text}
          />
        </section>
      </div>

      <section className="tls-contract-negotiation" aria-labelledby="contract-negotiation-title">
        <div className="tls-contract-negotiation-heading">
          <div>
            <h4 id="contract-negotiation-title">{text("career.contract.negotiation")}</h4>
            <p>{negotiationSummary(contract, text, language)}</p>
          </div>
          {contract.negotiation === undefined ? null : (
            <span className="tls-contract-status" data-status={contract.negotiation.status}>
              {text(`career.contract.status.${contract.negotiation.status}` as MessageKey)}
            </span>
          )}
        </div>

        {contract.negotiation?.status === "countered" && !editing ? (
          <div className="tls-contract-counter-comparison">
            <div>
              <h5>{text("career.contract.yourOffer")}</h5>
              <TermsGrid terms={contract.negotiation.submittedTerms} currency={contract.finance.currency} language={language} text={text} compact />
            </div>
            <div>
              <h5>{text("career.contract.playerCounter")}</h5>
              <TermsGrid terms={contract.negotiation.counterTerms} currency={contract.finance.currency} language={language} text={text} compact />
            </div>
          </div>
        ) : null}

        {editing ? (
          <ContractTermsForm
            values={values}
            errors={fieldErrors}
            supportedBonusFields={bonusFields}
            currency={contract.finance.currency}
            language={language}
            pending={pending}
            text={text}
            onChange={(field, value) => {
              setValues((current) => ({ ...current, [field]: value }));
              setFieldErrors((current) => ({ ...current, [field]: undefined }));
              setFeedback(undefined);
            }}
            onCancel={() => {
              setValues(formSeed);
              setFieldErrors({});
              setFeedback(undefined);
              setEditing(false);
            }}
            onSubmit={() => void submitEditableOffer()}
            submitLabel={editableSubmitLabel(contract, values, bonusFields, language, text)}
          />
        ) : (
          <ContractActions
            contract={contract}
            disabled={pending}
            text={text}
            onEdit={(terms) => {
              setValues(terms === undefined
                ? createContractRenewalFormValues({
                    age: playerAge,
                    activeContract: contract.activeContract,
                    language,
                  })
                : contractTermsToFormValues(terms, language));
              setEditing(true);
              setFeedback(undefined);
            }}
            onCommand={(type, negotiationId) => void runNegotiationCommand(type, negotiationId)}
          />
        )}

        <p
          aria-live="polite"
          className="tls-contract-feedback"
          data-kind={feedback?.kind}
          role={feedback?.kind === "error" ? "alert" : undefined}
        >
          {pending ? text("career.command.updatingContract") : feedback === undefined ? "" : text(feedback.key)}
        </p>
      </section>

      <details className="tls-contract-history">
        <summary>
          <History aria-hidden="true" size={18} />
          {text("career.contract.history")}
          <span>{contract.history.length}</span>
        </summary>
        {contract.history.length === 0 ? <p>{text("career.contract.historyEmpty")}</p> : (
          <ol>
            {contract.history.map((entry) => (
              <li key={entry.historyId}>
                <time dateTime={entry.occurredOnIso}>{formatDate(entry.occurredOnIso, language)}</time>
                <span>{text(`career.contract.historyEvent.${entry.event}` as MessageKey)}</span>
              </li>
            ))}
          </ol>
        )}
      </details>
    </section>
  );
}


function ContractActions({
  contract,
  disabled,
  text,
  onEdit,
  onCommand,
}: Readonly<{
  contract: CareerContractView;
  disabled: boolean;
  text: Translator;
  onEdit: (terms?: CareerContractTermsInput) => void;
  onCommand: (
    type: "submit_offer" | "accept_counter" | "reject_counter" | "withdraw_offer",
    negotiationId: string,
  ) => void;
}>): React.JSX.Element {
  const negotiation = contract.negotiation;
  if (negotiation === undefined || negotiation.status === "rejected" || negotiation.status === "withdrawn" || negotiation.status === "expired") {
    return (
      <button className="tls-menu-button tls-menu-button-primary tls-contract-primary-action" disabled={disabled} type="button" onClick={() => onEdit()}>
        <FilePenLine aria-hidden="true" size={18} />
        {text("career.contract.action.startRenewal")}
      </button>
    );
  }
  if (negotiation.status === "draft") {
    return (
      <div className="tls-contract-actions">
        <button className="tls-menu-button" disabled={disabled} type="button" onClick={() => onEdit(negotiation.draftTerms)}>
          <FilePenLine aria-hidden="true" size={17} />
          {text("career.contract.action.editDraft")}
        </button>
        <button className="tls-menu-button tls-menu-button-primary" disabled={disabled} type="button" onClick={() => onCommand("submit_offer", negotiation.negotiationId)}>
          <Send aria-hidden="true" size={17} />
          {text("career.contract.action.submitOffer")}
        </button>
        <button className="tls-menu-button tls-contract-action-danger" disabled={disabled} type="button" onClick={() => onCommand("withdraw_offer", negotiation.negotiationId)}>
          {text("career.contract.action.withdraw")}
        </button>
      </div>
    );
  }
  if (negotiation.status === "awaiting_response") {
    return (
      <button className="tls-menu-button tls-contract-action-danger" disabled={disabled} type="button" onClick={() => onCommand("withdraw_offer", negotiation.negotiationId)}>
        {text("career.contract.action.withdraw")}
      </button>
    );
  }
  if (negotiation.status === "countered") {
    return (
      <div className="tls-contract-actions">
        <button className="tls-menu-button tls-menu-button-primary" disabled={disabled} type="button" onClick={() => onCommand("accept_counter", negotiation.negotiationId)}>
          <Check aria-hidden="true" size={17} />
          {text("career.contract.action.acceptCounter")}
        </button>
        <button className="tls-menu-button" disabled={disabled} type="button" onClick={() => onEdit(negotiation.counterTerms)}>
          <FilePenLine aria-hidden="true" size={17} />
          {text("career.contract.action.reviseOffer")}
        </button>
        <button className="tls-menu-button tls-contract-action-danger" disabled={disabled} type="button" onClick={() => onCommand("reject_counter", negotiation.negotiationId)}>
          {text("career.contract.action.rejectCounter")}
        </button>
      </div>
    );
  }
  return <p className="tls-contract-terminal-state">{text(`career.contract.status.${negotiation.status}` as MessageKey)}</p>;
}

function FinanceFacts({
  finance,
  preview,
  language,
  text,
}: Readonly<{
  finance: CareerContractView["finance"];
  preview: CareerContractFinancePreview | undefined;
  language: WebPreferences["language"];
  text: Translator;
}>): React.JSX.Element {
  const projected = preview?.status === "affordable" ? preview : undefined;
  return (
    <>
      <dl className="tls-contract-finance-grid">
        <ContractFact label={text("career.contract.cash")} value={formatMoneyFromMinorUnits(finance.cashBalance, finance.currency, language, "whole")} />
        <ContractFact label={text("career.contract.annualWageBudget")} value={formatMoneyFromMinorUnits(finance.annualWageBudget, finance.currency, language, "whole")} />
        <ContractFact
          label={text("career.contract.committedAnnualWage")}
          value={projected === undefined
            ? formatMoneyFromMinorUnits(finance.committedAnnualWage, finance.currency, language, "whole")
            : `${formatMoneyFromMinorUnits(projected.currentCommittedAnnualWage, finance.currency, language, "whole")} → ${formatMoneyFromMinorUnits(projected.projectedCommittedAnnualWage, finance.currency, language, "whole")}`}
        />
        <ContractFact
          label={text("career.contract.remainingAnnualWage")}
          value={projected === undefined
            ? formatMoneyFromMinorUnits(finance.remainingAnnualWageBudget, finance.currency, language, "whole")
            : `${formatMoneyFromMinorUnits(projected.currentRemainingAnnualWageBudget, finance.currency, language, "whole")} → ${formatMoneyFromMinorUnits(projected.projectedRemainingAnnualWageBudget, finance.currency, language, "whole")}`}
        />
        {projected === undefined ? null : (
          <ContractFact
            label={text("career.contract.cashAfterSigning")}
            value={`${formatMoneyFromMinorUnits(projected.currentCashBalance, finance.currency, language, "whole")} → ${formatMoneyFromMinorUnits(projected.projectedCashBalance, finance.currency, language, "whole")}`}
          />
        )}
      </dl>
      {preview?.status === "rejected" ? (
        <p className="tls-contract-finance-warning" role="status">
          {text(financeRejectionMessageKey(preview.reason))}
        </p>
      ) : projected === undefined ? null : (
        <p className="tls-contract-finance-ok"><Check aria-hidden="true" size={16} />{text("career.contract.financeAffordable")}</p>
      )}
    </>
  );
}

function TermsGrid({
  terms,
  currency,
  language,
  text,
  compact = false,
}: Readonly<{
  terms: ContractTermsDisplay;
  currency: string;
  language: WebPreferences["language"];
  text: Translator;
  compact?: boolean;
}>): React.JSX.Element {
  return (
    <dl className="tls-contract-terms" data-compact={compact ? "true" : "false"}>
      {terms.durationYears === undefined ? null : (
        <ContractFact label={text("career.contract.field.durationYears")} value={text("career.contract.durationValue", { years: terms.durationYears })} />
      )}
      <ContractFact label={text("career.contract.field.annualWage")} value={formatMoneyFromMinorUnits(terms.annualWage, currency, language, "whole")} />
      <ContractFact label={text("career.contract.field.squadStatus")} value={text(`career.contract.squadStatus.${terms.squadStatus}` as MessageKey)} />
      <ContractFact label={text("career.contract.field.signingBonus")} value={formatMoneyFromMinorUnits(terms.bonuses.signingBonus, currency, language, "whole")} />
      <ContractFact label={text("career.contract.field.appearanceBonus")} value={formatMoneyFromMinorUnits(terms.bonuses.appearanceBonus, currency, language, "whole")} />
      {terms.bonuses.goalBonus === undefined ? null : <ContractFact label={text("career.contract.field.goalBonus")} value={formatMoneyFromMinorUnits(terms.bonuses.goalBonus, currency, language, "whole")} />}
      {terms.bonuses.cleanSheetBonus === undefined ? null : <ContractFact label={text("career.contract.field.cleanSheetBonus")} value={formatMoneyFromMinorUnits(terms.bonuses.cleanSheetBonus, currency, language, "whole")} />}
    </dl>
  );
}

type ContractTermsDisplay = Pick<
  CareerContractTermsInput,
  "annualWage" | "squadStatus" | "bonuses"
> & Partial<Pick<CareerContractTermsInput, "durationYears">>;

function ContractFact({ label, value }: Readonly<{ label: string; value: string }>): React.JSX.Element {
  return <div><dt>{label}</dt><dd>{value}</dd></div>;
}

function editableTerms(contract: CareerContractView): CareerContractTermsInput | undefined {
  if (contract.negotiation?.status === "draft") return contract.negotiation.draftTerms;
  if (contract.negotiation?.status === "countered") return contract.negotiation.counterTerms;
  return undefined;
}

function negotiationSummary(contract: CareerContractView, text: Translator, language: WebPreferences["language"]): string {
  const negotiation = contract.negotiation;
  if (negotiation === undefined) return text("career.contract.negotiationNone");
  if (negotiation.status === "awaiting_response") {
    return text("career.contract.responseDue", { date: formatDate(negotiation.responseDueOnIso, language) });
  }
  if (negotiation.status === "countered") {
    return text("career.contract.counterExpires", { date: formatDate(negotiation.counterExpiresOnIso, language) });
  }
  return text(`career.contract.statusSummary.${negotiation.status}` as MessageKey);
}

function editableSubmitLabel(
  contract: CareerContractView,
  values: ContractRenewalFormValues,
  bonusFields: readonly CareerContractBonusField[],
  language: WebPreferences["language"],
  text: Translator,
): string {
  const validation = validateContractRenewalForm(values, bonusFields, language);
  if (contract.negotiation?.status !== "draft" || validation.status !== "valid") {
    return contract.negotiation?.status === "countered"
      ? text("career.contract.action.saveRevision")
      : text("career.contract.action.submitOffer");
  }
  return contractTermsEqual(validation.terms, contract.negotiation.draftTerms)
    ? text("career.contract.action.submitOffer")
    : text("career.contract.action.saveDraft");
}

function validationMessageKey(reason: string | undefined): MessageKey {
  if (reason === "required") return "career.contract.validation.required";
  if (reason === "out_of_range") return "career.contract.validation.outOfRange";
  return "career.contract.validation.invalidMoney";
}

function commandSuccessMessageKey(type: WebSelectedClubContractCommand["type"]): MessageKey {
  if (type === "accept_counter") return "career.contract.feedback.counterAccepted";
  if (type === "reject_counter") return "career.contract.feedback.counterRejected";
  if (type === "withdraw_offer") return "career.contract.feedback.withdrawn";
  if (type === "revise_offer") return "career.contract.feedback.revised";
  if (type === "submit_offer" || type === "offer_renewal") return "career.contract.feedback.submitted";
  return "career.contract.feedback.applied";
}

function commandRejectionMessageKey(reason: string): MessageKey {
  if (reason === "wage_budget_exceeded") return "career.contract.error.wageBudget";
  if (reason === "insufficient_cash") return "career.contract.error.cash";
  if (reason === "duplicate_open_negotiation") return "career.contract.error.duplicate";
  if (reason === "current_contract_expired") return "career.contract.error.expired";
  return "career.contract.error.commandRejected";
}

function financeRejectionMessageKey(reason: RejectedFinancePreview["reason"]): MessageKey {
  if (reason === "wage_budget_exceeded") return "career.contract.error.wageBudget";
  if (reason === "insufficient_cash") return "career.contract.error.cash";
  return "career.contract.error.financeUnavailable";
}

function formatDate(value: string, language: WebPreferences["language"]): string {
  return new Intl.DateTimeFormat(language, { day: "2-digit", month: "short", year: "numeric" })
    .format(new Date(`${value}T12:00:00Z`));
}
