# As Safinah Learning (MVP)

A static, multilingual (English / العربية / Türkçe) learning web app for the As Safinah Centre for Humanitarian Excellence.
Plain HTML + CSS + JavaScript — no framework, no build step.

**Current scope:** two directions are live — *IT and Digital Transformation* and *Education*. Each shows its own
Modules 1–4 (Sections 1–12) plus the shared Modules 5–6 (*Patterns of Renewal*, *Obligation and Purpose*), which are
the same in every As Safinah handbook and are stored once in `data/shared/`. Each direction also has a searchable glossary.
English is complete; Arabic and Turkish translations are being added as drafts (untranslated parts fall back to English).
The other five directions are placeholders ("Coming soon").

## Run locally

ES modules and `fetch` need a web server (opening `index.html` as a file will not work):

```bash
python -m http.server 8080
```

then open <http://localhost:8080>.

## Publish (GitHub Pages — free `*.github.io` address)

1. Push this folder to a GitHub repository.
2. Repository → **Settings → Pages → Build and deployment**: Source = *Deploy from a branch*, Branch = `main`, folder `/ (root)`.
3. The site appears at `https://<user>.github.io/<repo>/` after a minute. Every `git push` to `main` updates it.

## Structure

```
index.html            page shell
css/styles.css        mobile-first styles, RTL-ready (CSS logical properties)
js/app.js             router, views, progress (localStorage)
js/i18n.js            interface strings (en / ar / tr)
data/directions.json  the 7 directions (+ status: active | soon)
data/<direction>/<lang>.json   course content; en.json is the master
data/shared/<lang>.json        Modules 5-6, included in every direction
assets/                        logo and app icons
tools/extract-handbook.mjs     PDF -> data/<direction>/en.json (+ data/shared with --shared)
tools/validate-content.mjs     checks translations mirror the English structure
```

## Adding content

* **A translation:** copy the structure of `en.json` into `<lang>.json` (it may contain only some modules/sections —
  anything missing falls back to English with a notice), then run `node tools/validate-content.mjs`.
* **A new direction from a handbook PDF:**

  ```bash
  pdftotext -layout -enc UTF-8 Handbook.pdf layout.txt
  pdftotext -enc UTF-8 Handbook.pdf raw.txt
  node tools/extract-handbook.mjs layout.txt raw.txt <direction-id>
  ```

  Then set its `status` to `active` (and add a `desc`) in `data/directions.json`. If a module opener quotes a verse or
  hadith the converter does not know yet, it prints a warning: add the Arabic text to `ARABIC` in the converter.
* **A new language:** add it to `LANGS` and `UI` in `js/i18n.js`, then add `data/<direction>/<code>.json` files.

## Review before launch

* Arabic Qur'anic text in `en.json` (`verses[].ar`) was supplied separately (the PDF's Arabic is not machine-readable) — proof-read against a printed mushaf.
* Arabic and Turkish translations of Module 1 are first drafts — have a native reviewer check them.
