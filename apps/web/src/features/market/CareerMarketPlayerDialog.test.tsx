/**
 * Focused renderer coverage for the shared three-tab Market player workspace.
 */
import {
  buildCareerMarketView,
  type CareerMarketTargetDetailView,
} from "@game/ui";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { askingPriceCurves, playerValuationConfig } from "@game/content";

import { createWebTranslator } from "../../app/translation";
import { createTestCareerFixture } from "../../test-fixtures/career-fixture";
import { presentCareerMarket } from "./career-market-adapter";
import {
  CareerMarketPlayerDialog,
  marketOfferDraftIdentity,
  resetMarketPlayerProfileTabForPlayer,
  resolveMarketPlayerProfileTab,
} from "./CareerMarketPlayerDialog";

describe("CareerMarketPlayerDialog", () => {
  it("keeps the canonical offer flow mounted behind three accessible tabs", () => {
    const detail = resolveFixtureDetail(
      "market-player-dialog-goalkeeper",
      (candidate) => (
        candidate.primaryRole === "goalkeeper"
        && candidate.employment.status === "contracted"
      ),
    );
    const actionableDetail: CareerMarketTargetDetailView = {
      ...detail,
      eligibility: {
        status: "allowed",
        action: "submit_transfer_offer",
      },
    };
    const markup = renderDialog(actionableDetail);

    expect(markup.match(/role="tab"/g)).toHaveLength(3);
    expect(markup.match(/role="tabpanel"/g)).toHaveLength(3);
    expect(markup).toContain('aria-label="Player profile sections"');
    expect(markup).toContain(">Attributes<");
    expect(markup).toContain(">Statistics<");
    expect(markup).toContain(">Contract and offer<");
    expect(markup).toContain(
      `data-market-draft-owner="${marketOfferDraftIdentity(actionableDetail.playerId)}"`,
    );

    const draftOwnerIndex = markup.indexOf("data-market-draft-owner=");
    const contractPanelIndex = markup.lastIndexOf("<div aria-labelledby=", draftOwnerIndex);
    expect(markup.slice(contractPanelIndex, draftOwnerIndex)).toContain('hidden=""');
    expect(markup.slice(draftOwnerIndex)).toContain("tls-contract-form");
    expect(markup.slice(draftOwnerIndex)).toContain("Offered fee");
    expect(markup.slice(draftOwnerIndex)).toContain("Contract expires");
  });

  it("shows only natural/adapted roles and goalkeeper-specific exact facts", () => {
    const detail = resolveFixtureDetail(
      "market-player-dialog-goalkeeper-facts",
      (candidate) => candidate.primaryRole === "goalkeeper",
    );
    const markup = renderDialog(detail);

    expect(markup).toContain('aria-label="Natural and adapted positions"');
    expect(markup).not.toContain('data-suitability="weak"');
    expect(markup.match(/class="tls-player-attribute-group"/g)).toHaveLength(3);
    expect(markup).toContain('data-family="goalkeeping"');
    expect(markup).toContain('data-family="mental"');
    expect(markup).toContain('data-family="physical"');
    expect(markup).not.toContain('data-family="technical"');
    expect(markup).toContain(">Current season<");
    expect(markup).toContain(">Career<");
    expect(markup).toContain(">Participation<");
    expect(markup).toContain(">Match events<");
    expect(markup).toContain(">Saves<");
  });

  it("keeps outfield attributes and statistics free from goalkeeper-only facts", () => {
    const detail = resolveFixtureDetail(
      "market-player-dialog-outfield-facts",
      (candidate) => candidate.primaryRole !== "goalkeeper",
    );
    const markup = renderDialog(detail);

    expect(markup.match(/class="tls-player-attribute-group"/g)).toHaveLength(3);
    expect(markup).toContain('data-family="technical"');
    expect(markup).toContain('data-family="mental"');
    expect(markup).toContain('data-family="physical"');
    expect(markup).not.toContain('data-family="goalkeeping"');
    expect(markup).not.toContain(">Saves<");
  });

  it("presents public money through the shared exact locale formatter", () => {
    const detail = resolveFixtureDetail(
      "market-player-dialog-money",
      (candidate) => candidate.employment.status === "contracted",
    );
    const english = renderDialog(detail, "en");
    const italian = renderDialog(detail, "it").replace(/\u00a0/g, " ");
    const publicValue = detail.publicValue;
    const wholeUnits = Math.round(publicValue / 100);

    expect(english).toContain(`€${wholeUnits.toLocaleString("en-US")}`);
    expect(italian).toContain(`${wholeUnits.toLocaleString("de-DE")} €`);
    // Exact whole units only: no compact notation and no manual concatenation.
    expect(english).not.toMatch(/€\d+(\.\d+)?[KM]/);
  });

  it("keeps every editable money field locale-aware instead of a raw number input", () => {
    const detail = resolveFixtureDetail(
      "market-player-dialog-editable-money",
      (candidate) => candidate.employment.status === "contracted",
    );
    const markup = renderDialog({
      ...detail,
      eligibility: { status: "allowed", action: "submit_transfer_offer" },
    });

    expect(markup).toMatch(/inputmode="decimal"/i);
    expect(markup).not.toContain('type="number"');
  });

  it("keeps the offer workspace out of backdrop dismissal", () => {
    const detail = resolveFixtureDetail(
      "market-player-dialog-draft-stability",
      (candidate) => candidate.employment.status === "contracted",
    );

    expect(renderDialog(detail)).toContain('data-backdrop-dismiss="false"');
  });

  it("preserves tab and draft identity only for the same player", () => {
    const state = {
      playerId: "player:a",
      activeTabId: "contract" as const,
    };

    expect(resolveMarketPlayerProfileTab("player:a", state)).toBe("contract");
    expect(resolveMarketPlayerProfileTab("player:b", state)).toBe("attributes");
    expect(resolveMarketPlayerProfileTab(undefined, state)).toBe("attributes");
    const changedPlayerState = resetMarketPlayerProfileTabForPlayer("player:b", state);
    expect(changedPlayerState).toEqual({
      playerId: "player:b",
      activeTabId: "attributes",
    });
    expect(resetMarketPlayerProfileTabForPlayer(undefined, changedPlayerState)).toBe(
      changedPlayerState,
    );
    expect(resetMarketPlayerProfileTabForPlayer("player:a", changedPlayerState)).toEqual({
      playerId: "player:a",
      activeTabId: "attributes",
    });
    expect(marketOfferDraftIdentity("player:a")).toBe(
      marketOfferDraftIdentity("player:a"),
    );
    expect(marketOfferDraftIdentity("player:a")).not.toBe(
      marketOfferDraftIdentity("player:b"),
    );
  });
});

/** Resolves one expensive detail through the same lazy catalog seam as Market. */
function resolveFixtureDetail(
  seed: string,
  predicate: (detail: CareerMarketTargetDetailView) => boolean,
): CareerMarketTargetDetailView {
  const fixture = createTestCareerFixture(seed);
  const view = buildCareerMarketView(
    presentCareerMarket(fixture.career, playerValuationConfig, askingPriceCurves),
  );
  expect(view.status).toBe("ready");
  if (view.status !== "ready") throw new Error("Expected a ready Market fixture");

  for (const row of view.targets.rows) {
    const detail = view.targets.resolveDetail(row.playerId);
    if (detail !== undefined && predicate(detail)) return detail;
  }
  throw new Error("Expected the fixture to contain a matching Market target");
}

/** Renders one target without invoking the draft preview until the user types. */
function renderDialog(
  detail: CareerMarketTargetDetailView,
  language: "en" | "it" = "en",
): string {
  return renderToStaticMarkup(
    <CareerMarketPlayerDialog
      detail={detail}
      language={language}
      marketCommandPending={false}
      negotiation={undefined}
      text={createWebTranslator(language)}
      previewOffer={() => {
        throw new Error("Static dialog rendering must not preview an empty draft");
      }}
      onClose={() => undefined}
      onMarketCommand={async () => undefined}
    />,
  );
}
