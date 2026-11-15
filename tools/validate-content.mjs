// Checks that every translated file mirrors the structure of the English master.
//   node tools/validate-content.mjs            (validates all directions)
import fs from "node:fs";
import path from "node:path";

const root = path.resolve("data");
let problems = 0;
const bad = (msg) => { problems++; console.error("✗", msg); };

for (const dir of fs.readdirSync(root, { withFileTypes: true }).filter((d) => d.isDirectory())) {
  const enPath = path.join(root, dir.name, "en.json");
  if (!fs.existsSync(enPath)) continue;
  const en = JSON.parse(fs.readFileSync(enPath, "utf8"));
  for (const f of fs.readdirSync(path.join(root, dir.name)).filter((f) => f.endsWith(".json") && f !== "en.json")) {
    const tr = JSON.parse(fs.readFileSync(path.join(root, dir.name, f), "utf8"));
    const tag = `${dir.name}/${f}`;
    let sections = 0;
    for (const tm of tr.modules) {
      const m = en.modules.find((x) => x.id === tm.id);
      if (!m) { bad(`${tag}: unknown module ${tm.id}`); continue; }
      if ((tm.foundation?.verses?.length ?? 0) !== m.foundation.verses.length) bad(`${tag} ${tm.id}: verse count`);
      if (tm.outcomes.items.length !== m.outcomes.items.length) bad(`${tag} ${tm.id}: outcomes count`);
      for (const ts of tm.sections) {
        const s = m.sections.find((x) => x.id === ts.id);
        if (!s) { bad(`${tag} ${tm.id}: unknown section ${ts.id}`); continue; }
        sections++;
        const at = `${tag} ${ts.id}`;
        if (ts.subsections.length !== s.subsections.length) bad(`${at}: subsection count`);
        s.subsections.forEach((sub, i) => {
          const tsub = ts.subsections[i];
          if (!tsub) return;
          if (tsub.id !== sub.id) bad(`${at}: subsection id ${tsub.id} != ${sub.id}`);
          const shape = (bl) => bl.map((b) => b.type + (b.items ? ":" + b.items.length : "") + (b.rows ? ":" + b.rows.length + "x" + b.head.length : "")).join(",");
          if (!!tsub.ship !== !!sub.ship) bad(`${at} ${sub.id}: ship panel missing/extra`);
          if (shape(tsub.blocks) !== shape(sub.blocks)) bad(`${at} ${sub.id}: block shape ${shape(tsub.blocks)} != ${shape(sub.blocks)}`);
        });
        if (ts.review.tests.length !== s.review.tests.length) bad(`${at}: tests count`);
        if (ts.review.questions.length !== s.review.questions.length) bad(`${at}: questions count`);
        if (ts.intro.length !== s.intro.length) bad(`${at}: intro paragraphs`);
        if (ts.ship.body.length !== s.ship.body.length) bad(`${at}: ship paragraphs`);
      }
    }
    if (tr.glossary && en.glossary && tr.glossary.length !== en.glossary.length) bad(`${tag}: glossary has ${tr.glossary.length} terms, English has ${en.glossary.length}`);
    console.log(`checked ${tag}: ${sections} sections${tr.glossary ? `, ${tr.glossary.length} glossary terms` : ""}`);
  }
}
console.log(problems ? `${problems} problem(s)` : "OK — all translations match the English structure");
process.exit(problems ? 1 : 0);
