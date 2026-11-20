# AGENTS.md

Operating instructions for coding agents working on the GitHub Pages site
**kirillhod.github.io**.

## 0. Context budget

This file loads every session; it stays under 10 KB. A change needs this file, the
`DESIGN.md` sections it names, and a slice of one source file (`index.html` 7.7 KB,
`css/site.css` 21 KB, `js/site.js` 14 KB); grep the selector or symbol first. Do not read
`DESIGN.md` end to end (~21 KB, 5.3k tokens); jump by heading with the map in §3. Do not
read `assets/` as text; open a screenshot only for a visual decision. There is no test
suite: verify with §7 and report it.

## 1. Project

A one-page index of **Artwork Tools** — the public utilities this site ships. It shows tool
names, a one-line note each, and the way to their source. It is deliberately not a personal
page: no name, photo, bio, or contact details. Plain HTML, CSS, and JavaScript only; no
framework, no build step, no backend, no accounts, no analytics. The repository root *is*
the site.

**Status:** cards are dealt and one opens into a centred inspect view. The palette tool and
NodeAtlas show real screenshots; Blender Sprites still uses an inline SVG emblem. The site
is live at `https://kirillhod.github.io/`; the owner pushes.

**Agreed identifiers** (do not rename without approval):

| Item | Value |
|---|---|
| Site | `https://kirillhod.github.io` |
| Wordmark and `<title>` | `Artwork Tools` |
| Repository | `kirillhod/kirillhod.github.io` (public) |
| GitHub link | `github.com/kirillhod`, discreet, footer only |
| UI language | English |
| Stylesheet | `css/site.css` |
| Script | `js/site.js` |
| Deploy | GitHub Pages, branch `main`, folder `/ (root)` |

## 2. Hard rules

1. **Zero dependencies, zero build.** No npm packages, bundler, transpiler, CSS
   preprocessor, CDN, external font, or icon library. Do not add `package.json`; use
   platform APIs or drop the feature.
2. **Local-first.** No `fetch`/XHR to GitHub or any API, no analytics, beacons, embeds,
   iframes, or third-party scripts. The only network activity is a click on an external
   link; project data is hand-written markup.
3. **Static hosting.** `index.html` stays in the root, `.nojekyll` exists, and the site
   works identically from disk and Pages. Dark only; every link works offline.
4. **Relative asset paths** (`css/site.css`, never `/css/site.css`), except `og:image` and
   `twitter:image`, which carry the full URL because scrapers do not resolve relatives.
5. **External links** use `rel="noopener noreferrer"` in a new context and no
   `target="_blank"` unless asked.
6. **No personal identity** — no name, photo, bio, role, location, employer, phone, or email
   in the page, title, meta description, alt text, or structured data. The only personal
   link is the footer `github.com/kirillhod`. The repository is public: no secrets or
   internal notes.
7. **No emoji** in code, UI copy, or commits unless requested.

## 3. Layout and task map

`index.html` holds the markup and content; `css/site.css` the tokens, layout, cards,
inspect, and breakpoints; `js/site.js` the inspect flight, tilt, and sway; `assets/` the
card art, social preview, and favicon. The root also has `robots.txt`, `sitemap.xml`, and
`.nojekyll`. `DESIGN.md` explains the visuals.

| Task | Files | DESIGN | Check |
|---|---|---|---|
| Card layout, fan, deal, breakpoints | `css/site.css`, `index.html` | §4, §5, §8 | §7 widths |
| Hover, tilt, sway, inspect flight | `js/site.js`, `css/site.css` | §6, §7, §9 | §7 clone |
| Copy, tools, links, meta | `index.html` | §5, §10 | §7 links |
| Colors, type, tokens | `css/site.css` | §2, §3 | §7 contrast |
| Favicon, social preview | `assets/`, `index.html` | §2, §5 | §7 |
| SEO files | `robots.txt`, `sitemap.xml` | — | §7 |

`css/site.css` is the source of truth for colours, geometry, and timings; `DESIGN.md`
explains them. Update `DESIGN.md` in the same commit when a token, card size, breakpoint,
or timing changes.

Do not add directories or build configs for a page this size. `assets/` holds only real
images: card art, the one social preview, and the favicon; the PNGs at 32, 48, 96, and
192 px are rendered from `assets/favicon.svg` and all four are redone when the mark
changes. Move the sitemap `lastmod` when the page content changes, not for layout.

## 4. Content rules

- English UI copy, code, comments, and commits. Keep copy minimal: the wordmark, project
  names, one line per project (about 12 words), and the footer link. No about, taglines,
  calls to action, statistics, or marketing.
- One entry per public tool, ordered by relevance. Each entry has a two-digit position, a
  kind label (`Web app`, `Blender add-on`), the name, a one-line note, and actions. Add
  `Open` only for a live web tool, `Download` only for a release zip, `Source` for a
  repository; never call a finished tool a demo. The one gold action gets the tool
  (`Open` or `Download`). A `Download` points at the latest release zip and moves with the
  next release.
- Card art is a real screenshot when the tool has one: a `720 × 450` JPEG cropped to `8 / 5`
  in `assets/`, `alt=""`, filling the window edge to edge. Until then, an inline SVG emblem,
  `aria-hidden`, one per tool on a `120 × 84` viewBox. Both keep the fixed window, so cards
  stay equal.
- The social preview is `assets/social-preview.jpg`, a `1200 × 630` JPEG of the hand,
  referenced by full URL from `og:image` and `twitter:image`. Redo it when the cards, their
  copy, or the fan changes, and keep the declared width and height in step.
- Every card keeps a one-line note and a `card-detail` paragraph for inspect, shortened
  from the README with no new claims. The detail is `display: none` on the card and absolute
  in the clone, so it must stay clear of `.card-actions` at 390 px.
- Describe what the tool does: no superlatives, no marketing voice, no invented facts.
  Keep the notes in sync with the repositories.

## 5. Conventions

- Semantic HTML: one `h1`, lists for project collections, `footer` for the GitHub link.
- 2 spaces, double quotes in HTML, single quotes in JS, semicolons, ~100 columns, UTF-8,
  LF. `kebab-case` files, `camelCase` functions, `SCREAMING_SNAKE_CASE` constants.
- CSS: every color, radius, and spacing token in `:root`; dark only
  (`color-scheme: dark`), no light theme or toggle, no hard-coded hex in components, no
  inline `style`, no `!important`.
- JavaScript only when a feature needs it, as one classic script (not a module: Chrome
  refuses `type="module"` over `file://`). One IIFE per file, `const` over `let`, `===`, no
  `innerHTML` with dynamic strings, no inline handlers.
- Comments explain why; no dead code and no TODOs without an issue.

## 6. Accessibility

Target WCAG 2.2 AA: text at least 4.5:1 against the dark background, visible focus on every
control, full keyboard operation in DOM order, `prefers-reduced-motion` respected, no
information by color alone, layout holds at 200% text zoom.

## 7. Verification

There is no test suite; verification is manual and reported.

- Open `index.html` from disk and through a local server (`python -m http.server`).
- Check 360, 768, and 1280 px widths; keyboard-only pass; the palette stays dark whatever
  the system setting is. Below 30 rem the hand is one column of full-width cards with notes
  and actions, and only the page scrolls, nothing sideways. Between 30 and 56 rem it is a
  swipe strip: the next card peeks in, the strip reaches the last card without snapping
  back, and the page does not scroll sideways. On a landscape phone, below 60 rem wide and
  34 rem tall, the three cards fit one row sized by the screen height with the note left to
  inspect; nothing scrolls.
- Open every card: it flies to the centre, dims the hand, and takes focus; `Esc`, the close
  button, and a click outside bring it back and return focus. The clone matches the card on
  the first frame and the slot on the last — same box, same line breaks, only the scale
  changing — or the flight jumps. The clone reads the card's sway rotation as well as its
  fan angle, so it starts on the card; more than about 2 px is a jump. In inspect the note
  fades out and the detail fades in without reflowing the clone, and the detail ends above
  `.card-actions` at 390 px. The close button and hint leave on the first frame of the
  return, and the way back is shorter than the way in.
- Repeat with JavaScript disabled and with `prefers-reduced-motion` forced.
- Confirm no console errors, no network requests besides navigation, and that every link
  resolves to a real page.
- "Should work" is not verification.

## 8. Git

- Commit locally after a coherent, verified change. Do not push, add or change remotes, or
  create tags, releases, branches, or PRs; the owner pushes.
- Messages: English, imperative, no conventional prefixes (`feat:` etc.). Subject plus a
  short body with what changed and where — the facts, not the intent. Never say who asked,
  what was wanted, how it used to feel, or how it was judged. Prefer numbers and file names
  over adjectives. One coherent change per commit; keep refactors separate from content.
- Never commit `.DS_Store`, `Thumbs.db`, editor folders, logs, or secrets; check
  `git status` before committing.
- Do not rewrite history, except a message-only fix of unpushed commits when the owner
  asks.

## 9. Definition of done

The page loads from disk and Pages; layout holds at narrow widths; keyboard and focus work;
no dependency, build, or network was added; links point at real projects; copy matches the
repositories; the change is committed locally with a factual body.

## 10. Adding a project

Copy a card block and place it by relevance; set the position, kind, name, note, and
actions; give it a tint and fill the art window (screenshot or emblem); link the
repository, the live tool if it exists, and the latest release zip; label the inspect
button with the tool name; run §7 and commit.
