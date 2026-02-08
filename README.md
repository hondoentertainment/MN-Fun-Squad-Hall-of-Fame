# MN Fun Squad — Hall of Fame Bracket

[![CI](https://github.com/hondoentertainment/MN-Fun-Squad-Hall-of-Fame/actions/workflows/ci.yml/badge.svg)](https://github.com/hondoentertainment/MN-Fun-Squad-Hall-of-Fame/actions/workflows/ci.yml)

A complete system for running a 64-athlete single-elimination tournament bracket: an interactive browser-based picker with shareable links and a Python-powered PDF generator.

**Live site:** https://mn-fun-squad-hall-of-fame.vercel.app

---

## Quick Start

### 1. Open the Bracket Picker

Just open `index.html` in any modern browser — no build step, no server needed.

- 64 legendary athletes are pre-loaded across baseball, basketball, football, hockey, soccer, and more
- Use the **Input Athletes** tab to add, remove, or clear athletes
- Click **Generate Bracket** to create a randomized tournament bracket
- Click **Resume Bracket** to continue where you left off (auto-saved)

### 2. Pick Winners

- Switch to the **Bracket** tab
- Click an athlete's name to pick them as the winner
- Winners auto-advance to the next round
- Click a winner again to undo (downstream picks clear automatically)
- **Reset Picks** clears all selections but keeps the same matchup seeding
- **Shuffle & Reset** re-randomizes everything

### 3. Share & Export

| Button | What it does |
|---|---|
| **Share Bracket** | Compresses your full bracket into a URL and copies it to your clipboard |
| **Export Picks (JSON)** | Downloads `bracket_picks.json` with every matchup and your selections |
| **Export PDF** | Sends picks to the Python PDF server; falls back to browser print dialog |

---

## Features

- **Tabbed interface** — Input Athletes roster management + interactive Bracket view
- **Auto-sizing brackets** — 2 to 64 athletes; auto-pads with BYEs and advances them
- **Bracket persistence** — All picks saved to localStorage; survives page refreshes
- **Shareable URLs** — Deflate-compressed bracket state encoded in the URL
- **Dark theme** — Modern dark UI with purple accent and green winner highlights
- **Responsive** — Works on desktop and mobile
- **Zero dependencies** — Single HTML file, no build tools, no frameworks

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

## Default Roster — 64 Legendary Athletes

| Category | Count | Examples |
|---|---|---|
| Baseball | 22 | Babe Ruth, Jackie Robinson, Kirby Puckett, Shohei Ohtani |
| Basketball | 12 | Michael Jordan, LeBron James, Stephen Curry |
| Football | 8 | Tom Brady, Jerry Rice, Walter Payton |
| Hockey | 4 | Wayne Gretzky, Mario Lemieux, Bobby Orr |
| Soccer | 6 | Pelé, Lionel Messi, Cristiano Ronaldo |
| Other Sports | 12 | Tiger Woods, Serena Williams, Muhammad Ali, Simone Biles |

Edit `teams.json` or use the in-browser **Input Athletes** tab to customize.

---

## Project Structure

```
MN Fun Squad Hall of Fame/
├── index.html          # Complete frontend (HTML + CSS + JS, single file)
├── generate_pdf.py     # Python PDF generator + optional Flask server
├── teams.json          # Default 64-athlete roster
├── requirements.txt    # Python dependencies (reportlab, flask, flask-cors)
├── vercel.json         # Vercel static site deployment config
├── PRD.md              # Product Requirements Document
└── README.md           # This file
```

---

## Deployment

| Environment | URL |
|---|---|
| **Production** | https://mn-fun-squad-hall-of-fame.vercel.app |
| **Source** | https://github.com/hondoentertainment/MN-Fun-Squad-Hall-of-Fame |

Vercel auto-deploys on every push to `master`.
