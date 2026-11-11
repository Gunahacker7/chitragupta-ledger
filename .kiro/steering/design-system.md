# Steering — Chitragupta Ledger Design System

These rules govern every visual decision in this project. When generating or
editing UI code, follow them exactly; if a request conflicts with this file,
this file wins unless a human overrides it in the spec.

## The costume

The app is **Yama's court at night**: a dark hall, two torches, and
Chitragupta writing in a great parchment book with a golden quill. The UI
must feel haunting and ceremonial, but every control stays obvious and
usable. Costume serves function, never hides it.

## Palette (CSS custom properties, no other colours)

- `--ink: #12100d` — page background, deep charcoal-brown black.
- `--coal: #1c1915` — panels and header.
- `--coal-2: #26221c` — raised surfaces, inputs.
- `--gold: #c9a227` — antique gold: borders, headings, the Punya side.
- `--gold-bright: #e8c85a` — hover/highlight only.
- `--parchment: #efe3c2` — ledger page surfaces.
- `--parchment-ink: #2e2417` — text on parchment.
- `--ember: #e05d2a` — flame orange: the Pava side, warnings, torch fire.
- `--ash: #a89f8d` — muted text on dark.
- `--bone: #f2ead8` — primary text on dark.

Rules:
- Gold is an accent, never a background for body text areas.
- Pava is always ember; Punya is always gold. Never swap them.
- No gradients that introduce new hues; warm black→coal and gold fades only.

## Typography

- Tamil display headings (app title, verdict title): font stack
  `'Catamaran', 'Noto Sans Tamil', system-ui, sans-serif`, loaded from
  Google Fonts with `display=swap`; **the layout must remain correct if the
  font never loads** (system fallback).
- English UI: system stack only. No downloaded Latin font files.
- Numerals in totals: `font-variant-numeric: tabular-nums`.
- Headings letter-spacing slightly wide on Latin small-caps labels
  (`.court-label`), normal on Tamil (Tamil script must not be letter-spaced).

## Shape & texture

- Ledger = parchment: `--parchment` background, a vertical ruled margin
  line in faded red (`rgba(176, 58, 42, .45)`) at 44 px from the left,
  faint horizontal ruling, soft inner shadow at the spine (left edge).
- Cards on dark: `--coal` with a 1 px gold hairline at 35% opacity and a
  14 px radius; verdict card uses a double gold border (outer 2 px, inner
  1 px offset 6 px) like a stamped judgement.
- Gopuram silhouette behind the header: pure CSS/SVG stepped-pyramid shapes
  in near-black against a faint gold horizon glow. No images.
- Wax seal: circular radial-gradient disc (deep red `#7e1f16` centre to
  `#5c130c` edge) with the ⚖ glyph in gold.

## Motion

- Torch flames flicker: `flicker` keyframes, 1.4–1.9 s, alternate, subtle
  scale/skew + glow shadow. Two torches use different durations so they
  never sync.
- New ledger entries: `writeIn` — opacity 0→1 with a left-to-right clip
  reveal (as if being written), 450 ms.
- Gauge segments: width transition 600 ms ease.
- Deleting an entry: fade + height collapse, 300 ms.
- **All animation is disabled** when the ambience toggle is OFF or the user
  has `prefers-reduced-motion: reduce`. Ambience OFF is the default for
  reduced-motion users.

## Iconography & assets

- **Zero copyrighted assets.** No stock photos, no icon fonts, no image
  files, no audio files.
- Glyphs are Unicode/emoji only: 🔥 torches, ⚖ scales, ✒ quill, 📜 scroll,
  💰 income, 🏺 saving pot, 🙏 deed, 🪔 lamp.
- Decorative shapes are CSS gradients/borders or inline SVG drawn for this
  project.

## Layout

- Centred shell, max-width 860 px, 16 px side padding; phone-first.
- Vertical order: court header → karma scales → entry form → ledger book →
  Yama's Verdict → footer.
- Footer always contains: "Built with Kiro for Kiroween 2026".
- No horizontal scrolling at 360 px; test every new component at that width.

## Voice (microcopy)

- Courtly but plain English; short sentences.
- Amounts always `₹` with en-IN grouping.
- Punya/Pava terminology used consistently; never use "good/bad karma"
  wording — the scales imagery carries the judgement.
- Tamil appears in display headings only (title, verdict heading), always
  paired with an English equivalent nearby.
