# DikshantGPT — Special Event Detection System 💍

A dark, terminal-style AI chatbot website that turns a ring-ceremony invitation
into a 5–10 minute interactive experience. Built with plain HTML, CSS and
JavaScript — no build step, no dependencies.

## Run it

Just open the site in a browser:

- **Easiest:** double-click `index.html`.
- **Recommended (local server):**
  ```bash
  cd DikshantGPT
  python3 -m http.server 8000
  # then open http://localhost:8000
  ```
  or use the VS Code **Live Server** extension.

## Personalize (important)

Open [script.js](script.js) and edit the `CONFIG` object at the top:

| Field | What it controls |
|-------|------------------|
| `herName` | The name on the "I'm ___" button. **Set this to her name.** |
| `event.couple` | Names on the invitation card (`Krutika ❤️ Pankaj`) |
| `event.dateText`, `event.timeText`, `event.venue` | Card details |
| `event.target` | Countdown target datetime (`2026-06-19T18:00:00`) |
| `event.mapQuery` | Text used for the "Open Location 📍" map button |
| `security.question` / `security.options` | The inside-joke security challenge |
| `happiness` | The "without you / with you" percentages |
| `stats` | The relationship-analysis bars |

### Share a personalized link (no code edit needed)
You can override her name straight from the URL:

```
index.html?name=Priya
```

## Flow

Boot animation → Authentication → Verification → Database scan →
Security challenge → Emotional analysis → **Reveal card** →
Personal message → Decision → Confetti + fake SQL → Live countdown.

## Hidden features

- **ⓘ button** (top-right): fake "Model Information" side panel.
- Type **`love`** → playful Error 404.
- Type **`who created you?`** → credits.
- Type **`help`** → lists the secret commands.

## Files

- [index.html](index.html) — structure
- [styles.css](styles.css) — dark terminal theme + animations
- [script.js](script.js) — boot sequence, flow engine, widgets, confetti

Made with ❤️ by Dikshant Kumar.
