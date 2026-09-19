"use client";

import { useState, useEffect, useMemo } from "react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { InventoryService, AuthService } from "@/lib/api/client";
import { ProductItem, Category } from "@/types";
import { formatCurrency, downloadCsvFile } from "@/lib/utils";
import {
  Package,
  Plus,
  Upload,
  Download,
  Search,
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle2,
  X,
  Pencil,
  Trash2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Layers,
} from "lucide-react";

import { useLanguage } from "@/context/LanguageContext";

export default function InventoryPage() {
  const { txt } = useLanguage();
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState("ALL");
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<ProductItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // New product form state
  const [newProduct, setNewProduct] = useState<Partial<ProductItem>>({
    name: "",
    sku: "",
    costPrice: 0,
    sellingPrice: 0,
    stockQuantity: 0,
    minStockAlert: 5,
    unit: "Piece",
    categoryName: "General",
  });

  // CSV Import state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importStatus, setImportStatus] = useState<string>("");

  const [user, setUser] = useState<any>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prods, cats] = await Promise.all([
        InventoryService.getProducts(),
        InventoryService.getCategories(),
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch (err) {
      console.error("Failed to load inventory", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setUser(AuthService.getCurrentUser());
    loadData();
  }, []);

  const userRole = (user?.role || "").toLowerCase();
  const isManager = userRole === "manager";
  const canViewBuyPrice =
    !isManager && (userRole === "admin" || user?.permissions?.canViewBuyPrice === true);
  const canExportExcel = userRole === "admin" || user?.permissions?.canExportExcel !== false;
  const canEditProducts = userRole === "admin" || user?.permissions?.canEditProducts !== false;
  const canDeleteProducts = userRole === "admin" || user?.permissions?.canDeleteProducts !== false;

  // Filter products locally based on search & category
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        ((p as any).code && (p as any).code.toLowerCase().includes(q));
      const catName = (p.categoryName || (p as any).category || "General").toLowerCase();
      const matchesCat = selectedCat === "ALL" || catName === selectedCat.toLowerCase();
      return matchesSearch && matchesCat;
    });
  }, [products, searchQuery, selectedCat]);

  // Paginate filtered items
  const paginatedProducts = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return filteredProducts.slice(startIdx, startIdx + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  const computedTotalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));

  // Add Product Handler
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setActionError(null);
    try {
      const created = await InventoryService.createProduct(newProduct);
      setProducts([created, ...products]);
      setShowAddModal(false);
      setNewProduct({
        name: "",
        sku: "",
        costPrice: 0,
        sellingPrice: 0,
        stockQuantity: 0,
        minStockAlert: 5,
        unit: "Piece",
        categoryName: categories[0]?.name || "General",
      });
    } catch (err: any) {
      console.error("Failed to create product", err);
      setActionError(err.message || "Failed to create product");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update Product Handler
  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setIsSubmitting(true);
    setActionError(null);
    try {
      const updated = await InventoryService.updateProduct(editingProduct.id, editingProduct);
      setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setEditingProduct(null);
    } catch (err: any) {
      console.error("Failed to update product", err);
      setActionError(err.message || "Failed to update product");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Product Handler
  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;
    setIsSubmitting(true);
    setActionError(null);
    try {
      await InventoryService.deleteProduct(deletingProduct.id);
      setProducts((prev) => prev.filter((p) => p.id !== deletingProduct.id));
      setDeletingProduct(null);
    } catch (err: any) {
      console.error("Failed to delete product", err);
      setActionError(err.message || "Failed to delete product");
    } finally {
      setIsSubmitting(false);
    }
  };

  // CSV Bulk Import Handler
  const handleImportCsv = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setImportStatus("Importing CSV inventory records...");
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      const res = await InventoryService.importCsv(formData);
      setImportStatus(res.message);
      setTimeout(() => {
        setShowImportModal(false);
        setSelectedFile(null);
        setImportStatus("");
        loadData();
      }, 1200);
    } catch (err) {
      console.error("CSV import error", err);
      setImportStatus("Failed to process CSV file.");
    }
  };

  const handleExportCsv = () => {
    const exportData = filteredProducts.map((p) => ({
      SKU: p.sku,
      Name: p.name,
      Category: p.categoryName || (p as any).category || "General",
      CostPrice: p.costPrice,
      SellingPrice: p.sellingPrice,
      StockQuantity: p.stockQuantity,
      Unit: p.unit,
      MinStockAlert: p.minStockAlert,
    }));
    downloadCsvFile(exportData, `Inventarioya_Products_${new Date().toISOString().split("T")[0]}`);
  };

  const totalStockCount = products.reduce((acc, p) => acc + (p.stockQuantity || 0), 0);
  const lowStockProducts = products.filter((p) => p.stockQuantity <= p.minStockAlert);

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <DashboardHeader title={txt("ইনভেন্টরি ক্যাটালগ ও স্টক নিয়ন্ত্রণ", "Inventory Catalog & Stock Control")} />

      <main className="p-4 sm:p-6 space-y-6 max-w-7xl">
        {/* KPI Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {txt("মোট প্রোডাক্ট", "Total Products")}
              </span>
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-white mt-2 font-mono">{products.length}</p>
            <p className="text-[10px] text-slate-500 mt-1">{txt("ক্যাটালগ পণ্য আইটেম", "Unique catalog items")}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {txt("মোট স্টক ইউনিট", "Total Stock Units")}
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-white mt-2 font-mono">{totalStockCount}</p>
            <p className="text-[10px] text-slate-500 mt-1">{txt("মজুদ থাকা মোট ইউনিট", "On-hand physical units")}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider">
                {txt("কম স্টক সতর্কবার্তা", "Low Stock Warning")}
              </span>
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-rose-400 mt-2 font-mono">
              {lowStockProducts.length}
            </p>
            <p className="text-[10px] text-slate-500 mt-1">{txt("দ্রুত রি-অর্ডার করা প্রয়োজন", "Needs reordering soon")}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                {txt("সক্রিয় ক্যাটাগরি", "Active Categories")}
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-emerald-400 mt-2 font-mono">
              {categories.length || 3}
            </p>
            <p className="text-[10px] text-slate-500 mt-1">{txt("পণ্য শ্রেণি বিভাগ", "Classification groups")}</p>
          </div>
        </div>

        {/* Filter Bar & Action Buttons */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-slate-900/60 p-3 sm:p-4 rounded-2xl border border-slate-800">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1 max-w-xl">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder={txt("নাম, SKU বা কোড দিয়ে পণ্য খুঁজুন...", "Search products by name, SKU or code...")}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-inner"
              />
            </div>

            {/* Category Filter */}
            <select
              aria-label="Filter by Category"
              value={selectedCat}
              onChange={(e) => {
                setSelectedCat(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none shrink-0"
            >
              <option value="ALL">{txt("সকল ক্যাটাগরি", "All Categories")}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setShowImportModal(true)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-slate-700 shadow-sm"
              title={txt("বাল্ক CSV ফাইল ইমপোর্ট", "Bulk import items via CSV file")}
            >
              <Upload className="w-3.5 h-3.5 text-amber-400" />
              <span>{txt("CSV ইমপোর্ট", "Import CSV")}</span>
            </button>

            {canExportExcel && (
              <button
                onClick={handleExportCsv}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                title={txt("ক্যাটালগ CSV ফাইলে এক্সপোর্ট", "Export catalog to CSV")}
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>{txt("CSV এক্সপোর্ট", "Export CSV")}</span>
              </button>
            )}

            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{txt("নতুন প্রোডাক্ট", "New Product")}</span>
            </button>

            <button
              onClick={loadData}
              className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors"
              title={txt("পণ্য তালিকা রিফ্রেশ করুন", "Refresh product list")}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-indigo-400" : ""}`} />
            </button>
          </div>
        </div>

        {/* Product Table */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-xs">
              <thead className="bg-slate-950/70 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">{txt("SKU / কোড", "SKU / Code")}</th>
                  <th className="py-3.5 px-4">{txt("পণ্যের নাম", "Product Name")}</th>
                  <th className="py-3.5 px-4">{txt("ক্যাটাগরি", "Category")}</th>
                  {canViewBuyPrice && <th className="py-3.5 px-4 text-right">{txt("ক্রয় মূল্য", "Cost Price")}</th>}
                  <th className="py-3.5 px-4 text-right">{txt("বিক্রয় মূল্য", "Selling Price")}</th>
                  <th className="py-3.5 px-4 text-center">{txt("স্টক পরিমাণ", "Stock Level")}</th>
                  <th className="py-3.5 px-4 text-center">{txt("স্ট্যাটাস", "Status")}</th>
                  <th className="py-3.5 px-4 text-right">{txt("অ্যাকশন", "Actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={canViewBuyPrice ? 8 : 7} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
                        <span className="text-xs">{txt("ইনভেন্টরি ক্যাটালগ লোড হচ্ছে...", "Loading inventory catalog...")}</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={canViewBuyPrice ? 8 : 7} className="py-12 text-center text-slate-500">
                      {txt("বর্তমান শর্ত অনুযায়ী কোনো পণ্য খুঁজে পাওয়া যায়নি।", "No products found matching current criteria.")}
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map((p) => {
                    const isLow = p.stockQuantity <= p.minStockAlert;
                    const displaySku = p.sku || (p as any).code || "-";

                    return (
                      <tr key={p.id} className="hover:bg-slate-800/40 transition-colors group">
                        <td className="py-3.5 px-4 font-mono text-slate-400 font-medium">
                          {displaySku}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-white">
                          {p.name}
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 border border-slate-700/60 font-medium">
                            {p.categoryName || (p as any).category || "General"}
                          </span>
                        </td>
                        {canViewBuyPrice && (
                          <td className="py-3.5 px-4 text-right text-slate-400 font-mono">
                            {formatCurrency(p.costPrice)}
                          </td>
                        )}
                        <td className="py-3.5 px-4 text-right font-bold text-white font-mono">
                          {formatCurrency(p.sellingPrice)}
                        </td>
                        <td className="py-3.5 px-4 text-center font-semibold font-mono">
                          <span className={isLow ? "text-rose-400 font-bold" : "text-white"}>
                            {p.stockQuantity} {p.unit}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {isLow ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                              <AlertTriangle className="w-3 h-3" />
                              {txt(`কম স্টক (≤${p.minStockAlert})`, `Low Stock (≤${p.minStockAlert})`)}
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                              {txt("স্টকে আছে", "In Stock")}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {canEditProducts && (
                              <button
                                onClick={() => {
                                  setActionError(null);
                                  setEditingProduct(p);
                                }}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white transition-colors"
                                title={txt("পণ্য বিবরণ সম্পাদনা করুন", "Edit Product Details")}
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {canDeleteProducts && (
                              <button
                                onClick={() => {
                                  setActionError(null);
                                  setDeletingProduct(p);
                                }}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition-colors"
                                title={txt("পণ্য মুছে ফেলুন", "Delete Product")}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Bar */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span>
                {txt(
                  `দেখাচ্ছে ${filteredProducts.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} থেকে ${Math.min(currentPage * pageSize, filteredProducts.length)} (মোট ${filteredProducts.length} টি পণ্য)`,
                  `Showing ${filteredProducts.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to ${Math.min(currentPage * pageSize, filteredProducts.length)} of ${filteredProducts.length} products`
                )}
              </span>
              <div className="h-3 w-px bg-slate-800 mx-2" />
              <select
                aria-label={txt("প্রতি পৃষ্ঠার আইটেম সংখ্যা", "Items per page")}
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-300 text-xs focus:outline-none"
              >
                <option value={10}>10 {txt("টি প্রতি পৃষ্ঠায়", "per page")}</option>
                <option value={25}>25 {txt("টি প্রতি পৃষ্ঠায়", "per page")}</option>
                <option value={50}>50 {txt("টি প্রতি পৃষ্ঠায়", "per page")}</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title={txt("পূর্ববর্তী পৃষ্ঠা", "Previous Page")}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-3 py-1 font-semibold text-white">
                {txt(`পৃষ্ঠা ${currentPage} / ${computedTotalPages}`, `Page ${currentPage} of ${computedTotalPages}`)}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(computedTotalPages, p + 1))}
                disabled={currentPage >= computedTotalPages}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title={txt("পরবর্তী পৃষ্ঠা", "Next Page")}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{txt("পণ্য সম্পাদনা", "Edit Product")}</h3>
                  <p className="text-[10px] text-slate-400 font-mono">
                    ID: {editingProduct.id.slice(0, 8)}...
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setActionError(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {actionError && (
              <div className="mb-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
                {actionError}
              </div>
            )}

            <form onSubmit={handleUpdateProduct} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">{txt("পণ্যের নাম / শিরোনাম", "Product Title / Name")}</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, name: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">{txt("SKU / আইটেম কোড", "SKU / Item Code")}</label>
                  <input
                    type="text"
                    value={editingProduct.sku || (editingProduct as any).code || ""}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        sku: e.target.value,
                        code: e.target.value,
                      })
                    }
                    placeholder="e.g. SKU-12"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">{txt("ক্যাটাগরি", "Category")}</label>
                  <input
                    type="text"
                    list="category-suggestions"
                    value={editingProduct.categoryName || (editingProduct as any).category || ""}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        categoryName: e.target.value,
                        category: e.target.value,
                      })
                    }
                    placeholder={txt("জেনারেল, ইলেকট্রনিক্স ইত্যাদি", "General, Electric, etc.")}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                  <datalist id="category-suggestions">
                    {categories.map((c) => (
                      <option key={c.id} value={c.name} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className={`grid ${canViewBuyPrice ? "grid-cols-2" : "grid-cols-1"} gap-3`}>
                {canViewBuyPrice && (
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">{txt("কেনা দাম / ক্রয় মূল্য (৳)", "Cost / Buy Price (৳)")}</label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={editingProduct.costPrice ?? (editingProduct as any).buyPrice ?? 0}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          costPrice: Number(e.target.value),
                          buyPrice: Number(e.target.value),
                        })
                      }
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
                    value={editingProduct.sellingPrice ?? (editingProduct as any).sellPrice ?? 0}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        sellingPrice: Number(e.target.value),
                        sellPrice: Number(e.target.value),
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">{txt("স্টক পরিমাণ", "Stock Quantity")}</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editingProduct.stockQuantity}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        stockQuantity: Number(e.target.value),
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">{txt("কম স্টক সতর্কবার্তা", "Min Stock Alert")}</label>
                  <input
                    type="number"
                    min="0"
                    value={editingProduct.minStockAlert ?? (editingProduct as any).lowStockThreshold ?? 5}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        minStockAlert: Number(e.target.value),
                        lowStockThreshold: Number(e.target.value),
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">{txt("একক / ইউনিট", "Unit")}</label>
                  <input
                    type="text"
                    value={editingProduct.unit || "Piece"}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        unit: e.target.value,
                      })
                    }
                    placeholder={txt("টি, প্যাকেট ইত্যাদি", "pcs, box, etc.")}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct(null);
                    setActionError(null);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium"
                >
                  {txt("বাতিল", "Cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow transition-colors flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>{txt("সংরক্ষণ হচ্ছে...", "Saving...")}</span>
                    </>
                  ) : (
                    <span>{txt("পরিবর্তন সংরক্ষণ করুন", "Save Changes")}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Product Confirmation Modal */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-rose-500/40 rounded-2xl max-w-sm w-full p-5 sm:p-6 shadow-2xl my-auto">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{txt("পণ্য মুছে ফেলুন", "Delete Product")}</h3>
                <p className="text-[11px] text-slate-400">{txt("ক্যাটালগ থেকে অপসারণ নিশ্চিতকরণ", "Confirm catalog removal")}</p>
              </div>
            </div>

            {actionError && (
              <div className="mb-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
                {actionError}
              </div>
            )}

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              {txt(
                `আপনি কি নিশ্চিত যে "${deletingProduct.name}" মুছে ফেলতে চান?`,
                `Are you sure you want to delete "${deletingProduct.name}"?`
              )}
              {deletingProduct.sku && (
                <span className="block text-slate-400 text-[11px] mt-1 font-mono">
                  SKU: {deletingProduct.sku}
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
                onClick={() => {
                  setDeletingProduct(null);
                  setActionError(null);
                }}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition-colors"
              >
                {txt("বাতিল", "Cancel")}
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDeleteProduct}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center gap-1.5"
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
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white">{txt("ইনভেন্টরিতে নতুন পণ্য যোগ করুন", "Add New Product to Inventory")}</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {actionError && (
              <div className="mb-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
                {actionError}
              </div>
            )}

            <form onSubmit={handleAddProduct} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">{txt("পণ্যের নাম", "Product Title")}</label>
                <input
                  type="text"
                  required
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder={txt("যেমন: প্রাণ ম্যাঙ্গো জুস ২৫০ মি.লি.", "e.g. Pran Mango Juice 250ml")}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">{txt("SKU কোড", "SKU Code")}</label>
                  <input
                    type="text"
                    required
                    value={newProduct.sku}
                    onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                    placeholder="PMJ-250"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">{txt("ক্যাটাগরি", "Category")}</label>
                  <select
                    aria-label={txt("ক্যাটাগরি নির্বাচন", "Category Selection")}
                    value={newProduct.categoryName}
                    onChange={(e) => setNewProduct({ ...newProduct, categoryName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={`grid ${canViewBuyPrice ? "grid-cols-2" : "grid-cols-1"} gap-3`}>
                {canViewBuyPrice && (
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">{txt("কেনা দাম (৳)", "Cost Price (৳)")}</label>
                    <input
                      type="number"
                      required
                      step="any"
                      min="0"
                      value={newProduct.costPrice}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, costPrice: Number(e.target.value) })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-slate-300 font-medium mb-1">{txt("বিক্রয় মূল্য (৳)", "Selling Price (৳)")}</label>
                  <input
                    type="number"
                    required
                    step="any"
                    min="0"
                    value={newProduct.sellingPrice}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, sellingPrice: Number(e.target.value) })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">{txt("শুরুর স্টক", "Initial Qty")}</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={newProduct.stockQuantity}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, stockQuantity: Number(e.target.value) })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">{txt("সর্বনিম্ন এলার্ট", "Min Alert")}</label>
                  <input
                    type="number"
                    min="0"
                    value={newProduct.minStockAlert}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, minStockAlert: Number(e.target.value) })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">{txt("একক", "Unit")}</label>
                  <input
                    type="text"
                    value={newProduct.unit}
                    onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                    placeholder={txt("টি / বক্স", "pcs")}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                >
                  {txt("বাতিল", "Cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md"
                >
                  {isSubmitting ? txt("সংরক্ষণ হচ্ছে...", "Saving...") : txt("পণ্য সংরক্ষণ করুন", "Save Product")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">{txt("একসাথে বাল্ক CSV ইনভেন্টরি ইমপোর্ট", "Bulk CSV Inventory Import")}</h3>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              {txt(
                "এমন একটি .csv ফাইল আপলোড করুন যাতে কলাম থাকবে: ",
                "Upload a .csv file containing columns: "
              )}
              <span className="text-white font-mono">
                name, sku{canViewBuyPrice ? ", costPrice" : ""}, sellingPrice, stockQuantity, unit
              </span>
              .
            </p>

            <form onSubmit={handleImportCsv} className="space-y-4">
              <div className="border-2 border-dashed border-slate-700 rounded-xl p-6 text-center hover:border-indigo-500 transition-colors">
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="csv-file-input"
                />
                <label htmlFor="csv-file-input" className="cursor-pointer">
                  <Upload className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                  <span className="text-xs text-white font-medium block">
                    {selectedFile ? selectedFile.name : txt("কম্পিউটার থেকে CSV ফাইল নির্বাচন করুন", "Select CSV File from computer")}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1 block">{txt("সর্বোচ্চ সাইজ: ৫ মেগাবাইট", "Max size: 5MB")}</span>
                </label>
              </div>

              {importStatus && (
                <p className="text-xs text-emerald-400 text-center font-medium">{importStatus}</p>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
                >
                  {txt("বাতিল", "Cancel")}
                </button>
                <button
                  type="submit"
                  disabled={!selectedFile}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-bold shadow-md"
                >
                  {txt("আপলোড ও ইমপোর্ট করুন", "Upload & Import")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
