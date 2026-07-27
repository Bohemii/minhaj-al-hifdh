export type AyahState = "new" | "learning" | "memorized" | "mastered" | "due" | "stumbled";

export type AyahStatus = {
  state: AyahState;
  dueDate?: string; // ISO date
  box?: number;     // SRS box 0-5
  lastReviewed?: string;
};

export type StatusMap = Record<number, AyahStatus>; // keyed by global ayah id

export type ScheduleConfig =
  | { mode: "byDate"; startDate: string; targetDate: string; restEvery: number }
  | { mode: "byPace"; startDate: string; pagesPerDay: number; restEvery: number };

export type ScheduleDay = {
  day: number;
  date: string;
  rest: boolean;
  fromPage: number;
  toPage: number;
  portionLabel: string;
};

export type Schedule = {
  days: ScheduleDay[];
  pagesPerDay: number;
  completes: boolean;
};
