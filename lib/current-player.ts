"use client";

import { createStore } from "./store";

/**
 * The id of the player currently being assessed one-on-one.
 *
 * The workbook's workflow is one player across all 21 sub-skills, so this has to
 * survive navigation - otherwise a coach re-selects the player on every skill.
 * Stores an id into the roster (lib/roster.ts) rather than a raw label, so
 * renaming a player does not lose the selection. Squad quick-rating (rating one
 * skill across the whole roster) does not use this - it has no single "current"
 * player by design.
 */

const KEY = "playerpath.currentPlayerId.v1";

export function readCurrentPlayerId(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}

export function setCurrentPlayerId(id: string) {
  try {
    window.localStorage.setItem(KEY, id);
  } catch {
    /* non-essential */
  }
  currentPlayerIdStore.invalidate();
}

export const currentPlayerIdStore = createStore<string>(readCurrentPlayerId, "");
