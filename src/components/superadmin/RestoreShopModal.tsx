"use client";

import React from "react";
import { Shop } from "@/types";
import { formatDate } from "@/lib/utils";
import {
  RotateCcw,
  X,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export interface RestoreShopModalProps {
  shopToRestore: Shop;
  onClose: () => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  restoreFileError: string | null;
  parsedBackup: any;
  restoreConfirmInput: string;
  setRestoreConfirmInput: (val: string) => void;
  onConfirmRestore: () => void;
  isRestoring: boolean;
}

/**
 * শপ ডাটা রিস্টোর ও রিকভারি মডাল (Restore Shop Safety Modal)
 * ব্যাকআপ .json ফাইল ভ্যালিডেশন, প্রিভিউ ও কনফার্মেশন ইনপুট হ্যান্ডেল করে।
 */
export function RestoreShopModal({
  shopToRestore,
  onClose,
  onFileSelect,
  restoreFileError,
  parsedBackup,
  restoreConfirmInput,
  setRestoreConfirmInput,
  onConfirmRestore,
  isRestoring,
}: RestoreShopModalProps) {
  const { txt } = useLanguage();

  const isConfirmValid =
    restoreConfirmInput.trim().toUpperCase() === "RESTORE" ||
    restoreConfirmInput.trim().toLowerCase() ===
      (shopToRestore.name || "").trim().toLowerCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-amber-500/30 text-slate-100 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col my-auto animate-in fade-in duration-200">
        {/* Modal Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-amber-400">
            <RotateCcw className="w-5 h-5 shrink-0 text-amber-400" />
            <span className="font-bold text-sm">
              {txt("শপ ডাটা রিস্টোর ও রিকভারি", "Restore Shop Data from Backup")}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isRestoring}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-xs">
          {/* Target Shop Info */}
          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500">
                {txt("টার্গেট শপ", "Target Shop")}
              </p>
              <p className="text-sm font-bold text-white">{shopToRestore.name}</p>
              <p className="text-[10px] font-mono text-slate-400">
                {shopToRestore.shopId || shopToRestore.id}
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase">
              {txt("রিকভারি টার্গেট", "Restore Target")}
            </span>
          </div>

          {/* Warning Alert */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-1.5 leading-relaxed">
            <p className="font-bold flex items-center gap-1.5 text-amber-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{txt("গুরুত্বপূর্ণ নিরাপত্তা নির্দেশিকা:", "Safety Notice:")}</span>
            </p>
            <p>
              {txt(
                "রিস্টোর করলে শুধুমাত্র এই শপের বর্তমান প্রোডাক্ট, সেলস ইনভয়েস, কাস্টমার ও ক্যাটাগরি ডাটা মুছে গিয়ে ব্যাকআপ ফাইলের ডাটা দিয়ে প্রতিস্থাপিত হবে। অন্য কোনো শপের ডাটাতে কোনো প্রভাব পড়বে না।",
                "Restoring will cleanly replace only this shop's current operational records (products, sales, customers) with the backup dataset. Other shops are 100% unaffected."
              )}
            </p>
          </div>

          {/* File Input */}
          <div className="space-y-1.5">
            <label className="block text-slate-300 font-medium">
              {txt("১. ব্যাকআপ (.json) ফাইল নির্বাচন করুন:", "1. Select Backup (.json) File:")}
            </label>
            <div className="relative">
              <input
                type="file"
                accept=".json,application/json"
                onChange={onFileSelect}
                disabled={isRestoring}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
              />
            </div>
            {restoreFileError && (
              <p className="text-[11px] font-semibold text-rose-400 flex items-center gap-1 pt-1">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{restoreFileError}</span>
              </p>
            )}
          </div>

          {/* Parsed Backup Summary Preview */}
          {parsedBackup && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-2.5">
              <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                <span className="font-bold text-xs flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  {txt("ব্যাকআপ ফাইল সফলভাবে যাচাইকৃত", "Backup File Verified")}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {formatDate(parsedBackup.backupMeta?.exportedAt)}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[10px]">
                <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                  <p className="text-slate-400 font-medium">{txt("পণ্য (Items)", "Items")}</p>
                  <p className="text-sm font-bold text-white">
                    {parsedBackup.backupMeta?.counts?.items ?? 0}
                  </p>
                </div>
                <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                  <p className="text-slate-400 font-medium">{txt("বিক্রি (Sales)", "Sales")}</p>
                  <p className="text-sm font-bold text-white">
                    {parsedBackup.backupMeta?.counts?.sales ?? 0}
                  </p>
                </div>
                <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                  <p className="text-slate-400 font-medium">{txt("ক্রেতা (Cust.)", "Customers")}</p>
                  <p className="text-sm font-bold text-white">
                    {parsedBackup.backupMeta?.counts?.customers ?? 0}
                  </p>
                </div>
                <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                  <p className="text-slate-400 font-medium">{txt("ক্যাটাগরি", "Categories")}</p>
                  <p className="text-sm font-bold text-white">
                    {parsedBackup.backupMeta?.counts?.categories ?? 0}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Confirmation Input */}
          <div className="space-y-1.5">
            <label className="block text-slate-300 font-medium">
              {txt(
                "২. রিস্টোর নিশ্চিত করতে নিচে RESTORE অথবা শপের নাম লিখুন:",
                "2. To confirm, type RESTORE or the shop name below:"
              )}
            </label>
            <input
              type="text"
              value={restoreConfirmInput}
              onChange={(e) => setRestoreConfirmInput(e.target.value)}
              placeholder={txt("RESTORE অথবা শপের নাম লিখুন", "Type RESTORE or shop name")}
              disabled={isRestoring || !parsedBackup}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 disabled:opacity-50"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isRestoring}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-50"
          >
            {txt("বাতিল", "Cancel")}
          </button>

          <button
            type="button"
            onClick={onConfirmRestore}
            disabled={isRestoring || !parsedBackup || !isConfirmValid}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 transition-colors shadow-lg shadow-amber-600/30 flex items-center gap-2 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {isRestoring ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{txt("রিস্টোর হচ্ছে (অপেক্ষা করুন)...", "Restoring (Please wait)...")}</span>
              </>
            ) : (
              <>
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{txt("রিস্টোর নিশ্চিত করুন", "Confirm Restore")}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
