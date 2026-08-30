"use client";

import type { ContentDoc, Pillar, SubSkill } from "./types";
import { PILLARS } from "./types";

/**
 * Import from the product owner's spreadsheet.
 *
 * The BRD keeps content in a "Skills" tab and criteria in a "Rubric" tab, joined
 * on pillar + sub_skill. The join happens here, at import time, so the app itself
 * only ever sees one denormalised record per sub-skill. An unmatched rubric row is
 * therefore an import error rather than a runtime surprise - which is what makes
 * acceptance criterion AC-10 automatic.
 */

export type ImportResult = {
  doc: ContentDoc;
  errors: string[];
  warnings: string[];
};

type Row = Record<string, unknown>;

function str(v: unknown): string {
  if (v === null || v === undefined) return "";
  return String(v).trim();
}

/** Tolerates "Sub Skill", "sub_skill", "SubSkill" and friends. */
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

/** Splits a multi-value cell on newlines, semicolons, or numbered prefixes. */
function splitList(value: string): string[] {
  if (!value) return [];
  return value
    .split(/\r?\n|;|(?:^|\s)\d+[.)]\s/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** "Problem -> fix" pairs, accepting several separators the owner might type. */
function parseWays(value: string): { problem: string; fix: string }[] {
  return splitList(value).map((line) => {
    const parts = line.split(/->|→|\|/);
    return {
      problem: (parts[0] ?? "").trim(),
      fix: (parts.slice(1).join(" ") ?? "").trim(),
    };
  });
}

export async function parseWorkbook(file: File): Promise<ImportResult> {
  // Loaded only here so SheetJS never lands in the coach's bundle.
  const XLSX = await import("xlsx");

  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: "array" });

  const errors: string[] = [];
  const warnings: string[] = [];

  const findSheet = (...names: string[]) => {
    const target = names.map(normaliseKey);
    const match = wb.SheetNames.find((n) => target.includes(normaliseKey(n)));
    return match ? XLSX.utils.sheet_to_json<Row>(wb.Sheets[match]) : null;
  };

  const skillRows = findSheet("Skills", "Skill", "Content");
  if (!skillRows) {
    return {
      doc: { version: 0, updatedAt: new Date().toISOString(), subSkills: [] },
      errors: [
        `No "Skills" sheet found. Sheets in this file: ${wb.SheetNames.join(", ")}`,
      ],
      warnings,
    };
  }

  const rubricRows = findSheet("Rubric", "Rubrics", "Assessment") ?? [];
  if (rubricRows.length === 0) {
    warnings.push('No "Rubric" sheet found - rubric criteria will be empty.');
  }

  // Index rubric rows by pillar + sub-skill so the join is a lookup, not a scan.
  const rubricByKey = new Map<string, Row>();
  for (const row of rubricRows) {
    const pillar = pick(row, "pillar");
    const name = pick(row, "sub_skill", "subskill", "skill", "name");
    if (!pillar || !name) continue;
    rubricByKey.set(slugify(pillar, name), row);
  }

  const matchedRubricKeys = new Set<string>();
  const subSkills: SubSkill[] = [];

  skillRows.forEach((row, i) => {
    const rowRef = `Skills row ${i + 2}`;
    const pillarRaw = pick(row, "pillar");
    const name = pick(row, "sub_skill", "subskill", "skill", "name");

    if (!pillarRaw && !name) return; // blank spacer row

    const pillar = PILLARS.find(
      (p) => normaliseKey(p) === normaliseKey(pillarRaw),
    );
    if (!pillar) {
      errors.push(
        `${rowRef}: pillar "${pillarRaw}" is not one of ${PILLARS.join(", ")}`,
      );
      return;
    }
    if (!name) {
      errors.push(`${rowRef}: missing sub_skill name`);
      return;
    }

    const id = slugify(pillar, name);
    const rubricRow = rubricByKey.get(id);
    if (rubricRow) matchedRubricKeys.add(id);
    else warnings.push(`${rowRef}: no matching Rubric row for "${pillar} / ${name}"`);

    subSkills.push({
      id,
      pillar: pillar as Pillar,
      name,
      description: pick(row, "description", "what_good_looks_like"),
      activities: splitList(pick(row, "activities", "practice_activities")),
      coachingCue: pick(row, "coaching_cue", "cue"),
      waysToImprove: parseWays(pick(row, "ways_to_improve", "improvements")),
      rubric: {
        emerging: rubricRow ? pick(rubricRow, "level_1_emerging", "emerging") : "",
        developing: rubricRow ? pick(rubricRow, "level_2_developing", "developing") : "",
        consistent: rubricRow ? pick(rubricRow, "level_3_consistent", "consistent") : "",
        advanced: rubricRow ? pick(rubricRow, "level_4_advanced", "advanced") : "",
      },
    });
  });

  // Orphaned rubric rows point at a typo or a renamed skill - always worth saying.
  for (const key of rubricByKey.keys()) {
    if (!matchedRubricKeys.has(key)) {
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
