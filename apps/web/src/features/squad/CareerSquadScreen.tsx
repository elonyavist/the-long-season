import type { MessageKey, Translator } from "@game/i18n";
import {
  buildCareerShellView,
  buildCareerSquadView,
  type CareerContractTermsInput,
  type CareerInboxView,
  type CareerSquadColumnKey,
  type CareerSquadFilters,
  type CareerSquadPlayerActionView,
  type CareerSquadPlayerRowView,
  type CareerSquadSlotChoiceView,
  type CareerSquadSort,
} from "@game/ui";
import {
  Armchair,
  ChevronsUpDown,
  Eye,
  FileClock,
  Search,
  UserRoundMinus,
  UserRoundPlus,
} from "lucide-react";
import { useMemo, useState } from "react";

import type { WebPreferences } from "../../app/preferences";
import type {
  WebSelectedClubContractCommand,
  WebSelectedClubContractCommandResult,
} from "../../runtime/web-career-runtime";
import { canonicalPlayerRoleCode } from "../../shared/canonical-player-role";
import { formatMoneyFromMinorUnits } from "../../shared/format-money";
import { AppShell } from "../app-shell/AppShell";
import { CareerScreenHeader } from "../shared/CareerScreenHeader";
import { CareerPlayerProfileDialog } from "./CareerPlayerProfileDialog";
import { SquadLineupChoiceDialog } from "./SquadLineupChoiceDialog";
import type {
  CareerContractFinancePreview,
  CareerSquadPresentation,
} from "./career-squad-adapter";

/** Props for the browser Senior Squad workspace introduced in Phase 78. */
export type CareerSquadScreenProps = Readonly<{
  presentation: CareerSquadPresentation;
  inboxView: CareerInboxView;
  language: WebPreferences["language"];
  contractCommandPending: boolean;
  text: Translator;
  onBackToMenu: () => void;
  onInboxActionClick: (actionId: string) => void;
  onLineupPlayerChange: (slotKey: string, playerId: string | undefined) => void;
  onBenchPlayerChange: (slotKey: string, playerId: string | undefined) => void;
  previewContractOffer: (
    playerId: string,
    terms: CareerContractTermsInput,
  ) => CareerContractFinancePreview;
  onContractCommand: (
    command: WebSelectedClubContractCommand,
  ) => Promise<WebSelectedClubContractCommandResult | undefined>;
}>;

/** Renders the complete current roster without owning selection or contract rules. */
export function CareerSquadScreen({
  presentation,
  inboxView,
  language,
  contractCommandPending,
  text,
  onBackToMenu,
  onInboxActionClick,
  onLineupPlayerChange,
  onBenchPlayerChange,
  previewContractOffer,
  onContractCommand,
}: CareerSquadScreenProps): React.JSX.Element {
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState<CareerSquadFilters["department"]>();
  const [availability, setAvailability] = useState<CareerSquadFilters["availability"]>();
  const [sort, setSort] = useState<CareerSquadSort>({ key: "role", direction: "ascending" });
  const [openPlayerId, setOpenPlayerId] = useState<string>();
  const [lineupChoice, setLineupChoice] = useState<Readonly<{
    playerId: string;
    displayName: string;
    choices: readonly CareerSquadSlotChoiceView[];
  }>>();
  const shellView = buildCareerShellView({ activeSectionKey: "squad", inboxView });
  const view = useMemo(
    () => presentation.status === "error"
      ? undefined
      : buildCareerSquadView({
          players: presentation.players,
          filters: {
            ...(query.trim().length === 0 ? {} : { query }),
            ...(department === undefined ? {} : { department }),
            ...(availability === undefined ? {} : { availability }),
          },
          sort,
        }),
    [availability, department, presentation, query, sort],
  );
  const profile = presentation.status === "ready" && openPlayerId !== undefined
    ? presentation.profilesByPlayerId.get(openPlayerId)
    : undefined;

  return (
    <AppShell
      shellView={shellView}
      selectedClubName={presentation.selectedClubName}
      currentDateIso={presentation.currentDateIso}
      text={text}
      onBackToMenu={onBackToMenu}
      onInboxActionClick={onInboxActionClick}
    >
      <section className="tls-shell-panel tls-squad-panel" aria-labelledby="career-squad-title">
        <CareerScreenHeader
          className="tls-squad-header"
          eyebrow={text("career.squad.eyebrow")}
          supporting={text("career.squad.subtitle")}
          title={text("career.shell.nav.squad")}
          titleId="career-squad-title"
        />

        {presentation.status === "error" ? (
          <div className="tls-squad-state" role="alert">
            <strong>{text("career.squad.error.title")}</strong>
            <p>{text(presentation.messageKey)}</p>
          </div>
        ) : view === undefined ? null : (
          <>
            <div className="tls-squad-toolbar" aria-label={text("career.squad.filters") }>
              <label className="tls-squad-search">
                <span className="tls-visually-hidden">{text("career.squad.search")}</span>
                <Search aria-hidden="true" size={18} strokeWidth={1.8} />
                <input
                  type="search"
                  value={query}
                  placeholder={text("career.squad.searchPlaceholder")}
                  onChange={(event) => setQuery(event.currentTarget.value)}
                />
              </label>
              <label>
                <span>{text("career.squad.department")}</span>
                <select
                  value={department ?? "all"}
                  onChange={(event) => setDepartment(
                    event.currentTarget.value === "all"
                      ? undefined
                      : event.currentTarget.value as NonNullable<CareerSquadFilters["department"]>,
                  )}
                >
                  <option value="all">{text("career.squad.filter.all")}</option>
                  <option value="goalkeeper">{text("career.squad.department.goalkeeper")}</option>
                  <option value="defense">{text("career.squad.department.defense")}</option>
                  <option value="midfield">{text("career.squad.department.midfield")}</option>
                  <option value="attack">{text("career.squad.department.attack")}</option>
                </select>
              </label>
              <label>
                <span>{text("career.squad.availability")}</span>
                <select
                  value={availability ?? "all"}
                  onChange={(event) => setAvailability(
                    event.currentTarget.value === "all"
                      ? undefined
                      : event.currentTarget.value as NonNullable<CareerSquadFilters["availability"]>,
                  )}
                >
                  <option value="all">{text("career.squad.filter.all")}</option>
                  <option value="available">{text("career.squad.status.available")}</option>
                  <option value="unavailable">{text("career.squad.status.unavailable")}</option>
                  <option value="injured">{text("career.squad.status.injured")}</option>
                  <option value="suspended">{text("career.squad.status.suspended")}</option>
                </select>
              </label>
              <p className="tls-squad-count" aria-live="polite">
                {text("career.squad.visiblePlayers", {
                  visible: view.visiblePlayerCount,
                  total: view.totalPlayerCount,
                })}
              </p>
            </div>

            {view.rows.length === 0 ? (
              <div className="tls-squad-state">
                <strong>{text("career.squad.empty.title")}</strong>
                <p>{text("career.squad.empty.summary")}</p>
              </div>
            ) : (
              <div className="tls-squad-table-frame">
                <table className="tls-squad-table">
                  <colgroup>
                    {view.columns.map((column) => <col data-column={column.key} key={column.key} />)}
                  </colgroup>
                  <thead>
                    <tr>
                      {view.columns.map((column) => (
                        <th key={column.key} scope="col">
                          {column.sortKey === undefined ? text(column.labelKey as MessageKey) : (
                            <button
                              type="button"
                              aria-label={sortLabel(text(column.labelKey as MessageKey), column.key, sort, text)}
                              data-active={sort.key === column.key ? "true" : "false"}
                              onClick={() => setSort(nextSort(sort, column.key))}
                            >
                              <span>{text(column.labelKey as MessageKey)}</span>
                              <ChevronsUpDown aria-hidden="true" size={14} />
                            </button>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {view.rows.map((row) => (
                      <SquadRow
                        key={row.playerId}
                        language={language}
                        row={row}
                        text={text}
                        onOpen={() => setOpenPlayerId(row.playerId)}
                        onAction={(action) => {
                          if (action.actionId === "field_player") {
                            const directChoice = action.mode === "direct" ? action.choices[0] : undefined;
                            if (directChoice !== undefined) {
                              onLineupPlayerChange(directChoice.slotKey, row.playerId);
                            } else {
                              setLineupChoice({
                                playerId: row.playerId,
                                displayName: row.displayName,
                                choices: action.choices,
                              });
                            }
                            return;
                          }
                          if (action.actionId === "select_as_substitute") {
                            onBenchPlayerChange(action.slotKey, row.playerId);
                            return;
                          }
                          if (action.actionId === "remove_from_starting_xi") {
                            onLineupPlayerChange(action.slotKey, undefined);
                            return;
                          }
                          onBenchPlayerChange(action.slotKey, undefined);
                        }}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </section>

      <CareerPlayerProfileDialog
        profile={profile}
        language={language}
        contractCommandPending={contractCommandPending}
        text={text}
        previewContractOffer={previewContractOffer}
        onContractCommand={onContractCommand}
        onClose={() => setOpenPlayerId(undefined)}
      />
      <SquadLineupChoiceDialog
        choice={lineupChoice}
        text={text}
        onChoose={(slotKey) => {
          if (lineupChoice === undefined) return;
          onLineupPlayerChange(slotKey, lineupChoice.playerId);
          setLineupChoice(undefined);
        }}
        onClose={() => setLineupChoice(undefined)}
      />
    </AppShell>
  );
}

function SquadRow({
  row,
  language,
  text,
  onOpen,
  onAction,
}: Readonly<{
  row: CareerSquadPlayerRowView;
  language: WebPreferences["language"];
  text: Translator;
  onOpen: () => void;
  onAction: (action: CareerSquadPlayerActionView) => void;
}>): React.JSX.Element {
  return (
    <tr
      tabIndex={0}
      data-status={row.compositeStatus}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
    >
      <td data-label={text("career.squad.column.number")}>{row.shirtNumber}</td>
      <td data-label={text("career.squad.column.role")}>
        <abbr title={text(`career.player.role.${row.primaryRole}` as MessageKey)}>
          {canonicalPlayerRoleCode(row.primaryRole)}
        </abbr>
      </td>
      <th data-label={text("career.squad.column.player")} scope="row">
        <span className="tls-squad-player-name">
          {row.displayName}
          {row.hasExpiringContract ? (
            <FileClock
              aria-label={text("career.squad.contractExpiring")}
              role="img"
              size={16}
              strokeWidth={1.8}
            />
          ) : null}
        </span>
      </th>
      <td data-label={text("career.squad.column.condition")}>{Math.round(row.condition)}%</td>
      <td data-label={text("career.squad.column.morale")}>{Math.round(row.morale)}</td>
      <td data-label={text("career.squad.column.status") }>
        <span className="tls-squad-status" data-status={row.compositeStatus}>
          {text(`career.squad.status.${row.compositeStatus}` as MessageKey)}
        </span>
      </td>
      <td data-label={text("career.squad.column.value")}>
        {formatMoneyFromMinorUnits(row.value, row.currency, language, "whole")}
      </td>
      <td data-label={text("career.squad.column.current_level")}>{text(levelKey(row.currentLevel))}</td>
      <td data-label={text("career.squad.column.potential_level")}>{text(levelKey(row.potentialLevel))}</td>
      <td data-label={text("career.squad.column.action") }>
        <div className="tls-squad-row-actions">
          {row.actions.map((action) => {
            const Icon = action.actionId === "field_player"
              ? UserRoundPlus
              : action.actionId === "select_as_substitute"
                ? Armchair
                : UserRoundMinus;
            const label = text(action.labelKey);
            return (
              <button
                aria-label={label}
                className="tls-icon-button"
                key={action.actionId}
                title={label}
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onAction(action);
                }}
              >
                <Icon aria-hidden="true" size={17} strokeWidth={1.8} />
              </button>
            );
          })}
          <button
            aria-label={text("career.squad.openProfile", { player: row.displayName })}
            className="tls-icon-button tls-squad-open-profile"
            title={text("career.squad.openProfile", { player: row.displayName })}
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onOpen();
            }}
          >
            <Eye aria-hidden="true" size={17} strokeWidth={1.8} />
          </button>
        </div>
      </td>
    </tr>
  );
}

function nextSort(current: CareerSquadSort, key: CareerSquadColumnKey): CareerSquadSort {
  if (key === "action") return current;
  if (current.key !== key) return { key, direction: "ascending" };
  return { key, direction: current.direction === "ascending" ? "descending" : "ascending" };
}

function sortLabel(
  label: string,
  key: CareerSquadColumnKey,
  sort: CareerSquadSort,
  text: Translator,
): string {
  const nextDirection = sort.key === key && sort.direction === "ascending" ? "descending" : "ascending";
  return text(`career.squad.sort.${nextDirection}` as MessageKey, { column: label });
}

function levelKey(level: CareerSquadPlayerRowView["currentLevel"]): MessageKey {
  return `career.squad.level.${level}` as MessageKey;
}
