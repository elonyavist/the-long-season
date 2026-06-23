import type { MessageKey, Translator } from "@game/i18n";
import type { AppEntryView } from "@game/ui";

import {
  currencyLabelKey,
  languageLabelKey,
  parseCurrencyCode,
  updateWebPreferences,
  type WebPreferences,
} from "../app/preferences";
import { getAppEntryAction } from "../app/app-entry-view-model";

/** Props for the localized app-entry screen. */
export type AppEntryScreenProps = Readonly<{
  view: AppEntryView;
  preferences: WebPreferences;
  text: Translator;
  onPreferencesChange: (preferences: WebPreferences) => void;
  onStartNewCareer: () => void;
  onContinueCareer: () => void;
}>;

/** Renders the first app screen: main actions plus language/currency settings. */
export function AppEntryScreen({
  view,
  preferences,
  text,
  onPreferencesChange,
  onStartNewCareer,
  onContinueCareer,
}: AppEntryScreenProps): React.JSX.Element {
  const startAction = getAppEntryAction(view, "start_new_career");
  const continueAction = getAppEntryAction(view, "continue_career");
  const settingsAction = getAppEntryAction(view, "open_settings");
  const continueDisabled = continueAction.status !== "available";

  return (
    <main className="tls-app-shell" data-testid="app-entry-screen">
      <section className="tls-shell-panel tls-entry-panel" aria-labelledby="app-entry-title">
        <div className="tls-entry-brand">
          <h1 className="tls-shell-title" id="app-entry-title">{text("web.app.title")}</h1>
        </div>

        <div className="tls-entry-grid">
          <nav className="tls-entry-actions" aria-label={text(settingsAction.labelKey as MessageKey)}>
            <button className="tls-menu-button tls-menu-button-primary" type="button" onClick={onStartNewCareer}>
              {text(startAction.labelKey as MessageKey)}
            </button>
            <button
              className="tls-menu-button"
              disabled={continueDisabled}
              type="button"
              onClick={onContinueCareer}
            >
              {text(continueAction.labelKey as MessageKey)}
            </button>
            {continueAction.unavailableReasonKey === undefined ? null : (
              <p className="tls-entry-unavailable">
                {text(`app.entry.unavailable.${continueAction.unavailableReasonKey}` as MessageKey)}
              </p>
            )}
          </nav>

          <form className="tls-preferences tls-entry-settings" aria-label={text(settingsAction.labelKey as MessageKey)}>
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

/** Maps the generic UI currency key back into the web-supported label set. */
function currencyOptionLabelKey(currency: string): MessageKey {
  const supportedCurrency = parseCurrencyCode(currency);

  if (supportedCurrency === undefined) {
    return "common.unknown";
  }

  return currencyLabelKey(supportedCurrency);
}
