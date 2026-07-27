"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import type { StatusMap, AyahState } from "@minhaj/core";
import { gid, SURAHS } from "@minhaj/core";

// Seed demo data matching AyahTracker.jsx seed()
function seed(): StatusMap {
  const m: Record<string, { state: AyahState }> = {};
  const set = (s: number, from: number, to: number, st: AyahState) => {
    for (let a = from; a <= to; a++) m[String(gid(s, a))] = { state: st };
  };
  set(1, 1, 7, "mastered");
  for (let s = 108; s <= 114; s++)
    set(s, 1, SURAHS[s - 1][1], s === 111 ? "stumbled" : "mastered");
  set(78, 1, 20, "memorized");
  set(78, 7, 9, "learning");
  m[String(gid(78, 5))] = { state: "due" };
  set(67, 1, 15, "memorized");
  m[String(gid(67, 3))] = { state: "stumbled" };
  m[String(gid(67, 8))] = { state: "due" };
  set(112, 1, 4, "mastered");
  set(36, 1, 12, "learning");
  return m as StatusMap;
}

export function useStatus() {
  const [status, setStatus] = useState<StatusMap>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<StatusMap>({});
  const initialized = useRef(false);

  // On mount: check auth, load from DB or fallback to seed
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    fetch("/api/auth/me")
      .then((r) => r.json())
      .then(({ user }) => {
        if (user) {
          setIsLoggedIn(true);
          return fetch("/api/progress")
            .then((r) => r.json())
            .then((data) => {
              setStatus(data as StatusMap);
              setIsLoaded(true);
            });
        } else {
          // Not logged in — use seed data from localStorage if available
          try {
            const saved = window.localStorage.getItem("minhaj-status");
            setStatus(saved ? JSON.parse(saved) : seed());
          } catch {
            setStatus(seed());
          }
          setIsLoaded(true);
        }
      })
      .catch(() => {
        try {
          const saved = window.localStorage.getItem("minhaj-status");
          setStatus(saved ? JSON.parse(saved) : seed());
        } catch {
          setStatus(seed());
        }
        setIsLoaded(true);
      });
  }, []);

  // Debounced DB save
  const scheduleSave = useCallback((updated: StatusMap) => {
    if (!isLoggedIn) {
      try { window.localStorage.setItem("minhaj-status", JSON.stringify(updated)); } catch {}
      return;
    }
    pendingRef.current = updated;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const snap = pendingRef.current;
      const rows = Object.entries(snap).map(([id, v]) => ({
        ayahId: parseInt(id, 10),
        state: v.state,
        box: v.box ?? 0,
        dueDate: v.dueDate,
      }));
      if (rows.length === 0) return;
      fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rows),
      }).catch(console.error);
    }, 500);
  }, [isLoggedIn]);

  const updateStatus = useCallback((updater: (prev: StatusMap) => StatusMap) => {
    setStatus((prev) => {
      const next = updater(prev);
      scheduleSave(next);
      return next;
    });
  }, [scheduleSave]);

  const getState = (id: number): AyahState => (status[id]?.state ?? "new") as AyahState;

  const cycleState = (id: number) => {
    updateStatus((prev) => {
      const cycle: AyahState[] = ["new", "learning", "memorized", "mastered"];
      const cur: AyahState = (prev[id]?.state ?? "new") as AyahState;
      const idx = cycle.indexOf(cur);
      const nxt: AyahState = idx === -1 ? "new" : cycle[(idx + 1) % cycle.length];
      return { ...prev, [id]: { ...(prev[id] ?? {}), state: nxt } };
    });
  };

  const rateAyah = (id: number, rating: "mastered" | "stumbled" | "forgot", today: string) => {
    updateStatus((prev) => {
      const cur = prev[id] ?? { state: "memorized" as AyahState };
      const box = cur.box ?? 0;
      const INTERVALS = [1, 3, 7, 14, 30, 60];
      const addDays = (d: string, n: number) => {
        const dt = new Date(d);
        dt.setUTCDate(dt.getUTCDate() + n);
        return dt.toISOString().slice(0, 10);
      };
      if (rating === "forgot") {
        return { ...prev, [id]: { ...cur, state: "due", box: 0, dueDate: addDays(today, 1), lastReviewed: today } };
      }
      const nextBox = rating === "mastered" ? Math.min(box + 1, 5) : box;
      return {
        ...prev,
        [id]: {
          ...cur,
          state: nextBox >= 5 ? "mastered" : "memorized",
          box: nextBox,
          dueDate: addDays(today, INTERVALS[nextBox]),
          lastReviewed: today,
        },
      };
    });
  };

  return { status, getState, cycleState, rateAyah, isLoaded, isLoggedIn };
}
