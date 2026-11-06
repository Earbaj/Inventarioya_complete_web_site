"use client";

import React from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import { ShoppingCart } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

export interface PaymentBreakdownDonutProps {
  paymentBreakdownData: Array<{
    name: string;
    value: number;
    color: string;
    percentage: number;
  }>;
  totalSales: number;
  collectionRatio: number;
}

/**
 * পেমেন্ট মাধ্যম ভিত্তিক ডোনাট চার্ট (Payment Breakdown Donut Chart)
 * নগদ, ডিজিটাল পেমেন্ট ও বকেয়া বিক্রয়ের তুলনামূলক অনুপাত এবং POS শর্টকাট দেখায়।
 */
export function PaymentBreakdownDonut({
  paymentBreakdownData,
  totalSales,
  collectionRatio,
}: PaymentBreakdownDonutProps) {
  const { txt } = useLanguage();
  const hasPaymentData = paymentBreakdownData.some((item) => item.value > 0);

  return (
    <div className="p-4 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
      <div>
        {/* হেডার */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <h3 className="text-sm font-bold text-white">
              {txt("পেমেন্ট ও বকেয়া অনুপাত", "Payment Breakdown")}
            </h3>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
            {collectionRatio}% {txt("আদায়", "Collected")}
          </span>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          {txt(
            "নগদ, ডিজিটাল পেমেন্ট ও বকেয়া বিক্রয়ের তুলনামূলক চার্ট",
            "Cash, digital channels & outstanding customer credit distribution"
          )}
        </p>

        {/* ডোনাট চার্ট */}
        <div className="h-44 w-full relative flex items-center justify-center">
          {!hasPaymentData ? (
            <div className="text-center text-slate-500 text-xs">
              {txt("কোনো পেমেন্ট তথ্য পাওয়া যায়নি", "No transaction records found yet")}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "10px",
                    fontSize: "12px",
                  }}
                  formatter={(val: any, name: any) => [`${formatCurrency(Number(val))}`, name]}
                />
                <Pie
                  data={paymentBreakdownData}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={68}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {paymentBreakdownData.map((entry, index) => (
                    <Cell
                      key={`pie-cell-${index}`}
                      fill={entry.color}
                      stroke="#0f172a"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          )}

          {/* কেন্দ্রে মোট বিক্রয় */}
          {hasPaymentData && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] text-slate-400 uppercase font-medium">
                {txt("মোট বিক্রয়", "Total")}
              </span>
              <span className="text-xs font-bold text-white font-mono">
                {formatCurrency(totalSales)}
              </span>
            </div>
          )}
        </div>

        {/* লিজেন্ড ও তালিকা */}
        <div className="mt-3 space-y-2 pt-2 border-t border-slate-800/80">
          {paymentBreakdownData.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-slate-300 font-medium">{item.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-white font-semibold">
                  {formatCurrency(item.value)}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono w-9 text-right">
                  {item.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* পিওএস শর্টকাট বাটন */}
      <div className="pt-4">
        <Link
          href="/dashboard/pos"
          className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-600/20 active:scale-95"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          {txt("পিওএস ক্যাশ রেজিস্টার খুলুন", "Open POS Cash Register")}
        </Link>
      </div>
    </div>
  );
}
