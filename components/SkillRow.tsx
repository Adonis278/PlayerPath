"use client";

import Link from "next/link";
import { PILLAR_META, type SubSkill } from "@/lib/types";

/** One tappable sub-skill. 64px tall, well past the 48px minimum target. */
export function SkillRow({ skill }: { skill: SubSkill }) {
  const meta = PILLAR_META[skill.pillar];

  return (
    <li>
      <Link
        href={`/skill/?id=${encodeURIComponent(skill.id)}`}
        className="flex min-h-16 items-center gap-3 rounded-2xl border border-line bg-bg px-4 py-3 active:bg-surface"
      >
        <span
          aria-hidden="true"
          className="h-9 w-1.5 shrink-0 rounded-full"
          style={{ background: meta.accent }}
        />
        <span className="min-w-0 flex-1">
          <span className="block font-semibold leading-tight">{skill.name}</span>
          <span className="block truncate text-sm text-muted">
            {skill.coachingCue}
          </span>
        </span>
        <span
          className="shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold"
          style={{ background: meta.tint, color: meta.accent }}
        >
          {skill.pillar}
        </span>
      </Link>
    </li>
  );
}
