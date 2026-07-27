import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { db } from "@/db";
import { pushSubscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT ?? "mailto:admin@minhaj.app",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "",
  process.env.VAPID_PRIVATE_KEY ?? ""
);

type NotificationType = "revision-due" | "streak" | "wird-reminder";

const MESSAGES: Record<NotificationType, { title: string; body: string }> = {
  "revision-due": { title: "مراجعة الورد", body: "لديك آيات مستحقة للمراجعة اليوم" },
  streak: { title: "حافظ على سلسلتك", body: "لا تنقطع — واصل الحفظ اليوم" },
  "wird-reminder": { title: "وقت الورد", body: "حان وقت ورد الحفظ اليومي" },
};

export async function POST(req: NextRequest) {
  // Auth: cron secret
  const cronSecret = req.headers.get("x-cron-secret");
  if (cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId, type } = (await req.json()) as {
    userId?: string;
    type: NotificationType;
  };

  const msg = MESSAGES[type] ?? { title: "مِنهاج الحِفظ", body: "" };

  let subs;
  if (userId) {
    subs = await db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, userId));
  } else {
    subs = await db.select().from(pushSubscriptions);
  }

  const results = await Promise.allSettled(
    subs.map((sub) =>
      webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        JSON.stringify({
          title: msg.title,
          body: msg.body,
          url: "/revision",
        })
      )
    )
  );

  const sent = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  return NextResponse.json({ sent, failed });
}
