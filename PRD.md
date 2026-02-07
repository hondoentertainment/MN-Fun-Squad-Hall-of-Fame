# Product Requirements Document (PRD)

## MN Fun Squad — Hall of Fame Bracket

**Version:** 1.0
**Date:** February 6, 2026
**Author:** MN Fun Squad
**Status:** Live

---

## 1. Executive Summary

The MN Fun Squad Hall of Fame Bracket is an interactive, browser-based 64-athlete single-elimination tournament bracket. Users manage a roster of legendary athletes spanning six sport categories, generate randomized brackets, pick winners round-by-round, and share their completed brackets with friends via URL or export them as JSON/PDF.

The product is designed for casual sports fans, office pools, group debates, and social sharing. It runs entirely in the browser with zero backend dependencies for core functionality, and optionally connects to a Python Flask server for high-fidelity PDF exports.

---

## 2. Problem Statement

Sports fans frequently debate "greatest of all time" rankings across sports, but lack a simple, shareable tool to formalize those debates into a structured tournament format. Existing bracket generators are either:

- Locked to a single sport (March Madness only)
- Require account creation and complex setup
- Don't support cross-sport athlete matchups
- Lack shareable output formats

**Goal:** Provide a zero-friction, no-signup bracket experience where users can input athletes, pick winners, and share results — all from a single webpage.

---

## 3. Target Users

| Persona | Description | Primary Use Case |
|---|---|---|
| **Casual Fan** | Sports enthusiast who enjoys ranking/debating athletes | Fill out a bracket, share with friends |
| **Office Pool Organizer** | Person running a group bracket competition | Distribute brackets, collect picks |
| **Content Creator** | Blogger, podcaster, or social media user | Generate bracket content for posts/episodes |
| **Event Host** | Party or event organizer | Run a live bracket-picking activity |

---

## 4. Product Scope

### 4.1 In Scope (v1.0 — Current)

| Feature | Status | Description |
|---|---|---|
| Athlete Roster Management | Shipped | Add, remove, clear athletes (max 64). Persisted to localStorage. |
| Tabbed Interface | Shipped | "Input Athletes" tab for roster management, "Bracket" tab for picks |
| Random Bracket Generation | Shipped | Shuffle athletes into random matchups, auto-size to nearest power of 2 |
| Interactive Winner Picking | Shipped | Click to pick winners, auto-advance to next round, click to undo |
| BYE Auto-Advance | Shipped | When roster < 64, BYE slots auto-advance real athletes |
| Bracket Persistence | Shipped | Full bracket state saved to localStorage; survives page refreshes |
| Resume Bracket | Shipped | "Resume Bracket" button to reload saved in-progress bracket |
| Reset Picks | Shipped | Clear all picks while keeping the same matchup seeding |
| Share via URL | Shipped | Compress bracket state into a shareable URL (deflate + base64url) |
| Export JSON | Shipped | Download complete bracket picks as `bracket_picks.json` |
| Export PDF | Shipped | Send picks to Flask server for PDF generation; falls back to browser print |
| Default Roster | Shipped | Pre-loaded with 64 legendary athletes across 6 sport categories |
| Dark Theme UI | Shipped | Modern dark-mode interface with accent colors and hover states |
| Responsive Layout | Shipped | Adapts to smaller screens with adjusted sizing |

### 4.2 Out of Scope (v1.0)

- User accounts / authentication
- Server-side storage of brackets
- Real-time multiplayer bracket filling
- Bracket comparison and scoring between users
- Athlete profile cards with stats/images
- Region-based seeding (March Madness quadrant format)
- Animated bracket transitions

---

## 5. Functional Requirements

### 5.1 Athlete Roster Management

| ID | Requirement | Priority |
|---|---|---|
| FR-1.1 | Users can add athletes by name via a text input field | P0 |
| FR-1.2 | Users can press Enter or click "Add" to add an athlete | P0 |
| FR-1.3 | Duplicate athlete names (case-insensitive) are rejected with a toast notification | P0 |
| FR-1.4 | Maximum 64 athletes enforced; attempts to exceed show a toast | P0 |
| FR-1.5 | Each athlete appears in a numbered list with a remove button | P0 |
| FR-1.6 | "Clear All" button removes all athletes after a confirmation dialog | P1 |
| FR-1.7 | Roster counter shows `N / 64` in real time | P1 |
| FR-1.8 | Roster is persisted to localStorage with a version stamp | P0 |
| FR-1.9 | On first load, roster is populated from `teams.json` if no localStorage data exists | P0 |
| FR-1.10 | When `teams.json` roster version changes, localStorage is bypassed to pick up the new default | P1 |

### 5.2 Bracket Generation

| ID | Requirement | Priority |
|---|---|---|
| FR-2.1 | "Generate Bracket" button is disabled when fewer than 2 athletes exist | P0 |
| FR-2.2 | Bracket size auto-scales to the nearest power of 2 (2, 4, 8, 16, 32, 64) | P0 |
| FR-2.3 | Athletes are randomly shuffled into matchup positions on generation | P0 |
| FR-2.4 | If athlete count is not a power of 2, BYE entries fill remaining slots | P0 |
| FR-2.5 | BYE matchups are auto-advanced so real athletes skip past empty slots | P1 |
| FR-2.6 | Round names adapt to bracket size (e.g., 8-team starts at "Elite 8") | P1 |
| FR-2.7 | "Shuffle & Reset" re-randomizes the entire bracket from the current athlete list | P0 |
| FR-2.8 | Seed numbers are displayed next to athlete names in Round 1 | P2 |

### 5.3 Winner Picking

| ID | Requirement | Priority |
|---|---|---|
| FR-3.1 | Clicking an athlete in a matchup selects them as the winner | P0 |
| FR-3.2 | The winner is visually highlighted (green border/text); the loser is dimmed | P0 |
| FR-3.3 | The winner automatically advances to the correct slot in the next round | P0 |
| FR-3.4 | Clicking an already-selected winner deselects them and clears all downstream picks | P0 |
| FR-3.5 | Switching a pick in an earlier round cascades the clear through all downstream rounds | P0 |
| FR-3.6 | When the final Championship matchup is decided, a champion banner is displayed | P1 |
| FR-3.7 | "Reset Picks" clears all selections but preserves the matchup seeding | P1 |

### 5.4 Bracket Persistence

| ID | Requirement | Priority |
|---|---|---|
| FR-4.1 | Every pick action auto-saves the full bracket state to localStorage | P0 |
| FR-4.2 | On page load, if a saved bracket exists, it is silently restored | P0 |
| FR-4.3 | "Resume Bracket" button on the Athletes tab switches to the saved bracket | P1 |
| FR-4.4 | The champion banner is correctly restored from saved state | P1 |

### 5.5 Share via URL

| ID | Requirement | Priority |
|---|---|---|
| FR-5.1 | "Share Bracket" compresses the full bracket state (athletes, seedings, picks) into a URL parameter | P0 |
| FR-5.2 | Compression uses the browser's CompressionStream (deflate) with base64url encoding | P1 |
| FR-5.3 | Falls back to raw base64url encoding in browsers without CompressionStream | P1 |
| FR-5.4 | The generated URL is copied to the clipboard automatically | P0 |
| FR-5.5 | If clipboard API is unavailable, a prompt dialog shows the URL | P2 |
| FR-5.6 | Opening a shared URL loads the bracket, switches to the Bracket tab, and shows a toast | P0 |
| FR-5.7 | The `?b=` parameter is removed from the URL after loading (clean address bar) | P2 |
| FR-5.8 | Shared bracket athletes are saved to the recipient's localStorage | P1 |

### 5.6 Export

| ID | Requirement | Priority |
|---|---|---|
| FR-6.1 | "Export Picks (JSON)" downloads a `bracket_picks.json` file with all rounds and picks | P0 |
| FR-6.2 | "Export PDF" sends picks to `POST http://localhost:5000/generate-pdf` | P1 |
| FR-6.3 | If the PDF server is not running, the browser's print dialog is opened as a fallback | P1 |
| FR-6.4 | The PDF server accepts a JSON body with `{ "picks": [...] }` and returns a PDF file | P1 |
| FR-6.5 | The PDF is landscape Letter size with round labels, matchup boxes, connector lines, and a champion callout | P2 |

---

## 6. Non-Functional Requirements

| ID | Requirement | Category |
|---|---|---|
| NFR-1 | Page loads in under 1 second on modern browsers (no external dependencies) | Performance |
| NFR-2 | All core features work offline after initial page load | Offline |
| NFR-3 | No user accounts, cookies, or server-side tracking required | Privacy |
| NFR-4 | Single HTML file with inline CSS/JS — zero build step | Simplicity |
| NFR-5 | Works in Chrome, Firefox, Edge, and Safari (latest 2 versions) | Compatibility |
| NFR-6 | Responsive layout adapts to viewports down to 360px width | Responsiveness |
| NFR-7 | Bracket state in localStorage must not exceed 500KB | Storage |
| NFR-8 | Share URLs should remain under browser URL length limits (~2000 chars for 64 teams) | Compatibility |

---

## 7. Technical Architecture

### 7.1 System Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Browser (Client)                             │
│                                                                     │
│  ┌──────────────┐    ┌──────────────┐    ┌───────────────────────┐  │
│  │ Input Athletes│    │   Bracket    │    │    Share / Export      │  │
│  │    Tab        │───▶│    Tab       │───▶│                       │  │
│  │              │    │              │    │  • JSON download       │  │
│  │  Add/remove  │    │  Pick winners│    │  • URL share (clipboard│) │
│  │  Persist to  │    │  Auto-advance│    │  • PDF (server/print)  │  │
│  │  localStorage│    │  Save state  │    │                       │  │
│  └──────────────┘    └──────────────┘    └───────────────────────┘  │
│                                                                     │
│  localStorage:  mnfs_athletes, mnfs_bracket, mnfs_roster_v          │
│  URL params:    ?b=<compressed-bracket-state>                       │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │ POST /generate-pdf (optional)
                                   ▼
                    ┌──────────────────────────┐
                    │   Python Flask Server     │
                    │   (generate_pdf.py)       │
                    │                          │
                    │   • ReportLab PDF canvas  │
                    │   • Landscape Letter      │
                    │   • Returns bracket.pdf   │
                    └──────────────────────────┘
```

### 7.2 Technology Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend | HTML5, CSS3, Vanilla JS | Single-file, zero dependencies |
| State Management | localStorage | JSON serialization, version-stamped |
| URL Sharing | CompressionStream API + base64url | Fallback to raw base64 |
| PDF Generation | Python 3 + ReportLab | Optional; standalone CLI or Flask server |
| PDF Server | Flask + flask-cors | Runs on localhost:5000 |
| Hosting | Vercel (static) | Auto-deploys from GitHub on push |
| Source Control | GitHub | github.com/hondoentertainment/MN-Fun-Squad-Hall-of-Fame |

### 7.3 File Structure

```
MN Fun Squad Hall of Fame/
├── index.html          # Complete frontend (HTML + CSS + JS)
├── generate_pdf.py     # Python PDF generator + Flask server
├── teams.json          # Default 64-athlete roster
├── requirements.txt    # Python dependencies (reportlab, flask, flask-cors)
├── vercel.json         # Vercel deployment config
├── README.md           # Developer documentation
└── PRD.md              # This document
```

### 7.4 Data Models

**Athlete Roster** (localStorage: `mnfs_athletes`)
```json
["Babe Ruth", "Michael Jordan", "Tom Brady", ...]
```

**Bracket State** (localStorage: `mnfs_bracket`)
```json
{
  "currentTeams": ["Babe Ruth", "BYE 65", ...],
  "rounds": [
    [
      { "top": "Babe Ruth", "bottom": "Tiger Woods", "winner": "Babe Ruth", "topSeed": 1, "bottomSeed": 2 },
      ...
    ],
    [
      { "top": "Babe Ruth", "bottom": null, "winner": null },
      ...
    ]
  ],
  "roundNames": ["Round of 64", "Round of 32", "Sweet 16", "Elite 8", "Final Four", "Championship"]
}
```

**Share URL Parameter** (`?b=`)
```
Deflate-compressed → base64url-encoded bracket state JSON
```

---

## 8. Default Roster

64 legendary athletes across 6 categories:

| Category | Count | Examples |
|---|---|---|
| Baseball | 22 | Babe Ruth, Jackie Robinson, Kirby Puckett, Shohei Ohtani |
| Basketball | 12 | Michael Jordan, LeBron James, Stephen Curry |
| Football | 8 | Tom Brady, Jerry Rice, Walter Payton |
| Hockey | 4 | Wayne Gretzky, Mario Lemieux, Bobby Orr |
| Soccer | 6 | Pele, Lionel Messi, Cristiano Ronaldo |
| Other Sports | 12 | Tiger Woods, Serena Williams, Muhammad Ali, Simone Biles |

---

## 9. User Flows

### 9.1 First-Time User

```
Land on page
  → Athletes tab shown with 64 pre-loaded athletes
  → Click "Generate Bracket"
  → Bracket tab opens with randomized matchups
  → Click athletes to pick winners, round by round
  → Champion banner appears after final pick
  → Click "Share Bracket" to copy link
  → Send link to a friend
```

### 9.2 Returning User (In Progress)

```
Open page
  → Athletes tab shown with saved roster
  → "Resume Bracket" button visible
  → Click "Resume Bracket"
  → Bracket tab opens with all previous picks intact
  → Continue picking winners
```

### 9.3 Receiving a Shared Bracket

```
Open shared URL (?b=...)
  → Bracket auto-loads from URL data
  → Bracket tab shown immediately
  → Toast: "Shared bracket loaded!"
  → URL cleaned to remove ?b= parameter
  → Bracket saved to recipient's localStorage
```

### 9.4 Custom Roster

```
Open page → Athletes tab
  → Click "Clear All" to remove defaults
  → Type athlete names one by one → Enter or Add
  → Or edit roster to desired size
  → Click "Generate Bracket"
  → Bracket auto-sizes (e.g., 8 athletes → Elite 8 bracket)
```

---

## 10. UI/UX Specifications

### 10.1 Visual Design

- **Theme:** Dark mode (background `#0f1117`, surface `#1a1d27`)
- **Accent:** Purple (`#6c63ff`) for active elements, buttons, tab indicators
- **Winner highlight:** Green (`#00c896`) for selected winners
- **Danger:** Red (`#e5484d`) for destructive actions (Clear All, Remove)
- **Typography:** Segoe UI / system font stack
- **Layout:** Sticky header, tabbed content, horizontally scrollable bracket

### 10.2 Interactive States

| Element | Default | Hover | Active/Selected |
|---|---|---|---|
| Team slot | Dark surface, gray border | Purple border, slight scale-up | Green border + text (winner), dimmed (loser) |
| Button | Dark surface, gray border | Purple glow | Purple fill (primary) |
| Tab | Muted text, no underline | White text | Purple text, purple underline |
| Athlete list item | Dark surface | Purple border, lighter bg | — |

### 10.3 Feedback

- **Toast notifications** for all user actions (added, removed, exported, shared, errors)
- **Confirmation dialogs** for destructive actions (Clear All, Reset Picks)
- **Disabled states** for buttons when preconditions aren't met
- **Empty state** illustration when no athletes are in the roster

---

## 11. Deployment

| Environment | URL | Deploy Method |
|---|---|---|
| Production | https://mn-fun-squad-hall-of-fame.vercel.app | Auto-deploy on push to `master` |
| Source | https://github.com/hondoentertainment/MN-Fun-Squad-Hall-of-Fame | GitHub |

Vercel is configured as a static site (no framework, output directory `.`). The Python PDF server is not deployed to Vercel — it runs locally when needed.

---

## 12. Success Metrics

| Metric | Target | Measurement |
|---|---|---|
| Time to first bracket | < 5 seconds | From page load to first pick |
| Share link generation | < 1 second | From click to clipboard |
| Bracket state recovery | 100% fidelity | All picks restored after refresh |
| Browser compatibility | 4 major browsers | Chrome, Firefox, Edge, Safari |
| Page load (no cache) | < 1 second | Single HTML file, no external requests |

---

## 13. Future Roadmap

### v1.1 — Visual Polish
- [ ] Sport category color badges on athlete names
- [ ] Animated bracket transitions when winners advance
- [ ] Print-optimized CSS (`@media print`) for clean PDF output
- [ ] Dark/light theme toggle

### v1.2 — Enhanced Interaction
- [ ] Drag-to-reorder athletes for manual seeding
- [ ] Region-based seeding (4 quadrants, 1-16 seeds per region)
- [ ] Mobile-optimized vertical bracket view
- [ ] Keyboard navigation for accessibility

### v2.0 — Multiplayer
- [ ] Multi-user bracket pool (each user fills their own bracket)
- [ ] Bracket comparison and scoring against a "correct" bracket
- [ ] Voting/crowd-sourced results (majority-pick advancement)
- [ ] Lightweight backend (Vercel serverless + Supabase or Firebase)

### v2.1 — Content & Data
- [ ] Athlete profile cards with sport, era, stats, photos
- [ ] Historical bracket archives
- [ ] Embeddable bracket widget for blogs/social media
- [ ] API endpoint for programmatic bracket creation

---

## 14. Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| Share URLs too long for some platforms (SMS, Twitter) | Medium | Medium | Deflate compression reduces size ~60%; could add URL shortener integration |
| localStorage cleared by user or browser | Low | Low | Share URL acts as a backup; could add file-based import/export |
| CompressionStream API not available in older browsers | Low | Low | Fallback to raw base64 encoding implemented |
| PDF server requires local Python setup | Medium | High | Browser print dialog fallback always available; could migrate to Vercel serverless |
| 64-athlete limit too restrictive for some use cases | Low | Low | Architecture supports any power-of-2 up to 64; could extend to 128/256 |

---

## 15. Glossary

| Term | Definition |
|---|---|
| **BYE** | A placeholder entry when the roster has fewer athletes than the bracket size |
| **Seed** | The numerical position assigned to an athlete in the initial bracket |
| **Downstream** | Later rounds that depend on the outcome of an earlier matchup |
| **Round names** | Standard tournament labels: Round of 64, Round of 32, Sweet 16, Elite 8, Final Four, Championship |
| **base64url** | A URL-safe variant of base64 encoding (uses `-` and `_` instead of `+` and `/`) |
| **CompressionStream** | A browser API for streaming data compression (used for share URL generation) |
