"use client";

import React from "react";
import { Invoice } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

export interface Thermal80mmReceiptProps {
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
 * ৮০ মিমি থার্মাল পিওএস রসিদ (80mm POS Thermal Receipt)
 * রোল পেপার প্রিন্টারের জন্য ডিজাইনকৃত কম্প্যাক্ট রসিদ।
 */
export function Thermal80mmReceipt({
  activeInv,
  shopName,
  shopAddress,
  shopPhone,
  shopEmail,
  logoUrl,
  displayCashier,
  discountVal,
  discountPercentage,
}: Thermal80mmReceiptProps) {
  const { txt } = useLanguage();

  return (
    <div className="flex justify-center">
      <div
        id="thermal-receipt"
        className="bg-white text-slate-900 p-6 rounded-xl shadow-xl max-w-xs w-full text-xs font-mono leading-relaxed print:shadow-none print:rounded-none print:p-2"
      >
        {/* 1. Receipt Header */}
        <div className="text-center pb-3 border-b border-dashed border-slate-400">
          {logoUrl && (
            <img
              src={logoUrl}
              alt={shopName}
              className="w-10 h-10 mx-auto object-contain mb-1"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          )}
          <h2 className="text-sm font-bold tracking-wider uppercase">
            {shopName}
          </h2>
          <p className="text-[10px] text-slate-600">{shopAddress || txt("ঢাকা, বাংলাদেশ", "Dhaka, Bangladesh")}</p>
          <p className="text-[10px] text-slate-600">{txt("ফোন:", "Tel:")} {shopPhone || "+880 1700-000000"}</p>
          {shopEmail && <p className="text-[9px] text-slate-500">{txt("ইমেইল:", "Email:")} {shopEmail}</p>}
          <p className="text-[10px] font-bold mt-1 bg-slate-100 py-0.5">{txt("ক্যাশ রসিদ ও মেমো", "RETAIL POS RECEIPT")}</p>
        </div>

        {/* 2. Metadata */}
        <div className="py-2.5 border-b border-dashed border-slate-400 text-[10px] space-y-0.5">
          <div className="flex justify-between">
            <span>{txt("ইনভয়েস:", "Invoice:")}</span>
            <span className="font-bold">{activeInv.invoiceNumber || activeInv.invoiceNo}</span>
          </div>
          <div className="flex justify-between">
            <span>{txt("তারিখ:", "Date:")}</span>
            <span>{formatDate(activeInv.createdAt || activeInv.date)}</span>
          </div>
          <div className="flex justify-between">
            <span>{txt("কাস্টমার:", "Customer:")}</span>
            <span className="font-semibold">{activeInv.customerName}</span>
          </div>
          {activeInv.customerPhone && (
            <div className="flex justify-between">
              <span>{txt("মোবাইল:", "Phone:")}</span>
              <span>{activeInv.customerPhone}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>{txt("ক্যাশিয়ার:", "Cashier:")}</span>
            <span>{displayCashier}</span>
          </div>
          {activeInv.branchName && (
            <div className="flex justify-between">
              <span>{txt("শাখা:", "Branch:")}</span>
              <span>{activeInv.branchName}</span>
            </div>
          )}
        </div>

        {/* 3. Items Table */}
        <div className="py-2 border-b border-dashed border-slate-400">
          <table className="w-full text-left text-[10px]">
            <thead>
              <tr className="border-b border-slate-300 font-bold">
                <th className="py-1">{txt("পণ্য", "Item")}</th>
                <th className="py-1 text-center">{txt("পরিমাণ", "Qty")}</th>
                <th className="py-1 text-right">{txt("দর", "Rate")}</th>
                <th className="py-1 text-right">{txt("মোট", "Total")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeInv.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-1 pr-1 font-sans text-[10px] font-medium leading-tight">
                    {item.name || item.productName}
                  </td>
                  <td className="py-1 text-center">{item.quantity}</td>
                  <td className="py-1 text-right">
                    {formatCurrency(item.unitPrice ?? item.price ?? 0)}
                  </td>
                  <td className="py-1 text-right font-semibold">
                    {formatCurrency(
                      item.totalPrice ??
                        item.total ??
                        Number(item.unitPrice ?? item.price ?? 0) * item.quantity
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 4. Financial Summary */}
        <div className="py-2 border-b border-dashed border-slate-400 space-y-1 text-[10px]">
          <div className="flex justify-between">
            <span>{txt("সাবটোটাল:", "Subtotal:")}</span>
            <span>{formatCurrency(activeInv.subtotal)}</span>
          </div>
          {discountVal > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>{txt("ছাড় / ডিসকাউন্ট:", "Discount:")}</span>
              <span>
                -{formatCurrency(discountVal)}
                {discountPercentage > 0 && ` (${discountPercentage}%)`}
              </span>
            </div>
          )}
          <div className="flex justify-between text-xs font-bold pt-1 border-t border-slate-300">
            <span>{txt("সর্বমোট বিল:", "Grand Total:")}</span>
            <span>{formatCurrency(activeInv.grandTotal)}</span>
          </div>
          <div className="flex justify-between pt-0.5">
            <span>{txt(`জমা (${activeInv.paymentMethod || "CASH"}):`, `Paid (${activeInv.paymentMethod || "CASH"}):`)}</span>
            <span>{formatCurrency(activeInv.paidAmount)}</span>
          </div>
          {Number(activeInv.dueAmount) > 0 && (
            <div className="flex justify-between text-rose-600 font-bold">
              <span>{txt("বকেয়া বাকি:", "Due Balance:")}</span>
              <span>{formatCurrency(activeInv.dueAmount)}</span>
            </div>
          )}
        </div>

        {/* 5. Receipt Footer */}
        <div className="text-center pt-3 space-y-1">
          <p className="text-[10px] font-bold">{txt("আমাদের সাথে কেনাকাটা করার জন্য ধন্যবাদ!", "Thank you for shopping with us!")}</p>
          <p className="text-[9px] text-slate-500">
            {txt("রসিদ ছাড়া বিক্রিত পণ্য ফেরতযোগ্য নহে।", "Goods once sold cannot be returned without receipt.")}
          </p>
          <div className="pt-2 text-[8px] tracking-widest text-slate-400 uppercase">
            * {activeInv.invoiceNumber || activeInv.invoiceNo} *
          </div>
          <p className="text-[8px] text-slate-400">{txt("পাওয়ার্ড বাই Inventarioya ক্লাউড পিওএস", "Powered by Inventarioya Cloud POS")}</p>
        </div>
      </div>
    </div>
  );
}
