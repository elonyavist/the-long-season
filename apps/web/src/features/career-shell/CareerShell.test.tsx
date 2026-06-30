import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { buildCareerInboxView, buildCareerShellView } from "@game/ui";

import { createWebTranslator } from "../../app/translation";
import { CareerShell } from "./CareerShell";

describe("CareerShell", () => {
  it("returns the career shell element with central content", () => {
    const element = CareerShell({
      shellView: buildCareerShellView({
        activeSectionKey: "dashboard",
        inboxView: buildCareerInboxView([]),
      }),
      selectedClubName: "S.S. Perugia",
      text: createWebTranslator("en"),
      onBackToMenu: () => undefined,
      onContinueCareer: () => undefined,
      onInboxActionClick: () => undefined,
      children: "central",
    });

    expect(element.props["data-testid"]).toBe("career-shell");
  });

  it("renders disabled future sections as non-button navigation text", () => {
    const html = renderToStaticMarkup(
      <CareerShell
        shellView={buildCareerShellView({
          activeSectionKey: "dashboard",
          inboxView: buildCareerInboxView([]),
        })}
        selectedClubName="S.S. Perugia"
        text={createWebTranslator("en")}
        onBackToMenu={() => undefined}
        onContinueCareer={() => undefined}
        onInboxActionClick={() => undefined}
      >
        central
      </CareerShell>,
    );

    expect(html).toContain("aria-disabled=\"true\"");
    expect(html).toContain("Squad - Available in a later phase");
    expect(html).not.toContain("disabled=\"\"");
  });

  it("can render a matchday shell without Inbox/Posta and global Continue", () => {
    const html = renderToStaticMarkup(
      <CareerShell
        shellView={buildCareerShellView({
          activeSectionKey: "fixtures",
          inboxView: buildCareerInboxView([]),
          mode: "matchday",
        })}
        selectedClubName="S.S. Perugia"
        text={createWebTranslator("en")}
        onBackToMenu={() => undefined}
        onContinueCareer={() => undefined}
        onInboxActionClick={() => undefined}
      >
        match centre
      </CareerShell>,
    );

    expect(html).toContain("data-shell-mode=\"matchday\"");
    expect(html).not.toContain("tls-career-shell-inbox-rail");
    expect(html).not.toContain(">Continue</button>");
    expect(html).toContain("match centre");
  });

  it("can render a preparation shell without global Continue while keeping Inbox/Posta", () => {
    const html = renderToStaticMarkup(
      <CareerShell
        shellView={buildCareerShellView({
          activeSectionKey: "dashboard",
          inboxView: buildCareerInboxView([]),
          mode: "preparation",
        })}
        selectedClubName="S.S. Perugia"
        text={createWebTranslator("en")}
        onBackToMenu={() => undefined}
        onContinueCareer={() => undefined}
        onInboxActionClick={() => undefined}
      >
        preparation
      </CareerShell>,
    );

    expect(html).toContain("data-shell-mode=\"preparation\"");
    expect(html).toContain("tls-career-shell-inbox-rail");
    expect(html).not.toContain(">Continue</button>");
  });
});
