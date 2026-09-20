"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "@/components/layout/Sidebar";
import { AuthService } from "@/lib/api/client";
import { SidebarProvider } from "@/context/SidebarContext";
import { User } from "@/types";
import { useLanguage } from "@/context/LanguageContext";
import { Lock, Sparkles, ArrowRight, ArrowLeft } from "lucide-react";

const RESTRICTED_FREE_ROUTES = [
  "/dashboard/ai-advisor",
  "/dashboard/categories",
  "/dashboard/suppliers",
  "/dashboard/expenses",
  "/dashboard/branches",
  "/dashboard/trash",
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { locale } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const currentUser = AuthService.getCurrentUser();
    setUser(currentUser);
    if (!currentUser) {
      router.push("/login");
    } else if (currentUser.role?.toLowerCase() === "superadmin") {
      router.push("/superadmin");
    }
  }, [router]);

  const isFreeTier = (user?.subscriptionTier || "free").toLowerCase() === "free";
  const isRestrictedRoute = RESTRICTED_FREE_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex relative transition-colors duration-200">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
          {mounted && isFreeTier && isRestrictedRoute ? (
            <div className="flex-1 p-6 flex flex-col items-center justify-center min-h-[75vh] text-center max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mb-5 shadow-lg shadow-amber-500/5">
                <Lock className="w-8 h-8" />
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 dark:text-amber-400 text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{locale === "bn" ? "প্রো ফিচার" : "PRO FEATURE"}</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                {locale === "bn"
                  ? "এই ফিচারটি শুধুমাত্র প্রিমিয়াম প্ল্যানে উন্মুক্ত"
                  : "This feature is locked for Free Tier"}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 max-w-md leading-relaxed">
                {locale === "bn"
                  ? "আপনার ফ্রি অ্যাকাউন্টে এই ফিচারটি সীমাবদ্ধ। আনলিমিটেড ক্যাটাগরি, সাপ্লায়ার, ব্যয় ট্র্যাকিং, একাধিক ব্রাঞ্চ এবং এআই বিজনেসম্যান আনলক করতে এখনই প্রিমিয়ামে আপগ্রেড করুন।"
                  : "This module is not included in the Free tier. Upgrade your subscription to unlock Categories, Suppliers, Expenses, Multi-branch, AI Advisor, and Trash."}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/dashboard/subscriptions?upgrade=required"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-600/25 transition-all"
                >
                  <span>{locale === "bn" ? "প্ল্যান আপগ্রেড করুন" : "Upgrade Plan"}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 text-sm font-medium transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{locale === "bn" ? "ড্যাশবোর্ডে ফিরে যান" : "Back to Dashboard"}</span>
                </Link>
              </div>
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </SidebarProvider>
  );
}
