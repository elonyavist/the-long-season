/**
 * Focused coverage for the shared full-screen dialog dismissal policy.
 */
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { FullScreenDialog } from "./FullScreenDialog";

describe("FullScreenDialog", () => {
  it("keeps light backdrop dismissal for existing inspection surfaces", () => {
    const markup = renderToStaticMarkup(
      <FullScreenDialog
        labelledBy="inspection-title"
        open
        shellClassName="tls-player-profile-shell"
        onClose={vi.fn()}
      >
        <h2 id="inspection-title">Inspection</h2>
      </FullScreenDialog>,
    );

    expect(markup).toContain('data-backdrop-dismiss="true"');
  });

  it("lets a transactional surface opt out of backdrop dismissal", () => {
    const markup = renderToStaticMarkup(
      <FullScreenDialog
        dismissOnBackdrop={false}
        labelledBy="draft-title"
        open
        shellClassName="tls-player-profile-shell"
        onClose={vi.fn()}
      >
        <h2 id="draft-title">Draft</h2>
      </FullScreenDialog>,
    );

    expect(markup).toContain('data-backdrop-dismiss="false"');
  });

  it("renders no shell content while closed", () => {
    const markup = renderToStaticMarkup(
      <FullScreenDialog
        labelledBy="closed-title"
        open={false}
        shellClassName="tls-player-profile-shell"
        onClose={vi.fn()}
      >
        <h2 id="closed-title">Closed</h2>
      </FullScreenDialog>,
    );

    expect(markup).not.toContain("tls-player-profile-shell");
  });
});
