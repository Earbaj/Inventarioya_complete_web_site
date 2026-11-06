"use client";

import React from "react";
import { Invoice } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

export interface CompactA4InvoiceProps {
  activeInv: Invoice;
  shopName: string;
  shopAddress: string;
  shopPhone: string;
  shopEmail: string;
  logoUrl?: string;
  displayCashier: string;
  discountVal: number;
  discountPercentage: number;
}

/**
 * কম্প্যাক্ট A4 ইনভয়েস টেমপ্লেট (Compact A4 Invoice Template)
 * ছোট ফন্ট, টাইট প্যাডিং এবং শুধুমাত্র সাবটোটাল, ডিসকাউন্ট ও গ্র্যান্ড টোটাল বিশিষ্ট স্পেস-সেভিং টেমপ্লেট।
 */
export function CompactA4Invoice({
  activeInv,
  shopName,
  shopAddress,
  shopPhone,
  shopEmail,
  logoUrl,
  displayCashier,
  discountVal,
  discountPercentage,
}: CompactA4InvoiceProps) {
  const { txt } = useLanguage();

  return (
    <div
      id="printable-compact-invoice"
      className="bg-white text-slate-900 p-6 sm:p-8 rounded-xl shadow-xl mx-auto max-w-3xl text-[11px] font-sans space-y-4 print:shadow-none print:rounded-none print:p-2 print:max-w-none border border-slate-200 print:border-none"
    >
      {/* 1. Header: Company & Compact Invoice Meta */}
      <div className="border-b-2 border-slate-900 pb-3 flex justify-between items-start gap-4">
        <div className="flex items-start gap-2.5">
          {logoUrl && (
            <img
              src={logoUrl}
              alt={shopName}
              className="w-11 h-11 rounded-lg object-contain border border-slate-200 shrink-0"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          )}
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">
              {shopName}
            </h1>
            <p className="text-[10px] text-slate-600 mt-0.5">
              {shopAddress || txt("ঢাকা, বাংলাদেশ", "Dhaka, Bangladesh")} • {txt("ফোন:", "Tel:")} {shopPhone || "+880 1700-000000"}
            </p>
            {shopEmail && (
              <p className="text-[9px] text-slate-500">
                {txt("ইমেইল:", "Email:")} {shopEmail}
              </p>
            )}
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="inline-block bg-slate-900 text-white font-black px-2 py-0.5 text-[9px] rounded uppercase tracking-wider mb-1">
            {txt("কম্প্যাক্ট ইনভয়েস", "COMPACT SALES INVOICE")}
          </span>
          <div className="text-[10px] text-slate-700 space-y-0.5">
            <p>
              <span className="font-semibold text-slate-900">{txt("ইনভয়েস:", "Inv:")}</span>{" "}
              <span className="font-mono font-bold text-indigo-700">
                {activeInv.invoiceNumber || activeInv.invoiceNo}
              </span>
            </p>
            <p>
              <span className="font-semibold text-slate-900">{txt("তারিখ:", "Date:")}</span>{" "}
              {formatDate(activeInv.createdAt || activeInv.date)}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Customer & Register Info: Compact Strip */}
      <div className="bg-slate-50 border border-slate-300 rounded-lg p-2.5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
        <div>
          <span className="text-slate-500 block uppercase font-bold text-[8.5px] tracking-wide">
            {txt("ক্রেতার নাম", "Customer Name")}
          </span>
          <span className="font-bold text-slate-900 truncate block">
            {activeInv.customerName || txt("সাধারণ ক্রেতা", "Walk-in")}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block uppercase font-bold text-[8.5px] tracking-wide">
            {txt("ফোন নম্বর", "Phone Number")}
          </span>
          <span className="font-mono font-medium text-slate-900 truncate block">
            {activeInv.customerPhone || "N/A"}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block uppercase font-bold text-[8.5px] tracking-wide">
            {txt("ক্যাশিয়ার / স্টাফ", "Served By")}
          </span>
          <span className="font-medium text-slate-900 truncate block">
            {displayCashier}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block uppercase font-bold text-[8.5px] tracking-wide">
            {txt("কাউন্টার / শাখা", "Branch / Outlet")}
          </span>
          <span className="font-medium text-slate-900 truncate block">
            {activeInv.branchName || txt("মূল কাউন্টার", "Main Counter")}
          </span>
        </div>
      </div>

      {/* 3. Items Table (Tight padding, smaller font) */}
      <table className="w-full text-left text-[10.5px] border-collapse border border-slate-900">
        <thead className="bg-slate-100 border-b border-slate-900 text-slate-900 font-bold uppercase text-[9.5px]">
          <tr>
            <th className="py-1.5 px-2.5 text-center w-8 border border-slate-900">#</th>
            <th className="py-1.5 px-2.5 border border-slate-900">{txt("পণ্যের বিবরণ", "Item Description")}</th>
            <th className="py-1.5 px-2.5 text-right border border-slate-900">{txt("একক দর", "Rate")}</th>
            <th className="py-1.5 px-2.5 text-center border border-slate-900">{txt("পরিমাণ", "Qty")}</th>
            {Number(activeInv.discount) > 0 && (
              <th className="py-1.5 px-2.5 text-right border border-slate-900">{txt("ছাড়", "Discount")}</th>
            )}
            <th className="py-1.5 px-2.5 text-right border border-slate-900">{txt("মোট মূল্য", "Total")}</th>
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
                <td className="py-1.5 px-2.5 text-center text-slate-600 font-mono text-[10px] border border-slate-300">
                  {idx + 1}
                </td>
                <td className="py-1.5 px-2.5 font-medium text-slate-900 border border-slate-300">
                  {item.name || item.productName}
                </td>
                <td className="py-1.5 px-2.5 text-right font-mono text-slate-700 border border-slate-300">
                  {formatCurrency(unitRate)}
                </td>
                <td className="py-1.5 px-2.5 text-center font-bold text-slate-900 border border-slate-300">
                  {item.quantity}
                </td>
                {Number(activeInv.discount) > 0 && (
                  <td className="py-1.5 px-2.5 text-right text-emerald-700 font-mono border border-slate-300">
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
                <td className="py-1.5 px-2.5 text-right font-bold font-mono text-slate-900 border border-slate-300">
                  {formatCurrency(lineTotal)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* 4. Bill Financial Calculations & Totals (ONLY Subtotal, Discount, Grand Total) */}
      <div className="w-full">
        <table className="w-full text-left text-[11px] border-collapse border border-slate-900">
          <tbody className="text-slate-900">
            {/* Subtotal */}
            <tr className="border-b border-slate-200">
              <td className="py-1.5 px-3 font-medium text-slate-800 bg-slate-50 w-1/2">
                {txt("সাবটোটাল:", "Subtotal:")}
              </td>
              <td className="py-1.5 px-3 text-right font-mono font-bold text-slate-900">
                {formatCurrency(activeInv.subtotal)}
              </td>
            </tr>

            {/* Discount */}
            <tr className="border-b border-slate-200">
              <td className="py-1.5 px-3 font-medium text-slate-800 bg-white">
                {txt("ছাড় / ডিসকাউন্ট:", "Discount:")}
              </td>
              <td className="py-1.5 px-3 text-right font-mono font-bold text-emerald-700">
                {discountVal > 0 ? (
                  <span>
                    -{formatCurrency(discountVal)}
                    {discountPercentage > 0 && (
                      <span className="ml-1 text-[10px] font-semibold text-emerald-700">
                        ({discountPercentage}%)
                      </span>
                    )}
                  </span>
                ) : (
                  "৳ 0"
                )}
              </td>
            </tr>

            {/* Net Grand Total (Final Row in Compact) */}
            <tr className="border-b-2 border-slate-900 bg-slate-100 font-bold">
              <td className="py-2 px-3 font-bold text-slate-900 uppercase text-[11px] tracking-wide">
                {txt("সর্বমোট বিল:", "Net Grand Total:")}
              </td>
              <td className="py-2 px-3 text-right font-mono font-bold text-base text-slate-900">
                {formatCurrency(activeInv.grandTotal)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 5. Signature Lines (Compact, no thank you line) */}
      <div className="pt-8 pb-2 grid grid-cols-2 gap-8 text-center text-[9.5px] text-slate-500">
        <div>
          <div className="border-t border-slate-400 mx-auto w-36 pt-1 font-semibold">
            {txt("ক্রেতার স্বাক্ষর", "Customer Signature")}
          </div>
        </div>
        <div>
          <div className="border-t border-slate-400 mx-auto w-36 pt-1 font-semibold">
            {txt("কর্তৃপক্ষের স্বাক্ষর", "Authorized Signature")}
          </div>
        </div>
      </div>
    </div>
  );
}
