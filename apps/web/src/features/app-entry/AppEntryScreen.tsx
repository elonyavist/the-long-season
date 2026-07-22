import type { MessageKey, Translator } from "@game/i18n";
import type { SaveMetadata } from "@game/storage";
import { useEffect, useRef } from "react";

import {
  currencyLabelKey,
  languageLabelKey,
  parseCurrencyCode,
  updateWebPreferences,
  type WebPreferences,
} from "../../app/preferences";
import { getAppEntryAction, type WebAppEntryView } from "./app-entry-view-model";
import {
  CommandActivityIndicator,
  CommandActivityLiveRegion,
} from "../shared/CommandActivityIndicator";
import { useCareerUiStore } from "../../stores/career-ui-store";

/** Props for the localized app-entry screen. */
export type AppEntryScreenProps = Readonly<{
  view: WebAppEntryView;
  preferences: WebPreferences;
  text: Translator;
  onPreferencesChange: (preferences: WebPreferences) => void;
  onStartNewCareer: () => void;
  onContinueCareer: () => void;
  onSelectedSaveChange: (saveId: SaveMetadata["saveId"]) => void;
  onRetryStorage: () => void;
  betaResetPerformed: boolean;
}>;

/** Renders the first app screen: main actions plus language/currency settings. */
export function AppEntryScreen({
  view,
  preferences,
  text,
  onPreferencesChange,
  onStartNewCareer,
  onContinueCareer,
  onSelectedSaveChange,
  onRetryStorage,
  betaResetPerformed,
}: AppEntryScreenProps): React.JSX.Element {
  const startAction = getAppEntryAction(view, "start_new_career");
  const continueAction = getAppEntryAction(view, "continue_career");
  const settingsAction = getAppEntryAction(view, "open_settings");
  const continueDisabled = continueAction.status !== "available";
  const startDisabled = startAction.status !== "available";
  const recoveryRef = useRef<HTMLDivElement>(null);
  const commandActivity = useCareerUiStore((state) => state.commandActivity);
  const commandPending = commandActivity?.status === "pending";

  useEffect(() => {
    if (view.lifecycleStatus === "storage_error") recoveryRef.current?.focus();
  }, [view.lifecycleStatus, view.storageFailure]);

  return (
    <main
      className="tls-app-entry"
      data-testid="app-entry-screen"
      aria-busy={commandPending}
    >
      <CommandActivityLiveRegion activity={commandActivity} text={text} />
      <section className="tls-shell-panel tls-app-entry-panel" aria-labelledby="app-entry-title">
        <div className="tls-app-entry-hero">
          <div className="tls-app-entry-identity">
            <p className="tls-app-entry-kicker">{text("web.app.kicker" as MessageKey)}</p>
            <h1 className="tls-shell-title" id="app-entry-title">{text("web.app.title")}</h1>
            <p className="tls-app-entry-lede">{text("web.app.tagline" as MessageKey)}</p>
          </div>
          <div className="tls-app-entry-football-mark" aria-hidden="true">
            <span className="tls-app-entry-formation-line" data-line="attack"><i /><i /></span>
            <span className="tls-app-entry-formation-line" data-line="midfield"><i /><i /><i /><i /></span>
            <span className="tls-app-entry-formation-line" data-line="defence"><i /><i /><i /><i /></span>
            <span className="tls-app-entry-formation-line" data-line="goalkeeper"><i /></span>
          </div>
        </div>

        <div className="tls-app-entry-content">
          <nav className="tls-app-entry-actions" aria-label={text(settingsAction.labelKey as MessageKey)}>
            <button className="tls-menu-button tls-menu-button-primary" disabled={startDisabled || commandPending} type="button" onClick={onStartNewCareer}>
              <CommandActivityIndicator
                activity={commandActivity}
                commandIds={["create_career"]}
                idleLabel={text(startAction.labelKey as MessageKey)}
                text={text}
              />
            </button>
            {view.lifecycleStatus === "storage_loading" ? (
              <p className="tls-app-entry-state" data-state="loading">
                <CommandActivityIndicator
                  activity={commandActivity}
                  commandIds={["discover_careers"]}
                  idleLabel={text("web.app.storage.loading" as MessageKey)}
                  text={text}
                />
              </p>
            ) : null}
            {view.lifecycleStatus === "storage_error" ? (
              <div
                className="tls-storage-recovery"
                data-state="recovery"
                ref={recoveryRef}
                role="alert"
                tabIndex={-1}
              >
                <strong>{text("web.app.storage.error" as MessageKey)}</strong>
                <p className="m-0">
                  {text(storageFailureLabelKey(view.storageFailure?.code ?? "unknown"))}
                </p>
                <button className="tls-menu-button" disabled={commandPending} type="button" onClick={onRetryStorage}>
                  {text("web.app.storage.retry" as MessageKey)}
                </button>
              </div>
            ) : null}
            {view.lifecycleStatus === "ready" && view.saves.length === 0 ? (
              <p className="tls-app-entry-state" data-state="empty">
                {text("web.app.storage.empty" as MessageKey)}
              </p>
            ) : null}
            {view.lifecycleStatus === "ready" && betaResetPerformed ? (
              <div className="tls-storage-reset-notice" role="status">
                <strong>{text("web.app.storage.betaReset.title" as MessageKey)}</strong>
                <p className="m-0">{text("web.app.storage.betaReset.summary" as MessageKey)}</p>
              </div>
            ) : null}
            {view.saves.length === 0 ? null : (
              <div className="tls-preference-field">
                <label htmlFor="career-save">{text("web.app.save.label" as MessageKey)}</label>
                <select
                  id="career-save"
                  disabled={commandPending}
                  value={view.selectedSaveId ?? ""}
                  onChange={(event) => onSelectedSaveChange(event.currentTarget.value as SaveMetadata["saveId"])}
                >
                  {view.saves.map((save) => (
                    <option key={save.saveId} value={save.saveId}>{save.name}</option>
                  ))}
                </select>
              </div>
            )}
            <button
              className="tls-menu-button"
              disabled={continueDisabled || commandPending}
              type="button"
              onClick={onContinueCareer}
            >
              <CommandActivityIndicator
                activity={commandActivity}
                commandIds={["load_career"]}
                idleLabel={text(continueAction.labelKey as MessageKey)}
                text={text}
              />
            </button>
          </nav>

          <form className="tls-preferences tls-app-entry-settings" aria-label={text(settingsAction.labelKey as MessageKey)}>
            <div className="tls-preference-field">
              <label htmlFor="web-language">{text(getAppEntryAction(view, "change_language").labelKey as MessageKey)}</label>
              <select
                id="web-language"
                value={preferences.language}
                onChange={(event) => {
                  const nextLanguage = event.currentTarget.value;
                  onPreferencesChange(updateWebPreferences(preferences, { language: nextLanguage }));
                }}
              >
                {view.supportedLanguageKeys.map((language) => (
                  <option key={language} value={language}>
                    {text(languageLabelKey(language))}
                  </option>
                ))}
              </select>
            </div>

            <div className="tls-preference-field">
              <label htmlFor="web-currency">{text(getAppEntryAction(view, "change_currency").labelKey as MessageKey)}</label>
              <select
                id="web-currency"
                value={preferences.currency}
                onChange={(event) => {
                  const nextCurrency = event.currentTarget.value;
                  onPreferencesChange(updateWebPreferences(preferences, { currency: nextCurrency }));
                }}
              >
                {view.supportedCurrencyKeys.map((currency) => (
                  <option key={currency} value={currency}>
                    {text(currencyOptionLabelKey(currency))}
                  </option>
                ))}
              </select>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}

/** Resolves one bounded failure code to localized guidance. */
function storageFailureLabelKey(code: string): MessageKey {
  return `web.app.storage.error.${code}` as MessageKey;
}

/** Maps the generic UI currency key back into the web-supported label set. */
function currencyOptionLabelKey(currency: string): MessageKey {
  const supportedCurrency = parseCurrencyCode(currency);

  if (supportedCurrency === undefined) {
    return "common.unknown";
  }

  return currencyLabelKey(supportedCurrency);
}
