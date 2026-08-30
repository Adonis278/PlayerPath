"use client";

import type { ContentDoc, LevelValue, Score } from "./types";
import { LEVEL_META } from "./types";
import { findSubSkill } from "./content";
import { createStore } from "./store";

/**
 * Scores never leave the device. No account, no server, no upload.
 *
 * That is what lets v1 skip the privacy review the BRD defers in 3.2.3: nothing
 * identifying about a child is transmitted or retained anywhere we control. The
 * player label is optional and the UI asks for a jersey number, not a name.
 */

const KEY = "playerpath.scores.v1";

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

export function addScore(
  subSkillId: string,
  level: LevelValue,
  playerLabel?: string,
): Score {
  const scores = read();
  const label = playerLabel?.trim() || undefined;

  const entry: Score = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    subSkillId,
    level,
    playerLabel: label,
    at: new Date().toISOString(),
  };

  // Re-scoring the same player on the same skill replaces rather than stacks -
  // a coach correcting themselves should not leave two conflicting records.
  const deduped = scores.filter(
    (s) => !(s.subSkillId === subSkillId && s.playerLabel === label),
  );

  write([entry, ...deduped]);
  return entry;
}

export function removeScore(id: string) {
  write(read().filter((s) => s.id !== id));
}

export function clearScores() {
  write([]);
}

export function scoreFor(
  subSkillId: string,
  playerLabel?: string,
): Score | undefined {
  const label = playerLabel?.trim() || undefined;
  return read().find((s) => s.subSkillId === subSkillId && s.playerLabel === label);
}

/** Groups by player label, most recently scored player first. */
export function groupByPlayer(scores: Score[]): { label: string; scores: Score[] }[] {
  const groups = new Map<string, Score[]>();
  for (const s of scores) {
    const key = s.playerLabel ?? "Unlabelled";
    const list = groups.get(key) ?? [];
    list.push(s);
    groups.set(key, list);
  }
  return Array.from(groups, ([label, list]) => ({ label, scores: list }));
}

/** Plain text for the share sheet - keeps the coach's data portable and theirs. */
export function exportAsText(scores: Score[], content: ContentDoc): string {
  if (scores.length === 0) return "No scores recorded yet.";

  const date = new Date().toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const lines = [`PlayerPath assessment - ${date}`, ""];

  for (const { label, scores: group } of groupByPlayer(scores)) {
    lines.push(label);
    for (const s of group) {
      const skill = findSubSkill(content, s.subSkillId);
      const name = skill?.name ?? s.subSkillId;
      lines.push(`  ${name}: ${LEVEL_META[s.level].label}`);
    }
    lines.push("");
  }

  return lines.join("\n").trimEnd();
}
