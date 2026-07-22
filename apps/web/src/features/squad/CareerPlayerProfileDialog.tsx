import type { MessageKey, Translator } from "@game/i18n";
import type { CareerContractTermsInput, CareerPlayerProfileView } from "@game/ui";
import {
  Activity,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  BadgeEuro,
  ShieldCheck,
  X,
} from "lucide-react";
import * as m from "motion/react-m";
import { useEffect, useRef } from "react";

import type { WebPreferences } from "../../app/preferences";
import type {
  WebSelectedClubContractCommand,
  WebSelectedClubContractCommandResult,
} from "../../runtime/web-career-runtime";
import { webMotion, webMotionTargets } from "../../shared/motion/web-motion";
import type { CareerContractFinancePreview } from "./career-squad-adapter";
import { CareerContractWorkspace } from "./CareerContractWorkspace";

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
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog === null) return;

    if (profile !== undefined && !dialog.open) {
      previousFocusRef.current = document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
      dialog.showModal();
      closeButtonRef.current?.focus();
      return;
    }

    if (profile === undefined && dialog.open) {
      dialog.close();
      previousFocusRef.current?.focus();
      previousFocusRef.current = null;
    }
  }, [profile]);

  return (
    <dialog
      aria-labelledby="career-player-profile-title"
      className="tls-player-profile-dialog"
      ref={dialogRef}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
    >
      {profile === undefined ? null : (
        <m.article
          className="tls-player-profile-shell"
          initial={webMotionTargets.dialogEnter}
          animate={webMotionTargets.rest}
          transition={webMotion.transition}
        >
          <header className="tls-player-profile-header">
            <div className="tls-player-profile-number" aria-hidden="true">
              {profile.shirtNumber}
            </div>
            <div className="tls-player-profile-identity">
              <p className="tls-career-screen-eyebrow">{text("career.playerProfile.eyebrow")}</p>
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

          <dl className="tls-player-profile-summary" aria-label={text("career.playerProfile.summary") }>
            <ProfileFact label={text("career.squad.column.current_level")} value={text(levelKey(profile.currentLevel))} />
            <ProfileFact label={text("career.squad.column.potential_level")} value={text(levelKey(profile.potentialLevel))} />
            <ProfileFact label={text("career.playerProfile.value")} value={formatMoney(profile.value, profile.currency, language)} icon="value" />
            <ProfileFact label={text("career.squad.column.condition")} value={`${Math.round(profile.condition)}%`} icon="condition" />
            <ProfileFact label={text("career.squad.column.morale")} value={text(`career.squad.morale.${profile.moraleDirection}` as MessageKey)} icon={profile.moraleDirection} />
            <ProfileFact label={text("career.playerProfile.selection")} value={selectionLabel(profile, text)} />
            <ProfileFact label={text("career.playerProfile.availability")} value={availabilityLabel(profile, text)} />
          </dl>

          <section className="tls-player-profile-section" aria-labelledby="career-player-profile-roles-title">
            <div className="tls-player-profile-section-heading">
              <div>
                <p className="tls-career-screen-eyebrow">{text("career.playerProfile.football")}</p>
                <h3 id="career-player-profile-roles-title">{text("career.playerProfile.overview")}</h3>
              </div>
            </div>
            <div className="tls-player-profile-role-list">
              {profile.roles.filter((role) => role.suitability !== "invalid").map((role) => (
                <span data-suitability={role.suitability} key={role.role}>
                  <strong>{text(role.labelKey as MessageKey)}</strong>
                  <small>{text(`career.playerProfile.suitability.${role.suitability}` as MessageKey)}</small>
                </span>
              ))}
            </div>
          </section>

          <section className="tls-player-profile-section" aria-labelledby="career-player-profile-attributes-title">
            <div className="tls-player-profile-section-heading">
              <div>
                <p className="tls-career-screen-eyebrow">{text("career.playerProfile.currentAbility")}</p>
                <h3 id="career-player-profile-attributes-title">{text("career.playerProfile.attributes")}</h3>
              </div>
              <p>{text("career.playerProfile.attributesHint")}</p>
            </div>
            <div className="tls-player-attribute-groups">
              {profile.attributeGroups.map((group) => (
                <section key={group.family} aria-labelledby={`attribute-group-${group.family}`}>
                  <h4 id={`attribute-group-${group.family}`}>{text(group.labelKey as MessageKey)}</h4>
                  <dl>
                    {group.attributes.map((attribute) => (
                      <div key={attribute.key} data-band={attributeBand(attribute.value)}>
                        <dt>{text(attribute.labelKey as MessageKey)}</dt>
                        <dd>{formatAttribute(attribute.value)}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
              ))}
            </div>
          </section>

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
        </m.article>
      )}
    </dialog>
  );
}

function ProfileFact({
  label,
  value,
  icon,
}: Readonly<{
  label: string;
  value: string;
  icon?: "value" | "condition" | "up" | "steady" | "down";
}>): React.JSX.Element {
  const Icon = icon === "value"
    ? BadgeEuro
    : icon === "condition"
      ? Activity
      : icon === "up"
        ? ArrowUp
        : icon === "down"
          ? ArrowDown
          : icon === "steady"
            ? ArrowRight
            : ShieldCheck;
  return (
    <div>
      <dt>{label}</dt>
      <dd>{icon === undefined ? null : <Icon aria-hidden="true" size={17} />}{value}</dd>
    </div>
  );
}

function levelKey(level: CareerPlayerProfileView["currentLevel"]): MessageKey {
  return `career.squad.level.${level}` as MessageKey;
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

function formatMoney(amount: number, currency: string, language: WebPreferences["language"]): string {
  return new Intl.NumberFormat(language, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount / 100);
}

function formatAttribute(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function attributeBand(value: number): "low" | "average" | "good" | "excellent" {
  if (value >= 15) return "excellent";
  if (value >= 12) return "good";
  if (value >= 8) return "average";
  return "low";
}
