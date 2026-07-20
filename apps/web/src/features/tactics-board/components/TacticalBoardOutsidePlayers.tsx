import type { Translator } from "@game/i18n";

import type { TacticalBoardRoleCode } from "../tactical-board-types";

/** Read-only player facts shown outside the active XI and substitute bench. */
export interface TacticalBoardOutsidePlayer {
  readonly playerId: string;
  readonly surname: string;
  readonly roleCode: TacticalBoardRoleCode;
  readonly condition?: number;
  readonly rating?: number;
  readonly reason: "dismissed" | "injured";
}

/** Compact, non-interactive area for dismissed or forced-off players. */
export function TacticalBoardOutsidePlayers({
  players,
  text,
}: Readonly<{
  players: readonly TacticalBoardOutsidePlayer[];
  text: Translator;
}>): React.JSX.Element | null {
  if (players.length === 0) return null;

  return (
    <section className="tls-tactical-board-outside" aria-labelledby="tls-tactical-board-outside-title">
      <h3 id="tls-tactical-board-outside-title">{text("career.matchday.table.status")}</h3>
      <ul>
        {players.map((player) => (
          <li data-reason={player.reason} key={player.playerId}>
            <span aria-hidden="true" className="tls-tactical-board-outside-mark">
              {player.reason === "dismissed" ? "■" : "+"}
            </span>
            <strong>{player.surname}</strong>
            <span>{player.roleCode}</span>
            <span>
              {[
                player.condition === undefined ? "" : `${Math.round(player.condition)}%`,
                player.rating === undefined ? "" : player.rating.toFixed(1),
              ].filter(Boolean).join(" · ")}
            </span>
            <small>
              {text(player.reason === "dismissed"
                ? "career.matchday.event.red_card"
                : "career.matchday.event.injury")}
            </small>
          </li>
        ))}
      </ul>
    </section>
  );
}
