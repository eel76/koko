# Koko Run — Requirements

This file collects every requirement stated by the project owner. It is the
single overview of what the game must do and must be kept up to date: whenever
a new requirement arrives (usually via chat instructions), it is added here in
the appropriate section. Requirement IDs are stable and never reused.

## Platform & Technology

- **R1** — The game must be playable in the browser and work well on mobile
  phones (touch controls, responsive scaling).
- **R2** — Tech stack: Phaser 3 + TypeScript, built with Vite.
- **R3** — The game must be installable as a PWA (home screen icon) and
  playable offline.
- **R4** — The game is hosted on GitHub Pages and deployed automatically via
  GitHub Actions on every push.

## Project & Process

- **R5** — The project is open source under the MIT license
  (copyright holder: eel76).
- **R6** — Everything in the repository must be in English — documentation,
  code comments, commit messages, in-game text, and all other materials —
  regardless of the language used in chat instructions.
- **R7** — This requirements file must exist, collect all requirements, and
  always reflect the current state (see note in CLAUDE.md).

## Gameplay

- **R8** — The game is a classic side-scrolling jump'n'run in the style of
  Super Mario Bros.: running, jumping, collecting coins, defeating ground
  enemies by jumping on them, reaching a goal flag; lives and a locally
  stored highscore.

## Levels

- **R9** — Level 1 is a cave level. Spiders hang from the ceiling and move
  up and down on a spider thread; the player must dodge them. Bats fly
  around and must also be dodged.
- **R10** — A forest level exists in which the player runs through a forest
  and giant flies buzz around as hazards to dodge. The forest must look like
  a swampy jungle forest. The flies look like mosquitoes, and the jungle
  level has no walking ground monsters — flies and fish are enough.
- **R17** — The jungle level contains water pools out of which fish leap
  again and again; the player must jump across the pools past the fish.
  The fish looks up while flying upward and down while falling.

## Characters

- **R11** — The player character can be a stick figure with clearly visible
  movement animation (walk cycle, jump pose).
- **R12** — On the title screen the player can choose between three
  characters: the stick figure, the originally proposed bird (Koko), and a
  cute, cuddly little dog (dachshund-like). The selection is remembered.

## Camera & Controls

- **R13** — The on-screen touch buttons must never cover the player
  character.
- **R14** — Camera scrolling is symmetric: moving left scrolls exactly like
  moving right, the player always stays in the middle area of the screen and
  can never reach the left screen edge.
- **R15** — At level start, all level content (coins, enemies, platforms)
  appears to the right of the player; nothing appears to their left.
- **R18** — The gameplay camera is zoomed in (150 %) so the level content
  fills at least about two thirds of the screen instead of only the lower
  half. HUD and touch controls keep their apparent size and position.

## Developer Tools

- **R16** — A developer mode (local dev server, or `#dev` in the URL)
  offers a level-select on the start screen with one button per level. It
  must be clearly marked as a developer feature and be invisible to normal
  players.
