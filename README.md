# MN Fun Squad — 64-Team Tournament Bracket

A complete system for running a 64-team single-elimination bracket: an interactive browser-based picker and a Python-powered PDF generator.

---

## Quick Start

### 1. Open the Bracket Picker

Just open `index.html` in any modern browser — no build step, no server needed.

- Teams are loaded from `teams.json` (edit the file or use the **Edit Teams** button)
- Click **Shuffle & Reset** to re-randomize seeds
- Click a team name to pick a winner — winners advance automatically
- Click a winner again to undo (downstream picks are cleared too)

### 2. Export Your Picks

| Button | What it does |
|---|---|
| **Export Picks (JSON)** | Downloads `bracket_picks.json` with every matchup and your selections |
| **Export PDF** | Sends picks to the Python PDF server; falls back to browser print dialog if the server isn't running |

---

## PDF Generation (Python)

### Install dependencies

```bash
pip install -r requirements.txt
```

### Option A — Standalone PDF from teams list

```bash
python generate_pdf.py                          # random bracket from teams.json
python generate_pdf.py --teams my_teams.json    # custom team list
python generate_pdf.py --output my_bracket.pdf  # custom output filename
```

### Option B — PDF from saved picks

```bash
python generate_pdf.py --picks bracket_picks.json
```

### Option C — Run as a server (used by the HTML picker)

```bash
python generate_pdf.py --serve
```

This starts a Flask server on `http://localhost:5000`. The HTML picker's **Export PDF** button will `POST` to `/generate-pdf` and trigger a PDF download automatically.

---

## Team Input Format

Edit `teams.json` — a simple JSON array of strings:

```json
[
  "Team Alpha",
  "Team Bravo",
  "Team Charlie"
]
```

- Maximum 64 teams; extras are trimmed
- Fewer than 64? The system fills remaining slots with BYE entries
- You can also paste teams directly into the **Edit Teams** modal in the browser

---

## Project Structure

```
MN Fun Squad Hall of Fame/
├── index.html          # Interactive bracket picker (HTML + JS)
├── generate_pdf.py     # PDF generator + optional Flask server
├── teams.json          # Default team list (64 entries)
├── requirements.txt    # Python dependencies
└── README.md           # This file
```

---

## Architecture

```
┌──────────────────────┐       POST /generate-pdf
│   Browser Picker     │  ──────────────────────────►  ┌──────────────────┐
│   (index.html)       │                                │  Flask Server    │
│                      │  ◄──────────────────────────  │  (generate_pdf)  │
│   Export JSON ───► bracket_picks.json                 │                  │
│   Export PDF  ───► calls server or print dialog       │  ───► bracket.pdf│
└──────────────────────┘                                └──────────────────┘
```

---

## Next Enhancements

- [ ] Save/load bracket state to `localStorage`
- [ ] Multi-user bracket comparison & scoring
- [ ] Seeded regions (like actual March Madness quadrants)
- [ ] Dark/light theme toggle
- [ ] Database-backed pick storage
