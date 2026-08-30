"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useContentDoc } from "@/components/ContentProvider";
import { PlayerField } from "@/components/PlayerField";
import { SkillIcon } from "@/components/SkillIcon";
import { findSubSkill } from "@/lib/content";
import { currentPlayerStore } from "@/lib/current-player";
import {
  buildAssessment,
  clearScores,
  exportAsText,
  removeScore,
  scoreStore,
  type Assessment,
} from "@/lib/scores";
import {
  LEVEL_META,
  PILLAR_META,
  PRIORITY_META,
  type Priority,
  type Score,
} from "@/lib/types";

/**
 * The assessment profile: the workbook's "Assessment summary" made live.
 *
 * Overall average, overall level, skills assessed out of 21, and a per-pillar
 * breakdown. The framing throughout is a development profile, never a ranking -
 * that is an explicit instruction in the Scoring Framework sheet, and it is the
 * difference between a coaching tool and a talent-grading one.
 */
export default function SessionPage() {
  const { content } = useContentDoc();
  const scores = useSyncExternalStore(
    scoreStore.subscribe,
    scoreStore.getSnapshot,
    scoreStore.getServerSnapshot,
  );
  const player = useSyncExternalStore(
    currentPlayerStore.subscribe,
    currentPlayerStore.getSnapshot,
    currentPlayerStore.getServerSnapshot,
  );

  const [confirmClear, setConfirmClear] = useState(false);
  const [copied, setCopied] = useState(false);

  const assessment = useMemo(
    () => buildAssessment(content, scores, player),
    [content, scores, player],
  );

  async function share() {
    const text = exportAsText(assessment, content);
    try {
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

  const empty = assessment.assessed === 0;

  return (
    <main className="flex-1 px-4 pb-8 safe-top">
      <header className="pt-3 pb-4">
        <h1 className="text-3xl font-bold tracking-tight">Assessment</h1>
        <p className="text-sm text-muted">
          Saved on this phone · nothing uploaded
        </p>
      </header>

      <PlayerField />

      {empty ? (
        <div className="mt-5 rounded-2xl border border-line bg-surface p-6 text-center">
          <p className="font-semibold">
            {player.trim()
              ? `Nothing recorded for ${player.trim()} yet`
              : "No assessment started"}
          </p>
          <p className="mt-1 text-sm text-muted">
            Open a sub-skill and use the Assess tab. Rate only what you have
            actually seen — leaving a skill blank is a valid answer.
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
          <SummaryCard a={assessment} />
          <PillarBreakdown a={assessment} />
          <Priorities a={assessment} />
          <RatedSkills a={assessment} onRemove={removeScore} />

          <div className="mt-6 flex gap-2">
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
              Clear all
            </button>
          </div>

          {confirmClear && (
            <div className="mt-3 rounded-2xl border-2 border-developing bg-surface p-4">
              <p className="font-semibold">Clear every assessment on this phone?</p>
              <p className="mt-1 text-sm text-muted">
                This removes all players, not just {assessment.playerLabel}. It
                cannot be undone — export first if you want to keep it.
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    clearScores();
                    setConfirmClear(false);
                  }}
                  className="h-11 flex-1 rounded-xl bg-priority-high font-semibold text-white"
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

          <p className="mt-6 text-center text-xs leading-relaxed text-muted">
            Averages summarise the current profile. They are not a talent grade or
            a selection ranking.
          </p>
        </>
      )}
    </main>
  );
}

function SummaryCard({ a }: { a: Assessment }) {
  const level = a.overallLevel ? LEVEL_META[a.overallLevel] : null;
  const pct = Math.round((a.assessed / a.total) * 100);

  return (
    <section className="mt-5 rounded-2xl border border-line p-4">
      <div className="flex items-center gap-4">
        <div
          className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-2xl"
          style={{
            background: level ? `var(--color-${level.key})14` : "var(--color-surface)",
            color: level ? `var(--color-${level.key})` : "var(--color-muted)",
          }}
        >
          <span className="text-3xl font-bold leading-none">
            {a.overallAverage?.toFixed(1) ?? "—"}
          </span>
          <span className="text-[0.7rem] font-semibold uppercase tracking-wide">
            average
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xl font-bold leading-tight">
            {level?.label ?? "Not enough yet"}
          </p>
          <p className="mt-0.5 text-sm text-muted">
            {a.assessed} of {a.total} skills assessed
          </p>
          <div
            className="mt-2 h-2 overflow-hidden rounded-full bg-surface"
            role="progressbar"
            aria-valuenow={a.assessed}
            aria-valuemin={0}
            aria-valuemax={a.total}
            aria-label="Skills assessed"
          >
            <div
              className="h-full rounded-full bg-brand transition-[width]"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {level && (
        <p className="mt-3 text-sm leading-relaxed text-ink/90">{level.anchor}</p>
      )}
    </section>
  );
}

function PillarBreakdown({ a }: { a: Assessment }) {
  return (
    <section className="mt-5">
      <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted">
        By pillar
      </h2>
      <ul className="flex flex-col gap-2.5">
        {a.pillars.map((p) => {
          const meta = PILLAR_META[p.pillar];
          // Scale 1-4 across the bar; 1 is the floor, not zero.
          const pct = p.average === null ? 0 : ((p.average - 1) / 3) * 100;
          return (
            <li key={p.pillar} className="rounded-2xl border border-line p-3">
              <div className="flex items-baseline gap-2">
                <span className="flex-1 font-semibold">{p.pillar}</span>
                <span className="text-sm text-muted">
                  {p.assessed}/{p.total}
                </span>
                <span
                  className="w-9 text-right font-bold tabular-nums"
                  style={{ color: p.average === null ? "var(--color-muted)" : meta.accent }}
                >
                  {p.average?.toFixed(1) ?? "—"}
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface">
                <div
                  className="h-full rounded-full transition-[width]"
                  style={{ width: `${pct}%`, background: meta.accent }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Priorities({ a }: { a: Assessment }) {
  const groups: { key: Priority; scores: Score[] }[] = [
    { key: "high", scores: a.priorities.high },
    { key: "medium", scores: a.priorities.medium },
    { key: "maintain", scores: a.priorities.maintain },
  ];
  const { content } = useContentDoc();

  if (groups.every((g) => g.scores.length === 0)) return null;

  return (
    <section className="mt-5">
      <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted">
        Development focus
      </h2>
      <div className="flex flex-col gap-2">
        {groups
          .filter((g) => g.scores.length > 0)
          .map(({ key, scores }) => {
            const meta = PRIORITY_META[key];
            return (
              <div key={key} className="rounded-2xl border border-line p-3">
                <span
                  className="rounded-full px-2.5 py-1 text-xs font-bold text-white"
                  style={{ background: meta.colour }}
                >
                  {meta.label}
                </span>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {scores.map((s) => {
                    const skill = findSubSkill(content, s.subSkillId);
                    return (
                      <li key={s.id}>
                        <Link
                          href={`/skill/?id=${encodeURIComponent(s.subSkillId)}`}
                          className="inline-block rounded-full bg-surface px-3 py-1.5 text-sm font-medium"
                        >
                          {skill?.name ?? s.subSkillId}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
      </div>
    </section>
  );
}

function RatedSkills({
  a,
  onRemove,
}: {
  a: Assessment;
  onRemove: (id: string) => void;
}) {
  const { content } = useContentDoc();

  return (
    <section className="mt-5">
      <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted">
        Ratings
      </h2>
      <ul className="flex flex-col gap-2">
        {a.scores.map((s) => {
          const skill = findSubSkill(content, s.subSkillId);
          const info = LEVEL_META[s.rating];
          const colour = `var(--color-${info.key})`;
          return (
            <li key={s.id} className="rounded-2xl border border-line p-3">
              <div className="flex items-center gap-3">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-bold text-white"
                  style={{ background: colour }}
                >
                  {s.rating}
                </span>
                <Link
                  href={`/skill/?id=${encodeURIComponent(s.subSkillId)}`}
                  className="min-w-0 flex-1"
                >
                  <span className="flex items-center gap-1.5">
                    {skill && (
                      <span style={{ color: PILLAR_META[skill.pillar].accent }}>
                        <SkillIcon name={skill.icon} size={16} />
                      </span>
                    )}
                    <span className="truncate font-semibold">
                      {skill?.name ?? s.subSkillId}
                    </span>
                  </span>
                  <span className="block text-sm" style={{ color: colour }}>
                    {info.label}
                  </span>
                </Link>
                {s.priority && (
                  <span
                    className="shrink-0 rounded-full px-2 py-0.5 text-xs font-bold text-white"
                    style={{ background: PRIORITY_META[s.priority].colour }}
                  >
                    {PRIORITY_META[s.priority].label}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => onRemove(s.id)}
                  aria-label={`Remove rating for ${skill?.name ?? "skill"}`}
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
              </div>
              {s.evidence && (
                <p className="mt-2 border-l-2 border-line pl-3 text-sm italic text-ink/80">
                  {s.evidence}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
