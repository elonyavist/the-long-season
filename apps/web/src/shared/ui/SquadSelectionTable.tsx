import { useMemo, useState } from "react";
import type React from "react";

import type { Translator } from "@game/i18n";

import {
  comparePlayerOptionsByPosition,
  playerDepartment,
  playerPositionCode,
  type WebPlayerDepartment,
  type WebPlayerPositionOption,
} from "../lib/player-position-ordering";
import {
  formatFitnessPercent,
  formatOptionalNumber,
  roleLabelKey,
  squadStatusLabelKey,
  type TacticalPlayerFoot,
  type TacticalSquadStatus,
} from "../lib/match-preparation-labels";

/** Columns that can drive the local squad-list ordering. */
export type SquadSelectionSortKey = "name" | "role" | "age" | "fitness" | "status";

type SquadSelectionSortDirection = "ascending" | "descending";
type SquadSelectionFilter = "all" | WebPlayerDepartment;

/** Deterministic local sort state for one squad list. */
export interface SquadSelectionSort {
  readonly key: SquadSelectionSortKey;
  readonly direction: SquadSelectionSortDirection;
}

/** Player facts needed by reusable squad-picking tables. */
export interface SquadSelectionPlayer extends WebPlayerPositionOption {
  /** Shirt number from the active squad registration. */
  readonly number?: number;
  /** Current physical condition, when the underlying view exposes it. */
  readonly fitness?: number;
}

/** One row in a reusable squad-picking table. */
export interface SquadSelectionRow {
  /** Stable player option used for sorting and selection. */
  readonly player: SquadSelectionPlayer;
  /** Current age when known. */
  readonly age?: number;
  /** Preferred foot retained for the player detail panel, not this compact list. */
  readonly foot?: TacticalPlayerFoot;
  /** Whether the player is in the XI, on the bench, or currently available. */
  readonly status: TacticalSquadStatus;
}

/** Props for the reusable sortable squad-selection table. */
export interface SquadSelectionTableProps {
  /** Unique squad rows available to the current tactical surface. */
  readonly rows: readonly SquadSelectionRow[];
  /** Player currently focused in the detail panel. */
  readonly selectedPlayerId?: string | undefined;
  /** Localized text lookup. */
  readonly text: Translator;
  /** Called when the manager focuses a player row. */
  readonly onPlayerSelect: (playerId: string) => void;
}

const SQUAD_FILTERS: readonly SquadSelectionFilter[] = [
  "all",
  "goalkeeper",
  "defender",
  "midfielder",
  "attacker",
];

/** Renders a fixed-height squad list without horizontal scrolling. */
export function SquadSelectionTable({
  rows,
  selectedPlayerId,
  text,
  onPlayerSelect,
}: SquadSelectionTableProps): React.JSX.Element {
  const [squadSort, setSquadSort] = useState<SquadSelectionSort>({
    key: "role",
    direction: "ascending",
  });
  const [activeFilter, setActiveFilter] = useState<SquadSelectionFilter>("all");
  const visibleRows = useMemo(
    () => sortSquadSelectionRows(filterSquadSelectionRows(rows, activeFilter), squadSort),
    [activeFilter, rows, squadSort],
  );

  return (
    <section className="tls-preparation-squad-list">
      <div className="tls-preparation-squad-list-heading">
        <h3 id="match-preparation-squad-title">{text("career.matchPreparation.squadList")}</h3>
        <div
          aria-label={text("career.matchPreparation.squadFilter")}
          className="tls-preparation-squad-filters"
          role="group"
        >
          {SQUAD_FILTERS.map((filter) => (
            <button
              aria-pressed={activeFilter === filter}
              className="tls-preparation-squad-filter"
              key={filter}
              type="button"
              onClick={() => {
                setActiveFilter(filter);
              }}
            >
              {text(squadFilterLabelKey(filter))}
            </button>
          ))}
        </div>
      </div>

      <div className="tls-preparation-squad-table-wrap">
        <table className="tls-preparation-squad-table">
          <caption className="tls-visually-hidden">{text("career.matchPreparation.squadList")}</caption>
          <colgroup>
            <col className="tls-preparation-squad-name-column" />
            <col className="tls-preparation-squad-role-column" />
            <col className="tls-preparation-squad-age-column" />
            <col className="tls-preparation-squad-condition-column" />
            <col className="tls-preparation-squad-status-column" />
          </colgroup>
          <thead>
            <tr>
              <SortableSquadHeader
                activeSort={squadSort}
                label={text("career.matchPreparation.column.name")}
                sortKey="name"
                onSortChange={setSquadSort}
              />
              <SortableSquadHeader
                activeSort={squadSort}
                label={text("career.matchPreparation.column.role")}
                sortKey="role"
                visualLabel={text("career.matchPreparation.column.positionShort")}
                onSortChange={setSquadSort}
              />
              <SortableSquadHeader
                activeSort={squadSort}
                label={text("career.matchPreparation.column.age")}
                sortKey="age"
                onSortChange={setSquadSort}
              />
              <SortableSquadHeader
                activeSort={squadSort}
                label={text("career.matchPreparation.column.fitness")}
                sortKey="fitness"
                visualLabel="%"
                onSortChange={setSquadSort}
              />
              <SortableSquadHeader
                activeSort={squadSort}
                label={text("career.matchPreparation.column.status")}
                sortKey="status"
                visualLabel={text("career.matchPreparation.column.selectionShort")}
                onSortChange={setSquadSort}
              />
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr
                data-selected={selectedPlayerId === row.player.playerId ? "true" : undefined}
                data-status={row.status}
                key={row.player.playerId}
              >
                <td>
                  <button
                    aria-pressed={selectedPlayerId === row.player.playerId}
                    className="tls-preparation-squad-player"
                    type="button"
                    onClick={() => {
                      onPlayerSelect(row.player.playerId);
                    }}
                  >
                    <span className="tls-preparation-squad-number">
                      {formatOptionalNumber(row.player.number, text)}
                    </span>
                    <span className="tls-preparation-squad-name">{row.player.name}</span>
                  </button>
                </td>
                <td className="tls-preparation-squad-position">
                  <abbr title={text(roleLabelKey(row.player.roleKey))}>{playerPositionCode(row.player)}</abbr>
                </td>
                <td className="tls-preparation-squad-numeric">{formatOptionalNumber(row.age, text)}</td>
                <td>
                  <FitnessSignal fitness={row.player.fitness} text={text} />
                </td>
                <td>
                  <SquadStatusMarker status={row.status} text={text} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/** Filters squad rows by their football department. */
export function filterSquadSelectionRows(
  rows: readonly SquadSelectionRow[],
  filter: SquadSelectionFilter,
): readonly SquadSelectionRow[] {
  return filter === "all" ? rows : rows.filter((row) => playerDepartment(row.player) === filter);
}

/** Sorts squad rows by one visible manager-facing fact. */
export function sortSquadSelectionRows(
  rows: readonly SquadSelectionRow[],
  sort: SquadSelectionSort,
): readonly SquadSelectionRow[] {
  const direction = sort.direction === "ascending" ? 1 : -1;

  return [...rows].sort((left, right) => compareSquadRows(left, right, sort.key) * direction);
}

/** Renders an accessible sortable squad-table header cell. */
function SortableSquadHeader({
  activeSort,
  label,
  sortKey,
  visualLabel,
  onSortChange,
}: Readonly<{
  activeSort: SquadSelectionSort;
  label: string;
  sortKey: SquadSelectionSortKey;
  visualLabel?: string;
  onSortChange: (sort: SquadSelectionSort) => void;
}>): React.JSX.Element {
  const isActive = activeSort.key === sortKey;
  const nextDirection: SquadSelectionSortDirection =
    isActive && activeSort.direction === "ascending" ? "descending" : "ascending";

  return (
    <th aria-sort={isActive ? activeSort.direction : undefined} scope="col">
      <button
        aria-label={label}
        className="tls-preparation-squad-sort"
        type="button"
        onClick={() => {
          onSortChange({ key: sortKey, direction: nextDirection });
        }}
      >
        <span>{visualLabel ?? label}</span>
        <span aria-hidden="true" className="tls-preparation-squad-sort-indicator">
          {isActive ? (activeSort.direction === "descending" ? "v" : "^") : ""}
        </span>
      </button>
    </th>
  );
}

/** Presents current condition as a compact signal plus an exact percentage. */
function FitnessSignal({
  fitness,
  text,
}: Readonly<{ fitness: number | undefined; text: Translator }>): React.JSX.Element {
  const level = fitness === undefined ? "unknown" : fitness >= 90 ? "ready" : fitness >= 75 ? "watch" : "low";

  return (
    <span className="tls-preparation-fitness-signal" data-level={level}>
      <span aria-hidden="true" className="tls-preparation-fitness-dot" />
      <span>{formatFitnessPercent(fitness, text)}</span>
    </span>
  );
}

/** Shows only meaningful selection states; available players remain visually quiet. */
function SquadStatusMarker({
  status,
  text,
}: Readonly<{ status: TacticalSquadStatus; text: Translator }>): React.JSX.Element | null {
  if (status === "available") {
    return null;
  }

  const label = text(squadStatusLabelKey(status));

  return (
    <span aria-label={label} className="tls-preparation-squad-status" data-status={status} title={label}>
      <span aria-hidden="true" className="tls-preparation-squad-status-glyph" />
    </span>
  );
}

/** Maps a compact department filter to its localized label. */
function squadFilterLabelKey(
  filter: SquadSelectionFilter,
):
  | "career.matchPreparation.squadFilter.all"
  | "career.matchPreparation.squadFilter.goalkeeper"
  | "career.matchPreparation.squadFilter.defender"
  | "career.matchPreparation.squadFilter.midfielder"
  | "career.matchPreparation.squadFilter.attacker" {
  return `career.matchPreparation.squadFilter.${filter}`;
}

/** Compares two squad rows by one visible squad-list fact. */
function compareSquadRows(
  left: SquadSelectionRow,
  right: SquadSelectionRow,
  sortKey: SquadSelectionSortKey,
): number {
  if (sortKey === "age") {
    return compareOptionalNumbers(left.age, right.age) || compareByPlayerIdentity(left, right);
  }

  if (sortKey === "fitness") {
    return compareOptionalNumbers(left.player.fitness, right.player.fitness) || compareByPlayerIdentity(left, right);
  }

  if (sortKey === "name") {
    return compareByPlayerIdentity(left, right);
  }

  if (sortKey === "role") {
    return comparePlayerOptionsByPosition(left.player, right.player) || compareByPlayerIdentity(left, right);
  }

  return statusSortIndex(left.status) - statusSortIndex(right.status) || compareByPlayerIdentity(left, right);
}

/** Compares optional numeric facts while keeping unknown values at the end. */
function compareOptionalNumbers(left: number | undefined, right: number | undefined): number {
  if (left === undefined && right === undefined) {
    return 0;
  }

  if (left === undefined) {
    return 1;
  }

  if (right === undefined) {
    return -1;
  }

  return left - right;
}

/** Uses player name and stable id as a deterministic final row tie-breaker. */
function compareByPlayerIdentity(left: SquadSelectionRow, right: SquadSelectionRow): number {
  return left.player.name.localeCompare(right.player.name) || left.player.playerId.localeCompare(right.player.playerId);
}

/** Keeps XI and bench selections before available players when sorting status. */
function statusSortIndex(status: TacticalSquadStatus): number {
  return status === "selected" ? 0 : status === "bench" ? 1 : 2;
}
