export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getMonthlyPrayerTimes, getTodayHijri } from "@/lib/aladan";
import { getWindows, formatHijri, nameOfDay } from "@minhaj/core";


function dayOfYear(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 0);
  const diff = d.getTime() - start.getTime();
  return Math.floor(diff / 86_400_000);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get("lat") ?? "21.3891");
  const lng = parseFloat(searchParams.get("lng") ?? "39.8579");

  const now = new Date();
  const year = parseInt(searchParams.get("year") ?? String(now.getUTCFullYear()));
  const month = parseInt(searchParams.get("month") ?? String(now.getUTCMonth() + 1));

  try {
    const [monthlyData, hijriData] = await Promise.all([
      getMonthlyPrayerTimes(lat, lng, year, month) as Promise<any>,
      getTodayHijri(
        `${String(now.getUTCDate()).padStart(2, "0")}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${now.getUTCFullYear()}`
      ) as Promise<any>,
    ]);

    // Today's timings from monthly calendar (day-1 indexed)
    const todayEntry = monthlyData?.data?.[now.getUTCDate() - 1];
    const timings: Record<string, string> = todayEntry?.timings ?? {};

    const windows = getWindows(timings);
    const hijri = hijriData?.data?.hijri;
    const hijriStr = hijri ? formatHijri(hijri) : null;
    const name = nameOfDay(dayOfYear(now));

    return NextResponse.json({
      timings,
      windows,
      hijri: hijriStr,
      nameOfDay: name,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
