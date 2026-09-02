"use client";

import { createStore } from "./store";

/**
 * Whether the first-run intro has been shown. Shown once, ever, and reopenable
 * on demand from the home screen link.
 *
 * The default matters: it has to assume "already onboarded" (hidden) rather
 * than "not onboarded" (shown), because every RETURN visit re-runs this check
 * for the rest of the product's life, while a first-time flash only ever
 * happens once per install. Defaulting to shown would mean the overlay
 * flickers on for every coach, every single time they open the app.
 */

const KEY = "playerpath.onboarded.v1";

function readOnboarded(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return true;
  }
}

export function markOnboarded() {
  try {
    window.localStorage.setItem(KEY, "1");
  } catch {
    /* non-essential */
  }
  onboardedStore.invalidate();
}

export const onboardedStore = createStore<boolean>(readOnboarded, true);

/**
 * A separate, non-persisted trigger for reopening the intro on demand (the
 * "How this works" link). Distinct from the persisted flag above so replaying
 * it never un-onboards the coach for next time if they skip out partway.
 */
const reopenListeners = new Set<() => void>();

export function requestOnboarding() {
  reopenListeners.forEach((l) => l());
}

export function subscribeReopenOnboarding(cb: () => void): () => void {
  reopenListeners.add(cb);
  return () => reopenListeners.delete(cb);
}
