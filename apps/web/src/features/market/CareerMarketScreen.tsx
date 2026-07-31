import type { MessageKey, Translator } from "@game/i18n";
import {
  buildCareerMarketView,
  buildCareerShellView,
  careerMoneyFromMinorUnits,
  paginateCareerMarketTargetRows,
  type CanonicalPlayerRole,
  type CareerInboxView,
  type CareerMarketOfferPreviewView,
  type CareerMarketSourceTier,
  type CareerMarketTargetFilters,
  type CareerMarketTargetRowView,
  type CareerMarketTargetSort,
  type CareerMarketTargetSortKey,
  type CareerMarketViewInput,
} from "@game/ui";
import * as m from "motion/react-m";
import {
  BadgeEuro,
  BriefcaseBusiness,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Eye,
  RotateCcw,
  Search,
  WalletCards,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import type { WebPreferences } from "../../app/preferences";
import { canonicalPlayerRoleCode } from "../../shared/canonical-player-role";
import {
  formatMoneyFromMinorUnits,
  formatMoneyInputFromMinorUnits,
  parseMoneyInputToMinorUnits,
} from "../../shared/format-money";
import { useDebouncedValue } from "../../shared/lib/use-debounced-value";
import { webMotion, webMotionTargets } from "../../shared/motion/web-motion";
import { PlayerPotentialRangeRating } from "../../shared/ui/PlayerPotentialRangeRating";
import { PlayerStarRating } from "../../shared/ui/PlayerStarRating";
import type {
  WebSelectedClubMarketCommand,
  WebSelectedClubMarketCommandResult,
} from "../../runtime/web-career-runtime";
import { AppShell } from "../app-shell/AppShell";
import { CareerScreenHeader } from "../shared/CareerScreenHeader";
import type { MarketOfferDraft } from "./career-market-adapter";
import { CareerMarketPlayerDialog } from "./CareerMarketPlayerDialog";

/** Props for the inspection-first Market workspace. */
export type CareerMarketScreenProps = Readonly<{
  presentation: CareerMarketViewInput;
  inboxView: CareerInboxView;
  selectedClubName: string;
  currentDateIso: string;
  language: WebPreferences["language"];
  marketCommandPending: boolean;
  text: Translator;
  onBackToMenu: () => void;
  onInboxActionClick: (actionId: string) => void;
  previewOffer: (draft: MarketOfferDraft) => CareerMarketOfferPreviewView;
  onMarketCommand: (
    command: WebSelectedClubMarketCommand,
  ) => Promise<WebSelectedClubMarketCommandResult | undefined>;
  /** Posta-routed request to open one player's market profile directly. */
  focusRequest?: Readonly<{ playerId: string; nonce: number }>;
}>;

type FilterDraft = Readonly<{
  query: string;
  role: "all" | CanonicalPlayerRole;
  sourceTier: "all" | CareerMarketSourceTier;
  minimumAge: string;
  maximumAge: string;
  employment: "all" | "contracted" | "free_agent";
  contractHorizon: "all" | "free_agent" | "expiring" | "secure";
  minimumValue: string;
  maximumValue: string;
  eligibility: "all" | "actionable" | "blocked";
}>;

const EMPTY_FILTERS: FilterDraft = {
  query: "",
  role: "all",
  sourceTier: "all",
  minimumAge: "",
  maximumAge: "",
  employment: "all",
  contractHorizon: "all",
  minimumValue: "",
  maximumValue: "",
  eligibility: "all",
};

const ROLE_OPTIONS: readonly CanonicalPlayerRole[] = [
  "goalkeeper",
  "right_full_back",
  "center_back",
  "left_full_back",
  "defensive_midfielder",
  "central_midfielder",
  "right_midfielder",
  "left_midfielder",
  "attacking_midfielder",
  "right_winger",
  "left_winger",
  "striker",
];

const MARKET_TYPED_FILTER_DELAY_MS = 250;
const MARKET_AGE_OPTIONS = Array.from({ length: 26 }, (_, index) => index + 15);

/** Renders the real all-year player browser and public market inspection flow. */
export function CareerMarketScreen({
  presentation,
  inboxView,
  selectedClubName,
  currentDateIso,
  language,
  marketCommandPending,
  text,
  onBackToMenu,
  onInboxActionClick,
  previewOffer,
  onMarketCommand,
  focusRequest,
}: CareerMarketScreenProps): React.JSX.Element {
  const [filters, setFilters] = useState<FilterDraft>(EMPTY_FILTERS);
  const [sort, setSort] = useState<CareerMarketTargetSort>({
    key: "value",
    direction: "descending",
  });
  const [page, setPage] = useState(1);
  const [openPlayerId, setOpenPlayerId] = useState<string | undefined>(focusRequest?.playerId);
  // Re-route only on a new request nonce; unrelated career republishes with the
  // same request must never reopen or reset the manager's own dialog choice.
  const lastFocusNonceRef = useRef<number | undefined>(focusRequest?.nonce);
  useEffect(() => {
    if (focusRequest === undefined || lastFocusNonceRef.current === focusRequest.nonce) return;
    lastFocusNonceRef.current = focusRequest.nonce;
    setOpenPlayerId(focusRequest.playerId);
  }, [focusRequest]);
  const shellView = buildCareerShellView({ activeSectionKey: "market", inboxView });
  const debouncedQuery = useDebouncedValue(
    filters.query,
    MARKET_TYPED_FILTER_DELAY_MS,
  );
  const debouncedMinimumValue = useDebouncedValue(
    filters.minimumValue,
    MARKET_TYPED_FILTER_DELAY_MS,
  );
  const debouncedMaximumValue = useDebouncedValue(
    filters.maximumValue,
    MARKET_TYPED_FILTER_DELAY_MS,
  );
  const appliedFilters = useMemo<FilterDraft>(() => ({
    ...filters,
    query: debouncedQuery,
    minimumValue: debouncedMinimumValue,
    maximumValue: debouncedMaximumValue,
  }), [
    debouncedMaximumValue,
    debouncedMinimumValue,
    debouncedQuery,
    filters,
  ]);
  const view = useMemo(
    () => buildCareerMarketView(presentation.status !== "ready"
      ? presentation
      : {
          ...presentation,
          filters: buildFilters(appliedFilters, language),
          sort,
        }),
    [appliedFilters, language, presentation, sort],
  );
  const pageView = useMemo(
    () => view.status === "ready"
      ? paginateCareerMarketTargetRows(view.targets.rows, page)
      : undefined,
    [page, view],
  );
  useEffect(() => {
    if (pageView !== undefined && page !== pageView.currentPage) {
      setPage(pageView.currentPage);
    }
  }, [page, pageView]);
  const detail = view.status === "ready" && openPlayerId !== undefined
    ? view.targets.resolveDetail(openPlayerId)
    : undefined;

  return (
    <AppShell
      shellView={shellView}
      selectedClubName={selectedClubName}
      currentDateIso={currentDateIso}
      text={text}
      onBackToMenu={onBackToMenu}
      onInboxActionClick={onInboxActionClick}
    >
      <section className="tls-shell-panel tls-market-panel" aria-labelledby="career-market-title">
        <CareerScreenHeader
          supporting={text("career.market.subtitle")}
          title={text("career.shell.nav.market")}
          titleId="career-market-title"
        />

        {view.status === "loading" ? (
          <MarketState title={text("career.market.loading")} />
        ) : view.status === "error" ? (
          <MarketState
            alert
            title={text("career.market.error.title")}
            summary={text(view.messageKey as MessageKey)}
          />
        ) : (
          <>
            <MarketFinanceStrip view={view} language={language} text={text} />
            <MarketFilters
              filters={filters}
              language={language}
              text={text}
              total={view.targets.totalTargetCount}
              visible={view.targets.visibleTargetCount}
              onChange={(nextFilters) => {
                setFilters(nextFilters);
                setPage(1);
              }}
              onReset={() => {
                setFilters(EMPTY_FILTERS);
                setPage(1);
              }}
            />

            {view.targets.status === "empty" ? (
              <MarketState
                title={text("career.market.empty.title")}
                summary={text("career.market.empty.summary")}
              />
            ) : (
              <m.div
                animate={webMotionTargets.rest}
                className="tls-market-table-frame"
                initial={webMotionTargets.contentUpdate}
                key={`${view.targets.visibleTargetCount}:${sort.key}:${sort.direction}:${pageView?.currentPage ?? 1}`}
                transition={webMotion.transition}
              >
                <table className="tls-market-table">
                  <thead>
                    <tr>
                      <MarketSortHeading column="player" label={text("career.market.column.player")} sort={sort} onSort={handleSort} />
                      <MarketSortHeading column="club" label={text("career.market.column.club")} sort={sort} onSort={handleSort} />
                      <MarketSortHeading column="age" label={text("career.market.column.age")} sort={sort} onSort={handleSort} />
                      <MarketSortHeading column="role" label={text("career.market.column.role")} sort={sort} onSort={handleSort} />
                      <MarketSortHeading column="current_level" label={text("career.market.column.currentLevel")} sort={sort} onSort={handleSort} />
                      <MarketSortHeading column="potential_level" label={text("career.market.column.potentialLevel")} sort={sort} onSort={handleSort} />
                      <MarketSortHeading column="value" label={text("career.market.column.value")} sort={sort} onSort={handleSort} />
                      <th scope="col">{text("career.market.column.askingOrFee")}</th>
                      <MarketSortHeading column="contract" label={text("career.market.column.contract")} sort={sort} onSort={handleSort} />
                      <MarketSortHeading column="eligibility" label={text("career.market.column.eligibility")} sort={sort} onSort={handleSort} />
                      <th scope="col"><span className="tls-visually-hidden">{text("career.market.column.inspect")}</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageView?.rows.map((row) => (
                      <MarketRow
                        key={row.playerId}
                        language={language}
                        row={row}
                        text={text}
                        onOpen={() => setOpenPlayerId(row.playerId)}
                      />
                    ))}
                  </tbody>
                </table>
              </m.div>
            )}
            {pageView === undefined ? null : (
              <MarketPagination
                pageView={pageView}
                text={text}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </section>

      <CareerMarketPlayerDialog
        detail={detail}
        language={language}
        marketCommandPending={marketCommandPending}
        negotiation={view.status === "ready" && detail !== undefined
          ? view.negotiations.find((candidate) => candidate.playerId === detail.playerId && candidate.lifecycle === "pending")
          : undefined}
        text={text}
        previewOffer={previewOffer}
        onClose={() => setOpenPlayerId(undefined)}
        onMarketCommand={onMarketCommand}
      />
    </AppShell>
  );

  function handleSort(nextSort: CareerMarketTargetSort): void {
    setSort(nextSort);
    setPage(1);
  }
}

function MarketFinanceStrip({
  view,
  language,
  text,
}: Readonly<{
  view: Extract<ReturnType<typeof buildCareerMarketView>, { status: "ready" }>;
  language: WebPreferences["language"];
  text: Translator;
}>): React.JSX.Element {
  const formatMoney = (amount: number): string => formatMoneyFromMinorUnits(
    amount,
    view.finance.currency,
    language,
    "whole",
  );
  return (
    <section className="tls-market-finance-strip" aria-label={text("career.market.summary")}>
      <div className="tls-market-window" data-status={view.window.status}>
        <CalendarClock aria-hidden="true" size={22} strokeWidth={1.7} />
        <div>
          <span>{text("career.market.window")}</span>
          <strong>
            {view.window.status === "open"
              ? text("career.market.window.open", { date: view.window.closesOnIso })
              : view.window.nextOpensOnIso === undefined
                ? text("career.market.window.closed")
                : text("career.market.window.closedUntil", { date: view.window.nextOpensOnIso })}
          </strong>
        </div>
      </div>
      <div>
        <WalletCards aria-hidden="true" size={20} />
        <span>{text("career.market.finance.transferBudget")}</span>
        <strong>{formatMoney(view.finance.transferBudget)}</strong>
      </div>
      <div>
        <BadgeEuro aria-hidden="true" size={20} />
        <span>{text("career.market.finance.wageHeadroom")}</span>
        <strong>{formatMoney(view.finance.annualWageHeadroom)}</strong>
      </div>
      <div>
        <BriefcaseBusiness aria-hidden="true" size={20} />
        <span>{text("career.market.finance.pendingExposure")}</span>
        <strong>{formatMoney(view.finance.pendingExposure.immediateCash)}</strong>
        <small>{text("career.market.finance.openTalks", {
          count: view.finance.pendingExposure.openNegotiationCount,
        })}</small>
      </div>
    </section>
  );
}

function MarketFilters({
  filters,
  language,
  text,
  total,
  visible,
  onChange,
  onReset,
}: Readonly<{
  filters: FilterDraft;
  language: WebPreferences["language"];
  text: Translator;
  total: number;
  visible: number;
  onChange: (filters: FilterDraft) => void;
  onReset: () => void;
}>): React.JSX.Element {
  const update = <Key extends keyof FilterDraft>(key: Key, value: FilterDraft[Key]): void => {
    onChange({ ...filters, [key]: value });
  };
  const updateAge = (
    key: "minimumAge" | "maximumAge",
    value: string,
  ): void => {
    const next = { ...filters, [key]: value };
    if (value.length > 0) {
      const selectedAge = Number(value);
      if (
        key === "minimumAge"
        && next.maximumAge.length > 0
        && selectedAge > Number(next.maximumAge)
      ) {
        next.maximumAge = value;
      }
      if (
        key === "maximumAge"
        && next.minimumAge.length > 0
        && selectedAge < Number(next.minimumAge)
      ) {
        next.minimumAge = value;
      }
    }
    onChange(next);
  };

  return (
    <section className="tls-market-filter-bar" aria-label={text("career.market.filters")}>
      <label className="tls-market-search">
        <Search aria-hidden="true" size={18} />
        <span className="tls-visually-hidden">{text("career.market.search")}</span>
        <input
          type="search"
          value={filters.query}
          placeholder={text("career.market.searchPlaceholder")}
          onChange={(event) => update("query", event.currentTarget.value)}
        />
      </label>
      <label>
        <span>{text("career.market.filter.role")}</span>
        <select value={filters.role} onChange={(event) => update("role", event.currentTarget.value as FilterDraft["role"])}>
          <option value="all">{text("career.market.filter.allRoles")}</option>
          {ROLE_OPTIONS.map((role) => (
            <option key={role} value={role}>
              {canonicalPlayerRoleCode(role)} · {text(`career.player.role.${role}` as MessageKey)}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>{text("career.market.filter.tier")}</span>
        <select
          value={filters.sourceTier}
          onChange={(event) => update(
            "sourceTier",
            event.currentTarget.value as FilterDraft["sourceTier"],
          )}
        >
          <option value="all">{text("career.market.filter.allTiers")}</option>
          <option value="first_division">{text("career.market.tier.first_division")}</option>
          <option value="second_division">{text("career.market.tier.second_division")}</option>
          <option value="third_division">{text("career.market.tier.third_division")}</option>
          <option value="free_agent">{text("career.market.tier.free_agent")}</option>
        </select>
      </label>
      <fieldset className="tls-market-range-filter">
        <legend>{text("career.market.filter.age")}</legend>
        <label className="tls-market-age-bound">
          <span>{text("career.market.filter.min")}</span>
          <select
            aria-label={text("career.market.filter.minimumAge")}
            value={filters.minimumAge}
            onChange={(event) => updateAge("minimumAge", event.currentTarget.value)}
          >
            <option value="">{text("career.market.filter.all")}</option>
            {MARKET_AGE_OPTIONS.map((age) => (
              <option key={age} value={age}>{age}</option>
            ))}
          </select>
        </label>
        <label className="tls-market-age-bound">
          <span>{text("career.market.filter.max")}</span>
          <select
            aria-label={text("career.market.filter.maximumAge")}
            value={filters.maximumAge}
            onChange={(event) => updateAge("maximumAge", event.currentTarget.value)}
          >
            <option value="">{text("career.market.filter.all")}</option>
            {MARKET_AGE_OPTIONS.map((age) => (
              <option key={age} value={age}>{age}</option>
            ))}
          </select>
        </label>
      </fieldset>
      <label>
        <span>{text("career.market.filter.employment")}</span>
        <select value={filters.employment} onChange={(event) => update("employment", event.currentTarget.value as FilterDraft["employment"])}>
          <option value="all">{text("career.market.filter.all")}</option>
          <option value="contracted">{text("career.market.employment.contracted")}</option>
          <option value="free_agent">{text("career.market.employment.free_agent")}</option>
        </select>
      </label>
      <label>
        <span>{text("career.market.filter.contract")}</span>
        <select value={filters.contractHorizon} onChange={(event) => update("contractHorizon", event.currentTarget.value as FilterDraft["contractHorizon"])}>
          <option value="all">{text("career.market.filter.all")}</option>
          <option value="expiring">{text("career.market.contractHorizon.expiring")}</option>
          <option value="secure">{text("career.market.contractHorizon.secure")}</option>
          <option value="free_agent">{text("career.market.contractHorizon.free_agent")}</option>
        </select>
      </label>
      <fieldset className="tls-market-range-filter">
        <legend>{text("career.market.filter.value")}</legend>
        <input
          aria-label={text("career.market.filter.minimumValue")}
          inputMode="decimal"
          placeholder={text("career.market.filter.min")}
          type="text"
          value={filters.minimumValue}
          onBlur={() => update("minimumValue", normalizeValueBound(filters.minimumValue, language))}
          onChange={(event) => update("minimumValue", event.currentTarget.value)}
        />
        <input
          aria-label={text("career.market.filter.maximumValue")}
          inputMode="decimal"
          placeholder={text("career.market.filter.max")}
          type="text"
          value={filters.maximumValue}
          onBlur={() => update("maximumValue", normalizeValueBound(filters.maximumValue, language))}
          onChange={(event) => update("maximumValue", event.currentTarget.value)}
        />
      </fieldset>
      <label>
        <span>{text("career.market.filter.eligibility")}</span>
        <select value={filters.eligibility} onChange={(event) => update("eligibility", event.currentTarget.value as FilterDraft["eligibility"])}>
          <option value="all">{text("career.market.filter.all")}</option>
          <option value="actionable">{text("career.market.eligibility.actionable")}</option>
          <option value="blocked">{text("career.market.eligibility.blocked")}</option>
        </select>
      </label>
      <div className="tls-market-filter-summary">
        <span aria-live="polite">{text("career.market.visiblePlayers", { visible, total })}</span>
        <button className="tls-icon-button" title={text("career.market.resetFilters")} type="button" onClick={onReset}>
          <RotateCcw aria-hidden="true" size={17} />
          <span className="tls-visually-hidden">{text("career.market.resetFilters")}</span>
        </button>
      </div>
    </section>
  );
}

function MarketPagination({
  pageView,
  text,
  onPageChange,
}: Readonly<{
  pageView: ReturnType<typeof paginateCareerMarketTargetRows>;
  text: Translator;
  onPageChange: (page: number) => void;
}>): React.JSX.Element {
  return (
    <nav
      aria-label={text("career.market.pagination.navigation")}
      className="tls-market-pagination"
    >
      <span aria-live="polite">
        {text("career.market.pagination.results", {
          first: pageView.firstVisibleTarget,
          last: pageView.lastVisibleTarget,
          total: pageView.matchingTargetCount,
        })}
      </span>
      <div>
        <button
          disabled={pageView.currentPage === 1}
          type="button"
          onClick={() => onPageChange(pageView.currentPage - 1)}
        >
          <ChevronLeft aria-hidden="true" size={17} />
          {text("career.market.pagination.previous")}
        </button>
        <label>
          <span className="tls-visually-hidden">
            {text("career.market.pagination.select")}
          </span>
          <select
            aria-label={text("career.market.pagination.select")}
            value={pageView.currentPage}
            onChange={(event) => onPageChange(Number(event.currentTarget.value))}
          >
            {Array.from({ length: pageView.pageCount }, (_, index) => index + 1)
              .map((page) => <option key={page} value={page}>{page}</option>)}
          </select>
        </label>
        <span>
          {text("career.market.pagination.pageStatus", {
            page: pageView.currentPage,
            pages: pageView.pageCount,
          })}
        </span>
        <button
          disabled={pageView.currentPage === pageView.pageCount}
          type="button"
          onClick={() => onPageChange(pageView.currentPage + 1)}
        >
          {text("career.market.pagination.next")}
          <ChevronRight aria-hidden="true" size={17} />
        </button>
      </div>
    </nav>
  );
}

function MarketSortHeading({
  column,
  label,
  sort,
  onSort,
}: Readonly<{
  column: CareerMarketTargetSortKey;
  label: string;
  sort: CareerMarketTargetSort;
  onSort: (sort: CareerMarketTargetSort) => void;
}>): React.JSX.Element {
  const nextDirection = sort.key === column && sort.direction === "ascending"
    ? "descending"
    : "ascending";
  return (
    <th scope="col">
      <button
        aria-label={`${label}: ${nextDirection}`}
        data-active={sort.key === column}
        type="button"
        onClick={() => onSort({ key: column, direction: nextDirection })}
      >
        <span>{label}</span>
        <ChevronsUpDown aria-hidden="true" size={14} />
      </button>
    </th>
  );
}

function MarketRow({
  row,
  language,
  text,
  onOpen,
}: Readonly<{
  row: CareerMarketTargetRowView;
  language: WebPreferences["language"];
  text: Translator;
  onOpen: () => void;
}>): React.JSX.Element {
  const club = row.employment.status === "free_agent"
    ? text("career.market.employment.free_agent")
    : row.employment.clubName;
  const source = row.employment.status === "free_agent"
    ? text("career.market.tier.free_agent")
    : `${row.employment.competitionName} · ${text(
        `career.market.tier.${row.employment.sourceTier}` as MessageKey,
      )}`;
  return (
    <tr
      tabIndex={0}
      data-eligibility={row.eligibility.status}
      onClick={(event) => {
        if (isInteractiveMarketRowTarget(event.target, event.currentTarget)) return;
        onOpen();
      }}
      onKeyDown={(event) => {
        if (
          event.target === event.currentTarget
          && (event.key === "Enter" || event.key === " ")
        ) {
          event.preventDefault();
          onOpen();
        }
      }}
    >
      <th data-label={text("career.market.column.player")} scope="row">{row.displayName}</th>
      <td data-label={text("career.market.column.club")}>
        <span className="tls-market-club-source">
          <span>{club}</span>
          <small>{source}</small>
        </span>
      </td>
      <td data-label={text("career.market.column.age")} data-align="numeric">{row.age}</td>
      <td data-label={text("career.market.column.role")}>
        <abbr title={text(`career.player.role.${row.primaryRole}` as MessageKey)}>
          {canonicalPlayerRoleCode(row.primaryRole)}
        </abbr>
      </td>
      <td data-label={text("career.market.column.currentLevel")}>
        <PlayerStarRating
          label={text("career.market.column.currentLevel")}
          rating={row.currentRating}
          text={text}
        />
      </td>
      <td data-label={text("career.market.column.potentialLevel")}>
        <PlayerPotentialRangeRating
          currentRating={row.currentRating}
          language={language}
          range={row.potentialRange}
          text={text}
        />
      </td>
      <td data-label={text("career.market.column.value")} data-align="numeric">
        {formatMoneyFromMinorUnits(row.publicValue, row.currency, language, "whole")}
      </td>
      <td data-label={text("career.market.column.askingOrFee")} data-align="numeric">
        {row.employment.status === "free_agent"
          ? formatMoneyFromMinorUnits(row.freeAgentTransferFee ?? 0, row.currency, language, "whole")
          : formatMoneyFromMinorUnits(row.askingPrice ?? 0, row.currency, language, "whole")}
      </td>
      <td data-label={text("career.market.column.contract")}>
        {text(`career.market.contractHorizon.${row.contractHorizon}` as MessageKey)}
      </td>
      <td data-label={text("career.market.column.eligibility")}>
        <span className="tls-market-eligibility" data-status={row.eligibility.status}>
          {row.eligibility.status === "allowed"
            ? text(`career.market.action.${row.eligibility.action}` as MessageKey)
            : text(`career.market.blockReason.${row.eligibility.reason}` as MessageKey)}
        </span>
      </td>
      <td data-label={text("career.market.column.inspect")}>
        <button
          aria-label={text("career.market.openProfile", { player: row.displayName })}
          className="tls-icon-button"
          title={text("career.market.openProfile", { player: row.displayName })}
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onOpen();
          }}
        >
          <Eye aria-hidden="true" size={17} />
        </button>
      </td>
    </tr>
  );
}

const MARKET_ROW_INTERACTIVE_SELECTOR = [
  "button",
  "input",
  "select",
  "textarea",
  "a",
  "label",
  "form",
  "[role='button']",
  "[role='menu']",
  "[role='menuitem']",
  "[role='tab']",
  "[contenteditable='true']",
].join(", ");

/** Prevents nested controls from activating their owning keyboard-clickable row. */
export function isInteractiveMarketRowTarget(
  target: EventTarget | null,
  row: HTMLTableRowElement,
): boolean {
  if (target === row || target === null) return false;
  const closest = (target as Partial<Element>).closest;
  return typeof closest === "function"
    && closest.call(target, MARKET_ROW_INTERACTIVE_SELECTOR) !== null;
}

function MarketState({
  alert = false,
  title,
  summary,
}: Readonly<{
  alert?: boolean;
  title: string;
  summary?: string;
}>): React.JSX.Element {
  return (
    <div className="tls-market-state" {...(alert ? { role: "alert" } : {})}>
      <strong>{title}</strong>
      {summary === undefined ? null : <p>{summary}</p>}
    </div>
  );
}

function buildFilters(
  filters: FilterDraft,
  language: WebPreferences["language"],
): CareerMarketTargetFilters {
  const minimumAge = parseInteger(filters.minimumAge);
  const maximumAge = parseInteger(filters.maximumAge);
  const minimumValue = parseMoney(filters.minimumValue, language);
  const maximumValue = parseMoney(filters.maximumValue, language);
  return {
    ...(filters.query.trim().length === 0 ? {} : { query: filters.query }),
    ...(filters.role === "all" ? {} : { role: filters.role }),
    ...(filters.sourceTier === "all" ? {} : { sourceTier: filters.sourceTier }),
    ...(minimumAge === undefined ? {} : { minimumAge }),
    ...(maximumAge === undefined ? {} : { maximumAge }),
    ...(filters.employment === "all" ? {} : { employment: filters.employment }),
    ...(filters.contractHorizon === "all" ? {} : { contractHorizon: filters.contractHorizon }),
    ...(minimumValue === undefined ? {} : { minimumValue }),
    ...(maximumValue === undefined ? {} : { maximumValue }),
    ...(filters.eligibility === "all" ? {} : { eligibility: filters.eligibility }),
  };
}

function parseInteger(value: string): number | undefined {
  if (value.trim().length === 0) return undefined;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : undefined;
}

/** Reads one typed value bound through the single shared locale-safe parser. */
function parseMoney(value: string, language: WebPreferences["language"]) {
  const parsed = parseMoneyInputToMinorUnits(value, language);
  return parsed.status === "valid" ? careerMoneyFromMinorUnits(parsed.minorUnits) : undefined;
}

/** Rewrites a readable value bound in the active locale, or keeps the draft. */
function normalizeValueBound(value: string, language: WebPreferences["language"]): string {
  const parsed = parseMoneyInputToMinorUnits(value, language);
  return parsed.status === "valid"
    ? formatMoneyInputFromMinorUnits(parsed.minorUnits, language)
    : value;
}
