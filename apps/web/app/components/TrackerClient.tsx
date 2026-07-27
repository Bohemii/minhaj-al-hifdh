"use client";

import { useState, useMemo } from "react";
import { ShieldCheck, Check, Info } from "lucide-react";
import Link from "next/link";
import { SURAHS, TOTAL_AYAH, surahRange, juzRange, hizbRange, gid, rollup } from "@minhaj/core";
import type { AyahState } from "@minhaj/core";
import { useStatus } from "../hooks/useStatus";
import { Tile } from "./Tile";
import { Legend } from "./Legend";

type View = "surah" | "juz" | "hizb" | "ayah";

const COLORS: Record<AyahState, string> = {
  new: "#EAE3D2",
  learning: "#E3C56B",
  memorized: "#7FB89B",
  mastered: "#0E5A48",
  due: "#D9A93B",
  stumbled: "#C25A3A",
};

const LEGEND_LABELS: Record<AyahState, string> = {
  new: "لم يبدأ",
  learning: "قيد الحفظ",
  memorized: "محفوظ",
  mastered: "متقن",
  due: "للمراجعة",
  stumbled: "تعثّر",
};

const WEIGHT: Record<AyahState, number> = {
  new: 0, learning: 0.5, memorized: 1, mastered: 1, due: 1, stumbled: 1,
};

export function TrackerClient() {
  const [view, setView] = useState<View>("surah");
  const [openSurah, setOpenSurah] = useState(78);
  const { status, getState, cycleState } = useStatus();

  const roll = useMemo(() => (a: number, b: number) => rollup(status, a, b), [status]);

  const totalDone = useMemo(
    () => Object.values(status).filter((v) => v?.state === "memorized" || v?.state === "mastered").length,
    [status]
  );
  const overallPct = Math.round((totalDone / TOTAL_AYAH) * 100);

  return (
    <div
      dir="rtl"
      className="max-w-[820px] mx-auto my-6 px-5 flex flex-col gap-4 rounded-2xl"
      style={{
        background: "var(--paper)",
        border: "1px solid var(--line)",
        boxShadow: "0 10px 40px -12px rgba(33,31,26,.25)",
        padding: "20px",
      }}
    >
      {/* Header */}
      <header className="flex justify-between items-start gap-3">
        <div>
          <h1 className="text-[21px] font-black m-0">متتبّع الحِفظ</h1>
          <p className="text-[12px] mt-1" style={{ color: "#8b8474" }}>
            {totalDone.toLocaleString("ar-EG")} آية محفوظة من {TOTAL_AYAH.toLocaleString("ar-EG")} · {overallPct}٪
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-[6px] text-[11px] font-bold rounded-lg px-[9px] py-[6px] whitespace-nowrap"
            style={{ color: "var(--emerald)", background: "#E6EEE9", border: "1px solid #cfe0d7" }}
            title="نص المصحف من مصدر موثّق ولا يُعدّل"
          >
            <ShieldCheck size={15} /> نصّ موثّق · لا يُعدَّل
          </div>
          <Link
            href="/plan"
            className="text-[11px] px-3 py-[6px] rounded-lg font-bold"
            style={{ background: "#EFE8D8", color: "var(--ink)", border: "1px solid var(--line)" }}
          >
            الخطة
          </Link>
          <Link
            href="/revision"
            className="text-[11px] px-3 py-[6px] rounded-lg font-bold"
            style={{ background: "var(--emerald)", color: "#fff" }}
          >
            المراجعة
          </Link>
        </div>
      </header>

      {/* Segment nav */}
      <nav className="flex gap-1 rounded-xl p-1" style={{ background: "#EFE8D8" }}>
        {(["surah", "juz", "hizb", "ayah"] as View[]).map((k) => {
          const labels: Record<View, string> = { surah: "سورة", juz: "جزء", hizb: "حزب", ayah: "آية" };
          return (
            <button
              key={k}
              className="flex-1 border-0 py-[9px] rounded-[9px] font-bold text-[14px] cursor-pointer"
              style={{
                background: view === k ? "#fff" : "transparent",
                color: view === k ? "var(--emerald)" : "#8b8474",
                boxShadow: view === k ? "0 1px 4px rgba(0,0,0,.08)" : "none",
                fontFamily: "inherit",
              }}
              onClick={() => setView(k)}
            >
              {labels[k]}
            </button>
          );
        })}
      </nav>

      {/* Main content */}
      <main>
        {view === "surah" && (
          <div className="grid gap-[6px]" style={{ gridTemplateColumns: "repeat(7,1fr)" }}>
            {SURAHS.map((s, i) => {
              const [a, b] = surahRange(i + 1);
              const r = roll(a, b);
              return (
                <Tile
                  key={i}
                  no={i + 1}
                  label={s[0]}
                  pct={r.pct}
                  due={r.due}
                  slip={r.slip}
                  onClick={() => { setOpenSurah(i + 1); setView("ayah"); }}
                />
              );
            })}
          </div>
        )}

        {view === "juz" && (
          <div className="grid gap-[6px]" style={{ gridTemplateColumns: "repeat(6,1fr)" }}>
            {Array.from({ length: 30 }).map((_, i) => {
              const [a, b] = juzRange(i + 1);
              const r = roll(a, b);
              return <Tile key={i} no={i + 1} label={`جزء ${i + 1}`} pct={r.pct} due={r.due} slip={r.slip} big />;
            })}
          </div>
        )}

        {view === "hizb" && (
          <>
            <div className="grid gap-[6px]" style={{ gridTemplateColumns: "repeat(6,1fr)" }}>
              {Array.from({ length: 60 }).map((_, i) => {
                const [a, b] = hizbRange(i + 1);
                const r = roll(a, b);
                return <Tile key={i} no={i + 1} label={`حزب ${i + 1}`} pct={r.pct} due={r.due} slip={r.slip} />;
              })}
            </div>
            <p className="flex items-center gap-[6px] text-[11px] mt-2" style={{ color: "#8b8474" }}>
              <Info size={12} /> حدود الأحزاب هنا تقريبية للعرض؛ في التطبيق تُؤخذ الحدود الدقيقة من البيانات المفهرسة بالآية.
            </p>
          </>
        )}

        {view === "ayah" && (
          <>
            <div className="flex items-center gap-[10px] justify-between flex-wrap mb-3">
              <select
                value={openSurah}
                onChange={(e) => setOpenSurah(+e.target.value)}
                className="text-[14px] font-bold px-[10px] py-[8px] rounded-[9px]"
                style={{ border: "1px solid var(--line)", background: "#fff", color: "var(--ink)", fontFamily: "inherit" }}
              >
                {SURAHS.map((s, i) => (
                  <option key={i} value={i + 1}>
                    {i + 1}. {s[0]} ({s[1]} آية)
                  </option>
                ))}
              </select>
              <span className="text-[12px]" style={{ color: "#8b8474" }}>اضغط الآية لتغيير حالتها</span>
            </div>
            <div className="flex flex-wrap gap-[5px]">
              {Array.from({ length: SURAHS[openSurah - 1][1] }).map((_, i) => {
                const id = gid(openSurah, i + 1);
                const st = getState(id);
                return (
                  <button
                    key={i}
                    className="relative min-w-[34px] h-[34px] border-0 rounded-[8px] font-black text-[12px] cursor-pointer flex items-center justify-center"
                    style={{
                      background: COLORS[st],
                      color: WEIGHT[st] >= 1 ? "#fff" : "#6b6552",
                      fontFamily: "inherit",
                    }}
                    onClick={() => cycleState(id)}
                    title={LEGEND_LABELS[st]}
                  >
                    {(i + 1).toLocaleString("ar-EG")}
                    {st === "mastered" && <Check size={9} className="absolute top-[2px] right-[2px]" />}
                  </button>
                );
              })}
            </div>
            <p className="flex items-center gap-[6px] text-[11px] mt-3" style={{ color: "#8b8474" }}>
              <Info size={12} /> تُعرض الآيات بالرقم؛ النص القرآني يُحمّل من المصدر الموثّق ولا يُخزَّن قابلاً للتعديل.
            </p>
          </>
        )}
      </main>

      <Legend />
    </div>
  );
}
