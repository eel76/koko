# Koko Run — Backlog

This file collects every idea, feature wish, and bug report from the project
owner that is **not implemented yet**. It is the counterpart to
[`REQUIREMENTS.md`](REQUIREMENTS.md):

| File | Contains |
| --- | --- |
| `REQUIREMENTS.md` | What the game **is** — decided and implemented (`R` IDs) |
| `BACKLOG.md` | What the game **could become** — open ideas and bugs (`B` IDs) |

Backlog IDs (B1, B2, …) are stable and are never reused, exactly like the
requirement IDs.

## How an item travels

1. The owner states an idea or reports a bug (usually via chat).
2. It is added here with a fresh `B` ID, in the matching section.
3. When it gets implemented, it moves to [Done](#done) and is struck through,
   with a pointer to the resulting requirement.
4. An implemented **feature** also becomes a requirement in `REQUIREMENTS.md`
   with a new `R` ID — that file stays the complete picture of the finished
   game. A **bugfix** usually needs no new requirement; it restores an
   existing one, so it just points at the requirement it repairs.

Priorities are `high`, `medium`, or `low`. Items without a priority are
unsorted ideas that have not been judged yet.

## Bugs

Things that are broken and should behave differently.

_(none open)_

## Features

Wishes that are agreed on in principle and wait for implementation.

- **B8** — A real boss at the end of the woods: the carnivorous plant that the
  signpost's wanted poster already shows (see R31). Until it exists the poster
  is a promise the level does not keep yet. Open points: where the boss fight
  happens (an arena before the goal, or the goal itself), how it is beaten —
  stomping is out, the plant has teeth — and whether every level ends in a boss
  with its own poster. Priority: medium.

## Ideas / Someday

Rough thoughts, not decided yet — a parking spot so nothing gets lost.

- **B1** — Collectibles as a real currency, plus a shop for cosmetic items.
  Today the coins (`C` and `?` blocks) are pure score: picking one up adds
  points and is forgotten the moment the run ends. Instead, the collected
  items should be counted and kept across runs, so the player builds up a
  balance and can spend it in a shop.

  The shop sells cosmetics for the playable characters — for Koko the bird,
  for example, feathers or plumage in different colours; something
  equivalent for the stick figure and for Pup the dachshund. Bought items
  stay unlocked and can be selected, most likely on the title screen next to
  the character choice.

  Open question: whether coins are the right collectible at all. A themed
  item might fit the game better — bird eggs, for instance — which would
  replace the coins in the levels and become the shop's currency.

  Open points to decide before this can be implemented: whether the
  currency is separate from the score or replaces it, where the balance is
  stored (localStorage, like the highscore), what the shop screen looks
  like, and which items exist at what price.

## Done

Implemented items, newest first. Kept for the record so the IDs stay
traceable.

- **B9** — ~~The planes behind the character hang in the air — the ants walk on
  nothing instead of on ground.~~ Fixed: every plane has a bank of its own now,
  each a smaller step higher than the last, and everything behind the character
  is rooted on the bank of its own plane (see R38).

- **B7** — ~~The signpost at the end of the level points in two directions, and
  one of them leads back into the level.~~ Fixed: it now carries a single arm
  pointing onwards, plus a wanted poster of the woods' boss in place of any
  text (see R31, R37).

- **B6** — ~~It is not obvious which creatures are dangerous: the harmless
  beetles and ants walk the same ground as the deadly ones and are only a
  little smaller.~~ Fixed: harmless creatures left the character's plane —
  beetles climb the trunks of the tree line, ants trail over the shaded plane
  behind the planting (see R32, R36).

- **B5** — ~~The logs in the brooks and streams drift into the bank, which makes
  no sense: a log must always stay on the water surface.~~ Fixed: every log is
  tied to the stretch of water under it and swings only as far as the open
  water beside it; each of level 1's two streams now carries a single log
  drifting in the middle (see R30).

- **B4** — ~~In the woods the spruces' light triangles stick out over the edge
  of the tier they sit on, so the trees look slightly broken.~~ Fixed: every
  tier's mid tone and highlight are now measured from that tier's own width,
  so they stay inside its outline right up to the narrow top (restores R27).

- **B3** — ~~Level 1 shows far too many flowers, and all of them stand in the
  very plane the character moves in.~~ Fixed: the ground cover now grows in two
  planes and most flowers moved to the one behind the character (see R35).

- **B2** — ~~Walking into a level starts at the start marker in the map, so the
  character only appears to walk in from outside; afterwards the player can
  steer back behind that entrance point.~~ Fixed: the character now enters from
  the leftmost point of the level and the handover point is the left end of the
  world (see R34).
