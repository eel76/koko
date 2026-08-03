# Koko Run — project conventions

- **Language: everything in this repository must be in English** — README and
  all documentation, code comments, commit messages, in-game text, UI strings,
  and any other materials. This applies regardless of the language used in
  chat instructions.
- All graphics are generated at runtime (`src/scenes/BootScene.ts`); do not
  add binary image assets except the PWA icons in `public/`, which are
  generated via `npm run icons` (`scripts/generate-icons.mjs`).
- Levels are ASCII maps in `src/levels.ts` — one character per 32px tile;
  keep rows aligned.
- `npm run build` runs the TypeScript check (strict) plus the Vite build and
  must pass before pushing.
