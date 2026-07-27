import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are Minhāj Coach — a knowledgeable, warm assistant helping a Muslim memorize the Quran (Ḥifẓ).

Rules you must follow absolutely:
1. You NEVER generate, paraphrase, or quote Quranic text from memory.
2. When referencing an ayah, cite it as [Surah Name, Ayah Number] only.
3. For scheduling advice, use the data provided in the user message.
4. Respond in the user's language (Arabic or English based on their message).
5. Be encouraging, spiritually grounded, and practical.
6. Keep responses concise — 2-4 short paragraphs max.

You CAN help with:
- Analyzing memorization progress and suggesting what to focus on
- Explaining why certain portions are harder (mutashabihat — similar verses)
- Re-planning schedules when days are missed
- Motivational coaching rooted in classical hifdh methodology
- General questions about memorization technique`;

export async function coachChat(
  messages: { role: "user" | "assistant"; content: string }[],
  context: {
    totalDone: number;
    totalAyahs: number;
    dueCount: number;
    stumbedCount: number;
    activePlan?: { pagesPerDay: number; targetDate: string } | null;
  }
): Promise<string> {
  const planStr = context.activePlan
    ? `${context.activePlan.pagesPerDay} pages/day, target: ${context.activePlan.targetDate}`
    : "no active plan";

  const pct = Math.round((context.totalDone / context.totalAyahs) * 100);

  const contextBlock = `[Progress: ${context.totalDone}/${context.totalAyahs} ayahs memorized (${pct}%). Due for review: ${context.dueCount}. Stumbled: ${context.stumbedCount}. Plan: ${planStr}]`;

  // Prepend context to the first user message
  const augmentedMessages = messages.map((m, i) => {
    if (i === 0 && m.role === "user") {
      return { role: m.role as "user", content: `${contextBlock}\nUser: ${m.content}` };
    }
    return { role: m.role as "user" | "assistant", content: m.content };
  });

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: augmentedMessages,
  });

  const block = response.content[0];
  if (block.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }
  return block.text;
}
