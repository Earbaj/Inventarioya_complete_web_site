import { useState, useEffect, useMemo } from "react";
import { ProductItem, Category } from "@/types";
import { InventoryService } from "@/lib/api/client";
import { downloadCsvFile } from "@/lib/utils";

/**
 * ইনভেন্টরি ডাটা ও ফিল্টারিং কাস্টম হুক (Inventory Data Hook)
 * পণ্য ও ক্যাটাগরি ফেচিং, ক্যাটালগ সার্চ, ফিল্টারিং, পেজিনেশন ও CSV এক্সপোর্ট পরিচালনা করে।
 */
export function useInventoryData() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState("ALL");
  const [loading, setLoading] = useState(true);

  // পেজিনেশন স্টেট
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // ইনভেন্টরি ডাটা ফেচিং
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
    loadData();
  }, []);

  // সার্চ এবং ক্যাটাগরি অনুযায়ী ফিল্টার করা পণ্য তালিকা
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

  // পেজিনেশন স্লাইস
  const paginatedProducts = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return filteredProducts.slice(startIdx, startIdx + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  const computedTotalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));

  // মোট স্টক ইউনিট ও লো-স্টক আইটেম
  const totalStockCount = useMemo(
    () => products.reduce((acc, p) => acc + (p.stockQuantity || 0), 0),
    [products]
  );

  const lowStockProducts = useMemo(
    () => products.filter((p) => p.stockQuantity <= p.minStockAlert),
    [products]
  );

  // CSV এক্সপোর্ট
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
    downloadCsvFile(
      exportData,
      `Inventarioya_Products_${new Date().toISOString().split("T")[0]}`
    );
  };

  return {
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
  };
}
