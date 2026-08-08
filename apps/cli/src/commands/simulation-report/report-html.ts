import {
  canonicalSimulationReportJson,
  type SimulationReportArtifact,
  type SimulationReportJsonValue,
  type SimulationReportSection,
} from "@game/simulation-tools";
import { createTranslator, type MessageKey } from "@game/i18n";

const english = createTranslator("en");

/**
 * Builds the self-contained English desktop view from canonical report facts.
 *
 * It performs presentation joins only. No rate, threshold, rank or decision is
 * recalculated here; values and row order arrive from the artifact unchanged.
 */
export function renderSimulationReportHtml(report: SimulationReportArtifact): string {
  const observed = report.sections.filter(
    (section): section is Extract<SimulationReportSection, { status: "observed" }> =>
      section.status === "observed",
  );
  const navigation = observed.map((section) =>
    `<a href="#section-${escapeAttribute(section.id)}">${escapeHtml(titleFor(section.id))}</a>`
  ).join("");
  const sections = observed.map(renderSection).join("");
  const reportJson = escapeScriptJson(canonicalSimulationReportJson(report));

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(english("simulationReport.html.documentTitle"))}</title>
  <style>
    :root{--paper:#f2efe5;--ink:#17201b;--muted:#667068;--line:#c9c9b9;--green:#183f31;--lime:#c9ff5f;--red:#a33b32;--panel:#faf8f0}*{box-sizing:border-box}html{scroll-behavior:auto}body{margin:0;background:var(--paper);color:var(--ink);font:14px/1.45 Georgia,"Times New Roman",serif}header{background:var(--green);color:#fff;padding:30px 42px 24px;border-bottom:6px solid var(--lime)}.kicker{font:700 11px/1.2 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.18em;text-transform:uppercase;color:var(--lime)}h1{font-size:38px;line-height:1;margin:9px 0 16px;font-weight:500}.mast{display:grid;grid-template-columns:repeat(5,minmax(120px,1fr));gap:18px;border-top:1px solid #ffffff33;padding-top:16px}.label{display:block;color:#b9c8c0;font:10px/1.3 ui-monospace,SFMono-Regular,Menlo,monospace;text-transform:uppercase;letter-spacing:.09em}.value{font:700 14px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace}.decision{color:var(--lime)}nav{position:sticky;top:0;z-index:2;display:flex;gap:5px;overflow:hidden;background:#e5e2d7;border-bottom:1px solid var(--line);padding:9px 42px}nav a{color:var(--green);text-decoration:none;font:700 11px/1 ui-monospace,SFMono-Regular,Menlo,monospace;text-transform:uppercase;padding:8px 10px;border:1px solid transparent}nav a:focus,nav a:hover{outline:none;border-color:var(--green);background:var(--panel)}main{padding:24px 42px 60px;min-width:980px}.report-section{scroll-margin-top:58px;margin:0 0 34px;border-top:3px solid var(--ink)}.section-head{display:flex;justify-content:space-between;align-items:baseline;padding:11px 0 9px}.section-head h2{font-size:25px;font-weight:500;margin:0}.section-id{font:11px ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--muted)}.section-overview{display:flex;justify-content:space-between;align-items:end;gap:18px;margin:0 0 12px}.section-overview .cards{flex:1}.selectors{display:flex;gap:9px}.selectors label{display:grid;gap:4px;color:var(--muted);font:700 10px ui-monospace,SFMono-Regular,Menlo,monospace;text-transform:uppercase}.selectors select{min-width:210px;border:1px solid var(--green);border-radius:0;background:#fff;color:var(--ink);padding:8px 30px 8px 9px;font:12px ui-monospace,SFMono-Regular,Menlo,monospace}.selectors select:focus{outline:3px solid var(--lime);outline-offset:1px}.world{background:var(--panel);border:1px solid var(--line);margin:0 0 16px}.world>summary{background:#dedccf;font:700 12px ui-monospace,SFMono-Regular,Menlo,monospace}.season{padding:0}.season>summary{font-size:12px}.season-body{padding:13px}.season-body h4{margin:0 0 9px;font-size:16px}.cards{display:grid;grid-template-columns:repeat(4,minmax(160px,1fr));gap:8px}.card{border:1px solid var(--line);padding:12px;background:#fff}.card strong{display:block;font:700 19px ui-monospace,SFMono-Regular,Menlo,monospace}.section-overview .card strong{font-size:16px}.table-wrap{overflow:auto;border:1px solid var(--line);background:#fff}table{width:100%;border-collapse:collapse;font-variant-numeric:tabular-nums}th{position:sticky;top:0;background:#e7e5da;color:#34433a;text-align:left;font:700 10px ui-monospace,SFMono-Regular,Menlo,monospace;text-transform:uppercase;letter-spacing:.04em}th,td{padding:7px 9px;border-bottom:1px solid #e5e3d9;white-space:nowrap}tbody tr:nth-child(even){background:#faf9f4}.empty,.raw{padding:16px;color:var(--muted)}details{border-top:1px solid var(--line)}summary{cursor:pointer;padding:10px 13px;font:700 11px ui-monospace,SFMono-Regular,Menlo,monospace}.raw pre{white-space:pre-wrap;max-height:460px;overflow:auto;font:11px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace}.meta-note{font-size:12px;color:var(--muted)}footer{padding:20px 42px;background:#dddacf;border-top:1px solid var(--line);font:11px ui-monospace,SFMono-Regular,Menlo,monospace}@media(max-width:1000px){body{min-width:1000px}}
  </style>
</head>
<body>
  <header>
    <div class="kicker">${escapeHtml(english("simulationReport.html.kicker"))}</div>
    <h1>${escapeHtml(english("simulationReport.html.title"))}</h1>
    <div class="mast">
      ${metric(english("simulationReport.output.decision"), report.decision, "decision")}
      ${metric(english("simulationReport.output.worlds"), report.measurementRequest.worldCount)}
      ${metric(english("simulationReport.html.seasonsPerWorld"), report.measurementRequest.seasonCount)}
      ${metric(english("simulationReport.html.detail"), report.measurementRequest.detail)}
      ${metric(english("simulationReport.html.hash"), report.reportHash.slice(0, 16))}
    </div>
  </header>
  <nav>${navigation}</nav>
  <main>${sections || `<p class="empty">${escapeHtml(english("simulationReport.html.noObservedModules"))}</p>`}</main>
  <footer>${escapeHtml(english("simulationReport.html.contract"))} ${escapeHtml(report.contractVersion)} · ${escapeHtml(english("simulationReport.html.embeddedJson"))}</footer>
  <script id="simulation-report-json" type="application/json">${reportJson}</script>
  <script>${drilldownScript()}</script>
</body>
</html>\n`;
}

function renderSection(section: Extract<SimulationReportSection, { status: "observed" }>): string {
  const content = renderKnownSection(section.id, section.data);
  return `<section class="report-section" id="section-${escapeAttribute(section.id)}"><div class="section-head"><h2>${escapeHtml(titleFor(section.id))}</h2><span class="section-id">${escapeHtml(section.id)} · observed</span></div>${content}</section>`;
}

function renderKnownSection(id: string, data: SimulationReportJsonValue): string {
  const root = record(data);
  const worlds = array(root?.worlds);
  if (worlds !== undefined) {
    const seasonCount = worlds.reduce<number>((count, world) =>
      count + seasonsForWorld(id, record(world)).length, 0);
    return `${renderDimensionOverview(id, worlds, seasonCount)}${worlds.map((world, index) =>
      renderWorld(id, record(world), index + 1)).join("")}`;
  }
  return rawDetails(data);
}

function renderWorld(sectionId: string, world: Readonly<Record<string, SimulationReportJsonValue>> | undefined, index: number): string {
  if (world === undefined) return `<div class="world"><p class="empty">${escapeHtml(english("simulationReport.html.malformedWorld"))}</p></div>`;
  const seed = stringValue(world.seed) ?? `${english("simulationReport.html.world")} ${index}`;
  const seasons = seasonsForWorld(sectionId, world);
  if (seasons.length > 0) {
    return `<details class="world" data-world-index="${index - 1}"${index === 1 ? " open" : ""}><summary>${escapeHtml(seed)}</summary>${seasons.map((season, seasonIndex) =>
      renderSeason(sectionId, season, seasonIndex)).join("")}</details>`;
  }
  return `<details class="world" data-world-index="${index - 1}"${index === 1 ? " open" : ""}><summary>${escapeHtml(seed)}</summary>${rawDetails(world)}</details>`;
}

function renderSeason(
  sectionId: string,
  season: Readonly<Record<string, SimulationReportJsonValue>> | undefined,
  index: number,
): string {
  if (season === undefined) return `<div class="season empty">${escapeHtml(english("simulationReport.html.malformedSeason"))}</div>`;
  const number = primitive(season.seasonNumber) ?? "?";
  const label = `${escapeHtml(english("simulationReport.html.season"))} ${escapeHtml(String(number))}`;
  const body = renderSeasonBody(sectionId, season);
  return `<details class="season" data-season-index="${index}" data-season-label="${escapeAttribute(String(number))}"${index === 0 ? " open" : ""}><summary>${label}</summary><div class="season-body">${body}</div></details>`;
}

function renderSeasonBody(
  sectionId: string,
  season: Readonly<Record<string, SimulationReportJsonValue>>,
): string {
  if (sectionId === "standings" || sectionId === "transfers") return tableFrom(array(season.rows));
  if (sectionId === "players") {
    return `<h4>${escapeHtml(english("simulationReport.html.topScorers"))}</h4>${tableFrom(array(season.topScorers))}<h4>${escapeHtml(english("simulationReport.html.topAssists"))}</h4>${tableFrom(array(season.topAssists))}`;
  }
  if (sectionId === "formations") {
    return `${cardsFrom(season, ["distinctFormationCount", "fallbackSelectionCount"])}${tableFrom(array(season.rows))}`;
  }
  if (sectionId === "season") {
    return cardsFrom(season, ["championClubId", "championPoints", "lastClubId", "lastPoints", "fixtureCount", "drawCount", "transferTurnoverCount"]);
  }
  return rawDetails(season);
}

function seasonsForWorld(
  sectionId: string,
  world: Readonly<Record<string, SimulationReportJsonValue>> | undefined,
): readonly Readonly<Record<string, SimulationReportJsonValue>>[] {
  if (world === undefined) return [];
  const seasons = array(world.seasons)?.map(record).filter(isDefined);
  if (seasons !== undefined) return seasons;
  if (sectionId !== "transfers") return [];
  const grouped = new Map<string, SimulationReportJsonValue[]>();
  for (const row of array(world.rows) ?? []) {
    const seasonNumber = primitive(record(row)?.seasonNumber);
    const key = seasonNumber === undefined ? "?" : String(seasonNumber);
    const rows = grouped.get(key) ?? [];
    rows.push(row);
    grouped.set(key, rows);
  }
  return [...grouped].map(([seasonNumber, rows]) => ({ seasonNumber, rows }));
}

function renderDimensionOverview(
  sectionId: string,
  worlds: readonly SimulationReportJsonValue[],
  seasonCount: number,
): string {
  const firstWorldSeasons = seasonsForWorld(sectionId, record(worlds[0]));
  return `<div class="section-overview"><div class="cards"><div class="card"><span class="label">${escapeHtml(english("simulationReport.html.worldsRetained"))}</span><strong>${worlds.length}</strong></div><div class="card"><span class="label">${escapeHtml(english("simulationReport.html.seasonViewsRetained"))}</span><strong>${seasonCount}</strong></div></div><div class="selectors"><label>${escapeHtml(english("simulationReport.html.worldSelector"))}<select data-world-selector>${worlds.map((world, index) => `<option value="${index}">${escapeHtml(stringValue(record(world)?.seed) ?? `${english("simulationReport.html.world")} ${index + 1}`)}</option>`).join("")}</select></label>${firstWorldSeasons.length > 0 ? `<label>${escapeHtml(english("simulationReport.html.seasonSelector"))}<select data-season-selector>${firstWorldSeasons.map((season, index) => `<option value="${index}">${escapeHtml(String(primitive(season.seasonNumber) ?? index + 1))}</option>`).join("")}</select></label>` : ""}</div></div>`;
}

function drilldownScript(): string {
  return `(()=>{for(const section of document.querySelectorAll('.report-section')){const worlds=[...section.querySelectorAll(':scope > details.world')];const worldSelect=section.querySelector('[data-world-selector]');const seasonSelect=section.querySelector('[data-season-selector]');if(!(worldSelect instanceof HTMLSelectElement)||worlds.length===0)continue;const apply=()=>{const worldIndex=Number(worldSelect.value);for(const [index,world] of worlds.entries()){world.hidden=index!==worldIndex;if(index===worldIndex)world.open=true}const selected=worlds[worldIndex];if(!(selected instanceof HTMLDetailsElement)||!(seasonSelect instanceof HTMLSelectElement))return;const seasons=[...selected.querySelectorAll(':scope > details.season')];seasonSelect.replaceChildren(...seasons.map((season,index)=>{const option=document.createElement('option');option.value=String(index);option.textContent=season.getAttribute('data-season-label')??String(index+1);return option}));for(const [index,season] of seasons.entries()){season.hidden=index!==0;if(index===0)season.open=true}seasonSelect.onchange=()=>{const selectedSeason=Number(seasonSelect.value);for(const [index,season] of seasons.entries()){season.hidden=index!==selectedSeason;if(index===selectedSeason)season.open=true}}};worldSelect.onchange=apply;apply()}})()`;
}

function tableFrom(rows: readonly SimulationReportJsonValue[] | undefined): string {
  if (rows === undefined || rows.length === 0) return `<p class="empty">${escapeHtml(english("simulationReport.html.noObservedRows"))}</p>`;
  const records = rows.map(record).filter((row): row is Readonly<Record<string, SimulationReportJsonValue>> => row !== undefined);
  const first = records[0];
  if (first === undefined) return rawDetails(rows);
  const columns = Object.keys(first);
  return `<div class="table-wrap"><table><thead><tr>${columns.map((column) => `<th>${escapeHtml(humanize(column))}</th>`).join("")}</tr></thead><tbody>${records.map((row) => `<tr>${columns.map((column) => `<td>${escapeHtml(display(row[column]))}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}

function cardsFrom(row: Readonly<Record<string, SimulationReportJsonValue>>, keys: readonly string[]): string {
  return `<div class="cards">${keys.flatMap((key) => row[key] === undefined ? [] : [`<div class="card"><span class="label">${escapeHtml(humanize(key))}</span><strong>${escapeHtml(display(row[key]))}</strong></div>`]).join("")}</div>`;
}

function rawDetails(value: unknown): string {
  return `<details><summary>${escapeHtml(english("simulationReport.html.canonicalFacts"))}</summary><div class="raw"><pre>${escapeHtml(canonicalSimulationReportJson(value))}</pre></div></details>`;
}

function metric(label: string, value: string | number, className = ""): string {
  return `<div><span class="label">${escapeHtml(label)}</span><span class="value ${className}">${escapeHtml(String(value))}</span></div>`;
}

function titleFor(id: string): string {
  const keys = {
    season: "simulationReport.module.season.title",
    standings: "simulationReport.module.standings.title",
    players: "simulationReport.module.players.title",
    transfers: "simulationReport.module.transfers.title",
    formations: "simulationReport.module.formations.title",
    economy: "simulationReport.module.economy.title",
    development: "simulationReport.module.development.title",
    anomalies: "simulationReport.module.anomalies.title",
    tactical_agency: "simulationReport.module.tacticalAgency.title",
    tactical_shape: "simulationReport.module.tacticalShape.title",
  } as const satisfies Readonly<Record<string, MessageKey>>;
  return keys[id as keyof typeof keys] === undefined
    ? humanize(id)
    : english(keys[id as keyof typeof keys]);
}

function humanize(value: string): string {
  return value.replaceAll("_", " ").replace(/([a-z])([A-Z])/g, "$1 $2");
}

function display(value: SimulationReportJsonValue | undefined): string {
  if (value === undefined) return english("simulationReport.html.notObserved");
  if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  return canonicalSimulationReportJson(value).replaceAll("\n", " ");
}

function primitive(value: SimulationReportJsonValue | undefined): string | number | boolean | null | undefined {
  return value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean" ? value : undefined;
}

function stringValue(value: SimulationReportJsonValue | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function record(value: unknown): Readonly<Record<string, SimulationReportJsonValue>> | undefined {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Readonly<Record<string, SimulationReportJsonValue>>
    : undefined;
}

function array(value: SimulationReportJsonValue | undefined): readonly SimulationReportJsonValue[] | undefined {
  return Array.isArray(value) ? value : undefined;
}

function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function escapeAttribute(value: string): string {
  return escapeHtml(value.replaceAll(/[^a-zA-Z0-9_-]/g, "-"));
}

function escapeScriptJson(value: string): string {
  return value.replaceAll("<", "\\u003c").replaceAll(">", "\\u003e").replaceAll("&", "\\u0026");
}
