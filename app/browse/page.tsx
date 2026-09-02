"use client";

import { Suspense, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useContentDoc } from "@/components/ContentProvider";
import { SkillRow } from "@/components/SkillRow";
import { byPillar } from "@/lib/content";
import { currentPlayerIdStore } from "@/lib/current-player";
import { findPlayer, playerDisplayName, rosterStore } from "@/lib/roster";
import { scoreFor, scoreStore } from "@/lib/scores";
import { PILLARS, PILLAR_META, type Pillar } from "@/lib/types";

export default function BrowsePage() {
  return (
    // useSearchParams needs a Suspense boundary under static export.
    <Suspense fallback={<div className="p-4 text-muted">Loading…</div>}>
      <Browse />
    </Suspense>
  );
}

function Browse() {
  const params = useSearchParams();
  const raw = params.get("pillar");
  const pillar = PILLARS.includes(raw as Pillar) ? (raw as Pillar) : null;

  return pillar ? <PillarView pillar={pillar} /> : <AllPillars />;
}

function AllPillars() {
  const { content } = useContentDoc();

  return (
    <main className="flex-1 px-4 pb-8 safe-top md:px-6 md:pb-12">
      <header className="pt-3 pb-4 md:pt-8">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Browse</h1>
        <p className="text-sm text-muted">
          {content.subSkills.length} sub-skills across five pillars
        </p>
      </header>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {PILLARS.map((pillar) => {
          const meta = PILLAR_META[pillar];
          const skills = byPillar(content, pillar);
          return (
            <Link
              key={pillar}
              href={`/browse/?pillar=${pillar}`}
              className="relative flex h-28 flex-col justify-end overflow-hidden rounded-2xl border border-line p-4 active:opacity-90 md:h-44"
            >
              <Image
                src={meta.img}
                alt=""
                fill
                sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw"
                className="object-cover"
              />
              <span
                aria-hidden="true"
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(0,0,0,.84) 0%, rgba(0,0,0,.42) 55%, rgba(0,0,0,.08) 100%)",
                }}
              />
              <span
                aria-hidden="true"
                className="absolute left-4 top-3 h-2 w-10 rounded-full"
                style={{ background: meta.accent }}
              />
              <span className="relative text-xl font-bold text-white">{pillar}</span>
              <span className="relative text-sm text-white/85">
                {meta.blurb} · {skills.length} skills
              </span>
            </Link>
          );
        })}
      </div>
    </main>
  );
}

function PillarView({ pillar }: { pillar: Pillar }) {
  const { content } = useContentDoc();
  const scores = useSyncExternalStore(
    scoreStore.subscribe,
    scoreStore.getSnapshot,
    scoreStore.getServerSnapshot,
  );
  const playerId = useSyncExternalStore(
    currentPlayerIdStore.subscribe,
    currentPlayerIdStore.getSnapshot,
    currentPlayerIdStore.getServerSnapshot,
  );
  const roster = useSyncExternalStore(
    rosterStore.subscribe,
    rosterStore.getSnapshot,
    rosterStore.getServerSnapshot,
  );
  const player = findPlayer(roster, playerId);
  const meta = PILLAR_META[pillar];
  const skills = byPillar(content, pillar);
  const rated = skills.filter((s) => scoreFor(scores, s.id, playerId)).length;

  return (
    <main className="flex-1 pb-8">
      <header className="relative h-40 overflow-hidden safe-top md:h-56">
        <Image
          src={meta.img}
          alt=""
          fill
          sizes="(max-width: 767px) 100vw, 1024px"
          priority
          className="object-cover"
        />
        <span
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,.8) 0%, rgba(0,0,0,.34) 55%, rgba(0,0,0,.1) 100%)",
          }}
        />
        <div className="relative flex h-full flex-col justify-between p-4">
          <Link
            href="/browse/"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur"
            aria-label="Back to all pillars"
          >
            <BackGlyph />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white md:text-4xl">{pillar}</h1>
            <p className="text-sm text-white/90">{meta.blurb}</p>
          </div>
        </div>
      </header>

      <div className="px-4 pt-4 md:px-6 md:pt-6">
        {player && (
          <p className="mb-2 text-sm text-muted">
            {rated} of {skills.length} assessed for {playerDisplayName(player)}
          </p>
        )}
        <ul className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {skills.map((s) => (
            <SkillRow
              key={s.id}
              skill={s}
              rating={scoreFor(scores, s.id, playerId)?.rating}
              showPillar={false}
            />
          ))}
        </ul>
        {skills.length === 0 && (
          <p className="rounded-2xl border border-line bg-surface p-6 text-center text-muted">
            No sub-skills in this pillar yet.
          </p>
        )}
      </div>
    </main>
  );
}

function BackGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
