# Chitragupta Ledger — The Book of Deeds & Debts

A personal money + habit ledger kept the way **Chitragupta**, the divine
accountant of Yama's court, keeps accounts in his great book.

Every expense is written as a **Pava** (debt) entry. Every income, saving and
good deed is written as **Punya** (merit). The app keeps the karma scales
balanced in public view, stores your entries as parchment pages of the great
book, and whenever you ask, the court pronounces **Yama's Verdict** — a
judgement of your month that you can download and share as an image card.

Built for **Kiroween 2026 — Costume Contest** (the costume: a haunting,
torch-lit Yama's-court UI; the function: a real, working ledger).

## Run it

No build step, no npm, no server required:

- **Simplest:** open `index.html` in any modern browser.
- **Or serve it:** `python3 -m http.server 8000` in this folder, then visit
  `http://localhost:8000`.
- **Deploy:** drop the folder on any static host (Vercel, Netlify, GitHub
  Pages, S3). It is three files: `index.html`, `styles.css`, `app.js`.

Data lives in your browser's `localStorage` (key `chitragupta-ledger-v1`).
Nothing leaves the device. On first run the book is seeded with six demo
entries in the current month so the scales and verdict are alive immediately;
delete them or use **Clear the book** in the footer.

## Features

- **Write in the book** — add Expense / Income / Saving / Good deed entries
  with amount (₹), per-type categories, note and date, with validation
  (no ₹0 expenses, no future dates). New entries appear with a quill
  write-in animation.
- **Karma scales** — live Punya vs Pava totals, an animated gold/ember
  gauge, net karma, and a recording streak (consecutive days written).
- **The Ledger Book** — entries grouped by date on parchment pages with day
  nets, filterable to Pava or Punya, with inline two-step "strike out"
  deletion and a clear-the-book reset.
- **Yama's Verdict** — current-month judgement: money in/out, saved, deeds,
  savings rate, the "greatest leak" category, and one verdict line chosen
  by a rule table (from *"Swarga's gates stand open"* down to *"Naraka's
  clerks are sharpening their quills"*).
- **Share card** — one click renders the verdict to a 1080×1350 PNG with
  the Canvas 2D API (no libraries) and downloads it.
- **Court torches** — flickering CSS torch flames and a warm vignette;
  toggle them off any time. `prefers-reduced-motion` starts with the court
  dimmed. Ambience is visual-only; there are no audio files.
- **Zero copyrighted assets** — all visuals are CSS gradients, one inline
  SVG gopuram silhouette, and Unicode/emoji glyphs. The only external
  request is an optional Google Fonts stylesheet (Catamaran, which carries
  the Tamil display headings) with a complete system-font fallback.

## How it was built with Kiro

This project follows Kiro's spec-driven workflow; the `/.kiro` directory is
committed at the repo root, as the hackathon requires:

1. **Specs first** — `.kiro/specs/chitragupta-ledger/`
   - `requirements.md` — nine requirements in EARS style (entry CRUD, karma
     balance, ledger book, verdict, share card, ambience, seeding,
     presentation rules) with numbered acceptance criteria.
   - `design.md` — architecture (Store / Money / Karma / Render / Form /
     Verdict / Ambience), the `localStorage` schema, the category tables,
     the verdict rule table, and the canvas-card layout.
   - `tasks.md` — the implementation checklist generated from the two
     documents above; every task was checked off as it landed.
2. **Steering** — `.kiro/steering/design-system.md` pins the Yama-court
   design rules (palette tokens, Tamil typography rules, parchment texture,
   motion budget, zero-copyrighted-assets rule) so generated UI stays on
   theme across every file and iteration.
3. **Hooks** — `.kiro/hooks/smoke-check-on-save.md` (+ `.hook.json` mirror)
   defines an agent hook that, on every save of the app files, syntax-checks
   `app.js`, verifies the static server returns HTTP 200 for the page and
   both assets, and fails if any external URL sneaks in beyond the one
   permitted Google Fonts link.
4. **Implementation** — `index.html`, `styles.css` and `app.js` were
   generated to satisfy the specs task by task, then verified against the
   acceptance criteria (see the demo script below).

## Demo script (< 3 minutes)

1. **(0:00) The court opens** — dark hall, torches flickering, gopuram
   silhouette, Tamil title "சித்திரகுப்தர் கணக்கு". The book is already
   alive: seeded salary, bills, groceries, a SIP and a good deed.
2. **(0:25) The scales** — point at the karma gauge: Punya gold vs Pava
   ember, net karma, and the recording streak.
3. **(0:45) Write a deed of debt** — add today's lunch as an Expense. Watch
   the quill write-in animation and the gauge tip toward Pava in real time.
4. **(1:15) Tip it back** — add a Saving (SIP) and a Good deed. The scales
   swing to Punya; the streak holds.
5. **(1:40) Turn the pages** — scroll the parchment ledger, filter to Pava
   only, strike out one entry with the two-step delete.
6. **(2:05) Yama's Verdict** — the judgement card: totals, savings rate,
   greatest leak, and the verdict line. Click **Download verdict card** and
   show the PNG.
7. **(2:35) How Kiro built it** — flash the `/.kiro` folder: requirements,
   design, tasks, steering, hook. Close on the footer: *"Built with Kiro
   for Kiroween 2026."*

## License

MIT — see `LICENSE`.
