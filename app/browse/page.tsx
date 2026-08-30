"use client";

import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useContentDoc } from "@/components/ContentProvider";
import { SkillRow } from "@/components/SkillRow";
import { byPillar } from "@/lib/content";
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
    <main className="flex-1 px-4 pb-8 safe-top">
      <header className="pt-3 pb-4">
        <h1 className="text-3xl font-bold tracking-tight">Browse</h1>
        <p className="text-sm text-muted">
          {content.subSkills.length} sub-skills across five pillars
        </p>
      </header>

      <div className="flex flex-col gap-3">
        {PILLARS.map((pillar) => {
          const meta = PILLAR_META[pillar];
          const skills = byPillar(content, pillar);
          return (
            <Link
              key={pillar}
              href={`/browse/?pillar=${pillar}`}
              className="relative flex h-28 flex-col justify-end overflow-hidden rounded-2xl border border-line p-4 active:opacity-90"
            >
              <Image
                src={meta.img}
                alt=""
                fill
                sizes="(max-width: 512px) 100vw, 512px"
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
  const meta = PILLAR_META[pillar];
  const skills = byPillar(content, pillar);

  return (
    <main className="flex-1 pb-8">
      <header className="relative h-40 overflow-hidden safe-top">
        <Image
          src={meta.img}
          alt=""
          fill
          sizes="(max-width: 512px) 100vw, 512px"
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
            <h1 className="text-2xl font-bold text-white">{pillar}</h1>
            <p className="text-sm text-white/90">{meta.blurb}</p>
          </div>
        </div>
      </header>

      <div className="px-4 pt-4">
        <ul className="flex flex-col gap-2">
          {skills.map((s) => (
            <SkillRow key={s.id} skill={s} />
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
