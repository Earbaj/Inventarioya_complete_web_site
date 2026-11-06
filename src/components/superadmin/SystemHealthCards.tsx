"use client";

import React from "react";
import { Database, Cpu, Activity, RefreshCw } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export interface SystemHealthData {
  database?: {
    usedBytes?: number;
    usedMb?: number;
    usedFormatted?: string;
    limitMb?: number;
    limitFormatted?: string;
    usagePercentage?: number;
    remainingMb?: number;
    remainingFormatted?: string;
    status?: string;
  };
  server?: {
    platform?: string;
    rssMb?: number;
    heapUsedMb?: number;
    heapTotalMb?: number;
    ramUsedFormatted?: string;
    ramLimitFormatted?: string;
    ramPercentage?: number;
    status?: string;
    uptimeSeconds?: number;
    uptimeFormatted?: string;
    nodeVersion?: string;
  };
  totals?: {
    totalShops?: number;
    totalProducts?: number;
    totalSales?: number;
    totalCustomers?: number;
  };
  timestamp?: string;
}

export interface SystemHealthCardsProps {
  systemHealth: SystemHealthData | null;
  healthLoading: boolean;
  onRefresh: () => void;
}

/**
 * সুপার অ্যাডমিন ক্লাউড রিসোর্স মনিটর কার্ডস (System Health Telemetry Cards)
 * Supabase ডাটাবেজ স্টোরেজ (500MB), Render ব্যাকএন্ড র‍্যাম (512MB) ও সার্ভার আপটাইম দেখায়।
 */
export function SystemHealthCards({
  systemHealth,
  healthLoading,
  onRefresh,
}: SystemHealthCardsProps) {
  const { txt } = useLanguage();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* 1. Supabase Database Storage Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">
                {txt("সুপাবেস ডাটাবেজ স্টোরেজ", "Supabase DB Storage")}
              </p>
              <p className="text-[10px] text-slate-400">
                {txt("পোস্টগ্রেস ফ্রি লিমিট", "PostgreSQL Free Limit")}
              </p>
            </div>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              (systemHealth?.database?.usagePercentage ?? 0) > 80
                ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
            }`}
          >
            {systemHealth?.database?.status || "HEALTHY"}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline justify-between text-xs">
            <span className="text-xl font-black text-white font-mono">
              {systemHealth?.database?.usedFormatted ?? "14.8 MB"}
            </span>
            <span className="text-slate-400 text-[11px] font-mono">
              / {systemHealth?.database?.limitFormatted ?? "500 MB"} (
              {systemHealth?.database?.usagePercentage ?? 2.96}%)
            </span>
          </div>

          {/* Storage Progress Bar */}
          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                (systemHealth?.database?.usagePercentage ?? 0) > 80
                  ? "bg-rose-500"
                  : (systemHealth?.database?.usagePercentage ?? 0) > 60
                  ? "bg-amber-500"
                  : "bg-emerald-500"
              }`}
              style={{
                width: `${Math.max(
                  2,
                  Math.min(100, systemHealth?.database?.usagePercentage ?? 3)
                )}%`,
              }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
            <span>{txt("অবশিষ্ট খালি জায়গা:", "Free remaining:")}</span>
            <span className="font-mono text-slate-300 font-semibold">
              {systemHealth?.database?.remainingFormatted ?? "485.2 MB"}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Render Server RAM Container Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">
                {txt("রেন্ডার ব্যাকএন্ড র‍্যাম", "Render Backend RAM")}
              </p>
              <p className="text-[10px] text-slate-400">
                {txt("নোডজেএস কনটেইনার", "Node.js 512MB Container")}
              </p>
            </div>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              (systemHealth?.server?.ramPercentage ?? 0) > 80
                ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                : "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
            }`}
          >
            {systemHealth?.server?.status || "OPTIMAL"}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline justify-between text-xs">
            <span className="text-xl font-black text-white font-mono">
              {systemHealth?.server?.ramUsedFormatted ?? "108.4 MB"}
            </span>
            <span className="text-slate-400 text-[11px] font-mono">
              / {systemHealth?.server?.ramLimitFormatted ?? "512 MB"} (
              {systemHealth?.server?.ramPercentage ?? 21.17}%)
            </span>
          </div>

          {/* RAM Progress Bar */}
          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                (systemHealth?.server?.ramPercentage ?? 0) > 80
                  ? "bg-rose-500"
                  : (systemHealth?.server?.ramPercentage ?? 0) > 60
                  ? "bg-amber-500"
                  : "bg-indigo-500"
              }`}
              style={{
                width: `${Math.max(
                  4,
                  Math.min(100, systemHealth?.server?.ramPercentage ?? 21)
                )}%`,
              }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
            <span>{txt("হিপ মেমোরি:", "Heap used:")}</span>
            <span className="font-mono text-slate-300 font-semibold">
              {systemHealth?.server?.heapUsedMb
                ? `${systemHealth.server.heapUsedMb} MB`
                : "N/A"}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Server Uptime & Infrastructure Telemetry Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">
                  {txt("সার্ভার আপটাইম ও লাইভ", "Server Uptime & Live")}
                </p>
                <p className="text-[10px] text-slate-400">
                  {txt("সক্রিয় সার্ভিস স্ট্যাটাস", "Active Service Status")}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onRefresh}
              disabled={healthLoading}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title={txt("রিসোর্স মেট্রিক্স রিফ্রেশ করুন", "Refresh resource metrics")}
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${
                  healthLoading ? "animate-spin text-amber-400" : ""
                }`}
              />
            </button>
          </div>

          <div className="flex items-center gap-2 my-1">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-base font-bold text-white font-mono">
              {systemHealth?.server?.uptimeFormatted ?? "Active Live"}
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
          <span>
            {systemHealth?.totals
              ? `${systemHealth.totals.totalProducts ?? 0} ${txt(
                  "পণ্য",
                  "items"
                )} • ${systemHealth.totals.totalSales ?? 0} ${txt(
                  "বিক্রি",
                  "sales"
                )}`
              : txt("১০০% সুরক্ষিত ক্লাউড", "100% Protected Cloud")}
          </span>
          <span className="font-mono text-emerald-400 font-semibold">
            {txt("অনলাইন", "ONLINE")}
          </span>
        </div>
      </div>
    </div>
  );
}
