# Fase 81A - Contratto di design per l'agenzia tattica contestuale

## Stato

**Accettato come contratto della Fase 81A il 7 agosto 2026.**

**Emendamento A1 accettato l'8 agosto 2026 dopo lo `STOP / RETHINK` del
Checkpoint B.** Lo Step 06 resta la misura storica corretta dello spazio
congiunto `formazione + tattica + lateralFocus`, ma quello spazio era più ampio
della policy di prodotto già fissata da questo contratto: nell'MVP la formazione
non è una contromossa libera contro l'avversario.

La Fase 81 è chiusa e la Fase 81A è il solo owner attivo. Questo documento
registra la tesi, i target e il protocollo vincolante per rendere le scelte
tattiche più divertenti, contestuali e spiegabili. Non riapre la Fase 81: ne
consuma il before-state e governa gli step sotto
[`81a-contextual-tactical-agency-manager-ai-decision-loop`](../steps/81a-contextual-tactical-agency-manager-ai-decision-loop/README.md).

Il before-state vincolante rimane:

- [report finale della Fase 81](./PHASE_81_PHASE_AWARE_TACTICAL_SHAPE_ENGINE_REPORT.md);
- [contratto di design della Fase 81](./PHASE_81_PHASE_AWARE_TACTICAL_SHAPE_AND_MANAGER_DECISION_ENGINE_DESIGN_CONTRACT.md);
- [Step 14 sulla formazione come contromossa](../steps/81-phase-aware-tactical-shape-and-manager-decision-engine/14-formation-as-a-counter-move.md);
- [stato corrente del progetto](../PROJECT_STATUS.md).

Ogni modifica parte soltanto quando il relativo step diventa attivo e resta
confinata ai suoi `Expected Files`. La Fase 81B conserva il successivo lavoro su
contratti, free agent e background fixtures.

## Emendamento A1 - Varietà per campionato e confini AI dell'MVP

Il risultato dello Step 06 non viene cancellato né reinterpretato: dimostra che
lasciare un oracolo libero di scegliere contemporaneamente formazione, profilo
tattico e lato produce una matrice quasi transitiva. Due firme soltanto coprono
tutti i `198` contesti effettivi e una riga è dominante. Questa è evidenza contro
quell'action space, non contro la varietà di rose ottenuta al Checkpoint A2.

La correzione autorizzata separa quattro responsabilità:

1. la generazione assegna a **ogni club** una composizione deterministica di
   ruoli; il campionato distribuisce in modo bilanciato queste identità, così in
   una lega da `20` club e con `8` identità ciascuna compare `2` o `3` volte,
   senza assegnare direttamente una formazione;
2. formazione e XI pre-partita continuano a essere scelti sui giocatori
   disponibili, sulla loro suitability e sul loro stato corrente;
3. nell'MVP il piano tattico AI parte dalla propria rosa e dalla forma scelta;
   non cambia formazione e non riceve ancora una lettura dell'avversario;
4. l'AI live reagisce soltanto a fatti già osservabili nello stato corrente -
   minuto, risultato, espulsioni, infortuni e sostituzioni disponibili - tramite
   il percorso canonico dei comandi live.

Questa semplificazione non autorizza un'architettura chiusa. Formazione, piano
pre-partita e aggiustamento live restano decisioni separate con output
strutturati. Una futura policy opponent-aware potrà sostituire il decisore
pre-partita senza cambiare generazione, match engine o formato dei comandi live.
Non si introducono però oggi input avversari ignorati, registry generici,
Implementation dormienti o export senza un consumer reale: l'estendibilità
deriva da Seam attive e testate, non da codice speculativo.

Lo Step 06A implementa la distribuzione per campionato e congela questi confini.
Il Checkpoint L1 / Step 06B verifica che la varietà regga su `100` mondi per
`10` stagioni e produce la vista HTML consultabile. Il Checkpoint B2 / Step 06C
ripete poi la domanda strutturale corretta: la formazione
selezionata dalla rosa è **contesto**, mentre `piano tattico + lateralFocus` è la
risposta enumerata. I target `+0.045 / -0.045 / 0`, `R / N_eff >= 0.25`,
ubiquità `<= 4`, il limite `0.55` e il protocollo a sette worker non cambiano.
Il precedente Step 06 resta consultabile come before-state e non viene
rigenerato per passare B2.

---

# Parte I - TESI

## Tesi

Il motore costruito dalla Fase 81 possiede un buon scheletro causale, ma
l'agenzia tattica del manager è ancora asimmetrica.

Il motore sa punire una forma incoerente e alcuni profili tattici possono già
funzionare meglio o peggio contro uno specifico avversario. Non sa ancora far
pagare in modo robusto una buona scelta di formazione e né l'AI pre-partita né
l'AI live usano il modello della gara con sufficiente profondità per trovare un
vantaggio contestuale.

L'esperienza risultante è più vicina a:

> non danneggiare un default ragionevole

che a:

> leggere giocatori e avversario, scegliere un compromesso e creare un vantaggio.

La soluzione non è aggiungere bonus alle formazioni o far aumentare la
`TeamStrength` per una decisione tattica. La soluzione è rendere più deep i
Module dei contributi tattici e del piano del minuto, in modo che:

1. attributi diversi eseguano compiti calcistici diversi;
2. formazione e tattica riallochino un budget tattico finito;
3. ogni beneficio produca un costo collegato;
4. l'avversario possa sfruttare quel costo;
5. AI e manager ragionino sugli stessi fatti;
6. la partita sappia spiegare cosa è cambiato dopo ogni decisione.

Per la prima evoluzione, la policy della formazione AI deve restare volutamente
semplice:

> scegliere la formazione di catalogo più adatta ai giocatori della propria rosa.

Il contesto dell'avversario deve inizialmente cambiare la tattica dentro quella
formazione, non la formazione stessa.

## Valutazione dell'ipotesi dell'utente

L'ipotesi secondo cui il manager può soltanto peggiorare la squadra non è
letteralmente vera, ma descrive correttamente la sensazione attuale del prodotto.

La Step 07B della Fase 81 ha misurato `1050` scenari accoppiati e `2100` partite
per riga:

| Decisione | Effetto misurato | Lettura |
|---|---:|---|
| Forma rotta `0-0-10` | deficit `0.4852` | grande e risolto |
| Un livello di divisione nella qualità rosa | `0.2521` | grande e risolto |
| Migliore contro peggiore set di slider | `0.0858` | risolto |
| Divario fra club top adiacenti | `0.0467` | risolto |
| Migliore guadagno strutturale | inizialmente `0.0312` | instabile intorno al rumore |
| Costo della peggiore formazione curata | `0.0305` | il costo esiste |
| Residuo di un attaccante dominante | `0.0098` | non risolto |

Il noise floor accoppiato dichiarato era `0.0295`. Gli slider tattici possono
quindi produrre vantaggi e costi reali. La formazione, invece, possiede un costo
misurabile ma non un vantaggio relazionale cross-validato sopra quel floor.

La Step 14 ha provato l'intera matrice `23 x 23` e ha rigiocato le best response
selezionate su uno stream di seed separato. Il guadagno da contromossa è stato
solo `0.0064` e `0.0117`, entrambi sotto `0.0295`. La modifica è stata
correttamente ritirata invece di rilassare la soglia.

La formazione più forte scelta alla cieca, `4-2-3-1`, ha prodotto medie di riga
`0.5184` e `0.5210`. Era un vantaggio intrinseco della forma, non una risposta
all'avversario. È il tipo di vantaggio che questo progetto deve evitare.

## Cosa deve rimanere vero

### `TeamStrength` continua a descrivere la qualità dei giocatori

Una decisione tattica non deve aggiungere direttamente attacco, centrocampo,
difesa, portiere o forza complessiva. Una scelta corretta migliora l'esito atteso
attraverso:

- disponibilità e distribuzione delle rotte;
- controllo;
- volume e qualità delle occasioni;
- esposizione alle transizioni;
- consumo fisico.

La spiegazione desiderata è:

> Il gioco diretto ha superato il pressing avversario e creato entrate centrali
> migliori, ma ha ceduto controllo e seconde palle.

La spiegazione rifiutata è:

> Il gioco diretto ha dato +8 alla forza.

### Nessuna formazione o tattica è migliore per definizione

Il motore non deve contenere regole come `4-2-3-1 batte 4-4-2`, bonus alla
formazione preferita o un punteggio tattico universale. La stessa decisione deve
poter aiutare, danneggiare o diventare irrilevante quando cambiano i giocatori o
l'avversario.

### La formazione AI rimane contestuale alla propria rosa

Il percorso carriera corrente segue già la policy richiesta:

- [`selectCareerAiTeam(...)`](../../packages/engine/src/career/career-ai-team-selection.ts#L93)
  legge la rosa disponibile e chiama il selettore condiviso;
- [`selectAiMatchSquad(...)`](../../packages/engine/src/team-selection/ai-squad-selection.ts#L165)
  costruisce XI e panchina;
- [`strongestCatalogShape(...)`](../../packages/engine/src/team-selection/ai-squad-selection.ts#L407)
  prova tutte le formazioni in `FORMATIONS` usando lo `structuralScore`;
- [`bestFieldedShape(...)`](../../packages/engine/src/team-selection/ai-squad-selection.ts#L368)
  riempie la forma scelta e gestisce separatamente una formazione forzata dal
  chiamante.

Questa policy va preservata. La condizione fisica può cambiare l'undici del
giorno, ma non dovrebbe far abbandonare per una settimana la forma per cui la
rosa è costruita. L'avversario deve influenzare le istruzioni tattiche, non
sostituire automaticamente la formazione selezionata dalla rosa.

## Perché gli avversari possono comunque sembrare tutti 4-4-2

Il selettore non contiene più un fallback carriera fisso in `4-4-2`, ma la
popolazione iniziale nasce ancora da una struttura di rosa stabile costruita
intorno a quel modulo.

- [`generateFakePlayersForClubs(...)`](../../packages/content/src/generators/fake-players.ts#L114)
  genera tutte le rose iniziali dalla stessa struttura numerata di slot;
- [`positionForSlot(...)`](../../packages/content/src/generators/fake-players.ts#L614)
  produce portieri, terzini, centrali, centrocampisti centrali, quinti, ali e
  attaccanti;
- [`primaryRoleForPosition(...)`](../../packages/content/src/generators/player-role-identity.ts#L9)
  traduce queste posizioni in sette dei dieci ruoli di dominio;
- [`canonicalRoleForSlot(...)`](../../packages/content/src/generators/fake-players.ts#L595)
  produce ancora la prima rappresentazione stabile dell'undici `4-4-2`.

Nessun giocatore generato ha come ruolo primario `defensive_midfielder`,
`attacking_midfielder` o `wide_midfielder`. La Fase 81 ha misurato `5579`
segnalazioni di copertura ruolo su `1000` stagioni, p95 `119` per mondo. Dodici
delle ventitré forme curate richiedono un trequartista.

La lettura corretta è quindi:

- nessuna regola carriera forza più tutti gli avversari al `4-4-2`;
- non esiste ancora una misura che dimostri sufficiente varietà nella
  popolazione reale generata;
- il `50 x 20` della Fase 81 non può rispondere, perché usava intenzionalmente
  `4-4-2` per tutti come strumento di controllo dell'engine.

Prima di cambiare il selettore bisogna misurare la varietà sul percorso carriera
reale.

## Causa a monte: livelli non conservati e allocazioni non contendibili

Il problema principale è visibile in quattro punti del codice.

### Quattro profili di forza alimentano dodici capacità

[`ROLE_WEIGHT_KEY_BY_CANONICAL_ROLE`](../../packages/engine/src/match-engine/team-strength.ts#L124)
riduce i ruoli canonici a quattro profili: portiere, difensore, centrocampista e
attaccante.

[`deriveLineupSlotScores(...)`](../../packages/engine/src/match-engine/team-strength.ts#L298)
salva poi un solo `score` scalare pesato per ogni slot dell'undici.

[`deriveTacticalShapeProfile(...)`](../../packages/engine/src/match-engine/tactical-shape.ts#L103)
usa lo stesso score per ogni compito tattico:

```text
contributo = score x peso del compito x quota di canale x coordinazione
```

Un giocatore forte nel proprio reparto tende quindi ad aiutare insieme
costruzione, progressione, pressing, coperture e protezione delle transizioni. I
profili ruolo più ricchi presenti nel dominio non raggiungono questo calcolo
tattico.

### I pesi dei compiti non hanno un budget conservato

[`validateContributionWeights(...)`](../../packages/domain/src/balance/match-tactics-calibration.ts#L833)
verifica completezza, interi non negativi, portiere isolato e contributo positivo
di ogni giocatore di movimento a ogni compito. Non vincola la somma dei pesi di
un ruolo.

Un ruolo o una forma possono così contribuire molto a numerosi compiti senza
spendere una risorsa finita. Sull'asset corrente, la somma dei contributi è
`52300` per un mediano e `33100` per una punta: a parità di qualità, il primo
porta circa `1.58x` calcio tattico totale. Il problema è quindi anzitutto il
**livello** prodotto, non una presunta correlazione fra attacco e difesa.

La misura sulle ventitré forme curate conferma la distinzione: attacco e difesa
hanno correlazione Pearson circa `+0.06`, quindi sono già largamente
indipendenti. Nonostante questo, la migliore risposta deterministica contro
tutti i ventitré avversari resta una sola, `4-2-3-1`, e la matrice non produce
un insieme robusto di cicli materiali. Attributi specifici per compito
cambieranno **chi** esegue bene un piano; da soli non correggono **quanto**
calcio totale una forma riceve né rendono contendibili le allocazioni.

La sola conservazione non basta. L'attuale `saturate(...)` è concava: una
distribuzione bilanciata potrebbe massimizzare il totale e spostare semplicemente
la strategia dominante sulla forma più equilibrata. Conservazione e popolazione
reale sbilanciata vanno testate insieme.

## Causa architetturale: ownership tattica divisa

[`deriveOpportunityRoutePlan(...)`](../../packages/engine/src/match-engine/opportunity-route.ts#L127)
possiede capacità e pesi delle rotte modificati dalle tattiche, volume e una
lettura `controlCapacity`.

[`deriveMatchMinuteControl(...)`](../../packages/engine/src/match-engine/match-control.ts#L22)
ricalcola separatamente possesso e creazione di occasioni. Il suo
`controlWeight(...)` applica coefficienti tattici hardcoded per pressing,
rischio, ampiezza e directness; `onTheBallQuality(...)` ricostruisce un secondo
confronto forma-pressing.

[`stepMatch(...)`](../../packages/engine/src/match-engine/step-match.ts#L207)
consuma poi sia i route plan sia il controllo separato.

L'ownership è shallow: l'Interface del piano tattico non possiede davvero tutte
le conseguenze e la conoscenza attraversa più Seam. La Locality è debole:
cambiare il significato di pressing o directness richiede ragionare su più
Implementation.

## Causa di gameplay: le scelte difensive rimuovono soprattutto il proprio gioco

La Fase 81 ha misurato `low_block` a `0.4394` di win share. La squadra ha creato
circa il `22.6%` di occasioni in meno ma ne ha concesse soltanto circa l'`1.7%`
in meno.

Il setting smette soprattutto di attaccare. Non offre ancora un trade-off
difensivo deep come:

- minore volume avversario;
- minore qualità delle rotte avversarie;
- maggiore protezione dell'area;
- peggiori uscite e minore progressione propria.

È naturale che il manager lo percepisca come penalità e non come piano.

## Causa decisionale: AI pre-partita e live troppo shallow

### Pre-partita

[`selectCareerAiTeam(...)`](../../packages/engine/src/career/career-ai-team-selection.ts#L93)
passa una callback che usa
[`deriveShapeTacticalDistribution(...)`](../../packages/engine/src/team-selection/shape-tactical-distribution.ts#L29).
Questa funzione deriva ampiezza, directness e rischio soltanto dal conteggio
degli slot della formazione; pressing e mentalità restano al baseline.

L'avversario e gli attributi specifici dell'undici non influenzano il piano.

### Live

[`selectAiInGameDecision(...)`](../../packages/engine/src/team-selection/ai-in-game-decisions.ts#L171)
è l'ingresso pubblico, ma
[`selectTacticalIntent(...)`](../../packages/engine/src/team-selection/ai-in-game-decisions.ts#L603)
legge soprattutto minuto, risultato ed espulsione.

[`adjustTactic(...)`](../../packages/engine/src/team-selection/ai-in-game-decisions.ts#L853)
muove poi più controlli con incrementi fissi. Non diagnostica perché il piano
stia funzionando o fallendo.

Il Module è shallow rispetto ai fatti già disponibili nella partita: sa reagire
allo svantaggio, ma non a costruzione bloccata, fascia esposta, pressing esausto
o cambio di rotta dell'avversario.

## Causa esplicativa: nessuna Locality temporale nel post-partita

[`createMatchExplanationTrace(...)`](../../packages/engine/src/match-engine/match-explanation-trace.ts#L277)
riceve un solo contesto e dati aggregati della gara.

[`createRouteSnapshots(...)`](../../packages/engine/src/match-engine/match-explanation-trace.ts#L354)
chiama `deriveTacticalMatchup(...)`, non il piano di opportunità modificato dalle
tattiche. I conteggi di rotta coprono l'intera partita mentre il chiamante può
fornire il contesto finale dopo cambi live.

La trace non distingue in modo affidabile:

- piano iniziale;
- periodo dopo il cambio del manager;
- risposta dell'avversario;
- varianza calcistica.

[`AppliedLiveMatchCommandFact`](../../packages/engine/src/match-engine/progressive-match-session.ts#L125)
offre già una buona Seam live, ma
[`createMatchReport(...)`](../../packages/engine/src/match-engine/create-match-report.ts#L17)
non trasforma ancora i cambi tattici in fatti post-partita durevoli e divisi per
fase.

## Definizione operativa di «più divertente»

Per questo engine, divertimento tattico significa:

1. **Vantaggio contestuale:** una scelta corretta migliora l'esito atteso sopra
   il noise floor misurato.
2. **Costo collegato:** la stessa scelta apre un'esposizione sfruttabile.
3. **Reversibilità:** cambiando giocatori o avversario può cambiare la risposta.
4. **Nessun ottimo universale:** formazione e tattica non collassano in una riga
   dominante.
5. **Causalità leggibile:** il gioco spiega cosa è stato comprato e cosa è stato
   concesso.
6. **Una sola verità:** AI, manager, simulazione e post-partita condividono la
   stessa derivazione.
7. **Influenza limitata:** una buona decisione vale circa un divario fra rose
   adiacenti, non un'intera divisione di qualità.
8. **AI fallibile senza barare:** vede soltanto fatti disponibili al manager e
   differisce per policy, rischio e tempi di reazione.

Il target di prodotto è fissato ora: una lettura chiaramente corretta deve
spostare almeno `+0.045` di win share, una lettura chiaramente sbagliata almeno
`-0.045`, mentre non impegnarsi o scegliere senza informazione avversaria deve
avere delta atteso `0`. Il valore `0.045` è vicino al divario misurato fra club
top adiacenti (`0.0467`), sopra il floor corrente (`0.0295`) e molto sotto un
livello di divisione (`0.2521`). Il nuovo floor servirà a dimensionare il
campione e l'intervallo di confidenza, non a decidere retroattivamente il target.

Il motore non assegnerà un bonus esplicito per aver «letto bene». Il delta dovrà
emergere dalle rotte e dalle esposizioni del matchup. Il valore atteso alla
cieca sarà misurato su una popolazione avversaria dichiarata e bilanciata, non
forzato partita per partita.

---

# Parte II - DOCUMENTO OPERATIVO

## Protocollo di sviluppo non negoziabile

Questa evoluzione non deve essere implementata come un unico blocco. Si lavora
su **uno step documentato alla volta** e si esegue un checkpoint obbligatorio
dopo ogni gruppo di due step, oppure prima quando cambia la causalità del
modello.

Un checkpoint non è un riepilogo narrativo. È una decisione verificabile con
tre soli esiti:

- **GO:** i segnali preregistrati sono presenti e si può aprire il blocco
  successivo;
- **REFINE:** si riaprono soltanto gli step che possiedono la causa del difetto,
  poi si ripete lo stesso checkpoint senza cambiare il target;
- **STOP / RETHINK:** l'ipotesi strutturale è smentita; gli step a valle non
  iniziano e il risultato viene registrato.

Nessun blocco successivo può iniziare con un checkpoint irrisolto. In
particolare, AI, interfacce e persistenza non devono compensare un nucleo
tattico che non ha superato il checkpoint strutturale.

Ogni checkpoint deve dichiarare **prima** dell'esecuzione:

1. commit o stato esatto del codice;
2. step inclusi e comportamento effettivamente disponibile;
3. popolazione, calendario, numero di mondi e denominator;
4. prefisso e separazione degli stream di seed;
5. metrica, direzione attesa, target e intervallo di confidenza;
6. regola di `GO`, `REFINE` e `STOP`;
7. throughput misurato, **esattamente 7 worker**, partite previste e wall clock
   stimato;
8. file di report che conserverà risultato e decisione.

Le simulazioni del checkpoint possono usare soltanto le Implementation già
atterrate. È vietato costruire fixture che anticipano una futura meccanica o
rendono raggiungibile artificialmente un branch. Se il blocco ha implementato
solo conservazione e rotte, il checkpoint misura il **tetto strutturale** di
conservazione e rotte; non attribuisce ancora quel risultato a un manager o a
una AI futura.

Un oracolo di analisi è ammesso soltanto per misurare questo tetto: deve essere
nominato esplicitamente, scegliere la best response su uno stream e rigiocarla
su uno stream indipendente. Non è una meccanica di prodotto e non dimostra
agenzia. Il target del manager realmente informato appartiene al Checkpoint D / Step 12.

Gli stream usati per scegliere una risposta e quelli usati per rigiocarla
devono essere separati. Soglie e target non cambiano dopo aver visto il
risultato. Ogni gate viene eseguito da solo, come richiesto dalle regole del
progetto.

## Decisioni di prodotto e architettura già bloccate

1. `TeamStrength` rimane qualità dei giocatori e non riceve bonus tattici.
2. Nessuna formazione o tattica possiede un modificatore universale al
   risultato.
3. Il target per una lettura chiaramente corretta è almeno `+0.045` di win
   share; per una lettura chiaramente sbagliata è al massimo `-0.045`.
4. Una scelta senza informazione avversaria deve avere delta atteso `0`; la
   tolleranza operativa iniziale è `|delta| <= 0.015` con intervallo di
   confidenza compatibile con zero.
5. La formazione AI continua a essere scelta sui giocatori della propria rosa.
   Questa è una **asimmetria di policy temporanea**: l'AI può rispondere con la
   tattica ma non con una nuova forma studiata per l'avversario.
6. Tale asimmetria richiede un gate specifico contro lo sfruttamento; il solo
   `no_dominant_formation` non basta.
7. Il manager riceve la lettura dell'avversario prima che l'AI inizi a usarla.
8. Manager e AI leggono la stessa Interface informativa, con gli stessi fatti e
   la stessa latenza. L'AI non può leggere capacità nascoste o lo stato completo
   della simulazione.
9. La direzione laterale deve diventare una scelta reale. Il primo Seam
   raccomandato è una singola istruzione tattica `balanced / left / right`, non
   una seconda decisione duplicata dentro il catalogo delle formazioni. Essendo
   un'allocazione tattica, appartiene allo Step 05.
10. Il post-partita non cambia retroattivamente la gara appena conclusa.
    Significa una scelta di preparazione che influenza la partita successiva.
11. Il primo set raccomandato di preparazione è: recupero marginale, prova del
    piano tattico, studio dell'avversario. Si sceglie una sola priorità e ogni
    beneficio sacrifica le altre due.
12. AI e manager dispongono delle stesse opzioni post-partita.
13. Fatti grezzi durevoli vengono persistiti una volta; riepiloghi, consigli e
    spiegazioni restano derivati.
14. La fase prende **un solo beta reset incompatibile**, nello Step 14, quando
    focus laterale, osservazione dell'avversario, capitoli e preparazione hanno
    tutti un consumer reale. Gli Step 05, 10 e 13 non avanzano versioni
    durevoli separatamente.
15. Determinismo, ordinamenti stabili, tie-break completi, reachability su dati
    reali e package boundaries restano obbligatori.

Le tre gate congelate della Fase 81 sopravvivono con nome e semantica invariati:

- `no_dominant_composition` legge il **massimo dei minimi di riga** sulle `66`
  composizioni e richiede che nessuna resti sopra `0.55` contro ogni singolo
  avversario;
- `no_dominant_tactic` legge la **massima media di riga** fra tattiche legali e
  la limita a `0.55`;
- `no_dominant_formation` legge la **massima media di riga** fra formazioni
  curate e la limita a `0.55`.

La nuova `best_response_ubiquity_multiple` risponde a una quarta domanda: quanto
più spesso della quota uniforme la stessa firma strategica è la best response.
Non sostituisce né riassume nessuna delle tre gate congelate.

## Protocollo informativo condiviso

**Emendamento A1:** il protocollo sottostante resta il design della futura
policy opponent-aware e il manager può ancora riceverne i fatti, ma il suo
consumo da parte dell'AI è fuori dall'MVP. Gli Step 10-12 devono essere
riscritti dopo un eventuale `GO` di B2 prima di poter iniziare; il testo storico
non autorizza più input avversari nella policy AI di questa fase.

Prima di costruire il valutatore AI deve esistere un Module di lettura
dell'avversario. La sua Interface restituisce fatti strutturati, non una
soluzione ottima:

- distribuzione storica delle formazioni osservate;
- rotte usate e concesse;
- impegno di pressing e rischio osservabili;
- lato preferito e lato esposto;
- variazioni dopo l'intervallo;
- numerosità e confidenza del campione.

Il pre-partita usa soltanto gare precedenti già osservabili. Il live usa
soltanto eventi e aggregati che il manager può vedere fino alla medesima finestra
decisionale. Una decisione AI non può essere calcolata con il futuro della
partita.

I report conservano già la rotta degli eventi, ma la formazione avversaria non
è ricostruibile in modo durevole dopo un reload. Il commento in
[`matchday-adapter.ts`](../../apps/web/src/features/matchday/matchday-adapter.ts#L395)
lo dichiara esplicitamente. Serve quindi un fatto minimo di forma schierata nel
report o nell'evento di carriera; da quel fatto si derivano tutte le statistiche
storiche senza duplicarle.

## Mappa degli step e dei checkpoint

| Blocco | Step | Cambia le partite | Checkpoint obbligatorio |
|---|---|---:|---|
| Fondazione | 01 ownership e contratti | no, salvo trace corretta | |
| Fondazione | 02 misura sulla carriera reale | no | 03 / A - before-state affidabile |
| Struttura | 04 conservazione analitica | sì | |
| Struttura | 05 rotte contendibili e focus laterale | sì | 06 / B - go/no-go strutturale |
| Giocatori e popolazione | 07 esecuzione per compito | sì | |
| Giocatori e popolazione | 08 identità rosa ed esecuzione laterale | sì | 09 / C - contesto giocatori reale |
| Decisione | 10 il manager legge l'avversario | sì, come informazione | |
| Decisione | 11 policy AI MVP, da riscrivere dopo B2 | sì | 12 / D - da riscrivere dopo B2 |
| Carriera | 13 capitoli tattici canonici | report e spiegazione | |
| Carriera | 14 preparazione e persistenza unica | sì, dalla gara seguente | 15 / E - conseguenza multi-partita |
| Chiusura | 16 coorte integrata | no | 16 / F - accettazione finale |

L'ordine risolve prima il livello e le allocazioni, poi chi le esegue. La
correlazione già bassa fra attacco e difesa dimostra che partire dagli attributi
per compito non correggerebbe il difetto principale. Allo stesso modo, dare
prima la lettura all'AI lascerebbe il manager a indovinare.

---

## Step 01 - Contratti e ownership tattica

### Obiettivo

Rimuovere ownership duplicata e fissare i contratti del successore senza
cambiare gli esiti della partita.

### Implementazione raccomandata

1. Eliminare `OpportunityRoutePlan.controlCapacity` finché non ha un lettore
   reale. Oggi è morto in produzione e duplica la formula live.
2. Spostare nell'asset soltanto le magnitudini positive dei coefficienti di
   pressing, rischio, ampiezza e directness di
   [`controlWeight(...)`](../../packages/engine/src/match-engine/match-control.ts#L66)
   e validarle con `isBasisPointShare(...)`. La direzione aumento/riduzione
   resta in una mapping calcistica totale e tipizzata accanto a
   `TACTIC_KNOB_FAVOURED_ROUTES` e `TACTIC_KNOB_EXPOSED_ROUTE`. Non si aggiunge
   un campo content firmato e non si allarga il validatore `0..10_000`.
   Il content conserva `1200 / 400 / 300 / 800`; la mapping assegna
   `increase` a pressing/risk/width e `decrease` a directness, riproducendo
   esattamente `+0.12 / +0.04 / +0.03 / -0.08`.
3. Fare in modo che la trace legga il piano effettivamente consumato dal minuto,
   non un secondo matchup ricostruito.
4. Correggere il JSDoc di
   [`createRouteSnapshots(...)`](../../packages/engine/src/match-engine/match-explanation-trace.ts#L354),
   che oggi promette una derivazione condivisa non realmente usata.
5. Documentare il contratto futuro per piano del minuto, lettura
   dell'avversario, fatti di capitolo, preparazione e singola integrazione
   durevole allo Step 14. Una nuova Interface entra nel codice soltanto insieme
   al suo primo consumer reale: nessun tipo o export anticipatorio può restare
   morto.
6. Registrare nel documento dello step i target `+0.045 / -0.045 / 0`, la
   policy formazione AI e il significato della decisione post-partita.

### Seam di codice

- [`deriveOpportunityRoutePlan(...)`](../../packages/engine/src/match-engine/opportunity-route.ts#L127);
- [`deriveMatchMinuteControl(...)`](../../packages/engine/src/match-engine/match-control.ts#L22);
- [`onTheBallQuality(...)`](../../packages/engine/src/match-engine/match-control.ts#L103);
- [`stepMatch(...)`](../../packages/engine/src/match-engine/step-match.ts#L207);
- [`createMatchExplanationTrace(...)`](../../packages/engine/src/match-engine/match-explanation-trace.ts#L277);
- asset in
  [`match-tactics-calibration.ts`](../../packages/domain/src/balance/match-tactics-calibration.ts).

### Prove di chiusura

- gli esiti, gli eventi di gioco e il consumo RNG sono identici al before-state;
- lo spostamento dei coefficienti è byte-equivalente;
- la trace cambia soltanto dove il vecchio modello parallelo era scorretto;
- nessun export o campo morto rimane;
- nessuna formula tattica viene copiata in un Adapter UI o in simulation-tools.

---

## Step 02 - Baseline della carriera reale

### Obiettivo

Misurare ciò che il giocatore incontra davvero, non la coorte controllata della
Fase 81 che forzava ogni squadra al `4-4-2`.

### Strumento raccomandato

Estendere simulation-tools con un runner che attraversa il percorso reale:

`mondo -> rose generate -> disponibilità -> selectCareerAiTeam(...) -> partita`

Per ogni club e giornata registra:

- formazione scelta;
- punteggio della prima e seconda forma candidata;
- numero e identità delle parità;
- tattica pre-partita;
- frequenza dei dieci ruoli primari;
- warning di copertura ruolo;
- indisponibilità e sostituzioni;
- ripetizione della stessa forma fra club e stagioni;
- throughput isolato per configurazione worker e wall clock delle coorti.

La misura deve attraversare:

- [`generateFakePlayersForClubs(...)`](../../packages/content/src/generators/fake-players.ts#L114);
- [`positionForSlot(...)`](../../packages/content/src/generators/fake-players.ts#L614);
- [`selectCareerAiTeam(...)`](../../packages/engine/src/career/career-ai-team-selection.ts#L93);
- [`selectAiMatchSquad(...)`](../../packages/engine/src/team-selection/ai-squad-selection.ts#L165);
- [`strongestCatalogShape(...)`](../../packages/engine/src/team-selection/ai-squad-selection.ts#L407).

### Evidenza già nota da preservare

La popolazione attuale genera esattamente:

- `2 gk`;
- `1 rb`, `6 cb`, `1 lb`;
- `3 cm`;
- `1 rw`, `1 lw`;
- `1 rwb`, `1 lwb`;
- `5 st`;
- `0 dm`, `0 am` e `0 wide_midfielder` come ruoli primari.

Sette forme pareggiano al vertice con rosa uniforme; il confronto stretto
mantiene la prima del catalogo, `4-4-2`. Con abilità variabili compaiono più
forme, ma occorre distinguere varietà dovuta a identità calcistica da parità e
ordine del catalogo.

### Criteri di chiusura

- runner deterministico e ripetibile;
- distribuzioni prodotte da rose vere, non fixture sintetiche;
- parità esplicitamente misurate;
- report con denominator e seed manifest;
- benchmark sufficiente a stimare costo e durata di ogni checkpoint futuro;
- nessuna modifica a generazione o selezione in questo step.

---

## Checkpoint A / Step 03 - Ownership e before-state

**Quando:** dopo Step 01 e Step 02.

**Scopo:** decidere se la diagnosi usata dagli step strutturali descrive davvero
la carriera corrente.

### Simulazioni e controlli

1. Replay accoppiato before/after Step 01 per dimostrare esiti e consumo RNG
   invariati.
2. Coorte carriera di Step 02 con almeno due stream separati: uno esplorativo e
   uno di replica.
3. Audit statico delle ventitré formazioni e delle somme contributive per ruolo.
4. Matrice uniforme `23 x 23` come fotografia, senza ancora pretendere un
   miglioramento.
5. Replay accoppiato `low_block` contro piano neutrale, a qualità uguale, per
   misurare nella stessa unità xG creato e concesso del before-state.

### Metriche preregistrate

- quota della formazione più frequente;
- numero di forme realmente selezionate;
- quota di selezioni decise da parità;
- sensibilità della selezione al riordino del catalogo;
- distribuzione dei dieci ruoli;
- warning di copertura;
- numero di best response distinte nella matrice;
- numero di cicli stretti fra triple di forme;
- somme contributive per ruolo;
- delta xG proprio, delta xG concesso e loro rapporto per `low_block` rispetto
  al neutrale.

Le percentuali storiche `-22.6%` di occasioni proprie e `-1.7%` concesse restano
un diagnostico sui volumi, non il riferimento numerico della nuova gate. A
fornisce il before-state xG omogeneo contro cui verranno letti `>= 8%` e
`<= 2.0`.

Il checkpoint registra inoltre partite/secondo, configurazione a esattamente
`7` worker e stima
del wall clock per B-F. Il precedente `50 x 20` della Fase 81 ha richiesto circa
`2h 54m` su sette worker: una tolleranza `0.015`, circa metà del floor `0.0295`,
può richiedere in prima approssimazione un campione vicino a `4x`. Il costo deve
essere reso esplicito prima di autorizzare la coorte, non scoperto durante il
gate.

### Decisione

- **GO:** la misura riproduce la struttura rosa uniforme, il bias di parità e
  l'assenza di risposte contestuali materiali.
- **REFINE:** l'instrumentation non attraversa il percorso reale o il replay non
  è equivalente; si correggono Step 01 o Step 02.
- **STOP / RETHINK:** la popolazione reale mostra già varietà stabile e
  contromosse materiali per una causa non descritta dalla tesi; si aggiorna la
  diagnosi prima di toccare il modello.

Il report del checkpoint diventa il before-state immutabile dei checkpoint
successivi.

---

## Step 04 - Conservazione analitica dei contributi

### Obiettivo

Impedire che un ruolo o una forma producano più calcio tattico totale soltanto
perché possiedono una somma di pesi maggiore.

### Soluzione raccomandata

Trasformare i pesi dei dodici compiti in allocazioni di un budget comune `B`
per ogni giocatore di movimento:

```text
somma dei pesi del ruolo = B
contributo al compito = capacità di esecuzione x quota allocata
```

`B` vive una sola volta nell'asset versionato. Le somme non vengono persistite:
sono derivate e validate. La forma decide dove allocare; non crea budget.

In questo step la capacità di esecuzione può ancora usare lo score scalare
corrente. È una scelta deliberata per isolare la conservazione dal futuro
modello attributi-per-compito.

### Alternative da prototipare analiticamente

- **Budget per ruolo:** ogni ruolo distribuisce `B` sui dodici compiti.
  È la prima scelta perché è leggibile e totalizzabile.
- **Budget per fase:** costruzione, progressione, rifinitura, finalizzazione e
  non possesso possiedono sotto-budget accoppiati. Si adotta solo se il modello
  semplice collassa sulla forma più bilanciata.
- **Normalizzazione a runtime:** divide gli asset correnti per la loro somma.
  È utile come esperimento, non come owner finale se nasconde coefficienti
  incomprensibili.

Non si deve introdurre un campo che conservi insieme peso grezzo e peso
normalizzato.

### Funzioni coinvolte

- [`validateContributionWeights(...)`](../../packages/domain/src/balance/match-tactics-calibration.ts#L833);
- [`deriveTacticalShapeProfile(...)`](../../packages/engine/src/match-engine/tactical-shape.ts#L103);
- `TACTICAL_SHAPE_TASKS` e contribution weights nell'asset di calibrazione;
- diagnostici di simulation-tools.

### Prove prima della simulazione

- somma esatta uguale per tutti i ruoli di movimento;
- tutte le quote restano raggiungibili su giocatori e forme reali;
- nessun ruolo riceve un default `??`;
- a qualità uniforme il totale disponibile è conservato;
- il portiere rimane isolato nel proprio contratto;
- una riallocazione aumenta almeno un compito e ne riduce almeno un altro.

### Criterio di chiusura

Lo step chiude soltanto se il modello è dimostrabile algebricamente. La
simulazione non può essere usata per coprire una violazione di conservazione.

---

## Step 05 - Rotte contendibili e focus laterale

### Obiettivo

Trasformare formazione e tattica in modi diversi di spendere lo stesso budget,
così che l'avversario possa premiare una concentrazione e sfruttarne il costo.

### Soluzione raccomandata

Il piano del minuto deve separare quattro quantità:

1. budget disponibile;
2. allocazione verso compiti e canali;
3. resistenza presentata dall'avversario;
4. esito saturato della rotta.

Una formazione non ottiene una capacità media extra. Compra, per esempio,
uscita laterale e ampiezza sacrificando protezione centrale o presenza in area.
Una tattica rialloca ulteriormente quel budget e paga un costo sulla fase
collegata.

Lo stesso step introduce l'unica istruzione che possiede l'impegno laterale:

```text
lateralFocus = balanced | left | right
```

`left` e `right` riallocano il budget fra canali e aprono un'esposizione sul
lato collegato. Le ventitré forme restano geometrie speculari: non ricevono una
seconda decisione laterale duplicata nel catalogo.

In questo step `lateralFocus` appartiene all'Interface del piano del minuto e
alla simulazione. Non cambia schema o envelope: lo Step 14 lo rende durevole
insieme agli altri fatti della fase, con l'unico beta reset.

[`deriveTacticalMatchup(...)`](../../packages/engine/src/match-engine/tactical-matchup.ts)
deve produrre confronti relativi utilizzabili da
[`deriveOpportunityRoutePlan(...)`](../../packages/engine/src/match-engine/opportunity-route.ts#L127).
Il controllo del minuto deve consumare lo stesso piano o una vista derivata da
esso, non ricostruire coefficienti indipendenti.

### Modelli candidati

- **Allocazione per rotta:** build-up, central progression, wide progression,
  box entry e transition condividono un budget finito.
- **Allocazione per fase:** il budget passa in sequenza; investire nel build-up
  non garantisce anche finalizzazione.
- **Resistenza relativa:** confrontare una rotta con la distribuzione difensiva
  avversaria. Va adottata solo se conserva la differenza di qualità assoluta;
  centrare tutto sulla media dell'avversario potrebbe cancellarla.

La differenza di qualità assoluta continua a provenire da `TeamStrength`. Il
matchup decide dove quella qualità trova spazio.

### Analisi obbligatoria prima del Monte Carlo

Per tutte le `23 x 23` forme a qualità uniforme e per lo spazio dichiarato di
azioni `formazione + piano tattico + lateralFocus`:

- calcolare matrice delle risposte;
- contare best response distinte;
- contare triple e cicli stretti;
- identificare righe dominanti;
- misurare costo e beneficio di ogni riallocazione;
- ripetere con almeno tre profili tattici coerenti;
- verificare che `left` e `right` siano equivalenti sotto mirroring completo.

La batteria deve includere almeno `low_block`, pressing alto e un piano diretto.
Per evitare un giudizio retroattivo, `low_block` riceve ora due target accoppiati
contro il piano neutrale, a qualità uguale:

- riduzione dell'xG concesso almeno `8%`, così il beneficio difensivo non è
  nominale;
- `max(0, perdita xG proprio) / riduzione xG concesso <= 2.0`.

L'xG aggrega volume e qualità, quindi il gate non prescrive quale dei due debba
muoversi. Il before-state perdeva circa `22.6%` di occasioni proprie per ridurre
quelle concesse soltanto di circa `1.7%`, un rapporto di circa `13.3` sui volumi.

Solo un modello analitico non transitivo può entrare nella simulazione. Non si
sceglie il candidato che vince sullo stesso stream con cui è stato calibrato.

### Criteri di chiusura

- le azioni analiticamente equivalenti vengono prima unite in firme strategiche
  con la regola congelata dal Checkpoint B / Step 06;
- almeno il `25%` delle firme strategiche effettive compare come best response;
- `best_response_ubiquity_multiple <= 4` rispetto alla quota uniforme;
- esiste almeno un ciclo stretto materiale e riproducibile;
- ogni vantaggio ha un costo localizzato;
- nessun coefficiente universale di formazione entra nel risultato;
- il piano del minuto ha un solo owner.

---

## Checkpoint B / Step 06 - Go/no-go strutturale

**Quando:** dopo Step 04 e Step 05.

**Scopo:** verificare la premessa fondamentale prima di investire in attributi,
popolazione, AI o UI.

### Fase 1 - Prova analitica

Si conserva la matrice base `23 x 23` e l'enumerazione delle `1771` triple di
forme come diagnostico comparabile, poi si esegue la matrice completa dello
spazio `formazione + piano tattico + lateralFocus`. La soglia analitica per
definire un arco materiale viene fissata nel report prima di aprire i risultati.

Lo spazio grezzo contiene almeno `23 x 3 x 3 = 207` azioni, ma il gate non usa
quel numero direttamente: due azioni con la stessa firma completa dei fatti
analitici consumati dal piano del minuto non rappresentano due strategie. La
firma comprende almeno allocazioni, resistenze, volume, qualità, controllo ed
esposizioni a risoluzione fixed-point. Prima di leggere la matrice, una regola
totale e versionata raggruppa soltanto le firme identiche. Siano:

```text
N_eff = numero di firme strategiche distinte
R     = numero di firme che compaiono come best response
p_max = massima quota uniforme di firme avversarie coperta da una risposta
```

La precisione è basis-point, coerente con l'asset tattico: ogni fatto viene
prima trasformato nella propria quantità dimensionless con scala e clamp
versionati, poi la firma conserva l'intero
`round(quantità_normalizzata x 10_000)`. Nessun `float64` grezzo e nessun
arrotondamento decimale ad hoc entra nell'identità.

La regola di equivalenza, le scale, le componenti della firma e i tie-break
vengono scritti nel report prima di calcolare gli esiti. Non possono usare win
share o identità della best response, altrimenti il raggruppamento diventerebbe
una calibrazione post-output. In questa fase analitica ogni firma avversaria
pesa `1 / N_eff`; la frequenza nella carriera reale viene misurata separatamente
a C.

Per ottenere `GO` servono insieme:

- conservazione esatta;
- `R / N_eff >= 0.25`;
- `best_response_ubiquity_multiple = p_max / (1 / N_eff) <= 4`;
- almeno un ciclo materiale che sopravvive alle varianti tattiche dichiarate;
- nessuna riga analiticamente dominante.

Le due soglie sono relative alla varietà strategica reale: aggiungere duplicati
cosmetici non facilita né irrigidisce il gate. Con `N_eff = 207`, per esempio,
servirebbero almeno `52` best response e nessuna potrebbe coprire più di circa
`1.93%` dei contesti.

Le soglie sono deliberatamente tangenti. Quando `R / N_eff = 0.25`, una
copertura perfettamente uniforme produce già
`best_response_ubiquity_multiple = 4`; qualsiasi disuniformità fallisce. Non
sono quindi due prove indipendenti: la seconda richiede in pratica più del
`25%` di risposte oppure uniformità esatta al limite. Un eventuale `REFINE` deve
riportare entrambe le quantità e attribuire il difetto a quella che sta
effettivamente mordendo.

Se questa fase fallisce, il Monte Carlo non parte.

### Fase 2 - Simulazione cross-validata

La Fase 2 non rigioca l'intero prodotto cartesiano. Prima di eseguire partite,
seleziona al massimo `32` contesti con campionamento deterministico stratificato
sulle firme strategiche della Fase 1:

1. coprire ogni `lateralFocus` e ogni profilo tattico dichiarato;
2. scegliere poi le firme con distanza massima dalle già incluse nello spazio
   normalizzato di tutti i fatti della firma strategica;
3. risolvere ogni parità con l'identificatore canonico dell'azione;
4. scrivere nel report algoritmo, strati, firme e pesi prima di aprire lo stream
   di replay.

La selezione non legge win share Monte Carlo. Se `N_eff <= 32`, usa tutte le
firme. I risultati aggregati vengono ripesati per gli strati dichiarati, così il
sottoinsieme non trasforma la popolazione bersaglio.

Sul sottoinsieme congelato:

1. un oracolo di analisi usa lo stream di selezione per identificare best
   response, risposta esposta e policy context-free per ogni contesto;
2. uno stream indipendente rigioca le tre policy senza riselezionarle;
3. la popolazione di avversari e la ponderazione vengono dichiarate prima;
4. il campione viene dimensionato dal floor misurato al Checkpoint A / Step 03;
5. il conteggio è fissato a esattamente `7` worker; partite e wall clock atteso
   vengono congelati prima del run.

Target aggregati sul replay:

- `counter_move_ceiling >= +0.045`: tetto della best response oracolare
  rispetto alla policy context-free;
- `counter_move_exposure <= -0.045`: costo della risposta deliberatamente
  esposta rispetto alla stessa baseline;
- policy context-free/non-impegno: `|delta| <= 0.015` sulla popolazione
  bilanciata e intervallo compatibile con zero;
- `no_dominant_composition`, `no_dominant_tactic` e
  `no_dominant_formation` conservano lettore e soglia `0.55` originari.

Le tre gate congelate continuano a girare sulle rispettive popolazioni complete
e non vengono stimate dal sottoinsieme di massimo `32` contesti. Quel
sottoinsieme appartiene soltanto al replay costoso del tetto-oracolo.

Questi numeri provano che il modello contiene un Leverage contestuale. Non
provano che un manager sappia osservarlo o realizzarlo: quella è la domanda del
Checkpoint D / Step 12.

### Decisione

- **GO:** fase analitica e tetto-oracolo superano tutti i target strutturali.
- **REFINE:** esistono reversals ma materialità o stabilità falliscono; si
  riaprono esclusivamente Step 04 o Step 05 e si ripete il checkpoint.
- **STOP / RETHINK:** la matrice resta transitiva, il miglior piano è universale
  o il risultato esiste solo sul seed di selezione.

Finché B non dà `GO`, Step 07 non inizia.

---

## Step 07 - Esecuzione del giocatore specifica per compito

### Obiettivo

Fare in modo che la stessa allocazione sia eseguita diversamente da giocatori
con attributi diversi, senza cambiare il significato di `TeamStrength`.

### Soluzione raccomandata

Introdurre una derivazione tattica per compito, versionata nello stesso asset
delle allocazioni. Esempi:

- build-up: tecnica, passaggio, visione, compostezza;
- progressione larga: accelerazione, dribbling, cross, tecnica;
- pressione: lavoro, resistenza, aggressività, decisioni;
- copertura transizione: posizione, anticipazione, velocità, lavoro;
- finalizzazione: movimento, tiro, compostezza.

Sono esempi da validare contro gli attributi reali del dominio, non formule già
approvate. Ogni compito deve avere un mapping totale, typed ed esaustivo.

[`deriveLineupSlotScores(...)`](../../packages/engine/src/match-engine/team-strength.ts#L298)
continua a possedere la valutazione di reparto. Il nuovo Module tattico deriva
l'esecuzione del compito dai giocatori e dal fit nello slot, poi la moltiplica
per l'allocazione conservata. Non memorizza una seconda `TeamStrength`.

### Prove obbligatorie

- due giocatori con uguale forza di reparto ma attributi diversi cambiano i
  compiti attesi;
- scambiare esecutori cambia rotte e costi, non aggiunge forza gratuita;
- ogni ramo è raggiungibile su giocatori generati reali;
- lo stesso giocatore non è migliore in tutti i compiti;
- i profili di reparto pubblici restano invariati;
- il calcolo è deterministico e ha tie-break completi.

### Criterio di chiusura

Il modello non resta in shadow mode: dopo il `GO` strutturale deve diventare
l'unica Implementation dell'esecuzione tattica. Un duplicato shadow senza
lettore sarebbe residuo.

---

## Step 08 - Identità delle rose ed esecuzione laterale

### Obiettivo

Fare sì che i club generati abbiano strutture riconoscibili e che la miglior
formazione AI emerga dai loro giocatori, senza ritornare a ventitré copie del
`4-4-2`.

### Soluzione raccomandata per le rose

Sostituire l'unica ossatura di
[`positionForSlot(...)`](../../packages/content/src/generators/fake-players.ts#L614)
con identità rosa deterministiche e budgetate. La generazione deve variare
l'abbondanza relativa dei ruoli, non assegnare direttamente una «formazione
vincente».

Approccio preferito:

1. scegliere con RNG derivato un'identità di rosa fra archetipi di allocazione;
2. garantire minimi di copertura e dimensione uguale;
3. distribuire il resto fra mediani, trequartisti, esterni, quinti e punte;
4. generare attributi coerenti ma non clonati;
5. lasciare a
   [`strongestCatalogShape(...)`](../../packages/engine/src/team-selection/ai-squad-selection.ts#L407)
   la scelta della forma.

La prima versione deve rendere raggiungibili tutti i dieci ruoli primari. Non
serve che ogni singola rosa li contenga tutti.

### Esecuzione raccomandata per sinistra/destra

Lo Step 08 non introduce una seconda scelta. Consuma il `lateralFocus` posseduto
dallo Step 05 e usa l'esecuzione per compito dello Step 07 per determinare
quanto bene i giocatori reali sostengono quella riallocazione e quanto costa il
lato esposto.

La forma resta geometria, l'istruzione possiede l'impegno e i giocatori ne
possiedono l'esecuzione. Ruoli o duties futuri potranno modificarne il costo,
mai duplicarne la decisione.

### Prove obbligatorie

- tutti i ruoli primari sono raggiungibili su mondi reali;
- una stessa forma può essere migliore per una rosa e peggiore per un'altra;
- invertire giocatori o debolezza avversaria inverte la scelta laterale;
- `left` e `right` sono simmetrici sotto mirroring completo;
- un focus laterale corretto compra una rotta e apre il lato opposto;
- le parità hanno un tie-break calcistico e deterministico, non casuale.

---

## Checkpoint C / Step 09 - Giocatori, rose e lato

**Quando:** dopo Step 07 e Step 08.

**Scopo:** verificare che il nucleo strutturale sopravviva quando entrano
giocatori reali e popolazioni non uniformi.

### Popolazioni

1. coorte uniforme del Checkpoint B / Step 06, per rilevare regressioni strutturali;
2. mondi carriera completi con rose generate;
3. scenari speculari sinistra/destra;
4. rose con qualità totale accoppiata ma profili attributo diversi.

I target strutturali di B vengono rimisurati con controfattuali accoppiati. Ogni
coppia conserva:

- snapshot carriera, rose, disponibilità, fitness e morale;
- casa/trasferta e avversario;
- XI e formazione quando si isola la sola policy tattica;
- seed partita e stream RNG.

Cambia soltanto la policy sotto test. Se il confronto riguarda invece la scelta
della formazione, l'eventuale cambio di XI è un effetto dichiarato della policy
e viene riportato separatamente. Best response e replay continuano a usare
stream distinti. Non si confrontano club o mondi diversi per inferire un delta
di `0.045`: il divario rosa di `0.2521` renderebbe quella lettura non
identificabile.

### Target verificabili

- i target numerici di varietà vengono congelati dopo A e prima di implementare
  Step 08, sempre come delta rispetto al before-state e mai come conteggi
  assoluti già verdi;
- la quota di selezioni decise da parità si riduce della quantità relativa
  preregistrata rispetto ad A;
- riordinare il catalogo non cambia la scelta per la stessa rosa, salvo
  equivalenze calcistiche dichiarate esplicitamente;
- a disponibilità comparabile, la scelta dello stesso club è più stabile della
  differenza osservata fra club con rose strutturalmente diverse;
- cambiare davvero fit, attributi o disponibilità può cambiare la forma, mentre
  il solo riordino del catalogo non può farlo;
- numero di forme e concentrazione della prima forma restano diagnostici: i
  limiti anti-collasso vengono congelati rispetto agli intervalli di A, ma non
  valgono da soli come prova di identità;
- tutti i dieci ruoli primari compaiono nella popolazione;
- warning di copertura e slot fuori ruolo non peggiorano rispetto ad A;
- lo stesso modulo cambia resa al cambiare degli esecutori;
- almeno un confronto laterale si inverte sotto mirroring;
- le tre gate `no_dominant_*` conservano le rispettive semantiche nella
  popolazione reale;
- `R / N_eff >= 0.25` e `best_response_ubiquity_multiple <= 4`, ricalcolati
  analiticamente su tutte le `N_eff` firme e mai sul sottoinsieme Monte Carlo di
  massimo `32` contesti;
- `counter_move_ceiling`, `counter_move_exposure` e baseline context-free del
  Checkpoint B / Step 06 restano superati fuori campione.

Il numero di mondi viene congelato prima dell'esecuzione dopo aver stimato la
varianza su un prefisso di seed non usato nel giudizio.

### Decisione

- **GO:** varietà, reversibilità e materialità convivono.
- **REFINE:** l'identità rosa o l'esecuzione altera l'ordine ma distrugge uno dei
  target; si riapre Step 07 o 05 secondo la Locality del difetto.
- **STOP / RETHINK:** la scelta resta guidata dall'ordine del catalogo o da
  rumore non collegato all'identità rosa, una forma torna universale oppure
  l'esecuzione laterale non crea un costo sfruttabile.

Finché C non dà `GO`, non si costruisce la lettura del manager.

---

## Step 10 - Il manager legge l'avversario

### Obiettivo

Dare al giocatore umano informazioni sufficienti per distinguere una scelta
ragionata da un tentativo alla cieca.

### Soluzione raccomandata

Creare un Module `OpponentRead` language-agnostic che deriva i fatti dal
percorso storico e dal live. La UI traduce i fatti, ma non ricalcola calcio.

Nel pre-partita il manager vede:

- forme usate di recente e confidenza;
- rotte preferite e rotte concesse;
- lato preferito o esposto;
- pressing e rischio osservati;
- possibili compromessi del proprio piano.

La UI non deve scrivere «scegli X per vincere». Deve rendere leggibile:

```text
evidenza -> scelta possibile -> beneficio -> esposizione
```

Nel live, gli aggiornamenti arrivano soltanto alle finestre già autorizzate e
usano segmenti trascorsi della gara.

### Fatti minimi

Lo Step 10 deriva la lettura dai fatti della Fase 81 già durevoli nei report e
dalla sessione live corrente. La forma storica non ricostruibile resta
esplicitamente `not_observed`; non riceve un default. Lo Step 14 farà emettere a
[`createMatchReport(...)`](../../packages/engine/src/match-engine/create-match-report.ts#L17)
forma schierata e confini dei capitoli e li persisterà nello stesso reset. Le
statistiche aggregate dell'avversario restano derivate e non vengono salvate
accanto ai fatti.

Le sei componenti sono nominate e totali:

1. `formation_history`;
2. `route_history`;
3. `pressing_risk_history`;
4. `lateral_history`;
5. `half_time_change_history`;
6. `sample_confidence`.

Il Checkpoint D preregistra il profilo a cinque componenti realmente disponibile
in quel momento: le ultime cinque sono consumabili e `formation_history` resta
`not_observed`. Non è instrumentation mancante e non può essere sostituita con
la forma live o con un default.

### Prove obbligatorie

- gli stessi report in memoria producono la stessa lettura;
- con zero storico la confidenza è esplicitamente bassa;
- un campione vecchio o piccolo non diventa certezza;
- il manager vede ogni input che sarà poi disponibile all'AI;
- nessun testo user-facing entra in domain o engine;
- la lettura non contiene il futuro o stato nascosto della simulazione.

---

## Step 11 - L'AI risponde con gli stessi fatti

### Obiettivo

Permettere all'AI di compiere scelte pre-partita e live corrette o sbagliate in
modo spiegabile, senza barare.

### Policy raccomandata

1. Scegliere XI e formazione sulla propria rosa tramite
   [`selectCareerAiTeam(...)`](../../packages/engine/src/career/career-ai-team-selection.ts#L93).
2. Ottenere lo stesso `OpponentRead` disponibile al manager.
3. Valutare un insieme piccolo e deterministico di piani tattici.
4. Selezionare fra opzioni entro un margine di regret dichiarato, usando un
   profilo rischio e uno stream RNG derivato stabile.
5. Applicare la decisione tramite le Interface pubbliche già usate dal manager.
6. Conservare motivo, evidenza letta, beneficio atteso ed esposizione.

La fallibilità non viene da informazioni nascoste o rumore non deterministico.
Viene da confidenza limitata, profilo di rischio e scelta entro un margine
esplicito.

### Pre-partita

[`deriveShapeTacticalDistribution(...)`](../../packages/engine/src/team-selection/shape-tactical-distribution.ts#L29)
può restare il priore basato sulla forma. L'AI applica poi una risposta
contestuale sulle tattiche. La formazione resta bloccata dalla propria rosa.

### Live

[`selectAiInGameDecision(...)`](../../packages/engine/src/team-selection/ai-in-game-decisions.ts#L171)
deve ricevere diagnosi di capitolo, non soltanto minuto e punteggio.

[`selectTacticalIntent(...)`](../../packages/engine/src/team-selection/ai-in-game-decisions.ts#L603)
e
[`adjustTactic(...)`](../../packages/engine/src/team-selection/ai-in-game-decisions.ts#L853)
devono distinguere almeno:

- rotta di costruzione bloccata;
- lato sovraccaricato o esposto;
- pressing inefficiente o esausto;
- vantaggio che richiede controllo;
- svantaggio che richiede rischio.

### Prove obbligatorie

- AI e manager ricevono input strutturalmente identici allo stesso istante;
- rimuovere un fatto al manager lo rimuove anche all'AI;
- decisioni corrette, sbagliate e non-impegno sono tutte raggiungibili;
- due club con profilo rischio diverso possono scegliere diversamente;
- identico seed e stato producono la stessa decisione;
- l'AI non cambia formazione per leggere l'avversario in questa fase.

---

## Checkpoint D / Step 12 - Ciclo decisionale manager/AI

**Quando:** dopo Step 10 e Step 11.

**Scopo:** dimostrare che l'informazione crea agenzia per entrambi e che la
policy di formazione AI non regala un exploit sistematico.

### Scenari accoppiati

Per ogni contesto dichiarato si confrontano:

- manager informato con policy corretta;
- manager informato con policy volutamente esposta;
- manager senza lettura avversaria;
- AI con la stessa lettura e latenza;
- AI con confidenza bassa;
- avversario AI con formazione fissata sulla rosa ma tattica reattiva;
- decisione pre-partita e decisione all'intervallo.

La policy può essere calibrata su seed distinti da quelli del replay, ma nel
replay la singola azione deve essere scelta soltanto dai fatti di
`OpponentRead`. Nessun oracolo del Checkpoint B / Step 06 entra nel percorso manager/AI.
Il profilo di D esclude per contratto `formation_history`: il checkpoint misura
se le cinque componenti disponibili bastano a realizzare agenzia prima della
persistenza dello Step 14.

### Target verificabili

- `realized_manager_agency >= +0.045` per la policy informata corretta;
- `realized_manager_exposure <= -0.045` per la policy informata ma sbagliata;
- cieco/non-impegno: `|delta| <= 0.015` e intervallo compatibile con zero;
- tutti e tre i branch sono raggiungibili su dati reali;
- l'AI non possiede alcun input extra;
- la policy formazione-fissa non è sfruttabile da una risposta umana
  universale;
- `best_response_ubiquity_multiple <= 4` sulle firme strategiche disponibili
  alla policy AI;
- la risposta live migliora il capitolo successivo ma può peggiorarlo quando la
  diagnosi è errata.

### Decisione

- **GO:** manager e AI ottengono Leverage contestuale dalle cinque componenti,
  senza vantaggio informativo nascosto. Il report dichiara che la storia delle
  formazioni non era necessaria per superare D.
- **REFINE:** un fatto implementato o la mapping manager/AI è errata; si riapre
  soltanto Step 10 o Step 11.
- **STOP / RETHINK:** il profilo a cinque componenti, implementato correttamente,
  non raggiunge il target. Non si attribuisce il fallimento a informazione
  nascosta e non si apre Step 14 speculativamente: prima si ridiscute l'ordine
  della fase.
- **STOP / RETHINK:** il vantaggio dipende da mostrare al manager meno
  informazione dell'AI o da leggere lo stato interno futuro.

Finché D non dà `GO`, non si costruisce il loop post-partita.

---

## Step 13 - Capitoli tattici e spiegazione canonica

### Obiettivo

Collegare ogni decisione a ciò che è successo prima e dopo, senza costruire un
secondo modello esplicativo.

### Soluzione raccomandata

Segmentare la sessione corrente usando i fatti già disponibili in
[`AppliedLiveMatchCommandFact`](../../packages/engine/src/match-engine/progressive-match-session.ts#L125):

- piano iniziale;
- capitolo fino alla prima decisione;
- capitolo dopo il cambio manager;
- capitolo dopo la risposta AI;
- fase finale.

Ogni capitolo conserva fatti minimi:

- intervallo di minuti;
- decisione applicata;
- rotte tentate e riuscite;
- volume e qualità delle occasioni;
- controllo;
- costo concesso;
- stato fisico rilevante.

La spiegazione deriva la catena:

```text
fatto osservato -> decisione -> cambiamento del piano -> esito del capitolo
```

Non deve attribuire automaticamente il risultato finale alla decisione. Il
confronto è fra periodi e contiene confidenza e campione.

### Funzioni coinvolte

- [`createMatchExplanationTrace(...)`](../../packages/engine/src/match-engine/match-explanation-trace.ts#L277);
- [`createRouteSnapshots(...)`](../../packages/engine/src/match-engine/match-explanation-trace.ts#L354);
- progressive match session e report facts;
- Adapter UI soltanto per localizzazione e presentazione.

### Prove obbligatorie

- la somma dei capitoli riconcilia i totali partita;
- il cambio al minuto `m` non riscrive il periodo precedente;
- la trace usa lo stesso piano consumato dal minuto;
- la stessa sequenza di fatti rigenera la stessa spiegazione; aggiunta al
  `MatchReport` e round-trip durevole appartengono allo Step 14;
- nessun report contiene prosa renderizzata;
- una gara senza cambi produce un solo capitolo coerente.

---

## Step 14 - Preparazione post-partita e singola integrazione durevole

### Obiettivo

Dare a manager e AI una decisione dopo la gara che possa migliorare o
peggiorare la **partita successiva**, a seconda di rosa, calendario e avversario.

### Prima Implementation raccomandata

Dopo il report, si sceglie una priorità settimanale:

- **recupero marginale:** più condizione per chi ha giocato, meno prova tattica e
  meno precisione sul prossimo avversario;
- **prova del piano:** migliore esecuzione iniziale di uno specifico piano,
  nessun recupero marginale e lettura avversaria meno profonda;
- **studio dell'avversario:** aumenta confidenza e dettaglio di `OpponentRead`,
  nessun bonus diretto al risultato e meno recupero/prova.

Il recupero fisiologico di base continua a esistere. La scelta possiede soltanto
la quota discrezionale, così non duplica o cancella in modo nascosto
[`applyCareerWeeklyRecovery(...)`](../../packages/engine/src/career/career-weekly-recovery.ts#L49).

La prova del piano deve avere scadenza e bersaglio espliciti; non crea una nuova
forza permanente. Lo studio migliora l'informazione disponibile, non la
probabilità di vincere. Ogni effetto viene consumato una sola volta dalla
partita successiva o dalla settimana definita.

### Integrazione con lo stato esistente

- [`applyCareerMatchStateConsequences(...)`](../../packages/engine/src/career/career-match-state-consequences.ts#L114)
  continua a possedere forma e morale post-gara;
- weekly recovery continua a possedere il recupero base;
- il nuovo Module possiede soltanto l'allocazione discrezionale di preparazione;
- la participation ledger resta l'unica verità sull'impiego recente;
- il save conserva decisione e scadenza, non i suoi riepiloghi derivabili.

Lo stesso step integra in un solo contratto durevole tutti i fatti della fase:
`lateralFocus` nella preparazione carriera, forma avversaria schierata, confini e
fatti grezzi dei capitoli, decisione di preparazione e scadenza. SQLite, schema
eventi, envelope e versioni beta avanzano **una sola volta qui**. Le carriere
incompatibili vengono eliminate senza migrazione, dual reader, campi legacy
opzionali o default. Una carriera creata dopo questo reset deve restare
caricabile attraverso E e F.

Dopo il reset `formation_history` diventa la sesta componente. È disponibile
soltanto con campione positivo e confidenza sufficiente; su storia volatile o
insufficiente resta `not_observed`.

### Policy AI

L'AI sceglie fra le stesse tre opzioni leggendo:

- condizione e carico della rosa;
- giorni fino alla prossima gara;
- confidenza della lettura avversaria;
- piano che intende provare;
- proprio profilo rischio.

Non legge l'esito futuro. Una policy con molti giocatori stanchi può preferire
recupero; contro un avversario poco noto può studiare; con rosa fresca può
provare il piano. Nessuna opzione è migliore per partito preso.

### Prove obbligatorie

- tutte le opzioni sono la scelta migliore in almeno uno stato carriera reale;
- tutte possono essere sbagliate in almeno uno stato reale;
- save/load e avanzamento settimana consumano l'effetto una volta;
- nessun effetto retroattivo sulla partita chiusa;
- nessun accumulo permanente o runaway;
- la scelta AI è deterministica e usa gli stessi dati del manager;
- il ramo non viene reso raggiungibile con una fixture artificiale.

---

## Checkpoint E / Step 15 - Conseguenza multi-partita

**Quando:** dopo Step 13 e Step 14.

**Scopo:** verificare che spiegazione e preparazione producano apprendimento e
conseguenze reali senza introdurre una nuova statistica universale.

### Simulazione

Eseguire mini-stagioni accoppiate con calendario reale, save/load intermedi e
quattro policy:

1. preparazione contestuale informata;
2. sempre recupero;
3. sempre prova del piano;
4. sempre studio dell'avversario.

Ogni mondo viene rigiocato con gli stessi seed partita. Le differenze devono
provenire dallo stato carriera e dalle decisioni, non da uno stream RNG
riallineato.

Sugli stessi mondi si esegue inoltre un'ablation accoppiata: `OpponentRead`
completo a sei componenti contro la stessa lettura con la sola
`formation_history` mascherata. Restano identici fatti, action set, seed, XI e
avversario.

### Target verificabili

- ogni opzione vince il confronto in almeno un cluster reale preregistrato;
- nessuna policy fissa domina tutti i cluster;
- una preparazione chiaramente corretta per la gara successiva raggiunge
  `delta >= +0.045`;
- una scelta chiaramente sbagliata raggiunge `delta <= -0.045`;
- i capitoli identificano il meccanismo che ha materializzato il vantaggio o il
  costo;
- forma, morale, fitness, impiego e preparazione non duplicano lo stesso dato;
- rotazione, affaticamento e qualità rosa non vengono schiacciati dalla nuova
  scelta;
- reload a metà mini-stagione produce report e risultati identici;
- il profilo completo conserva agenzia/esposizione/non-impegno a
  `+0.045 / -0.045 / |delta| <= 0.015`;
- la storia delle formazioni cambia confidenza o piano in almeno un contesto
  reale preregistrato;
- nei cluster con storia stabile e sufficiente aggiunge almeno `+0.015` di win
  share rispetto alla lettura mascherata;
- con storia volatile o insufficiente resta `not_observed` e il mascheramento
  cambia la win share al massimo di `0.015`.

### Decisione

- **GO:** preparazione e ablation della formazione storica sono contestuali,
  materiali e spiegabili.
- **REFINE:** capitoli o preparazione riaprono Step 13/14. Reachability o
  calibrazione di `formation_history` riaprono Step 10/14; D si ripete soltanto
  se cambia il percorso mascherato a cinque componenti, altrimenti si ripete E.
- **STOP / RETHINK:** la conseguenza richiede un bonus permanente, duplica
  fitness/morale, rende ottima una policy fissa oppure la sesta componente
  richiede informazione nascosta per diventare contestuale.

Finché E non dà `GO`, non parte la coorte finale.

---

## Step 16 - Coorte integrata e accettazione

### Obiettivo

Verificare insieme varietà, contromosse, informazione, AI, conseguenze e
determinismo senza usare la coorte finale per calibrare il modello.

### Popolazioni obbligatorie

1. matrice uniforme `23 x 23`;
2. rose accoppiate con qualità uguale e attributi diversi;
3. mondi carriera completi con popolazione generata;
4. partite con manager informato, cieco e volutamente esposto;
5. AI pre-partita e live;
6. mini-stagioni con preparazione post-partita;
7. scenari speculari sinistra/destra;
8. replay con save/load.

La dimensione finale viene congelata all'ingresso dello step usando la varianza
osservata nei checkpoint precedenti. I seed di accettazione non devono essere
stati usati per scegliere coefficienti o soglie. Il report congela anche
esattamente `7` worker, throughput atteso e wall clock prima di avviare ogni gate
isolato. Il comando fallisce se il conteggio effettivo non è sette.

### Gate finali

- **conservazione:** budget identico e riallocazioni a somma zero;
- **identità rosa:** i delta di varietà, parità, stabilità e concentrazione
  congelati dopo A restano superati;
- **ordine catalogo:** riordinare le forme non cambia le selezioni salvo
  equivalenze dichiarate;
- **invarianti congelate:** `no_dominant_composition` conserva il minimo di
  riga; `no_dominant_tactic` e `no_dominant_formation` conservano la media di
  riga; tutte mantengono la soglia `0.55`;
- **diversità delle risposte:** `R / N_eff >= 0.25` e
  `best_response_ubiquity_multiple <= 4`, ricalcolati analiticamente su tutte
  le `N_eff` firme; il campione Monte Carlo di massimo `32` contesti non possiede
  questa gate;
- **tetto strutturale:** `counter_move_ceiling >= +0.045` e
  `counter_move_exposure <= -0.045` su replay indipendente;
- **agenzia realizzata:** baseline D a cinque componenti e lettura finale a sei
  componenti riportate separatamente; entrambe mantengono manager informato
  `>= +0.045`, manager informato ma sbagliato `<= -0.045`, cieco
  `|delta| <= 0.015`;
- **storia delle formazioni:** cambia una decisione reale, aggiunge almeno
  `+0.015` nei cluster stabili/sufficienti e resta ignorata entro `0.015` nei
  cluster volatili/insufficienti;
- **giocatori:** cambiare esecutori può invertire la decisione;
- **lateralità:** mirroring inverte lato e conserva il risultato accoppiato;
- **low block:** riduzione dell'xG concesso `>= 8%` dal neutrale e rapporto fra
  perdita xG propria e riduzione concessa `<= 2.0`;
- **Emendamento A1 su D/AI:** i target del manager sopra restano; la storica
  parità informativa AI/manager è superseded per l'MVP. Dopo B2 e prima dello
  Step 10, D deve preregistrare separatamente il gate della policy AI basata su
  rosa e stato corrente, senza `OpponentRead` e senza exploit universale;
- **live:** diagnosi e conseguenza appartengono allo stesso capitolo;
- **post-partita:** ogni preparazione è utile e dannosa in contesti reali;
- **spiegazione:** trace e minuto condividono la stessa derivazione;
- **persistenza:** esiste un solo reset nella fase e una carriera creata allo
  Step 14 attraversa save/load fino a F senza un secondo reset;
- **determinismo:** stessi input, seed e save producono stessi output;
- **regressioni:** gli invarianti della Fase 81 restano verdi.

### Checkpoint F / Step 16 - Decisione finale

- **GO:** tutti i gate superano gli intervalli preregistrati; la fase può essere
  chiusa e il report diventa nuovo before-state.
- **REFINE:** fallisce un owner locale e viene riaperto soltanto il suo step,
  seguito dal relativo checkpoint intermedio e poi da F.
- **STOP / RETHINK:** materialità o non-dominanza falliscono in modo sistemico;
  non si rilassano soglie e non si dichiara il motore «più divertente».

---

## Artefatto richiesto a ogni checkpoint

Ogni checkpoint deve produrre un Markdown nella futura cartella di fase con:

```text
stato codice
step inclusi
ipotesi
popolazione e seed manifest
N_eff, regola di equivalenza e firme strategiche
sottoinsieme di contesti e pesi di campionamento
chiavi del controfattuale accoppiato
throughput, worker effettivi (`7`) e wall clock
metriche e intervalli
risultato osservato
GO / REFINE / STOP
owner del difetto
modifica ammessa
checkpoint da ripetere
```

Il report non duplica tabelle versionate: collega gli asset e conserva soltanto
configurazione dell'esperimento, risultati e decisione. Se l'esito è `REFINE`,
il documento dello step successivo viene aggiornato prima di riprendere; non si
riscrive la storia del checkpoint fallito.

## Raccomandazione di adozione

La prima tranche da autorizzare è soltanto:

```text
Step 01 -> Step 02 -> Checkpoint A / Step 03
```

Dopo A, la seconda tranche originaria era:

```text
Step 04 -> Step 05 -> Checkpoint B / Step 06
```

Il Checkpoint B / Step 06 è il vero investimento decisionale. Se non dimostra
conservazione, `R / N_eff >= 0.25`,
`best_response_ubiquity_multiple <= 4`, almeno un ciclo materiale e il
tetto-oracolo `counter_move_ceiling / counter_move_exposure / context-free`
fuori campione, il progetto non deve iniziare Step 07. Questo non è ancora un
claim di agenzia: il target del manager informato resta posseduto dal
Checkpoint D / Step 12.

Lo `STOP / RETHINK` di B ha chiuso quella tranche. L'Emendamento A1 autorizza
ora soltanto:

```text
Step 06A -> Checkpoint L1 / Step 06B -> Checkpoint B2 / Step 06C
```

L1 verifica prima la salute longitudinale della popolazione. B2 mantiene i
target tattici ma condiziona la formazione sulla rosa. Soltanto il `GO` di
entrambi può aprire Step 07.

Soltanto con `GO` si autorizzano, una tranche alla volta:

```text
Step 07 -> Step 08 -> Checkpoint C / Step 09
Step 10 -> Step 11 -> Checkpoint D / Step 12
Step 13 -> Step 14 -> Checkpoint E / Step 15
Step 16, incluso Checkpoint F
```

Questo ritmo soddisfa il vincolo di sviluppo incrementale: ogni due step esiste
una simulazione coerente con ciò che è davvero disponibile, una decisione
esplicita e la possibilità concreta di affinare o abbandonare la direzione prima
che il costo si propaghi.
