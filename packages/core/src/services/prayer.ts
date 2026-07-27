export type PrayerWindow = {
  name: string;
  time: string;
  windowStart: string;
  windowEnd: string;
};

export type DayWindows = {
  fajrWindow: PrayerWindow;
  maghribIshaWindow: PrayerWindow;
};

/**
 * Takes pre-fetched timings object from AlAdhan API response.
 * Returns the two wird windows the app cares about.
 */
export function getWindows(timings: Record<string, string>): DayWindows {
  return {
    fajrWindow: {
      name: "الفجر",
      time: timings["Fajr"] ?? "",
      windowStart: timings["Fajr"] ?? "",
      windowEnd: timings["Sunrise"] ?? "",
    },
    maghribIshaWindow: {
      name: "المغرب / العشاء",
      time: timings["Maghrib"] ?? "",
      windowStart: timings["Maghrib"] ?? "",
      windowEnd: timings["Isha"] ?? "",
    },
  };
}
