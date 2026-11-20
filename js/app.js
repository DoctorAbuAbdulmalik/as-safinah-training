import { LANGS, UI } from "./i18n.js";
import { icon, shipDisc, waveRule, nameplate, wheel } from "./symbols.js";
import { KEY, DECKS } from "./key.js";

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
const THEME_KEY = "safinah.theme";
const SITE = "https://as-safinah.org";
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
const isRTL = () => LANGS.find((l) => l.code === lang).dir === "rtl";
/** Numbers written by the interface: Arabic-Indic digits in Arabic. */
const digits = (s) => (lang === "ar" ? String(s).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]) : String(s));
const t = (key, vars) => {
  const s = UI[lang]?.[key] ?? UI.en[key] ?? key;
  return vars ? fmt(s, Object.fromEntries(Object.entries(vars).map(([k, v]) => [k, typeof v === "number" || /^[\d–-]+$/.test(v) ? digits(v) : v]))) : s;
};
const tEn = (key, vars) => (vars ? fmt(UI.en[key], vars) : UI.en[key]);
const L = (obj) => (obj ? obj[lang] ?? obj.en : "");
const pad = (n) => digits(String(n).padStart(2, "0"));

/* ---------- data ---------- */
async function loadJSON(path) {
  if (!jsonCache.has(path)) {
    const p = fetch(path).then((r) => { if (!r.ok) throw new Error(`${path}: ${r.status}`); return r.json(); });
    p.catch(() => jsonCache.delete(path)); // allow "Try again"
    jsonCache.set(path, p);
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
  // the opening paragraph of a shared section can be worded for this programme
  for (const s of modules.filter((m) => m.shared).flatMap((m) => m.sections)) {
    const own = s._translated && lang !== "en" ? tr?.sharedIntro?.[s.id] : en.sharedIntro?.[s.id];
    if (own && (lang === "en" || !s._translated || tr?.sharedIntro?.[s.id])) s.intro = own;
  }
  const glossaryTr = lang !== "en" && tr?.glossary?.length ? tr.glossary : null;
  return { ...en, modules, glossary: glossaryTr || en.glossary || [], _glossaryTranslated: lang === "en" || !!glossaryTr };
}

/* ---------- progress ---------- */
const dirProgress = (id) => (progress[id] ||= { done: {}, tests: {} });
const saveProgress = () => store.set(PROGRESS_KEY, progress);
const allSections = (data) => data.modules.flatMap((m) => m.sections.map((s) => ({ m, s })));
const nextPort = (d, data) => {
  const p = dirProgress(d.id);
  const all = allSections(data);
  return all.find(({ s }) => !p.done[s.id]) || null;
};
const moduleDone = (p, m) => m.sections.every((s) => p.done[s.id]);
const sectionRange = (m) => {
  const a = m.sections[0].number, b = m.sections[m.sections.length - 1].number;
  return a === b ? `${a}` : `${a}–${b}`;
};

/* ---------- shell ---------- */
function applyLanguage() {
  const meta = LANGS.find((l) => l.code === lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = meta.dir;
  $("#brand-name").textContent = t("appName");
  $("#brand-sub").textContent = t("appSub");
  $("#brand").setAttribute("aria-label", `${t("appName")} — ${t("appSub")}`);
  $("#skip-link").textContent = t("skip");
  $("#nav-main").textContent = t("navMain");
  $("#nav-programmes").textContent = t("navProgrammes");
  $("#nav-voyage").textContent = t("navVoyage");
  $("#nav-about").textContent = t("navAbout");
  $("#nav-key").textContent = t("navKey");
  $("#footer-key").textContent = t("navKey");
  $("#menu-btn").innerHTML = icon("menu", { label: t("menu") });
  $("#lang-plate").setAttribute("aria-label", t("language"));
  $("#lang-plate").innerHTML = LANGS.map((l) => `<button type="button" lang="${l.code}" data-lang="${l.code}" aria-pressed="${l.code === lang}" title="${esc(l.name)}">${esc(l.label)}</button>`).join("");
  updateThemeButton();
  $("#wave-top").innerHTML = waveRule();
  $("#wave-bottom").innerHTML = waveRule();
  $("#part-of").innerHTML = `${icon("harbour")}<div><b>${esc(t("partOf"))}</b><small>${esc(t("footerPlace"))} · <a href="${SITE}" rel="noopener">as-safinah.org</a> · ${esc(t("motto"))}</small></div>`;
  $("#part-of-links").innerHTML = ["learn", "volunteer", "partner", "support"].map((k) => `<a href="${SITE}" rel="noopener">${esc(t(k))}</a>`).join("");
  $("#copyright").textContent = t("copyright");
  $("#reset-progress").textContent = t("resetProgress");
}

function updateThemeButton() {
  const light = document.documentElement.dataset.theme === "light";
  const label = light ? t("themeDark") : t("themeLight");
  $("#theme-btn").innerHTML = icon(light ? "moon" : "sun");
  $("#theme-btn").setAttribute("aria-label", label);
  $("#theme-btn").title = label;
  document.querySelector(".theme-in-menu").innerHTML = `${icon(light ? "moon" : "sun")}<span>${esc(label)}</span>`;
}

/* ---------- routing ---------- */
function parseRoute() {
  const parts = (location.hash.replace(/^#\/?/, "") || "").split("/").filter(Boolean);
  if (parts[0] === "programmes") return { view: "home", anchor: "programmes" };
  if (parts[0] === "voyage") return { view: "voyage" };
  if (parts[0] === "about") return { view: "about" };
  if (parts[0] === "key") return { view: "key" };
  if (parts[0] === "d" && parts[1]) {
    if (parts[2] === "m" && parts[3]) return { view: "module", dir: parts[1], id: parts[3] };
    if (parts[2] === "s" && parts[3]) return { view: "section", dir: parts[1], id: parts[3] };
    if (parts[2] === "glossary") return { view: "glossary", dir: parts[1] };
    return { view: "course", dir: parts[1] };
  }
  return parts.length ? { view: "notfound" } : { view: "home" };
}

let renderSeq = 0;
async function render() {
  const seq = ++renderSeq;
  const route = parseRoute();
  const main = $("#main");
  document.querySelectorAll("[data-nav]").forEach((a) => {
    const n = a.dataset.nav;
    const on = (n === "home" && route.view === "home" && !route.anchor) || (n === "programmes" && (route.anchor || route.dir)) || n === route.view;
    on ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current");
  });
  $(".bridge").classList.remove("open");
  $("#menu-btn").setAttribute("aria-expanded", "false");
  const slow = setTimeout(() => { if (seq === renderSeq) main.innerHTML = renderLoading(); }, 180);
  let html;
  try {
    if (route.view === "home") html = renderHome();
    else if (route.view === "notfound") html = renderNotFound();
    else if (route.view === "voyage") html = await renderVoyage();
    else if (route.view === "about") html = renderAbout();
    else if (route.view === "key") html = renderKey();
    else {
      const d = directions.find((x) => x.id === route.dir);
      if (!d) html = renderNotFound();
      else if (d.status !== "active") html = route.view === "course" ? renderCourseSoon(d) : renderNotFound();
      else {
        const data = await loadDirection(d.id);
        if (route.view === "course") html = renderCourse(d, data);
        else if (route.view === "module") html = renderModule(d, data, route.id) || renderNotFound();
        else if (route.view === "glossary") html = renderGlossary(d, data);
        else html = renderSection(d, data, route.id) || renderNotFound();
      }
    }
  } catch (err) {
    console.error(err);
    html = renderError();
  }
  clearTimeout(slow);
  if (seq !== renderSeq) return;
  main.innerHTML = html;
  bindPage(route);
  const h1 = main.querySelector("h1");
  document.title = (h1 ? h1.textContent.trim() + " · " : "") + `${t("appName")} — ${t("appSub")}`;
  if (route.anchor) document.getElementById(route.anchor)?.scrollIntoView();
  else window.scrollTo(0, 0);
}

/* ---------- shared pieces ---------- */
const crumbs = (items) =>
  `<nav class="crumbs" aria-label="Breadcrumb">${icon("compass")}${items
    .map((it, i) => (i === items.length - 1 ? `<span aria-current="page">${esc(it.label)}</span>` : `<a href="${it.href}">${esc(it.label)}</a><span class="sep" aria-hidden="true">›</span>`))
    .join("")}</nav>`;

const arrow = () => icon("arrow", { cls: "ico-flip" });
const progWheel = (d, extra = {}) =>
  wheel({ rtl: isRTL(), num: digits, moduleWord: t("module"), flagship: !!d.flagship, grey: d.status !== "active", ...extra });

const renderLoading = () => `<div class="loading" role="status">${icon("compass")}<p>${esc(t("loading"))}</p></div>`;
const renderError = () => `<div class="state-box" role="alert">${icon("flags")}<h1>${esc(t("loadError"))}</h1><p class="lead" style="margin-inline:auto">${esc(t("loadErrorText"))}</p><button type="button" class="btn" id="retry">${esc(t("tryAgain"))}</button></div>`;
const renderNotFound = () => `<div class="state-box">${icon("chart")}<h1>${esc(t("notFound"))}</h1><p class="lead" style="margin-inline:auto">${esc(t("notFoundText"))}</p><a class="btn" href="#/">${esc(t("backHome"))}</a></div>`;
const notTranslated = () => `<div class="notice" role="note">${esc(t("notTranslated"))}</div>`;
const quoteMarks = (v) => (/Narrated|رواه|Bukhārī|Muslim|Buhârî|Müslim|rivayet/.test(v.ref) ? `«${esc(v.ar)}»` : `﴿${esc(v.ar)}﴾`);

/* ---------- home: the main deck ---------- */
function renderHome() {
  const flag = directions.filter((d) => d.flagship);
  const spec = directions.filter((d) => !d.flagship);
  const statusLine = (d) => (d.status === "active" ? t("openModules", { n: 6 }) : d.soon === "opening" ? t("inPreparation") : t("beingBuilt"));

  const flagCards = flag.map((d) => {
    const active = d.status === "active";
    return `<a class="flag-card" href="#/d/${d.id}">
      <span class="eyebrow">${icon("pennant")}${esc(t("flagshipTag", { n: pad(d.number) }))}</span>
      ${progWheel(d)}
      <h3>${esc(L(d.title))}</h3>
      ${d.promise ? `<p>${esc(L(d.promise))}</p>` : ""}
      <span class="caps stats">${esc(d.sections ? t("statsLine", { m: 6, s: d.sections, x: d.sessions }) : t("chipModules", { n: 6 }) + " · " + statusLine(d))}</span>
      <span class="btn${active ? "" : " ghost"}">${active ? `${esc(t("boardCourse"))} ${arrow()}` : `${shipDisc("sm")} ${esc(t("openingSoon"))}`}</span>
    </a>`;
  }).join("");

  const specCards = spec.map((d) => `<a class="spec-card" href="#/d/${d.id}">
      <span class="ring">${icon(d.symbol)}</span>
      ${progWheel(d)}
      <h3>${esc(L(d.title))}</h3>
      <span class="caps">${esc(statusLine(d))}</span>
    </a>`).join("");

  return `
    <section class="hero">
      <div class="hero-logo">
        <img class="dark" src="assets/logo-navy.webp" width="440" height="662" alt="السفينة — As Safinah, Centre for Humanitarian Excellence">
        <img class="light" src="assets/logo.webp" width="480" height="722" alt="السفينة — As Safinah, Centre for Humanitarian Excellence">
      </div>
      <div>
        <p class="eyebrow">${esc(t("heroEyebrow"))}</p>
        <h1>${esc(t("heroTitle"))} <em>${esc(t("heroTitleEm"))}</em></h1>
        <p class="lead">${esc(t("heroLead"))}</p>
        <div class="btn-row"><a class="btn" href="#/programmes">${icon("compass")} ${esc(t("chooseProgramme"))}</a></div>
      </div>
    </section>

    ${nameplate(esc(t("beforeBoard")))}
    <section class="board">
      <div class="board-wheel">
        ${wheel({ rtl: isRTL(), num: digits })}
        <p>${esc(t("wheelNote"))} <em>${esc(t("wheelNoteShared"))}</em></p>
      </div>
      <div>
        <p>${esc(t("boardLead"))} ${esc(t("whoForLead"))} <b>${esc(t("whoForList"))}</b></p>
        <div class="steps">
          <div class="step">${shipDisc("lg")}<div><span class="caps">${esc(t("step", { n: 1 }))}</span><h3>${esc(t("step1Title"))}</h3><p>${esc(t("step1Text"))}</p></div></div>
          <div class="step"><span class="ring">${icon("chart")}</span><div><span class="caps">${esc(t("step", { n: 2 }))}</span><h3>${esc(t("step2Title"))}</h3><p>${esc(t("step2Text"))}</p></div></div>
          <div class="step"><span class="ring">${icon("sounding")}</span><div><span class="caps">${esc(t("step", { n: 3 }))}</span><h3>${esc(t("step3Title"))}</h3><p>${esc(t("step3Text"))}</p></div></div>
        </div>
      </div>
    </section>

    <div id="programmes">${nameplate(esc(t("flagship")), "pennant")}</div>
    <section class="flagships" aria-label="${esc(t("flagship"))}">${flagCards}</section>

    ${nameplate(esc(t("specialist")))}
    <section class="specials" aria-label="${esc(t("specialist"))}">${specCards}</section>`;
}

/* ---------- course screen ---------- */
function courseIntro(d, { sections, sessions }) {
  const chips = [t("chipModules", { n: 6 }), sections && t("chipSections", { n: sections }), sessions && t("chipSessions", { n: sessions }), "English · العربية · Türkçe"].filter(Boolean);
  return `
    <p class="eyebrow">${icon(d.flagship ? "pennant" : d.symbol)}${esc(d.flagship ? t("flagshipTag", { n: pad(d.number) }) : t("programmeTag", { n: pad(d.number) }))}</p>
    <h1>${esc(L(d.title))}</h1>
    ${d.promise ? `<p class="promise">${esc(L(d.promise))}</p>` : ""}
    <div class="chips">${chips.map((c) => `<span class="chip">${esc(c)}</span>`).join("")}</div>
    ${d.audience || d.produce ? `<div class="facts">
      ${d.audience ? `<div><b>${esc(t("whoFor"))}</b><span>${esc(L(d.audience))}</span></div>` : ""}
      ${d.produce ? `<div><b>${esc(t("produce"))}</b><span>${esc(L(d.produce))}</span></div>` : ""}
    </div>` : ""}`;
}

function anchorBox(v, english = false) {
  if (!v) return "";
  // in Arabic the verse itself is the text; an English rendering of its meaning is not needed
  const showText = v.text && !(lang === "ar" && english);
  return `<div class="anchor-box">${icon("anchor", { label: t("islamicFoundation") })}<div style="flex:1">
    ${v.ar ? `<p class="ar" lang="ar">${quoteMarks(v)}</p>` : ""}
    ${showText ? `<blockquote${english && lang !== "en" ? ' lang="en" dir="ltr"' : ""}>“${esc(v.text)}”</blockquote>` : ""}
    <cite class="caps">${esc(v.ref)}</cite></div></div>`;
}

function renderCourseSoon(d) {
  const titles = d.moduleTitles ? L(d.moduleTitles) : [];
  const v = d.foundation ? { ar: d.foundation.ar, text: lang === "ar" ? "" : L(d.foundation.text), ref: L(d.foundation.ref) } : null;
  return `
    ${crumbs([{ label: t("navMain"), href: "#/" }, { label: t("navProgrammes"), href: "#/programmes" }, { label: L(d.title) }])}
    <section class="course-head">
      <div>
        ${courseIntro(d, { sections: d.sections, sessions: d.sessions })}
        ${anchorBox(v)}
        <div class="soon-panel">${d.soon === "opening" ? shipDisc("lg") : `<span class="ring">${icon("cog")}</span>`}<div><h2 style="margin:0 0 4px">${esc(d.soon === "opening" ? t("openingSoon") : t("beingBuilt"))}</h2><p style="margin:0">${esc(d.soon === "opening" ? t("soonOpeningText") : t("soonBuildingText"))}</p></div></div>
      </div>
      <div>${progWheel(d, { titles, labels: titles.length > 0, label: t("wheelLabel", { name: L(d.title) }) })}</div>
    </section>`;
}

function voyageRoute(d, data) {
  const p = dirProgress(d.id);
  const all = allSections(data);
  const here = nextPort(d, data);
  const done = all.filter(({ s }) => p.done[s.id]).length;
  const ports = all.map(({ s }) => {
    const isDone = !!p.done[s.id];
    const isHere = here && here.s.id === s.id;
    return `<li class="${isDone ? "is-done" : ""}${isHere ? " is-here" : ""}">
      ${isHere ? `<span class="marker">${shipDisc()}</span>` : ""}
      <a href="#/d/${d.id}/s/${s.id}" aria-label="${esc(`${t("section")} ${s.number}: ${s.title}${isDone ? " — " + t("logged") : ""}`)}"><span class="port"></span>${digits(s.number)}</a></li>`;
  }).join("");
  const note = here
    ? `${esc(t("voyageLine", { n: done, m: all.length }))} ${esc(t("nextPort"))}: <a href="#/d/${d.id}/s/${here.s.id}">${esc(t("section"))} ${digits(here.s.number)}, ${esc(here.s.title)}</a>.`
    : esc(t("voyageDone"));
  return `<div class="route" style="--ports:${all.length}"><ol>${ports}</ol></div><p class="route-note">${note}</p>`;
}

function renderCourse(d, data) {
  const p = dirProgress(d.id);
  const all = allSections(data);
  const here = nextPort(d, data);
  const started = all.some(({ s }) => p.done[s.id]);
  const target = here || all[0];
  const startLabel = !here ? t("reviewVoyage") : started ? t("continueVoyage") : t("beginVoyage");
  const doneSet = new Set(data.modules.map((m, i) => (moduleDone(p, m) ? i : -1)).filter((i) => i >= 0));
  const m1 = data.modules[0];
  const v = m1.foundation?.verses?.[0];

  const modCards = data.modules.map((m, i) => {
    const isDone = moduleDone(p, m);
    const isHere = !isDone && here && here.m.id === m.id;
    const state = isDone ? `${icon("log")} ${esc(t("logged"))}` : isHere ? `${shipDisc("sm")} ${esc(t("onBoard"))}` : `${icon("diamond")} ${esc(t("ahead"))}`;
    const sess = d.moduleSessions?.[i];
    return `<a class="mod-card${isDone ? " is-done" : ""}${isHere ? " is-here" : ""}" href="#/d/${d.id}/m/${m.id}">
      <span class="n">${digits(m.number)}</span>
      <h3>${esc(m.title)}</h3>
      <span class="caps">${esc(t("sectionsRange", { r: sectionRange(m) }))}${sess ? " · " + esc(t("sessionsRange", { r: sess })) : ""}${m.shared ? " · " + esc(t("shared")) : ""}</span>
      <span class="caps state">${state}</span>
    </a>`;
  }).join("");

  return `
    ${crumbs([{ label: t("navMain"), href: "#/" }, { label: t("navProgrammes"), href: "#/programmes" }, { label: L(d.title) }])}
    <section class="course-head">
      <div>
        ${courseIntro(d, { sections: all.length, sessions: d.sessions })}
        ${anchorBox(v, !m1._translated)}
        <div class="btn-row">
          <a class="btn" href="#/d/${d.id}/s/${target.s.id}">${esc(startLabel)} ${arrow()}</a>
          ${data.glossary.length ? `<a class="btn ghost" href="#/d/${d.id}/glossary">${icon("flags")} ${esc(t("glossary"))}</a>` : ""}
        </div>
      </div>
      <div>
        ${progWheel(d, { titles: data.modules.map((m) => m.title), labels: true, done: doneSet, hrefs: data.modules.map((m) => `#/d/${d.id}/m/${m.id}`), label: t("wheelLabel", { name: L(d.title) }) })}
        <p class="wheel-cap">${esc(t("wheelCaption"))}</p>
      </div>
    </section>

    ${here ? "" : harbourPanel()}
    ${nameplate(esc(t("yourVoyage")), "log")}
    ${voyageRoute(d, data)}

    ${nameplate(esc(t("sixModules")), "porthole")}
    <section class="mod-grid">${modCards}</section>
    ${courseOutline(d, data)}
    <p class="muted" style="margin-top:22px;font-size:.85rem;color:var(--muted)">${esc(data.source || "")}</p>`;
}

/* ---------- module screen ---------- */
function renderModule(d, data, id) {
  const idx = data.modules.findIndex((x) => x.id === id);
  if (idx < 0) return null;
  const m = data.modules[idx];
  const p = dirProgress(d.id);
  const doneSet = new Set(data.modules.map((mm, i) => (moduleDone(p, mm) ? i : -1)).filter((i) => i >= 0));
  const first = m.sections[0];
  const nextM = data.modules[idx + 1];
  const fallback = !m._translated;
  const content = fallback ? ' lang="en" dir="ltr"' : "";
  const sess = d.moduleSessions?.[idx];

  const verses = (m.foundation?.verses || []).map((v) => `
    <figure class="verse">
      ${v.ar ? `<p class="ar" lang="ar">${quoteMarks(v)}</p>` : ""}
      ${v.text ? `<blockquote>“${esc(v.text)}”</blockquote>` : ""}
      <cite>${esc(v.ref)}</cite>
    </figure>`).join("");

  const ports = m.sections.map((s) => {
    const isDone = !!p.done[s.id];
    return `<a class="port-row${isDone ? " is-done" : ""}" href="#/d/${d.id}/s/${s.id}">
      <span class="disc">${isDone ? icon("check") : digits(s.number)}</span>
      <span><span class="caps">${esc(t("section"))} ${digits(s.number)}</span><h3${s._translated ? "" : ' lang="en"'}>${esc(s.title)}</h3><em${s._translated ? "" : ' lang="en"'}>${esc((s._translated ? t("theShip") : tEn("theShip")) + ": " + s.ship.title)}</em></span>
      ${isDone ? `<span class="caps state">${icon("log")} ${esc(t("logged"))}</span>` : ""}
    </a>`;
  }).join("");

  return `
    ${crumbs([{ label: t("navMain"), href: "#/" }, { label: L(d.title), href: `#/d/${d.id}` }, { label: `${t("module")} ${digits(m.number)}` }])}
    ${fallback ? notTranslated() : ""}
    <section class="mod-head">
      ${progWheel(d, { titles: data.modules.map((x) => x.title), labels: true, lit: idx, done: doneSet, hrefs: data.modules.map((x) => `#/d/${d.id}/m/${x.id}`), label: t("wheelLabel", { name: L(d.title) }) })}
      <div${content}>
        <p class="eyebrow">${esc(t("moduleOf", { n: m.number }))} · ${esc(t("sectionsRange", { r: sectionRange(m) }))}${sess ? " · " + esc(t("sessionsRange", { r: sess })) : ""}</p>
        ${m.shared ? `<p class="caps" style="margin:0 0 8px">${icon("diamond")} ${esc(t("sharedModule"))}</p>` : ""}
        <h1>${esc(m.title)}</h1>
        <p class="promise">${esc(m.tagline)}</p>
        <div class="btn-row">
          <a class="btn" href="#/d/${d.id}/s/${first.id}">${esc(t("setSail", { n: first.number }))} ${arrow()}</a>
          <a class="btn ghost" href="#/d/${d.id}">${icon("porthole")} ${esc(t("allModules"))}</a>
        </div>
      </div>
    </section>

    ${moduleDone(p, m) ? `<div class="logged-panel" role="status">${icon("log")}<div><b>${esc(t("moduleLogged", { n: m.number }))}</b><span>${esc(nextM ? t("moduleLoggedText", { next: nextM.number }) : t("moduleLoggedLast"))}</span></div></div>` : ""}
    <section class="foundation"${content}>
      ${nameplate(esc(fallback ? tEn("islamicFoundation") : t("islamicFoundation")), "anchor")}
      <div class="verses">${verses}</div>
      <div class="why"><h3>${esc(fallback ? tEn("whyItSitsHere") : t("whyItSitsHere"))}</h3>${(m.foundation?.why || []).map((w) => `<p>${esc(w)}</p>`).join("")}</div>
    </section>

    ${nameplate(esc(t("portsOfCall")), "chart")}
    <section class="ports">${ports}</section>

    <section class="parch" style="margin-top:36px"${content}>
      <div class="panel-title">${icon("lighthouse")}<h2>${esc(fallback ? tEn("learningOutcomes") : t("learningOutcomes"))}</h2></div>
      <p class="muted">${esc(fallback ? tEn("outcomesLead") : t("outcomesLead"))}</p>
      <ol class="outcomes">${m.outcomes.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ol>
      <div class="evidence"><b>${esc(fallback ? tEn("evidence") : t("evidence"))}:</b> ${esc(m.outcomes.evidence)}</div>
    </section>

    <nav class="pager" aria-label="${esc(t("allModules"))}">
      <a class="prev" href="#/d/${d.id}"><small>${esc(t("allModules"))}</small>${esc(L(d.title))}</a>
      ${nextM ? `<a class="next" href="#/d/${d.id}/m/${nextM.id}"><small>${esc(t("nextModule", { n: nextM.number }))}</small>${esc(nextM.title)}</a>` : ""}
    </nav>`;
}

/* ---------- the lesson ---------- */
function renderBlock(b, ctx) {
  if (b.type === "ul") return `<ul>${b.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;
  if (b.type === "h3") return `<h3>${esc(b.text)}</h3>`;
  if (b.type === "table")
    return `<div class="table-wrap" role="region" tabindex="0" aria-label="${esc(b.caption)}"><table>
      <caption>${esc(b.caption)}</caption>
      <thead><tr>${b.head.map((h) => `<th scope="col">${esc(h)}</th>`).join("")}</tr></thead>
      <tbody>${b.rows.map((r) => `<tr>${r.map((c, i) => (i === 0 ? `<th scope="row">${esc(c)}</th>` : `<td>${esc(c)}</td>`)).join("")}</tr>`).join("")}</tbody>
    </table></div>`;
  if (b.type === "example") return `<aside class="example"><b>${esc(ctx.lbl("example"))} — ${esc(b.title)}</b>${esc(b.text)}</aside>`;
  return `<p>${esc(b.text)}</p>`;
}

function shipPanel(ship, lbl, small) {
  const H = small ? "h3" : "h2";
  return `<section class="ship-panel${small ? " small" : ""}" aria-label="${esc(lbl("theShip"))}">
    <p class="eyebrow">${shipDisc("sm")} ${esc(lbl("theShip"))}</p>
    <${H}>${esc(ship.title)}</${H}>
    ${ship.body.map((x) => `<p>${esc(x)}</p>`).join("")}
    ${ship.claim ? `<p class="claim">${esc(ship.claim)}</p>` : ""}
    <p class="onboard"><b>${esc(lbl("onBoardHere"))}</b><span>${esc(ship.question)}</span></p>
  </section>`;
}

function renderSection(d, data, id) {
  const all = allSections(data);
  const idx = all.findIndex(({ s }) => s.id === id);
  if (idx < 0) return null;
  const { m, s } = all[idx];
  const mIdx = data.modules.indexOf(m);
  const p = dirProgress(d.id);
  const checked = new Set(p.tests[s.id] || []);
  const prev = all[idx - 1];
  const next = all[idx + 1];
  const tr = s._translated;
  const contentAttrs = tr ? "" : ' lang="en" dir="ltr"';
  const lbl = (k, v) => (tr ? t(k, v) : tEn(k, v));
  const ctx = { lbl };
  const doneSet = new Set(data.modules.map((mm, i) => (moduleDone(p, mm) ? i : -1)).filter((i) => i >= 0));
  const hid = (sub) => "h-" + sub.id.replace(".", "-");

  const subs = s.subsections.map((sub) => `
    <section aria-labelledby="${hid(sub)}">
      <h2 id="${hid(sub)}"><span class="n">${esc(sub.id)}</span>${esc(sub.title)}</h2>
      ${sub.ship ? shipPanel(sub.ship, lbl, true) : ""}
      ${sub.blocks.map((b) => renderBlock(b, ctx)).join("")}
    </section>`).join("");

  const r = s.review;
  const review = r ? `
    <div class="divider"><i></i>${esc(lbl("sectionReview"))}<i></i></div>
    <section aria-labelledby="rev">
      <div class="review-h">${icon("sounding")}<h2 id="rev">${esc(lbl("tenTests"))}</h2></div>
      <p class="muted">${esc(r.intro)}. ${esc(lbl("testsLead"))}</p>
      <ul class="tests">
        ${r.tests.map((q, i) => `<li><label><input type="checkbox" data-test="${i}" ${checked.has(i) ? "checked" : ""}><span>${esc(q)}</span></label></li>`).join("")}
      </ul>
      <p class="score" id="score" aria-live="polite"></p>
    </section>
    <section>
      <div class="review-h">${icon("bell")}<h2>${esc(lbl("questions"))}</h2></div>
      <ol class="q">${r.questions.map((q) => `<li>${esc(q)}</li>`).join("")}</ol>
    </section>
    <section class="exercise">${icon("knot")}<div><h2>${esc(lbl("exercise"))}</h2><p style="margin:0">${esc(r.exercise)}</p></div></section>` : "";

  const isDone = !!p.done[s.id];
  const route = `<div class="route" style="--ports:${all.length};margin-bottom:22px"><ol>${all.map(({ s: x }, i) => `<li class="${p.done[x.id] ? "is-done" : ""}${i === idx ? " is-here" : ""}">${i === idx ? `<span class="marker">${shipDisc()}</span>` : ""}<a href="#/d/${d.id}/s/${x.id}" aria-label="${esc(`${t("section")} ${x.number}: ${x.title}`)}"${i === idx ? ' aria-current="page"' : ""}><span class="port"></span>${digits(x.number)}</a></li>`).join("")}</ol></div>`;

  return `
    ${crumbs([{ label: t("navMain"), href: "#/" }, { label: L(d.title), href: `#/d/${d.id}` }, { label: `${t("module")} ${digits(m.number)}`, href: `#/d/${d.id}/m/${m.id}` }, { label: `${t("section")} ${digits(s.number)}` }])}
    ${route}
    ${tr ? "" : notTranslated()}
    <div class="lesson-grid">
      <article class="parch lesson"${contentAttrs}>
        <p class="eyebrow">${esc(lbl("sectionKicker", { s: s.number, m: m.number, title: m.title }))}</p>
        <h1>${esc(s.title)}</h1>
        <div class="rule"></div>
        ${shipPanel(s.ship, lbl, false)}
        ${s.intro.map((x) => `<p>${esc(x)}</p>`).join("")}
        <nav class="toc-box" aria-label="${esc(lbl("inThisSection"))}"><span class="caps">${esc(lbl("inThisSection"))}</span>
          <ul>${s.subsections.map((sub) => `<li><a href="#" data-jump="${hid(sub)}">${esc(sub.id)} ${esc(sub.title)}</a></li>`).join("")}${r ? `<li><a href="#" data-jump="rev">${esc(lbl("sectionReview"))}</a></li>` : ""}</ul>
        </nav>
        ${subs}
        ${review}
        <div class="log-row">
          <button type="button" class="btn" id="complete" aria-pressed="${isDone}">${icon("log")} <span>${esc(isDone ? t("inLog") : t("enterLog"))}</span></button>
          <p>${esc(t("logNote"))}</p>
        </div>
      </article>
      <aside class="aside">
        <a class="aside-card center" href="#/d/${d.id}/m/${m.id}">
          ${progWheel(d, { lit: mIdx, done: doneSet, label: `${L(d.title)} · ${t("module")} ${m.number}` })}
          <span class="caps">${esc(L(d.title))} · ${esc(t("module"))} ${digits(m.number)}</span>
        </a>
        ${data.glossary.length ? `<a class="aside-card" href="#/d/${d.id}/glossary">${icon("flags")}<span>${esc(t("glossary"))}<small>${esc(t("termsCount", { n: data.glossary.length }))}</small></span></a>` : ""}
      </aside>
    </div>
    <nav class="pager" aria-label="${esc(t("prevPort"))} / ${esc(t("nextPortBtn"))}">
      ${prev ? `<a class="prev" href="#/d/${d.id}/s/${prev.s.id}"><small>${esc(t("prevPort"))}</small>${esc(t("section"))} ${digits(prev.s.number)}, ${esc(prev.s.title)}</a>` : "<span></span>"}
      ${next ? `<a class="next" href="#/d/${d.id}/s/${next.s.id}"><small>${esc(t("nextPortBtn"))}</small>${esc(t("section"))} ${digits(next.s.number)}, ${esc(next.s.title)}</a>` : ""}
    </nav>`;
}

/* ---------- glossary ---------- */
function renderGlossary(d, data) {
  const items = [...data.glossary].sort((a, b) => a.term.localeCompare(b.term, data._glossaryTranslated ? lang : "en"));
  const fallback = !data._glossaryTranslated;
  return `
    ${crumbs([{ label: t("navMain"), href: "#/" }, { label: L(d.title), href: `#/d/${d.id}` }, { label: t("glossary") }])}
    ${fallback ? notTranslated() : ""}
    <section class="parch">
      <div class="panel-title">${icon("flags")}<h1 style="margin:0;font-size:2rem">${esc(t("glossary"))}</h1></div>
      <p class="muted">${esc(t("glossaryLead"))}</p>
      <input class="search" id="gloss-search" type="search" placeholder="${esc(t("search"))}" aria-label="${esc(t("search"))}">
      <dl class="gloss" id="gloss"${fallback ? ' lang="en" dir="ltr"' : ""}>
        ${items.map((g) => `<div data-q="${esc((g.term + " " + g.def).toLowerCase())}"><dt>${esc(g.term)}</dt><dd>${esc(g.def)} <small>(${esc(g.ref)})</small></dd></div>`).join("")}
      </dl>
    </section>`;
}

/* ---------- course outline (sea chart) ---------- */
function courseOutline(d, data) {
  const rows = data.modules.map((m, i) => `<tr>
      <th scope="row">${digits(m.number)}</th>
      <td><b>${esc(m.title)}</b>${m.shared ? ` <span class="tag">${esc(t("shared"))}</span>` : ""}<br><span class="muted">${esc((m.sections.length === 1 ? m.sections[0].subsections : m.sections).map((s) => s.title).join(" · "))}</span></td>
      <td>${digits(sectionRange(m))}</td>
      <td>${digits(d.moduleSessions?.[i] || "")}</td>
    </tr>`).join("");
  return `
    <section class="parch outline" id="outline" aria-labelledby="outline-h">
      <div class="panel-title outline-top">${icon("chart")}<h2 id="outline-h">${esc(t("outline"))}</h2>
        <button type="button" class="btn ghost" id="print-outline">${esc(t("downloadOutline"))}</button></div>
      <p class="print-only"><b>${esc(L(d.title))}</b> · ${esc(t("appName"))} — ${esc(t("appSub"))}</p>
      <p class="muted">${esc(t("outlineLead"))}</p>
      <dl class="outline-facts">
        <div><dt>${esc(t("outlineLength"))}</dt><dd>${esc(t("statsLine", { m: 6, s: allSections(data).length, x: d.sessions || 16 }))}</dd></div>
        <div><dt>${esc(t("outlineFormat"))}</dt><dd>${esc(t("outlineFormatText"))}</dd></div>
        <div><dt>${esc(t("outlineEntry"))}</dt><dd>${esc(t("outlineEntryText"))}</dd></div>
      </dl>
      <p class="caps">${esc(t("outlineTable"))}</p>
      <div class="table-wrap"><table>
        <thead><tr><th scope="col">${esc(t("colModule"))}</th><th scope="col">${esc(t("colTitle"))}</th><th scope="col">${esc(t("colSections"))}</th><th scope="col">${esc(t("colSessions"))}</th></tr></thead>
        <tbody>${rows}</tbody>
      </table></div>
      ${d.audience ? `<p><b>${esc(t("whoFor"))}:</b> ${esc(L(d.audience))}</p>` : ""}
      ${d.produce ? `<p class="produce">${icon("lighthouse")} <span><b>${esc(t("produce"))}:</b> ${esc(L(d.produce))}</span></p>` : ""}
    </section>`;
}

/* ---------- completed course: arriving in harbour ---------- */
const harbourPanel = () => `
  <section class="harbour-panel" role="status">
    <span class="ring big">${icon("harbour")}</span>
    <div>
      <h2>${esc(t("harbourTitle"))}</h2>
      <p>${esc(t("harbourText"))}</p>
      <h3>${esc(t("volunteerTitle"))}</h3>
      <p>${esc(t("volunteerText"))}</p>
      <div class="btn-row">
        <a class="btn" href="${SITE}" rel="noopener">${esc(t("volunteerBtn"))} ${arrow()}</a>
        <a class="btn ghost" href="mailto:bilalsadik@as-safinah.org">${esc(t("writeUs"))}</a>
      </div>
    </div>
  </section>`;

/* ---------- My voyage: the ship's log ---------- */
async function renderVoyage() {
  const active = directions.filter((d) => d.status === "active");
  const datas = await Promise.all(active.map((d) => loadDirection(d.id)));
  let anyLogged = false;
  const cards = active.map((d, i) => {
    const data = datas[i];
    const p = dirProgress(d.id);
    const all = allSections(data);
    const logged = all.filter(({ s }) => p.done[s.id]);
    if (logged.length) anyLogged = true;
    const doneSet = new Set(data.modules.map((m, k) => (moduleDone(p, m) ? k : -1)).filter((k) => k >= 0));
    const here = nextPort(d, data);
    return `<section class="voyage-card">
      <a class="vc-wheel" href="#/d/${d.id}" aria-label="${esc(L(d.title))}">${progWheel(d, { done: doneSet })}</a>
      <div class="vc-body">
        <p class="eyebrow">${icon(d.flagship ? "pennant" : d.symbol)}${esc(t("programmeTag", { n: pad(d.number) }))}</p>
        <h2><a href="#/d/${d.id}">${esc(L(d.title))}</a></h2>
        <p class="caps">${esc(t("voyageCount", { n: logged.length, m: all.length }))}</p>
        ${logged.length ? `<ul class="log-list" aria-label="${esc(t("loggedSections"))}">${logged.map(({ s }) => `<li><a href="#/d/${d.id}/s/${s.id}">${icon("log")}<span>${esc(t("section"))} ${digits(s.number)}, ${esc(s.title)}</span></a></li>`).join("")}</ul>` : ""}
        ${here
          ? `<a class="btn" href="#/d/${d.id}/s/${here.s.id}">${esc(logged.length ? t("continueVoyage") : t("beginVoyage"))} ${arrow()}</a>`
          : `<p class="caps">${icon("harbour")} ${esc(t("harbourTitle"))}</p>`}
      </div>
    </section>`;
  }).join("");
  return `
    ${crumbs([{ label: t("navMain"), href: "#/" }, { label: t("voyageTitle") }])}
    <div class="page-head"><span class="ring big">${icon("log")}</span><div><h1>${esc(t("voyageTitle"))}</h1><p class="lead">${esc(t("voyageLead"))}</p></div></div>
    ${anyLogged ? "" : `<div class="soon-panel">${shipDisc("lg")}<p style="margin:0">${esc(t("voyageEmpty"))} <a href="#/programmes">${esc(t("chooseProgramme"))}</a></p></div>`}
    <div class="voyages">${cards}</div>
    <p class="reset-row">${esc(t("resetNote"))} <button type="button" class="link-btn" id="reset-here">${esc(t("resetProgress"))}</button></p>`;
}

/* ---------- About the Ship: a cut-away of the larger vessel ---------- */
function renderAbout() {
  const decks = DECKS[lang] || DECKS.en;
  const ys = [172, 199, 226];
  const svg = `<svg class="cutaway" viewBox="0 0 400 270" role="img" aria-label="${esc(decks.map((x) => x[0]).join(", "))}">
    <defs><clipPath id="hull"><path d="M28 155 L372 155 L342 236 Q200 254 58 236 Z"/></clipPath></defs>
    <g class="ca-rig">
      <path d="M200 155 V22"/><path d="M200 24 l24 7 -24 7"/>
      <path d="M206 38 L292 140 L206 140 Z" class="ca-sail"/><path d="M194 50 L116 140 L194 140 Z" class="ca-sail"/>
      <path d="M372 155 L398 136"/><path d="M200 30 L398 136" class="ca-stay"/><path d="M200 30 L22 150" class="ca-stay"/>
    </g>
    <g clip-path="url(#hull)">
      <rect x="0" y="155" width="400" height="30" class="ca-deck ca-here"/>
      <rect x="0" y="185" width="400" height="27" class="ca-deck"/>
      <rect x="0" y="212" width="400" height="50" class="ca-deck ca-low"/>
      <path d="M0 185 H400 M0 212 H400" class="ca-line"/>
    </g>
    <path d="M28 155 L372 155 L342 236 Q200 254 58 236 Z" class="ca-hull"/>
    ${decks.map((x, i) => `<text x="200" y="${ys[i]}" text-anchor="middle" class="ca-label${i === 0 ? " here" : ""}">${esc(x[0])}${i === 0 ? ` · ${esc(t("youAreHere"))}` : ""}</text>`).join("")}
    <path d="M6 258 q12-7 24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0" class="ca-wave"/>
  </svg>`;
  return `
    ${crumbs([{ label: t("navMain"), href: "#/" }, { label: t("aboutTitle") }])}
    <div class="about-grid">
      <div>
        <p class="eyebrow">${esc(t("heroEyebrow"))}</p>
        <h1>${esc(t("aboutTitle"))}</h1>
        <p class="lead">${esc(t("aboutLead"))}</p>
        <div class="decks-list">
          ${decks.map((x, i) => `<div class="deck-card${i === 0 ? " here" : ""}"><h2>${esc(x[0])}${i === 0 ? `<span class="caps">${esc(t("youAreHere"))}</span>` : ""}</h2><p>${esc(x[1])}</p></div>`).join("")}
        </div>
        <p><a class="btn ghost" href="${SITE}" rel="noopener">${esc(t("aboutMore"))} ${arrow()}</a></p>
      </div>
      <div class="cutaway-wrap">${svg}<p class="muted">${esc(t("motto"))}</p></div>
    </div>`;
}

/* ---------- the Ship's Key ---------- */
function renderKey() {
  const rows = KEY[lang] || KEY.en;
  return `
    ${crumbs([{ label: t("navMain"), href: "#/" }, { label: t("keyTitle") }])}
    <p class="eyebrow">${esc(t("keyEyebrow"))}</p>
    <h1>${esc(t("keyTitle"))}</h1>
    <p class="lead">${esc(t("keyLead"))}</p>
    <dl class="key-grid">
      ${rows.map(([sym, name, meaning, where]) => `<div class="key-card">
        ${sym === "ship" ? shipDisc("lg") : `<span class="ring big">${icon(sym)}</span>`}
        <div><dt>${esc(name)}</dt><dd>${esc(meaning)}<span class="caps">${esc(where)}</span></dd></div>
      </div>`).join("")}
    </dl>`;
}

/* ---------- Welcome aboard: shown once, on the first visit ---------- */
const WELCOME_KEY = "safinah.welcomed";
function maybeWelcome() {
  if (store.get(WELCOME_KEY, false) || !window.HTMLDialogElement) return;
  const dlg = document.createElement("dialog");
  dlg.className = "tour";
  dlg.setAttribute("aria-labelledby", "tour-title");
  document.body.appendChild(dlg);
  let step = 1;
  const art = () =>
    step === 1 ? shipDisc("xl")
    : step === 2 ? wheel({ rtl: isRTL(), num: digits, done: new Set([0, 1]) })
    : `<div class="tour-icons">${["anchor", "sounding", "lighthouse", "log"].map((s) => `<span class="ring big">${icon(s)}</span>`).join("")}</div>`;
  const draw = () => {
    dlg.innerHTML = `
      <div class="tour-art">${art()}</div>
      <p class="caps">${esc(t("tourStep", { n: step }))}</p>
      <h2 id="tour-title">${esc(t(`tour${step}Title`))}</h2>
      <p>${esc(t(`tour${step}Text`))}</p>
      <div class="tour-dots" aria-hidden="true">${[1, 2, 3].map((n) => `<i class="${n === step ? "on" : ""}"></i>`).join("")}</div>
      <div class="btn-row">
        ${step < 3
          ? `<button type="button" class="btn ghost" data-tour="skip">${esc(t("tourSkip"))}</button><button type="button" class="btn" data-tour="next">${esc(t("tourNext"))} ${arrow()}</button>`
          : `<a class="btn ghost" href="#/key" data-tour="key">${esc(t("tourKey"))}</a><button type="button" class="btn" data-tour="skip">${esc(t("tourStart"))} ${arrow()}</button>`}
      </div>`;
    dlg.querySelector("[data-tour='next'], [data-tour='skip']:last-child")?.focus();
  };
  dlg.addEventListener("click", (e) => {
    const a = e.target.closest("[data-tour]")?.dataset.tour;
    if (a === "next") { step++; draw(); }
    else if (a === "skip" || a === "key") dlg.close();
  });
  dlg.addEventListener("close", () => { store.set(WELCOME_KEY, true); dlg.remove(); });
  draw();
  dlg.showModal();
}

/* ---------- interactions for the current page ---------- */
function bindPage(route) {
  $("#retry")?.addEventListener("click", render);
  $("#reset-here")?.addEventListener("click", () => $("#reset-progress").click());
  $("#print-outline")?.addEventListener("click", () => {
    document.body.classList.add("print-outline");
    window.addEventListener("afterprint", () => document.body.classList.remove("print-outline"), { once: true });
    window.print();
  });
  const search = $("#gloss-search");
  search?.addEventListener("input", () => {
    const q = search.value.trim().toLowerCase();
    document.querySelectorAll("#gloss > div").forEach((row) => (row.hidden = q && !row.dataset.q.includes(q)));
  });
  document.querySelectorAll("[data-jump]").forEach((a) =>
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
      document.getElementById(a.dataset.jump)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    })
  );
  if (route.view !== "section") return;
  const p = dirProgress(route.dir);
  const updateScore = () => {
    const boxes = [...document.querySelectorAll("[data-test]")];
    const n = boxes.filter((b) => b.checked).length;
    const el = $("#score");
    if (el) el.textContent = t("testsYes", { n, m: boxes.length });
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
    btn.querySelector("span").textContent = p.done[route.id] ? t("inLog") : t("enterLog");
  });
}

/* ---------- boot ---------- */
async function boot() {
  applyLanguage();
  $("#lang-plate").addEventListener("click", (e) => {
    const b = e.target.closest("[data-lang]");
    if (!b || b.dataset.lang === lang) return;
    lang = b.dataset.lang;
    store.set(LANG_KEY, lang);
    applyLanguage();
    render();
  });
  document.querySelectorAll("[data-theme-toggle]").forEach((b) =>
    b.addEventListener("click", () => {
      const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
      document.documentElement.dataset.theme = next;
      store.set(THEME_KEY, next);
      updateThemeButton();
    })
  );
  $("#menu-btn").addEventListener("click", () => {
    const open = $(".bridge").classList.toggle("open");
    $("#menu-btn").setAttribute("aria-expanded", String(open));
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
    directions = (await loadJSON("data/directions.json")).directions.sort((a, b) => a.number - b.number);
  } catch (err) {
    console.error(err);
    $("#main").innerHTML = renderError();
    $("#retry")?.addEventListener("click", () => location.reload());
    return;
  }
  await render();
  maybeWelcome();
}
boot();
