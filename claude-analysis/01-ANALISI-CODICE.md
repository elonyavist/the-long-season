# Analisi 1 — Qualità, robustezza, semplicità e chiarezza del codice

> **Parte di una analisi in 3 documenti collegati:**
> - [README / Indice](./README.md)
> - **Analisi 1 — Codice** *(questo documento)*
> - [Analisi 2 — UI/UX e flusso di gioco](./02-ANALISI-UI-UX.md)
> - [Analisi 3 — Stato attuale e roadmap verso l'MVP completo](./03-ANALISI-STATO-E-ROADMAP.md)

**Data:** 2026-06-30 · **Baseline:** Fase 66 completata (lavoro 65/66 non committato)
**Metodo:** investigazione multi-agente (26 agenti, ~1,49M token, 453 letture/grep di codice reale) con **verifica avversariale** di ogni affermazione critica/high contro il codice **attuale** (non contro il documento di giugno). Ogni claim è citato `file:linea`. Le affermazioni dell'analisi 2026-06-25 sono state ri-testate: dove le Fasi 62–66 le hanno risolte è indicato **RISOLTO**; dove reggono ancora, **CONFERMATO**.

---

## 0. Sommario esecutivo

Il giudizio di fondo è invariato e va detto chiaro: **la parte difficile è fatta bene.** Determinismo airtight, layering imposto a build-time, core di dominio esemplare, e — novità importante — il **motore delle conseguenze ora esiste, è cablato ed è testato**. Il gate qualità è verde.

> **Gate verificato in prima persona:** `pnpm check` esce `0` — lint + dependency-cruiser + check testo localizzato + **846 test su 133 file** + typecheck di tutti i pacchetti, in ~6,6s.

I debiti sono **reali ma circoscritti e per lo più già noti/documentati**. Inventario verificato:

| Severità | Conteggio | Natura prevalente |
|---|---|---|
| 🔴 HIGH | 15 | Leve inerti (tattica/fitness), due-modelli generazione, identità fuori dal save, validazione save mancante, file-monstre CLI, pulsanti morti web |
| 🟠 MEDIUM | 26 | Duplicazione meccanica, taxonomy senza fonte unica, magic number di bilanciamento, god-file, copertura test "in profondità" |
| 🟡 LOW | 20 | Pulizia/coerenza, helper byte-identici, micro-inefficienze, monoliti CSS/labels |

I temi-radice che spiegano la maggior parte dei 61 problemi sono **pochi e ricorrenti** (§3): duplicazione meccanica di helper, proliferazione di tassonomie senza una fonte unica, leve portate ma inerti, validazione mancante sui confini di save, orchestrazione di gameplay fuoriuscita nel CLI. Nessuno richiede una riscrittura: sono estrazioni e cablaggi su codice che già funziona.

| Area | Voto | Sintesi |
|---|---|---|
| `domain` / `shared` | 🟢 | Core puro esemplare. Debiti: 4 tassonomie ruoli; identità giocatore fuori dall'entità durevole; `Club.reputation` grezzo; manca `createPlayer`. |
| `engine/match-engine` + `season` | 🟢 | Determinismo perfetto, pipeline pulita, **golden sentinel ora presente**. Debiti: knob tattici inerti, minuto piatto, magic number nel resolver. |
| `engine/career` | 🟢 | **Consequence engine + advanceCareerOneSeason RISOLTI e testati.** Debiti: `seasonId` ancora omesso nell'RNG di realizzazione; recupero fitness troppo veloce; conseguenze starter-only. |
| `content` | 🟡 | Generazione deterministica e curata. Debiti: **due modelli ability** (current vs potential/intake); pool nomi stranieri piccoli; build per-giocatore duplicata; tuning match in content. |
| `ui` (read-model) | 🟢 | Framework-free, prose-free, deterministico, ben testato. Debiti: bug etichetta punte; funzioni duplicate; categoria inbox a 2 valori; `kind` evento concatenato in chiave i18n. |
| `storage` / `i18n` / `sim-tools` | 🟡 | Infra disciplinata, i18n type-safe con parità 5 lingue testata. Debiti: **migrazione save = cast cieco**, `SaveMetadata` mai validato, nessuna dispatch di migrazione v2. |
| `apps/cli` | 🟢/🟡 | Superficie matura, parse separato dall'esecuzione. Debiti: **file-monstre** (`parse-career-args` 860, `report-data` 1478), parse args copia-incollato 5×, orchestrazione gameplay nel CLI. |
| `apps/web` | 🟡 | Disciplina di adapter eccellente, matchday ora cablato. Debiti: **4 pulsanti morti**, codice legacy morto, **nessuna persistenza**, stato lineup denormalizzato, 50 cast `as MessageKey`, god-file da 1671, CSS monolite. |

---

## 1. Punti di forza (verificati contro il codice attuale)

- **La legge del determinismo è onorata ovunque.** Zero `Math.random`/`Date`/`crypto` in `engine`, `domain`, `content`, e nel codice di produzione `web` (grep puliti). Ogni RNG è uno stream derivato per concern con `deriveRng` e chiavi esplicite (`match`, `chance-actors`, `chance-actor-assist`, `player-development-growth/decline/realization`). Ogni `sort` ha un tie-breaker finale deterministico (es. rating: `sideRank → registrationOrder → playerId localeCompare`, `player-match-rating.ts:265-274`).
- **Confini architetturali eseguibili.** `dependency-cruiser` impone il grafo unidirezionale; `apps/web` importa il motore con **disciplina di adapter** (gli esiti passano sempre da use-case del motore, mai ricalcolati in React). `packages/ui` è **verificatamente** framework-free e prose-free (grep `react/document/window` = nessun match).
- **Core di dominio robusto.** ID branded validati da un gate unico che rigetta valori vuoti/non-prefissati/integer-like; value-object numerici clampati al confine (`AbilityValue` 0-20, `Money` minor-units); `createPersonIdentity` è un factory cross-field reale; integrità referenziale validata in `createCareerState`.
- **i18n type-safe con parità garantita.** `MessageKey = keyof typeof EN_MESSAGES` → ogni chiave controllata a compile-time; un test impone parità completa sulle 5 lingue (`missingTranslationsFor === 0`); fallback deterministico verso l'inglese.
- **Match engine con seam pulito.** `OccasionResolver` è un'interfaccia iniettata: il modello aggregato può essere sostituito da un futuro resolver a duelli senza toccare il loop dei minuti. La resume staged half-time/full-time ricostruisce il cursore RNG ri-giocando il primo tempo dall'XI iniziale → le sostituzioni non corrompono il replay (`staged-match-progression.ts:231-247`).

---

## 2. Cosa è cambiato dall'analisi 2026-06-25 (verificato)

Le Fasi 62–66 hanno chiuso **tre delle quattro criticità HIGH/CRITICAL** del documento precedente:

| Affermazione precedente | Verdetto attuale | Prova |
|---|---|---|
| "Manca il motore delle conseguenze: forma/morale congelati in-stagione" | ✅ **RISOLTO** | `career-match-state-consequences.ts` cablato in `progress-fixture.ts:17-21`; forma e morale mutano dopo la fixture con causali; suite dedicate (`career-match-state-consequences.test.ts`, `progress-fixture.test.ts` ~18KB). |
| "Nessun orchestratore di rollover; due pipeline CLI divergenti (T1)" | ✅ **RISOLTO** | `advanceCareerOneSeason` (`advance-career-season.ts`) è ora il path canonico; i path CLI vi confluiscono. |
| "Nessun golden pinnato per `simulateSeason`" | ✅ **RISOLTO** | "compact golden sentinel" che congela tabella finale/tiri/eventi (`simulate-season.test.ts:59-169`, Fase 62). |
| "Web non gioca mai una partita; `open_matchday` senza case nello store" | ✅ **RISOLTO** | `career-ui-store.ts` ora cabla `open_matchday` + matchday staged end-to-end. |
| RNG di realizzazione omette `seasonId` (`player-development.ts:561`) | 🟠 **CONFERMATO** (impatto sfumato) | Linea 561 usa `deriveRng(worldSeed, "player-development-realization", player.id)` — **senza** `seasonId`, mentre growth/decline (491-492) lo includono. Modificatore di realizzazione congelato per l'intera carriera. |
| Recupero fitness annulla il costo partita → rotazione non morde | 🔴 **CONFERMATO** | Recupero 5/giorno × 7 (cadenza calendario fissa a 7gg) = 35 ≫ costo 8 → reset settimanale di fatto. |
| Due modelli ability paralleli | 🔴 **CONFERMATO** | `buildRoleAwarePlayerAbilities` (current) vs `buildPlayerAbilitiesForPosition` 7-template (potential e intake). |
| Suite Playwright orfana | 🔴 **CONFERMATO** | 2933 LOC su 10 spec; nessun comando le esegue (`apps/web` test esclude `src/visual-qa/**`, e la root vitest globba solo `packages/**`). |
| Nessuna persistenza web | 🔴 **CONFERMATO** | `create()` zustand puro, nessun `persist`, nessuna dipendenza da `@game/storage`. Reload = perdita carriera. |
| Scalata + economia non costruite | 🔴 **CONFERMATO** | Una sola `Competition`; `grep relegat` ~0 produttori; nessun `wage/salary/ticket/sponsor/stadium`. |
| Knob tattici inerti | 🔴 **CONFERMATO** | `pressing` consumato da nessun calcolo d'esito; `width/directness/risk` toccano solo l'etichetta del tipo di occasione (`step-match.ts:547-565`), non rate né qualità. |

**Lettura:** la spina dorsale del *fun* (loop reattivo + matchday giocabile + stagione canonica) è stata cablata. I debiti rimasti sono di **completezza** (persistenza, pilastri mancanti) e di **pulizia** (duplicazione, file-monstre), non di fondazione.

---

## 3. Temi trasversali (le radici, non i sintomi)

Aggregando i 61 problemi per causa-radice emergono pochi meccanismi ricorrenti:

### T1 — Leve portate ma inerti *(HIGH)*
Sottosistemi che validano e trasportano input che non producono effetto. Nel match engine: **`pressing` totalmente inerte**; `width/directness/risk` solo cosmetici (scelgono l'etichetta cross/counter/open_play, quindi *chi* segna, mai *se/quanto*); **il minuto non entra mai** in rate/qualità (minuto 3 ≡ minuto 89; 0-3 ≡ 0-0). Le sostituzioni a metà tempo **non cambiano la strength** → inerti sullo score. È dead-code *e* fun-killer insieme.

### T2 — Duplicazione meccanica di un piccolo set di helper *(HIGH/MEDIUM)*
`clamp()` verbatim in 3 file del match engine; `teamBySide`/`otherSide` re-implementati; helper di media-ability duplicati in `player-development`; `numberInRange`/`numberInFloatRange`/`potentialAtLeastCurrent`/`clubTierForReputation` copia-incollati nei 3 generatori di `content`; `--lang`/`--seed` parse copia-incollato in **5** file CLI; il check di mutua-esclusione **15×** in `parse-career-args.ts`; helper di storage byte-identici in 3 file. È *il meccanismo* per cui nascono i file-monstre e i bug "due-modelli".

### T3 — Tassonomie parallele senza una fonte unica *(HIGH/MEDIUM)*
Quattro vocabolari ruolo/posizione (`PlayerRole`, `CanonicalPlayerRole`, `PlayerPosition`, `FormationPositionFamily`) riconciliati da cross-walk mantenute a mano; `FormationPositionFamily` castato a `CanonicalPlayerRole` in modo non sicuro (valori extra degradano in silenzio). Stesso pattern in `content`: **due modelli ability** che producono *current* e *potential* incompatibili per lo stesso giocatore (l'intake usa addirittura un terzo percorso).

### T4 — Validazione mancante sui confini durevoli *(HIGH)*
**Migrazione game-save = cast cieco**: `GameState` mai validato in load; `SaveMetadata` mai validato; nessuna dispatch di migrazione (un save v1 diventa illeggibile appena `CURRENT` passa a v2). E **l'identità/nazionalità del giocatore vive fuori dall'entità durevole** → persa al save/load. `Club.reputation` è un numero grezzo non validato che guida la matematica economica. Diventa un crash reale appena arriva la persistenza web o uno schema v2.

### T5 — Orchestrazione di gameplay fuoriuscita nel CLI *(HIGH)*
`report-data.ts` (1478 righe) mescola shaping di report e orchestrazione del refresh stagione; il literal di avanzamento (`+365`, `nextSeasonId`) è duplicato. Va sollevato in `simulation-tools`/`content` così che il CLI passi candidati già costruiti.

### T6 — Copertura test invertita per *profondità* *(MEDIUM)*
Ottima ampiezza (846 test verdi, ogni builder e generatore ha la sua suite, golden sentinel ora presente). Ma: i moduli puri di parsing CLI e l'orchestrazione di `report-data.ts` **non hanno test diretti**; le 2933 LOC di Playwright sono orfane; alcuni esiti aggregati (`bestDefense`/`worstAttack`) e i path d'errore di calendario/migrazione non sono coperti.

---

## 4. Problemi puntuali per severità (selezione, con prova)

### 🔴 HIGH (15) — i più rilevanti
- **Knob tattici inerti** — `step-match.ts:325-344`, `aggregate-occasion-resolver.ts:77-91`. `pressing` inutilizzato; `width/directness/risk` solo etichetta. → cablare modificatori bounded (pressing→soppressione rate avversario + qualità propria; risk→rate su/resistenza giù) o documentare+testare l'inerzia esplicitamente.
- **Minuto statisticamente piatto** — nessun termine-minuto in rate/qualità; strength costante per 90′. → inviluppo temporale config-driven (spinta finale, modificatore "squadra che insegue", decadimento fitness in-match).
- **Recupero fitness > costo partita** — `player-state/fitness.ts:4-9,129-132`. Rotazione mai mordente. → alzare costo / abbassare recupero / pavimento di fatica residua + test "starter in match ravvicinati perde fitness".
- **Due modelli ability incompatibili** — `player-role-templates.ts` (7-template) vs `fake-players.ts:219` (banded). Current e potential dello stesso giocatore da modelli diversi; **l'intake usa il modello vecchio**. → estendere il path banded per emettere anche il tetto potential, ritirare `buildPlayerAbilitiesForPosition`, migrare l'intake.
- **Identità fuori dal save durevole** — nazionalità/identità in side-channel, persa al save/load. → promuovere `PersonIdentity` sull'entità `Player` (o mappa parallela in `GameState`), poi `createPlayer` factory.
- **`Club.reputation` grezzo non validato** che guida la matematica. → value-object `Reputation` + `createClub`.
- **Migrazione save = cast cieco** + **`SaveMetadata` mai validato** + **nessuna dispatch di migrazione v2** (`migrate-save.ts`, `json-game-storage.ts`). → `assertGameState`/`validateSaveMetadata` su load, throw `StorageError('save_unreadable')`.
- **File-monstre CLI**: `parse-career-args.ts` 860 righe (15 check di mutua-esclusione byte-identici); `report-data.ts` 1478 righe (shaping + orchestrazione). → collassare a un guard `selectedMode`, sollevare l'orchestrazione fuori dal CLI.
- **`--lang`/`--seed` copia-incollato in 5 file CLI**; moduli di parse e `report-data` **senza test diretti**. → modulo `cli-args/` condiviso + test puri sulle mutue-esclusioni.
- **4 pulsanti azione morti nel web** — `build-career-dashboard-view.ts`, `career-dashboard-presenter.ts`. `Inspect squad/lineup/tactic/table` resi *available* ma `onClick → undefined`. → dare handler reali, o non emetterli come available, o renderli disabilitati.

### 🟠 MEDIUM (26) — selezione
- `seasonId` omesso nell'RNG di realizzazione (`player-development.ts:561`) → modificatore congelato per carriera *(diverge dallo spec; impatto sfumato ma reale)*.
- Conseguenze post-partita **starter-only e sub-blind**: le sostituzioni interattive a metà tempo non alimentano i delta forma/morale.
- Magic number di bilanciamento hardcoded nel resolver (block 0.08, save 0.22, pesi qualità 0.7/0.3…) fuori da `MatchEngineConfig`.
- Vocabolario eventi povero (`goal/save/miss/block`); `set_piece`/`dead_ball` definiti ma **branch irraggiungibili** (dead code).
- `engine/index.ts` god-barrel da 201 righe che ri-esporta l'intera superficie career + simboli domain.
- `content`: build per-giocatore duplicata nei 3 generatori; **pool nomi stranieri**: 13 culture su 16 con solo 36 combo uniche (rischio cloni); tuning match **duplicato** tra `content` e il demo web (drift).
- `ui`: etichette punte `st-right`/`st-left` collassate in `…slot.st`; `event.kind` open-ended concatenato in chiave i18n senza validazione; categoria inbox a 2 valori.
- `storage`: `listSaves` contamina envelope career come game-save.
- `web`: stato lineup **denormalizzato** (`tacticalBoardDraft` + `selectedPlayerIdsBySlot`); **50 cast `as MessageKey`** che aggirano il type-safety i18n; `matchday-demo.ts` god-file da 1671 righe.

### 🟡 LOW (20) — pulizia/coerenza
Helper byte-identici (`findDuplicatePlayerIds`/`findDuplicateBenchPlayerIds`; `orderEvents`/`compareEvents` duplicati con formule player-impact divergenti); **codice legacy morto** (`TacticalPitchLineup.tsx` + `campo-calcio.svg` + CSS orfano, tenuti vivi solo da test/spec stale); `components.css` monolite 2059 righe (82% del CSS web); `labels.ts` monolite 4799 righe; attribuzione marcatore che ignora la finitura individuale; doc che dichiara "dependency-free" un modulo che dipende da `@game/domain`.

---

## 5. Raccomandazioni di qualità (prioritizzate)

> Ordinate per leverage. Le voci che intersecano *fun*/prodotto rimandano alla [Analisi 3](./03-ANALISI-STATO-E-ROADMAP.md).

| # | Intervento | Sforzo | Perché |
|---|---|---|---|
| **C1** | **Validatori su load + identità nel save durevole**: `assertGameState`/`validateSaveMetadata`, dispatch di migrazione, `PersonIdentity` sull'entità, `createPlayer`/`createClub` con `Reputation` branded. | M | Prerequisito **bloccante** della persistenza web (Analisi 3 / Fase 67): senza, un save editato/stale o uno schema v2 è un crash. Chiude T4. |
| **C2** | **Counting-RNG test** (minuto a zero occasioni consuma RNG identico) a complemento del golden ora esistente, **prima** di toccare bilanciamento/generazione. | S | Assicurazione più economica per il vincolo #1 (determinismo) prima di C5/C6. |
| **C3** | **Estrarre helper puri condivisi**: `clamp`/`teamBySide`/medie-ability/età-con-bisestili nel posto giusto (`shared`/`domain`); modulo `cli-args/`; collassare i 15 check di mutua-esclusione e i 50 `as MessageKey`. | M (incrementale) | Ripaga T2, sgonfia i file-monstre, rimuove il meccanismo dei bug ricorrenti. Basso rischio. |
| **C4** | **Unificare la generazione su un modello ability** (banded che emette anche il tetto potential; migrare intake; builder per-giocatore condiviso). | M | Chiude T3 lato content + il collasso ruoli + la duplicazione. Gate obbligatorio col calibration-report. |
| **C5** | **Pulizia mirata**: eliminare il pitch legacy morto (~342 LOC) + CSS orfano + spec stale; rendere eseguibile (o jsdom-portare) la suite Playwright nel `check`/CI. | S–M | Toglie dead-code reale e fa sì che il codice più interattivo sia finalmente protetto (serve a Fase 67/68). |
| **C6** | **Bilanciamento data-driven**: sollevare block/save + pesi qualità + divisori-separazione in `MatchEngineConfig`; spostare il tuning match da `content` a `engine`. | M | Abilita il tuning sicuro (col golden di C2) e prepara il cablaggio dei knob (T1). |
| **C7** | **Sollevare l'orchestrazione fuori dal CLI** (`report-data.ts`) in `simulation-tools`; splittare i file >800 righe attorno a confini di concetto. | M | Chiude T5, riduce i file-monstre, sposta logica gameplay-defining in codice motore testabile. |

---

### Collegamenti
- L'impatto *user-facing* di questi debiti (match "scatola nera", knob inerti, pulsanti morti, etichetta "unknown") è in **[Analisi 2 — UI/UX](./02-ANALISI-UI-UX.md)**.
- La sequenza che intreccia questi fix con i pilastri mancanti (persistenza→mercato→giovani→economia→Scalata→10 stagioni) è in **[Analisi 3 — Stato e Roadmap](./03-ANALISI-STATO-E-ROADMAP.md)**.
