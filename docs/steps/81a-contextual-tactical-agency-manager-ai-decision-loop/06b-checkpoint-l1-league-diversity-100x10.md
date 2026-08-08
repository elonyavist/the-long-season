# Step 06B - Checkpoint L1: 100 Worlds x 10 Seasons League Diversity

## Status

Ready and authorized. Step 06A is Done and `pnpm check` is green. This
checkpoint is observational: it adds report facts and a locked profile but
changes no gameplay behaviour. Checkpoint B2 moves to Step 06C and remains
closed until L1 records `GO`.

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

- formation, tactic profile and lateral focus actually fielded by club and
  season;
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
  them;
- economy, development and anomaly summaries already owned by their modules.

Every total reconciles against canonical source facts and fails closed on a
mismatch. `not_observed` and `not_evaluated` remain explicit; zero is never
used to mean missing.

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
- `apps/cli/src/commands/simulation-report/report-registry.test.ts`
- `apps/cli/src/commands/simulation-report/report-planner.test.ts`
- `apps/cli/src/commands/simulation-report/career-sections.ts`
- `apps/cli/src/commands/simulation-report/career-sections.test.ts`
- `apps/cli/src/commands/simulation-report/career-world-facts.ts`
- `apps/cli/src/commands/simulation-report/career-world-facts.test.ts`
- `apps/cli/src/commands/simulation-report/report-html.ts`
- `apps/cli/src/commands/simulation-report/report-html.test.ts`
- `apps/cli/src/commands/simulation-report/long-run-profile-checkpoints.ts`
- `apps/cli/src/commands/simulation-report/long-run-profile-checkpoints.test.ts`
- `packages/simulation-tools/src/index.ts`
- `packages/i18n/src/labels.ts`. Profile discovery remains localized even
  though the explicitly private HTML artifact is English.
- `docs/PROJECT_STATUS.md`
- this step document
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
