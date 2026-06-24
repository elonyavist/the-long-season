import { useMemo, useState } from "react";
import type React from "react";

import type { Translator } from "@game/i18n";

import type { WebPlayerPositionOption } from "../lib/player-position-ordering";
import { comparePlayerOptionsByPosition } from "../lib/player-position-ordering";
import {
  formatFitness,
  formatFoot,
  formatOptionalNumber,
  roleLabelKey,
  squadStatusLabelKey,
  type TacticalPlayerFoot,
  type TacticalSquadStatus,
} from "../lib/match-preparation-labels";

type SquadSelectionSortKey = "name" | "role" | "age" | "fitness" | "foot" | "status";
type SquadSelectionSortDirection = "ascending" | "descending";

interface SquadSelectionSort {
  readonly key: SquadSelectionSortKey;
  readonly direction: SquadSelectionSortDirection;
}

/** Player facts needed by reusable squad-picking tables. */
export interface SquadSelectionPlayer extends WebPlayerPositionOption {
  /** Current fitness, when the underlying view exposes it. */
  readonly fitness?: number;
}

/** One row in a reusable squad-picking table. */
export interface SquadSelectionRow {
  /** Stable player option used for sorting and selection. */
  readonly player: SquadSelectionPlayer;
  /** Current age when known. */
  readonly age?: number;
  /** Preferred foot when known. */
  readonly foot?: TacticalPlayerFoot;
  /** Whether the player is already selected in the current lineup. */
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

/** Renders a fixed-height, sortable squad list for lineup and tactics workflows. */
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
  const sortedRows = useMemo(() => sortSquadRows(rows, squadSort), [rows, squadSort]);

  return (
    <section className="tls-preparation-squad-list">
      <h3 id="match-preparation-squad-title">{text("career.matchPreparation.squadList")}</h3>
      <div className="tls-preparation-squad-table-wrap">
        <table className="tls-preparation-squad-table">
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
                onSortChange={setSquadSort}
              />
              <SortableSquadHeader
                activeSort={squadSort}
                label={text("career.matchPreparation.column.foot")}
                sortKey="foot"
                onSortChange={setSquadSort}
              />
              <SortableSquadHeader
                activeSort={squadSort}
                label={text("career.matchPreparation.column.status")}
                sortKey="status"
                onSortChange={setSquadSort}
              />
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row) => (
              <tr data-status={row.status} key={row.player.playerId}>
                <td>
                  <button
                    aria-pressed={selectedPlayerId === row.player.playerId}
                    className="tls-preparation-squad-player"
                    type="button"
                    onClick={() => {
                      onPlayerSelect(row.player.playerId);
                    }}
                  >
                    {row.player.name}
                  </button>
                </td>
                <td>{text(roleLabelKey(row.player.roleKey))}</td>
                <td>{formatOptionalNumber(row.age, text)}</td>
                <td>{formatFitness(row.player.fitness, text)}</td>
                <td>{formatFoot(row.foot, text)}</td>
                <td>{text(squadStatusLabelKey(row.status))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/** Renders an accessible sortable squad-table header cell. */
function SortableSquadHeader({
  activeSort,
  label,
  sortKey,
  onSortChange,
}: Readonly<{
  activeSort: SquadSelectionSort;
  label: string;
  sortKey: SquadSelectionSortKey;
  onSortChange: (sort: SquadSelectionSort) => void;
}>): React.JSX.Element {
  const isActive = activeSort.key === sortKey;
  const nextDirection: SquadSelectionSortDirection =
    isActive && activeSort.direction === "ascending" ? "descending" : "ascending";

  return (
    <th aria-sort={isActive ? activeSort.direction : undefined} scope="col">
      <button
        className="tls-preparation-squad-sort"
        type="button"
        onClick={() => {
          onSortChange({ key: sortKey, direction: nextDirection });
        }}
      >
        <span>{label}</span>
        <span aria-hidden="true">{isActive && activeSort.direction === "descending" ? "v" : "^"}</span>
      </button>
    </th>
  );
}

/** Sorts the squad table by the current visible manager column. */
function sortSquadRows(
  rows: readonly SquadSelectionRow[],
  sort: SquadSelectionSort,
): readonly SquadSelectionRow[] {
  const direction = sort.direction === "ascending" ? 1 : -1;

  return [...rows].sort((left, right) => compareSquadRows(left, right, sort.key) * direction);
}

/** Compares two squad rows by one visible squad-list fact. */
function compareSquadRows(
  left: SquadSelectionRow,
  right: SquadSelectionRow,
  sortKey: SquadSelectionSortKey,
): number {
  if (sortKey === "age") {
    return compareNumbers(left.age, right.age);
  }

  if (sortKey === "fitness") {
    return compareNumbers(left.player.fitness, right.player.fitness);
  }

  if (sortKey === "name") {
    return left.player.name.localeCompare(right.player.name);
  }

  if (sortKey === "role") {
    return comparePlayerOptionsByPosition(left.player, right.player);
  }

  if (sortKey === "foot") {
    return String(left.foot ?? "").localeCompare(String(right.foot ?? "")) || left.player.name.localeCompare(right.player.name);
  }

  return left.status.localeCompare(right.status) || left.player.name.localeCompare(right.player.name);
}

/** Compares optional numeric facts while keeping unknown values at the end. */
function compareNumbers(left: number | undefined, right: number | undefined): number {
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
