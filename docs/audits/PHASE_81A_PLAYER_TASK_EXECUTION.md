# Phase 81A Player Task Execution

## Verdict

Implementation accepted; unchanged B2 result gate remains `REFINE`. Real
attributes now decide how well each football task is executed, while department
strength remains byte-identical and no task creates a free global bonus.

## Product Change

Before this step, the same role-weighted scalar fed build-up, pressing,
coverage, box presence and counter threat. A player could be broadly strong or
weak, but his passing, tackling, pace and anticipation could not make him a
different tactical executor once selected.

The canonical lineup pass now derives the unchanged role score used by
`TeamStrength` and one quality per tactical task from the player's real
attributes. Role allocations remain conserved at `42,000` basis points. Each
task's attribute row independently conserves exactly `10,000` basis points and
cannot read goalkeeper attributes. This changes who is good at a task, not how
much football a formation receives for free.

## Reachability

A deterministic generated population contains real player pairs whose ordering
inverts between build-up and central coverage. Engine tests prove distinct
attribute profiles move different tasks and that stripping task facts from the
new evaluation leaves every former `LineupSlotScore` byte-identical.

## Locked Checkpoint

```text
profile: phase81a-b2-downstream-replication
workers: 7
real exit: 1
artifact: simulation-out/phase81a-b2-player-task-execution.json
sha256: c2154e8fdfecf301f74652b94f28d61750b742f3fce3e43961ff4cf7de737073
```

| Fact | Set A | Set B |
| --- | ---: | ---: |
| population | 42/42 | 42/42 |
| phase one | PASS | PASS |
| ubiquity multiple | 3.1971 | 3.1601 |
| optimistic ceiling | +0.02258 | +0.02162 |
| optimistic exposure | -0.01832 | -0.01629 |
| context-free delta | +0.00165 | -0.00196 |
| mean xG-differential range | 0.16429 | 0.14743 |

Against 06C13, xG range rises from `0.15434/0.13221`, but neither response arm
reaches the unchanged `+0.045/-0.045` target. Step 08 owns the remaining
planned lateral execution; target review remains closed until that structural
path is measured.

## Renewal Boundary

No generation count, development rate, aging, selection, minutes or market
policy changed. The integrated canary must still rerun L6.31's green renewal
facts; this step neither proves nor weakens them.
