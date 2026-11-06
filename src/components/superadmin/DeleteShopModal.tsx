"use client";

import React from "react";
import { Shop } from "@/types";
import { AlertTriangle, AlertCircle, X, Trash2, Loader2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export interface DeleteShopModalProps {
  shopToDelete: Shop;
  onClose: () => void;
  onConfirmDelete: () => void;
  confirmNameInput: string;
  setConfirmNameInput: (val: string) => void;
  isDeleting: boolean;
}

/**
 * শপ ডিলিট ও ক্যাসকেড পার্জ কনফার্মেশন মডাল (Delete Shop Cascade Modal)
 * দুর্ঘটনাবশত ডিলিট এড়াতে শপের নাম বা DELETE টাইপ করে কনফার্ম করতে হয়।
 */
export function DeleteShopModal({
  shopToDelete,
  onClose,
  onConfirmDelete,
  confirmNameInput,
  setConfirmNameInput,
  isDeleting,
}: DeleteShopModalProps) {
  const { txt } = useLanguage();

  const isConfirmValid =
    confirmNameInput.trim().toUpperCase() === "DELETE" ||
    confirmNameInput.trim().toLowerCase() === (shopToDelete.name || "").trim().toLowerCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-rose-500/30 text-slate-100 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col my-auto animate-in fade-in duration-200">
        {/* Modal Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-rose-400">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-500" />
            <span className="font-bold text-sm">
              {txt("শপ সম্পূর্ণ ডিলিট নিশ্চিতকরণ", "Confirm Shop Permanent Deletion")}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-xs">
          {/* Warning Alert */}
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 space-y-2 leading-relaxed">
            <p className="font-bold flex items-center gap-1.5 text-rose-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                {txt(
                  "গুরুত্বপূর্ণ সতর্কবার্তা (Cascade Purge):",
                  "Critical Warning (Cascade Purge):"
                )}
              </span>
            </p>
            <p>
              {txt(
                "এই শপটি ডিলিট করলে এর অধীনস্থ সকল পণ্য (Inventory Items), ক্যাটাগরি, বিক্রয় ইনভয়েস, পণ্য ফেরত (Returns), কাস্টমার লেজার, সাপ্লায়ার, ব্রাঞ্চ এবং ম্যানেজার ইউজার অ্যাকাউন্ট ডাটাবেজ থেকে চিরতরে মুছে ফেলা হবে।",
                "Deleting this shop will permanently purge all inventory items, categories, sales invoices, returns, customer ledgers, suppliers, branches, and manager user accounts from the database."
              )}
            </p>
            <p className="font-semibold text-rose-200">
              {txt("⚠️ এই কাজটি কোনোভাবেই পূর্বাবস্থায় ফিরিয়ে আনা যাবে না।", "⚠️ This action CANNOT be undone.")}
            </p>
          </div>

          {/* Shop Target Details Card */}
          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span>{txt("মার্চেন্ট নাম:", "Merchant Name:")}</span>
              <span className="font-bold text-white">{shopToDelete.name}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>{txt("অ্যাডমিন ইমেইল:", "Admin Email:")}</span>
              <span className="font-mono text-slate-200">{shopToDelete.email}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>{txt("শপ আইডি (UUID):", "Shop ID:")}</span>
              <span className="font-mono text-[11px] text-slate-400">{shopToDelete.shopId || shopToDelete.id}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>{txt("প্ল্যান / স্ট্যাটাস:", "Plan / Status:")}</span>
              <span className="font-semibold text-amber-400 uppercase">{shopToDelete.subscriptionTier || "Free"}</span>
            </div>
          </div>

          {/* Confirmation Prompt */}
          <div className="space-y-2">
            <label className="block text-slate-300 font-medium">
              {txt(
                "নিশ্চিত করতে নিচে শপের নাম অথবা DELETE লিখুন:",
                "To confirm, type the shop name or DELETE below:"
              )}
            </label>
            <input
              type="text"
              value={confirmNameInput}
              onChange={(e) => setConfirmNameInput(e.target.value)}
              placeholder={txt("DELETE অথবা শপের নাম লিখুন", "Type DELETE or shop name")}
              disabled={isDeleting}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-50"
          >
            {txt("বাতিল", "Cancel")}
          </button>

          <button
            type="button"
            onClick={onConfirmDelete}
            disabled={isDeleting || !isConfirmValid}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition-colors shadow-lg shadow-rose-600/30 flex items-center gap-2 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{txt("মুছে ফেলা হচ্ছে...", "Deleting...")}</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>{txt("স্থায়ীভাবে মুছে ফেলুন", "Permanently Delete")}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
