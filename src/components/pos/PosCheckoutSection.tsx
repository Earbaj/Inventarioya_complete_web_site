"use client";

import React from "react";
import { formatCurrency, round2 } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import { PaymentMethodType } from "@/hooks/usePosCart";
import { Customer } from "@/types";
import { Printer } from "lucide-react";

export interface PosCheckoutSectionProps {
  paymentMethod: PaymentMethodType;
  setPaymentMethod: (m: PaymentMethodType) => void;
  subtotal: number;
  discountPercent: number;
  setDiscountPercent: (d: number) => void;
  discountAmount: number;
  grandTotal: number;
  paidAmount: number;
  setPaidAmount: (p: number) => void;
  dueAmount: number;
  changeAmount: number;
  selectedCustomer: Customer | null;
  cartLength: number;
  isCheckingOut: boolean;
  onCheckout: () => void;
}

/**
 * পিওএস চেকআউট ও পেমেন্ট সেকশন (POS Checkout & Payment Tender)
 * পেমেন্ট মেথড নির্বাচন, ডিসকাউন্ট %, নগদ/বকেয়া হিসাব এবং বিক্রয় সম্পন্ন করার বাটন।
 */
export function PosCheckoutSection({
  paymentMethod,
  setPaymentMethod,
  subtotal,
  discountPercent,
  setDiscountPercent,
  discountAmount,
  grandTotal,
  paidAmount,
  setPaidAmount,
  dueAmount,
  changeAmount,
  selectedCustomer,
  cartLength,
  isCheckingOut,
  onCheckout,
}: PosCheckoutSectionProps) {
  const { txt } = useLanguage();

  return (
    <div className="p-3 border-t border-slate-800 bg-slate-950/90 space-y-2 shrink-0">
      {/* পেমেন্ট মেথড অপশন বাটনস */}
      <div className="grid grid-cols-5 gap-1">
        {(
          [
            { id: "CASH", label: "CASH", bn: "নগদ", active: "border-emerald-500 text-emerald-400 bg-emerald-500/10" },
            { id: "CARD", label: "CARD", bn: "কার্ড", active: "border-indigo-500 text-indigo-400 bg-indigo-500/10" },
            { id: "BKASH", label: "BKASH", bn: "বিকাশ", active: "border-pink-500 text-pink-400 bg-pink-500/10" },
            { id: "NAGAD", label: "NAGAD", bn: "নগদ", active: "border-orange-500 text-orange-400 bg-orange-500/10" },
            { id: "DUE", label: "DUE", bn: "বাকি", active: "border-rose-500 text-rose-400 bg-rose-500/10" },
          ] as const
        ).map((item) => {
          const isSelected = paymentMethod === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setPaymentMethod(item.id);
                if (item.id === "DUE") {
                  setPaidAmount(0);
                } else if (paidAmount === 0) {
                  setPaidAmount(grandTotal);
                }
              }}
              className={`py-1 rounded-md text-[10px] font-bold border transition-all text-center cursor-pointer ${
                isSelected
                  ? `${item.active} font-extrabold`
                  : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white"
              }`}
            >
              {item.id === "DUE"
                ? txt("DUE (বাকি)", "DUE")
                : item.id === "CASH"
                ? txt("CASH (নগদ)", "CASH")
                : item.label}
            </button>
          );
        })}
      </div>

      {/* সাবটোটাল, ডিসকাউন্ট ও গ্র্যান্ড টোটাল রিবন */}
      <div className="bg-slate-900/90 rounded-xl p-2 border border-slate-800/80 space-y-1.5 text-xs">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>
            {txt("সাবটোটাল:", "Subtotal:")}{" "}
            <strong className="text-white font-mono">{formatCurrency(subtotal)}</strong>
          </span>
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-slate-300">{txt("ছাড় (%):", "Disc (%):")}</span>
            <div className="relative flex items-center">
              <input
                type="number"
                step="any"
                min={0}
                max={100}
                value={discountPercent === 0 ? "" : discountPercent}
                onChange={(e) => {
                  const val = e.target.value === "" ? 0 : parseFloat(e.target.value);
                  setDiscountPercent(isNaN(val) ? 0 : Math.min(100, Math.max(0, val)));
                }}
                className="w-16 bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-right text-xs text-emerald-400 font-mono font-semibold focus:outline-none focus:border-indigo-500 pr-5"
                placeholder="0"
              />
              <span className="absolute right-1.5 text-[10px] text-slate-400 font-bold pointer-events-none">
                %
              </span>
            </div>
          </div>
        </div>

        {discountAmount > 0 && (
          <div className="flex items-center justify-between text-[11px] text-emerald-400 font-medium px-0.5 pt-0.5 border-t border-slate-800/50">
            <span>
              {txt(
                `ছাড়ের পরিমাণ (${discountPercent}%):`,
                `Discount Amount (${discountPercent}%):`
              )}
            </span>
            <span className="font-mono font-bold">-{formatCurrency(discountAmount)}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
          <span className="text-xs font-bold text-white">{txt("সর্বমোট বিল:", "Grand Total:")}</span>
          <span className="text-base font-black text-emerald-400 font-mono">
            {formatCurrency(grandTotal)}
          </span>
        </div>
      </div>

      {/* জমা (Paid) ও বাকি (Due) বার */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-slate-300 font-medium">{txt("পরিশোধ:", "Paid:")}</span>
            <button
              type="button"
              onClick={() => {
                setPaidAmount(grandTotal);
                if (paymentMethod === "DUE") setPaymentMethod("CASH");
              }}
              className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors cursor-pointer"
            >
              {txt("পুরো জমা", "Full")}
            </button>
            <button
              type="button"
              onClick={() => {
                setPaidAmount(0);
                setPaymentMethod("DUE");
              }}
              className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
            >
              {txt("পুরো বাকি", "Due")}
            </button>
          </div>

          <input
            type="number"
            step="any"
            min={0}
            value={paidAmount === 0 && paymentMethod === "DUE" ? "" : paidAmount}
            onChange={(e) => {
              const raw = e.target.value;
              const val = raw === "" ? 0 : parseFloat(raw);
              const safeVal = isNaN(val) ? 0 : round2(Math.max(0, val));
              setPaidAmount(safeVal);
              if (safeVal === 0) {
                setPaymentMethod("DUE");
              } else if (paymentMethod === "DUE") {
                setPaymentMethod("CASH");
              }
            }}
            className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-right text-xs text-white font-mono font-bold focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* অবশিষ্ট বাকি অথবা চেঞ্জ ব্যাজ */}
        {dueAmount > 0 ? (
          <div className="flex items-center justify-between text-[11px] px-2 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 font-semibold">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              {txt("অবশিষ্ট বাকি:", "Due:")}
            </span>
            <span className="font-bold text-rose-300 font-mono text-xs">
              {formatCurrency(dueAmount)}
            </span>
          </div>
        ) : changeAmount > 0 ? (
          <div className="flex items-center justify-between text-[11px] px-2 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-semibold">
            <span>{txt("ফেরত দিন (চেঞ্জ):", "Change:")}</span>
            <span className="font-bold text-white font-mono text-xs">
              {formatCurrency(changeAmount)}
            </span>
          </div>
        ) : null}

        {dueAmount > 0 && !selectedCustomer && (
          <p className="text-[9px] text-amber-400/90 leading-tight">
            {txt(
              `⚠️ বাকি খাতায় রেকর্ড করতে উপরে কাস্টমার সিলেক্ট করুন।`,
              `⚠️ Select customer above to record due in ledger.`
            )}
          </p>
        )}
      </div>

      {/* চেকআউট সাবমিট বাটন */}
      <button
        onClick={onCheckout}
        disabled={cartLength === 0 || isCheckingOut}
        className={`w-full py-2.5 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed ${
          dueAmount > 0 && paidAmount === 0
            ? "bg-rose-600 hover:bg-rose-500 shadow-rose-600/30"
            : dueAmount > 0
            ? "bg-amber-600 hover:bg-amber-500 shadow-amber-600/30"
            : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30"
        }`}
      >
        <Printer className="w-4 h-4" />
        {isCheckingOut
          ? txt("ইনভয়েস প্রসেসিং হচ্ছে...", "Processing Invoice...")
          : dueAmount > 0 && paidAmount === 0
          ? `${txt("বাকি বিক্রয় সম্পন্ন করুন", "Complete Due Sale")} (${formatCurrency(grandTotal)})`
          : dueAmount > 0
          ? `${txt("আংশিক বিক্রয়", "Partial Sale")} (${txt("জমা:", "Paid:")} ${formatCurrency(paidAmount)} · ${txt("বাকি:", "Due:")} ${formatCurrency(dueAmount)})`
          : `${txt("রসিদ প্রিন্ট ও সম্পন্ন", "Complete & Print Invoice")} (${formatCurrency(grandTotal)})`}
      </button>
    </div>
  );
}
