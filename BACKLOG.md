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

_(none open)_

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

_(nothing yet)_
