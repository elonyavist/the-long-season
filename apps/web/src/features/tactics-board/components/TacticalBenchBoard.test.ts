import { renderToStaticMarkup } from "react-dom/server";
import React from "react";
import { describe, expect, it } from "vitest";

import { translate } from "@game/i18n";

import {
  createEmptyTacticalBenchSlots,
  type TacticalBenchPlayer,
  type TacticalBenchSlotView,
} from "../tactical-board-bench";
import type { TacticalBenchBoardCandidate } from "./TacticalBenchBoard";
import { TacticalBenchBoard } from "./TacticalBenchBoard";

describe("TacticalBenchBoard", () => {
  it("renders eight fixed empty substitute slots with plus tokens", () => {
    const markup = renderToStaticMarkup(benchBoardElement(createEmptyTacticalBenchSlots(), 0));

    expect(markup).toContain("tls-tactical-bench-board");
    expect(markup.match(/class="tls-tactical-bench-slot"/g)?.length).toBe(8);
    expect(markup.split("tls-tactical-bench-empty-plus").length - 1).toBe(8);
    expect(markup).toContain("Substitutes");
  });

  it("renders filled substitute facts without exposing candidate controls", () => {
    const markup = renderToStaticMarkup(benchBoardElement(filledBenchSlots(), 1));

    expect(markup).toContain("12");
    expect(markup).toContain("Esposito");
    expect(markup).toContain("POR");
    expect(markup).not.toContain("tls-player-candidate-row");
  });

  it("renders each fixed slot as an accessible button", () => {
    const markup = renderToStaticMarkup(benchBoardElement(createEmptyTacticalBenchSlots(), 0));

    expect(markup.split("<button").length - 1).toBe(8);
    expect(markup).toContain("aria-label=\"S1 Empty substitute slot\"");
    expect(markup).toContain("data-slot-id=\"bench:08\"");
  });

  it("renders sorted available candidates for an open empty slot", () => {
    const markup = renderToStaticMarkup(
      benchBoardElement(createEmptyTacticalBenchSlots(), 0, {
        availablePlayers: [
          benchCandidate("player:low", "Bianchi", "midfielder", "cm", 65, 100),
          benchCandidate("player:excluded", "Rossi", "defender", "cb", 99, 100),
          benchCandidate("player:best", "Abate", "attacker", "st", 80, 90),
        ],
        excludedPlayerIds: ["player:excluded"],
        openSlotId: "bench:01",
      }),
    );

    expect(markup).toContain("tls-tactical-board-menu");
    expect(markup).toContain("tls-player-candidate-row");
    expect(markup.indexOf("Abate")).toBeLessThan(markup.indexOf("Bianchi"));
    expect(markup).not.toContain("Rossi");
    expect(markup).not.toContain("Remove from bench");
  });

  it("renders only remove action for an open filled slot", () => {
    const markup = renderToStaticMarkup(
      benchBoardElement(filledBenchSlots(), 1, {
        availablePlayers: [benchCandidate("player:best", "Abate", "attacker", "st", 80, 90)],
        openSlotId: "bench:01",
      }),
    );

    expect(markup).toContain("Remove from bench");
    expect(markup).not.toContain("tls-player-candidate-row");
  });
});

interface BenchBoardTestOptions {
  readonly availablePlayers?: readonly TacticalBenchBoardCandidate[];
  readonly excludedPlayerIds?: readonly string[];
  readonly openSlotId?: TacticalBenchSlotView["slotId"];
}

function benchBoardElement(
  slots: readonly TacticalBenchSlotView[],
  selectedSlotCount: number,
  options: BenchBoardTestOptions = {},
): React.ReactElement {
  return React.createElement(TacticalBenchBoard, {
    ...(options.availablePlayers === undefined ? {} : { availablePlayers: options.availablePlayers }),
    ...(options.excludedPlayerIds === undefined ? {} : { excludedPlayerIds: options.excludedPlayerIds }),
    ...(options.openSlotId === undefined ? {} : { openSlotId: options.openSlotId }),
    onAssign: () => {},
    onRemove: () => {},
    requiredSlotCount: 8,
    selectedSlotCount,
    slots,
    text: (key, variables) => translate("en", key, variables),
  });
}

function benchCandidate(
  playerId: string,
  surname: string,
  roleKey: string,
  positionKey: string,
  currentAbility: number,
  fitness: number,
): TacticalBenchBoardCandidate {
  const roleCodeByRole: Readonly<Record<string, TacticalBenchPlayer["roleCode"]>> = {
    attacker: "ATT",
    defender: "DC",
    goalkeeper: "POR",
    midfielder: "CC",
  };

  return {
    playerId,
    number: currentAbility,
    surname,
    roleCode: roleCodeByRole[roleKey] ?? "CC",
    roleKey,
    positionKey,
    currentAbility,
    fitness,
  };
}

function filledBenchSlots(): readonly TacticalBenchSlotView[] {
  const [firstSlot, ...remainingSlots] = createEmptyTacticalBenchSlots();

  if (firstSlot === undefined) {
    return [];
  }

  return [
    {
      ...firstSlot,
      status: "valid",
      player: {
        playerId: "player:demo-12",
        number: 12,
        surname: "Esposito",
        roleCode: "POR",
      },
    },
    ...remainingSlots,
  ];
}
