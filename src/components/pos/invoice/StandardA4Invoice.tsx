"use client";

import React from "react";
import { Invoice } from "@/types";

export interface StandardA4InvoiceProps {
  activeInv: Invoice;
  shopName: string;
  shopAddress: string;
  shopPhone: string;
  shopEmail?: string;
  logoUrl?: string;
  displayCashier?: string;
  discountVal?: number;
  discountPercentage?: number;
  isPaid?: boolean;
  isPartial?: boolean;
  isRefunded?: boolean;
}

/**
 * Helper to format monetary values strictly matching the screenshot:
 * e.g., "TK 1,944.00"
 */
function formatTk(amount: number | string | undefined | null): string {
  const num = Number(amount || 0);
  if (isNaN(num)) return "TK 0.00";
  return `TK ${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Helper to format date strictly matching the sample invoice format:
 * e.g., "5 November 2026, 08:24 AM"
 */
function formatInvoiceDate(dateString?: string): string {
  if (!dateString) return "N/A";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const day = d.getDate();
    const month = d.toLocaleString("en-US", { month: "long" });
    const year = d.getFullYear();
    const time = d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return `${day} ${month} ${year}, ${time}`;
  } catch {
    return dateString;
  }
}

/**
 * স্ট্যান্ডার্ড সেলস ইনভয়েস টেমপ্লেট (Standard Sales Invoice Template)
 * ইউজার প্রদত্ত স্যাম্পল ফরম্যাট হুবহু অনুসরণ করে তৈরি:
 * - সেন্টারড শপ হেডার ও অনুভূমিক ডিভাইডার
 * - মেটাডাটা (Invoice #, Date, Customer Name, Phone)
 * - টেবিল (SL, Description, Qty, Price, Total) — কোনো কোড কলাম নেই
 * - সামারি বক্স (Subtotal, Discount, Total Amount) — কোনো ডিউ বা বকেয়া টেক্সট নেই
 * - কাস্টমার ও ওনার স্বাক্ষর
 */
export function StandardA4Invoice({
  activeInv,
  shopName,
  shopAddress,
  shopPhone,
  logoUrl,
  discountVal = 0,
}: StandardA4InvoiceProps) {
  const invoiceNumber =
    activeInv.invoiceNumber || activeInv.invoiceNo || (activeInv as any).id || "N/A";
  const formattedDate = formatInvoiceDate(activeInv.createdAt || activeInv.date);
  const customerName = activeInv.customerName || "Walk-in Customer";
  const customerPhone = activeInv.customerPhone || "N/A";

  const subtotalVal = Number(activeInv.subtotal || activeInv.originalSubtotal || 0);
  const discountNum = Number(discountVal || activeInv.discount || 0);
  const totalAmountVal = Number(
    activeInv.grandTotal || (activeInv as any).total || subtotalVal - discountNum
  );

  return (
    <div
      id="printable-invoice"
      className="bg-white text-slate-900 p-8 sm:p-12 rounded-xl shadow-xl mx-auto max-w-3xl min-h-[920px] text-xs font-sans flex flex-col justify-between border border-slate-200 print:border-none print:shadow-none print:p-6 print:m-0 print:max-w-none print:min-h-screen"
    >
      <div>
        {/* ১. হেডার সেকশন (সেন্টারড শপ বিবরণী) */}
        <div className="text-center pb-3">
          {logoUrl && (
            <div className="flex justify-center mb-2 print:mb-1">
              <img
                src={logoUrl}
                alt={shopName}
                className="h-10 w-auto max-w-[120px] object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </div>
          )}
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 uppercase">
            {shopName || "JTT Bright Electric & Accessories"}
          </h1>
          {shopAddress && (
            <p className="text-sm text-slate-700 mt-1 font-normal">
              {shopAddress}
            </p>
          )}
          {shopPhone && (
            <p className="text-sm text-slate-800 mt-0.5 font-normal">
              Phone: {shopPhone}
            </p>
          )}
        </div>

        {/* হেডার ডিভাইডার লাইন */}
        <div className="border-b border-black mt-3 mb-4" />

        {/* ২. ইনভয়েস মেটাডাটা (২টি সুবিন্যস্ত সারি) */}
        <div className="space-y-1.5 mb-5 text-sm text-slate-900">
          <div className="flex justify-between items-center">
            <span className="font-bold">
              Invoice #: {invoiceNumber}
            </span>
            <span className="text-slate-800 font-normal">
              Date: {formattedDate}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-bold">
              Customer Name:{" "}
              <span className="font-semibold">{customerName}</span>
            </span>
            <span className="text-slate-900">
              <span className="font-normal">Phone: </span>
              <span className="font-medium font-mono">{customerPhone}</span>
            </span>
          </div>
        </div>

        {/* ৩. আইটেম টেবিল (SL, Description, Qty, Price, Total) */}
        <div className="rounded-md border border-slate-300 overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/90 border-b border-slate-300 text-slate-900 font-bold">
                <th className="py-2.5 px-3 text-center w-12 border-r border-slate-300">
                  SL
                </th>
                <th className="py-2.5 px-3 text-left border-r border-slate-300">
                  Description
                </th>
                <th className="py-2.5 px-3 text-center w-16 border-r border-slate-300">
                  Qty
                </th>
                <th className="py-2.5 px-3 text-right w-28 border-r border-slate-300">
                  Price
                </th>
                <th className="py-2.5 px-3 text-right w-32">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="text-slate-900 divide-y divide-slate-200">
              {(activeInv.items || []).map((it, idx) => {
                const desc = it.name || it.productName || (it as any).description || "Item";
                const unitRate = Number(it.unitPrice ?? it.price ?? 0);
                const lineTotal = Number(
                  it.totalPrice ?? it.total ?? unitRate * Number(it.quantity || 0)
                );

                return (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 text-center font-mono border-r border-slate-300">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-3 text-left border-r border-slate-300 font-medium">
                      {desc}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono">
                      {it.quantity}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono border-r border-slate-300">
                      {formatTk(unitRate)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold">
                      {formatTk(lineTotal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ৪. সামারি বক্স (Subtotal, Discount, Total Amount) */}
        <div className="rounded-md border border-slate-300 p-3.5 space-y-2 text-sm text-slate-900 mt-4">
          <div className="flex justify-between items-center">
            <span className="font-normal">Subtotal</span>
            <span className="font-mono font-medium">{formatTk(subtotalVal)}</span>
          </div>
          <div className="flex justify-between items-center text-slate-800">
            <span className="font-normal">Discount</span>
            <span className="font-mono">
              {discountNum > 0 ? formatTk(discountNum) : "0.00"}
            </span>
          </div>
          <div className="flex justify-between items-center font-bold text-base pt-1">
            <span>Total Amount</span>
            <span className="font-mono">{formatTk(totalAmountVal)}</span>
          </div>
        </div>
      </div>

      {/* ৫. ফুটার স্বাক্ষর (পেজের নিচে কাস্টমার ও ওনার সিগনেচার) */}
      <div className="pt-32 pb-4 grid grid-cols-2 text-center text-xs text-slate-900 font-semibold print:pt-40">
        <div className="w-48 sm:w-56 mx-auto">
          <div className="border-t border-black pt-1.5">
            Customer Signature
          </div>
        </div>
        <div className="w-48 sm:w-56 mx-auto">
          <div className="border-t border-black pt-1.5">
            Owner Signature
          </div>
        </div>
      </div>
    </div>
  );
}
