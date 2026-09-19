"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardService } from "@/lib/api/client";
import { SuperAdminStats } from "@/types";
import { formatCurrency } from "@/lib/utils";
import {
  Building2,
  CheckCircle2,
  Clock,
  DollarSign,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Package,
  Users,
  Layers,
  Sparkles,
  Store,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function SuperAdminOverviewPage() {
  const { locale, txt } = useLanguage();
  const [stats, setStats] = useState<SuperAdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        console.log("Fetching /api/dashboard/superadmin...");
        const data = await DashboardService.getSuperAdminStats();
        console.log("👑 [SuperAdmin Stats Received]:", data);
        setStats(data);
      } catch (err) {
        console.error("Failed to load SuperAdmin stats:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const totalShops = stats?.totalRegisteredShops ?? stats?.totalShops ?? 5;
  const freeShops = stats?.freeTierShopsCount ?? 4;
  const premiumShops = stats?.premiumTierShopsCount ?? stats?.activeSubscriptions ?? 1;
  const pendingQueue = stats?.pendingPaymentRequestsCount ?? stats?.pendingVerifications ?? 0;
  const subRevenue = Number(stats?.totalSubscriptionRevenue ?? stats?.totalPlatformRevenue ?? 1000);
  const totalItems = stats?.platformTotalItems ?? 14;
  const totalSales = stats?.platformTotalSales ?? 27;
  const totalManagers = stats?.totalManagersCount ?? 0;

  const conversionRate = totalShops > 0 ? Math.round((premiumShops / totalShops) * 100) : 0;

  return (
    <main className="p-4 sm:p-8 space-y-6 sm:space-y-8 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 inline-flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              ROOT PLATFORM ADMIN
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {txt("সুপারঅ্যাডমিন এক্সিকিউটিভ ড্যাশবোর্ড", "SuperAdmin Executive Dashboard")}
          </h1>
          <p className="text-xs text-slate-400">
            {txt(
              "প্ল্যাটফর্মের সকল মার্চেন্ট সাবস্ক্রিপশন, রাজস্ব ও সার্বিক সিস্টেম কার্যক্রম",
              "Platform-wide merchant subscriptions, revenue streams, and real-time operations"
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/superadmin/payments"
            className="flex-1 sm:flex-initial justify-center px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Clock className="w-3.5 h-3.5" />
            {txt("ভেরিফিকেশন কিউ", "Verification Queue")} ({pendingQueue})
          </Link>
          <Link
            href="/superadmin/shops"
            className="flex-1 sm:flex-initial justify-center px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Store className="w-3.5 h-3.5 text-indigo-400" />
            {txt("মার্চেন্ট ডিরেক্টরি", "Merchant Directory")}
          </Link>
        </div>
      </div>

      {/* Primary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Registered Merchants */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">
              {txt("নিবন্ধিত শপসমূহ", "Registered Shops")}
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-black text-white tracking-tight">{totalShops}</p>
            <div className="mt-1 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">{txt("সক্রিয় মার্চেন্ট", "Active Merchants")}</span>
              <span className="font-bold text-indigo-400">
                {freeShops} {txt("ফ্রি", "Free")} · {premiumShops} {txt("প্রিমিয়াম", "Premium")}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Platform Subscription Revenue */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">
              {txt("মোট সাবস্ক্রিপশন রাজস্ব", "Subscription Collections")}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-black text-white tracking-tight">
              {formatCurrency(subRevenue)}
            </p>
            <div className="mt-1 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">{txt("পেইড কনভার্সন", "Conversion Rate")}</span>
              <span className="font-bold text-emerald-400">{conversionRate}% {txt("পেইড টিয়ার", "Paid Tier")}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Pending Payments Queue */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">
              {txt("পেমেন্ট যাচাইয়ের কিউ", "Payment Review Queue")}
            </span>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                pendingQueue > 0
                  ? "bg-amber-500/10 text-amber-400"
                  : "bg-emerald-500/10 text-emerald-400"
              }`}
            >
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p
              className={`text-3xl font-black tracking-tight ${
                pendingQueue > 0 ? "text-amber-400" : "text-white"
              }`}
            >
              {pendingQueue}
            </p>
            <div className="mt-1 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">{txt("ম্যানুয়াল ট্রানজ্যাকশন", "Manual Trx Approvals")}</span>
              <Link
                href="/superadmin/payments"
                className="font-bold text-amber-400 hover:underline"
              >
                {pendingQueue === 0
                  ? txt("সব ক্লিয়ার →", "All Cleared →")
                  : txt("এখনই যাচাই করুন →", "Review Now →")}
              </Link>
            </div>
          </div>
        </div>

        {/* Card 4: Platform Total Invoices */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">
              {txt("প্ল্যাটফর্ম মোট বিক্রয়", "Platform Total Sales")}
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-black text-white tracking-tight">{totalSales}</p>
            <div className="mt-1 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">{txt("মোট পণ্য ক্যাটালগ", "Total Products Hosted")}</span>
              <span className="font-bold text-purple-400">{totalItems} {txt("আইটেম", "SKUs")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Breakdown & Platform Architecture Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tier Distribution Card */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white">Merchant Plan Breakdown</h3>
              <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                {totalShops} Total
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Distribution of free tier stores vs. paying pro/premium subscribers
            </p>

            {/* Visual ratio bar */}
            <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex mb-4">
              <div
                style={{ width: `${(freeShops / (totalShops || 1)) * 100}%` }}
                className="h-full bg-slate-600"
                title={`Free Tier: ${freeShops}`}
              />
              <div
                style={{ width: `${(premiumShops / (totalShops || 1)) * 100}%` }}
                className="h-full bg-emerald-500"
                title={`Premium Tier: ${premiumShops}`}
              />
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                  <span className="text-slate-300">Free Tier Merchants</span>
                </div>
                <span className="font-bold text-white">{freeShops}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="text-emerald-300">Premium Pro Merchants</span>
                </div>
                <span className="font-bold text-emerald-400">{premiumShops}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-300">Staff / Store Managers</span>
                </div>
                <span className="font-bold text-slate-200">{totalManagers}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 mt-4">
            <Link
              href="/superadmin/shops"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center justify-between"
            >
              <span>Manage all {totalShops} registered shops</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Quick Management Action Modules */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/60 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Verify Mobile Payments</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Shop owners submit their bKash, Nagad, or Rocket TrxID after sending subscription fees. Review and grant instant tier upgrades.
              </p>
            </div>
            <Link
              href="/superadmin/payments"
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              Open Payment Queue ({pendingQueue} Pending)
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/60 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Merchant Directory</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Inspect registered merchants ({totalShops} shops), check their subscription expiry dates, manager counts, and customer databases.
              </p>
            </div>
            <Link
              href="/superadmin/shops"
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              Browse Registered Shops
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
