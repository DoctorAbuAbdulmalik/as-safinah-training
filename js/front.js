// The pages that open the handbook, in the order of the printed book:
// Contents, How to Use This Handbook, Who This Handbook Is For, As a Taught Course,
// The Ship, and The Management Room (with "Finding each pathway in this handbook").
import { icon } from "./symbols.js";

export const FRONT_ORDER = ["contents", "how", "who", "taught", "ship", "room"];

const table = (esc, head, rows, { caption = "", rowHead = true, cls = "" } = {}) => `
  <div class="table-wrap book-table ${cls}" role="region" tabindex="0" aria-label="${esc(caption || head[0])}"><table>
    ${caption ? `<caption class="sr-only">${esc(caption)}</caption>` : ""}
    <thead><tr>${head.map((h) => `<th scope="col">${esc(h)}</th>`).join("")}</tr></thead>
    <tbody>${rows.map((r) => `<tr>${r.map((c, i) => (i === 0 && rowHead ? `<th scope="row">${esc(c)}</th>` : `<td>${esc(c)}</td>`)).join("")}</tr>`).join("")}</tbody>
  </table></div>`;

/** The ship picture exactly as printed in the handbook, with its title card. */
export function shipCard(esc, c) {
  return `<figure class="ship-card">
    <div class="sc-art"><img src="assets/ship-book.webp" width="424" height="416" alt="" loading="lazy"></div>
    <figcaption class="sc-text"><span class="sc-ar" lang="ar" dir="rtl">${esc(c.ar)}</span><b>${esc(c.title)}</b><i class="sc-rule"></i><em>${esc(c.caption)}</em></figcaption>
  </figure>`;
}

/** Figure 1 — the voyage: sixteen sessions across six modules (drawn here so its words can be translated). */
function voyageFigure(H, f, titles, ranges) {
  const { esc, digits } = H;
  const W = 1000, X0 = 62, STEP = (W - 2 * X0) / 15, Y = (i) => 232 + 20 * Math.sin(i * 0.95 + 0.6);
  const px = (i) => X0 + i * STEP;
  const wrap = (txt, max) => {
    const words = String(txt).split(/\s+/);
    const lines = [];
    let cur = "";
    for (const w of words) {
      if (cur && (cur + " " + w).length > max) { lines.push(cur); cur = w; } else cur = cur ? cur + " " + w : w;
    }
    if (cur) lines.push(cur);
    return lines.slice(0, 3);
  };
  let boxes = "", drops = "", dots = "";
  ranges.forEach(([a, b], k) => {
    const shared = k >= 4;
    const x1 = px(a - 1) - 24, x2 = px(b - 1) + 24, w = x2 - x1, cx = (x1 + x2) / 2;
    const lines = wrap(titles[k] || "", Math.max(8, Math.floor(w / 7.2)));
    boxes += `<rect x="${x1.toFixed(1)}" y="34" width="${w.toFixed(1)}" height="78" rx="7" class="vf-box${shared ? " vf-shared" : ""}"/>
      <text x="${cx.toFixed(1)}" y="55" text-anchor="middle" class="vf-mod">${esc(f.module)} ${digits(k + 1)}</text>
      <text text-anchor="middle" class="vf-t">${lines.map((ln, j) => `<tspan x="${cx.toFixed(1)}" y="${(76 + j * 14).toFixed(1)}">${esc(ln)}</tspan>`).join("")}</text>`;
    for (let s = a; s <= b; s++) drops += `<line x1="${px(s - 1).toFixed(1)}" y1="112" x2="${px(s - 1).toFixed(1)}" y2="${(Y(s - 1) - 14).toFixed(1)}" class="vf-drop"/>`;
  });
  let path = "";
  for (let i = 0; i < 16; i++) path += `${i ? "L" : "M"}${px(i).toFixed(1)} ${Y(i).toFixed(1)}`;
  for (let i = 0; i < 16; i++) {
    dots += `<circle cx="${px(i).toFixed(1)}" cy="${Y(i).toFixed(1)}" r="13" class="vf-dot${i >= 12 ? " vf-shared" : ""}"/>
      <text x="${px(i).toFixed(1)}" y="${(Y(i) + 4.5).toFixed(1)}" text-anchor="middle" class="vf-n">${digits(i + 1)}</text>`;
  }
  return `<figure class="voyage-fig">
    <div class="vf-panel">
      <p class="vf-title">${esc(f.title)}</p>
      <svg viewBox="0 0 ${W} 280" role="img" aria-label="${esc(f.title)}">${boxes}${drops}<path d="${path}" class="vf-line"/>${dots}</svg>
      <p class="vf-note">${esc(f.note)}</p>
      <p class="vf-legend"><span><i class="vf-key"></i>${esc(f.own)}</span><span><i class="vf-key vf-shared"></i>${esc(f.shared)}</span></p>
    </div>
    <figcaption>${esc(f.caption)}</figcaption>
  </figure>`;
}

/** The contents list, in the book's order, with its printed page numbers. */
function contentsList(H, d, data) {
  const { esc, digits, t } = H;
  const f = data.front;
  const pg = f.pages || {};
  const base = `#/d/${d.id}`;
  const row = (href, label, page, cls = "") =>
    `<li class="${cls}"><a href="${href}"><span>${label}</span><i class="dots" aria-hidden="true"></i>${page ? `<b>${digits(page)}</b>` : ""}</a></li>`;
  const out = [];
  for (const id of ["how", "who", "taught", "ship", "room"]) out.push(row(`${base}/f/${id}`, esc(f[id].title), pg[id], "toc-top"));
  data.modules.forEach((m) => {
    out.push(`<li class="toc-mod"><a href="${base}/m/${m.id}">${esc(t("module"))} ${digits(m.number)} — ${esc(m.title)}</a></li>`);
    m.sections.forEach((s) => out.push(row(`${base}/s/${s.id}`, `${digits(s.number)}. ${esc(s.title)}`, pg[s.id])));
    out.push(row(`${base}/m/${m.id}#outcomes`, `${esc(t("module"))} ${digits(m.number)} — ${esc(t("learningOutcomes"))}`, pg["lo" + m.number], "toc-lo"));
  });
  if (data.glossary?.length) out.push(row(`${base}/glossary`, esc(t("glossary")), pg.glossary, "toc-top"));
  return `<ul class="toc-list">${out.join("")}</ul>`;
}

export function renderFront(H, d, data, id) {
  const { esc, t, crumbs, arrow, digits } = H;
  const f = data.front;
  const i = FRONT_ORDER.indexOf(id);
  if (!f || i < 0) return null;
  const base = `#/d/${d.id}`;
  const fallback = !data._frontTranslated;
  const wrapAttrs = fallback ? ' lang="en" dir="ltr"' : "";
  const page = f.pages?.[id];
  const titleOf = (x) => (x === "contents" ? f.contents.title : f[x].title);
  const firstSection = data.modules[0].sections[0];

  let body = "";
  if (id === "contents") {
    const c = f.cover;
    body = `
      <section class="book-cover">
        <p class="cv-org">${esc(c.org)}</p><p class="cv-ar" lang="ar" dir="rtl">${esc(c.orgAr)}</p>
        <h2>${esc(c.title)}</h2><i class="cv-rule"></i>
        <p class="cv-sub">${esc(c.subtitle)}</p>
        <p class="cv-ver">${esc(c.version)}</p><p class="cv-inc">${esc(c.includes)}</p>
      </section>
      ${contentsList(H, d, data)}`;
  } else if (id === "how") {
    body = `${f.how.intro.map((p) => `<p>${esc(p)}</p>`).join("")}
      <div class="how-cards">${f.how.cards.map((c) => `<div class="how-card"><h3>${esc(c.title)}</h3><p>${esc(c.text)}</p></div>`).join("")}</div>`;
  } else if (id === "who") {
    body = `<p>${esc(f.who.intro)}</p>${table(esc, f.who.head, f.who.rows)}<p>${esc(f.who.outro)}</p>`;
  } else if (id === "taught") {
    const rows = f.taught.rows.map((r) => r.slice());
    body = `<p>${esc(f.taught.intro)}</p>
      ${table(esc, f.taught.head, rows.map((r) => r.map((c) => digits(c))), { cls: "taught", rowHead: true })}
      ${voyageFigure(H, f.taught.figure, data.modules.map((m) => m.title), f.taught.sessions)}`;
  } else if (id === "ship") {
    body = `${shipCard(esc, f.ship.card)}${f.ship.paras.map((p) => `<p>${esc(p)}</p>`).join("")}`;
  } else if (id === "room") {
    const r = f.room;
    body = `${r.paras.map((p) => `<p>${esc(p)}</p>`).join("")}
      <figure class="room-wheel"><img src="${data.assets}/room-wheel.webp" width="1200" height="1200" alt="${esc(r.alt)}" loading="lazy"><figcaption>${esc(r.caption)}</figcaption></figure>
      <h2 class="book-h2">${esc(r.finding.title)}</h2>
      ${table(esc, r.finding.head, r.finding.rows.map((row) => row.map((c) => digits(c))), { cls: "finding", rowHead: false })}
      <p class="finding-note">${esc(r.finding.note)}</p>`;
  }

  const prev = i > 0 ? { href: `${base}/f/${FRONT_ORDER[i - 1]}`, title: titleOf(FRONT_ORDER[i - 1]) } : { href: base, title: H.L(d.title) };
  const next = i < FRONT_ORDER.length - 1
    ? { href: `${base}/f/${FRONT_ORDER[i + 1]}`, title: titleOf(FRONT_ORDER[i + 1]) }
    : { href: `${base}/m/${data.modules[0].id}`, title: `${t("module")} ${digits(data.modules[0].number)}: ${data.modules[0].title}` };

  return `
    ${crumbs([{ label: t("navMain"), href: "#/" }, { label: H.L(d.title), href: base }, { label: titleOf(id) }])}
    ${fallback ? `<div class="notice" role="note">${esc(t("notTranslated"))}</div>` : ""}
    <article class="parch front-page front-${id}"${wrapAttrs}>
      <p class="eyebrow">${esc(t("handbookKicker"))}${page ? ` · ${esc(t("pageNo", { n: page }))}` : ""}</p>
      <h1>${esc(titleOf(id))}</h1>
      <div class="rule"></div>
      ${body}
    </article>
    <nav class="pager" aria-label="${esc(t("prevPort"))} / ${esc(t("nextPortBtn"))}">
      <a class="prev" href="${prev.href}"><small>${esc(t("prevPort"))}</small>${esc(prev.title)}</a>
      <a class="next" href="${next.href}"><small>${esc(t("nextPortBtn"))}</small>${esc(next.title)}</a>
    </nav>`;
}

/** The handbook's opening pages as a row of cards on the course screen. */
export function frontCards(H, d, data) {
  const { esc, digits, t } = H;
  const f = data.front;
  if (!f) return "";
  const base = `#/d/${d.id}`;
  const sym = { contents: "chart", how: "knot", who: "flags", taught: "log", ship: "ship", room: "porthole" };
  return `<section class="front-grid" aria-label="${esc(t("handbook"))}">${FRONT_ORDER.map((id, k) => {
    const title = id === "contents" ? f.contents.title : f[id].title;
    const page = f.pages?.[id];
    return `<a class="front-card" href="${base}/f/${id}">${id === "ship" ? '<span class="ship-disc sm" aria-hidden="true"><img src="assets/logo-ship.webp" alt="" width="30" height="30"></span>' : `<span class="ring">${icon(sym[id])}</span>`}
      <span><span class="caps">${page ? esc(t("pageNo", { n: page })) : esc(t("handbookKicker"))}</span><b>${esc(title)}</b></span></a>`;
  }).join("")}</section>`;
}
