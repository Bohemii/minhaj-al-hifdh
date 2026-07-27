const BASE = "https://api.aladhan.com/v1";

// Simple in-memory cache: key = "lat|lng|year|month"
const monthlyCache = new Map<string, unknown>();

/**
 * Fetch monthly prayer times calendar from AlAdhan.
 * Default method=4 (Umm al-Qura, Makkah) for KSA/GCC.
 * Results are cached in-memory by lat/lng/year/month.
 */
export async function getMonthlyPrayerTimes(
  lat: number,
  lng: number,
  year: number,
  month: number,
  method = 4
): Promise<unknown> {
  const key = `${lat}|${lng}|${year}|${month}`;
  if (monthlyCache.has(key)) return monthlyCache.get(key);

  const url = `${BASE}/calendar/${year}/${month}?latitude=${lat}&longitude=${lng}&method=${method}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`AlAdhan monthly: ${res.status}`);
  const data = await res.json();
  monthlyCache.set(key, data);
  return data;
}

/**
 * Fetch today's Hijri date from AlAdhan.
 * @param date - Gregorian date string "DD-MM-YYYY"
 */
export async function getTodayHijri(date: string): Promise<unknown> {
  const url = `${BASE}/gToH?date=${date}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`AlAdhan Hijri: ${res.status}`);
  return res.json();
}
