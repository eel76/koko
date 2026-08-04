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
- All graphics are generated at runtime (`src/scenes/BootScene.ts`); do not
  add binary image assets except the PWA icons in `public/`, which are
  generated via `npm run icons` (`scripts/generate-icons.mjs`).
- Levels are ASCII maps in `src/levels.ts` — one character per 32px tile;
  keep rows aligned.
- `npm run build` runs the TypeScript check (strict) plus the Vite build and
  must pass before pushing.
