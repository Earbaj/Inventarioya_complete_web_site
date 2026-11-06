"use client";

import React from "react";
import { ProductItem } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import { ShimmerTableRows } from "@/components/ui/ShimmerSkeleton";
import { AlertTriangle, Pencil, Trash2 } from "lucide-react";

export interface InventoryTableProps {
  products: ProductItem[];
  loading: boolean;
  canViewBuyPrice: boolean;
  canEditProducts: boolean;
  canDeleteProducts: boolean;
  onEditProduct: (p: ProductItem) => void;
  onDeleteProduct: (p: ProductItem) => void;
}

/**
 * ইনভেন্টরি প্রোডাক্ট ডিরেক্টরি টেবিল (Inventory Product Table)
 * পণ্যের SKU, নাম, ক্যাটাগরি, ক্রয় মূল্য (অনুমতি সাপেক্ষে), বিক্রয় মূল্য, স্টক এবং অ্যাকশনসমূহ প্রদর্শন করে।
 */
export function InventoryTable({
  products,
  loading,
  canViewBuyPrice,
  canEditProducts,
  canDeleteProducts,
  onEditProduct,
  onDeleteProduct,
}: InventoryTableProps) {
  const { txt } = useLanguage();
  const totalColumns = canViewBuyPrice ? 8 : 7;

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
      <div className="overflow-x-auto min-h-[320px]">
        <table className="w-full min-w-[800px] text-left text-xs">
          <thead className="bg-slate-950/70 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4">{txt("SKU / কোড", "SKU / Code")}</th>
              <th className="py-3.5 px-4">{txt("পণ্যের নাম", "Product Name")}</th>
              <th className="py-3.5 px-4">{txt("ক্যাটাগরি", "Category")}</th>
              {canViewBuyPrice && (
                <th className="py-3.5 px-4 text-right">{txt("ক্রয় মূল্য", "Cost Price")}</th>
              )}
              <th className="py-3.5 px-4 text-right">{txt("বিক্রয় মূল্য", "Selling Price")}</th>
              <th className="py-3.5 px-4 text-center">{txt("স্টক পরিমাণ", "Stock Level")}</th>
              <th className="py-3.5 px-4 text-center">{txt("স্ট্যাটাস", "Status")}</th>
              <th className="py-3.5 px-4 text-right">{txt("অ্যাকশন", "Actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading ? (
              <ShimmerTableRows rows={8} cols={totalColumns} />
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={totalColumns} className="py-12 text-center text-slate-500">
                  {txt(
                    "বর্তমান শর্ত অনুযায়ী কোনো পণ্য খুঁজে পাওয়া যায়নি।",
                    "No products found matching current criteria."
                  )}
                </td>
              </tr>
            ) : (
              products.map((p) => {
                const isLow = p.stockQuantity <= p.minStockAlert;
                const rawSku = (p.sku || (p as any).code || "").trim();
                const displaySku = rawSku !== "" ? rawSku : "-";

                return (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors group">
                    {/* SKU কোড */}
                    <td className="py-3.5 px-4 font-mono text-slate-400 font-medium">
                      {displaySku}
                    </td>

                    {/* পণ্যের নাম */}
                    <td className="py-3.5 px-4 font-semibold text-white">{p.name}</td>

                    {/* ক্যাটাগরি */}
                    <td className="py-3.5 px-4 text-slate-300">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 border border-slate-700/60 font-medium">
                        {p.categoryName || (p as any).category || "General"}
                      </span>
                    </td>

                    {/* ক্রয় মূল্য (অনুমতিপ্রাপ্তদের জন্য) */}
                    {canViewBuyPrice && (
                      <td className="py-3.5 px-4 text-right text-slate-400 font-mono">
                        {formatCurrency(p.costPrice)}
                      </td>
                    )}

                    {/* বিক্রয় মূল্য */}
                    <td className="py-3.5 px-4 text-right font-bold text-white font-mono">
                      {formatCurrency(p.sellingPrice)}
                    </td>

                    {/* স্টক পরিমাণ ও একক */}
                    <td className="py-3.5 px-4 text-center font-semibold font-mono">
                      <span className={isLow ? "text-rose-400 font-bold" : "text-white"}>
                        {p.stockQuantity} {p.unit}
                      </span>
                    </td>

                    {/* স্টক স্ট্যাটাস ব্যাজ */}
                    <td className="py-3.5 px-4 text-center">
                      {isLow ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                          <AlertTriangle className="w-3 h-3" />
                          {txt(`কম স্টক (≤${p.minStockAlert})`, `Low Stock (≤${p.minStockAlert})`)}
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                          {txt("স্টকে আছে", "In Stock")}
                        </span>
                      )}
                    </td>

                    {/* অ্যাকশন বাটনসমূহ (সম্পাদনা ও ডিলিট) */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {canEditProducts && (
                          <button
                            onClick={() => onEditProduct(p)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
                            title={txt("পণ্য বিবরণ সম্পাদনা করুন", "Edit Product Details")}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {canDeleteProducts && (
                          <button
                            onClick={() => onDeleteProduct(p)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
                            title={txt("পণ্য মুছে ফেলুন", "Delete Product")}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
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
