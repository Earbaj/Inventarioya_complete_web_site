"use client";

import React from "react";
import { Invoice } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import { Printer, X } from "lucide-react";

export interface SalesReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoices: Invoice[];
  totalSalesRevenue: number;
  totalPaidAmount: number;
  totalDueAmount: number;
  shopName: string;
  shopAddress: string;
  shopPhone: string;
  shopEmail: string;
  logoUrl: string;
  personName: string;
}

/**
 * এক্সিকিউটিভ বিক্রয় সারসংক্ষেপ প্রিন্ট ও PDF রিপোর্ট মোডাল
 * প্রিন্টযোগ্য লেআউটে সামগ্রিক রাজস্ব, বকেয়া ও ইনভয়েস তালিকা রেন্ডার করে।
 */
export function SalesReportModal({
  isOpen,
  onClose,
  invoices,
  totalSalesRevenue,
  totalPaidAmount,
  totalDueAmount,
  shopName,
  shopAddress,
  shopPhone,
  shopEmail,
  logoUrl,
  personName,
}: SalesReportModalProps) {
  const { txt } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[96vh] overflow-hidden flex flex-col my-auto">
        {/* মোডাল হেডার (প্রিন্টে লুকানো থাকবে) */}
        <div className="bg-slate-950 px-4 sm:px-6 py-3.5 border-b border-slate-800 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-indigo-400" />
            <span className="font-bold text-xs">
              {txt("এক্সিকিউটিভ বিক্রয় সারসংক্ষেপ রিপোর্ট", "Executive Sales Summary Report")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{txt("প্রিন্ট / PDF সংরক্ষণ", "Print / Save as PDF")}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* প্রিন্টযোগ্য কন্টেন্ট এলাকা */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950/60 print:p-0 print:bg-white print:overflow-visible">
          <div
            id="printable-sales-report"
            className="bg-white text-slate-900 p-8 sm:p-10 rounded-xl shadow-xl mx-auto max-w-3xl min-h-[700px] text-xs font-sans space-y-6 print:shadow-none print:rounded-none print:p-4 print:max-w-none border border-slate-200 print:border-none"
          >
            {/* হেডার ও শপ তথ্য */}
            <div className="border-b-2 border-slate-900 pb-4">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3.5">
                  {logoUrl && (
                    <img
                      src={logoUrl}
                      alt={shopName}
                      className="w-14 h-14 rounded-lg object-contain border border-slate-200 shrink-0"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  )}
                  <div>
                    <h1 className="text-xl font-black text-slate-900 uppercase">
                      {shopName}
                    </h1>
                    <p className="text-[11px] text-slate-700 font-semibold mt-0.5">
                      {txt("স্মার্ট ক্লাউড পিওএস ও সেলস লেজার অডিট", "Smart Cloud POS & Sales Ledger Audit")}
                    </p>
                    <p className="text-[11px] text-slate-600 mt-1">
                      {shopAddress || txt("ঢাকা, বাংলাদেশ", "Dhaka, Bangladesh")}
                    </p>
                    <p className="text-[11px] text-slate-600">
                      {txt("ফোন: ", "Phone: ")}{shopPhone || "+880 1700-000000"}
                    </p>
                    {shopEmail && (
                      <p className="text-[10px] text-slate-500">
                        {txt("ইমেইল: ", "Email: ")}{shopEmail}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="inline-block bg-slate-900 text-white font-bold px-3 py-1 text-[11px] rounded uppercase mb-1.5">
                    {txt("বিক্রয় সারসংক্ষেপ রিপোর্ট", "SALES SUMMARY REPORT")}
                  </span>
                  <p className="text-[11px] text-slate-700">
                    <span className="font-semibold text-slate-900">{txt("রিপোর্টের তারিখ:", "Report Date:")}</span>{" "}
                    {new Date().toLocaleDateString(txt("bn-BD", "en-GB"), {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-[11px] text-slate-700 mt-1">
                    <span className="font-semibold text-slate-900">{txt("তৈরি করেছেন:", "Generated By:")}</span>{" "}
                    <span className="font-medium text-slate-800">{personName}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* কেপিআই মেট্রিক্স */}
            <div className="grid grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                  {txt("মোট ইনভয়েস", "Total Invoices")}
                </span>
                <span className="text-xl font-bold text-slate-900 mt-0.5 block">
                  {invoices.length}
                </span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                  {txt("মোট বিক্রয়ের পরিমাণ", "Total Sales Volume")}
                </span>
                <span className="text-xl font-bold text-slate-900 mt-0.5 block">
                  {formatCurrency(totalSalesRevenue)}
                </span>
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <span className="text-[10px] text-emerald-800 uppercase font-semibold block">
                  {txt("মোট আদায় (পরিশোধিত)", "Collected (Paid)")}
                </span>
                <span className="text-xl font-bold text-emerald-700 mt-0.5 block">
                  {formatCurrency(totalPaidAmount)}
                </span>
              </div>
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
                <span className="text-[10px] text-rose-700 uppercase font-semibold block">
                  {txt("মোট বকেয়া (বাকি)", "Outstanding Due")}
                </span>
                <span className="text-xl font-black text-rose-600 mt-0.5 block">
                  {formatCurrency(totalDueAmount)}
                </span>
              </div>
            </div>

            {/* ইনভয়েস টেবিল */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 border-b border-slate-200 text-slate-800 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-2 px-3 text-center">{txt("ক্রমিক", "SL")}</th>
                    <th className="py-2 px-3">{txt("ইনভয়েস #", "Invoice #")}</th>
                    <th className="py-2 px-3">{txt("তারিখ", "Date")}</th>
                    <th className="py-2 px-3">{txt("কাস্টমার", "Customer")}</th>
                    <th className="py-2 px-3 text-right">{txt("মোট", "Total")}</th>
                    <th className="py-2 px-3 text-right">{txt("পরিশোধ", "Paid")}</th>
                    <th className="py-2 px-3 text-right">{txt("বাকি", "Due")}</th>
                    <th className="py-2 px-3 text-center">{txt("স্ট্যাটাস", "Status")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {invoices.map((inv, idx) => (
                    <tr key={inv.id || idx}>
                      <td className="py-1.5 px-3 text-center font-mono text-[10px]">
                        {idx + 1}
                      </td>
                      <td className="py-1.5 px-3 font-mono font-bold text-indigo-700">
                        {inv.invoiceNumber || inv.invoiceNo}
                      </td>
                      <td className="py-1.5 px-3 text-slate-600">
                        {formatDate(inv.createdAt || inv.date)}
                      </td>
                      <td className="py-1.5 px-3 font-medium">{inv.customerName}</td>
                      <td className="py-1.5 px-3 text-right font-mono font-bold">
                        {formatCurrency(inv.grandTotal)}
                      </td>
                      <td className="py-1.5 px-3 text-right font-mono text-emerald-700 font-semibold">
                        {formatCurrency(inv.paidAmount)}
                      </td>
                      <td className="py-1.5 px-3 text-right font-mono font-bold text-rose-600">
                        {Number(inv.dueAmount) > 0 ? formatCurrency(inv.dueAmount) : "-"}
                      </td>
                      <td className="py-1.5 px-3 text-center font-bold text-[10px]">
                        {inv.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-100 font-bold border-t border-slate-300">
                  <tr>
                    <td colSpan={4} className="py-2 px-3 text-right uppercase text-[10px]">
                      {txt("সর্বমোট:", "Grand Totals:")}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-900 font-mono">
                      {formatCurrency(totalSalesRevenue)}
                    </td>
                    <td className="py-2 px-3 text-right text-emerald-700 font-mono">
                      {formatCurrency(totalPaidAmount)}
                    </td>
                    <td className="py-2 px-3 text-right text-rose-600 font-mono">
                      {formatCurrency(totalDueAmount)}
                    </td>
                    <td className="py-2 px-3 text-center">-</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* স্বাক্ষর সেকশন */}
            <div className="pt-10 grid grid-cols-2 gap-8 text-center text-[10px] text-slate-600">
              <div>
                <div className="border-t border-slate-400 mx-auto w-40 pt-1 font-semibold">
                  {txt("স্টোর ম্যানেজার স্বাক্ষর", "Store Manager Signature")}
                </div>
              </div>
              <div>
                <div className="border-t border-slate-400 mx-auto w-40 pt-1 font-semibold">
                  {txt("অডিটর / হিসাবরক্ষক স্বাক্ষর", "Auditor / Accountant Signature")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
