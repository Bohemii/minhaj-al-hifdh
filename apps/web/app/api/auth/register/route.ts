import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { hashPassword } from "@/lib/auth";
import { getSession } from "@/lib/session";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "email and password required" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "password must be at least 8 characters" }, { status: 400 });
    }

    const existing = await db.select().from(profiles).where(eq(profiles.email, email)).limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ error: "email already registered" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const [user] = await db
      .insert(profiles)
      .values({ email, passwordHash, name: name || null })
      .returning({ id: profiles.id, email: profiles.email, name: profiles.name });

    const session = await getSession();
    session.userId = user.id;
    session.email = user.email;
    session.name = user.name ?? undefined;
    await session.save();

    return NextResponse.json({ id: user.id, email: user.email, name: user.name });
  } catch (err) {
    console.error("[register]", err);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
