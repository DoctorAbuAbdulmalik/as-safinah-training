// The Ship's Key: one family of fine gold-line symbols (24×24, stroke = currentColor),
// plus the programme wheel (porthole). Everything is inline SVG — no image downloads.

const gear = (() => {
  // 8-tooth cog outline
  const pts = [];
  for (let i = 0; i < 16; i++) {
    const a = (Math.PI * 2 * i) / 16 - Math.PI / 2;
    const r = i % 2 ? 7 : 9;
    const w = 0.22;
    pts.push([12 + r * Math.cos(a - w), 12 + r * Math.sin(a - w)], [12 + r * Math.cos(a + w), 12 + r * Math.sin(a + w)]);
  }
  return `<path d="M${pts.map((p) => p.map((n) => n.toFixed(2)).join(" ")).join("L")}Z"/><circle cx="12" cy="12" r="3"/>`;
})();

const helm = (() => {
  let s = '<circle cx="12" cy="12" r="5.5"/><circle cx="12" cy="12" r="1.6"/>';
  for (let i = 0; i < 8; i++) {
    const a = (Math.PI * 2 * i) / 8;
    const x1 = 12 + 1.6 * Math.cos(a), y1 = 12 + 1.6 * Math.sin(a);
    const x2 = 12 + 10 * Math.cos(a), y2 = 12 + 10 * Math.sin(a);
    s += `<path d="M${x1.toFixed(2)} ${y1.toFixed(2)}L${x2.toFixed(2)} ${y2.toFixed(2)}"/>`;
  }
  return s;
})();

const PATHS = {
  porthole: '<circle cx="12" cy="12" r="9.5"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="2.5" r=".6"/><circle cx="21.5" cy="12" r=".6"/><circle cx="12" cy="21.5" r=".6"/><circle cx="2.5" cy="12" r=".6"/><path d="M9 9.5c1-1 2.5-1.5 4-1"/>',
  compass: '<circle cx="12" cy="12" r="9.5"/><path d="M12 4.5l2.6 7.5L12 19.5 9.4 12z"/><path d="M9.4 12h5.2"/>',
  pennant: '<path d="M6 21V3"/><path d="M6 4h12l-4 3.5 4 3.5H6"/>',
  helm,
  anchor: '<circle cx="12" cy="4.8" r="1.8"/><path d="M12 6.6V21"/><path d="M8 10h8"/><path d="M4.5 13.5c.5 4.2 3.6 7 7.5 7s7-2.8 7.5-7"/><path d="M3 15l1.5-1.5L6 15M18 15l1.5-1.5L21 15"/>',
  sounding: '<path d="M12 2v8"/><path d="M10.5 4.5h3M10.5 7.5h3"/><path d="M9.5 10h5l-1 9.5h-3z"/>',
  knot: '<path d="M7 3c7 0 9 6 5 9s-5 9 2 9"/><path d="M17 3c-7 0-9 6-5 9s5 9-2 9"/>',
  lighthouse: '<path d="M9 21l1.4-12h3.2L15 21z"/><path d="M7 21h10"/><path d="M10 9h4V6h-4z"/><path d="M12 3.5V6"/><path d="M3.5 5.5l4.5 1.5M20.5 5.5L16 7"/><path d="M10.2 14h3.6"/>',
  log: '<path d="M6 3h11a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6z"/><path d="M6 3v18"/><path d="M9.5 7.5h5M9.5 11h5M9.5 14.5h3"/>',
  flags: '<path d="M5 21V3"/><path d="M5 4h9v6H5"/><path d="M5 10h6v5H5"/><path d="M9.5 4v6"/>',
  chart: '<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14" opacity=".45"/><path d="M5.5 15c2.5-.5 3-4 6-4s3.5 2.5 7 .5" stroke-dasharray="1.6 1.6"/>',
  pass: '<path d="M3 7h18v10H3z"/><path d="M15.5 7v10" stroke-dasharray="1.4 1.4"/><path d="M6 10.5h6.5M6 13.5h4"/>',
  bell: '<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/><path d="M12 3v2"/>',
  harbour: '<path d="M3 18.5c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0"/><path d="M5.5 14.5h7l-1.2 2H6.7z"/><path d="M9 14.5V9l3 3.5H9"/><path d="M15 16V9h5.5v7"/>',
  diamond: '<path d="M12 4l6 8-6 8-6-8z"/>',
  cog: gear,
  laptop: '<path d="M5 5.5h14v10H5z"/><path d="M2.5 18.5h19"/><path d="M10 8.5l-2 2 2 2M14 8.5l2 2-2 2"/>',
  book: '<path d="M3 6c3-1.2 6-1 9 1 3-2 6-2.2 9-1v12.5c-3-1.2-6-1-9 1-3-2-6-2.2-9-1z"/><path d="M12 7v12.5"/>',
  speech: '<path d="M3 4.5h11v7.5H8.5L5 15v-3H3z"/><path d="M10 14.5V16h5.5l3.5 3v-3h2V8.5h-4"/>',
  magnifier: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/>',
  arrow: '<path d="M4.5 12h15M13.5 6l6 6-6 6"/>',
  check: '<path d="M5 12.5l4.2 4.2L19 7"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  moon: '<path d="M19.5 14.5A8 8 0 1 1 9.5 4.5a6.5 6.5 0 0 0 10 10z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/>',
  waves: '<path d="M2 9c2.5-2 5-2 7.5 0s5 2 7.5 0 5-2 5 0M2 15c2.5-2 5-2 7.5 0s5 2 7.5 0 5-2 5 0"/>',
  globe: '<circle cx="12" cy="12" r="9.5"/><path d="M2.5 12h19"/><path d="M12 2.5c3.2 3 3.2 16 0 19M12 2.5c-3.2 3-3.2 16 0 19"/>',
  volume: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11"/>',
  mute: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/>',
  chevron: '<path d="M6 9l6 6 6-6"/>',
};

/** An inline symbol. Decorative by default; pass a label to make it announced. */
export function icon(name, { label, cls = "" } = {}) {
  const a11y = label ? `role="img" aria-label="${label}"` : 'aria-hidden="true" focusable="false"';
  return `<svg class="ico ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" ${a11y}>${PATHS[name] || ""}</svg>`;
}

/** The ship cut from the logo, on a small parchment disc with a gold edge. */
export const shipDisc = (cls = "") => `<span class="ship-disc ${cls}" aria-hidden="true"><img src="assets/logo-ship.webp" alt="" width="40" height="40"></span>`;

/** A fine engraved wave line used under the header and above the footer. */
export const waveRule = () =>
  `<svg class="wave-rule" viewBox="0 0 240 12" preserveAspectRatio="none" aria-hidden="true"><path d="M0 6 Q 7.5 0 15 6 T 30 6 T 45 6 T 60 6 T 75 6 T 90 6 T 105 6 T 120 6 T 135 6 T 150 6 T 165 6 T 180 6 T 195 6 T 210 6 T 225 6 T 240 6" fill="none" stroke="currentColor" stroke-width="1"/></svg>`;

/** A nameplate: small capitals between two gold diamonds. */
export const nameplate = (text, sym) =>
  `<div class="nameplate"><span class="np-rule"></span>${sym ? icon(sym) : '<i class="np-dia"></i>'}<span>${text}</span><span class="np-rule"></span></div>`;

/* ---------- the programme wheel ---------- */
const P = (r, deg) => {
  const a = (deg * Math.PI) / 180;
  return [(r * Math.cos(a)).toFixed(2), (r * Math.sin(a)).toFixed(2)];
};
const wedgePath = (r0, r1, a0, a1) => {
  const [x0, y0] = P(r1, a0), [x1, y1] = P(r1, a1), [x2, y2] = P(r0, a1), [x3, y3] = P(r0, a0);
  return `M${x3} ${y3}L${x0} ${y0}A${r1} ${r1} 0 0 1 ${x1} ${y1}L${x2} ${y2}A${r0} ${r0} 0 0 0 ${x3} ${y3}Z`;
};
const wrap = (text, max) => {
  const words = String(text).toUpperCase().split(/\s+/);
  const lines = [];
  let cur = "";
  for (const w of words) {
    if (cur && (cur + " " + w).length > max) { lines.push(cur); cur = w; }
    else cur = cur ? cur + " " + w : w;
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 3);
};
const xml = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

/**
 * The porthole wheel: gold rim with rivets, six parchment wedges (5–6 in a second tone),
 * a navy hub with the logo's ship. Module 1 sits at the top; the reading order runs
 * clockwise, or anticlockwise for right-to-left languages.
 *
 * opts: titles[6], hrefs[6] (wedges become links), lit (index), done (Set of indexes),
 *       grey (coming soon), flagship (double ring), labels (show titles), rtl, num(n),
 *       label (accessible name for the whole wheel), moduleWord
 */
export function wheel(opts = {}) {
  const { titles = [], hrefs, lit = -1, done = new Set(), grey = false, flagship = false, labels = false, rtl = false, num = String, label = "", moduleWord = "Module" } = opts;
  const R0 = 34, R1 = 88;
  let wedges = "";
  for (let i = 0; i < 6; i++) {
    const c = -90 + (rtl ? -1 : 1) * i * 60;
    const shared = i >= 4;
    let cls = "wd" + (shared ? " wd-shared" : "");
    if (done.has(i)) cls += " wd-done";
    if (lit === i) cls += " wd-lit";
    else if (lit >= 0) cls += " wd-dim";
    // with titles, the number sits near the rim and the title nearer the hub;
    // on the side wedges they are stacked vertically so they never collide
    const side = i % 3 !== 0;
    let nx, ny, tx, ty;
    if (labels) {
      [nx, ny] = P(side ? 66 : 76, c);
      [tx, ty] = P(side ? 58 : 52, c);
      if (side) { ny = String(Number(ny) + (Number(ny) < 0 ? -15 : 15)); ty = String(Number(ty) + (Number(ty) < 0 ? 4 : -4)); }
    } else {
      [nx, ny] = P(63, c);
    }
    let txt = `<text class="wn" x="${nx}" y="${ny}" dy=".35em" text-anchor="middle">${num(i + 1)}</text>`;
    if (labels && titles[i]) {
      const lines = wrap(titles[i], 12);
      const start = Number(ty) - ((lines.length - 1) * 7) / 2;
      txt += `<text class="wl" text-anchor="middle">${lines.map((ln, k) => `<tspan x="${tx}" y="${(start + k * 7).toFixed(2)}" dy=".35em">${xml(ln)}</tspan>`).join("")}</text>`;
    }
    const shape = `<path class="${cls}" d="${wedgePath(R0, R1, c - 30, c + 30)}"/>${txt}`;
    const name = `${moduleWord} ${num(i + 1)}${titles[i] ? ": " + titles[i] : ""}`;
    wedges += hrefs?.[i] ? `<a href="${hrefs[i]}" class="wa" aria-label="${xml(name)}"><title>${xml(name)}</title>${shape}</a>` : `<g>${shape}</g>`;
  }
  let rivets = "";
  for (let k = 0; k < 24; k++) {
    const [x, y] = P(95.5, k * 15);
    rivets += `<circle cx="${x}" cy="${y}" r="1.1"/>`;
  }
  const a11y = hrefs ? `role="group" aria-label="${xml(label)}"` : label ? `role="img" aria-label="${xml(label)}"` : 'aria-hidden="true"';
  return `<svg class="wheel${grey ? " wheel-grey" : ""}${flagship ? " wheel-flag" : ""}${labels ? " wheel-labels" : ""}" viewBox="-106 -106 212 212" ${a11y}>
    ${flagship ? '<circle class="w-ring2" r="104"/>' : ""}
    <circle class="w-rim" r="99"/>
    <g class="w-rivets">${rivets}</g>
    <circle class="w-ring" r="92"/>
    ${wedges}
    <circle class="w-hub" r="${R0 - 1}"/>
    <circle class="w-hubring" r="${R0 - 4}"/>
    <image href="assets/ship-hub.webp" x="-22" y="-21" width="44" height="42" preserveAspectRatio="xMidYMid meet"/>
  </svg>`;
}
