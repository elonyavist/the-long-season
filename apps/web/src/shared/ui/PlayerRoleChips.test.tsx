import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { PlayerRoleChips } from "./PlayerRoleChips";

describe("PlayerRoleChips", () => {
  it("renders a compact labelled list of natural and adapted roles", () => {
    const markup = renderToStaticMarkup(
      <PlayerRoleChips
        ariaLabel="Strong positions"
        roles={[
          {
            roleId: "central_midfielder",
            code: "MC",
            label: "Central midfielder",
            suitability: "natural",
            suitabilityLabel: "Natural",
            isPrimary: true,
          },
          {
            roleId: "defensive_midfielder",
            code: "MED",
            label: "Defensive midfielder",
            suitability: "adapted",
            suitabilityLabel: "Adapted",
            isPrimary: false,
          },
        ]}
      />,
    );

    expect(markup).toContain('aria-label="Strong positions"');
    expect(markup.match(/tls-player-role-chip"/g) ?? []).toHaveLength(2);
    expect(markup).toContain('data-primary="true"');
    expect(markup).toContain('data-suitability="natural"');
    expect(markup).toContain('data-suitability="adapted"');
    expect(markup).toContain("tls-player-role-chip-code");
    expect(markup).toContain(">MC<");
    expect(markup).toContain(">MED<");
    expect(markup).toContain("tls-player-role-chip-name");
    expect(markup).toContain("Central midfielder");
    expect(markup).toContain("Defensive midfielder");
    expect(markup).toContain("tls-player-role-chip-suitability");
    expect(markup).not.toContain("weak");
    expect(markup).not.toContain("invalid");
  });

  it("renders an empty but still labelled list when no role is supplied", () => {
    const markup = renderToStaticMarkup(
      <PlayerRoleChips ariaLabel="Strong positions" roles={[]} />,
    );

    expect(markup).toContain("<ul");
    expect(markup).toContain('aria-label="Strong positions"');
    expect(markup).not.toContain("<li");
  });
});
