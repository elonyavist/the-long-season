import { createMatchdayAttention, findNextCareerFixture } from "@game/engine";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createWebTranslator } from "../../app/translation";
import {
  buildWebCareerState,
  type WebCareerSaveId,
  type WebCareerState,
} from "../../runtime/web-career-runtime";
import { CareerInboxScreen } from "./CareerInboxScreen";
import { presentCareerInbox } from "./career-inbox-presenter";

describe("CareerInboxScreen", () => {
  it("renders a real Posta list/detail destination with exact filters and football facts", () => {
    const career = careerWithMatchdayMessage();
    const presentation = presentCareerInbox({ careerState: career, activeFilter: "all" });
    const selectedClubName = career.gameState.clubs[career.selectedClubId]?.name ?? "";
    const html = renderToStaticMarkup(
      <CareerInboxScreen
        selectedClubName={selectedClubName}
        currentDateIso="2026-08-01"
        postaView={presentation.postaView}
        railView={presentation.railView}
        text={createWebTranslator("en")}
        onBackToMenu={() => undefined}
        onNavigate={() => undefined}
        onContinueCareer={() => undefined}
        onFilterChange={() => undefined}
        onMessageSelect={() => undefined}
        onPrimaryAction={() => undefined}
      />,
    );

    expect(html).toContain('id="career-inbox-heading"');
    expect(html).toContain("All");
    expect(html).toContain("To handle");
    expect(html).toContain("Unread");
    expect(html).toContain("Matchday");
    expect(html).toContain("Technical staff");
    expect(html).toContain("Prepare match");
    expect(html).toContain('aria-current="true"');
    expect(html).toContain('data-narrow-detail="false"');
    expect(html).not.toContain('class="tls-app-shell-posta"');
    expect(html).not.toContain('class="tls-app-shell-right-rail"');
    expect(html).not.toContain("fixture:");
  });

  it("locks route interactions while one career command is pending", () => {
    const career = careerWithMatchdayMessage();
    const presentation = presentCareerInbox({ careerState: career, activeFilter: "all" });
    const html = renderToStaticMarkup(
      <CareerInboxScreen
        selectedClubName="S.S. Perugia"
        currentDateIso="2026-08-01"
        postaView={presentation.postaView}
        railView={presentation.railView}
        commandActivity={{
          commandId: "open_inbox_message",
          status: "pending",
          statusLabelKey: "career.command.openingInbox",
        }}
        text={createWebTranslator("en")}
        onBackToMenu={() => undefined}
        onNavigate={() => undefined}
        onContinueCareer={() => undefined}
        onFilterChange={() => undefined}
        onMessageSelect={() => undefined}
        onPrimaryAction={() => undefined}
      />,
    );

    expect(html).toContain('data-state="pending"');
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain('class="tls-inbox-workspace"');
    expect(html).toContain('data-narrow-detail="false"');
    expect(html).toContain('data-motion-view="list"');
    expect(html).toContain('inert=""');
    expect(html).toContain('disabled=""');
  });

  it("marks one newly delivered important decision for bounded presentation only", () => {
    const career = careerWithMatchdayMessage();
    const presentation = presentCareerInbox({ careerState: career, activeFilter: "all" });
    const selectedMessageId = presentation.postaView.selectedMessageId;
    if (selectedMessageId === undefined) throw new Error("Expected selected Posta message");

    const html = renderToStaticMarkup(
      <CareerInboxScreen
        selectedClubName="S.S. Perugia"
        currentDateIso="2026-08-01"
        postaView={presentation.postaView}
        railView={presentation.railView}
        arrivalMessageId={selectedMessageId}
        text={createWebTranslator("en")}
        onBackToMenu={() => undefined}
        onNavigate={() => undefined}
        onContinueCareer={() => undefined}
        onFilterChange={() => undefined}
        onMessageSelect={() => undefined}
        onPrimaryAction={() => undefined}
      />,
    );

    expect(html).toContain('data-attention-arrival="true"');
    expect(html).toContain('data-motion-view="list"');
  });

  it("renders an explicit empty detail when the active filter has no messages", () => {
    const career = careerWithMatchdayMessage();
    const readMessage = career.currentSeasonInbox?.[0];
    if (readMessage === undefined) throw new Error("Expected matchday message");
    const readCareer: WebCareerState = {
      ...career,
      currentSeasonInbox: [{
        ...readMessage,
        lifecycle: { ...readMessage.lifecycle, read: true },
      }],
    };
    const presentation = presentCareerInbox({ careerState: readCareer, activeFilter: "unread" });

    const html = renderToStaticMarkup(
      <CareerInboxScreen
        selectedClubName="S.S. Perugia"
        currentDateIso="2026-08-01"
        postaView={presentation.postaView}
        railView={presentation.railView}
        text={createWebTranslator("en")}
        onBackToMenu={() => undefined}
        onNavigate={() => undefined}
        onContinueCareer={() => undefined}
        onFilterChange={() => undefined}
        onMessageSelect={() => undefined}
        onPrimaryAction={() => undefined}
      />,
    );

    expect(html).toContain("No messages match this filter.");
    expect(html).toContain("Select a message to read its football details.");
  });
});

function careerWithMatchdayMessage(): WebCareerState {
  const career = buildWebCareerState({
    saveId: "save:posta-screen" as WebCareerSaveId,
    worldSeed: "posta-screen-seed",
  });
  const nextFixture = findNextCareerFixture(career);
  if (nextFixture.status !== "found") throw new Error("Expected selected-club fixture");
  const message = createMatchdayAttention({
    fixtureId: nextFixture.fixture.id,
    clubId: career.selectedClubId,
    date: nextFixture.fixture.date,
    preparation: {
      hasSavedLineup: false,
      hasSavedTactic: false,
      hasCompleteBench: false,
      hasBenchGoalkeeper: false,
    },
  }).message;

  return { ...career, currentSeasonInbox: [message] };
}
