# Analisi 3 — Stato attuale e roadmap verso l'MVP completo

> **Parte di una analisi in 3 documenti collegati:**
> - [README / Indice](./README.md)
> - [Analisi 1 — Codice](./01-ANALISI-CODICE.md)
> - [Analisi 2 — UI/UX e flusso di gioco](./02-ANALISI-UI-UX.md)
> - **Analisi 3 — Stato e Roadmap** *(questo documento)*

**Data:** 2026-06-30 · **Baseline:** Fase 66 completata · **Obiettivo del brief:** un MVP completo e divertente — mercato, crescita+promozione dei giovani, economia/prezzi dello stadio — con una carriera **giocabile per almeno 10 stagioni**.
**Metodo:** mappatura della prontezza per pilastro (motore vs web) verificata contro il codice attuale, intrecciata con la roadmap di progetto esistente (`docs/roadmaps/CAREER_PLAYABILITY_AND_ENGINE_ROADMAP.md`).

---

## 0. Sommario esecutivo

**Dove siamo:** il primo loop giocabile esiste (prepara → gioca → conseguenze → continua), il motore è maturo e canonico, le conseguenze ora mordono a livello di singola partita. **Ma è tutto su una carriera demo hardcoded, in-memory, su una sola lega.**

**L'intuizione che organizza tutta la roadmap** (emersa dalla mappatura di prontezza): **il motore è in gran parte pronto; il collo di bottiglia è il web.** Cinque pilastri su sette hanno `engineReadiness = ready/partial/primitives` ma `webReadiness = none/placeholder`. E quasi tutti dipendono dalla **stessa coppia di prerequisiti**:

> **(K1)** il web deve far girare una **`CareerState` reale e persistita** (oggi usa fatti demo hardcoded), e
> **(K2)** il web deve **chiudere il ciclo stagione** (oggi non rileva nemmeno la fine stagione).

Risolti K1+K2, il mercato (motore *ready*), i giovani, l'economia, le 10 stagioni si sbloccano in cascata con sforzo molto ridotto, perché la logica di motore esiste già. La tentazione da evitare è iniziare un pilastro gigante (Scalata o economia piena) **prima** di K1+K2: sarebbe costruire su sabbia.

### Tabella di prontezza (verificata)

| Pilastro | Motore | Web | Sforzo | Nota |
|---|---|---|---|---|
| **Persistenza** (save/load reale) | parziale | assente | **M** | Contratto save + validate-on-load esistono; manca adapter browser e dipendenza `@game/storage`. **È la chiave (K1).** |
| **Mercato trasferimenti** | **pronto** | assente | **M** | Valutazione + willingness + feasibility + apply durevole già implementati e testati. Manca solo la UI + scoperta target. |
| **Giovani: crescita + promozione** | parziale | placeholder | **L** | Intake/lifecycle/curve di sviluppo esistono. Manca promozione manuale single-player, view-model `@game/ui`, e il web che avanzi la stagione. |
| **Economia / "povertà" / stadio** | primitive | placeholder | **L** | Esiste solo `Money` + `transferBudget`. Zero ingaggi/income/biglietti/stadio. Pilastro di design quasi interamente da costruire. |
| **La Scalata** (piramide promo/retro) | primitive | assente | **L** | Una sola lega; **blocco duro**: il rollover *rigetta* >1 competizione corrente. Vocabolario `ClubCategory` esiste. |
| **10 stagioni giocabili** | **pronto** | assente | **L** | `advanceCareerOneSeason` + `seasonHistory` durevole + CLI che prova un decennio sano. Manca il rollover nel web (K2). |
| **Match "vivo" + narrativa** | parziale | parziale | **L** | Lo stream eventi minuto-stampato **esiste già**; manca il replay progressivo, eventi ricchi, recap, personalità/memoria. |

---

## 1. La keystone: rendere il web una carriera vera (K1 + K2)

Prima di qualsiasi pilastro nuovo, il web deve smettere di essere una demo.

### K1 — Persistenza + `CareerState` reale *(Fase 67, sforzo M)*
- **Esiste:** contratto durevole `CareerStorage` (`career-storage.ts`), **validate-on-load già implementato** (`migrateCareerSave` + `createCareerState`), taxonomy errori tipata, schema-version pinnato.
- **Manca:** un adapter **browser-safe** (`JsonCareerStorage` importa `node:fs` → non usabile nel browser); `apps/web` **non dipende** da `@game/storage`; lo store è in-memory puro; la demo è hardcoded, non caricata; manca un metodo `list`.
- **MVP slice:** `LocalStorageCareerStorage` in `@game/storage` (implementa `CareerStorage` su `window.localStorage`, riusa `migrateCareerSave`/`createCareerState` per validate-on-load), aggiungere `@game/storage` alle dipendenze web, sostituire i fatti demo con una `CareerState` viva, separare davvero "Nuova carriera" da "Continua".
- **Prerequisito di codice (bloccante):** i validatori di [Analisi 1 / C1](./01-ANALISI-CODICE.md#5-raccomandazioni-di-qualità-prioritizzate) — `assertGameState`/`validateSaveMetadata`, dispatch migrazione, **identità nel save durevole**. Senza, un save editato/stale o uno schema v2 è un crash.
- **Rischi:** riuso ingenuo di `JsonCareerStorage` nel browser (node API); doppio layer di schema-version (envelope + career) da coordinare.

### K2 — Chiudere il ciclo stagione nel web *(sforzo L, ma riusa motore pronto)*
- **Esiste:** `advanceCareerOneSeason` (canonico, testato), `seasonHistory` durevole che round-trippa nello storage, il CLI ten-season che **prova un decennio sano**.
- **Manca:** **nessun rollover stagione nel web**; il loop `Continue` non rileva nemmeno la fine stagione; la modalità `completedSeason` è provata solo nei unit test, mai da un loop giocato; nessun recap/calendario/archivio.
- **MVP slice:** far girare una `CareerState` persistita end-to-end (estendere l'adapter matchday a stato reale), aggiungere uno stop-reason `season_end` al `Continue`, invocare `advanceCareerOneSeason` in modalità `completedSeason`, mostrare un recap minimo. **Non serve** una griglia calendario completa per chiudere il loop.
- **Rischio:** lo stop-reason `season_end` cambia il contratto `continueCareer` (toccare con test di determinismo); la generazione calendario di nuova stagione deve restare deterministica.

> **Esito di K1+K2:** per la prima volta un utente può *giocare* più stagioni nel browser, e ogni pilastro successivo ha uno stato reale su cui agganciarsi.

---

## 2. I pilastri di prodotto (cosa esiste / cosa manca / slice MVP)

### 2.1 Mercato trasferimenti — *motore PRONTO, web assente (M)*
- **Esiste e testato:** `derivePlayerValuation`, `derivePlayerWillingness`, `evaluatePermanentTransfer` (feasibility + dry-run), `applyCareerPermanentTransfer` (apply durevole con storico). Output CLI già presente.
- **Manca:** UI web; scoperta target (nulla enumera i comprabili); attività di mercato delle AI (solo il manager compra → mondo statico); contratti/ingaggi (budget = singolo pot); limiti rosa.
- **MVP slice:** schermata Mercato per il club dell'utente che riusa il motore **invariato**: lista candidati da altri club ordinata deterministicamente (valutazione desc, tie-break `playerId`), budget prima/dopo, willingness, esito accetta/rifiuta con causale, persistenza dell'acquisto, aggiornamento rosa + Inbox.
- **Rischi:** senza AI compratrice il mercato è una vetrina unidirezionale; senza ingaggi il valore è solo il prezzo del cartellino; la willingness blocca solo le mosse "verso il basso".

### 2.2 Giovani: crescita + promozione — *motore parziale, web placeholder (L)*
- **Esiste:** stato dominio youth completo e validato; intake annuale; lifecycle di aging-out; **curve di sviluppo/crescita ricche** per fascia d'età.
- **Manca:** UI Youth (zero riferimenti web); **promozione manuale per-giocatore** (oggi è all-or-nothing automatica e il club utente è *protetto*); view-model `@game/ui` youth; il web non avanza mai la stagione (→ dipende da K2); storia lifecycle sottile.
- **MVP slice:** un engine `promoteSelectedYouthPlayer(careerState, playerId)` che promuove un `promotion_candidate` del club selezionato nella rosa senior (riusa i gate di `youth-promotion`, droppa il check "protected" per l'id scelto, scrive una entry lifecycle `promoted`); una sezione Youth web che mostra prospetti, età 15-19, tier, alert di aging-out, e il pulsante "Promuovi".
- **Rischi:** la promozione manuale bypassa i gate automatici di ability → serve un guard; **il blocco vero è strutturale** (il web deve prima far girare una `CareerState` reale che avanza — K1+K2).

### 2.3 Economia / "povertà come design" / stadio — *solo primitive, web placeholder (L)*
- **Esiste:** value-object `Money` (minor-units, add/subtract), `MarketState.transferBudget` per club, escrow del fee di trasferimento, persistenza durevole di `marketState`.
- **Manca (quasi tutto il pilastro):** **nessun ingaggio/salary** in tutto il sorgente; **nessun income** (zero match per sponsor/ticket/gate/prize); nessuna entità finanze/cassa del club; nessun tick finanziario ricorrente in `advance-career-season`; nessuna crisi finanziaria / budget del CdA / prezzo biglietti / capienza stadio.
- **MVP slice (in due tempi):**
  1. **Loop di povertà prima:** aggiungere `ClubFinances.cash (Money)` a `CareerState` + un ingaggio piatto per-giocatore seedato per categoria/ability in world-gen; uno step di settle a fine stagione dentro `advanceCareerOneSeason` (`cash += income − monte ingaggi`); warning quando i soldi bloccano/cambiano una decisione (es. un acquisto). Il punto è la **rinuncia**: ogni spesa pesa.
  2. **Stadio/biglietti dopo:** capienza + prezzo biglietto come leva utente che produce income per partita (con varianza deterministica via RNG seedato, mai `Math.random`).
- **Rischi:** la varianza affluenza deve usare RNG seedato (legge determinismo); riconciliare il modello (oggi singolo `transferBudget` per club); fragilità di bilanciamento senza tier ingaggi/income tunati (gate col calibration-report).

### 2.4 La Scalata (piramide promo/retro) — *primitive, web assente (L) — l'identità del gioco*
- **Esiste:** vocabolario `ClubCategory` (`first_division`…); tabella di lega deterministica con catena di tie-breaker; generatore calendario round-robin parametrizzato.
- **Manca:** **BLOCCO DURO** — la macchina di rollover **rigetta attivamente** più di una competizione corrente (guard `multiple_current_season_competitions`); nessun registro durevole di divisione/competizione; **nessuno step di promozione/retrocessione**; `seasonHistory` è single-table per stagione; il world-gen costruisce una sola divisione.
- **MVP slice:** piramide deterministica a **2 divisioni**: (1) persistere l'appartenenza a divisione in `CareerState` + seedare due competizioni alla creazione mondo; (2) **invertire** la rejection single-competition nel rollover calendario; (3) regola promo/retro minima (top-N sale, bottom-N scende) con taglio deterministico; (4) rigenerazione calendario post-movimento; (5) `seasonHistory` per-divisione; (6) smoke multi-stagione.
- **Rischi:** **migrazione schema** di `seasonHistory` (deve restare retro-compatibile); il taglio promo/retro **deve** avere tie-breaker deterministico; coordinare con l'economia (premi per divisione).

### 2.5 Match "vivo" + narrativa — *motore parziale, web parziale (L)*
- **Esiste:** il motore **emette già** uno stream eventi minuto-stampato e deterministico; contratto evento data-only; sostituzioni a metà tempo reali e validate; il web gioca per fasi.
- **Manca:** **replay minuto-per-minuto** (il web salta di fase e svela liste); **vocabolario eventi** (solo goal/save/miss/block); le sostituzioni **non sono eventi timeline**; **personalità e memoria** giocatore non esistono; punti d'integrazione per rigori/infortuni assenti.
- **MVP slice (a basso costo, in gran parte presentazione):** un ticker web che cammina `snapshot.events` (già ordinati e minuto-stampati) da kickoff alla fase corrente → trasforma i 2 "click finti" in esperienza, **zero modifiche al motore**. Poi, incrementale: eventi ricchi (cartellini/falli/rigori/infortuni emessi dallo stream), recap di stagione deterministico da `seasonHistory`, 3 campi `PlayerPersonality` + memoria-carriera mostrati come aggettivi/milestone.
- **Rischi:** nuovi eventi in-match → bump schema (migrazione); il ticker deve **derivare** scoreboard dagli eventi senza desync.

---

## 3. Roadmap sequenziata verso l'MVP "10 stagioni complete"

Sequenza per **dipendenze + leverage** (allineata e che aggiorna `CAREER_PLAYABILITY_AND_ENGINE_ROADMAP.md`). Le voci di codice (Cx) vengono dall'[Analisi 1](./01-ANALISI-CODICE.md), quelle UX (Rx) dall'[Analisi 2](./02-ANALISI-UI-UX.md).

| Fase | Titolo | Dip. | Sforzo | Sblocca |
|---|---|---|---|---|
| **0 (gate)** | **C1 validatori save + identità durevole** + **C2 counting-RNG test** | — | S–M | rende sicura ogni fase sotto |
| **1** | **K1 — Persistenza web (`LocalStorageCareerStorage`, CareerState reale, New vs Continue)** + **R6** | 0 | M | tutto |
| **2** | **K2 — Ciclo stagione nel web** (`season_end` stop, `advanceCareerOneSeason` completedSeason, recap minimo) | 1 | L | 10 stagioni, giovani, economia |
| **3** | **Match vivo: replay minuto-per-minuto** (presentazione pura) + **R1/R2/R4** (porte chiuse, full-time compatto) | 1 | S–M | fun immediato, indipendente |
| **4** | **Mercato UI MVP** (motore pronto) — lista target, offerta, budget, willingness, apply persistito | 1 | M | squad-building, posta in gioco |
| **5** | **Economia: loop di povertà** (cassa + ingaggi + settle a fine stagione + warning) | 2,4 | M–L | "povertà come design", vincola il mercato |
| **6** | **Giovani UI + promozione manuale** (`promoteSelectedYouthPlayer` + sezione Youth) | 2 | M–L | storia a lungo termine |
| **7** | **Eventi ricchi + recap/memoria/personalità** (cartellini/rigori/infortuni dallo stream; recap da `seasonHistory`) | 3 | M | profondità narrativa |
| **8** | **La Scalata: piramide a 2 divisioni** (invertire il guard, registro divisioni, promo/retro deterministica, calendario+history per-divisione) | 2,(5) | L | l'identità del gioco |
| **9** | **Stadio/biglietti** (capienza + prezzo + income per partita) | 5 | M | completa l'economia |
| **10** | **Knob tattici efficaci** (C6 + cablare pressing/risk a effetto bounded) + minuto non-piatto | 0,3 | M | il match "sente" la tattica |

**Note di sequenza:**
- Le Fasi **3** (replay) e **4** (mercato) sono il miglior rapporto fun/sforzo subito dopo la persistenza: una è pura presentazione su dati esistenti, l'altra riusa un motore già pronto.
- L'**economia (5)** deve precedere lo **stadio (9)** e idealmente la **Scalata (8)** (premi/budget per divisione hanno senso solo con un modello finanziario).
- La **Scalata (8)** è l'unico pilastro con un *blocco duro* di motore (il guard anti-multi-competizione): va affrontata come fase dedicata con migrazione schema attenta.

---

## 4. Definizione di "MVP completo, 10 stagioni giocabili"

Checklist di accettazione (l'MVP è completo quando **tutte** sono vere nel web, senza CLI):

- [ ] Creo una nuova carriera, la chiudo, riapro il browser e **la ritrovo** (persistenza).
- [ ] Gioco la mia partita con una **cronaca che avanza** (replay), non due click che svelano liste.
- [ ] Dopo la partita vedo **conseguenze leggibili** (condizione/forma/morale) — *già presente*, da rendere persistente e sintetico.
- [ ] **Avanzo di stagione** nel web e vedo un **recap** di cosa è successo.
- [ ] Compro **almeno un giocatore** con impatto visibile su budget e rosa.
- [ ] Una spesa mi costa una **rinuncia** (vincolo economico reale).
- [ ] **Promuovo un giovane** in prima squadra e lo vedo crescere su più stagioni.
- [ ] **Salgo (o scendo) di divisione** almeno una volta in 10 stagioni (Scalata minima).
- [ ] Imposto il **prezzo del biglietto** e vedo l'effetto sull'income.
- [ ] Completo **≥10 stagioni** con storia coerente (classifiche, titoli, trasferimenti, sviluppo) **persistita e consultabile**.

Il motore regge già un decennio sano (provato dal CLI ten-season). La distanza dall'MVP **non è simulativa, è di superficie e persistenza**: rendere giocabile e durevole nel browser ciò che il motore già calcola, e costruire i due pilastri d'anima (economia, Scalata) sui ganci che esistono.

---

## 5. Rischi globali

- **Regressione di determinismo silenziosa** — il golden sentinel esiste (Fase 62) ma manca il counting-RNG eventless-minute. **Fare C2 prima** di toccare bilanciamento, generazione, knob tattici (Fasi 5/8/10).
- **Fragilità del formato save** — migrazione = cast cieco, `SaveMetadata` non validato, identità in side-channel. **C1 è bloccante prima della persistenza (Fase 1).** Appena arriva localStorage o uno schema v2, un save stale è un crash.
- **Trappola di scope dal divario di visione** — iniziare Scalata/economia piena *prima* di K1+K2 brucerebbe la pista. Persistenza e ciclo-stagione precedono ogni pilastro nuovo.
- **Drift di calibrazione** — l'unificazione del modello ability (C4), gli ingaggi/income (Fase 5) e i knob (Fase 10) muovono numeri di bilanciamento. Gate obbligatorio col calibration-report.
- **Suite web orfana** — Fasi 1/3/4 toccano il codice più interattivo; senza rendere eseguibile la suite Playwright (C5) le regressioni arrivano invisibili.

---

### Collegamenti
- I prerequisiti e i fix di qualità (C1–C7) sono dettagliati in **[Analisi 1 — Codice](./01-ANALISI-CODICE.md)**.
- Le raccomandazioni UX (R1–R8) e le prove del flusso sono in **[Analisi 2 — UI/UX](./02-ANALISI-UI-UX.md)**.
