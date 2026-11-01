"use client";

import { useState, useEffect, useMemo } from "react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { InventoryService, SalesService, AuthService, CustomerService } from "@/lib/api/client";
import { ProductItem, Category, CartItem, Invoice, Customer } from "@/types";
import { formatCurrency, extractPersonName, round2 } from "@/lib/utils";
import { ThermalReceipt } from "@/components/pos/ThermalReceipt";
import {
  Search,
  Barcode,
  ShoppingCart,
  Trash2,
  Plus,
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
import { ShimmerPosProduct, ShimmerItem } from "@/components/ui/ShimmerSkeleton";

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
  const [discountPercent, setDiscountPercent] = useState<number>(0);
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

  // Cart Calculations with financial decimal precision
  const subtotal = useMemo(() => {
    const raw = cart.reduce((sum, item) => sum + Number(item.lineTotal || 0), 0);
    return round2(raw);
  }, [cart]);

  const discountAmount = useMemo(() => {
    if (!subtotal || !discountPercent || discountPercent <= 0) return 0;
    const pct = Math.min(100, Math.max(0, Number(discountPercent)));
    return round2((subtotal * pct) / 100);
  }, [subtotal, discountPercent]);

  const taxAmount = useMemo(() => {
    if (!subtotal || !taxRate || taxRate <= 0) return 0;
    return round2((subtotal * Number(taxRate)) / 100);
  }, [subtotal, taxRate]);

  const grandTotal = useMemo(() => {
    return round2(Math.max(0, subtotal - discountAmount + taxAmount));
  }, [subtotal, discountAmount, taxAmount]);

  // Auto-fill paid amount to match grandTotal initially or 0 when DUE is selected
  useEffect(() => {
    if (paymentMethod === "DUE") {
      setPaidAmount(0);
    } else {
      setPaidAmount(grandTotal);
    }
  }, [grandTotal, paymentMethod]);

  const dueAmount = useMemo(() => {
    return round2(Math.max(0, grandTotal - paidAmount));
  }, [grandTotal, paidAmount]);

  const changeAmount = useMemo(() => {
    return round2(Math.max(0, paidAmount - grandTotal));
  }, [grandTotal, paidAmount]);

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

  // Update Cart Item Quantity with +/-
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

  // Set Cart Item Quantity directly via text/number input
  const setExactQuantity = (productId: string, quantityInput: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === productId) {
          const qty = round2(Math.max(0, quantityInput));
          if (qty > item.stockQuantity) {
            setStockWarning(
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

  // Remove a single specific item from Cart
  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  // Handle Complete Checkout
  const handleCheckout = async () => {
    if (cart.length === 0) return;

    // Validate that no item in cart is out of stock, has 0 quantity, or exceeds available stock
    const invalidItem = cart.find(
      (item) => item.stockQuantity <= 0 || item.cartQuantity <= 0 || item.cartQuantity > item.stockQuantity
    );
    if (invalidItem) {
      setStockWarning(
        invalidItem.stockQuantity <= 0
          ? `"${invalidItem.name}" is out of stock and cannot be sold!`
          : invalidItem.cartQuantity <= 0
          ? `Please specify a valid quantity for "${invalidItem.name}".`
          : `"${invalidItem.name}" quantity exceeds available stock (${invalidItem.stockQuantity} available)!`
      );
      return;
    }

    setIsCheckingOut(true);

    try {
      const activeBranchId = typeof window !== "undefined" ? localStorage.getItem("selected_branch_id") : null;
      const currentUser = AuthService.getCurrentUser();

      const payload = {
        customerId: selectedCustomer?.id || "walk-in",
        customerName: customerName || "Walk-in Customer",
        customerPhone: customerPhone || "",
        items: cart.map((item) => ({
          itemId: item.id,
          name: item.name,
          quantity: round2(item.cartQuantity),
          unitPrice: round2(item.sellingPrice),
        })),
        subtotal: round2(subtotal),
        discount: round2(discountAmount),
        tax: round2(taxAmount),
        grandTotal: round2(grandTotal),
        paidAmount: round2(paidAmount),
        dueAmount: round2(dueAmount),
        paymentMethod: dueAmount === grandTotal ? "DUE" : paymentMethod,
        cashierName: extractPersonName(currentUser),
        branchId: activeBranchId || currentUser?.branchId || null,
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
              const updatedBal = round2(currentBal - dueAmount);
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
      setDiscountPercent(0);
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

      {/* Floating Stock Warning / Error Notification */}
      {stockWarning && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] max-w-md w-[92vw] sm:w-auto bg-red-50 dark:bg-slate-900 border border-red-200 dark:border-red-800/80 text-red-900 dark:text-red-100 px-4 py-3 rounded-2xl shadow-xl shadow-red-900/10 text-xs sm:text-sm font-semibold flex items-center justify-between gap-3 backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-900/50 border border-red-200 dark:border-red-700/60 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
            <span className="leading-snug font-medium break-words text-red-800 dark:text-red-200">{stockWarning}</span>
          </div>
          <button
            type="button"
            onClick={() => setStockWarning(null)}
            className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/40 hover:bg-red-200 dark:hover:bg-red-800/60 active:scale-95 text-red-700 dark:text-red-300 transition-all shrink-0 cursor-pointer"
            title={txt("বন্ধ করুন", "Dismiss")}
          >
            <X className="w-4 h-4" />
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
              </>
            )}
          </div>

          {/* Products Grid */}
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
              })
              )}
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
          className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[390px] lg:w-[410px] xl:w-[430px] bg-slate-900 flex flex-col h-full border-l border-slate-800 shadow-2xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
            isMobileCartOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
          }`}
        >
          {/* Cart Header */}
          <div className="px-3.5 py-2.5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950/70">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMobileCartOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden transition-colors"
                aria-label="Close cart"
              >
                <X className="w-4 h-4" />
              </button>
              <ShoppingCart className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <span>{txt("বিলিং কার্ট", "Register Cart")}</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {cart.reduce((s, i) => s + i.cartQuantity, 0)} {txt("পণ্য", "items")}
                </span>
              </h3>
            </div>
            {cart.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(txt("আপনি কি কার্টের সকল পণ্য মুছে ফেলতে চান?", "Are you sure you want to clear all items in the cart?"))) {
                    setCart([]);
                    setDiscountPercent(0);
                  }
                }}
                className="text-[10px] font-semibold text-rose-400 hover:text-rose-300 px-2 py-1 rounded hover:bg-rose-500/10 transition-colors flex items-center gap-1"
                title={txt("পুরো কার্টের সব পণ্য খালি করুন", "Clear all items in cart")}
              >
                <Trash2 className="w-3 h-3" />
                <span>{txt("সব মুছুন", "Clear All")}</span>
              </button>
            )}
          </div>

          {/* Customer Selection & Searchable Combobox */}
          <div className="px-3 py-1.5 border-b border-slate-800 bg-slate-950/40 shrink-0 relative">
            <div className="flex items-center justify-between gap-1.5 text-[11px]">
              {/* Selected Customer Trigger Box */}
              <div
                onClick={() => setIsCustomerDropdownOpen((prev) => !prev)}
                className="flex-1 min-w-0 bg-slate-900/90 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-lg px-2.5 py-1 cursor-pointer transition-all flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <User className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <div className="truncate flex items-center gap-1.5">
                    <span className="font-semibold text-white text-xs truncate">
                      {selectedCustomer ? selectedCustomer.name : customerName || txt("সাধারণ ক্রেতা (Walk-in)", "Walk-in Customer")}
                    </span>
                    {selectedCustomer && Number(selectedCustomer.closingBalance || 0) < 0 && (
                      <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0">
                        {txt("বাকি:", "Due:")} {formatCurrency(Math.abs(Number(selectedCustomer.closingBalance)))}
                      </span>
                    )}
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
                      className="p-0.5 hover:text-white rounded hover:bg-slate-800 transition-colors"
                      title={txt("সাধারণ কাস্টমারে রিসেট করুন", "Reset to Walk-in Customer")}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                  <ChevronDown className={`w-3 h-3 transition-transform ${isCustomerDropdownOpen ? "rotate-180" : ""}`} />
                </div>
              </div>

              {/* Quick Add Button */}
              <button
                type="button"
                onClick={() => setShowAddCustomerModal(true)}
                className="p-1 px-2 text-[10px] bg-slate-900 hover:bg-slate-800 border border-slate-800 text-indigo-400 hover:text-indigo-300 font-semibold rounded-lg flex items-center gap-1 transition-colors shrink-0"
                title={txt("নতুন কাস্টমার নিবন্ধন করুন", "Register new customer")}
              >
                <Plus className="w-3 h-3" />
                <span className="hidden sm:inline">{txt("নতুন", "New")}</span>
              </button>
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
                    <Plus className="w-3 h-3" /> {txt("নতুন", "New")}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Cart Items List - Streamlined, High-density Layout */}
          <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1.5">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <ShoppingCart className="w-9 h-9 text-slate-700 mb-2" />
                <p className="text-xs font-medium">{txt("বিলিং কার্ট খালি", "Register Cart is Empty")}</p>
                <p className="text-[10px] text-slate-600 mt-1 max-w-[200px]">
                  {txt("পণ্য সিলেক্ট করুন বা বারকোড স্ক্যান করে কার্টে যোগ করুন", "Click product or scan barcode to add to cart")}
                </p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="py-1.5 px-2.5 rounded-lg bg-slate-950/80 hover:bg-slate-950 border border-slate-800/80 hover:border-slate-700/80 transition-all flex items-center justify-between gap-2 text-xs group"
                >
                  {/* Item Title and Unit Price */}
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
                        <span className="text-[9px] text-amber-400 font-semibold">({txt("সর্বোচ্চ", "Max")})</span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Input Field */}
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[10px] text-slate-400 font-medium">{txt("পরিমাণ:", "Qty:")}</span>
                    <input
                      type="number"
                      step="any"
                      min="0.01"
                      max={item.stockQuantity}
                      value={item.cartQuantity === 0 ? "" : item.cartQuantity}
                      onChange={(e) => {
                        const raw = e.target.value;
                        if (raw === "") {
                          setExactQuantity(item.id, 0);
                          return;
                        }
                        const val = parseFloat(raw);
                        if (!isNaN(val)) setExactQuantity(item.id, val);
                      }}
                      onBlur={() => {
                        if (item.cartQuantity <= 0) setExactQuantity(item.id, 1);
                      }}
                      className="w-14 h-7 bg-slate-900 border border-slate-700 hover:border-slate-600 focus:border-indigo-500 rounded-lg text-center text-xs font-bold text-white focus:outline-none font-mono shadow-inner transition-colors"
                      title={txt("সরাসরি পরিমাণ লিখুন", "Type exact quantity")}
                    />
                  </div>

                  {/* Line Total & Single Item Delete Trash Button */}
                  <div className="flex items-center gap-1.5 shrink-0 pl-1">
                    <span className="font-mono font-bold text-white text-xs min-w-[55px] text-right">
                      {formatCurrency(item.lineTotal)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      className="w-6 h-6 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 active:scale-90 flex items-center justify-center transition-all cursor-pointer shrink-0"
                      title={txt(`"${item.name}" কার্ট থেকে বাদ দিন`, `Remove "${item.name}" from cart`)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Calculation & Payment Tender - Ultra Compact, Space-Optimized */}
          <div className="p-3 border-t border-slate-800 bg-slate-950/90 space-y-2 shrink-0">
            {/* Payment Method Pills - Compact Row */}
            <div className="grid grid-cols-5 gap-1">
              {(
                [
                  { id: "CASH", label: "CASH", bn: "নগদ", active: "border-emerald-500 text-emerald-400 bg-emerald-500/10" },
                  { id: "CARD", label: "CARD", bn: "কার্ড", active: "border-indigo-500 text-indigo-400 bg-indigo-500/10" },
                  { id: "BKASH", label: "BKASH", bn: "বিকাশ", active: "border-pink-500 text-pink-400 bg-pink-500/10" },
                  { id: "NAGAD", label: "NAGAD", bn: "নগদ", active: "border-orange-500 text-orange-400 bg-orange-500/10" },
                  { id: "DUE", label: "DUE", bn: "বাকি", active: "border-rose-500 text-rose-400 bg-rose-500/10" },
                ] as const
              ).map((item) => {
                const isSelected = paymentMethod === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setPaymentMethod(item.id);
                      if (item.id === "DUE") {
                        setPaidAmount(0);
                      } else if (paidAmount === 0) {
                        setPaidAmount(grandTotal);
                      }
                    }}
                    className={`py-1 rounded-md text-[10px] font-bold border transition-all text-center ${
                      isSelected
                        ? `${item.active} font-extrabold`
                        : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white"
                    }`}
                  >
                    {item.id === "DUE" ? txt("DUE (বাকি)", "DUE") : item.id === "CASH" ? txt("CASH (নগদ)", "CASH") : item.label}
                  </button>
                );
              })}
            </div>

            {/* Compact Subtotal, Discount & Grand Total Ribbon */}
            <div className="bg-slate-900/90 rounded-xl p-2 border border-slate-800/80 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>{txt("সাবটোটাল:", "Subtotal:")} <strong className="text-white font-mono">{formatCurrency(subtotal)}</strong></span>
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-slate-300">{txt("ছাড় (%):", "Disc (%):")}</span>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      step="any"
                      min={0}
                      max={100}
                      value={discountPercent === 0 ? "" : discountPercent}
                      onChange={(e) => {
                        const val = e.target.value === "" ? 0 : parseFloat(e.target.value);
                        setDiscountPercent(isNaN(val) ? 0 : Math.min(100, Math.max(0, val)));
                      }}
                      className="w-16 bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-right text-xs text-emerald-400 font-mono font-semibold focus:outline-none focus:border-indigo-500 pr-5"
                      placeholder="0"
                    />
                    <span className="absolute right-1.5 text-[10px] text-slate-400 font-bold pointer-events-none">%</span>
                  </div>
                </div>
              </div>

              {discountAmount > 0 && (
                <div className="flex items-center justify-between text-[11px] text-emerald-400 font-medium px-0.5 pt-0.5 border-t border-slate-800/50">
                  <span>{txt(`ছাড়ের পরিমাণ (${discountPercent}%):`, `Discount Amount (${discountPercent}%):`)}</span>
                  <span className="font-mono font-bold">-{formatCurrency(discountAmount)}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                <span className="text-xs font-bold text-white">{txt("সর্বমোট বিল:", "Grand Total:")}</span>
                <span className="text-base font-black text-emerald-400 font-mono">{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            {/* Tender & Due Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-slate-300 font-medium">{txt("পরিশোধ:", "Paid:")}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setPaidAmount(grandTotal);
                      if (paymentMethod === "DUE") setPaymentMethod("CASH");
                    }}
                    className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                  >
                    {txt("পুরো জমা", "Full")}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPaidAmount(0);
                      setPaymentMethod("DUE");
                    }}
                    className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                  >
                    {txt("পুরো বাকি", "Due")}
                  </button>
                </div>

                <input
                  type="number"
                  step="any"
                  min={0}
                  value={paidAmount === 0 && paymentMethod === "DUE" ? "" : paidAmount}
                  onChange={(e) => {
                    const raw = e.target.value;
                    const val = raw === "" ? 0 : parseFloat(raw);
                    const safeVal = isNaN(val) ? 0 : round2(Math.max(0, val));
                    setPaidAmount(safeVal);
                    if (safeVal === 0) {
                      setPaymentMethod("DUE");
                    } else if (paymentMethod === "DUE") {
                      setPaymentMethod("CASH");
                    }
                  }}
                  className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-right text-xs text-white font-mono font-bold focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Inline Due / Change badge */}
              {dueAmount > 0 ? (
                <div className="flex items-center justify-between text-[11px] px-2 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 font-semibold">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    {txt("অবশিষ্ট বাকি:", "Due:")}
                  </span>
                  <span className="font-bold text-rose-300 font-mono text-xs">{formatCurrency(dueAmount)}</span>
                </div>
              ) : changeAmount > 0 ? (
                <div className="flex items-center justify-between text-[11px] px-2 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-semibold">
                  <span>{txt("ফেরত দিন (চেঞ্জ):", "Change:")}</span>
                  <span className="font-bold text-white font-mono text-xs">{formatCurrency(changeAmount)}</span>
                </div>
              ) : null}

              {dueAmount > 0 && !selectedCustomer && (
                <p className="text-[9px] text-amber-400/90 leading-tight">
                  {txt(`⚠️ বাকি খাতায় রেকর্ড করতে উপরে কাস্টমার সিলেক্ট করুন।`, `⚠️ Select customer above to record due in ledger.`)}
                </p>
              )}
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || isCheckingOut}
              className={`w-full py-2.5 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${
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
                : `${txt("রসিদ প্রিন্ট ও সম্পন্ন", "Complete & Print Invoice")} (${formatCurrency(grandTotal)})`}
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
