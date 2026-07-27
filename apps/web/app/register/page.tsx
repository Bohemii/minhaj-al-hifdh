"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "خطأ في إنشاء الحساب");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("تعذّر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--paper)" }}
    >
      <div
        className="w-full max-w-[380px] rounded-2xl p-8 flex flex-col gap-6"
        style={{
          background: "#fff",
          border: "1px solid var(--line)",
          boxShadow: "0 10px 40px -12px rgba(33,31,26,.18)",
        }}
      >
        <div className="text-center">
          <h1 className="text-[22px] font-black m-0" style={{ color: "var(--emerald)" }}>
            مِنهاج الحِفظ
          </h1>
          <p className="text-[13px] mt-1" style={{ color: "#8b8474" }}>
            إنشاء حساب جديد
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[13px] font-bold" style={{ color: "var(--ink)" }}>
              الاسم (اختياري)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="اسمك"
              className="px-3 py-[10px] rounded-[10px] text-[14px] outline-none"
              style={{
                border: "1px solid var(--line)",
                background: "var(--paper)",
                color: "var(--ink)",
                fontFamily: "inherit",
              }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[13px] font-bold" style={{ color: "var(--ink)" }}>
              البريد الإلكتروني
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="px-3 py-[10px] rounded-[10px] text-[14px] outline-none"
              style={{
                border: "1px solid var(--line)",
                background: "var(--paper)",
                color: "var(--ink)",
                fontFamily: "inherit",
                direction: "ltr",
                textAlign: "left",
              }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[13px] font-bold" style={{ color: "var(--ink)" }}>
              كلمة المرور
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="8 أحرف على الأقل"
              className="px-3 py-[10px] rounded-[10px] text-[14px] outline-none"
              style={{
                border: "1px solid var(--line)",
                background: "var(--paper)",
                color: "var(--ink)",
                fontFamily: "inherit",
                direction: "ltr",
                textAlign: "left",
              }}
            />
          </div>

          {error && (
            <p className="text-[13px] text-center px-3 py-2 rounded-lg" style={{ background: "#FEE2E2", color: "#B91C1C" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="py-[11px] rounded-[10px] font-bold text-[15px] cursor-pointer border-0 mt-1"
            style={{ background: "var(--emerald)", color: "#fff", fontFamily: "inherit", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "جاري الإنشاء..." : "إنشاء الحساب"}
          </button>
        </form>

        <p className="text-center text-[13px]" style={{ color: "#8b8474" }}>
          لديك حساب؟{" "}
          <Link href="/login" className="font-bold" style={{ color: "var(--emerald)" }}>
            تسجيل الدخول
          </Link>
        </p>
      </div>
    </div>
  );
}
