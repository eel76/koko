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
- **R27** — A backlog file `BACKLOG.md` must exist and collect every idea,
  feature wish, and bug report that is not implemented yet. Its IDs (B1,
  B2, …) are stable and never reused. An implemented feature moves out of
  the backlog and becomes a requirement here with a new R ID; a bugfix
  points at the requirement it restores.

## Gameplay

- **R8** — The game is a classic side-scrolling jump'n'run in the style of
  Super Mario Bros.: running, jumping, collecting coins, defeating ground
  enemies by jumping on them, reaching the goal marker at the end of the
  level; lives and a locally stored highscore.
- **R19** — Each level has a timer: the level must be finished within the
  time limit. Finishing early grants a bonus — the more seconds remain, the
  more bonus points are awarded. The timer only runs while the player is
  actually in control (see R29).
- **R29** — Levels are entered and left as a little scene. On entering, the
  character walks in from the left end of the level to the middle of the
  screen by itself; only then do the controls fade in, making it clear that
  the player is now in charge. On reaching the goal the controls fade out
  again and the character walks from the middle of the screen off the right
  edge until it is out of sight.
- **R34** — The walk-in really starts at the leftmost point the level allows,
  not at the start marker in the map: the marker only sets the height at which
  the character enters. The spot where control is handed over is the left end
  of the world from then on — the player can never steer the character back
  behind the point where control began, and no level content ever lies behind
  it.
- **R30** — Floating logs drift back and forth on the water and carry the
  player standing on them, so wider streams can be crossed by riding a log
  over. A log belongs to the stretch of water it floats on and never leaves
  it: the logs of one stream are spread evenly over that water and swing only
  as far as the open water beside them, so a log never slides into the bank.
  A stream is usually best served by a single log drifting in its middle.
- **R25** — The goal flag can never be skipped: the goal is triggered
  anywhere in the flag's tile column, at any height. Jumping over the flag
  from a nearby platform finishes the level instead of leaving it
  unfinishable.

## Levels

- **R27** — Level 1 is a woods level: a real, ordinary forest — no swamp and
  no jungle. Its trees are oak, beech and spruce; birches have no place in it,
  being pioneers of open, light ground rather than of a closed canopy. It is
  full of trees, with mushrooms, flowers, ferns and grass on the forest floor. Sparky and Fliegi appear as enemies. Small brooks have to
  be jumped across, and two wider streams are crossed on floating logs.
- **R28** — Only the woods level is part of the released game. The older
  levels are kept for later and are reachable through the developer-mode
  level select alone (see R16).
- **R31** — In the woods the goal is not a flag but a wooden signpost, weathered
  and overgrown with ivy, grass and a mushroom. It carries exactly one arm, and
  that arm points the way onwards — to the right, towards the level's exit;
  never a second arm back into the level. Under the arm hangs a wanted poster
  showing what waits at the end of the woods: a carnivorous plant, drawn with
  its mouth open towards the side the player walks in from. The arm is the
  larger of the two and leads the eye: it is long, and it reaches out on both
  sides of the post rather than only towards its tip. The poster stays clearly
  smaller and hangs high under the arm, well clear of the grass at the post's
  foot.
- **R32** — Harmless little creatures — ants and beetles — make the woods feel
  alive. They are pure decoration and never hurt the player. They also never
  share the plane the character runs in: beetles climb up and down the trunks
  of the tree line behind the player — each keeping to a stretch of trunk of
  its own rather than walking it end to end, and the ones that reach the top
  climbing into the leaves, where they stay out of sight a while before coming
  back down —
  and ants travel in file over the shaded
  plane where the flowers grow (see R35), behind its grass and ferns. Where
  there are ants there is their hill: a mound of needles and twigs stands at
  one end of every trail, on the same plane, so the ants are doing something
  rather than merely walking about.
- **R37** — Signs in the world speak in pictures, not in words: a wanted poster
  rather than a boss's name, an arrow rather than "exit". Nothing on them ever
  needs translating, and a player of any age or language reads them at once.
- **R38** — The woods recede in planes, and every plane has ground of its own:
  a bank a little higher than the one in front of it, in that plane's own
  colours. The steps shrink towards the back — eight pixels for the plane just
  behind the character, then four, three and two for the three tree bands —
  the way ground lines crowd together as they near the horizon, and the grass
  on them hazes out with the distance. Everything is rooted on the bank of its
  own plane, so nothing behind the character hangs in the air. The banks run on
  behind brooks and streams: what shows above the water there are their far
  sides. Behind the character the woods recede backwards only; the single
  thing in front of its plane is the leaf roof overhead (R39).
- **R39** — The leaf roof hangs in the one plane in front of the character.
  Being the nearest thing on screen it is drawn as what it really is — single
  leaves on thin twigs, never whole tree shapes — irregular enough that the eye
  cannot find the beat of its repeat. Its branches leave the roof at every
  angle — level, slanted, steep — and sag towards their tips under their own
  weight, rather than all hanging straight down. It is almost black: closest to the eye
  and in the shadow of everything above it, it must never compete with the
  character. Among the twigs hang a few heavy boughs that reach right down into
  the picture, about one per screen, so that now and then foliage pushes across
  the view as the player runs — which is what makes the plane read as being in
  front. The deeper a leaf hangs the more it is seen through, so what reaches
  into the middle of the picture can never hide a hazard behind it. The roof
  sweeps past faster than the world horizontally, because it hangs nearer than
  the character, and barely moves vertically, so no jump ever slides it out of
  the top of the screen.
- **R40** — The woods do not open onto a sky. Looking into them, everything
  grows darker with distance: each parallax band is drawn darker than the one
  in front of it, its ground line darker still, and where the trees finally run
  out there is forest dark rather than blue. Only the plane the character runs
  in keeps its full daylight colour, so the character, the enemies and
  everything else that matters to play stand out against that depth.
- **R41** — Above the treetops the daylight is still there, only hinted at: at
  the very top of the world the forest dark gives way to sky blue in a soft
  gradient. It is fixed in the world, so at a run barely its darkest edge is
  visible and a high jump brings the blue into view — a reward for looking up,
  and a reminder of how deep under the canopy the level is played.
- **R42** — The trees are drawn big against the character. The point is the
  size difference: a small figure in a large, dark forest, which is what makes
  the woods feel like a place to be lost in rather than a backdrop to run past.
- **R43** — Behind the parallax bands stands one more that does not move at
  all: pale, almost lost trees in the colour of the forest itself. Being
  perfectly still it reads as infinitely far away — the suggestion of a forest
  going on beyond the one that can be seen.
- **R44** — Nothing in the woods is built. There are no blocks to be hit from
  below for coins — that is a mason's idea, not a forest's — and no platform
  floats. Every platform is the flattened end of a bough that leaves the
  forest floor steeply, bends over and runs out level, thick where it comes
  out of the ground and tapering to its tip.
- **R46** — Every plane has colours of its own. From the character's plane
  backwards they form one unbroken ramp: the character's plane alone keeps full
  daylight colour, and each plane behind it — the plane the flowers and ants
  live on, then every tree band, down to the still band furthest back — is
  drawn darker than the plane in front of it. No plane may share the colours of
  its neighbour, and nothing on a plane is exempt: undergrowth, plants, ground
  and creatures all carry the tint of the plane they stand on.
- **R36** — It must be obvious at a glance what is dangerous. The rule the
  woods follow: everything that moves in the plane the character runs in is a
  hazard, and everything harmless lives in a plane behind it. No badge, marker
  or warning colour is used for this — the plane says it.
- **R35** — The forest floor grows in two planes. The plane the character runs
  in stays sparse and mostly green — grass, ferns, mushrooms and pebbles — so
  the character is never lost in the undergrowth. Most of the flowers grow one
  plane further back: smaller, shaded and drawn behind the character, so the
  woods keep their colour without crowding the player.
- **R9** — A cave level exists (now level 2). Spiders hang from the ceiling
  and move up and down on a spider thread; the player must dodge them. Bats
  fly around and must also be dodged.
- **R10** — A jungle level exists in which the player runs through a forest
  and giant flies buzz around as hazards to dodge. This forest must look like
  a swampy jungle forest. The flies look like mosquitoes, and the jungle
  level has no walking ground monsters — flies and fish are enough. It is
  distinct from the ordinary woods of R27.
- **R22** — A second jungle level exists, created as a copy of the first
  one.
- **R26** — The swamp mist in the jungle levels must read as mist: a soft,
  wide veil that hangs above the ground line. It must never sit inside the
  terrain or lie flat on the water surface, and must not look like separate
  round blobs.
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
  Fliegi faces the viewer head-on and is never mirrored when its horizontal
  flight direction changes: its feelers and its grin always stay on the same
  side.

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

## Sound

- **R33** — The game has background music that carries the mood of the forest.
  It is generated at runtime like every graphic in this game, so the game
  still ships without any asset files and stays free of third-party licences.
  It can be switched off on the title screen, and that choice is remembered.
- **R45** — The soundtrack's mood is mysterious, mystical and a little dark:
  a low drone that never stops, slow chords in a minor, modal harmony that
  keeps floating instead of resolving, single bell notes ringing out into a
  long reverb, and an owl now and then instead of cheerful birdsong. The
  wind layer must read as leaves rustling in gusts — short, high, irregular,
  each gust its own — and never as the slow broad swell of surf.

## Developer Tools

- **R16** — A developer mode (local dev server, or `#dev` in the URL)
  offers a level-select on the start screen with one button per level —
  including the levels that are not part of the released game (R28). It
  must be clearly marked as a developer feature and be invisible to normal
  players.
- **R21** — In developer mode the running game can be paused (and resumed).
- **R23** — In developer mode the player has infinite lives, so levels can be
  tested thoroughly.
