"use client";

import React from "react";
import { Shop } from "@/types";
import { formatDate } from "@/lib/utils";
import {
  Crown,
  Users,
  Download,
  RotateCcw,
  Trash2,
  Loader2,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export interface ShopTableProps {
  filteredShops: Shop[];
  exportingShopId: string | null;
  onExportShop: (shop: Shop) => void;
  onRestoreClick: (shop: Shop) => void;
  onDeleteClick: (shop: Shop) => void;
}

/**
 * নিবন্ধিত মার্চেন্ট তালিকা টেবিল (Registered Merchant Directory Table)
 * প্রতিটি শপের বিবরণ, ম্যানেজার সংখ্যা, সাবস্ক্রিপশন স্ট্যাটাস এবং
 * ব্যাকআপ এক্সপোর্ট, রিস্টোর ও ডিলিট অ্যাকশন বাটন প্রদর্শন করে।
 */
export function ShopTable({
  filteredShops,
  exportingShopId,
  onExportShop,
  onRestoreClick,
  onDeleteClick,
}: ShopTableProps) {
  const { txt } = useLanguage();

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px] text-left text-xs">
          <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">{txt("মার্চেন্ট / শপ", "Merchant / Shop")}</th>
              <th className="py-3 px-4">{txt("ইমেইল ঠিকানা", "Email Address")}</th>
              <th className="py-3 px-4">{txt("রোল", "Role")}</th>
              <th className="py-3 px-4">{txt("সাবস্ক্রিপশন প্ল্যান", "Subscription Plan")}</th>
              <th className="py-3 px-4">{txt("স্টাফ / ম্যানেজার", "Staff / Managers")}</th>
              <th className="py-3 px-4">{txt("মেয়াদ উত্তীর্ণের তারিখ", "Subscription Expiry")}</th>
              <th className="py-3 px-4">{txt("নিবন্ধনের তারিখ", "Joined Date")}</th>
              <th className="py-3 px-4 text-right">{txt("অ্যাকশন", "Actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredShops.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500">
                  {txt("কোনো নিবন্ধিত শপ পাওয়া যায়নি।", "No registered shops found.")}
                </td>
              </tr>
            ) : (
              filteredShops.map((shop) => {
                const isPremium =
                  (shop.subscriptionTier || "").toLowerCase() === "premium";

                return (
                  <tr key={shop.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Shop Name & ID */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                          {shop.name ? shop.name.charAt(0).toUpperCase() : "S"}
                        </div>
                        <div>
                          <p className="font-bold text-white">
                            {shop.name || txt("নামবিহীন শপ", "Unnamed Shop")}
                          </p>
                          <p className="text-[10px] font-mono text-slate-500 truncate max-w-[120px]">
                            {shop.shopId || shop.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-3 px-4 font-mono text-slate-300">{shop.email}</td>

                    {/* Role */}
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 uppercase">
                        {shop.role || "admin"}
                      </span>
                    </td>

                    {/* Subscription Tier */}
                    <td className="py-3 px-4">
                      {isPremium ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          <Crown className="w-3 h-3" />
                          {txt("প্রিমিয়াম", "PREMIUM")}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                          {txt("ফ্রি টিয়ার", "FREE TIER")}
                        </span>
                      )}
                    </td>

                    {/* Manager / Staff Count */}
                    <td className="py-3 px-4 text-slate-300">
                      <div className="inline-flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-500" />
                        <span>
                          {shop.managerCount ?? 0} {txt("ম্যানেজার", "Managers")}
                        </span>
                      </div>
                    </td>

                    {/* Expiration */}
                    <td className="py-3 px-4 text-slate-400">
                      {shop.subscriptionExpiresAt ? (
                        <span className="text-emerald-400 font-medium">
                          {formatDate(shop.subscriptionExpiresAt)}
                        </span>
                      ) : (
                        <span className="text-slate-500">
                          {txt("মেয়াদহীন (ফ্রি)", "No Expiration (Free)")}
                        </span>
                      )}
                    </td>

                    {/* Joined Date */}
                    <td className="py-3 px-4 text-slate-400">
                      {formatDate(shop.createdAt)}
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Export Backup JSON Button */}
                        <button
                          type="button"
                          onClick={() => onExportShop(shop)}
                          disabled={exportingShopId === (shop.shopId || shop.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-400 hover:text-white bg-emerald-500/10 hover:bg-emerald-600 border border-emerald-500/20 transition-all cursor-pointer shadow-sm disabled:opacity-50"
                          title={txt(
                            "সম্পূর্ণ শপ ডাটা ব্যাকআপ ডাউনলোড (JSON)",
                            "Export full shop dataset as JSON"
                          )}
                        >
                          {exportingShopId === (shop.shopId || shop.id) ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Download className="w-3.5 h-3.5" />
                          )}
                          <span className="hidden sm:inline">
                            {txt("এক্সপোর্ট", "Export")}
                          </span>
                        </button>

                        {/* Restore Backup Button */}
                        <button
                          type="button"
                          onClick={() => onRestoreClick(shop)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-amber-400 hover:text-white bg-amber-500/10 hover:bg-amber-600 border border-amber-500/20 transition-all cursor-pointer shadow-sm"
                          title={txt(
                            "ব্যাকআপ থেকে শপ ডাটা রিস্টোর করুন",
                            "Restore shop data from JSON backup"
                          )}
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">
                            {txt("রিস্টোর", "Restore")}
                          </span>
                        </button>

                        {/* Delete Shop Button */}
                        <button
                          type="button"
                          onClick={() => onDeleteClick(shop)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 border border-rose-500/20 transition-all cursor-pointer shadow-sm"
                          title={txt("শপ চিরতরে ডিলিট করুন", "Permanently Delete Shop")}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{txt("ডিলিট", "Delete")}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
