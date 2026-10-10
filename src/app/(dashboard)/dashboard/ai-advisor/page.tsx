"use client";

import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { AIService } from "@/lib/api/client";
import { AIDemandForecast, AIBusinessAdvice, AIQuotaStatus } from "@/types";
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  Package,
  Info,
  ShieldCheck,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function AiAdvisorPage() {
  const { txt } = useLanguage();
  const [forecasts, setForecasts] = useState<AIDemandForecast[]>([]);
  const [advice, setAdvice] = useState<AIBusinessAdvice | null>(null);
  const [quota, setQuota] = useState<AIQuotaStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialChecking, setInitialChecking] = useState(true);

  // Initial load: ONLY check localStorage cache & lightweight quota status. NEVER auto-hit AI endpoints!
  useEffect(() => {
    const currentMonthKey = new Date().toISOString().slice(0, 7); // e.g. "2026-10"
    const cacheKey = `inventarioya_ai_data_${currentMonthKey}`;

    try {
      const saved = localStorage.getItem(cacheKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.forecasts) && parsed.forecasts.length > 0) {
          setForecasts(parsed.forecasts);
        }
        if (parsed.advice && Array.isArray(parsed.advice.insights)) {
          setAdvice(parsed.advice);
        }
      }
    } catch (e) {
      console.warn("Could not load cached AI data from storage:", e);
    }

    // Only fetch quota status on load (cheap check, 0 tokens)
    AIService.getQuotaStatus()
      .then((q) => {
        if (q) setQuota(q);
      })
      .catch((err) => {
        console.error("Failed to load AI quota status", err);
      })
      .finally(() => {
        setInitialChecking(false);
      });
  }, []);

  // Explicit user action ONLY: Trigger Gemini AI analysis
  async function runManualAIAnalysis() {
    if (quota && (quota.isLimitReached || quota.usedThisMonth >= 1)) {
      return;
    }

    setLoading(true);
    try {
      const [fData, aData, qData] = await Promise.all([
        AIService.getDemandForecast(),
        AIService.getBusinessAdvisor(),
        AIService.getQuotaStatus(),
      ]);

      const validForecasts = Array.isArray(fData) ? fData : [];
      const validAdvice = aData && typeof aData === "object" && Array.isArray(aData.insights) ? aData : null;

      setForecasts(validForecasts);
      setAdvice(validAdvice);

      if (qData) {
        setQuota(qData);
      } else {
        setQuota((prev) =>
          prev
            ? { ...prev, usedThisMonth: prev.usedThisMonth + 1, isLimitReached: true }
            : null
        );
      }

      // Save to localStorage for current month so re-visiting the page NEVER re-hits the AI API!
      const currentMonthKey = new Date().toISOString().slice(0, 7);
      localStorage.setItem(
        `inventarioya_ai_data_${currentMonthKey}`,
        JSON.stringify({ forecasts: validForecasts, advice: validAdvice })
      );
    } catch (err) {
      console.error("Failed to execute AI analysis", err);
    } finally {
      setLoading(false);
    }
  }

  const formatRisk = (risk: string) => {
    if (risk === "HIGH_DEFICIT") return txt("উচ্চ ঘাটতি ঝুঁকি", "HIGH DEFICIT");
    if (risk === "OVERSTOCKED") return txt("অতিরিক্ত স্টক", "OVERSTOCKED");
    return txt("সঠিক স্টক", "OPTIMAL");
  };

  const hasData = (Array.isArray(forecasts) && forecasts.length > 0) || advice !== null;
  const isQuotaReached = Boolean(quota && (quota.isLimitReached || quota.usedThisMonth >= 1));

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <DashboardHeader title={txt("এআই বিজনেস ইন্টেলিজেন্স ও পূর্বাভাস", "Gemini AI Business Intelligence & Forecasting")} />

      <main className="p-4 sm:p-6 space-y-6 sm:space-y-8 max-w-7xl">
        {/* Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-purple-950/80 via-indigo-950/70 to-slate-900 border border-purple-500/30 p-5 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{txt("গুগল জেমিনি অ্যানালিটিক্স ইঞ্জিন", "Google Gemini Analytics Engine")}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold">
                <span>
                  {txt("মাসিক কোটা:", "Monthly Quota:")}{" "}
                  <strong className={isQuotaReached ? "text-amber-300 font-bold" : "text-emerald-300 font-bold"}>
                    {quota?.usedThisMonth ?? (hasData ? 1 : 0)}/{quota?.monthlyLimit ?? 1}
                  </strong>{" "}
                  {txt("(মাসে সর্বোচ্চ ১ বার)", "(Max 1/month)")}
                </span>
              </div>
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
            onClick={runManualAIAnalysis}
            disabled={loading || isQuotaReached}
            className="w-full sm:w-auto justify-center px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all shrink-0"
            title={isQuotaReached ? txt("চলতি মাসের নির্ধারিত ১ বার কোটা ইতিমধ্যে ব্যবহৃত হয়েছে", "Monthly 1-time quota has already been used") : ""}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>
              {loading
                ? txt("বিশ্লেষণ হচ্ছে...", "Analyzing...")
                : isQuotaReached
                ? txt("মাসিক কোটা শেষ (১/১)", "Monthly Limit Reached (1/1)")
                : txt("এআই বিশ্লেষণ চালান", "Run Gemini Analysis")}
            </span>
          </button>
        </div>

        {/* Quota Limit Notice */}
        {isQuotaReached && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 flex items-start gap-3 text-xs leading-relaxed shadow-sm">
            <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">
                {txt(
                  "চলতি মাসের জেমিনি এআই কোটা (১/১) ইতিমধ্যে সম্পন্ন হয়েছে।",
                  "Monthly Gemini AI quota (1/1) has been reached for this month."
                )}
              </p>
              <p className="text-amber-700 dark:text-amber-400 mt-0.5">
                {txt(
                  "টোকেন ও ক্লাউড খরচ বাঁচাতে প্রতিটি দোকানের জন্য মাসে ১ বার এআই বিশ্লেষণ নির্ধারিত। নিচে চলতি মাসের সংরক্ষিত বিশ্লেষণ দেখানো হচ্ছে। আগামী মাসের ১ তারিখে আপনার নতুন কোটা পুনরায় সক্রিয় হবে।",
                  "To optimize API token and cloud costs, AI intelligence is limited to 1 run per month per shop. Your previously saved AI analysis is displayed below. The quota will renew on the 1st of next month."
                )}
              </p>
            </div>
          </div>
        )}

        {/* Empty State when no analysis has been run yet this month */}
        {!hasData && !loading && !initialChecking && (
          <div className="rounded-3xl border border-dashed border-purple-500/30 dark:bg-slate-900/50 bg-purple-50/50 p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-4 my-8">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/15 text-purple-600 dark:text-purple-400 mx-auto flex items-center justify-center">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold dark:text-white text-slate-900">
              {txt("চলতি মাসের এআই বিশ্লেষণ এখনও চালানো হয়নি", "No AI Intelligence Run Yet This Month")}
            </h3>
            <p className="text-xs sm:text-sm dark:text-slate-400 text-slate-600 leading-relaxed">
              {txt(
                "টোকেন খরচ বাঁচাতে এই পেজে প্রবেশ করলে স্বয়ংক্রিয়ভাবে কোনো এপিআই কল হয় না। আপনার দোকানের বিক্রয় ও স্টকের হালনাগাদ ডেটা থেকে নতুন রিপোর্ট তৈরি করতে নিচের বাটনে ক্লিক করুন (মাসে সর্বোচ্চ ১ বার চালানো যাবে)।",
                "To save token costs, no API calls are made automatically on page visit. Click the button below to generate intelligent predictions and growth tips from your store records (allowed once per month)."
              )}
            </p>
            <button
              onClick={runManualAIAnalysis}
              disabled={loading || isQuotaReached}
              className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold inline-flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>{txt("এআই বিশ্লেষণ শুরু করুন (মাসে ১ বার)", "Generate AI Analysis (1 time/month)")}</span>
            </button>
          </div>
        )}

        {/* Demand Forecasting & Insights Section */}
        {hasData && (
          <>
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
                {Array.isArray(forecasts) && forecasts.length > 0 ? (
                  forecasts.map((item, idx) => (
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
                  ))
                ) : !loading ? (
                  <div className="col-span-full p-8 text-center rounded-2xl dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 text-xs dark:text-slate-400 text-slate-500">
                    {txt("বর্তমানে কোনো পূর্বাভাস পণ্য পাওয়া যায়নি।", "No demand forecast products available at the moment.")}
                  </div>
                ) : null}
              </div>
            </div>

            {/* Business Growth Advisor Insights */}
            {advice && Array.isArray(advice.insights) && advice.insights.length > 0 && (
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
          </>
        )}
      </main>
    </div>
  );
}

