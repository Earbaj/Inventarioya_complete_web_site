"use client";

import React, { useState, useMemo } from "react";
import { Invoice, InvoiceItem, ProcessReturnPayload, ReturnRecord } from "@/types";
import { ReturnsService } from "@/lib/api/client";
import { formatCurrency, round2, formatDate } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import {
  RotateCcw,
  X,
  AlertCircle,
  CheckCircle2,
  Package,
  Wallet,
  ArrowRight,
  Loader2,
  Info,
} from "lucide-react";

interface ReturnProcessModalProps {
  invoice: Invoice;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (returnRecord?: ReturnRecord) => void;
}

export function ReturnProcessModal({
  invoice,
  isOpen,
  onClose,
  onSuccess,
}: ReturnProcessModalProps) {
  const { txt } = useLanguage();

  // Quantities to return per item (keyed by item identifier)
  const [returnQuantities, setReturnQuantities] = useState<Record<string, number>>({});
  const [refundMethod, setRefundMethod] = useState<"cash" | "due_adjust" | "bkash" | "nagad">("cash");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [completedReturn, setCompletedReturn] = useState<ReturnRecord | null>(null);

  if (!isOpen) return null;

  // Helper to get effective unit price paid per item (accounting for item discounts)
  const getEffectiveUnitPrice = (item: InvoiceItem): number => {
    const unitPrice = Number(item.unitPrice ?? item.price ?? 0);
    const discount = Number(item.discount ?? 0);
    const qty = Number(item.quantity || 1);
    if (item.discountType === "percent" || item.discountType === "percentage") {
      const factor = (100 - discount) / 100;
      return round2(unitPrice * factor);
    } else {
      const discountPerUnit = qty > 0 ? discount / qty : 0;
      return round2(unitPrice - discountPerUnit);
    }
  };

  const getItemId = (item: InvoiceItem, index: number): string => {
    return item.itemId || item.productId || (item as any).id || String(index);
  };

  // Handle quantity changes
  const handleQuantityChange = (itemId: string, maxQty: number, valStr: string) => {
    const parsed = valStr === "" ? 0 : parseFloat(valStr);
    const safeQty = isNaN(parsed) ? 0 : Math.min(maxQty, Math.max(0, parsed));
    setReturnQuantities((prev) => ({
      ...prev,
      [itemId]: safeQty,
    }));
  };

  // Set all items to max quantity
  const handleSelectAllMax = () => {
    const all: Record<string, number> = {};
    invoice.items.forEach((item, idx) => {
      const id = getItemId(item, idx);
      all[id] = item.quantity;
    });
    setReturnQuantities(all);
  };

  // Reset all return quantities
  const handleClearAll = () => {
    setReturnQuantities({});
  };

  // Calculations for current return selection
  const { totalRefundAmount, totalReturnCount, selectedItemsList } = useMemo(() => {
    let refund = 0;
    let count = 0;
    const list: { itemId: string; name: string; quantity: number; unitPrice: number; lineRefund: number }[] = [];

    invoice.items.forEach((item, idx) => {
      const id = getItemId(item, idx);
      const returnQty = returnQuantities[id] || 0;
      if (returnQty > 0) {
        const effPrice = getEffectiveUnitPrice(item);
        const lineRefund = round2(effPrice * returnQty);
        refund = round2(refund + lineRefund);
        count += returnQty;
        list.push({
          itemId: id,
          name: item.name || item.productName || "Product",
          quantity: returnQty,
          unitPrice: effPrice,
          lineRefund,
        });
      }
    });

    return {
      totalRefundAmount: refund,
      totalReturnCount: count,
      selectedItemsList: list,
    };
  }, [invoice.items, returnQuantities]);

  const newInvoiceGrandTotal = round2(Math.max(0, Number(invoice.grandTotal || 0) - totalRefundAmount));

  // Process the return submission
  const handleSubmitReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItemsList.length === 0) {
      setErrorMsg(txt("অনুগ্রহ করে অন্তত একটি পণ্য ফেরত নির্বাচন করুন।", "Please select at least one item to return."));
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const payload: ProcessReturnPayload = {
        saleId: invoice.id,
        customerId: invoice.customerId || "walk-in",
        refundMethod,
        returnedItems: selectedItemsList.map((item) => ({
          itemId: item.itemId,
          quantity: round2(item.quantity),
        })),
      };

      const result = await ReturnsService.processReturn(payload);
      setCompletedReturn(result);
      onSuccess(result);
    } catch (err: any) {
      console.error("Return processing failed:", err);
      setErrorMsg(err.message || "Failed to process return. Please verify items and permissions.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl max-h-[92vh] flex flex-col my-auto text-left">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white">
                  {txt("পণ্য ফেরত ও রিফান্ড প্রসেস", "Sales Return & Restock")}
                </h3>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                  {invoice.invoiceNumber || invoice.invoiceNo}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {txt("গ্রাহক:", "Customer:")} <strong className="text-slate-200">{invoice.customerName}</strong>
                {invoice.customerPhone && <span className="text-slate-500 font-mono"> ({invoice.customerPhone})</span>} ·{" "}
                {formatDate(invoice.createdAt || invoice.date)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            title={txt("বন্ধ করুন", "Close")}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {completedReturn ? (
          /* Success Screen */
          <div className="py-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">
                {txt("পণ্য ফেরত সফলভাবে সম্পন্ন হয়েছে!", "Return Processed Successfully!")}
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                {txt(
                  "ফেরতকৃত পণ্য স্বয়ংক্রিয়ভাবে ইনভেন্টরি স্টকে যুক্ত হয়েছে এবং মেমোর হিসেব পুনর্গণনা করা হয়েছে।",
                  "Returned products have been restocked to inventory and invoice totals have been adjusted."
                )}
              </p>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 max-w-md mx-auto text-xs space-y-2 text-left font-mono">
              <div className="flex justify-between text-slate-400">
                <span>{txt("ইনভয়েস নম্বর:", "Invoice No:")}</span>
                <span className="text-white font-bold">{completedReturn.invoiceNumber}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>{txt("মোট রিফান্ড:", "Total Refund:")}</span>
                <span className="text-emerald-400 font-bold">{formatCurrency(completedReturn.totalRefund)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>{txt("রিফান্ড মেথড:", "Refund Method:")}</span>
                <span className="text-amber-400 uppercase font-bold">{completedReturn.refundMethod}</span>
              </div>
              {completedReturn.netGrandTotal && (
                <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800">
                  <span>{txt("নতুন ইনভয়েস ব্যালেন্স:", "New Invoice Total:")}</span>
                  <span className="text-white font-bold">{formatCurrency(completedReturn.netGrandTotal)}</span>
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition-colors"
              >
                {txt("সম্পন্ন ও বন্ধ করুন", "Done & Close")}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitReturn} className="flex-1 flex flex-col min-h-0 space-y-4 pt-3">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2 shrink-0">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Quick action bar */}
            <div className="flex items-center justify-between text-xs shrink-0">
              <span className="text-slate-400 text-[11px]">
                {txt("ফেরতকৃত পণ্য ও পরিমাণের তালিকা নির্বাচন করুন:", "Select items and quantities to return:")}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAllMax}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-indigo-300 font-semibold transition-colors"
                >
                  {txt("সব পণ্য নির্বাচন (Full Return)", "Select All (Full Return)")}
                </button>
                {totalReturnCount > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="px-2 py-1 rounded bg-slate-800/60 hover:bg-slate-700 text-[10px] text-slate-400 hover:text-white transition-colors"
                  >
                    {txt("খালি করুন", "Reset")}
                  </button>
                )}
              </div>
            </div>

            {/* Itemized Return Table */}
            <div className="overflow-y-auto border border-slate-800 rounded-xl bg-slate-950/60 max-h-56 shrink-0 divide-y divide-slate-800/80">
              {invoice.items.map((item, idx) => {
                const id = getItemId(item, idx);
                const currentReturnQty = returnQuantities[id] || 0;
                const effPrice = getEffectiveUnitPrice(item);
                const lineRefund = round2(effPrice * currentReturnQty);
                const isSelected = currentReturnQty > 0;

                return (
                  <div
                    key={id}
                    className={`p-3 flex items-center justify-between gap-3 text-xs transition-colors ${
                      isSelected ? "bg-amber-500/5" : "hover:bg-slate-900/50"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white truncate text-[11px]">
                        {item.name || item.productName || "Product"}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                        <span>
                          {txt("ক্রয়:", "Bought:")} <strong className="text-slate-300">{item.quantity}</strong>
                        </span>
                        <span>·</span>
                        <span>
                          {txt("দর:", "Rate:")} {formatCurrency(effPrice)}
                        </span>
                      </div>
                    </div>

                    {/* Quantity Return Stepper / Input */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] text-slate-400 font-medium">{txt("ফেরত:", "Return:")}</span>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        max={item.quantity}
                        value={currentReturnQty === 0 ? "" : currentReturnQty}
                        onChange={(e) => handleQuantityChange(id, item.quantity, e.target.value)}
                        placeholder="0"
                        className="w-14 h-7 bg-slate-900 border border-slate-700 hover:border-slate-600 focus:border-indigo-500 rounded-lg text-center text-xs font-bold text-white focus:outline-none font-mono"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setReturnQuantities((prev) => ({
                            ...prev,
                            [id]: item.quantity,
                          }))
                        }
                        className="px-1.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 font-semibold transition-colors"
                        title={txt("পুরো পরিমাণ নির্বাচন করুন", "Return all")}
                      >
                        {txt("সব", "Max")}
                      </button>
                    </div>

                    {/* Refund for this item */}
                    <div className="min-w-[65px] text-right font-mono text-xs font-bold shrink-0">
                      {isSelected ? (
                        <span className="text-emerald-400">-{formatCurrency(lineRefund)}</span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Refund Method & Adjustment Selection */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-2 shrink-0 text-xs">
              <label className="block text-slate-300 font-semibold mb-1">
                {txt("রিফান্ড মাধ্যম / সমন্বয় পদ্ধতি (Refund Method):", "Refund & Settlement Method:")}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: "cash", label: txt("নগদ রিফান্ড (Cash)", "Cash Refund"), icon: Wallet },
                  { id: "due_adjust", label: txt("বকেয়া সমন্বয় (Due Adjust)", "Due Adjust"), icon: RotateCcw },
                  { id: "bkash", label: txt("বিকাশ (bKash)", "bKash"), icon: Wallet },
                  { id: "nagad", label: txt("নগদ (Nagad)", "Nagad"), icon: Wallet },
                ].map((m) => {
                  const isSelected = refundMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setRefundMethod(m.id as any)}
                      className={`p-2 rounded-lg border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                        isSelected
                          ? "bg-indigo-600/20 border-indigo-500 text-indigo-300 font-bold"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                      }`}
                    >
                      <span className="text-[11px] leading-tight">{m.label}</span>
                    </button>
                  );
                })}
              </div>

              {refundMethod === "due_adjust" && (
                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px]">
                  <Info className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {txt(
                      "কাস্টমারের বকেয়া খাতা থেকে এই রিফান্ড সমপরিমাণ টাকা স্বয়ংক্রিয়ভাবে মাইনাস হয়ে সমন্বয় হবে।",
                      "This refund will automatically be credited against customer due balance in their ledger."
                    )}
                  </span>
                </div>
              )}
            </div>

            {/* Financial Summary Calculation Banner */}
            <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 space-y-1.5 text-xs shrink-0">
              <div className="flex items-center justify-between text-slate-400">
                <span>{txt("নির্বাচিত ফেরত পণ্য:", "Selected Return Items:")}</span>
                <span className="font-bold text-white font-mono">{totalReturnCount} pcs</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>{txt("মোট রিফান্ডের পরিমাণ:", "Total Refund Amount:")}</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  {formatCurrency(totalRefundAmount)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1.5 border-t border-slate-800 text-slate-400 text-[11px]">
                <span>{txt("মেমোর নতুন নিট মূল্য (New Net Total):", "New Net Invoice Total:")}</span>
                <span className="font-mono font-bold text-slate-200">
                  {formatCurrency(newInvoiceGrandTotal)}
                </span>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
              >
                {txt("বাতিল", "Cancel")}
              </button>
              <button
                type="submit"
                disabled={isSubmitting || totalReturnCount <= 0}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs shadow-lg flex items-center gap-1.5 transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{txt("প্রসেস হচ্ছে...", "Processing...")}</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>
                      {txt(
                        `ফেরত নিশ্চিত করুন (${formatCurrency(totalRefundAmount)})`,
                        `Confirm Return (${formatCurrency(totalRefundAmount)})`
                      )}
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
