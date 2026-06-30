# Analisi 2 — UI / UX e flusso di gioco

> **Parte di una analisi in 3 documenti collegati:**
> - [README / Indice](./README.md)
> - [Analisi 1 — Qualità, robustezza, semplicità e chiarezza del codice](./01-ANALISI-CODICE.md)
> - **Analisi 2 — UI/UX e flusso di gioco** *(questo documento)*
> - [Analisi 3 — Stato attuale e roadmap verso l'MVP completo](./03-ANALISI-STATO-E-ROADMAP.md)

**Data:** 2026-06-30 · **Baseline:** Fase 66 completata (lavoro Fase 65/66 non ancora committato)
**Metodo:** ispezione diretta dell'app web reale guidata via **Playwright** (Chromium, `npx`/`playwright` del repo, **non installato**), Node `24.16.0` via `nvm`. Flusso completo percorso su viewport **desktop 1440×960** e **mobile 390×844**, con conteggio click, dump dei pulsanti visibili per schermata, misura di overflow orizzontale e test di persistenza al reload. Le prove (screenshot + JSON) sono in [`./assets/`](./assets/).

---

## 0. Sommario esecutivo

L'app web è passata da "prototipo che non gioca" (analisi 2026-06-25) a **primo loop giocabile reale end-to-end**: si crea una carriera demo, si prepara la formazione su una lavagna tattica seria, si entra nel match centre, si gioca fino al 90′ e si vedono le **conseguenze reali** (condizione, forma, morale che si muovono). Questo è un salto enorme e va riconosciuto.

Restano però tre classi di problemi UX, in ordine di gravità:

1. **La partita non si "vive".** Il match è ancora **due pressioni di pulsante** (`Kick off` → salto diretto a metà tempo, `Second half` → salto diretto al 90′) che svelano due blocchi di eventi pre-calcolati. Non c'è cronaca minuto-per-minuto, non c'è tensione, non c'è arco narrativo. Lo stream di eventi che il motore *già emette* viene mostrato come lista statica, non come racconto.
2. **L'ambiente intorno alla partita è pieno di "porte chiuse" e pulsanti morti.** 9 sezioni di navigazione su 10 sono disabilitate; 4 pulsanti azione del cruscotto ("Inspect squad/lineup/tactic/table") sono mostrati come *available* ma **non hanno alcun handler** e non fanno nulla; più CTA primarie gialle competono nella stessa schermata; al full-time ci sono **3–4 pulsanti "Dashboard"** ridondanti.
3. **Nessuna persistenza.** Un **reload del browser cancella l'intera carriera** e riporta al menu (verificato). In un manageriale questo è ostile: rende il loop intrinsecamente non rigiocabile.

Il **conteggio click** richiesto (dal cruscotto al risultato finale): **8 click "a freddo"** (prima partita, preparazione inclusa) e **3 click "a caldo"** (carriera già preparata) per arrivare al 90′. Dettaglio in §2.

| Dimensione UX | Voto | Sintesi |
|---|---|---|
| Identità visiva / art direction | 🟢 | Retro-football "control room" credibile, coerente, densa. Niente estetica SaaS generica. |
| Workspace di preparazione tattica | 🟢 | La superficie più profonda e soddisfacente: lavagna SVG, ruoli, suitability a colori, panchina 8 slot, helper Auto/Riempi/Svuota. |
| Match centre (struttura) | 🟢/🟡 | Scoreboard dominante, phase-rail, card eventi, tabella rating: ben gerarchizzato. Ma è una lettura, non un'esperienza. |
| Match centre (esperienza vissuta) | 🔴 | Nessun live minuto-per-minuto; vocabolario eventi povero; full-time chilometrico e log-like. |
| Economia dei click / chiarezza azioni | 🟡 | Path principale ragionevole, ma CTA duplicate, pulsanti morti, ridondanza "Dashboard". |
| Navigazione / completezza sezioni | 🔴 | 9/10 voci nav disabilitate, mostrate ma inerti: "porte chiuse" ovunque. |
| Persistenza / rigiocabilità | 🔴 | Reload = perdita totale della carriera. |
| Accessibilità (tastiera, focus, overflow, landmark) | 🟢 | Focus order corretto, `aria-current`, landmark semantici, **zero overflow orizzontale** desktop+mobile. |
| Responsive (mobile) | 🟡 | Nessun overflow, ma il full-time è **5371px** di altezza su 844 di viewport (≈6 schermate di scroll). |

---

## 1. Mappa del flusso (ciò che l'utente tocca davvero)

Lo stato dell'app è un piccolo state-machine in `apps/web/src/stores/career-ui-store.ts` con 4 schermate:
`app_entry` → `career_dashboard` → `match_preparation` → `matchday`.
La composizione è in `apps/web/src/app/App.tsx`; la carriera è **una sola demo hardcoded** (sempre S.S. Perugia, 2026-08-01, avversario U.S. Pisa).

```
[Menu]  New career ─────────────►  [Cruscotto]
                                      │  Prepare match (blocco lineup+tattica)
                                      ▼
                                  [Preparazione]  Auto → Balanced → Save → Dashboard
                                      │  (blocchi risolti)
                                      ▼
                                  [Cruscotto pronto]  Go to match / Continue
                                      ▼
                                  [Match centre]  Kick off → (sub a metà tempo) → Second half
                                      ▼
                                  [Full time]  conseguenze + Dashboard
```

| Schermata | Screenshot | Pulsanti visibili (di cui disabilitati) |
|---|---|---|
| Menu | [`01-menu.png`](./assets/01-menu.png) | 2 (1) |
| Cruscotto iniziale | [`02-dashboard-initial.png`](./assets/02-dashboard-initial.png) | 19 (10) |
| Preparazione | [`03-preparation.png`](./assets/03-preparation.png) | 53 (1) |
| Cruscotto pronto | [`05-dashboard-ready.png`](./assets/05-dashboard-ready.png) | 19 (9) |
| Pre-match | [`06-pre-match.png`](./assets/06-pre-match.png) | 14 (9) |
| Metà tempo | [`07-half-time.png`](./assets/07-half-time.png) | 15 (9) |
| Full time | [`08-full-time.png`](./assets/08-full-time.png) | 15 (9) |
| Cruscotto post-partita | [`09-dashboard-after.png`](./assets/09-dashboard-after.png) | 19 (10) |

> Nota: il conteggio "pulsanti visibili" include la barra di navigazione (10 voci, 9 disabilitate) presente su ogni schermata della shell. Vedi §4 e [`flow-evidence.json`](./assets/flow-evidence.json) per il dump completo.

---

## 2. Quanti click e quanti pulsanti — *dal cruscotto al risultato finale*

Questa è la domanda centrale del brief. Misurazione reale (Playwright, desktop):

### 2.1 Prima partita ("a freddo" — preparazione inclusa)

| # | Click | Schermata | Tipo |
|---|---|---|---|
| 1 | **Prepare match** | Cruscotto | naviga a preparazione |
| 2 | **Auto** | Preparazione | riempie XI + panchina |
| 3 | **Balanced** | Preparazione | radio tattica |
| 4 | **Save preparation** | Preparazione | salva, sblocca |
| 5 | **Dashboard** | Preparazione | torna al cruscotto |
| 6 | **Go to match** | Cruscotto | entra nel match centre |
| 7 | **Kick off** | Pre-match | salta a metà tempo |
| 8 | **Second half** | Metà tempo | salta al 90′ |

→ **8 click** dal cruscotto al risultato finale (full-time). **+1** ("Dashboard") per tornare al cruscotto aggiornato = **9**.

### 2.2 Partita successiva ("a caldo" — già preparata)

Se la preparazione è già salvata, il cruscotto mostra direttamente `Go to match`:

| # | Click | Schermata |
|---|---|---|
| 1 | **Go to match** | Cruscotto |
| 2 | **Kick off** | Pre-match |
| 3 | **Second half** | Metà tempo |

→ **3 click** al risultato finale. Sostituzione a metà tempo: **+3 opzionali** (2 `select` + `Apply substitution`).

### 2.3 Lettura del dato

- **3 click a caldo** è un'economia *buona* per un manageriale: paragonabile a "continua → simula → risultato" dei riferimenti del genere.
- **Ma** dei 3 click "a caldo", **2 sono finti**: `Kick off` e `Second half` non avviano nulla di vivo, rivelano solo un blocco di eventi già calcolati. L'utente preme due volte per leggere due liste. La spesa di click è bassa; la **resa emotiva** per click è quasi nulla → vedi §3.
- **A freddo, 8 click**, di cui 4 sono preparazione *una tantum*. L'unico attrito evitabile qui è il passaggio 5 (`Dashboard`) + 6 (`Go to match`): si potrebbe andare da `Save preparation` direttamente verso il match (vedi raccomandazioni §6, R3).

---

## 3. Il match centre: ben strutturato, ma non si "vive"

File: `apps/web/src/features/matchday/CareerMatchdayScreen.tsx` (read-model `@game/ui` phase-aware). Struttura osservata (ottima sul piano della gerarchia):

- **Scoreboard dominante** (Pisa 0 – 0 Perugia, stato "LEVEL"/"TRAILING").
- **Phase rail**: `PRE-MATCH · FIRST HALF · HALF-TIME · SECOND HALF · FULL TIME`.
- **Context strip**: periodo, round, minuto, lato (casa/trasferta).
- **Azione primaria** grande (`Kick off`, `Second half`).
- **Card eventi** (timeline + highlights) con priorità visiva: `MISS / BLOCK / SAVE / GOAL`.
- **Tabella giocatori** con rating (es. 5.7–7.7), fitness, ruolo, contributo (G/A/SoT/Sv/Blk), stato.
- **Conseguenze** solo a full-time: condizione e forma/morale.

### Problemi di esperienza (con prova)

- 🔴 **Nessun live minuto-per-minuto** *(critico per il "fun")*. `Kick off` salta **da pre-match direttamente a metà tempo**; `Second half` salta **direttamente a full-time**. Le voci `FIRST HALF`/`SECOND HALF` della phase-rail non sono mai uno stato che l'utente abita. La partita è una scatola che si apre in 2 colpi. Lo stream di eventi (16′ MISS, 32′ BLOCK, 38′ SAVE, 49′ GOAL…) **esiste già** ed è ordinato per minuto: manca solo la *presentazione progressiva*. È il singolo intervento UX a più alto rapporto valore/sforzo (zero modifiche al motore).
- 🟡 **Vocabolario eventi povero**: solo `goal/save/miss/block`. Niente cartellini, falli, rigori, infortuni, sostituzioni *dentro* la partita. Le card si ripetono e la cronaca risulta monotona (8 MISS di fila nel campione 0-0 di metà tempo).
- 🟡 **Full-time chilometrico e "log-like"**: la schermata full-time desktop è **3622px** di altezza, su mobile **5371px** (≈6 schermate). Le conseguenze sono righe di testo verboso non scannerizzabili, es:
  `Davide Valentini: form 50 → 49 (-1), morale 50 → 48 (-2); loss, heavy loss, goalkeeper saves`
  ripetute per ~14 giocatori, sotto a una lista condizione altrettanto lunga. Va sintetizzato (delta a colpo d'occhio, raggruppamenti, evidenziare solo i cambi salienti).
- 🟡 **Ruolo "unknown" per alcuni giocatori** nella tabella rating (es. i portieri appaiono con role *unknown*): `roleKey` non risolto nel read-model phase-aware → l'utente vede "unknown" invece di "Portiere". Bug di etichetta visibile.
- 🟢 **Le conseguenze ora ci sono e sono credibili** (Fase 64): condizione 100→92 (−8) ai titolari, forma/morale che scendono dopo una sconfitta pesante, con causali leggibili. Questo era il buco #1 dell'analisi precedente ed è **risolto a livello di singola partita** (resta da renderlo persistente e da farlo "mordere" lungo più settimane → vedi [Analisi 3](./03-ANALISI-STATO-E-ROADMAP.md)).

---

## 4. Navigazione e azioni: porte chiuse e pulsanti morti

- 🔴 **9/10 voci di navigazione disabilitate** su ogni schermata: `Squad, Tactics, Fixtures, Market, Finances, Facilities, Youth, Staff, Archive` sono grigie e inerti; solo `Dashboard` è attiva. L'utente vede un menu "pieno" che è in realtà vuoto al 90%. Per un prototipo è una promessa che frustra: meglio **nascondere o collassare** le sezioni non ancora costruite, oppure mostrarne 1–2 con un chiaro stato "in arrivo".
- 🔴 **Pulsanti azione morti sul cruscotto**: `Inspect squad`, `Inspect lineup`, `Inspect tactic`, `Inspect table` sono mostrati con etichetta **"available"** ma `dashboardActionHandler` (in `CareerDashboardScreen.tsx`) ritorna `undefined` per tutti tranne `prepare_match` e `advance_next_fixture`. Quattro pulsanti cliccabili che **non fanno nulla**. È peggio di una porta chiusa: è una porta che sembra aperta.
- 🟡 **CTA primarie in competizione**: sul cruscotto coesistono due pulsanti gialli "primari" — `CONTINUE` (header shell, in alto a destra) e `Prepare match` (header del pannello). Due "azione principale" nella stessa vista confondono la gerarchia.
- 🟡 **Azione duplicata**: a cruscotto pronto, `Go to match` compare **sia** come primario in header **sia** nella lista azioni (`Go to match available`). Idem `Continue` duplicato nel post-partita.
- 🟡 **Ridondanza "Dashboard" al full-time**: 3–4 affordance distinte per tornare al cruscotto (back in header del match centre, barra azione, pulsante nelle conseguenze, voce nav). Una sola, chiara, basta.
- 🟡 **Stato shell non sincronizzato con la fase**: durante il matchday la navigazione evidenzia `Fixtures` come sezione corrente, mentre la schermata è il "Match centre"; e il pulsante `Continue` della shell resta sempre visibile (cosa fa "Continua" *durante* una partita?). Piccolo disallineamento semantico (già annotato come rischio residuo della Fase 66).

---

## 5. Identità visiva, preparazione tattica, accessibilità

### 5.1 Identità visiva — 🟢

L'estetica retro-football "control room" (navy notturno, accenti oro, tipografia con grazie per i titoli, monospace per i dati) è **coerente e credibile**, lontana dall'estetica SaaS generica. Tre skin bounded (`floodlight-navy`, `club-office`, `press-room`) applicate via `data-theme-palette`, con superfici di campo e colori semantici **non tematizzabili** (scelta corretta). Su questo non c'è debito: è un punto di forza del prodotto.

### 5.2 Workspace di preparazione — 🟢 (la superficie migliore)

[`03-preparation.png`](./assets/03-preparation.png): lavagna tattica verticale SVG con token giocatore, ruoli (POR/TS/DC/TD/ES/CC/ED/ATT), `CURRENT SHAPE` derivata, panchina a 8 slot (`S1–S8`), tabella rosa ordinabile, pannello dettaglio giocatore, radio tattica (Balanced/Attacking/Defensive con pressing/directness/width/risk visibili), helper espliciti `Auto / Fill gaps / Clear`. È densa, leggibile e "da manageriale serio". **Avvertenza UX/gameplay** (cfr. [Analisi 1](./01-ANALISI-CODICE.md) e [3](./03-ANALISI-STATO-E-ROADMAP.md)): i valori tattici mostrati (pressing 50%, directness 50%…) **incidono pochissimo o nulla sull'esito**, quindi il workspace promette una profondità decisionale che il motore non ripaga ancora. È una promessa visiva da onorare lato motore (Fase 71).

### 5.3 Accessibilità — 🟢 (con riserve)

Verificato in esecuzione + dalle spec Playwright:
- **Focus order** corretto sulle azioni primarie della shell (`Dashboard → Main menu → Continue`), stati di focus visibili.
- `aria-current="page"` sulla voce di navigazione attiva; landmark semantici (`header`, `nav`, `aside`, `main`, `section`).
- **Zero overflow orizzontale** su desktop **e** mobile (390px) in tutte le schermate misurate.
- Stato non comunicato dal solo colore (blocker hanno etichette testuali, non solo rosso).

Riserve:
- I 4 pulsanti "Inspect *" morti sono **focusabili e annunciati come azioni** ma non producono effetto né feedback → trappola per utenti da tastiera/screen reader.
- Full-time mobile lunghissimo (5371px): la navigazione a tastiera/scroll verso le conseguenze e il pulsante "Dashboard" finale richiede molto scroll.

---

## 6. Raccomandazioni UX prioritizzate

> Ordinate per rapporto **impatto-sul-divertimento / sforzo**. Le voci di motore/persistenza si collegano alla [Analisi 3](./03-ANALISI-STATO-E-ROADMAP.md).

| # | Intervento | Sforzo | Perché |
|---|---|---|---|
| **R1** | **Replay minuto-per-minuto** dello stream eventi già emesso: rivelazione progressiva (con velocità regolabile / skip), il punteggio e la timeline che avanzano. Le fasi `FIRST HALF`/`SECOND HALF` diventano stati vissuti, non lampi. | S–M | Il più grande salto di "fun" disponibile dalla **sola presentazione**, zero modifiche al motore. Trasforma 2 click finti in un'esperienza. |
| **R2** | **Smettere di mostrare porte chiuse**: nascondere/collassare le 9 sezioni nav disabilitate e **rimuovere i 4 pulsanti "Inspect *" morti** finché non hanno una schermata. | S | Elimina frustrazione e falsi affordance; rende onesta l'interfaccia. |
| **R3** | **Accorciare il path a freddo**: dopo `Save preparation`, offrire un'azione diretta "Vai alla partita" (salta il rimbalzo Dashboard→Go to match). Unificare le CTA primarie del cruscotto in **una sola**. | S | −2 click a freddo; gerarchia d'azione chiara. |
| **R4** | **Compattare il full-time**: conseguenze come delta sintetici/scannerizzabili (badge ↑/↓, raggruppa "nessun cambiamento", evidenzia solo i salienti), schermata più corta soprattutto su mobile. | S–M | Toglie il "muro di log" e rende leggibile il payoff. |
| **R5** | **Fix etichetta ruolo "unknown"** nella tabella rating del match centre (risolvere `roleKey` per portieri/altri). | S | Bug di chiarezza visibile a ogni partita. |
| **R6** | **Persistenza (localStorage)**: la carriera sopravvive al reload; separare davvero "Nuova carriera" da "Continua". *(È la Fase 67 della roadmap.)* | M | Senza questo, l'app non è un gioco rigiocabile ma una demo. Prerequisito di ogni ritenzione. |
| **R7** | **Ricchezza eventi**: cartellini/falli/rigori/(sostituzioni live) emessi dallo stream esistente; un moltiplicatore "squadra che insegue" negli ultimi ~15′ per dare arco. | M | Spezza la monotonia di goal/save/miss/block e crea tensione. Dipende da lavoro motore (vedi Analisi 3). |
| **R8** | **Sincronizzare lo stato della shell** con la fase di matchday (sezione corrente coerente; gestire/ nascondere `Continue` durante la partita). | S | Coerenza semantica e di navigazione. |

---

### Collegamenti
- Le cause *lato codice* del match "scatola nera", dei knob tattici inerti e dell'etichetta "unknown" sono in **[Analisi 1 — Codice](./01-ANALISI-CODICE.md)**.
- Il percorso per persistenza, eventi ricchi, live-match e completamento di 10 stagioni è in **[Analisi 3 — Stato e Roadmap](./03-ANALISI-STATO-E-ROADMAP.md)**.
