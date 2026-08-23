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
- **R19** — Each level has a timer: the level must be finished within the
  time limit. Finishing early grants a bonus — the more seconds remain, the
  more bonus points are awarded.

## Levels

- **R9** — Level 1 is a cave level. Spiders hang from the ceiling and move
  up and down on a spider thread; the player must dodge them. Bats fly
  around and must also be dodged.
- **R10** — A forest level exists in which the player runs through a forest
  and giant flies buzz around as hazards to dodge. The forest must look like
  a swampy jungle forest. The flies look like mosquitoes, and the jungle
  level has no walking ground monsters — flies and fish are enough.
- **R22** — A fifth level exists: a second jungle level, created as a copy
  of the fourth.
- **R17** — The jungle level contains water pools out of which fish leap
  again and again; the player must jump across the pools past the fish.
  The fish looks up while flying upward and down while falling.

## Enemies

- **R20** — Sparky, an enemy modelled after the owner's hand-drawn design
  sketch. It patrols the ground; because of its spikes it cannot be stomped,
  so any contact is deadly. Sparky replaces the other walking enemies in
  the levels. Its look follows the sketch:
  - a head and shoes only — no body in between and no legs;
  - spikes that come out of the head's own shape, in the head's colour
    rather than a colour of their own;
  - purple shoes, in the same purple as the former walking enemies;
  - black googly eyes that roll in opposite directions;
  - a grin narrower than the head, with an ordinary row of teeth.

- **R24** — Fliegi, a flying enemy modelled after the owner's design sketch,
  replaces the mosquitoes in level 4 (level 5 keeps them). Its look follows
  the sketch: a round blue body, two yellow eyes, two fangs, two feelers on
  top, white wings at the sides, and two red feet. It moves back and forth
  in a wave rather than a straight line, and its wings beat as it flies.
  The path must read as round: no bouncing off an invisible wall at the
  sides — Fliegi eases to a halt there and accelerates back out — and the
  wave carries on continuously instead of being mirrored on the way back.
  The whole motion is calm enough to make the character easy to read.

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
- **R21** — In developer mode the running game can be paused (and resumed).
- **R23** — In developer mode the player has infinite lives, so levels can be
  tested thoroughly.
