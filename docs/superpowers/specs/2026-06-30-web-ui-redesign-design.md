# Ridisegno UI/UX di `apps/web` — Design

- **Data:** 2026-06-30
- **Ambito:** `apps/web` (web career prototype)
- **Stato:** approvato in brainstorming, pronto per il piano di implementazione

## 1. Obiettivo

Rifare completamente la parte UI/UX di `apps/web`. I problemi dell'attuale, dichiarati dall'utente: **estetica** (look generico, non premium) e **navigazione/struttura confusa** (4 schermate piene che si sostituiscono a vicenda). Il target estetico è una via di mezzo tra **Football Manager moderno** e **retrò**, con resa **premium**.

Si conserva intatto un solo pezzo: il **campo tattico interattivo** — i ruoli trascinabili e il campo SVG con tutta la sua logica.

## 2. Confini (cosa si tocca, cosa no)

### 2.1 INVARIATO — logica di dominio
Nessuna modifica funzionale:

- Pacchetti workspace: `@game/engine`, `@game/ui` (view-model), `@game/i18n`, `@game/shared`.
- Logica del campo tattico in `features/tactics-board/`:
  - `tactical-board-geometry.ts`, `tactical-board-roles.ts`, `tactical-board-interactions.ts`,
    `tactical-board-suitability.ts`, `tactical-board-formations.ts`, `tactical-board-state.ts`,
    `tactical-board-bench.ts`, `tactical-board-squad.ts`, `tactical-board-adapters.ts`,
    `tactical-board-types.ts` e i rispettivi test.
  - `components/TacticalBoardPitchMarkings.tsx` (SVG del campo) — **invariato**.
- Le interazioni del campo: drag, long-press, context-menu, vincoli di zona per ruolo, suitability.
- Lo store `stores/career-ui-store.ts`: stato e azioni restano (vedi §2.4 per la sola pulizia del tema).

### 2.2 RI-VESTITO — solo CSS del "contorno" campo
La logica resta; cambia solo la presentazione (classi/CSS, ritocchi minimi di markup senza toccare gli handler):

- `components/TacticalBoardPitch.tsx` (header sezione, popover menu, wrapper) — handler pointer/drag **invariati**.
- `components/TacticalBoardPlayerToken.tsx`, `TacticalBoardEmptySlot.tsx`, `TacticalBoardMenu.tsx`,
  `TacticalBoardMenuRoleOption`/`SlotToken`, `TacticalBenchBoard.tsx`, `TacticalBenchSlotToken.tsx`.
- Colori token usati dal campo: ri-mappati alla nuova pelle, **preservando i nomi** (vedi §6.2).

### 2.3 RICOSTRUITO da zero
- `app/App.tsx` → diventa sottile: monta `AppShell` e instrada per `screen`.
- **Nuovo** `AppShell` (sidebar fissa + rail destro + area contenuto).
- `features/app-entry/AppEntryScreen.tsx`.
- `features/dashboard/CareerDashboardScreen.tsx`.
- `features/career-shell/CareerShell.tsx` + `CareerInboxPanel.tsx` → sostituiti da `AppShell` + nuovo pannello Posta.
- `features/match-preparation/CareerMatchPreparationScreen.tsx` (shell attorno al campo).
- `features/matchday/CareerMatchdayScreen.tsx`.
- `shared/ui/PlayerCandidateRow.tsx`, `PlayerFactPanel.tsx`, `SquadSelectionTable.tsx`.
- `styles/base.css`, `styles/layout.css`, `styles/components.css` (riscritti); `styles/tokens.css` (ridotto, vedi §6).

### 2.4 Pulizia tema
"Una sola identità premium": si rimuove il selettore multi-palette.

- Si eliminano le 3 palette extra (`club-office`, `press-room`, e la duplicata `floodlight-navy`) da `tokens.css`, lasciando un'unica identità su `:root`.
- `app/theme-palettes.ts` (+ test) e l'effetto `data-theme-palette` in `App.tsx`: rimossi.
- `preferences.themePaletteId` e `setThemePaletteId`: rimossi dallo store/preferenze e dai relativi test.
- **Restano** lingua e valuta nelle impostazioni.

## 3. Identità visiva

Si **evolvono** i token già esistenti (la palette attuale è già dark navy + oro), non si riparte da zero.

- **Superfici (dark):** app `#070b13`; shell/rail `#0d131a`; pannelli `#111922`; bordi/hairline in ambra a bassa opacità.
- **Accento:** ambra/oro `#d39a3c` (allineato all'oro esistente `#d9b95d`); gradiente `#d39a3c → #a06f1f` per i CTA.
- **Tipografia:**
  - Display **serif** (`--tls-font-display`, Palatino/Georgia) per titoli di sezione e numeri-chiave.
  - **Sans** condensato/UI (`--tls-font-ui`) per label, tabelle, controlli.
  - Numeri **serif tabulari** (`font-variant-numeric: tabular-nums`) per punteggi/classifiche.
- **Materiale retrò:** scanline sottile (overlay a righe ~3px) sulle superfici scure principali; angoli squadrati (radius 4px); hairline ambra di separazione; "kicker" maiuscoletto spaziato sopra i titoli.
- **Stati:** focus ring ambra (già in token); colori semantici eventi — gol ambra, cartellino giallo `#d8c23a`, infortunio arancio `#e2622f`, sostituzione teal `#3b9ea5`.

## 4. Architettura: shell + navigazione

Modello scelto: **shell con sidebar persistente** (stile FM desktop). Sostituisce lo switch full-page attuale: cambia il contenuto, la cornice resta.

```
┌──────────┬───────────────────────────────┬───────────────┐
│ SIDEBAR  │ CONTENUTO (per sezione)        │ RAIL DESTRO   │
│ crest    │                                │ [Continua ▸]  │
│ Dashboard│   <area schermata corrente>    │ Prossima      │
│ Rosa     │                                │  partita      │
│ Tattica  │                                │ Posta · badge │
│ Calendario│                               │               │
│ Posta    │                                │               │
└──────────┴───────────────────────────────┴───────────────┘
```

- **`AppShell`** (nuovo): riceve sezione attiva, view Posta, callback (Continua, navigazione, azioni inbox) e i figli (contenuto schermata). Gestisce sidebar, rail, badge Posta.
- **Mappatura `screen` → sezione:** lo store mantiene `screen` (`app_entry | career_dashboard | match_preparation | matchday`). `App.tsx` mostra `AppEntryScreen` a pieno schermo per `app_entry`; per gli altri monta `AppShell` con la sezione corrispondente e il relativo contenuto.
- **View-model:** si continua a usare `@game/ui` (`buildCareerInboxView` per la Posta; tipi `CareerMatchPreparationView`, ecc.). `buildCareerShellView` può essere riusato per la Posta o sostituito da una derivazione locale di navigazione nello shell; la scelta è del piano, senza cambiare `@game/ui`.
- **Responsive:** sotto una soglia stretta, sidebar collassa a icone e il rail destro va in fondo; il contenuto resta a colonna singola. Desktop-first.

## 5. Schermate

### 5.1 App entry (pieno schermo, fuori shell)
Menu premium: titolo gioco, **Nuova carriera** / **Continua** (Continua attivo solo se `hasDemoCareer`), impostazioni **lingua** e **valuta**. Nessun selettore tema.

### 5.2 Dashboard
Kicker maiuscoletto + titolo serif. Card dati (Posizione, Punti, Forma) con numeri serif. Mini-classifica (riga "tu" evidenziata in ambra). Blocco prossima partita. Posta visibile nel rail. Continua nel rail.

### 5.3 Preparazione / Tattica (layout A)
- **Sinistra (dominante):** il **campo tattico** (componente conservato) + toolbar sopra (helper auto/fill_gaps/clear + select formazione). **Panchina** come striscia sotto il campo.
- **Destra:** pannello unico a **tab**: *Rosa* (tabella selezione) · *Tattica* (profili) · *Dettaglio* (fact panel del giocatore selezionato).
- Header: titolo, contesto prossima partita, contatori slot (XI e panchina), bottone **Salva** (abilitato solo quando il read-model lo consente).
- Strip blocker (ready/blocked) invariata nella semantica, ri-vestita.

### 5.4 Matchday (broadcast)
- **Tabellone** in alto: crest, punteggio (serif tabulare), minuto + fase.
- **Feed eventi chiave**: solo gol, rigori, cartellini, infortuni, sostituzioni — come card con icona e colore semantico.
- **Telecronaca**: **una sola riga** minuto-per-minuto che **cambia solo al prossimo evento/minuto** (nessun marquee a scorrimento continuo).
- **Controllo fase**: un bottone che evolve — `Gioca primo tempo` → `Intervallo: sostituzioni` → `Gioca secondo tempo` → `Fine · Continua`.
- **Intervallo:** apre il **campo editabile** (riusa la board) per le sostituzioni half-time, più i controlli formazione/lineup/bench già esposti dallo store.

## 6. Strategia CSS / Tailwind

### 6.1 Approccio
- **Tailwind v4** (già cablato: plugin Vite + `@import "tailwindcss"`) per layout, spacing, composizione delle nuove schermate.
- **Layer token ridotto** in `tokens.css`: palette, tipografia, accento, raggi, ombre. Esposto a Tailwind via `@theme` così le utility usano gli stessi valori dell'identità.
- `base.css` (reset/typografia di base) e `components.css`/`layout.css` riscritti; le classi `tls-*` legacy non più usate vengono rimosse, eccetto quelle del campo (§6.2).

### 6.2 Contratto di compatibilità del campo (NON rompere)
Il campo conservato (markings SVG + token + popover) referenzia variabili CSS. Vanno **preservate** nel nuovo `tokens.css`:

- `--tls-color-ink`, `--tls-color-paper-muted` (usate direttamente da `TacticalBoardPitchMarkings`).
- Gli alias usati dai componenti board re-skinnati (es. `--tls-color-pitch`, `--tls-color-field-text*`, `--tls-color-gold`, `--tls-color-line*`, `--tls-surface-pitch`, font display/ui).

Regola: prima di rimuovere un token da `tokens.css`, verificare con grep che nessun file di `features/tactics-board/` lo usi. La pelle può cambiare i **valori** di questi token, non i loro **nomi**.

## 7. Strategia di test

I `.test.tsx` dei componenti e i `visual-qa/*.spec.ts` si rompono con la nuova UI. Si **riscrivono insieme** alla UI:

- Per ogni componente ricostruito, aggiornare/riscrivere il relativo test (rendering, callback, stati chiave).
- Rifare gli scenari `visual-qa` per le nuove schermate (entry, dashboard, preparazione, matchday, accessibilità shell).
- I test della logica del campo (`tactical-board-*.test.ts`) **restano verdi senza modifiche**: se uno si rompe, è un segnale di regressione sul pezzo da conservare → fermarsi.
- Obiettivo: a fine lavoro lo script `test` (vitest) e `typecheck` del pacchetto `@game/web` verdi.

## 8. Piano file (sintesi per il piano di implementazione)

1. **Token & infrastruttura CSS** — ridurre `tokens.css` a una sola identità, preservare i token del campo, riscrivere `base/layout/components.css`, configurare `@theme` Tailwind.
2. **`AppShell`** — sidebar + rail + slot contenuto + Posta; test.
3. **App entry** — ricostruzione + test; rimozione selettore tema.
4. **Dashboard** — ricostruzione + test.
5. **Preparazione** — shell layout A attorno al campo conservato; re-skin contorno board; test.
6. **Matchday** — broadcast (tabellone, feed eventi chiave, riga telecronaca a cambio-evento, controllo fase, intervallo con board); test.
7. **`shared/ui/*`** — ricostruzione tabella/fact/row + test.
8. **Pulizia tema** — rimuovere `theme-palettes.ts`, `themePaletteId`, effetto `data-theme-palette`; aggiornare preferenze/test.
9. **Verifica finale** — test + typecheck verdi; smoke dell'app.

## 9. Fuori ambito

- Nessuna nuova regola di gioco, economia, o "consequence engine".
- Nessuna animazione live del match (la simulazione resta a fasi/testo dall'engine).
- Nessuna modifica a `@game/engine`/`@game/ui`/`@game/i18n` (solo consumo).
- Mobile-first completo: si garantisce un collasso responsive ragionevole, non un layout mobile dedicato.

## 10. Rischi

- **Rottura del campo via token CSS:** mitigato dal contratto §6.2 (grep prima di rimuovere token).
- **Chiavi i18n mancanti** per nuove etichette: riusare le chiavi esistenti dove possibile; nuove etichette aggiunte solo via `@game/i18n` (catalogo), mai stringhe hard-coded nei componenti.
- **Volume di test da riscrivere:** affrontato per slice (un'area completa alla volta, verde prima di procedere).
