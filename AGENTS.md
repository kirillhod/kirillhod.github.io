# AGENTS.md

Operating instructions for coding agents working in this repository — the personal
GitHub Pages site **kirillhod.github.io**.

## 1. Project

A one-page index of **Artwork Tools** — the public utilities this site ships. It shows
tool names, a one-line note each, and the way to their source. It is deliberately not a
personal page: no name, photo, bio, or contact details. Plain HTML, CSS, and JavaScript
only; no framework, no build step, no backend, no accounts, no analytics. The repository
root *is* the site.

**Status:** the card-table layout is in place: the tools are dealt as cards and one card
opens into a centred inspect view. The palette tool shows a real screenshot; the other two
still use inline SVG emblems. The site is not yet published — the owner pushes.

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
   preprocessor, CDN, external font, or icon library. Do not add `package.json`. Use
   platform APIs or drop the feature.
2. **Local-first.** No `fetch`/XHR to GitHub or any API, no analytics, beacons, embeds,
   iframes, or third-party scripts. The only network activity is a user clicking an
   external link. Project data is hand-written markup, not fetched.
3. **Static hosting.** `index.html` stays in the repository root and `.nojekyll` must
   exist. The site must work identically opened from disk (`file://`) and served from
   Pages. The site is dark-only; every link works offline.
4. **Relative asset paths** (`css/site.css`, never `/css/site.css`) so the site also works
   under a subpath. The `og:image` and `twitter:image` URLs are the one exception: link
   scrapers do not resolve relative paths, so they carry the full site URL.
5. **External links** carry `rel="noopener noreferrer"` when they open a new context.
   No `target="_blank"` unless the owner asks for it.
6. **No personal identity on the page.** Do not add the owner's name, photo, bio, role,
   location, employer, phone, or email — not in the header, not in `<title>`, meta
   description, alt text, or structured data. The page names tools, not people, and the
   only personal link is the `github.com/kirillhod` footer link. The repository is public:
   no secrets, tokens, or internal notes either.
7. **No emoji** in code, UI copy, or commits unless explicitly requested.

## 3. Layout

```text
index.html          the table: wordmark, the hand of cards, footer, inspect layer
css/site.css        tokens, layout, cards, inspect view, responsive rules
js/site.js          deals a card into the inspect view and back, tilts cards under the pointer
DESIGN.md           the visual system: palette, type, geometry, motion, change recipes
assets/             card screenshots, one cropped JPEG per tool, plus the social preview
robots.txt          allows every crawler and points at the sitemap
sitemap.xml         the one page, with its last content change
AGENTS.md           this file
.nojekyll           disables Jekyll on GitHub Pages
.gitignore          OS/editor junk, logs, env
.gitattributes      LF line endings, UTF-8 text
```

Do not add new directories or build configs for a page this size. `assets/` holds card
art and the one social preview, and only real images: no placeholder files, no sprites,
no icons.

`css/site.css` is the source of truth for colours, geometry, and timings; `DESIGN.md`
explains them. When a token, a card size, a breakpoint, or a timing changes, update
`DESIGN.md` in the same commit.

`robots.txt` and `sitemap.xml` live in the root next to `index.html`. The sitemap holds the
one URL, `https://kirillhod.github.io/`; move its `lastmod` to the day the page's content
changes, not the layout.

## 4. Content rules

- UI copy is English, and so are code, comments, and commit messages.
- Keep copy minimal: the wordmark, project names, one line per project (around 12 words),
  and the footer GitHub link. No about section, taglines, calls to action, statistics, or
  marketing sections. If a fact can be dropped without losing meaning, drop it.
- One entry per public tool, ordered by relevance, not alphabetically.
- An entry holds: a two-digit position (`01`), a kind label (`Web app`, `Blender add-on`),
  the name, a one-line note, and actions. Add an `Open` action only when the tool runs on
  the web, and `Download` only when a release ships an archive. Label actions by what they
  open — `Open` for a live tool, `Download` for a release zip, `Source` for a repository —
  and never call a finished tool a demo. The one gold action per card is the one that gets
  the tool: `Open` or `Download`. A `Download` link points at the zip asset of the latest
  release and moves with the next release.
- Card art is a real screenshot when the tool has one: a `720 × 450` JPEG cropped to `8 / 5`
  in `assets/`, `alt=""`, filling the window edge to edge. Until then, an inline SVG
  emblem, `aria-hidden`, one emblem per tool, all on the same `120 × 84` viewBox so the
  cards keep their proportions. Both sit in the same fixed window, so the cards stay equal.
- The social preview is `assets/social-preview.jpg`: a `1200 × 630` JPEG screenshot of the
  hand, referenced from `og:image` and `twitter:image` by its full URL. Redo it when the
  cards, their copy, or the fan changes, and keep the `og:image:width` and `:height` in
  `index.html` matching the file.
- Describe what the tool does for the user. No superlatives, no marketing voice, no
  invented facts — shorten the repository README.
- Keep the notes in sync with the repositories; update them when a project's scope
  changes.

## 5. Conventions

- Semantic HTML: one `h1`, lists for project collections, `footer` for the GitHub link.
- Formatting: 2 spaces, double quotes in HTML attributes, single quotes in JS,
  semicolons, ~100 columns, UTF-8, LF.
- Files: `kebab-case`. Functions: `camelCase`. Constants: `SCREAMING_SNAKE_CASE`.
- CSS: every color, radius, and spacing token lives in `:root`; the site is dark-only
  (`color-scheme: dark`). No light theme, no `prefers-color-scheme` override, no theme
  toggle.
  No hard-coded hex in component rules, no inline `style` attributes, no `!important`.
- JavaScript only when a feature genuinely needs it (progressive enhancement). It ships as
  one classic script, not an ES module: Chrome refuses `type="module"` over `file://` and
  the page must work from disk. `const` over `let`, `===`, no `innerHTML` with dynamic
  strings, no inline event handlers, one IIFE per file.
- Comments explain *why*, not *what*. No dead code and no TODOs without an issue.

## 6. Accessibility

Target WCAG 2.2 AA. Text contrast at least 4.5:1 against the dark background, visible focus
on every interactive element, full keyboard operation in DOM order, `prefers-reduced-motion`
respected, no information conveyed by color alone, layout holds at 200% text zoom.

## 7. Verification

There is no test suite; verification is manual and must be reported with what was checked.

- Open `index.html` from disk and through a local server (`python -m http.server`).
- Check 360 px, 768 px, and 1280 px widths; keyboard-only pass; confirm the palette stays
  dark whatever the system setting is. Below 30 rem the hand is one column of full-width
  cards with their notes and actions, and only the page scrolls — nothing sideways. Between
  30 and 56 rem the hand is a strip you swipe: the next card must peek in, the strip must
  reach the last card without snapping back, and the page itself must not scroll sideways.
  On a landscape phone, below 60 rem wide and 34 rem tall, the three cards fit one row sized
  by the screen height with the note left to the inspect view; nothing may scroll.
- Open every card: it must fly to the centre, dim the hand, and take focus; `Esc`, the
  close button, and a click outside must bring it back and return focus to the card. The
  clone must match the card on the first frame and the slot on the last — same box, same
  line breaks, only the scale changing — or the flight jumps at both ends. The clone reads
  the card's sway rotation as well as its fan angle, so it starts on the card; more than
  about 2 px of offset is a jump. The close button and the hint leave on the first frame of
  the return, and the way back is shorter than the way in.
- Repeat the pass with JavaScript disabled and with `prefers-reduced-motion` forced.
- Confirm no console errors, no network requests besides navigation, and that every link
  resolves to a real page.
- "Should work" is not verification.

## 8. Git

- Commit locally after a coherent, verified change.
- **Do not push**, add or change remotes, create tags, releases, branches, or PRs. The
  owner pushes.
- Commit messages: English, imperative, no conventional prefixes (`feat:` etc.). Subject
  plus a short body that states what changed and where — the facts, not the intent.
  Describe the change only: never who asked for it, what was wanted, how it used to feel,
  or how it was judged ("the owner wants…", "the list read as plain…"). Prefer numbers and
  file names over adjectives. One coherent change per commit; keep refactors separate from
  content updates.
- Never commit `.DS_Store`, `Thumbs.db`, editor folders, logs, or secrets. Check
  `git status` before committing.
- Do not rewrite history. The one exception is a message-only rewrite of commits that were
  never pushed, and only when the owner asks for it.

## 9. Definition of done

A change is done when the page still loads from disk and from Pages, the layout holds at
narrow widths, keyboard and focus states work, no dependency/build/network was
added, links still point at real projects, copy matches the repositories, and the change
is committed locally with a factual body.

## 10. Adding a project

1. Copy an existing `<li class="card" data-card="…">` block and place it by relevance.
2. Set the position, the kind label, the name, and a one-line note shortened from the
   repository README.
3. Give the card its tint in `css/site.css` and fill the art window: a cropped screenshot
   from the repository when one exists (see §4), otherwise a placeholder emblem.
4. Link the repository, plus the live tool if it exists and loads, and the zip of the
   latest release if the add-on ships one.
5. Give the inspect button an `aria-label` that names the tool.
6. Run the verification list, then commit.
