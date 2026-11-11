# Requirements — Chitragupta Ledger

**Feature:** Chitragupta Ledger — The Book of Deeds & Debts
**Category:** Kiroween 2026 — Costume Contest
**Version:** 1.0 (v1 scope, locked 2026-11-10)

## Introduction

In Hindu mythology, Chitragupta is the divine accountant of Yama's court who
records every deed of every soul in his great book. Chitragupta Ledger re-skins
a personal money + habit tracker as that book: expenses are recorded as
**Pava** (debt/sin) entries and savings, income and good deeds as **Punya**
(merit) entries. The app keeps a running karma balance, presents the entries
as pages of Chitragupta's book, and at any time can pronounce **Yama's
Verdict** — a court-style judgement of the current month, exportable as a
shareable image card.

The app is a zero-dependency static web app (HTML/CSS/JS), persists data in
`localStorage`, and runs by opening `index.html` or via any static server.
No backend, no accounts, no external assets other than an optional Google
Fonts stylesheet (with full system-font fallback).

## Glossary

- **Entry** — one recorded transaction or deed.
- **Pava** — the "debt" side of the ledger. Expense entries count as Pava.
- **Punya** — the "merit" side of the ledger. Income, saving and good-deed
  entries count as Punya.
- **Karma balance** — Punya total minus Pava total, plus a visual gauge.
- **Ledger book** — the date-grouped, page-styled list of entries.
- **Verdict** — the monthly summary judgement card.
- **Ambience** — the optional torch-glow visual atmosphere mode.

---

## Requirement 1 — Entry creation (CRUD: Create)

**User story:** As a user keeping my accounts like Chitragupta, I want to add
an entry in under ten seconds, so that no expense, earning, saving or good
deed goes unrecorded in the book.

### Acceptance criteria

1. WHEN the user opens the add-entry form, THE SYSTEM SHALL offer four entry
   types: Expense (Pava), Income (Punya), Saving (Punya), Good deed (Punya),
   with Expense selected by default.
2. THE SYSTEM SHALL require an amount greater than ₹0 for Expense, Income and
   Saving entries; IF the amount is empty, zero, negative or non-numeric,
   THEN THE SYSTEM SHALL refuse the entry and show an inline error.
3. FOR a Good deed entry, THE SYSTEM SHALL make the amount optional and treat
   a missing amount as ₹0 while still counting the deed on the Punya side with
   a fixed deed weight of ₹1 for gauge purposes.
4. THE SYSTEM SHALL provide a category select whose options adapt to the
   chosen type (e.g. Food, Travel, Bills, Shopping, Health, Other for
   Expense; Salary, Business, Gift, Other for Income).
5. THE SYSTEM SHALL provide an optional free-text note and a date input
   defaulting to today; dates in the future SHALL be rejected.
6. WHEN a valid entry is submitted, THE SYSTEM SHALL persist it to
   `localStorage` immediately, prepend it to the ledger book, animate it with
   a quill write-in effect, update the karma balance, and confirm with the
   line "✒ Recorded in the book."
7. THE SYSTEM SHALL allow amounts with up to 2 decimal places and display all
   amounts in Indian Rupee format (₹ with `en-IN` digit grouping).

## Requirement 2 — Entry deletion and data reset (CRUD: Delete)

**User story:** As a user, I want to remove a wrongly written entry, so that
the book stays truthful.

### Acceptance criteria

1. EACH entry row in the ledger book SHALL expose a delete control.
2. WHEN the user activates delete, THE SYSTEM SHALL ask for confirmation
   inline (the control turns into "Strike out? ✕ / Keep") rather than using a
   blocking browser dialog.
3. WHEN deletion is confirmed, THE SYSTEM SHALL remove the entry from
   `localStorage`, animate the row out, and recompute the karma balance and
   verdict.
4. THE SYSTEM SHALL provide a "Clear the book" control in the footer that,
   after an inline two-step confirmation, removes ALL entries and the seeded
   flag, returning the app to an empty-ledger state.

## Requirement 3 — Karma (Punya–Pava) balance

**User story:** As a user, I want to see at a glance whether my month is
tilting toward merit or debt, so that the balance itself motivates better
choices.

### Acceptance criteria

1. THE SYSTEM SHALL compute Pava total as the sum of all Expense amounts and
   Punya total as the sum of all Income + Saving amounts plus ₹1 per Good
   deed entry.
2. THE SYSTEM SHALL display both totals and the net karma score
   (Punya − Pava) in the court header, formatted in ₹.
3. THE SYSTEM SHALL render an animated horizontal gauge whose gold (Punya)
   and ember (Pava) proportions animate to their new values within 600 ms of
   any change.
4. WHEN Punya exceeds Pava, THE SYSTEM SHALL label the state "The scales tip
   toward Punya"; WHEN Pava exceeds Punya, "The scales tip toward Pava";
   WHEN equal or both zero, "The scales rest in balance".
5. THE SYSTEM SHALL compute a daily streak: the count of consecutive days
   ending today (or yesterday, if today has no entry yet) that contain at
   least one entry, and display it as "🔥 N-day recording streak".

## Requirement 4 — Ledger book view

**User story:** As a user, I want my entries to read like pages of
Chitragupta's book grouped by day, so that reviewing my month feels like
turning the pages of my own account.

### Acceptance criteria

1. THE SYSTEM SHALL group entries by date, most recent date first, with each
   group headed by a page-style date banner (e.g. "Tuesday, 10 November
   2026").
2. EACH entry row SHALL show: a type glyph, category, note (if any), signed
   amount (+ ₹ for Punya, − ₹ for Pava), and whether it weighs on the Punya
   or Pava side.
3. THE SYSTEM SHALL provide a filter control with options All / Pava
   (Expenses) / Punya (Income, Saving, Deeds); WHEN a filter is active, only
   matching entries SHALL be shown and the group day-totals SHALL reflect the
   filter.
4. EACH date group SHALL show the day's net (Punya − Pava for that day).
5. IF there are no entries (or none match the filter), THE SYSTEM SHALL show
   an empty-state page reading "The page is blank. Write your first deed."
6. THE ledger SHALL be styled as parchment pages with a ruled margin line,
   per the design system in `design.md`.

## Requirement 5 — Yama's Verdict (monthly summary)

**User story:** As a user, I want the court to judge my month, so that a
single dramatic summary tells me how I did and what to fix.

### Acceptance criteria

1. THE SYSTEM SHALL scope the verdict to the current calendar month.
2. THE verdict SHALL show: total money in (Income), total money out
   (Expenses), total saved (Saving), good deeds count, and the month's net
   karma.
3. THE SYSTEM SHALL compute the savings rate as
   (Income − Expenses) / Income × 100 for the month; IF monthly income is
   zero, THE SYSTEM SHALL display the savings rate as "—".
4. THE SYSTEM SHALL identify the top expense category of the month by total
   amount and display it as "Greatest leak: <category>".
5. THE SYSTEM SHALL choose exactly one verdict line by these rules, in order:
   - a. IF there are no entries this month → "The court awaits your first
        deed."
   - b. ELSE IF savings rate ≥ 30% AND deeds ≥ 1 → "Swarga's gates stand
        open — a month of merit."
   - c. ELSE IF savings rate ≥ 30% → "The scales smile upon you. Swarga
        path is clear."
   - d. ELSE IF savings rate ≥ 10% → "A guarded month. Yamadutas find little
        to seize."
   - e. ELSE IF savings rate ≥ 0% → "The court watches. Spend with a steadier
        hand."
   - f. ELSE IF Pava total > Punya total AND savings rate < 0% → "Naraka's
        clerks are sharpening their quills — debts outweigh deeds."
   - g. ELSE → "Yama drums his fingers. Turn the page and do better."
6. THE verdict SHALL be rendered as a court judgement card: dark seal header
   "⚖ Yama's Verdict", the month name, the figures, and the verdict line in
   display type.

## Requirement 6 — Verdict share card (PNG export)

**User story:** As a user, I want to download my verdict as an image, so that
I can share my month's judgement.

### Acceptance criteria

1. THE verdict section SHALL provide a "Download verdict card" button.
2. WHEN activated, THE SYSTEM SHALL draw the verdict card onto an offscreen
   `<canvas>` (1080 × 1350 px) using only Canvas 2D APIs — dark charcoal
   background, antique-gold border and seal, month, figures, verdict line
   (word-wrapped), and the footer "Chitragupta Ledger · Kiroween 2026".
3. THE SYSTEM SHALL trigger a download of the canvas as `yamas-verdict.png`.
4. THE export SHALL NOT use any external library, font file or image asset;
   Tamil text in the canvas SHALL be drawn only if a Tamil-capable font is
   available to the canvas, otherwise English text alone is acceptable.

## Requirement 7 — Ambience toggle

**User story:** As a user, I want to light or dim the court's torches, so
that the atmosphere matches my mood and my battery.

### Acceptance criteria

1. THE SYSTEM SHALL provide an ambience toggle in the header labelled
   "🔥 Court torches".
2. WHEN ambience is ON (default), torch-glow elements SHALL flicker via CSS
   animation and a soft radial vignette SHALL glow behind the header.
3. WHEN ambience is OFF, all flicker animations SHALL stop, the vignette
   SHALL be removed, and THE SYSTEM SHALL honour
   `prefers-reduced-motion` by defaulting ambience to OFF for users who
   request reduced motion.
4. The ambience is visual-only in v1: THE SYSTEM SHALL NOT load or play any
   audio file.

## Requirement 8 — First-run seed data and persistence

**User story:** As a first-time visitor (or a demo viewer), I want the book
to already hold a few entries, so that the karma gauge and verdict are alive
immediately.

### Acceptance criteria

1. IF `localStorage` contains no entries AND no "seeded" flag, THE SYSTEM
   SHALL seed 6 plausible demo entries dated today and on the five days
   before it (salary income, two expenses, one saving, one good deed, one
   more expense), so the recording streak and the current-month verdict
   are alive on first load; THE SYSTEM SHALL set the seeded flag and treat
   them as normal deletable entries.
2. Seeded entries SHALL be indistinguishable from user entries in the UI
   (no "demo" badges).
3. ALL state SHALL persist across reloads via `localStorage` under the key
   `chitragupta-ledger-v1`.
4. IF stored data is corrupt or fails to parse, THE SYSTEM SHALL fall back
   to the empty state without throwing.

## Requirement 9 — Presentation and responsibility (Costume Contest)

**User story:** As a judge or visitor on a phone, I want the court to look
haunting and polished at any screen size, so that the costume never breaks
the function.

### Acceptance criteria

1. THE SYSTEM SHALL use the design system of `design.md`: deep charcoal
   background, antique-gold accents, parchment ledger pages, Tamil display
   headings with English UI text.
2. THE layout SHALL be fully usable at 360 px width: the add-entry form, the
   gauge and the verdict card stack vertically without horizontal scroll.
3. THE footer SHALL read "Built with Kiro for Kiroween 2026".
4. THE SYSTEM SHALL include zero copyrighted images, fonts-as-files, music
   or other third-party assets; all visuals are CSS/SVG/emoji glyphs.
