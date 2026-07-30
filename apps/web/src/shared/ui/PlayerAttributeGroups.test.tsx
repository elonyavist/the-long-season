import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  attributeBand,
  formatAttribute,
  PlayerAttributeGroups,
} from "./PlayerAttributeGroups";

describe("PlayerAttributeGroups", () => {
  it("renders only supplied groups, exact values, and role-relevance order", () => {
    const markup = renderToStaticMarkup(
      <PlayerAttributeGroups
        ariaLabel="Current attributes"
        language="en"
        groups={[
          {
            groupId: "goalkeeping",
            label: "Goalkeeping",
            attributes: [
              { attributeId: "reflexes", label: "Reflexes", value: 15.5 },
              { attributeId: "handling", label: "Handling", value: 12 },
            ],
          },
          {
            groupId: "mental",
            label: "Mental",
            attributes: [
              { attributeId: "positioning", label: "Positioning", value: 9.25 },
            ],
          },
        ]}
      />,
    );

    expect(markup).toContain('aria-label="Current attributes"');
    expect(markup).toContain('data-family="goalkeeping"');
    expect(markup).toContain('data-family="mental"');
    expect(markup).not.toContain('data-family="technical"');
    expect(markup.indexOf("Reflexes")).toBeLessThan(markup.indexOf("Handling"));
    expect(markup).toContain("<dd>15.5</dd>");
    expect(markup).toContain("<dd>12.0</dd>");
    expect(markup).toContain("<dd>9.3</dd>");
    expect(markup).toContain('data-band="excellent"');
    expect(markup).toContain('data-band="good"');
  });

  it("uses stable display-only formatting and bands at every boundary", () => {
    expect(formatAttribute(12, "en")).toBe("12.0");
    expect(formatAttribute(12.25, "en")).toBe("12.3");
    expect(formatAttribute(12.68, "en")).toBe("12.7");
    expect(formatAttribute(12.5, "en")).toBe("12.5");
    expect(formatAttribute(12.5, "it")).toBe("12,5");
    expect(attributeBand(7.9)).toBe("low");
    expect(attributeBand(8)).toBe("average");
    expect(attributeBand(12)).toBe("good");
    expect(attributeBand(15)).toBe("excellent");
  });
});
