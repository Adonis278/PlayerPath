"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useContentDoc } from "@/components/ContentProvider";
import { findSubSkill } from "@/lib/content";
import {
  clearScores,
  exportAsText,
  groupByPlayer,
  removeScore,
  scoreStore,
} from "@/lib/scores";
import { LEVEL_META } from "@/lib/types";

export default function SessionPage() {
  const { content } = useContentDoc();
  const scores = useSyncExternalStore(
    scoreStore.subscribe,
    scoreStore.getSnapshot,
    scoreStore.getServerSnapshot,
  );
  const [confirmClear, setConfirmClear] = useState(false);
  const [copied, setCopied] = useState(false);

  const groups = groupByPlayer(scores);

  async function share() {
    const text = exportAsText(scores, content);
    try {
      // The native share sheet is the natural home for this on a phone.
      if (navigator.share) {
        await navigator.share({ title: "PlayerPath assessment", text });
        return;
      }
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* user dismissed the sheet - nothing to report */
    }
  }

  function handleClear() {
    clearScores();
    setConfirmClear(false);
  }

  return (
    <main className="flex-1 px-4 pb-8 safe-top">
      <header className="pt-3 pb-4">
        <h1 className="text-3xl font-bold tracking-tight">Session</h1>
        <p className="text-sm text-muted">
          {scores.length === 0
            ? "Nothing recorded yet"
            : `${scores.length} ${scores.length === 1 ? "score" : "scores"} on this phone`}
        </p>
      </header>

      {scores.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface p-6 text-center">
          <p className="font-semibold">No scores yet</p>
          <p className="mt-1 text-sm text-muted">
            Open any sub-skill and use the Assess tab to record where a player is
            right now.
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex h-12 items-center rounded-xl bg-brand px-5 font-semibold text-white"
          >
            Find a skill
          </Link>
        </div>
      ) : (
        <>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={share}
              className="h-12 flex-1 rounded-xl bg-brand font-semibold text-white active:bg-brand-dark"
            >
              {copied ? "Copied" : "Export"}
            </button>
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              className="h-12 rounded-xl border-2 border-line px-4 font-semibold text-muted"
            >
              Clear
            </button>
          </div>

          {confirmClear && (
            <div className="mt-3 rounded-2xl border-2 border-developing bg-surface p-4">
              <p className="font-semibold">Clear all {scores.length} scores?</p>
              <p className="mt-1 text-sm text-muted">
                This cannot be undone. Export first if you want to keep them.
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={handleClear}
                  className="h-11 flex-1 rounded-xl bg-physical font-semibold text-white"
                >
                  Clear everything
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="h-11 flex-1 rounded-xl border-2 border-line font-semibold"
                >
                  Keep
                </button>
              </div>
            </div>
          )}

          <div className="mt-5 flex flex-col gap-5">
            {groups.map(({ label, scores: group }) => (
              <section key={label}>
                <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted">
                  {label}
                </h2>
                <ul className="flex flex-col gap-2">
                  {group.map((s) => {
                    const skill = findSubSkill(content, s.subSkillId);
                    const info = LEVEL_META[s.level];
                    const colour = `var(--color-${info.key})`;
                    return (
                      <li
                        key={s.id}
                        className="flex items-center gap-3 rounded-2xl border border-line p-3"
                      >
                        <span
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-bold text-white"
                          style={{ background: colour }}
                        >
                          {s.level}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-semibold">
                            {skill?.name ?? s.subSkillId}
                          </span>
                          <span className="block text-sm" style={{ color: colour }}>
                            {info.label}
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={() => removeScore(s.id)}
                          aria-label={`Remove ${skill?.name ?? "score"}`}
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path
                              d="M6 6l12 12M18 6L6 18"
                              stroke="currentColor"
                              strokeWidth="2.2"
                              strokeLinecap="round"
                            />
                          </svg>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        </>
      )}

      <p className="mt-8 text-center text-xs text-muted">
        Scores stay on this phone. No account, nothing uploaded.
      </p>
    </main>
  );
}
