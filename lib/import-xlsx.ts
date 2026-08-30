"use client";

import type { ContentDoc, Pillar, SubSkill } from "./types";
import { PILLARS } from "./types";

/**
 * Import from the product owner's workbook.
 *
 * Two sheets are read and joined on pillar + sub-skill:
 *   Skills            - pillar, sub-skill, icon, what good looks like,
 *                       activities, coaching cue, ways to improve
 *   Scoring Framework - the four rubric anchors per sub-skill, in a table that
 *                       starts partway down the sheet under its own header row
 *
 * The join happens here so the app only ever sees one denormalised record per
 * sub-skill, and an unmatched rubric row becomes an import error rather than a
 * runtime surprise. That is what makes acceptance criterion AC-10 automatic.
 */

export type ImportResult = {
  doc: ContentDoc;
  errors: string[];
  warnings: string[];
};

type Row = Record<string, unknown>;
type Cell = string | number | boolean | null | undefined;

function str(v: unknown): string {
  if (v === null || v === undefined) return "";
  return String(v)
    // The workbook uses smart punctuation; normalise so the app renders evenly.
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—−]/g, "-")
    .replace(/ /g, " ")
    .trim();
}

/** Tolerates "Sub-skill", "sub_skill", "SubSkill" and friends. */
function normaliseKey(k: string): string {
  return k.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function pick(row: Row, ...candidates: string[]): string {
  const map = new Map<string, unknown>();
  for (const [k, v] of Object.entries(row)) map.set(normaliseKey(k), v);
  for (const c of candidates) {
    const hit = map.get(normaliseKey(c));
    if (hit !== undefined && str(hit) !== "") return str(hit);
  }
  return "";
}

export function slugify(pillar: string, name: string): string {
  const clean = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  return `${clean(pillar)}.${clean(name)}`;
}

/** Activities are semicolon-separated in one cell. */
function splitActivities(value: string): string[] {
  return value
    .split(/;|\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Ways to improve arrive as "1) … 2) … 3) …" on a single line. */
function splitWays(value: string): string[] {
  return value
    .split(/\s*\d\)\s*/)
    .map((s) => s.trim().replace(/\.$/, "").trim())
    .filter(Boolean);
}

export async function parseWorkbook(file: File): Promise<ImportResult> {
  // Loaded only here so SheetJS never lands in the coach's bundle.
  const XLSX = await import("xlsx");

  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: "array" });

  const errors: string[] = [];
  const warnings: string[] = [];

  const sheetNamed = (...names: string[]) => {
    const target = names.map(normaliseKey);
    return wb.SheetNames.find((n) => target.includes(normaliseKey(n)));
  };

  /* ---- Skills sheet ---- */

  const skillsName = sheetNamed("Skills", "Skill", "Content");
  if (!skillsName) {
    return {
      doc: { version: 0, updatedAt: new Date().toISOString(), subSkills: [] },
      errors: [
        `No "Skills" sheet found. Sheets in this file: ${wb.SheetNames.join(", ")}`,
      ],
      warnings,
    };
  }
  const skillRows = XLSX.utils.sheet_to_json<Row>(wb.Sheets[skillsName]);

  /* ---- Scoring Framework sheet ---- */

  const rubricByKey = new Map<string, Record<string, string>>();
  const frameworkName = sheetNamed(
    "Scoring Framework",
    "Rubric",
    "Rubrics",
    "Assessment",
  );

  if (!frameworkName) {
    warnings.push(
      'No "Scoring Framework" sheet found - rubric anchors will be empty.',
    );
  } else {
    /*
     * This sheet is a document, not a table: prose at the top, then an anchor
     * table under its own "Pillar | Sub-skill | 1 - Emerging | …" header. Read it
     * as raw rows and start collecting only once that header is seen.
     */
    const grid = XLSX.utils.sheet_to_json<Cell[]>(wb.Sheets[frameworkName], {
      header: 1,
      blankrows: false,
    });

    let inTable = false;
    for (const raw of grid) {
      const cells = (raw ?? []).map(str);
      if (!inTable) {
        if (
          normaliseKey(cells[0] ?? "") === "pillar" &&
          normaliseKey(cells[1] ?? "").startsWith("subskill")
        ) {
          inTable = true;
        }
        continue;
      }
      const [pillar, name, l1, l2, l3, l4] = cells;
      if (!pillar || !name) continue;
      rubricByKey.set(slugify(pillar, name), {
        emerging: l1 ?? "",
        developing: l2 ?? "",
        consistent: l3 ?? "",
        advanced: l4 ?? "",
      });
    }

    if (rubricByKey.size === 0) {
      warnings.push(
        `Found "${frameworkName}" but no anchor table under a Pillar / Sub-skill header.`,
      );
    }
  }

  /* ---- join ---- */

  const matched = new Set<string>();
  const subSkills: SubSkill[] = [];

  skillRows.forEach((row, i) => {
    const rowRef = `Skills row ${i + 2}`;
    const pillarRaw = pick(row, "pillar");
    const name = pick(row, "sub-skill", "sub_skill", "subskill", "skill", "name");

    if (!pillarRaw && !name) return; // blank spacer row

    const pillar = PILLARS.find((p) => normaliseKey(p) === normaliseKey(pillarRaw));
    if (!pillar) {
      errors.push(
        `${rowRef}: pillar "${pillarRaw}" is not one of ${PILLARS.join(", ")}`,
      );
      return;
    }
    if (!name) {
      errors.push(`${rowRef}: missing sub-skill name`);
      return;
    }

    const id = slugify(pillar, name);
    const rubric = rubricByKey.get(id);
    if (rubric) matched.add(id);
    else warnings.push(`${rowRef}: no rubric anchors for "${pillar} / ${name}"`);

    subSkills.push({
      id,
      pillar: pillar as Pillar,
      name,
      icon: pick(row, "icon"),
      description: pick(row, "what good looks like", "description"),
      activities: splitActivities(pick(row, "activities")),
      coachingCue: pick(row, "coaching cue", "coaching_cue", "cue"),
      waysToImprove: splitWays(
        pick(row, "ways to improve (3)", "ways to improve", "ways_to_improve"),
      ),
      rubric: {
        emerging: rubric?.emerging ?? "",
        developing: rubric?.developing ?? "",
        consistent: rubric?.consistent ?? "",
        advanced: rubric?.advanced ?? "",
      },
    });
  });

  // Orphaned anchor rows point at a typo or a renamed skill - always worth saying.
  for (const key of rubricByKey.keys()) {
    if (!matched.has(key)) {
      errors.push(`Rubric row "${key}" has no matching Skills row`);
    }
  }

  return {
    doc: {
      version: 0, // caller bumps against whatever is currently live
      updatedAt: new Date().toISOString(),
      subSkills,
    },
    errors,
    warnings,
  };
}
