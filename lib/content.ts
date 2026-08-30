"use client";

import { SEED_CONTENT } from "./seed-content";
import { CONTENT_DOC, VERSIONS_COLLECTION, getDb, isFirebaseConfigured } from "./firebase";
import { validateContent } from "./validate";
import { createStore } from "./store";
import type { ContentDoc, Pillar, SubSkill } from "./types";

const CACHE_KEY = "playerpath.content.v1";
const MAX_VERSIONS = 10;

/**
 * Content resolution, in priority order:
 *   1. Baked seed  - instant first paint, and the floor if everything else fails
 *   2. Local cache - last known good copy from a previous launch, works offline
 *   3. Firestore   - authoritative, revalidated in the background
 *
 * A cold launch with no signal is fully functional. This is what makes the
 * offline requirement (risk R-4) cheap rather than a project of its own.
 */

export function readCachedContent(): ContentDoc {
  if (typeof window === "undefined") return SEED_CONTENT;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return SEED_CONTENT;
    const parsed = JSON.parse(raw) as ContentDoc;
    // Never let a corrupt cache take the app down - fall back to seed.
    if (!parsed?.subSkills?.length) return SEED_CONTENT;
    return parsed.version >= SEED_CONTENT.version ? parsed : SEED_CONTENT;
  } catch {
    return SEED_CONTENT;
  }
}

function writeCache(docData: ContentDoc) {
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(docData));
  } catch {
    /* quota or private mode - the app still works from memory */
  }
}

/** Fetches remote content. Returns null when unconfigured, offline, or unchanged. */
export async function fetchRemoteContent(
  currentVersion: number,
): Promise<ContentDoc | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const { doc, getDoc } = await import("firebase/firestore");
    const snap = await getDoc(doc(db, CONTENT_DOC.collection, CONTENT_DOC.id));
    if (!snap.exists()) return null;

    const remote = snap.data() as ContentDoc;
    if (!remote?.subSkills?.length) return null;
    if (remote.version <= currentVersion) return null;

    // Never accept remote content that would break the app.
    if (validateContent(remote).length > 0) {
      console.warn("[PlayerPath] Remote content failed validation; keeping local copy.");
      return null;
    }

    writeCache(remote);
    return remote;
  } catch {
    return null;
  }
}

/**
 * Whether a content document exists remotely yet. On a fresh project it does not,
 * and the admin needs an explicit way to seed Firestore from the built-in content
 * - otherwise nothing is ever "changed" and the publish action never appears.
 */
export async function remoteContentExists(): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  try {
    const { doc, getDoc } = await import("firebase/firestore");
    const snap = await getDoc(doc(db, CONTENT_DOC.collection, CONTENT_DOC.id));
    return snap.exists();
  } catch {
    // Offline or permission-denied: assume it exists so we do not nag.
    return true;
  }
}

export async function saveContent(next: ContentDoc): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Firebase is not configured.");

  const { doc, setDoc } = await import("firebase/firestore");

  const issues = validateContent(next);
  if (issues.length > 0) {
    throw new Error(`Content failed validation with ${issues.length} issue(s).`);
  }

  const payload: ContentDoc = {
    ...next,
    version: next.version + 1,
    updatedAt: new Date().toISOString(),
  };

  await setDoc(doc(db, CONTENT_DOC.collection, CONTENT_DOC.id), payload);
  // Snapshot for one-tap revert after a bad edit.
  await setDoc(doc(db, VERSIONS_COLLECTION, String(payload.version)), payload);
  writeCache(payload);
}

export async function listVersions(): Promise<ContentDoc[]> {
  const db = await getDb();
  if (!db) return [];

  const { collection, getDocs, query, orderBy, limit } = await import(
    "firebase/firestore"
  );
  const q = query(
    collection(db, VERSIONS_COLLECTION),
    orderBy("version", "desc"),
    limit(MAX_VERSIONS),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as ContentDoc);
}

/**
 * The content store. Reads the cached copy lazily on first snapshot, so the first
 * client render already shows the latest known content rather than flashing seed.
 */
export const contentStore = createStore<ContentDoc>(readCachedContent, SEED_CONTENT);

/** Pulls remote content and pushes it into the store. Safe to call repeatedly. */
export async function revalidateContent(): Promise<void> {
  const current = contentStore.getSnapshot();
  const remote = await fetchRemoteContent(current.version);
  if (remote) contentStore.set(remote);
}

export { isFirebaseConfigured };

/* ---------- selectors ---------- */

export function byPillar(content: ContentDoc, pillar: Pillar): SubSkill[] {
  return content.subSkills.filter((s) => s.pillar === pillar);
}

export function findSubSkill(content: ContentDoc, id: string): SubSkill | undefined {
  return content.subSkills.find((s) => s.id === id);
}

export function pillarCounts(content: ContentDoc): Record<string, number> {
  return content.subSkills.reduce<Record<string, number>>((acc, s) => {
    acc[s.pillar] = (acc[s.pillar] ?? 0) + 1;
    return acc;
  }, {});
}
