# Step 06B - Checkpoint L1: 100 Worlds x 10 Seasons League Diversity

## Status

`REFINE` recorded on `2026-08-08`; the main cohort is deliberately stopped.
Step 06A is Done and the checkpoint implementation is green. This checkpoint
is observational: it adds report facts and a locked profile but changes no
gameplay behaviour. Step 06B1 now owns the availability/workload correction;
Checkpoint B2 remains closed until the repeated L1 records `GO`.

## Goal

Prove that the club role constructions introduced by Step 06A remain visible
and credible over ten career seasons, rather than looking diverse only on the
opening day and collapsing after transfers, development, aging and weekly AI
selection.

The full population is exactly `100` worlds x `10` seasons, executed with
exactly `7` workers. The same canonical artifact must also produce a
human-readable English desktop HTML report so the project owner can inspect
tables, players and stories directly.

## Product Question

The automatic gate asks whether formation and role diversity remain structurally
healthy. The HTML answers the complementary human question:

> Do these one thousand world-seasons look like varied, credible football
> careers when I inspect standings, scorers, assists, transfers, squads and
> tactical choices?

Neither answer substitutes for the other. A plausible-looking HTML page cannot
turn a failed invariant green, and a green aggregate cannot prove the individual
worlds are enjoyable to browse.

## Locked Population Before Step 06A Output

Two immutable profiles use the same producers, sections and rendering path:

| Profile | Worlds | Seasons | Workers | Purpose |
|---|---:|---:|---:|---|
| `phase81a-league-diversity-canary-7x10` | `7` | `10` | exactly `7` | throughput, memory, checkpoints, report shape and HTML preflight |
| `phase81a-league-diversity-100x10` | `100` | `10` | exactly `7` | checkpoint evidence and consultable final view |

The canary never counts toward the final sample. Its seeds are disjoint from the
main profile and are written before execution. Neither profile accepts worlds,
seasons, include, seed or worker overrides; worker count is execution metadata
and cannot alter ordering, facts or hashes.

A wall-clock budget is derived from the canary's **actual canonical path**,
including career progression, transfer windows, AI team selection, checkpoint
writes and all requested sections. The budget is planning evidence, not a reason
to shrink the frozen `100 x 10` corpus after output.

## Canonical Report Contract

The locked profiles compose the existing modular sections:

- `season`;
- `standings`;
- `players`;
- `transfers`;
- `formations`;
- `economy`;
- `development`;
- `anomalies`.

The formation section is deepened only where necessary to expose facts already
owned by played fixtures and selected lineups:

- formation and tactical distribution actually fielded by club and season;
- `lateralFocus: not_observed` until a career match actually consumes that
  input. The current match loop owns an internal balanced default, but the
  career selection contract does not yet choose or retain it; reconstructing
  `balanced` here would turn missing evidence into a false observed fact;
- selection source, with fallback count;
- per-competition formation concentration and replicated choices;
- per-competition primary-role population and club role-depth warnings;
- opening squad-identity assignment, read from the canonical Step 06A owner;
- changes in formation usage across the ten seasons.

Do not reconstruct formations from final squads, infer transfers from final
ownership, or re-derive player ages. Read fielded lineups, canonical transfer
history and the existing completed-age accessor. IDs own identity; names are
presentation only.

The report also retains, per world and season:

- complete league tables with points, wins, draws, losses, goals for/against and
  goal difference;
- top scorers and assist providers with stable player ID, name, completed age
  and primary role;
- transfer arrivals/departures and fees where the canonical history records
  them. Transfer rows capture buyer and seller competition at the season
  boundary where the move happened, rather than reconstructing a later division
  from the final world. Canonical integer minor units remain unchanged in JSON;
  the private English HTML presents those columns as euro amounts;
- economy, development and anomaly summaries already owned by their modules.

The profile uses section-specific retained depth, frozen before the main run
after the canary exposed the real artifact footprint. Standings and formations
are complete; player tables retain the top `10` scorers and top `10` assist
providers per competition-season; transfers retain every canonical history
entry so the largest move in any selected season cannot disappear; economy and
development retain their existing summary projections; anomalies remain
complete. The first canary's uniform `standard` projection produced a `72 MB`
HTML artifact for only seven worlds and would have extrapolated to a personal
view close to `1 GB`. This retention correction changes no simulation, fact
producer, gate, seed or threshold and is rerun on the same locked canary before
the main cohort.

Every total reconciles against canonical source facts and fails closed on a
mismatch. `not_observed` and `not_evaluated` remain explicit; zero is never
used to mean missing.

## Canary Outcome And Main-Run Stop

The rerun of the locked `7 x 10` canary completed on `2026-08-08` with exactly
seven workers and produced `210` competition-seasons. Its automatic decision is
`REFINE`: `fourReplicatedFormationRetentionShare=0.8666666666666667` against the
frozen `0.95` target. The `100 x 10` run was started only after the artifact-size
correction, then deliberately interrupted after the owner found a separate
longitudinal credibility anomaly in the canary. Its `35` completed shards are
recoverable operational checkpoints, **not evidence**, and are not interpreted.

The player-table finding is material and starts after roughly seasons `3-4`.
Across the canary's retained top-ten tables, the share aged at least `33` moves
from `0.0%` to `86.4%` for scorers and from `0.7%` to `76.5%` for assist
providers between seasons `1` and `10`. Every retained `33+` top performer has
exactly `34` appearances and `3060` minutes. Code inspection found that the
batch season applies match fitness but does not carry match injury/suspension
consequences into later fixtures; with the default `8` match cost and `5` daily
recovery, a weekly starter also returns to full fitness before the next date.
The main cohort therefore stays stopped. These are findings to be attributed by
a preregistered lifecycle checkpoint, never coefficients to tune inside this
observational step.

The complete outcome, real-football reference and code attribution are in
[`PHASE_81A_CHECKPOINT_L1_LEAGUE_DIVERSITY_100X10.md`](../../audits/PHASE_81A_CHECKPOINT_L1_LEAGUE_DIVERSITY_100X10.md).

Verification on the stopped-main code state: `pnpm check` exit `0`, `295` test
files / `2245` tests, `858` modules with no dependency violation, all four
custom checks green; `git diff --check` clean. The next action is Step 06B1,
then the exact locked canary is rerun and a fresh HTML is delivered for review.

## Frozen Longitudinal Gates

### Opening population

Every competition in every main-profile world must pass all Step 06A gates:
balanced identity counts, all ten primary roles, catalog-order invariance, no
out-of-position selected slots, at least six selected shapes, at least four
shapes used by two or more clubs, top formation share at most `0.30`, and at
least six distinct modal shapes across identities.

### Ten-season persistence

Across the `100 x 10` main population:

- selection fallback count is exactly `0`;
- every played fixture records its real selection source;
- at least `95%` of competition-seasons retain at least six selected
  formations;
- at least `95%` retain at least four formations used by two or more clubs;
- at least `95%` keep top formation share `<= 0.30`;
- at least `95%` contain all ten primary roles in the senior population;
- no single formation exceeds `0.50` in any competition-season;
- reconciliation failures, non-finite metrics and missing stable IDs are all
  exactly `0`;
- running from checkpoints and running uninterrupted produce byte-identical
  canonical JSON for the declared canary reproduction.

The `95%` rule allows believable individual transfer-era convergence while
rejecting a systemic return to monoculture. The absolute `0.50` ceiling catches
a severe single-league collapse that an aggregate rate could hide. These
thresholds are frozen before the Step 06A population is implemented and are not
changed after inspecting the HTML.

### Human inspection, never a hidden numeric gate

Before deciding, inspect preregistered examples rather than choosing interesting
worlds after output:

- worlds `00001`, `00050` and `00100`;
- seasons `1`, `5` and `10` in each;
- the champion, bottom club, leading scorer, leading assist provider and largest
  recorded transfer in each selected season;
- formation and role-distribution panels for those same competition-seasons.

The audit records observations as plausible, suspicious or outside current
scope. Human notes cannot change automatic GO/REFINE/STOP arithmetic.

## HTML Output

Simulation writes the canonical JSON first:

```bash
pnpm cli simulation-report \
  --profile=phase81a-league-diversity-100x10 \
  --workers=7 \
  --format=json \
  --report-output=simulation-out/phase81a-league-diversity-100x10.json
```

The consultable view is rendered from that artifact without simulation or gate
re-evaluation:

```bash
pnpm cli simulation-report \
  --from-report=simulation-out/phase81a-league-diversity-100x10.json \
  --format=html \
  --report-output=simulation-out/phase81a-league-diversity-100x10.html
```

The HTML is intentionally English, desktop-only and local, as explicitly
accepted by the product owner. It reuses the existing report renderer and its
world/season selectors. This step does not add responsive or accessibility
scope. It must embed the canonical facts and rebuild byte-identically from the
same JSON.

Checkpoints use `saves/long-run-checkpoints/phase81a-league-diversity-100x10/`;
final JSON and HTML use `simulation-out/`. Both paths are already ignored. No
artifact enters version control.

## Decision

- **GO:** automatic opening and longitudinal gates pass, reconciliation and
  deterministic rebuild pass, the preregistered HTML sample is inspected and no
  engine-critical contradiction remains. Step 06C opens.
- **REFINE:** role or formation diversity degrades with a local owner; reopen
  only Step 06A, retain the population and targets, then rerun canary and L1.
- **STOP / RETHINK:** long-run careers systematically converge despite correct
  opening assignments, or canonical facts cannot be reconciled without a second
  simulator.
- **OUTSIDE_SCOPE:** a human finding belongs to transfers, economy, development
  or another named future phase and does not falsify the diversity gate. It is
  recorded with an owner and never silently counted as GO.

## Expected Files

- `docs/audits/PHASE_81A_CHECKPOINT_L1_LEAGUE_DIVERSITY_100X10.md` **(new)**
- `docs/audits/README.md`
- `apps/cli/src/commands/simulation-report/report-registry.ts`
- `apps/cli/src/commands/simulation-report/report-planner.test.ts`
- `apps/cli/src/commands/simulation-report/career-sections.ts`
- `apps/cli/src/commands/simulation-report/career-sections.test.ts`
- `apps/cli/src/commands/simulation-report/career-world-facts.ts`
- `apps/cli/src/commands/simulation-report/career-world-facts.test.ts`
- `apps/cli/src/commands/simulation-report/report-html.ts`
- `apps/cli/src/commands/simulation-report/report-html.test.ts`
- `apps/cli/src/commands/simulation-report/long-run-profile-checkpoints.ts`
- `apps/cli/src/commands/simulation-report/long-run-profile-checkpoints.test.ts`
- `packages/engine/src/use-cases/simulate-season.ts` and
  `packages/engine/src/use-cases/simulate-season.test.ts`. The fielded-team fact
  currently retains the selected lineup, shape and source but drops the exact
  tactical distribution and catalog-choice diagnostics consumed at kickoff.
  Step 06B retains those existing facts without changing match behaviour.
- `packages/engine/src/index.ts`. The report reuses the canonical exported
  squad-structure assessment instead of copying its department floors.
- `packages/simulation-tools/src/tactical-agency/tactical-agency-audit.ts` and
  `packages/simulation-tools/src/tactical-agency/tactical-agency-audit.test.ts`.
  A2 and L1 read the same out-of-position rule; the existing private reader is
  promoted rather than reimplemented in the CLI.
- `packages/simulation-tools/src/season-recap/season-recap.test.ts`. Its manual
  fielded-team fixture must provide the now-retained kickoff tactical
  distribution. The production field stays required: making it optional to
  spare a fixture would allow the checkpoint to lose the fact silently.
- `packages/simulation-tools/src/index.ts`
- `packages/i18n/src/labels.ts`. Profile discovery remains localized even
  though the explicitly private HTML artifact is English.
- `docs/PROJECT_STATUS.md`
- this step document
- `06b1-canonical-season-availability-and-workload.md` **(new)**. The canary's
  player-lifecycle finding needs a named remediation owner before any gameplay
  file may change; this next-step contract is written from the inspected code
  and frozen canary evidence, not invented during implementation.
- `06c-checkpoint-b2-conditioned-tactical-ceiling.md`
- `README.md`

Any additional file exposed by Graphify or a real failing golden is added here
with its ownership reason before editing. Superseded report helpers, fixtures,
keys or formatters are removed in the same step; no dead compatibility path
survives.

## Required Checks

Run the canary and main gate alone, never beside `pnpm check`:

```bash
nvm use 24
pnpm cli simulation-report --profile=phase81a-league-diversity-canary-7x10 --workers=7 --format=json --report-output=simulation-out/phase81a-league-diversity-canary-7x10.json
pnpm cli simulation-report --profile=phase81a-league-diversity-100x10 --workers=7 --format=json --report-output=simulation-out/phase81a-league-diversity-100x10.json
pnpm cli simulation-report --from-report=simulation-out/phase81a-league-diversity-100x10.json --format=html --report-output=simulation-out/phase81a-league-diversity-100x10.html
pnpm check
git diff --check
graphify update .
```

Capture the real exit code of each profile without a pipe. The canary freezes
the expected wall clock before the main run; a timeout records a budget finding
and does not authorize a smaller corpus.

## Definition Of Done

The exact `100 x 10` population completed with seven workers and resumable
checkpoints; all canonical reconciliations and frozen longitudinal gates have a
recorded decision; the same JSON deterministically rebuilds the English desktop
HTML; the preregistered worlds/seasons were inspected; the audit names findings
and owners; no second report path or dead code exists; and only a real `GO`
opens Step 06C.
