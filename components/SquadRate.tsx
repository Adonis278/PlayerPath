"use client";

import { useState, useSyncExternalStore } from "react";
import { scoreFor, scoreStore, upsertScore } from "@/lib/scores";
import { playerDisplayName, rosterStore, upsertPlayer } from "@/lib/roster";
import { LEVELS, LEVEL_META, type Rating } from "@/lib/types";

/**
 * Rate the whole squad on one skill.
 *
 * The one-player-through-many-skills flow (the Player field + single Assess
 * view) fits a coach reviewing one kid in depth. Real practice often runs the
 * other way: watch a drill, then rate everyone on THAT skill while it is fresh.
 * This view is built for that - a grid of the roster, tap a player to open a
 * compact rating chooser, pick a level, it collapses and the next player is
 * one tap away. No evidence or priority here on purpose, to keep pace with a
 * live drill; open that player individually from the roster for more detail.
 */
export function SquadRate({ subSkillId }: { subSkillId: string }) {
  const roster = useSyncExternalStore(
    rosterStore.subscribe,
    rosterStore.getSnapshot,
    rosterStore.getServerSnapshot,
  );
  const scores = useSyncExternalStore(
    scoreStore.subscribe,
    scoreStore.getSnapshot,
    scoreStore.getServerSnapshot,
  );

  const [openId, setOpenId] = useState<string | null>(null);
  const [addLabel, setAddLabel] = useState("");
  const [addName, setAddName] = useState("");

  function addPlayer() {
    if (!addLabel.trim()) return;
    const player = upsertPlayer({ label: addLabel, name: addName });
    setAddLabel("");
    setAddName("");
    setOpenId(player.id);
  }

  function rate(playerId: string, rating: Rating) {
    upsertScore({ subSkillId, rating, playerId });
    setOpenId(null);
  }

  return (
    <div className="flex flex-col gap-2">
      {roster.length === 0 && (
        <p className="rounded-2xl border border-line bg-surface p-4 text-sm text-muted">
          No players yet. Add your squad below, then tap a player to rate them
          on this skill.
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {roster.map((player) => {
          const existing = scoreFor(scores, subSkillId, player.id);
          const open = openId === player.id;
          const info = existing ? LEVEL_META[existing.rating] : null;
          const colour = info ? `var(--color-${info.key})` : undefined;

          return (
            <li key={player.id} className="rounded-2xl border border-line">
              <button
                type="button"
                onClick={() => setOpenId(open ? null : player.id)}
                aria-expanded={open}
                className="flex min-h-14 w-full items-center gap-3 px-3.5 py-3 text-left"
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-bold text-white"
                  style={{ background: colour ?? "var(--color-muted)" }}
                >
                  {existing?.rating ?? "–"}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">
                    {playerDisplayName(player)}
                  </span>
                  {player.name && (
                    <span className="block truncate text-sm text-muted">
                      #{player.label}
                    </span>
                  )}
                </span>
                <span className="text-muted">{open ? "▲" : "▼"}</span>
              </button>

              {open && (
                <div className="flex gap-1.5 px-3.5 pb-3.5">
                  {LEVELS.map((key, i) => {
                    const value = (i + 1) as Rating;
                    const active = existing?.rating === value;
                    const btnColour = `var(--color-${key})`;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => rate(player.id, value)}
                        aria-pressed={active}
                        className="flex h-11 flex-1 items-center justify-center rounded-xl border-2 text-sm font-bold"
                        style={{
                          borderColor: active ? btnColour : "var(--color-line)",
                          background: active ? btnColour : "var(--color-bg)",
                          color: active ? "#fff" : "var(--color-muted)",
                        }}
                        title={LEVEL_META[value].label}
                      >
                        {value}
                      </button>
                    );
                  })}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <div className="mt-1 flex gap-2">
        <input
          value={addLabel}
          onChange={(e) => setAddLabel(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addPlayer()}
          placeholder="Add player, e.g. 9"
          aria-label="New player label"
          className="h-11 flex-1 rounded-xl border-2 border-line bg-surface px-3 text-sm outline-none focus:border-brand focus:bg-bg"
        />
        <input
          value={addName}
          onChange={(e) => setAddName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addPlayer()}
          placeholder="Name (optional)"
          aria-label="New player name, optional"
          className="h-11 flex-1 rounded-xl border-2 border-line bg-surface px-3 text-sm outline-none focus:border-brand focus:bg-bg"
        />
        <button
          type="button"
          onClick={addPlayer}
          disabled={!addLabel.trim()}
          className="h-11 rounded-xl bg-brand px-4 text-sm font-semibold text-white disabled:opacity-50"
        >
          Add
        </button>
      </div>
    </div>
  );
}
