import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createWebTranslator } from "../../app/translation";
import { SquadRowActionMenu } from "./SquadRowActionMenu";

describe("SquadRowActionMenu", () => {
  it("renders one named menu trigger without restoring the old action cluster", () => {
    const markup = renderToStaticMarkup(
      <SquadRowActionMenu
        playerName="Ada Rossi"
        text={createWebTranslator("en")}
        dismissSignal="initial"
        canChooseLineupPosition
        onOpenProfile={() => undefined}
        onChooseLineupPosition={() => undefined}
      />,
    );

    expect(markup).toContain('aria-haspopup="menu"');
    expect(markup).toContain('aria-expanded="false"');
    expect(markup).toContain('aria-label="Actions for Ada Rossi"');
    expect(markup.match(/<button/g)).toHaveLength(1);
  });
});
