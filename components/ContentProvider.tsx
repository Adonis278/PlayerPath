"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { contentStore, revalidateContent } from "@/lib/content";
import type { ContentDoc } from "@/lib/types";

type ContentState = {
  content: ContentDoc;
  refresh: () => Promise<void>;
};

const Ctx = createContext<ContentState | null>(null);

export function ContentProvider({ children }: { children: ReactNode }) {
  /*
   * The store reads the cached copy lazily, so the first client render already
   * has the latest known content. No mount-time setState, and no flash of seed
   * content before the cache loads.
   */
  const content = useSyncExternalStore(
    contentStore.subscribe,
    contentStore.getSnapshot,
    contentStore.getServerSnapshot,
  );

  useEffect(() => {
    // Background revalidation. Failure is fine - we already have content.
    void revalidateContent();
  }, []);

  const value = useMemo<ContentState>(
    () => ({ content, refresh: revalidateContent }),
    [content],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useContentDoc(): ContentState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useContentDoc must be used inside ContentProvider");
  return ctx;
}
