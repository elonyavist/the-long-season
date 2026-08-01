# Documento di design — "The Long Season" (nome di lavoro)
*Manageriale calcistico della provincia. Nome da validare in Fase 3 con un controllo di disponibilità (Steam, dominio, marchi), essendo un'espressione comune. Alternative tenute in lizza: Dalla Polvere, La Scalata, Underdog.*

Documento vivo: ogni area si compila man mano che la discutiamo e decidiamo.
Stato: 🔲 da sviscerare · 🔶 in discussione · ✅ chiusa

Ultimo aggiornamento: 31 luglio 2026 — **fondazione tecnica sviscerata** in sessione di grilling: 28 decisioni di fondazione del motore raccolte in **Sezione J-bis** (Fase 0–2: schema attributi, modello del tempo, `GameDate`, ID, RNG, valore-attributo, match engine, `TeamStrength`, stato COW, generazione lega, stagione, verità statistica, schema `MatchEvent`, formato save, use-cases/CLI, scaffolding/enforcement, stati dinamici, `Money`, tattica, staff/scouting, vivaio+crescita, strutture, economia, mercato, match-day, narrativa/media+presidente, carriera manager, forma tattica e matchup per fasi). Le decisioni più recenti sul modello dei prospetti, l'ambiente di sviluppo, il mercato in entrata, i prestiti, le gare competitive e il significato delle decisioni tattiche sono consolidate nelle Aree 3–5, 7, 9, 12–14 e 17 e nei contratti delle Fasi 80A/80B/80C/81. Nome di lavoro "The Long Season"; policy IP (Area 21); leve di ritenzione (K) e direzione d'arte retro-premium (L).

---

## Premessa — Cos'è questo gioco

**In una riga:** parti dalla terza serie, porta una provinciale in cima.

È un manageriale calcistico testuale, di impianto retro (estetica anni 2000 alla Championship Manager 01/02): niente motore grafico, niente partite in 3D — si gioca tra tabelle dense, classifiche e una cronaca testuale. Tutta l'attenzione è sulle decisioni manageriali, non sullo spettacolo visivo.

**La modalità che lo definisce è la Scalata.** Si comincia sempre alla guida di una squadra di terza serie e l'obiettivo è portarla fino allo scudetto della massima divisione, costruendo nel tempo: mercato, settore giovanile, stadio e strutture, staff, finanze. Non è una sandbox dove prendi subito la squadra più forte: è un percorso pluriennale (indicativamente 8–12 stagioni) in cui sposi un club e lo fai crescere, con il rischio concreto di fallire — l'esonero o il crac finanziario possono chiudere la run. Completare la Scalata vincendo il titolo sblocca poi la modalità libera (sandbox) di quel paese.

**Cosa lo distingue:**
- *La povertà come design.* In terza serie ogni euro pesa: il prezzo del biglietto, il parametro zero, il gioiellino da vendere o tenere sono decisioni vere, non rumore di fondo. È lì che il genere dà il meglio, ed è il cuore dell'esperienza.
- *Verità statistica.* Il tono è serio-simulativo e i numeri devono essere credibili: risultati, affluenze, cifre di mercato e promozioni rare quanto nella realtà. Il motore viene validato facendo girare centinaia di stagioni automatiche e confrontandone le distribuzioni con quelle reali.
- *Un motore che produce storie.* Le occasioni si risolvono come duelli tra giocatori con nome: marcatori, colpevoli e cronaca emergono dal gioco invece di essere estratti a caso.
- *Tutto è contenuto.* Leghe, giocatori, tratti, eventi e cronaca vivono in file di dati: il gioco esce con nomi fittizi ma chiunque può importare database con nomi reali, e la community può estenderlo.

**Per chi è:** chi ha amato Championship Manager / Football Manager ma oggi non ha più 200 ore da dedicargli — un pubblico prevalentemente 30–45enne che cerca profondità gestionale in run di durata umana, più la nicchia dei manageriali affamata di alternative ai titoli mainstream. Pubblico desktop, di lingua italiana e inglese al lancio.

**Come si gioca e si distribuisce:** single player, completamente offline, senza registrazione né account. Prodotto a pagamento una tantum (niente abbonamenti, niente pubblicità), venduto come app scaricabile (Steam e sito proprio) con una demo gratuita giocabile direttamente nel browser come porta d'ingresso.

**Cosa NON è (non-obiettivi al lancio):** niente motore grafico 2D/3D, niente multiplayer, niente nazionali, niente carriera da allenatore-giocatore, niente live-service.

---

## A. Fondamenta

### 1. Visione e identità ✅
**Decisioni:**
- Pitch: "Parti dalla terza serie, porta una provinciale in cima."
- Target: ex giocatori di CM/FM (30–45) che vogliono profondità senza 200 ore, più la nicchia FM in cerca di alternative.
- Tono: serioso-simulativo (registro alla FM). Conseguenza: massima credibilità dei numeri, niente eccessi caricaturali nei testi.
- Durata di un match: 3–10 minuti, controllata dal giocatore tramite velocità della cronaca regolabile (solo eventi chiave → telecronaca completa) e pause su evento.
- Durata della Scalata: libera, decisa dalla bravura, ma con verità statistica — promozioni consecutive rare e difficili come nella realtà. Requisito di validazione: simulazioni in batch di centinaia di stagioni confrontate con le distribuzioni reali (punti promozione, sorte delle neopromosse, ecc.).
- Non-obiettivi al lancio: niente motore grafico 2D/3D, multiplayer, nazionali, carriera da giocatore, live-service.
- Nome del gioco: parcheggiato, si decide a tono dei testi consolidato.

### 2. Modalità e progressione ✅
**Decisioni:**
- La Scalata è del club: si sposa la squadra per tutta la run. Gli investimenti pluriennali (stadio, vivaio, bacino tifosi) sono il cuore del gioco.
- Completamento: vincere il titolo della massima serie. Run lunga (indicativamente 8–12 stagioni); traguardi intermedi celebrati con epiloghi parziali e achievement (promozioni, prima salvezza in massima serie, prima qualificazione europea).
- Conseguenza per l'Area 4: le coppe continentali (nomi generici, niente marchi) diventano contenuto quasi necessario per la fase avanzata.
- Esonero: termina la run. Archivio delle scalate che conserva la storia di ogni run, anche quelle fallite.
- Salvataggi: liberi. La run traccia il flag "senza ricaricamenti", mostrato come distintivo nell'archivio/hall of fame.
- Club iniziale: 3 proposte generate con profili diversi (es. indebitata, vivaio d'oro, presidente ambizioso ma impaziente).
- Sblocco della sandbox del paese: solo alla vittoria del titolo.

## B. Il mondo di gioco

### 3. Giocatori ✅ (lista tratti di lancio: rimandata alla fase contenuti)
**Decisioni:**
- Scala attributi 0–20 con valori veri frazionari nel dominio; quando gli attributi correnti sono visibili vengono presentati con una cifra decimale. Il potenziale numerico esatto resta nascosto.
- Lista attributi (20 di movimento + 5 portieri):
  - Tecnici (9): Finalizzazione, Passaggio, Lancio lungo, Cross, Dribbling, Tecnica, Contrasto, Rigori, Punizioni
  - Fisici (5): Velocità, Forza, Resistenza, Agilità, Colpo di testa
  - Mentali (6): Posizionamento, Visione di gioco, Anticipo, Freddezza, Grinta, Carisma
  - Portieri (5): Riflessi, Presa, Uscite, Piazzamento, Gioco coi piedi
- Regole: nessun attributo morto (tutto deve avere effetto percepibile); ogni ruolo pesa gli attributi diversamente; forma/morale/fatica sono stati, non attributi; schermata incaricati dei piazzati.
- Fragilità fisica: valore nascosto, mai mostrato come numero — si intuisce dallo storico infortuni, lo staff medico di livello lo stima.
- Potenziale: la valutazione pubblica non è una promessa né il numero interno esatto. È una proiezione unica composta da livello corrente, esito mediano statistico `P50` e limite superiore raggiungibile; UI, valore pubblico e IA di mercato usano gli stessi fatti. Non esiste un modificatore permanente nascosto che predetermina dove il giocatore arriverà: minutaggio, prestazioni, età e ambiente di sviluppo determinano l'esito, con varianza deterministica derivata da mondo, giocatore, stagione e trimestre.
- Valutazione pubblica: livello corrente e potenziale usano la stessa scala globale, indipendente dal club osservante, da 1 a 6 stelle a passi di mezza stella. Il livello raggiunto conserva il colore corrente; nella proiezione, la parte già raggiunta usa lo stesso colore, l'upside probabile fino al `P50` è chiaro e pieno, l'ulteriore upside incerto è chiaro e riconoscibile anche per forma/pattern. La sesta stella usa l'arancione corrispondente. La stessa persona deve avere la stessa proiezione in Rosa, Mercato, schieramento, dettaglio, valore e decisioni IA.
- Crescita e declino: curve per età con picchi diversi per ruolo; declino visibile e gestibile. Partecipazione e prestazioni sono accumulate ogni mese, ma gli attributi cambiano in una sola transizione trimestrale più un flush residuo a fine stagione. Il risultato è deterministico, non cambia ricaricando il salvataggio e non richiede un conto alla rovescia in UI.
- Incertezza anagrafica: per i giocatori di movimento l'upper resta completo fino a 20 anni, si restringe progressivamente a 21–24, fortemente a 25–27 e coincide col livello a 28+; per i portieri resta completo fino a 20, quasi completo a 21–24, si restringe a 25–27 e fortemente a 28–31, poi coincide col livello a 32+. I coefficienti esatti sono calibrati su matrici deterministiche, non scelti per far passare un report.
- Personalità: 3 assi come aggettivi — professionalità, ambizione, temperamento.
- Fog of war a 4 livelli, range calcolati e non salvati, nebbia solo lato utente. È una fase futura separata: finché staff e scouting non esistono, il Mercato mostra gli attributi correnti esatti e non simula osservazioni o conoscenza fittizia.
- Tratti come schede dati: v1 condizione = ruolo schierato, effetto = bonus piatto a 2–3 attributi; 15–20 tratti al lancio, nascosti finché non scoperti.
- Generazione giocatori: le abilità devono essere coerenti con divisione, forza del club, ruolo, età, abilità corrente e ceiling. Per i senior pronti per la prima squadra, la terza divisione è normalmente da 1 a 3 stelle con sporadici 3,5; la seconda da 2 a 3,5 con sporadici 4; la prima da 3 a 5,5 con rarissimi 6. Giovani e riserve possono stare sotto queste fasce. Il ceiling è globale e separato dalla forza attuale, ma il contesto conta: dopo i 17 anni un ragazzo ancora in terza divisione ha probabilità progressivamente minori di essere un futuro campione, mentre un coetaneo già selezionato da un club forte di prima divisione può avere upside maggiore senza essere già pronto.
- Fasce prospetti 15–20: ceiling interessanti/seri/rari sono rispettivamente `2,5–3,5` / `3,5–4` / `5–6` in terza divisione, `3–3,5` / `3,5–4,5` / `5–6` in seconda, `3,5–4` / `4–5` / `5,5–6` in prima. Le quote calibrate con ceiling almeno `3,5` sono bande morbide del `4–8%` in terza, `8–15%` in seconda e `15–25%` in prima; non sono garanzie per singola rosa.
- Stock eccezionale per paese attivo: `2–3` campioni già affermati da 6 stelle, collocati in slot di prima squadra credibili di club forti della massima divisione, e `4–5` giocatori attivi di 15–20 anni con ceiling interno da 6, considerando senior, accademie, svincolati e prestiti. Al massimo uno dei giovani ceiling-six è complessivamente in seconda/terza divisione, gli altri appartengono a club forti di prima, e non più di uno appartiene allo stesso club. Il ceiling non garantisce né il `P50`, né la sesta stella pubblica, né il raggiungimento reale. Quando verranno aggiunti altri paesi, la stessa logica sarà applicata una sola volta per ciascun paese, non moltiplicata accidentalmente per intake o percorso di generazione.
- L'intake annuale mantiene la popolazione del mondo invece di aggiungere ogni anno un nuovo budget completo di fenomeni: effettua un top-up deterministico dello stock mancante, influenzato ma non dominato dall'ambiente del club. Gli attributi fuori ruolo devono essere cappati: un difensore con Finalizzazione alta, un attaccante con Contrasto alto o un portiere con profilo da giocatore di movimento devono essere eccezioni esplicite, non rumore casuale.

### 4. Club e leghe ✅ (dettaglio regole per paese: lavoro di config, fase contenuti)
**Decisioni:**
- 5 nazioni al lancio: Italia, Inghilterra, Spagna, Germania, Francia. Piramidi complete fino alla terza serie. Sesta nazione = content pack futuro (anche community).
- 3 coppe continentali con nomi generici (stile Campioni, Europa, Conference). I posti delle federazioni non simulate sono riempiti da club esteri "leggeri" generati, simulati a bassissimo dettaglio.
- Coppa nazionale per ogni paese; l'Inghilterra ha anche la seconda coppa (stile League Cup).
- Playoff di Serie C fedeli: il torneo vero da 28 squadre. Coerenza: anche i playout (spareggi salvezza di B e C) sono inclusi.
- Tutte le strutture e regole dei campionati vivono in config dichiarative per paese (promozioni, retrocessioni, gironi, finestre, soste).
- La prima espansione dalla lega-prototipo crea un solo paese fittizio giocabile con prima, seconda e terza divisione canoniche, club persistenti e promozione/retrocessione. Non rivendica ancora le cinque nazioni complete né i playoff/playout italiani avanzati.
- La topologia minima `fictional-three-tier-v1` ha un girone da 18 club e 34 giornate per ciascuna divisione. Prima e seconda si scambiano automaticamente 3 club; seconda e terza se ne scambiano 2. Il confine inferiore della terza è chiuso: nessuna retrocessione fittizia né club feeder non simulato. È game design esplicito, non una riproduzione del formato italiano 20/20/60; motivazioni e fonti vivono in `docs/audits/DOMESTIC_COMPETITION_TOPOLOGY_DECISION.md`.
- Ogni stagione assegna a ciascun club uno stato dinamico di forza, ricalcolato al rollover e congelato fino al rollover successivo. Nei gironi da 18 club i ranghi sono `1–4 title contender`, `5–8 playoff`, `9–14 mid-table`, `15–18 survival`; in prima divisione `playoff` significa corsa alla qualificazione continentale. Il ranking usa soprattutto la rosa corrente (undici più panchina) e in misura minore il risultato della stagione appena conclusa, corretto per promozioni, retrocessioni e titolo, con spareggio deterministico per ID stabile.
- La reputazione corrente del club è la memoria sintetica della sua traiettoria: converge verso categoria, stato e risultati, cambia al massimo di due punti per stagione e non conserva un secondo storico reputazionale.

### 5. IA del mondo ✅ (comportamento di mercato dei club IA: si definisce nell'Area 14)
**Decisioni:**
- Simulazione a cerchi concentrici: il campionato del giocatore a dettaglio pieno; il resto del suo paese a dettaglio configurabile a inizio run (default medio: risultati, marcatori, classifiche, mercato semplificato; opzione quasi-pieno con sviluppo individuale); gli altri paesi a risultato secco, salvo incroci di coppa.
- Requisito: anche a dettaglio medio il mondo evolve credibilmente su più stagioni (crescita giovani, cicli delle big), perché la Scalata dura anni.
- Nel primo mondo a tre divisioni tutti i club domestici condividono gli stessi proprietari canonici di giocatori, contratti, finanze, sviluppo e mercato. Il Mercato non usa un bacino esterno sintetico per fingere le categorie non simulate.
- L'ambiente di sviluppo deriva dalla combinazione categoria/stato ed è pubblico: `Molto carente 0,92`, `Carente 0,95`, `Limitato 0,98`, `Adeguato 1,00`, `Buono 1,03`, `Ottimo 1,06`, `Eccellente 1,10`. Matrice survival/mid-table/playoff/title: terza divisione `Molto carente/Carente/Limitato/Adeguato`; seconda `Carente/Limitato/Adeguato/Buono`; prima `Adeguato/Ottimo/Eccellente/Eccellente`. È un moltiplicatore piccolo: una squadra migliorata aiuta lo sviluppo, ma non trasforma da sola un prospetto mediocre in un fenomeno.
- Allenatori IA "persona": nome generato + tendenze leggere (modulo preferito, lancia giovani/compra pronti, stile). Producono esoneri, valzer delle panchine e narrativa nelle news.
- Difficoltà: nessun selettore e nessuna IA che bara. La difficoltà è il profilo del club di partenza e la categoria. Eventuali modificatori espliciti a inizio run sono materiale post-lancio.

## C. Il tuo club

### 6. Rosa e spogliatoio ✅
**Decisioni:**
- Morale individuale (mosso da minutaggio, risultati, rinnovi, eventi; volatilità legata al temperamento) + clima spogliatoio aggregato e visibile, influenzato anche dalle scelte di mercato. I giocatori con Carisma alto stabilizzano il clima; il capitano si sceglie e pesa.
- Richieste dei giocatori: esplicite e con scadenza (più minutaggio, rinnovo, cessione). Si risponde con impegno o rifiuto; alla scadenza il gioco verifica i fatti. Niente sistema di promesse a sfumature.
- Contratti che evolvono con la categoria: in terza serie annuali/biennali con clausole tipiche (rinnovo automatico in caso di promozione, premi promozione, bonus presenze) e parametri zero come pane quotidiano; salendo si allungano e si arricchiscono (clausole rescissorie, percentuali su rivendita).
- Infortuni realistici in frequenza, legati alla fatica: chi gioca sempre si rompe — l'infortunio è anche conseguenza delle rotazioni, non solo sfortuna. Condizione e fatica come stati visibili.

### 7. Tattica ✅
**Decisioni:**
- Moduli: lista curata di 12-15 classici (4-4-2, 4-3-3, 3-5-2, ecc.). Niente editor posizionale libero: bilanciamento controllato e cronaca che può raccontare i moduli come entità riconoscibili.
- Livello individuale: ruoli, non istruzioni — 2-3 varianti per posizione (terzino bloccato/di spinta, mediano schermo/incursore, punta boa/in profondità). I tratti si agganciano ai ruoli.
- Istruzioni di squadra: 5-6 interruttori chiari — mentalità (5 tacche), pressing (3), impostazione (palleggio/diretta/palla lunga), ampiezza, contropiede, fuorigioco. Ogni leva ha un effetto che la cronaca sa raccontare; sono anche le istruzioni rapide del match.
- Tattiche salvate: il manager può preparare più setup e scegliere manualmente quale usare prima o durante la partita. Il motore applica comandi espliciti dell'utente a partire dal minuto indicato; non deve decidere da solo cambi tattici automatici in base a risultato, minuto o contesto, salvo una futura opzione documentata e disattivata di default.
- Familiarità tattica: il modulo si impara (settimane a rendimento ridotto), una rosa ne padroneggia 2-3. L'identità di gioco è un investimento; il mercato si fa per il sistema.
- Piazzati: incaricati (rigorista, punizioni, corner) + poche impostazioni essenziali.

### 8. Staff e scouting ✅
**Decisioni:**
- Sei ruoli, regola "un ruolo = un effetto che senti": vice (qualità allenamento/crescita), preparatore (fatica e prevenzione), medico (recuperi, stima della fragilità nascosta), capo scout + scout aggiuntivi (fog of war), DS (trattative e rinnovi), responsabile vivaio (qualità intake).
- Figure di staff: voto unico 0–20 + una specializzazione. Stipendi a budget; organigramma che si riempie con la scalata (in C il lusso che non puoi permetterti).
- Scouting: ogni scout ha copertura geografica e qualità (velocità e precisione nell'affinare il fog of war). Missioni: osserva giocatore, esplora area, report avversario.
- Report sull'avversario: sì — rituale settimanale di preparazione (modulo probabile, uomini in forma, punti deboli). Trade-off: lo scout impegnato non osserva il mercato.
- Delega: disponibile per compito e attivabile dall'utente; la qualità dell'esito dipende dal livello dello staff, e senza la figura giusta la delega non esiste.

### 9. Settore giovanile ✅
**Decisioni:**
- Intake annuale come rituale: una data a stagione, il responsabile del vivaio presenta 5-8 ragazzi (15-17 anni) con range di potenziale ampi. Qualità/quantità dipendono da strutture del vivaio, responsabile, bacino del club. Il gioiellino è una lotteria a cui l'investimento compra più biglietti, mai una garanzia.
- Il prototipo può mantenere la propria quantità canonica finché la UI completa del vivaio non esiste; in ogni caso il generatore annuale rispetta le fasce per categoria, lo stock nazionale e il top-up anti-inflazione dell'Area 3. Un ambiente migliore sposta moderatamente le probabilità, non garantisce un prospetto serio o raro.
- Squadra giovanile simulata leggera: campionato giovanile con classifica e risultati secchi, statistiche minime visibili — la crescita ha evidenza.
- Prestiti formativi in entrambe le direzioni: i tuoi giovani vanno a farsi le ossa (in leghe simulate tornano con statistiche vere; in quarta serie astratta con un giudizio); da club di C ricevi i gioiellini delle big da valorizzare.
- Storie narrative dei giovani: sì — ~20 schede evento dedicate al lancio (procuratori, big che bussano, il ragazzo del posto), generate con il flusso LLM e curate a mano. Vincolo: le conseguenze usano solo sistemi esistenti, mai meccaniche nuove.

### 10. Strutture e stadio ✅
**Decisioni:**
- Direzione di visione: gestionale-costruttivo — semplicità burocratico-narrativa, profondità nell'edificare. Lo stadio è sempre di proprietà del club (niente arco comunale).
- 5 strutture granulari con sotto-livelli ed effetti chiari:
  1. Stadio — sotto-livelli per blocco: 4 tribune (capienza), illuminazione, terreno, copertura
  2. Centro di allenamento — crescita e condizione
  3. Centro medico — prevenzione e tempi di recupero
  4. Accademia giovanile — qualità e quantità dell'intake
  5. Area commerciale — store, hospitality, ricavi da giorno-partita
- Upgrade puliti: si pianificano in stagione, si completano a fine stagione, senza malus di cantiere.
- Requisiti infrastrutturali per categoria: promosso con strutture non a norma → adeguamento obbligato o trasferta forzata a costo (affitto, pubblico ridotto).

### 11. Economia del club ✅
**Decisioni:**
- Entrate: biglietti e abbonamenti, sponsor, diritti TV (per categoria e posizione), premi coppe, mercato e plusvalenze, area commerciale. Uscite: massa salariale, staff, gestione strutture.
- Biglietti semplici: prezzo medio gara + prezzo abbonamento estivo (la scommessa di luglio: incasso subito, scontato). Affluenza = f(prezzo, categoria, risultati, avversario, capienza, bacino tifosi). Il bacino cresce lentamente negli anni con i successi: è il tetto dei ricavi futuri.
- Crisi finanziaria a cascata completa: rosso prolungato → stipendi in ritardo (morale a picco) → blocco mercato → penalizzazione punti → fallimento = fine della run. I conti possono ucciderti quanto i risultati.
- Sponsor attivi: a inizio stagione 2-3 offerte strutturate tra cui scegliere (fisso basso + bonus promozione ricco / fisso alto sicuro / pluriennale che blocca il valore). La firma è una dichiarazione di ambizione.
- Budget stagionali (ingaggi e mercato) fissati dal board in base a conti e obiettivi.
- Stipendi, monte ingaggi, cassa e budget di mercato sono calibrati con fonti economiche riproducibili e versionate distinte dai valori Transfermarkt. Non si deducono gli stipendi applicando una percentuale fissa al valore di mercato.

## D. Il gioco vissuto

### 12. La partita (match day) ✅
**Decisioni:**
- Rituale in cinque atti: pre-partita (report scout, ultime, formazione) → primo tempo → intervallo (lavagna piena) → secondo tempo → post-partita (pagelle, tabellino, reazioni).
- Cronaca testuale a velocità regolabile (da soli eventi chiave a telecronaca completa) con statistiche live essenziali: possesso, tiri, occasioni nitide.
- Discorsi alla squadra semplici: 4 toni (calmo, carica, bacchettata, fiducia) all'intervallo e pre-partita; effetto dipendente da contesto e temperamento dei singoli. Quattro bottoni, effetti leggibili.
- Pagelle live stile CM: il voto di ogni giocatore si aggiorna minuto per minuto — informazione tattica, non solo colore.
- Auto-pause configurabili dal giocatore (default: gol, rigore con beat di suspense, espulsione, infortunio da cambio; attivabili: gialli ai diffidati, gol dagli altri campi rilevanti per la classifica).
- Istruzioni rapide in partita: le 6 leve di squadra + sostituzioni senza aprire la lavagna; il cambio modulo richiede la lavagna.
- I cambi tattici in partita sono decisioni del manager: il gioco deve supportare profili pronti e switch manuali, non un pilota automatico nascosto che sceglie quando passare a offensiva/difensiva.

### 13. Motore di simulazione ✅
**Decisioni:**
- Motore a tick (minuto simulato) a due livelli: le forze di squadra (undici in campo: attributi pesati per ruolo × forma, morale, fatica, familiarità tattica, tratti, clima, fattore campo) generano le occasioni; le leve tattiche non aggiungono forza ma spostano le distribuzioni (zone, tipi di occasione, costi di fatica).
- Risoluzione delle occasioni a duelli nominali: catene di confronti tra giocatori con nome (chi pesca il taglio, chi non lo legge, chi calcia, chi para). Marcatori, colpevoli, cronaca e pagelle emergono dai duelli — il motore produce storie, non numeri.
- Meteo e terreno influiscono: pioggia che livella la tecnica, campo pesante che premia palla lunga e Forza, vento sui cross. Modificatori di contesto sulle distribuzioni, raccontati dalla cronaca.
- Peso rosa/tattica: 65/35 — i giocatori decidono, la panchina pesa quanto deve. Parametro verificabile nei batch: se la tattica perfetta rende più del previsto, si ritara.
- Verità statistica come requisito di collaudo: distribuzioni di gol, risultati, classifiche e upset calibrate sulle reali per categoria, validate con simulazioni batch da CLI.

### 14. Mercato ✅
**Decisioni:**
- Trattativa a due tavoli: club (prezzo e formula: definitivo, prestito con diritto/obbligo, percentuale rivendita) poi giocatore e procuratore (ingaggio, durata, bonus, commissione). Il colpo può saltare a entrambi.
- Trattative a tempo: risposte in giorni di gioco, rilanci, inserimenti di altri club. Il mercato vive nel calendario e si sovrappone alle partite. Deadline day come evento: ritmo accelerato, ticker delle ufficialità, affari last-minute.
- Procuratori con nome e personalità leggera (riuso dello schema allenatori IA): l'esoso, il ragionevole che porta gli assistiti, quello che gestisce mezzo girone. Personaggi ricorrenti della run.
- Contropartite tecniche (giocatore + conguaglio): requisito critico della loro futura fase — l'IA valuta i cartellini offerti con gli stessi fatti canonici e i propri bisogni; userà il fog of war solo quando esisterà davvero lo scouting. Test anti-exploit obbligatorio nei batch (lo scambio del brocco non deve funzionare).
- IA di mercato del mondo: acquisti per bisogni di rosa, budget veri, valutazioni coerenti per categoria; gli affari IA-IA alimentano le news. Parametri zero e svincolati come pilastro del mercato di C.
- IA di mercato e manager valutano i giocatori con la stessa proiezione pubblica corrente/`P50`/upper; l'IA non legge il ceiling memorizzato finché il manager non può farlo.
- Valore di mercato pubblico, prezzo richiesto dal venditore e cifra finale sono tre fatti distinti. Il valore pubblico è globale e deterministico, guidato da qualità corrente, esito atteso `P50`, età, incertezza e ruolo; non riceve moltiplicatori o cap dipendenti da divisione, club proprietario, svincolo, club osservante, forma settimanale, semplice trasferimento o prestigio della nuova maglia. Contratto, importanza in rosa, categoria, finanze, disponibilità del venditore e postura di mercato agiscono sulla richiesta e sulla cifra finale.
- Uno svincolato conserva lo stesso valore di mercato pubblico intrinseco ma ha cartellino esattamente zero; restano dovuti solo i costi contrattuali supportati. La coda alta è compressa progressivamente da una sola curva globale e il solo cap del valore pubblico è `€150m`, raggiungibile esclusivamente da un rarissimo sei-stelle di 25 anni o meno, senza ridimensionare proporzionalmente tutte le categorie.
- `In vendita` e `Disponibile in prestito` sono posture indipendenti, combinabili e persistenti finché il manager non le cambia o il rapporto col club termina. Aumentano l'interesse IA senza modificare il valore pubblico; anche un giocatore non indicato può ricevere un'offerta spontanea.
- `Azione disponibile` nel Mercato significa che il manager può presentare l'approccio secondo finestra, contratto e negoziati aperti; non garantisce che il venditore voglia trattare. La volontà del venditore resta un fatto canonico separato e può produrre `player_not_for_sale`, mostrato come risposta esplicita. La UI non deve chiamare questa condizione `disponibile a negoziare` né duplicare in React la logica di volontà del venditore.
- Il club del manager può avere al massimo cinque offerte individuali in entrata irrisolte, permanenti e di prestito sommate. Esiste al massimo una trattativa irrisolta per coppia `(club acquirente, giocatore)` fra le formule supportate, ma compratori diversi possono contendersi lo stesso giocatore attraverso una gara persistita con massimo tre club acquirenti attivi. Se uno si ritira prima della scadenza libera un posto; il quarto partecipante attivo viene rifiutato esplicitamente. I trasferimenti definitivi usano un tavolo club condiviso di tre giorni: fra le offerte accettabili avanzano solo la cifra massima e gli eventuali pareggi esatti, mentre le cifre inferiori chiudono come `outbid`. Accettare un'offerta quando il manager vende la rende accettabile ma non chiude anticipatamente la gara. Gli svincolati saltano il tavolo club ma attendono sempre il tavolo giocatore condiviso di tre giorni, anche con un solo pretendente. I prestiti restano seriali nella prima versione di questo sistema; l'architettura a riferimenti discriminati ne consente una futura estensione senza riscrivere le trattative. Dopo un rifiuto lo stesso compratore non può ripresentarsi per quel giocatore nella medesima finestra; gli altri club restano concorrenti validi.
- Le offerte in entrata arrivano nella Posta e consentono accettazione, rifiuto o una sola `Controproposta finale`. La scadenza originaria di tre giorni non riparte; dopo l'invio la UI mostra `In attesa della risposta finale`.
- Prestiti in entrambe le direzioni: terminano a fine stagione corrente (durata intera in estate, residuo della stagione in inverno), non prevedono richiamo, rinnovo, opzione/obbligo, fee, percentuale di rivendita, bonus o promessa di minutaggio. Il contratto originale deve coprire il prestito e resta al club proprietario; può essere rinnovato, ma il giocatore non può essere ceduto né riprestato mentre è fuori. `Club.playerIds` resta la verità persistita di proprietà e non viene mai modificato da un prestito. La rosa senior selezionabile è derivata come `posseduti presenti + prestiti in entrata attivi - prestiti in uscita attivi`; un prestito in uscita e ogni decisione autonoma dell'IA di cedere un giocatore sono ammessi solo se lasciano almeno `18` selezionabili e i floor `2` portieri, `6` difensori, `6` centrocampisti e `3` attaccanti. Il vincolo non viene trasformato in un nuovo blocco globale delle cessioni definitive ordinate esplicitamente dal manager.
- Il club utilizzatore paga esattamente `0%`, `50%` o `100%` dello stipendio per il periodo residuo, senza secondo contratto. L'IA prende o concede prestiti solo per un bisogno reale di reparto e una rotazione plausibile; soltanto minuti e prestazioni realmente registrati incidono sullo sviluppo.

### 15. Eventi narrativi e media ✅
**Decisioni:**
- Sistema a schede: condizione → scelte → conseguenze; le conseguenze toccano solo sistemi esistenti (morale, clima, richieste, mercato, finanze), mai meccaniche nuove.
- Stampa: principalmente output (titoli e articoli dal corpus che raccontano la run); interazione diretta solo come evento raro ad alto impatto (la domanda velenosa, l'attacco del quotidiano locale), con risposta a 2-3 scelte che muove clima e morale.
- Presidente persona: nome e personalità (paziente, vulcanico, ragioniere), parte del profilo del club iniziale. Da lui passano obiettivi, budget, interferenze ed eventi grossi — incluso il cambio di proprietà a metà run.
- Eventi a due livelli: flusso frequente e leggero di micro-eventi su template con slot (notizie di colore, effetti piccoli, ripetibili perché cambiano i protagonisti) + schede-storia rare e pesanti (bivi memorabili). Il corpus micro si produce col flusso LLM come la cronaca.

### 16. Carriera del manager ✅
**Decisioni:**
- Background a scelta a inizio run con bonus passivi leggeri: ex giocatore carismatico (spogliatoio), giovane tattico (familiarità moduli più rapida), dirigente (procuratori e commissioni). Nessun albero di crescita: decisione una-tantum, rigiocabilità.
- Reputazione come numero visibile che cresce coi risultati; effetti concreti su trattative, ascendente sui giocatori, trattamento della stampa, margine concesso dal presidente.
- L'offerta della big è accettabile e accettarla chiude la run: epilogo da "abbandono", archiviato in hall of fame con quel marchio. Il bivio è reale, non teatro.
- L'esonero resta l'altra fine possibile (Area 2); reputazione e archivio attraversano le run.

## E. Involucro

### 17. UI/UX retro ✅
**Decisioni:**
- Navigazione stile manageriale desktop: menu globale orizzontale sempre visibile in alto, bottone Continua come battito del gioco, area centrale che cambia in base alla schermata selezionata.
- Posta/Inbox come rail laterale sinistra persistente: è la superficie decisionale degli eventi che richiedono attenzione, non un full mail client e non un feed casuale di news. Deve mostrare priorità, messaggi azionabili e stato dell'avanzamento senza nascondere scelte al manager.
- Scorciatoie da tastiera su tutto: il pubblico desktop gioca con una mano sulla tastiera.
- Accessibilità web: target operativo WCAG 2.2 AA. La UI deve supportare navigazione da tastiera, focus visibile, landmark semantici, nomi accessibili per controlli e regioni, stato corrente della navigazione, contrasto sufficiente, stati non comunicati solo dal colore, target cliccabili comodi, e nessun contenuto essenziale tagliato o sovrapposto nei viewport supportati.
- Carattere: font pixel d'epoca, purismo totale come default. Nelle impostazioni: opzione leggibilità (scala font + carattere pulito alternativo) per accessibilità.
- Palette d'epoca: navy, crema, righe alternate, densità CM 01/02 (riferimento: mockup approvato).
- Le stelle di potenziale devono distinguere visivamente livello già raggiunto, upside probabile e upside più incerto con colore più chiaro e pattern/forma, mai col solo colore; mezze stelle e sesta stella arancione rispettano la stessa grammatica.
- Desktop-first al lancio; layout stretto/narrow supportato almeno per non rompere navigazione, Posta e schermata centrale. Mobile completo può restare post-lancio.
- Mappa schermate: Dashboard/Club, Rosa, Tattica, Calendario/Classifiche, Mercato, Finanze, Strutture, Vivaio, Staff & Scouting, Archivio. La Posta resta una rail trasversale, non una schermata isolata.

### 18. Onboarding e demo ✅
**Decisioni:**
- Tutorial guidato classico: scenario scriptato delle "prime settimane" (dalla prima formazione alla terza giornata), skippabile. Nota di manutenzione: va aggiornato a ogni modifica delle schermate coinvolte.
- Demo browser: mezza stagione, paese a scelta tra i cinque, tutte le feature accese. Il taglio cade sull'apertura del mercato di gennaio: classifica a metà e finestra alle porte come cliffhanger.
- Il save della demo si esporta e si importa nella versione completa: chi compra continua, non ricomincia. Le ore investite nella demo diventano il motivo dell'acquisto.

### 19. Contenuti e modding ✅
**Decisioni:**
- Filosofia confermata: il codice implementa i sistemi, i file descrivono i contenuti. Tutto è content pack (leghe, DB, tratti, corpus, eventi, generatori nomi, temi). Niente scripting eseguibile.
- Editor al lancio minimo ma mirato: ridenominazione (giocatori, club, competizioni) + import/export del pack completo con schema documentato — abilita il "DB nomi reali" della community dal giorno uno (formula interna: nel copy pubblico/store diventa "import/export di content pack personalizzati", mai "database reale" — vedi policy IP, Area 21). Editor profondo: post-lancio.
- Compatibilità salvataggi garantita dentro la versione major: update correttivi e di contenuto non rompono mai i save (migrazioni automatiche dello schema); rotture solo con major annunciate, con la vecchia versione che resta disponibile per finire le run.
- Scoperta dei pack: file manuali nella cartella mod, tradizione del genere. Steam Workshop come piano post-lancio.

### 20. Localizzazione ✅
**Decisioni:**
- 5 lingue al lancio a livello UI + ticker: italiano, inglese, spagnolo, tedesco, francese. Architettura predisposta per N lingue (lingua = content pack).
- Tutte le label, intestazioni, stati, metriche, warning, hint, parole-evento e messaggi d'errore destinati a UI o CLI devono passare da chiavi di localizzazione. Il codice prodotto non deve introdurre label hardcoded quando quelle label sono visibili o utili alla UI, alla CLI o a un futuro layer di presentazione.
- Match day al lancio = Livello 1 (ticker strutturato): eventi mostrati come dati con etichette tradotte (marcatore, assist, cartellini, minuto, statistiche, pagelle live). Localizzazione = dizionario di etichette per locale.
- Telecronaca ampia (corpus di frasi) = evoluzione predisposta ma non al lancio. Quando arriverà: file additivo per locale, nessuna migrazione.
- Corpus grande (micro-eventi, schede-storia, news): IT+EN al lancio, fallback EN per le altre lingue, completamento via pack community.

**Decisione architetturale trasversale (impatta Aree 12, 13, 19):**
- Il motore emette eventi strutturati, mai testo. Strato "narratore" separato traduce gli eventi in output: al lancio una sola implementazione (ticker); in futuro una seconda (telecronista da corpus) sullo stesso flusso di eventi, senza toccare il motore.
- Gli eventi registrano tutto il contesto (zona, contropiede, peso in classifica, minuto) anche se il ticker ne mostra una parte: abilita la cronaca ricca futura senza rifare il motore.
- I salvataggi registrano gli eventi, non il testo renderizzato: una partita vecchia si ri-racconta nello stile/lingua installati al momento della rilettura.
- Domain e engine conservano chiavi e dati strutturati language-agnostic; CLI, UI e qualunque presentation adapter trasformano quelle chiavi in testo localizzato. ID, versioni schema e chiavi macchina restano tecniche, ma appena sono presentate all'utente come testo devono avere una label localizzata.

## F. Fuori dal gioco

### 21. Business e distribuzione ✅
**Decisioni:**
- Vendita una tantum €9.99 (sconto lancio 7–8), niente abbonamenti né pubblicità.
- Canali: Steam (wrapper Tauri, fee $100 + 30%) + sito proprio con Merchant of Record (Paddle/Lemon Squeezy, ~5%, gestisce l'IVA); itch.io secondario.
- Demo browser gratuita come funnel di acquisizione (Area 18).
- Identità reali fuori dal gioco venduto; nomi reali solo via import community (responsabilità di chi crea il pack). Marketing senza identità reali. Dettaglio nella policy IP sotto.
- Sequenza di lancio: demo italiana per validare → pagina Steam con wishlist aperta presto → lancio bilingue IT+EN.
- Da verificare col commercialista: regime forfettario + vendite digitali B2C estero (il MoR semplifica il quadro).
- Niente DRM elaborato.

**Policy contenuti e proprietà intellettuale (per la versione venduta)**
*Cappello: non è consulenza legale. Prima del lancio, una verifica con un legale IP è prevista (rischio 1 della sezione H/Area 22).* Principio guida: tre diritti distinti e tutti da evitare nel gioco base — diritti dei giocatori (FIFPro/individuali), dei club (denominazioni, loghi, colori, stadi), delle competizioni (marchi di lega e coppe).
- **Città reali, identità societarie inventate.** I toponimi non sono marchi: la squadra di una città può portarne il nome in forma generica ("Perugia", "Perugia Calcio"), così resta intatto il legame "faccio salire la squadra della mia città" e il bacino tifosi (Area 11). Sono inventati/generici: denominazione legale esatta, colori sociali, soprannome, stemma, stadio. Eccezione: i pochi club il cui nome è un marchio forte non-toponomastico (es. Juventus) si rendono col nome della città (Torino), evitando il marchio.
- **Rose sempre procedurali**, mai quelle reali.
- **Nomi delle competizioni generici e descrittivi del formato**, mai i marchi: es. "Italian First/Second/Third Division", "National Cup", "Continental Champions Cup". Si preferisce "Continental" a "European" (più lontano da UEFA). I termini di formato (promozione, retrocessione, playoff, girone, prima divisione) sono descrizioni, non brand: liberi.
- **Dati generati, mai importati da database di terzi.** In UE le banche dati hanno una protezione *sui generis*: la raccolta strutturata è protetta anche quando i singoli fatti sono pubblici. Quindi niente scraping/import da Transfermarkt, SoFIFA, FM, Wikipedia & co. per la versione venduta — tutto procedurale (generatori di nomi per nazionalità, rose, calendari). *Corregge l'idea iniziale di popolare il DB da dataset Kaggle: vale al massimo per test personali mai distribuiti, non per il prodotto.*
- **Modding ai dati reali = solo community.** Il gioco esce con dati fittizi; l'editor consente l'import (Area 19), ma Tefras non ospita, non promuove e non vende pack con identità reali ("scarica il database vero" non è una feature).
- **Disclaimer** in-game/store/credits: gioco non ufficiale, contenuti del gioco base fittizi, nessuna affiliazione con federazioni/leghe/club/associazioni giocatori. Chiarisce l'intento di non-confusione; non è uno scudo assoluto, accompagna le scelte sopra, non le sostituisce.

### 22. Architettura tecnica e analisi dello stack ✅
**Premessa:** il progetto è di fatto **due software** che condividono i tipi TypeScript — il motore (Fase 1, Node v24.16.0 puro, headless, per il bilanciamento) e l'app (Fase 2, browser). Le tecnologie si giudicano per i vincoli reali (un solo dev, gioco di tabelle, offline, vendibile), non in astratto.

**Linguaggio e UI**
- TypeScript come linguaggio unico: tipi condivisi motore↔UI, indispensabili con 22 sistemi interconnessi. Un motore in-memoria in TS fa migliaia di partite/secondo: il collo di bottiglia è il tempo dello sviluppatore, non la CPU.
- React 19 scelto non per i componenti grafici (il gioco è tabelle e testo) ma per TanStack Table + TanStack Virtual — i migliori strumenti per liste filtrabili da migliaia di righe — e per la familiarità dello sviluppatore + resa con Claude Code. Compromesso onesto: leggermente sovradimensionato; Svelte sarebbe più snello ma ha un ecosistema data-grid più magro. Zustand per lo stato UI leggero.

**Persistenza**
- SQLite WASM su OPFS per i salvataggi (Fase 2): SQL completo (JOIN, indici, aggregazioni) per mercato/statistiche/archivio, e soprattutto migrazioni di schema = base tecnica della promessa "i save non si rompono dentro la major" (Area 19). Scartati: localStorage (troppo piccolo, sincrono), IndexedDB (niente query, API verbosa).
- Disaccoppiamento chiave: il motore di Fase 1 NON usa SQLite — carica un DB di prova da JSON, simula in memoria, scrive CSV per l'analisi. SQLite entra solo in Fase 2. La fase di bilanciamento resta Node v24.16.0 puro, leggera, testabile da CLI.
- Da sapere: SQLite WASM in versione web richiede header COOP/COEP (configurazione una tantum dell'hosting); su Tauri/desktop il punto non si pone (filesystem vero).

**Worker e performance**
- Web Worker (necessario, senza alternative): il motore gira su un thread separato, la UI resta fluida mentre macina una giornata. UI↔Worker via Comlink (colla comoda e matura, evita il protocollo di messaggi a mano).
- Performance: il problema non è la singola partita ma il carico aggregato (simulare il mondo per anni). Difese in ordine: (1) livelli di dettaglio dell'Area 5 — il moltiplicatore numero uno; (2) strutture dati piatte (array di numeri, meno pressione sul GC); (3) determinismo con seed (riproducibilità dei bug + ri-narrazione dei match salvati).
- Rust/WASM per il motore: solo eventuale ottimizzazione futura e mirata (il cuore del calcolo match) se i batch risultassero lenti. Non ora — sarebbe complessità prematura.

**Build e packaging**
- Vite: dev server con ricarica istantanea + build statica ottimizzata. Standard, ottimo supporto TS/React/Worker. Niente Next (non c'è server).
- vite-plugin-pwa: rende la demo browser installabile e offline — il "provalo in 3 secondi" che nessun concorrente offre.
- Tauri (non Electron) per l'app desktop: usa il motore web del sistema → installer di pochi MB, poca RAM, filesystem vero per i save. Electron trascinerebbe un Chrome intero (100+ MB) senza vantaggi per un gioco di tabelle. Costo onesto: Tauri ha una parte nativa in Rust che di norma non si tocca; per integrazioni Steam profonde è terreno documentato (Fase 3).

**Il vantaggio pagato una volta sola**
Lo stesso codebase alimenta tre bersagli — demo browser (PWA), app desktop (Tauri), motore headless (Node v24.16.0) — possibile solo perché il motore è isolato dalla UI e la UI non dipende da API esclusive del browser. È la disciplina che attraversa tutto il design.

**Altri pilastri architetturali**
- Il motore emette eventi strutturati, mai testo; narratore separato (ticker al lancio, telecronista futuro) — Area 20.
- Confine sacro dell'engine: importa solo domain e shared; mai React, SQLite, Tauri o API del browser. Eseguibile headless da CLI.
- Persistenza dietro interfaccia `GameStorage` (saveGame/loadGame/listSaves/deleteSave) con implementazioni intercambiabili: `JsonGameStorage` in Fase 0/1, `SqliteGameStorage` in Fase 2. Cambiare storage non tocca il motore.
- RNG deterministico con seed in `shared`: mai `Math.random()` dentro l'engine — riproducibilità dei bug e ri-narrazione dei match salvati.
- Content validato allo schema (Zod/Valibot): ogni file di dati (anche i pack community) passa una validazione all'avvio; un club con budget o reputazione fuori range si scopre subito, non con un crash a metà stagione.
- La UI riceve snapshot/selettori mirati (es. vista rosa, vista classifica), non l'intero GameState: evita una UI ingestibile e accoppiamenti inutili. Lo stato vero vive nel runtime/worker; lo store React (Zustand) tiene solo lo snapshot.
- Contenuti come file: config leghe dichiarative, DB giocatori, tratti, corpus, eventi, generatori nomi, temi, locale. Niente scripting eseguibile nei pack.
- Pipeline contenuti: LLM in fase di build come fabbrica (cronaca, micro-eventi, schede), output curato a mano. Nessun LLM a runtime.
- Niente backend, niente Redis. Unico costo ricorrente: hosting statico della demo + eventuale JSON indice pack.

**Rischi tecnici principali e mitigazioni**
1. *Scope creep* (il rischio numero uno, non tecnico ma fatale) → ghigliottina della sezione H, lista dei primi 30 giorni, Fase 2.4 spezzata in sotto-step.
2. *Il motore non "sente" giusto* (verità statistica mancata) → Definition of Done e metriche statistiche/economiche nei batch fin dallo Step 1.1; un fattore per volta per isolare gli effetti.
3. *L'economia si rompe in silenzio* su run lunghe → metriche economiche osservate su 10+ stagioni; test "il mondo dopo 10 stagioni somiglia a quello iniziale".
4. *Performance aggregata* della simulazione del mondo → livelli di dettaglio (Area 5) come difesa primaria; strutture dati piatte; misurare presto in Fase 1.
5. *Save che si rompono* tra versioni → interfaccia `GameStorage`, migrazioni di schema, garanzia dentro la major (Area 19).
6. *Accoppiamento che marcisce* (UI/DB che invadono il motore) → contratto di dipendenze (sezione J) reso automatico con un linter di confini.
7. *Header COOP/COEP* per SQLite WASM web → configurazione una tantum dell'hosting; non esiste su desktop Tauri.
8. *Manutenzione multilingua* del corpus → lingua-come-pack, fallback EN, community.
9. *Parte Rust di Tauri* per integrazioni Steam profonde → terreno documentato, affrontato solo in Fase 3.

**Tabella di sintesi**

| Pezzo | Ruolo | Giudizio per questo progetto |
|---|---|---|
| TypeScript | Linguaggio unico | Ottimale, non controverso |
| React 19 | UI a tabelle | Giusto per lo sviluppatore; Svelte alternativa più snella |
| TanStack Table/Virtual | Tabelle da migliaia di righe | Migliore strumento esistente |
| SQLite WASM + OPFS | Salvataggi (Fase 2) | Ottimale: SQL + migrazioni |
| JSON in-memory | Dati del motore (Fase 1) | Disaccoppia il bilanciamento dal browser |
| Web Worker | Simulazione senza freezare la UI | Necessario |
| Comlink | Colla UI↔Worker | Consigliato |
| Vite | Sviluppo + build | Standard, ottimo |
| vite-plugin-pwa | Demo offline installabile | Giusto per il funnel |
| Tauri | App desktop per la vendita | Giusto; più leggero di Electron |

---

## G. Piano di sviluppo a step

Filosofia: si segue l'ordine delle tre fasi decise (valido io → gioco io → vendo), e dentro ogni fase si va dal cuore verso l'esterno. Nessuno step parte prima che il precedente "senta" giusto. Le stime sono indicative per un solo sviluppatore part-time e servono solo a dare proporzioni, non sono scadenze.

### Fase 0 — Fondamenta (prima di tutto)

**Step 0.1 — Schema dati e DB di prova**
Definire le entità (Player, Club, League, Staff, Contract, ecc.) coi loro campi e i tipi TypeScript condivisi. Creare un piccolo DB di prova in JSON: una lega, ~16 club, rose complete generate a mano o con uno script grezzo. È il mattone su cui poggia tutto il resto.
*Esito: i tipi esistono e un mondo minimo è caricabile in memoria.*
> Nota operativa: lo scheletro del monorepo (Step 0.2) si crea **prima** (package vuoti + alias `@game/*`), poi `domain` lo riempie. L'ordine concreto è nella checklist esecutiva in J-bis.

**Step 0.2 — Scaffolding del monorepo (struttura minima, anti-overengineering)**
Monorepo con **pnpm workspace** (niente Turborepo finché non fa male). Si parte con cinque package + un'app, e nient'altro:

```
football-manager/
  apps/
    cli/            # runner di simulazione/bilanciamento (il primo "client")
  packages/
    domain/         # entità, tipi, enum, value-object — non importa quasi nulla
    engine/         # regole e simulazione — importa solo domain e shared
    content/        # dati base + generatori + validazione (Zod/Valibot)
    shared/         # utility tecniche piccole (rng, result, date-utils)
    storage/        # GameStorage (interfaccia) + JsonGameStorage — importa domain+shared, mai engine
  pnpm-workspace.yaml
  tsconfig.base.json
```

Regole di dipendenza da rispettare da subito: `domain` non importa nulla; `engine` importa `domain` e `shared`; `content` importa `domain` e `shared`; `storage` importa `domain` e `shared` (mai engine: ogni tipo raggiungibile da `GameState` vive in `domain`); `cli` importa tutto. Vietato: engine→UI/db/Tauri/browser, domain→engine, storage→engine, qualsiasi cosa→web.
Salvataggi di Fase 0/1 in **JSON dietro un'interfaccia `GameStorage`** (implementazione `JsonGameStorage`), così il passaggio a SQLite in Fase 2 non tocca il motore. RNG deterministico con seed (`shared/rng`) come primissima utility: mai `Math.random()` dentro l'engine.
*Esito: `pnpm test` gira, l'engine importa i tipi, `pnpm cli` parte. Niente web, niente SQLite (storage parte con la sola impl JSON), niente ui package, niente desktop.*

> **Riferimento — struttura completa (per le fasi successive, da NON costruire ora):** quando il cuore divertirà, il monorepo crescerà verso: `apps/web` (React/Vite/Zustand/worker), `apps/desktop` (Tauri), l'impl `SqliteGameStorage` aggiunta dentro `packages/storage` (SQLite/OPFS, Fase 2), `packages/ui` (design system estratto da web), `packages/simulation-tools` (report e analisi batch), più uno strato `use-cases` nell'engine e i `selectors` per gli snapshot UI. Si aggiunge un package alla volta, solo quando il dolore lo giustifica (l'impl SQLite quando servono save veri su disco/OPFS, ui quando i componenti si duplicano, desktop quando il browser è stabile). Questa è la destinazione, non il punto di partenza.

### Fase 1 — Il motore validato (il cuore)

**Step 1.1 — Motore match minimo (aggregato)**
Prima versione del match a tick: forze di squadra dagli attributi pesati per ruolo, generazione occasioni, risultato. Ancora SENZA duelli nominali — solo per vedere uscire risultati plausibili. Emette già eventi strutturati (non testo).
*Esito: due squadre finte giocano, esce un punteggio.*

**Step 1.2 — Runner CLI e prime distribuzioni**
Il pacchetto `cli`: simula una stagione intera, scrive CSV (classifica, gol, risultati). Far girare 100+ stagioni e guardare le distribuzioni.
*Esito: primo confronto con la realtà statistica; si vede se i numeri sono sensati.*
> **Obiettivo del primo commit utile (la bussola):** `pnpm cli simulate-season --seed=demo-001` stampa una classifica finale credibile a 18 squadre, con capocannoniere, miglior difesa e peggior attacco. Primo test automatico obbligatorio: *stesso seed → stessa classifica, sempre* (impone il determinismo dal giorno uno). Da qui in poi tutto è iterazione su un cuore che gira.

**Step 1.3 — Duelli nominali**
Sostituire la risoluzione aggregata con le catene di confronti tra giocatori con nome. Da qui marcatori, assist e "colpevoli" emergono dai duelli. Ricalibrare le distribuzioni.
*Esito: il motore produce storie, non solo numeri; pagelle basate su eventi reali.*

**Step 1.4 — Fattori di contorno**
Forma, morale, fatica, familiarità tattica, meteo/terreno, fattore campo, tratti. Ognuno aggiunto e ri-validato a batch (un fattore per volta, per isolare gli effetti). Tarare il 65/35 rosa/tattica.
*Esito: le distribuzioni reggono con tutti i fattori; gli upset esistono come varianza, non come exploit.*

**Step 1.5 — Stagione completa e ciclo pluriennale**
Calendario, promozioni/retrocessioni, una versione minima di crescita/declino ed evoluzione del mondo. Simulare 10+ stagioni di fila e verificare che il mondo resti credibile nel tempo.
*Esito: la verità statistica regge su una run intera. Il motore è validato.*

### Fase 2 — Il gioco giocabile (una lega, per te)

**Step 2.1 — Persistenza**
SQLite WASM + OPFS, schema dei save, prime migrazioni. Salva/carica una partita.
*Esito: lo stato del gioco sopravvive alla chiusura.*

**Step 2.2 — Guscio UI e navigazione**
React + Vite, navigazione a schede + Continua, font pixel, palette CM. Schermate Rosa e Classifica con TanStack Table/Virtual. Motore nel Web Worker via Comlink.
*Esito: si naviga il mondo e si avanza nel tempo, senza freeze.*

**Step 2.3 — Match day col ticker**
La schermata partita: ticker strutturato (Livello 1), velocità regolabile, auto-pause, pagelle live, sostituzioni, discorsi. Il narratore-ticker legge gli eventi del motore.
*Esito: si vive una partita dall'inizio alla fine.*

**Step 2.4 — Le leve gestionali, in sotto-step brutali (niente contenitore unico)**
Ogni sotto-step è agganciato al motore e provato giocando prima di passare al successivo. L'ordine è anche un ordine di priorità: se il tempo finisce, ci si ferma e si valuta con ciò che c'è.
- **2.4A — Tattica + mercato minimo.** Modulo, ruoli, le 6 leve; mercato solo cash + parametri zero. *Esito: si compone la rosa e si imposta la squadra.*
- **2.4B — Contratti + economia base.** Rinnovi, stipendi, budget, biglietti e sponsor essenziali. *Esito: il club ha conti che reggono una stagione.*
- **2.4C — Board + esonero/crac.** Obiettivi stagionali, pressione del presidente, le due condizioni di fine run. *Esito: la posta in gioco esiste — si può fallire.*
- **2.4D — Solo dopo, se 2.4A–C divertono:** mercato avanzato (deadline day, prestiti, contropartite), poi staff/scouting, vivaio, strutture, eventi/presidente, uno alla volta. *Esito: profondità aggiunta a un cuore che già funziona.*

**Step 2.5 — Il loop completo della Scalata**
Profilo manager, reputazione, archivio run, promozioni concatenate. Giocare una run lunga e annotare cosa annoia o frustra (la simulazione dice "realistico", solo il gioco dice "divertente").
*Esito: il gioco è completo come esperienza su una lega. Decisione go/no-go informata.*

### Fase 3 — Verso la vendita (solo se la Fase 2 convince)

**Step 3.1 — Scala a 5 leghe**
Riempire le config dichiarative degli altri paesi, i livelli di dettaglio della simulazione mondo, le coppe nazionali e continentali. Stress test di performance sul carico aggregato.
*Esito: il mondo pieno gira fluido.*

**Step 3.2 — Contenuti e pipeline LLM**
Produrre i corpus (ticker labels in 5 lingue, micro-eventi, schede-storia IT+EN, lista tratti), curati a mano. Generatori di nomi per nazionalità. Editor minimo (rinomina + import/export pack).
*Esito: il gioco ha varietà e profondità di contenuto; la community può creare pack.*

**Step 3.3 — Demo e onboarding**
Tutorial guidato, confini della demo (mezza stagione, paese a scelta), export del save demo→completo. Build PWA della demo per il browser.
*Esito: la demo è pubblicabile su tefras.it/sito del gioco.*

**Step 3.4 — Packaging e lancio**
Tauri (Windows/Mac/Linux), integrazione Steam, pagina Steam con wishlist aperta presto, MoR per il sito. Verifica fiscale col commercialista.
*Esito: il gioco è in vendita.*

### Filo conduttore dei gate
Ogni fine-fase è un cancello esplicito: Fase 1 non finisce finché le distribuzioni non combaciano con la realtà; Fase 2 non finisce finché *tu* non ti diverti; Fase 3 non inizia finché la 2 non ha dato esito positivo. È la traduzione operativa del "prima lo provo io, poi lo vendo".

### Definition of Done — quando uno step è davvero finito
Ogni step ha criteri verificabili (idealmente automatici, come test). Uno step non è "fatto" finché tutti i suoi criteri passano. Esempi per gli step critici di Fase 0–1:

**Step 0.2 (scaffolding)** — Done quando: `pnpm install` e `pnpm test` girano puliti; gli alias `@game/*` risolvono; il linter di confini fallisce se si scrive un import proibito; `pnpm cli` esegue un comando vuoto.

**Step 1.1 (match minimo)** — Done quando: simula 1 match da CLI; 1000 match senza crash; media gol per match nel range realistico (~2.4–2.9 a regime, comunque 2.2–3.2); le squadre più forti vincono più spesso; stesso seed = stesso risultato bit a bit; zero `Math.random()` nell'engine (verificato da lint).

**Step 1.2 (stagione)** — Done quando: genera un calendario completo e valido (nessuna squadra gioca due volte nella stessa giornata, andata/ritorno corretti); assegna i punti correttamente; la classifica finale è coerente; esporta CSV; 100 stagioni di fila senza crash.

**Step 1.3 (duelli nominali)** — Done quando: marcatori e assist emergono dai duelli (non assegnati a caso); la distribuzione gol per reparto è plausibile (vedi metriche); le distribuzioni di 1.1–1.2 restano nei range dopo il refactor.

**Step 1.4 (fattori)** — Done quando: ogni fattore aggiunto è coperto da un test che ne isola l'effetto; il 65/35 rosa/tattica è verificato (una tattica ottimale non ribalta sistematicamente rose superiori); gli upset restano entro una banda realistica.

**Step 1.5 (ciclo pluriennale)** — Done quando: 10+ stagioni consecutive girano senza derive (inflazione valori, età media che esplode, club che falliscono a catena); le metriche restano stabili stagione su stagione.

Da Fase 2 in poi la DoD include anche criteri esperienziali (es. "una stagione completa è giocabile senza bug bloccanti"), non solo statistici.

### Metriche di simulazione — cosa osservare nei batch
La "verità statistica" diventa questa lista di numeri, prodotti dai batch (vivono in `simulation-tools`, esposti da `balance-report`). Non devono essere perfetti subito, ma vanno *osservati* a ogni modifica del motore per accorgersi delle derive:
- gol medi per partita; % vittorie casa / pareggi / vittorie trasferta
- distribuzione gol per reparto (attaccanti / centrocampisti / difensori)
- punti medi del primo classificato; punti medi della zona retrocessione
- distacco medio tra squadra forte e debole dello stesso campionato
- numero di upset per stagione (vittorie del nettamente più debole)
- infortuni medi per stagione; cartellini medi per partita
- valori di mercato: mediana, P90, P99, massimo e valore rosa per categoria (controllo anti-inflazione su più stagioni)
- rating globali correnti/potenziali per categoria e status titolare-riserva-giovane; conteggio e collocazione dei 5,5/6 stelle, intake eccezionali e stock attivo al decimo anno
- rapporto tra valore pubblico, prezzo richiesto e cifra finale; valore pubblico e cartellino zero degli svincolati
- flussi di mercato fra divisioni e integrità di promozioni/retrocessioni, calendari e continuità del club selezionato
- esiti della Scalata su career simulate: % run che raggiungono la promozione, distribuzione delle stagioni necessarie (deve riflettere la rarità reale)

Riferimenti reali approssimativi da cui partire (da affinare per categoria): gol/partita ~2.5–2.8, vittorie casa ~43–46%, pareggi ~25–28%. I numeri esatti si calibrano sui campionati reali in fase di tuning.

**Metriche economiche (l'economia si rompe in silenzio).** I risultati possono restare realistici mentre sotto il mondo va in bancarotta o si gonfia. Da osservare su orizzonti lunghi (10+ stagioni):
- saldo medio dei club per categoria; % club in rosso; % club falliti per stagione
- rapporto stipendi/fatturato medio (campanello d'allarme se sale verso valori insostenibili)
- inflazione di stipendi e valori di mercato su 10 stagioni (devono restare entro una banda, non esplodere né collassare)
- numero medio di trasferimenti per club a stagione; volume di mercato totale per categoria e fra categorie
- distribuzioni per categoria di budget mercato, budget ingaggi, utilizzo, headroom e rifiuti per impossibilità economica
Il test: dopo 10 stagioni simulate senza intervento umano, il panorama economico deve somigliare a quello iniziale, non a un'iperinflazione né a un fallimento di massa.

---

## H. Disciplina di scope — la ghigliottina

Il documento descrive il gioco *finito*. Questa sezione descrive il primo gioco *giocabile*. Il rischio numero uno di un progetto solo-dev non è tecnico: è costruire 12 sistemi al 40% invece di 4 al 90%. Queste regole esistono per impedirlo.

### Il prototipo-verità (prima di tutto il resto)
Prima ancora dell'MVP "bello", esiste un traguardo brutale e non negoziabile: **un prototipo brutto ma giocabile che faccia dire "ancora una partita".** Una nazione fittizia, una lega, rosa + tattica essenziale + match testuale + classifica + mercato minimo + stagione successiva. Niente UI rifinita, niente salvataggi robusti, niente contenuti curati.
La domanda a cui deve rispondere — l'unica che conta a questo stadio: **"Giocare due stagioni con una squadra scarsa è divertente?"**
Se sì, il progetto vive e si prosegue. Se no, nessun altro sistema lo salverà: meglio saperlo dopo settimane che dopo anni.

### Cosa entra nel primo ciclo giocabile (il minimo vitale)
Il ciclo che deve girare ed essere divertente: **partita → classifica → mercato → stagione successiva.**
- Una lega, una nazione (anche fittizia all'inizio)
- Rosa, attributi, tattica essenziale (modulo + poche leve)
- Match day col ticker (Livello 1)
- Calendario, classifica, promozione/retrocessione verso una seconda/terza serie minima
- Mercato semplice (cash, parametri zero), due finestre
- Economia base e contratti
- Esonero e crac finanziario (le condizioni di fine run)

**Parametri concreti della "prima lega giocabile"** (per non lasciarla vaga): 18 squadre, ~24-28 giocatori per rosa (≈ 450-500 giocatori totali nel mondo minimo), stagione di 34 giornate andata/ritorno, due finestre di mercato (estiva e invernale), 3 attributi-chiave aggregati per ruolo all'inizio (non tutti i 20 — quelli arrivano quando il match base regge). Una sola divisione per il prototipo-verità; la seconda/terza serie minima si aggiunge solo quando il ciclo di una lega diverte. Questi numeri sono volutamente piccoli: servono a far girare il cuore in fretta, si scalano dopo.

### Tagli obbligatori per la prima versione (bello, ma non ora)
Tutto progettato, niente di tutto ciò nel primo ciclo giocabile. Rientra nelle Fasi 2.4→3 solo dopo che il prototipo-verità ha dato esito positivo:
- Settore giovanile e intake
- Strutture e stadio (oltre la capienza base)
- Procuratori con personalità
- Eventi narrativi e media complessi
- Staff e scouting articolati (al minimo: nessuno o un solo voto)
- Coppe nazionali e continentali
- Sandbox sbloccabile
- 5 nazioni (si parte da 1, poi 3 minime per la Scalata)
- Localizzazione EN e le altre lingue
- Modding/editor completo
- Onboarding rifinito, demo, Steam, Tauri
- Salvataggi con migrazioni robuste (in prototipo basta un dump grezzo)

La regola: nessuno di questi sistemi si tocca finché il ciclo base non diverte. Aggiungerli a un cuore divertente li moltiplica; aggiungerli a un cuore spento è lavoro sprecato.

### I primi 30 giorni — cosa NON creare (la lista più brutale)
Orizzonte concreto per non disperdersi all'inizio. Nei primi ~30 giorni di lavoro l'unico obiettivo è il prototipo-verità da CLI. In questa finestra **non si scrive una riga** di: nessuna UI React o componente grafico; nessun database/SQLite (solo JSON); nessun Web Worker (la CLI è single-thread); nessun Tauri/desktop; nessuna localizzazione; nessun corpus di cronaca curato (il ticker della CLI può essere grezzo, anche solo log); nessun sistema di eventi/media; nessuno staff, vivaio, strutture, procuratori; nessun editor/modding; nessuna pagina Steam. Anche dentro l'engine: niente meteo, niente tratti, niente familiarità tattica finché il match base e la stagione non producono numeri sensati. Tutto questo ha già un posto previsto (sezione J) e aspetta lì. Se in 30 giorni il prototipo non fa dire "ancora una partita", il problema è nel cuore e nessuna di queste cose lo risolverebbe.

---

## I. Cosa deve essere divertente entro 30 minuti

Un manageriale rischia di essere bello sulla carta e mortale all'avvio: lento, arido, senza scintilla. Questo è il test di accensione — nei primi 30 minuti di gioco il giocatore deve già vivere, concretamente:
- una rosa piena di limiti, che si capisce a colpo d'occhio dove fa acqua;
- un budget ridicolo, che rende ogni spesa una rinuncia;
- almeno una scelta difficile e leggibile (vendo il gioiellino o resisto?);
- una partita con una cronaca che crea tensione, non solo un punteggio;
- un giocatore che sorprende — in bene o in male — e diventa "suo";
- un problema economico che incombe;
- una classifica che genera posta in gioco già alla terza-quarta giornata.

Se in mezz'ora il giocatore sente la scintilla, la direzione è giusta. Questo è anche il banco di prova della demo (Fase 3) e il criterio di design per le scelte di apertura della Scalata: il club iniziale e le sue prime settimane vanno costruiti *per* produrre queste sensazioni in fretta, non per essere realisticamente noiosi.

### Nota di posizionamento
Identità da spingere, più forte di "manageriale retro": **il manageriale calcistico della provincia.** La "povertà come design" — niente soldi, parametri zero, vendere il talento per sopravvivere, lo stadio o la punta, il presidente impaziente, la Serie B sentita come un'impresa dopo anni — è l'anima vera del gioco e il suo elemento più distintivo. Va spinta, non diluita.

---

## J. Struttura del codice (architettura del repository)

Obiettivo di questa sezione: chiunque — incluso un giovane sviluppatore al primo giorno — deve capire **dove sta ogni cosa e dove va una feature nuova**, senza sporcare. Il principio: la struttura è **completa nelle convenzioni dal giorno uno** (le regole non cambiano mai) ma **fisicamente cresce** (le cartelle nascono col primo file). Organizzazione **per livello tecnico** (domain/engine/db/ui), con le cartelle future già visibili come segnaposto annotati.

### Legenda di stato
🟢 MVP — si costruisce subito · 🟡 predisposto — cartella visibile con `.gitkeep` + `README` che spiega cosa conterrà, vuota finché non serve · ⚪ futuro — esiste solo come voce in questa mappa, si materializza alla fase indicata

### Albero completo annotato

```
football-manager/
  apps/
    cli/                      🟢 runner di simulazione e bilanciamento (primo "client")
      src/
        commands/             🟢 simulate-match, simulate-season, ...
                              🟡 simulate-career, balance-report, validate-content
        index.ts
    web/                      ⚪ Fase 2 — React/Vite/PWA
    desktop/                  ⚪ Fase 3 — Tauri (wrappa web)
  packages/
    domain/                   🟢 COSA esiste nel gioco. Non importa nulla.
      src/
        entities/             🟢 player, club, contract, competition, season, match
                              🟡 staff, transfer, sponsor, stadium, youth-player
        value-objects/        🟢 money, rating, date  ·  🟡 morale, fitness, reputation
        enums/                🟢 position, tactical-role, match-result, contract-status
        state/                🟢 game-state.ts — il TIPO GameState (solo dati, niente logica)
        types/                🟢 ids, common
        index.ts
    engine/                   🟢 COSA succede. Importa solo domain + shared.
      src/
        random/               🟢 rng.ts, seed.ts (deterministico, mai Math.random)
        state/                🟢 create-new-game, game-reducer (LOGICA su GameState)
        match-engine/         🟢 simulate-match, team-strength, resolve-shot
                              🟡 resolve-duel (Step 1.3), match-events
        season-engine/        🟢 simulate-day/round/season, league-table, calendar
        squad-engine/         🟢 select-lineup, update-fitness  ·  🟡 update-morale
        transfer-engine/      🟢 player-value, free-agents  ·  🟡 generate-offers, evaluate
        finance-engine/       🟢 monthly-balance, ticket-revenue, wage-budget
        career-engine/        🟢 advance-day, advance-season  ·  🟡 board-pressure
        youth-engine/         ⚪ Fase 2.4 — intake, sviluppo giovani
        staff-engine/         ⚪ Fase 2.4
        narrator/             🟡 da eventi strutturati a output (ticker MVP; telecronista poi)
        use-cases/            🟢 i comandi che i client chiamano (start-career, play-match, ...)
        selectors/            🟡 snapshot mirati per la UI (select-squad-view, ...)
        runtime/              🟡 GameRuntime: ponte client↔motore↔storage (serve con web)
        index.ts
    content/                  🟢 DATI base + generazione + validazione. Importa domain + shared.
      src/
        base-game/            🟢 countries, leagues, clubs, players (JSON di prova)
                              🟡 staff, sponsors, events, traits
        schemas/              🟢 schema Zod/Valibot per ogni entità
        validators/           🟢 validate-content-pack
        generators/           🟢 fake-players, fake-clubs, league-system
        index.ts
    shared/                   🟢 utility tecniche PICCOLE. Non diventi un cassetto.
      src/
        result.ts, errors.ts, assert.ts, date-utils.ts, number-utils.ts
        index.ts
    storage/                  🟢 persistenza dietro interfaccia. Importa domain + shared, MAI engine (ogni tipo raggiungibile da GameState — Player, MatchReport, MatchEvent, … — vive in domain).
      src/
        game-storage.interface.ts   🟢 saveGame/loadGame/listSaves/deleteSave
        json-game-storage.ts        🟢 MVP: salva su file/oggetto JSON
        sqlite-game-storage.ts      ⚪ Fase 2 — SQLite WASM/OPFS, stessa interfaccia
        schema/ migrations/ mappers/  ⚪ Fase 2
        index.ts
    ui/                       ⚪ Fase 2.2+ — design system estratto da web quando si duplica
    simulation-tools/         🟡 report e analisi dei batch (goals-distribution, promotion, ...)
  docs/                       🟢 questo documento + eventuali approfondimenti
  scripts/                    🟡 generate-content, create-release
  pnpm-workspace.yaml         🟢
  tsconfig.base.json          🟢
  turbo.json                  ⚪ si aggiunge quando il monorepo "fa male", non prima
```

### Il contratto di dipendenze (la regola che impedisce di sporcare)
Le frecce indicano "può importare". Tutto ciò che non è elencato è vietato.

```
domain         → (niente)
shared         → (niente)
engine         → domain, shared
content        → domain, shared
storage        → domain, shared   (GameState è un tipo di domain: nessuna dipendenza da engine)
simulation-tools → domain, engine, shared
apps/cli       → engine, content, storage, simulation-tools, shared
apps/web       → engine, content, storage, ui, shared
apps/desktop   → web
```

Divieti assoluti, da non infrangere mai: `engine → web/db/ui/Tauri/browser` · `domain → engine/storage` · `storage → web/ui` · qualsiasi `→ apps/*`. Se una feature sembra richiedere una di queste frecce, la feature è progettata male, non il contratto. Consiglio operativo: rendere queste regole automatiche con un linter di confini (es. eslint-plugin-boundaries o dependency-cruiser) così un import proibito rompe la build, non la code review.

### Convenzioni di naming
- File: `kebab-case`, con suffisso di ruolo dove aiuta — `*.entity.ts`, `*.schema.ts`, `*.store.ts`, `*.worker.ts`.
- Funzioni dell'engine: verbo + sostantivo, pure dove possibile — `simulateMatch`, `calculatePlayerValue`, `updateFitness`.
- Un concetto = un posto solo. L'entità `Player` vive in `domain/entities`; la *logica* sul player vive in `engine`; i *dati* di player in `content`; la *vista* del player in `ui`/`web`. Mai mischiare i quattro.
- I package si referenziano come `@game/domain`, `@game/engine`, ecc. (alias di workspace), mai con percorsi relativi tra package.
- **`shared` è off-limits per la logica di gioco.** Ci vanno SOLO utility tecniche e trasversali (`result`, `errors`, `assert`, `date-utils`, `number-utils`). Mai niente di calcistico/economico/gestionale: `calculatePlayerValue` sta in `engine`, l'età di un giocatore in `domain`, `formatMoney` in `shared` o `ui` solo se è pura formattazione. Regola mnemonica: se per capire una funzione devi sapere cos'è il calcio, non va in `shared`.

### Ricetta: "voglio aggiungere una feature" (es. il settore giovanile)
Procedura che vale per qualunque sistema nuovo, e che per costruzione non sporca:
1. **Dati** → nuove entità in `domain/entities` (`youth-player`), il loro schema in `content/schemas`, i dati in `content/base-game`.
2. **Regole** → nuova cartella di dominio dentro l'engine (`engine/youth-engine`) con le funzioni pure; eventuali nuovi `use-cases` se la UI deve invocarle.
3. **Persistenza** → se la feature ha stato da salvare, si estende `GameState` e i mapper dello `storage`; l'interfaccia `GameStorage` non cambia.
4. **Vista** → nuovo selettore in `engine/selectors`, nuova pagina/feature in `web`, componenti riusabili in `ui`.
La feature trova ovunque un posto già previsto: non nasce una "stanza abusiva". Questa è la ragione per cui la struttura è definita per intero in partenza pur restando fisicamente minima.

### Come cresce (riassunto)
Si parte (Fase 0–1) con `apps/cli` + `domain` + `engine` + `content` + `shared` + `storage` (JSON). Si aggiunge un pezzo solo quando il dolore lo giustifica: `apps/web` quando il motore diverte da CLI e vuoi vederlo; l'impl `SqliteGameStorage` dentro `packages/storage` quando servono save veri su disco/OPFS; `ui` quando i componenti si duplicano; `simulation-tools` quando il bilanciamento si fa serio; `apps/desktop` quando il browser è stabile; `turbo.json` quando i build diventano lenti. Le cartelle 🟡/⚪ esistono nella mappa proprio perché quel giorno tu (o il junior) sappia esattamente dove mettere il codice.

---

## J-bis. Decisioni di fondazione del motore (sessione di grilling — 14 giugno 2026)

Questa sezione estende l'Area 22 e la Sezione J. Raccoglie le decisioni prese sviscerando, una a una, i punti che il resto del documento lasciava vaghi o in apparente contraddizione (Aree 3, 13, 22; Sezioni H, J). Sono i vincoli con cui si scrive il codice dalla Fase 0 alla Fase 2 (dallo schema dati di Step 0.1 fino a save, economia e stati dinamici). Il filo che le attraversa tutte: **forma umana e stabile ai bordi, forma deterministica e sicura nel runtime.**

### 1. Schema attributi: ricco nei dati, povero nel motore
**Decisione:** `Player` memorizza tutti i 25 attributi (Area 3). Il motore di Step 1.1 NON li legge singolarmente: calcola la forza da **3 aggregati derivati per ruolo** (vedi Decisione 8). I 25 sono dati grezzi, i 3 sono valori calcolati.
**Perché:** scioglie la tensione Area 3 (25 attributi) ↔ Sezione H ("3 attributi-chiave aggregati per ruolo all'inizio") ↔ Sezione J ("schema completo dal giorno uno"). La scorciatoia "3 attributi" riguarda la complessità del motore, non la forma del dato. `Player` è il contratto più centrale del codebase: tenerlo stabile = zero migrazione quando il motore matura.

### 2. Modello del tempo: date-first, il round è una proprietà sportiva
**Decisione:** il tempo globale è una **data**, non un round. `GameState.calendar.currentDate` è l'unico orologio; le fixture hanno **sia `date` sia `roundNumber`** (il round è informazione sportiva, non l'orologio). Il minuto simulato vive solo in `MatchSimulationState` durante la partita e non entra mai nel calendario globale. Nel prototipo il calendario è volutamente banale (una giornata ogni 7 giorni, nessuna sosta/coppa/recupero/turno infrasettimanale): è scelta di scope, non limite del modello.
**Perché:** fatica, infortuni, contratti, finestre mercato, deadline day sono tutti concetti di calendario già decisi nel documento. Partire round-only imporrebbe un retrofit pervasivo delle date.

### 3. `GameDate` = epoch-day numerico
**Decisione:** `type GameDate = number` (epoch-day, origine `1970-01-01`), branded. Le date ISO `YYYY-MM-DD` esistono **solo ai bordi**: authoring dei content pack, UI, export CSV, dump di debug. Conversione ISO↔epoch-day in `shared/date-utils`, **pura e gregoriana, mai basata su `Date`**. L'engine non usa mai `new Date()`, `Date.now()`, `crypto.randomUUID()`.
**Perché:** l'aritmetica delle date (età, +N giorni, confronti) si fa a valanga nei batch; l'intero la rende banale e deterministica, zero bug di rollover/bisestili, save più piccoli. ISO è serializzazione/presentazione, non verità di runtime. Coerente con la regola "stesso seed → stesso risultato".

### 4. ID stringa branded; namespace unico; `Record` è solo lookup; ordine sempre esplicito
**Decisione:** ogni ID è una **stringa branded namespaced non integer-like** con convenzione unica **`type:value`**, validata dai costruttori del `domain` e non solo documentata. Esempi canonici: `player:000123`, `club:perugia`, `competition:ita-3`, `fixture:000001`, `season:2026`, `save:demo-001`. Entità da content = slug semantici dopo il namespace (`club:perugia`); entità generate = valore sequenziale deterministico dopo il namespace (`player:000123`, `fixture:000001`), mai random. Non esiste un validatore pubblico parziale tipo `stableId`: chi vuole un ID passa dal costruttore specifico (`playerId`, `clubId`, `fixtureId`, ecc.), che valida prefisso e valore. `Record<Id, Entity>` è **solo lookup table O(1)**: nessuna logica ordine-sensibile itera `Object.keys/values/entries`. Ogni ordine logico vive in **array espliciti di ID** (`GameState.clubIds`, `Club.playerIds`, `Round.fixtureIds`). Ogni `sort` ha un **tie-breaker finale deterministico** (`compareId`) e non muta l'array di input.
**Perché:** la convenzione unica `type:value` rende save, log ed errori leggibili anche a occhio e impedisce ID misti (`p_...`, `fx_...`, `comp:...`) nel codebase. In JS le chiavi integer-like (`"123"`) si enumerano in ordine numerico crescente, non d'inserimento → baco di determinismo silenzioso. Stringa non-integer + namespace obbligatorio + disciplina d'iterazione lo eliminano (cintura + bretelle).

### 5. RNG a sub-stream derivati per chiave
**Decisione:** **niente stream RNG globale condiviso.** Ogni unità logica indipendente deriva il proprio stream: `deriveRng(gameSeed, streamName, ...keyParts stabili)` — es. `("match", fixtureId)`, `("player-growth", seasonId, playerId)`, `("schedule", seasonId, competitionId)`. Implementazione: hash di stringa (xmur3/cyrb128) → PRNG veloce (sfc32). Nel save **solo `seed` + `rngAlgorithmVersion`**; zero stato RNG persistito. Algoritmo congelato dentro la major. Granularità per-match/per-season, **mai per-minuto/per-tick** (tempesta di hash nei batch).
**Perché:** lo stream globale rende fragile il bilanciamento (una pescata in più rimescola tutto il resto della run) e impedisce di ri-simulare la singola partita in isolamento — entrambe richieste implicite del documento (riproducibilità dei bug, ri-narrazione dei match, "un fattore per volta").

### 6. Valore-attributo: float valore-vero nel dominio, presentazione e nebbia derivate
**Decisione:** `domain` memorizza i **valori veri precisi** (float 0–20 per abilità correnti e potenziale per-attributo). Gli attributi correnti esatti, quando visibili, sono arrotondati a **una cifra decimale** dal selector/presentation layer; il potenziale numerico esatto non è esposto. I futuri range fog-of-war a 4 livelli e il range di potenziale sono **calcolati da selector lato vista, mai persistiti**. Lo stato di conoscenza (`ScoutingKnowledge`: club osservante, livello, data) si persiste solo quando una fase scouting lo implementa realmente; fino ad allora non esistono nebbia o osservazioni fittizie. L'hot-path del motore **evita funzioni trascendentali** (`Math.exp/sin/cos/log/pow` frazionario): le probabilità usano formule lineari, piecewise o lookup table.
**Perché:** mantiene una sola fonte di verità, rende leggibile la crescita reale senza mostrare il potenziale esatto e impedisce di introdurre stato scouting morto. Il rischio di determinismo non è il float salvato (IEEE754 ovunque, round-trip JSON pulito) ma le trascendentali, che possono divergere tra engine JS.

### 7. Match engine: Bernoulli per-minuto, due strati
**Decisione:** ogni minuto, per ogni squadra, una probabilità di generare un'occasione derivata dalle forze. Motore diviso in due strati: **generation** (stabile 1.1→1.3: se/dove nasce l'occasione, zona, tipo, qualità preliminare) e **resolution** (`AggregateOccasionResolver` in 1.1 → `DuelOccasionResolver` in 1.3) dietro l'interfaccia `OccasionResolver` **presente dal giorno uno anche se il primo resolver è stupido**. La **rosa determina la forza** (rate occasioni + vantaggio in risoluzione); la **tattica sposta solo le distribuzioni** (zona, tipo, tempo, costo fatica) con **moltiplicatori limitati da cap**, mai forza → meccanismo del 65/35, verificato a batch (una tattica ottimale non ribalta sistematicamente rose superiori). L'ordine home/away per minuto è randomizzato in modo deterministico per non favorire la casa.
**Perché:** solo il per-minuto produce nativamente lo stream evento-per-minuto che serve al ticker; i due strati rendono il passaggio 1.1→1.3 uno **swap della risoluzione, non un rewrite**. I numeri (rate, conversione) si tarano nei batch via `MatchEngineConfig`, non nel codice. I 90 minuti sono *simulazione*; la velocità del ticker (Area 17) è solo *rendering*.

### 8. `TeamStrength` da role-score; pesi come dato
**Decisione:** per ogni slot di formazione, `roleScore = Σ(attributo × peso del ruolo dello slot)`; aggregazione **media-pesata per reparto** → `TeamStrength {attack, midfield, defense, goalkeeper, overall}`. I pesi ruolo e reparto vivono in `content/balance/role-weights.json` (validati Zod, normalizzati al load), **mai hardcoded nell'engine**. Il role-score usa il **ruolo dello slot assegnato in formazione**, non la posizione naturale del giocatore (il fuori-ruolo sarà un moltiplicatore futuro). In 1.1 solo ~3 attributi pesano significativamente per ruolo: **il "3 aggregati per ruolo" di Sezione H vive nei PESI, non nello schema** — nessuna contraddizione con la Decisione 1 e nessuna migrazione.
**Perché:** tarare il bilanciamento = editare JSON, non codice; coerente con "config dichiarative" (Area 22) e "tutto è contenuto" (Area 19).

### 9. Stato: ibrido copy-on-write, hot-loop mai su `GameState`
**Decisione:** l'engine è concettualmente puro `(state, input) => nextState`, implementato con **copy-on-write manuale** (si copiano solo root `GameState` + i `Record` toccati + le entità toccate; i sottoalberi non toccati mantengono identità referenziale). **Mai deep-copy del mondo.** Gli hot-loop operano su stato locale mutabile usa-e-getta (`MatchSimulationState`), mai su `GameState`. `simulateMatch(MatchContext) → MatchReport` (solo ID, serializzabile, mai riferimenti a entità mutabili); `applyMatchReport(state, report) → GameState` applica gli effetti persistenti. Update multipli: copiare il `Record` **una sola volta**, poi mutare la copia. **Niente Immer** nell'hot-path/batch (proxy overhead); eventualmente solo per reducer UI non critici.
**Perché:** la deep-immutability uccide i batch; la mutazione in-place costa cara in Fase 2 (snapshot UI, memoization React, undo, replay). Lo structural sharing serve due volte: perf nei batch e identità referenziale per React.

### 10. Generazione lega top-down a fasce
**Decisione:** la **forza del club è progettata prima dei giocatori**. Config in `content/balance/generation-config.json` (+ `player-archetypes.json`): fasce di forza con media-abilità, forma-rosa (stelle/titolari/rotazioni/riserve), template posizioni, archetipi `primary/secondary/weak` per ruolo. Il rating pubblico è una scala assoluta `1..6` a mezze stelle con soglie versionate; le fasce di categoria valgono per i senior pronti per la prima squadra, mentre giovani/riserve possono stare sotto. Rarità corrente e potenziale hanno budget mondiali separati e i campioni vengono allocati a tier e slot credibili. Attributi generati via **rumore triangolare deterministico** (`rng()+rng()+rng()-1.5`, niente trascendentali). `content/generators` **NON importa `engine`** (contratto dipendenze Sezione J); il `GenerationReport` con la forza attesa lo calcola `apps/cli` o `simulation-tools` chiamando `deriveTeamStrength`. La forza attesa è **diagnostica, fuori da `GameState`**.
**Perché:** attributi uniformi casuali → per il limite centrale i club si assomigliano troppo → la DoD 1.1 ("le squadre più forti vincono più spesso") non è falsificabile. La piramide progettata rende la forza nota e lo spread una manopola tarabile.

### 11. Stagione: calendario deterministico + classifica derivata + tie-breaker
**Decisione:** round-robin doppio. Ordine club da `deriveRng(seed, "schedule", seasonId, competitionId)` (Fisher-Yates) → metodo del cerchio (Berger) → ritorno specchiato con campi invertiti → date a +7 giorni da `seasonStartDate`. La **classifica non è persistita**: `computeLeagueTable(clubIds, fixtures, fixtureIds, rules)` la deriva on-demand (source of truth = fixture giocate). I tie-breaker vivono nella config competizione come dato; **l'engine appende SEMPRE `compareClubId` come fallback non rimovibile** (ordine totale, "stesso seed = stessa classifica"). Prototipo: `points → goalDifference → goalsFor → clubId`; `headToHead` rimandato a Fase 3 (è una mini-classifica ricorsiva).
**Perché:** niente stato duplicato né desync; il fallback deterministico garantisce ordine totale anche tra squadre a statistiche identiche.

### 12. Verità statistica: calibration targets hand-authored
**Decisione:** la validazione confronta le distribuzioni simulate con target di calibrazione versionati — pochi **benchmark aggregati** (gol/partita, %casa/pari/trasferta, punti primo/ultimo, spread forte-debole, upset rate, infortuni/cartellini quando esistono, rating, valori e finanze per categoria) scritti a mano o trascritti come snapshot aggregati datati, con fonte e bande di tolleranza (**larghe all'inizio**, niente finto rigore). `simulation-tools` produce un `CalibrationReport` PASS/FAIL → il cancello diventa automatico/falsificabile. **Non sono dati reali importati**: nessuna identità, rosa, calendario o banca dati strutturata; niente scraping o dipendenza live. *Fatti aggregati ≠ banca dati protetta* (dir. 96/9/CE: protetta la raccolta strutturata sostanziale, non i fatti). I nomi dei file dichiarano calibrazione e versione, non fingono di essere una copia del mondo reale.
**Perché:** riconcilia il cancello di Fase 1 ("validare contro la realtà") con la policy IP dell'Area 21, senza scraping né dataset.

### 13. `MatchEvent`: contratto strutturato, sparso, language-agnostic
**Decisione:** il match engine emette `MatchEvent` strutturati, **mai testo** (Area 20). Forma: **unione discriminata** per `type`, ogni variante tipata; eventi **sparsi** (solo momenti notevoli + marcatori `kickoff/halfTime/fullTime`), **mai uno per minuto** (le statistiche live le deriva il narratore dal flusso). Solo ID e primitivi, mai riferimenti a entità mutabili (serializzabile, ri-applicabile). Esiti di tiro = tipi separati `goal/save/miss/block` che condividono `ShotContext`; niente evento `shot` separato (il beat a due tempi del ticker lo sintetizza il narratore). Contesto ricco sull'evento-esito (zona, `occasionType`, contropiede, qualità, giocatori taggati `creator/finisher/beaten/culprit`): i micro-duelli arricchiscono l'esito, non diventano eventi top-level nel save. Il **narratore** (strato separato) è l'unico a produrre testo (ticker localizzato ora, prosa da corpus poi), forward-tolerant verso tipi/campi sconosciuti. `eventSchemaVersion` nel `MatchReport`; schema Zod in `storage/schemas` (mai in `domain`), con type-test anti-drift.
**Perché:** è un contratto a vita lunga (gli eventi salvati abilitano la ri-narrazione di partite vecchie nello stile/lingua installati alla rilettura). Unione discriminata = type-safe + filtri banali; eventi sparsi = save snello; narratore unico = localizzazione e telecronaca futura senza toccare il motore.

### 14. Save: snapshot autoritativo, ritenzione per rilevanza, migrazioni
**Decisione:** il save è uno **snapshot autoritativo di `GameState`**, NON un replay dal seed — il passato è persistito, non ricalcolato (cambiare engine/config farebbe divergere il replay). **`fixture.result` è la source of truth della classifica**; i `MatchReport` ricchi sono potabili e non possono mai compromettere classifica/storico minimo. **Ritenzione per rilevanza, allineata al detail level (Area 5):** eventi ricchi per club del giocatore + stagione corrente + partite notevoli; il resto compattato a `result+stats`; i `NotableMoment` compatti (memoria di carriera, leva K) sopravvivono alla potatura. La potatura è uno use-case a fine stagione, mai dentro `simulateMatch`; politica come dato (`save-retention-config.json`). `saveSchemaVersion` + `migrate(save)` esistono dal giorno uno (identità in Fase 1). `GameStorage` (`saveGame/loadGame/listSaves/deleteSave`) astrae JSON-blob (Fase 1) → SQLite normalizzato (Fase 2); il motore non sa quale storage c'è sotto. `createdAtISO/updatedAtISO` = orologio reale dello strato storage (lì `Date` è lecito, non nell'engine).
**Perché:** integrità simulativa e classifica non dipendono dagli eventi ricchi; il save resta limitato senza perdere la memoria narrativa dove conta; le migrazioni mantengono la promessa "i save non si rompono dentro la major" (Area 19).

### 15. Logica di flusso in `use-cases` pure; CLI guscio; `GameRuntime` rinviato
**Decisione:** la logica di flusso vive in `engine/use-cases` come **funzioni pure** `(state, input) => { state, result }` (`startCareer`, `simulateFixture`, `simulateRound`, `simulateSeason`, `applyMatchReport`, `applyRetentionPolicy`). CLI e (poi) web chiamano le **stesse** use-cases: nessun client implementa loop o regole di gioco. `simulate-season` è una use-case, non un comando — il comando CLI è solo il guscio di I/O (parse args → genera lega → use-case → CSV/JSON). `GameRuntime` (façade stateful su use-cases + `GameStorage`, destinato al Worker) è **rinviato** alla Fase 2/web (🟡 della mappa J). Cucitura del mondo iniziale: `content.generateLeague` (ritorna entità domain) → la **CLI** fa da ponte → `engine.startCareer` (accetta solo tipi domain; `engine ↛ content`). Argomenti con `node:util parseArgs` (zero dipendenze); ogni comando prende `--seed` con default fisso (commit riproducibili); exit code ≠ 0 su fallimento (`validate-content`, `balance-report` fuori target → utilizzabili come test/CI).
**Perché:** un'unica fonte di flusso riusabile da ogni client; `GameRuntime` ora sarebbe overhead sul batch puro; la CLI è il modo più economico di esercitare le use-cases prima che esista la UI.

### 16. Scaffolding (Step 0.2): le regole architetturali diventano build
**Decisione:** Step 0.2 rende **automatiche** le regole decise. **dependency-cruiser** impone il DAG dei package: la build fallisce se `engine → content/storage/ui/apps`, `content → engine`, `domain → qualsiasi cosa`, `packages → apps`. **ESLint** scoped a `packages/engine` vieta `Math.random`, `Date.now`, `new Date`, `crypto.randomUUID`, `performance.now` (il tempo viene solo da `GameDate`, il random solo da `deriveRng`); `Date` resta lecito in `cli`/`storage` per i metadata reali. pnpm workspace + `tsconfig.base` + path alias **`@game/*`** (namespace tecnico canonico; scartato `@the-long-season/*`); le TypeScript project references sono rinviate finché la build non fa male. `pnpm check` = `lint && depcruise && test` è il cancello unico. Limite onesto: la regola "niente `Object.keys/values/entries` per logica ordine-sensibile" (Decisione 4) non è lintabile — resta disciplina, con il test "stesso seed → stesso output bit a bit" come rete.
**Perché:** l'architettura non deve dipendere dalla disciplina personale; deve **fallire in automatico** quando viene violata (lo esige la DoD 1.1: "zero `Math.random` nell'engine, verificato da lint").

### 17. Stati dinamici (fatica/forma/morale): separati, persistiti, moltiplicatori limitati
**Decisione:** forma, morale e fatica sono **stati dinamici separati dagli attributi** (Area 3). `Player` = identità stabile (`birthDate`, `naturalPositions`, `abilities`, `potential`, `development`); `GameState.playerStates: Record<PlayerId, PlayerDynamicState>` = `{fitness, form, morale}` volatile. Sono **persistiti** (storia accumulata, non derivabili dal seed), evoluti da transizioni pure (`applyMatchReport` consuma fatica e muove morale, `advanceDay` recupera). Nel calcolo della forza **non creano forza**: applicano moltiplicatori **limitati** al role-score, curve come dato in `content/balance/player-state-curves.json`, con cap che preservano l'ordine rosa > stati (coerente col 65/35). Introdotti uno alla volta in Step 1.4, ognuno con un test che ne isola l'effetto: **fatica → forma → morale**. Init `fitness 100 / form 50 / morale 50`.
**Perché:** Record separato = copy-on-write economico (lo stato volatile cambia ogni giorno/partita, non si vogliono copiare i 25 attributi per aggiornare la fitness) e chiarezza concettuale (stati ≠ attributi). Gli attributi dicono *chi sei*; gli stati dinamici dicono *come arrivi alla partita*.

### 18. `Money`: intero in unità minori, valuta contestuale
**Decisione:** `Money = number & {brand}` **intero in unità minori** (centesimi/pence), **mai float** (l'economia "si rompe in silenzio", Area 22 rischio #3); `Number` safe-integer (no bigint), con guardrail `Number.isSafeInteger`. La **valuta non fa parte del value-object**: è contestuale (paese/competizione/club), usata solo per la formattazione; **nessun FX** nel modello iniziale (se servirà, un tipo separato `MonetaryAmount {amount, currency}` senza cambiare la rappresentazione base). Operazioni esplicite (`addMoney`, `subtractMoney`, `compareMoney`, `splitMoney`) in `domain/value-objects/money`; le divisioni usano **floor + resto conservato** (l'ultima rata assorbe il resto → zero centesimi persi). Le percentuali usano **`BasisPoints`** branded (1250 = 12,5%) con arrotondamento esplicito. Il saldo del club può essere negativo; validator non-negativi per cartellini/stipendi/prezzi. `formatMoney(amount, currency, locale)` (puro, `Intl`) vive in `shared`.
**Perché:** `Money` è contabilità, non UI: interi nel dominio per determinismo ed esattezza sugli accumuli pluriennali, valuta solo al bordo di presentazione.

### 19. Modello tattico: dichiarativo, tre assi distinti, familiarità = esecuzione
**Decisione:** i moduli sono **dato** (`Formation` in `content`: lista ordinata di slot con ruolo base, zona, reparto, varianti ammesse); l'engine non li hardcoda. `ClubTacticalSetup` persistito (modulo, variante per slot, 6 leve, incaricati piazzati) ≠ `MatchLineup` per-fixture (giocatore + variante per slot). Il role-score usa il **profilo pesi della variante** (`role-weights.json` con chiavi `ruolo+variante`, es. `fb_attack`/`st_target`), e la variante porta anche delta di `TacticalDistribution`. Le **6 leve** (mentalità/pressing/impostazione/ampiezza/contropiede/fuorigioco) → knob **cappati** della `TacticalDistribution`, mai forza grezza; sono anche le istruzioni rapide in-match (Area 12). **Tre assi indipendenti, mai confusi**: `outOfPositionMultiplier` (giocatore nello slot sbagliato), `formationFamiliarity` (squadra nel sistema), `roleVariantFit` (attributi vs variante). La **familiarità** è stato dinamico persistito per (club, modulo): qualità di **esecuzione**, non bonus tattico — moltiplicatore d'efficacia cappato + errori/varianza quando bassa (bonus massimo minimo, penalità più rilevante); sale con partite/allenamento, decade se inutilizzata, extra-decay oltre 2-3 moduli alti.
**Perché:** moddabilità + bilanciamento come dato; la separazione dei tre assi evita doppio conteggio; la familiarità punisce il caos tattico più di quanto premi il min-maxing, senza violare il 65/35 (Decisione 7).

### 20. Staff e scouting: un ruolo = un dominio, modificatori su sistemi esistenti
**Decisione:** lo staff è un sistema di **modificatori cappati su sistemi esistenti, mai mini-giochi**. `StaffMember {role, rating 0–20, specialization}`. Legge: **un ruolo = un dominio di responsabilità** (non un singolo numero): vice→sviluppo; preparatore→condizione (fatica + infortuni); medico→salute (recupero + precisione stime); scout→fog-of-war; DS→trattative/rinnovi; responsabile vivaio→intake. Effetti come curve `rating→moltiplicatore` in `content/balance/staff-effect-curves.json`; la specializzazione è una nicchia *dentro* il dominio. **Scouting = risorsa attiva**: ogni scout ha un solo incarico alla volta (`observePlayer/exploreArea/opponentReport`); il report avversario consuma lo scout (trade-off "non osserva il mercato"); `head_scout` = moltiplicatore organizzativo, `scout` = operativo. La `ScoutingKnowledge` (Decisione 6 estesa) ha `confidence: 0–100` continua persistita; i **4 livelli di fog = bande derivate** dalla confidence; il range visibile resta derivato, non persistito. Le missioni alzano la confidence **deterministicamente**. Il fog-of-war è **risorsa di informazione, non bonus di forza**.
**Perché:** il voto unico tiene leggibile l'effetto ("staff migliore → senti il sistema migliorare"); la disciplina "modifica sistemi esistenti" impedisce che ogni ruolo diventi un sottosistema enorme; lo scout a incarico singolo crea trade-off veri.

### 21. Vivaio e crescita: un unico modello di sviluppo
**Decisione:** **intake** = lotteria deterministica annuale — academy + responsabile vivaio + bacino aumentano quantità/media/tetto della distribuzione, ma ogni giocatore resta una pescata (compri biglietti, non il biglietto vincente). I giovani sono **`Player` normali** (tag `contractType:"youth"`), con abilità/potenziale veri, development profile e fog iniziale basso (range larghi). La **crescita usa un solo sistema per tutti**: mensilmente `applyMonthlyGrowth` muove ogni abilità verso il suo potenziale per `delta = curvaEtà(età, growthType) × minutaggio × allenamento × gapPotenziale × personalità × infortuni × micro-varianza`, cappato; la **stessa curva gestisce crescita, plateau e declino** (curva età negativa dopo il picco). Curve come dato (`growth-curves.json`); deterministico via `deriveRng("player-growth", yearMonth, playerId)`. **Squadra giovanile e prestiti = riuso**: competizioni a basso dettaglio (Area 5) + minuti + growth system; il detail level dell'ospite decide se i minuti sono simulati o sintetizzati, ma l'input finale alla crescita è identico. **Schede evento giovani = dato** sul sistema-eventi, effetti solo su sistemi esistenti.
**Perché:** un solo sistema di crescita serve già a Step 1.5 (il mondo deve invecchiare su 10+ stagioni) anche prima del vivaio completo (Fase 2.4D); il vivaio non è un sistema separato ma una sorgente di giocatori nello stesso ciclo crescita/minutaggio/fog. **Legge degli eventi (trans-cutting, vale anche per Area 15):** una scheda può solo leggere condizioni del mondo e applicare effetti su sistemi *esistenti* — mai introdurre una risorsa/barra/sottosistema nuovo.

### 22. Strutture: stato del club, composizione moltiplicativa con lo staff
**Decisione:** le strutture sono stato persistito del club che modifica sistemi esistenti, mai mini-giochi. `ClubFacilities` (stadio con sotto-livelli tribune/illuminazione/terreno/copertura, centro allenamento, centro medico, academy, area commerciale), livelli discreti, curve in `content/balance/facility-effect-curves.json`. **Composizione strutture × staff = moltiplicativa con cap congiunto di dominio**: `growthFactor = clamp(trainingCenterFactor × assistantFactor)`, `recoveryFactor = clamp(medicalFactor × doctorFactor)`, `youthIntakeFactor = clamp(academyFactor × youthDirectorFactor × basinFactor)` — struttura = gli attrezzi/il tetto, staff = quanto li usi, servono entrambi. Stadio → capienza → input alla formula affluenza/ricavi (Area 11), nessuna meccanica nuova; illuminazione/terreno/copertura → soprattutto requisiti di categoria. **Upgrade schedulati**: costo impegnato alla pianificazione, effetto a fine stagione, nessun cantiere né malus parziale. **Requisiti infrastrutturali per categoria** in config; alla promozione il non-conforme si adegua (costo) o gioca altrove (penalità affluenza/ricavi) — conseguenze via sistemi esistenti.
**Perché:** la composizione moltiplicativa cappata premia l'investimento bilanciato (cuore della scalata) senza doppio conteggio né stacking lineare; il completamento a fine stagione tiene il motore senza stati parziali da gestire.

### 23. Economia: macchina mensile deterministica, crisi a stadi discreti
**Decisione:** l'economia è una macchina deterministica a **tick mensile** con crisi a **stadi discreti**. **Affluenza** per-partita come funzione di domanda: `attendance = min(capienza, domandaBase(bacino, categoria) × fattorePrezzo × fattoreForma × fattoreAvversario)`, curve di elasticità come dato (`attendance-curves.json`), varianza opzionale piccola via `deriveRng("attendance", fixtureId)`. Ricavo biglietti applicato per-partita (`applyMatchdayRevenue`, separato da `applyMatchReport`). **Abbonamenti** = scommessa estiva: cassa subito scontata vs minore upside per-gara. **Bacino tifosi** = stato persistito dedicato (`ClubSupportState`, fuori da `Club`) a **deriva lenta** verso un target `f(categoria, successi, trofei)`, aggiornato **a fine stagione** con cambio cappato (mensile solo `recentMomentum`); è il tetto dei ricavi e la leva di progressione visibile (K). **Crisi finanziaria = macchina a stadi**: `healthy → strained → wage_delay → transfer_embargo → points_penalty → bankrupt`, transizioni da soglie `(saldo, mesi consecutivi)` come dato (`financial-crisis-config.json`) **con isteresi**; ogni stadio applica solo effetti su **sistemi esistenti** (morale, budget, flag blocco-mercato, penalità punti, fine run). La **penalità punti è stato persistito** (`CompetitionPenalty`): `computeLeagueTable` legge `fixtures.result + competitionPenalties`, **mai alterando i risultati**. `applyMonthlyFinance` gira stipendi, costi strutture, rate, sponsor, diritti TV e valutazione crisi. Sponsor = 2-3 offerte generate da template-dato; budget (ingaggi/mercato/strutture) dal board su ricavi proiettati + ambizione.
**Perché:** stadi discreti > score continuo — la crisi è una storia a tappe che il giocatore vede arrivare, non una barra astratta che collassa di colpo; il tick mensile dà senso a "rosso prolungato"; la `balance-report` (Decisione 12) osserva % club in rosso/falliti e wage-to-revenue perché "l'economia si rompe in silenzio" (Area 22 #3).

### 24. Mercato: valore pubblico, richiesta, cifra finale e anti-exploit
**Decisione:** il mercato è una macchina di **tempo, vincoli economici e volontà sportive**. Il **valore di mercato pubblico** (`playerMarketValue`) è una stima globale deterministica e versionata, guidata soprattutto da abilità corrente, proiezione pubblica `P50`, incertezza, età e ruolo. Non riceve `marketContext`, moltiplicatori o massimi dipendenti da categoria, club proprietario o stato di svincolo; usa una sola coda globale con cap `€150m`. È identico per ogni club osservante, resta non nullo e invariato per uno svincolato, non usa la forma settimanale e non incorpora contratto o pressione del venditore. Il **prezzo richiesto** (`sellerAskingPrice`) parte dal valore pubblico e applica fatti espliciti di contratto, status/necessità di rosa, categoria, pressione finanziaria, desiderio del giocatore e leva negoziale. La **cifra finale** è il fatto concordato e contabilizzato. Per ora il Mercato mostra attributi correnti esatti a una cifra decimale; il potenziale numerico resta nascosto e lo scouting/fog è rinviato a una fase reale, senza `ScoutingKnowledge` fittizia. **Trattativa = macchina a stati persistita avanzata dal calendario** (`TransferNegotiation`, `advanceNegotiations`), **due tavoli** (club: prezzo + formula; poi giocatore + procuratore: ingaggio/durata/bonus/commissione), entrambi possono far saltare il colpo; risposte in giorni-gioco, rilanci e inserimenti di club rivali, **deadline day** che comprime i tempi (tutto deterministico via `deriveRng`). Esiste al massimo una trattativa irrisolta per coppia `(club acquirente, giocatore)` fra le formule supportate. Compratori diversi possono concorrere per lo stesso giocatore in una gara persistita con massimo tre acquirenti attivi; un ritiro prima della scadenza libera il posto e il quarto ingresso attivo fallisce con motivo tipizzato. Il tavolo club e il tavolo giocatore hanno ciascuno una scadenza condivisa fissa di tre giorni, cappata dalla chiusura della finestra applicabile. Fra le offerte ritenute accettabili dal venditore qualificano soltanto la cifra massima e ogni pareggio esatto; le accettabili inferiori diventano `outbid`. Se il manager è il venditore, accettare un'offerta ne registra l'accettabilità ma non chiude il tavolo prima della scadenza. Gli svincolati entrano direttamente nel tavolo giocatore e attendono comunque i tre giorni anche con un solo club. I prestiti restano seriali nella prima release della gara, pur usando contratti discriminati estendibili. Il calciatore sceglie fra le offerte qualificate in base ai termini e alla forza sportiva; un solo vincitore raggiunge il commit atomico. **Formule = strutture di dominio** (`permanent`/`loan` con opzione/obbligo / `free_agent`); la `SellOnClause` (in `BasisPoints`) **persiste** sui diritti economici del giocatore e si liquida alla rivendita futura. **Anti-exploit contropartite** (requisito critico futuro): l'IA accetta sse `valorePubblico(in entrata) + conguaglio + bisognoRuolo(cappato) ≥ valorePubblico(in uscita) × saleReluctance`, con `saleReluctance` moltiplicatore **esplicito** (titolare/giovane-top/simbolo/contratto-lungo → alto; scontento/esubero/scadenza → basso) **più i vincoli budget** (cash, wage budget, rate). `TransferRejectionReason` tipizzato per il feedback UI; eventi di trattativa = dati, mai testo (come `MatchEvent`, Decisione 13); test batch anti-exploit obbligatorio quando le contropartite entrano realmente in scope. **`Persona` unificato** (nome + tendenze leggere) condiviso da procuratori/presidenti/allenatori-IA. **Parametri zero = pilastro del mercato di C**: scadenza contratto → pool svincolati, firma = solo ingaggio + commissione + bonus, cartellino esattamente zero ma valore pubblico preservato.
**Perché:** separare valore, richiesta e cifra finale rende leggibili contratto, pressione e trattativa senza far cambiare il valore dello stesso giocatore da una schermata all'altra. `saleReluctance` esplicita cattura "è il mio capitano, non lo cedo a quel prezzo"; lo scouting potrà in futuro cambiare la precisione dell'informazione, non creare valori oggettivi diversi per osservatore.

### 25. Match-day: motore step-based ripristinabile, due driver
**Decisione:** il match engine è **step-based e ripristinabile**, un solo motore con due driver. `stepMatch(sim, rng) → {sim, rng, events, pause?}` è l'unità minima; `simulateMatch` è il **driver batch** (cicla `stepMatch` fino a fine partita, zero pause — Fase 1); il match-day interattivo (Step 2.3) è il driver **`MatchSession`** che chiama la stessa step-function, si ferma su auto-pause, accetta `MatchCommand`, riprende. `MatchSimulationState` è **serializzabile** per resume e save a metà partita → lo stato RNG del match stream può essere salvato (**eccezione circoscritta** alla regola "zero stato RNG nel save", Decisione 5). **Auto-pause** = condizioni per-minuto (dato + preferenze utente) che spezzano sim e reveal del ticker. **Input giocatore = `MatchCommand`** (sostituzione, cambio 6 leve, discorso 4 toni, cambio modulo [richiede lavagna]), validati nel session layer con `RejectionReason`, applicati allo stato sospeso, **mai su `GameState`**. **Discorsi/istruzioni = modificatori cappati su sistemi esistenti**: morale **temporaneo match-local** (in `MatchSimulationState`) vs persistente (via `MatchPersistentEffects`, cappato) — anti-exploit dei discorsi; effetto dipende da contesto + temperamento. **Statistiche live + pagelle = derivate** dagli eventi-finora (selector, Decisione 13), non salvate per-tick; finali nel `MatchReport`. Velocità ticker = puro rendering. La ri-narrazione dipende dagli eventi salvati, non dai comandi (`commandHistory` opzionale, solo debug/replay).
**Perché:** scrivere `simulateMatch` sopra `stepMatch` dal giorno uno (anche se Fase 1 usa solo il batch) evita di riscrivere il motore al match-day interattivo. Il batch è solo una sessione interattiva senza pause e senza comandi.

### 26. Narrativa/media e presidente: event engine dichiarativo, stampa = narratore
**Decisione:** **event engine dichiarativo** — `EventCard` (dato) = trigger + scelte + effetti **composti da atomi tipizzati** (`Condition`/`Effect`/`Selector`) implementati nel codice. **Il content compone atomi esistenti, mai esegue script** (Area 19); un nuovo atomo richiede codice + schema + test + bilanciamento. È il *come* della legge eventi (Decisione 21): gli effetti toccano solo sistemi esistenti. Anche i selettori sono deterministici (tie-breaker per ID). Eleggibilità valutata sui tick via `deriveRng("event-card", date, clubId, cardId)` + weight + cap; auto-risoluzione IA via `Persona`. **Micro-eventi** (template+slot, corpus LLM-in-build, frequenti) e **schede-storia** (scritte a mano, rare) usano lo **stesso schema**, differiscono per tier/weight/cooldown. **Stampa = NARRATORE su `WorldNewsEvent` strutturati** (riuso del pattern Decisione 13): il motore emette eventi-mondo (risultato, trasferimento, traguardo, crisi, esonero…), il press narrator li rende articoli localizzati/stilizzati; eventi salvati, articoli ri-renderizzati. La stampa è **principalmente output**; l'interazione diretta = rara `EventCard` ad alto impatto. **Presidente = `Persona`** (Decisione 24), parte del profilo club; da lui obiettivi, budget (Decisione 23), interferenze. **`BoardState` = macchina a stadi con isteresi** (`secure → concerned → under_pressure → final_warning → sacked`) guidata da risultati-vs-obiettivi → esonero. Cambio di proprietà = scheda-storia che **sostituisce la `Persona`** presidente. Esonero (board) e crac (finanze, Decisione 23) = **due percorsi distinti di fine-run** (Area 2).
**Perché:** il content può scegliere cosa combinare; solo il codice definisce cosa è possibile fare → modding controllato, determinismo, niente sistemi nuovi via dato. La stampa-come-narratore riusa il pattern eventi-strutturati/narratore: zero testo nel motore, ri-narrazione e localizzazione gratis.

### 27. Carriera manager: due scope di persistenza (run vs profilo)
**Decisione:** la carriera usa **due scope di persistenza**. La run vive in `GameState` (salvata da `GameStorage`, Decisione 14); il **profilo manager vive in `CareerProfile`** (interfaccia `CareerProfileStorage` separata, con **`profileSchemaVersion` e `migrateCareerProfile` distinti** dal save), **cross-run**: identità, background, reputazione globale, archivio run concluse, achievements, hall of fame, flag no-reload. **Ciclo**: a inizio run la reputazione del profilo **semina** `GameState.manager.reputation`; durante la run evolve (risultati, obiettivi, trofei, crisi, narrativa — valorizzando anche "vincere con pochi mezzi", non solo vincere); a fine run l'esito aggiorna il profilo + aggiunge un `RunArchiveEntry`. **Background** = scelta una-tantum data-driven (ex-giocatore carismatico / giovane tattico / dirigente / …), solo **modificatori cappati su sistemi esistenti**, nessun albero di crescita. **Reputazione** = numero visibile cumulativo, guida modificatori cappati su trattative/attrazione-giocatori/pazienza-board/stampa. **Tassonomia fine-run a 4 esiti**, ognuno → epilogo + `RunArchiveEntry` (archiviate **anche le run fallite**, col flag "senza ricaricamenti" come distintivo): `title_won` (completamento, sblocca la sandbox), `sacked` (board, Decisione 26), `bankruptcy` (finanze, Decisione 23), `left_for_big_club` (abbandono volontario, scheda-storia reputation-triggered — bivio reale).
**Perché:** reputazione e archivio attraversano le run → non possono vivere nel save mono-run (sarebbero duplicati/fragili); il profilo separato è necessario. Il save racconta una scalata; il profilo racconta chi sei diventato dopo tutte le scalate.

### 28. Forma tattica e matchup: decisioni causali in un motore aggregato
**Decisione:** The Long Season non clona Football Manager e non simula ventidue agenti autonomi. Conserva un solo motore deterministico per-minuto e separa tre verità: `TeamStrength` = qualità dei giocatori nei ruoli scelti; **profilo tattico intrinseco** = capacità per costruzione, collegamento, progressione centrale/laterale, presenza, pressione, copertura e transizioni; **matchup relazionale** = confronto della propria catena per fasi con pressing/coperture/rest defence avversarie. Linea, famiglia posizione, lato, ruolo canonico e suitability attraversano il seam come union di dominio, mai come stringhe ricostruite da `slotId`. Gli occupanti aggiuntivi hanno rendimento marginale decrescente tramite policy versionata a fasce, senza trascendentali nell'hot path e senza penalità nominate per moduli estremi. La suitability modifica coordinamento/posizionamento/tempi, non applica un secondo moltiplicatore globale sopra i pesi attributo del ruolo di destinazione. Directness, pressing, ampiezza, rischio e mentalità modificano percorsi e trade-off, mai forza grezza. Le occasioni restano aggregate ma seguono un percorso strutturato per fasi; creatore/tiratore/difensore/portiere sono scelti prima dell'esito e contribuiscono in modo cappato, senza pass-chain completa. Pre-match, live, AI e batch usano lo stesso builder; un cambio al minuto completato `N` vale da `N+1`. Engine/domain emettono fatti strutturati; la UI mostra poche conseguenze qualitative, non formule o la soluzione ottima.
**Gerarchia qualità-struttura:** a qualità uguale una forma coerente ha un vantaggio materiale ma limitato; una grave incoerenza può ribaltare soltanto un vantaggio qualitativo modesto; una title contender di Prima Divisione resta favorita in aggregato contro una squadra di metà classifica di Terza anche usando `3-1-6` contro un `4-4-2` coerente, pur lasciando possibili singoli upset. Questa gerarchia riceve seed accoppiati e bande numeriche prima dei coefficienti e deve passare quando il nuovo route model diventa canonico, non per la prima volta nel long run.
**Perché:** oggi ogni reparto non vuoto è una media, quindi a qualità uniforme un `3-1-6` è indistinguibile da un `4-4-2`. Il manager deve poter assumere rischi e creare vantaggi reali, ma il costo deve emergere da collegamenti, saturazione, coperture e matchup, non da bonus/malus arbitrari o risultato scriptato.

### Legge del determinismo (trasversale)
Il seed da solo non basta. Il determinismo si ottiene controllando **tutti** questi assi insieme:

> **seed + tempo canonico (epoch-day) + ID stabili + ordine d'iterazione esplicito + `sort` con tie-breaker + RNG a sub-stream isolati per chiave + matematica controllata nell'hot-path (niente trascendentali).**

### Nuovi file di dato introdotti (cartella `content/balance/`)
Estensione della mappa di Sezione J, tutti validati Zod/Valibot e versionati:
- `role-weights.json` — pesi attributo→ruolo e pesi reparto→overall, con profili per variante di ruolo (Decisioni 8, 19)
- `generation-config.json` + `player-archetypes.json` — forma della lega e profili di ruolo (Decisione 10)
- `match-engine-config.json` — rate occasioni, conversione, fattore campo, cap tattici (Decisione 7)
- `match-tactics-calibration.json` — contributi tipati per fase/canale, rendimenti marginali a fasce, suitability di coordinamento e matchup route policy (Decisione 28)
- `calibration-targets.json` — benchmark aggregati per categoria con bande (Decisione 12)
- `player-state-curves.json` — curve moltiplicatore di fitness/form/morale (Decisione 17)
- `save-retention-config.json` — politica di ritenzione dei `MatchReport` per detail level (Decisione 14)
- `growth-curves.json` — curve età/`growthType`, cap mensili, fattori minutaggio/allenamento/personalità (Decisione 21)
- `staff-effect-curves.json` — curve `rating→moltiplicatore` per dominio di ogni ruolo staff (Decisione 20)
- `facility-effect-curves.json` — curve livello-struttura→moltiplicatore (Decisione 22)
- `category-infrastructure-requirements.json` — requisiti minimi di struttura per categoria (Decisione 22)
- `attendance-curves.json` — elasticità prezzo + fattori forma/avversario per l'affluenza (Decisione 23)
- `fan-base-config.json` — target e cap di deriva del bacino tifosi (Decisione 23)
- `financial-crisis-config.json` — soglie e isteresi degli stadi di crisi (Decisione 23)
- `sponsor-templates.json` — template delle offerte sponsor (Decisione 23)
- `player-rating-scale.json` — soglie globali `1..6`, mezze stelle e budget di rarità corrente/potenziale (Decisioni 6, 10, 24)
- `player-market-calibration.json` — snapshot aggregato, datato e versionato di mediane/P90/P99/massimi per categoria; nessuna identità o dipendenza live (Decisioni 12, 24)
- `valuation-curves.json` — curve di valore pubblico (abilità/potenziale/età/ruolo/contesto) e compressione della coda alta (Decisione 24)
- `asking-price-curves.json` — fattori espliciti valore→richiesta per contratto, status e pressione del venditore (Decisione 24)
- `market-behavior-calibration.json` — coefficienti di game design versionati per volontà sportiva, affordability e selezione target IA; separati dallo snapshot osservato dei valori (Decisione 24)
- `wage-finance-calibration.json` — benchmark stipendi/budget da fonti distinte e versionate, mai inferiti dai valori Transfermarkt (Decisioni 23, 24)
- `agent-personas.json` — archetipi e tendenze del modello `Persona` (Decisione 24)
- `team-talk-effects.json` — effetti cappati dei 4 toni di discorso per contesto/temperamento (Decisione 25)
- `manager-backgrounds.json` — background del manager e relativi modificatori passivi (Decisione 27)

Le versioni di questi file (`roleWeightsVersion`, `generationConfigVersion`, `matchEngineConfigVersion`, `calibrationTargetsVersion`, `playerRatingScaleVersion`, `playerMarketCalibrationVersion`, `valuationCurvesVersion`, `askingPriceCurvesVersion`, `marketBehaviorCalibrationVersion`, `wageFinanceCalibrationVersion`, `playerStateCurvesVersion`, `rngAlgorithmVersion`, oltre a `topologyDecisionId`, `eventSchemaVersion` e `saveSchemaVersion`) sono tracciate in `GameMeta`/nei report batch e nel save, perché cambiarle sposta le distribuzioni o richiede migrazione.

Altri pezzi nuovi fuori da `content/balance/`: schede evento in `content/events/` (es. `youth-events.json`, Decisione 21); nuovi value-object in `domain` (`Money`, `BasisPoints`, `GameDate`) e nuove entità/stati (`Formation`, `ClubTacticalSetup`/`MatchLineup`, `StaffMember`/`Scout`, `ScoutingKnowledge`, `ClubFacilities`, `LoanAgreement`, `PlayerDynamicState`, `formationFamiliarity`, `ClubFinances`, `ClubSupportState`, `CompetitionPenalty`, `SponsorDeal`, `TransferNegotiation`, `TransferFormula`, `SellOnClause`, `PlayerContract`, `Persona`, `MatchSession`/`MatchCommand`, `EventCard`/`Trigger`/`Condition`/`Effect`, `WorldNewsEvent`, `BoardState`/`ClubOwnership`, `CareerProfile`/`RunArchiveEntry`, `ManagerBackground`); interfaccia `CareerProfileStorage` separata da `GameStorage` (profilo cross-run, Decisione 27); schema Zod di `MatchEvent`/save in `storage/schemas` (mai in `domain`); configurazione di `dependency-cruiser` ed ESLint mirato che impongono il contratto e le leggi del determinismo (Decisione 16).

### Stato del grilling e TODO
Decisioni 1-27 = tutte le aree-motore sviscerate (engine core, i cinque sistemi gestionali, mercato, match-day, narrativa/media+presidente, carriera manager). Le seguenti aree restano da grigliare **dopo**: non bloccano la Fase 0-2 e costruiscono su pattern già fissati.

- **TODO grill — Area 17 (UI/UX), Fase 2.2.** Il lato visivo (palette navy/crema, font pixel, densità CM, righe alternate) è design già deciso. Resta il **contratto UI↔motore**: flusso snapshot/selettori sul confine Worker/Comlink (Decisione 9), Zustand come cache del solo snapshot corrente, split comando/query (query = selettori, comandi = use-cases di Decisione 15), e il **"Continua" come `advanceUntilAttention`** — gemello a livello carriera del loop `stepMatch`+auto-pause (Decisione 25), con stop-condition come dato (inclusa la leva K "una cosa in sospeso"). Da grigliare quando si costruisce il guscio UI.
- **TODO grill — Area 18 (onboarding/demo), Fase 3.** Tutorial scriptato, confini demo, export save demo→completo. Nessun fork engine.
- **TODO grill — Area 20 (localizzazione), Fase 3.** Il nucleo architetturale è **già fissato** (il motore emette eventi strutturati, il narratore traduce — Decisioni 13, 26): resta solo il modello dei locale-pack/dizionari come content.
- **TODO grill — Area 21 (business/IP).** La policy IP è già scritta (Area 21); è decisione di prodotto/legale, non engine — niente da grigliare per il codice.

Prossimo passo: codice. Ordine operativo reale: scheletro → domain → enforcement (vedi checklist).

### Primo commit — checklist esecutiva
Lo scheletro precede il riempimento di `domain`. Sequenza:
1. **Scheletro**: `pnpm-workspace.yaml`, `package.json` root (scripts `test`/`lint`/`depcruise`/`check`/`cli`), `tsconfig.base.json`, alias `@game/*`; package vuoti `domain`, `shared`, `engine`, `content`, `storage` + `apps/cli`.
2. **Shared**: `shared/src/rng/sfc32.ts` + `derive-rng.ts`; `shared/src/date-utils.ts` (`fromISO`/`toISO`/`addDays`/`diffDays`, puri, no `Date`).
3. **Domain types**: `domain/src/types/ids.ts` (branded + namespace unico `type:value`: `player:...`, `club:...`, `competition:...`, `fixture:...`, `season:...`, `save:...`), `value-objects/game-date.ts` (epoch-day), `value-objects/money.ts` (+ `BasisPoints`), `value-objects/rating.ts` (`AbilityValue`).
4. **Domain entità/stato**: `entities/player.entity.ts`, `entities/club.entity.ts`; `state/game-state.ts` (Record-lookup + array di ID + `calendar` date-first).
5. **Storage**: `storage/src/game-storage.interface.ts` + `json-game-storage.ts` (basta per i dump di debug di Fase 1).
6. **CLI**: `apps/cli/src/index.ts` + `commands/doctor.ts`.
7. **Enforcement**: `.dependency-cruiser.cjs` (DAG dei package), ESLint scoped `engine` (no `Math.random`/`Date`/`crypto.randomUUID`/`performance.now`), vitest.
8. **Gate**: `pnpm check` (lint + depcruise + test) verde + `pnpm cli doctor`.

Primi test obbligatori: roundtrip `fromISO`/`toISO` (incl. bisestile `2000-02-29`, leap-rule `1900`/`2100`); `deriveRng(seed, key)` → stessa sequenza sempre + chiavi diverse → sequenze diverse; `money()` rifiuta float e non-safe-integer; un import proibito (`storage → engine`) fa fallire `depcruise`.

---

## K. Leve di ritenzione — il "non smettere"

Premessa: il "ancora una partita" non nasce dalla grafica ma da poche molle psicologiche. Quasi tutte sono già decise nelle aree precedenti; questa sezione le **nomina e le ordina per priorità**, non aggiunge sistemi (vale la ghigliottina della sezione H). Ordine di priorità scelto: **progressione → attaccamento → tensione → cliffhanger**. Le micro-feature mancanti sono marcate ⊕ e sono di rifinitura, non nuovi sistemi.

**Avvertenza di fase (importante):** la molla #1, la progressione visibile, **non è validabile dal prototipo CLI** — una classifica in CSV non fa "salire i numeri davanti agli occhi". Il prototipo-verità (Fase 1) valida il *motore* (partite tese, stagioni che generano storie); progressione e attaccamento si potranno sentire solo in Fase 2 con la UI. Non bocciare la CLI perché "non attacca": non è il suo compito.

### 1. Progressione visibile (la molla primaria)
Il club che cresce nel tempo dev'essere *visto*, non solo calcolato.
- Traguardi celebrati con epiloghi parziali e achievement (Area 2): promozioni, prima salvezza, prima europea. Ogni traguardo è un picco di ricompensa.
- Lo stadio e le strutture che si ampliano a vista (Area 10): la capienza che sale, l'organigramma che si riempie — la scalata vista da dietro le quinte.
- Il bacino tifosi che cresce lentamente con i successi (Area 11): un numero-tetto che sale di stagione in stagione e che *senti* tuo.
- ⊕ **Timeline/storia del club**: una schermata-archivio che mostra la parabola della run (campionati, traguardi, record) come una linea che sale. Costa poco (legge dati già salvati), ripaga molto: è la progressione resa immagine.
- ⊕ **Confronto "allora vs ora"**: rosa, bilancio, stadio di tre stagioni fa accanto a oggi. La crescita diventa innegabile.

### 2. Attaccamento — "i miei giocatori" (la molla emotiva)
Il giocatore-riga-di-tabella deve diventare persona.
- Fog of war e duelli nominali (Aree 3, 13): il mediano pagato due lire che si rivela, il colpevole del gol emergono dal gioco — sono già macchine da storie.
- Il gioiellino del vivaio cresciuto in casa (Area 9), il legame col bacino del posto, le storie narrative dei giovani.
- Personalità a 3 assi visibili (Area 3): il senatore, l'ambizioso, il volatile — comportamenti riconoscibili.
- ⊕ **Scheda-giocatore con memoria**: ogni giocatore tiene la sua piccola storia nel club (presenze, gol, momenti — "ha segnato il gol promozione nel 2029"). Legge eventi già registrati dal motore; trasforma l'attaccamento in un artefatto visibile. È l'innesto di ritenzione col miglior rapporto valore/costo.

### 3. Tensione — il rischio che brucia (la spezia)
La posta in gioco rende dolci le vittorie.
- Esonero e crac finanziario chiudono la run (Aree 2, 11): la sconfitta è reale, quindi la sopravvivenza ha sapore.
- Deadline day, scelte difficili (vendo il gioiellino?), playoff fedeli (Aree 14, 4).
- Auto-pause coi beat di suspense, gol dagli altri campi all'ultima giornata (Area 12).
- Archivio che conserva anche le run fallite e il flag "senza ricaricamenti" (Area 2): la sfida personale come ritenzione a lungo termine.

### 4. Cliffhanger continuo (il collante tra le sessioni)
Ogni momento deve aprirne un altro, perché si chiuda il portatile un turno dopo del previsto.
- Il bottone Continua come battito (Area 17): la prossima partita è sempre a un clic.
- ⊕ **"Una cosa in sospeso" prima di ogni stop naturale**: alla fine di una giornata, il gioco mette in evidenza un gancio aperto (una trattativa in scadenza domani, un rientro dall'infortunio, un giovane pronto all'esordio, lo scontro diretto in arrivo). Non un popup invadente: una riga nella schermata Continua. È la tecnica del "next episode" applicata al turn-based.
- I traguardi parziali (Area 2) come ami: "ti manca un punto per la promozione matematica" prima dell'ultima giornata.

### Sintesi operativa
Le leve esistono già nei sistemi; il lavoro è **implementarle in modo che si vedano e si sentano**, non aggiungerne. Gli innesti ⊕ sono micro-feature (timeline del club, scheda-giocatore con memoria, "una cosa in sospeso") che leggono dati già prodotti dal motore — vanno in Fase 2.4D o dopo, mai prima che il ciclo base diverta. Priorità di implementazione = ordine della classifica: prima si cura la progressione visibile, poi l'attaccamento, poi tensione e cliffhanger.

---

## L. Direzione d'arte — "retro ma premium"

"Retro premium" non è un aggettivo, è una disciplina: l'estetica d'epoca (CM 01/02, Area 17) eseguita con la cura materiale di un prodotto moderno. Il riferimento scelto è il **Televideo lussuoso**: monospace e tabelle dense come allora, ma materico, curato, premium. Il premium passa anche da micro-animazioni, suono e feedback tattile.

### Principi
- **Il dato è il protagonista, la cornice lo serve.** Densità informativa alta (è un pregio del genere), ma con gerarchia tipografica impeccabile: pesi, spaziature, allineamenti delle colonne curati al pixel. Il "lusso" qui è la leggibilità perfetta di una tabella fitta.
- **Palette ristretta e materica.** Navy e crema (Area 17) come base, righe alternate, un solo accento per gli stati (verde/ambra/rosso per morale e finanze). Niente arcobaleni: il premium è il rigore cromatico.
- **Tipografia come identità.** Font pixel d'epoca come default purista (Area 17), ma disegnato/scelto per essere nitido sui display moderni; titoli e numeri-chiave (il "GOL!", il punteggio) possono avere un trattamento iconico. L'opzione leggibilità resta per accessibilità.
- **Texture sottile, mai sporca.** Un velo di "carta" o "fosforo" appena percettibile dà calore materico senza compromettere la lettura. È la differenza tra "vecchio" e "vintage curato".

### Movimento e feedback (il premium che si sente)
- **Micro-animazioni funzionali, non decorative.** Il numero che incrementa contando, la riga che evidenzia all'hover, la classifica che si riordina con una transizione breve quando cambi giornata, il badge del tratto che "si accende" schierando il giocatore nel ruolo giusto (Area 3). Ogni animazione comunica un cambiamento di stato, non si esibisce.
- **Suono diegetico e parco.** Il tac dei tasti, un brusio di stadio che sale sull'occasione, un segnale sobrio sul gol, il fruscio della pagina che cambia. Mai musica invadente in un gioco di concentrazione; il suono è feedback, non colonna sonora costante. Tutto disattivabile.
- **Feedback tattile premium.** Reattività immediata di ogni clic (zero lag percepito grazie a Worker/snapshot, Area 22), stati hover/active sempre presenti, il bottone Continua che "risponde". Il lusso è che nulla è mai lento o muto.

### Coerenza col resto
- Vincoli tecnici già fissati (Area 17): desktop-first, navigazione a schede + Continua, font pixel, palette CM, scorciatoie da tastiera. La direzione d'arte li riveste, non li contraddice.
- **Disciplina di scope:** la grafica premium è Fase 2.2+ (guscio UI) e si rifinisce in Fase 3. Nel prototipo (Fase 0–1) l'estetica è irrilevante — un log testuale grezzo basta. Investire nell'arte prima che il loop diverta sarebbe vestire bene un gioco che non prende (sezione H).
- **La grafica è moltiplicatore, non fonte.** Amplifica le leve della sezione K: la progressione si *vede* meglio con un'animazione che conta i numeri; l'attaccamento cresce con una scheda-giocatore bella; la tensione sale con un beat sonoro sul rigore. Ma su un loop spento non salva nulla — i vecchi CM erano bruttissimi e creavano dipendenza. Prima il loop, poi il lusso.

---

## Appendice — Spunti emersi nel brainstorm (non vincolanti)

Scalata dalla terza serie come modalità identitaria · estetica CM 01/02 · offline puro senza account · vendita una tantum ~€9.99 (Steam via Tauri + sito con MoR) con demo browser gratuita · nomi procedurali + import community per i nomi reali · attributi 0–20 · fog of war a 4 livelli · tratti condizionali come schede dati ("Difesa impenetrabile") · tutto-è-content-pack, niente scripting · LLM come fabbrica di contenuti in build, non a runtime · requisiti infrastrutturali per categoria · penalizzazioni punti · prezzo biglietti con elasticità · React 19 + Vite, motore TS puro in Web Worker, SQLite WASM.
