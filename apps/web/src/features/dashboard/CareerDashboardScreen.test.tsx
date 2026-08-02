import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createWebTranslator } from "../../app/translation";
import {
  buildWebCareerState,
  inspectWebCareerAttention,
  type WebCareerSaveId,
} from "../../runtime/web-career-runtime";
import { buildCareerDashboard } from "./build-career-dashboard";
import { CareerDashboardScreen } from "./CareerDashboardScreen";
import { presentCareerDashboard } from "./career-dashboard-presenter";

describe("CareerDashboardScreen", () => {
  it("renders one unprepared decision without technical ids or duplicate diagnostics", () => {
    const career = buildWebCareerState({
      saveId: "save:dashboard-screen" as WebCareerSaveId,
      worldSeed: "dashboard-screen-seed",
    });
    const dashboard = buildCareerDashboard(career);
    const presentation = presentCareerDashboard(dashboard, inspectWebCareerAttention(career));
    const html = renderDashboard(presentation);

    expect(html).toContain("Decision required");
    expect(html).toContain("Development environment");
    expect(html).toMatch(/Very poor|Poor|Limited|Adequate|Good|Very good|Excellent/);
    expect(html).not.toMatch(/(?:0\.92|0\.95|0\.98|1\.00|1\.03|1\.06|1\.10)/);
    expect(html).toContain("Prepare match");
    expect(html).toContain("Round 1:");
    expect(html).toContain("Choose the starting XI");
    expect(html).toContain("Choose the match approach");
    expect(html).toContain('data-task-state="attention"');
    expect(html).toContain('data-motion-key="attention:');
    expect(html.match(/data-motion-key=/g)).toHaveLength(3);
    expect(html).not.toContain(String(dashboard.nextFixture.fixtureId));
    expect(html).not.toContain(String(career.saveId));
    expect(html).not.toContain(String(dashboard.context.currentSeasonId));
    expect(html).not.toContain(">missing<");
    expect(html).not.toContain(">unknown<");
    expect(html).not.toContain(">none<");
    expect(html.match(/tls-menu-button-primary/g)).toHaveLength(1);
    expect(html.match(/Choose the starting XI/g)).toHaveLength(1);
    expect(html).toContain("League table");
    expect(html).toContain("Available after the first completed match.");
    expect(html).toContain("League results");
    expect(html).toContain("Available after the first completed league match.");
    expect(html).not.toContain("Recent results");
    expect(html).not.toContain("Squad readiness");
  });

  it("keeps a ready future fixture focused on Continue and omits unavailable facts", () => {
    const career = buildWebCareerState({
      saveId: "save:dashboard-future-fixture" as WebCareerSaveId,
      worldSeed: "dashboard-future-fixture-seed",
    });
    const base = presentCareerDashboard(buildCareerDashboard(career));
    const presentation = {
      ...base,
      taskState: "ready" as const,
      canAdvanceNextFixture: true,
      primaryBlockers: [],
      view: {
        ...base.view,
        context: { ...base.view.context, currentDateIso: "2026-07-31" },
        preparation: {
          ...base.view.preparation,
          lineupStatus: "available" as const,
          tacticStatus: "available" as const,
          blockerKeys: [],
        },
      },
    };
    const html = renderDashboard(presentation);

    expect(html).toContain("Ready to advance");
    expect(html).toContain(">Continue<");
    expect(html).not.toContain(">Go to match<");
    expect(html).not.toContain("Table context");
    expect(html).not.toContain("Recent match");
    expect(html).toContain('data-task-state="ready"');
    expect(html).toContain('data-motion-key="ready:');
    expect(html.match(/data-motion-key=/g)).toHaveLength(3);
  });
});

function renderDashboard(
  presentation: ReturnType<typeof presentCareerDashboard>,
): string {
  return renderToStaticMarkup(
    <CareerDashboardScreen
      presentation={presentation}
      commandActivity={undefined}
      text={createWebTranslator("en")}
      onBackToMenu={() => undefined}
      onNavigate={() => undefined}
      onContinueCareer={() => undefined}
      onOpenMatchday={() => undefined}
      onOpenMatchPreparation={() => undefined}
      onInboxActionClick={() => undefined}
    />,
  );
}
