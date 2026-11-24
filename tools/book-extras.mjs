// Adds what the PDF stores as artwork or layout to a direction's en.json:
// front matter (Contents, How to use, ... Finding each pathway), figures, and the task-sheet template.
//   node tools/book-extras.mjs management
// Run it after tools/extract-handbook.mjs, which rewrites en.json.
import fs from "node:fs";

const dir = process.argv[2];
const extras = JSON.parse(fs.readFileSync(`tools/extras/${dir}.json`, "utf8"));
const file = `data/${dir}/en.json`;
const en = JSON.parse(fs.readFileSync(file, "utf8"));

en.assets = extras.assets;
en.front = extras.front;

const sections = en.modules.flatMap((m) => m.sections);
const find = (id) => {
  const s = sections.find((x) => x.id === id);
  if (!s) throw new Error("section not found " + id);
  return s;
};
const figureBlock = (f) => ({
  type: "figure",
  src: `${extras.assets}/${f.src}`,
  w: f.w,
  h: f.h,
  alt: f.alt,
  ...(f.caption ? { caption: f.caption } : {}),
});

for (const f of extras.figures) {
  const s = find(f.section);
  const blk = figureBlock(f);
  if (f.intro) {
    s.introBlocks = [...s.intro.map((text) => ({ type: "p", text })), blk];
    continue;
  }
  const sub = s.subsections.find((x) => x.id === f.sub);
  if (!sub) throw new Error("subsection not found " + f.sub);
  if (f.at === "end") sub.blocks.push(blk);
  else if (f.at === "beforeTable") sub.blocks.splice(sub.blocks.findIndex((b) => b.type === "table"), 0, blk);
  else sub.blocks.splice(f.at, 0, blk);
}

const t = extras.taskSheet;
if (t) {
  const sub = find(t.section).subsections.find((x) => x.id === t.sub);
  const i = sub.blocks.findIndex((b) => b.type === "p" && b.text.startsWith(t.replaceParagraphStartingWith));
  if (i < 0) throw new Error("task sheet template paragraph not found");
  sub.blocks[i] = {
    type: "table",
    caption: t.caption,
    head: t.head,
    rows: Array.from({ length: t.rows }, (_, k) => [String(k + 1), ...Array(t.head.length - 1).fill("")]),
  };
}

fs.writeFileSync(file, JSON.stringify(en, null, 2) + "\n", "utf8");
console.log(`${file}: front matter, ${extras.figures.length} figures${t ? ", task-sheet table" : ""}`);
