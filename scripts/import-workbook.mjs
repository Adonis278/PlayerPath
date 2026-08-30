/**
 * Regenerates lib/seed-content.ts from the product owner's workbook.
 *
 *   node scripts/import-workbook.mjs ~/Downloads/coach_skills_with_player_scoring_framework.xlsx
 *
 * The seed file is the offline fallback baked into the bundle. Day-to-day content
 * edits go through the in-app admin editor; this script is for refreshing that
 * baked copy when the workbook itself changes.
 *
 * Mirrors the parsing in lib/import-xlsx.ts - keep the two in step.
 */

import { readFileSync, writeFileSync } from "node:fs";
import * as XLSX from "xlsx";

const PILLARS = ["Technical", "Tactical", "Physical", "Mental", "Social"];

const file = process.argv[2];
if (!file) {
  console.error("Usage: node scripts/import-workbook.mjs <workbook.xlsx>");
  process.exit(1);
}

const norm = (k) => String(k).toLowerCase().replace(/[^a-z0-9]/g, "");

const str = (v) =>
  v === null || v === undefined
    ? ""
    : String(v)
        .replace(/[‘’]/g, "'")
        .replace(/[“”]/g, '"')
        .replace(/[–—−]/g, "-")
        .replace(/ /g, " ")
        .trim();

const pick = (row, ...names) => {
  const map = new Map(Object.entries(row).map(([k, v]) => [norm(k), v]));
  for (const n of names) {
    const hit = map.get(norm(n));
    if (hit !== undefined && str(hit) !== "") return str(hit);
  }
  return "";
};

const slug = (pillar, name) => {
  const clean = (s) =>
    s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return `${clean(pillar)}.${clean(name)}`;
};

const wb = XLSX.read(readFileSync(file), { type: "buffer" });
const sheet = (...names) => {
  const t = names.map(norm);
  return wb.SheetNames.find((n) => t.includes(norm(n)));
};

/* Skills */
const skillRows = XLSX.utils.sheet_to_json(wb.Sheets[sheet("Skills")]);

/* Rubric anchors, from the table partway down the Scoring Framework sheet */
const anchors = new Map();
const grid = XLSX.utils.sheet_to_json(wb.Sheets[sheet("Scoring Framework", "Rubric")], {
  header: 1,
  blankrows: false,
});
let inTable = false;
for (const raw of grid) {
  const c = (raw ?? []).map(str);
  if (!inTable) {
    if (norm(c[0] ?? "") === "pillar" && norm(c[1] ?? "").startsWith("subskill")) {
      inTable = true;
    }
    continue;
  }
  if (!c[0] || !c[1]) continue;
  anchors.set(slug(c[0], c[1]), {
    emerging: c[2] ?? "",
    developing: c[3] ?? "",
    consistent: c[4] ?? "",
    advanced: c[5] ?? "",
  });
}

const problems = [];
const skills = [];

for (const [i, row] of skillRows.entries()) {
  const pillarRaw = pick(row, "pillar");
  const name = pick(row, "sub-skill", "sub_skill", "skill", "name");
  if (!pillarRaw && !name) continue;

  const pillar = PILLARS.find((p) => norm(p) === norm(pillarRaw));
  if (!pillar) {
    problems.push(`Skills row ${i + 2}: unknown pillar "${pillarRaw}"`);
    continue;
  }

  const id = slug(pillar, name);
  const rubric = anchors.get(id);
  if (!rubric) problems.push(`Skills row ${i + 2}: no rubric anchors for ${id}`);

  skills.push({
    id,
    pillar,
    name,
    icon: pick(row, "icon"),
    description: pick(row, "what good looks like", "description"),
    activities: pick(row, "activities")
      .split(/;|\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean),
    coachingCue: pick(row, "coaching cue", "cue"),
    waysToImprove: pick(row, "ways to improve (3)", "ways to improve")
      .split(/\s*\d\)\s*/)
      .map((s) => s.trim().replace(/\.$/, "").trim())
      .filter(Boolean),
    rubric: rubric ?? { emerging: "", developing: "", consistent: "", advanced: "" },
  });
}

for (const key of anchors.keys()) {
  if (!skills.some((s) => s.id === key)) {
    problems.push(`Rubric row "${key}" has no matching Skills row`);
  }
}

const q = (s) => JSON.stringify(s);
const out = [];
out.push('import type { ContentDoc, SubSkill } from "./types";');
out.push("");
out.push("/**");
out.push(` * Content from ${file.split(/[\\/]/).pop()} (product owner).`);
out.push(" *");
out.push(" * Skills sheet -> coaching content; Scoring Framework sheet -> the four rubric");
out.push(" * anchors per sub-skill, joined on pillar + sub-skill.");
out.push(" *");
out.push(" * Regenerate with: node scripts/import-workbook.mjs <file.xlsx>");
out.push(" * Do not hand-edit - edits belong in the workbook or the in-app admin editor.");
out.push(" */");
out.push("");

for (const pillar of PILLARS) {
  const group = skills.filter((s) => s.pillar === pillar);
  out.push(`const ${pillar.toUpperCase()}: SubSkill[] = [`);
  for (const s of group) {
    out.push("  {");
    out.push(`    id: ${q(s.id)},`);
    out.push(`    pillar: ${q(s.pillar)},`);
    out.push(`    name: ${q(s.name)},`);
    out.push(`    icon: ${q(s.icon)},`);
    out.push(`    description:\n      ${q(s.description)},`);
    out.push("    activities: [");
    for (const a of s.activities) out.push(`      ${q(a)},`);
    out.push("    ],");
    out.push(`    coachingCue: ${q(s.coachingCue)},`);
    out.push("    waysToImprove: [");
    for (const w of s.waysToImprove) out.push(`      ${q(w)},`);
    out.push("    ],");
    out.push("    rubric: {");
    for (const k of ["emerging", "developing", "consistent", "advanced"]) {
      out.push(`      ${k}:\n        ${q(s.rubric[k])},`);
    }
    out.push("    },");
    out.push("  },");
  }
  out.push("];");
  out.push("");
}

out.push("export const SEED_SUB_SKILLS: SubSkill[] = [");
for (const p of PILLARS) out.push(`  ...${p.toUpperCase()},`);
out.push("];");
out.push("");
out.push("export const SEED_CONTENT: ContentDoc = {");
out.push("  version: 1,");
out.push(`  updatedAt: ${q(new Date().toISOString())},`);
out.push("  subSkills: SEED_SUB_SKILLS,");
out.push("};");
out.push("");

writeFileSync("lib/seed-content.ts", out.join("\n"));

console.log(`Wrote lib/seed-content.ts - ${skills.length} sub-skills`);
for (const p of PILLARS) {
  console.log(`  ${p}: ${skills.filter((s) => s.pillar === p).length}`);
}
if (problems.length) {
  console.error(`\n${problems.length} problem(s):`);
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}
