# Design — Chitragupta Ledger

**Spec:** `requirements.md` · **Category:** Kiroween 2026 — Costume Contest

## 1. Architecture

A zero-dependency static web app. No build step, no bundler, no framework,
no npm. Three files plus assets-free styling:

```
index.html   — semantic structure: court header, karma gauge, entry form,
               ledger book, verdict section, footer
styles.css   — the full design system (court theme) + animations
app.js       — state, persistence, rendering, verdict rules, canvas export
```

`app.js` is organised in small single-purpose sections:

| Section | Responsibility |
|---|---|
| `Store` | Load/save state from `localStorage`; seed demo data on first run |
| `Money` | ₹ formatting (`Intl.NumberFormat('en-IN')`), parsing/validation |
| `Karma` | Papa/Punya totals, net score, gauge proportions, streak |
| `Render` | Header totals, gauge, ledger book (grouped + filtered), verdict |
| `Form` | Type→category mapping, validation, submit, quill animation |
| `Verdict` | Monthly aggregation, verdict-line rule table, PNG canvas export |
| `Ambience` | Torch toggle, `prefers-reduced-motion` default |

Rendering is string-template based with a single `renderAll()` after each
state change. All user text is HTML-escaped before interpolation. Events are
bound once (form submit, filter change, toggle) plus one delegated click
handler on the ledger for delete/confirm buttons.

## 2. Data model

### localStorage schema

Key: **`chitragupta-ledger-v1`** — a single JSON object:

```json
{
  "version": 1,
  "seeded": true,
  "entries": [
    {
      "id": "e-lx3k9a-1",
      "type": "expense | income | saving | deed",
      "amount": 1250.00,
      "category": "Food",
      "note": "Groceries for the week",
      "date": "2026-11-08"
    }
  ]
}
```

- `id`: `e-<base36 timestamp>-<counter>`; unique, stable for delete.
- `date`: ISO `YYYY-MM-DD` (local), so grouping/sorting is lexicographic.
- `amount`: number ≥ 0, max 2 decimals; deed entries may be 0.

### Derived values (never stored)

- **Papa total** = Σ expense amounts.
- **Punya total** = Σ income + Σ saving + (₹1 × deed count).
- **Net karma** = Punya − Papa.
- **Streak** = consecutive days with ≥1 entry ending today (or yesterday if
  today is still unwritten).
- **Monthly aggregates** for the Verdict are computed by filtering entries
  to the current `YYYY-MM`.

### Categories by type

| Type | Side | Categories |
|---|---|---|
| expense | Papa | Food, Travel, Bills, Shopping, Health, Entertainment, Other |
| income | Punya | Salary, Business, Gift, Interest, Other |
| saving | Punya | Bank deposit, Mutual fund, Gold, Cash reserve, Other |
| deed | Punya | Helped someone, Donation, Taught/shared, Kindness, Other |

## 3. Design system — the Yama-court theme

Full rules live in `.kiro/steering/design-system.md`. Summary:

### Palette

| Token | Value | Use |
|---|---|---|
| `--ink` | `#12100d` | page background (deep charcoal) |
| `--coal` | `#1c1915` | panels, header |
| `--coal-2` | `#26221c` | raised panels, inputs |
| `--gold` | `#c9a227` | antique gold — borders, headings, Punya |
| `--gold-bright` | `#e8c85a` | highlights, hover |
| `--parchment` | `#efe3c2` | ledger page background |
| `--parchment-ink` | `#2e2417` | text on parchment |
| `--ember` | `#e05d2a` | Papa / torch flame |
| `--ash` | `#a89f8d` | muted text on dark |
| `--bone` | `#f2ead8` | primary text on dark |

### Typography

- **Tamil display headings:** `'Catamaran', 'Noto Sans Tamil', system-ui`
  via Google Fonts (Catamaran carries Tamil glyphs); fallback chain ends in
  system fonts so the app is complete offline.
- **UI / body:** system stack (`-apple-system, 'Segoe UI', Roboto, …`).
- **Ledger hand:** `'Segoe Print', 'Comic Sans MS', cursive` fallback stack
  used sparingly for entry notes on parchment — system fonts only, no files.

### Components

- **Court header** — gopuram silhouette made of CSS gradients/SVG steps,
  twin torch glows (radial-gradient flames, flicker animation), the Tamil
  title `சித்திரகுப்தர் கணக்கு` in gold display type, English subtitle,
  ambience toggle.
- **Karma gauge** — a "scales" bar: gold segment vs ember segment with a
  centre notch; segment widths transition over 600 ms; totals at each end;
  state line below ("The scales tip toward Punya…").
- **Entry form** — dark panel, gold hairline border; type chosen via a
  4-way segmented control (chips with glyphs 📜 💰 🏺 🙏); amount field with
  ₹ prefix; category select rebuilt per type.
- **Ledger book** — parchment cards with a red ruled margin line (CSS
  gradient), torn/aged edge via layered gradients; each date is a "page"
  with a stitched spine shadow; entries written in dark ink; new entries
  animate in with a quill write-in (fade + slight left-write mask).
- **Verdict card** — judgement document on dark stock: double gold border,
  wax-seal disc (radial gradient, ⚖ glyph), figures in tabular numerals,
  verdict line in large display type.
- **Torches** — pure CSS: a bowl (border-radius trapezoid) + flame
  (border-radius blob, `flicker` keyframes scaling/skewing with a warm
  box-shadow glow). No images.

### Motion

- `flicker` (torches, 1.6 s ease-in-out infinite alternate, randomised via
  two duration variants).
- `writeIn` (new entry: opacity + clip reveal, 450 ms).
- `pageIn` (ledger groups fade/slide on first paint).
- Gauge width transition 600 ms.
- All motion disabled when ambience is OFF or
  `prefers-reduced-motion: reduce`.

### Responsive

- Single column, max-width 860 px shell.
- ≥640 px: form fields in two columns; verdict figures in a row.
- <640 px: everything stacks; gauge labels shrink; verdict card padding
  tightens. Verified target: 360 px wide phone, no horizontal scroll.

## 4. Verdict rule table (from requirements §5)

Evaluated in order against current-month data; `sr` = savings rate %.

| # | Condition | Line |
|---|---|---|
| a | no entries this month | "The court awaits your first deed." |
| b | sr ≥ 30 and deeds ≥ 1 | "Swarga's gates stand open — a month of merit." |
| c | sr ≥ 30 | "The scales smile upon you. Swarga path is clear." |
| d | sr ≥ 10 | "A guarded month. Yamadutas find little to seize." |
| e | sr ≥ 0 | "The court watches. Spend with a steadier hand." |
| f | sr < 0 and Papa > Punya | "Naraka's clerks are sharpening their quills — debts outweigh deeds." |
| g | otherwise | "Yama drums his fingers. Turn the page and do better." |

## 5. Canvas verdict card

Offscreen canvas 1080 × 1350 (4:5, share-friendly). Drawn with Canvas 2D
only: charcoal fill, double gold rule border, seal circle, "⚖ YAMA'S
VERDICT", month, five figure rows, wrapped verdict line, footer
"சித்திரகுப்தர் கணக்கு · Chitragupta Ledger · Kiroween 2026" (Tamil drawn
with the loaded page font if available, else omitted silently). Exported via
`canvas.toBlob` → object URL → `<a download="yamas-verdict.png">`.

## 6. Error handling

- Corrupt/absent storage → empty state (never throw).
- Invalid form input → inline error text under the form, no state change.
- Canvas unsupported → hide the download button.

## 7. Testing

- Hook-driven smoke check (`.kiro/hooks/smoke-check-on-save.md`).
- Manual verification: local static server, HTTP 200 for `/`, `styles.css`,
  `app.js`; `node --check app.js` for syntax; add/delete/filter/verdict/
  download flows clicked through in a browser.
