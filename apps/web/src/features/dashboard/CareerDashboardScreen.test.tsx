import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createWebTranslator } from "../../app/translation";
import { buildDemoCareerDashboard } from "./build-demo-career-dashboard";
import { CareerDashboardScreen } from "./CareerDashboardScreen";
import { presentCareerDashboard } from "./career-dashboard-presenter";

describe("CareerDashboardScreen", () => {
  it("renders the dashboard as a command centre with one obvious primary action", () => {
    const html = renderToStaticMarkup(
      <CareerDashboardScreen
        presentation={presentCareerDashboard(buildDemoCareerDashboard())}
        text={createWebTranslator("en")}
        onBackToMenu={() => undefined}
        onContinueCareer={() => undefined}
        onOpenMatchday={() => undefined}
        onOpenMatchPreparation={() => undefined}
        onInboxActionClick={() => undefined}
      />,
    );

    expect(html).toContain("Career command centre");
    expect(html).toContain("Dashboard");
    expect(html).toContain("Prepare match");
    expect(html).toContain("Round 1: U.S. Pisa vs S.S. Perugia (away)");
    expect(html).toContain("missing saved lineup");
    expect(html).toContain("missing saved tactic");
    expect(html).not.toContain("fixture:000003");
    expect(html).not.toContain("save:phase49-demo");
    expect(html.match(/tls-menu-button-primary/g)).toHaveLength(1);
  });
});
