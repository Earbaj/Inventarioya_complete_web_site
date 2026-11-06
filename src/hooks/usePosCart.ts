import { useState, useMemo, useEffect } from "react";
import { CartItem, ProductItem } from "@/types";
import { round2 } from "@/lib/utils";

export type PaymentMethodType = "CASH" | "CARD" | "BKASH" | "NAGAD" | "DUE";

/**
 * পিওএস কার্ট ও ফাইন্যান্সিয়াল ক্যালকুলেশন হুক (POS Cart State & Financial Calculations Hook)
 * পণ্যের পরিমাণ সমন্বয়, সাবটোটাল, ডিসকাউন্ট, গ্র্যান্ড টোটাল, পেইড এবং বকেয়া নির্ভুলভাবে হিসাব করে।
 */
export function usePosCart(onStockWarning: (msg: string) => void) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>("CASH");
  const [paidAmount, setPaidAmount] = useState<number>(0);

  // সাবটোটাল হিসাব (দশমিক ২ ডিজিট প্রিসিশন সহ)
  const subtotal = useMemo(() => {
    const raw = cart.reduce((sum, item) => sum + Number(item.lineTotal || 0), 0);
    return round2(raw);
  }, [cart]);

  // ডিসকাউন্ট বা ছাড়ের পরিমাণ হিসাব
  const discountAmount = useMemo(() => {
    if (!subtotal || !discountPercent || discountPercent <= 0) return 0;
    const pct = Math.min(100, Math.max(0, Number(discountPercent)));
    return round2((subtotal * pct) / 100);
  }, [subtotal, discountPercent]);

  // ট্যাক্স বা ভ্যাট হিসাব
  const taxAmount = useMemo(() => {
    if (!subtotal || !taxRate || taxRate <= 0) return 0;
    return round2((subtotal * Number(taxRate)) / 100);
  }, [subtotal, taxRate]);

  // সর্বমোট প্রদেয় বিল (Grand Total)
  const grandTotal = useMemo(() => {
    return round2(Math.max(0, subtotal - discountAmount + taxAmount));
  }, [subtotal, discountAmount, taxAmount]);

  // গ্র্যান্ড টোটাল বা পেমেন্ট মেথড পরিবর্তিত হলে স্বয়ংক্রিয়ভাবে পেইড অ্যামাউন্ট নির্ধারণ
  useEffect(() => {
    if (paymentMethod === "DUE") {
      setPaidAmount(0);
    } else {
      setPaidAmount(grandTotal);
    }
  }, [grandTotal, paymentMethod]);

  // বাকি বা বকেয়া পরিমাণ
  const dueAmount = useMemo(() => {
    return round2(Math.max(0, grandTotal - paidAmount));
  }, [grandTotal, paidAmount]);

  // ফেরতযোগ্য অতিরিক্ত টাকা (Change)
  const changeAmount = useMemo(() => {
    return round2(Math.max(0, paidAmount - grandTotal));
  }, [grandTotal, paidAmount]);

  // কার্টে নতুন পণ্য যোগ করা
  const addToCart = (product: ProductItem) => {
    if (product.stockQuantity <= 0) {
      onStockWarning(`"${product.name}" is out of stock and cannot be added!`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        if (existing.cartQuantity >= product.stockQuantity) {
          onStockWarning(
            `Cannot add more! Only ${product.stockQuantity} ${product.unit || "pcs"} available for "${product.name}".`
          );
          return prev;
        }
        return prev.map((item) =>
          item.id === product.id
            ? {
                ...item,
                cartQuantity: round2(item.cartQuantity + 1),
                lineTotal: round2((item.cartQuantity + 1) * Number(item.sellingPrice)),
              }
            : item
        );
      } else {
        return [
          ...prev,
          {
            ...product,
            cartQuantity: 1,
            discount: 0,
            lineTotal: round2(Number(product.sellingPrice)),
          },
        ];
      }
    });
  };

  // সরাসরি সঠিক পরিমাণ ইনপুট দেওয়া
  const setExactQuantity = (productId: string, quantityInput: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === productId) {
          const qty = round2(Math.max(0, quantityInput));
          if (qty > item.stockQuantity) {
            onStockWarning(
              `Only ${item.stockQuantity} ${item.unit || "pcs"} available in stock for "${item.name}". Set to maximum.`
            );
            const maxQty = item.stockQuantity;
            return { ...item, cartQuantity: maxQty, lineTotal: round2(maxQty * Number(item.sellingPrice)) };
          }
          return {
            ...item,
            cartQuantity: qty,
            lineTotal: round2(qty * Number(item.sellingPrice)),
          };
        }
        return item;
      })
    );
  };

  // কার্ট থেকে একক পণ্য মুছে ফেলা
  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  // সম্পূর্ণ কার্ট খালি করা
  const clearCart = () => {
    setCart([]);
    setDiscountPercent(0);
    setPaymentMethod("CASH");
  };

  return {
    cart,
    setCart,
    subtotal,
    discountPercent,
    setDiscountPercent,
    discountAmount,
    taxRate,
    setTaxRate,
    taxAmount,
    grandTotal,
    paymentMethod,
    setPaymentMethod,
    paidAmount,
    setPaidAmount,
    dueAmount,
    changeAmount,
    addToCart,
    setExactQuantity,
    removeFromCart,
    clearCart,
  };
}
