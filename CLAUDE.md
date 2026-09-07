# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

This is the companion website for **Dead End**, a French zombie-survival card game. It is a static site (no build step, no framework, no dependencies) served via GitHub Pages from the repo root. It provides: the game rules ("règles"), a rules-reference/help section ("aide"), and a countdown timer used during play (`timer.html`).

All page copy is in French.

## Project status & workflow

This site is an **MVP**, built entirely by Claude Code so far. The goal right now is just to get the rulebook and timer usable by customers — not to write clean code. Expect (and don't be surprised by) copy-pasted styles, inline everything, and other rough edges described below; that's intentional for this phase, not something to silently "clean up" while doing unrelated work.

A refactor pass is planned in the near future (still within this static-site approach — temporary, not the final architecture). Eventually the game will get a proper dedicated app; this repo's scope is limited to the rules + timer until then.

**Commit directly to `main`.** No feature branches or PRs for this repo right now — commit changes straight to `main` unless told otherwise.

**This repo is public** (it's the user's GitHub Pages site, served live to customers). Never commit secrets, API keys, personal/contact info, or other sensitive data — everything pushed here is publicly visible immediately.
## Commands

There is no build, lint, or test tooling — this is plain HTML/CSS/JS. To preview locally, serve the repo root with any static file server, e.g.:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/`.

## Architecture

**Every page is a fully self-contained `.html` file**: `<style>` is inlined in `<head>` and any behavior is inlined in a `<script>` at the end of `<body>`. There are no shared `.css`/`.js` files and no templating — shared visual patterns (the yellow-bordered `.frame`, `.title-banner`, `.nav-btn`) are copy-pasted across pages. When changing a shared visual pattern, grep for it and update every page individually.

**Routing is folder-based**, matching GitHub Pages' static resolution: each route is a directory containing an `index.html` (e.g. `help/effects/index.html` serves `/help/effects/`). To add a page, create a new directory with an `index.html` inside the appropriate section.

**Link path convention — this is the main footgun in this repo:**
- Navigation links between pages (`<a href>` to other routes, and the favicon `<link>`) use **root-relative absolute paths**: `/`, `/help/`, `/help/effects/`.
- Asset references (`<img src>` for SVGs, audio `src`) use **relative paths** with the correct number of `../` to reach `/assets/` from the current page's depth (e.g. three levels deep under `help/read-cards/chapters/` uses `../../../assets/...`).

Get the asset relative depth wrong and the icon/image silently 404s — always count directory depth from the file's actual path.

### Structure

- `index.html` — home page, links to `regles/`, `help/`, `timer.html`
- `regles/` — rules pages; `regles/notice-texte/{1..6}/` is a paginated rules-text sequence (each page links `../{n-1}/` as Retour and `../{n+1}/` as Suivant)
- `help/` — reference/help section (`card-categories/{horde,survivors}/`, `effects/`, `read-cards/{chapters,horde-survivors}/`); `help/index.html` is the section menu, with some menu entries still unlinked placeholders (no `href`) pending future pages
- `timer.html` — standalone countdown timer with milestone/penalty audio cues (game clock UI, not a page in `help/`/`regles/`)
- `assets/graphics/` — SVGs, mirrored under `help/` subpaths matching the site's `help/` route structure (e.g. `assets/graphics/help/card-effects/*.svg` for `help/effects/`)
- `assets/audio/alerts/` — timer sound effects (milestone alerts, background ambience, breach alarm)

### Visual language

Black background, yellow (`#FFCC00`) borders/accents, white text, `Oswald` (headings/UI) and `Roboto Mono` (timer digits) from Google Fonts. Sharp corners (`border-radius: 0`), thick (3px+) white or yellow borders, uppercase bold buttons. Match this styling exactly when adding UI — copy the nearest existing page's `<style>` block as a starting point rather than writing new patterns.

### Timer logic (`timer.html`)

Time is tracked in **centiseconds** (`TOTAL_TIME = 20 * 60 * 100`), not seconds, so the display can show hundredths. Audio milestones (15/10/5/1-minute alerts, breach alarm, penalty countdown) fire by exact centisecond match against `timeRemaining` inside the 10ms `tick()` interval — if you change `TOTAL_TIME`, `PENALTY_AMOUNT`, or the tick rate, re-derive the millisecond math for `MILESTONES` and `ALERT_TIMES_CS` rather than eyeballing it. Background ambience sounds are scheduled around fixed alert windows in `generateBgSchedule()` to avoid overlapping the milestone audio.
