"use client";

import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { AIService } from "@/lib/api/client";
import { AIDemandForecast, AIBusinessAdvice } from "@/types";
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  Package,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function AiAdvisorPage() {
  const { txt } = useLanguage();
  const [forecasts, setForecasts] = useState<AIDemandForecast[]>([]);
  const [advice, setAdvice] = useState<AIBusinessAdvice | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchAIIntelligence() {
    setLoading(true);
    try {
      const [fData, aData] = await Promise.all([
        AIService.getDemandForecast(),
        AIService.getBusinessAdvisor(),
      ]);
      setForecasts(fData);
      setAdvice(aData);
    } catch (err) {
      console.error("Failed to load AI intelligence", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAIIntelligence();
  }, []);

  const formatRisk = (risk: string) => {
    if (risk === "HIGH_DEFICIT") return txt("উচ্চ ঘাটতি ঝুঁকি", "HIGH DEFICIT");
    if (risk === "OVERSTOCKED") return txt("অতিরিক্ত স্টক", "OVERSTOCKED");
    return txt("সঠিক স্টক", "OPTIMAL");
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <DashboardHeader title={txt("এআই বিজনেস ইন্টেলিজেন্স ও পূর্বাভাস", "Gemini AI Business Intelligence & Forecasting")} />

      <main className="p-4 sm:p-6 space-y-6 sm:space-y-8 max-w-7xl">
        {/* Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-purple-950/80 via-indigo-950/70 to-slate-900 border border-purple-500/30 p-5 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{txt("গুগল জেমিনি অ্যানালিটিক্স ইঞ্জিন", "Google Gemini Analytics Engine")}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              {txt("ব্যবসায়িক চাহিদা ও বৃদ্ধির স্বয়ংক্রিয় বুদ্ধিমত্তা", "Autonomous Demand & Growth Intelligence")}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {txt(
                "দোকানের বিক্রয় গতি, সিজনাল ট্রেন্ড ও মার্জিন বিশ্লেষণ করে স্টক শেষ হওয়ার পূর্বাভাস দেয় এবং মুনাফা বৃদ্ধি করে।",
                "Analyzes historical POS invoices, seasonal buying spikes, supplier lead times, and retail margins to predict stock depletion and maximize shop profit margins."
              )}
            </p>
          </div>

          <button
            onClick={fetchAIIntelligence}
            disabled={loading}
            className="w-full sm:w-auto justify-center px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>{loading ? txt("বিশ্লেষণ হচ্ছে...", "Analyzing...") : txt("পুনরায় এআই বিশ্লেষণ চালান", "Re-run Gemini Analysis")}</span>
          </button>
        </div>

        {/* Demand Forecasting Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold dark:text-white text-slate-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                {txt("পণ্যের চাহিদা ও স্টক ঘাটতির সতর্কতা (পরবর্তী ৩০ দিন)", "Product Demand & Stockout Warnings (Next 30 Days)")}
              </h3>
              <p className="text-xs dark:text-slate-400 text-slate-500">
                {txt("সাম্প্রতিক বিক্রির গতিবেগের ভিত্তিতে ধারাবাহিক পূর্বাভাস", "Continuous forecasting based on recent sales velocity")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {forecasts.map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 hover:border-purple-500/40 transition-all flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold dark:text-white text-slate-900 truncate">
                      {item.productName}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        item.riskLevel === "HIGH_DEFICIT"
                          ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                          : item.riskLevel === "OVERSTOCKED"
                          ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                          : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      }`}
                    >
                      {formatRisk(item.riskLevel)}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 my-3 p-3 rounded-xl dark:bg-slate-950/60 bg-slate-50 border dark:border-slate-800/80 border-slate-200 text-xs">
                    <div>
                      <span className="text-[10px] dark:text-slate-400 text-slate-500 block">{txt("বর্তমান স্টক", "Current Stock")}</span>
                      <span className="font-bold dark:text-white text-slate-900">{item.currentStock} {txt("টি", "pcs")}</span>
                    </div>
                    <div>
                      <span className="text-[10px] dark:text-slate-400 text-slate-500 block">{txt("৩০ দিনের চাহিদা", "30-Day Demand")}</span>
                      <span className="font-bold text-purple-600 dark:text-purple-400">{item.predictedDemandNext30Days} {txt("টি", "pcs")}</span>
                    </div>
                    <div>
                      <span className="text-[10px] dark:text-slate-400 text-slate-500 block">{txt("অর্ডারের সুপারিশ", "Suggested Reorder")}</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">+{item.recommendedOrderQuantity} {txt("টি", "pcs")}</span>
                    </div>
                  </div>

                  <p className="text-xs dark:text-slate-400 text-slate-600 leading-relaxed italic">
                    "{item.reasoning}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Business Growth Advisor Insights */}
        {advice && (
          <div>
            <div className="mb-4">
              <h3 className="text-sm font-bold dark:text-white text-slate-900 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                {advice.headline}
              </h3>
              <p className="text-xs dark:text-slate-400 text-slate-500">
                {txt("আপনার দোকানের হিসাব থেকে তৈরি কার্যকর ব্যবসায়িক দিকনির্দেশনা", "Actionable business intelligence generated from your store records")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {advice.insights.map((insight, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 space-y-3 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                      {insight.category} {txt("বিশ্লেষণ", "Insight")}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                      {insight.potentialImpact}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs dark:text-slate-300 text-slate-700 font-medium">
                      <span className="dark:text-slate-500 text-slate-500">{txt("পর্যবেক্ষণ:", "Finding:")}</span> {insight.observation}
                    </p>
                    <div className="mt-2 p-3 rounded-xl dark:bg-slate-950 bg-slate-50 border dark:border-slate-800 border-slate-200 text-xs text-emerald-700 dark:text-emerald-300 font-semibold flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="dark:text-slate-400 text-slate-500 text-[10px] uppercase block">{txt("সুপারিশকৃত পদক্ষেপ:", "Recommended Action:")}</span>
                        {insight.actionableStep}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

