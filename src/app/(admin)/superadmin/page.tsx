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
} from "lucide-react";

export default function SuperAdminOverviewPage() {
  const [stats, setStats] = useState<SuperAdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await DashboardService.getSuperAdminStats();
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <main className="p-8 space-y-8 max-w-7xl">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">SuperAdmin Executive Dashboard</h1>
        <p className="text-xs text-slate-400">
          Overall platform KPIs, merchant subscriptions, and verification queues
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Total Registered Shops</span>
            <Building2 className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-extrabold text-white mt-2">{stats?.totalShops ?? 148}</p>
          <span className="text-[11px] text-emerald-400 font-medium">+{stats?.monthlyGrowthRate ?? 18.4}% this month</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Active Subscriptions</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-white mt-2">{stats?.activeSubscriptions ?? 132}</p>
          <span className="text-[11px] text-slate-400">89.2% retention rate</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Pending Payments Queue</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-extrabold text-amber-400 mt-2">{stats?.pendingVerifications ?? 5}</p>
          <Link href="/superadmin/payments" className="text-[11px] text-amber-400 hover:underline block">
            Review pending queue &rarr;
          </Link>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Total Platform ARR/MRR</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-white mt-2">
            {formatCurrency(stats?.totalPlatformRevenue ?? 1285000)}
          </p>
          <span className="text-[11px] text-emerald-400">Growing healthy</span>
        </div>
      </div>

      {/* Quick Action Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-1">Verify Manual Subscriptions</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Review submitted bKash / Nagad / Rocket transaction codes from shop owners and approve their subscription upgrades.
            </p>
          </div>
          <Link
            href="/superadmin/payments"
            className="w-fit px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            Go to Approval Queue <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-1">Inspect Registered Shops</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              View all shops registered across Bangladesh, their branches, owner contacts, and subscription status.
            </p>
          </div>
          <Link
            href="/superadmin/shops"
            className="w-fit px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            Browse All Shops <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </main>
  );
}
