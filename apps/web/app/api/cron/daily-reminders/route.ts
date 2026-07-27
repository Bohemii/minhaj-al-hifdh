import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { ayahStatus } from "@/db/schema";
import { lte, eq } from "drizzle-orm";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const today = new Date().toISOString().slice(0, 10);

  // Distinct user IDs with due ayahs
  const dueRows = await db()
    .selectDistinct({ userId: ayahStatus.userId })
    .from(ayahStatus)
    .where(lte(ayahStatus.dueDate, today));

  const sendBase =
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

  const results = await Promise.allSettled(
    dueRows.map(({ userId }) =>
      fetch(`${sendBase}/api/notifications/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-cron-secret": process.env.CRON_SECRET ?? "",
        },
        body: JSON.stringify({ userId, type: "revision-due" }),
      })
    )
  );

  const sent = results.filter((r) => r.status === "fulfilled").length;
  return NextResponse.json({ notified: sent, total: dueRows.length });
}
