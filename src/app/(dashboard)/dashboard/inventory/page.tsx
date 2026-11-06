"use client";

import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { InventoryService, AuthService } from "@/lib/api/client";
import { ProductItem } from "@/types";
import { useLanguage } from "@/context/LanguageContext";
import { useInventoryData } from "@/hooks/useInventoryData";
import { InventoryMetricsCards } from "@/components/inventory/InventoryMetricsCards";
import { InventoryFilterBar } from "@/components/inventory/InventoryFilterBar";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { InventoryPagination } from "@/components/inventory/InventoryPagination";
import { ProductFormModal } from "@/components/inventory/ProductFormModal";
import { DeleteProductModal } from "@/components/inventory/DeleteProductModal";
import { CsvImportModal } from "@/components/inventory/CsvImportModal";

/**
 * ইনভেন্টরি ক্যাটালগ ও স্টক নিয়ন্ত্রণ পেজ (Inventory Catalog & Stock Control Page)
 * প্রতিটি পণ্যের স্টক লেভেল, ক্যাটাগরি ফিল্টার, বাল্ক CSV ইমপোর্ট এবং CRUD অ্যাকশনসমূহ পরিচালনা করে।
 */
export default function InventoryPage() {
  const { txt } = useLanguage();

  // কাস্টম ইনভেন্টরি ডাটা হুক
  const {
    products,
    setProducts,
    categories,
    searchQuery,
    setSearchQuery,
    selectedCat,
    setSelectedCat,
    filteredProducts,
    paginatedProducts,
    computedTotalPages,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalStockCount,
    lowStockProducts,
    loading,
    loadData,
    handleExportCsv,
  } = useInventoryData();

  // মোডাল ও ফর্ম স্টেট
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<ProductItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // নতুন পণ্য ফর্ম স্টেট
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

  // CSV ইমপোর্ট ফাইল স্টেট
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importStatus, setImportStatus] = useState<string>("");

  // ইউজার ও রোল পারমিশন স্টেট
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setUser(AuthService.getCurrentUser());
  }, []);

  const userRole = (user?.role || "").toLowerCase();
  const isManager = userRole === "manager";
  const canViewBuyPrice =
    !isManager && (userRole === "admin" || user?.permissions?.canViewBuyPrice === true);
  const canExportExcel = userRole === "admin" || user?.permissions?.canExportExcel !== false;
  const canEditProducts = userRole === "admin" || user?.permissions?.canEditProducts !== false;
  const canDeleteProducts = userRole === "admin" || user?.permissions?.canDeleteProducts !== false;

  // নতুন পণ্য তৈরি হ্যান্ডলার
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
        categoryName: "General",
      });
    } catch (err: any) {
      console.error("Failed to create product", err);
      setActionError(err.message || "Failed to create product");
    } finally {
      setIsSubmitting(false);
    }
  };

  // পণ্য তথ্য আপডেট হ্যান্ডলার
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

  // পণ্য মুছে ফেলা হ্যান্ডলার
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

  // CSV বাল্ক ইমপোর্ট হ্যান্ডলার
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

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <DashboardHeader
        title={txt(
          "ইনভেন্টরি ক্যাটালগ ও স্টক নিয়ন্ত্রণ",
          "Inventory Catalog & Stock Control"
        )}
      />

      <main className="p-4 sm:p-6 space-y-6 max-w-7xl">
        {/* ১. ওভারভিউ কেপিআই কার্ডস */}
        <InventoryMetricsCards
          loading={loading}
          totalProductsCount={products.length}
          totalStockUnits={totalStockCount}
          lowStockCount={lowStockProducts.length}
          activeCategoriesCount={categories.length || 3}
        />

        {/* ২. ফিল্টার ও অ্যাকশন টুলবার */}
        <InventoryFilterBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCat={selectedCat}
          setSelectedCat={setSelectedCat}
          categories={categories}
          canExportExcel={canExportExcel}
          loading={loading}
          onOpenImportModal={() => setShowImportModal(true)}
          onExportCsv={handleExportCsv}
          onOpenAddModal={() => setShowAddModal(true)}
          onRefresh={loadData}
          onPageReset={() => setCurrentPage(1)}
        />

        {/* ৩. প্রোডাক্ট টেবিল ও পেজিনেশন */}
        <div className="space-y-0">
          <InventoryTable
            products={paginatedProducts}
            loading={loading}
            canViewBuyPrice={canViewBuyPrice}
            canEditProducts={canEditProducts}
            canDeleteProducts={canDeleteProducts}
            onEditProduct={(p) => {
              setActionError(null);
              setEditingProduct(p);
            }}
            onDeleteProduct={(p) => {
              setActionError(null);
              setDeletingProduct(p);
            }}
          />
          <InventoryPagination
            currentPage={currentPage}
            pageSize={pageSize}
            totalPages={computedTotalPages}
            totalRecords={filteredProducts.length}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
          />
        </div>
      </main>

      {/* নতুন পণ্য যোগ করার মোডাল */}
      <ProductFormModal
        isOpen={showAddModal}
        mode="add"
        productData={newProduct}
        setProductData={setNewProduct}
        categories={categories}
        canViewBuyPrice={canViewBuyPrice}
        isSubmitting={isSubmitting}
        actionError={actionError}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddProduct}
      />

      {/* পণ্য বিবরণ সম্পাদনা মোডাল */}
      {editingProduct && (
        <ProductFormModal
          isOpen={Boolean(editingProduct)}
          mode="edit"
          productData={editingProduct}
          setProductData={setEditingProduct}
          categories={categories}
          canViewBuyPrice={canViewBuyPrice}
          isSubmitting={isSubmitting}
          actionError={actionError}
          onClose={() => {
            setEditingProduct(null);
            setActionError(null);
          }}
          onSubmit={handleUpdateProduct}
        />
      )}

      {/* পণ্য মুছে ফেলার নিশ্চিতকরণ মোডাল */}
      <DeleteProductModal
        isOpen={Boolean(deletingProduct)}
        product={deletingProduct}
        isSubmitting={isSubmitting}
        actionError={actionError}
        onClose={() => {
          setDeletingProduct(null);
          setActionError(null);
        }}
        onConfirmDelete={handleDeleteProduct}
      />

      {/* বাল্ক CSV ইমপোর্ট মোডাল */}
      <CsvImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
        importStatus={importStatus}
        canViewBuyPrice={canViewBuyPrice}
        onImportCsv={handleImportCsv}
      />
    </div>
  );
}
