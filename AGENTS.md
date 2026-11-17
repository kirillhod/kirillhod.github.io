# AGENTS.md

Operating instructions for coding agents working in this repository — the personal
GitHub Pages site **kirillhod.github.io**.

## 1. Project

A one-page index of **Artwork Tools** — the public utilities this site ships. It shows
tool names, a one-line note each, and the way to their source. It is deliberately not a
personal page: no name, photo, bio, or contact details. Plain HTML, CSS, and JavaScript
only; no framework, no build step, no backend, no accounts, no analytics. The repository
root *is* the site.

**Status:** MVP. Minimal English content and a neutral layout are in place; the visual
direction (game-interface styling) is still open. The site is not yet published — the
owner pushes.

**Agreed identifiers** (do not rename without approval):

| Item | Value |
|---|---|
| Site | `https://kirillhod.github.io` |
| Wordmark and `<title>` | `Artwork Tools` |
| Repository | `kirillhod/kirillhod.github.io` (public) |
| GitHub link | `github.com/kirillhod`, discreet, footer only |
| UI language | English |
| Stylesheet | `css/site.css` |
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
   Pages. Both themes and every link work offline.
4. **Relative asset paths** (`css/site.css`, never `/css/site.css`) so the site also works
   under a subpath.
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
index.html          the whole page: wordmark, project list, footer
css/site.css        tokens, layout, components, responsive rules
AGENTS.md           this file
.nojekyll           disables Jekyll on GitHub Pages
.gitignore          OS/editor junk, logs, env
.gitattributes      LF line endings, UTF-8 text
```

Do not add new directories, build configs, or asset pipelines for a page this size. Add
an `assets/` directory only when real images exist.

## 4. Content rules

- UI copy is English, and so are code, comments, and commit messages.
- Keep copy minimal: the wordmark, project names, one line per project (around 12 words),
  and the footer GitHub link. No about section, taglines, calls to action, statistics, or
  marketing sections. If a fact can be dropped without losing meaning, drop it.
- One entry per public tool, ordered by relevance, not alphabetically.
- An entry holds: name, one-line note, source link, plus a demo link only when a public
  demo exists.
- Describe what the tool does for the user. No superlatives, no marketing voice, no
  invented facts — shorten the repository README.
- Keep the notes in sync with the repositories; update them when a project's scope
  changes.

## 5. Conventions

- Semantic HTML: one `h1`, lists for project collections, `footer` for the GitHub link.
- Formatting: 2 spaces, double quotes in HTML attributes, single quotes in JS,
  semicolons, ~100 columns, UTF-8, LF.
- Files: `kebab-case`. Functions: `camelCase`. Constants: `SCREAMING_SNAKE_CASE`.
- CSS: every color, radius, and spacing token lives in `:root`; light theme is an
  override inside `@media (prefers-color-scheme: light)`; `color-scheme` stays declared.
  No hard-coded hex in component rules, no inline `style` attributes, no `!important`.
- JavaScript only when a feature genuinely needs it (progressive enhancement). When used:
  native ES modules, named exports only, `const` over `let`, `===`, no `innerHTML` with
  dynamic strings, no inline event handlers.
- Comments explain *why*, not *what*. No dead code and no TODOs without an issue.

## 6. Accessibility

Target WCAG 2.2 AA. Text contrast at least 4.5:1 in both themes, visible focus on every
interactive element, full keyboard operation in DOM order, `prefers-reduced-motion`
respected, no information conveyed by color alone, layout holds at 200% text zoom.

## 7. Verification

There is no test suite; verification is manual and must be reported with what was checked.

- Open `index.html` from disk and through a local server (`python -m http.server`).
- Check 360 px, 768 px, and 1280 px widths; keyboard-only pass; both color schemes.
- Confirm no console errors, no network requests besides navigation, and that every link
  resolves to a real page.
- "Should work" is not verification.

## 8. Git

- Commit locally after a coherent, verified change.
- **Do not push**, add or change remotes, create tags, releases, branches, or PRs. The
  owner pushes.
- Commit messages: English, imperative, no conventional prefixes (`feat:` etc.), subject
  plus a short body explaining why and what changed. One coherent change per commit; keep
  refactors separate from content updates.
- Never commit `.DS_Store`, `Thumbs.db`, editor folders, logs, or secrets. Check
  `git status` before committing.
- Do not rewrite history.

## 9. Definition of done

A change is done when the page still loads from disk and from Pages, both themes and
narrow widths hold, keyboard and focus states work, no dependency/build/network was
added, links still point at real projects, copy matches the repositories, and the change
is committed locally with a descriptive body.

## 10. Adding a project

1. Copy an existing `<li class="project">` block and place it by relevance.
2. Fill in the name and a one-line note shortened from the repository README.
3. Link the repository, plus the demo URL only if it exists and loads.
4. Run the verification list, then commit.
