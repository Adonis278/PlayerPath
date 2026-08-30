"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { User } from "firebase/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase";
import { useContentDoc } from "@/components/ContentProvider";
import { remoteContentExists, saveContent } from "@/lib/content";
import { validateContent, contentWarnings, type Issue } from "@/lib/validate";
import { parseWorkbook } from "@/lib/import-xlsx";
import { LEVELS, PILLARS, type ContentDoc, type SubSkill } from "@/lib/types";

/**
 * Content editing lives inside the app on purpose.
 *
 * The obvious alternative was a Google Sheet, but that means leaving the product,
 * finding a tab, and editing a grid on a phone. Here the owner edits the same
 * screens the coaches read, on the device they already have in their hand.
 */
export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    void (async () => {
      const auth = await getFirebaseAuth();
      if (!auth) {
        setChecking(false);
        return;
      }
      const { onAuthStateChanged } = await import("firebase/auth");
      if (cancelled) return;
      unsubscribe = onAuthStateChanged(auth, (u) => {
        setUser(u);
        setChecking(false);
      });
    })();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  if (!isFirebaseConfigured) return <NotConfigured />;
  if (checking) return <Shell title="Manage content"><p className="text-muted">Checking…</p></Shell>;
  if (!user) return <SignIn />;
  return <Editor user={user} />;
}

/* ---------------- states ---------------- */

function Shell({
  title,
  children,
  right,
}: {
  title: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <main className="flex-1 px-4 pb-12 safe-top">
      <header className="flex items-center justify-between pt-3 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <Link href="/" className="text-sm font-semibold text-brand">
            ← Back to app
          </Link>
        </div>
        {right}
      </header>
      {children}
    </main>
  );
}

function NotConfigured() {
  return (
    <Shell title="Manage content">
      <div className="rounded-2xl border-2 border-developing bg-surface p-4">
        <p className="font-semibold">Firebase is not connected yet</p>
        <p className="mt-2 text-sm text-ink/90">
          The app is running on its built-in content. To enable editing, add the
          Firebase web config to <code className="font-mono">.env.local</code> and
          restart:
        </p>
        <pre className="mt-3 overflow-x-auto rounded-xl bg-ink p-3 text-xs leading-relaxed text-white">
{`NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...`}
        </pre>
        <p className="mt-3 text-sm text-muted">
          These values are public by design and belong in the client bundle. A
          service-account key is a different thing and must never go here.
        </p>
      </div>
    </Shell>
  );
}

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const auth = await getFirebaseAuth();
    if (!auth) return;

    setBusy(true);
    setError("");
    try {
      const { signInWithEmailAndPassword } = await import("firebase/auth");
      await signInWithEmailAndPassword(auth, email, password);
    } catch {
      // Deliberately vague: never reveal whether the account exists.
      setError("Could not sign in. Check the email and password.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Shell title="Manage content">
      <form onSubmit={submit} className="flex flex-col gap-3">
        <p className="text-sm text-muted">
          Owner access only. Coaches never need to sign in.
        </p>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold">Email</span>
          <input
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 rounded-xl border-2 border-line bg-surface px-3 outline-none focus:border-brand focus:bg-bg"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold">Password</span>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 rounded-xl border-2 border-line bg-surface px-3 outline-none focus:border-brand focus:bg-bg"
          />
        </label>
        {error && <p className="text-sm font-semibold text-physical">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="h-12 rounded-xl bg-brand font-semibold text-white disabled:opacity-60"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </Shell>
  );
}

/* ---------------- editor ---------------- */

function Editor({ user }: { user: User }) {
  const { content, refresh } = useContentDoc();
  const [draft, setDraft] = useState<ContentDoc>(content);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [needsSeeding, setNeedsSeeding] = useState(false);

  useEffect(() => {
    // On a fresh Firebase project nothing is published yet.
    void remoteContentExists().then((exists) => setNeedsSeeding(!exists));
  }, []);

  const issues = useMemo(() => validateContent(draft), [draft]);
  const warnings = useMemo(() => contentWarnings(draft), [draft]);
  const dirty = useMemo(
    () => JSON.stringify(draft.subSkills) !== JSON.stringify(content.subSkills),
    [draft, content],
  );

  const editing = draft.subSkills.find((s) => s.id === editingId) ?? null;

  function updateSkill(next: SubSkill) {
    setDraft((d) => ({
      ...d,
      subSkills: d.subSkills.map((s) => (s.id === next.id ? next : s)),
    }));
  }

  async function save() {
    setBusy(true);
    setStatus("");
    try {
      await saveContent(draft);
      await refresh();
      setNeedsSeeding(false);
      setStatus("Published. Coaches will see this on their next launch.");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setBusy(false);
    }
  }

  if (editing) {
    return (
      <SkillEditor
        skill={editing}
        issues={issues.filter((i) => i.where === editing.id)}
        onChange={updateSkill}
        onDone={() => setEditingId(null)}
      />
    );
  }

  return (
    <Shell
      title="Manage content"
      right={
        <button
          type="button"
          onClick={async () => {
            const auth = await getFirebaseAuth();
            if (!auth) return;
            const { signOut } = await import("firebase/auth");
            await signOut(auth);
          }}
          className="h-10 rounded-xl border-2 border-line px-3 text-sm font-semibold text-muted"
        >
          Sign out
        </button>
      }
    >
      <p className="mb-4 text-sm text-muted">
        Signed in as {user.email} · version {content.version}
      </p>

      <ImportPanel
        onImported={(doc) =>
          setDraft({ ...doc, version: content.version, updatedAt: doc.updatedAt })
        }
      />

      {issues.length > 0 && (
        <div className="mt-4 rounded-2xl border-2 border-physical bg-surface p-3">
          <p className="font-semibold text-physical">
            {issues.length} issue{issues.length === 1 ? "" : "s"} block saving
          </p>
          <ul className="mt-2 flex flex-col gap-1 text-sm">
            {issues.slice(0, 8).map((i, n) => (
              <li key={n}>
                <span className="font-mono text-xs">{i.where}</span> · {i.field}:{" "}
                {i.message}
              </li>
            ))}
            {issues.length > 8 && <li className="text-muted">…and {issues.length - 8} more</li>}
          </ul>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="mt-3 rounded-2xl border border-developing bg-surface p-3 text-sm">
          {warnings.map((w, n) => (
            <p key={n}>{w}</p>
          ))}
        </div>
      )}

      {(dirty || needsSeeding) && (
        <div className="sticky top-2 z-30 mt-4 flex items-center gap-2 rounded-2xl border-2 border-brand bg-bg p-3">
          <p className="flex-1 text-sm font-semibold">
            {dirty ? "Unsaved changes" : "Not published yet"}
          </p>
          {dirty && (
            <button
              type="button"
              onClick={() => setDraft(content)}
              className="h-10 rounded-xl border-2 border-line px-3 text-sm font-semibold text-muted"
            >
              Discard
            </button>
          )}
          <button
            type="button"
            onClick={save}
            disabled={busy || issues.length > 0}
            className="h-10 rounded-xl bg-brand px-4 text-sm font-semibold text-white disabled:opacity-50"
          >
            {busy ? "Publishing…" : "Publish"}
          </button>
        </div>
      )}

      {status && <p className="mt-3 text-sm font-semibold text-brand">{status}</p>}

      <div className="mt-5 flex flex-col gap-5">
        {PILLARS.map((pillar) => {
          const skills = draft.subSkills.filter((s) => s.pillar === pillar);
          if (skills.length === 0) return null;
          return (
            <section key={pillar}>
              <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted">
                {pillar}
              </h2>
              <ul className="flex flex-col gap-2">
                {skills.map((s) => {
                  const broken = issues.some((i) => i.where === s.id);
                  return (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() => setEditingId(s.id)}
                        className="flex min-h-14 w-full items-center gap-3 rounded-2xl border border-line px-4 py-3 text-left active:bg-surface"
                      >
                        <span className="flex-1 font-semibold">{s.name}</span>
                        {broken && (
                          <span className="rounded-full bg-physical px-2 py-0.5 text-xs font-bold text-white">
                            Incomplete
                          </span>
                        )}
                        <span className="text-muted">›</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </Shell>
  );
}

function ImportPanel({ onImported }: { onImported: (doc: ContentDoc) => void }) {
  const [report, setReport] = useState<{ errors: string[]; warnings: string[] } | null>(
    null,
  );
  const [busy, setBusy] = useState(false);

  async function handle(file: File) {
    setBusy(true);
    try {
      const result = await parseWorkbook(file);
      setReport({ errors: result.errors, warnings: result.warnings });
      // Load the draft even with warnings so the owner can fix rows in the editor;
      // hard errors still block the publish button downstream.
      if (result.doc.subSkills.length > 0) onImported(result.doc);
    } catch (err) {
      setReport({
        errors: [err instanceof Error ? err.message : "Could not read that file."],
        warnings: [],
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-line bg-surface p-3">
      <p className="font-semibold">Import from spreadsheet</p>
      <p className="mt-1 text-sm text-muted">
        Replaces all content from a Skills + Rubric workbook. Optional — you can
        edit individual skills below instead.
      </p>
      <label className="mt-3 inline-flex h-11 cursor-pointer items-center rounded-xl border-2 border-line bg-bg px-4 text-sm font-semibold">
        {busy ? "Reading…" : "Choose .xlsx file"}
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handle(f);
          }}
        />
      </label>

      {report && (
        <div className="mt-3 text-sm">
          {report.errors.length === 0 && report.warnings.length === 0 && (
            <p className="font-semibold text-brand">Imported cleanly.</p>
          )}
          {report.errors.map((e, i) => (
            <p key={`e${i}`} className="text-physical">
              {e}
            </p>
          ))}
          {report.warnings.map((w, i) => (
            <p key={`w${i}`} className="text-developing">
              {w}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function SkillEditor({
  skill,
  issues,
  onChange,
  onDone,
}: {
  skill: SubSkill;
  issues: Issue[];
  onChange: (s: SubSkill) => void;
  onDone: () => void;
}) {
  const set = <K extends keyof SubSkill>(key: K, value: SubSkill[K]) =>
    onChange({ ...skill, [key]: value });

  return (
    <main className="flex-1 px-4 pb-12 safe-top">
      <header className="pt-3 pb-4">
        <button
          type="button"
          onClick={onDone}
          className="text-sm font-semibold text-brand"
        >
          ← All content
        </button>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">{skill.name}</h1>
        <p className="text-sm text-muted">{skill.pillar}</p>
      </header>

      {issues.length > 0 && (
        <ul className="mb-4 rounded-2xl border-2 border-physical bg-surface p-3 text-sm">
          {issues.map((i, n) => (
            <li key={n}>
              {i.field}: {i.message}
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-col gap-4">
        <Field label="Coaching cue" hint="Short enough to shout across a pitch">
          <input
            value={skill.coachingCue}
            onChange={(e) => set("coachingCue", e.target.value)}
            className="h-12 w-full rounded-xl border-2 border-line bg-surface px-3 outline-none focus:border-brand focus:bg-bg"
          />
        </Field>

        <Field label="What good looks like" hint="At ages 9–12 specifically">
          <textarea
            rows={4}
            value={skill.description}
            onChange={(e) => set("description", e.target.value)}
            className="w-full rounded-xl border-2 border-line bg-surface p-3 outline-none focus:border-brand focus:bg-bg"
          />
        </Field>

        <Field label="Practice activities" hint="One per line, 2–3 of them">
          <textarea
            rows={4}
            value={skill.activities.join("\n")}
            onChange={(e) =>
              set(
                "activities",
                e.target.value.split("\n").map((s) => s.trim()).filter(Boolean),
              )
            }
            className="w-full rounded-xl border-2 border-line bg-surface p-3 font-mono text-sm outline-none focus:border-brand focus:bg-bg"
          />
        </Field>

        <div>
          <p className="text-sm font-semibold">Three ways to improve</p>
          <div className="mt-2 flex flex-col gap-3">
            {[0, 1, 2].map((i) => {
              const way = skill.waysToImprove[i] ?? { problem: "", fix: "" };
              const update = (patch: Partial<typeof way>) => {
                const next = [...skill.waysToImprove];
                while (next.length < 3) next.push({ problem: "", fix: "" });
                next[i] = { ...way, ...patch };
                set("waysToImprove", next);
              };
              return (
                <div key={i} className="rounded-xl border border-line p-3">
                  <input
                    placeholder={`If you see… (${i + 1})`}
                    value={way.problem}
                    onChange={(e) => update({ problem: e.target.value })}
                    className="h-11 w-full rounded-lg border-2 border-line bg-surface px-3 text-sm outline-none focus:border-brand focus:bg-bg"
                  />
                  <input
                    placeholder="Try…"
                    value={way.fix}
                    onChange={(e) => update({ fix: e.target.value })}
                    className="mt-2 h-11 w-full rounded-lg border-2 border-line bg-surface px-3 text-sm outline-none focus:border-brand focus:bg-bg"
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold">Rubric</p>
          <p className="mb-2 text-sm text-muted">
            Keep the through-line: not yet → unpressured → moving → under match
            pressure. Describe what you would see, not how good it is.
          </p>
          <div className="flex flex-col gap-3">
            {LEVELS.map((level, i) => (
              <Field key={level} label={`${i + 1}. ${level}`}>
                <textarea
                  rows={3}
                  value={skill.rubric[level]}
                  onChange={(e) =>
                    set("rubric", { ...skill.rubric, [level]: e.target.value })
                  }
                  className="w-full rounded-xl border-2 border-line bg-surface p-3 text-sm outline-none focus:border-brand focus:bg-bg"
                />
              </Field>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={onDone}
          className="h-12 rounded-xl bg-brand font-semibold text-white"
        >
          Done
        </button>
      </div>
    </main>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold capitalize">{label}</span>
      {hint && <span className="-mt-1 text-sm text-muted">{hint}</span>}
      {children}
    </label>
  );
}
