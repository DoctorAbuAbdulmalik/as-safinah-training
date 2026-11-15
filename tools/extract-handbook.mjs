// Converts an As Safinah handbook PDF into structured JSON for the web app.
//
//   pdftotext -layout -enc UTF-8 Handbook.pdf layout.txt
//   pdftotext        -enc UTF-8 Handbook.pdf raw.txt
//   node tools/extract-handbook.mjs layout.txt raw.txt <direction-id> [--shared]
//
// Writes data/<direction-id>/en.json  (Modules 1-4 = Sections 1-12, plus the glossary).
// With --shared also writes data/shared/en.json (Modules 5-6 = Sections 13-14), which are
// the same in every handbook and are shown inside every direction.
import fs from "node:fs";
import path from "node:path";

const [, , layoutFile, rawFile, directionId, flag] = process.argv;
if (!layoutFile || !rawFile || !directionId) {
  console.error("usage: node tools/extract-handbook.mjs layout.txt raw.txt <direction-id> [--shared]");
  process.exit(1);
}
const WITH_SHARED = flag === "--shared";

// The PDF's Arabic is not extractable as clean text, so the Arabic wording is supplied here.
// TO BE PROOF-READ against a printed mushaf / hadith collection before launch.
const ARABIC = {
  "17:36": "وَلَا تَقْفُ مَا لَيْسَ لَكَ بِهِ عِلْمٌ",
  "49:6": "يَا أَيُّهَا الَّذِينَ آمَنُوا إِن جَاءَكُمْ فَاسِقٌ بِنَبَإٍ فَتَبَيَّنُوا",
  "12:55": "اجْعَلْنِي عَلَىٰ خَزَائِنِ الْأَرْضِ ۖ إِنِّي حَفِيظٌ عَلِيمٌ",
  "23:8": "وَالَّذِينَ هُمْ لِأَمَانَاتِهِمْ وَعَهْدِهِمْ رَاعُونَ",
  "3:190": "إِنَّ فِي خَلْقِ السَّمَاوَاتِ وَالْأَرْضِ وَاخْتِلَافِ اللَّيْلِ وَالنَّهَارِ لَآيَاتٍ لِّأُولِي الْأَلْبَابِ",
  "57:25": "وَأَنزَلْنَا الْحَدِيدَ فِيهِ بَأْسٌ شَدِيدٌ وَمَنَافِعُ لِلنَّاسِ",
  "83:1–3": "وَيْلٌ لِّلْمُطَفِّفِينَ ۝ الَّذِينَ إِذَا اكْتَالُوا عَلَى النَّاسِ يَسْتَوْفُونَ ۝ وَإِذَا كَالُوهُمْ أَوْ وَزَنُوهُمْ يُخْسِرُونَ",
  "17:34": "وَأَوْفُوا بِالْعَهْدِ ۖ إِنَّ الْعَهْدَ كَانَ مَسْئُولًا",
  "3:140": "وَتِلْكَ الْأَيَّامُ نُدَاوِلُهَا بَيْنَ النَّاسِ",
  "62:2": "هُوَ الَّذِي بَعَثَ فِي الْأُمِّيِّينَ رَسُولًا مِّنْهُمْ يَتْلُو عَلَيْهِمْ آيَاتِهِ وَيُزَكِّيهِمْ وَيُعَلِّمُهُمُ الْكِتَابَ وَالْحِكْمَةَ",
  "55:1–2": "الرَّحْمَٰنُ ۝ عَلَّمَ الْقُرْآنَ",
  "39:9": "قُلْ هَلْ يَسْتَوِي الَّذِينَ يَعْلَمُونَ وَالَّذِينَ لَا يَعْلَمُونَ",
  "2:286": "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا",
  "16:78": "وَاللَّهُ أَخْرَجَكُم مِّن بُطُونِ أُمَّهَاتِكُمْ لَا تَعْلَمُونَ شَيْئًا وَجَعَلَ لَكُمُ السَّمْعَ وَالْأَبْصَارَ وَالْأَفْئِدَةَ",
  "5:2": "وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ",
  "66:6": "يَا أَيُّهَا الَّذِينَ آمَنُوا قُوا أَنفُسَكُمْ وَأَهْلِيكُمْ نَارًا",
  "al-Bukhārī 59": "إِذَا وُسِّدَ الْأَمْرُ إِلَى غَيْرِ أَهْلِهِ فَانْتَظِرِ السَّاعَةَ",
  "al-Bukhārī 5027": "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ",
  "Muslim 1631": "إِذَا مَاتَ الْإِنْسَانُ انْقَطَعَ عَنْهُ عَمَلُهُ إِلَّا مِنْ ثَلَاثَةٍ: إِلَّا مِنْ صَدَقَةٍ جَارِيَةٍ، أَوْ عِلْمٍ يُنْتَفَعُ بِهِ، أَوْ وَلَدٍ صَالِحٍ يَدْعُو لَهُ",
};
const arabicFor = (ref) => {
  const v = (ref.match(/(\d+:\d+(?:–\d+)?)\s*$/) || [])[1];
  if (v && ARABIC[v]) return ARABIC[v];
  const k = Object.keys(ARABIC).find((key) => !/^\d/.test(key) && ref.endsWith(key));
  if (!k) console.warn("  ! no Arabic text for:", ref);
  return k ? ARABIC[k] : undefined;
};

// ---------- cleaning ----------
const FOOTER = /^\s*As Safinah Centre for Humanitarian Excellence\s+·/;
const SENT = "\u0001"; // marks a page break (where the footer was)
const toLines = (txt) =>
  txt
    .replace(/\f/g, "\n")
    .split("\n")
    .map((l) => (FOOTER.test(l) ? SENT : l))
    .map((l) => l.replace(/@@K\d+@@/g, "").replace(/\s+$/, ""));
const lines = toLines(fs.readFileSync(layoutFile, "utf8"));
const rawLines = toLines(fs.readFileSync(rawFile, "utf8"));

// Extraction artefacts: stray spaces after long vowels (Sū rah -> Sūrah, Ṣaḥī ḥ -> Ṣaḥīḥ)
const fix = (s) =>
  s
    .replace(/([ūāīŪĀĪ]) (?=[\p{Ll}’‘])/gu, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();

const join = (arr) =>
  fix(
    arr.reduce((acc, l) => {
      const t = l.trim();
      if (!acc) return t;
      return /\w-$/.test(acc) ? acc + t : acc + " " + t;
    }, "")
  );

const indent = (l) => l.match(/^ */)[0].length;
const isBlank = (l) => l === undefined || (typeof l === "string" && (l.trim() === "" || l === SENT));
const find = (re, from = 0, src = lines) => {
  for (let i = from; i < src.length; i++) if (re.test(src[i])) return i;
  return -1;
};

// ---------- module opener & outcomes ----------
function moduleLine(n, wantOutcomes) {
  for (let i = 0; i < lines.length; i++) {
    if (!new RegExp(`^\\s*MODULE ${n}\\s*$`).test(lines[i])) continue;
    const near = lines.slice(i + 1, i + 14).join(" ");
    if (wantOutcomes ? /Learning Outcomes/.test(lines.slice(i + 1, i + 6).join(" ")) : /ISLAMIC FOUNDATION/.test(near) && !/Learning Outcomes/.test(near)) return i;
  }
  throw new Error(`MODULE ${n} ${wantOutcomes ? "outcomes" : "opener"} not found`);
}

function parseOpener(n) {
  let j = moduleLine(n, false) + 1;
  const nonBlank = () => {
    while (isBlank(lines[j])) j++;
    return lines[j++].trim();
  };
  const title = fix(nonBlank());
  const tagline = fix(nonBlank());
  while (!/ISLAMIC FOUNDATION/.test(lines[j])) j++;
  j++;
  const verses = [];
  let why = [];
  for (; j < lines.length; j++) {
    const t = lines[j].trim();
    if (/^Why it sits here/.test(t)) {
      const buf = [];
      while (!isBlank(lines[j])) buf.push(lines[j++]);
      why = [join(buf).replace(/^Why it sits here\.\s*/, "")];
      break;
    }
    if (/^[“"]/.test(t)) {
      const buf = [t];
      while (!/[”"]\s*$/.test(buf[buf.length - 1])) buf.push(lines[++j].trim());
      const text = join(buf).replace(/^[“"]|[”"]$/g, "");
      while (isBlank(lines[++j]));
      const ref = fix(lines[j].trim());
      verses.push({ ar: arabicFor(ref), text, ref });
    }
  }
  return { title, tagline, verses, why };
}

function parseOutcomes(n) {
  const start = moduleLine(n, true);
  const items = [];
  const evidence = [];
  let inEvidence = false;
  for (let j = start + 1; j < lines.length; j++) {
    const l = lines[j];
    if (/^\s*(SECTION|MODULE) \d/.test(l) || /^Glossary\s*$/.test(l)) break;
    const m = l.match(/^\s+(\d+)\.\s+(.*)/);
    if (m && !inEvidence) items.push(m[2]);
    else if (/Evidence of completion/.test(l)) inEvidence = true;
    else if (inEvidence && !isBlank(l)) evidence.push(l);
    else if (items.length && !inEvidence && !isBlank(l) && indent(l) > 2) items[items.length - 1] += " " + l.trim();
  }
  return { items: items.map(fix), evidence: join(evidence) };
}

// ---------- blocks ----------
const isHeading = (l, next) => {
  const t = l.trim();
  if (indent(l) > 2 || t.length > 58 || /[.,:;?!”’)]$/.test(t)) return false;
  if (/^\d\.\s+[A-Z]/.test(t)) return true; // "1. Uniqueness of work"
  return /^[A-Z]/.test(t) && !/^[A-Z ]+$/.test(t) && next !== undefined && !isBlank(next) && /^[A-Z“]/.test(next.trim());
};

function parseShip(L, i, { splitClaim }) {
  // L[i] is the line after "THE SHIP"
  while (isBlank(L[i])) i++;
  const title = fix(L[i++].trim());
  const paras = [];
  let question = "";
  for (;;) {
    while (isBlank(L[i])) i++;
    const buf = [];
    while (i < L.length && !isBlank(L[i])) buf.push(L[i++]);
    const p = join(buf);
    if (/^On board here:/.test(p)) {
      question = p.replace(/^On board here:\s*/, "");
      break;
    }
    paras.push(p);
  }
  let claim = "";
  if (splitClaim) {
    claim = paras.pop();
    if (paras.length === 0) {
      const m = claim.match(/^(.*[.!?”’])\s+([^.!?]+[.!?])$/s);
      if (m) [paras[0], claim] = [m[1], m[2]];
    }
  }
  return { ship: { title, body: paras, claim, question }, i };
}

function parseBlocks(body) {
  const blocks = [];
  let i = 0;
  let list = null;
  let pb = false; // a page break sits between the previous block and the next line
  const flushList = () => {
    if (list) blocks.push({ type: "ul", items: list.map(fix) }), (list = null);
  };
  while (i < body.length) {
    const l = body[i];
    if (typeof l === "object") { flushList(); blocks.push(l); i++; continue; } // injected block (e.g. a table)
    if (l === SENT) { flushList(); pb = true; i++; continue; }
    if (isBlank(l)) { flushList(); i++; continue; }
    if (indent(l) >= 3) {
      const t = l.trim();
      if (/^Practical example/.test(t)) {
        flushList();
        const buf = [];
        while (i < body.length && !isBlank(body[i])) buf.push(body[i++]);
        const m = join(buf).match(/^Practical example\s*[—–-]\s*([^:]+):\s*(.*)$/s);
        blocks.push({ type: "example", title: fix(m[1]), text: m[2] });
        continue;
      }
      if (!list && pb && blocks.at(-1)?.type === "ul") list = blocks.pop().items; // list continues on next page
      pb = false;
      if (list && /^[a-z(“"]/.test(t)) list[list.length - 1] += " " + t;
      else (list ||= []).push(t);
      i++;
      continue;
    }
    flushList();
    if (isHeading(l, body[i + 1])) {
      blocks.push({ type: "h3", text: fix(l) });
      i++;
      pb = false;
      continue;
    }
    const buf = [];
    while (i < body.length && typeof body[i] === "string" && !isBlank(body[i]) && indent(body[i]) < 3 && !(buf.length && isHeading(body[i], body[i + 1]))) buf.push(body[i++]);
    const text = join(buf);
    const last = blocks.at(-1);
    const continues = last?.type === "p" && ((pb && !/[.:?!”’)]$/.test(last.text)) || /^[—–]/.test(text));
    if (continues) last.text = fix(last.text + " " + text);
    else blocks.push({ type: "p", text });
    pb = false;
  }
  flushList();
  // a short stand-alone line with no closing punctuation is a sub-heading
  for (const b of blocks) if (b.type === "p" && b.text.length < 60 && !/[.,:;?!”’)]$/.test(b.text)) b.type = "h3";
  return blocks;
}

function numbered(buf) {
  const items = [];
  for (const l of buf) {
    const m = l.match(/^\s*(\d+)\.\s+(.*)/);
    if (m) items.push(m[2]);
    else if (!isBlank(l) && items.length) items[items.length - 1] += " " + l.trim();
  }
  return items.map(fix);
}

function parseReview(body) {
  const qIdx = body.findIndex((l) => /^\s*Questions for discussion/.test(l));
  const eIdx = body.findIndex((l) => /^\s*Practical exercise/.test(l));
  const testsPart = body.slice(0, qIdx);
  const first = testsPart.findIndex((l) => /^\s*1\.\s/.test(l));
  const intro = join(testsPart.slice(0, first).filter((l) => !isBlank(l))).replace(/\s+[—–-]\s+answer each honestly.*$/i, "");
  return {
    intro,
    tests: numbered(testsPart.slice(first)),
    questions: numbered(body.slice(qIdx + 1, eIdx)),
    exercise: join(body.slice(eIdx + 1).filter((l) => !isBlank(l))),
  };
}

// ---------- sections ----------
/** Replace figure/table regions [startRe, endRe) with an injected block (or nothing). */
function replaceRegions(L, regions) {
  for (const { from, to, inclusive, block } of regions) {
    const a = L.findIndex((l) => typeof l === "string" && from.test(l));
    if (a < 0) { console.warn("  ! region not found:", from); continue; }
    let b = L.findIndex((l, k) => k > a && typeof l === "string" && to.test(l));
    if (b < 0) { console.warn("  ! region end not found:", to); continue; }
    if (inclusive) b++;
    L.splice(a, b - a, ...(block ? [block] : []));
  }
  return L;
}

function parseSection(n, { rich = false, regions = [] } = {}) {
  const start = find(new RegExp(`^SECTION ${n}\\s*$`));
  let end = lines.length;
  for (let k = start + 1; k < lines.length; k++) {
    if (/^\s*MODULE \d\s*$/.test(lines[k]) || /^SECTION \d+\s*$/.test(lines[k])) { end = k; break; }
  }
  const L = replaceRegions(lines.slice(start, end), regions);
  let i = 1;
  const titleBuf = [];
  while (!/^\s*THE SHIP/.test(L[i])) { if (!isBlank(L[i])) titleBuf.push(L[i]); i++; }
  const title = fix(titleBuf.join(" "));
  let r = parseShip(L, i + 1, { splitClaim: !rich });
  const ship = r.ship;
  i = r.i;

  const headRe = new RegExp(`^${n}\\.(\\d+)\\s+(.+)$`);
  const isHead = (l) => typeof l === "string" && headRe.test(l.trim());
  const introLines = [];
  while (i < L.length && !isHead(L[i])) introLines.push(L[i++]);
  const intro = parseBlocks(introLines).filter((b) => b.type === "p").map((b) => b.text);

  const subsections = [];
  let review = null;
  while (i < L.length) {
    if (!isHead(L[i])) { i++; continue; }
    const hm = L[i].trim().match(headRe);
    const id = `${n}.${hm[1]}`;
    const subTitle = fix(hm[2]);
    i++;
    const body = [];
    while (i < L.length && !isHead(L[i])) body.push(L[i++]);
    if (/^Section Review/i.test(subTitle)) { review = parseReview(body); continue; }
    const sub = { id, title: subTitle };
    let k = 0;
    while (isBlank(body[k])) k++;
    if (/^\s*THE SHIP\s*$/.test(body[k] || "")) {
      r = parseShip(body, k + 1, { splitClaim: false });
      sub.ship = r.ship;
      body.splice(0, r.i);
    }
    sub.blocks = parseBlocks(body);
    subsections.push(sub);
  }
  return { id: "s" + n, number: n, title, ship, intro, subsections, review };
}

function buildModule(n, sectionNumbers, opts = {}) {
  const opener = parseOpener(n);
  return {
    id: "m" + n,
    number: n,
    title: opener.title,
    tagline: opener.tagline,
    foundation: { verses: opener.verses, why: opener.why },
    sections: sectionNumbers.map((s) => parseSection(s, opts[s] || {})),
    outcomes: parseOutcomes(n),
  };
}

// ---------- glossary (raw text: one entry per line) ----------
function parseGlossary() {
  const g = find(/^Glossary\s*$/, Math.floor(rawLines.length / 2), rawLines);
  if (g < 0) return [];
  const out = [];
  for (let k = g + 1; k < rawLines.length; k++) {
    const m = rawLines[k].match(/^(.+?) — (.+) \(([^)]+)\)\s*$/);
    if (m) out.push({ term: fix(m[1]), def: fix(m[2].replace(/[‎‏‪-‮]/g, "")), ref: fix(m[3]) });
  }
  return out;
}

// ---------- shared Modules 5-6: tables re-typed from the PDF's figures ----------
const T = (caption, head, rows) => ({ type: "table", caption, head, rows });
const sharedOpts = {
  13: {
    rich: true,
    regions: [
      { from: /FOUR PATTERNS OF RENEWAL/, to: /The four patterns of this section, each with/, inclusive: true },
      {
        from: /STARTING LAYER\s+THREE LAYERS/,
        to: /^The common mistake\s*$/,
        block: T("Three layers, three temperaments", ["Layer", "Needed when", "Temperament", "Typical failure"], [
          ["Starting", "Taking something from nothing to something", "Comfortable with ambiguity; improvises; willing to be wrong in public", "Kept in place too long, resists the structure the work now needs"],
          ["Driving", "The idea has proved itself and must be carried further", "Recruits, organises and scales; builds a team around a concept", "Skipped, so the idea never grows beyond its founders"],
          ["Building", "The work must survive the departure of its founders", "Writes the process down, builds systems, trains successors", "Under-recruited while the organisation is still celebrating the launch"],
        ]),
      },
      {
        from: /^The four patterns at a glance/,
        to: /^13\.5 Section Review/,
        block: T("The four patterns at a glance", ["Pattern", "The Ship", "The question it asks", "If it is ignored"], [
          ["13.1 Readiness before the plan", "Waiting for the tide", "Has the team accepted the need for change, or only been told about it?", "Plans fail by attrition: agreed in the room, resisted in the corridor"],
          ["13.2 Selecting the layers", "Not every hand for every line", "Is the right kind of person in place for the stage the work has reached?", "Founders block structure; builders arrive too early and strangle the idea"],
          ["13.3 Contention", "Other sails on the horizon", "What does a comparable organisation show us about our own standards?", "Standards drift downward unnoticed in an uncontested position"],
          ["13.4 The turning point", "The calm will not stay calm", "What are we treating as permanent that is only the present phase?", "Complacency in strong seasons; resignation in weak ones"],
        ]),
      },
    ],
  },
  14: {
    rich: true,
    regions: [
      { from: /FIRST TRIPLET · EXCELLENCE THROUGH UNIQUENESS/, to: /The Formula of Ultimate Success as a wheel/, inclusive: true },
      {
        from: /^The four triplets at a glance/,
        to: /^14\.7 Section Review/,
        block: T("The four triplets at a glance", ["Triplet", "Its three parts", "Without it…"], [
          ["First — Excellence through uniqueness (14.1)", "Uniqueness of work · Being the best · Being first", "Collective effort produces mediocre results"],
          ["Second — Sacrifice and risk (14.2)", "Sacrifice · Risk-taking · Building in silence", "Excellence remains aspirational"],
          ["Third — Learning and generational stewardship (14.3)", "Knowledge and learning · Benefiting from every generation · Investing in youth and spiritual foundation", "The work ends with the people who began it"],
          ["Fourth — Collective success (14.4)", "Work regardless of others · Team competition and excellence · Success is collective", "Learning remains academic"],
        ]),
      },
    ],
  },
};

// ---------- assemble ----------
const write = (file, data) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n", "utf8");
};
const titleLine = lines.find((l) => /Handbook\s*$/.test(l.trim()) || /PROGRAMME\s*$/.test(l.trim()));
const sourceFooter = (fs.readFileSync(layoutFile, "utf8").match(/As Safinah Centre for Humanitarian Excellence · ([^·]+) · (V\d+) · ([A-Za-z]+ \d{4})/) || []);

const modules = [1, 2, 3, 4].map((n) => buildModule(n, [3 * n - 2, 3 * n - 1, 3 * n]));
const out = {
  direction: directionId,
  lang: "en",
  source: `${(sourceFooter[1] || titleLine).replace(/\s*Programme$/, "")} Handbook, Version ${(sourceFooter[2] || "").replace("V", "")}, ${sourceFooter[3] || ""} — As Safinah Centre for Humanitarian Excellence`,
  modules,
  // Section 13 opens with one sentence written for this programme; everything else in 13-14 is shared
  sharedIntro: { s13: parseSection(13, sharedOpts[13]).intro },
  glossary: parseGlossary(),
};
write(`data/${directionId}/en.json`, out);
const count = (ms) => `${ms.length} modules, ${ms.reduce((a, m) => a + m.sections.length, 0)} sections, ${ms.reduce((a, m) => a + m.sections.reduce((b, s) => b + s.subsections.length, 0), 0)} subsections`;
console.log(`data/${directionId}/en.json: ${count(modules)}, ${out.glossary.length} glossary terms`);

if (WITH_SHARED) {
  const shared = [buildModule(5, [13], sharedOpts), buildModule(6, [14], sharedOpts)];
  write("data/shared/en.json", { direction: "shared", lang: "en", modules: shared });
  console.log(`data/shared/en.json: ${count(shared)}`);
}
