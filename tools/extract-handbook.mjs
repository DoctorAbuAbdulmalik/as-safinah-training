// One-off extractor: turns the text of the IT & Digital Transformation handbook
// (pdftotext -layout -enc UTF-8) into structured JSON for the web app.
//
//   pdftotext -layout -enc UTF-8 handbook.pdf handbook.txt
//   node tools/extract-handbook.mjs handbook.txt data/it-digital/en.json
//
// Sections 1-12 (Modules 1-4) share one regular layout and are parsed fully.
// Sections 13-14 (shared Modules 5-6) have a richer layout and are added later.
import fs from "node:fs";

const [, , inFile, outFile] = process.argv;
const raw = fs.readFileSync(inFile, "utf8");

const VERSES_AR = {
  "17:36": "وَلَا تَقْفُ مَا لَيْسَ لَكَ بِهِ عِلْمٌ",
  "49:6": "يَا أَيُّهَا الَّذِينَ آمَنُوا إِن جَاءَكُمْ فَاسِقٌ بِنَبَإٍ فَتَبَيَّنُوا",
  "12:55": "اجْعَلْنِي عَلَىٰ خَزَائِنِ الْأَرْضِ ۖ إِنِّي حَفِيظٌ عَلِيمٌ",
  "23:8": "وَالَّذِينَ هُمْ لِأَمَانَاتِهِمْ وَعَهْدِهِمْ رَاعُونَ",
  "3:190": "إِنَّ فِي خَلْقِ السَّمَاوَاتِ وَالْأَرْضِ وَاخْتِلَافِ اللَّيْلِ وَالنَّهَارِ لَآيَاتٍ لِّأُولِي الْأَلْبَابِ",
  "57:25": "وَأَنزَلْنَا الْحَدِيدَ فِيهِ بَأْسٌ شَدِيدٌ وَمَنَافِعُ لِلنَّاسِ",
  "83:1–3": "وَيْلٌ لِّلْمُطَفِّفِينَ ۝ الَّذِينَ إِذَا اكْتَالُوا عَلَى النَّاسِ يَسْتَوْفُونَ ۝ وَإِذَا كَالُوهُمْ أَوْ وَزَنُوهُمْ يُخْسِرُونَ",
  "17:34": "وَأَوْفُوا بِالْعَهْدِ ۖ إِنَّ الْعَهْدَ كَانَ مَسْئُولًا",
};

// ---------- cleaning ----------
const FOOTER = /^\s*As Safinah Centre for Humanitarian Excellence\s+·/;
const SENT = "\u0001"; // marks a page break (where the footer was)
const lines = raw
  .replace(/\f/g, "\n")
  .split("\n")
  .map((l) => (FOOTER.test(l) ? SENT : l))
  .map((l) => l.replace(/@@K\d+@@/g, "").replace(/\s+$/, ""));

// Extraction artefacts: stray spaces after macron vowels (Sū rah -> Sūrah)
const fix = (s) =>
  s
    .replace(/([ūāīŪĀĪ]) (?=[a-zA-Z’‘])/g, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();

const join = (arr) =>
  fix(
    arr.reduce((acc, l) => {
      const t = l.trim();
      if (!acc) return t;
      return /[-–]$/.test(acc) && !/ [-–]$/.test(acc) ? acc + t : acc + " " + t;
    }, "")
  );

const indent = (l) => l.match(/^ */)[0].length;
const isBlank = (l) => l.trim() === "" || l === SENT;

// ---------- locate regions ----------
const find = (re, from = 0) => {
  for (let i = from; i < lines.length; i++) if (re.test(lines[i])) return i;
  return -1;
};

// Module openers & outcomes (Modules 1-4)
function parseOpener(n) {
  // The 2nd occurrence of "MODULE n" that is NOT followed by "Learning Outcomes"
  let idx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (new RegExp(`^\\s*MODULE ${n}\\s*$`).test(lines[i])) {
      const next = lines.slice(i + 1, i + 6).join(" ");
      if (!/Learning Outcomes/.test(next) && /ISLAMIC FOUNDATION/.test(lines.slice(i + 1, i + 14).join(" "))) {
        idx = i;
        break;
      }
    }
  }
  if (idx < 0) throw new Error("opener not found " + n);
  let j = idx + 1;
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
      let text = join(buf).replace(/^[“"]|[”"]$/g, "");
      while (isBlank(lines[++j]));
      const ref = fix(lines[j].trim());
      const key = (ref.match(/(\d+:\d+(?:–\d+)?)/) || [])[1];
      // The PDF's Arabic is not extractable as clean text, so the Arabic wording
      // is supplied here. TO BE PROOF-READ against a printed mushaf before launch.
      verses.push({ ar: VERSES_AR[key], text, ref });
    }
  }
  return { title, tagline, verses, why };
}

function parseOutcomes(n) {
  const i = find(new RegExp(`^\\s*MODULE ${n}\\s*$`), 0);
  // find the MODULE n occurrence followed by Learning Outcomes
  let start = -1;
  for (let k = 0; k < lines.length; k++) {
    if (new RegExp(`^\\s*MODULE ${n}\\s*$`).test(lines[k]) && /Learning Outcomes/.test(lines.slice(k + 1, k + 6).join(" "))) {
      start = k;
      break;
    }
  }
  if (start < 0) throw new Error("outcomes not found " + n);
  let j = start;
  const items = [];
  let cur = null;
  let evidence = [];
  let inEvidence = false;
  for (j = start; j < lines.length; j++) {
    const l = lines[j];
    if (j > start + 3 && /^\s*(SECTION|MODULE) \d/.test(l)) break;
    const m = l.match(/^\s+(\d+)\.\s+(.*)/);
    if (m && !inEvidence) {
      cur = m[2];
      items.push(cur);
      continue;
    }
    if (/Evidence of completion/.test(l)) {
      inEvidence = true;
      continue;
    }
    if (inEvidence && !isBlank(l)) evidence.push(l);
    else if (cur !== null && !inEvidence && !isBlank(l) && indent(l) > 2 && !/^By the end/.test(l.trim())) {
      items[items.length - 1] += " " + l.trim();
    }
  }
  return { items: items.map(fix), evidence: join(evidence) };
}

// ---------- sections ----------
function parseSection(n, startLine, endLine) {
  const L = lines.slice(startLine, endLine);
  let i = 1; // skip "SECTION n"
  const titleBuf = [];
  while (!/^\s*THE SHIP/.test(L[i])) {
    if (!isBlank(L[i])) titleBuf.push(L[i]);
    i++;
  }
  const title = fix(titleBuf.join(" "));
  i++;
  const nb = () => {
    while (isBlank(L[i])) i++;
    return L[i++].trim();
  };
  const shipTitle = fix(nb());
  // ship paragraphs until "On board here:" paragraph ends
  const shipParas = [];
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
    shipParas.push(p);
  }
  let claim = shipParas.pop();
  if (shipParas.length === 0) {
    // single paragraph: the last sentence is the emphasised claim
    const m = claim.match(/^(.*[.!?”’])\s+([^.!?]+[.!?])$/s);
    if (m) {
      shipParas.push(m[1]);
      claim = m[2];
    }
  }
  const ship = { title: shipTitle, body: shipParas, claim, question };

  // intro paragraphs until first N.M heading
  const headRe = new RegExp(`^${n}\\.(\\d+)\\s+(.+)$`);
  const intro = [];
  while (i < L.length && !headRe.test(L[i].trim())) {
    if (isBlank(L[i])) {
      i++;
      continue;
    }
    const buf = [];
    while (i < L.length && !isBlank(L[i]) && !headRe.test(L[i].trim())) buf.push(L[i++]);
    intro.push(join(buf));
  }

  // subsections
  const subsections = [];
  let review = null;
  while (i < L.length) {
    const hm = L[i].trim().match(headRe);
    if (!hm) {
      i++;
      continue;
    }
    const num = `${n}.${hm[1]}`;
    const subTitle = fix(hm[2]);
    i++;
    const body = [];
    while (i < L.length && !headRe.test(L[i].trim())) body.push(L[i++]);
    if (/^Section Review/i.test(subTitle)) {
      review = parseReview(body);
    } else {
      subsections.push({ id: num, title: subTitle, blocks: parseBlocks(body) });
    }
  }
  return { number: n, title, ship, intro, subsections, review };
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
    if (l === SENT) {
      flushList();
      pb = true;
      i++;
      continue;
    }
    if (isBlank(l)) {
      flushList();
      i++;
      continue;
    }
    if (indent(l) >= 3) {
      const t = l.trim();
      if (/^Practical example/.test(t)) {
        flushList();
        const buf = [];
        while (i < body.length && !isBlank(body[i])) buf.push(body[i++]);
        const full = join(buf);
        const m = full.match(/^Practical example\s*[—–-]\s*([^:]+):\s*(.*)$/);
        blocks.push({ type: "example", title: fix(m[1]), text: m[2] });
        continue;
      }
      // bullet (or its wrapped continuation)
      if (!list && pb && blocks.at(-1)?.type === "ul") list = blocks.pop().items; // list continues on next page
      pb = false;
      if (list && /^[a-z(“"]/.test(t)) list[list.length - 1] += " " + t;
      else (list ||= []).push(t);
      i++;
      continue;
    }
    flushList();
    const buf = [];
    while (i < body.length && !isBlank(body[i]) && indent(body[i]) < 3) buf.push(body[i++]);
    const text = join(buf);
    const last = blocks.at(-1);
    if (pb && last?.type === "p" && !/[.:?!”’)]$/.test(last.text)) last.text = fix(last.text + " " + text); // paragraph continues on next page
    else blocks.push({ type: "p", text });
    pb = false;
  }
  flushList();
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
  const heading = join(testsPart.slice(0, first).filter((l) => !isBlank(l))).replace(/\s+[—–-]\s+answer each honestly.*$/i, "");
  const tests = numbered(testsPart.slice(first));
  const questions = numbered(body.slice(qIdx + 1, eIdx));
  const exercise = join(body.slice(eIdx + 1).filter((l) => !isBlank(l)));
  return { intro: heading, tests, questions, exercise };
}

// ---------- assemble ----------
const sectionStarts = [];
for (let n = 1; n <= 12; n++) {
  sectionStarts.push(find(new RegExp(`^SECTION ${n}\\s*$`)));
}
const moduleDefs = [
  { id: "m1", n: 1, sections: [1, 2, 3] },
  { id: "m2", n: 2, sections: [4, 5, 6] },
  { id: "m3", n: 3, sections: [7, 8, 9] },
  { id: "m4", n: 4, sections: [10, 11, 12] },
];

const sectionEnd = (n) => {
  // end at the next SECTION or a MODULE opener/outcomes line
  const s = sectionStarts[n - 1];
  for (let i = s + 1; i < lines.length; i++) {
    if (/^\s*MODULE \d\s*$/.test(lines[i]) || /^SECTION \d+\s*$/.test(lines[i])) return i;
  }
  return lines.length;
};

const modules = moduleDefs.map((m) => {
  const opener = parseOpener(m.n);
  return {
    id: m.id,
    number: m.n,
    title: opener.title,
    tagline: opener.tagline,
    foundation: { verses: opener.verses, why: opener.why },
    sections: m.sections.map((n) => {
      const sec = parseSection(n, sectionStarts[n - 1], sectionEnd(n));
      sec.id = "s" + n;
      return sec;
    }),
    outcomes: parseOutcomes(m.n),
  };
});

const out = {
  direction: "it-digital",
  lang: "en",
  source: "IT and Digital Transformation Handbook, Version 3, November 2026 — As Safinah Centre for Humanitarian Excellence",
  modules,
};
fs.writeFileSync(outFile, JSON.stringify(out, null, 2), "utf8");
console.log(
  "modules:", modules.length,
  "sections:", modules.reduce((a, m) => a + m.sections.length, 0),
  "subsections:", modules.reduce((a, m) => a + m.sections.reduce((b, s) => b + s.subsections.length, 0), 0)
);
