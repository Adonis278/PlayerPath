import type { ContentDoc, SubSkill } from "./types";

/**
 * Client-side search over 21 records. No dependency and no index - the whole
 * corpus fits in memory many times over, so a scan per keystroke is free.
 *
 * FR-3 was a "Should" in the BRD. It is built as a Must because a coach on the
 * sideline knows the skill name, not which pillar it was filed under, and this
 * costs almost nothing to provide.
 */

function normalise(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

type Scored = { skill: SubSkill; score: number };

function scoreSkill(skill: SubSkill, terms: string[]): number {
  const name = normalise(skill.name);
  const pillar = normalise(skill.pillar);
  const cue = normalise(skill.coachingCue);
  const body = normalise(
    `${skill.description} ${skill.activities.join(" ")} ${skill.waysToImprove
      .map((w) => `${w.problem} ${w.fix}`)
      .join(" ")}`,
  );

  let total = 0;

  for (const term of terms) {
    let best = 0;

    if (name === term) best = 100;
    else if (name.startsWith(term)) best = 80;
    else if (name.includes(term)) best = 60;
    else if (pillar.startsWith(term)) best = 40;
    else if (cue.includes(term)) best = 25;
    else if (body.includes(term)) best = 10;

    // Every term must land somewhere, so an extra word narrows rather than widens.
    if (best === 0) return 0;
    total += best;
  }

  return total;
}

export function searchSubSkills(content: ContentDoc, rawQuery: string): SubSkill[] {
  const q = normalise(rawQuery);
  if (!q) return [];

  const terms = q.split(" ").filter(Boolean);

  return content.subSkills
    .map<Scored>((skill) => ({ skill, score: scoreSkill(skill, terms) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.skill.name.localeCompare(b.skill.name))
    .map((r) => r.skill);
}
