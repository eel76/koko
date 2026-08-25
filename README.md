# Koko Run 🐦

A small jump'n'run in the style of classic platformers — playable in the
browser and on your phone, installable as a PWA, and playable offline.

**Play:** https://eel76.github.io/koko/

## Controls

| | Move | Jump |
|---|---|---|
| **Desktop** | Arrow keys / A + D | Space / W / Arrow up |
| **Phone** | ◀ ▶ buttons on the left | Jump button on the right |

Tap briefly for a small hop, hold for a high jump. Defeat enemies by jumping
on top of them. Coins and ?-blocks give points, and the signpost at the end
finishes the level. Each level has a time limit — running out costs a life,
and every second left at the goal is worth bonus points. The highscore is
stored locally in your browser.

At the start of a level your character walks into the woods on its own, and
the controls only appear once it has arrived — from then on it is yours. At
the signpost the controls disappear again and it strolls off the screen.

On the title screen you can pick your character — the stick figure, Koko
the bird, or Pup the dachshund. The choice is remembered locally. The speaker
button in the bottom left switches the music off and on.

## Development

```bash
npm install
npm run dev      # dev server with hot reload
npm run build    # typecheck + production build into dist/
npm run preview  # test the production build locally
npm run icons    # regenerate the PWA icons (public/)
```

Tech: [Phaser 3](https://phaser.io/) + TypeScript + [Vite](https://vite.dev/) +
[vite-plugin-pwa](https://vite-pwa-org.netlify.app/). All graphics are
generated at runtime — the game ships zero image assets. The music is
generated at runtime too ([`src/music.ts`](src/music.ts)): a slow chord pad,
a sparse pentatonic melody, wind in the leaves and the odd bird call, played
straight from the Web Audio API. So there is no audio file to download and no
third-party licence to worry about.

### Editing levels

Levels live as ASCII maps in [`src/levels.ts`](src/levels.ts) — one character
per 32px tile:

```
#  ground     B  brick block    ?  coin block   C  coin
K  Sparky     E  stompable walking enemy        S  spider anchor
V  bat        G  giant fly      Y  Fliegi
W  water      X  leaping fish   L  floating log
P  player start                 F  goal (flag, or signpost in the woods)
```

Each level has a `theme` (`woods` — an ordinary forest, `meadow`, `cave`, or
`forest` — a swampy jungle) that picks tiles, background color, and backdrop
decoration. Spiders (`S`)
hang from the ceiling and bob up and down on a thread; bats (`V`) and giant
mosquito-like flies (`G`) fly around their spawn point; Fliegi (`Y`) traces a slow
figure-eight with beating wings, facing the viewer head-on so it is never
mirrored on a turn; fish (`X`) leap out
of water pools (`W`) on a fixed rhythm, facing up while rising and down
while falling. Sparky (`K`) is a grinning spiky head on purple shoes with
rolling googly eyes that patrols the ground. All of them are dodge-only
hazards — any contact is deadly. The stompable walking enemy (`E`) is
still supported by the level format but no longer used in any level.
Floating logs (`L`) drift back and forth over the water and carry the player
across; every log follows the same sine, so they keep their spacing. The
player is an animated stick figure, tinted light or
dark to contrast each theme.

New level = new string array, add it to `LEVELS`, done.

Only the first level is part of the released game — `RELEASED_LEVEL_COUNT`
in `src/levels.ts` says how many. The remaining levels are kept for later and
can be played through the developer-mode level select.

### Developer mode

Running `npm run dev`, or adding `#dev` to the URL of the deployed game,
enables developer tools: a level select on the title screen, a pause button
in-game (also `P` or `ESC`), and infinite lives so a level can be tested
end to end. Normal players never see any of it.

## Deployment

Every push builds the game via GitHub Actions and publishes it to
GitHub Pages (see [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)).

**One-time setup:** In the repository settings under
**Settings → Pages → Build and deployment**, set the source to
**"GitHub Actions"** — otherwise the deploy step fails. Afterwards simply
re-run the failed workflow run under **Actions**.

⚠️ For a **private** repository, GitHub Pages is only available on a paid
GitHub plan (Pro/Team). Alternative: make the repository **public** under
**Settings → General → Danger Zone**.

Note: The service worker (offline mode) only works over HTTPS, i.e. via the
real Pages URL — not when testing over a local IP address on your Wi-Fi.

## License

[MIT](LICENSE)
