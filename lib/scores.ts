"use client";

import type { ContentDoc, Pillar, Priority, Rating, Score } from "./types";
import { LEVEL_META, PILLARS } from "./types";
import { findSubSkill } from "./content";
import { createStore } from "./store";

/**
 * Assessments never leave the device. No account, no server, no upload.
 *
 * That is what lets v1 skip the privacy review the BRD defers in 3.2.3: nothing
 * identifying about a child is transmitted or retained anywhere we control.
 * Scores reference a roster player id (lib/roster.ts) rather than a name or
 * jersey number directly, so a coach can add or edit a player's name later
 * without fracturing that player's existing ratings.
 */

const KEY = "playerpath.scores.v2";

function read(): Score[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Score[]) : [];
  } catch {
    return [];
  }
}

function write(scores: Score[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(scores));
  } catch {
    /* quota or private mode - scoring degrades to in-memory for the session */
  }
  scoreStore.invalidate();
}

export function listScores(): Score[] {
  return read().sort((a, b) => b.at.localeCompare(a.at));
}

const NO_SCORES: Score[] = [];

/** Subscribe with useSyncExternalStore; see lib/store.ts for why. */
export const scoreStore = createStore<Score[]>(listScores, NO_SCORES);

/**
 * Records or updates one assessment. Re-scoring the same player on the same
 * skill replaces rather than stacks - a coach correcting themselves should not
 * leave two conflicting records behind.
 */
export function upsertScore(input: {
  subSkillId: string;
  rating: Rating;
  evidence?: string;
  priority?: Priority;
  playerId?: string;
}): Score {
  const scores = read();
  const existing = scores.find(
    (s) => s.subSkillId === input.subSkillId && s.playerId === input.playerId,
  );

  const entry: Score = {
    id: existing?.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    subSkillId: input.subSkillId,
    rating: input.rating,
    evidence: input.evidence?.trim() || undefined,
    priority: input.priority,
    playerId: input.playerId,
    at: new Date().toISOString(),
  };

  write([entry, ...scores.filter((s) => s !== existing)]);
  return entry;
}

/**
 * Clears a rating. The workbook's "no forced score" rule means not-observed is a
 * real state, not a zero - so unrating removes the record entirely rather than
 * storing a sentinel value that would drag averages down.
 */
export function clearRating(subSkillId: string, playerId?: string) {
  write(read().filter((s) => !(s.subSkillId === subSkillId && s.playerId === playerId)));
}

export function removeScore(id: string) {
  write(read().filter((s) => s.id !== id));
}

export function clearScores() {
  write([]);
}

export function scoreFor(
  scores: Score[],
  subSkillId: string,
  playerId?: string,
): Score | undefined {
  return scores.find((s) => s.subSkillId === subSkillId && s.playerId === playerId);
}

/** Every distinct player id present, most recently assessed first. */
export function listScoredPlayerIds(scores: Score[]): string[] {
  const seen = new Map<string, string>();
  for (const s of scores) {
    const key = s.playerId ?? "";
    if (!seen.has(key) || s.at > seen.get(key)!) seen.set(key, s.at);
  }
  return Array.from(seen.entries())
    .sort((a, b) => b[1].localeCompare(a[1]))
    .map(([id]) => id);
}

/** Groups scores by player id, most recently scored player first. */
export function groupByPlayer(scores: Score[]): { playerId?: string; scores: Score[] }[] {
  const groups = new Map<string, Score[]>();
  for (const s of scores) {
    const key = s.playerId ?? "";
    const list = groups.get(key) ?? [];
    list.push(s);
    groups.set(key, list);
  }
  return Array.from(groups, ([key, list]) => ({
    playerId: key || undefined,
    scores: list,
  }));
}

/* ---------------- assessment summary ---------------- */

export type PillarSummary = {
  pillar: Pillar;
  average: number | null;
  assessed: number;
  total: number;
};

export type Assessment = {
  playerId?: string;
  scores: Score[];
  /** Mean of observed ratings only. Null when nothing has been observed. */
  overallAverage: number | null;
  /** The level band the overall average falls in. */
  overallLevel: Rating | null;
  assessed: number;
  total: number;
  pillars: PillarSummary[];
  priorities: { high: Score[]; medium: Score[]; maintain: Score[] };
};

function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/**
 * Rounds an average to the nearest level band, but exact ties round DOWN.
 *
 * Math.round would send 2.5 up to Consistent. The workbook is explicit that a 3
 * or 4 should be seen repeatedly and that Consistent is already a strong outcome,
 * so a profile sitting exactly between two bands should not be credited with the
 * higher one.
 */
export function levelFromAverage(avg: number | null): Rating | null {
  if (avg === null) return null;
  return Math.min(4, Math.max(1, Math.ceil(avg - 0.5))) as Rating;
}

export function buildAssessment(
  content: ContentDoc,
  allScores: Score[],
  playerId?: string,
): Assessment {
  const scores = allScores.filter((s) => s.playerId === playerId);
  const byId = new Map(scores.map((s) => [s.subSkillId, s]));

  const pillars: PillarSummary[] = PILLARS.map((pillar) => {
    const skills = content.subSkills.filter((s) => s.pillar === pillar);
    const ratings = skills
      .map((s) => byId.get(s.id)?.rating)
      .filter((r): r is Rating => r !== undefined);
    return {
      pillar,
      average: mean(ratings),
      assessed: ratings.length,
      total: skills.length,
    };
  });

  const overallAverage = mean(scores.map((s) => s.rating));

  return {
    playerId,
    scores,
    overallAverage,
    overallLevel: levelFromAverage(overallAverage),
    assessed: scores.length,
    total: content.subSkills.length,
    pillars,
    priorities: {
      high: scores.filter((s) => s.priority === "high"),
      medium: scores.filter((s) => s.priority === "medium"),
      maintain: scores.filter((s) => s.priority === "maintain"),
    },
  };
}

/** Plain text for the share sheet - keeps the coach's data portable and theirs. */
export function exportAsText(
  a: Assessment,
  content: ContentDoc,
  playerDisplay: string,
): string {
  if (a.scores.length === 0) return "No skills assessed yet.";

  const date = new Date().toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const lines = [
    `PlayerPath assessment - ${playerDisplay}`,
    date,
    "",
    `Skills assessed: ${a.assessed} / ${a.total}`,
  ];

  if (a.overallAverage !== null && a.overallLevel) {
    lines.push(
      `Overall: ${a.overallAverage.toFixed(1)} (${LEVEL_META[a.overallLevel].label})`,
    );
  }

  lines.push("", "By pillar");
  for (const p of a.pillars) {
    lines.push(
      p.average === null
        ? `  ${p.pillar}: not assessed`
        : `  ${p.pillar}: ${p.average.toFixed(1)} (${p.assessed}/${p.total})`,
    );
  }

  lines.push("", "Detail");
  for (const s of a.scores) {
    const skill = findSubSkill(content, s.subSkillId);
    const level = LEVEL_META[s.rating].label;
    lines.push(`  ${skill?.name ?? s.subSkillId}: ${s.rating} ${level}`);
    if (s.priority) lines.push(`    Priority: ${s.priority}`);
    if (s.evidence) lines.push(`    Evidence: ${s.evidence}`);
  }

  lines.push(
    "",
    "Averages summarise the current profile. They are not a talent grade or a selection ranking.",
  );

  return lines.join("\n");
}
