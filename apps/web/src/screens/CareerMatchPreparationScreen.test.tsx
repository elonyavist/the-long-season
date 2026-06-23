import { describe, expect, it } from "vitest";

import { createWebTranslator } from "../app/translation";
import {
  buildDemoMatchPreparationView,
  createInitialDemoMatchPreparationState,
} from "../career/match-preparation-demo";
import { CareerMatchPreparationScreen } from "./CareerMatchPreparationScreen";

describe("CareerMatchPreparationScreen", () => {
  it("returns the editable match-preparation screen element", () => {
    const element = CareerMatchPreparationScreen({
      view: buildDemoMatchPreparationView(createInitialDemoMatchPreparationState()),
      text: createWebTranslator("en"),
      onBackToMenu: () => undefined,
      onBackToDashboard: () => undefined,
      onContinueCareer: () => undefined,
      onInboxActionClick: () => undefined,
      onLineupPlayerChange: () => undefined,
      onTacticProfileChange: () => undefined,
      onSavePreparation: () => undefined,
    });

    expect(element.props.selectedClubName).toBe("S.S. Perugia");
    expect(element.props.children.props.className).toContain("tls-preparation-panel");
  });
});
