import type { MessageKey, Translator } from "@game/i18n";
import type { CareerContractTermsInput, CareerPlayerProfileView } from "@game/ui";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { WebPreferences } from "../../app/preferences";
import type {
  WebSelectedClubContractCommand,
  WebSelectedClubContractCommandResult,
} from "../../runtime/web-career-runtime";
import { canonicalPlayerRoleCode } from "../../shared/canonical-player-role";
import { formatMoneyFromMinorUnits } from "../../shared/format-money";
import { PlayerAttributeGroups } from "../../shared/ui/PlayerAttributeGroups";
import { PlayerProfileTabs } from "../../shared/ui/PlayerProfileTabs";
import { PlayerPotentialRangeRating } from "../../shared/ui/PlayerPotentialRangeRating";
import { PlayerRoleChips } from "../../shared/ui/PlayerRoleChips";
import {
  buildPlayerStatisticsPeriodItems,
  PlayerStatisticsPanel,
} from "../../shared/ui/PlayerStatisticsPanel";
import { PlayerStarRating } from "../../shared/ui/PlayerStarRating";
import { FullScreenDialog } from "../shared/FullScreenDialog";
import type { CareerContractFinancePreview } from "./career-squad-adapter";
import { CareerContractWorkspace } from "./CareerContractWorkspace";

type SquadPlayerProfileTabId = "attributes" | "statistics" | "contract";

/** Props for the complete accessible senior-player profile. */
export interface CareerPlayerProfileDialogProps {
  readonly profile: CareerPlayerProfileView | undefined;
  readonly language: WebPreferences["language"];
  readonly contractCommandPending: boolean;
  readonly text: Translator;
  readonly previewContractOffer: (
    playerId: string,
    terms: CareerContractTermsInput,
  ) => CareerContractFinancePreview;
  readonly onContractCommand: (
    command: WebSelectedClubContractCommand,
  ) => Promise<WebSelectedClubContractCommandResult | undefined>;
  readonly onClose: () => void;
}

/** Accessible full-screen profile built only from public football and contract facts. */
export function CareerPlayerProfileDialog({
  profile,
  language,
  contractCommandPending,
  text,
  previewContractOffer,
  onContractCommand,
  onClose,
}: CareerPlayerProfileDialogProps): React.JSX.Element {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [activeTabId, setActiveTabId] = useState<SquadPlayerProfileTabId>("attributes");

  useEffect(() => {
    setActiveTabId("attributes");
  }, [profile?.playerId]);

  return (
    <FullScreenDialog
      labelledBy="career-player-profile-title"
      open={profile !== undefined}
      shellClassName="tls-player-profile-shell"
      initialFocusRef={closeButtonRef}
      onClose={onClose}
    >
      {profile === undefined ? null : (
        <>
          <header className="tls-player-profile-header">
            <div className="tls-player-profile-number" aria-hidden="true">
              {profile.shirtNumber}
            </div>
            <div className="tls-player-profile-identity">
              <h2 id="career-player-profile-title">{profile.displayName}</h2>
              <p>
                {text(`career.player.role.${profile.primaryRole}` as MessageKey)}
                <span aria-hidden="true"> · </span>
                {text("career.playerProfile.ageValue", { age: profile.age })}
              </p>
            </div>
            <button
              aria-label={text("career.playerProfile.close")}
              className="tls-icon-button tls-player-profile-close"
              ref={closeButtonRef}
              title={text("career.playerProfile.close")}
              type="button"
              onClick={onClose}
            >
              <X aria-hidden="true" size={22} strokeWidth={1.8} />
            </button>
          </header>

          <dl className="tls-player-profile-summary" aria-label={text("career.playerProfile.summary")}>
            <ProfileFact
              label={text("career.squad.column.current_level")}
              value={(
                <PlayerStarRating
                  label={text("career.squad.column.current_level")}
                  rating={profile.currentRating}
                  text={text}
                />
              )}
            />
            <ProfileFact
              label={text("career.squad.column.potential_level")}
              value={(
                <PlayerPotentialRangeRating
                  language={language}
                  range={profile.potentialRange}
                  text={text}
                />
              )}
            />
            <ProfileFact
              label={text("career.playerProfile.value")}
              value={formatMoneyFromMinorUnits(profile.value, profile.currency, language, "whole")}
            />
            <ProfileFact label={text("career.squad.column.condition")} value={`${Math.round(profile.condition)}%`} />
            <ProfileFact label={text("career.squad.column.morale")} value={String(Math.round(profile.morale))} />
            <ProfileFact label={text("career.playerProfile.selection")} value={selectionLabel(profile, text)} />
            <ProfileFact label={text("career.playerProfile.availability")} value={availabilityLabel(profile, text)} />
          </dl>

          <PlayerRoleChips
            ariaLabel={text("career.playerProfile.rolesLabel")}
            roles={profile.roles.map((role) => ({
              roleId: role.role,
              code: canonicalPlayerRoleCode(role.role),
              label: text(role.labelKey as MessageKey),
              suitability: role.suitability,
              suitabilityLabel: text(
                `career.playerProfile.suitability.${role.suitability}` as MessageKey,
              ),
              isPrimary: role.isPrimary,
            }))}
          />

          <PlayerProfileTabs<SquadPlayerProfileTabId>
            activeTabId={activeTabId}
            ariaLabel={text("career.playerProfile.tabs.label")}
            tabs={[
              {
                tabId: "attributes",
                label: text("career.playerProfile.tabs.attributes"),
                panel: (
                  <div className="tls-player-profile-tab-content">
                    <p className="tls-player-profile-tab-hint">
                      {text("career.playerProfile.attributesHint")}
                    </p>
                    <PlayerAttributeGroups
                      ariaLabel={text("career.playerProfile.attributes")}
                      language={language}
                      groups={profile.attributeGroups.map((group) => ({
                        groupId: group.family,
                        label: text(group.labelKey as MessageKey),
                        attributes: group.attributes.map((attribute) => ({
                          attributeId: attribute.key,
                          label: text(attribute.labelKey as MessageKey),
                          value: attribute.value,
                        })),
                      }))}
                    />
                  </div>
                ),
              },
              {
                tabId: "statistics",
                label: text("career.playerProfile.tabs.statistics"),
                panel: (
                  <PlayerStatisticsPanel
                    ariaLabel={text("career.playerProfile.statistics.label")}
                    periods={buildPlayerStatisticsPeriodItems(
                      profile.statistics,
                      language,
                      text,
                    )}
                  />
                ),
              },
              {
                tabId: "contract",
                label: text("career.playerProfile.tabs.contract"),
                panel: (
                  <CareerContractWorkspace
                    playerId={profile.playerId}
                    playerAge={profile.age}
                    contract={profile.contract}
                    language={language}
                    pending={contractCommandPending}
                    text={text}
                    previewOffer={previewContractOffer}
                    onCommand={onContractCommand}
                  />
                ),
              },
            ]}
            onActiveTabChange={setActiveTabId}
          />
        </>
      )}
    </FullScreenDialog>
  );
}

/*
 * No icons. Two of the seven facts used to carry one, which read as decoration
 * rather than as a rule the eye could follow. The label already names the fact.
 */
function ProfileFact({
  label,
  value,
}: Readonly<{
  label: string;
  value: React.ReactNode;
}>): React.JSX.Element {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function selectionLabel(profile: CareerPlayerProfileView, text: Translator): string {
  return profile.selection === "unselected"
    ? text("career.squad.status.available")
    : text(`career.squad.status.${profile.selection}` as MessageKey);
}

function availabilityLabel(profile: CareerPlayerProfileView, text: Translator): string {
  if (profile.availabilityReasons.length === 0) return text("career.squad.status.available");
  return profile.availabilityReasons
    .map((reason) => text(`career.squad.status.${reason}` as MessageKey))
    .join(", ");
}
