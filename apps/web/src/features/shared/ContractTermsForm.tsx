import type { MessageKey, Translator } from "@game/i18n";
import type { CareerContractTermsInput } from "@game/ui";
import { Send, X } from "lucide-react";

import type { WebPreferences } from "../../app/preferences";
import {
  normalizeContractMoneyInput,
  type ContractRenewalFormField,
  type ContractRenewalFormValues,
} from "../squad/contract-renewal-form";

type AgreedSquadStatus = CareerContractTermsInput["squadStatus"];

/** Setter shared by every editable annual-contract field. */
export type ContractTermsFormChange = <Field extends keyof ContractRenewalFormValues>(
  field: Field,
  value: ContractRenewalFormValues[Field],
) => void;

const SQUAD_STATUSES: readonly AgreedSquadStatus[] = [
  "key_player",
  "regular_starter",
  "squad_player",
  "fringe_player",
  "prospect",
];

/**
 * The one supported annual-contract form: duration, wage, status, and bonuses.
 *
 * Shared by the Squad renewal workspace and the Market player/preliminary
 * composers so no second contract form exists anywhere in the browser. Money
 * fields stay plain text here; exact minor-unit parsing lives in
 * `contract-renewal-form.ts` and read-only display uses the shared formatter.
 */
export function ContractTermsForm({
  values,
  errors,
  supportedBonusFields,
  currency,
  language,
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
  language: WebPreferences["language"];
  pending: boolean;
  text: Translator;
  submitLabel: string;
  onChange: ContractTermsFormChange;
  onCancel: () => void;
  onSubmit: () => void;
}>): React.JSX.Element {
  // Every money field normalizes to the active locale on blur; an unreadable
  // draft is left exactly as typed next to its validation message.
  const normalizeMoney = (value: string): string => normalizeContractMoneyInput(value, language);
  return (
    <form className="tls-contract-form" onSubmit={(event) => { event.preventDefault(); onSubmit(); }} noValidate>
      <div className="tls-contract-form-grid">
        <ContractTermsInput
          field="durationYears"
          label={text("career.contract.field.durationYears")}
          value={values.durationYears}
          error={errors.durationYears}
          inputMode="numeric"
          suffix={text("career.contract.years")}
          onChange={onChange}
        />
        <ContractTermsInput
          field="annualWage"
          label={text("career.contract.field.annualWage")}
          value={values.annualWage}
          error={errors.annualWage}
          inputMode="decimal"
          suffix={currency}
          normalize={normalizeMoney}
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
        <ContractTermsInput field="signingBonus" label={text("career.contract.field.signingBonus")} value={values.signingBonus} error={errors.signingBonus} inputMode="decimal" suffix={currency} normalize={normalizeMoney} onChange={onChange} />
        <ContractTermsInput field="appearanceBonus" label={text("career.contract.field.appearanceBonus")} value={values.appearanceBonus} error={errors.appearanceBonus} inputMode="decimal" suffix={currency} normalize={normalizeMoney} onChange={onChange} />
        {supportedBonusFields.includes("goal_bonus") ? (
          <ContractTermsInput field="goalBonus" label={text("career.contract.field.goalBonus")} value={values.goalBonus} error={errors.goalBonus} inputMode="decimal" suffix={currency} normalize={normalizeMoney} onChange={onChange} />
        ) : null}
        {supportedBonusFields.includes("clean_sheet_bonus") ? (
          <ContractTermsInput field="cleanSheetBonus" label={text("career.contract.field.cleanSheetBonus")} value={values.cleanSheetBonus} error={errors.cleanSheetBonus} inputMode="decimal" suffix={currency} normalize={normalizeMoney} onChange={onChange} />
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

function ContractTermsInput({
  field,
  label,
  value,
  error,
  inputMode,
  suffix,
  normalize,
  onChange,
}: Readonly<{
  field: ContractRenewalFormField;
  label: string;
  value: string;
  error: string | undefined;
  inputMode: "numeric" | "decimal";
  suffix: string;
  /** Optional blur-time rewrite; omitted for non-money fields. */
  normalize?: (value: string) => string;
  onChange: ContractTermsFormChange;
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
          onBlur={(event) => {
            if (normalize === undefined) return;
            const normalized = normalize(event.currentTarget.value);
            if (normalized !== value) onChange(field, normalized);
          }}
          onChange={(event) => onChange(field, event.currentTarget.value)}
        />
        <span>{suffix}</span>
      </span>
      {/*
        * Always rendered so the row keeps its height. Mounting this only on
        * error made the whole form jump the moment a value became invalid.
        */}
      <small id={errorId}>{error}</small>
    </label>
  );
}
