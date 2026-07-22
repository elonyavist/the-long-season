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
import { useEffect, useMemo, useState } from "react";

import type { WebPreferences } from "../../app/preferences";
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

type AgreedSquadStatus = CareerContractTermsInput["squadStatus"];

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

type RenewalFormChange = <Field extends keyof ContractRenewalFormValues>(
  field: Field,
  value: ContractRenewalFormValues[Field],
) => void;

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
      ? createContractRenewalFormValues({ age: playerAge, activeContract: contract.activeContract })
      : contractTermsToFormValues(currentEditableTerms),
    [contract.activeContract, currentEditableTerms, playerAge],
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
    () => validateContractRenewalForm(values, bonusFields),
    [bonusFields, values],
  );
  const financePreview = validation.status === "valid"
    ? previewOffer(rawPlayerId, validation.terms)
    : undefined;

  useEffect(() => {
    setValues(formSeed);
    setFieldErrors({});
    setFeedback(undefined);
    setEditing(contract.negotiation?.status === "draft");
  }, [contract.negotiation, formSeed, rawPlayerId]);

  const submitEditableOffer = async (): Promise<void> => {
    const validated = validateContractRenewalForm(values, bonusFields);
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
        <div>
          <p className="tls-career-screen-eyebrow">{text("career.contract.eyebrow")}</p>
          <h3 id="career-contract-title">{text("career.contract.title")}</h3>
        </div>
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
          <RenewalForm
            values={values}
            errors={fieldErrors}
            supportedBonusFields={bonusFields}
            currency={contract.finance.currency}
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
            submitLabel={editableSubmitLabel(contract, values, bonusFields, text)}
          />
        ) : (
          <ContractActions
            contract={contract}
            disabled={pending}
            text={text}
            onEdit={(terms) => {
              setValues(terms === undefined
                ? createContractRenewalFormValues({ age: playerAge, activeContract: contract.activeContract })
                : contractTermsToFormValues(terms));
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

function RenewalForm({
  values,
  errors,
  supportedBonusFields,
  currency,
  pending,
  text,
  submitLabel,
  onChange,
  onCancel,
  onSubmit,
}: Readonly<{
  values: ContractRenewalFormValues;
  errors: Readonly<Partial<Record<ContractRenewalFormField, string>>>;
  supportedBonusFields: readonly string[];
  currency: string;
  pending: boolean;
  text: Translator;
  submitLabel: string;
  onChange: RenewalFormChange;
  onCancel: () => void;
  onSubmit: () => void;
}>): React.JSX.Element {
  return (
    <form className="tls-contract-form" onSubmit={(event) => { event.preventDefault(); onSubmit(); }} noValidate>
      <div className="tls-contract-form-grid">
        <ContractInput
          field="durationYears"
          label={text("career.contract.field.durationYears")}
          value={values.durationYears}
          error={errors.durationYears}
          inputMode="numeric"
          suffix={text("career.contract.years")}
          onChange={onChange}
        />
        <ContractInput
          field="annualWage"
          label={text("career.contract.field.annualWage")}
          value={values.annualWage}
          error={errors.annualWage}
          inputMode="decimal"
          suffix={currency}
          onChange={onChange}
        />
        <label className="tls-contract-field">
          <span>{text("career.contract.field.squadStatus")}</span>
          <select
            value={values.squadStatus}
            onChange={(event) => onChange("squadStatus", event.currentTarget.value as AgreedSquadStatus)}
          >
            {SQUAD_STATUSES.map((status) => (
              <option key={status} value={status}>{text(`career.contract.squadStatus.${status}` as MessageKey)}</option>
            ))}
          </select>
        </label>
        <ContractInput field="signingBonus" label={text("career.contract.field.signingBonus")} value={values.signingBonus} error={errors.signingBonus} inputMode="decimal" suffix={currency} onChange={onChange} />
        <ContractInput field="appearanceBonus" label={text("career.contract.field.appearanceBonus")} value={values.appearanceBonus} error={errors.appearanceBonus} inputMode="decimal" suffix={currency} onChange={onChange} />
        {supportedBonusFields.includes("goal_bonus") ? (
          <ContractInput field="goalBonus" label={text("career.contract.field.goalBonus")} value={values.goalBonus} error={errors.goalBonus} inputMode="decimal" suffix={currency} onChange={onChange} />
        ) : null}
        {supportedBonusFields.includes("clean_sheet_bonus") ? (
          <ContractInput field="cleanSheetBonus" label={text("career.contract.field.cleanSheetBonus")} value={values.cleanSheetBonus} error={errors.cleanSheetBonus} inputMode="decimal" suffix={currency} onChange={onChange} />
        ) : null}
      </div>
      <div className="tls-contract-form-actions">
        <button className="tls-menu-button" disabled={pending} type="button" onClick={onCancel}>
          <X aria-hidden="true" size={17} />
          {text("career.contract.action.cancel")}
        </button>
        <button className="tls-menu-button tls-menu-button-primary" disabled={pending} type="submit">
          <Send aria-hidden="true" size={17} />
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

function ContractInput({
  field,
  label,
  value,
  error,
  inputMode,
  suffix,
  onChange,
}: Readonly<{
  field: ContractRenewalFormField;
  label: string;
  value: string;
  error: string | undefined;
  inputMode: "numeric" | "decimal";
  suffix: string;
  onChange: RenewalFormChange;
}>): React.JSX.Element {
  const errorId = `contract-${field}-error`;
  return (
    <label className="tls-contract-field">
      <span>{label}</span>
      <span className="tls-contract-input">
        <input
          aria-describedby={error === undefined ? undefined : errorId}
          aria-invalid={error === undefined ? undefined : "true"}
          inputMode={inputMode}
          value={value}
          onChange={(event) => onChange(field, event.currentTarget.value)}
        />
        <span>{suffix}</span>
      </span>
      {error === undefined ? null : <small id={errorId}>{error}</small>}
    </label>
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
        <ContractFact label={text("career.contract.cash")} value={formatMoney(finance.cashBalance, finance.currency, language)} />
        <ContractFact label={text("career.contract.annualWageBudget")} value={formatMoney(finance.annualWageBudget, finance.currency, language)} />
        <ContractFact
          label={text("career.contract.committedAnnualWage")}
          value={projected === undefined
            ? formatMoney(finance.committedAnnualWage, finance.currency, language)
            : `${formatMoney(projected.currentCommittedAnnualWage, finance.currency, language)} → ${formatMoney(projected.projectedCommittedAnnualWage, finance.currency, language)}`}
        />
        <ContractFact
          label={text("career.contract.remainingAnnualWage")}
          value={projected === undefined
            ? formatMoney(finance.remainingAnnualWageBudget, finance.currency, language)
            : `${formatMoney(projected.currentRemainingAnnualWageBudget, finance.currency, language)} → ${formatMoney(projected.projectedRemainingAnnualWageBudget, finance.currency, language)}`}
        />
        {projected === undefined ? null : (
          <ContractFact
            label={text("career.contract.cashAfterSigning")}
            value={`${formatMoney(projected.currentCashBalance, finance.currency, language)} → ${formatMoney(projected.projectedCashBalance, finance.currency, language)}`}
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
      <ContractFact label={text("career.contract.field.annualWage")} value={formatMoney(terms.annualWage, currency, language)} />
      <ContractFact label={text("career.contract.field.squadStatus")} value={text(`career.contract.squadStatus.${terms.squadStatus}` as MessageKey)} />
      <ContractFact label={text("career.contract.field.signingBonus")} value={formatMoney(terms.bonuses.signingBonus, currency, language)} />
      <ContractFact label={text("career.contract.field.appearanceBonus")} value={formatMoney(terms.bonuses.appearanceBonus, currency, language)} />
      {terms.bonuses.goalBonus === undefined ? null : <ContractFact label={text("career.contract.field.goalBonus")} value={formatMoney(terms.bonuses.goalBonus, currency, language)} />}
      {terms.bonuses.cleanSheetBonus === undefined ? null : <ContractFact label={text("career.contract.field.cleanSheetBonus")} value={formatMoney(terms.bonuses.cleanSheetBonus, currency, language)} />}
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
  text: Translator,
): string {
  const validation = validateContractRenewalForm(values, bonusFields);
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

function formatMoney(amount: number, currency: string, language: WebPreferences["language"]): string {
  return new Intl.NumberFormat(language, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount / 100);
}

function formatDate(value: string, language: WebPreferences["language"]): string {
  return new Intl.DateTimeFormat(language, { day: "2-digit", month: "short", year: "numeric" })
    .format(new Date(`${value}T12:00:00Z`));
}

const SQUAD_STATUSES: readonly AgreedSquadStatus[] = [
  "key_player",
  "regular_starter",
  "squad_player",
  "fringe_player",
  "prospect",
];
