// Bundled via JSON import — no runtime fetch
import namesData from "./asma-al-husna.json";

export type DivineName = {
  number: number;
  name: string;
  transliteration: string;
  meaning: string;
};

const names: DivineName[] = namesData as DivineName[];

/**
 * Returns the Asma al-Husna entry for a given 0-indexed day-of-year.
 * Cycles through 99 names.
 */
export function nameOfDay(dayOfYear: number): DivineName {
  const index = dayOfYear % 99;
  return names[index];
}
