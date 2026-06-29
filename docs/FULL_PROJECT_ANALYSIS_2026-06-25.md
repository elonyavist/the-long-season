# The Long Season — Analisi completa del progetto

Data: 2026-06-25
Baseline: commit `6b011b7` (Fase 61 — web visual identity system rework completa)
Metodo: analisi multi-agente (36 agenti, ~947k token, 407 letture/grep di codice reale),
in due fasi — **codice/architettura** e **divertimento/motore** — con verifica avversariale
delle affermazioni critiche e sintesi trasversale.

> Nota sul metodo: ogni problema "critical/high" è stato ri-controllato da un agente
> scettico contro il codice reale. **19 affermazioni su 20 hanno retto**; 1 è stata
> declassata (vedi §1.5, "Player senza costruttore"). Le citazioni sono `file:linea`.

---

## 0. Sommario esecutivo

The Long Season ha **una fondazione tecnica eccellente e un divario di prodotto enorme.**

Tre frasi che riassumono tutto:

1. **Il motore è maturo, il CLI è il vero gioco.** Match engine deterministico e
   credibile, sviluppo/declino giocatori, vivaio, classifiche, run decennali che
   producono dinastie e declini plausibili. Tutto esercitato da `apps/cli`.
2. **Il web è un prototipo a una schermata.** `apps/web` importa il motore in **un solo
   punto** (`continue-demo-career.ts`), non gioca mai una partita, non salva nulla, e
   9 sezioni su 10 della nav sono placeholder bloccati. Il "divertimento già costruito"
   è **irraggiungibile da un giocatore**.
3. **I due pilastri che il design chiama "l'anima" non esistono.** "La Scalata"
   (promozioni in una piramide) e "la povertà come design" (economia/budget) sono a
   **zero file**. Insieme a questo, il **motore delle conseguenze** manca: forma, morale
   e fitness non cambiano mai in-stagione, quindi ogni decisione settimanale è inerte.

Il problema **non è** un'architettura marcia da riscrivere. È un'**inversione di priorità**:
la parte più rifinita (validazione statistica, report di calibrazione) è un *mezzo*, non il
divertimento; le parti che il documento di design indica come la *fonte* del divertimento
sono le più assenti. La buona notizia: i confini puliti del monorepo fanno sì che ogni
pilastro mancante abbia **una casa ben definita**, e gran parte del divertimento mancante è
a **una saldatura di distanza** da codice che esiste già.

| | Stato |
|---|---|
| Architettura & determinismo | 🟢 Eccellente |
| Motore di simulazione (match, stagione, sviluppo) | 🟢 Maturo e validato |
| Qualità del codice (duplicazione, file-monstre, test) | 🟡 Debiti reali ma circoscritti |
| Loop di carriera giocabile | 🔴 Scheletro senza conseguenze né posta in gioco |
| Prodotto web | 🔴 Demo in-memory, non gioca, non salva |
| Pilastri di divertimento del design (Scalata, economia, narrativa) | 🔴 Per lo più non costruiti |

Metriche: ~48k LOC sorgente, 9 pacchetti + 2 app, **124 file di test**, dependency-cruiser
che impone i confini, 61 fasi di build completate.

---

# FASE 1 — Codice e architettura

## 1.1 Struttura e impianto

Monorepo pnpm, TypeScript, layering **unidirezionale imposto a build-time**
(`.dependency-cruiser.cjs`):

```
shared ─┐                              (puro tecnico: RNG seedato, GameDate, assert)
domain ─┴─→ engine ─→ simulation-tools (regole deterministiche, report)
         ├─→ content                   (generazione mondo finto)
         ├─→ storage                   (save JSON)
         ├─→ ui                        (read-model framework-free)
         └─→ i18n                      (label it/en/de/es/fr)
apps/cli  → tutto                      (superficie reale giocabile + diagnostica)
apps/web  → engine, ui, i18n, shared   (prototipo browser in-memory)
```

LOC per area: `engine` 10.6k · `cli` 11.9k · `web` 8.0k · `content` 5.3k · `i18n` 4.3k ·
`domain` 3.6k · `simulation-tools` 1.7k · `ui` 1.6k · `storage` 0.6k · `shared` 0.45k.

## 1.2 Punti di forza (reali, verificati)

- **La legge del determinismo è onorata davvero.** Zero `Math.random`/`Date`/`crypto`/
  `performance` in `engine`, `content`, `domain`. Ogni operazione sensibile all'ordine
  usa array di ID espliciti + record di lookup (mai `Object.values` su dati ordinati);
  ogni `sort` ha un tie-breaker finale per code-unit (`league-table.ts:141`,
  `player-stats.ts:230`, `match-explanation-trace.ts:347`); ogni RNG è uno stream derivato
  per concern con chiavi length-prefixed (`derive-rng.ts:79`).
- **`domain` è un core puro esemplare.** Value-object branded validati alla costruzione
  (`Money` minor-units, `GameDate` epoch-day, `AbilityValue` 0-20), classi d'errore tipate
  con `code` machine-readable, validazione d'integrità referenziale profonda nel modello
  copy-on-write (`career-state.ts:195-411`). 101 test verdi.
- **Il catalogo tattico è davvero la singola fonte di verità.** `FORMATION_CATALOG` è
  *consumato* (non ridichiarato) da engine, `packages/ui` e dalla board web — nessuna
  duplicazione degli array di formazione.
- **I confini reggono.** Il CLI non importa `domain` direttamente, il web non importa
  `domain`/`engine` grezzi, `content` non importa `engine`. Le regole sono eseguibili.
- **I test sono forti dove conta il rischio:** value-object, COW state, lifecycle vivaio,
  determinismo riproducibile di `stepMatch`/calendario/tabelle.

## 1.3 Temi trasversali del codice (le radici, non i sintomi)

Questi 5 temi spiegano la maggior parte dei 59 problemi puntuali.

### T1. Orchestrazione "di gameplay" che fuoriesce nel CLI invece di vivere come use-case del motore — **HIGH**
Non esiste un contratto canonico "avanza di una stagione" in `@game/engine`. **Due** file
CLI lo implementano in modo **diverso**: `report-data.ts:912` avanza la data con un `+365`
inline e ricuce a mano 7 primitive in `advanceCareerForReport` (861-933); `season-labs.ts:219`
usa `rolloverPlayersForNextSeason`. L'ordine di refresh post-partita
(exits/youth/intake/promotion/maintenance/turnover) è *gameplay-defining* ma vive in un file
CLI di 1613 righe senza test diretti. Quando il web dovrà avanzare una stagione, diventerà
una **terza** implementazione divergente. → *Estrarre `advanceCareerOneSeason` come use-case
del motore è la chiave di volta.*

### T2. Il rigore di test è invertito — **HIGH**
`domain` (101 test) e `shared` sono immacolati; ciò che decide gli esiti e arriva all'utente
no. `simulateSeason` testa **invarianti, non esiti pinnati** → una regressione di bilanciamento
passa la CI. Nessun test end-to-end di rollover multi-stagione nel motore. Il match engine non
ha test per lo 0-0 né — il più grave — un test che provi che **un minuto senza occasioni consuma
RNG in modo identico** (il contratto di determinismo portante). I due moduli CLI più grossi non
hanno test diretti. L'intero comportamento interattivo del web è coperto solo da ~2.508 LOC di
spec Playwright **che nessun comando esegue** (root vitest globa solo `*.test.ts`; lo script di
pacchetto esclude `visual-qa`), e una spec asserisce un nodo DOM morto.

### T3. Duplicazione meccanica di un piccolo set di helper player/età/ability ovunque — **HIGH**
`averageAbilities`/`averagePlayerAbilities` in **7 file** engine; `deriveAge(/365)` (che ignora
gli anni bisestili) triplicato + 9 siti `/365` nel CLI; il flatten delle 25 ability e lo switch
posizione→gruppo re-implementati 3-4 volte; la costruzione per-giocatore copia-incollata nei 3
generatori di `content`; `simulation-tools` duplica la macchina PASS/WARN/FAIL in 4-5 file; il
CLI ripete il parse `--lang`/`--seed` in 5 punti e un check di mutua-esclusione **15 volte**.
Non è un bug oggi, ma è *il meccanismo* per cui `player-development.ts` è 916 righe e
`report-data.ts` 1613 — e per cui i bug "due modelli" e "rollover divergente" diventano possibili.

### T4. Due modelli paralleli, parzialmente incompatibili, della stessa cosa — **HIGH** (alcuni declassati in verifica)
- **Generazione ability**: un percorso role-aware a bande (11 ruoli) per la *current ability*
  del mondo iniziale **e** un percorso vecchio a 7 template per la *potential* e per *entrambi*
  i campi in `career-intake-players.ts:135-136`. Current e potential dello stesso giocatore
  vengono da modelli incompatibili; il path a 7 template collassa dm/am/cm e rw/lw che la
  classificazione distingue. *(verifica: il problema è reale ma più contenuto del claim
  iniziale → severità media/bassa.)*
- **Vocabolario ruoli/posizioni**: **4 tassonomie** sovrapposte (`PlayerRole` 10,
  `CanonicalPlayerRole` 12, `PlayerPosition` 12, `FormationPositionFamily` 15) riconciliate da
  tabelle di cross-walk mantenute a mano sparse tra content/suitability/web. Aggiungere un ruolo
  significa toccare più tabelle allineate a mano; un mismatch fallisce in silenzio.
- **Palette tema**: colori duplicati tra dati TS inutilizzati e `tokens.css` reale.

### T5. Input portati ma inerti — **MEDIUM**
Sottosistemi che validano e trasportano input che non fanno nulla (dead code *e* fun-killer):
nel match engine `pressing` è del tutto inerte, `width`/`directness`/`risk` quasi del tutto;
il **minuto non influenza mai** rate o qualità della chance; `scoreBeforeChance` è solo un sale
RNG. Le bande di conversione sono config-driven ma block/save e i coefficienti di qualità sono
**magic number hardcoded** nel resolver, e i numeri di calibrazione del match vivono in `content`
invece che in `engine`. `roleFamiliarity`/weather/terrain/traits sono modellati ma non collegati.

## 1.4 Valutazione per area

| Area | Voto | Sintesi |
|---|---|---|
| `domain` | 🟢 | Core puro esemplare. Debiti: `Player` senza `createPlayer` (declassato, vedi §1.5); 4 tassonomie ruoli; identità giocatore fuori dall'entità durevole. |
| `engine/match-engine`+`season` | 🟢 | Determinismo airtight, pipeline pulita (`OccasionResolver`). Debiti: `step-match.ts` mescola loop/attori/etichette; bilanciamento split config+magic; test edge sottili. |
| `engine/career` | 🟢/🟡 | 17 funzioni pure su COW. Debiti: nessun orchestratore di rollover (T1); RNG di realizzazione **omette `seasonId`** (`player-development.ts:561`) → modificatore congelato per tutta la carriera; duplicazione helper (T3). |
| `engine/market`+`squad`+`use-cases` | 🟡 | `simulateSeason` 894 righe, test solo invarianti (no golden). `engine/index` ri-esporta simboli domain + intera superficie career. |
| `content` | 🟡 | Generazione corretta e deterministica, classificazione ruolo/attributo curata. Debiti: due modelli ability (T4); pool nomi stranieri minuscoli (6×6=36 combo); calibrazione match in content. |
| `storage`+`shared`+`i18n`+`sim-tools` | 🟡 | Infra piccola e disciplinata. Debiti: migrazione game-state = **cast cieco senza validazione**; `SaveMetadata` mai validato in load; `i18n` 4254 righe (ben tipizzato però); duplicazione report sim-tools. |
| `ui` (read-model) | 🟢 | Framework-free pulito, niente prosa, regge già 2 adapter. Debiti: bug etichetta punte st-left/st-right; 2 funzioni byte-identiche; union inbox a 2 valori troppo stretta. |
| `apps/cli` | 🟢/🟡 | Superficie matura, decomposta in Fase 44. Debiti: `report-data.ts` 1613 righe + orchestrazione (T1); parse args copia-incollato (T3); moduli più complessi testati solo indirettamente. |
| `apps/web` | 🟡/🔴 | Buona fondazione (seam di sostituzione pulito) ma: suite Playwright orfana (T2); legacy morto (`TacticalPitchLineup`+`campo-calcio.svg`, ~342 LOC); stato lineup denormalizzato in 2 forme; nav decorativa senza handler. |

## 1.5 Problemi puntuali per severità

**HIGH (verificati)**
- `engine/career`: **nessun orchestratore di rollover stagione**; due pipeline CLI divergenti (T1). → use-case `advanceCareerOneSeason` + test integrazione multi-stagione.
- `apps/cli`: `report-data.ts` 1613 righe mescola shaping report e orchestrazione refresh stagione → estrarre la pipeline nel motore, splittare il file (<500 righe/file).
- `storage`: migrazione game-state = **cast cieco** senza validazione profonda; `SaveMetadata` mai validato in load → validatore domain su load + `validateSaveMetadata`. *Diventa difetto reale appena arriva uno schema v2 o un save editato.*
- Test-gap (T2): nessun golden per `simulateSeason`; nessun test counting-RNG; CLI grossi senza test diretti; Playwright web non eseguito da nessun comando.

**MEDIUM (selezione)**
- `engine/career`: RNG realizzazione omette `seasonId` (`player-development.ts:561`) → modificatore congelato per carriera (diverge dallo spec).
- `engine/match-engine`: `step-match.ts` conflà loop-minuto + selezione attori + assist + etichette; bilanciamento split config/magic; **input tattici inerti** (T5).
- `content`: due modelli ability (T4); pool nomi stranieri troppo piccoli per unicità di lega; logica costruzione per-giocatore copiata in 3 generatori; calibrazione match in content.
- `domain`: 4 tassonomie ruoli (T4); identità/nazionalità giocatore **fuori dall'entità durevole** → persa al save/load (in side-channel `playerIdentities`); `Club.reputation` numero grezzo non validato che guida la matematica economica.
- `ui`: dipendenza implicita slotKey == suffisso chiave i18n; categoria inbox a 2 valori.
- `sim-tools`: helper duplicati in 4-5 report; nessun guard sul drift dei placeholder cross-lingua.
- `apps/web`: legacy morto presente; palette duplicata TS vs CSS; stato lineup denormalizzato; spec visual-qa che asserisce DOM morto.

**LOW (selezione)** — 24 voci, tutte di pulizia/coerenza: `Round` entity mai salvata; `findDuplicatePlayerIds`/`findDuplicateBenchPlayerIds` byte-identiche; bias modulo di `nextInt` per range grandi (non documentato); cast `as MessageKey` pervasivi nel web che aggirano il type-safety i18n; dispatch `career.ts` ripete load+try/catch ~10 volte; bug etichetta punte (live nel demo web); `prepare_match`/`inspect_*` esposte come sempre disponibili anche senza fixture.

**Affermazione DECLASSATA in verifica (onestà intellettuale):** "Player è l'unica entità senza
costruttore validato, i suoi invarianti vivono nel generatore" → **confutata** a *low*. Verità:
`createPlayerRoleIdentity` **non** è bypassato (il generatore passa attraverso di esso via
`generatedRoleIdentityForPosition`), e **anche** club/fixture/match/competition/league-table sono
interfacce nude senza factory — `Player` non è l'unico. Le ability 0-20 sono comunque imposte alla
costruzione dal tipo branded. Resta un nitpick di coerenza (manca un `createPlayer` che ri-asserisca
gli invarianti cross-campo in un punto), non un difetto high.

---

# FASE 2 — Divertimento e motore (esperienza utente)

Criterio guida (dalle regole del progetto e da `requirements.md §I`): *il motivo user-facing
viene prima del motivo matematico*. La domanda non è "i numeri tornano?" ma "il giocatore sente
la scintilla?".

## 2.1 La verità centrale: **manca il motore delle conseguenze** — CRITICAL

È la radice unica che collega quasi tutti i problemi di divertimento.

> **In-stagione, lo stato del giocatore non cambia mai. Quindi ogni decisione è inerte.**

- `form` è hard-reset a `RESET_FORM` (=50) a ogni stagione (`player-season-rollover.ts:39`) e
  **non viene mai scritto in-stagione** da nessun risultato.
- `morale` è generato a 50 e `normalizeMorale` lo **riporta solo verso 50** — un no-op, perché
  niente lo sposta mai.
- `fitness`: costo partita 8, recupero 5/giorno, cadenza 7 giorni → tutti tornano a 100 ogni
  settimana → **la rotazione non morde mai**.
- Il modificatore di realizzazione dello sviluppo è **congelato per tutta la carriera** perché
  l'RNG omette `seasonId` (`player-development.ts:561`).

Il dato cruciale: **le curve forma/morale esistono già** e sono cablate in
`team-strength.ts:251-255` — ma **nessun chiamante di produzione fornisce mai un valore mosso.**
I 4 knob tattici (2 dei quali inerti nel motore), la scelta della formazione e la rotazione
alimentano una simulazione il cui stato è **costante tra le partite**. Il substrato più difficile
e prezioso (sviluppo, condizione, team strength) **esiste già**: semplicemente non gli è permesso
di *cambiare* in risposta al gioco. Riattivarlo converte un simulatore batch statico in un gioco
reattivo **senza nuovi sottosistemi**.

## 2.2 Il test di accensione dei 30 minuti (`requirements.md §I`)

Il design elenca 7 sensazioni che il giocatore deve provare in mezz'ora. Pagella attuale:

| Sensazione richiesta | Stato |
|---|---|
| Rosa piena di limiti, leggibile a colpo d'occhio | 🟡 La rosa esiste; nel web mostra solo nome+ruolo+fitness 100 finto |
| Budget ridicolo, ogni spesa una rinuncia | 🔴 **Zero economia.** Nessun budget, stipendi, biglietti |
| Almeno una scelta difficile e leggibile (vendo il gioiellino?) | 🔴 Nessuna scelta del genere esiste nel loop |
| Una partita con una cronaca che crea tensione | 🔴 La partita è una scatola nera che stampa un punteggio |
| Un giocatore che sorprende e diventa "suo" | 🟡 Il mondo *genera* wonderkid, ma niente memoria/personalità lo rende "tuo" |
| Un problema economico che incombe | 🔴 Non esiste economia |
| Una classifica con posta in gioco dalla 3ª-4ª giornata | 🟡 La classifica esiste nel CLI; nel web è "unknown" |

Il test di accensione **fallisce gran parte dei propri criteri**, soprattutto nel web (l'unico
prodotto destinato all'utente).

## 2.3 Dimensione per dimensione

### A. La partita — CRITICAL
**Com'è oggi:** simulatore aggregato deterministico a due strati. Ogni minuto, ciascuna squadra
tira un Bernoulli "ho creato un'occasione" (`deriveOpportunityRate`, base 0.09/min, cap 0.24); se
sì, `AggregateOccasionResolver` tira qualità → probabilità gol da 3 bande (10.5/20/35%) → altrimenti
block/save/miss; **poi** `selectChanceActors` attacca i nomi (marcatore, assist, creatore, GK).
Output: lista eventi sparsa (kickoff/goal/save/miss/block/half_time/full_time).
**Forze:** bilanciamento aggregato credibile (~3.0 gol/partita, le squadre forti vincono di più
senza "win button", upset possibili); risultati *leggibili* via explanation trace; attribuzione
nomi coerente e role-aware; team strength sensato e sensitivity-tested; determinismo airtight.
**Problemi di divertimento:**
- 🔴 **Nessuna esperienza live** *(critical, confermato)*: la partita è una scatola nera. Nessun
  ticker, nessun ritmo, nessuna riproduzione minuto-per-minuto. Nel web **non si simula proprio
  nessuna partita.**
- 🟡 **Partite temporalmente piatte** *(medium, confermato)*: ogni minuto è statisticamente
  identico → nessun arco narrativo (niente assalto finale, niente "ultimi 15 minuti").
- 🟡 **Vocabolario eventi troppo magro** *(medium, confermato)*: solo goal/save/miss/block. Niente
  cartellini, infortuni, rigori, autogol, sostituzioni.
- 🟡 I nomi *decorano* il risultato ma non lo *causano* (nessun duello → la singola
  giocata/errore non decide mai); i knob tattici quasi non muovono la partita.
**Soluzioni (alto leverage, l'architettura le anticipa):** una **replay minuto-per-minuto** dello
stream di eventi che il motore *già emette* (zero modifiche al motore, il salto di divertimento
più grande disponibile dalla sola presentazione); cablare pressing/mentalità in
`deriveOpportunityRate`; moltiplicatore "squadra che insegue" negli ultimi ~15'; emettere
cartellini/falli/rigori/infortuni dallo stream esistente.

### B. Il loop di carriera (agency del manager) — HIGH
**Com'è oggi:** settimana per settimana il manager fa pochissimo — scegli XI, formazione/panchina,
4 knob + preset mentalità, avanza. L'unico path end-to-end è il CLI `--advance-next-fixture`. Gli
avversari usano **sempre** una formazione default e tattiche piatte 0.5 → niente a cui reagire.
L'output post-partita mostra fitness, **nessun movimento di classifica, nessun cambio forma/morale,
nessun rating, nessuna narrativa.** "Continue" è un fast-forward concettuale che non simula nulla.
Inbox: **2 sole categorie** (`match_preparation_required`, `matchday_reached`).
**Problemi:** 🔴 il loop settimanale **non ha motore di conseguenze** (§2.1) → è un bottone
fast-forward con sopra una schermata formazione *(high)*; 🔴 forma/morale congelati *(high)*; 🟡 la
rotazione non morde mai *(high)*; 🟡 nessuna agency in-partita (no team-talk, half-time, sub live)
*(medium)*; 🟡 nessuna posta in gioco (no obiettivi di società, no mercato in-stagione, no stampa,
no orologio dei soldi) *(medium)*.
**Soluzioni:** aggiungere update forma/morale post-partita accanto allo step condizione
(`progress-fixture.ts:144`) keyati su risultato+minuti; blocco post-partita con posizione+movimento
e top rating dal report esistente; alzare il costo fitness; un singolo obiettivo di società
read-only sul cruscotto; 1-2 nuove categorie inbox.

### C. Giocatori e mondo vivente — HIGH
**Com'è oggi:** il **modello di generazione è davvero buono** e la **simulazione del mondo è reale**,
ma l'anima emotiva è vuota. Footballer a 25 attributi con potential separato; generazione role-aware
con cap off-role, budget di rarità, 8 archetipi (da journeyman a wonderkid); identità distinte (27
nazionalità, 17 culture nomi, dedup cognomi). Evoluzione reale a livello di modello: curve di crescita
per fascia d'età, declino position-appropriate, ritiri/release/step-down, regen che rimpiazzano. *(Run
verificata di 8 stagioni: mondo sano, 594→621 giocatori attivi, storie emergenti con nomi.)*
**Cosa NON esiste:**
- 🔴 **Zero sistema di personalità** *(high, confermato)*. La 3-assi del design
  (professionalità/ambizione/temperamento) → 0 hit di grep.
- 🔴 **forma/morale sono valori morti** *(high, confermato)* — §2.1.
- 🟡 **Nessuna memoria di carriera del giocatore** *(medium)*: niente presenze/gol-per-club, data
  d'ingresso, numero di maglia, piede, milestone. Niente contratto/ingaggio.
- 🟡 **Nessuna emersione emotiva** *(high)*: niente news breakout, premi, giocatore-della-stagione.
  Le ricche statistiche per-giocatore alimentano solo report diagnostici CLI.
**Soluzioni:** allargare i pool nomi stranieri (6×6 → ~30×30, pura data); cablare le curve
forma/morale già esistenti nello step post-partita; 3-4 categorie inbox read-only su dati già
calcolati (capocannoniere, milestone di un tuo giocatore, miglior crescita, ritiro veterano);
generare una `PlayerPersonality` a 3 campi persistita e mostrarla come 3 aggettivi (anche prima che
guidi il comportamento); chip giocatore più ricchi nel web. *La "scheda-giocatore con memoria" è
indicata dal design (`§K`) come l'innesto col miglior rapporto valore/costo.*

### D. L'arco della lunga stagione (il nome del gioco) — HIGH
**Com'è oggi:** meccanicamente reale su un decennio, ma **una sola divisione chiusa, ZERO
promozioni/retrocessioni** (`relegat` = 0 occorrenze nel repo; `competition.entity.ts:8` rinvia
"promotion formats, playoff details" a "later"). *Run verificate:* 10 stagioni → dinastia poi
declino reale del club utente; 30 stagioni → **12 campioni unici**, club più titolato solo 6 titoli,
striscia massima 3 — il mondo **non si fossilizza**. Anzi, il rischio è opposto: la gerarchia di
forza **mean-reverte troppo** (spread ability 2.28 → 1.69 in 10 stagioni). Il mercato
(`transfer-turnover.ts`) **non è un mercato**: ~1 mossa ogni 4 club, niente prezzi/contratti, riempie
buchi. Il club dell'utente è perfino **protetto** dall'auto-promozione vivaio.
La cosa cruciale: **i fatti del decennio SONO persistiti** (`career-state.ts:121` archivia
`seasonHistory` con tabelle finali, campione, piazzamento utente).
**Problemi:** 🟡 l'utente **non può guidare** la traiettoria del club (evoluzione rosa interamente
automatica, nessuna leva di mercato giocabile in nessuna app) *(high)*; 🟡 **nessun payoff narrativo
causale** — il decennio è tabelle, non storie; non ti viene mai detto *perché* la dinastia è
crollata *(high)*; 🟡 la mean-reversion troppo forte rende lo squad-building a bassa posta *(medium)*;
🟡 l'arco decennale **non ha casa giocabile** (vive solo nei comandi-lab CLI) *(medium)*.
**Soluzioni:** generatore di **recap stagionale** deterministico sui dati `seasonHistory` già
esistenti (3-6 frasi: vincitore e margine, tua over/under-performance, giocatore standout, svolta);
check anomalia "varietà arco del club utente" (avvisa quando il decennio è stato piatto); lista
honours/storia persistente nel CLI già oggi.

### E. Il prodotto web (ciò che l'utente tocca davvero) — CRITICAL
**Com'è oggi:** menu rifinito, 6 skin, "New career"/"Continue" **fanno la stessa cosa** → aprono UN
cruscotto hardcoded (sei sempre la stessa squadra, stessa data, stesso avversario). Il cruscotto è
read-only su costanti: condizione finta (tutti fitness 100), classifica "unknown", ultima partita
"None". La nav mostra 10 sezioni ma **9 su 10 sono placeholder bloccati.** L'unica superficie
profonda e soddisfacente è il **workspace di preparazione tattica** (board SVG drag-drop,
long-press/right-click, colorazione suitability live, panchina a 8 slot, helper Auto/Fill/Clear).
Ma il loop è solo concettuale: "Continue" chiama il motore reale ma **non simula fixture**; il
miglior esito è `matchday_reached` con un bottone "Open matchday" → `handleInboxAction("open_matchday")`
**non ha alcun case nello store** (`career-ui-store.ts:135`) → **non fai nulla. Non puoi mai giocare
una partita.** Zero persistenza: un refresh cancella tutto.
**Problemi:** 🔴 **non si gioca mai una partita** — il loop termina su un bottone morto *(critical,
confermato implicitamente)*; 🔴 nessuna carriera reale (New/Continue = stessa fixture hardcoded)
*(high)*; 🔴 **niente persiste** *(high)*; 🟡 cruscotto = chrome vuoto *(high)*; 🟡 9 sezioni nav
placeholder *(medium)*; 🟡 profondità giocatore invisibile (5 fatti su dati mock) *(medium)*.
**Forza chiave:** lo store è un adapter pulito che **già chiama il motore reale** per lo stop logic
→ la saldatura verso un save reale è **stretta e intenzionale.** `buildDemoCareerDashboardInput`
ritorna **esattamente la forma** che un adapter di save reale produrrebbe. *È un problema di
cablaggio/adapter, non di riscrittura.*

### F. Visione vs realtà giocabile (il divario strategico) — CRITICAL
Il design (`requirements.md`, 22 aree marcate chiuse) promette un manageriale full-FM la cui
identità **è** "la Scalata" provinciale. Costruito: un kernel di simulazione mono-lega profondo +
CLI diagnostico + prototipo web. **Mancano interamente (0 file via grep):** finanza/economia,
biglietti/sponsor, stadio/strutture, staff, scouting, presidente/CdA, meteo/terreno, cartellini/
falli/rigori/sostituzioni in-partita, coppe/competizioni continentali, **promozione/retrocessione
multi-divisione**, tratti giocatore, spogliatoio/capitano, team-talk, event card narrative,
negoziazione mercato/agenti.
- 🔴 **"La povertà come design" (l'anima dichiarata) è totalmente non costruita** *(critical)*: zero
  finanza, biglietti, ingaggi, budget, sponsor.
- 🔴 **"La Scalata" (l'intera identità) non esiste** *(critical)*: una sola lega, nessuna
  promozione/retrocessione.
- 🔴 Match-day = risultato+report, non l'esperienza viva "a cinque atti" *(high)*.
- 🔴 Nessun layer narrativa/media/presidente *(high)*; mercato = churn AI autonomo, non la
  negoziazione a due tavoli promessa *(high)*; il web non gioca una carriera reale *(high)*; Inbox —
  progettata come superficie decisionale centrale e motore di cliffhanger — ha 2 soli tipi *(high)*.

**Il divario è un'inversione di priorità:** il design indica la progressione (Scalata) e l'economia
(povertà) come la leva di ritenzione #1 e l'anima del gioco, eppure sono i sistemi più assenti,
mentre la validazione statistica (un mezzo) è la parte più rifinita.

## 2.4 Divertimento promesso vs consegnato

| Pilastro di divertimento (design) | Costruito? |
|---|---|
| Match engine credibile e deterministico | 🟢 Sì, maturo e validato |
| Sviluppo/declino/vivaio giocatori | 🟢 Sì (manca declino-da-allenamento/infortuni) |
| Mondo decennale che genera dinastie/declini | 🟢 Simulazione sì, **surfacing no** |
| Match come esperienza vissuta (live, cronaca) | 🔴 No (scatola nera) |
| Conseguenze settimanali (forma/morale/rotazione) | 🔴 No (stato congelato) — *ma le curve esistono* |
| La Scalata (piramide, promozioni) | 🔴 No (mono-lega) |
| Economia / "povertà come design" | 🔴 No (0 file) |
| Mercato negoziato a due tavoli | 🔴 No (churn AI) |
| Narrativa / media / presidente | 🔴 No |
| Prodotto web giocabile + persistente | 🔴 No (demo in-memory) |

---

# 3. Sintesi trasversale e roadmap

## 3.1 I 9 temi sistemici (in ordine di gravità)

1. **[CRITICAL] Manca il motore delle conseguenze** — lo stato giocatore non muta mai in-stagione,
   quindi ogni decisione è inerte. Le curve esistono ma sono affamate di input mossi. *Il fix più
   ad alto leverage del progetto.*
2. **[CRITICAL] Il motore maturo non ha casa giocabile** — il web non gioca, non persiste, non
   espone la profondità. Ma la saldatura è pulita.
3. **[HIGH] Orchestrazione di gameplay che fuoriesce nel CLI** (T1) — serve `advanceCareerOneSeason`
   nel motore prima che il web crei una terza implementazione.
4. **[HIGH] Duplicazione meccanica pervasiva** (T3) — la causa dei file-monstre e dei bug a due modelli.
5. **[HIGH] Due modelli paralleli della stessa cosa** (T4) — riconciliati a mano, drift silenzioso.
6. **[HIGH] La verità statistica è validata; l'esperienza *sentita* non è né prodotta né emersa** —
   personalità, memoria, narrativa assenti; le storie muoiono in tabelle diagnostiche.
7. **[HIGH] Il rigore di test è invertito** (T2) — il codice più piccolo è il più testato; il più
   user-facing il meno.
8. **[HIGH] Player non validato + identità/attaccamento fuori dal save durevole** — collega il tema
   architetturale e quello emotivo.
9. **[MEDIUM] Input portati ma inerti** (T5) — leve che il giocatore imposta e che non fanno nulla.

## 3.2 Roadmap prioritizzata (bilancia i due obiettivi: divertimento + pulizia/determinismo)

> Sequenza pensata per leverage e dipendenze. **Fai prima P4** (rete di sicurezza determinismo)
> se toccherai bilanciamento/generazione.

| # | Intervento | Sforzo | Perché |
|---|---|---|---|
| **P1** | Use-case motore `advanceCareerOneSeason` (ordine rollover canonico + data/calendario), instradare **entrambi** i path CLI divergenti; test integrazione multi-stagione (invarianti + determinismo stesso-seed). | M (1-2 sett.) | Chiave di volta. Elimina T1, dà al web UN contratto fidato, converte il codice più logico-pesante non testato in codice motore testato. Sblocca P3, P7, P8. Estrazione di logica già funzionante → basso rischio. |
| **P2** | Rendere lo stato giocatore **reattivo**: scrivere `form` (per risultato/minuti) e `morale` (per minutaggio/risultato) nel path fixture, cablare le curve `team-strength.ts:251-255`, **aggiungere `seasonId`** all'RNG di realizzazione (`player-development.ts:561`). Test: due stagioni → modificatori diversi; un panchinaro vede muoversi la forma. | M | Radice più profonda (§2.1). Il substrato esiste già. È ciò che rende finalmente *importanti* formazione, rotazione e tattica. Vittoria pari per fun **e** correttezza. |
| **P3** | Cablare il vero matchday del motore nel loop web end-to-end: case `open_matchday` in `handleInboxAction` (`career-ui-store.ts:135`) → simula la fixture e mostra il risultato; turni-stagione via P1. | M (dopo P1) | Il payoff dei 30 minuti (`§I`) è strutturalmente mancante solo per un case mancante. Massimo fun/sforzo. Rende **raggiungibile** per la prima volta tutta la profondità già costruita. |
| **P4** | Test counting-RNG (minuto a zero occasioni consuma RNG identico) + test 0-0 + **golden pinnato** per `simulateSeason`. | S (1-3 gg) | L'assicurazione più economica per il vincolo #1 (determinismo). Trasforma le regressioni di bilanciamento silenziose in fallimenti CI. |
| **P5** | Rendere reale la suite Playwright web (target e2e nel `check`/CI, fix asserzione `campo-calcio` stale) o portarla a test jsdom; test interazione click→store→render. | S-M (3-5 gg) | Il codice più interattivo (~2.508 LOC di spec) oggi non è imposto da nessun comando. Protegge P3 e P8. |
| **P6** | Unificare la generazione su **un solo** modello ability (estendere il path role-aware per dare anche la banda potential, ritirare `buildPlayerAbilitiesForPosition`, migrare gli intake); modulo di build giocatore condiviso per i 3 generatori. | M | Chiude T4 + il collasso ruoli + la duplicazione content insieme. Rischio medio → gate col calibration-report. |
| **P7** | `createPlayer` domain-owned (potential≥current su 25 attr, posizioni naturali non vuote, role-identity coerente) + **identità sull'entità durevole** (ritirare il side-channel); `createClub` con `Reputation` branded. | M | Chiude il gap di validazione, fa **sopravvivere l'identità a save/load** (prerequisito per save reali e per la scheda-con-memoria), porta `Club.reputation` sotto disciplina. |
| **P8** | Persistenza JSON + adapter save reale nel web (localStorage), sostituire le costanti demo con stato reale; collassare il draft lineup denormalizzato a `tacticalBoardDraft` unica fonte; **eliminare il pitch legacy morto** (~342 LOC); validatore su load. | M-L (2-3 sett.) | Trasforma il prototipo in prodotto che sopravvive a un refresh. Fare il collasso stato + validazione storage **prima** dell'adapter mantiene pulita la saldatura. |
| **P9** | Accendere la superficie di ritenzione su dati esistenti: espandere `CareerInboxCategory` (breakout/premio/interesse-trasferimento/recap-stagione), record di **memoria-carriera** per-giocatore, **recap narrativo di stagione** (campione, tuo piazzamento, *perché*) da `seasonHistory`. | M | Massimo payoff emotivo/sforzo: espone dati che il motore **già produce** e che oggi muoiono in tabelle. Attacca il tema "mondo muto". |
| **P10** | Estrarre helper puri condivisi in `domain` (averageAbilities su un `ALL_ABILITY_PATHS`, età con bisestili, flatten 25-ability, classificatore posizione→gruppo); collassare parse `--lang`/`--seed` + 15 check mutua-esclusione CLI; sollevare la macchina PASS/WARN/FAIL in `shared`. | M (incrementale) | Ripaga T3, sgonfia i due file-monstre, rimuove il meccanismo dei bug ricorrenti. Basso rischio. |
| **P11** | Consolidare tutte le leve di bilanciamento in `MatchEngineConfig` (spostare block/save + coefficienti fuori dal resolver e la calibrazione fuori da content); **risolvere gli input tattici inerti** (cablare pressing/width/directness/risk a effetto bounded, o documentarli+testarli inerti); modulazione minuto/punteggio per dare arco narrativo. | M | Attacca T5, rende le leve tattiche finalmente efficaci (fun) e il bilanciamento data-driven (pulizia). Dipende dal golden di P4 per tunare in sicurezza. |

## 3.3 Quick wins (alto impatto, basso sforzo — fattibili subito)

- **Replay minuto-per-minuto** del flusso eventi già emesso dal motore (presentazione pura, zero
  modifiche al motore) → il più grande salto di divertimento disponibile.
- **Update post-partita di forma/morale** accanto allo step condizione → due valori morti diventano
  il loop di attaccamento centrale.
- Allargare i **pool nomi stranieri** (6×6 → 30×30, pura data) → fine dei cloni non-italiani.
- 3-4 **categorie inbox read-only** su dati già calcolati (capocannoniere, milestone, miglior
  crescita, ritiro) → il mondo diventa udibile tra le partite.
- **Nascondere/collassare le 9 sezioni nav disabilitate** + **persistere su localStorage** →
  rimuove le "porte chiuse" e l'esperienza ostile del refresh che cancella tutto.
- **Recap di stagione** deterministico da `seasonHistory` → l'arco del decennio diventa visibile.
- **Smettere di offrire "Open matchday"** se non fa nulla, finché P3 non lo collega.
- Alzare il **costo fitness**/abbassare il recupero → la rotazione inizia a mordere (mecca già
  costruita).

## 3.4 Rischi principali

- **Regressione di determinismo non rilevata** — il contratto counting-RNG non ha test,
  `simulateSeason` testa solo invarianti, nessun test rollover multi-stagione. P1/P2/P6/P11
  potrebbero spostare risultati e passare la CI. → **Fai P4 prima** dei cambi di bilanciamento.
- **Terza implementazione divergente di rollover** — se il web avanza una stagione prima di P1,
  diventa una terza copia. Evento di decadimento architetturale più probabile.
- **Fragilità del formato save** — migrazione = cast cieco, `SaveMetadata` non validato, identità in
  side-channel persa al save/load. Appena arriva la persistenza web (P8) o uno schema v2, un save
  editato/stale diventa un crash. → P7 + validatori **prima** dei save web.
- **Trappola di scope dal divario di visione** — la tentazione di iniziare un pilastro gigante
  (promozioni o finanza) prima di cablare il divertimento già esistente brucerebbe la pista mentre
  il web ancora non gioca. **Riattivare lo stato (P2) e cablare il matchday (P3) precedono qualsiasi
  pilastro nuovo.**
- **Drift di calibrazione generazione** — P6 e P11 muovono numeri di bilanciamento. Trattare il
  calibration-report come gate obbligatorio su entrambi.
- **Suite web orfana che nasconde regressioni** — P3 e P8 toccano proprio quel codice; senza P5 le
  loro regressioni arrivano invisibili.

---

## 4. Conclusione

The Long Season è un caso raro: **la parte difficile è fatta bene.** Il motore deterministico,
i confini architetturali eseguibili, lo sviluppo giocatori, le run decennali plausibili — sono un
fondamento su cui si può costruire per anni senza riscrivere. Il problema non è qualità del codice
in senso classico (i debiti esistono ma sono circoscritti e ben documentati).

Il problema è che **il divertimento consegnato è una piccola frazione del divertimento promesso**, e
la frazione mancante include i due pilastri che il documento stesso chiama i più distintivi (la
Scalata e la povertà-come-design), più il *motore delle conseguenze* che rende inerte tutto ciò che
già esiste.

La strada più saggia **non** è inseguire subito i grandi pilastri mancanti. È, in ordine:
**(1)** dare al motore un contratto di stagione fidato, **(2)** lasciar *cambiare* lo stato del
giocatore così che le decisioni contino, **(3)** collegare il vero matchday al web così che il
divertimento già costruito sia finalmente raggiungibile e persistente. Solo dopo — su quel loop che
finalmente diverte — vale la pena costruire economia, Scalata e narrativa, che hanno tutte una casa
architetturale già pronta ad accoglierle.

> *Come dice la regola del progetto stesso: "Prima il loop, poi il lusso." Il loop esiste in pezzi
> sparsi e congelati. Riattivarlo e renderlo raggiungibile è il lavoro che sblocca tutto il resto.*
