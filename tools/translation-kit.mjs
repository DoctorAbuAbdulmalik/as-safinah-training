// Translation kit: turns course content into a flat, numbered list of strings and back.
// A translator works on one unit at a time (a module's opener, or one section) and returns
// a JSON array with exactly the same number of strings, in the same order.
//
//   node tools/translation-kit.mjs dump  <direction> <unit>             e.g. management m1 | management s4
//   node tools/translation-kit.mjs build <direction> <lang> <folder>     folder holds <unit>.json arrays
//
// build merges the units it finds into data/<direction>/<lang>.json (other content there is kept).
import fs from "node:fs";
import path from "node:path";

const [, , cmd, dir, a, b] = process.argv;
const en = JSON.parse(fs.readFileSync(`data/${dir}/en.json`, "utf8"));

/** Visit every translatable string of a unit in a fixed order. fn(value) returns the replacement. */
function walkModule(m, fn) {
  const o = { id: m.id, number: m.number };
  o.title = fn(m.title);
  o.tagline = fn(m.tagline);
  o.foundation = {
    verses: m.foundation.verses.map((v) => ({ ar: v.ar, text: fn(v.text), ref: fn(v.ref) })),
    why: m.foundation.why.map(fn),
  };
  o.outcomes = { items: m.outcomes.items.map(fn), evidence: fn(m.outcomes.evidence) };
  return o;
}
function walkShip(sh, fn) {
  return { title: fn(sh.title), body: sh.body.map(fn), claim: sh.claim ? fn(sh.claim) : "", question: fn(sh.question) };
}
function walkBlock(bl, fn) {
  const o = { type: bl.type };
  if (bl.start) o.start = bl.start;
  if (bl.type === "p" || bl.type === "h3") o.text = fn(bl.text);
  if (bl.type === "ul" || bl.type === "ol") o.items = bl.items.map(fn);
  if (bl.type === "example") { o.title = fn(bl.title); o.text = fn(bl.text); }
  if (bl.type === "table") { o.caption = fn(bl.caption); o.head = bl.head.map((h) => (h ? fn(h) : "")); o.rows = bl.rows.map((r) => r.map(fn)); }
  return o;
}
function walkSection(s, fn) {
  const o = { id: s.id, number: s.number, title: fn(s.title), ship: walkShip(s.ship, fn) };
  if (s.introBlocks) {
    o.introBlocks = s.introBlocks.map((bl) => walkBlock(bl, fn));
    o.intro = o.introBlocks.filter((bl) => bl.type === "p").map((bl) => bl.text);
  } else o.intro = s.intro.map(fn);
  o.subsections = s.subsections.map((sub) => {
    const x = { id: sub.id, title: fn(sub.title) };
    if (sub.ship) x.ship = walkShip(sub.ship, fn);
    x.blocks = sub.blocks.map((bl) => walkBlock(bl, fn));
    return x;
  });
  const r = s.review;
  o.review = { intro: fn(r.intro), tests: r.tests.map(fn), questions: r.questions.map(fn), exercise: fn(r.exercise) };
  return o;
}
const findUnit = (u) => {
  if (/^m\d$/.test(u)) { const m = en.modules.find((x) => x.id === u); return m && { kind: "module", m }; }
  for (const m of en.modules) { const s = m.sections.find((x) => x.id === u); if (s) return { kind: "section", m, s }; }
  return null;
};
const walkUnit = (unit, fn) => (unit.kind === "module" ? walkModule(unit.m, fn) : walkSection(unit.s, fn));

if (cmd === "dump") {
  const unit = findUnit(a);
  if (!unit) throw new Error("unknown unit " + a);
  const out = [];
  walkUnit(unit, (v) => { out.push(v); return v; });
  out.forEach((v, i) => console.log(`${i}\t${v}`));
  console.error(`${a}: ${out.length} strings`);
} else if (cmd === "build") {
  const lang = a;
  const folder = b;
  const file = `data/${dir}/${lang}.json`;
  const target = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : { direction: dir, lang, status: "draft", modules: [] };
  const units = fs.readdirSync(folder).filter((f) => /^(m|s)\d+\.json$/.test(f)).map((f) => f.replace(".json", ""));
  const done = [];
  for (const u of units) {
    const unit = findUnit(u);
    if (!unit) { console.error("skip unknown unit", u); continue; }
    const arr = JSON.parse(fs.readFileSync(path.join(folder, u + ".json"), "utf8"));
    let i = 0;
    const res = walkUnit(unit, () => arr[i++]);
    if (i !== arr.length) throw new Error(`${u}: expected ${i} strings, got ${arr.length}`);
    if (arr.some((x) => typeof x !== "string")) throw new Error(`${u}: non-string entry`);
    const mid = unit.m.id;
    let tm = target.modules.find((x) => x.id === mid);
    if (!tm) { tm = { id: mid, number: unit.m.number, sections: [] }; target.modules.push(tm); }
    if (unit.kind === "module") Object.assign(tm, res, { sections: tm.sections });
    else {
      const k = tm.sections.findIndex((x) => x.id === res.id);
      k >= 0 ? (tm.sections[k] = res) : tm.sections.push(res);
      tm.sections.sort((x, y) => x.number - y.number);
    }
    done.push(u);
  }
  // a module is only usable once its opener has been translated
  target.modules = target.modules.filter((m) => m.title).sort((x, y) => x.number - y.number);
  fs.writeFileSync(file, JSON.stringify(target, null, 2) + "\n", "utf8");
  console.log(`${file}: merged ${done.sort().join(", ")}`);
} else {
  console.error("usage: dump <direction> <unit> | build <direction> <lang> <folder>");
  process.exit(1);
}
