import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { ayahStatus } from "@/db/schema";
import { requireSession } from "@/lib/session";
import { eq, and } from "drizzle-orm";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ ayahId: string }> }
) {
  try {
    const { userId } = await requireSession();
    const { ayahId: ayahIdStr } = await params;
    const ayahId = parseInt(ayahIdStr, 10);
    if (isNaN(ayahId)) {
      return NextResponse.json({ error: "invalid ayahId" }, { status: 400 });
    }

    const body: { state?: string; box?: number; dueDate?: string } = await req.json();

    const updateValues: Record<string, unknown> = {};
    if (body.state !== undefined) updateValues.state = body.state;
    if (body.box !== undefined) updateValues.box = body.box;
    if (body.dueDate !== undefined) updateValues.dueDate = body.dueDate;
    updateValues.lastReviewedAt = new Date();

    await db
      .insert(ayahStatus)
      .values({
        userId,
        ayahId,
        state: (body.state ?? "new") as string,
        box: body.box ?? 0,
        dueDate: body.dueDate ?? null,
        lastReviewedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [ayahStatus.userId, ayahStatus.ayahId],
        set: updateValues,
      });

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    console.error("[PATCH /api/progress/[ayahId]]", err);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
