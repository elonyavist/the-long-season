import type { MessageKey, Translator } from "@game/i18n";
import type { AppEntryView } from "@game/ui";

import {
  currencyLabelKey,
  languageLabelKey,
  parseCurrencyCode,
  updateWebPreferences,
  type WebPreferences,
} from "../../app/preferences";
import { getAppEntryAction } from "./app-entry-view-model";

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
    <main
      className="grid min-h-screen place-items-center p-[var(--tls-space-5)] max-[620px]:items-stretch max-[620px]:p-[var(--tls-space-3)]"
      data-testid="app-entry-screen"
    >
      <section className="tls-shell-panel grid gap-[var(--tls-space-5)]" aria-labelledby="app-entry-title">
        <div className="border-b border-[var(--tls-color-line-soft)] pb-[var(--tls-space-4)]">
          <h1 className="tls-shell-title" id="app-entry-title">{text("web.app.title")}</h1>
        </div>

        <div className="grid items-start gap-[var(--tls-space-5)] min-[621px]:grid-cols-[minmax(12rem,18rem)_minmax(0,1fr)]">
          <nav className="grid gap-[var(--tls-space-3)]" aria-label={text(settingsAction.labelKey as MessageKey)}>
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
              <p className="m-0 text-[length:var(--tls-font-size-xs)] [color:var(--tls-color-red)]">
                {text(`app.entry.unavailable.${continueAction.unavailableReasonKey}` as MessageKey)}
              </p>
            )}
          </nav>

          <form className="tls-preferences mt-0" aria-label={text(settingsAction.labelKey as MessageKey)}>
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
