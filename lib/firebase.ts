import type { FirebaseApp } from "firebase/app";
import type { Firestore } from "firebase/firestore";
import type { Auth } from "firebase/auth";

/**
 * These values are public by design. A Firebase web config ships inside every
 * Firebase web app's JS bundle and is not a secret - authorization is enforced by
 * Firestore security rules, not by hiding the key. See firestore.rules.
 *
 * A service-account JSON is a different thing entirely and must never appear here.
 */
const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * Until the owner supplies a config the app runs on baked seed content alone.
 * Everything a coach does still works; only remote content sync and admin are off.
 */
export const isFirebaseConfigured = Boolean(config.apiKey && config.projectId);

/**
 * Every accessor below loads the SDK dynamically, and nothing here imports it at
 * module scope. That matters: the Firebase SDK is ~650KB and a coach opening the
 * app on 4G must not wait for it. The app paints from baked content first and
 * only pulls Firebase in afterwards, off the critical path (NFR-1).
 */
let appPromise: Promise<FirebaseApp | null> | null = null;

function loadApp(): Promise<FirebaseApp | null> {
  if (!isFirebaseConfigured) return Promise.resolve(null);

  appPromise ??= (async () => {
    const { initializeApp, getApps } = await import("firebase/app");
    return getApps().length
      ? getApps()[0]
      : initializeApp(config as Required<typeof config>);
  })();

  return appPromise;
}

export async function getDb(): Promise<Firestore | null> {
  const app = await loadApp();
  if (!app) return null;
  const { getFirestore } = await import("firebase/firestore");
  return getFirestore(app);
}

export async function getFirebaseAuth(): Promise<Auth | null> {
  const app = await loadApp();
  if (!app) return null;
  const { getAuth } = await import("firebase/auth");
  return getAuth(app);
}

/** Firestore locations. Content is a single document - it is ~150KB against a 1MB limit. */
export const CONTENT_DOC = { collection: "content", id: "current" } as const;
export const VERSIONS_COLLECTION = "content_versions";
