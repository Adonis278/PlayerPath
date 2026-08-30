"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Navigation adapts to the device rather than scaling one layout up.
 *
 * Phone: a bottom tab bar. On a phone held one-handed the bottom third is the
 * only comfortably reachable area, which NFR-2 requires for sideline use.
 *
 * Tablet and desktop: a left rail. A bottom bar on an iPad is both unreachable
 * (the thumb never goes there when the device is held two-handed or propped on a
 * table) and a waste of the horizontal space that makes a tablet useful.
 */

const ITEMS = [
  { href: "/", label: "Find", icon: SearchIcon },
  { href: "/browse", label: "Browse", icon: GridIcon },
  { href: "/session", label: "Assess", icon: ClipboardIcon },
] as const;

function useActive() {
  const pathname = usePathname();
  return (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function SideNav() {
  const pathname = usePathname();
  const isActive = useActive();

  if (pathname.startsWith("/admin")) return null;

  return (
    <aside className="sticky top-0 hidden h-dvh w-56 shrink-0 flex-col border-r border-line px-3 py-5 md:flex lg:w-64">
      <Link href="/" className="mb-6 flex items-center gap-2 px-2">
        <Logo />
        <span className="text-xl font-bold tracking-tight">PlayerPath</span>
      </Link>

      <nav aria-label="Main">
        <ul className="flex flex-col gap-1">
          {ITEMS.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex h-12 items-center gap-3 rounded-xl px-3 font-semibold transition-colors ${
                    active
                      ? "bg-brand/10 text-brand"
                      : "text-muted hover:bg-surface hover:text-ink"
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

      <p className="mt-auto px-3 text-xs leading-relaxed text-muted">
        Assessments stay on this device. Nothing is uploaded.
      </p>
    </aside>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const isActive = useActive();

  if (pathname.startsWith("/admin")) return null;

  return (
    <nav
      className="sticky bottom-0 z-40 border-t border-line bg-bg/95 backdrop-blur safe-bottom md:hidden"
      aria-label="Main"
    >
      <ul className="mx-auto flex max-w-lg">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
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

function Logo() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
      <rect width="28" height="28" rx="7" fill="var(--color-brand)" />
      <path
        d="M6 19.5 L11 14 L14 17 L21.5 8.5"
        fill="none"
        stroke="#fff"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="21.5" cy="8.5" r="2.2" fill="#8ef0bd" />
    </svg>
  );
}

type IconProps = { active?: boolean };

function SearchIcon({ active }: IconProps) {
  const w = active ? 2.4 : 2;
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth={w} />
      <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth={w} strokeLinecap="round" />
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
