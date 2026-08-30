"use client";

/** Recently viewed sub-skills. Device-local, and capped so the list stays scannable. */

import { createStore } from "./store";

const KEY = "playerpath.recents.v1";
const MAX = 6;

export function readRecents(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

export function pushRecent(id: string) {
  try {
    const next = [id, ...readRecents().filter((x) => x !== id)].slice(0, MAX);
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* non-essential */
  }
  recentsStore.invalidate();
}

const NO_RECENTS: string[] = [];

export const recentsStore = createStore<string[]>(readRecents, NO_RECENTS);
