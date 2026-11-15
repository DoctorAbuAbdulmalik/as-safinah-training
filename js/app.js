import { LANGS, UI } from "./i18n.js";

/* ---------- small helpers ---------- */
const $ = (sel) => document.querySelector(sel);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fmt = (str, vars) => str.replace(/\{(\w+)\}/g, (_, k) => vars[k]);

const store = {
  get(key, fallback) {
    try { const v = localStorage.getItem(key); return v === null ? fallback : JSON.parse(v); } catch { return fallback; }
  },
  set(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* private mode: ignore */ } },
  remove(key) { try { localStorage.removeItem(key); } catch { /* ignore */ } },
};

/* ---------- state ---------- */
const PROGRESS_KEY = "safinah.progress.v1";
const LANG_KEY = "safinah.lang";
let lang = pickInitialLang();
let progress = store.get(PROGRESS_KEY, {}); // { [directionId]: { done: {s1:true}, tests: {s1:[0,2]} } }
let directions = [];
const jsonCache = new Map();

function pickInitialLang() {
  const saved = store.get(LANG_KEY, null);
  if (saved && LANGS.some((l) => l.code === saved)) return saved;
  const nav = (navigator.language || "en").slice(0, 2).toLowerCase();
  return LANGS.some((l) => l.code === nav) ? nav : "en";
}
const t = (key, vars) => {
  const s = UI[lang]?.[key] ?? UI.en[key] ?? key;
  return vars ? fmt(s, vars) : s;
};
const L = (obj) => (obj ? obj[lang] ?? obj.en : "");

/* ---------- data ---------- */
async function loadJSON(path) {
  if (!jsonCache.has(path)) {
    jsonCache.set(path, fetch(path).then((r) => { if (!r.ok) throw new Error(`${path}: ${r.status}`); return r.json(); }));
  }
  return jsonCache.get(path);
}

const tryJSON = (path) => loadJSON(path).catch(() => null);

/** English is the master; a translated file may override any module/section (matched by id). */
function mergeModules(enModules, trModules, shared) {
  return enModules.map((m) => {
    const tm = trModules?.find((x) => x.id === m.id);
    const merged = { ...m, ...(tm || {}), id: m.id, number: m.number, shared };
    merged._translated = lang === "en" || !!tm;
    merged.sections = m.sections.map((s) => {
      const ts = tm?.sections?.find((x) => x.id === s.id);
      return { ...s, ...(ts || {}), id: s.id, number: s.number, _translated: lang === "en" || !!ts };
    });
    if (!tm?.outcomes) merged.outcomes = m.outcomes;
    return merged;
  });
}

/** A direction = its own modules (1-4) + the shared modules (5-6) that every As Safinah programme includes. */
async function loadDirection(id) {
  const [en, shared] = await Promise.all([loadJSON(`data/${id}/en.json`), tryJSON("data/shared/en.json")]);
  let tr = null;
  let trShared = null;
  if (lang !== "en") [tr, trShared] = await Promise.all([tryJSON(`data/${id}/${lang}.json`), tryJSON(`data/shared/${lang}.json`)]);
  const modules = [...mergeModules(en.modules, tr?.modules, false), ...mergeModules(shared?.modules || [], trShared?.modules, true)];
  const glossaryTr = lang !== "en" && tr?.glossary?.length ? tr.glossary : null;
  return { ...en, modules, glossary: glossaryTr || en.glossary || [], _glossaryTranslated: lang === "en" || !!glossaryTr };
}

/* ---------- progress ---------- */
const dirProgress = (id) => (progress[id] ||= { done: {}, tests: {} });
const saveProgress = () => store.set(PROGRESS_KEY, progress);

/* ---------- shell ---------- */
function applyLanguage() {
  const meta = LANGS.find((l) => l.code === lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = meta.dir;
  $("#brand-name").textContent = t("appName");
  $("#skip-link").textContent = t("skip");
  $("#lang-label").textContent = t("language");
  $("#footer-text").textContent = t("footer");
  $("#reset-progress").textContent = t("resetProgress");
  $("#lang-select").innerHTML = LANGS.map((l) => `<option value="${l.code}" ${l.code === lang ? "selected" : ""}>${esc(l.label)}</option>`).join("");
}

/* ---------- routing ---------- */
function parseRoute() {
  const parts = (location.hash.replace(/^#\/?/, "") || "").split("/").filter(Boolean);
  if (parts[0] === "d" && parts[1]) {
    if (parts[2] === "m" && parts[3]) return { view: "module", dir: parts[1], id: parts[3] };
    if (parts[2] === "s" && parts[3]) return { view: "section", dir: parts[1], id: parts[3] };
    if (parts[2] === "glossary") return { view: "glossary", dir: parts[1] };
    return { view: "direction", dir: parts[1] };
  }
  return { view: "home" };
}

async function render() {
  const route = parseRoute();
  const main = $("#main");
  try {
    let html;
    if (route.view === "home") html = renderHome();
    else {
      const d = directions.find((x) => x.id === route.dir);
      if (!d || d.status !== "active") html = renderNotFound();
      else {
        const data = await loadDirection(d.id);
        if (route.view === "direction") html = renderDirection(d, data);
        else if (route.view === "module") html = renderModule(d, data, route.id) || renderNotFound();
        else if (route.view === "glossary") html = renderGlossary(d, data);
        else html = renderSection(d, data, route.id) || renderNotFound();
      }
    }
    main.innerHTML = html;
    bindPage(route);
  } catch (err) {
    console.error(err);
    main.innerHTML = `<div class="notice" role="alert">${esc(t("loadError"))}</div>`;
  }
  const h1 = main.querySelector("h1");
  document.title = (h1 ? h1.textContent + " · " : "") + t("appName");
  window.scrollTo(0, 0);
}

/* ---------- views ---------- */
const crumbs = (items) =>
  `<nav class="crumbs" aria-label="Breadcrumb">${items
    .map((it, i) => (it.href ? `<a href="${it.href}">${esc(it.label)}</a>` : `<span>${esc(it.label)}</span>`) + (i < items.length - 1 ? '<span aria-hidden="true">›</span>' : ""))
    .join("")}</nav>`;

function renderNotFound() {
  return `<h1>${esc(t("notFound"))}</h1><p><a href="#/">${esc(t("backHome"))}</a></p>`;
}

function renderHome() {
  const cards = directions.map((d) => {
    const active = d.status === "active";
    const inner = `
      <span class="icon" aria-hidden="true">${d.icon}</span>
      <h3>${esc(L(d.title))}</h3>
      ${d.desc ? `<p>${esc(L(d.desc))}</p>` : ""}
      ${active ? `<span class="cta">${esc(t("open"))} →</span>` : `<span class="badge">${esc(t("comingSoon"))}</span>`}`;
    return active
      ? `<a class="card" href="#/d/${d.id}">${inner}</a>`
      : `<div class="card soon">${inner}</div>`;
  });
  return `
    <div class="hero">
      <div class="hero-logo"><img src="assets/logo.webp" width="480" height="722" alt="As Safinah — Centre for Humanitarian Excellence"></div>
      <div><h1>${esc(t("homeTitle"))}</h1><p class="lead">${esc(t("homeLead"))}</p></div>
    </div>
    <div class="grid three">${cards.join("")}</div>`;
}

function renderGlossary(d, data) {
  const items = [...data.glossary].sort((a, b) => a.term.localeCompare(b.term, lang));
  const fallback = !data._glossaryTranslated;
  return `
    ${crumbs([{ label: t("home"), href: "#/" }, { label: L(d.title), href: `#/d/${d.id}` }, { label: t("glossary") }])}
    <h1>${esc(t("glossary"))}</h1>
    ${fallback ? `<div class="notice">${esc(t("notTranslated"))}</div>` : ""}
    <p class="lead">${esc(t("glossaryLead"))}</p>
    <input class="search" id="gloss-search" type="search" placeholder="${esc(t("search"))}" aria-label="${esc(t("search"))}">
    <dl class="gloss" id="gloss"${fallback ? ' lang="en" dir="ltr"' : ""}>
      ${items.map((g) => `<div data-q="${esc((g.term + " " + g.def).toLowerCase())}"><dt>${esc(g.term)}</dt><dd>${esc(g.def)} <small>(${esc(g.ref)})</small></dd></div>`).join("")}
    </dl>`;
}

function allSections(data) {
  return data.modules.flatMap((m) => m.sections.map((s) => ({ m, s })));
}

function renderDirection(d, data) {
  const p = dirProgress(d.id);
  const all = allSections(data);
  const done = all.filter(({ s }) => p.done[s.id]).length;
  const pct = Math.round((done / all.length) * 100);
  const mods = data.modules.map((m) => `
    <section class="module" aria-labelledby="mh-${m.id}">
      <a class="module-head" href="#/d/${d.id}/m/${m.id}">
        <span class="kicker">${esc(t("module"))} ${m.number}</span>
        ${m.shared ? `<span class="badge shared">${esc(t("sharedModule"))}</span>` : ""}
        <h2 id="mh-${m.id}">${esc(m.title)}</h2>
        <p>${esc(m.tagline)}</p>
      </a>
      <ul class="sec-list">
        ${m.sections.map((s) => `
          <li><a class="${p.done[s.id] ? "done" : ""}" href="#/d/${d.id}/s/${s.id}">
            <span class="sec-num" aria-hidden="true">${p.done[s.id] ? "✓" : s.number}</span>
            <span>${esc(s.title)}</span></a></li>`).join("")}
      </ul>
    </section>`).join("");
  return `
    ${crumbs([{ label: t("home"), href: "#/" }, { label: L(d.title) }])}
    <h1>${d.icon} ${esc(L(d.title))}</h1>
    <p class="lead">${esc(L(d.desc))}</p>
    <div class="progress" role="group" aria-label="${esc(t("progress"))}">
      <div class="bar"><i style="width:${pct}%"></i></div>
      <small>${esc(fmt(t("sectionsDone"), { n: done, m: all.length }))}</small>
    </div>
    ${data.glossary.length ? `<div class="links-row"><a class="btn ghost" href="#/d/${d.id}/glossary">📖 ${esc(t("glossary"))}</a></div>` : ""}
    ${mods}
    <p><small>${esc(data.source || "")}</small></p>`;
}

function renderModule(d, data, id) {
  const m = data.modules.find((x) => x.id === id);
  if (!m) return null;
  const p = dirProgress(d.id);
  const verses = (m.foundation?.verses || []).map((v) => `
    <figure class="verse" style="margin:0">
      ${v.ar ? `<p class="ar" lang="ar" dir="rtl">${/Narrated|رواه|Bukhārī|Muslim|Buhârî|Müslim/.test(v.ref) ? `«${esc(v.ar)}»` : `﴿${esc(v.ar)}﴾`}</p>` : ""}
      ${v.text ? `<blockquote>“${esc(v.text)}”</blockquote>` : ""}
      <cite>${esc(v.ref)}</cite>
    </figure>`).join("");
  const wrapLang = m._translated ? "" : ' lang="en" dir="ltr"';
  return `
    ${crumbs([{ label: t("home"), href: "#/" }, { label: L(d.title), href: `#/d/${d.id}` }, { label: `${t("module")} ${m.number}` }])}
    <article${wrapLang}>
    ${m._translated ? "" : `<div class="notice" lang="${lang}" dir="${LANGS.find((l) => l.code === lang).dir}">${esc(t("notTranslated"))}</div>`}
    <p class="kicker" style="color:var(--accent);font-weight:700;margin:0">${esc(t("module"))} ${m.number}</p>
    <h1>${esc(m.title)}</h1>
    <p class="lead"><em>${esc(m.tagline)}</em></p>
    <h2>${esc(t("islamicFoundation"))}</h2>
    <div class="verses">${verses}</div>
    <h3>${esc(t("whyItSitsHere"))}</h3>
    ${(m.foundation?.why || []).map((w) => `<p>${esc(w)}</p>`).join("")}
    <div class="module" style="margin-top:28px"><ul class="sec-list">
      ${m.sections.map((s) => `<li><a class="${p.done[s.id] ? "done" : ""}" href="#/d/${d.id}/s/${s.id}">
        <span class="sec-num" aria-hidden="true">${p.done[s.id] ? "✓" : s.number}</span><span>${esc(s.title)}</span></a></li>`).join("")}
    </ul></div>
    <h2>${esc(t("learningOutcomes"))}</h2>
    <p>${esc(m.outcomes.items.length ? t("outcomesLead") : "")}</p>
    <ol class="outcomes">${m.outcomes.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ol>
    <div class="evidence"><b>${esc(t("evidence"))}:</b> ${esc(m.outcomes.evidence)}</div>
    </article>`;
}

function renderBlock(b, ctx) {
  if (b.type === "ul") return `<ul>${b.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;
  if (b.type === "h3") return `<h3>${esc(b.text)}</h3>`;
  if (b.type === "table")
    return `<div class="table-wrap" role="region" tabindex="0" aria-label="${esc(b.caption)}"><table>
      <caption>${esc(b.caption)}</caption>
      <thead><tr>${b.head.map((h) => `<th scope="col">${esc(h)}</th>`).join("")}</tr></thead>
      <tbody>${b.rows.map((r) => `<tr>${r.map((c, i) => (i === 0 ? `<th scope="row">${esc(c)}</th>` : `<td>${esc(c)}</td>`)).join("")}</tr>`).join("")}</tbody>
    </table></div>`;
  if (b.type === "example") return `<aside class="example"><b>${esc(ctx.exampleLabel)} — ${esc(b.title)}</b>${esc(b.text)}</aside>`;
  return `<p>${esc(b.text)}</p>`;
}

function shipPanel(ship, lbl, small) {
  const H = small ? "h3" : "h2";
  return `<section class="ship-panel${small ? " small" : ""}" aria-label="${esc(lbl("theShip"))}">
    <div class="kicker">⚓ ${esc(lbl("theShip"))}</div>
    <${H}>${esc(ship.title)}</${H}>
    ${ship.body.map((x) => `<p>${esc(x)}</p>`).join("")}
    ${ship.claim ? `<p class="claim">${esc(ship.claim)}</p>` : ""}
    <p class="onboard"><b>${esc(lbl("onBoardHere"))}:</b> ${esc(ship.question)}</p>
  </section>`;
}

function renderSection(d, data, id) {
  const all = allSections(data);
  const idx = all.findIndex(({ s }) => s.id === id);
  if (idx < 0) return null;
  const { m, s } = all[idx];
  const p = dirProgress(d.id);
  const checked = new Set(p.tests[s.id] || []);
  const prev = all[idx - 1];
  const next = all[idx + 1];
  const tr = s._translated;
  const contentAttrs = tr ? "" : ' lang="en" dir="ltr"';
  const ctx = { exampleLabel: tr ? t("example") : UI.en.example };
  const lbl = (k) => (tr ? t(k) : UI.en[k]);

  const subs = s.subsections.map((sub) => `
    <section aria-labelledby="h-${sub.id.replace(".", "-")}">
      <h2 id="h-${sub.id.replace(".", "-")}"><span class="n">${esc(sub.id)}</span>${esc(sub.title)}</h2>
      ${sub.ship ? shipPanel(sub.ship, lbl, true) : ""}
      ${sub.blocks.map((b) => renderBlock(b, ctx)).join("")}
    </section>`).join("");

  const r = s.review;
  const review = r ? `
    <section class="review" aria-labelledby="rev">
      <h2 id="rev">${esc(lbl("tenTests"))}</h2>
      <p>${esc(r.intro)}. ${esc(lbl("testsLead"))}</p>
      <ul class="tests">
        ${r.tests.map((q, i) => `<li><label><input type="checkbox" data-test="${i}" ${checked.has(i) ? "checked" : ""}><span>${esc(q)}</span></label></li>`).join("")}
      </ul>
      <p class="score" id="score" aria-live="polite"></p>
      <h2>${esc(lbl("questions"))}</h2>
      <ol class="q">${r.questions.map((q) => `<li>${esc(q)}</li>`).join("")}</ol>
      <h2>${esc(lbl("exercise"))}</h2>
      <div class="exercise">${esc(r.exercise)}</div>
    </section>` : "";

  const isDone = !!p.done[s.id];
  const pager = `<nav class="pager" aria-label="Pager">
      ${prev ? `<a class="prev" href="#/d/${d.id}/s/${prev.s.id}"><small>← ${esc(t("prev"))}</small>${esc(prev.s.title)}</a>` : "<span></span>"}
      ${next ? `<a class="next" href="#/d/${d.id}/s/${next.s.id}"><small>${esc(t("next"))} →</small>${esc(next.s.title)}</a>` : ""}
    </nav>`;

  return `
    ${crumbs([{ label: t("home"), href: "#/" }, { label: L(d.title), href: `#/d/${d.id}` }, { label: `${t("module")} ${m.number}`, href: `#/d/${d.id}/m/${m.id}` }, { label: `${t("section")} ${s.number}` }])}
    ${tr ? "" : `<div class="notice">${esc(t("notTranslated"))}</div>`}
    <article class="lesson"${contentAttrs}>
      <p style="color:var(--accent);font-weight:700;margin:0">${esc(t("section"))} ${s.number}</p>
      <h1>${esc(s.title)}</h1>
      ${shipPanel(s.ship, lbl, false)}
      ${s.intro.map((x) => `<p>${esc(x)}</p>`).join("")}
      <ul class="toc" aria-label="${esc(lbl("inThisSection"))}">
        ${s.subsections.map((sub) => `<li><a href="#" data-jump="h-${sub.id.replace(".", "-")}">${esc(sub.id)} ${esc(sub.title)}</a></li>`).join("")}
      </ul>
      ${subs}
      ${review}
    </article>
    <div class="complete-row">
      <button type="button" class="btn" id="complete" aria-pressed="${isDone}" data-section="${s.id}">
        ${esc(isDone ? t("completed") : t("markComplete"))}
      </button>
    </div>
    ${pager}`;
}

/* ---------- interactions for the current page ---------- */
function bindPage(route) {
  const search = $("#gloss-search");
  search?.addEventListener("input", () => {
    const q = search.value.trim().toLowerCase();
    document.querySelectorAll("#gloss > div").forEach((row) => (row.hidden = q && !row.dataset.q.includes(q)));
  });
  document.querySelectorAll("[data-jump]").forEach((a) =>
    a.addEventListener("click", (e) => {
      e.preventDefault();
      document.getElementById(a.dataset.jump)?.scrollIntoView({ behavior: "smooth", block: "start" });
    })
  );
  if (route.view !== "section") return;
  const p = dirProgress(route.dir);
  const updateScore = () => {
    const boxes = [...document.querySelectorAll("[data-test]")];
    const n = boxes.filter((b) => b.checked).length;
    const el = $("#score");
    if (el) el.textContent = fmt(t("testsYes"), { n, m: boxes.length });
  };
  document.querySelectorAll("[data-test]").forEach((box) =>
    box.addEventListener("change", () => {
      const set = new Set(p.tests[route.id] || []);
      box.checked ? set.add(+box.dataset.test) : set.delete(+box.dataset.test);
      p.tests[route.id] = [...set];
      saveProgress();
      updateScore();
    })
  );
  updateScore();
  const btn = $("#complete");
  btn?.addEventListener("click", () => {
    p.done[route.id] = !p.done[route.id];
    if (!p.done[route.id]) delete p.done[route.id];
    saveProgress();
    btn.setAttribute("aria-pressed", String(!!p.done[route.id]));
    btn.textContent = p.done[route.id] ? t("completed") : t("markComplete");
  });
}

/* ---------- boot ---------- */
async function boot() {
  applyLanguage();
  $("#lang-select").addEventListener("change", (e) => {
    lang = e.target.value;
    store.set(LANG_KEY, lang);
    applyLanguage();
    render();
  });
  $("#reset-progress").addEventListener("click", () => {
    if (confirm(t("resetConfirm"))) {
      progress = {};
      store.remove(PROGRESS_KEY);
      render();
    }
  });
  window.addEventListener("hashchange", render);
  try {
    directions = (await loadJSON("data/directions.json")).directions;
  } catch (err) {
    console.error(err);
    $("#main").innerHTML = `<div class="notice" role="alert">${esc(t("loadError"))}</div>`;
    return;
  }
  render();
}
boot();
