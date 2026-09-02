"use client";

import { Suspense, useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useContentDoc } from "@/components/ContentProvider";
import { SkillIcon } from "@/components/SkillIcon";
import { PlayerField } from "@/components/PlayerField";
import { findSubSkill } from "@/lib/content";
import { pushRecent } from "@/lib/recents";
import { currentPlayerIdStore } from "@/lib/current-player";
import { SquadRate } from "@/components/SquadRate";
import { clearRating, scoreFor, scoreStore, upsertScore } from "@/lib/scores";
import {
  LEVELS,
  LEVEL_META,
  PILLAR_META,
  PRIORITIES,
  PRIORITY_META,
  SCORING_RULES,
  type Priority,
  type Rating,
  type Score,
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
        className="px-4 pb-4 pt-3 safe-top md:px-6 md:pb-6"
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
        <div className="mt-2 flex items-center gap-3">
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-bg"
            style={{ color: meta.accent }}
          >
            <SkillIcon name={skill.icon} size={26} />
          </span>
          <h1 className="text-3xl font-bold leading-tight tracking-tight md:text-4xl">
            {skill.name}
          </h1>
        </div>
      </header>

      {/* Tabs are a small-screen affordance. From lg there is room to show
          coaching content and the rubric together, which is how a coach actually
          uses them - reading the anchor while looking at what good looks like. */}
      <div
        role="tablist"
        aria-label="Skill view"
        className="sticky top-0 z-30 flex border-b border-line bg-bg/95 backdrop-blur lg:hidden"
      >
        <TabButton active={tab === "coach"} onClick={() => setTab("coach")}>
          Coach it
        </TabButton>
        <TabButton active={tab === "assess"} onClick={() => setTab("assess")}>
          Assess
        </TabButton>
      </div>

      {/*
        Each panel is mounted exactly once and hidden with CSS rather than
        rendered twice per breakpoint - two live copies of the Assess panel would
        mean two copies of the evidence field's local state.
      */}
      <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-8 lg:px-6 lg:pt-2">
        <div className={tab === "coach" ? undefined : "hidden lg:block"}>
          <CoachTab skill={skill} accent={meta.accent} />
        </div>
        <div className={tab === "assess" ? undefined : "hidden lg:block"}>
          <AssessTab skill={skill} />
        </div>
      </div>
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
      className={`flex-1 border-b-[3px] py-3.5 text-base font-semibold transition-colors ${
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
    <div className="flex flex-col gap-6 px-4 pt-5 lg:px-0">
      {/* The cue comes first and largest: it is the thing a coach says in the
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
        <SectionTitle>Activities</SectionTitle>
        <ul className="flex flex-wrap gap-2">
          {skill.activities.map((a, i) => (
            <li
              key={i}
              className="rounded-full border border-line bg-surface px-3 py-1.5 text-sm"
            >
              {a}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <SectionTitle>Ways to improve</SectionTitle>
        <ul className="flex flex-col gap-2">
          {skill.waysToImprove.map((w, i) => (
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
              <span className="text-[0.95rem] leading-relaxed">{w}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

/* ---------------- Assess ---------------- */

function AssessTab({ skill }: { skill: SubSkill }) {
  const [mode, setMode] = useState<"player" | "squad">("player");
  const playerId = useSyncExternalStore(
    currentPlayerIdStore.subscribe,
    currentPlayerIdStore.getSnapshot,
    currentPlayerIdStore.getServerSnapshot,
  );
  const scores = useSyncExternalStore(
    scoreStore.subscribe,
    scoreStore.getSnapshot,
    scoreStore.getServerSnapshot,
  );

  // Derived from the store, so switching skill or player needs no effect to
  // resynchronise - the right answer falls out of the current render.
  const existing = scoreFor(scores, skill.id, playerId);
  const rating = existing?.rating ?? null;

  return (
    <div className="flex flex-col gap-5 px-4 pt-5 lg:px-0">
      {/*
        Two real coaching workflows, not one screen forced to serve both: one
        player through many skills (Player), or one skill across the whole
        squad while a drill is fresh (Squad).
      */}
      <div role="tablist" aria-label="Assess mode" className="flex gap-2">
        <ModePill active={mode === "player"} onClick={() => setMode("player")}>
          This player
        </ModePill>
        <ModePill active={mode === "squad"} onClick={() => setMode("squad")}>
          Squad
        </ModePill>
      </div>

      {mode === "squad" ? (
        <SquadRate subSkillId={skill.id} />
      ) : (
        <PlayerAssess skill={skill} playerId={playerId} existing={existing} rating={rating} />
      )}
    </div>
  );
}

function ModePill({
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
      className={`h-10 flex-1 rounded-xl text-sm font-bold ${
        active ? "bg-brand text-white" : "bg-surface text-muted"
      }`}
    >
      {children}
    </button>
  );
}

function PlayerAssess({
  skill,
  playerId,
  existing,
  rating,
}: {
  skill: SubSkill;
  playerId: string;
  existing: Score | undefined;
  rating: Rating | null;
}) {
  return (
    <>
      <PlayerField />
      <ScoringRules />

      <section>
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted">
          Rating
        </h2>
        <ul className="flex flex-col gap-2.5">
          {LEVELS.map((key, i) => {
            const value = (i + 1) as Rating;
            const info = LEVEL_META[value];
            const active = rating === value;
            const colour = `var(--color-${key})`;

            return (
              <li key={key}>
                <button
                  type="button"
                  onClick={() =>
                    upsertScore({
                      subSkillId: skill.id,
                      rating: value,
                      evidence: existing?.evidence,
                      priority: existing?.priority,
                      playerId: playerId || undefined,
                    })
                  }
                  aria-pressed={active}
                  className="w-full rounded-2xl border-2 p-3.5 text-left"
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
                      <span
                        className="ml-auto text-sm font-semibold"
                        style={{ color: colour }}
                      >
                        Selected
                      </span>
                    )}
                  </span>
                  {/* The skill-specific anchor, not just the level label (FR-5). */}
                  <span className="mt-2 block text-[0.95rem] leading-relaxed text-ink/90">
                    {skill.rubric[key]}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {/*
          "No forced score" is an explicit rule in the workbook, so not-observed
          must be reachable in one tap rather than only by never touching the
          screen. Clearing removes the record so it cannot drag averages down.
        */}
        <button
          type="button"
          onClick={() => clearRating(skill.id, playerId || undefined)}
          disabled={rating === null}
          className="mt-2.5 h-12 w-full rounded-2xl border-2 border-dashed border-line text-sm font-semibold text-muted disabled:opacity-50"
        >
          {rating === null ? "Not observed yet" : "Clear rating — not observed"}
        </button>
      </section>

      {existing && (
        <EvidenceAndPriority skill={skill} playerId={playerId || undefined} existing={existing} />
      )}
    </>
  );
}

function EvidenceAndPriority({
  skill,
  playerId,
  existing,
}: {
  skill: SubSkill;
  playerId: string | undefined;
  existing: { rating: Rating; evidence?: string; priority?: Priority };
}) {
  const [evidence, setEvidence] = useState(existing.evidence ?? "");

  // Keep the textarea in step when the coach switches player or skill, without
  // an effect: adjust during render when the identity key changes.
  const key = `${skill.id}|${playerId ?? ""}`;
  const [lastKey, setLastKey] = useState(key);
  if (lastKey !== key) {
    setLastKey(key);
    setEvidence(existing.evidence ?? "");
  }

  const save = (patch: { evidence?: string; priority?: Priority }) =>
    upsertScore({
      subSkillId: skill.id,
      rating: existing.rating,
      evidence: "evidence" in patch ? patch.evidence : evidence,
      priority: "priority" in patch ? patch.priority : existing.priority,
      playerId,
    });

  return (
    <>
      <section>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-bold uppercase tracking-wide text-muted">
            Evidence
          </span>
          <span className="-mt-1 text-sm text-muted">
            One brief thing you actually saw.
          </span>
          <textarea
            rows={3}
            value={evidence}
            onChange={(e) => setEvidence(e.target.value)}
            onBlur={() => save({ evidence })}
            placeholder="e.g. Took two touches away from pressure twice in the 4v4"
            className="rounded-xl border-2 border-line bg-surface p-3 text-[0.95rem] outline-none focus:border-brand focus:bg-bg"
          />
        </label>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted">
          Priority
        </h2>
        <div className="flex gap-2">
          {PRIORITIES.map((p) => {
            const active = existing.priority === p;
            const meta = PRIORITY_META[p];
            return (
              <button
                key={p}
                type="button"
                onClick={() => save({ priority: active ? undefined : p })}
                aria-pressed={active}
                className="h-12 flex-1 rounded-xl border-2 text-sm font-bold"
                style={{
                  borderColor: active ? meta.colour : "var(--color-line)",
                  background: active ? meta.colour : "var(--color-bg)",
                  color: active ? "#fff" : "var(--color-muted)",
                }}
              >
                {meta.label}
              </button>
            );
          })}
        </div>
      </section>

      <Link
        href="/session/"
        className="flex h-12 items-center justify-center rounded-xl bg-brand font-semibold text-white"
      >
        View assessment
      </Link>
    </>
  );
}

function ScoringRules() {
  return (
    <details className="rounded-2xl border border-line bg-surface p-3">
      <summary className="cursor-pointer text-sm font-semibold">
        How to score this
      </summary>
      <div className="mt-3 flex flex-col gap-3">
        <p className="text-sm text-ink/90">
          Score observed football behaviour — not personality, potential, or
          comparison with other children.
        </p>
        {SCORING_RULES.map((r) => (
          <div key={r.title}>
            <p className="text-sm font-bold">{r.title}</p>
            <p className="text-sm text-ink/90">{r.body}</p>
          </div>
        ))}
      </div>
    </details>
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
