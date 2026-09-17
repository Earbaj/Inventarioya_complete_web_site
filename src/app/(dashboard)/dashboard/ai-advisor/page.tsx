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

export default function AiAdvisorPage() {
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

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <DashboardHeader title="Gemini AI Business Intelligence & Forecasting" />

      <main className="p-6 space-y-8 max-w-7xl">
        {/* Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-purple-950/80 via-indigo-950/70 to-slate-900 border border-purple-500/30 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Google Gemini 1.5 Flash Analytics Engine</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white">
              Autonomous Demand & Growth Intelligence
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Analyzes historical POS invoices, seasonal buying spikes, supplier lead times, and retail margins to predict stock depletion and maximize shop profit margins.
            </p>
          </div>

          <button
            onClick={fetchAIIntelligence}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Re-run Gemini Analysis
          </button>
        </div>

        {/* Demand Forecasting Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-indigo-400" />
                Product Demand & Stockout Warnings (Next 30 Days)
              </h3>
              <p className="text-xs text-slate-400">
                Continuous forecasting based on recent sales velocity
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {forecasts.map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-white truncate">
                      {item.productName}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        item.riskLevel === "HIGH_DEFICIT"
                          ? "bg-rose-500/20 text-rose-400"
                          : item.riskLevel === "OVERSTOCKED"
                          ? "bg-amber-500/20 text-amber-400"
                          : "bg-emerald-500/20 text-emerald-400"
                      }`}
                    >
                      {item.riskLevel.replace("_", " ")}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 my-3 p-3 rounded-xl bg-slate-950/60 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Current Stock</span>
                      <span className="font-bold text-white">{item.currentStock} pcs</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">30-Day Demand</span>
                      <span className="font-bold text-purple-400">{item.predictedDemandNext30Days} pcs</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Suggested Reorder</span>
                      <span className="font-bold text-emerald-400">+{item.recommendedOrderQuantity} pcs</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed italic">
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
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                {advice.headline}
              </h3>
              <p className="text-xs text-slate-400">
                Actionable business intelligence generated from your store records
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {advice.insights.map((insight, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                      {insight.category} Insight
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold">
                      {insight.potentialImpact}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs text-slate-300 font-medium">
                      <span className="text-slate-500">Finding:</span> {insight.observation}
                    </p>
                    <div className="mt-2 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-emerald-300 font-semibold flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase block">Recommended Action:</span>
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
