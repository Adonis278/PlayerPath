"use client";

import { Suspense, useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useContentDoc } from "@/components/ContentProvider";
import { findSubSkill } from "@/lib/content";
import { pushRecent } from "@/lib/recents";
import { addScore, scoreStore } from "@/lib/scores";
import {
  LEVELS,
  LEVEL_META,
  PILLAR_META,
  type LevelValue,
  type SubSkill,
} from "@/lib/types";

export default function SkillPage() {
  return (
    <Suspense fallback={<div className="p-4 text-muted">Loading…</div>}>
      <SkillDetail />
    </Suspense>
  );
}

function SkillDetail() {
  const params = useSearchParams();
  const id = params.get("id") ?? "";
  const { content } = useContentDoc();
  const skill = findSubSkill(content, id);

  const [tab, setTab] = useState<"coach" | "assess">("coach");

  useEffect(() => {
    if (skill) pushRecent(skill.id);
  }, [skill]);

  if (!skill) {
    return (
      <main className="flex-1 px-4 pt-8 safe-top">
        <p className="rounded-2xl border border-line bg-surface p-6 text-center">
          That skill could not be found.
        </p>
        <Link
          href="/"
          className="mt-4 flex h-12 items-center justify-center rounded-xl bg-brand font-semibold text-white"
        >
          Back to search
        </Link>
      </main>
    );
  }

  const meta = PILLAR_META[skill.pillar];

  return (
    <main className="flex-1 pb-10">
      <header
        className="px-4 pb-4 pt-3 safe-top"
        style={{ background: meta.tint }}
      >
        <div className="flex items-center gap-2">
          <Link
            href={`/browse/?pillar=${skill.pillar}`}
            className="-ml-2 inline-flex h-10 w-10 items-center justify-center rounded-full"
            style={{ color: meta.accent }}
            aria-label={`Back to ${skill.pillar}`}
          >
            <BackGlyph />
          </Link>
          <span
            className="rounded-full px-2.5 py-1 text-xs font-bold"
            style={{ background: meta.accent, color: "#fff" }}
          >
            {skill.pillar}
          </span>
        </div>
        <h1 className="mt-2 text-3xl font-bold leading-tight tracking-tight">
          {skill.name}
        </h1>
      </header>

      <div
        role="tablist"
        aria-label="Skill view"
        className="sticky top-0 z-30 flex border-b border-line bg-bg/95 backdrop-blur"
      >
        <TabButton active={tab === "coach"} onClick={() => setTab("coach")}>
          Coach it
        </TabButton>
        <TabButton active={tab === "assess"} onClick={() => setTab("assess")}>
          Assess
        </TabButton>
      </div>

      {tab === "coach" ? (
        <CoachTab skill={skill} accent={meta.accent} />
      ) : (
        <AssessTab skill={skill} />
      )}
    </main>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`h-13 flex-1 border-b-[3px] py-3.5 text-base font-semibold transition-colors ${
        active ? "border-brand text-ink" : "border-transparent text-muted"
      }`}
    >
      {children}
    </button>
  );
}

/* ---------------- Coach it ---------------- */

function CoachTab({ skill, accent }: { skill: SubSkill; accent: string }) {
  return (
    <div className="flex flex-col gap-6 px-4 pt-5">
      {/* The cue comes first and largest: it is the thing a coach shouts in the
          moment, and the most common reason for opening the app mid-practice. */}
      <section
        className="rounded-2xl px-4 py-4 text-white"
        style={{ background: accent }}
      >
        <h2 className="text-xs font-bold uppercase tracking-wider text-white/80">
          Say this
        </h2>
        <p className="mt-1 text-2xl font-bold leading-snug">
          “{skill.coachingCue}”
        </p>
      </section>

      <section>
        <SectionTitle>What good looks like</SectionTitle>
        <p className="text-ink/90">{skill.description}</p>
      </section>

      <section>
        <SectionTitle>Practice activities</SectionTitle>
        <ul className="flex flex-col gap-2">
          {skill.activities.map((a, i) => (
            <li
              key={i}
              className="flex gap-3 rounded-2xl border border-line bg-surface p-3"
            >
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ background: accent }}
              >
                {i + 1}
              </span>
              <span className="text-[0.95rem]">{a}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <SectionTitle>Three ways to improve</SectionTitle>
        <ul className="flex flex-col gap-3">
          {skill.waysToImprove.map((w, i) => (
            <li key={i} className="rounded-2xl border border-line p-3">
              <p className="text-sm font-semibold text-muted">If you see</p>
              <p className="mt-0.5">{w.problem}</p>
              <p className="mt-2.5 text-sm font-semibold" style={{ color: accent }}>
                Try
              </p>
              <p className="mt-0.5">{w.fix}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

/* ---------------- Assess ---------------- */

function AssessTab({ skill }: { skill: SubSkill }) {
  const [player, setPlayer] = useState("");
  /*
   * The selected level is derived from the score store rather than mirrored into
   * local state, so switching skill or player needs no effect to resynchronise -
   * the right answer simply falls out of the current render.
   */
  const scores = useSyncExternalStore(
    scoreStore.subscribe,
    scoreStore.getSnapshot,
    scoreStore.getServerSnapshot,
  );

  const label = player.trim() || undefined;
  const key = `${skill.id}|${label ?? ""}`;
  const selected =
    scores.find((s) => s.subSkillId === skill.id && s.playerLabel === label)
      ?.level ?? null;

  // Show the confirmation only for the row the coach just tapped.
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const saved = savedKey === key;

  function choose(level: LevelValue) {
    addScore(skill.id, level, player);
    setSavedKey(key);
  }

  return (
    <div className="flex flex-col gap-4 px-4 pt-5">
      <details className="rounded-2xl border border-line bg-surface p-3">
        <summary className="cursor-pointer text-sm font-semibold">
          How to score this
        </summary>
        <div className="mt-2 flex flex-col gap-2 text-sm text-ink/90">
          {/* The single most common scoring error is anchoring on adult football.
              Saying this out loud is the cheapest defence against risk R-2. */}
          <p>
            Every level is written for <strong>ages 9–12</strong>. “Advanced”
            means advanced for a 10-year-old, not advanced for a professional.
          </p>
          <p>
            Score what you have seen <strong>across this session</strong>, not one
            moment. If a player sits between two levels, choose the lower one
            unless you have seen the higher hold up repeatedly.
          </p>
        </div>
      </details>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold">
          Player{" "}
          <span className="font-normal text-muted">
            — optional, jersey number is enough
          </span>
        </span>
        <input
          value={player}
          onChange={(e) => setPlayer(e.target.value)}
          placeholder="e.g. 7"
          inputMode="text"
          autoComplete="off"
          className="h-12 rounded-xl border-2 border-line bg-surface px-3 outline-none focus:border-brand focus:bg-bg"
        />
      </label>

      <ul className="flex flex-col gap-2.5">
        {LEVELS.map((key, i) => {
          const value = (i + 1) as LevelValue;
          const info = LEVEL_META[value];
          const active = selected === value;
          const colour = `var(--color-${key})`;

          return (
            <li key={key}>
              <button
                type="button"
                onClick={() => choose(value)}
                aria-pressed={active}
                className="w-full rounded-2xl border-2 p-3.5 text-left transition-colors active:scale-[0.995]"
                style={{
                  borderColor: active ? colour : "var(--color-line)",
                  background: active ? `${colour}14` : "var(--color-bg)",
                }}
              >
                <span className="flex items-center gap-2">
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ background: colour }}
                  >
                    {value}
                  </span>
                  <span className="font-bold" style={{ color: colour }}>
                    {info.label}
                  </span>
                  {active && (
                    <span className="ml-auto text-sm font-semibold" style={{ color: colour }}>
                      Selected
                    </span>
                  )}
                </span>
                {/* FR-5: the observable criteria, not just the label. */}
                <span className="mt-2 block text-[0.95rem] leading-relaxed text-ink/90">
                  {skill.rubric[key]}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div aria-live="polite" className="min-h-12">
        {saved && selected && (
          <div className="flex items-center justify-between rounded-2xl bg-surface p-3">
            <p className="text-sm">
              Saved{player.trim() ? ` for ${player.trim()}` : ""} on this phone.
            </p>
            <Link href="/session/" className="text-sm font-bold text-brand">
              View session
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-2 text-lg font-bold tracking-tight">{children}</h2>;
}

function BackGlyph() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M15 19l-7-7 7-7"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
