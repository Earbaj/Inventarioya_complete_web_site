"use client";

import React from "react";
import { ProductItem, Category } from "@/types";
import { useLanguage } from "@/context/LanguageContext";
import { Plus, Pencil, X, RefreshCw } from "lucide-react";

export interface ProductFormModalProps {
  isOpen: boolean;
  mode: "add" | "edit";
  productData: Partial<ProductItem>;
  setProductData: React.Dispatch<React.SetStateAction<any>>;
  categories: Category[];
  canViewBuyPrice: boolean;
  isSubmitting: boolean;
  actionError: string | null;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

/**
 * পণ্য যোগ ও সম্পাদনা মোডাল (Add / Edit Product Modal)
 * নতুন পণ্যের নাম, SKU, ক্রয়/বিক্রয় মূল্য, স্টক এবং অ্যালার্ট সীমা ইনপুট নেয় বা আপডেট করে।
 */
export function ProductFormModal({
  isOpen,
  mode,
  productData,
  setProductData,
  categories,
  canViewBuyPrice,
  isSubmitting,
  actionError,
  onClose,
  onSubmit,
}: ProductFormModalProps) {
  const { txt } = useLanguage();

  if (!isOpen) return null;

  const isEdit = mode === "edit";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto my-auto">
        {/* মোডাল হেডার */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isEdit
                  ? "bg-indigo-500/20 text-indigo-400"
                  : "bg-emerald-500/20 text-emerald-400"
              }`}
            >
              {isEdit ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {isEdit
                  ? txt("পণ্য সম্পাদনা", "Edit Product")
                  : txt("ইনভেন্টরিতে নতুন পণ্য যোগ করুন", "Add New Product to Inventory")}
              </h3>
              {isEdit && productData.id && (
                <p className="text-[10px] text-slate-400 font-mono">
                  ID: {productData.id.slice(0, 8)}...
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* এরর অ্যালার্ট */}
        {actionError && (
          <div className="mb-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
            {actionError}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-3 text-xs">
          {/* নাম */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              {txt("পণ্যের নাম / শিরোনাম", "Product Title / Name")}
            </label>
            <input
              type="text"
              required
              value={productData.name || ""}
              onChange={(e) => setProductData({ ...productData, name: e.target.value })}
              placeholder={txt("যেমন: প্রাণ ম্যাঙ্গো জুস ২৫০ মি.লি.", "e.g. Pran Mango Juice 250ml")}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* SKU ও ক্যাটাগরি */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                {txt("SKU / আইটেম কোড (ঐচ্ছিক)", "SKU / Item Code (Optional)")}
              </label>
              <input
                type="text"
                value={productData.sku || (productData as any).code || ""}
                onChange={(e) => setProductData({ ...productData, sku: e.target.value, code: e.target.value })}
                placeholder={txt("ঐচ্ছিক (যেমন: PMJ-250)", "Optional (e.g. PMJ-250)")}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">{txt("ক্যাটাগরি", "Category")}</label>
              {isEdit ? (
                <>
                  <input
                    type="text"
                    list="category-suggestions"
                    value={productData.categoryName || (productData as any).category || ""}
                    onChange={(e) => setProductData({ ...productData, categoryName: e.target.value, category: e.target.value })}
                    placeholder={txt("জেনারেল, ইলেকট্রনিক্স ইত্যাদি", "General, Electric, etc.")}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                  <datalist id="category-suggestions">
                    {categories.map((c) => (
                      <option key={c.id} value={c.name} />
                    ))}
                  </datalist>
                </>
              ) : (
                <select
                  aria-label={txt("ক্যাটাগরি নির্বাচন", "Category Selection")}
                  value={productData.categoryName || "General"}
                  onChange={(e) => setProductData({ ...productData, categoryName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="General">General</option>
                  {categories.filter((c) => c.name.toLowerCase() !== "general").map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* ক্রয় ও বিক্রয় মূল্য */}
          <div className={`grid ${canViewBuyPrice ? "grid-cols-2" : "grid-cols-1"} gap-3`}>
            {canViewBuyPrice && (
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  {txt("কেনা দাম / ক্রয় মূল্য (৳)", "Cost / Buy Price (৳)")}
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={productData.costPrice ?? (productData as any).buyPrice ?? 0}
                  onChange={(e) => setProductData({ ...productData, costPrice: Number(e.target.value), buyPrice: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            )}
            <div>
              <label className="block text-slate-300 font-medium mb-1">{txt("বিক্রয় মূল্য (৳)", "Selling Price (৳)")}</label>
              <input
                type="number"
                step="any"
                min="0"
                required
                value={productData.sellingPrice ?? (productData as any).sellPrice ?? 0}
                onChange={(e) => setProductData({ ...productData, sellingPrice: Number(e.target.value), sellPrice: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* স্টক পরিমাণ, সতর্কতা ও একক */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                {isEdit ? txt("স্টক পরিমাণ", "Stock Quantity") : txt("শুরুর স্টক", "Initial Qty")}
              </label>
              <input
                type="number"
                min="0"
                required
                value={productData.stockQuantity ?? 0}
                onChange={(e) => setProductData({ ...productData, stockQuantity: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">{txt("কম স্টক সতর্কবার্তা", "Min Stock Alert")}</label>
              <input
                type="number"
                min="0"
                value={productData.minStockAlert ?? (productData as any).lowStockThreshold ?? 5}
                onChange={(e) => setProductData({ ...productData, minStockAlert: Number(e.target.value), lowStockThreshold: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">{txt("একক / ইউনিট", "Unit")}</label>
              <input
                type="text"
                value={productData.unit || "Piece"}
                onChange={(e) => setProductData({ ...productData, unit: e.target.value })}
                placeholder={txt("টি, প্যাকেট ইত্যাদি", "pcs, box, etc.")}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* ফুটার বাটনসমূহ */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium cursor-pointer"
            >
              {txt("বাতিল", "Cancel")}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{txt("সংরক্ষণ হচ্ছে...", "Saving...")}</span>
                </>
              ) : (
                <span>
                  {isEdit
                    ? txt("পরিবর্তন সংরক্ষণ করুন", "Save Changes")
                    : txt("পণ্য সংরক্ষণ করুন", "Save Product")}
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
