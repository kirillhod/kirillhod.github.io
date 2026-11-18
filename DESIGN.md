# DESIGN.md

The visual system of **Artwork Tools**: what the page looks like, why, and what has to move
together when something changes. `css/site.css` is the source of truth for values; this file
explains the intent and the couplings. If a number here and the CSS disagree, the CSS wins
and this file is stale.

## 1. Idea

Three tools, equal weight, each one thing you can pick up.

- A **hand of cards**, not a list: cards give every tool the same size and the same amount of
  attention, and a list would have ranked them.
- **Dealing** is arrival: the cards come in from the side and settle into a fan.
- **Inspecting** is picking one up: the card leaves the hand, grows to the centre, and comes
  back. Everything else on the page dims and stops.
- One card is one tool, always in this order: index, kind, art, name, note, actions.

The page is one screen of table: header rule on top, footer rule below, the hand floating
between them. No sections, no scroll on desktop, no chrome that is not a card, a rule, or a
label.

## 2. Palette

Dark only, `color-scheme: dark`. One warm accent. Every colour in a component rule comes from
a token in `:root`; the literals left are one-off shadows, the scrim, the pointer glare, and
the white-alpha pressed tints (`#ffffff0a` on `.action:hover`), which have no other consumer.

| Token | Value | Role |
|---|---|---|
| `--bg` | `#09080c` | page base under the glows |
| `--glow` | `#1d1529` | broad upper glow, behind the hand |
| `--glow-low` | `#150f1e` | lower edge glow, grounds the page |
| `--surface` | `#14111b` | card, middle of the gradient |
| `--surface-top` | `#1d1827` | card, lit top edge |
| `--surface-low` | `#100d16` | card, bottom; also the close button |
| `--art-bed` | `#0b0910` | art window floor, darker than the card |
| `--fg` | `#f3eff8` | primary text |
| `--muted` | `#9c94a9` | labels, notes, footer (6.87:1 on `--bg`) |
| `--line` | `#2b2436` | visible hairline: rules, card border, action border |
| `--line-soft` | `#ffffff0f` | inner frame of the card and the art window |
| `--line-strong` | `#4c405e` | hover border |
| `--gold` | `#dcb56c` | accent: index, primary action, focus ring |
| `--gold-line` | `#dcb56c59` | primary action border (35% accent) |
| `--gold-wash` | `#dcb56c14` | primary action fill (8%) |
| `--gold-wash-strong` | `#dcb56c26` | primary hover fill, inspect halo (15%) |
| `--art-palette` | `#8fc3b1` | card tint, matched to its screenshot |
| `--art-node-atlas` | `#c0a4e6` | card tint |
| `--art-sprites` | `#e2a184` | card tint |

Rules:

- The accent is gold and there is exactly one accent. A second colour would turn a restrained
  table into a dashboard.
- Card tints are keyed to the tool's own art, not to a palette rotation: a card's tint is
  `--art`, set by `.card[data-card="…"]`, and is used by the art window's glow and its SVG
  `currentColor`. A new tool adds a token and one selector.
- The favicon is the AT monogram: white letters on a `#1c1e22` rounded square, in
  `assets/favicon.svg`, with PNG renders at 32, 48, 96, and 192 px. It is a mark, not a
  palette colour, and does not follow `--gold`.
- `meta[name="theme-color"]` must stay equal to `--bg`.

## 3. Typography

Two families, both local: `--font-sans` for content, `--font-mono` for labels. Mono labels are
uppercase with wide tracking — they read as catalogue numbers, not as headings.

| Element | Family | Size | Weight | Tracking | Notes |
|---|---|---|---|---|---|
| `.wordmark` | mono | 0.78rem | 600 | 0.22em | uppercase `h1` |
| `.deck` | mono | 0.64rem | 400 | 0.18em | "3 cards" |
| `.card-head` | mono | 0.6rem | 400 | 0.16em | 0.55rem in landscape |
| `.card-index` | mono | inherits head | 400 | — | gold |
| `.card-name` | sans | 1.12rem | 620 | -0.006em | line-height 1.2, `text-wrap: balance` |
| `.card-note` | sans | 0.9rem | 400 | 0 | line-height 1.45, muted, `text-wrap: pretty` |
| `.action` | mono | 0.62rem | 400 | 0.16em | uppercase |
| `.bottombar` | mono | 0.62rem | 400 | 0.16em | muted, uppercase |
| `.veil-close` | mono | 0.62rem | 400 | 0.16em | uppercase |
| `.veil-hint` | mono | 0.6rem | 400 | 0.16em | uppercase, centred |

Body line-height is 1.55. Rem-based sizes mean 200% text zoom scales the page instead of
clipping it; the card grows with its content (`min-height`, not `height`).

## 4. Page frame

`.table` is a three-row grid — `auto 1fr auto` — at `min-height: 100dvh`:

| Part | Padding | Hairline |
|---|---|---|
| `.table` | `1.5rem clamp(1rem, 4vw, 2.5rem) 1.25rem` | — |
| `.topbar` | `0 0 0.85rem` | bottom `1px --line` |
| `.stage` | `1rem 0` | — |
| `.bottombar` | `0.85rem 0 0` | top `1px --line` |

The stage centres its content (`display: grid; align-content: center`). `.hand-wrap` is the
scroll viewport for narrow screens: `overflow-x: auto`, no scrollbar, `safe center` so an
overflowing hand falls back to its start instead of hiding the first card.

## 5. Card anatomy

```
┌──────────────────────────────────┐  border 1px --line, radius 0.95rem
│ 01                BLENDER ADD-ON │  card-head, mono 0.6rem
│ ┌──────────────────────────────┐ │  card-art, 8:5, radius 0.5rem
│ │                              │ │
│ └──────────────────────────────┘ │
│ Blender Sprites Batch            │  card-name
│ Exporter                         │
│ Batch-render collections into…   │  card-note, muted
│ ┌───────────┐ ┌───────────┐      │  card-actions
│ │ DOWNLOAD  │ │  SOURCE   │      │
│ └───────────┘ └───────────┘      │
└──────────────────────────────────┘
```

- Width `--card-w`; height `min-height: calc(var(--card-w) * 7 / 5)` so the 5:7 proportion is
  a floor, not a cage. Padding `0.9rem 0.9rem 0.8rem`, gap `0.65rem`.
- `.card::before` draws the inner hairline at `inset: 0.32rem`, radius
  `calc(var(--radius-card) - 0.3rem)` — the "printed frame" that makes a flat panel read as a
  card.
- `.card-art` is the fixed window: `aspect-ratio: 8 / 5`, `flex: 0 0 auto`. A screenshot fills
  it edge to edge (`object-fit: cover`, no padding); an SVG emblem sits inside 0.55rem of
  padding on a `120 × 84` viewBox. Both cases keep the window identical, so cards stay equal.
- `.card-body` is `flex: 1 1 auto` with a column layout: it absorbs the extra height in the
  stretched landscape row and keeps the actions on the bottom edge.
- `.card-actions` holds one primary action (`Open` or `Download`, gold) and `Source`. Actions
  are equal-width (`flex: 1 1 0`), minimum height 2rem.
- `.card-hit` is a transparent full-bleed button over the card, `z-index: 1`. Actions sit at
  `z-index: 2` with `pointer-events: auto`; the hit button is `display: none` under `.no-js`.

Measured, for reference:

| Viewport | Card | Art window | Inspect slot | Clone at rest |
|---|---|---|---|---|
| 1280 × 900 | 368 × 515 (scale 0.88) | 338 × 211 | 352 × 493 | 352 × 493 |
| 390 × 844 | 289 × 404 | 258 × 162 | 352 × 493 | 352 × 493 |
| 844 × 390 | 210 × 249 | 189 × 118 | 218 × 306 | 157 × 306 |

## 6. States

| State | What changes |
|---|---|
| Rest | Fan: card 1 `-9deg` and 34 px low, card 2 flat, card 3 `+9deg` and 34 px low; hand scale 0.88 |
| Idle sway | Every card drifts and turns on its own slow path: 1.26–1.8deg of rotation, 3.3–4.5 px of drift, periods of 23 / 29 / 31 s, started from negative delays. The five stops sit at uneven intervals so the motion has no beat. The pose freezes where it is on hover and while a card is inspected, and is gone under reduced motion |
| Hover (`.hand .card:hover`, hover-capable only) | Rotation to 0, up 14 px, scale +0.025, stronger border, deeper shadow, gold halo, pointer glare on (`::after` opacity 1); the other cards fall to `opacity: 0.84`; `z-index: 6` |
| Pointer tilt (mouse, pen) | `transform: perspective(900px) rotateX(var(--rx)) rotateY(var(--ry))` from `js/site.js`: up to `±10deg` around Y and `±8deg` around X, away from the pointer; glare centre follows `--mx/--my` |
| Finger tilt (touch) | Rides touch events, not pointer events: a phone cancels the pointer stream as soon as it decides the drag is a scroll. After 6 px of movement the card leans under the finger; the anchor moves with the page scroll so the lean does not swing while scrolling; a tap stays flat, and a drag drops the click |
| Focus-visible | `2px --gold` outline, offset 3 px; the card's hit button puts the ring inside the card (`-4px`) so it follows the rounded edge |
| Active / pressed | Border to `--line-strong` only — the box must not move, because the flight measures it |
| Inspecting | `.hand.is-inspecting` drops every card to `opacity: 0.22`; the source card gets `.is-source` (`visibility: hidden`) so the clone is the only visible copy |
| Disabled motion | `prefers-reduced-motion` removes the deal, the sway, and every transition; the inspect open/close still works, instantly |

## 7. Motion

All motion is CSS transitions plus two keyframe animations, `deal` and `sway`; JS only
measures and sets custom properties. Easing is `--ease: cubic-bezier(0.22, 0.61, 0.36, 1)`
unless noted.

| Beat | Duration | Notes |
|---|---|---|
| Deal | 560 ms | `cubic-bezier(0.2, 0.9, 0.25, 1.04)`, `backwards`; from `translate: -92vw`, `rotate: rot - 18deg`, `scale: hand-scale * 0.9`, opacity 0 → 1 by 35% |
| Deal stagger | 60 / 170 / 280 ms | `.card:nth-child(1…3)` |
| Card hover and fan | 240 ms | `--dur`; the tilt is not transitioned, the sway carries it |
| Sway | 23 / 29 / 31 s | `ease-in-out`, infinite, negative delays −7 / −19 / −12 s, stops at 0 / 22 / 47 / 71 / 100 % |
| Open flight | 440 ms | `--dur-fly`: translate, rotate, scale on the clone; scrim fades in over the same |
| Close flight | 280 ms | `--dur-back`; deliberately shorter than the opening |
| Close cleanup | 340 ms | `BACK_MS + 60` in `js/site.js`; `BACK_MS` mirrors `--dur-back` |

Deal is pure CSS, so it runs before JS and never waits for a script. The sway keyframes carry
the tilt variables (`--rx`, `--ry`), which is what lets the pointer tilt ride on the sway
instead of being replaced by it; because `transform` is animated, it has no transition, and
the tilt follows the pointer frame by frame. Pausing the sway (`animation-play-state:
running, paused`) freezes the pose but keeps the tilt live, which was checked by changing
`--rx` on a paused card.

### Inspect flight

The clone is the card, not a re-layout: it keeps the card's layout width and height, so its
line breaks, padding and type survive the trip.

| Variable | Meaning |
|---|---|
| `--cw`, `--ch` | layout box of the clone (card `offsetWidth`/`offsetHeight`) |
| `--dx`, `--dy` | centre-to-centre offset from the slot to the card |
| `--k` | start scale: the card's effective scale (`style.scale`) |
| `--k1` | end scale: `min(slot.width / card.width, slot.height / card.height)` |
| `--r0`, `--rx`, `--ry` | the card's rotation at that instant — fan angle plus the sway's — and its tilt, carried in and cancelled at the end |
| `--dur-fly`, `--dur-back` | 0.44 s in, 0.28 s back |

The clone is positioned at the slot centre with percentage translate
(`calc(-50% + var(--dx))`), so it needs no known height. `.veil.is-open` moves it to
`-50% -50%`, rotation 0, scale `--k1`.

The sway turns the card inside its transform, so `alignToCard` reads the angle out of the
computed matrix and adds it to the fan rotation for `--r0`. Without that the clone would
start as much as 1.8deg away from a card at the top of its sway, which reads as a jump on
the first frame now that the sway is wide.

Landscape is the exception: compact cards hide the note, so their box is shorter than the copy
the inspect view shows. There the clone is laid out at the slot width with `--ch: auto`, and
`--k1` is measured after insertion. It therefore starts as tall as its full copy and grows out
of the centre by a few dozen pixels — accepted, not a bug.

Closing, in order: `.is-closing` hides the close button and the hint on the first frame; the
card flies back over `--dur-back`; the scrim fades out; the veil is hidden and the clone
removed after the timer; focus returns to the card's hit button.

## 8. Responsive behaviour

Breakpoints are in this order in the stylesheet, and the order matters: later blocks override
earlier ones at the same specificity.

| Query | Layout | Card width | Fan |
|---|---|---|---|
| default (> 56 rem) | one row, centred | `clamp(16rem, min(30vw, 52vh), 23rem)` | ±9°, 34 px lift, scale 0.88 |
| `max-width: 56rem` | swipeable strip, next card peeks in | `min(72vw, 19rem)` | ±5°, 18 px lift, scale 0.94 |
| `max-width: 30rem` | one column, full-width cards, page scrolls | `min(74vw, 20rem)` | ±1.5°, no lift, scale 1 |
| landscape, `max-width: 60rem` + `max-height: 34rem` | one row of three, no scroll, note hidden | `min((100dvh - 6rem) / 1.4, 28vw, 20rem)` | ±1.5°, no lift, scale 1 |

Notes:

- In the strip, cards are narrower than the viewport so the next one peeks in with its own
  tilt. There is no snapping that could stall before the last card, and
  `overscroll-behavior-x: contain` keeps the pan inside the strip.
- In the column, `hand-wrap` stops panning, the outer cards lean 1.5°, and only the page
  scrolls vertically.
- In landscape, `align-items: stretch` keeps the three cards equal even though their names
  wrap differently; `min-height: 0` lets the height come from the screen, and the note is
  dropped to the inspect view.
- The landscape block is last so it wins over the column rule on short, small screens.
- The strip has no snap points by design; adding them reintroduces the stall they were meant
  to fix.
- The sway is transform-only: it changes no card's layout box (368 × 515 stays 368 × 515),
  adds nothing to the hand's horizontal overflow at 390, 844, and 1280 px, and leaves the
  strip panning.

## 9. Accessibility contract

- WCAG 2.2 AA: `--muted` is 6.42:1 on the card surface and 6.87:1 on `--bg`; `--fg` is
  17.6:1; `--gold` is 9.66:1 on the card. Gold on the card is used only for the index and the
  primary action, which also carries a border and a filled wash.
- Colour never carries meaning alone: the primary action is distinguished by border and fill,
  not hue only; focus is an outline, not a colour change.
- Full keyboard path: card hit buttons are real buttons in DOM order, the veil is a
  `role="dialog" aria-modal="true"` with the tool name as its label, `.table` is `inert` while
  open, `Esc` and the close button both return focus to the card.
- Touch: `touch-action: manipulation`, own pressed states, no tap highlight. A finger that
  moves past 6 px leans the card and the click is dropped; a tap never tilts, so the card it
  opens is measured flat. The strip is the exception: a finger there pans the hand instead.
- `prefers-reduced-motion` removes the deal and every transition; nothing is announced or
  required by an animation.
- Layout holds at 200% text zoom because sizes are rem and the card grows with its content.

## 10. Change recipes

| To change | Touch | Also check |
|---|---|---|
| Accent colour | `--gold` and its three derivatives in `:root` | Focus ring, primary action, card index; the favicon stays green |
| Card size | `--card-w` per breakpoint | `--inspect-w` should stay in the same family; re-measure the hand and the inspect slot |
| Card proportion | `--card-aspect`, plus the `7 / 5` in `min-height` and the `/ 1.4` in the landscape width | Four places, or cards stop being 5:7 |
| Card padding, gap, radii | `.card` padding/gap, `--radius-card`, `--radius-ui`, `.card-art` radius 0.5rem, inner frame `inset` + `calc(radius - 0.3rem)` | The inner frame is derived; keep the subtraction |
| Fan angle / lift | `--rot` and `--lift` on `:nth-child(1)` and `(3)` in each breakpoint | `.hand` inline padding must keep the overhang inside the scroll area |
| Deal timing | `@keyframes deal` (560 ms) and the three `animation-delay` values | `prefers-reduced-motion` still removes it |
| Inspect timing | `--dur-fly`, `--dur-back` | `BACK_MS` in `js/site.js` mirrors `--dur-back`; update both |
| Inspect size | `--inspect-w` | The slot uses `--card-aspect`; on 390 px the veil padding already drops to 0.75rem |
| Tilt strength | `TILT_X` / `TILT_Y` in `js/site.js` (max ±8° / ±10°) | The sway keyframes carry `--rx/--ry`; the clone copies them |
| Idle sway | `@keyframes sway` stops and `--sway-angle`, `--sway-shift`, `--sway-time`, `--sway-phase` on each `:nth-child` | Check the hand adds no horizontal overflow and that hover still freezes the pose; the clone reads the sway angle in `alignToCard` |
| Art window ratio | `.card-art { aspect-ratio }` and the screenshot crop | Every card must keep the same window or the cards stop being equal |
| Add a tool | Copy an `<li class="card" data-card="…">` block, add `--art-…` and `.card[data-card="…"]` | Position in the hand = relevance order; `aria-label` on `.card-hit` |
| Copy | `index.html` only | Keep one line per tool, around 12 words |

Not to be changed without the owner: the concept (hand + inspect), the single accent, the
dark-only palette, the 5:7 card, the order of `Open`/`Download` then `Source`.

## 11. Known edges

- A very short landscape screen (568 × 320) still scrolls the page about 30 px: three cards
  at a readable size do not fit there.
- Landscape inspect starts with the note visible, so the clone begins taller than the card
  and grows out of its centre.
- The tilt is a mouse hover plus a deliberate finger drag; a plain tap never tilts, so the
  card does not flinch before it flies. On touch the tilt listens to touch events because
  the pointer stream is cancelled once the phone starts scrolling, and a drag that scrolls
  the page keeps leaning the card until the finger lifts.
- The tilt is an immediate follow, not an eased one: the sway animates `transform`, so no
  transition can sit on it. Per-frame pointer updates keep it smooth; the return to flat is
  instant.

## 12. Verification

Visual changes are checked by measurement, not by eye: card size equality across the hand,
`documentElement.scrollHeight - clientHeight` for vertical scroll, `hand-wrap.scrollWidth -
clientWidth` for sideways scroll, the clone's start offset against the card and its end size
against the slot, and the console. The full list, including keyboard, `file://`, and reduced
motion, is in `AGENTS.md` §7.
