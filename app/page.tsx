"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { useContentDoc } from "@/components/ContentProvider";
import { SkillRow } from "@/components/SkillRow";
import { searchSubSkills } from "@/lib/search";
import { findSubSkill, pillarCounts } from "@/lib/content";
import { recentsStore } from "@/lib/recents";
import { PILLARS, PILLAR_META } from "@/lib/types";

/**
 * Search-first home.
 *
 * The BRD filed search as a "Should" and browsing as the primary path, but a coach
 * on the sideline knows the skill name and not which pillar it lives under. Making
 * search the first thing under the thumb is what buys the 15-second target (AC-8);
 * pillar browsing stays one tap away for coaches who prefer to explore.
 */
export default function HomePage() {
  const { content } = useContentDoc();
  const [query, setQuery] = useState("");
  const recentIds = useSyncExternalStore(
    recentsStore.subscribe,
    recentsStore.getSnapshot,
    recentsStore.getServerSnapshot,
  );

  const results = useMemo(
    () => searchSubSkills(content, query),
    [content, query],
  );
  const counts = useMemo(() => pillarCounts(content), [content]);
  const recents = recentIds
    .map((id) => findSubSkill(content, id))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  const searching = query.trim().length > 0;

  return (
    <main className="flex-1 px-4 pb-8 safe-top">
      <header className="pt-3 pb-4">
        <h1 className="text-3xl font-bold tracking-tight">PlayerPath</h1>
        <p className="text-sm text-muted">Coaching and assessment, ages 9–12</p>
      </header>

      <div className="relative">
        <SearchGlyph />
        <input
          type="search"
          inputMode="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a skill, e.g. first touch"
          aria-label="Search sub-skills"
          className="h-14 w-full rounded-2xl border-2 border-line bg-surface pl-12 pr-4 text-base outline-none placeholder:text-muted focus:border-brand focus:bg-bg"
        />
      </div>

      {searching ? (
        <section className="mt-5" aria-live="polite">
          {results.length === 0 ? (
            <div className="rounded-2xl border border-line bg-surface p-6 text-center">
              <p className="font-semibold">No skill matches “{query.trim()}”</p>
              <p className="mt-1 text-sm text-muted">
                Try a shorter word, or browse the five pillars.
              </p>
              <Link
                href="/browse/"
                className="mt-4 inline-flex h-12 items-center rounded-xl bg-brand px-5 font-semibold text-white"
              >
                Browse pillars
              </Link>
            </div>
          ) : (
            <>
              <h2 className="mb-2 text-sm font-semibold text-muted">
                {results.length} {results.length === 1 ? "result" : "results"}
              </h2>
              <ul className="flex flex-col gap-2">
                {results.map((s) => (
                  <SkillRow key={s.id} skill={s} />
                ))}
              </ul>
            </>
          )}
        </section>
      ) : (
        <>
          {recents.length > 0 && (
            <section className="mt-6">
              <h2 className="mb-2 text-sm font-semibold text-muted">
                Recently viewed
              </h2>
              <ul className="flex flex-col gap-2">
                {recents.slice(0, 3).map((s) => (
                  <SkillRow key={s.id} skill={s} />
                ))}
              </ul>
            </section>
          )}

          <section className="mt-6">
            <h2 className="mb-3 text-sm font-semibold text-muted">
              Five development pillars
            </h2>
            <ul className="grid grid-cols-2 gap-3">
              {PILLARS.map((pillar, i) => {
                const meta = PILLAR_META[pillar];
                return (
                  <li
                    key={pillar}
                    // The fifth tile spans the full width so the grid never
                    // leaves an orphan sitting awkwardly in one column.
                    className={i === PILLARS.length - 1 ? "col-span-2" : undefined}
                  >
                    <Link
                      href={`/browse/?pillar=${pillar}`}
                      className="relative flex h-32 flex-col justify-end overflow-hidden rounded-2xl border border-line p-3 active:opacity-90"
                    >
                      <Image
                        src={meta.img}
                        alt=""
                        fill
                        sizes="(max-width: 512px) 50vw, 256px"
                        className="object-cover"
                      />
                      {/* Neutral scrim rather than an accent wash: a coloured
                          overlay heavy enough for white text turns the photo to
                          mush. The pillar colour lives in the chip instead. */}
                      <span
                        aria-hidden="true"
                        className="absolute inset-0"
                        style={{
                          background:
                            "linear-gradient(to top, rgba(0,0,0,.82) 0%, rgba(0,0,0,.38) 48%, rgba(0,0,0,.06) 100%)",
                        }}
                      />
                      <span
                        aria-hidden="true"
                        className="absolute left-3 top-3 h-2 w-8 rounded-full"
                        style={{ background: meta.accent }}
                      />
                      <span className="relative text-lg font-bold leading-tight text-white">
                        {pillar}
                      </span>
                      <span className="relative text-xs font-medium text-white/85">
                        {counts[pillar] ?? 0} skills
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        </>
      )}
    </main>
  );
}

function SearchGlyph() {
  return (
    <svg
      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
