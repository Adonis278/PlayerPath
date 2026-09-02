"use client";

import { useState, useSyncExternalStore } from "react";
import { currentPlayerIdStore, setCurrentPlayerId } from "@/lib/current-player";
import { findPlayer, playerDisplayName, rosterStore, upsertPlayer } from "@/lib/roster";

/**
 * Who is being assessed one-on-one. Shared across screens via currentPlayerId,
 * so a coach can work one player through several sub-skills without retyping.
 *
 * Label (jersey number) is the primary, always-visible field - that alone is
 * enough to use the app. Name is optional and secondary: some coaches want to
 * know who they scored later, but nothing here requires it, and a jersey number
 * alone keeps the identifying footprint smaller.
 */
export function PlayerField() {
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

  const current = findPlayer(roster, playerId);

  // Local drafts so typing does not create a roster entry on every keystroke -
  // only on blur, once the coach has settled on a value.
  const [labelDraft, setLabelDraft] = useState<string | null>(null);
  const [nameDraft, setNameDraft] = useState<string | null>(null);
  const label = labelDraft ?? current?.label ?? "";
  const name = nameDraft ?? current?.name ?? "";

  function commit(nextLabel: string, nextName: string) {
    setLabelDraft(null);
    setNameDraft(null);
    if (!nextLabel.trim()) {
      setCurrentPlayerId("");
      return;
    }
    const player = upsertPlayer({ id: current?.id, label: nextLabel, name: nextName });
    setCurrentPlayerId(player.id);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-bold uppercase tracking-wide text-muted">
        Player
      </span>

      <input
        value={label}
        onChange={(e) => setLabelDraft(e.target.value)}
        onBlur={() => commit(label, name)}
        placeholder="Jersey number, e.g. 7"
        aria-label="Player label"
        autoComplete="off"
        className="h-12 rounded-xl border-2 border-line bg-surface px-3 outline-none focus:border-brand focus:bg-bg"
      />

      <input
        value={name}
        onChange={(e) => setNameDraft(e.target.value)}
        onBlur={() => commit(label, name)}
        placeholder="Name (optional)"
        aria-label="Player name, optional"
        autoComplete="off"
        className="h-11 rounded-xl border-2 border-line bg-surface px-3 text-sm outline-none focus:border-brand focus:bg-bg"
      />

      {roster.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {roster.slice(0, 8).map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setCurrentPlayerId(p.id)}
              className={`h-8 rounded-full border-2 px-3 text-sm font-semibold ${
                p.id === playerId
                  ? "border-brand bg-brand text-white"
                  : "border-line text-muted"
              }`}
            >
              {playerDisplayName(p)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
