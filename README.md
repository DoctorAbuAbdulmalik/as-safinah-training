# As Safinah Learning (MVP)

A static, multilingual (English / العربية / Türkçe) learning web app for the As Safinah Centre for Humanitarian Excellence.
Plain HTML + CSS + JavaScript — no framework, no build step.

**MVP scope:** direction *IT and Digital Transformation* — Modules 1–4 (Sections 1–12) in English;
Module 1 also in Arabic and Turkish. The other six directions are placeholders ("Coming soon").
Modules 5–6 (shared "Patterns of Renewal" / "Obligation and Purpose") are not digitised yet.

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
tools/extract-handbook.mjs     PDF text -> en.json (one-off converter)
tools/validate-content.mjs     checks translations mirror the English structure
```

## Adding content

* **A translation:** copy the structure of `en.json` into `<lang>.json` (it may contain only some modules/sections —
  anything missing falls back to English with a notice), then run `node tools/validate-content.mjs`.
* **A new direction:** add `data/<id>/en.json`, set its `status` to `active` in `data/directions.json`.
* **A new language:** add it to `LANGS` and `UI` in `js/i18n.js`, then add `data/<direction>/<code>.json` files.

## Review before launch

* Arabic Qur'anic text in `en.json` (`verses[].ar`) was supplied separately (the PDF's Arabic is not machine-readable) — proof-read against a printed mushaf.
* Arabic and Turkish translations of Module 1 are first drafts — have a native reviewer check them.
