"use client";

import Link from "next/link";
import { SkillIcon } from "./SkillIcon";
import { LEVEL_META, PILLAR_META, type Rating, type SubSkill } from "@/lib/types";

/**
 * One tappable sub-skill. 64px tall, well past the 48px minimum target.
 * When a rating exists for the current player it shows on the right, so a coach
 * working through a squad can see at a glance what is still outstanding.
 */
export function SkillRow({
  skill,
  rating,
  showPillar = true,
}: {
  skill: SubSkill;
  rating?: Rating;
  showPillar?: boolean;
}) {
  const meta = PILLAR_META[skill.pillar];
  const level = rating ? LEVEL_META[rating] : null;

  return (
    <li>
      <Link
        href={`/skill/?id=${encodeURIComponent(skill.id)}`}
        className="flex min-h-16 items-center gap-3 rounded-2xl border border-line bg-bg px-3 py-3 active:bg-surface"
      >
        <span
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ background: meta.tint, color: meta.accent }}
        >
          <SkillIcon name={skill.icon} size={22} />
        </span>

        <span className="min-w-0 flex-1">
          <span className="block font-semibold leading-tight">{skill.name}</span>
          <span className="block truncate text-sm text-muted">
            {skill.coachingCue}
          </span>
        </span>

        {level ? (
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
            style={{ background: `var(--color-${level.key})` }}
            title={level.label}
          >
            {rating}
          </span>
        ) : (
          showPillar && (
            <span
              className="shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold"
              style={{ background: meta.tint, color: meta.accent }}
            >
              {skill.pillar}
            </span>
          )
        )}
      </Link>
    </li>
  );
}
