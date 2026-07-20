import { fromISO } from "@game/shared";
import { buildCareerInboxView, buildCareerShellView } from "@game/ui";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { CareerAppFrame } from "./CareerAppFrame";
import { createWebTranslator } from "./translation";
import { AppShell } from "../features/app-shell/AppShell";
import { useCareerSaveLifecycle } from "../features/app-shell/CareerSaveControl";
import type { CareerSessionStatus } from "../runtime/career-session";

describe("CareerAppFrame", () => {
  it("supplies one save and recovery boundary to a current career screen", () => {
    const text = createWebTranslator("en");
    const shellView = buildCareerShellView({
      activeSectionKey: "dashboard",
      inboxView: buildCareerInboxView([]),
      mode: "preparation",
    });
    const html = renderToStaticMarkup(
      <CareerAppFrame
        saveLifecycle={{
          sessionStatus: {
            dirty: false,
            autosaveIntervalDays: 7,
            lastPersistedGameDate: fromISO("2026-08-01") as CareerSessionStatus["lastPersistedGameDate"],
            autosavePostponed: false,
          },
          canSave: true,
          pending: false,
          onSave: vi.fn(),
          onPolicyChange: vi.fn(),
        }}
        storageFailure={{ code: "save_unwritable" }}
        onRetryStorage={vi.fn()}
        exitDialog={{
          open: false,
          canSave: true,
          pending: false,
          text,
          onCancel: vi.fn(),
          onExitWithoutSaving: vi.fn(),
          onSaveAndExit: vi.fn(),
        }}
      >
        <AppShell
          shellView={shellView}
          selectedClubName="S.S. Perugia"
          currentDateIso="2026-08-01"
          text={text}
          onBackToMenu={vi.fn()}
        >
          <SaveLifecycleProbe />
        </AppShell>
      </CareerAppFrame>,
    );

    expect(html).toContain("save-boundary-present");
    expect(html).toContain("The career could not be saved");
    expect(html).toContain("Try again");
    expect(html.match(/<dialog class="tls-unsaved-dialog"/g)).toHaveLength(1);
    expect(html.match(/<dialog aria-labelledby="tls-save-control-title" class="tls-career-save-dialog"/g)).toHaveLength(1);
  });
});

function SaveLifecycleProbe(): React.JSX.Element {
  return <p>{useCareerSaveLifecycle() === undefined ? "save-boundary-missing" : "save-boundary-present"}</p>;
}
