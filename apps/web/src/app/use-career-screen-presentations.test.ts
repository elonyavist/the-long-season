import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  useCareerScreenPresentations,
  type CareerScreenPresentationInput,
  type CareerScreenPresentations,
} from "./use-career-screen-presentations";
import { createMatchPreparationDraft } from "../features/match-preparation/match-preparation-adapter";
import { createWebMatchdayState } from "../features/matchday/matchday-adapter";
import { createTestCareerFixture } from "../test-fixtures/career-fixture";
import { inspectWebCareerAttention } from "../runtime/web-career-runtime";

describe("useCareerScreenPresentations", () => {
  it("derives every current read model from one loaded career snapshot", () => {
    const fixture = createTestCareerFixture("screen-presentations");
    const input: CareerScreenPresentationInput = {
      activeCareerState: fixture.career,
      continueResult: inspectWebCareerAttention(fixture.career),
      inboxFilter: "all",
      matchPreparationState: createMatchPreparationDraft(fixture.career),
      matchdayState: createWebMatchdayState(fixture.career),
    };
    let result: CareerScreenPresentations | undefined;

    renderToStaticMarkup(createElement(HookProbe, {
      input,
      onResult: (value) => { result = value; },
    }));

    const selectedClubName = fixture.career.gameState.clubs[fixture.career.selectedClubId]?.name;
    expect(result?.dashboard?.view.selectedClub.name).toBe(selectedClubName);
    expect(result?.inbox?.postaView).toBeDefined();
    expect(result?.matchPreparation?.selectedClub.name).toBe(selectedClubName);
    expect(result?.tacticalBoardPlayers).toHaveLength(22);
    expect(result?.matchPreparationPlayerFactsById.size).toBe(22);
    expect(result?.matchday).toBeDefined();
    expect(result?.matchdayPhase).toBeDefined();
    expect(result?.halfTimeSubstitutions).toBeDefined();
  });

  it("returns only stable empty collections before a career is loaded", () => {
    let result: CareerScreenPresentations | undefined;
    renderToStaticMarkup(createElement(HookProbe, {
      input: { inboxFilter: "all" },
      onResult: (value) => { result = value; },
    }));

    expect(result).toEqual({
      tacticalBoardPlayers: [],
      matchPreparationPlayerFactsById: new Map(),
    });
  });
});

function HookProbe({
  input,
  onResult,
}: Readonly<{
  input: CareerScreenPresentationInput;
  onResult: (result: CareerScreenPresentations) => void;
}>): React.JSX.Element {
  onResult(useCareerScreenPresentations(input));
  return createElement("span", undefined, "presentation-probe");
}
