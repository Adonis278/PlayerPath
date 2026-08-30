"use client";

import { useSyncExternalStore } from "react";
import { currentPlayerStore, setCurrentPlayer } from "@/lib/current-player";
import { listPlayers, scoreStore } from "@/lib/scores";

/**
 * Who is being assessed. Shared across screens so a coach can work one player
 * through several sub-skills without retyping, and offers previously used labels
 * so the same player does not end up split across "7", "no.7" and "Seven".
 *
 * A jersey number is suggested over a name deliberately: nothing here is
 * uploaded, but the less identifying data sitting on a phone the better.
 */
export function PlayerField({ compact = false }: { compact?: boolean }) {
  const player = useSyncExternalStore(
    currentPlayerStore.subscribe,
    currentPlayerStore.getSnapshot,
    currentPlayerStore.getServerSnapshot,
  );
  const scores = useSyncExternalStore(
    scoreStore.subscribe,
    scoreStore.getSnapshot,
    scoreStore.getServerSnapshot,
  );

  const known = listPlayers(scores).filter(Boolean);

  return (
    <div className="flex flex-col gap-1.5">
      {!compact && (
        <span className="text-sm font-bold uppercase tracking-wide text-muted">
          Player
        </span>
      )}
      <input
        value={player}
        onChange={(e) => setCurrentPlayer(e.target.value)}
        list="playerpath-known-players"
        placeholder="Jersey number, e.g. 7"
        aria-label="Player being assessed"
        autoComplete="off"
        className="h-12 rounded-xl border-2 border-line bg-surface px-3 outline-none focus:border-brand focus:bg-bg"
      />
      <datalist id="playerpath-known-players">
        {known.map((p) => (
          <option key={p} value={p} />
        ))}
      </datalist>

      {known.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {known.slice(0, 6).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setCurrentPlayer(p)}
              className={`h-8 rounded-full border-2 px-3 text-sm font-semibold ${
                p === player
                  ? "border-brand bg-brand text-white"
                  : "border-line text-muted"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
