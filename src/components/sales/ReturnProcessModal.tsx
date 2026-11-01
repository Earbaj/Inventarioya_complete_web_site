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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl max-h-[94vh] flex flex-col my-auto text-left overflow-hidden">
        {/* Header */}
        <div className="flex items-start sm:items-center justify-between pb-3.5 border-b border-slate-800 shrink-0 gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white">
                  {txt("পণ্য ফেরত ও রিফান্ড প্রসেস", "Sales Return & Restock")}
                </h3>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-lg bg-amber-400 text-black font-extrabold shadow-sm">
                  {invoice.invoiceNumber || invoice.invoiceNo}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5 truncate">
                {txt("গ্রাহক:", "Customer:")} <strong className="text-white">{invoice.customerName}</strong>
                {invoice.customerPhone && <span className="text-slate-400 font-mono"> ({invoice.customerPhone})</span>} ·{" "}
                {formatDate(invoice.createdAt || invoice.date)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
            title={txt("বন্ধ করুন", "Close")}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {completedReturn ? (
          /* Success Screen */
          <div className="py-6 sm:py-8 text-center space-y-4 overflow-y-auto">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">
                {txt("পণ্য ফেরত সফলভাবে সম্পন্ন হয়েছে!", "Return Processed Successfully!")}
              </h4>
              <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto">
                {txt(
                  "ফেরতকৃত পণ্য স্বয়ংক্রিয়ভাবে ইনভেন্টরি স্টকে যুক্ত হয়েছে এবং মেমোর হিসেব পুনর্গণনা করা হয়েছে।",
                  "Returned products have been restocked to inventory and invoice totals have been adjusted."
                )}
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 max-w-md mx-auto text-xs space-y-2.5 text-left font-mono">
              <div className="flex justify-between text-slate-300">
                <span>{txt("ইনভয়েস নম্বর:", "Invoice No:")}</span>
                <span className="text-black font-black bg-amber-400 px-2 py-0.5 rounded">{completedReturn.invoiceNumber}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>{txt("মোট রিফান্ড:", "Total Refund:")}</span>
                <span className="text-emerald-400 font-bold text-sm">{formatCurrency(completedReturn.totalRefund)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>{txt("রিফান্ড মেথড:", "Refund Method:")}</span>
                <span className="text-amber-400 uppercase font-bold">{completedReturn.refundMethod}</span>
              </div>
              {completedReturn.netGrandTotal && (
                <div className="flex justify-between text-slate-300 pt-2 border-t border-slate-800">
                  <span>{txt("নতুন ইনভয়েস ব্যালেন্স:", "New Invoice Total:")}</span>
                  <span className="text-white font-bold">{formatCurrency(completedReturn.netGrandTotal)}</span>
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition-colors cursor-pointer"
              >
                {txt("সম্পন্ন ও বন্ধ করুন", "Done & Close")}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitReturn} className="flex-1 min-h-0 flex flex-col pt-3 overflow-hidden">
            <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2 shrink-0">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Quick action bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs shrink-0">
                <span className="text-slate-300 font-medium text-xs">
                  {txt("ফেরতকৃত পণ্য ও পরিমাণের তালিকা নির্বাচন করুন:", "Select items and quantities to return:")}
                </span>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={handleSelectAllMax}
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-black font-black text-xs transition-colors shadow-sm cursor-pointer"
                  >
                    {txt("সব পণ্য নির্বাচন (Full Return)", "Select All (Full Return)")}
                  </button>
                  {totalReturnCount > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAll}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                      {txt("খালি করুন", "Reset")}
                    </button>
                  )}
                </div>
              </div>

              {/* Itemized Return Table */}
              <div className="border border-slate-800 rounded-xl bg-slate-950/60 divide-y divide-slate-800/80 overflow-hidden">
                {invoice.items.map((item, idx) => {
                  const id = getItemId(item, idx);
                  const currentReturnQty = returnQuantities[id] || 0;
                  const effPrice = getEffectiveUnitPrice(item);
                  const lineRefund = round2(effPrice * currentReturnQty);
                  const isSelected = currentReturnQty > 0;

                  return (
                    <div
                      key={id}
                      className={`p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs transition-none ${
                        isSelected ? "bg-amber-500/10 border-l-2 border-amber-500" : "bg-transparent"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white text-xs sm:text-[13px] leading-snug">
                          {item.name || item.productName || "Product"}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
                          <span>
                            {txt("ক্রয়:", "Bought:")} <strong className="text-slate-200">{item.quantity}</strong>
                          </span>
                          <span>·</span>
                          <span>
                            {txt("দর:", "Rate:")} <strong className="text-slate-200">{formatCurrency(effPrice)}</strong>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t border-slate-800/60 sm:border-t-0">
                        {/* Quantity Return Stepper / Input */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-slate-300 font-medium">{txt("ফেরত:", "Return:")}</span>
                          <input
                            type="number"
                            step="any"
                            min="0"
                            max={item.quantity}
                            value={currentReturnQty === 0 ? "" : currentReturnQty}
                            onChange={(e) => handleQuantityChange(id, item.quantity, e.target.value)}
                            placeholder="0"
                            className="w-16 h-8 bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-lg text-center text-xs font-bold text-white focus:outline-none font-mono"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setReturnQuantities((prev) => ({
                                ...prev,
                                [id]: item.quantity,
                              }))
                            }
                            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-amber-300 font-bold transition-colors cursor-pointer"
                            title={txt("পুরো পরিমাণ নির্বাচন করুন", "Return all")}
                          >
                            {txt("সব", "Max")}
                          </button>
                        </div>

                        {/* Refund for this item */}
                        <div className="min-w-[70px] text-right font-mono text-xs font-bold">
                          {isSelected ? (
                            <span className="text-emerald-400 text-sm">-{formatCurrency(lineRefund)}</span>
                          ) : (
                            <span className="text-slate-600">-</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Refund Method & Adjustment Selection */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2.5 text-xs">
                <label className="block text-slate-200 font-bold text-xs">
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
                        className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? "bg-amber-400 border-amber-300 text-black font-extrabold shadow-md scale-[1.02]"
                            : "bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700"
                        }`}
                      >
                        <span className="text-xs font-bold leading-tight">{m.label}</span>
                      </button>
                    );
                  })}
                </div>

                {refundMethod === "due_adjust" && (
                  <div className="flex items-center gap-1.5 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-medium">
                    <Info className="w-4 h-4 shrink-0 text-amber-400" />
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
              <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 sm:p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="font-medium">{txt("নির্বাচিত ফেরত পণ্য:", "Selected Return Items:")}</span>
                  <span className="font-bold text-white font-mono text-sm">{totalReturnCount} pcs</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="font-medium">{txt("মোট রিফান্ডের পরিমাণ:", "Total Refund Amount:")}</span>
                  <span className="font-mono font-black text-emerald-400 text-base sm:text-lg">
                    {formatCurrency(totalRefundAmount)}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-slate-300 text-xs">
                  <span className="font-medium">{txt("মেমোর নতুন নিট মূল্য (New Net Total):", "New Net Invoice Total:")}</span>
                  <span className="font-mono font-bold text-white text-sm">
                    {formatCurrency(newInvoiceGrandTotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 mt-3 border-t border-slate-800 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors cursor-pointer"
              >
                {txt("বাতিল", "Cancel")}
              </button>
              <button
                type="submit"
                disabled={isSubmitting || totalReturnCount <= 0}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-black text-xs shadow-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    <span>{txt("প্রসেস হচ্ছে...", "Processing...")}</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4 text-black" />
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
