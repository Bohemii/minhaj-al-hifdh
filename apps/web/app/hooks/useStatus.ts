"use client";
import { useLocalStorage } from "./useLocalStorage";
import type { StatusMap, AyahState } from "@minhaj/core";
import { gid, SURAHS } from "@minhaj/core";

// Seed demo data matching AyahTracker.jsx seed()
function seed(): Record<string, { state: AyahState }> {
  const m: Record<string, { state: AyahState }> = {};
  const set = (s: number, from: number, to: number, st: AyahState) => {
    for (let a = from; a <= to; a++) m[String(gid(s, a))] = { state: st };
  };
  set(1, 1, 7, "mastered");                         // Al-Fatiha
  for (let s = 108; s <= 114; s++)
    set(s, 1, SURAHS[s - 1][1], s === 111 ? "stumbled" : "mastered"); // last short surahs
  set(78, 1, 20, "memorized");
  set(78, 7, 9, "learning");
  m[String(gid(78, 5))] = { state: "due" };          // An-Naba
  set(67, 1, 15, "memorized");
  m[String(gid(67, 3))] = { state: "stumbled" };
  m[String(gid(67, 8))] = { state: "due" };          // Al-Mulk
  set(112, 1, 4, "mastered");
  set(36, 1, 12, "learning");                        // Ikhlas, Yaseen
  return m;
}

export function useStatus() {
  // StatusMap stored as Record<string, AyahStatus> in localStorage
  const [status, setStatus] = useLocalStorage<StatusMap>("minhaj-status", seed() as unknown as StatusMap);

  const getState = (id: number): AyahState => (status[id]?.state ?? "new") as AyahState;

  const cycleState = (id: number) => {
    setStatus((prev) => {
      const cycle: AyahState[] = ["new", "learning", "memorized", "mastered"];
      const cur: AyahState = (prev[id]?.state ?? "new") as AyahState;
      const idx = cycle.indexOf(cur);
      const nxt: AyahState = idx === -1 ? "new" : cycle[(idx + 1) % cycle.length];
      return { ...prev, [id]: { ...(prev[id] ?? {}), state: nxt } };
    });
  };

  const rateAyah = (id: number, rating: "mastered" | "stumbled" | "forgot", today: string) => {
    setStatus((prev) => {
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

  return { status, getState, cycleState, rateAyah };
}
