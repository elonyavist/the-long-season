import type { MessageKey, Translator } from "@game/i18n";

import {
  currencyLabelKey,
  languageLabelKey,
  parseCurrencyCode,
  updateWebPreferences,
  type WebPreferences,
} from "../../app/preferences";
import { getAppEntryAction, type WebAppEntryView } from "./app-entry-view-model";

/** Props for the localized app-entry screen. */
export type AppEntryScreenProps = Readonly<{
  view: WebAppEntryView;
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

            <fieldset className="col-span-full m-0 grid gap-[var(--tls-space-2)] border-0 p-0">
              <legend className="mb-[var(--tls-space-1)] text-[length:var(--tls-font-size-xs)] font-bold uppercase [color:var(--tls-color-paper-muted)]">
                {text("web.preferences.themePalette")}
              </legend>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(9.5rem,1fr))] gap-[var(--tls-space-2)]">
                {view.themePaletteOptions.map((palette) => (
                  <label
                    className="grid cursor-pointer grid-cols-[auto_minmax(0,1fr)] items-center gap-[var(--tls-space-2)] rounded-[var(--tls-radius-sm)] border border-[var(--tls-color-line-soft)] bg-[var(--tls-theme-secondary-action-surface)] px-[var(--tls-space-2)] py-[var(--tls-space-2)] text-[length:var(--tls-font-size-xs)] font-bold [color:var(--tls-color-text)] has-[:checked]:border-[var(--tls-theme-primary-action-surface)] has-[:checked]:shadow-[inset_0_0_0_1px_var(--tls-theme-primary-action-surface)]"
                    key={palette.id}
                  >
                    <input
                      type="radio"
                      name="web-theme-palette"
                      value={palette.id}
                      checked={preferences.themePaletteId === palette.id}
                      onChange={(event) => {
                        onPreferencesChange(updateWebPreferences(preferences, { themePaletteId: event.currentTarget.value }));
                      }}
                    />
                    <span className="grid min-w-0 gap-[var(--tls-space-1)]">
                      <span className="flex gap-1" aria-hidden="true">
                        {palette.swatch.map((color) => (
                          <span
                            className="h-4 w-4 rounded-[2px] border border-[var(--tls-color-line-soft)]"
                            key={`${palette.id}-${color}`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </span>
                      <span className="truncate">{text(palette.labelKey as MessageKey)}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
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
