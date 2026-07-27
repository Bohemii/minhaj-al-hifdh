import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "مِنهاج الحِفظ",
  description: "متتبّع حفظ القرآن الكريم",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
