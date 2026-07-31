import type { MessageKey, Translator } from "@game/i18n";
import {
  buildCareerShellView,
  buildCareerSquadView,
  type CareerContractTermsInput,
  type CareerInboxView,
  type CareerSquadColumnKey,
  type CareerSquadFilters,
  type CareerSquadPlacementOptionView,
  type CareerSquadPlayerRowView,
  type CareerSquadSlotChoiceView,
  type CareerSquadSort,
} from "@game/ui";
import {
  ChevronsUpDown,
  FileClock,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";

import type { WebPreferences } from "../../app/preferences";
import type {
  WebSelectedClubContractCommand,
  WebSelectedClubContractCommandResult,
} from "../../runtime/web-career-runtime";
import { canonicalPlayerRoleCode } from "../../shared/canonical-player-role";
import { formatMoneyFromMinorUnits } from "../../shared/format-money";
import { useDebouncedValue } from "../../shared/lib/use-debounced-value";
import { PlayerPotentialRangeRating } from "../../shared/ui/PlayerPotentialRangeRating";
import { PlayerStarRating } from "../../shared/ui/PlayerStarRating";
import { AppShell } from "../app-shell/AppShell";
import { CareerScreenHeader } from "../shared/CareerScreenHeader";
import { CareerPlayerProfileDialog } from "./CareerPlayerProfileDialog";
import { SquadLineupChoiceDialog } from "./SquadLineupChoiceDialog";
import { SquadRowActionMenu } from "./SquadRowActionMenu";
import type {
  CareerContractFinancePreview,
  CareerSquadPresentation,
} from "./career-squad-adapter";
import {
  planCareerSquadPlacement,
  type CareerSquadPlacementOperation,
  type CareerSquadPlacementTarget,
} from "./career-squad-placement";

/** Delay applied only to the typed Squad player-name query. */
const SQUAD_SEARCH_DELAY_MS = 250;

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
  const [placementFeedback, setPlacementFeedback] = useState("");
  const shellView = buildCareerShellView({ activeSectionKey: "squad", inboxView });
  // Typing echoes immediately while the table rebuilds once the query settles.
  const appliedQuery = useDebouncedValue(query, SQUAD_SEARCH_DELAY_MS);
  const view = useMemo(
    () => presentation.status === "error"
      ? undefined
      : buildCareerSquadView({
          players: presentation.players,
          filters: {
            ...(appliedQuery.trim().length === 0 ? {} : { query: appliedQuery }),
            ...(department === undefined ? {} : { department }),
            ...(availability === undefined ? {} : { availability }),
          },
          sort,
        }),
    [appliedQuery, availability, department, presentation, sort],
  );
  const profile = presentation.status === "ready" && openPlayerId !== undefined
    ? presentation.profilesByPlayerId.get(openPlayerId)
    : undefined;
  const menuDismissSignal = [
    appliedQuery,
    department ?? "all",
    availability ?? "all",
    sort.key,
    sort.direction,
  ].join("\u0000");

  const applyPlacement = (
    row: CareerSquadPlayerRowView,
    target: CareerSquadPlacementTarget,
  ): void => {
    if (presentation.status !== "ready") return;
    const plan = planCareerSquadPlacement({
      playerId: row.playerId,
      lineupSlots: presentation.placementContext.lineupSlots,
      benchSlots: presentation.placementContext.benchSlots,
      target,
    });
    if (plan.status === "rejected") {
      setPlacementFeedback(text("career.squad.placement.rejected", {
        player: row.displayName,
      }));
      return;
    }
    if (plan.status === "noop") {
      setPlacementFeedback(text("career.squad.placement.unchanged", {
        player: row.displayName,
      }));
      return;
    }

    for (const operation of plan.operations) {
      dispatchPlacementOperation(
        operation,
        onLineupPlayerChange,
        onBenchPlayerChange,
      );
    }
    setPlacementFeedback(text("career.squad.placement.updated", {
      player: row.displayName,
    }));
  };

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
                  {/* The value must stay the canonical department, not the role name. */}
                  <option value="goalkeeping">{text("career.squad.department.goalkeeper")}</option>
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
            <p className="tls-visually-hidden" aria-live="polite" role="status">
              {placementFeedback}
            </p>

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
                        menuDismissSignal={menuDismissSignal}
                        row={row}
                        text={text}
                        onOpen={() => setOpenPlayerId(row.playerId)}
                        onPlacementChange={(option) => {
                          applyPlacement(row, placementTarget(option));
                        }}
                        onChooseLineupPosition={() => {
                          setLineupChoice({
                            playerId: row.playerId,
                            displayName: row.displayName,
                            choices: detailedLineupChoices(row),
                          });
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
          const row = view?.rows.find((candidate) => candidate.playerId === lineupChoice.playerId);
          const choice = lineupChoice.choices.find((candidate) => candidate.slotKey === slotKey);
          if (row !== undefined && choice !== undefined) {
            applyPlacement(row, {
              kind: "lineup",
              slotKey,
              expectedPlayerId: choice.occupantPlayerId ?? null,
            });
          }
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
  menuDismissSignal,
  text,
  onOpen,
  onPlacementChange,
  onChooseLineupPosition,
}: Readonly<{
  row: CareerSquadPlayerRowView;
  language: WebPreferences["language"];
  menuDismissSignal: string;
  text: Translator;
  onOpen: () => void;
  onPlacementChange: (option: CareerSquadPlacementOptionView) => void;
  onChooseLineupPosition: () => void;
}>): React.JSX.Element {
  return (
    <tr
      tabIndex={0}
      data-status={row.compositeStatus}
      onClick={(event) => {
        if (!isInteractiveRowTarget(event.target)) onOpen();
      }}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
    >
      <td data-label={text("career.squad.column.number")} data-align="numeric">{row.shirtNumber}</td>
      <td data-label={text("career.squad.column.role")}>
        <abbr title={text(`career.player.role.${row.primaryRole}` as MessageKey)}>
          {canonicalPlayerRoleCode(row.primaryRole)}
        </abbr>
      </td>
      <td data-label={text("career.squad.column.placement")}>
        <label className="tls-squad-placement-control">
          <span className="tls-visually-hidden">
            {text("career.squad.placement.label", { player: row.displayName })}
          </span>
          <select
            aria-label={text("career.squad.placement.label", { player: row.displayName })}
            value={row.placement.value}
            onChange={(event) => {
              const selectedOption = row.placement.options.find(
                (option) => option.value === event.currentTarget.value,
              );
              if (selectedOption !== undefined) onPlacementChange(selectedOption);
            }}
          >
            {row.placement.options.map((option) => (
              <option key={option.value} value={option.value}>
                {placementOptionLabel(option, row.playerId, text)}
              </option>
            ))}
          </select>
        </label>
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
      <td data-label={text("career.squad.column.age")} data-align="numeric">{row.age}</td>
      <td data-label={text("career.squad.column.condition")} data-align="numeric">{Math.round(row.condition)}%</td>
      <td data-label={text("career.squad.column.morale")} data-align="numeric">{Math.round(row.morale)}</td>
      <td data-label={text("career.squad.column.status") }>
        <span className="tls-squad-status" data-status={row.compositeStatus}>
          {text(`career.squad.status.${row.compositeStatus}` as MessageKey)}
        </span>
      </td>
      <td data-label={text("career.squad.column.value")} data-align="numeric">
        {formatMoneyFromMinorUnits(row.value, row.currency, language, "whole")}
      </td>
      <td data-label={text("career.squad.column.current_level")}>
        <PlayerStarRating
          label={text("career.squad.column.current_level")}
          rating={row.currentRating}
          text={text}
        />
      </td>
      <td data-label={text("career.squad.column.potential_level")}>
        <PlayerPotentialRangeRating
          currentRating={row.currentRating}
          language={language}
          range={row.potentialRange}
          text={text}
        />
      </td>
      <td data-label={text("career.squad.column.action") }>
        <SquadRowActionMenu
          canChooseLineupPosition={detailedLineupChoices(row).length > 0}
          dismissSignal={menuDismissSignal}
          playerName={row.displayName}
          text={text}
          onChooseLineupPosition={onChooseLineupPosition}
          onOpenProfile={onOpen}
        />
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

function placementTarget(
  option: CareerSquadPlacementOptionView,
): CareerSquadPlacementTarget {
  if (option.kind === "unselected") return { kind: "unselected" };
  if (option.kind === "bench") {
    return {
      kind: "bench",
      slotKey: option.slotKey,
      expectedPlayerId: option.occupantPlayerId ?? null,
    };
  }
  return {
    kind: "lineup",
    slotKey: option.slotKey,
    expectedPlayerId: option.occupantPlayerId ?? null,
  };
}

function placementOptionLabel(
  option: CareerSquadPlacementOptionView,
  currentPlayerId: string,
  text: Translator,
): string {
  if (option.kind !== "lineup") return text(option.labelKey);
  const values = {
    slot: text(option.labelKey as MessageKey),
    suitability: text(`career.squad.placement.suitability.${option.suitability}` as MessageKey),
  };
  return option.occupantName === undefined || option.occupantPlayerId === currentPlayerId
    ? text("career.squad.placement.lineupOption", values)
    : text("career.squad.placement.lineupOptionOccupied", {
        ...values,
        player: option.occupantName,
      });
}

function dispatchPlacementOperation(
  operation: CareerSquadPlacementOperation,
  onLineupPlayerChange: CareerSquadScreenProps["onLineupPlayerChange"],
  onBenchPlayerChange: CareerSquadScreenProps["onBenchPlayerChange"],
): void {
  if (operation.kind === "lineup") {
    onLineupPlayerChange(operation.slotKey, operation.playerId);
    return;
  }
  onBenchPlayerChange(operation.slotKey, operation.playerId);
}

function isInteractiveRowTarget(target: EventTarget | null): boolean {
  return target instanceof Element
    && target.closest(
      "button, select, input, textarea, label, a, [role='button'], [role='menu'], [role='menuitem']",
    )
      !== null;
}

function detailedLineupChoices(
  row: CareerSquadPlayerRowView,
): readonly CareerSquadSlotChoiceView[] {
  return row.lineupChoices.filter((choice) => choice.occupantPlayerId !== row.playerId);
}
