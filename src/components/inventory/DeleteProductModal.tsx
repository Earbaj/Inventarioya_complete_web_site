"use client";

import React from "react";
import { ProductItem } from "@/types";
import { useLanguage } from "@/context/LanguageContext";
import { Trash2, RefreshCw } from "lucide-react";

export interface DeleteProductModalProps {
  isOpen: boolean;
  product: ProductItem | null;
  isSubmitting: boolean;
  actionError: string | null;
  onClose: () => void;
  onConfirmDelete: () => void;
}

/**
 * পণ্য মুছে ফেলার নিশ্চিতকরণ মোডাল (Delete Product Confirmation Modal)
 * পণ্যটি সক্রিয় তালিকা থেকে মুছে ফেলার আগে নিশ্চিতকরণ চায়।
 */
export function DeleteProductModal({
  isOpen,
  product,
  isSubmitting,
  actionError,
  onClose,
  onConfirmDelete,
}: DeleteProductModalProps) {
  const { txt } = useLanguage();

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-rose-500/40 rounded-2xl max-w-sm w-full p-5 sm:p-6 shadow-2xl my-auto">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">{txt("পণ্য মুছে ফেলুন", "Delete Product")}</h3>
            <p className="text-[11px] text-slate-400">
              {txt("ক্যাটালগ থেকে অপসারণ নিশ্চিতকরণ", "Confirm catalog removal")}
            </p>
          </div>
        </div>

        {actionError && (
          <div className="mb-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
            {actionError}
          </div>
        )}

        <p className="text-xs text-slate-300 leading-relaxed mb-4">
          {txt(
            `আপনি কি নিশ্চিত যে "${product.name}" মুছে ফেলতে চান?`,
            `Are you sure you want to delete "${product.name}"?`
          )}
          {product.sku && (
            <span className="block text-slate-400 text-[11px] mt-1 font-mono">
              SKU: {product.sku}
            </span>
          )}
          {txt(
            "এই পণ্যটি আপনার সক্রিয় ক্যাটালগ থেকে মুছে ট্র্যাশে পাঠানো হবে।",
            "This product will be removed from your active catalog and moved to Trash."
          )}
        </p>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition-colors cursor-pointer"
          >
            {txt("বাতিল", "Cancel")}
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onConfirmDelete}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>{txt("মুছে ফেলা হচ্ছে...", "Deleting...")}</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>{txt("পণ্য মুছে ফেলুন", "Delete Product")}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
