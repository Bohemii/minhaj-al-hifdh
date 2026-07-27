import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { coachChat } from "@/lib/ai";

// In-memory rate limiter: userId → { count, windowStart }
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();
const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(userId, { count: 1, windowStart: now });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count += 1;
  return true;
}

export async function POST(req: NextRequest) {
  let userId: string;
  try {
    const session = await requireSession();
    userId = session.userId;
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!checkRateLimit(userId)) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Max 20 messages per hour." },
      { status: 429 }
    );
  }

  let body: {
    messages: { role: "user" | "assistant"; content: string }[];
    context: {
      totalDone: number;
      totalAyahs: number;
      dueCount: number;
      stumbedCount: number;
      activePlan?: { pagesPerDay: number; targetDate: string } | null;
    };
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
    return NextResponse.json({ error: "messages array is required" }, { status: 400 });
  }

  // Stream the response using ReadableStream + TransformStream
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const text = await coachChat(body.messages, body.context);

        // Stream the response word by word for a natural feel
        const words = text.split(" ");
        for (const word of words) {
          controller.enqueue(encoder.encode(word + " "));
          // Small delay to simulate streaming (removed for production perf — coachChat already awaits)
        }
        controller.close();
      } catch (err) {
        console.error("[POST /api/ai/chat]", err);
        controller.enqueue(encoder.encode("حدث خطأ. يرجى المحاولة مرة أخرى. / An error occurred. Please try again."));
        controller.close();
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
