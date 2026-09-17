"use client";

import { useState, useEffect, useMemo } from "react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { InventoryService, SalesService, AuthService } from "@/lib/api/client";
import { ProductItem, Category, CartItem, Invoice } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { ThermalReceipt } from "@/components/pos/ThermalReceipt";
import {
  Search,
  Barcode,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  CheckCircle2,
  Printer,
  CreditCard,
  User,
  Phone,
  Sparkles,
  ArrowRight,
  Package,
  X,
} from "lucide-react";

export default function PosTerminalPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  // Customer & Billing details
  const [customerName, setCustomerName] = useState("Walk-in Customer");
  const [customerPhone, setCustomerPhone] = useState("");
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(0); // 0% or 5% etc
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CARD" | "BKASH" | "NAGAD">("CASH");
  const [paidAmount, setPaidAmount] = useState<number>(0);

  // Completed Invoice for Receipt Printing
  const [completedInvoice, setCompletedInvoice] = useState<Invoice | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [prods, cats] = await Promise.all([
          InventoryService.getProducts(),
          InventoryService.getCategories(),
        ]);
        setProducts(prods);
        setCategories(cats);
      } catch (err) {
        console.error("Failed to load POS data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter products by category & search term (name / SKU / barcode / category)
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const selectedCatObj = categories.find((c) => c.id === selectedCategory);
      const targetCatName = selectedCatObj ? selectedCatObj.name.toLowerCase() : selectedCategory.toLowerCase();
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

  // Cart Calculations
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.lineTotal, 0);
  }, [cart]);

  const taxAmount = useMemo(() => {
    return Math.round((subtotal * taxRate) / 100);
  }, [subtotal, taxRate]);

  const grandTotal = useMemo(() => {
    return Math.max(0, subtotal - discountAmount + taxAmount);
  }, [subtotal, discountAmount, taxAmount]);

  // Auto-fill paid amount to match grandTotal initially
  useEffect(() => {
    setPaidAmount(grandTotal);
  }, [grandTotal]);

  const dueAmount = Math.max(0, grandTotal - paidAmount);
  const changeAmount = Math.max(0, paidAmount - grandTotal);

  // Add Item to Cart
  const addToCart = (product: ProductItem) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? {
                ...item,
                cartQuantity: item.cartQuantity + 1,
                lineTotal: (item.cartQuantity + 1) * item.sellingPrice,
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
            lineTotal: product.sellingPrice,
          },
        ];
      }
    });
  };

  // Update Cart Item Quantity
  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === productId) {
            const newQty = item.cartQuantity + delta;
            return newQty > 0
              ? { ...item, cartQuantity: newQty, lineTotal: newQty * item.sellingPrice }
              : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  // Handle Complete Checkout
  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsCheckingOut(true);

    try {
      const payload = {
        customerName: customerName || "Walk-in Customer",
        customerPhone: customerPhone || undefined,
        items: cart.map((item) => ({
          productId: item.id,
          productName: item.name,
          quantity: item.cartQuantity,
          price: item.sellingPrice,
          total: item.lineTotal,
        })),
        subtotal,
        discount: discountAmount,
        tax: taxAmount,
        grandTotal,
        paidAmount,
        dueAmount,
        paymentMethod,
        cashierName: AuthService.getCurrentUser()?.name || "Active Cashier",
      };

      const newInvoice = await SalesService.createSale(payload);
      setCompletedInvoice(newInvoice);

      // Reset Cart
      setCart([]);
      setCustomerName("Walk-in Customer");
      setCustomerPhone("");
      setDiscountAmount(0);
      setIsMobileCartOpen(false);
    } catch (err) {
      console.error("POS Checkout failed", err);
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      <DashboardHeader title="High-Speed Cloud POS Terminal" />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Side: Product Browser & Catalog */}
        <div className="flex-1 flex flex-col p-3 sm:p-4 overflow-hidden border-r border-slate-800 pb-20 lg:pb-4">
          {/* Search Bar & Barcode Scanner */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products by Name, SKU, or Barcode (e.g. 890103...)"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
              <Barcode className="w-4 h-4 text-indigo-400" />
              <span className="hidden sm:inline">Scanner Ready</span>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-2 no-scrollbar">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                selectedCategory === "all"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-900 text-slate-400 hover:text-white"
              }`}
            >
              All Categories ({products.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-colors ${
                  selectedCategory === cat.id
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-900 text-slate-400 hover:text-white"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="flex-1 overflow-y-auto pr-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredProducts.map((product) => {
                const inCart = cart.find((item) => item.id === product.id);
                const isLowStock = product.stockQuantity <= product.minStockAlert;

                return (
                  <div
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/60 cursor-pointer transition-all flex flex-col justify-between group relative"
                  >
                    {inCart && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shadow">
                        {inCart.cartQuantity}
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-mono text-slate-500 truncate">
                          {product.sku && product.sku.trim() !== "" ? product.sku : "SKU-N/A"}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-indigo-400 font-medium shrink-0">
                          {product.categoryName || (product as any).category || "General"}
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
                          product.stockQuantity <= 0
                            ? "bg-rose-500/20 text-rose-400 font-bold"
                            : isLowStock
                            ? "bg-amber-500/20 text-amber-400 font-semibold"
                            : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {product.stockQuantity <= 0
                          ? "Out of Stock (0)"
                          : isLowStock
                          ? `Low (${product.stockQuantity})`
                          : `${product.stockQuantity} ${product.unit}`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile Cart Backdrop */}
        {isMobileCartOpen && (
          <div
            className="fixed inset-0 z-40 bg-slate-950/75 backdrop-blur-sm lg:hidden transition-opacity"
            onClick={() => setIsMobileCartOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Right Side: Active Cart & Checkout Panel */}
        <div
          className={`fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-slate-900 flex flex-col h-full border-l border-slate-800 shadow-2xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
            isMobileCartOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
          }`}
        >
          {/* Cart Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMobileCartOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden transition-colors"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
              <ShoppingCart className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Active Register Cart ({cart.reduce((s, i) => s + i.cartQuantity, 0)})
              </h3>
            </div>
            {cart.length > 0 && (
              <button
                onClick={() => setCart([])}
                className="text-[11px] text-rose-400 hover:text-rose-300 transition-colors"
              >
                Clear Cart
              </button>
            )}
          </div>

          {/* Customer input fields */}
          <div className="p-3 border-b border-slate-800 bg-slate-950/40 space-y-2">
            <div className="relative">
              <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Customer Name"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="relative">
              <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Customer Phone (for SMS/Ledger)"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <ShoppingCart className="w-10 h-10 text-slate-700 mb-2" />
                <p className="text-xs font-medium">Register Cart is Empty</p>
                <p className="text-[11px] text-slate-600 mt-1">
                  Click any product or scan barcode to add to billing bill
                </p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{item.name}</p>
                    <p className="text-[10px] text-slate-400">
                      {formatCurrency(item.sellingPrice)} × {item.cartQuantity}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold text-white w-5 text-center">
                      {item.cartQuantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="text-right min-w-[60px]">
                    <p className="text-xs font-bold text-white">{formatCurrency(item.lineTotal)}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Calculation & Payment Tender */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/60 space-y-3">
            {/* Payment Method Pills */}
            <div className="grid grid-cols-4 gap-1">
              {(["CASH", "CARD", "BKASH", "NAGAD"] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`py-1 rounded text-[10px] font-bold transition-colors ${
                    paymentMethod === method
                      ? "bg-indigo-600 text-white shadow"
                      : "bg-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>

            {/* Discount & Subtotals */}
            <div className="space-y-1.5 text-xs text-slate-400 pt-1">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold text-white">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span>Discount (৳):</span>
                <input
                  type="number"
                  min={0}
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(Number(e.target.value))}
                  className="w-20 bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-right text-xs text-emerald-400 font-semibold focus:outline-none"
                />
              </div>
              <div className="flex justify-between text-sm font-extrabold text-white pt-1.5 border-t border-slate-800">
                <span>Grand Total:</span>
                <span className="text-emerald-400">{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            {/* Paid & Due Inputs */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <span className="text-xs text-slate-400">Received (৳):</span>
              <input
                type="number"
                min={0}
                value={paidAmount}
                onChange={(e) => setPaidAmount(Number(e.target.value))}
                className="w-28 bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-right text-xs text-white font-bold focus:outline-none"
              />
            </div>

            {dueAmount > 0 && (
              <div className="flex justify-between text-xs text-rose-400 font-semibold">
                <span>Remaining Due:</span>
                <span>{formatCurrency(dueAmount)}</span>
              </div>
            )}
            {changeAmount > 0 && (
              <div className="flex justify-between text-xs text-indigo-400 font-semibold">
                <span>Return Change:</span>
                <span>{formatCurrency(changeAmount)}</span>
              </div>
            )}

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || isCheckingOut}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              {isCheckingOut ? "Processing Invoice..." : `Complete & Print Invoice (${formatCurrency(grandTotal)})`}
            </button>
          </div>
        </div>
      </div>

      {/* Floating Bottom Cart Bar on Mobile */}
      {cart.length > 0 && !isMobileCartOpen && (
        <div className="lg:hidden fixed bottom-4 left-4 right-4 z-30">
          <button
            onClick={() => setIsMobileCartOpen(true)}
            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white p-3.5 rounded-2xl shadow-2xl flex items-center justify-between border border-indigo-400/30 transition-all active:scale-95"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-bold text-xs">
                {cart.reduce((s, i) => s + i.cartQuantity, 0)}
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold leading-tight">View Cart ({cart.length} items)</p>
                <p className="text-[11px] text-indigo-200 font-mono">{formatCurrency(grandTotal)}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold bg-white text-indigo-950 px-3.5 py-1.5 rounded-xl shadow">
              <span>Review & Pay</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>
      )}

      {/* Thermal Receipt Print Modal */}
      {completedInvoice && (
        <ThermalReceipt
          invoice={completedInvoice}
          onClose={() => setCompletedInvoice(null)}
        />
      )}
    </div>
  );
}
