"use client";

import { createStore } from "./store";

/**
 * The player currently being assessed.
 *
 * The workbook's workflow is one player across all 21 sub-skills, so this has to
 * survive navigation - otherwise a coach re-types the label on every skill and
 * the ratings scatter across 21 separate "players". Device-local, like everything
 * else in the assessment path.
 */

const KEY = "playerpath.currentPlayer.v1";

export function readCurrentPlayer(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}

export function setCurrentPlayer(label: string) {
  try {
    window.localStorage.setItem(KEY, label);
  } catch {
    /* non-essential */
  }
  currentPlayerStore.invalidate();
}

export const currentPlayerStore = createStore<string>(readCurrentPlayer, "");
