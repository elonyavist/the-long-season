# Phase 81A - Post-L6.1A Decision Disentanglement Tranche

## TESI

L6.1A ha fermato correttamente il piano, ma il suo `STOP / RETHINK` non dice
che tutte le domande siano tornate ignote. Dice che tre esperimenti indipendenti
erano subordinati a una sola condizione di completamento: un controllo storico
pre-06B16 non vitale per dieci stagioni. Quel controllo è necessario per stimare
un fattoriale completo mercato/blueprint; non è necessario per osservare dove si
perdono gli utilizzatori della rosa corrente, né per perturbare in modo accoppiato
la forza della popolazione corrente.

La correzione metodologica è separare le decisioni, non salvare retroattivamente
il checkpoint. L6.1A resta `STOP / RETHINK` e nessuna sua diagnostica diventa da
sola autorizzazione. Due nuove popolazioni fresche devono rispondere a due gruppi
di domande diversi:

1. un solo braccio prodotto corrente conferma, su seed mai letti, il primo stadio
   strutturale capace di riportare uso rosa nelle bande e il replay accoppiato
   della gerarchia;
2. un disegno a supporto comune confronta il prodotto corrente con la rimozione
   di un solo componente per volta. Misura il contributo del mercato dato il
   blueprint e del blueprint dato il mercato, senza fingere di conoscere main
   effect o interazione quando il quarto angolo non è un mondo vitale.

Il risultato serve al gioco, non al report. Se la selezione usa sempre gli stessi
calciatori pur avendo alternative credibili, il manager vede rose senza storie e
giovani senza spazio. Se la gerarchia è troppo compressa, una grande squadra non
sembra grande. Se mercato e blueprint non rinnovano ruoli e leader, le carriere
lunghe invecchiano. Ogni eventuale correzione deve quindi migliorare una di queste
esperienze calcistiche con un owner dimostrato, non rendere verde una media.

## DOCUMENTO OPERATIVO

### Fatti congelati da L6.1A

- il prodotto corrente completa `28/28` mondi per dieci stagioni;
- il controllo pre-06B16 fallisce deterministicamente in
  `phase81a-renewal-refinement-l6-1a-v1-world-00005`, stagione `9`, con
  `finance_lifecycle_rejected`;
- il fattoriale completo è quindi `not_evaluated`; i sei superstiti non sono un
  braccio e il seed fallito non può essere sostituito;
- il funnel strutturale uso rosa nomina `matchday_selection` in `28/28`, ma il
  suo controfattuale cambia il denominatore raggiungibile: non dimostra ancora
  che una policy alternativa faccia realmente giocare quei calciatori;
- il replay accoppiato nomina `population_strength` in `28/28`, con cinque
  guardrail storici mantenuti;
- togliere il cap delle trattative attive non migliora il percorso di rinnovo e
  assolve quel cap come owner isolato.

Questi valori sono before-state. Nessun nuovo checkpoint può citarli come proprio
`GO`; deve riprodurre il suo owner su una popolazione fresca.

### Sequenza autorizzata

| Step | Domanda | Comportamento | Exit |
|---|---|---:|---|
| 06B19B | L6.1B-S/H: su mondi correnti freschi, uso rosa e gerarchia hanno owner indipendenti? | no | due decisioni canoniche, ciascuna apre soltanto il proprio slot |
| 06B19C | L6.1C: a supporto comune, quale componente è necessario al rinnovo corrente? | no | apre un owner singolo/congiunto, registra `REFINE` o ferma un contributo antagonista |
| 06B20C | correzione gerarchia, solo con owner L6.1B | condizionale | checkpoint immediato |
| 06B20D | correzione uso rosa, solo con owner L6.1B | condizionale | checkpoint immediato |
| 06B20A/B | correzione mercato o blueprint, solo con owner singolo L6.1C | condizionale | checkpoint immediato |
| 06B20E | design congiunto mercato/blueprint, solo se L6.1C prova necessità accoppiata | condizionale | nuovo checkpoint prima del gameplay |
| 06B21 | L6.2 sul registro completo | no | solo dopo ogni checkpoint owner autorizzato |

06B20A-E restano slot, non implementazioni. Un loro documento si scrive soltanto
dopo il risultato che li apre. In particolare `coupled_required` non autorizza a
modificare due owner nello stesso step: autorizza soltanto un nuovo design causale.

### Esito registrato il 2026-08-11

L6.1B-S è `REFINE`: il limite strutturale arriva a `25.9778` utilizzatori
distinti contro il floor `26`. L6.1B-H è
`GO: owner_identified: population_strength` in `28/28` e apre soltanto 06B20C.
L6.1C è `STOP / RETHINK: antagonistic`: tutti i bracci riconciliano, ma il
mercato role-aware riduce la replica di quattro formazioni oltre il floor in
`5/7`. 06B20A/B/E restano chiusi; il controllo storico fallisce durante
`annual_payroll`, non in un'operazione di mercato.

### L6.1B: una popolazione corrente, due decisioni indipendenti

Il profilo bloccato usa `28` mondi freschi, dieci stagioni ed esattamente sette
worker. Non include controllo storico, bracci mercato, blueprint o cap. Produce
un JSON canonico con due sezioni decisionali sorelle:

- `squadUseLane`: lettura esatta di candidati, disponibili, pool del selettore,
  rosa partita e partecipazioni. Il proprietario è uno stadio strutturale, non
  una policy alternativa già provata;
- `hierarchyLane`: replay accoppiato già congelato con
  `analysisStrengthGapScale = 1.5`, stessi calendari e seed, più i cinque
  guardrail storici.

Una corsia non legge decisione, fallimenti o valori dell'altra. Il profilo ha
un solo fallimento di esecuzione comune perché senza un mondo completo nessuna
corsia possiede fatti; dopo il completamento, ogni corsia ha la propria decisione
e il proprio `failedGateKeys`. Non esiste un roll-up che trasformi un rosso di
una corsia nell'owner dell'altra.

Per `squadUseLane`:

- se entrambe le bande correnti tengono, il checkpoint è `GO` con risultato
  `no_correction` e nessuno step si apre;
- se una banda è rossa, riconciliazione zero, un owner unico compare in almeno
  `20/28` mondi, supera ogni runner-up e il suo limite strutturale porta entrambe
  le bande dentro target, il checkpoint è `GO` con risultato
  `owner_identified` e apre un solo step owner;
- se il limite strutturale non basta, l'owner è `not_attributed`: mai si sceglie
  una penalty di rotazione dal delta necessario;
- il successivo step di comportamento deve dimostrare su partite simulate che
  utilizzatori e minuti cambiano davvero. La sola aritmetica del denominatore
  non può chiuderlo.

Per `hierarchyLane`:

- `population_strength` deve essere l'owner pooled congelato, col delta campione
  nella direzione sana oltre il floor di `0.5` punti in almeno `20/28` mondi;
- la media paired deve entrare nella fascia esatta del registro;
- last-club points, spread, PPG deviation, goals per match e draw share applicano
  la clausola congelata di nessuna nuova distanza dalla propria banda;
- ogni altra classificazione è `REFINE` o `not_reproduced`, non una licenza a
  modificare il coefficiente di forza.

Le corsie sono due checkpoint nominati, `L6.1B-S` e `L6.1B-H`. Ciascuno registra
esattamente una decisione canonica `GO`, `REFINE` o `STOP / RETHINK`; le
classificazioni `owner_identified`, `no_correction` e `not_reproduced` sono
risultati dentro un `GO`, non nuovi stati del protocollo. Un errore di esecuzione
comune ferma entrambi perché nessuno ha una popolazione completa; dopo il
completamento, il `REFINE` di una corsia non chiude il `GO` dell'altra.

### L6.1C: supporto comune senza quarto angolo fittizio

Il profilo bloccato usa sette nuovi seed per dieci stagioni e tre bracci vitali:

| Braccio | Mercato role-aware | Blueprint intake | Significato |
|---|---:|---:|---|
| `current` | on | on | prodotto corrente |
| `without_market` | off | on | contributo mercato dato il blueprint |
| `without_blueprint` | on | off | contributo blueprint dato il mercato |

I bracci girano in sequenza e ciascuno usa esattamente sette worker. Il disegno
non contiene `off/off`: L6.1A ha provato che quel controfattuale non appartiene
al supporto comune decennale del corpus congelato. Nessun fallback finanziario,
seed sostitutivo, orizzonte abbreviato o sesto superstite lo rende valido.

Per ogni metrica `M` si calcolano soltanto:

```text
market_given_blueprint    = current - without_market
blueprint_given_market    = current - without_blueprint
```

La direzione sana è dichiarata per metrica prima del run. Un contributo è
materiale soltanto oltre il floor A6 della metrica, con segno coerente in almeno
`5/7` coppie e intervallo paired riportato. Le categorie sono totali:

- `market_required`: solo il primo contributo è materiale e sano;
- `blueprint_required`: solo il secondo è materiale e sano;
- `coupled_required`: entrambi sono materiali e sani;
- `antagonistic`: almeno un contributo materiale va nella direzione sbagliata;
- `not_reproduced`: entrambi sotto floor;
- `not_attributed`: incompletezza, riconciliazione o player-path mancante.

Il report scrive `mainEffects = not_identifiable_under_common_support` e
`interaction = not_identifiable_under_common_support`. Tre angoli non vengono
mai presentati come un fattoriale. Un owner richiede anche l'intersezione fra il
percorso di bisogno/trasferimento/impiego toccato dal componente e la metrica
finale; una differenza aggregata senza percorso resta `not_attributed`.

La decisione canonica L6.1C è `GO` solo per `market_required`,
`blueprint_required` o `coupled_required` con percorso riconciliato; è `REFINE`
per `not_reproduced` o owner incompleto; è `STOP / RETHINK` per antagonismo,
contaminazione, scenario incompleto o riconciliazione non nulla.

Il fallimento storico riceve un diagnostico strutturato del preciso stadio
finanziario (`annual_payroll`, `monthly_lifecycle`, `season_distribution` o
`annual_transfer_budget_refresh`). È una spiegazione dell'esclusione, non un
quarto braccio e non un motivo per correggere il prodotto corrente. Il generico
`finance_lifecycle_rejected` resta l'API di prodotto se il dettaglio può vivere
come fatto diagnostico senza duplicare la causa.

### Purezza, report e riuso

- unico entrypoint: `pnpm cli simulation-report`;
- profili, sezioni e diagnostici vivono nel registry canonico;
- canary separate `7 x 1` provano schema, reachability e purezza prima di ogni
  corsa lunga; non contribuiscono ai gate di bilanciamento;
- ogni run usa directory cache e seed prefix nuovi; nessun artefatto L6.1A viene
  sovrascritto;
- gli observer già attivi vengono riusati. Un nuovo campo esiste solo se non è
  derivabile dai fatti conservati e ha un lettore nel checkpoint;
- HTML non è richiesto: questa tranche attribuisce owner. La vista consultabile
  resta quella del checkpoint integrato successivo;
- ogni profilo d'analisi e ogni switch ha un caller attivo e un owner di rimozione
  alla chiusura 81A. Nessuna seconda CLI, parser o formula.

### Stop rules

- un mondo mancante ferma soltanto il checkpoint la cui popolazione richiede quel
  mondo; non invalida artefatti di altri profili;
- una riconciliazione non nulla, un mismatch di purezza, un override sopra sette
  worker o un fatto ricostruito da end-state è `STOP / RETHINK`;
- un target mosso, un corpus esteso dopo l'output o un coefficiente ricavato dal
  delta è `STOP / RETHINK`;
- un owner sotto floor o incoerente è `REFINE`/`not_reproduced`;
- un controllo non vitale non viene riparato per far passare la misura;
- nessun risultato di L6.1A viene riclassificato: i nuovi seed sono l'unica
  evidenza autorizzante.

## Definition Of Done

- uso rosa, gerarchia e rinnovo hanno popolazioni e decisioni indipendenti;
- ogni owner è confermato fuori campione oppure resta chiuso;
- il disegno a tre bracci dichiara ciò che non può identificare;
- nessuna modifica gameplay o content entra nei checkpoint;
- nessun codice morto, profilo senza caller, export d'analisi orfano o seconda
  derivazione sopravvive;
- `pnpm check`, `git diff --check` e `graphify update .` sono verdi;
- solo i risultati previsti dalla tabella possono aprire i rispettivi step.
