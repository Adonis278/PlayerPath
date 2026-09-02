"use client";

import { createStore } from "./store";

/**
 * The squad. A player is a real entity now, not a raw label typed into a field -
 * this is what makes both the optional name field and squad quick-rating
 * possible: scores reference a stable player id, so renaming or adding a name
 * later does not fracture score history the way re-typing a label string used to.
 *
 * Device-local, like everything else in the assessment path. A name is more
 * identifying than a jersey number, so it stays fully optional - the label
 * alone is enough to use the app.
 */

export type Player = {
  id: string;
  /** Jersey number or short label. The primary, always-present identifier. */
  label: string;
  /** Optional full name. */
  name?: string;
};

const KEY = "playerpath.roster.v1";

function read(): Player[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Player[]) : [];
  } catch {
    return [];
  }
}

function write(players: Player[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(players));
  } catch {
    /* quota or private mode - roster degrades to in-memory for the session */
  }
  rosterStore.invalidate();
}

export function readRoster(): Player[] {
  return read();
}

const NO_PLAYERS: Player[] = [];
export const rosterStore = createStore<Player[]>(readRoster, NO_PLAYERS);

function normaliseLabel(label: string): string {
  return label.trim().toLowerCase();
}

/**
 * Adds or updates a player. Given a label with no id, reuses an existing
 * player whose label matches (case-insensitive) rather than creating a
 * duplicate - typing "7" twice should mean the same kid both times.
 */
export function upsertPlayer(patch: {
  id?: string;
  label: string;
  name?: string;
}): Player {
  const label = patch.label.trim();
  const name = patch.name?.trim() || undefined;
  const players = read();

  const existing = patch.id
    ? players.find((p) => p.id === patch.id)
    : players.find((p) => normaliseLabel(p.label) === normaliseLabel(label));

  const player: Player = {
    id: existing?.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    label: label || existing?.label || "",
    name: name ?? existing?.name,
  };

  write([...players.filter((p) => p.id !== player.id), player]);
  return player;
}

export function removePlayer(id: string) {
  write(read().filter((p) => p.id !== id));
}

export function findPlayer(players: Player[], id: string): Player | undefined {
  return players.find((p) => p.id === id);
}

/** Display string: the name if there is one, otherwise the label. */
export function playerDisplayName(player: Player | undefined): string {
  if (!player) return "Unlabelled";
  return player.name || player.label || "Unlabelled";
}
