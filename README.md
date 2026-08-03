# Koko Run 🐦

Ein kleines Jump'n'Run im Stil klassischer Plattformer — spielbar im Browser
und auf dem Handy, installierbar als PWA und offline spielbar.

**Spielen:** https://eel76.github.io/koko/

## Steuerung

| | Laufen | Springen |
|---|---|---|
| **Desktop** | Pfeiltasten / A + D | Leertaste / W / Pfeil hoch |
| **Handy** | ◀ ▶ Buttons links | Sprung-Button rechts |

Kurz tippen = kleiner Sprung, gedrückt halten = hoher Sprung. Gegner besiegt
man, indem man auf sie springt. Münzen und ?-Blöcke geben Punkte, die Flagge
beendet das Level. Der Highscore wird lokal im Browser gespeichert.

## Entwicklung

```bash
npm install
npm run dev      # Dev-Server mit Hot Reload
npm run build    # Typecheck + Produktions-Build nach dist/
npm run preview  # Produktions-Build lokal testen
npm run icons    # PWA-Icons neu generieren (public/)
```

Technik: [Phaser 3](https://phaser.io/) + TypeScript + [Vite](https://vite.dev/) +
[vite-plugin-pwa](https://vite-pwa-org.netlify.app/). Alle Grafiken werden zur
Laufzeit generiert — das Spiel hat keine Bild-Assets.

### Level bearbeiten

Die Level liegen als ASCII-Karten in [`src/levels.ts`](src/levels.ts) — ein
Zeichen pro 32-px-Kachel:

```
#  Boden      B  Ziegelblock   ?  Münzblock   C  Münze
E  Gegner     P  Startpunkt    F  Ziel-Flagge
```

Neues Level = neues String-Array, in `LEVELS` eintragen, fertig.

## Deployment

Jeder Push baut das Spiel per GitHub Actions und veröffentlicht es auf
GitHub Pages (siehe [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)).

**Einmalige Einrichtung:** In den Repo-Einstellungen unter
**Settings → Pages → Build and deployment** die Source auf **„GitHub Actions"**
stellen — sonst schlägt der Deploy-Schritt fehl. Danach den fehlgeschlagenen
Workflow-Lauf unter **Actions** einfach per „Re-run" neu starten.

⚠️ Bei einem **privaten** Repository ist GitHub Pages nur mit einem
bezahlten GitHub-Plan (Pro/Team) verfügbar. Alternative: das Repository
unter **Settings → General → Danger Zone** auf **public** stellen.

Hinweis: Der Service Worker (Offline-Modus) funktioniert nur über HTTPS,
also über die echte Pages-URL — nicht beim Testen über eine lokale
IP-Adresse im WLAN.

## Lizenz

[MIT](LICENSE)
