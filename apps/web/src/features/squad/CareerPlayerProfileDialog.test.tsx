import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { playerValuationConfig } from "@game/content";

import { createWebTranslator } from "../../app/translation";
import { createTestCareerFixture } from "../../test-fixtures/career-fixture";
import { previewCareerContractOffer, presentCareerSquad } from "./career-squad-adapter";
import { CareerPlayerProfileDialog } from "./CareerPlayerProfileDialog";

describe("CareerPlayerProfileDialog", () => {
  it("renders the compact three-tab profile with truthful role-aware facts", () => {
    const fixture = createTestCareerFixture("player-profile-dialog");
    const presentation = presentCareerSquad(fixture.career, fixture.draft, playerValuationConfig);

    expect(presentation.status).toBe("ready");
    if (presentation.status !== "ready") return;
    const player = presentation.players[0];
    const profile = player === undefined
      ? undefined
      : presentation.profilesByPlayerId.get(player.playerId);
    expect(profile).toBeDefined();

    const markup = renderToStaticMarkup(
      <CareerPlayerProfileDialog
        profile={profile}
        language="en"
        contractCommandPending={false}
        text={createWebTranslator("en")}
        previewContractOffer={(playerId, terms) => (
          previewCareerContractOffer(fixture.career, playerId, terms)
        )}
        onContractCommand={async () => undefined}
        onClose={() => undefined}
      />,
    );

    expect(markup).toContain("Player summary");
    expect(markup).toContain('aria-label="Natural and adapted positions"');
    expect(markup.match(/role="tab"/g)).toHaveLength(3);
    expect(markup).toContain("Attributes");
    expect(markup).toContain("Statistics");
    expect(markup).toContain("Current season");
    expect(markup).toContain("Career");
    expect(markup).toContain("Complete data");
    expect(markup).toContain("Active contract");
    expect(markup).toContain("Annual wage");
    expect(markup).toContain("Club finances");
    expect(markup).toContain("Open renewal talks");
    expect(markup.match(/class="tls-player-attribute-group"/g)).toHaveLength(3);
    expect(markup).toContain('data-family="goalkeeping"');
    expect(markup).not.toContain('data-family="technical"');
    expect(markup).not.toContain('data-suitability="weak"');
    expect(markup).not.toContain("Monthly wage");
    expect(markup).not.toContain("potentialAbility");
    expect(markup).not.toContain("currentAbility");
  });

  it("uses accessible tabs and keeps the canonical contract workspace mounted", () => {
    const fixture = createTestCareerFixture("player-profile-accessibility");
    const presentation = presentCareerSquad(fixture.career, fixture.draft, playerValuationConfig);

    expect(presentation.status).toBe("ready");
    if (presentation.status !== "ready") return;
    const profile = presentation.players[0] === undefined
      ? undefined
      : presentation.profilesByPlayerId.get(presentation.players[0].playerId);

    const markup = renderToStaticMarkup(
      <CareerPlayerProfileDialog
        profile={profile}
        language="en"
        contractCommandPending={false}
        text={createWebTranslator("en")}
        previewContractOffer={(playerId, terms) => (
          previewCareerContractOffer(fixture.career, playerId, terms)
        )}
        onContractCommand={async () => undefined}
        onClose={() => undefined}
      />,
    );

    expect(markup).toContain("<dialog");
    expect(markup).toContain('aria-labelledby="career-player-profile-title"');
    expect(markup).toContain('aria-label="Close player profile"');
    expect(markup).toContain('aria-label="Player profile sections"');
    expect(markup).toContain('role="tablist"');
    expect(markup).toContain('aria-selected="true"');
    expect(markup).toMatch(/hidden=""[^>]*role="tabpanel"[^>]*>[\s\S]*tls-contract-workspace/);
    expect(markup).toContain("tls-menu-button tls-menu-button-primary tls-contract-primary-action");
  });
});
