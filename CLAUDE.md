# Koko Run — project conventions

- **Language: everything in this repository must be in English** — README and
  all documentation, code comments, commit messages, in-game text, UI strings,
  and any other materials. This applies regardless of the language used in
  chat instructions.
- **Requirements tracking: `REQUIREMENTS.md` collects every requirement the
  project owner states** (usually via chat instructions). Whenever a new
  requirement arrives or an existing one changes, update `REQUIREMENTS.md` in
  the same change set — it must always give a complete, current overview of
  the requirements. IDs (R1, R2, …) are stable and never reused.
- **Backlog: `BACKLOG.md` collects ideas, feature wishes, and bug reports that
  are not implemented yet.** New ideas or bug reports from the project owner
  go in there with a fresh, never-reused ID (B1, B2, …). When an item is
  implemented, move it to the *Done* section; an implemented feature also
  gets a new requirement in `REQUIREMENTS.md`.
- **Assume you are never alone in this repository.** Other agents and people
  work on it at the same time, so the local checkout is stale more often than
  not. Three rules follow from that:
  1. Before choosing a new `R` or `B` ID, fetch and read the published files,
     not the working copy: `git fetch origin main`, then take the next free ID
     from `git show origin/main:REQUIREMENTS.md` and
     `git show origin/main:BACKLOG.md`.
  2. Merge `origin/main` into the branch before every push, and never
     force-push — a rejected push means someone else got there first, and
     their work is to be merged, not overwritten.
  3. If two branches picked the same ID anyway, the one that reached `main`
     first keeps it. The later one is renumbered — in `REQUIREMENTS.md` or
     `BACKLOG.md`, and in every reference to it, including code comments and
     the other of the two files.
- All graphics are generated at runtime (`src/scenes/BootScene.ts`); do not
  add binary image assets except the PWA icons in `public/`, which are
  generated via `npm run icons` (`scripts/generate-icons.mjs`).
- Levels are ASCII maps in `src/levels.ts` — one character per 32px tile;
  keep rows aligned.
- `npm run build` runs the TypeScript check (strict) plus the Vite build and
  must pass before pushing.
