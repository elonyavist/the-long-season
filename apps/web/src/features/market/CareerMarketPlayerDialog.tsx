import type { MessageKey, Translator } from "@game/i18n";
import type {
  CareerContractBonusField,
  CareerContractTermsInput,
  CareerMarketNegotiationView,
  CareerMarketOfferPreviewView,
  CareerMarketTargetAction,
  CareerMarketTargetBlockReason,
  CareerMarketTargetDetailView,
} from "@game/ui";
import { careerNonNegativeMoneyFromMinorUnits } from "@game/ui";
import {
  BriefcaseBusiness,
  Check,
  Send,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import type { WebPreferences } from "../../app/preferences";
import type {
  WebSelectedClubMarketCommand,
  WebSelectedClubMarketCommandResult,
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
import { ContractTermsForm } from "../shared/ContractTermsForm";
import { FullScreenDialog } from "../shared/FullScreenDialog";
import type { MarketOfferDraft } from "./career-market-adapter";
import {
  contractTermsToFormValues,
  recommendedDurationYears,
  validateContractRenewalForm,
  type ContractRenewalFormField,
  type ContractRenewalFormValues,
} from "../squad/contract-renewal-form";

const ALL_BONUS_FIELDS: readonly CareerContractBonusField[] = ["signing_bonus", "appearance_bonus"];

type MarketPlayerProfileTabId = "attributes" | "statistics" | "contract";

interface MarketPlayerProfileTabState {
  readonly playerId: string | undefined;
  readonly activeTabId: MarketPlayerProfileTabId;
}

/** Props for the public Market inspection profile and its offer composer. */
export type CareerMarketPlayerDialogProps = Readonly<{
  detail: CareerMarketTargetDetailView | undefined;
  language: WebPreferences["language"];
  marketCommandPending: boolean;
  negotiation: CareerMarketNegotiationView | undefined;
  text: Translator;
  previewOffer: (draft: MarketOfferDraft) => CareerMarketOfferPreviewView;
  onClose: () => void;
  onMarketCommand: (
    command: WebSelectedClubMarketCommand,
  ) => Promise<WebSelectedClubMarketCommandResult | undefined>;
}>;

/**
 * Shows public target facts plus the one explicit market command flow.
 *
 * Public facts and the composer never invent a business rule: eligibility,
 * affordability, and every outcome come from the canonical engine boundary.
 */
export function CareerMarketPlayerDialog({
  detail,
  language,
  marketCommandPending,
  negotiation,
  text,
  previewOffer,
  onClose,
  onMarketCommand,
}: CareerMarketPlayerDialogProps): React.JSX.Element {
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = "career-market-player-title";
  const [tabState, setTabState] = useState<MarketPlayerProfileTabState>({
    playerId: detail?.playerId,
    activeTabId: "attributes",
  });
  useEffect(() => {
    setTabState((current) => resetMarketPlayerProfileTabForPlayer(
      detail?.playerId,
      current,
    ));
  }, [detail?.playerId]);
  const activeTabId = resolveMarketPlayerProfileTab(detail?.playerId, tabState);

  return (
    <FullScreenDialog
      initialFocusRef={closeRef}
      labelledBy={titleId}
      open={detail !== undefined}
      shellClassName="tls-player-profile-shell"
      onClose={onClose}
    >
      {detail === undefined ? null : (
        <>
          <header className="tls-player-profile-header">
            <div
              className="tls-player-profile-number"
              aria-hidden="true"
            >
              {canonicalPlayerRoleCode(detail.primaryRole)}
            </div>
            <div className="tls-player-profile-identity">
              <h2 id={titleId}>{detail.displayName}</h2>
              <p>
                {text(`career.player.role.${detail.primaryRole}` as MessageKey)}
                {" · "}
                {detail.employment.status === "free_agent"
                  ? text("career.market.employment.free_agent")
                  : detail.employment.clubName}
                {" · "}
                {text(`career.market.tier.${detail.employment.sourceTier}` as MessageKey)}
              </p>
            </div>
            <button
              aria-label={text("career.market.profile.close")}
              className="tls-icon-button tls-player-profile-close"
              ref={closeRef}
              title={text("career.market.profile.close")}
              type="button"
              onClick={onClose}
            >
              <X aria-hidden="true" size={20} strokeWidth={1.8} />
            </button>
          </header>

          <dl
            aria-label={text("career.playerProfile.summary")}
            className="tls-player-profile-summary tls-market-player-summary"
          >
            <MarketFact
              label={text("career.market.column.age")}
              value={String(detail.age)}
            />
            <MarketFact
              label={text("career.market.column.value")}
              value={formatMoneyFromMinorUnits(detail.publicValue, detail.currency, language, "whole")}
            />
            <MarketFact
              label={detail.employment.status === "free_agent"
                ? text("career.market.column.transferFee")
                : text("career.market.column.askingPrice")}
              value={formatMoneyFromMinorUnits(
                detail.employment.status === "free_agent"
                  ? detail.freeAgentTransferFee ?? 0
                  : detail.askingPrice ?? 0,
                detail.currency,
                language,
                "whole",
              )}
            />
            <MarketFact
              label={text("career.market.profile.sourceCompetition")}
              value={detail.employment.status === "free_agent"
                ? text("career.market.tier.free_agent")
                : detail.employment.competitionName}
            />
            <MarketFact
              label={text("career.market.profile.condition")}
              value={`${Math.round(detail.condition)}%`}
            />
            <MarketFact
              label={text("career.market.profile.form")}
              value={String(Math.round(detail.form))}
            />
            <MarketFact
              label={text("career.market.profile.morale")}
              value={String(Math.round(detail.morale))}
            />
            <MarketFact
              label={text("career.market.column.currentLevel")}
              value={(
                <PlayerStarRating
                  label={text("career.market.column.currentLevel")}
                  rating={detail.currentRating}
                  text={text}
                />
              )}
            />
            <MarketFact
              label={text("career.market.column.potentialLevel")}
              value={(
                <PlayerPotentialRangeRating
                  language={language}
                  range={detail.potentialRange}
                  text={text}
                />
              )}
            />
          </dl>

          <PlayerRoleChips
            ariaLabel={text("career.playerProfile.rolesLabel")}
            roles={detail.roles.map((role) => ({
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

          <PlayerProfileTabs<MarketPlayerProfileTabId>
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
                      groups={detail.attributeGroups.map((group) => ({
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
                      detail.statistics,
                      language,
                      text,
                    )}
                  />
                ),
              },
              {
                tabId: "contract",
                label: text("career.market.profile.tabs.contractOffer"),
                panel: (
                  <div
                    className="tls-player-profile-tab-content"
                    data-market-draft-owner={marketOfferDraftIdentity(detail.playerId)}
                  >
                    <MarketEmploymentAndEligibility detail={detail} text={text} />
                    <MarketOfferComposer
                      age={detail.age}
                      currency={detail.currency}
                      eligibility={detail.eligibility}
                      key={marketOfferDraftIdentity(detail.playerId)}
                      language={language}
                      negotiation={negotiation}
                      pending={marketCommandPending}
                      playerId={detail.playerId}
                      sellingClubId={detail.employment.status === "contracted"
                        ? detail.employment.clubId
                        : undefined}
                      text={text}
                      previewOffer={previewOffer}
                      onCommand={onMarketCommand}
                    />
                  </div>
                ),
              },
            ]}
            onActiveTabChange={(nextTabId) => {
              setTabState({
                playerId: detail.playerId,
                activeTabId: nextTabId,
              });
            }}
          />
        </>
      )}
    </FullScreenDialog>
  );
}

/**
 * Preserves a tab for the same inspected player and defaults every new player
 * to Attributes without relying on an after-render effect.
 */
export function resolveMarketPlayerProfileTab(
  playerId: string | undefined,
  state: MarketPlayerProfileTabState,
): MarketPlayerProfileTabId {
  return playerId !== undefined && state.playerId === playerId
    ? state.activeTabId
    : "attributes";
}

/**
 * Records a real player change exactly once while ignoring dialog closure.
 *
 * Recording the new owner prevents returning to an older player from reviving
 * that player's previously selected tab.
 */
export function resetMarketPlayerProfileTabForPlayer(
  playerId: string | undefined,
  state: MarketPlayerProfileTabState,
): MarketPlayerProfileTabState {
  if (playerId === undefined || state.playerId === playerId) return state;
  return {
    playerId,
    activeTabId: "attributes",
  };
}

/**
 * Keys the offer workflow to its player so tab navigation keeps its draft,
 * while switching target cannot carry money or contract terms across players.
 */
export function marketOfferDraftIdentity(playerId: string): string {
  return `market-offer:${playerId}`;
}

function MarketFact({
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

/** Keeps employment, contract horizon, eligibility, finance, and offer context together. */
function MarketEmploymentAndEligibility({
  detail,
  text,
}: Readonly<{
  detail: CareerMarketTargetDetailView;
  text: Translator;
}>): React.JSX.Element {
  return (
    <>
      <section className="tls-market-player-section" aria-labelledby="career-market-contract-title">
        <div>
          <h3 id="career-market-contract-title">
            {detail.employment.status === "free_agent"
              ? text("career.market.employment.free_agent")
              : detail.employment.clubName}
          </h3>
        </div>
        {detail.employment.status === "free_agent" ? (
          <p>{text("career.market.contract.freeAgentSummary")}</p>
        ) : (
          <dl className="tls-market-contract-facts">
            <div>
              <dt>{text("career.market.contract.expires")}</dt>
              <dd>{detail.employment.contractEndsOnIso}</dd>
            </div>
            <div>
              <dt>{text("career.market.contract.horizon")}</dt>
              <dd>{text(`career.market.contractHorizon.${detail.contractHorizon}` as MessageKey)}</dd>
            </div>
          </dl>
        )}
      </section>

      <section
        className="tls-market-player-section tls-market-eligibility-detail"
        data-status={detail.eligibility.status}
        aria-labelledby="career-market-eligibility-title"
      >
        <BriefcaseBusiness aria-hidden="true" size={24} strokeWidth={1.7} />
        <div>
          <h3 id="career-market-eligibility-title">
            {detail.eligibility.status === "allowed"
              ? text(actionKey(detail.eligibility.action))
              : text(blockReasonKey(detail.eligibility.reason))}
          </h3>
          {detail.eligibility.status === "blocked"
            && detail.eligibility.nextAllowedOnIso !== undefined ? (
              <p>{text("career.market.eligibility.nextAllowed", {
                date: detail.eligibility.nextAllowedOnIso,
              })}</p>
            ) : null}
        </div>
      </section>
    </>
  );
}

function actionKey(action: CareerMarketTargetAction): MessageKey {
  return `career.market.action.${action}` as MessageKey;
}

function blockReasonKey(reason: CareerMarketTargetBlockReason): MessageKey {
  return `career.market.blockReason.${reason}` as MessageKey;
}

/**
 * Owns the one explicit command flow for one market target: club-stage fee,
 * player-stage or preliminary annual terms, and every accept/reject/withdraw
 * transition. Every branch is read from `negotiation`/`eligibility`; no stage
 * or outcome is inferred locally.
 */
function MarketOfferComposer({
  age,
  currency,
  eligibility,
  language,
  negotiation,
  pending,
  playerId,
  sellingClubId,
  text,
  previewOffer,
  onCommand,
}: Readonly<{
  age: number;
  currency: string;
  eligibility: CareerMarketTargetDetailView["eligibility"];
  language: WebPreferences["language"];
  negotiation: CareerMarketNegotiationView | undefined;
  pending: boolean;
  playerId: string;
  sellingClubId: string | undefined;
  text: Translator;
  previewOffer: (draft: MarketOfferDraft) => CareerMarketOfferPreviewView;
  onCommand: (
    command: WebSelectedClubMarketCommand,
  ) => Promise<WebSelectedClubMarketCommandResult | undefined>;
}>): React.JSX.Element | null {
  const [feedback, setFeedback] = useState<Readonly<{ kind: "success" | "error"; key: MessageKey }>>();
  const [startingPlayerTalks, setStartingPlayerTalks] = useState(false);

  // P79-CF-04-style guard: reseed feedback only on a real stage/player change.
  const identityToken = `${playerId}:${negotiation?.negotiationId ?? "none"}:${negotiation?.status ?? "none"}`;
  const lastTokenRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (lastTokenRef.current === identityToken) return;
    lastTokenRef.current = identityToken;
    setFeedback(undefined);
    setStartingPlayerTalks(false);
  }, [identityToken]);

  const runCommand = async (command: WebSelectedClubMarketCommand, successKey: MessageKey): Promise<void> => {
    setFeedback(undefined);
    const result = await onCommand(command);
    if (result === undefined) {
      setFeedback({ kind: "error", key: "career.market.composer.storageFailure" });
      return;
    }
    if (result.status === "rejected") {
      setFeedback({ kind: "error", key: marketRejectionMessageKey(result.reason) });
      return;
    }
    setFeedback({ kind: "success", key: successKey });
  };

  const feedbackBanner = (
    <p
      aria-live="polite"
      className="tls-contract-feedback"
      data-kind={feedback?.kind}
      role={feedback?.kind === "error" ? "alert" : undefined}
    >
      {pending ? text("career.command.updatingMarket") : feedback === undefined ? "" : text(feedback.key)}
    </p>
  );

  if (negotiation === undefined) {
    if (eligibility.status !== "allowed") return null;
    if (eligibility.action === "submit_transfer_offer") {
      if (sellingClubId === undefined) return null;
      return (
        <TransferFeeComposer
          currency={currency}
          feedback={feedbackBanner}
          pending={pending}
          playerId={playerId}
          sellingClubId={sellingClubId}
          text={text}
          previewOffer={previewOffer}
          onSubmit={(fee) => void runCommand(
            { type: "submit_transfer_offer", playerId, sellingClubId, offeredFee: fee },
            "career.market.composer.feedback.submitted",
          )}
        />
      );
    }
    const kind = eligibility.action === "submit_preliminary_agreement" ? "preliminary_agreement" : "free_agent_offer";
    return (
      <ContractTermsComposer
        age={age}
        currency={currency}
        feedback={feedbackBanner}
        pending={pending}
        text={text}
        titleKey={kind === "preliminary_agreement" ? "career.market.composer.preliminaryTitle" : "career.market.composer.freeAgentTitle"}
        previewOffer={(terms) => previewOffer({ kind, playerId, terms })}
        submitLabelKey="career.market.composer.submitOffer"
        onSubmit={(terms) => void runCommand(
          kind === "preliminary_agreement"
            ? { type: "submit_preliminary_agreement", playerId, terms }
            : { type: "sign_free_agent", playerId, terms },
          kind === "preliminary_agreement"
            ? "career.market.composer.feedback.submitted"
            : "career.market.composer.feedback.signed",
        )}
      />
    );
  }

  if (negotiation.stage === "club") {
    if (negotiation.status === "submitted") {
      return (
        <PendingComposerState
          bodyKey="career.market.composer.pendingSellerReply"
          feedback={feedbackBanner}
          pending={pending}
          text={text}
          onWithdraw={() => void runCommand(
            { type: "withdraw_transfer_offer", negotiationId: negotiation.negotiationId },
            "career.market.composer.feedback.withdrawn",
          )}
        />
      );
    }
    if (negotiation.status === "countered") {
      return (
        <FeeCounterComposer
          currency={currency}
          feedback={feedbackBanner}
          language={language}
          offeredFee={negotiation.counterFee}
          pending={pending}
          text={text}
          onAccept={() => void runCommand(
            { type: "accept_transfer_counter", negotiationId: negotiation.negotiationId },
            "career.market.composer.feedback.accepted",
          )}
          onWithdraw={() => void runCommand(
            { type: "withdraw_transfer_offer", negotiationId: negotiation.negotiationId },
            "career.market.composer.feedback.withdrawn",
          )}
        />
      );
    }
    if (negotiation.status === "accepted") {
      if (!startingPlayerTalks) {
        return (
          <div className="tls-market-composer">
            <p>{text("career.market.composer.clubAgreed", {
              fee: formatMoneyFromMinorUnits(negotiation.agreedFee ?? 0, currency, language, "whole"),
            })}</p>
            <button
              className="tls-menu-button tls-menu-button-primary"
              disabled={pending}
              type="button"
              onClick={() => setStartingPlayerTalks(true)}
            >
              <Send aria-hidden="true" size={17} />
              {text("career.market.composer.startPlayerTalks")}
            </button>
            {feedbackBanner}
          </div>
        );
      }
      return (
        <ContractTermsComposer
          age={age}
          currency={currency}
          feedback={feedbackBanner}
          pending={pending}
          text={text}
          titleKey="career.market.composer.playerTermsTitle"
          previewOffer={(terms) => previewOffer({ kind: "player_offer", negotiationId: negotiation.negotiationId, terms })}
          submitLabelKey="career.market.composer.submitOffer"
          onSubmit={(terms) => void runCommand(
            { type: "submit_transfer_player_offer", negotiationId: negotiation.negotiationId, terms },
            "career.market.composer.feedback.submitted",
          )}
        />
      );
    }
  }

  if (negotiation.stage === "player") {
    if (negotiation.status === "player_offer_submitted") {
      return (
        <PendingComposerState
          bodyKey="career.market.composer.pendingPlayerReply"
          feedback={feedbackBanner}
          pending={pending}
          text={text}
        />
      );
    }
    if (negotiation.status === "player_countered" && negotiation.offeredTerms !== undefined && negotiation.counterTerms !== undefined) {
      return (
        <TermsCounterComposer
          counterTerms={negotiation.counterTerms}
          currency={currency}
          feedback={feedbackBanner}
          language={language}
          offeredTerms={negotiation.offeredTerms}
          pending={pending}
          text={text}
          onAccept={() => void runCommand(
            { type: "accept_transfer_player_counter", negotiationId: negotiation.negotiationId },
            "career.market.composer.feedback.accepted",
          )}
          onReject={() => void runCommand(
            { type: "reject_transfer_player_counter", negotiationId: negotiation.negotiationId },
            "career.market.composer.feedback.withdrawn",
          )}
        />
      );
    }
  }

  if (negotiation.stage === "preliminary_agreement") {
    if (negotiation.status === "offer_submitted") {
      return (
        <PendingComposerState
          bodyKey="career.market.composer.pendingPlayerReply"
          feedback={feedbackBanner}
          pending={pending}
          text={text}
          onWithdraw={() => void runCommand(
            { type: "withdraw_preliminary_agreement", agreementId: negotiation.negotiationId },
            "career.market.composer.feedback.withdrawn",
          )}
        />
      );
    }
    if (negotiation.status === "countered" && negotiation.offeredTerms !== undefined && negotiation.counterTerms !== undefined) {
      return (
        <TermsCounterComposer
          counterTerms={negotiation.counterTerms}
          currency={currency}
          feedback={feedbackBanner}
          language={language}
          offeredTerms={negotiation.offeredTerms}
          pending={pending}
          text={text}
          onAccept={() => void runCommand(
            { type: "accept_preliminary_agreement_counter", agreementId: negotiation.negotiationId },
            "career.market.composer.feedback.accepted",
          )}
          onReject={() => void runCommand(
            { type: "reject_preliminary_agreement_counter", agreementId: negotiation.negotiationId },
            "career.market.composer.feedback.withdrawn",
          )}
        />
      );
    }
    if (negotiation.status === "agreed") {
      return (
        <div className="tls-market-composer">
          <p>{text("career.market.composer.agreementReached")}</p>
        </div>
      );
    }
  }

  return null;
}

function TransferFeeComposer({
  currency,
  feedback,
  pending,
  playerId,
  sellingClubId,
  text,
  previewOffer,
  onSubmit,
}: Readonly<{
  currency: string;
  feedback: React.ReactNode;
  pending: boolean;
  playerId: string;
  sellingClubId: string;
  text: Translator;
  previewOffer: (draft: MarketOfferDraft) => CareerMarketOfferPreviewView;
  onSubmit: (fee: CareerContractTermsInput["annualWage"]) => void;
}>): React.JSX.Element {
  const [feeText, setFeeText] = useState("");
  const parsedFee = parseFeeInput(feeText);
  const preview = parsedFee === undefined
    ? undefined
    : previewOffer({ kind: "transfer_offer", playerId, fee: parsedFee });

  return (
    <form
      className="tls-market-composer tls-contract-form"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (parsedFee !== undefined) onSubmit(parsedFee);
      }}
    >
      <label className="tls-contract-field">
        <span>{text("career.market.composer.feeLabel")}</span>
        <span className="tls-contract-input">
          <input
            inputMode="decimal"
            value={feeText}
            onChange={(event) => setFeeText(event.currentTarget.value)}
          />
          <span>{currency}</span>
        </span>
        {feeText.trim().length > 0 && parsedFee === undefined ? (
          <small>{text("career.market.composer.feeInvalid")}</small>
        ) : null}
      </label>
      {preview === undefined ? null : (
        <FinancePreviewFacts preview={preview} text={text} />
      )}
      <div className="tls-contract-form-actions">
        <button
          className="tls-menu-button tls-menu-button-primary"
          disabled={pending || parsedFee === undefined || preview?.status !== "ready"}
          type="submit"
        >
          <Send aria-hidden="true" size={17} />
          {text("career.market.composer.submitOffer")}
        </button>
      </div>
      {feedback}
    </form>
  );
}

function ContractTermsComposer({
  age,
  currency,
  feedback,
  pending,
  text,
  titleKey,
  previewOffer,
  submitLabelKey,
  onSubmit,
}: Readonly<{
  age: number;
  currency: string;
  feedback: React.ReactNode;
  pending: boolean;
  text: Translator;
  titleKey: MessageKey;
  previewOffer: (terms: CareerContractTermsInput) => CareerMarketOfferPreviewView;
  submitLabelKey: MessageKey;
  onSubmit: (terms: CareerContractTermsInput) => void;
}>): React.JSX.Element {
  const defaultValues = useMemo(() => contractTermsToFormValues({
    durationYears: recommendedDurationYears(age),
    annualWage: careerNonNegativeMoneyFromMinorUnits(0),
    squadStatus: "squad_player",
    bonuses: { signingBonus: careerNonNegativeMoneyFromMinorUnits(0), appearanceBonus: careerNonNegativeMoneyFromMinorUnits(0) },
  }), [age]);
  const [values, setValues] = useState<ContractRenewalFormValues>(defaultValues);
  const [fieldErrors, setFieldErrors] = useState<Readonly<Partial<Record<ContractRenewalFormField, string>>>>({});
  const validation = useMemo(() => validateContractRenewalForm(values, ALL_BONUS_FIELDS), [values]);
  const preview = validation.status === "valid" ? previewOffer(validation.terms) : undefined;

  return (
    <div className="tls-market-composer">
      <h4>{text(titleKey)}</h4>
      <ContractTermsForm
        currency={currency}
        errors={fieldErrors}
        pending={pending}
        submitLabel={text(submitLabelKey)}
        supportedBonusFields={ALL_BONUS_FIELDS}
        text={text}
        values={values}
        onCancel={() => {
          setValues(defaultValues);
          setFieldErrors({});
        }}
        onChange={(field, value) => {
          setValues((current) => ({ ...current, [field]: value }));
          setFieldErrors((current) => ({ ...current, [field]: undefined }));
        }}
        onSubmit={() => {
          const validated = validateContractRenewalForm(values, ALL_BONUS_FIELDS);
          if (validated.status === "invalid") {
            setFieldErrors(Object.fromEntries(
              Object.entries(validated.errors).map(([field, reason]) => [field, text(validationMessageKey(reason))]),
            ));
            return;
          }
          setFieldErrors({});
          onSubmit(validated.terms);
        }}
      />
      {preview === undefined ? null : <FinancePreviewFacts preview={preview} text={text} />}
      {feedback}
    </div>
  );
}

function FeeCounterComposer({
  currency,
  feedback,
  language,
  offeredFee,
  pending,
  text,
  onAccept,
  onWithdraw,
}: Readonly<{
  currency: string;
  feedback: React.ReactNode;
  language: WebPreferences["language"];
  offeredFee: CareerContractTermsInput["annualWage"] | undefined;
  pending: boolean;
  text: Translator;
  onAccept: () => void;
  onWithdraw: () => void;
}>): React.JSX.Element {
  return (
    <div className="tls-market-composer">
      <p>{text("career.market.composer.clubCountered")}</p>
      <dl className="tls-market-contract-facts">
        <div>
          <dt>{text("career.market.composer.theirCounter")}</dt>
          <dd>{formatMoneyFromMinorUnits(offeredFee ?? 0, currency, language, "whole")}</dd>
        </div>
      </dl>
      <div className="tls-contract-form-actions">
        <button className="tls-menu-button tls-menu-button-primary" disabled={pending} type="button" onClick={onAccept}>
          <Check aria-hidden="true" size={17} />
          {text("career.market.composer.acceptCounter")}
        </button>
        <button className="tls-menu-button tls-contract-action-danger" disabled={pending} type="button" onClick={onWithdraw}>
          {text("career.market.composer.withdraw")}
        </button>
      </div>
      {feedback}
    </div>
  );
}

function TermsCounterComposer({
  counterTerms,
  currency,
  feedback,
  language,
  offeredTerms,
  pending,
  text,
  onAccept,
  onReject,
}: Readonly<{
  counterTerms: CareerContractTermsInput;
  currency: string;
  feedback: React.ReactNode;
  language: WebPreferences["language"];
  offeredTerms: CareerContractTermsInput;
  pending: boolean;
  text: Translator;
  onAccept: () => void;
  onReject: () => void;
}>): React.JSX.Element {
  return (
    <div className="tls-market-composer">
      <p>{text("career.market.composer.playerCountered")}</p>
      <div className="tls-contract-counter-comparison">
        <div>
          <h5>{text("career.market.composer.yourOffer")}</h5>
          <TermsSummary currency={currency} language={language} terms={offeredTerms} text={text} />
        </div>
        <div>
          <h5>{text("career.market.composer.theirCounter")}</h5>
          <TermsSummary currency={currency} language={language} terms={counterTerms} text={text} />
        </div>
      </div>
      <div className="tls-contract-form-actions">
        <button className="tls-menu-button tls-menu-button-primary" disabled={pending} type="button" onClick={onAccept}>
          <Check aria-hidden="true" size={17} />
          {text("career.market.composer.acceptCounter")}
        </button>
        <button className="tls-menu-button tls-contract-action-danger" disabled={pending} type="button" onClick={onReject}>
          {text("career.market.composer.rejectCounter")}
        </button>
      </div>
      {feedback}
    </div>
  );
}

function TermsSummary({
  currency,
  language,
  terms,
  text,
}: Readonly<{
  currency: string;
  language: WebPreferences["language"];
  terms: CareerContractTermsInput;
  text: Translator;
}>): React.JSX.Element {
  return (
    <dl className="tls-contract-terms" data-compact="true">
      <div>
        <dt>{text("career.contract.field.annualWage")}</dt>
        <dd>{formatMoneyFromMinorUnits(terms.annualWage, currency, language, "whole")}</dd>
      </div>
      <div>
        <dt>{text("career.contract.field.signingBonus")}</dt>
        <dd>{formatMoneyFromMinorUnits(terms.bonuses.signingBonus, currency, language, "whole")}</dd>
      </div>
    </dl>
  );
}

function PendingComposerState({
  bodyKey,
  feedback,
  pending,
  text,
  onWithdraw,
}: Readonly<{
  bodyKey: MessageKey;
  feedback: React.ReactNode;
  pending: boolean;
  text: Translator;
  onWithdraw?: () => void;
}>): React.JSX.Element {
  return (
    <div className="tls-market-composer">
      <p>{text(bodyKey)}</p>
      {onWithdraw === undefined ? null : (
        <div className="tls-contract-form-actions">
          <button className="tls-menu-button tls-contract-action-danger" disabled={pending} type="button" onClick={onWithdraw}>
            {text("career.market.composer.withdraw")}
          </button>
        </div>
      )}
      {feedback}
    </div>
  );
}

function FinancePreviewFacts({
  preview,
  text,
}: Readonly<{
  preview: CareerMarketOfferPreviewView;
  text: Translator;
}>): React.JSX.Element | null {
  if (preview.status === "blocked") {
    return <p className="tls-contract-finance-warning" role="status">{text(financeBlockedMessageKey(preview.reason))}</p>;
  }
  return <p className="tls-contract-finance-ok"><Check aria-hidden="true" size={16} />{text("career.contract.financeAffordable")}</p>;
}

function parseFeeInput(value: string): CareerContractTermsInput["annualWage"] | undefined {
  const normalized = value.trim().replace(",", ".");
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(normalized);
  if (match === null) return undefined;
  const whole = Number(match[1]);
  const fraction = Number((match[2] ?? "").padEnd(2, "0"));
  const minorUnits = whole * 100 + fraction;
  if (!Number.isSafeInteger(minorUnits) || minorUnits <= 0) return undefined;
  return careerNonNegativeMoneyFromMinorUnits(minorUnits);
}

function validationMessageKey(reason: string | undefined): MessageKey {
  if (reason === "required") return "career.contract.validation.required";
  if (reason === "out_of_range") return "career.contract.validation.outOfRange";
  return "career.contract.validation.invalidMoney";
}

function marketRejectionMessageKey(reason: string): MessageKey {
  if (reason === "insufficient_transfer_budget") return "career.market.composer.error.transferBudget";
  if (reason === "insufficient_cash") return "career.market.composer.error.cash";
  if (reason === "wage_budget_exceeded") return "career.contract.error.wageBudget";
  if (reason === "outside_transfer_window") return "career.market.blockReason.outside_transfer_window";
  if (reason === "duplicate_open_negotiation") return "career.market.blockReason.negotiation_already_open";
  return "career.market.composer.error.commandRejected";
}

function financeBlockedMessageKey(reason: string): MessageKey {
  if (reason === "insufficient_transfer_budget") return "career.market.composer.error.transferBudget";
  if (reason === "insufficient_cash") return "career.market.composer.error.cash";
  if (reason === "wage_budget_exceeded") return "career.contract.error.wageBudget";
  return "career.market.composer.error.financeUnavailable";
}
