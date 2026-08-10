# Phase 81A - Post-L5 Correction Tranche

## TESI

Il motore non diventa più credibile imponendo risultati desiderati. Diventa più
credibile quando qualità delle rose, selezione, carico, sviluppo, compiti,
risoluzione delle occasioni e ricambio producono insieme distribuzioni simili
al calcio reale, lasciando possibili stagioni e giocatori eccezionali.

Le decisioni di prodotto sono:

1. la Prima Divisione è calibrata sulla popolazione Big Five congelata in
   `PHASE_81A_BIG_FIVE_STATISTICAL_BASELINE.md`;
2. Seconda e Terza Divisione ricevono benchmark separati e non ereditano mai i
   target della Prima per comodità;
3. su `34` partite il campione di Prima deve normalmente chiudere tra `72` e
   `88` punti, valutati sulla distribuzione dell'intera coorte e non come
   obbligo per ogni stagione;
4. risultati eccezionali, campionati molto equilibrati e dinastie restano
   possibili quando sono rari e spiegabili;
5. gli over `33` possono essere leader eccezionali, ma non devono dominare
   sistematicamente marcatori e assist; non esistono limiti individuali né
   penalità dirette su gol, assist, tiratore o creatore;
6. una metrica rossa non autorizza una correzione finché un confronto causale
   non identifica il suo owner;
7. nessun checkpoint può dichiarare `PASS` con una famiglia rossa
   `not_attributed`.

La conseguenza architetturale è che il piano separa rigorosamente verità
storica, attribuzione e correzione. `deriveTeamStrength(...)` continua a
descrivere i calciatori schierati; `deriveOpportunityQuality(...)` continua a
tradurre il contesto in occasioni; `selectChanceActors(...)` continua a
scegliere gli interpreti; `selectCareerAiTeam(...)` continua a scegliere la
squadra. Nessuna di queste funzioni riceve un bonus per divisione, età o target
del report.

## DOCUMENTO OPERATIVO

### Tranche di attribuzione corretta

| Step | Domanda | Comportamento | Exit |
|---|---|---:|---|
| 06B10A | benchmark separati di Seconda/Terza e registro unico dei target | no | target congelati |
| 06B10B | gate `OWNER_IDENTIFIED` e allineamento delle metriche rosse | no | strumenti non vacui |
| 06B10C | classifica compressa: popolazione o traduzione della forza? | no | un solo owner o STOP |
| 06B10D | minutaggio `33+`: selezione o mancanza di sostituti maturi? | no | un solo owner o STOP |
| 06B10E | tiri/gol/assist: allocazione per compito o esecuzione? | no | un solo owner o STOP |
| 06B10F | ricambio: intake, sviluppo, promozione o uscita? | no | un solo owner o STOP |
| 06B10G | identità: stessa metrica `0.8905` e causalità del role-vector | no | un solo owner o STOP |
| 06B10H | retry L5.1 sul `7 x 10` canonico | no | apre solo owner dimostrati |

### Tranche correttiva condizionale

| Step | Implementazione autorizzabile | Checkpoint |
|---|---|---|
| 06B11 | solo owner della gerarchia di classifica | 06B12, `7 x 2` |
| 06B13 | solo owner del carico anziani e/o ricambio | 06B15 |
| 06B14 | qualità per compito in `selectChanceActors(...)` o esecuzione in `deriveOpportunityQuality(...)`, mai entrambe senza attribuzione | 06B15 |
| 06B16 | blueprint morbido dei ruoli nell'intake, mai formazione protetta | 06B17 |
| 06B17 | canary integrata `7 x 10`, JSON canonico e HTML desktop inglese | GO riapre il `100 x 10` |

### Disegni causali obbligatori

- **Classifica:** stessi calendari, rose, RNG e decisioni. Un oracolo di analisi
  amplifica solo le differenze centrate di `TeamStrength`. Se la classifica si
  apre, l'owner è la popolazione; se non risponde, è la traduzione partita.
- **Minuti anziani:** confronto per stagione, ruolo e qualità tra `33+` e
  `24..29`, separando indisponibilità e presenza di una riserva valida. L'età è
  una dimensione di osservazione, non un malus di selezione.
- **Produzione:** tiri e nomine creatore devono essere letti prima di gol e
  assist. Qualità di compito -> nomine identifica l'allocazione; nomine -> esito
  identifica l'esecuzione.
- **Ricambio:** il funnel generazione -> sviluppo -> promozione -> minuti ->
  leaderboard mantiene denominatori distinti. Non si aumenta l'intake se il
  collo di bottiglia è lo sviluppo.
- **Identità:** il reader usa esattamente il gate di replica che ha prodotto
  `0.8905`; una metrica modale diversa non può assolverlo. L'intake può leggere
  un role-vector del club, non una formazione.

### Checkpoint e stop rules

- Tutte le coorti usano `pnpm cli simulation-report` e al massimo/esattamente
  `7` worker secondo il profilo bloccato.
- I target sono congelati prima del codice correttivo.
- Ogni correzione ha un checkpoint immediato prima dello step successivo.
- `not_attributed`, riconciliazioni non nulle, metriche non equivalenti o un
  oracolo entrato nel prodotto danno `REFINE` o `STOP / RETHINK`.
- La canary finale deve mostrare Prima, Seconda e Terza separatamente; applica
  a ciascuna solo il proprio benchmark.
- L'HTML finale è una vista del JSON canonico: non simula, non ricalcola e non
  possiede formule.

## Definition Of Done

- prima divisione nei target di coorte senza bonus diretti al risultato;
- benchmark lower-league separati e documentati;
- over `33` rari ma realmente raggiungibili nelle leaderboard;
- distribuzione tiri/gol/assist spiegata da compito e qualità;
- ricambio e identità tattica superano i rispettivi gate;
- canary `7 x 10` consultabile in HTML, con zero fallback e riconciliazioni;
- solo dopo `GO` di 06B17 può ripartire il `100 x 10`.
