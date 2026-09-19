"use client";

import { useState, useEffect, useMemo } from "react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { InventoryService, SalesService, AuthService, CustomerService } from "@/lib/api/client";
import { ProductItem, Category, CartItem, Invoice, Customer } from "@/types";
import { formatCurrency, extractPersonName } from "@/lib/utils";
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
  AlertTriangle,
  ChevronDown,
  Loader2,
} from "lucide-react";

import { useLanguage } from "@/context/LanguageContext";

export default function PosTerminalPage() {
  const { txt, isBangla } = useLanguage();
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const [stockWarning, setStockWarning] = useState<string | null>(null);

  // Customer selection & pagination state
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerMeta, setCustomerMeta] = useState<{
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
  }>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
    hasNextPage: false,
  });
  const [customerSearch, setCustomerSearch] = useState("");
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [isLoadingMoreCustomers, setIsLoadingMoreCustomers] = useState(false);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState({
    name: "",
    phone: "",
    address: "",
    openingBalance: 0,
  });
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);

  // Customer & Billing details
  const [customerName, setCustomerName] = useState("Walk-in Customer");
  const [customerPhone, setCustomerPhone] = useState("");
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(0); // 0% or 5% etc
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CARD" | "BKASH" | "NAGAD" | "DUE">("CASH");
  const [paidAmount, setPaidAmount] = useState<number>(0);

  // Completed Invoice for Receipt Printing
  const [completedInvoice, setCompletedInvoice] = useState<Invoice | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Auto-dismiss stock warning banner after 3 seconds
  useEffect(() => {
    if (stockWarning) {
      const timer = setTimeout(() => setStockWarning(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [stockWarning]);

  // Load initial products, categories, and customers
  useEffect(() => {
    async function loadData() {
      try {
        const [prods, cats, custs] = await Promise.all([
          InventoryService.getProducts(),
          InventoryService.getCategories(),
          CustomerService.getCustomers({ page: 1, limit: 20 }),
        ]);
        setProducts(prods);
        setCategories(cats);
        setCustomers(custs.data);
        setCustomerMeta(custs.meta);
      } catch (err) {
        console.error("Failed to load POS data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Fetch customers with debounce & pagination
  const fetchCustomers = async (search = "", page = 1, append = false) => {
    if (append) {
      setIsLoadingMoreCustomers(true);
    } else {
      setIsLoadingCustomers(true);
    }

    try {
      const res = await CustomerService.getCustomers({ search, page, limit: 20 });
      if (append) {
        setCustomers((prev) => [...prev, ...res.data]);
      } else {
        setCustomers(res.data);
      }
      setCustomerMeta(res.meta);
    } catch (err) {
      console.error("Failed to load customers", err);
    } finally {
      setIsLoadingCustomers(false);
      setIsLoadingMoreCustomers(false);
    }
  };

  // Debounced search for customers
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers(customerSearch, 1, false);
    }, 280);
    return () => clearTimeout(timer);
  }, [customerSearch]);

  const loadMoreCustomers = () => {
    if (!customerMeta.hasNextPage || isLoadingMoreCustomers) return;
    fetchCustomers(customerSearch, customerMeta.page + 1, true);
  };

  const handleSelectCustomer = (cust: Customer | null) => {
    if (cust) {
      setSelectedCustomer(cust);
      setCustomerName(cust.name);
      setCustomerPhone(cust.phone || "");
    } else {
      setSelectedCustomer(null);
      setCustomerName("Walk-in Customer");
      setCustomerPhone("");
    }
    setIsCustomerDropdownOpen(false);
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerForm.name || !newCustomerForm.phone) return;
    setIsCreatingCustomer(true);

    try {
      const created = await CustomerService.createCustomer({
        name: newCustomerForm.name,
        phone: newCustomerForm.phone,
        address: newCustomerForm.address,
        openingBalance: Number(newCustomerForm.openingBalance || 0),
      });

      setCustomers((prev) => [created, ...prev]);
      handleSelectCustomer(created);
      setShowAddCustomerModal(false);
      setNewCustomerForm({ name: "", phone: "", address: "", openingBalance: 0 });
    } catch (err) {
      console.error("Failed to create customer", err);
    } finally {
      setIsCreatingCustomer(false);
    }
  };

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

  // Auto-fill paid amount to match grandTotal initially or 0 when DUE is selected
  useEffect(() => {
    if (paymentMethod === "DUE") {
      setPaidAmount(0);
    } else {
      setPaidAmount(grandTotal);
    }
  }, [grandTotal, paymentMethod]);

  const dueAmount = Math.max(0, grandTotal - paidAmount);
  const changeAmount = Math.max(0, paidAmount - grandTotal);

  // Add Item to Cart
  const addToCart = (product: ProductItem) => {
    if (product.stockQuantity <= 0) {
      setStockWarning(`"${product.name}" is out of stock and cannot be added!`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        if (existing.cartQuantity >= product.stockQuantity) {
          setStockWarning(
            `Cannot add more! Only ${product.stockQuantity} ${product.unit || "pcs"} available for "${product.name}".`
          );
          return prev;
        }
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
            if (delta > 0 && newQty > item.stockQuantity) {
              setStockWarning(
                `Only ${item.stockQuantity} ${item.unit || "pcs"} available in stock for "${item.name}".`
              );
              return item;
            }
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

    // Validate that no item in cart is out of stock or exceeds available stock
    const invalidItem = cart.find(
      (item) => item.stockQuantity <= 0 || item.cartQuantity > item.stockQuantity
    );
    if (invalidItem) {
      setStockWarning(
        invalidItem.stockQuantity <= 0
          ? `"${invalidItem.name}" is out of stock and cannot be sold!`
          : `"${invalidItem.name}" quantity exceeds available stock (${invalidItem.stockQuantity} available)!`
      );
      return;
    }

    setIsCheckingOut(true);

    try {
      const payload = {
        customerId: selectedCustomer?.id || "walk-in",
        customerName: customerName || "Walk-in Customer",
        customerPhone: customerPhone || "",
        items: cart.map((item) => ({
          itemId: item.id,
          name: item.name,
          quantity: Number(item.cartQuantity),
          unitPrice: Number(item.sellingPrice),
        })),
        subtotal: Number(subtotal),
        discount: Number(discountAmount),
        tax: Number(taxAmount),
        grandTotal: Number(grandTotal),
        paidAmount: Number(paidAmount),
        dueAmount: Number(dueAmount),
        paymentMethod: dueAmount === grandTotal ? "DUE" : paymentMethod,
        cashierName: extractPersonName(AuthService.getCurrentUser()),
      };

      const newInvoice = await SalesService.createSale(payload);
      setCompletedInvoice(newInvoice);

      // Immediately deduct sold quantities from local active products state
      setProducts((prevProds) =>
        prevProds.map((prod) => {
          const soldItem = cart.find((item) => item.id === prod.id);
          if (soldItem) {
            const newStock = Math.max(0, prod.stockQuantity - soldItem.cartQuantity);
            return {
              ...prod,
              stockQuantity: newStock,
              isLowStock: newStock <= prod.minStockAlert,
            };
          }
          return prod;
        })
      );

      // Update customer closing balance locally if due exists
      if (selectedCustomer && dueAmount > 0) {
        setCustomers((prevCusts) =>
          prevCusts.map((c) => {
            if (c.id === selectedCustomer.id) {
              const currentBal = Number(c.closingBalance || 0);
              const updatedBal = currentBal - dueAmount;
              return { ...c, closingBalance: updatedBal.toFixed(2) };
            }
            return c;
          })
        );
      }

      // Reset Cart & Customer
      setCart([]);
      setSelectedCustomer(null);
      setCustomerName("Walk-in Customer");
      setCustomerPhone("");
      setDiscountAmount(0);
      setPaymentMethod("CASH");
      setIsMobileCartOpen(false);
    } catch (err: any) {
      console.error("POS Checkout failed", err);
      const msg = err.message || "Checkout failed. Please check network and stock.";
      setStockWarning(msg);
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
      <DashboardHeader title={txt("পয়েন্ট অফ সেল (হাই-স্পিড ক্লাউড পিওএস)", "High-Speed Cloud POS Terminal")} />

      {/* Floating Stock Warning Notification */}
      {stockWarning && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-rose-950/95 border border-rose-500 text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2.5 backdrop-blur-sm animate-in fade-in slide-in-from-top-3">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{stockWarning}</span>
          <button
            onClick={() => setStockWarning(null)}
            className="ml-2 text-rose-300 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

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
                placeholder={txt("পণ্যের নাম, SKU বা বারকোড স্ক্যান করুন...", "Search products by Name, SKU, or Barcode (e.g. 890103...)")}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
              <Barcode className="w-4 h-4 text-indigo-400" />
              <span className="hidden sm:inline">{txt("স্ক্যানার রেডি", "Scanner Ready")}</span>
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
              {txt(`সকল ক্যাটাগরি (${products.length})`, `All Categories (${products.length})`)}
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
                const isOutOfStock = product.stockQuantity <= 0;
                const isLowStock = !isOutOfStock && product.stockQuantity <= product.minStockAlert;
                const isMaxInCart = inCart ? inCart.cartQuantity >= product.stockQuantity : false;

                return (
                  <div
                    key={product.id}
                    onClick={() => addToCart(product)}
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
                {txt(`বিলিং কার্ট (${cart.reduce((s, i) => s + i.cartQuantity, 0)})`, `Active Register Cart (${cart.reduce((s, i) => s + i.cartQuantity, 0)})`)}
              </h3>
            </div>
            {cart.length > 0 && (
              <button
                onClick={() => setCart([])}
                className="text-[11px] text-rose-400 hover:text-rose-300 transition-colors"
              >
                {txt("কার্ট খালি করুন", "Clear Cart")}
              </button>
            )}
          </div>

          {/* Customer Selection & Searchable Combobox */}
          <div className="p-3 border-b border-slate-800 bg-slate-950/40 relative">
            <div className="flex items-center justify-between gap-1 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <User className="w-3 h-3 text-indigo-400" />
                {txt("কাস্টমার / বাকি খাতা", "Customer / Ledger")}
              </span>
              <button
                type="button"
                onClick={() => setShowAddCustomerModal(true)}
                className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3 h-3" />
                {txt("নতুন কাস্টমার", "New Customer")}
              </button>
            </div>

            {/* Selected Customer Trigger Box */}
            <div
              onClick={() => setIsCustomerDropdownOpen((prev) => !prev)}
              className="w-full bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-xl px-3 py-2 cursor-pointer transition-all flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-semibold text-white truncate">
                      {selectedCustomer ? selectedCustomer.name : customerName || txt("সাধারণ ক্রেতা (Walk-in)", "Walk-in Customer")}
                    </p>
                    {selectedCustomer && Number(selectedCustomer.closingBalance || 0) < 0 && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0">
                        {txt("বাকি:", "Due:")} {formatCurrency(Math.abs(Number(selectedCustomer.closingBalance)))}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">
                    {selectedCustomer
                      ? selectedCustomer.phone || txt("ফোন নেই", "No phone")
                      : customerPhone ? `${customerPhone} (Custom)` : txt("সাধারণ ক্যাশ খরিদ্দার (খাতা ছাড়া)", "General Customer (No ledger)")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-slate-400 shrink-0">
                {selectedCustomer && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectCustomer(null);
                    }}
                    className="p-1 hover:text-white rounded hover:bg-slate-800 transition-colors"
                    title={txt("সাধারণ কাস্টমারে রিসেট করুন", "Reset to Walk-in Customer")}
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isCustomerDropdownOpen ? "rotate-180" : ""}`} />
              </div>
            </div>

            {/* Searchable Dropdown with Infinite/Paginated Scroll */}
            {isCustomerDropdownOpen && (
              <div className="absolute left-3 right-3 top-full mt-1.5 z-50 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-72">
                {/* Search Input */}
                <div className="p-2 border-b border-slate-800 bg-slate-950/90">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      autoFocus
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      placeholder={txt("কাস্টমারের নাম বা ফোন নম্বর দিয়ে খুঁজুন...", "Search customer by name or phone...")}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-8 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                    {isLoadingCustomers && (
                      <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin absolute right-2.5 top-1/2 -translate-y-1/2" />
                    )}
                  </div>
                </div>

                {/* List Container */}
                <div className="overflow-y-auto flex-1 divide-y divide-slate-800/60">
                  {/* Pinned Walk-in Customer Option */}
                  <div
                    onClick={() => handleSelectCustomer(null)}
                    className={`px-3 py-2 hover:bg-slate-800/70 cursor-pointer flex items-center justify-between transition-colors ${
                      !selectedCustomer ? "bg-indigo-950/40 border-l-2 border-indigo-500" : ""
                    }`}
                  >
                    <div>
                      <p className="text-xs font-semibold text-white flex items-center gap-1.5">
                        {txt("সাধারণ ক্রেতা (Walk-in)", "Walk-in Customer")}
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">{txt("নগদ বিক্রয়", "Cash Sale")}</span>
                      </p>
                      <p className="text-[10px] text-slate-400">{txt("ডিফল্ট সাধারণ নগদ খরিদ্দার", "Default general walk-in buyer")}</p>
                    </div>
                    {!selectedCustomer && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                  </div>

                  {/* Customer Rows */}
                  {customers.map((c) => {
                    const isSelected = selectedCustomer?.id === c.id;
                    const dueNum = Number(c.closingBalance || 0);
                    return (
                      <div
                        key={c.id}
                        onClick={() => handleSelectCustomer(c)}
                        className={`px-3 py-2 hover:bg-slate-800/70 cursor-pointer flex items-center justify-between transition-colors ${
                          isSelected ? "bg-indigo-950/40 border-l-2 border-indigo-500" : ""
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white truncate">{c.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{c.phone}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {dueNum < 0 ? (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/20 text-rose-400">
                              {txt("বাকি:", "Due:")} {formatCurrency(Math.abs(dueNum))}
                            </span>
                          ) : (
                            <span className="text-[9px] text-slate-500">{txt("বাকি নেই", "No Due")}</span>
                          )}
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
                        </div>
                      </div>
                    );
                  })}

                  {/* Empty Search Result */}
                  {customers.length === 0 && !isLoadingCustomers && (
                    <div className="p-4 text-center text-slate-500 text-xs">
                      {txt(`"${customerSearch}" নামে কোনো কাস্টমার পাওয়া যায়নি`, `No customer found for "${customerSearch}"`)}
                    </div>
                  )}

                  {/* Pagination: Load More Button */}
                  {customerMeta.hasNextPage && (
                    <div className="p-2 text-center bg-slate-950/50">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          loadMoreCustomers();
                        }}
                        disabled={isLoadingMoreCustomers}
                        className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 disabled:opacity-50 py-1 px-3 rounded hover:bg-slate-800 transition-colors inline-flex items-center gap-1.5"
                      >
                        {isLoadingMoreCustomers ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            {txt("লোড হচ্ছে...", "Loading more...")}
                          </>
                        ) : (
                          txt(`আরও লোড করুন (${customers.length} / ${customerMeta.total})`, `Load more (${customers.length} of ${customerMeta.total})`)
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Footer with summary & add new customer */}
                <div className="p-2 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">
                    {txt("মোট:", "Total:")} <strong className="text-white">{customerMeta.total}</strong> {txt("জন কাস্টমার", "customers")}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomerDropdownOpen(false);
                      setShowAddCustomerModal(true);
                    }}
                    className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> {txt("দ্রুত যোগ", "Quick Add")}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <ShoppingCart className="w-10 h-10 text-slate-700 mb-2" />
                <p className="text-xs font-medium">{txt("বিলিং কার্ট সম্পূর্ণ খালি", "Register Cart is Empty")}</p>
                <p className="text-[11px] text-slate-600 mt-1">
                  {txt("পণ্য সিলেক্ট করুন বা বারকোড স্ক্যান করে কার্টে যোগ করুন", "Click any product or scan barcode to add to billing bill")}
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
                      {item.cartQuantity >= item.stockQuantity && (
                        <span className="ml-1 text-[9px] text-amber-400 font-semibold">({txt("সর্বোচ্চ স্টক", "Max Stock")})</span>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold text-white w-5 text-center">
                      {item.cartQuantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      disabled={item.cartQuantity >= item.stockQuantity}
                      className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 flex items-center justify-center transition-colors"
                      title={item.cartQuantity >= item.stockQuantity ? txt("সর্বোচ্চ মজুত পৌঁছে গেছে", "Maximum available stock reached") : txt("পরিমাণ বৃদ্ধি করুন", "Increase quantity")}
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
            <div className="grid grid-cols-5 gap-1">
              {(["CASH", "CARD", "BKASH", "NAGAD", "DUE"] as const).map((method) => {
                const isSelected = paymentMethod === method;
                const isDue = method === "DUE";
                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() => {
                      setPaymentMethod(method);
                      if (method === "DUE") {
                        setPaidAmount(0);
                      } else if (paidAmount === 0) {
                        setPaidAmount(grandTotal);
                      }
                    }}
                    className={`py-1 rounded text-[10px] font-bold transition-all ${
                      isSelected
                        ? isDue
                          ? "bg-rose-600 text-white shadow-md shadow-rose-600/30 ring-1 ring-rose-400"
                          : "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                        : isDue
                        ? "bg-rose-950/40 text-rose-300 border border-rose-800/60 hover:bg-rose-900/40"
                        : "bg-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {method === "DUE" ? txt("DUE (বাকি)", "DUE") : method === "CASH" ? txt("CASH (নগদ)", "CASH") : method}
                  </button>
                );
              })}
            </div>

            {/* Discount & Subtotals */}
            <div className="space-y-1.5 text-xs text-slate-400 pt-1">
              <div className="flex justify-between">
                <span>{txt("সাবটোটাল:", "Subtotal:")}</span>
                <span className="font-semibold text-white">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span>{txt("ছাড় / ডিসকাউন্ট (৳):", "Discount (৳):")}</span>
                <input
                  type="number"
                  min={0}
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(Number(e.target.value))}
                  className="w-20 bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-right text-xs text-emerald-400 font-semibold focus:outline-none"
                />
              </div>
              <div className="flex justify-between text-sm font-extrabold text-white pt-1.5 border-t border-slate-800">
                <span>{txt("সর্বমোট বিল:", "Grand Total:")}</span>
                <span className="text-emerald-400">{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            {/* Paid & Due Inputs */}
            <div className="space-y-2 pt-1 border-t border-slate-800/60">
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col">
                  <span className="text-xs text-slate-300 font-medium">{txt("নগদ / পরিশোধ (৳):", "Cash / Paid (৳):")}</span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setPaidAmount(grandTotal);
                        if (paymentMethod === "DUE") setPaymentMethod("CASH");
                      }}
                      className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                    >
                      {txt("পুরো পরিশোধ", "Full Paid")}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPaidAmount(0);
                        setPaymentMethod("DUE");
                      }}
                      className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                    >
                      {txt("পুরো বাকি", "Full Due")}
                    </button>
                  </div>
                </div>

                <input
                  type="number"
                  min={0}
                  value={paidAmount}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setPaidAmount(val);
                    if (val === 0) {
                      setPaymentMethod("DUE");
                    } else if (paymentMethod === "DUE") {
                      setPaymentMethod("CASH");
                    }
                  }}
                  className="w-28 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-right text-xs text-white font-bold focus:outline-none focus:border-indigo-500"
                />
              </div>

              {dueAmount > 0 && (
                <div className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    {txt("অবশিষ্ট বাকি:", "Remaining Due:")}
                  </span>
                  <span className="font-bold text-rose-300 font-mono text-sm">{formatCurrency(dueAmount)}</span>
                </div>
              )}

              {changeAmount > 0 && (
                <div className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-semibold">
                  <span>{txt("ফেরত দিন (চেঞ্জ):", "Return Change:")}</span>
                  <span className="font-bold text-white font-mono text-sm">{formatCurrency(changeAmount)}</span>
                </div>
              )}

              {dueAmount > 0 && !selectedCustomer && (
                <p className="text-[10px] text-amber-400/90 leading-tight">
                  {txt(`⚠️ সতর্কতা: সাধারণ ক্রেতা। এই ৳${dueAmount} টাকা বাকি খাতায় রেকর্ড করতে উপরে কাস্টমার সিলেক্ট বা যোগ করুন।`, `⚠️ Note: Unregistered customer. To record this ৳${dueAmount} due in customer ledger, please select or add a customer above.`)}
                </p>
              )}
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || isCheckingOut}
              className={`w-full py-3 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${
                dueAmount > 0 && paidAmount === 0
                  ? "bg-rose-600 hover:bg-rose-500 shadow-rose-600/30"
                  : dueAmount > 0
                  ? "bg-amber-600 hover:bg-amber-500 shadow-amber-600/30"
                  : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30"
              }`}
            >
              <Printer className="w-4 h-4" />
              {isCheckingOut
                ? txt("ইনভয়েস প্রসেসিং হচ্ছে...", "Processing Invoice...")
                : dueAmount > 0 && paidAmount === 0
                ? `${txt("বাকি বিক্রয় সম্পন্ন করুন", "Complete Due Sale")} (${formatCurrency(grandTotal)})`
                : dueAmount > 0
                ? `${txt("আংশিক বিক্রয়", "Partial Sale")} (${txt("জমা:", "Paid:")} ${formatCurrency(paidAmount)} · ${txt("বাকি:", "Due:")} ${formatCurrency(dueAmount)})`
                : `${txt("বিক্রয় সম্পন্ন ও রসিদ প্রিন্ট", "Complete & Print Invoice")} (${formatCurrency(grandTotal)})`}
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
                <p className="text-xs font-semibold leading-tight">{txt(`কার্ট দেখুন (${cart.length} টি পণ্য)`, `View Cart (${cart.length} items)`)}</p>
                <p className="text-[11px] text-indigo-200 font-mono">{formatCurrency(grandTotal)}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold bg-white text-indigo-950 px-3.5 py-1.5 rounded-xl shadow">
              <span>{txt("বিল ও পেমেন্ট", "Review & Pay")}</span>
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

      {/* Quick Add Customer Modal */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-5 sm:p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">{txt("নতুন কাস্টমার যোগ করুন", "Add New Customer")}</h3>
              </div>
              <button
                onClick={() => setShowAddCustomerModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">{txt("কাস্টমারের পুরো নাম *", "Customer Full Name *")}</label>
                <input
                  type="text"
                  required
                  value={newCustomerForm.name}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, name: e.target.value })}
                  placeholder={txt("যেমন: রহিম চৌধুরী", "e.g. Rahim Chowdhury")}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">{txt("মোবাইল নম্বর *", "Phone Number *")}</label>
                <input
                  type="text"
                  required
                  value={newCustomerForm.phone}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })}
                  placeholder={txt("যেমন: 01712345678", "e.g. 01712345678")}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">{txt("ঠিকানা (ঐচ্ছিক)", "Address (Optional)")}</label>
                <input
                  type="text"
                  value={newCustomerForm.address}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, address: e.target.value })}
                  placeholder={txt("যেমন: মিরপুর, ঢাকা", "e.g. Mirpur, Dhaka")}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">{txt("পূর্বের বকেয়া ব্যালেন্স (৳)", "Opening Due Balance (৳)")}</label>
                <input
                  type="number"
                  value={newCustomerForm.openingBalance}
                  onChange={(e) =>
                    setNewCustomerForm({
                      ...newCustomerForm,
                      openingBalance: Number(e.target.value),
                    })
                  }
                  placeholder="0"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold text-xs transition-colors"
                >
                  {txt("বাতিল", "Cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isCreatingCustomer}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold shadow-md text-xs flex items-center gap-1.5 transition-all"
                >
                  {isCreatingCustomer ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                  {txt("সংরক্ষণ ও নির্বাচন করুন", "Save & Select")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
