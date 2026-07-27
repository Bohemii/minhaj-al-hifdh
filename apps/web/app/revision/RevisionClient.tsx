"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SURAHS, gid, OFF } from "@minhaj/core";
import type { AyahState } from "@minhaj/core";
import { useStatus } from "../hooks/useStatus";

const COLORS: Record<AyahState, string> = {
  new: "#EAE3D2",
  learning: "#E3C56B",
  memorized: "#7FB89B",
  mastered: "#0E5A48",
  due: "#D9A93B",
  stumbled: "#C25A3A",
};

function gidToLabel(id: number): string {
  // Find which surah this gid belongs to
  let s = 1;
  while (s <= SURAHS.length && OFF[s] < id) s++;
  const ayah = id - OFF[s - 1];
  return `${SURAHS[s - 1][0]} ${ayah.toLocaleString("ar-EG")}`;
}

type Rating = "mastered" | "stumbled" | "forgot";

export function RevisionClient() {
  const { status, rateAyah } = useStatus();
  const today = new Date().toISOString().slice(0, 10);
  const [rated, setRated] = useState<Record<number, Rating>>({});

  const dueIds = useMemo(() => {
    return Object.entries(status)
      .filter(([, v]) => v?.state === "due" || (v?.dueDate && v.dueDate <= today && (v.state === "memorized" || v.state === "mastered")))
      .map(([k]) => +k)
      .sort((a, b) => a - b);
  }, [status, today]);

  const nearIds = useMemo(() => {
    return Object.entries(status)
      .filter(([, v]) => v?.state === "memorized" && (!v.dueDate || v.dueDate > today))
      .map(([k]) => +k)
      .sort((a, b) => a - b)
      .slice(0, 20);
  }, [status, today]);

  const stumbedIds = useMemo(() => {
    return Object.entries(status)
      .filter(([, v]) => v?.state === "stumbled")
      .map(([k]) => +k)
      .sort((a, b) => a - b);
  }, [status]);

  const handleRate = (id: number, rating: Rating) => {
    rateAyah(id, rating, today);
    setRated((prev) => ({ ...prev, [id]: rating }));
  };

  const ratingBtnStyle = (color: string) => ({
    background: color,
    color: "#fff",
    fontFamily: "inherit",
    border: "0",
    cursor: "pointer",
  });

  const AyahCard = ({ id }: { id: number }) => {
    const st = status[id]?.state ?? "new";
    const myRating = rated[id];
    return (
      <div
        className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-[13px]"
        style={{ background: "#fff", border: "1px solid var(--line)", opacity: myRating ? 0.6 : 1 }}
      >
        <span className="font-bold">{gidToLabel(id)}</span>
        <span
          className="text-[10px] px-2 py-[2px] rounded-full font-bold"
          style={{ background: COLORS[st as AyahState], color: st === "mastered" || st === "stumbled" ? "#fff" : "#211F1A" }}
        >
          {st}
        </span>
        {!myRating ? (
          <div className="flex gap-1">
            <button
              onClick={() => handleRate(id, "mastered")}
              className="px-2 py-1 rounded-lg text-[11px] font-bold"
              style={ratingBtnStyle("var(--emerald)")}
            >
              متقن
            </button>
            <button
              onClick={() => handleRate(id, "stumbled")}
              className="px-2 py-1 rounded-lg text-[11px] font-bold"
              style={ratingBtnStyle("#D9A93B")}
            >
              تعثّر
            </button>
            <button
              onClick={() => handleRate(id, "forgot")}
              className="px-2 py-1 rounded-lg text-[11px] font-bold"
              style={ratingBtnStyle("#C25A3A")}
            >
              نسيت
            </button>
          </div>
        ) : (
          <span className="text-[11px] font-bold" style={{ color: "#8b8474" }}>✓ {myRating}</span>
        )}
      </div>
    );
  };

  const Section = ({ title, ids, empty }: { title: string; ids: number[]; empty: string }) => (
    <div className="flex flex-col gap-2">
      <h2 className="text-[15px] font-black m-0">{title}</h2>
      {ids.length === 0 ? (
        <p className="text-[13px]" style={{ color: "#8b8474" }}>{empty}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {ids.map((id) => <AyahCard key={id} id={id} />)}
        </div>
      )}
    </div>
  );

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
        <h1 className="text-[21px] font-black m-0">قائمة المراجعة</h1>
        <Link href="/" className="text-[12px] px-3 py-2 rounded-lg" style={{ background: "#EFE8D8", color: "var(--ink)" }}>
          ← الرئيسية
        </Link>
      </header>

      <Section
        title={`للمراجعة الآن (${dueIds.length.toLocaleString("ar-EG")})`}
        ids={dueIds}
        empty="لا توجد آيات مستحقة للمراجعة اليوم 🎉"
      />

      <Section
        title={`تعثّر (${stumbedIds.length.toLocaleString("ar-EG")})`}
        ids={stumbedIds}
        empty="لا توجد آيات متعثّرة"
      />

      <Section
        title="مراجعة بعيدة — محفوظ حديثاً"
        ids={nearIds}
        empty="لا توجد آيات محفوظة بعد"
      />

      <div
        className="p-3 rounded-lg text-[12px]"
        style={{ background: "#EFE8D8", color: "#8b8474", border: "1px solid var(--line)" }}
      >
        قيّم كل آية بـ &quot;متقن&quot; أو &quot;تعثّر&quot; أو &quot;نسيت&quot; — سيُعدّل النظام جدول مراجعتك تلقائياً.
      </div>
    </div>
  );
}
