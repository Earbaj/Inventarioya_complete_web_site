"use client";

import React from "react";
import { Invoice } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export interface StandardA4InvoiceProps {
  activeInv: Invoice;
  shopName: string;
  shopAddress: string;
  shopPhone: string;
  shopEmail: string;
  logoUrl?: string;
  displayCashier: string;
  discountVal: number;
  discountPercentage: number;
  isPaid: boolean;
  isPartial: boolean;
  isRefunded: boolean;
}

/**
 * স্ট্যান্ডার্ড A4 ইনভয়েস টেমপ্লেট (Standard A4 Invoice Template)
 * পূর্ণাঙ্গ ইনভয়েস: কাস্টমার লেজার টেবিল, আইটেমস, সাবটোটাল, ডিসকাউন্ট, গ্র্যান্ড টোটাল, পেইড, বকেয়া এবং স্বাক্ষর অংশ।
 */
export function StandardA4Invoice({
  activeInv,
  shopName,
  shopAddress,
  shopPhone,
  shopEmail,
  logoUrl,
  displayCashier,
  discountVal,
  discountPercentage,
  isPaid,
  isPartial,
  isRefunded,
}: StandardA4InvoiceProps) {
  const { txt, isBangla } = useLanguage();

  return (
    <div
      id="printable-invoice"
      className="bg-white text-slate-900 p-8 sm:p-10 rounded-xl shadow-xl mx-auto max-w-3xl min-h-[700px] text-xs font-sans space-y-6 print:shadow-none print:rounded-none print:p-4 print:max-w-none border border-slate-200 print:border-none"
    >
      {/* 1. Header: Company & Invoice Meta */}
      <div className="border-b-2 border-slate-900 pb-5">
        <div className="flex justify-between items-start gap-4">
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
              <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
                {shopName}
              </h1>
              <p className="text-[11px] text-slate-700 font-semibold mt-0.5">
                {txt("স্মার্ট ক্লাউড পিওএস ও রিটেল বিলিং", "Smart Cloud POS & Retail Billing")}
              </p>
              <p className="text-[11px] text-slate-600 mt-1">
                {shopAddress || txt("ঢাকা, বাংলাদেশ", "Dhaka, Bangladesh")}
              </p>
              <p className="text-[11px] text-slate-600">
                {txt("মোবাইল:", "Phone:")} {shopPhone || "+880 1700-000000"}
              </p>
              {shopEmail && (
                <p className="text-[10px] text-slate-500">
                  {txt("ইমেইল:", "Email:")} {shopEmail}
                </p>
              )}
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="inline-block bg-slate-900 text-white font-extrabold px-3 py-1 text-[11px] rounded uppercase tracking-wider mb-2">
              {txt("ক্যাশ মেমো ও ইনভয়েস", "RETAIL SALES INVOICE")}
            </span>
            <div className="text-[11px] text-slate-700 space-y-0.5">
              <p>
                <span className="font-semibold text-slate-900">{txt("ইনভয়েস নং:", "Invoice No:")}</span>{" "}
                <span className="font-mono font-bold text-indigo-700">
                  {activeInv.invoiceNumber || activeInv.invoiceNo}
                </span>
              </p>
              <p>
                <span className="font-semibold text-slate-900">{txt("তারিখ ও সময়:", "Date & Time:")}</span>{" "}
                {formatDate(activeInv.createdAt || activeInv.date)}
              </p>
              <div className="pt-1 flex items-center justify-end gap-1.5">
                <span className="font-semibold text-[10px] text-slate-600">{txt("পেমেন্ট স্ট্যাটাস:", "Payment:")}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1 ${
                    isPaid
                      ? "bg-emerald-100 text-emerald-800"
                      : isPartial
                      ? "bg-amber-100 text-amber-800"
                      : isRefunded
                      ? "bg-purple-100 text-purple-800"
                      : "bg-rose-100 text-rose-800"
                  }`}
                >
                  {isPaid ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                  ) : (
                    <AlertCircle className="w-3 h-3" />
                  )}
                  {isPaid ? txt("পরিশোধিত", "PAID") : isPartial ? txt("আংশিক জমা", "PARTIAL") : txt("বকেয়া", "DUE")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Customer & Register Info: Structured Table matching Customer Ledger */}
      <table className="w-full text-left text-xs border-collapse border border-slate-900">
        <tbody>
          <tr>
            <td className="w-1/6 bg-slate-100 font-bold uppercase text-[10px] text-slate-900 px-3 py-2 border border-slate-900">
              {txt("ক্রেতার নাম:", "Customer Name:")}
            </td>
            <td className="w-2/6 font-bold text-slate-900 text-xs px-3 py-2 border border-slate-900">
              {activeInv.customerName}
            </td>
            <td className="w-1/6 bg-slate-100 font-bold uppercase text-[10px] text-slate-900 px-3 py-2 border border-slate-900">
              {txt("ফোন নম্বর:", "Phone Number:")}
            </td>
            <td className="w-2/6 font-mono font-medium text-slate-900 px-3 py-2 border border-slate-900">
              {activeInv.customerPhone || txt("কাউন্টার / সাধারণ ক্রেতা", "Walk-in Customer")}
            </td>
          </tr>
          <tr>
            <td className="bg-slate-100 font-bold uppercase text-[10px] text-slate-900 px-3 py-2 border border-slate-900">
              {txt("ক্যাশিয়ার / স্টাফ:", "Served By:")}
            </td>
            <td className="font-medium text-slate-900 text-xs px-3 py-2 border border-slate-900">
              <span className="font-bold">{displayCashier}</span>
              <span className="text-[10px] text-slate-600 font-normal ml-1">
                ({activeInv.createdByRole || "Admin"})
              </span>
            </td>
            <td className="bg-slate-100 font-bold uppercase text-[10px] text-slate-900 px-3 py-2 border border-slate-900">
              {txt("শাখা / কাউন্টার:", "Branch / Outlet:")}
            </td>
            <td className="font-medium text-slate-900 px-3 py-2 border border-slate-900">
              {activeInv.branchName || txt("মূল সেলস কাউন্টার", "Main POS Counter")}
            </td>
          </tr>
        </tbody>
      </table>

      {/* 3. Items Line Items Table */}
      <table className="w-full text-left text-xs border-collapse border border-slate-900">
        <thead className="bg-slate-100 border-b border-slate-900 text-slate-900 font-bold uppercase text-[10px]">
          <tr>
            <th className="py-2 px-3 text-center w-10 border border-slate-900">#</th>
            <th className="py-2 px-3 border border-slate-900">{txt("পণ্যের বিবরণ", "Item Description")}</th>
            <th className="py-2 px-3 text-right border border-slate-900">{txt("একক দর", "Unit Price")}</th>
            <th className="py-2 px-3 text-center border border-slate-900">{txt("পরিমাণ", "Qty")}</th>
            {Number(activeInv.discount) > 0 && (
              <th className="py-2 px-3 text-right border border-slate-900">{txt("ছাড়", "Discount")}</th>
            )}
            <th className="py-2 px-3 text-right border border-slate-900">{txt("মোট মূল্য", "Total")}</th>
          </tr>
        </thead>
        <tbody className="text-slate-800">
          {activeInv.items.map((item, idx) => {
            const unitRate = Number(item.unitPrice ?? item.price ?? 0);
            const lineTotal = Number(
              item.totalPrice ?? item.total ?? unitRate * item.quantity
            );
            const itemDisc = Number(item.discount ?? 0);

            return (
              <tr key={idx} className="hover:bg-slate-50/50">
                <td className="py-2 px-3 text-center text-slate-600 font-mono text-[11px] border border-slate-300">
                  {idx + 1}
                </td>
                <td className="py-2 px-3 font-medium text-slate-900 border border-slate-300">
                  {item.name || item.productName}
                </td>
                <td className="py-2 px-3 text-right font-mono text-slate-700 border border-slate-300">
                  {formatCurrency(unitRate)}
                </td>
                <td className="py-2 px-3 text-center font-bold text-slate-900 border border-slate-300">
                  {item.quantity}
                </td>
                {Number(activeInv.discount) > 0 && (
                  <td className="py-2 px-3 text-right text-emerald-700 font-mono border border-slate-300">
                    {itemDisc > 0 ? (
                      <span>
                        -{formatCurrency(itemDisc)}
                        {(() => {
                          const itemPct =
                            (item as any).discountPercent ||
                            (item.discountType === "percent" || item.discountType === "percentage"
                              ? Number(item.discount)
                              : unitRate * item.quantity > 0
                              ? Math.round((itemDisc / (unitRate * item.quantity)) * 100 * 10) / 10
                              : 0);
                          return itemPct > 0 ? ` (${itemPct}%)` : "";
                        })()}
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                )}
                <td className="py-2 px-3 text-right font-bold font-mono text-slate-900 border border-slate-300">
                  {formatCurrency(lineTotal)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* 4. Bill Financial Calculations & Totals */}
      <div className="w-full">
        <table className="w-full text-left text-xs border-collapse border border-slate-900">
          <tbody className="text-slate-900">
            {/* Subtotal */}
            <tr className="border-b border-slate-200">
              <td className="py-2 px-3 font-medium text-slate-900 bg-slate-50 w-1/2">
                {txt("সাবটোটাল:", "Subtotal:")}
              </td>
              <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                {formatCurrency(activeInv.subtotal)}
              </td>
            </tr>

            {/* Discount */}
            <tr className="border-b border-slate-200">
              <td className="py-2 px-3 font-medium text-slate-900 bg-white">
                {txt("ছাড় / ডিসকাউন্ট:", "Discount:")}
              </td>
              <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700">
                {discountVal > 0 ? (
                  <span>
                    -{formatCurrency(discountVal)}
                    {discountPercentage > 0 && (
                      <span className="ml-1 text-[11px] font-semibold text-emerald-700">
                        ({discountPercentage}%)
                      </span>
                    )}
                  </span>
                ) : (
                  "৳ 0"
                )}
              </td>
            </tr>

            {/* Net Grand Total */}
            <tr className="border-b-2 border-slate-900 bg-slate-100 font-bold">
              <td className="py-2 px-3 font-bold text-slate-900 uppercase text-[11px] tracking-wide">
                {txt("সর্বমোট বিল:", "Net Grand Total:")}
              </td>
              <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                {formatCurrency(activeInv.grandTotal)}
              </td>
            </tr>

            {/* Paid Amount */}
            <tr className="border-b border-slate-200">
              <td className="py-2 px-3 font-medium text-slate-900 bg-white">
                {txt("পরিশোধিত টাকা:", "Paid Amount:")}
              </td>
              <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700">
                {formatCurrency(activeInv.paidAmount)}
              </td>
            </tr>

            {/* Due Balance */}
            <tr className="bg-slate-50">
              <td className="py-2 px-3 font-medium text-slate-900">
                {txt("বকেয়া ব্যালেন্স (বাকি):", "Due Balance:")}
              </td>
              <td className="py-2 px-3 text-right">
                {Number(activeInv.dueAmount) > 0 ? (
                  <span className="font-mono font-bold text-rose-600">
                    {formatCurrency(activeInv.dueAmount)}
                  </span>
                ) : (
                  <span className="font-bold text-emerald-700 text-xs bg-emerald-100 px-2 py-0.5 rounded inline-block">
                    {txt("বাকি নেই (৳ 0)", "Cleared (৳ 0)")}
                  </span>
                )}
              </td>
            </tr>

            {/* Change Return */}
            {Number(activeInv.paidAmount) > Number(activeInv.grandTotal) && (
              <tr className="bg-blue-50 border-t border-blue-200 text-blue-900">
                <td className="py-1.5 px-3 font-medium text-[11px]">
                  {txt("ফেরত দিন (Change):", "Change Return:")}
                </td>
                <td className="py-1.5 px-3 text-right font-mono font-bold text-xs">
                  {formatCurrency(Number(activeInv.paidAmount) - Number(activeInv.grandTotal))}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 5. Signature Lines */}
      <div className="pt-12 grid grid-cols-2 gap-8 text-center text-[10px] text-slate-600">
        <div>
          <div className="border-t border-slate-400 mx-auto w-44 pt-1 font-semibold">
            {txt("ক্রেতার স্বাক্ষর", "Customer Signature")}
          </div>
        </div>
        <div>
          <div className="border-t border-slate-400 mx-auto w-44 pt-1 font-semibold">
            {txt("কর্তৃপক্ষের স্বাক্ষর", "Authorized Cashier Signature")}
          </div>
        </div>
      </div>

      {/* 6. Bottom Copyright / Footer */}
      <div className="text-center pt-4 border-t border-slate-200 text-[10px] text-slate-400">
        {txt("আমাদের সাথে কেনাকাটা করার জন্য ধন্যবাদ!", "Thank you for your business!")}{" "}
        {txt("তারিখ:", "Generated on")}{" "}
        {new Date().toLocaleDateString(isBangla ? "bn-BD" : "en-GB", { day: "2-digit", month: "short", year: "numeric" })}.
      </div>
    </div>
  );
}
