"use client";
import { Check } from "lucide-react";

interface TileProps {
  no: number;
  label: string;
  pct: number;
  due: number;
  slip: number;
  onClick?: () => void;
  big?: boolean;
}

export function Tile({ no, label, pct, due, slip, onClick, big }: TileProps) {
  const done = pct >= 0.999;
  const attention = slip > 0 ? "slip" : due > 0 ? "due" : "";
  const fillPct = Math.round(pct * 100);

  return (
    <button
      onClick={onClick}
      title={label}
      className={`relative overflow-hidden border rounded-[10px] flex flex-col items-center justify-center gap-[1px] cursor-pointer font-inherit p-[2px] ${big ? "aspect-[1.3/1]" : "aspect-square"}`}
      style={{ border: "1px solid var(--line)", background: "#fff" }}
    >
      {/* fill bar */}
      <div
        className="absolute bottom-0 left-0 right-0 opacity-90"
        style={{
          height: `${fillPct}%`,
          background: "linear-gradient(180deg,#14705a,#0E5A48)",
        }}
      />
      <span className="relative z-10 text-[13px] font-black" style={{ color: done ? "#fff" : "var(--ink)" }}>
        {no.toLocaleString("ar-EG")}
      </span>
      <span
        className="relative z-10 text-[8.5px] max-w-full overflow-hidden text-ellipsis whitespace-nowrap px-[2px]"
        style={{ color: done ? "#fff" : "#7d7663" }}
      >
        {label}
      </span>
      {done && <Check size={12} className="absolute top-[3px] right-[3px] text-white z-20" />}
      {attention === "slip" && (
        <i className="absolute top-[4px] left-[4px] w-[7px] h-[7px] rounded-full z-20" style={{ background: "#C25A3A" }} />
      )}
      {attention === "due" && (
        <i className="absolute top-[4px] left-[4px] w-[7px] h-[7px] rounded-full z-20" style={{ background: "#D9A93B" }} />
      )}
    </button>
  );
}
