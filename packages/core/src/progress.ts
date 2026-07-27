import type { StatusMap } from "./types";

const WEIGHT: Record<string, number> = {
  new: 0,
  learning: 0.5,
  memorized: 1,
  mastered: 1,
  due: 1,
  stumbled: 1,
};

export interface Rollup {
  pct: number;    // 0–1 weighted completion
  due: number;    // count of "due" ayahs
  slip: number;   // count of "stumbled" ayahs
  n: number;      // total ayahs in range
}

/**
 * Compute a rollup over an inclusive gid range [fromGid, toGid].
 * statusMap: global ayah id → AyahStatus (missing keys treated as "new")
 */
export function rollup(statusMap: StatusMap, fromGid: number, toGid: number): Rollup {
  let sum = 0;
  let due = 0;
  let slip = 0;
  const n = toGid - fromGid + 1;

  for (let id = fromGid; id <= toGid; id++) {
    const st = statusMap[id]?.state ?? "new";
    sum += WEIGHT[st] ?? 0;
    if (st === "due") due++;
    if (st === "stumbled") slip++;
  }

  return { pct: n > 0 ? sum / n : 0, due, slip, n };
}
