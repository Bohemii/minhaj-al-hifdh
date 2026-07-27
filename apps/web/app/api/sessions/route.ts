export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sessions } from "@/db/schema";
import { requireSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireSession();
    const body = await req.json();

    const [session] = await db()
      .insert(sessions)
      .values({
        userId,
        date: body.date,
        fromAyah: body.fromAyah ?? null,
        toAyah: body.toAyah ?? null,
        listens: body.listens ?? 0,
        repeats: body.repeats ?? 0,
        recites: body.recites ?? 0,
        prayed: body.prayed ?? false,
      })
      .returning();

    return NextResponse.json(session);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    console.error("[POST /api/sessions]", err);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
