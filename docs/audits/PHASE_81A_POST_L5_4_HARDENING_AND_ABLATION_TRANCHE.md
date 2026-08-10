# Phase 81A - Post-L5.4 Hardening And Ablation Tranche

## TESI

Prima di correggere ancora il motore, lo strumento deve dire la verità intera.
L5.4 è un `REFINE` onesto, ma tre fatti lo distorcono: il registro racconta il
gate dei leader come `>= 0.30` quando la complementarità lo rende `>= 0.50`;
la fascia campione esiste in due definizioni; e l'ultima correzione di gameplay
(06B16) ha unito due owner, quindi nessuno dei suoi effetti è attribuibile.
Questa tranche prima rende il registro e il valutatore inequivocabili senza
toccare gameplay, poi separa causalmente mercato e blueprint con un'ablazione
fattoriale `2 x 2` sugli stessi mondi, e solo dopo autorizza correzioni - una
per owner dimostrato, ciascuna con checkpoint immediato.

Le decisioni di prodotto sono:

1. il registro contiene un solo gate leader:
   `careerGeneratedLeaderShareSeasonTen >= 0.50`. La quota opening e la
   tassonomia a quattro origini restano diagnostiche e non decidono nulla; il
   report conserva i quattro conteggi di origine e un solo valore di gate,
   mai due quote derivabili l'una dall'altra;
2. i gate numerici sono soltanto i `p10..p90` esatti del registro versionato;
   ogni fascia in prosa (`72..88` compresa) è presentazione arrotondata, mai
   una seconda definizione. La regola "nessun letterale fuori dal registro"
   vale per i target storici player/table, non per ogni soglia strutturale
   del progetto;
3. `appearance share 0.48..0.58` e `distinct users per club-season 26..31`
   diventano gate versionati con formule congelate:
   `appearanceShare = apparizioni totali / (34 x player-season con almeno
   un'apparizione)` e `distinctUsers = media, sulle club-season di Prima,
   dei playerId distinti realmente scesi in campo per quel club`; un
   trasferito a metà stagione appartiene a entrambe le club-season. Solo
   Prima Divisione, tutte le stagioni e tutti i mondi dichiarati. `age drift
   <= 2.0` migra dal letterale del valutatore al registro; leading scorer
   `20.5..32.3` e leading creator `9..18` restano diagnostiche dichiarate;
4. le origini hanno una sola derivazione condivisa: `opening = opening_senior
   + opening_academy`, `generated = annual_academy_intake +
   annual_senior_intake`, `unknown` escluso dal denominatore e causa immediata
   di `REFINE`. Nessun lettore riclassifica `unknown` da solo;
5. nessun coefficiente può essere scelto invertendo l'output misurato. I
   divisori attori `10` e `70` sono registrati come debito tecnico con owner
   di sostituzione strutturale (06B22), non come base di ulteriore taratura;
6. gli switch dell'ablazione vivono in una policy di analisi al confine di
   orchestrazione: mai persistita, mai esposta al gioco, con owner di
   rimozione alla chiusura della fase, come l'oracolo di 06B10C. I bracci
   "off" devono riprodurre la semantica documentata pre-06B16 (bisogni
   department-only; intake a bilanciamento generico), provata da test unitari
   sulle esatte funzioni di decisione, non approssimata;
7. l'asse blueprint è accoppiato solo a livello di seed: cambiando l'intake,
   lo stream RNG di generazione diverge dal primo intake in poi. L'asse
   mercato condivide invece lo stream di generazione. Il potere statistico
   inferiore dell'asse blueprint è dichiarato prima del run. La prima
   divergenza si misura su una firma congelata per stagione: insieme ordinato
   di `(playerId, clubId, origine, ruolo primario, current ability,
   potential ability)`; la prima stagione in cui l'insieme del braccio
   differisce dal controllo è la stagione di divergenza.

## DOCUMENTO OPERATIVO

### Tranche autorizzata

| Step | Domanda | Comportamento | Exit |
|---|---|---:|---|
| 06B18 | hardening A6: registro, valutatore, rappresentazione `superseded` | no | verdict-neutrality provata su L5.4 in cache |
| 06B19 | L6.1: chi muove capacità, identità e classifica - mercato, blueprint, entrambi o nessuno? | no | owner dimostrati o `REFINE`/`STOP` |
| 06B20A | correzione mercato, solo se attribuita | condizionale | checkpoint immediato |
| 06B20B | correzione blueprint/identità, solo se attribuita | condizionale | checkpoint immediato |
| 06B20C | correzione gerarchia, solo se attribuita | condizionale | checkpoint immediato |
| 06B21 | L6.2: checkpoint `7 x 10` sul registro completo indurito | no | apre 06B22 |
| 06B22 | sostituzione strutturale dell'allocazione attori | sì | L6.3 |
| 06B23 | L6.3: checkpoint minuti, età e concentrazione `7 x 10` | no | apre 06B25, o 06B24 su owner nuovo |
| 06B24 | riservato a un owner nuovo dimostrato da L6.3 | condizionale | checkpoint immediato |
| 06B25 | L6.4: canary integrata `7 x 10`, JSON canonico e HTML desktop inglese | no | `GO` riapre il `100 x 10` |

Solo 06B18 e 06B19 hanno documenti di step aperti. 06B20A-C e 06B24 non
possono essere scritti prima del verdetto del checkpoint che li apre:
nominare la correzione prima dell'attribuzione è esattamente l'errore che
questa tranche chiude. Ogni correzione ha il proprio checkpoint immediato,
così L6.2 non può ereditare un rosso già attribuito e lasciato indietro.

### Disegni causali obbligatori

- **Ablazione fattoriale `2 x 2`:** quattro bracci freschi sugli stessi sette
  seed, dieci stagioni, sette worker, ciascuno da solo: `control` (mercato
  role-aware e blueprint spenti), `market`, `blueprint`, `combined` (entrambi
  accesi). Il combinato si risimula perché i due gate nuovi richiedono
  un'osservazione canonica costruita dalle partecipazioni alle partite, che
  la cache L5.4 non conserva (i fatti player-season enumerano solo i
  fieldable a fine stagione). La strumentazione è solo osservazione,
  verificata da un confronto a quattro parti col report L5.4: fatti canonici
  e metriche condivise identici bit per bit; decisione complessiva ancora
  `REFINE`; chiavi consolidate confrontate attraverso la mapping dichiarata
  da 06B18; gate nuovi esclusi dal confronto storico e letti per la prima
  volta. Una deviazione nei fatti condivisi è `STOP` per contaminazione del
  gameplay; i due schemi sono intenzionalmente diversi altrove, e una
  differenza di schema non è mai uno `STOP`.
- **Regola di attribuzione, congelata prima del run.** Per ogni metrica `M`
  fra capacità locale, capacità divisionale, retention quattro-forme e quota
  leader generati si calcolano i quattro contrasti e l'interazione:

  ```text
  mercato senza blueprint = market   - control
  mercato con blueprint   = combined - blueprint
  blueprint senza mercato = blueprint - control
  blueprint con mercato   = combined - market
  interazione             = combined - market - blueprint + control
  ```

  L'asse `A` possiede `M` solo se: entrambi i suoi contrasti condizionali
  superano il floor materiale di `M` con lo stesso segno, e la coerenza per
  mondo vale `5/7` **per ciascun contrasto condizionale separatamente** -
  il segno del mondo concorda col segno del contrasto aggregato, gli zeri e
  i delta per mondo sotto floor non contano come concordanti, ed entrambi i
  contrasti devono raggiungere `5/7`. Un'interazione oltre il floor è
  classificata `shared/interaction`, mai attribuita a un asse solo.
  Contrasti discordanti o sotto floor: `not_reproduced`, che è `REFINE`
  dell'ablazione, mai una licenza di correzione. Floor materiali congelati
  (almeno due passi di quantizzazione del denominatore reale): capacità
  locale/divisionale `0.03`; retention quattro-forme `0.02`; quota leader
  generati `0.02`; punti campione `0.5` sulla media di coorte.
- **Funnel del ricambio per bisogno unico.** I conteggi L5.4 (`661,080`
  valutazioni recruitable, `7,311` target trovati) sono eventi ripetuti dello
  stesso bisogno lungo la carriera: il loro rapporto non è un tasso di
  soddisfacimento e non è una premessa. Il funnel usa la chiave unica
  `world-division-club-season-role` e registra: prima data di comparsa,
  stadio massimo raggiunto nella stagione, esito terminale a fine stagione;
  `fulfilled` se almeno un trasferimento coerente si completa. La tassonomia
  terminale è congelata prima del run per enumerazione esaustiva degli stati
  diagnostici reali di `ai-market-lifecycle`, includendo almeno: assenza per
  età/ruolo/qualità, prezzo fuori banda, rifiuto del seller floor,
  indisponibilità del venditore, rifiuto del giocatore, budget insufficiente,
  limite trattative attive, limite avvii stagionali, club selezionato
  protetto, club già gestito nel ciclo, reclutamento impossibile, trattativa
  ancora aperta a fine stagione, completamento fallito. Una finestra chiusa
  al momento dell'osservazione non è mai un fallimento terminale: il bisogno
  di giugno può compiersi ad agosto. Un bisogno può riaprirsi nella stessa
  stagione (punta comprata, poi ceduta o indisponibile, secondo bisogno di
  punta): o un test dimostra che il lifecycle ammette al massimo un episodio
  per `club-season-role`, oppure la chiave acquisisce un
  `needEpisodeOrdinal` incrementato a ogni chiusura o riapertura - il primo
  episodio soddisfatto non può nascondere il secondo fallito. Lo "stadio
  massimo raggiunto" richiede una gerarchia totale degli stadi, congelata
  prima del run. Le somme per stadio riconciliano esattamente col totale
  degli episodi di bisogno unici.
- **Classifica: truth table congelata.** Il campione di Prima si legge su
  tutti e quattro i bracci, con delta continui per mondo, floor `0.5` punti:
  tutti i bracci falliscono in modo simile -> owner condiviso preesistente
  (`population_strength`, apre 06B20C); controllo passa e combinato fallisce
  -> un asse o l'interazione, secondo i contrasti; controllo fallisce ma
  mercato/blueprint migliorano oltre floor -> risposta positiva dell'asse,
  non regressione condivisa; segni discordanti -> `not_attributed`; tutto
  entro floor -> `not_reproduced`. Il `72.2571` di L5.4 non si arrotonda e
  non si rimisura da solo.

### Checkpoint e stop rules

- Tutte le coorti usano `pnpm cli simulation-report`, il profilo bloccato ed
  esattamente `7` worker; ogni gate gira da solo.
- I target sono congelati da 06B18 prima di qualunque run e non si muovono
  dopo l'output. I due gate nuovi sono `not_evaluated` in 06B18 (formule
  congelate lì, dati non presenti in cache) e ricevono la prima lettura nel
  combinato fresco di L6.1; non contano mai come regressioni.
- La rivalutazione in cache di 06B18 usa comando, profilo, directory cache e
  output distinti e non sovrascrive mai l'artefatto L5.4 originale.
- Ogni correzione ha un checkpoint immediato prima dello step successivo; una
  correzione tocca un solo owner dimostrato.
- `not_attributed`, riconciliazioni non nulle, una policy di ablazione entrata
  nel prodotto, un braccio "off" non equivalente alla semantica pre-06B16 o
  un coefficiente derivato dall'output danno `REFINE` o `STOP / RETHINK`.
- Il valutatore è congelato per identità di codice all'apertura di ogni
  checkpoint: nessuna modifica alla macchina dei gate dopo il primo
  artefatto. Un fallimento annidato non può sparire dal roll-up: o è un gate,
  o è `superseded` con riferimento esplicito al checkpoint che lo ha
  sostituito.
- La canary finale mostra Prima, Seconda e Terza separatamente, ciascuna sul
  proprio benchmark; l'HTML è una vista del JSON canonico e non possiede
  formule.

## Definition Of Done

- registro unico, senza gate morti, senza doppie definizioni e senza
  letterali storici nascosti nel valutatore;
- ablazione fattoriale con owner dimostrati sopra floor materiali o un
  `REFINE`/`STOP` onesto;
- correzioni limitate agli owner dimostrati, ciascuna validata da un
  checkpoint immediato;
- allocazione attori strutturale al posto dei divisori derivati dall'output;
- canary `7 x 10` consultabile in HTML con zero fallback e riconciliazioni;
- solo dopo `GO` di L6.4 può ripartire il `100 x 10`.
