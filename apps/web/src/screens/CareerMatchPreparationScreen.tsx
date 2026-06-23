import type { MessageKey, Translator } from "@game/i18n";
import { buildCareerInboxView, buildCareerShellView } from "@game/ui";
import type {
  CareerMatchPreparationBlockerKey,
  CareerMatchPreparationLineupSlotStatus,
  CareerMatchPreparationView,
} from "@game/ui";

import type { DemoCareerContinueResult } from "../career/continue-demo-career";
import { CareerShell } from "../components/CareerShell";

/** Props for the first editable match-preparation screen. */
export type CareerMatchPreparationScreenProps = Readonly<{
  view: CareerMatchPreparationView;
  continueResult?: DemoCareerContinueResult;
  text: Translator;
  onBackToMenu: () => void;
  onBackToDashboard: () => void;
  onContinueCareer: () => void;
  onInboxActionClick: (actionId: string) => void;
  onLineupPlayerChange: (slotKey: string, playerId: string | undefined) => void;
  onTacticProfileChange: (tacticProfileId: string | undefined) => void;
  onSavePreparation: () => void;
}>;

/** Renders the editable lineup slice for the next selected-club fixture. */
export function CareerMatchPreparationScreen({
  view,
  continueResult,
  text,
  onBackToMenu,
  onBackToDashboard,
  onContinueCareer,
  onInboxActionClick,
  onLineupPlayerChange,
  onTacticProfileChange,
  onSavePreparation,
}: CareerMatchPreparationScreenProps): React.JSX.Element {
  const inboxView = buildCareerInboxView(continueResult?.inboxMessages ?? []);
  const shellView = buildCareerShellView({
    activeSectionKey: "dashboard",
    inboxView,
  });

  return (
    <CareerShell
      shellView={shellView}
      selectedClubName={view.selectedClub.name}
      text={text}
      onBackToMenu={onBackToMenu}
      onContinueCareer={onContinueCareer}
      onInboxActionClick={onInboxActionClick}
    >
      <section className="tls-shell-panel tls-preparation-panel" aria-labelledby="match-preparation-title">
        <header className="tls-preparation-header">
          <div>
            <h1 className="tls-shell-title" id="match-preparation-title">{text("career.matchPreparation")}</h1>
            <p className="tls-shell-status">{text(view.summaryKey as MessageKey)}</p>
          </div>
          <button className="tls-menu-button tls-preparation-dashboard" type="button" onClick={onBackToDashboard}>
            {text("career.shell.nav.dashboard")}
          </button>
        </header>

        <section className="tls-preparation-context" aria-label={text("career.matchPreparation.context")}>
          <PreparationFact label={text("setup.selectedClub")} value={view.selectedClub.name} />
          <PreparationFact label={text("career.nextSelectedClubFixture")} value={formatFixture(view, text)} />
          <PreparationFact
            label={text("career.matchPreparation.selectedSlots")}
            value={`${view.lineup.selectedSlotCount}/${view.lineup.requiredSlotCount}`}
          />
        </section>

        <section className="tls-preparation-blockers" aria-label={text("career.matchPreparation.blockers")}>
          <h2>{text("career.matchPreparation.blockers")}</h2>
          {view.blockerKeys.length === 0 ? (
            <p>{text("career.matchPreparation.noBlockers")}</p>
          ) : (
            <ul>
              {view.blockerKeys.map((blocker) => (
                <li key={blocker}>{text(blockerLabelKey(blocker))}</li>
              ))}
            </ul>
          )}
        </section>

        <section className="tls-preparation-lineup" aria-labelledby="match-preparation-lineup-title">
          <h2 id="match-preparation-lineup-title">{text("career.matchPreparation.lineup")}</h2>
          <div className="tls-preparation-slot-grid">
            {view.lineup.slots.map((slot) => (
              <article className="tls-preparation-slot" data-status={slot.status} key={slot.slotKey}>
                <div className="tls-preparation-slot-header">
                  <div>
                    <h3>{text(slot.labelKey as MessageKey)}</h3>
                    <p>{text(roleLabelKey(slot.roleKey))}</p>
                  </div>
                  <span>{text(slotStatusLabelKey(slot.status))}</span>
                </div>

                <label htmlFor={`preparation-${slot.slotKey}`}>
                  {text("career.matchPreparation.playerSelect")}
                </label>
                <select
                  id={`preparation-${slot.slotKey}`}
                  value={slot.selectedPlayerId ?? ""}
                  onChange={(event) => {
                    const nextValue = event.currentTarget.value;
                    onLineupPlayerChange(slot.slotKey, nextValue.length === 0 ? undefined : nextValue);
                  }}
                >
                  <option value="">{text("career.matchPreparation.playerOptionEmpty")}</option>
                  {slot.playerOptions.map((player) => (
                    <option key={player.playerId} value={player.playerId}>
                      {formatPlayerOption(player, text)}
                    </option>
                  ))}
                </select>
              </article>
            ))}
          </div>
        </section>

        <section className="tls-preparation-tactic" aria-labelledby="match-preparation-tactic-title">
          <h2 id="match-preparation-tactic-title">{text("career.matchPreparation.tactic")}</h2>
          <div className="tls-preparation-tactic-grid">
            {view.tactic.profiles.map((profile) => (
              <label className="tls-preparation-tactic-card" data-selected={profile.isSelected} key={profile.tacticProfileId}>
                <span className="tls-preparation-tactic-title">
                  <input
                    checked={profile.isSelected}
                    name="match-preparation-tactic"
                    type="radio"
                    value={profile.tacticProfileId}
                    onChange={(event) => {
                      onTacticProfileChange(event.currentTarget.value);
                    }}
                  />
                  {text(profile.labelKey as MessageKey)}
                </span>
                <span>{text("setup.mentality")}: {text(mentalityLabelKey(profile.values.mentality))}</span>
                <span>{text("career.matchPreparation.tacticValue.pressing")}: {formatTacticValue(profile.values.pressing)}</span>
                <span>{text("career.matchPreparation.tacticValue.directness")}: {formatTacticValue(profile.values.directness)}</span>
                <span>{text("career.matchPreparation.tacticValue.width")}: {formatTacticValue(profile.values.width)}</span>
                <span>{text("career.matchPreparation.tacticValue.risk")}: {formatTacticValue(profile.values.risk)}</span>
              </label>
            ))}
          </div>
        </section>

        <section className="tls-preparation-save" aria-label={text("career.matchPreparation.save")}>
          <p className="tls-dashboard-line">{text(view.summaryKey as MessageKey)}</p>
          <button
            className="tls-menu-button tls-menu-button-primary"
            disabled={view.saveAction.status !== "available"}
            type="button"
            onClick={onSavePreparation}
          >
            {text(view.saveAction.labelKey as MessageKey)}
          </button>
        </section>
      </section>
    </CareerShell>
  );
}

/** Renders one compact preparation fact row. */
function PreparationFact({ label, value }: Readonly<{ label: string; value: string }>): React.JSX.Element {
  return (
    <div className="tls-dashboard-fact">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

/** Formats next-fixture context for the preparation header. */
function formatFixture(view: CareerMatchPreparationView, text: Translator): string {
  if (view.nextFixture === undefined) {
    return text("career.noNextSelectedClubFixture");
  }

  return text("career.dashboard.nextFixtureLine", {
    fixture: view.nextFixture.fixtureId,
    date: view.nextFixture.dateIso,
    round: view.nextFixture.round,
    home: view.nextFixture.homeClub.name,
    away: view.nextFixture.awayClub.name,
    side: text(`career.dashboard.fixtureSide.${view.nextFixture.selectedClubSide}` as MessageKey),
  });
}

/** Formats a player option with role and condition facts. */
function formatPlayerOption(
  player: CareerMatchPreparationView["lineup"]["slots"][number]["playerOptions"][number],
  text: Translator,
): string {
  return text("career.matchPreparation.playerOption", {
    player: player.name,
    role: text(roleLabelKey(player.roleKey)),
    fitness: player.fitness ?? text("common.unknown"),
  });
}

/** Formats a 0..1 tactic value as a compact percentage. */
function formatTacticValue(value: number): string {
  return `${Math.round(value * 100)}%`;
}

/** Maps tactic mentality keys to existing localized setup labels. */
function mentalityLabelKey(mentality: string): MessageKey {
  if (mentality === "balanced" || mentality === "attacking" || mentality === "defensive") {
    return `setup.mentalityValue.${mentality}` as MessageKey;
  }

  return "common.unknown";
}

/** Maps broad role keys to existing localized role labels. */
function roleLabelKey(roleKey: string): MessageKey {
  if (roleKey === "goalkeeper") {
    return "lineup.role.gk";
  }

  if (roleKey === "defender" || roleKey === "midfielder" || roleKey === "attacker") {
    return `lineup.role.${roleKey}` as MessageKey;
  }

  return "common.unknown";
}

/** Maps lineup slot status to a localized label key. */
function slotStatusLabelKey(status: CareerMatchPreparationLineupSlotStatus): MessageKey {
  return `career.matchPreparation.slotStatus.${status}`;
}

/** Maps preparation blocker keys to localized label keys. */
function blockerLabelKey(blocker: CareerMatchPreparationBlockerKey): MessageKey {
  return `career.matchPreparation.blocker.${blocker}`;
}
