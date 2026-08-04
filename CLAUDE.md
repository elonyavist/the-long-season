## graphify

`graphify-out/` holds an AST knowledge graph of this repo's code. A
`post-commit` hook rebuilds it locally at no API cost, and the directory is
git-ignored, so none of it is ever committed.

These rules replace the generic ones `graphify install` writes. They come from
measurements on this corpus, and `graphify install` overwrites this file - if
generic rules come back, restore these.

- `graphify explain "<symbol>"` first, whenever you know the name. It returns
  the node with every typed edge, callers and callees together, each with
  `file:line`, for about twice the cost of one `grep` and a twentieth of the
  file. `graphify path "<A>" "<B>"` for how two things connect.
- `graphify affected "<symbol>" --depth 2` before editing anything shared. It
  answers what else must change, which `grep` cannot, and it is the machine-made
  first draft of a step's `Expected Files`.
- `graphify query "<question>"` only when no symbol name is known. On this
  corpus its natural-language traversal returns hundreds to thousands of nodes
  and truncates to a handful, mixing UI and i18n into engine questions; asked
  which function generates players it surfaced one of three callers, not the
  factory. Treat its output as a lead to feed `explain`, never as an answer.
- `affected` and `explain` name importers and edges, not intent. Read the file
  before calling anything they list a defect: two calibration fixtures import
  the same type, and one of them must deliberately *not* track shipped numbers.
- Run `graphify update .` before querying code that changed but is not yet
  committed. The hook only covers what is already in a commit.
- The graph is built `--code-only`, so no document is in it, and eight shipped
  balance calibrations are missing outright. See the blind-spot section of
  `.claude/skills/graphify/SKILL.md`. Graph silence is never evidence.
