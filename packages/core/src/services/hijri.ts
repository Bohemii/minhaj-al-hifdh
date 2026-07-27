/**
 * Takes AlAdhan Hijri date object, returns display string.
 */
export function formatHijri(hijriDate: {
  day: string;
  month: { ar: string };
  year: string;
}): string {
  return `${hijriDate.day} ${hijriDate.month.ar} ${hijriDate.year} هـ`;
}

/**
 * Returns true if the current Hijri month is Ramadan (month 9).
 */
export function isRamadan(hijriDate: { month: { number: number } }): boolean {
  return hijriDate.month.number === 9;
}
