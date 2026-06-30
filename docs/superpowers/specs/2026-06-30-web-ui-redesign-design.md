# Ridisegno UI/UX di `apps/web` — Design (approfondito)

- **Data:** 2026-06-30
- **Ambito:** `apps/web` (web career prototype)
- **Stato:** approvato in brainstorming; ground-truth del codice mappata; pronto per il piano di implementazione
- **Modalità di esecuzione richiesta:** micro-step, **uno alla volta**, ognuno verde (test + typecheck) prima del successivo (vedi §11).

---

## 1. Obiettivo

Rifare completamente la parte UI/UX di `apps/web`. Problemi attuali dichiarati: **estetica** (look generico, non premium) e **navigazione/struttura confusa** (4 schermate piene che si sostituiscono a vicenda). Target estetico: via di mezzo tra **Football Manager moderno** e **retrò**, resa **premium**.

Si conserva intatto un solo pezzo: il **campo tattico interattivo** — ruoli trascinabili + campo SVG con tutta la sua logica.

### 1.1 Decisioni di brainstorming (bloccate)
- **Navigazione:** shell con **sidebar persistente** (stile FM desktop) + rail destro persistente.
- **Identità:** dark + accento **ambra/oro** (`#d39a3c`, allineato all'oro esistente `#d9b95d`), titoli **serif display**, dati **sans**, numeri **serif tabulari**, scanline sottile, angoli squadrati.
- **Preparazione:** layout **A** (campo dominante a sinistra + pannello a tab a destra: Rosa · Tattica · Dettaglio; panchina sotto il campo).
- **Matchday:** **broadcast** (tabellone + feed eventi chiave a card + **una riga telecronaca** che cambia al prossimo evento + bottone-fase).
- **CSS:** Tailwind v4 (già cablato) per layout; layer token ridotto per identità.
- **Test:** riscritti insieme alla UI.
- **Campo:** logica + SVG invariati; solo il "contorno" (CSS chrome) ri-vestito.

---

## 2. Confini (con riferimenti reali)

### 2.1 INVARIATO — logica di dominio (nessuna modifica funzionale)
- Pacchetti workspace: `@game/engine`, `@game/ui` (`packages/ui/src/...`), `@game/i18n` (`packages/i18n/src/labels.ts`), `@game/shared`.
- Logica del campo in `apps/web/src/features/tactics-board/`:
  `tactical-board-geometry.ts`, `tactical-board-roles.ts`, `tactical-board-interactions.ts`,
  `tactical-board-suitability.ts`, `tactical-board-formations.ts`, `tactical-board-state.ts`,
  `tactical-board-bench.ts`, `tactical-board-squad.ts`, `tactical-board-adapters.ts`,
  `tactical-board-types.ts` + relativi `.test.ts`.
- `components/TacticalBoardPitchMarkings.tsx` (SVG del campo) — **byte-invariato**.
- Tutti gli handler pointer/drag/long-press/context-menu in `components/TacticalBoardPitch.tsx` — invariati.
- Store `stores/career-ui-store.ts`: stato + azioni invariati (eccetto rimozione `setThemePaletteId`, §10).

### 2.2 RI-VESTITO — solo CSS chrome del campo (logica intatta)
Componenti il cui CSS (classi in `components.css:32–412`) viene ri-vestito, **senza toccare gli handler**:
`TacticalBoardPitch.tsx` (header/wrapper/popover), `TacticalBoardPlayerToken.tsx`, `TacticalBoardEmptySlot.tsx`, `TacticalBoardMenu.tsx`, `TacticalBenchBoard.tsx`, `TacticalBenchSlotToken.tsx`.
Il contratto dei token che questi file leggono è in **§7 + Appendice C** (da non rinominare).

### 2.3 RICOSTRUITO da zero
| File | Ruolo dopo il rebuild |
|---|---|
| `app/App.tsx` | Sottile: monta `AppShell` + instrada per `screen`; rimuove effetto `data-theme-palette`. |
| `features/app-shell/AppShell.tsx` *(nuovo)* | Sidebar fissa + rail destro + slot contenuto. |
| `features/app-entry/AppEntryScreen.tsx` | Menu premium; **senza** selettore tema. |
| `features/dashboard/CareerDashboardScreen.tsx` | Dashboard dentro `AppShell`. |
| `features/career-shell/CareerShell.tsx` + `CareerInboxPanel.tsx` | Sostituiti da `AppShell` + nuovo pannello Posta (i file vecchi rimossi a fine migrazione). |
| `features/match-preparation/CareerMatchPreparationScreen.tsx` | Shell layout A attorno al campo conservato. |
| `features/matchday/CareerMatchdayScreen.tsx` | Broadcast. |
| `shared/ui/PlayerCandidateRow.tsx`, `PlayerFactPanel.tsx`, `SquadSelectionTable.tsx` | Ricostruiti su nuova pelle. |
| `styles/base.css`, `styles/layout.css`, `styles/components.css` | Riscritti. |
| `styles/tokens.css` | Ridotto a una sola identità, token campo preservati. |
| `styles/tactical-board.css` *(nuovo)* | CSS del campo estratto da `components.css:32–412` e ri-vestito. |

### 2.4 RITOCCATO al minimo (logica/presenter — non rebuild totale)
- `features/app-entry/app-entry-view-model.ts`: rimuove `themePaletteOptions`/`selectedThemePaletteId`/`supportedThemePaletteIds` (§10).
- `features/dashboard/career-dashboard-presenter.ts`: invariato salvo eventuali campi tema; resta il trasformatore.
- `app/preferences.ts`: rimuove `themePaletteId` (§10).
- `app/theme-palettes.ts` (+ test): **rimosso** (§10).

---

## 3. Identità visiva

Si **evolvono** i token esistenti (la palette attuale è già dark navy + oro: `tokens.css:1–100`), non si riparte da zero.

### 3.1 Palette (valori target sui token)
- `--tls-theme-app-background` `#070b13` (resta).
- Superfici: shell/rail `#0d131a`, pannelli `#111922`, riga tabella/elevated coerenti.
- Accento primario: ambra/oro. Si **mantiene il nome** `--tls-theme-primary-action-surface`/`--tls-color-gold`, valore tarato su `#d39a3c` (CTA gradiente `#d39a3c → #a06f1f`); l'attuale `#d9b95d` è compatibile.
- Bordi/hairline: ambra a bassa opacità (token `--tls-theme-border` esistente).
- Colori semantici eventi (matchday): gol = accento ambra; cartellino = `#d8c23a`; infortunio = `#e2622f`; sostituzione = `#3b9ea5`. (Solo gol/sostituzione hanno dati reali oggi — §5.4.4.)

### 3.2 Tipografia
- Display **serif** via `--tls-font-display` (esiste: `"Palatino Linotype","Georgia",serif`) per titoli sezione, scoreboard, numeri-chiave.
- **Sans/UI** via `--tls-font-ui` per label, tabelle, controlli.
- Numeri tabulari: `font-variant-numeric: tabular-nums` su punteggi/classifiche/contatori.
- "Kicker" maiuscoletto spaziato (`letter-spacing` ampio, `text-transform:uppercase`, size xs) sopra i titoli.

### 3.3 Materiale retrò
- Overlay **scanline** (`repeating-linear-gradient` ~3px, opacità bassa) sulle superfici scure principali — riusare/evolvere `body::before` esistente (`base.css`).
- Angoli squadrati: `--tls-radius-sm` resta `3–4px`.
- Hairline ambra di separazione tra sidebar/contenuto/rail e tra header e corpo.

### 3.4 Stati
- Focus ring ambra: token `--tls-focus-ring` esistente (resta).
- Hover/disabled: definiti come utility/classi coerenti su tutti i bottoni.

---

## 4. Architettura: shell + navigazione

### 4.1 Modello
Shell con **sidebar persistente**. Sostituisce lo switch full-page: cambia il contenuto, la cornice (sidebar + rail) resta.

```
┌──────────┬───────────────────────────────┬───────────────┐
│ SIDEBAR  │ CONTENUTO (per sezione)        │ RAIL DESTRO   │
│ crest    │   <area schermata corrente>    │ [Continua ▸]  │
│ Dashboard│                                │ Prossima      │
│ Rosa     │                                │  partita      │
│ Tattica  │                                │ Posta · badge │
│ Calendario│                               │               │
│ Posta    │                                │               │
└──────────┴───────────────────────────────┴───────────────┘
```

### 4.2 `AppShell` (nuovo componente)
- **Props (bozza):**
  ```ts
  interface AppShellProps {
    readonly activeSectionKey: CareerShellSectionKey;     // da @game/ui
    readonly selectedClubName: string;
    readonly inboxView: CareerInboxView;                  // da @game/ui (buildCareerInboxView)
    readonly contextItems?: readonly { label: string; value: string }[];
    readonly continueEnabled: boolean;
    readonly nextFixtureSummary?: string;
    readonly text: Translator;
    readonly onNavigate?: (sectionKey: CareerShellSectionKey) => void;
    readonly onBackToMenu: () => void;
    readonly onContinueCareer: () => void;
    readonly onInboxActionClick: (actionId: string) => void;
    readonly children: React.ReactNode;
  }
  ```
- **Riusa `@game/ui`:** `buildCareerShellView` (`packages/ui/src/career/career-shell-view.ts:106`) per gli item di navigazione e i flag `showInboxRail`/`showGlobalcontinue`/`mode`; `buildCareerInboxView` per la Posta nel rail.
- **Mappa sidebar → `CareerShellSectionKey`** (già definito da `@game/ui`, valori: `dashboard | squad | tactics | fixtures | market | finances | facilities | youth | staff | archive`):
  - Dashboard → `dashboard`; Rosa → `squad`; Tattica → `tactics`; Calendario → `fixtures`; Posta → (rail, `CareerInboxView`).
  - Sezioni non ancora implementate (market/finances/...) restano fuori dalla sidebar v1 (YAGNI).

### 4.3 Instradamento in `App.tsx`
- Lo store mantiene `screen` (`app_entry | career_dashboard | match_preparation | matchday`).
- `app_entry` → `AppEntryScreen` a pieno schermo (fuori shell).
- Gli altri → `AppShell` con `activeSectionKey` derivata (dashboard→`dashboard`, match_preparation→`tactics`, matchday→`tactics`/`fixtures`) e il contenuto della schermata come `children`.
- Rimuove l'effetto `data-theme-palette` (§10).

### 4.4 Responsive
- < ~980px: sidebar collassa a icone; rail va in fondo; contenuto a colonna singola.
- < ~620px: tutto in colonna; il campo resta a piena larghezza. Desktop-first, mobile garantito ma non dedicato.

---

## 5. Schermate (dettaglio con view-model reali)

### 5.1 App entry (pieno schermo, fuori shell)
- **Dati:** `WebAppEntryView` (da `buildAppEntryViewModel`) — dopo §10 contiene `selectedLanguageKey`, `selectedCurrencyKey`, `supportedLanguageKeys`, `supportedCurrencyKeys`, `actions` (con `start_new_career`, `continue_career` + `unavailableReasonKey`).
- **UI:** titolo gioco; **Nuova carriera** (sempre attivo) / **Continua** (attivo solo se azione `available`, altrimenti mostra `unavailableReasonKey`); impostazioni **lingua** (5 lingue: en/it/de/es/fr) e **valuta**. **Nessun selettore tema.**

### 5.2 Dashboard
- **Dati:** `CareerDashboardPresentation` (presenter) su `CareerDashboardView` (`packages/ui/src/career/career-dashboard-view.ts:114`): `context`, `selectedClub`, `nextFixture`, `preparation`, `conditionSummary`, `tableContext`, `recentMatch`, `alertKeys`, `actions`.
- **UI:** kicker + titolo serif; card dati (posizione/punti/forma da `tableContext`/`conditionSummary`); blocco prossima partita (`nextFixture`); strip blocker (`alertKeys`); azione primaria dinamica (presenter: `canAdvanceNextFixture` → Matchday; blockers → Prepara; altrimenti Continua). Posta + Continua nel rail dello shell.

### 5.3 Preparazione / Tattica (layout A)
- **Dati:** `CareerMatchPreparationView` (`packages/ui/src/career/career-match-preparation-view.ts:283`): `selectedClub`, `nextFixture`, `status`, `formation` (`formations[]` con `isSelected`, `selectedFormationId`, `selectedSlots[]`), `lineup` (`slots[]` con `slotKey/labelKey/roleKey/selectedPlayerId?/status/playerOptions[]`, `selectedSlotCount`, `requiredSlotCount`), `bench` (analogo), `tactic` (`profiles[]` con `isSelected`), `blockerKeys`, `saveAction`, `summaryKey`.
- **Layout:**
  - **Sinistra (dominante):** toolbar (helper `auto`/`fill_gaps`/`clear` + `select` formazione da `formation.formations`) → **campo tattico** (componente conservato `TacticalBoardPitch`, props invariate) → **panchina** (`TacticalBenchBoard`) come striscia sotto.
  - **Destra:** pannello unico a **tab**:
    - *Rosa* → `SquadSelectionTable` (ricostruita).
    - *Tattica* → cards profili (`tactic.profiles`, valori mentality/pressing/directness/width/risk).
    - *Dettaglio* → `PlayerFactPanel` (ricostruito) sul giocatore focalizzato.
  - **Header:** titolo serif, contesto prossima partita, contatori slot (`lineup.selectedSlotCount/requiredSlotCount`, `bench...`), bottone **Salva** (abilitato solo se `saveAction.status === "available"`).
  - **Blocker strip:** semantica invariata (`blockerKeys`), ri-vestita.
- **Campo half-time riuso:** stesso componente, riusato dal matchday all'intervallo (§5.4.3).

### 5.4 Matchday (broadcast)

#### 5.4.1 Dati disponibili (importante)
- **`CareerMatchdayPhaseView`** (`packages/ui/src/career/career-matchday-phase-view.ts:164`) espone **già**: `phase` (`pre_match|first_half|half_time|second_half|full_time`), `status`, `periodLabelKey`, `currentMinute`, `scoreboard`, `timelineEvents[]`, `keyEventCards[]`, `playerRows[]`, `actions[]`, `nextActionId`, `conditionChanges[]`, `playerStateChanges[]`.
- **`CareerMatchdayView`** (post/pre, `career-matchday-view.ts:247`): `status`, `score`, `events[]`, `playerStats[]`, `conditionChanges[]`, `playerStateChanges[]`, `nextStop`.
- **State machine** in `matchday-demo.ts` (dual-track): `lastStagedAttempt.status` (`idle|blocked|at_half_time|substitutions_applied|full_time|invalid|already_played`) + `stagedProgress.snapshot.phase`. Azioni store: `playMatchdayFirstHalf`, `applyHalfTimeSubstitutions`, `playMatchdaySecondHalf`.

#### 5.4.2 Mappatura UI → dati
- **Tabellone** ← `phaseView.scoreboard` + `currentMinute` + `periodLabelKey`.
- **Feed eventi chiave** (card con icona/colore) ← `phaseView.keyEventCards[]`.
- **Riga telecronaca** (statica, cambia al prossimo evento; **niente marquee**) ← ultimo elemento rilevante di `phaseView.timelineEvents[]`, reso via i18n (minuto + `detailKeys` `chance:*`/`shot:*`). Non esiste uno stream di commento separato: si usa l'evento corrente.
- **Bottone-fase** (evolve) ← `phaseView.nextActionId` (`prepare_match → start_first_half → continue_to_half_time → apply_half_time_substitutions → start_second_half → continue_to_full_time → back_to_dashboard`), etichetta da `phaseView.actions[]`.
- **Tabella giocatori live** ← `phaseView.playerRows[]`.
- **Conseguenze full-time** ← `conditionChanges[]` + `playerStateChanges[]`.

#### 5.4.3 Intervallo (half-time)
- A `phase === "half_time"`: apertura **campo editabile** (riuso `TacticalBoardPitch` + bench) per sostituzioni, alimentato da `buildDemoHalfTimeSubstitutionPanel` (`status`, `lineup[]`, `bench[]`, `appliedSubstitutions[]`, `appliedCount`, `maxCount=5`, `validationReason?`).
- Callback già presenti nello store: `onApplyHalfTimeSubstitution`, `onHalfTimeFormationChange`, `onHalfTimeLineupPlayerChange`, `onHalfTimeBenchPlayerChange`, `onHalfTimeBoardSlotMove/RoleChange/Clear`, `onStartSecondHalf`.

#### 5.4.4 Onestà sui dati (vincolo di scope)
- Gli eventi engine oggi sono **solo `shot_outcome`** (`goal|save|miss|block`) + sostituzioni tracciate a parte (`appliedSubstitutions`). **Non esistono** cartellini, rigori, infortuni, né commento minuto-per-minuto.
- Quindi il feed eventi-chiave usa un **modello UI generico** (kinds: `goal | penalty | card | injury | substitution`) ma **solo `goal` + `substitution` sono cablati a dati reali**; gli altri kind restano predisposti nel componente ma **inerti** finché l'engine non li espone. Esporre nuovi eventi = lavoro engine = **fuori ambito**.
- La riga telecronaca deriva dagli `shot_outcome` esistenti, non da una nuova sorgente.

---

## 6. Strategia CSS / Tailwind

### 6.1 Approccio
- **Tailwind v4** (già cablato: `vite.config.ts` plugin + `@import "tailwindcss"` in `styles/index.css`) per layout/spacing/composizione delle nuove schermate.
- **Layer token** in `tokens.css` ridotto a una sola identità; esposto a Tailwind via blocco `@theme` così le utility (`bg-*`, `text-*`, `border-*`) usano gli stessi valori dell'identità (accento, superfici, font display/ui, radii).
- `base.css` (reset + scanline `body::before` + focus) e `components.css`/`layout.css` riscritti; le classi `tls-*` legacy non più usate vengono rimosse — **eccetto** quelle del campo, estratte in `tactical-board.css` (§6.3).

### 6.2 Mappa legacy → nuovo (per la pulizia)
`components.css` oggi = **2156 righe** con famiglie da rimuovere/rifare: `tls-dashboard-*`, `tls-matchday-*` **e** `tls-match-centre-*` (doppione legacy), `tls-preparation-*` (parte campo-non-SVG, es. `tls-preparation-pitch*`), `tls-player-candidate-*`, `tls-menu-button*`, shell nav. Da **preservare/estrarre**: tutte le `tls-tactical-board-*` e `tls-tactical-bench-*` (righe ~32–412).

### 6.3 Estrazione CSS campo
- Spostare il blocco `components.css:32–412` in un nuovo `styles/tactical-board.css` (import in `index.css`), **prima** di riscrivere il resto. Questo isola il chrome del campo: re-skin mirato senza rischio di trascinamento nella riscrittura generale.

### 6.4 Contratto compatibilità (vedi §7)
`tokens.css` ridotto deve continuare a definire **tutti** i token letti dal campo.

---

## 7. Contratto di compatibilità del campo (NON rompere)

Il campo conservato legge token CSS sia in TSX sia nelle regole CSS estratte. **Vietato rinominare/rimuovere** questi token quando si riduce `tokens.css`. Solo i **valori** possono cambiare.

- **Letti direttamente in TSX (`TacticalBoardPitchMarkings`):** `--tls-color-ink`, `--tls-color-paper-muted`.
- **Var runtime (impostate da `TacticalBoardPitch`, lasciare intatte):** `--tls-tactical-board-menu-left`, `--tls-tactical-board-menu-top`.
- **Set completo letto dal CSS del campo:** vedi **Appendice C** (≈30 token: spacing, font, colori token/pitch, theme accent/surface, bordi, raggi, ombre).
- **Literali da preservare (non tokenizzati):** grass `#6b834c`/`#637a44` in `TacticalBoardPitchMarkings`; rgba delle zone (active-zone/defense/midfield/attack) e dei token suitability (`#93bf64`, `#c8863b`) in `components.css:99–148`.

**Regola operativa:** prima di rimuovere un token da `tokens.css`, eseguire un grep su `features/tactics-board/` **e** su `styles/tactical-board.css`. Se compare, il token resta.

---

## 8. i18n

- **Catalogo unico:** `packages/i18n/src/labels.ts` (~4900 righe). `EN_MESSAGES` = sorgente di verità; `IT/DE/ES/FR_MESSAGES` = `Partial<Record<EnglishMessageKey,string>>`.
- **Parità imposta da test:** `packages/i18n/src/labels.test.ts` verifica `missingTranslationsFor(lang).length === 0` per **tutte e 5** le lingue. **Ogni nuova chiave va aggiunta a tutte e 5** o il test rompe.
- **Tipi:** `Translator = (key: MessageKey, vars?: MessageVariables) => string`; interpolazione `{var}`. In web via `createWebTranslator(language)` (`app/translation.ts`).
- **Regola no-hardcode:** nessuna stringa user-facing hard-coded nei componenti; tutto via `text(key)`. Riusare i namespace esistenti (`career.shell.nav.*`, `career.dashboard.*`, `career.matchPreparation.*`, `career.tacticalBoard.*`, `career.matchday.*`, `event.*`, `setup.*`, `common.*`, `lineup.role.*`). Nuove etichette → nuove chiavi in tutte e 5 le lingue.
- Le sezioni sidebar usano chiavi già presenti: `career.shell.nav.dashboard|squad|tactics|fixtures`.

---

## 9. Strategia di test

- Per **ogni** componente ricostruito, aggiornare/riscrivere il `.test.tsx` (rendering, callback, stati chiave) nello stesso step.
- Rifare gli scenari `visual-qa/*.spec.ts` per le nuove schermate (entry, dashboard, preparazione, matchday, accessibilità shell). Gli spec attuali (es. `retro-football-identity.spec.ts`, `tactics-workspace.spec.ts`, `shared-tactical-board.spec.ts`, `theme-palette.spec.ts`) vanno rivisti/rimpiazzati; `theme-palette.spec.ts` si **rimuove** (§10).
- I test della **logica del campo** (`tactical-board-*.test.ts`) devono restare **verdi senza modifiche**: se uno si rompe → regressione sul pezzo da conservare → **fermarsi**.
- `labels.test.ts` deve restare verde a ogni step che tocca le label.
- Obiettivo per-step: script `test` (vitest) + `typecheck` del pacchetto `@game/web` verdi.

---

## 10. Pulizia tema (una sola identità premium)

- `tokens.css`: rimuovere le palette `html[data-theme-palette="club-office"|"press-room"|"floodlight-navy"]` (la default `:root` = floodlight-navy, quindi resta un'unica identità su `:root`).
- `app/theme-palettes.ts` + `theme-palettes.test.ts`: **rimossi**.
- `app/preferences.ts`: rimuovere `themePaletteId` (+ aggiornare `preferences.test.ts`).
- `stores/career-ui-store.ts`: rimuovere `setThemePaletteId` (+ usi).
- `App.tsx`: rimuovere l'effetto `document.documentElement.dataset.themePalette`.
- `app-entry-view-model.ts`: rimuovere `themePaletteOptions`/`selectedThemePaletteId`/`supportedThemePaletteIds`; `AppEntryScreen` toglie il radio group tema.
- `visual-qa/theme-palette.spec.ts`: rimosso.

---

## 11. Roadmap a micro-step (uno alla volta)

Ogni step è piccolo, indipendente, **verde** (test + typecheck) e **committabile** (convenzione repo: commit "phase NN end" o equivalente). L'app resta funzionante a ogni step.

| # | Step | Scope | Done quando |
|---|------|-------|-------------|
| **S0** | Fondazione token + `@theme` | Ridurre `tokens.css` a una sola identità, **preservare** i token campo (§7), esporre `@theme` Tailwind. Nessun componente nuovo. | Build + typecheck OK; app renderizza come prima; grep campo: tutti i token presenti. |
| **S1** | Estrazione CSS campo | Spostare `components.css:32–412` → `styles/tactical-board.css`; import in `index.css`. | Campo identico a vista; test campo verdi. |
| **S2** | `base.css` + scanline + reset | Riscrivere base + overlay scanline + focus. | App renderizza con nuova base; nessun test rotto. |
| **S3** | `shared/ui` primitivi | Ricostruire `PlayerCandidateRow`, `PlayerFactPanel`, `SquadSelectionTable` + test. | Test componenti verdi. |
| **S4** | `AppShell` | Nuovo componente sidebar+rail+content + test; non ancora cablato ovunque. | Test shell verdi (nav, rail, posta, continua). |
| **S5** | App entry | Ricostruire `AppEntryScreen`; **rimuovere tema** (view-model, preferences, store, palettes file, spec) + test. | Entry nuovo; tema rimosso; test verdi. |
| **S6** | Dashboard | Ricostruire `CareerDashboardScreen` dentro `AppShell` + test. | Dashboard nuovo; test verdi. |
| **S7** | Preparazione (layout A) | Shell A attorno al campo; re-skin chrome campo (`tactical-board.css`); tab Rosa/Tattica/Dettaglio + test. | Prep nuovo; campo logica intatta; test verdi. |
| **S8** | Matchday (broadcast) | Tabellone + feed `keyEventCards` + riga telecronaca (`timelineEvents`) + bottone-fase (`nextActionId`) + intervallo (board) + full-time + test. | Matchday nuovo; flusso fasi OK; test verdi. |
| **S9** | Rimozione `CareerShell` legacy + pulizia CSS | Eliminare `CareerShell.tsx`/`CareerInboxPanel.tsx` vecchi; rimuovere classi legacy `tls-match-centre-*`/`tls-matchday-*`/`tls-dashboard-*` dead da `components.css`. | Nessun riferimento orfano; typecheck OK; test verdi. |
| **S10** | visual-qa rebuild | Riscrivere/eliminare spec obsoleti per le nuove schermate. | Suite `visual-qa` verde e rappresentativa. |
| **S11** | Verifica finale | `test` + `typecheck` interi + smoke dell'app (avvio + click attraverso le schermate). | Tutto verde; evidenze raccolte. |

> L'ordine garantisce app sempre avviabile: prima fondazione (S0–S2), poi primitivi (S3), poi shell (S4), poi schermate una alla volta (S5→S8), infine pulizia/verifica (S9→S11).

---

## 12. Fuori ambito

- Nessuna nuova regola di gioco, economia, "consequence engine".
- Nessuna animazione live del match (simulazione a fasi/testo dall'engine).
- Nessun nuovo tipo di evento engine (cartellini/rigori/infortuni/commento): richiederebbe modifiche a `@game/engine`.
- Nessuna modifica funzionale a `@game/engine`/`@game/ui`/`@game/i18n` (solo consumo; per i18n si aggiungono solo chiavi-label).
- Mobile-first dedicato: si garantisce collasso responsive ragionevole, non un layout mobile separato.
- Sezioni sidebar non implementate (market/finances/youth/...): fuori v1.

---

## 13. Rischi e mitigazioni

| Rischio | Mitigazione |
|---|---|
| Rottura campo via token CSS rinominati | Contratto §7 + Appendice C; grep obbligatorio prima di rimuovere token; S1 isola il CSS campo. |
| `labels.test.ts` rosso per chiave mancante in una lingua | Ogni nuova chiave aggiunta a tutte e 5 le lingue nello stesso step. |
| Feed matchday che promette eventi inesistenti | Modello UI generico ma solo gol/sostituzione cablati; resto inerte e documentato (§5.4.4). |
| Volume test da riscrivere | Riscrittura per slice; un'area verde prima della successiva (§11). |
| `components.css` 2156 righe difficile da ripulire in colpo solo | Pulizia spostata a S9, dopo che ogni schermata nuova ha smesso di usare le classi vecchie. |
| Regressione visiva non rilevata | visual-qa ricostruiti (S10) + smoke manuale (S11). |

---

## Appendice A — Inventario file (con riferimenti)

**Conservati (no change):** `features/tactics-board/tactical-board-*.ts(+test)`, `components/TacticalBoardPitchMarkings.tsx`.
**Ri-vestiti (solo CSS):** `components/TacticalBoardPitch.tsx`, `TacticalBoardPlayerToken.tsx`, `TacticalBoardEmptySlot.tsx`, `TacticalBoardMenu.tsx`, `TacticalBenchBoard.tsx`, `TacticalBenchSlotToken.tsx`.
**Ricostruiti:** `app/App.tsx`, `features/app-shell/AppShell.tsx`(nuovo), `features/app-entry/AppEntryScreen.tsx`, `features/dashboard/CareerDashboardScreen.tsx`, `features/match-preparation/CareerMatchPreparationScreen.tsx`, `features/matchday/CareerMatchdayScreen.tsx`, `shared/ui/{PlayerCandidateRow,PlayerFactPanel,SquadSelectionTable}.tsx`, `styles/{base,layout,components}.css`, `styles/tokens.css`(ridotto), `styles/tactical-board.css`(nuovo).
**Rimossi a fine migrazione:** `features/career-shell/{CareerShell,CareerInboxPanel}.tsx`, `app/theme-palettes.ts(+test)`, `visual-qa/theme-palette.spec.ts`.

## Appendice B — Superficie `@game/ui` consumata
`buildCareerShellView` (`career-shell-view.ts:106`), `buildCareerInboxView` (`career-inbox-view.ts:102`), `buildCareerMatchPreparationView` (`career-match-preparation-view.ts:349`), `buildCareerMatchdayView` (`career-matchday-view.ts:285`), `buildCareerMatchdayPhaseView` (`career-matchday-phase-view.ts:208`), `buildCareerDashboardView` (`build-career-dashboard-view.ts:124`).
Tipi chiave: `CareerShellView`/`CareerShellSectionKey`/`CareerShellMode`, `CareerInboxView`(+priority/status), `CareerMatchPreparationView`(+`FormationId`/`BlockerKey`/slot status), `CareerMatchdayView`/`CareerMatchdayPhaseView`(+`PhaseActionId`/`keyEventCards`/`timelineEvents`), `CareerDashboardView`(+`BlockerKey`/`ActionAvailability`), `AppEntryView`/`AppEntryActionAvailability`.

## Appendice C — Token campo (compatibilità, da non rinominare)
**TSX:** `--tls-color-ink`, `--tls-color-paper-muted`. **Runtime (lasciare):** `--tls-tactical-board-menu-left`, `--tls-tactical-board-menu-top`.
**Spacing:** `--tls-space-1`, `--tls-space-2`, `--tls-space-3`, `--tls-space-4`, `--tls-space-6`.
**Font:** `--tls-font-mono`, `--tls-font-size-xs`, `--tls-font-size-sm`, `--tls-font-size-md`.
**Colori:** `--tls-color-text`, `--tls-color-text-muted`, `--tls-color-text-dark`, `--tls-color-field-text`, `--tls-color-field-text-muted`, `--tls-color-gold`, `--tls-color-green`, `--tls-color-red`, `--tls-color-paper`, `--tls-color-pitch-dark`.
**Theme:** `--tls-theme-accent`, `--tls-theme-primary-action-surface`, `--tls-theme-elevated-panel-surface`, `--tls-theme-selected-row-surface`.
**Struttura/ombre:** `--tls-border-strong`, `--tls-border-thin`, `--tls-radius-sm`, `--tls-shadow-panel`, `--tls-shadow-inset`.
**Literali (preservare):** grass `#6b834c`/`#637a44`; zone fill rgba `components.css:99–114`; suitability stroke `#93bf64`/`#c8863b`.
