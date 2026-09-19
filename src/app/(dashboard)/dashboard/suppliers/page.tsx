"use client";

import { useState, useEffect, useMemo } from "react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { SuppliersService, InventoryService } from "@/lib/api/client";
import { Supplier, PurchaseOrder, PurchaseOrderItem, ProductItem, Category } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Truck,
  Plus,
  FileText,
  Phone,
  Mail,
  MapPin,
  X,
  CheckCircle,
  Eye,
  Trash2,
  Search,
  AlertCircle,
  Package,
  RefreshCw,
  DollarSign,
  Calendar,
  Layers,
  ArrowRight,
  PlusCircle,
  Check,
  ShoppingBag,
} from "lucide-react";

import { useLanguage } from "@/context/LanguageContext";

export default function SuppliersPage() {
  const { txt } = useLanguage();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<"suppliers" | "orders">("orders");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [showCreatePO, setShowCreatePO] = useState(false);
  const [selectedPOForView, setSelectedPOForView] = useState<PurchaseOrder | null>(null);

  // Status & Error
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // New Supplier Form State
  const [newSup, setNewSup] = useState<Partial<Supplier>>({
    name: "",
    companyName: "",
    phone: "",
    email: "",
    address: "",
  });

  // New PO Form State
  const [newPO, setNewPO] = useState<{
    supplierId: string;
    supplierName: string;
    date: string;
    status: string;
    note: string;
    paidAmount: number;
    items: {
      itemId: string;
      name: string;
      quantity: number;
      buyPrice: number;
      totalPrice: number;
    }[];
  }>({
    supplierId: "",
    supplierName: "",
    date: new Date().toISOString().split("T")[0],
    status: "received",
    note: "",
    paidAmount: 0,
    items: [],
  });

  // Item Selector State inside PO Modal
  const [selectedProductId, setSelectedProductId] = useState("");
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemBuyPrice, setItemBuyPrice] = useState(0);

  // Inline Quick Product Creator inside PO Modal
  const [showQuickCreateProduct, setShowQuickCreateProduct] = useState(false);
  const [quickProduct, setQuickProduct] = useState({
    name: "",
    sku: "",
    categoryName: "General",
    buyPrice: 0,
    sellPrice: 0,
    unit: "Piece",
    minStockAlert: 5,
    initialOrderQty: 10,
  });
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [quickProductError, setQuickProductError] = useState<string | null>(null);

  // Load Data
  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [sups, pos, prods, cats] = await Promise.all([
        SuppliersService.getSuppliers(),
        SuppliersService.getPurchaseOrders(),
        InventoryService.getProducts(),
        InventoryService.getCategories(),
      ]);
      setSuppliers(sups);
      setPurchaseOrders(pos);
      setProducts(prods);
      setCategories(cats);

      if (sups.length > 0) {
        setNewPO((prev) => ({
          ...prev,
          supplierId: prev.supplierId || sups[0].id,
          supplierName: prev.supplierName || sups[0].companyName || sups[0].name,
        }));
      }

      if (cats.length > 0) {
        setQuickProduct((prev) => ({
          ...prev,
          categoryName: cats[0].name,
        }));
      }
    } catch (err) {
      console.error("Failed to load suppliers/orders data", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // When a product is chosen in PO Item selector, autofill buy price
  const handleProductSelectChange = (productId: string) => {
    setSelectedProductId(productId);
    const prod = products.find((p) => p.id === productId);
    if (prod) {
      setItemBuyPrice(prod.costPrice || 0);
    }
  };

  // Add existing product to PO items list
  const handleAddItemToPO = () => {
    if (!selectedProductId) return;
    const prod = products.find((p) => p.id === productId(selectedProductId));
    if (!prod) return;

    const qty = Math.max(1, Number(itemQuantity) || 1);
    const price = Math.max(0, Number(itemBuyPrice) || 0);

    // Check if already in items
    const existingIndex = newPO.items.findIndex((i) => i.itemId === prod.id);
    if (existingIndex >= 0) {
      const updated = [...newPO.items];
      updated[existingIndex].quantity += qty;
      updated[existingIndex].buyPrice = price;
      updated[existingIndex].totalPrice = updated[existingIndex].quantity * price;
      setNewPO({ ...newPO, items: updated });
    } else {
      setNewPO({
        ...newPO,
        items: [
          ...newPO.items,
          {
            itemId: prod.id,
            name: prod.name,
            quantity: qty,
            buyPrice: price,
            totalPrice: qty * price,
          },
        ],
      });
    }

    // Reset item selector
    setSelectedProductId("");
    setItemQuantity(1);
    setItemBuyPrice(0);
  };

  const productId = (val: string) => val;

  // Remove item from PO
  const handleRemoveItem = (index: number) => {
    const updated = newPO.items.filter((_, idx) => idx !== index);
    setNewPO({ ...newPO, items: updated });
  };

  // Update item quantity or price directly in table
  const handleUpdateItemQty = (index: number, qty: number) => {
    const updated = [...newPO.items];
    const newQty = Math.max(1, qty);
    updated[index].quantity = newQty;
    updated[index].totalPrice = newQty * updated[index].buyPrice;
    setNewPO({ ...newPO, items: updated });
  };

  const handleUpdateItemPrice = (index: number, price: number) => {
    const updated = [...newPO.items];
    const newPrice = Math.max(0, price);
    updated[index].buyPrice = newPrice;
    updated[index].totalPrice = updated[index].quantity * newPrice;
    setNewPO({ ...newPO, items: updated });
  };

  // Quick Create New Product inside PO Modal
  const handleQuickCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickProduct.name.trim()) return;

    setIsCreatingProduct(true);
    setQuickProductError(null);

    try {
      const orderQty = Math.max(1, Number(quickProduct.initialOrderQty) || 1);
      const buyPrice = Math.max(0, Number(quickProduct.buyPrice) || 0);
      const sellPrice = Math.max(0, Number(quickProduct.sellPrice) || buyPrice);

      const created = await InventoryService.createProduct({
        name: quickProduct.name.trim(),
        sku: quickProduct.sku.trim() || `SKU-${Date.now().toString().slice(-4)}`,
        categoryName: quickProduct.categoryName,
        costPrice: buyPrice,
        sellingPrice: sellPrice,
        stockQuantity: 0, // stock will be credited via this Purchase Order
        minStockAlert: Number(quickProduct.minStockAlert) || 5,
        unit: quickProduct.unit || "Piece",
      });

      // Add to products list
      setProducts((prev) => [created, ...prev]);

      // Automatically add to current PO items
      setNewPO((prev) => ({
        ...prev,
        items: [
          ...prev.items,
          {
            itemId: created.id,
            name: created.name,
            quantity: orderQty,
            buyPrice: buyPrice,
            totalPrice: orderQty * buyPrice,
          },
        ],
      }));

      // Reset & close quick creator
      setShowQuickCreateProduct(false);
      setQuickProduct({
        name: "",
        sku: "",
        categoryName: categories[0]?.name || "General",
        buyPrice: 0,
        sellPrice: 0,
        unit: "Piece",
        minStockAlert: 5,
        initialOrderQty: 10,
      });
    } catch (err: any) {
      console.error("Failed to quick create product:", err);
      setQuickProductError(err.message || "Failed to create product");
    } finally {
      setIsCreatingProduct(false);
    }
  };

  // Calculated PO Totals
  const calculatedPOTotal = useMemo(() => {
    return newPO.items.reduce((sum, item) => sum + item.totalPrice, 0);
  }, [newPO.items]);

  const calculatedPODue = useMemo(() => {
    return Math.max(0, calculatedPOTotal - (Number(newPO.paidAmount) || 0));
  }, [calculatedPOTotal, newPO.paidAmount]);

  // Create Supplier Handler
  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setActionError(null);
    try {
      const created = await SuppliersService.createSupplier(newSup);
      setSuppliers((prev) => [created, ...prev]);
      setShowAddSupplier(false);
      setNewSup({ name: "", companyName: "", phone: "", email: "", address: "" });
    } catch (err: any) {
      console.error("Failed to create supplier", err);
      setActionError(err.message || "Failed to create supplier");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create Purchase Order Handler
  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPO.supplierId) {
      setActionError("Please select a supplier.");
      return;
    }
    if (newPO.items.length === 0) {
      setActionError("Please add at least one product item to the purchase order.");
      return;
    }

    setIsSubmitting(true);
    setActionError(null);

    try {
      const payload = {
        supplierId: newPO.supplierId,
        date: newPO.date ? new Date(newPO.date).toISOString() : new Date().toISOString(),
        totalAmount: calculatedPOTotal,
        totalCost: calculatedPOTotal,
        paidAmount: Math.min(calculatedPOTotal, Math.max(0, Number(newPO.paidAmount) || 0)),
        status: newPO.status || "received",
        note: newPO.note || "",
        items: newPO.items.map((i) => ({
          itemId: i.itemId,
          name: i.name,
          quantity: i.quantity,
          buyPrice: i.buyPrice,
          totalPrice: i.totalPrice,
        })),
      };

      const created = await SuppliersService.createPurchaseOrder(payload);
      setPurchaseOrders((prev) => [created, ...prev]);
      setShowCreatePO(false);

      // Reload products to reflect updated inventory stock
      try {
        const freshProds = await InventoryService.getProducts();
        setProducts(freshProds);
      } catch (e) {
        // non-blocking
      }

      // Reset PO state
      setNewPO({
        supplierId: suppliers[0]?.id || "",
        supplierName: suppliers[0]?.companyName || "",
        date: new Date().toISOString().split("T")[0],
        status: "received",
        note: "",
        paidAmount: 0,
        items: [],
      });
    } catch (err: any) {
      console.error("Failed to create purchase order", err);
      setActionError(err.message || "Failed to create purchase order");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered lists
  const filteredPurchaseOrders = useMemo(() => {
    if (!searchQuery.trim()) return purchaseOrders;
    const q = searchQuery.toLowerCase();
    return purchaseOrders.filter(
      (po) =>
        po.poNumber?.toLowerCase().includes(q) ||
        po.supplierName?.toLowerCase().includes(q) ||
        po.supplierCompany?.toLowerCase().includes(q) ||
        po.items?.some((i) => i.name?.toLowerCase().includes(q))
    );
  }, [purchaseOrders, searchQuery]);

  const filteredSuppliers = useMemo(() => {
    if (!searchQuery.trim()) return suppliers;
    const q = searchQuery.toLowerCase();
    return suppliers.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) ||
        s.companyName?.toLowerCase().includes(q) ||
        s.phone?.includes(q) ||
        s.email?.toLowerCase().includes(q)
    );
  }, [suppliers, searchQuery]);

  // Overall Statistics
  const totalPurchaseValue = useMemo(() => {
    return purchaseOrders.reduce((sum, po) => sum + (po.totalAmount ?? po.totalCost ?? 0), 0);
  }, [purchaseOrders]);

  const totalPaidToSuppliers = useMemo(() => {
    return purchaseOrders.reduce((sum, po) => sum + (po.paidAmount || 0), 0);
  }, [purchaseOrders]);

  const totalDueToSuppliers = useMemo(() => {
    return purchaseOrders.reduce(
      (sum, po) => sum + (po.dueAmount ?? Math.max(0, (po.totalAmount ?? po.totalCost ?? 0) - (po.paidAmount || 0))),
      0
    );
  }, [purchaseOrders]);

  // Computed supplier statistics (orders count, total purchased, and outstanding due)
  const getSupplierStats = (sup: Supplier) => {
    const matchingPOs = purchaseOrders.filter(
      (po) =>
        po.supplierId === sup.id ||
        (po.supplierCompany &&
          sup.companyName &&
          po.supplierCompany.trim().toLowerCase() === sup.companyName.trim().toLowerCase()) ||
        (po.supplierName &&
          sup.name &&
          po.supplierName.trim().toLowerCase() === sup.name.trim().toLowerCase())
    );

    const totalOrders = matchingPOs.length;
    const totalPurchased = matchingPOs.reduce(
      (sum, po) => sum + (po.totalAmount ?? po.totalCost ?? 0),
      0
    );
    const totalPaid = matchingPOs.reduce((sum, po) => sum + (po.paidAmount || 0), 0);
    const poDue = matchingPOs.reduce(
      (sum, po) =>
        sum +
        (po.dueAmount !== undefined
          ? po.dueAmount
          : Math.max(0, (po.totalAmount ?? po.totalCost ?? 0) - (po.paidAmount || 0))),
      0
    );

    const dueAmount = matchingPOs.length > 0 ? poDue : (sup.totalBalanceDue || 0);

    return {
      totalOrders,
      totalPurchased,
      totalPaid,
      dueAmount,
    };
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <DashboardHeader title={txt("সাপ্লায়ার ও ক্রয় আদেশ (PO)", "Suppliers & Vendor Purchase Orders")} />

      <main className="p-4 sm:p-6 space-y-6 max-w-7xl w-full mx-auto">
        {/* KPI Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold dark:text-slate-400 text-slate-500">{txt("মোট অর্ডার", "Total Orders")}</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl font-bold dark:text-white text-slate-900 font-mono">{purchaseOrders.length}</p>
            <p className="text-[11px] dark:text-slate-500 text-slate-500 mt-1">
              {txt(`সক্রিয় ${suppliers.length} টি ভেন্ডর থেকে`, `From ${suppliers.length} active vendors`)}
            </p>
          </div>

          <div className="dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold dark:text-slate-400 text-slate-500">{txt("মোট ক্রয়", "Total Purchase")}</span>
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 dark:text-blue-400 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl font-bold dark:text-white text-slate-900 font-mono">{formatCurrency(totalPurchaseValue)}</p>
            <p className="text-[11px] dark:text-slate-500 text-slate-500 mt-1">
              {txt("সর্বমোট ক্রয়কৃত পণ্যের মূল্য", "Gross procurement value")}
            </p>
          </div>

          <div className="dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold dark:text-slate-400 text-slate-500">{txt("পরিশোধিত", "Paid to Vendors")}</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">{formatCurrency(totalPaidToSuppliers)}</p>
            <p className="text-[11px] dark:text-slate-500 text-slate-500 mt-1">
              {txt("পরিশোধিত অর্থ", "Settled payments")}
            </p>
          </div>

          <div className="dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold dark:text-slate-400 text-slate-500">{txt("বাকি / দেনা", "Balance Due")}</span>
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 dark:text-rose-400 flex items-center justify-center">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl font-bold text-rose-600 dark:text-rose-400 font-mono">{formatCurrency(totalDueToSuppliers)}</p>
            <p className="text-[11px] dark:text-slate-500 text-slate-500 mt-1">
              {txt("বকেয়া দেনা দায়", "Pending vendor liabilities")}
            </p>
          </div>
        </div>

        {/* Tab & Action Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex rounded-xl dark:bg-slate-900 bg-slate-100 p-1 border dark:border-slate-800 border-slate-200 text-xs overflow-x-auto">
            <button
              onClick={() => {
                setActiveTab("orders");
                setSearchQuery("");
              }}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === "orders"
                  ? "bg-indigo-600 text-white shadow"
                  : "dark:text-slate-400 text-slate-600 hover:dark:text-white hover:text-slate-900"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{txt(`ক্রয় আদেশসমূহ (${purchaseOrders.length})`, `Purchase Orders (${purchaseOrders.length})`)}</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("suppliers");
                setSearchQuery("");
              }}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === "suppliers"
                  ? "bg-indigo-600 text-white shadow"
                  : "dark:text-slate-400 text-slate-600 hover:dark:text-white hover:text-slate-900"
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>{txt(`সাপ্লায়ার তালিকা (${suppliers.length})`, `Suppliers Directory (${suppliers.length})`)}</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  activeTab === "orders"
                    ? txt("PO নং, সাপ্লায়ার, পণ্য খুঁজুন...", "Search PO #, supplier, items...")
                    : txt("সাপ্লায়ার নাম, মোবাইল নং খুঁজুন...", "Search supplier name, phone...")
                }
                className="w-full dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs dark:text-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {activeTab === "suppliers" ? (
              <button
                onClick={() => {
                  setActionError(null);
                  setShowAddSupplier(true);
                }}
                className="whitespace-nowrap px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>{txt("নতুন সাপ্লায়ার", "New Supplier")}</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setActionError(null);
                  setShowCreatePO(true);
                }}
                className="whitespace-nowrap px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>{txt("নতুন ক্রয় আদেশ", "New Purchase Order")}</span>
              </button>
            )}
          </div>
        </div>

        {/* Purchase Orders Table Tab */}
        {activeTab === "orders" ? (
          <div className="rounded-2xl dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-xs">
                <thead className="dark:bg-slate-950/70 bg-slate-50 dark:text-slate-400 text-slate-500 uppercase tracking-wider font-semibold border-b dark:border-slate-800 border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">{txt("PO নং", "PO #")}</th>
                    <th className="py-3.5 px-4">{txt("সাপ্লায়ার / ভেন্ডর", "Supplier / Vendor")}</th>
                    <th className="py-3.5 px-4">{txt("তারিখ", "Date")}</th>
                    <th className="py-3.5 px-4">{txt("ক্রয়কৃত পণ্যসমূহ", "Purchased Items")}</th>
                    <th className="py-3.5 px-4 text-right">{txt("মোট বিল", "Total Bill")}</th>
                    <th className="py-3.5 px-4 text-right">{txt("পরিশোধ", "Paid")}</th>
                    <th className="py-3.5 px-4 text-right">{txt("বাকি", "Due")}</th>
                    <th className="py-3.5 px-4 text-center">{txt("স্ট্যাটাস", "Status")}</th>
                    <th className="py-3.5 px-4 text-center">{txt("অ্যাকশন", "Action")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-slate-800/80 divide-slate-100">
                  {filteredPurchaseOrders.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-500">
                        {searchQuery
                          ? txt("কোনো ক্রয় আদেশ পাওয়া যায়নি।", "No purchase orders match your search.")
                          : txt("এখনও কোনো ক্রয় আদেশ তৈরি করা হয়নি।", "No purchase orders recorded yet.")}
                      </td>
                    </tr>
                  ) : (
                    filteredPurchaseOrders.map((po) => {
                      const totalVal = po.totalAmount ?? po.totalCost ?? 0;
                      const paidVal = po.paidAmount || 0;
                      const dueVal = po.dueAmount ?? Math.max(0, totalVal - paidVal);
                      const isReceived = (po.status || "").toLowerCase() === "received";

                      return (
                        <tr key={po.id} className="dark:hover:bg-slate-800/40 hover:bg-slate-50 transition-colors group">
                          <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            {po.poNumber}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold dark:text-white text-slate-900">
                              {po.supplierCompany || po.supplierName}
                            </div>
                            {po.supplierCompany && po.supplierName && po.supplierCompany !== po.supplierName && (
                              <div className="text-[11px] dark:text-slate-400 text-slate-500">{po.supplierName}</div>
                            )}
                          </td>
                          <td className="py-3.5 px-4 dark:text-slate-400 text-slate-500 whitespace-nowrap">
                            {po.orderDate ? formatDate(po.orderDate) : "—"}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="dark:text-slate-200 text-slate-700 font-medium flex items-center gap-1.5">
                              <Package className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 shrink-0" />
                              <span>
                                {txt(
                                  `${po.items?.length || po.itemsCount || 1} টি পণ্য`,
                                  `${po.items?.length || po.itemsCount || 1} Item(s)`
                                )}
                              </span>
                            </div>
                            {po.items && po.items.length > 0 && (
                              <div className="text-[11px] dark:text-slate-400 text-slate-500 line-clamp-1 max-w-[200px]">
                                {po.items.map((i) => `${i.name} (x${i.quantity})`).join(", ")}
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold dark:text-white text-slate-900">
                            {formatCurrency(totalVal)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(paidVal)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold">
                            {dueVal > 0 ? (
                              <span className="text-rose-600 dark:text-rose-400">{formatCurrency(dueVal)}</span>
                            ) : (
                              <span className="text-emerald-600 dark:text-emerald-400">৳0</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                isReceived
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                              }`}
                            >
                              {isReceived ? txt("গৃহীত", "RECEIVED") : txt("অপেক্ষমাণ", "PENDING")}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => setSelectedPOForView(po)}
                              className="p-1.5 rounded-lg dark:bg-slate-800 bg-slate-100 dark:hover:bg-slate-700 hover:bg-slate-200 dark:text-slate-300 text-slate-600 hover:dark:text-white hover:text-slate-900 transition-colors"
                              title={txt("বিস্তারিত দেখুন", "View PO Details & Items")}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Suppliers Directory Tab */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredSuppliers.length === 0 ? (
              <div className="col-span-3 p-12 text-center dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 rounded-2xl text-slate-500">
                {searchQuery
                  ? txt("কোনো সাপ্লায়ারের সন্ধান মেলেনি।", "No suppliers match your search.")
                  : txt("এখনও কোনো সাপ্লায়ার যোগ করা হয়নি।", "No suppliers found in directory.")}
              </div>
            ) : (
              filteredSuppliers.map((sup) => {
                const stats = getSupplierStats(sup);
                return (
                  <div
                    key={sup.id}
                    className="p-5 rounded-2xl dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 flex flex-col justify-between hover:dark:border-slate-700 hover:border-slate-300 transition-colors shadow-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 tracking-wide">
                          {sup.companyName || txt("ভেন্ডর", "Vendor")}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            stats.dueAmount > 0
                              ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          }`}
                        >
                          {stats.dueAmount > 0 ? txt("বাকি আছে", "Has Due") : txt("পরিশোধিত", "Settled")}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold dark:text-white text-slate-900 mb-2">{sup.name}</h4>
                      <div className="space-y-1.5 text-xs dark:text-slate-400 text-slate-500">
                        <p className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{sup.phone || txt("কোনো ফোন নম্বর নেই", "No phone provided")}</span>
                        </p>
                        {sup.email && (
                          <p className="flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{sup.email}</span>
                          </p>
                        )}
                        {sup.address && (
                          <p className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{sup.address}</span>
                          </p>
                        )}
                      </div>

                      {/* Orders & Purchase Summary */}
                      <div className="mt-3.5 pt-3 border-t dark:border-slate-800/80 border-slate-100 grid grid-cols-2 gap-2 text-[11px]">
                        <div className="dark:bg-slate-950/60 bg-slate-50 p-2 rounded-xl border dark:border-slate-800/60 border-slate-200">
                          <span className="dark:text-slate-500 text-slate-500 block text-[10px]">{txt("মোট অর্ডার", "Total Orders")}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab("orders");
                              setSearchQuery(sup.companyName || sup.name);
                            }}
                            className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline font-mono text-left"
                            title={txt("এই সাপ্লায়ারের অর্ডার দেখুন", "Filter orders for this supplier")}
                          >
                            {stats.totalOrders} {txt("টি অর্ডার", stats.totalOrders === 1 ? "order" : "orders")} &rarr;
                          </button>
                        </div>
                        <div className="dark:bg-slate-950/60 bg-slate-50 p-2 rounded-xl border dark:border-slate-800/60 border-slate-200">
                          <span className="dark:text-slate-500 text-slate-500 block text-[10px]">{txt("মোট ক্রয়", "Total Purchased")}</span>
                          <span className="font-semibold dark:text-slate-200 text-slate-800 font-mono">
                            {formatCurrency(stats.totalPurchased)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t dark:border-slate-800 border-slate-100 flex items-center justify-between text-xs">
                      <span className="dark:text-slate-400 text-slate-500 font-medium">{txt("বাকি দেনা:", "Outstanding Due:")}</span>
                      <span
                        className={`font-bold font-mono text-sm ${
                          stats.dueAmount > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
                        }`}
                      >
                        {formatCurrency(stats.dueAmount)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>

      {/* VIEW PURCHASE ORDER DETAILS MODAL */}
      {selectedPOForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl my-auto">
            <div className="flex items-center justify-between pb-4 border-b dark:border-slate-800 border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-500 dark:text-indigo-400 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold dark:text-white text-slate-900 font-mono">{selectedPOForView.poNumber}</h3>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        (selectedPOForView.status || "").toLowerCase() === "received"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {(selectedPOForView.status || "").toLowerCase() === "received" ? txt("গৃহীত", "RECEIVED") : txt("অপেক্ষমাণ", "PENDING")}
                    </span>
                  </div>
                  <p className="text-xs dark:text-slate-400 text-slate-500">
                    {txt("অর্ডারের তারিখ:", "Order Date:")} {selectedPOForView.orderDate ? formatDate(selectedPOForView.orderDate) : "—"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPOForView(null)}
                className="dark:text-slate-400 text-slate-500 hover:dark:text-white hover:text-slate-900 p-1 rounded-lg hover:dark:bg-slate-800 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Vendor Info Box */}
            <div className="mt-4 p-3.5 dark:bg-slate-950/60 bg-slate-50 rounded-xl border dark:border-slate-800 border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="dark:text-slate-500 text-slate-500 block text-[11px]">{txt("সাপ্লায়ার / কোম্পানি", "Supplier / Company")}</span>
                <span className="font-semibold dark:text-white text-slate-900">
                  {selectedPOForView.supplierCompany || selectedPOForView.supplierName}
                </span>
              </div>
              <div>
                <span className="dark:text-slate-500 text-slate-500 block text-[11px]">{txt("যোগাযোগের ব্যক্তি", "Contact Person")}</span>
                <span className="font-medium dark:text-slate-200 text-slate-700">{selectedPOForView.supplierName || "—"}</span>
              </div>
              <div>
                <span className="dark:text-slate-500 text-slate-500 block text-[11px]">{txt("ডেলিভারি / স্ট্যাটাস", "Delivery / Status")}</span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400 capitalize">
                  {(selectedPOForView.status || "").toLowerCase() === "received"
                    ? txt("ইনভেন্টরিতে স্টক যুক্ত হয়েছে", "Received in inventory")
                    : txt("ডেলিভারি অপেক্ষমাণ", "Pending delivery")}
                </span>
              </div>
            </div>

            {/* Items Table */}
            <div className="mt-4">
              <h4 className="text-xs font-bold dark:text-slate-300 text-slate-700 uppercase tracking-wider mb-2">
                {txt("ক্রয়কৃত পণ্যসমূহ", "Purchased Items")} ({selectedPOForView.items?.length || selectedPOForView.itemsCount || 0})
              </h4>
              <div className="rounded-xl border dark:border-slate-800 border-slate-200 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="dark:bg-slate-950 bg-slate-50 dark:text-slate-400 text-slate-500 uppercase text-[10px] tracking-wider font-semibold border-b dark:border-slate-800 border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">{txt("পণ্যের নাম", "Product Name")}</th>
                      <th className="py-2.5 px-3 text-right">{txt("পরিমাণ", "Quantity")}</th>
                      <th className="py-2.5 px-3 text-right">{txt("ক্রয়মূল্য", "Buy Price")}</th>
                      <th className="py-2.5 px-3 text-right">{txt("মোট", "Total")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-slate-800 divide-slate-100 dark:bg-slate-900 bg-white">
                    {selectedPOForView.items && selectedPOForView.items.length > 0 ? (
                      selectedPOForView.items.map((item, idx) => (
                        <tr key={item.id || idx}>
                          <td className="py-2 px-3 text-slate-400 font-mono">{idx + 1}</td>
                          <td className="py-2 px-3 font-medium dark:text-white text-slate-900">{item.name}</td>
                          <td className="py-2 px-3 text-right font-mono dark:text-slate-200 text-slate-700">{item.quantity}</td>
                          <td className="py-2 px-3 text-right font-mono dark:text-slate-300 text-slate-600">
                            {formatCurrency(item.buyPrice)}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold dark:text-white text-slate-900">
                            {formatCurrency(item.totalPrice)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-4 text-center text-slate-500">
                          {txt(
                            `${selectedPOForView.itemsCount || 1} টি SKU এই ক্রয় আদেশে সংরক্ষিত।`,
                            `${selectedPOForView.itemsCount || 1} SKU(s) recorded for this purchase order.`
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Breakdown */}
            <div className="mt-4 pt-3 border-t dark:border-slate-800 border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
              <div className="dark:text-slate-400 text-slate-500">
                {selectedPOForView.note ? (
                  <p>
                    <span className="font-semibold dark:text-slate-300 text-slate-700">{txt("মন্তব্য: ", "Note: ")}</span>
                    {selectedPOForView.note}
                  </p>
                ) : (
                  <span>{txt("কোনো অতিরিক্ত মন্তব্য নেই", "No additional remarks")}</span>
                )}
              </div>

              <div className="w-full sm:w-64 space-y-1 dark:bg-slate-950 bg-slate-50 p-3 rounded-xl border dark:border-slate-800 border-slate-200">
                <div className="flex justify-between dark:text-slate-400 text-slate-600">
                  <span>{txt("মোট বিল:", "Total Bill:")}</span>
                  <span className="font-bold dark:text-white text-slate-900 font-mono">
                    {formatCurrency(selectedPOForView.totalAmount ?? selectedPOForView.totalCost ?? 0)}
                  </span>
                </div>
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>{txt("পরিশোধিত:", "Paid Amount:")}</span>
                  <span className="font-bold font-mono">
                    {formatCurrency(selectedPOForView.paidAmount || 0)}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t dark:border-slate-800 border-slate-200 text-rose-600 dark:text-rose-400 font-bold">
                  <span>{txt("বাকি দেনা:", "Due Balance:")}</span>
                  <span className="font-mono">
                    {formatCurrency(
                      selectedPOForView.dueAmount ??
                        Math.max(
                          0,
                          (selectedPOForView.totalAmount ?? selectedPOForView.totalCost ?? 0) -
                            (selectedPOForView.paidAmount || 0)
                        )
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedPOForView(null)}
                className="px-4 py-2 dark:bg-slate-800 bg-slate-100 hover:dark:bg-slate-700 hover:bg-slate-200 dark:text-slate-200 text-slate-700 rounded-xl font-medium text-xs transition-colors"
              >
                {txt("বন্ধ করুন", "Close")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE PURCHASE ORDER MODAL */}
      {showCreatePO && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between mb-3 pb-3 border-b dark:border-slate-800 border-slate-200">
              <div>
                <h3 className="text-base font-bold dark:text-white text-slate-900 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-emerald-500" />
                  <span>{txt("ক্রয় আদেশ তৈরি করুন (পণ্য ক্রয়)", "Issue Purchase Order (Buy Products)")}</span>
                </h3>
                <p className="text-xs dark:text-slate-400 text-slate-500">
                  {txt("সাপ্লায়ার থেকে পণ্য ক্রয় করে স্টকে যুক্ত করুন", "Purchase items from supplier to receive stock into inventory")}
                </p>
              </div>
              <button
                onClick={() => setShowCreatePO(false)}
                className="dark:text-slate-400 text-slate-500 hover:dark:text-white hover:text-slate-900 p-1 rounded-lg hover:dark:bg-slate-800 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {actionError && (
              <div className="mb-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <form onSubmit={handleCreatePO} className="space-y-4 text-xs">
              {/* Supplier & Date Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block dark:text-slate-300 text-slate-700 font-medium mb-1">
                    {txt("সাপ্লায়ার / ভেন্ডর নির্বাচন করুন *", "Select Supplier / Vendor *")}
                  </label>
                  <select
                    required
                    value={newPO.supplierId}
                    onChange={(e) => {
                      const sup = suppliers.find((s) => s.id === e.target.value);
                      setNewPO({
                        ...newPO,
                        supplierId: e.target.value,
                        supplierName: sup?.companyName || sup?.name || "",
                      });
                    }}
                    className="w-full dark:bg-slate-950 bg-slate-50 border dark:border-slate-800 border-slate-300 rounded-xl px-3 py-2 dark:text-white text-slate-900 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">{txt("-- সাপ্লায়ার নির্বাচন করুন --", "-- Choose Supplier --")}</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.companyName ? `${s.companyName} (${s.name})` : s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block dark:text-slate-300 text-slate-700 font-medium mb-1">{txt("ক্রয়ের তারিখ", "Purchase Date")}</label>
                  <input
                    type="date"
                    value={newPO.date}
                    onChange={(e) => setNewPO({ ...newPO, date: e.target.value })}
                    className="w-full dark:bg-slate-950 bg-slate-50 border dark:border-slate-800 border-slate-300 rounded-xl px-3 py-2 dark:text-white text-slate-900 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              {/* PRODUCTS TO PURCHASE SECTION */}
              <div className="p-3.5 dark:bg-slate-950/70 bg-slate-50 border dark:border-slate-800 border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Package className="w-4 h-4" />
                    <span>{txt("ক্রয়যোগ্য পণ্য নির্বাচন", "Select Products to Buy")}</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setShowQuickCreateProduct(!showQuickCreateProduct)}
                    className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>{showQuickCreateProduct ? txt("ফর্ম বন্ধ করুন", "Close Product Form") : txt("+ নতুন পণ্য তৈরি করুন", "+ Create New Product")}</span>
                  </button>
                </div>

                {/* INLINE QUICK PRODUCT CREATOR */}
                {showQuickCreateProduct && (
                  <div className="p-3 dark:bg-slate-900 bg-white border border-emerald-500/30 rounded-xl space-y-2.5 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between pb-1.5 border-b dark:border-slate-800 border-slate-100">
                      <span className="font-bold dark:text-white text-slate-900 text-xs flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                        <PlusCircle className="w-3.5 h-3.5" />
                        {txt("দ্রুত নতুন পণ্য তৈরি করুন (তালিকায় নেই)", "Quick Create Product (Not in catalog)")}
                      </span>
                      <span className="text-[10px] dark:text-slate-400 text-slate-500">
                        {txt("ইনভেন্টরিতে যোগ হবে ও অর্ডারে যুক্ত হবে", "Will be saved to inventory & added to order")}
                      </span>
                    </div>

                    {quickProductError && (
                      <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-[11px]">
                        {quickProductError}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="sm:col-span-2">
                        <label className="block dark:text-slate-400 text-slate-600 text-[11px] mb-0.5">{txt("পণ্যের নাম *", "Product Title *")}</label>
                        <input
                          type="text"
                          placeholder={txt("উদা: ফিলিপস এলইডি বাল্ব ১৫ ওয়াট", "e.g. Philips LED Bulb 15W")}
                          value={quickProduct.name}
                          onChange={(e) => setQuickProduct({ ...quickProduct, name: e.target.value })}
                          className="w-full dark:bg-slate-950 bg-slate-50 border dark:border-slate-800 border-slate-300 rounded-lg px-2.5 py-1.5 dark:text-white text-slate-900 focus:border-emerald-500 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block dark:text-slate-400 text-slate-600 text-[11px] mb-0.5">{txt("বারকোড / SKU", "SKU / Code")}</label>
                        <input
                          type="text"
                          placeholder="AUTO-GEN"
                          value={quickProduct.sku}
                          onChange={(e) => setQuickProduct({ ...quickProduct, sku: e.target.value })}
                          className="w-full dark:bg-slate-950 bg-slate-50 border dark:border-slate-800 border-slate-300 rounded-lg px-2.5 py-1.5 dark:text-white text-slate-900 focus:border-emerald-500 font-mono text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div>
                        <label className="block dark:text-slate-400 text-slate-600 text-[11px] mb-0.5">{txt("ক্যাটাগরি", "Category")}</label>
                        <select
                          value={quickProduct.categoryName}
                          onChange={(e) => setQuickProduct({ ...quickProduct, categoryName: e.target.value })}
                          className="w-full dark:bg-slate-950 bg-slate-50 border dark:border-slate-800 border-slate-300 rounded-lg px-2.5 py-1.5 dark:text-white text-slate-900 focus:border-emerald-500 text-xs"
                        >
                          {categories.map((c) => (
                            <option key={c.id} value={c.name}>
                              {c.name}
                            </option>
                          ))}
                          {!categories.some((c) => c.name === "General") && (
                            <option value="General">General</option>
                          )}
                        </select>
                      </div>

                      <div>
                        <label className="block dark:text-slate-400 text-slate-600 text-[11px] mb-0.5">{txt("ক্রয়মূল্য (৳) *", "Buy Price (৳) *")}</label>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={quickProduct.buyPrice}
                          onChange={(e) => setQuickProduct({ ...quickProduct, buyPrice: Number(e.target.value) })}
                          className="w-full dark:bg-slate-950 bg-slate-50 border dark:border-slate-800 border-slate-300 rounded-lg px-2.5 py-1.5 dark:text-white text-slate-900 focus:border-emerald-500 font-mono text-xs"
                        />
                      </div>

                      <div>
                        <label className="block dark:text-slate-400 text-slate-600 text-[11px] mb-0.5">{txt("বিক্রয়মূল্য (৳) *", "Sell Price (৳) *")}</label>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={quickProduct.sellPrice}
                          onChange={(e) => setQuickProduct({ ...quickProduct, sellPrice: Number(e.target.value) })}
                          className="w-full dark:bg-slate-950 bg-slate-50 border dark:border-slate-800 border-slate-300 rounded-lg px-2.5 py-1.5 dark:text-white text-slate-900 focus:border-emerald-500 font-mono text-xs"
                        />
                      </div>

                      <div>
                        <label className="block dark:text-slate-400 text-slate-600 text-[11px] mb-0.5">{txt("অর্ডারের পরিমাণ *", "Order Qty *")}</label>
                        <input
                          type="number"
                          min="1"
                          value={quickProduct.initialOrderQty}
                          onChange={(e) =>
                            setQuickProduct({ ...quickProduct, initialOrderQty: Number(e.target.value) })
                          }
                          className="w-full dark:bg-slate-950 bg-slate-50 border dark:border-slate-800 border-slate-300 rounded-lg px-2.5 py-1.5 dark:text-white text-slate-900 focus:border-emerald-500 font-mono text-xs"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowQuickCreateProduct(false)}
                        className="px-3 py-1.5 rounded-lg dark:bg-slate-800 bg-slate-100 hover:dark:bg-slate-700 hover:bg-slate-200 dark:text-slate-300 text-slate-700 text-xs font-medium"
                      >
                        {txt("বাতিল", "Cancel")}
                      </button>
                      <button
                        type="button"
                        disabled={isCreatingProduct || !quickProduct.name.trim()}
                        onClick={handleQuickCreateProduct}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 disabled:opacity-50"
                      >
                        {isCreatingProduct ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            <span>{txt("তৈরি হচ্ছে...", "Creating...")}</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>{txt("তৈরি করুন ও অর্ডারে যোগ করুন", "Create & Add to Order")}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* PICK EXISTING PRODUCT ROW */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
                  <div className="sm:col-span-6">
                    <label className="block dark:text-slate-400 text-slate-600 text-[11px] mb-1">{txt("বিদ্যমান পণ্য বাছাই করুন", "Pick Existing Product")}</label>
                    <select
                      value={selectedProductId}
                      onChange={(e) => handleProductSelectChange(e.target.value)}
                      className="w-full dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-300 rounded-xl px-3 py-2 dark:text-white text-slate-900 focus:outline-none focus:border-indigo-500 text-xs"
                    >
                      <option value="">{txt(`-- ইনভেন্টরি থেকে বাছাই করুন (${products.length} টি) --`, `-- Choose from inventory (${products.length} items) --`)}</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} {p.sku ? `(${p.sku})` : ""} | {txt("স্টক", "Stock")}: {p.stockQuantity} | {txt("ক্রয়মূল্য", "Cost")}: ৳{p.costPrice}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block dark:text-slate-400 text-slate-600 text-[11px] mb-1">{txt("পরিমাণ", "Qty")}</label>
                    <input
                      type="number"
                      min="1"
                      value={itemQuantity}
                      onChange={(e) => setItemQuantity(Number(e.target.value))}
                      className="w-full dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-300 rounded-xl px-2.5 py-2 dark:text-white text-slate-900 font-mono text-xs focus:border-indigo-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block dark:text-slate-400 text-slate-600 text-[11px] mb-1">{txt("ক্রয়মূল্য (৳)", "Buy Price (৳)")}</label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={itemBuyPrice}
                      onChange={(e) => setItemBuyPrice(Number(e.target.value))}
                      className="w-full dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-300 rounded-xl px-2.5 py-2 dark:text-white text-slate-900 font-mono text-xs focus:border-indigo-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <button
                      type="button"
                      disabled={!selectedProductId}
                      onClick={handleAddItemToPO}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 disabled:opacity-40 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{txt("যোগ করুন", "Add Item")}</span>
                    </button>
                  </div>
                </div>

                {/* CURRENT ITEMS IN ORDER TABLE */}
                <div className="mt-3">
                  <div className="text-[11px] font-semibold dark:text-slate-400 text-slate-600 mb-1.5">
                    {txt(`এই অর্ডারের পণ্যসমূহ (${newPO.items.length})`, `Items In This Order (${newPO.items.length})`)}
                  </div>
                  {newPO.items.length === 0 ? (
                    <div className="p-4 border border-dashed dark:border-slate-800 border-slate-300 rounded-xl text-center text-slate-500 text-xs">
                      {txt("এখনও কোনো পণ্য যোগ করা হয়নি। উপরে থেকে পণ্য নির্বাচন করুন অথবা নতুন পণ্য তৈরি করুন।", "No items added yet. Select a product above or click \"+ Create New Product\".")}
                    </div>
                  ) : (
                    <div className="rounded-xl border dark:border-slate-800 border-slate-200 overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="dark:bg-slate-900 bg-slate-50 dark:text-slate-400 text-slate-500 text-[10px] uppercase font-semibold border-b dark:border-slate-800 border-slate-200">
                          <tr>
                            <th className="py-2 px-3">{txt("পণ্য", "Item")}</th>
                            <th className="py-2 px-3 text-right">{txt("পরিমাণ", "Quantity")}</th>
                            <th className="py-2 px-3 text-right">{txt("ক্রয়মূল্য", "Buy Price")}</th>
                            <th className="py-2 px-3 text-right">{txt("মোট", "Total")}</th>
                            <th className="py-2 px-2 text-center w-8"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y dark:divide-slate-800 divide-slate-100 dark:bg-slate-950 bg-white">
                          {newPO.items.map((item, idx) => (
                            <tr key={idx} className="dark:hover:bg-slate-900/50 hover:bg-slate-50">
                              <td className="py-2 px-3 font-medium dark:text-white text-slate-900">{item.name}</td>
                              <td className="py-2 px-3 text-right">
                                <input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) => handleUpdateItemQty(idx, Number(e.target.value))}
                                  className="w-16 dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-300 rounded px-1.5 py-0.5 text-right dark:text-white text-slate-900 font-mono text-xs focus:border-indigo-500"
                                />
                              </td>
                              <td className="py-2 px-3 text-right">
                                <input
                                  type="number"
                                  min="0"
                                  step="any"
                                  value={item.buyPrice}
                                  onChange={(e) => handleUpdateItemPrice(idx, Number(e.target.value))}
                                  className="w-20 dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-300 rounded px-1.5 py-0.5 text-right dark:text-white text-slate-900 font-mono text-xs focus:border-indigo-500"
                                />
                              </td>
                              <td className="py-2 px-3 text-right font-mono font-bold dark:text-white text-slate-900">
                                {formatCurrency(item.totalPrice)}
                              </td>
                              <td className="py-2 px-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(idx)}
                                  className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 rounded transition-colors"
                                  title={txt("পণ্যটি বাদ দিন", "Remove Item")}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* PAYMENT & STATUS SECTION */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block dark:text-slate-300 text-slate-700 font-medium mb-1">{txt("স্ট্যাটাস", "Status")}</label>
                  <select
                    value={newPO.status}
                    onChange={(e) => setNewPO({ ...newPO, status: e.target.value })}
                    className="w-full dark:bg-slate-950 bg-slate-50 border dark:border-slate-800 border-slate-300 rounded-xl px-3 py-2 dark:text-white text-slate-900 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="received">{txt("গৃহীত (ইনভেন্টরিতে স্টক যুক্ত হবে)", "Received (Adds Stock to Inventory)")}</option>
                    <option value="pending">{txt("অপেক্ষমাণ (ডেলিভারি বাকি)", "Pending (Awaiting Delivery)")}</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="dark:text-slate-300 text-slate-700 font-medium">{txt("অগ্রিম / পরিশোধিত টাকা (৳)", "Advance / Paid Amount (৳)")}</label>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setNewPO({ ...newPO, paidAmount: calculatedPOTotal })}
                        className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        {txt("সম্পূর্ণ পরিশোধ", "Pay Full")}
                      </button>
                      <span className="text-slate-400">|</span>
                      <button
                        type="button"
                        onClick={() => setNewPO({ ...newPO, paidAmount: 0 })}
                        className="text-[10px] dark:text-slate-400 text-slate-500 hover:underline"
                      >
                        {txt("সম্পূর্ণ বাকি", "Due Full")}
                      </button>
                    </div>
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={newPO.paidAmount}
                    onChange={(e) => setNewPO({ ...newPO, paidAmount: Number(e.target.value) })}
                    className="w-full dark:bg-slate-950 bg-slate-50 border dark:border-slate-800 border-slate-300 rounded-xl px-3 py-2 dark:text-white text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Optional Notes */}
              <div>
                <label className="block dark:text-slate-300 text-slate-700 font-medium mb-1">{txt("মন্তব্য / নোট (ঐচ্ছিক)", "Remarks / Note (Optional)")}</label>
                <input
                  type="text"
                  placeholder={txt("উদা: চালান নং ২৯৩৮, ব্যাংক ট্রান্সফার মাধ্যমে পরিশোধিত", "e.g. Invoice #2938, Paid via Bank Transfer")}
                  value={newPO.note}
                  onChange={(e) => setNewPO({ ...newPO, note: e.target.value })}
                  className="w-full dark:bg-slate-950 bg-slate-50 border dark:border-slate-800 border-slate-300 rounded-xl px-3 py-2 dark:text-white text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* SUMMARY BOX */}
              <div className="p-3 dark:bg-slate-950 bg-slate-50 rounded-xl border dark:border-slate-800 border-slate-200 flex items-center justify-between font-mono">
                <div>
                  <span className="dark:text-slate-400 text-slate-500 text-xs block">{txt("মোট বিল:", "Total Bill Amount:")}</span>
                  <span className="text-base font-bold dark:text-white text-slate-900">{formatCurrency(calculatedPOTotal)}</span>
                </div>
                <div>
                  <span className="dark:text-slate-400 text-slate-500 text-xs block">{txt("পরিশোধ:", "Paid:")}</span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(newPO.paidAmount || 0)}</span>
                </div>
                <div className="text-right">
                  <span className="dark:text-slate-400 text-slate-500 text-xs block">{txt("অবশিষ্ট বাকি:", "Remaining Due:")}</span>
                  <span className={`text-base font-bold ${calculatedPODue > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                    {formatCurrency(calculatedPODue)}
                  </span>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="pt-2 flex justify-end gap-2 border-t dark:border-slate-800 border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreatePO(false)}
                  className="px-4 py-2 rounded-xl dark:bg-slate-800 bg-slate-100 dark:text-slate-300 text-slate-700 hover:dark:bg-slate-700 hover:bg-slate-200 font-semibold transition-colors"
                >
                  {txt("বাতিল", "Cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || newPO.items.length === 0}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>{txt("অর্ডার হচ্ছে...", "Placing Order...")}</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{txt(`অর্ডার সম্পন্ন করুন (${formatCurrency(calculatedPOTotal)})`, `Issue Order (${formatCurrency(calculatedPOTotal)})`)}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD SUPPLIER MODAL */}
      {showAddSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold dark:text-white text-slate-900 flex items-center gap-2">
                <Truck className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                <span>{txt("নতুন সাপ্লায়ার / ভেন্ডর যোগ করুন", "Add New Supplier / Vendor")}</span>
              </h3>
              <button
                onClick={() => setShowAddSupplier(false)}
                className="dark:text-slate-400 text-slate-500 hover:dark:text-white hover:text-slate-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {actionError && (
              <div className="mb-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-medium">
                {actionError}
              </div>
            )}

            <form onSubmit={handleAddSupplier} className="space-y-3 text-xs">
              <div>
                <label className="block dark:text-slate-300 text-slate-700 font-medium mb-1">{txt("কোম্পানি / ব্র্যান্ডের নাম *", "Company / Brand Name *")}</label>
                <input
                  type="text"
                  required
                  value={newSup.companyName}
                  onChange={(e) => setNewSup({ ...newSup, companyName: e.target.value })}
                  placeholder={txt("উদা: স্কয়ার কনজিউমার প্রোডাক্টস", "e.g. Square Consumer Products")}
                  className="w-full dark:bg-slate-950 bg-slate-50 border dark:border-slate-800 border-slate-300 rounded-xl px-3 py-2 dark:text-white text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block dark:text-slate-300 text-slate-700 font-medium mb-1">{txt("যোগাযোগের ব্যক্তির নাম", "Contact Person Name")}</label>
                <input
                  type="text"
                  value={newSup.name}
                  onChange={(e) => setNewSup({ ...newSup, name: e.target.value })}
                  placeholder={txt("উদা: হাবিবুর রহমান", "e.g. Habib Rahman")}
                  className="w-full dark:bg-slate-950 bg-slate-50 border dark:border-slate-800 border-slate-300 rounded-xl px-3 py-2 dark:text-white text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block dark:text-slate-300 text-slate-700 font-medium mb-1">{txt("মোবাইল নম্বর *", "Phone Number *")}</label>
                  <input
                    type="tel"
                    required
                    value={newSup.phone}
                    onChange={(e) => setNewSup({ ...newSup, phone: e.target.value })}
                    placeholder="+880 1711-..."
                    className="w-full dark:bg-slate-950 bg-slate-50 border dark:border-slate-800 border-slate-300 rounded-xl px-3 py-2 dark:text-white text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block dark:text-slate-300 text-slate-700 font-medium mb-1">{txt("ইমেইল", "Email")}</label>
                  <input
                    type="email"
                    value={newSup.email}
                    onChange={(e) => setNewSup({ ...newSup, email: e.target.value })}
                    placeholder="rep@vendor.com"
                    className="w-full dark:bg-slate-950 bg-slate-50 border dark:border-slate-800 border-slate-300 rounded-xl px-3 py-2 dark:text-white text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block dark:text-slate-300 text-slate-700 font-medium mb-1">{txt("অফিসের ঠিকানা", "Office Address")}</label>
                <input
                  type="text"
                  value={newSup.address}
                  onChange={(e) => setNewSup({ ...newSup, address: e.target.value })}
                  placeholder={txt("উদা: মহাখালী, ঢাকা", "e.g. Mohakhali, Dhaka")}
                  className="w-full dark:bg-slate-950 bg-slate-50 border dark:border-slate-800 border-slate-300 rounded-xl px-3 py-2 dark:text-white text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddSupplier(false)}
                  className="px-3.5 py-2 rounded-xl dark:bg-slate-800 bg-slate-100 dark:text-slate-300 text-slate-700 hover:dark:bg-slate-700 hover:bg-slate-200 font-semibold"
                >
                  {txt("বাতিল", "Cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>{txt("সংরক্ষণ হচ্ছে...", "Saving...")}</span>
                    </>
                  ) : (
                    <span>{txt("সংরক্ষণ করুন", "Save Supplier")}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
