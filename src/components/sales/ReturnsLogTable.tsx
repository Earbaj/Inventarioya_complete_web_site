"use client";

import React from "react";
import { ReturnRecord, Invoice } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import { ShimmerTableRows } from "@/components/ui/ShimmerSkeleton";
import { ReturnMetricsCards } from "@/components/sales/ReturnMetricsCards";
import {
  RotateCcw,
  Search,
  X,
  RefreshCw,
  Eye,
} from "lucide-react";

export interface ReturnsLogTableProps {
  returnsList: ReturnRecord[];
  filteredReturns: ReturnRecord[];
  loadingReturns: boolean;
  returnsSearchQuery: string;
  setReturnsSearchQuery: (q: string) => void;
  onRefresh: () => void;
  invoices: Invoice[];
  onOpenInvoice: (inv: Invoice, mode: "a4" | "compact" | "thermal") => void;
}

/**
 * বিক্রয় ফেরত লগ টেবিল (Returns History Table Section)
 * রিটার্ন ট্রানজেকশন, স্টক সমন্বয় এবং রিটার্নকৃত পণ্যের বিস্তারিত তালিকা।
 */
export function ReturnsLogTable({
  returnsList,
  filteredReturns,
  loadingReturns,
  returnsSearchQuery,
  setReturnsSearchQuery,
  onRefresh,
  invoices,
  onOpenInvoice,
}: ReturnsLogTableProps) {
  const { txt } = useLanguage();

  const totalRefundAmount = returnsList.reduce(
    (acc, r) => acc + (Number(r.totalRefund ?? r.totalRefundAmount) || 0),
    0
  );

  const totalRestockedQty = returnsList.reduce(
    (acc, r) =>
      acc +
      (r.returnedItems?.reduce(
        (iSum, i) => iSum + (Number(i.quantity) || 0),
        0
      ) || 0),
    0
  );

  const dueAdjustedAmount = returnsList
    .filter((r) => r.refundMethod === "due_adjust")
    .reduce(
      (acc, r) => acc + (Number(r.totalRefund ?? r.totalRefundAmount) || 0),
      0
    );

  const renderMethodBadge = (refundMethod?: string) => {
    const m = (refundMethod || "cash").toLowerCase();
    if (m === "due_adjust") {
      return (
        <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[10px] font-bold">
          {txt("বকেয়া সমন্বয়", "Due Adjust")}
        </span>
      );
    }
    if (m === "bkash") {
      return (
        <span className="px-2 py-0.5 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400 text-[10px] font-bold">
          {txt("বিকাশ", "bKash")}
        </span>
      );
    }
    if (m === "nagad") {
      return (
        <span className="px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-[10px] font-bold">
          {txt("নগদ (Nagad)", "Nagad")}
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
        {txt("ক্যাশ / নগদ", "Cash")}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* রিটার্ন কেপিআই মেট্রিক্স কার্ডস */}
      <ReturnMetricsCards
        totalReturnsCount={returnsList.length}
        totalRefundAmount={totalRefundAmount}
        totalRestockedQty={totalRestockedQty}
        dueAdjustedAmount={dueAdjustedAmount}
      />

      {/* সার্চ ও রিফ্রেশ টুলবার */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={returnsSearchQuery}
            onChange={(e) => setReturnsSearchQuery(e.target.value)}
            placeholder={txt(
              "ইনভয়েস নং, কাস্টমার নাম বা ফোন...",
              "Search by invoice, customer name or phone..."
            )}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          {returnsSearchQuery && (
            <button
              onClick={() => setReturnsSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={onRefresh}
            disabled={loadingReturns}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingReturns ? "animate-spin text-indigo-400" : ""}`} />
            <span>{txt("রিফ্রেশ", "Refresh")}</span>
          </button>
        </div>
      </div>

      {/* রিটার্ন টেবিল */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                <th className="py-3 px-4">{txt("তারিখ ও সময়", "Date & Time")}</th>
                <th className="py-3 px-4">{txt("ইনভয়েস নং", "Invoice #")}</th>
                <th className="py-3 px-4">{txt("কাস্টমার", "Customer")}</th>
                <th className="py-3 px-4">{txt("ফেরতকৃত পণ্য ও পরিমাণ", "Returned Items & Qty")}</th>
                <th className="py-3 px-4 text-center">{txt("রিফান্ড মাধ্যম", "Refund Method")}</th>
                <th className="py-3 px-4 text-right">{txt("মোট রিফান্ড", "Total Refund")}</th>
                <th className="py-3 px-4 text-right">{txt("অ্যাকশন", "Actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loadingReturns ? (
                <ShimmerTableRows rows={4} cols={7} />
              ) : filteredReturns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <RotateCcw className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
                    <p className="font-medium">
                      {txt("কোন রিটার্ন রেকর্ড পাওয়া যায়নি", "No return records found")}
                    </p>
                    <p className="text-[11px] text-slate-600 mt-1">
                      {txt(
                        "ইনভয়েস তালিকা থেকে 'পণ্য ফেরত / রিটার্ন নিন' ক্লিক করে নতুন রিটার্ন প্রক্রিয়া করুন।",
                        "Select 'Process Sales Return' from an invoice to record a return."
                      )}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredReturns.map((ret) => {
                  const linkedInv = invoices.find(
                    (inv) => inv.id === ret.saleId || inv.invoiceNumber === ret.invoiceNumber
                  );

                  return (
                    <tr key={ret.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                        {formatDate(ret.date ? String(ret.date) : ret.createdAt ? String(ret.createdAt) : "")}
                      </td>
                      <td className="py-3 px-4 font-bold text-white font-mono">
                        #{ret.invoiceNumber || ret.saleId?.slice(-6) || "INV"}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        <p className="font-semibold text-white">
                          {ret.customerName || txt("সাধারণ খদ্দের (Walk-in)", "Walk-in Customer")}
                        </p>
                        {ret.customerPhone && (
                          <p className="text-[11px] text-slate-500 font-mono">
                            {ret.customerPhone}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1 max-w-xs">
                          {ret.returnedItems?.map((item, idx) => {
                            const itemTotalRefund =
                              item.refundAmount != null
                                ? Number(item.refundAmount)
                                : Number(item.refundAmountPerUnit || 0) * item.quantity;
                            return (
                              <div
                                key={idx}
                                className="flex items-center justify-between gap-2 text-[11px] bg-slate-950/40 px-2 py-1 rounded-lg border border-slate-800/60"
                              >
                                <span className="text-slate-200 truncate font-medium">
                                  {item.name || item.itemId}
                                </span>
                                <span className="shrink-0 text-amber-400 font-mono font-bold">
                                  × {item.quantity} ({formatCurrency(itemTotalRefund)})
                                </span>
                              </div>
                            );
                          })}
                          {ret.reason && (
                            <p className="text-[10px] text-slate-500 italic mt-0.5">
                              {txt("কারণ:", "Reason:")} {ret.reason}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {renderMethodBadge(ret.refundMethod)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-rose-400 text-sm">
                        -{formatCurrency(Number(ret.totalRefund ?? ret.totalRefundAmount ?? 0))}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {linkedInv ? (
                          <button
                            type="button"
                            onClick={() => onOpenInvoice(linkedInv, "a4")}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 text-xs font-semibold transition-colors cursor-pointer"
                            title={txt("মূল ইনভয়েস দেখুন", "View Original Invoice")}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>{txt("ইনভয়েস", "Invoice")}</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-600">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
