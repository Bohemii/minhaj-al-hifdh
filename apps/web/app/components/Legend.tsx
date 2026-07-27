const LEGEND: [string, string, string][] = [
  ["new", "#EAE3D2", "لم يبدأ"],
  ["learning", "#E3C56B", "قيد الحفظ"],
  ["memorized", "#7FB89B", "محفوظ"],
  ["mastered", "#0E5A48", "متقن"],
  ["due", "#D9A93B", "للمراجعة"],
  ["stumbled", "#C25A3A", "تعثّر"],
];

export function Legend() {
  return (
    <footer className="flex flex-wrap gap-3 border-t border-dashed pt-3" style={{ borderColor: "var(--line)" }}>
      {LEGEND.map(([key, color, label]) => (
        <span key={key} className="flex items-center gap-[5px] text-[11px]" style={{ color: "#6b6552" }}>
          <i className="inline-block w-[11px] h-[11px] rounded-[3px]" style={{ background: color }} />
          {label}
        </span>
      ))}
    </footer>
  );
}
