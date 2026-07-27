import type { AyahStatus } from "./types";

export type Rating = "mastered" | "stumbled" | "forgot";

const INTERVALS = [1, 3, 7, 14, 30, 60]; // days per box

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Given a current status and a rating, return the updated AyahStatus.
 * today: ISO date string (passed in, never calls Date.now() internally)
 */
export function reschedule(status: AyahStatus, rating: Rating, today: string): AyahStatus {
  const box = status.box ?? 0;

  if (rating === "forgot") {
    return {
      ...status,
      state: "due",
      box: 0,
      dueDate: addDays(today, 1),
      lastReviewed: today,
    };
  }

  if (rating === "stumbled") {
    const nextBox = box; // stay same box
    return {
      ...status,
      state: nextBox >= INTERVALS.length - 1 ? "mastered" : "memorized",
      box: nextBox,
      dueDate: addDays(today, INTERVALS[nextBox]),
      lastReviewed: today,
    };
  }

  // mastered — advance box
  const nextBox = Math.min(box + 1, INTERVALS.length - 1);
  return {
    ...status,
    state: nextBox >= INTERVALS.length - 1 ? "mastered" : "memorized",
    box: nextBox,
    dueDate: addDays(today, INTERVALS[nextBox]),
    lastReviewed: today,
  };
}

/** Return the ISO date when this ayah is next due for review */
export function dueOn(status: AyahStatus): string | undefined {
  return status.dueDate;
}
