"use client";

import { useState, useEffect, useMemo } from "react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { SalesService, AuthService, BranchesService, ReturnsService } from "@/lib/api/client";
import { Invoice, Branch, ReturnRecord } from "@/types";
import { formatDate, downloadCsvFile, extractPersonName } from "@/lib/utils";
import { InvoicePrintModal } from "@/components/pos/InvoicePrintModal";
import { ReturnProcessModal } from "@/components/sales/ReturnProcessModal";
import { SalesMetricsCards } from "@/components/sales/SalesMetricsCards";
import { SalesFilterBar } from "@/components/sales/SalesFilterBar";
import { SalesInvoiceTable } from "@/components/sales/SalesInvoiceTable";
import { SalesPagination } from "@/components/sales/SalesPagination";
import { ReturnsLogTable } from "@/components/sales/ReturnsLogTable";
import { SalesReportModal } from "@/components/sales/SalesReportModal";
import { useSalesFilters } from "@/hooks/useSalesFilters";
import { Receipt, RotateCcw, CheckCircle2, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

/**
 * বিক্রয় ইতিহাস ও ইনভয়েস রেকর্ড পেজ (Sales History & Records)
 * প্রতিটি ইনভয়েস ব্রাউজ, রিটার্ন প্রক্রিয়া, রিপোর্ট তৈরি এবং ফিল্টারিং সমন্বয় করে।
 */
export default function SalesHistoryPage() {
  const { txt } = useLanguage();

  // ইনভয়েস ও ব্রাঞ্চ স্টেট
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchFilter, setBranchFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // মোডাল ও সক্রিয় ইন্টারঅ্যাকশন স্টেট
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [modalMode, setModalMode] = useState<"a4" | "compact" | "thermal">("a4");
  const [showSalesReportModal, setShowSalesReportModal] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // পণ্য ফেরত (Returns) স্টেট
  const [activeTab, setActiveTab] = useState<"sales" | "returns">("sales");
  const [returnModalInvoice, setReturnModalInvoice] = useState<Invoice | null>(null);
  const [returnsList, setReturnsList] = useState<ReturnRecord[]>([]);
  const [loadingReturns, setLoadingReturns] = useState(false);
  const [returnSuccessMsg, setReturnSuccessMsg] = useState<string | null>(null);
  const [returnsSearchQuery, setReturnsSearchQuery] = useState("");

  // রিটার্ন হিস্ট্রি লোড
  const loadReturns = async () => {
    setLoadingReturns(true);
    try {
      const res = await ReturnsService.getReturns({ page: 1, limit: 50 });
      setReturnsList(res.data || []);
    } catch (err) {
      console.error("Failed to load returns history", err);
    } finally {
      setLoadingReturns(false);
    }
  };

  // রিটার্ন সার্চ ফিল্টার
  const filteredReturns = useMemo(() => {
    const q = returnsSearchQuery.toLowerCase().trim();
    if (!q) return returnsList;
    return returnsList.filter((r) => {
      const invNo = (r.invoiceNumber || "").toLowerCase();
      const cName = (r.customerName || "").toLowerCase();
      const cPhone = (r.customerPhone || "").toLowerCase();
      const method = (r.refundMethod || "").toLowerCase();
      const reason = (r.reason || "").toLowerCase();
      return (
        invNo.includes(q) ||
        cName.includes(q) ||
        cPhone.includes(q) ||
        method.includes(q) ||
        reason.includes(q)
      );
    });
  }, [returnsList, returnsSearchQuery]);

  // ড্রপডাউন মেনু বাইরে ক্লিকে বন্ধ করার হ্যান্ডলার
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!(e.target as HTMLElement).closest(".action-menu-container")) {
        setActiveMenuId(null);
      }
    }
    if (activeMenuId) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [activeMenuId]);

  // সেলস ডাটা ফেচিং
  const loadSales = async (page = 1, limit = 50, branch = branchFilter) => {
    setLoading(true);
    try {
      const isCustom = branch && branch !== "ALL" && branch !== "br_001" && branch !== "main";
      const res = await SalesService.getSales({
        page,
        limit,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        search: searchQuery.trim() || undefined,
        branchId: isCustom ? branch : undefined,
      });

      if (res && res.data) {
        setInvoices(res.data);
        if (res.meta) {
          setTotalRecords(res.meta.total);
          setTotalPages(Math.ceil(res.meta.total / pageSize) || 1);
        } else {
          setTotalRecords(res.data.length);
          setTotalPages(Math.ceil(res.data.length / pageSize) || 1);
        }
      }
    } catch (err) {
      console.error("Failed to load sales", err);
    } finally {
      setLoading(false);
    }
  };

  // প্রাথমিক লোড ও ইভেন্ট লিসেনার
  useEffect(() => {
    setUser(AuthService.getCurrentUser());
    const initialBranch =
      typeof window !== "undefined"
        ? localStorage.getItem("selected_branch_id") || "ALL"
        : "ALL";
    setBranchFilter(initialBranch);
    loadSales(1, 100, initialBranch);
    loadReturns();

    // ব্রাঞ্চ তালিকা লোড
    BranchesService.getBranches()
      .then((b) => setBranches(Array.isArray(b) ? b : []))
      .catch(() => {});

    // হেডার ব্রাঞ্চ পরিবর্তনের ইভেন্ট
    const onBranchChanged = (e: any) => {
      const newBranch = e?.detail?.branchId || "ALL";
      setBranchFilter(newBranch);
      loadSales(1, 100, newBranch);
    };
    window.addEventListener("branchChanged", onBranchChanged);
    return () => window.removeEventListener("branchChanged", onBranchChanged);
  }, []);

  const canExportExcel =
    user?.role === "admin" || user?.permissions?.canExportExcel !== false;

  // কাস্টম ফিল্টারিং হুক
  const { filteredInvoices, totalSalesRevenue, totalPaidAmount, totalDueAmount } =
    useSalesFilters({
      invoices,
      searchQuery,
      statusFilter,
      dateFilter,
      branchFilter,
      branches,
    });

  // পেজিনেশন স্লাইস
  const paginatedInvoices = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return filteredInvoices.slice(startIdx, startIdx + pageSize);
  }, [filteredInvoices, currentPage, pageSize]);

  const computedTotalPages = Math.max(1, Math.ceil(filteredInvoices.length / pageSize));

  // CSV এক্সপোর্ট
  const handleExportCsv = () => {
    const exportData = filteredInvoices.map((inv, idx) => ({
      SL: idx + 1,
      InvoiceNumber: inv.invoiceNumber || inv.invoiceNo,
      Customer: inv.customerName,
      Phone: inv.customerPhone || "N/A",
      Date: formatDate(inv.createdAt || inv.date),
      Cashier: inv.cashierName,
      Branch: inv.branchName || "Main",
      ItemsCount: inv.items?.length || 0,
      Subtotal: inv.subtotal,
      Discount: inv.discount,
      GrandTotal: inv.grandTotal,
      PaidAmount: inv.paidAmount,
      DueAmount: inv.dueAmount,
      PaymentMethod: inv.paymentMethod,
      PaymentStatus: inv.status,
    }));
    downloadCsvFile(
      exportData,
      `Inventarioya_Sales_${new Date().toISOString().split("T")[0]}`
    );
  };

  const handleOpenInvoiceModal = (inv: Invoice, mode: "a4" | "compact" | "thermal") => {
    setSelectedInvoice(inv);
    setModalMode(mode);
  };

  // শপ প্রোফাইল ও ইউজার অনুমতি
  const activeUser = AuthService.getCurrentUser() || user;
  const pdfShopName = activeUser?.shopName || activeUser?.name || "Inventarioya Store";
  const pdfShopAddress = activeUser?.address || "";
  const pdfShopPhone = activeUser?.phone || "";
  const pdfShopEmail = activeUser?.email || "";
  const pdfLogoUrl = activeUser?.logoUrl || activeUser?.avatarUrl;
  const personName = extractPersonName(activeUser, pdfShopName);
  const userRole = (activeUser?.role || "").toLowerCase();
  const canProcessReturn =
    userRole === "admin" ||
    userRole === "superadmin" ||
    activeUser?.permissions?.canProcessReturn !== false;

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <DashboardHeader
        title={txt("বিক্রয় ইতিহাস ও ইনভয়েস রেকর্ড", "Sales History & Invoicing Records")}
      />

      <main className="p-4 sm:p-6 space-y-6 max-w-7xl">
        {/* রিটার্ন সফল বার্তা ব্যানার */}
        {returnSuccessMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center justify-between gap-2 shadow-lg">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{returnSuccessMsg}</span>
            </div>
            <button
              onClick={() => setReturnSuccessMsg(null)}
              className="text-emerald-400/80 hover:text-emerald-300 p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ট্যাব সুইচার (ইনভয়েস বনাম পণ্য ফেরত) */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab("sales")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "sales"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>{txt("বিক্রয় ইনভয়েস তালিকা", "Sales Invoices")}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-400/50 text-[10px]">
              {filteredInvoices.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("returns");
              loadReturns();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "returns"
                ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30"
                : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{txt("পণ্য ফেরত হিস্ট্রি (Returns Log)", "Returns History")}</span>
            {returnsList.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-slate-950/50 text-[10px]">
                {returnsList.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === "sales" ? (
          <>
            {/* ১. সেলস কেপিআই কার্ডস */}
            <SalesMetricsCards
              loading={loading}
              totalInvoicesCount={filteredInvoices.length}
              totalSalesRevenue={totalSalesRevenue}
              totalPaidAmount={totalPaidAmount}
              totalDueAmount={totalDueAmount}
            />

            {/* ২. ফিল্টার ও অ্যাকশন বার */}
            <SalesFilterBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              branchFilter={branchFilter}
              setBranchFilter={setBranchFilter}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              dateFilter={dateFilter}
              setDateFilter={setDateFilter}
              branches={branches}
              canExportExcel={canExportExcel}
              loading={loading}
              onPrintReport={() => setShowSalesReportModal(true)}
              onExportCsv={handleExportCsv}
              onRefresh={() => loadSales(1, 100)}
              onPageReset={() => setCurrentPage(1)}
            />

            {/* ৩. ইনভয়েস টেবিল ও পেজিনেশন */}
            <div className="space-y-0">
              <SalesInvoiceTable
                invoices={paginatedInvoices}
                loading={loading}
                activeMenuId={activeMenuId}
                setActiveMenuId={setActiveMenuId}
                onOpenInvoice={handleOpenInvoiceModal}
                canProcessReturn={canProcessReturn}
                onOpenReturnModal={(inv) => setReturnModalInvoice(inv)}
              />
              <SalesPagination
                currentPage={currentPage}
                pageSize={pageSize}
                totalPages={computedTotalPages}
                totalRecords={filteredInvoices.length}
                onPageChange={setCurrentPage}
                onPageSizeChange={(sz) => {
                  setPageSize(sz);
                  setCurrentPage(1);
                }}
              />
            </div>
          </>
        ) : (
          /* পণ্য ফেরত হিস্ট্রি ট্যাব */
          <ReturnsLogTable
            returnsList={returnsList}
            filteredReturns={filteredReturns}
            loadingReturns={loadingReturns}
            returnsSearchQuery={returnsSearchQuery}
            setReturnsSearchQuery={setReturnsSearchQuery}
            onRefresh={loadReturns}
            invoices={invoices}
            onOpenInvoice={handleOpenInvoiceModal}
          />
        )}
      </main>

      {/* পণ্য ফেরত প্রসেস মোডাল */}
      {returnModalInvoice && (
        <ReturnProcessModal
          isOpen={Boolean(returnModalInvoice)}
          invoice={returnModalInvoice}
          onClose={() => setReturnModalInvoice(null)}
          onSuccess={(record) => {
            setReturnModalInvoice(null);
            const refundAmt = record?.totalRefund ?? record?.totalRefundAmount ?? 0;
            setReturnSuccessMsg(
              txt(
                `ইনভয়েস #${record?.invoiceNumber || returnModalInvoice.invoiceNumber} এর রিটার্ন সফল হয়েছে! রিফান্ড: ৳${refundAmt}`,
                `Return processed successfully for invoice #${record?.invoiceNumber || returnModalInvoice.invoiceNumber}! Refund: ৳${refundAmt}`
              )
            );
            loadSales(1, 100);
            loadReturns();
          }}
        />
      )}

      {/* মাল্টি-মোড ইনভয়েস প্রিন্ট মোডাল */}
      {selectedInvoice && (
        <InvoicePrintModal
          invoice={selectedInvoice}
          initialMode={modalMode}
          onClose={() => setSelectedInvoice(null)}
        />
      )}

      {/* এক্সিকিউটিভ সেলস সামারি রিপোর্ট মোডাল */}
      <SalesReportModal
        isOpen={showSalesReportModal}
        onClose={() => setShowSalesReportModal(false)}
        invoices={filteredInvoices}
        totalSalesRevenue={totalSalesRevenue}
        totalPaidAmount={totalPaidAmount}
        totalDueAmount={totalDueAmount}
        shopName={pdfShopName}
        shopAddress={pdfShopAddress}
        shopPhone={pdfShopPhone}
        shopEmail={pdfShopEmail}
        logoUrl={pdfLogoUrl}
        personName={personName}
      />
    </div>
  );
}
