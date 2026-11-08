"use client";

import React from "react";
import { Invoice } from "@/types";
import { formatDate } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import { Truck, CheckCircle2, PackageCheck } from "lucide-react";

export interface DeliveryChallanInvoiceProps {
  activeInv: Invoice;
  shopName: string;
  shopAddress: string;
  shopPhone: string;
  shopEmail: string;
  logoUrl?: string;
  displayCashier: string;
}

/**
 * ডেলিভারি চালান ও ওয়েবিল টেমপ্লেট (Delivery Challan & Waybill Template)
 * কোনো মূল্য, রেট, ডিসকাউন্ট বা সাবটোটাল ব্যতিরেকে কেবল ক্রমিক নং, পণ্যের বিবরণ,
 * পরিমাণ এবং রিসিভারের প্রাপ্তিস্বীকার ও স্বাক্ষর প্রিন্ট করে।
 */
export function DeliveryChallanInvoice({
  activeInv,
  shopName,
  shopAddress,
  shopPhone,
  shopEmail,
  logoUrl,
  displayCashier,
}: DeliveryChallanInvoiceProps) {
  const { txt } = useLanguage();

  const totalQuantity = (activeInv.items || []).reduce(
    (acc, it) => acc + Number(it.quantity || 0),
    0
  );

  return (
    <div
      id="printable-challan"
      className="bg-white text-slate-900 p-8 sm:p-10 rounded-xl shadow-xl mx-auto max-w-3xl min-h-[700px] text-xs font-sans space-y-6 print:shadow-none print:rounded-none print:p-4 print:max-w-none border border-slate-200 print:border-none"
    >
      {/* ১. হেডার ও চালান তথ্য */}
      <div className="border-b-2 border-slate-900 pb-5">
        <div className="flex justify-between items-start gap-4">
          {/* দোকান বিবরণ */}
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
                {txt("পণ্য সরবরাহ ও ডেলিভারি চালান", "Goods Delivery & Dispatch Document")}
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

          {/* চালান ব্যাজ ও রেফারেন্স */}
          <div className="text-right shrink-0">
            <span className="inline-block bg-emerald-700 text-white font-extrabold px-3 py-1 text-[11px] rounded uppercase tracking-wider mb-2">
              {txt("ডেলিভারি চালান / ওয়েবিল", "DELIVERY CHALLAN / WAYBILL")}
            </span>
            <div className="text-[11px] text-slate-700 space-y-0.5">
              <p>
                <span className="font-semibold text-slate-900">
                  {txt("চালান নং:", "Challan No:")}
                </span>{" "}
                <span className="font-mono font-bold text-emerald-800">
                  CHL-{activeInv.invoiceNumber || activeInv.invoiceNo || "N/A"}
                </span>
              </p>
              <p>
                <span className="font-semibold text-slate-900">
                  {txt("ইনভয়েস রেফারেন্স:", "Invoice Ref:")}
                </span>{" "}
                <span className="font-mono text-slate-800">
                  #{activeInv.invoiceNumber || activeInv.invoiceNo}
                </span>
              </p>
              <p>
                <span className="font-semibold text-slate-900">
                  {txt("তারিখ ও সময়:", "Date & Time:")}
                </span>{" "}
                {formatDate(activeInv.createdAt || activeInv.date)}
              </p>
              <p>
                <span className="font-semibold text-slate-900">
                  {txt("প্রেরক / সরবরাহকারী:", "Dispatched By:")}
                </span>{" "}
                {displayCashier}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ২. গ্রাহক ও ডেলিভারি ঠিকানা তথ্য */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5">
        <h3 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
          <Truck className="w-3.5 h-3.5 text-emerald-700" />
          <span>{txt("প্রাপক / ডেলিভারি গ্রহীতা:", "Ship To / Consignee:")}</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">
              {txt("কাস্টমার নাম", "Customer Name")}
            </span>
            <span className="font-bold text-slate-900">{activeInv.customerName}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">
              {txt("মোবাইল নম্বর", "Contact Phone")}
            </span>
            <span className="font-mono text-slate-800">
              {activeInv.customerPhone || txt("সাধারণ খরিদ্দার", "Walk-in Customer")}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">
              {txt("গন্তব্য / ডেলিভারি ঠিকানা", "Delivery Address")}
            </span>
            <span className="text-slate-800">
              {(activeInv as any).address || (activeInv as any).shippingAddress || txt("গ্রাহকের প্রদত্ত ঠিকানা", "Customer Address")}
            </span>
          </div>
        </div>
      </div>

      {/* ৩. চালান পণ্য তালিকা টেবিল (কোনো মূল্য বা রেট থাকবে না) */}
      <div className="border border-slate-300 rounded-lg overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-100 text-slate-800 font-bold uppercase text-[10px] border-b border-slate-300">
            <tr>
              <th className="py-2.5 px-3 text-center w-12 border-r border-slate-200">
                {txt("ক্রমিক", "SL")}
              </th>
              <th className="py-2.5 px-3 border-r border-slate-200">
                {txt("পণ্যের নাম ও বিবরণ", "Item Description")}
              </th>
              <th className="py-2.5 px-3 text-center w-28 border-r border-slate-200">
                {txt("একক", "Unit")}
              </th>
              <th className="py-2.5 px-3 text-center w-28 border-r border-slate-200">
                {txt("পরিমাণ", "Quantity")}
              </th>
              <th className="py-2.5 px-3 text-center w-36">
                {txt("মন্তব্য / অবস্থা", "Remarks")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-900">
            {(activeInv.items || []).map((it, idx) => (
              <tr key={idx} className={idx % 2 === 1 ? "bg-slate-50/50" : ""}>
                <td className="py-2 px-3 text-center font-mono text-[11px] text-slate-600 border-r border-slate-200">
                  {idx + 1}
                </td>
                <td className="py-2 px-3 font-medium border-r border-slate-200">
                  <p className="font-semibold text-slate-900">{it.name || it.productName}</p>
                  {it.sku && (
                    <span className="text-[10px] font-mono text-slate-500">
                      SKU: {it.sku}
                    </span>
                  )}
                </td>
                <td className="py-2 px-3 text-center font-medium text-slate-700 border-r border-slate-200">
                  {it.unit || txt("টি / পিস", "Piece")}
                </td>
                <td className="py-2 px-3 text-center font-mono font-bold text-slate-900 text-sm border-r border-slate-200">
                  {it.quantity}
                </td>
                <td className="py-2 px-3 text-center text-[10px] text-slate-500 italic">
                  {txt("সঠিক ও অক্ষত", "Intact / Verified")}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-400">
            <tr>
              <td colSpan={3} className="py-2.5 px-3 text-right uppercase text-[10px] text-slate-800">
                {txt("সর্বমোট সরবরাহকৃত আইটেম ও সংখ্যা:", "Total Dispatched Volume:")}
              </td>
              <td className="py-2.5 px-3 text-center font-mono font-black text-sm text-emerald-900">
                {totalQuantity}
              </td>
              <td className="py-2.5 px-3 text-center text-[10px] font-semibold text-slate-700">
                {(activeInv.items || []).length} {txt("টি পণ্য পদ", "item lines")}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* ৪. ঘোষণা ও প্রাপ্তিস্বীকার বার্তা */}
      <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-lg p-3 text-[11px] text-emerald-950 flex items-start gap-2">
        <PackageCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>{txt("প্রাপ্তিস্বীকার ঘোষণা:", "Receipt Declaration:")}</strong>{" "}
          {txt(
            "চালানে উল্লেখিত সকল পণ্য ও পরিমাণ সঠিকভাবে গণনাপূর্বক সম্পূর্ণ অক্ষত অবস্থায় বুঝিয়া পাইলাম।",
            "The items listed above have been accurately verified, counted, and received in good and intact condition."
          )}
        </p>
      </div>

      {/* ৫. স্বাক্ষর ও ডেলিভারি স্ট্যাম্প সেকশন */}
      <div className="pt-12 grid grid-cols-3 gap-6 text-center text-[10px] text-slate-700">
        <div>
          <div className="border-t border-slate-400 mx-auto w-36 pt-1 font-semibold text-slate-800">
            {txt("প্রস্তুতকারক / প্রেরকের স্বাক্ষর", "Prepared / Dispatched By")}
          </div>
          <span className="text-[9px] text-slate-500 block mt-0.5">{shopName}</span>
        </div>

        <div>
          <div className="border-t border-slate-400 mx-auto w-36 pt-1 font-semibold text-slate-800">
            {txt("সরবরাহকারী / ড্রাইভারের স্বাক্ষর", "Carrier / Driver Signature")}
          </div>
          <span className="text-[9px] text-slate-500 block mt-0.5">
            {txt("ডেলিভারি পরিবহন", "Transport / Courier")}
          </span>
        </div>

        <div>
          <div className="border-t border-slate-900 mx-auto w-40 pt-1 font-bold text-slate-900">
            {txt("গ্রহণকারীর স্বাক্ষর ও সীল", "Receiver's Signature & Seal")}
          </div>
          <span className="text-[9px] text-slate-500 block mt-0.5">
            {txt("তারিখ ও মোবাইল নম্বর সহ", "With Date & Phone")}
          </span>
        </div>
      </div>
    </div>
  );
}
