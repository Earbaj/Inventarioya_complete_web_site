"use client";

import React from "react";
import { CartItem } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import { ShoppingCart, Trash2 } from "lucide-react";

export interface PosCartItemListProps {
  cart: CartItem[];
  onSetExactQuantity: (productId: string, qty: number) => void;
  onRemoveFromCart: (productId: string) => void;
}

/**
 * পিওএস কার্ট আইটেম তালিকা (POS Cart Item Line Rows)
 * প্রতিটি কার্ট আইটেমের নাম, ইউনিট মূল্য, পরিমাণ ইনপুট এবং লাইন টোটাল প্রদর্শন করে।
 */
export function PosCartItemList({
  cart,
  onSetExactQuantity,
  onRemoveFromCart,
}: PosCartItemListProps) {
  const { txt } = useLanguage();

  if (cart.length === 0) {
    return (
      <div className="flex-1 min-h-[220px] flex flex-col items-center justify-center text-center p-6 text-slate-500">
        <ShoppingCart className="w-9 h-9 text-slate-700 mb-2" />
        <p className="text-xs font-medium">{txt("বিলিং কার্ট খালি", "Register Cart is Empty")}</p>
        <p className="text-[10px] text-slate-600 mt-1 max-w-[200px]">
          {txt(
            "পণ্য সিলেক্ট করুন বা বারকোড স্ক্যান করে কার্টে যোগ করুন",
            "Click product or scan barcode to add to cart"
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1.5">
      {cart.map((item) => (
        <div
          key={item.id}
          className="py-1.5 px-2.5 rounded-lg bg-slate-950/80 hover:bg-slate-950 border border-slate-800/80 hover:border-slate-700/80 transition-all flex items-center justify-between gap-2 text-xs group"
        >
          {/* আইটেমের নাম ও ইউনিট মূল্য */}
          <div className="flex-1 min-w-0 pr-1">
            <p className="font-semibold text-white truncate text-[11px] leading-tight">
              {item.name}
            </p>
            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono mt-0.5">
              <span>{formatCurrency(item.sellingPrice)}</span>
              <span>×</span>
              <span className="font-bold text-slate-200">{item.cartQuantity}</span>
              {item.unit && <span className="text-slate-500">({item.unit})</span>}
              {item.cartQuantity >= item.stockQuantity && (
                <span className="text-[9px] text-amber-400 font-semibold">
                  ({txt("সর্বোচ্চ", "Max")})
                </span>
              )}
            </div>
          </div>

          {/* পরিমাণ পরিবর্তনের ইনপুট */}
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[10px] text-slate-400 font-medium">
              {txt("পরিমাণ:", "Qty:")}
            </span>
            <input
              type="number"
              step="any"
              min="0.01"
              max={item.stockQuantity}
              value={item.cartQuantity === 0 ? "" : item.cartQuantity}
              onChange={(e) => {
                const raw = e.target.value;
                if (raw === "") {
                  onSetExactQuantity(item.id, 0);
                  return;
                }
                const val = parseFloat(raw);
                if (!isNaN(val)) onSetExactQuantity(item.id, val);
              }}
              onBlur={() => {
                if (item.cartQuantity <= 0) onSetExactQuantity(item.id, 1);
              }}
              className="w-14 h-7 bg-slate-900 border border-slate-700 hover:border-slate-600 focus:border-indigo-500 rounded-lg text-center text-xs font-bold text-white focus:outline-none font-mono shadow-inner transition-colors"
              title={txt("সরাসরি পরিমাণ লিখুন", "Type exact quantity")}
            />
          </div>

          {/* লাইন টোটাল ও ডিলিট বাটন */}
          <div className="flex items-center gap-1.5 shrink-0 pl-1">
            <span className="font-mono font-bold text-white text-xs min-w-[55px] text-right">
              {formatCurrency(item.lineTotal)}
            </span>
            <button
              type="button"
              onClick={() => onRemoveFromCart(item.id)}
              className="w-6 h-6 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 active:scale-90 flex items-center justify-center transition-all cursor-pointer shrink-0"
              title={txt(`"${item.name}" কার্ট থেকে বাদ দিন`, `Remove "${item.name}" from cart`)}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
