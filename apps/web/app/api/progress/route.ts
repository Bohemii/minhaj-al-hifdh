import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { ayahStatus } from "@/db/schema";
import { requireSession } from "@/lib/session";
import { eq, and } from "drizzle-orm";
import type { StatusMap } from "@minhaj/core";

export async function GET() {
  try {
    const { userId } = await requireSession();
    const rows = await db()
      .select()
      .from(ayahStatus)
      .where(eq(ayahStatus.userId, userId));

    const map: StatusMap = {};
    for (const r of rows) {
      map[r.ayahId] = {
        state: r.state as StatusMap[number]["state"],
        box: r.box ?? 0,
        dueDate: r.dueDate ?? undefined,
        lastReviewed: r.lastReviewedAt?.toISOString().slice(0, 10) ?? undefined,
      };
    }
    return NextResponse.json(map);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    console.error("[GET /api/progress]", err);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireSession();
    const body: Array<{ ayahId: number; state: string; box?: number; dueDate?: string }> = await req.json();

    if (!Array.isArray(body) || body.length === 0) {
      return NextResponse.json({ error: "body must be a non-empty array" }, { status: 400 });
    }

    const values = body.map((item) => ({
      userId,
      ayahId: item.ayahId,
      state: item.state,
      box: item.box ?? 0,
      dueDate: item.dueDate ?? null,
      lastReviewedAt: new Date(),
    }));

    await db()
      .insert(ayahStatus)
      .values(values)
      .onConflictDoUpdate({
        target: [ayahStatus.userId, ayahStatus.ayahId],
        set: {
          state: ayahStatus.state,
          box: ayahStatus.box,
          dueDate: ayahStatus.dueDate,
          lastReviewedAt: ayahStatus.lastReviewedAt,
        },
      });

    return NextResponse.json({ ok: true, count: values.length });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    console.error("[POST /api/progress]", err);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
