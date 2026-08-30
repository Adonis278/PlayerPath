"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Bottom navigation, not top. On a phone held one-handed the bottom third is the
 * only comfortably reachable area, and NFR-2 requires one-handed sideline use.
 * Targets are 56px tall - comfortably past the 48px floor, for cold hands.
 */

const ITEMS = [
  { href: "/", label: "Find", icon: SearchIcon },
  { href: "/browse", label: "Browse", icon: GridIcon },
  { href: "/session", label: "Assess", icon: ClipboardIcon },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  // The admin area is the owner's, not the coach's - no nav chrome there.
  if (pathname.startsWith("/admin")) return null;

  return (
    <nav
      className="sticky bottom-0 z-40 border-t border-line bg-bg/95 backdrop-blur safe-bottom"
      aria-label="Main"
    >
      <ul className="mx-auto flex max-w-lg">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex h-14 flex-col items-center justify-center gap-0.5 text-xs font-semibold transition-colors ${
                  active ? "text-brand" : "text-muted"
                }`}
              >
                <Icon active={active} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

type IconProps = { active?: boolean };

function SearchIcon({ active }: IconProps) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle
        cx="11"
        cy="11"
        r="7"
        stroke="currentColor"
        strokeWidth={active ? 2.4 : 2}
      />
      <path
        d="m20 20-3.5-3.5"
        stroke="currentColor"
        strokeWidth={active ? 2.4 : 2}
        strokeLinecap="round"
      />
    </svg>
  );
}

function GridIcon({ active }: IconProps) {
  const w = active ? 2.4 : 2;
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth={w} />
      <rect x="14" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth={w} />
      <rect x="3" y="14" width="7" height="7" rx="2" stroke="currentColor" strokeWidth={w} />
      <rect x="14" y="14" width="7" height="7" rx="2" stroke="currentColor" strokeWidth={w} />
    </svg>
  );
}

function ClipboardIcon({ active }: IconProps) {
  const w = active ? 2.4 : 2;
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9 4h6v3H9zM7 5H5.5A1.5 1.5 0 0 0 4 6.5v13A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5v-13A1.5 1.5 0 0 0 18.5 5H17"
        stroke="currentColor"
        strokeWidth={w}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M8 12h8M8 16h5" stroke="currentColor" strokeWidth={w} strokeLinecap="round" />
    </svg>
  );
}
