"use client";

import { createStore } from "./store";

/**
 * Captures the browser's install prompt so onboarding can offer a real
 * "Install" button on Android/desktop Chrome rather than just instructions.
 * The event has to be captured globally and early - it fires once, before any
 * component asking for it necessarily exists yet - and calling .preventDefault()
 * is what stops the browser's own mini-infobar so this app controls the timing.
 */

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

let deferred: BeforeInstallPromptEvent | null = null;

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e as BeforeInstallPromptEvent;
    installPromptStore.invalidate();
  });
}

function hasInstallPrompt(): boolean {
  return deferred !== null;
}

/** Subscribe with useSyncExternalStore - see lib/store.ts for why. */
export const installPromptStore = createStore<boolean>(hasInstallPrompt, false);

export async function promptInstall(): Promise<boolean> {
  if (!deferred) return false;
  await deferred.prompt();
  const { outcome } = await deferred.userChoice;
  deferred = null;
  installPromptStore.invalidate();
  return outcome === "accepted";
}

/** True once already running as an installed app - no point offering to install. */
export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    // iOS Safari's own flag; not covered by the media query above.
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

export function isIOS(): boolean {
  if (typeof window === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}
