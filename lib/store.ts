"use client";

/**
 * Minimal external-store helper for useSyncExternalStore.
 *
 * localStorage cannot be read during static generation, so the naive approach is
 * to read it in an effect and setState. That triggers a cascading render and a
 * visible flash of seed content, and React 19 lints against it. Instead each store
 * reads lazily inside getSnapshot and memoises the result, so the very first
 * client render already has the real data while the server snapshot stays stable.
 *
 * getSnapshot MUST return a stable reference between mutations or React will
 * re-render forever - hence the explicit cache.
 */
export function createStore<T>(load: () => T, serverValue: T) {
  let cache: T | null = null;
  const listeners = new Set<() => void>();

  function getSnapshot(): T {
    cache ??= load();
    return cache;
  }

  function getServerSnapshot(): T {
    return serverValue;
  }

  function subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  /** Drops the memo and notifies subscribers. Call after any write. */
  function invalidate() {
    cache = null;
    for (const l of listeners) l();
  }

  /** Replaces the value outright, e.g. content arriving from the network. */
  function set(value: T) {
    cache = value;
    for (const l of listeners) l();
  }

  return { getSnapshot, getServerSnapshot, subscribe, invalidate, set };
}
