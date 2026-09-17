import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Inventarioya - Smart Cloud POS, Inventory & AI Business Intelligence",
  description:
    "Next-generation Cloud POS, Multi-branch Inventory, Staff Management, and Gemini AI Business Analytics platform.",
  keywords: ["POS", "Inventory Management", "Bangladesh POS", "Cloud Billing", "Gemini AI", "Retail Software"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 font-sans text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
