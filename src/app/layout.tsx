import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Inventarioya - Smart Cloud POS, Inventory & AI Business Intelligence",
  description:
    "Next-generation Cloud POS, Multi-branch Inventory, Staff Management, and Gemini AI Business Analytics platform.",
  keywords: ["POS", "Inventory Management", "Bangladesh POS", "Cloud Billing", "Gemini AI", "Retail Software"],
};

import { ApiLogDrawer } from "@/components/ui/ApiLogDrawer";
import { ThemeProvider } from "@/context/ThemeContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('inventarioya_theme') || 'dark';
                  var root = document.documentElement;
                  if (theme === 'system') {
                    var dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    root.classList.toggle('dark', dark);
                    root.classList.toggle('light', !dark);
                  } else if (theme === 'light') {
                    root.classList.remove('dark');
                    root.classList.add('light');
                  } else {
                    root.classList.add('dark');
                    root.classList.remove('light');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 antialiased selection:bg-indigo-500 selection:text-white transition-colors duration-200">
        <ThemeProvider>
          {children}
          <ApiLogDrawer />
        </ThemeProvider>
      </body>
    </html>
  );
}
