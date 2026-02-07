"""
MN Fun Squad — 64-Team Tournament Bracket PDF Generator
========================================================
Generates a printable landscape PDF bracket from a picks JSON file
or from the Flask endpoint that the HTML picker calls.

Usage (standalone):
    python generate_pdf.py                        # uses teams.json, no picks
    python generate_pdf.py --picks bracket_picks.json   # uses saved picks

Usage (server mode — called by the HTML picker):
    python generate_pdf.py --serve
    → Starts Flask on http://localhost:5000
    → POST /generate-pdf  with JSON body  { "picks": [...] }
"""

import argparse
import json
import math
import os
import random
import sys
from io import BytesIO

from reportlab.lib.pagesizes import landscape, LETTER
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.pdfgen import canvas


# ── Colours ────────────────────────────────────────────────
BG       = HexColor("#FFFFFF")
LINE     = HexColor("#333333")
TEXT     = HexColor("#1a1a1a")
SEED_CLR = HexColor("#888888")
WIN_CLR  = HexColor("#00875a")
ACCENT   = HexColor("#4a47a3")

ROUND_NAMES = [
    "Round of 64", "Round of 32", "Sweet 16",
    "Elite 8", "Final Four", "Championship",
]


def load_teams(path="teams.json"):
    """Load team names from a JSON array file."""
    with open(path, "r", encoding="utf-8") as f:
        teams = json.load(f)
    if len(teams) > 64:
        teams = teams[:64]
    while len(teams) < 64:
        teams.append(f"BYE {len(teams)+1}")
    return teams


def build_bracket_from_teams(teams):
    """Shuffle teams and create empty bracket rounds."""
    random.shuffle(teams)
    rounds = []
    # Round 0
    r0 = []
    for i in range(0, 64, 2):
        r0.append({"top": teams[i], "bottom": teams[i + 1], "winner": None})
    rounds.append(r0)
    count = 32
    for _ in range(5):
        count //= 2
        rounds.append([{"top": None, "bottom": None, "winner": None} for _ in range(count)])
    return rounds


def build_bracket_from_picks(picks):
    """Convert the JSON picks structure (from the HTML picker) to internal rounds."""
    rounds = []
    for rnd in picks:
        matchups = []
        for m in rnd["matchups"]:
            matchups.append({
                "top": m.get("top"),
                "bottom": m.get("bottom"),
                "winner": m.get("winner"),
            })
        rounds.append(matchups)
    return rounds


# ── PDF Drawing ────────────────────────────────────────────

def draw_bracket_pdf(rounds, out_buffer=None, filename="bracket.pdf"):
    """
    Draw the full bracket to a PDF.
    If out_buffer is provided, writes there (for Flask).
    Otherwise writes to `filename`.
    """
    page_w, page_h = landscape(LETTER)  # 11 x 8.5 inches
    target = out_buffer if out_buffer else filename
    c = canvas.Canvas(target, pagesize=landscape(LETTER))
    c.setTitle("MN Fun Squad — Tournament Bracket")

    # Title
    c.setFont("Helvetica-Bold", 16)
    c.setFillColor(ACCENT)
    c.drawCentredString(page_w / 2, page_h - 36, "MN Fun Squad — Hall of Fame Bracket")
    c.setFillColor(TEXT)

    # Layout constants
    num_rounds = len(rounds)  # typically 6
    margin_x = 32
    margin_top = 56
    margin_bot = 24
    usable_w = page_w - 2 * margin_x
    usable_h = page_h - margin_top - margin_bot
    col_w = usable_w / num_rounds
    slot_h = 14
    slot_gap = 2
    matchup_h = slot_h * 2 + slot_gap

    for ri, rnd in enumerate(rounds):
        x = margin_x + ri * col_w
        n_matchups = len(rnd)
        scale = 2 ** ri
        block_h = matchup_h * scale
        total_h = block_h * n_matchups
        y_start = page_h - margin_top - (usable_h - total_h) / 2

        # Round label
        c.setFont("Helvetica-Bold", 6.5)
        c.setFillColor(ACCENT)
        label = ROUND_NAMES[ri] if ri < len(ROUND_NAMES) else f"Round {ri+1}"
        c.drawString(x + 2, page_h - margin_top + 8, label)
        c.setFillColor(TEXT)

        for mi, m in enumerate(rnd):
            my = y_start - mi * block_h - (block_h - matchup_h) / 2

            for idx, pos in enumerate(["top", "bottom"]):
                sy = my - idx * (slot_h + slot_gap)
                name = m.get(pos) or "—"
                is_winner = m.get("winner") and m["winner"] == name and name != "—"

                # Background box
                c.setStrokeColor(WIN_CLR if is_winner else LINE)
                c.setLineWidth(0.7 if is_winner else 0.4)
                c.rect(x + 2, sy - slot_h, col_w - 12, slot_h, stroke=1, fill=0)

                # Text
                c.setFont("Helvetica-Bold" if is_winner else "Helvetica", 6)
                c.setFillColor(WIN_CLR if is_winner else TEXT)
                # Truncate long names
                display = name[:22] + ("…" if len(name) > 22 else "")
                c.drawString(x + 6, sy - slot_h + 4, display)
                c.setFillColor(TEXT)

        # Connector lines to next round
        if ri < num_rounds - 1:
            for mi in range(n_matchups):
                my = y_start - mi * block_h - (block_h - matchup_h) / 2
                mid_y = my - slot_h - slot_gap / 2
                x_right = x + col_w - 10
                x_next = x + col_w + 2
                c.setStrokeColor(LINE)
                c.setLineWidth(0.3)
                c.line(x_right, mid_y, x_next, mid_y)

    # Champion callout
    last = rounds[-1][0] if rounds else {}
    champ = last.get("winner")
    if champ:
        c.setFont("Helvetica-Bold", 12)
        c.setFillColor(WIN_CLR)
        c.drawCentredString(page_w / 2, margin_bot + 6, f"Champion:  {champ}")

    c.save()
    return target


# ── Flask Server ───────────────────────────────────────────

def run_server():
    try:
        from flask import Flask, request, send_file, jsonify
        from flask_cors import CORS
    except ImportError:
        print("Flask / flask-cors not installed. Run:  pip install flask flask-cors")
        sys.exit(1)

    app = Flask(__name__)
    CORS(app)

    @app.route("/generate-pdf", methods=["POST"])
    def generate_pdf_endpoint():
        data = request.get_json(force=True)
        picks = data.get("picks")
        if not picks:
            return jsonify({"error": "No picks provided"}), 400
        rounds = build_bracket_from_picks(picks)
        buf = BytesIO()
        draw_bracket_pdf(rounds, out_buffer=buf)
        buf.seek(0)
        return send_file(buf, mimetype="application/pdf",
                         as_attachment=True, download_name="bracket.pdf")

    print("PDF server running at http://localhost:5000")
    app.run(host="0.0.0.0", port=5000, debug=False)


# ── CLI ────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Generate tournament bracket PDF")
    parser.add_argument("--picks", help="Path to bracket_picks.json from the HTML picker")
    parser.add_argument("--teams", default="teams.json", help="Path to teams JSON array")
    parser.add_argument("--output", default="bracket.pdf", help="Output PDF filename")
    parser.add_argument("--serve", action="store_true", help="Run Flask PDF server")
    args = parser.parse_args()

    if args.serve:
        run_server()
        return

    if args.picks:
        with open(args.picks, "r", encoding="utf-8") as f:
            picks = json.load(f)
        rounds = build_bracket_from_picks(picks)
    else:
        teams = load_teams(args.teams)
        rounds = build_bracket_from_teams(teams)

    draw_bracket_pdf(rounds, filename=args.output)
    print(f"Bracket saved to {args.output}")


if __name__ == "__main__":
    main()
