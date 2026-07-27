"use client";

import { useState } from "react";
import Link from "next/link";
import { buildSchedule } from "@minhaj/core";
import type { Schedule, ScheduleConfig } from "@minhaj/core";
import { useLocalStorage } from "../hooks/useLocalStorage";

export function PlanClient() {
  const [mode, setMode] = useState<"byDate" | "byPace">("byDate");
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [targetDate, setTargetDate] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 3);
    return d.toISOString().slice(0, 10);
  });
  const [pagesPerDay, setPagesPerDay] = useState(2);
  const [restEvery, setRestEvery] = useState(6);
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [, setSavedConfig] = useLocalStorage<ScheduleConfig | null>("minhaj-schedule-config", null);
  const [, setSavedSchedule] = useLocalStorage<Schedule | null>("minhaj-schedule", null);
  const [saved, setSaved] = useState(false);

  const generate = () => {
    const config: ScheduleConfig =
      mode === "byDate"
        ? { mode: "byDate", startDate, targetDate, restEvery }
        : { mode: "byPace", startDate, pagesPerDay, restEvery };
    const s = buildSchedule(config);
    setSchedule(s);
    setSaved(false);
  };

  const save = () => {
    if (!schedule) return;
    const config: ScheduleConfig =
      mode === "byDate"
        ? { mode: "byDate", startDate, targetDate, restEvery }
        : { mode: "byPace", startDate, pagesPerDay, restEvery };
    setSavedConfig(config);
    setSavedSchedule(schedule);
    setSaved(true);
  };

  const inputClass =
    "w-full px-3 py-2 rounded-[9px] text-[14px] font-bold focus:outline-none";

  return (
    <div
      dir="rtl"
      className="max-w-[700px] mx-auto my-6 flex flex-col gap-5 rounded-2xl"
      style={{
        background: "var(--paper)",
        border: "1px solid var(--line)",
        boxShadow: "0 10px 40px -12px rgba(33,31,26,.25)",
        padding: "24px",
      }}
    >
      <header className="flex justify-between items-center">
        <h1 className="text-[21px] font-black m-0">خطة الحفظ</h1>
        <Link href="/" className="text-[12px] px-3 py-2 rounded-lg" style={{ background: "#EFE8D8", color: "var(--ink)" }}>
          ← الرئيسية
        </Link>
      </header>

      <div className="flex flex-col gap-4">
        {/* Mode selector */}
        <div>
          <label className="block text-[13px] font-bold mb-2" style={{ color: "#8b8474" }}>نوع الخطة</label>
          <div className="flex gap-2">
            {(["byDate", "byPace"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className="flex-1 py-2 rounded-lg text-[14px] font-bold border-0 cursor-pointer"
                style={{
                  background: mode === m ? "var(--emerald)" : "#EFE8D8",
                  color: mode === m ? "#fff" : "var(--ink)",
                  fontFamily: "inherit",
                }}
              >
                {m === "byDate" ? "حسب التاريخ" : "حسب الصفحات"}
              </button>
            ))}
          </div>
        </div>

        {/* Start date */}
        <div>
          <label className="block text-[13px] font-bold mb-1" style={{ color: "#8b8474" }}>تاريخ البداية</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={inputClass}
            style={{ border: "1px solid var(--line)", background: "#fff", color: "var(--ink)", fontFamily: "inherit" }}
          />
        </div>

        {mode === "byDate" ? (
          <div>
            <label className="block text-[13px] font-bold mb-1" style={{ color: "#8b8474" }}>تاريخ الانتهاء المستهدف</label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className={inputClass}
              style={{ border: "1px solid var(--line)", background: "#fff", color: "var(--ink)", fontFamily: "inherit" }}
            />
          </div>
        ) : (
          <div>
            <label className="block text-[13px] font-bold mb-1" style={{ color: "#8b8474" }}>
              صفحات يومياً: {pagesPerDay}
            </label>
            <input
              type="range"
              min={1}
              max={10}
              value={pagesPerDay}
              onChange={(e) => setPagesPerDay(+e.target.value)}
              className="w-full"
            />
          </div>
        )}

        <div>
          <label className="block text-[13px] font-bold mb-1" style={{ color: "#8b8474" }}>
            يوم راحة كل كم يوم: {restEvery}
          </label>
          <input
            type="range"
            min={3}
            max={14}
            value={restEvery}
            onChange={(e) => setRestEvery(+e.target.value)}
            className="w-full"
          />
        </div>

        <button
          onClick={generate}
          className="w-full py-3 rounded-xl text-[16px] font-black border-0 cursor-pointer"
          style={{ background: "var(--emerald)", color: "#fff", fontFamily: "inherit" }}
        >
          احسب الخطة
        </button>
      </div>

      {schedule && (
        <div
          className="flex flex-col gap-3 p-4 rounded-xl"
          style={{ background: "#EFE8D8", border: "1px solid var(--line)" }}
        >
          <h2 className="text-[16px] font-black m-0">ملخص الخطة</h2>
          <div className="grid grid-cols-2 gap-3 text-center">
            <Stat label="عدد الأيام" value={schedule.days.length.toLocaleString("ar-EG")} />
            <Stat label="صفحات يومياً" value={schedule.pagesPerDay.toLocaleString("ar-EG")} />
            <Stat label="أيام العمل" value={schedule.days.filter((d) => !d.rest).length.toLocaleString("ar-EG")} />
            <Stat label="أيام المراجعة" value={schedule.days.filter((d) => d.rest).length.toLocaleString("ar-EG")} />
          </div>
          {!schedule.completes && (
            <div
              className="p-3 rounded-lg text-[13px] font-bold"
              style={{ background: "#F9EED4", color: "#7A5100", border: "1px solid #E8C87A" }}
            >
              ⚠ لن تكتمل الخطة في الوقت المحدد — يُرجى زيادة صفحات اليوم أو تمديد التاريخ.
            </div>
          )}
          {/* First 7 days preview */}
          <h3 className="text-[13px] font-bold m-0" style={{ color: "#8b8474" }}>معاينة أول ٧ أيام</h3>
          <div className="flex flex-col gap-1">
            {schedule.days.slice(0, 7).map((d) => (
              <div
                key={d.day}
                className="flex justify-between items-center px-3 py-2 rounded-lg text-[13px]"
                style={{ background: d.rest ? "#EFE8D8" : "#fff", border: "1px solid var(--line)" }}
              >
                <span className="font-bold">{d.date}</span>
                <span style={{ color: d.rest ? "#8b8474" : "var(--emerald)" }}>{d.portionLabel}</span>
              </div>
            ))}
          </div>
          <button
            onClick={save}
            className="w-full py-2 rounded-lg text-[14px] font-bold border-0 cursor-pointer"
            style={{
              background: saved ? "#7FB89B" : "var(--gold)",
              color: "#fff",
              fontFamily: "inherit",
            }}
          >
            {saved ? "✓ تم الحفظ" : "حفظ الخطة"}
          </button>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 p-3 rounded-lg" style={{ background: "#fff", border: "1px solid var(--line)" }}>
      <span className="text-[11px]" style={{ color: "#8b8474" }}>{label}</span>
      <span className="text-[20px] font-black" style={{ color: "var(--emerald)" }}>{value}</span>
    </div>
  );
}
