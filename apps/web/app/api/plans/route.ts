export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { plans } from "@/db/schema";
import { requireSession } from "@/lib/session";
import { eq, and } from "drizzle-orm";

export async function GET() {
  try {
    const { userId } = await requireSession();
    const [plan] = await db()
      .select()
      .from(plans)
      .where(and(eq(plans.userId, userId), eq(plans.active, true)))
      .limit(1);
    return NextResponse.json(plan ?? null);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    console.error("[GET /api/plans]", err);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireSession();
    const body = await req.json();

    // Deactivate existing plans
    await db()
      .update(plans)
      .set({ active: false })
      .where(and(eq(plans.userId, userId), eq(plans.active, true)));

    const [plan] = await db()
      .insert(plans)
      .values({
        userId,
        mode: body.mode,
        startDate: body.startDate,
        targetDate: body.targetDate ?? null,
        pagesPerDay: body.pagesPerDay ?? null,
        restEvery: body.restEvery ?? null,
        active: true,
      })
      .returning();

    return NextResponse.json(plan);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    console.error("[POST /api/plans]", err);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
