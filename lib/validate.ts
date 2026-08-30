import { LEVELS, PILLARS, type ContentDoc, type SubSkill } from "./types";

/**
 * Data quality rules from BRD section 3.3.3. Runs on import and on every admin save.
 * This is the automated form of acceptance criterion AC-10.
 */

export type Issue = {
  /** Sub-skill id, or a row reference during import. */
  where: string;
  field: string;
  message: string;
};

const EXPECTED_SUB_SKILL_COUNT = 21;

function blank(v: unknown): boolean {
  return typeof v !== "string" || v.trim().length === 0;
}

export function validateSubSkill(s: SubSkill): Issue[] {
  const issues: Issue[] = [];
  const where = s.id || s.name || "(unidentified row)";

  if (blank(s.id)) issues.push({ where, field: "id", message: "Missing stable id" });
  if (blank(s.name)) issues.push({ where, field: "name", message: "Missing sub-skill name" });

  if (!PILLARS.includes(s.pillar)) {
    issues.push({
      where,
      field: "pillar",
      message: `Pillar must be one of: ${PILLARS.join(", ")}`,
    });
  }

  if (blank(s.description)) {
    issues.push({ where, field: "description", message: "Missing description" });
  }
  if (blank(s.coachingCue)) {
    issues.push({ where, field: "coachingCue", message: "Missing coaching cue" });
  }
  if (blank(s.icon)) {
    issues.push({ where, field: "icon", message: "Missing icon name" });
  }

  const activities = Array.isArray(s.activities) ? s.activities.filter((a) => !blank(a)) : [];
  if (activities.length < 2 || activities.length > 3) {
    issues.push({
      where,
      field: "activities",
      message: `Needs 2-3 activities, found ${activities.length}`,
    });
  }

  const ways = Array.isArray(s.waysToImprove)
    ? s.waysToImprove.filter((w) => !blank(w))
    : [];
  if (ways.length !== 3) {
    issues.push({
      where,
      field: "waysToImprove",
      message: `Needs exactly 3 ways to improve, found ${ways.length}`,
    });
  }

  // Rubric: every level present, and no two levels identical. A rubric that repeats
  // itself cannot separate one level from the next, which is risk R-2.
  const seen = new Map<string, string>();
  for (const level of LEVELS) {
    const text = s.rubric?.[level];
    if (blank(text)) {
      issues.push({ where, field: `rubric.${level}`, message: `Missing ${level} criteria` });
      continue;
    }
    const norm = text.trim().toLowerCase();
    const dup = seen.get(norm);
    if (dup) {
      issues.push({
        where,
        field: `rubric.${level}`,
        message: `Identical wording to "${dup}" - levels must be distinguishable`,
      });
    } else {
      seen.set(norm, level);
    }
  }

  return issues;
}

export function validateContent(doc: ContentDoc): Issue[] {
  const issues: Issue[] = [];
  const subSkills = Array.isArray(doc?.subSkills) ? doc.subSkills : [];

  if (subSkills.length === 0) {
    return [{ where: "(document)", field: "subSkills", message: "No sub-skills found" }];
  }

  const byId = new Map<string, number>();
  const byPillarName = new Map<string, number>();

  for (const s of subSkills) {
    issues.push(...validateSubSkill(s));

    if (!blank(s.id)) {
      byId.set(s.id, (byId.get(s.id) ?? 0) + 1);
    }
    const key = `${s.pillar}::${(s.name ?? "").trim().toLowerCase()}`;
    byPillarName.set(key, (byPillarName.get(key) ?? 0) + 1);
  }

  for (const [id, count] of byId) {
    if (count > 1) {
      issues.push({ where: id, field: "id", message: `Duplicate id used ${count} times` });
    }
  }
  for (const [key, count] of byPillarName) {
    if (count > 1) {
      issues.push({
        where: key,
        field: "name",
        message: `Duplicate pillar + name combination used ${count} times`,
      });
    }
  }

  return issues;
}

/**
 * Non-blocking warnings. These do not stop a save, but the pilot build should be
 * complete before M1 content readiness is signed off.
 */
export function contentWarnings(doc: ContentDoc): string[] {
  const warnings: string[] = [];
  const subSkills = doc?.subSkills ?? [];

  if (subSkills.length !== EXPECTED_SUB_SKILL_COUNT) {
    warnings.push(
      `Expected ${EXPECTED_SUB_SKILL_COUNT} sub-skills, found ${subSkills.length}`,
    );
  }

  for (const pillar of PILLARS) {
    if (!subSkills.some((s) => s.pillar === pillar)) {
      warnings.push(`Pillar "${pillar}" has no sub-skills`);
    }
  }

  return warnings;
}

export function isValid(doc: ContentDoc): boolean {
  return validateContent(doc).length === 0;
}
