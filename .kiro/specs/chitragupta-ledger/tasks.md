# Tasks — Chitragupta Ledger

Implementation plan generated from `requirements.md` + `design.md`.
Check items off as they land.

## 1. Spec & steering foundation (Kiro layer)
- [x] 1.1 Write `requirements.md` (EARS-style, 9 requirements)
- [x] 1.2 Write `design.md` (architecture, localStorage schema, design system)
- [x] 1.3 Write `.kiro/steering/design-system.md` (court theme rules)
- [x] 1.4 Write `.kiro/hooks/smoke-check-on-save.md` (agent hook definition)

## 2. Structure & theme
- [x] 2.1 `index.html` — header (torches, Tamil title, ambience toggle),
      karma gauge, entry form, ledger book, verdict section, footer
- [x] 2.2 `styles.css` — palette tokens, gopuram silhouette, torch flicker,
      parchment pages, verdict card, responsive rules, reduced-motion support

## 3. Core logic (`app.js`)
- [x] 3.1 Store: load/save `chitragupta-ledger-v1`, corrupt-data fallback
- [x] 3.2 Seed data: 6 demo entries in the current month + seeded flag
- [x] 3.3 Money formatting (en-IN ₹) + entry validation (Req 1)
- [x] 3.4 Form: type chips, per-type categories, submit, quill animation
- [x] 3.5 Karma: Pava/Punya totals, net score, animated gauge, streak (Req 3)
- [x] 3.6 Ledger: date-grouped pages, day nets, filter, inline-confirm
      delete (Req 2, 4)
- [x] 3.7 Verdict: monthly aggregates, savings rate, top leak, rule-table
      verdict line (Req 5)
- [x] 3.8 Verdict PNG export via canvas, 1080×1350 (Req 6)
- [x] 3.9 Ambience toggle + `prefers-reduced-motion` default (Req 7)
- [x] 3.10 Clear-the-book two-step reset (Req 2.4)

## 4. Repo completeness
- [x] 4.1 `LICENSE` (MIT)
- [x] 4.2 `README.md` — overview, run instructions, Kiro workflow, demo script

## 5. Verification
- [x] 5.1 Serve locally; curl `/`, `/styles.css`, `/app.js` → HTTP 200
- [x] 5.2 `node --check app.js` passes (or equivalent syntax check)
- [ ] 5.3 Click-through: add expense → gauge tips to Pava; add saving →
      tips back; delete; filter; verdict renders; PNG downloads
- [x] 5.3 Logic/render flows verified headlessly (DOM-stub harness):
      seed=6, totals Punya ₹50,001 / Pava ₹5,690, verdict rate 87.4%,
      top leak Bills, Swarga verdict line, streak 6, filter hides
      non-matching rows, empty-month verdict. Browser click-through of
      animations/PNG download remains for the demo recording session.
