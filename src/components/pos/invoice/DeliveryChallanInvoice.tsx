"use client";

import React from "react";
import { Invoice } from "@/types";

export interface DeliveryChallanInvoiceProps {
  activeInv: Invoice;
  shopName: string;
  shopAddress: string;
  shopPhone: string;
  shopEmail?: string;
  logoUrl?: string;
  displayCashier?: string;
}

/**
 * Helper to format date strictly matching the sample waybill format:
 * e.g., "5 November 2026, 08:24 AM"
 */
function formatWaybillDate(dateString?: string): string {
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
 * ডেলিভারি চালান ও ওয়েবিল টেমপ্লেট (Delivery Challan & Waybill Template)
 * ইউজার প্রদত্ত স্যাম্পল ফরম্যাট হুবহু অনুসরণ করে তৈরি:
 * - সেন্টারড শপ হেডার ও ডিভাইডার
 * - মেটাডাটা (Invoice #, Date, Customer Name, Phone)
 * - টেবিল (SL, Description, Qty) — কোনো কোড, রেট বা আর্থিক কলাম নেই
 * - টোটাল কোয়ান্টিটি ব্লক
 * - কাস্টমার ও ওনার স্বাক্ষর
 */
export function DeliveryChallanInvoice({
  activeInv,
  shopName,
  shopAddress,
  shopPhone,
  logoUrl,
}: DeliveryChallanInvoiceProps) {
  const totalQuantity = (activeInv.items || []).reduce(
    (acc, it) => acc + Number(it.quantity || 0),
    0
  );

  const invoiceNumber =
    activeInv.invoiceNumber || activeInv.invoiceNo || (activeInv as any).id || "N/A";
  const formattedDate = formatWaybillDate(activeInv.createdAt || activeInv.date);
  const customerName = activeInv.customerName || "Walk-in Customer";
  const customerPhone = activeInv.customerPhone || "N/A";

  return (
    <div
      id="printable-challan"
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

        {/* ২. চালান মেটাডাটা (২টি সুবিন্যস্ত সারি) */}
        <div className="space-y-1.5 mb-5 text-sm text-slate-900">
          <div className="flex justify-between items-center">
            <span className="font-bold">
              WAYBILL (Invoice #: {invoiceNumber})
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

        {/* ৩. আইটেম টেবিল (SL, Description, Qty) */}
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
                <th className="py-2.5 px-4 text-center w-24">
                  Qty
                </th>
              </tr>
            </thead>
            <tbody className="text-slate-900 divide-y divide-slate-200">
              {(activeInv.items || []).map((it, idx) => {
                const desc = it.name || it.productName || (it as any).description || "Item";

                return (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 text-center font-mono border-r border-slate-300">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-3 text-left border-r border-slate-300 font-medium">
                      {desc}
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono font-semibold">
                      {it.quantity}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ৪. টোটাল কোয়ান্টিটি ব্লক */}
        <div className="rounded-md border border-slate-300 p-3 flex justify-between items-center text-sm font-bold text-slate-900 mt-4">
          <span>Total Quantity</span>
          <span className="font-mono text-base">{totalQuantity} pcs</span>
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
