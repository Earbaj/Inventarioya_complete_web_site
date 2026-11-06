"use client";

import React from "react";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import { TrendingUp } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LabelList,
} from "recharts";

export interface SalesVelocityChartProps {
  chartData: Array<{
    date: string;
    fullDate: string;
    dayName: string;
    amount: number;
    orders: number;
    timestamp: number;
  }>;
  chartTimeframe: "weekly" | "monthly";
  setChartTimeframe: (tf: "weekly" | "monthly") => void;
  totalPeriodSales: number;
  activeDaysCount: number;
  maxSalesDay: { date: string; amount: number } | null;
}

/**
 * বিক্রয় পারফরম্যান্স বার চার্ট (Sales Velocity Bar Chart)
 * গত ৭ দিন বা ৩০ দিনের বিক্রয় ভলিউম, পিক দিন এবং সক্রিয় দিনের হিসাব নিখুঁতভাবে দেখায়।
 */
export function SalesVelocityChart({
  chartData,
  chartTimeframe,
  setChartTimeframe,
  totalPeriodSales,
  activeDaysCount,
  maxSalesDay,
}: SalesVelocityChartProps) {
  const { txt } = useLanguage();
  const hasAnyPeriodSales = totalPeriodSales > 0;

  // বারের মাথার ওপর কাস্টম টেক্সট লেবেল রেন্ডার
  const renderCustomBarLabel = (props: any) => {
    const { x, y, width, value } = props;
    if (x === undefined || y === undefined) return null;

    const isWeekly = chartTimeframe === "weekly";
    const numVal = Number(value || 0);

    if (!isWeekly && numVal <= 0) return null;

    const hasVal = numVal > 0;
    const text = hasVal
      ? numVal >= 1000
        ? `৳${(numVal / 1000).toFixed(numVal >= 10000 ? 0 : 1)}k`
        : `৳${numVal}`
      : "৳০";

    return (
      <text
        x={x + width / 2}
        y={y - 8}
        fill={hasVal ? "#10b981" : "#64748b"}
        textAnchor="middle"
        fontSize={isWeekly ? 10 : 8.5}
        fontWeight={hasVal ? 700 : 500}
        className="select-none font-mono tracking-tight"
      >
        {text}
      </text>
    );
  };

  return (
    <div className="lg:col-span-2 p-4 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex flex-col justify-between">
      <div>
        {/* হেডার: শিরোনাম ও টাইমফ্রেম সুইচ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                {chartTimeframe === "weekly"
                  ? txt("সাপ্তাহিক বিক্রয় পারফরম্যান্স", "Weekly Sales Velocity")
                  : txt("মাসিক বিক্রয় পারফরম্যান্স", "Monthly Sales Performance")}
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                {chartTimeframe === "weekly"
                  ? txt("গত ৭ দিন", "Last 7 Days")
                  : txt("গত ৩০ দিন", "Last 30 Days")}
              </span>
            </div>

            {/* সামারি রো */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-slate-400">
              <span>
                {txt("মোট বিক্রয়:", "Total Revenue:")}{" "}
                <strong className="text-emerald-400 font-bold font-mono">
                  {formatCurrency(totalPeriodSales)}
                </strong>
              </span>
              <span className="text-slate-600">•</span>
              <span>
                {txt("বিক্রয়ের দিন:", "Active Selling Days:")}{" "}
                <strong className="text-white font-medium">
                  {activeDaysCount}/{chartData.length} {txt("দিন", "days")}
                </strong>
              </span>
              {maxSalesDay && maxSalesDay.amount > 0 && (
                <>
                  <span className="text-slate-600 hidden sm:inline">•</span>
                  <span className="hidden sm:inline">
                    {txt("সর্বোচ্চ দিন:", "Peak Day:")}{" "}
                    <strong className="text-amber-400 font-semibold font-mono">
                      {maxSalesDay.date} ({formatCurrency(maxSalesDay.amount)})
                    </strong>
                  </span>
                </>
              )}
            </div>
          </div>

          {/* সাপ্তাহিক / মাসিক বাটন টগল */}
          <div className="flex items-start sm:items-center self-start sm:self-auto">
            <div className="inline-flex p-1 rounded-xl bg-slate-950 border border-slate-800 shadow-inner">
              <button
                type="button"
                onClick={() => setChartTimeframe("weekly")}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  chartTimeframe === "weekly"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-300 hover:text-white hover:bg-slate-800"
                }`}
              >
                {txt("সাপ্তাহিক", "Weekly")}
              </button>
              <button
                type="button"
                onClick={() => setChartTimeframe("monthly")}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  chartTimeframe === "monthly"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-300 hover:text-white hover:bg-slate-800"
                }`}
              >
                {txt("মাসিক", "Monthly")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* বার চার্ট এলাকা */}
      <div className="h-64 sm:h-72 w-full relative mt-2">
        {!hasAnyPeriodSales && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/95 border border-slate-700 text-xs font-medium text-white shadow-md backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <span className="text-white font-medium">
                {chartTimeframe === "weekly"
                  ? txt(
                      "গত ৭ দিনে কোনো বিক্রয় সম্পন্ন হয়নি (৳০.০০)",
                      "No sales recorded in the last 7 days (৳0.00)"
                    )
                  : txt(
                      "গত ৩০ দিনে কোনো বিক্রয় সম্পন্ন হয়নি (৳০.০০)",
                      "No sales recorded in the last 30 days (৳0.00)"
                    )}
              </span>
            </div>
          </div>
        )}

        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 22, right: 10, left: -15, bottom: 0 }}
            barSize={chartTimeframe === "weekly" ? 36 : 13}
          >
            <defs>
              <linearGradient id="activeBarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34d399" stopOpacity={1} />
                <stop offset="65%" stopColor="#10b981" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#059669" stopOpacity={0.8} />
              </linearGradient>

              <linearGradient id="zeroBarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#475569" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#1e293b" stopOpacity={0.25} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#334155" }}
              interval={chartTimeframe === "monthly" ? 3 : 0}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#334155" }}
              domain={[0, (dataMax: number) => (dataMax > 0 ? Math.ceil(dataMax * 1.25) : 1000)]}
              tickFormatter={(val) => `৳${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
            />
            <Tooltip
              cursor={{ fill: "rgba(99, 102, 241, 0.08)", radius: 8 }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  const isZero = data.amount === 0;
                  return (
                    <div className="bg-slate-900/95 border border-slate-700/80 p-3.5 rounded-xl shadow-2xl backdrop-blur-md text-xs min-w-[210px]">
                      <div className="flex items-center justify-between gap-3 mb-2 pb-2 border-b border-slate-800">
                        <span className="font-semibold text-slate-300">
                          {data.fullDate} {data.dayName ? `(${data.dayName})` : ""}
                        </span>
                        {isZero ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-medium">
                            {txt("বিক্রয় নেই", "No Sale")}
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            {txt("বিক্রয় হয়েছে", "Active Sale")}
                          </span>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-slate-400">{txt("মোট বিক্রয়:", "Total Sales:")}</span>
                          <span
                            className={`font-bold font-mono text-sm ${
                              isZero ? "text-slate-400" : "text-emerald-400"
                            }`}
                          >
                            {formatCurrency(data.amount)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-slate-400">{txt("ইনভয়েস সংখ্যা:", "Orders:")}</span>
                          <span className="text-white font-mono font-medium">
                            {data.orders} {txt("টি", "orders")}
                          </span>
                        </div>
                        {!isZero && data.orders > 0 && (
                          <div className="flex items-center justify-between gap-4 text-[11px] pt-1 border-t border-slate-800/60">
                            <span className="text-slate-500">{txt("গড় অর্ডার সাইজ:", "Avg Order:")}</span>
                            <span className="text-slate-300 font-mono">
                              {formatCurrency(Math.round(data.amount / data.orders))}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="amount"
              minPointSize={chartTimeframe === "weekly" ? 10 : 6}
              radius={[7, 7, 2, 2]}
              animationDuration={600}
            >
              <LabelList dataKey="amount" position="top" content={renderCustomBarLabel} />
              {chartData.map((entry, index) => {
                const isZero = entry.amount === 0;
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={isZero ? "url(#zeroBarGradient)" : "url(#activeBarGradient)"}
                    stroke={isZero ? "#334155" : "#10b981"}
                    strokeWidth={isZero ? 1 : 1.5}
                    className="transition-all hover:brightness-125 cursor-pointer"
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
