import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

let dataset: Record<string, string[]> | null = null;

function getDataset(): Record<string, string[]> {
  if (!dataset) {
    const filePath = join(process.cwd(), "public", "mutashabihat.json");
    dataset = JSON.parse(readFileSync(filePath, "utf-8"));
  }
  return dataset!;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const surah = searchParams.get("surah");
  const ayah = searchParams.get("ayah");

  if (!surah || !ayah) {
    return NextResponse.json(
      { error: "surah and ayah query params are required" },
      { status: 400 }
    );
  }

  const surahNum = parseInt(surah, 10);
  const ayahNum = parseInt(ayah, 10);

  if (isNaN(surahNum) || isNaN(ayahNum) || surahNum < 1 || surahNum > 114 || ayahNum < 1) {
    return NextResponse.json({ error: "Invalid surah or ayah number" }, { status: 400 });
  }

  const key = `${surahNum}:${ayahNum}`;
  const data = getDataset();
  const similar = data[key] ?? [];

  // Return top 5
  const top5 = similar.slice(0, 5);

  return NextResponse.json({
    ref: key,
    similar: top5,
    count: top5.length,
  });
}
