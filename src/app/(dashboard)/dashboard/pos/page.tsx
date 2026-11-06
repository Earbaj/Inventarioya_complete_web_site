"use client";

import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { InventoryService, SalesService, AuthService, CustomerService } from "@/lib/api/client";
import { ProductItem, Category, Invoice } from "@/types";
import { formatCurrency, extractPersonName, round2 } from "@/lib/utils";
import { ThermalReceipt } from "@/components/pos/ThermalReceipt";
import { PosProductCatalog } from "@/components/pos/PosProductCatalog";
import { PosCustomerSelect } from "@/components/pos/PosCustomerSelect";
import { PosCartItemList } from "@/components/pos/PosCartItemList";
import { PosCheckoutSection } from "@/components/pos/PosCheckoutSection";
import { PosAddCustomerModal } from "@/components/pos/PosAddCustomerModal";
import { usePosCart } from "@/hooks/usePosCart";
import { usePosCustomers } from "@/hooks/usePosCustomers";
import {
  ShoppingCart,
  Trash2,
  X,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

/**
 * পয়েন্ট অফ সেল (হাই-স্পিড ক্লাউড পিওএস টার্মিনাল)
 * দ্রুত পণ্য নির্বাচন, বারকোড স্ক্যান, গ্রাহক লেজার লিঙ্ক, কার্ট ক্যালকুলেশন ও রসিদ প্রিন্ট সম্পন্ন করে।
 */
export default function PosTerminalPage() {
  const { txt } = useLanguage();

  // পণ্য ও ক্যাটাগরি স্টেট
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const [stockWarning, setStockWarning] = useState<string | null>(null);

  // ইনভয়েস ও চেকআউট স্টেট
  const [completedInvoice, setCompletedInvoice] = useState<Invoice | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // কাস্টমার স্টেট হুক
  const {
    customers,
    setCustomers,
    customerMeta,
    setCustomerMeta,
    customerSearch,
    setCustomerSearch,
    isCustomerDropdownOpen,
    setIsCustomerDropdownOpen,
    selectedCustomer,
    setSelectedCustomer,
    isLoadingCustomers,
    isLoadingMoreCustomers,
    loadMoreCustomers,
    handleSelectCustomer,
    showAddCustomerModal,
    setShowAddCustomerModal,
    newCustomerForm,
    setNewCustomerForm,
    isCreatingCustomer,
    handleCreateCustomer,
    customerName,
    setCustomerName,
    customerPhone,
    setCustomerPhone,
  } = usePosCustomers();

  // কার্ট স্টেট হুক
  const {
    cart,
    setCart,
    subtotal,
    discountPercent,
    setDiscountPercent,
    discountAmount,
    taxRate,
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
  } = usePosCart((msg) => setStockWarning(msg));

  // ৩ সেকেন্ড পর স্বয়ংক্রিয়ভাবে স্টক সতর্কবার্তা বন্ধ করা
  useEffect(() => {
    if (stockWarning) {
      const timer = setTimeout(() => setStockWarning(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [stockWarning]);

  // প্রাথমিক পণ্য, ক্যাটাগরি ও কাস্টমার লোড
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

  // বিক্রয় সম্পন্ন (Checkout) হ্যান্ডলার
  const handleCheckout = async () => {
    if (cart.length === 0) return;

    // স্টক যাচাই
    const invalidItem = cart.find(
      (item) =>
        item.stockQuantity <= 0 ||
        item.cartQuantity <= 0 ||
        item.cartQuantity > item.stockQuantity
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
      const activeBranchId =
        typeof window !== "undefined" ? localStorage.getItem("selected_branch_id") : null;
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

      // স্থানীয় প্রোডাক্ট লিস্ট থেকে স্টক কমিয়ে দেওয়া
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

      // কাস্টমারের বকেয়া ব্যালেন্স স্থানীয়ভাবে আপডেট
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

      // কার্ট ও কাস্টমার রিসেট
      clearCart();
      setSelectedCustomer(null);
      setCustomerName("Walk-in Customer");
      setCustomerPhone("");
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
      <DashboardHeader
        title={txt(
          "পয়েন্ট অফ সেল (হাই-স্পিড ক্লাউড পিওএস)",
          "High-Speed Cloud POS Terminal"
        )}
      />

      {/* ফ্লোটিং স্টক সতর্কতা ব্যানার */}
      {stockWarning && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] max-w-md w-[92vw] sm:w-auto bg-red-50 dark:bg-slate-900 border border-red-200 dark:border-red-800/80 text-red-900 dark:text-red-100 px-4 py-3 rounded-2xl shadow-xl shadow-red-900/10 text-xs sm:text-sm font-semibold flex items-center justify-between gap-3 backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-900/50 border border-red-200 dark:border-red-700/60 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
            <span className="leading-snug font-medium break-words text-red-800 dark:text-red-200">
              {stockWarning}
            </span>
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
        {/* বাম পাশ: প্রোডাক্ট ব্রাউজার ও ক্যাটালগ */}
        <PosProductCatalog
          products={products}
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          cart={cart}
          loading={loading}
          onAddToCart={addToCart}
        />

        {/* মোবাইল ব্যাকড্রপ */}
        {isMobileCartOpen && (
          <div
            className="fixed inset-0 z-40 bg-slate-950/75 backdrop-blur-sm lg:hidden transition-opacity"
            onClick={() => setIsMobileCartOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* ডান পাশ: কার্ট ও চেকআউট প্যানেল */}
        <div
          className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[390px] lg:w-[410px] xl:w-[430px] bg-slate-900 flex flex-col h-full border-l border-slate-800 shadow-2xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
            isMobileCartOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
          }`}
        >
          {/* কার্ট হেডার */}
          <div className="px-3.5 py-2.5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950/70">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMobileCartOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden transition-colors cursor-pointer"
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
                  if (
                    window.confirm(
                      txt(
                        "আপনি কি কার্টের সকল পণ্য মুছে ফেলতে চান?",
                        "Are you sure you want to clear all items in the cart?"
                      )
                    )
                  ) {
                    clearCart();
                  }
                }}
                className="text-[10px] font-semibold text-rose-400 hover:text-rose-300 px-2 py-1 rounded hover:bg-rose-500/10 transition-colors flex items-center gap-1 cursor-pointer"
                title={txt("পুরো কার্টের সব পণ্য খালি করুন", "Clear all items in cart")}
              >
                <Trash2 className="w-3 h-3" />
                <span>{txt("সব মুছুন", "Clear All")}</span>
              </button>
            )}
          </div>

          {/* কাস্টমার কম্বোবক্স */}
          <PosCustomerSelect
            selectedCustomer={selectedCustomer}
            customerName={customerName}
            customers={customers}
            customerMeta={customerMeta}
            customerSearch={customerSearch}
            setCustomerSearch={setCustomerSearch}
            isCustomerDropdownOpen={isCustomerDropdownOpen}
            setIsCustomerDropdownOpen={setIsCustomerDropdownOpen}
            isLoadingCustomers={isLoadingCustomers}
            isLoadingMoreCustomers={isLoadingMoreCustomers}
            onSelectCustomer={handleSelectCustomer}
            onLoadMoreCustomers={loadMoreCustomers}
            onOpenAddCustomerModal={() => setShowAddCustomerModal(true)}
          />

          {/* কার্ট আইটেম তালিকা */}
          <PosCartItemList
            cart={cart}
            onSetExactQuantity={setExactQuantity}
            onRemoveFromCart={removeFromCart}
          />

          {/* চেকআউট ও পেমেন্ট সেকশন */}
          <PosCheckoutSection
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            subtotal={subtotal}
            discountPercent={discountPercent}
            setDiscountPercent={setDiscountPercent}
            discountAmount={discountAmount}
            grandTotal={grandTotal}
            paidAmount={paidAmount}
            setPaidAmount={setPaidAmount}
            dueAmount={dueAmount}
            changeAmount={changeAmount}
            selectedCustomer={selectedCustomer}
            cartLength={cart.length}
            isCheckingOut={isCheckingOut}
            onCheckout={handleCheckout}
          />
        </div>
      </div>

      {/* মোবাইলে ফ্লোটিং কার্ট বোতাম */}
      {cart.length > 0 && !isMobileCartOpen && (
        <div className="lg:hidden fixed bottom-4 left-4 right-4 z-30">
          <button
            onClick={() => setIsMobileCartOpen(true)}
            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white p-3.5 rounded-2xl shadow-2xl flex items-center justify-between border border-indigo-400/30 transition-all active:scale-95 cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-bold text-xs">
                {cart.reduce((s, i) => s + i.cartQuantity, 0)}
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold leading-tight">
                  {txt(`কার্ট দেখুন (${cart.length} টি পণ্য)`, `View Cart (${cart.length} items)`)}
                </p>
                <p className="text-[11px] text-indigo-200 font-mono">
                  {formatCurrency(grandTotal)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold bg-white text-indigo-950 px-3.5 py-1.5 rounded-xl shadow">
              <span>{txt("বিল ও পেমেন্ট", "Review & Pay")}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>
      )}

      {/* থার্মাল রসিদ প্রিন্ট মোডাল */}
      {completedInvoice && (
        <ThermalReceipt
          invoice={completedInvoice}
          onClose={() => setCompletedInvoice(null)}
        />
      )}

      {/* নতুন কাস্টমার দ্রুত যোগ মোডাল */}
      <PosAddCustomerModal
        isOpen={showAddCustomerModal}
        onClose={() => setShowAddCustomerModal(false)}
        newCustomerForm={newCustomerForm}
        setNewCustomerForm={setNewCustomerForm}
        isCreatingCustomer={isCreatingCustomer}
        onCreateCustomer={handleCreateCustomer}
      />
    </div>
  );
}
