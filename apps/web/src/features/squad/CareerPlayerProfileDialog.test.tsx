import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createWebTranslator } from "../../app/translation";
import { createTestCareerFixture } from "../../test-fixtures/career-fixture";
import { previewCareerContractOffer, presentCareerSquad } from "./career-squad-adapter";
import { CareerPlayerProfileDialog } from "./CareerPlayerProfileDialog";

describe("CareerPlayerProfileDialog", () => {
  it("renders one complete football and annual-contract profile without hidden aggregates", () => {
    const fixture = createTestCareerFixture("player-profile-dialog");
    const presentation = presentCareerSquad(fixture.career, fixture.draft);

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
    expect(markup).toContain("Position suitability");
    expect(markup).toContain("Attributes");
    expect(markup).toContain("Active contract");
    expect(markup).toContain("Annual wage");
    expect(markup).toContain("Club finances");
    expect(markup).toContain("Open renewal talks");
    expect(markup).not.toContain("Monthly wage");
    expect(markup).not.toContain("potentialAbility");
    expect(markup).not.toContain("currentAbility");
  });

  it("uses accessible dialog semantics and the canonical command treatment", () => {
    const fixture = createTestCareerFixture("player-profile-accessibility");
    const presentation = presentCareerSquad(fixture.career, fixture.draft);

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
    expect(markup).toContain("tls-menu-button tls-menu-button-primary tls-contract-primary-action");
  });
});
