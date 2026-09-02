"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { SkillIcon } from "./SkillIcon";
import {
  markOnboarded,
  onboardedStore,
  subscribeReopenOnboarding,
} from "@/lib/onboarding";
import {
  installPromptStore,
  isIOS,
  isStandalone,
  promptInstall,
} from "@/lib/install-prompt";
import { LEVEL_META, LEVELS, PILLARS, PILLAR_META, type Rating } from "@/lib/types";

const PILLAR_ICON: Record<(typeof PILLARS)[number], string> = {
  Technical: "arrow-back-up",
  Tactical: "map-pin",
  Physical: "activity",
  Mental: "focus-2",
  Social: "message-2",
};

/**
 * First-run intro. Shown once, skippable at every step, reopenable later via
 * the "How this works" link on the home screen. Content deliberately mirrors
 * what already lives on the Assess tab's "How to score this" disclosure
 * (same LEVEL_META / age framing) rather than inventing new copy, so a coach
 * who skips this and reads it later on the skill screen sees the same rules.
 */
export function Onboarding() {
  const pathname = usePathname();
  const onboarded = useSyncExternalStore(
    onboardedStore.subscribe,
    onboardedStore.getSnapshot,
    onboardedStore.getServerSnapshot,
  );
  const [forceOpen, setForceOpen] = useState(false);

  useEffect(() => subscribeReopenOnboarding(() => setForceOpen(true)), []);

  // This is a coach-facing intro. The owner may land on /admin before ever
  // opening a coach screen, and should never see it block the sign-in form.
  if (pathname.startsWith("/admin")) return null;

  const visible = forceOpen || !onboarded;
  if (!visible) return null;

  return (
    <Cards
      onClose={() => {
        markOnboarded();
        setForceOpen(false);
      }}
    />
  );
}

function Cards({ onClose }: { onClose: () => void }) {
  // Cards only ever mounts client-side (gated by the store checks in
  // Onboarding above, which are never true during the static prerender), so a
  // lazy initializer is safe here - no hydration mismatch to worry about.
  const [alreadyInstalled] = useState(isStandalone);

  // The install card only earns its place if there is something to do with it.
  const showInstallCard = !alreadyInstalled;
  const steps = showInstallCard ? 4 : 3;
  const [step, setStep] = useState(0);

  const isLast = step === steps - 1;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-bg safe-top safe-bottom">
      <div className="flex items-center justify-between px-4 pt-3">
        <div className="flex gap-1.5" role="progressbar" aria-valuenow={step + 1} aria-valuemax={steps}>
          {Array.from({ length: steps }).map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-6 rounded-full ${i <= step ? "bg-brand" : "bg-line"}`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-sm font-semibold text-muted"
        >
          Skip
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6">
        {step === 0 && <WelcomeCard />}
        {step === 1 && <ScoringCard />}
        {step === 2 && <PrivacyCard />}
        {step === 3 && showInstallCard && <InstallCard />}
      </div>

      <div className="px-5 pb-6">
        <button
          type="button"
          onClick={() => (isLast ? onClose() : setStep((s) => s + 1))}
          className="flex h-13 w-full items-center justify-center rounded-2xl bg-brand text-base font-bold text-white"
        >
          {isLast ? "Get started" : "Next"}
        </button>
      </div>
    </div>
  );
}

function WelcomeCard() {
  return (
    <div className="mx-auto flex h-full max-w-sm flex-col justify-center">
      <h1 className="text-3xl font-bold tracking-tight">Welcome to PlayerPath</h1>
      <p className="mt-2 text-ink/80">
        A coaching reference and player assessment tool for ages 9–12, built
        around five development pillars.
      </p>
      <ul className="mt-6 grid grid-cols-2 gap-2.5">
        {PILLARS.map((pillar) => {
          const meta = PILLAR_META[pillar];
          return (
            <li
              key={pillar}
              className="flex items-center gap-2.5 rounded-2xl border border-line p-3"
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                style={{ background: meta.tint, color: meta.accent }}
              >
                <SkillIcon name={PILLAR_ICON[pillar]} size={18} />
              </span>
              <span className="font-semibold">{pillar}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ScoringCard() {
  return (
    <div className="mx-auto flex h-full max-w-sm flex-col justify-center">
      <h1 className="text-2xl font-bold tracking-tight">How scoring works</h1>
      <p className="mt-2 text-ink/80">
        Rate what you have actually seen, on a 4-level scale written for this
        age group specifically.
      </p>

      <ul className="mt-4 flex flex-col gap-2">
        {LEVELS.map((key, i) => {
          const value = (i + 1) as Rating;
          const info = LEVEL_META[value];
          return (
            <li
              key={key}
              className="flex items-center gap-3 rounded-xl border border-line p-2.5"
            >
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ background: `var(--color-${key})` }}
              >
                {value}
              </span>
              <span className="font-semibold" style={{ color: `var(--color-${key})` }}>
                {info.label}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 flex flex-col gap-2 text-sm text-ink/80">
        <p>
          <strong>Advanced means advanced for a 10-year-old</strong>, not for a
          professional.
        </p>
        <p>
          Not sure? <strong>Leave it blank</strong> rather than guessing - that
          is a valid answer.
        </p>
        <p>
          Between two levels? <strong>Score the lower one</strong> unless
          you&apos;ve seen the higher one hold up repeatedly.
        </p>
      </div>
    </div>
  );
}

function PrivacyCard() {
  return (
    <div className="mx-auto flex h-full max-w-sm flex-col justify-center">
      <h1 className="text-2xl font-bold tracking-tight">Stays on this device</h1>
      <p className="mt-2 text-ink/80">
        No account, and nothing you record is uploaded anywhere. A player is
        identified by a jersey number - a name is optional, and only ever
        stored on your own phone or tablet.
      </p>
      <p className="mt-4 text-ink/80">
        Since it never leaves this device, use{" "}
        <strong>Export on the Assess screen</strong> after a session if you
        want a backup or want to share it yourself.
      </p>
    </div>
  );
}

function InstallCard() {
  const [busy, setBusy] = useState(false);
  const ios = isIOS();
  const installReady = useSyncExternalStore(
    installPromptStore.subscribe,
    installPromptStore.getSnapshot,
    installPromptStore.getServerSnapshot,
  );

  return (
    <div className="mx-auto flex h-full max-w-sm flex-col justify-center">
      <h1 className="text-2xl font-bold tracking-tight">Add it to your home screen</h1>
      <p className="mt-2 text-ink/80">
        Installing makes PlayerPath open like an app and work without signal
        on the sideline.
      </p>

      {ios ? (
        <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4">
          <Step n={1}>
            Tap the <ShareGlyph /> Share icon in Safari&apos;s toolbar
          </Step>
          <Step n={2}>Scroll down and tap &quot;Add to Home Screen&quot;</Step>
          <Step n={3}>Tap &quot;Add&quot; to confirm</Step>
        </div>
      ) : installReady ? (
        <button
          type="button"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            await promptInstall();
            setBusy(false);
          }}
          className="mt-5 h-12 rounded-2xl bg-brand font-semibold text-white disabled:opacity-60"
        >
          {busy ? "Opening…" : "Install PlayerPath"}
        </button>
      ) : (
        <p className="mt-5 rounded-2xl border border-line bg-surface p-4 text-sm text-ink/80">
          Look for &quot;Install app&quot; or &quot;Add to Home Screen&quot; in
          your browser&apos;s menu.
        </p>
      )}

      <p className="mt-4 text-sm text-muted">
        You can always do this later from the same menu.
      </p>
    </div>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
        {n}
      </span>
      <span className="text-sm text-ink/90">{children}</span>
    </div>
  );
}

function ShareGlyph() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      className="inline-block align-[-2px]"
      aria-hidden="true"
    >
      <path
        d="M12 3v12M8 7l4-4 4 4M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
