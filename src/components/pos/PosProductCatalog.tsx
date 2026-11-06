"use client";

import React, { useMemo } from "react";
import { ProductItem, Category, CartItem } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import { ShimmerPosProduct, ShimmerItem } from "@/components/ui/ShimmerSkeleton";
import { Search, Barcode, AlertTriangle } from "lucide-react";

export interface PosProductCatalogProps {
  products: ProductItem[];
  categories: Category[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  cart: CartItem[];
  loading: boolean;
  onAddToCart: (product: ProductItem) => void;
}

/**
 * পিওএস পণ্য ব্রাউজার ও ক্যাটালগ গ্রিড (POS Product Catalog & Browser)
 * পণ্যের নাম/বারকোড সার্চ, ক্যাটাগরি ফিল্টার এবং স্টক অ্যালার্ট প্রদর্শন করে।
 */
export function PosProductCatalog({
  products,
  categories,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  cart,
  loading,
  onAddToCart,
}: PosProductCatalogProps) {
  const { txt } = useLanguage();

  // ক্যাটাগরি ও সার্চ টার্ম অনুযায়ী পণ্য ফিল্টারিং
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const selectedCatObj = categories.find((c) => c.id === selectedCategory);
      const targetCatName = selectedCatObj
        ? selectedCatObj.name.toLowerCase()
        : selectedCategory.toLowerCase();
      const productCatName = (p.categoryName || (p as any).category || "").toLowerCase();

      const matchCat =
        selectedCategory === "all" ||
        p.categoryId === selectedCategory ||
        productCatName === targetCatName;

      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchCat;

      const matchSearch =
        p.name.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        ((p as any).code && (p as any).code.toLowerCase().includes(q)) ||
        (p.barcode && p.barcode.includes(q)) ||
        productCatName.includes(q);

      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, searchQuery, categories]);

  return (
    <div className="flex-1 flex flex-col p-3 sm:p-4 overflow-hidden border-r border-slate-800 pb-20 lg:pb-4">
      {/* সার্চ বার ও বারকোড স্ক্যানার ব্যাজ */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={txt(
              "পণ্যের নাম, SKU বা বারকোড স্ক্যান করুন...",
              "Search products by Name, SKU, or Barcode (e.g. 890103...)"
            )}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
          <Barcode className="w-4 h-4 text-indigo-400" />
          <span className="hidden sm:inline">{txt("স্ক্যানার রেডি", "Scanner Ready")}</span>
        </div>
      </div>

      {/* ক্যাটাগরি ফিল্টার পিলস */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-2 no-scrollbar">
        {loading ? (
          <>
            <ShimmerItem className="w-24 h-7 shrink-0" rounded="rounded-lg" />
            <ShimmerItem className="w-20 h-7 shrink-0" rounded="rounded-lg" />
            <ShimmerItem className="w-20 h-7 shrink-0" rounded="rounded-lg" />
            <ShimmerItem className="w-20 h-7 shrink-0" rounded="rounded-lg" />
          </>
        ) : (
          <>
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
                selectedCategory === "all"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-900 text-slate-400 hover:text-white"
              }`}
            >
              {txt(`সকল ক্যাটাগরি (${products.length})`, `All Categories (${products.length})`)}
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-colors cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-900 text-slate-400 hover:text-white"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </>
        )}
      </div>

      {/* প্রোডাক্টস গ্রিড */}
      <div className="flex-1 overflow-y-auto pr-1">
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
          {loading ? (
            <ShimmerPosProduct count={8} />
          ) : filteredProducts.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-500 text-xs">
              {txt("কোনো পণ্য পাওয়া যায়নি", "No products found")}
            </div>
          ) : (
            filteredProducts.map((product) => {
              const inCart = cart.find((item) => item.id === product.id);
              const isOutOfStock = product.stockQuantity <= 0;
              const isLowStock = !isOutOfStock && product.stockQuantity <= product.minStockAlert;
              const isMaxInCart = inCart ? inCart.cartQuantity >= product.stockQuantity : false;

              return (
                <div
                  key={product.id}
                  onClick={() => onAddToCart(product)}
                  className={`p-3 rounded-xl border transition-all flex flex-col justify-between group relative ${
                    isOutOfStock
                      ? "bg-slate-900/40 border-slate-800/60 opacity-60 cursor-not-allowed select-none"
                      : isMaxInCart
                      ? "bg-slate-900 border-indigo-500/50 cursor-pointer"
                      : "bg-slate-900 border-slate-800 hover:border-indigo-500/60 cursor-pointer"
                  }`}
                >
                  {isOutOfStock && (
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold text-[9px] border border-rose-500/30 flex items-center gap-1">
                      <AlertTriangle className="w-2.5 h-2.5" /> {txt("স্টক শেষ", "Out of Stock")}
                    </div>
                  )}
                  {inCart && !isOutOfStock && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shadow">
                      {inCart.cartQuantity}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1 pr-14">
                      <span className="text-[10px] font-mono text-slate-500 truncate">
                        {product.sku && product.sku.trim() !== "" ? product.sku : "SKU-N/A"}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-indigo-400 font-medium shrink-0">
                        {product.categoryName || (product as any).category || txt("সাধারণ", "General")}
                      </span>
                    </div>
                    <h4 className="text-xs font-semibold text-white line-clamp-2 group-hover:text-indigo-300">
                      {product.name}
                    </h4>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-xs font-bold text-white">
                      {formatCurrency(product.sellingPrice)}
                    </span>
                    <span
                      className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                        isOutOfStock
                          ? "bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30"
                          : isLowStock
                          ? "bg-amber-500/20 text-amber-400 font-semibold"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {isOutOfStock
                        ? txt("স্টক নেই (০)", "Out of Stock (0)")
                        : isLowStock
                        ? `${txt("কম", "Low")} (${product.stockQuantity})`
                        : `${product.stockQuantity} ${product.unit || txt("টি", "pcs")}`}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
