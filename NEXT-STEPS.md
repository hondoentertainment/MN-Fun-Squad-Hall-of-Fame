# Recommended Next Steps

**Project**: MN Fun Squad Hall of Fame Bracket
**Date**: March 31, 2026
**Current Version**: v1.0 (all PRD v1.0 features shipped, overall audit score 8.2/10)

---

## Current State

The project is **production-ready** with all v1.0 features complete:
- 64-athlete single-elimination bracket with interactive picking
- Roster management, localStorage persistence, shareable URLs
- JSON/PDF export, dark/light theme, print CSS, accessibility (ARIA)
- CI pipeline (Vitest), automated Vercel deployment
- No open issues or pull requests

---

## Priority 1 — Quick Wins (v1.0.x patches)

These are low-effort improvements that address existing audit feedback:

| # | Task | Effort | Impact | Source |
|---|------|--------|--------|--------|
| 1 | **Migrate PDF export to Vercel serverless function** — Remove the Python/Flask dependency for production users. Use a Node.js PDF library (e.g., `pdf-lib` or `jsPDF`) in an `/api/pdf` endpoint. | Medium | High | FEATURE-AUDIT (Share & Export 7/10) |
| 2 | **Add Home/End key support for tab navigation** — Extend the existing Arrow key handler to jump to first/last tab. | Low | Low | FEATURE-AUDIT (Tabbed Interface) |
| 3 | **Improve clipboard fallback UX** — Replace the raw `prompt()` dialog with a styled modal when `navigator.clipboard` is unavailable. | Low | Medium | FEATURE-AUDIT (Share & Export) |
| 4 | **Cross-browser print testing** — Verify `@media print` output in Chrome, Firefox, Safari, and Edge; fix any layout issues. Add page-break controls for large brackets. | Low | Medium | FEATURE-AUDIT (Print/PDF 7/10) |

---

## Priority 2 — v1.1 Visual Polish

Animated, polished experience per the PRD roadmap:

| # | Task | Effort | Impact |
|---|------|--------|--------|
| 5 | **Animated bracket transitions** — Add CSS transitions or keyframe animations when a winner advances to the next round. Subtle slide-in or highlight effect. | Medium | High |
| 6 | **Loading skeleton for roster** — Show a shimmer/skeleton UI while `teams.json` loads on first visit instead of a blank list. | Low | Low |
| 7 | **Confetti or celebration animation** — Trigger a brief visual celebration when the champion is crowned. | Low | Medium |

---

## Priority 3 — v1.2 Enhanced Interaction

These features increase engagement and usability:

| # | Task | Effort | Impact |
|---|------|--------|--------|
| 8 | **Drag-to-reorder athletes for manual seeding** — Use the HTML Drag and Drop API or a lightweight library to let users set matchup order before generating. | Medium | High |
| 9 | **Region-based seeding** — Split the bracket into 4 named quadrants with 1-16 seeds per region for a more authentic tournament feel. | Medium | Medium |
| 10 | **Mobile-optimized vertical bracket** — Render rounds stacked vertically on narrow screens instead of requiring horizontal scroll. | Medium | High |
| 11 | **Full keyboard bracket navigation** — Arrow keys to move between matchups, Enter to pick a winner, Esc to undo. | Medium | Medium |

---

## Priority 4 — v2.0 Multiplayer & Backend

The big leap — requires a lightweight backend:

| # | Task | Effort | Impact |
|---|------|--------|--------|
| 12 | **Add a backend (Vercel serverless + Supabase/Firebase)** — Store brackets server-side, generate short share codes, enable user accounts. | High | High |
| 13 | **Multi-user bracket pools** — Let a group of users each fill out their own bracket, then compare results. | High | High |
| 14 | **Bracket scoring & comparison** — Score user brackets against a "correct" bracket (consensus or admin-set). | Medium | Medium |
| 15 | **Voting / crowd-sourced advancement** — Allow multiple users to vote on each matchup; majority vote advances. | High | High |

---

## Priority 5 — v2.1 Content & Data

Rich content and integrations:

| # | Task | Effort | Impact |
|---|------|--------|--------|
| 16 | **Athlete profile cards** — Sport, era, key stats, and photos displayed on hover or tap. | Medium | High |
| 17 | **Historical bracket archives** — Save and browse past completed brackets. | Medium | Medium |
| 18 | **Embeddable bracket widget** — `<iframe>` snippet for blogs and social media. | Medium | Medium |
| 19 | **Public API** — REST endpoints for programmatic bracket creation and retrieval. | Medium | Low |

---

## Technical Debt & Infrastructure

| # | Task | Effort | Impact |
|---|------|--------|--------|
| 20 | **Split `index.html` into modules** — Extract CSS and JS into separate files. Use a bundler (Vite) for dev experience without losing the single-deploy simplicity. | Medium | Medium |
| 21 | **Expand test coverage** — Add integration tests (e.g., Playwright) for the full UI flow: load roster, generate bracket, pick winners, share. | Medium | High |
| 22 | **Add end-to-end share URL tests** — Verify compress/decompress round-trip across browsers. | Low | Medium |
| 23 | **URL shortener integration** — For share links that exceed platform limits (SMS, Twitter), auto-shorten via a service. | Low | Medium |

---

## Suggested Starting Order

For maximum impact with minimal risk:

1. **#1** — Serverless PDF (eliminates the biggest pain point: local Python dependency)
2. **#5** — Animated transitions (most visible polish for users)
3. **#21** — E2E tests (safety net before bigger changes)
4. **#8** — Drag-to-reorder (most requested interactive feature)
5. **#10** — Mobile vertical bracket (expands audience)
6. **#20** — Modularize codebase (enables faster future development)
7. **#12-15** — Multiplayer (the transformative feature set)
